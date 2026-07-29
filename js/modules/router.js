const ROUTES = {
    '/': { module: () => import('./home.js') },
    '/works/': {},
    '/works/webrtc-live/': {},
    '/works/webrtc-live/broadcaster.html': { module: () => import('/works/webrtc-live/js/broadcaster.js') },
    '/works/webrtc-live/viewer.html': { module: () => import('/works/webrtc-live/js/viewer.js') },
};

function normalizePath(input) {
    let pathname;
    try {
        pathname = new URL(input, location.href).pathname;
    } catch {
        pathname = input;
    }
    if (pathname === '/index.html') return '/';
    if (pathname === '/works' || pathname === '/works/index.html') return '/works/';
    if (pathname === '/works/webrtc-live' || pathname === '/works/webrtc-live/index.html') return '/works/webrtc-live/';
    if (pathname === '/works/webrtc-live/broadcaster.html') return '/works/webrtc-live/broadcaster.html';
    if (pathname === '/works/webrtc-live/viewer.html') return '/works/webrtc-live/viewer.html';
    return pathname;
}

function getMeta(head, name, attr = 'name') {
    const el = head.querySelector(`meta[${attr}="${name}"]`);
    return el ? el.content : '';
}

function setMeta(name, content, attr = 'name') {
    let el = document.querySelector(`meta[${attr}="${name}"]`);
    if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, name);
        document.head.appendChild(el);
    }
    if (content) {
        el.content = content;
    }
}

let currentModule = null;
let currentPath = null;
let isLoading = false;

function loadStylesheets(links) {
    const loaders = links.map((href) => new Promise((resolve) => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        link.onload = () => resolve(link);
        link.onerror = () => resolve(link);
        document.head.appendChild(link);
    }));

    // Guard against a hung stylesheet; show content after a short timeout.
    const timeout = new Promise((resolve) => setTimeout(resolve, 2500));
    return Promise.all([Promise.all(loaders), timeout]).then(([loaded]) => loaded);
}

async function loadRoute(path, push = true) {
    const normalized = normalizePath(path);
    if (normalized === currentPath && push) return;

    const route = ROUTES[normalized];
    if (!route) {
        location.assign(path);
        return;
    }

    let fullUrl;
    try {
        fullUrl = new URL(path, location.href).href;
    } catch {
        fullUrl = path;
    }

    isLoading = true;
    let doc;
    try {
        const res = await fetch(fullUrl);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const html = await res.text();
        doc = new DOMParser().parseFromString(html, 'text/html');
    } catch (err) {
        console.error('Router fetch failed:', err);
        location.assign(path);
        return;
    }

    const nextApp = doc.getElementById('app');
    if (!nextApp) {
        location.assign(path);
        return;
    }

    // Prepare next styles before swapping anything so the new view renders
    // with its styles already in place, avoiding a flash of unstyled content.
    const nextStyleLinks = [...doc.querySelectorAll('link[rel="stylesheet"][data-page-style]')]
        .map((link) => {
            const href = link.getAttribute('href');
            if (!href) return null;
            const base = new URL(normalized, location.href).href;
            return new URL(href, base).href;
        })
        .filter(Boolean);

    const loadedLinks = await loadStylesheets(nextStyleLinks);

    // Clean up previous view
    if (currentModule && typeof currentModule.destroy === 'function') {
        try { currentModule.destroy(); } catch (e) { console.error(e); }
    }
    currentModule = null;

    // Swap stylesheets: new styles are already loaded, so remove old page styles
    // and mark the new ones as page styles for the next navigation.
    document.querySelectorAll('link[data-page-style]').forEach((link) => link.remove());
    loadedLinks.forEach((link) => { link.dataset.pageStyle = ''; });

    // Update metadata
    const title = doc.title;
    if (title) document.title = title;
    setMeta('description', getMeta(doc.head, 'description'));
    setMeta('keywords', getMeta(doc.head, 'keywords'));
    setMeta('og:title', getMeta(doc.head, 'og:title', 'property'), 'property');
    setMeta('og:description', getMeta(doc.head, 'og:description', 'property'), 'property');
    setMeta('og:url', getMeta(doc.head, 'og:url', 'property'), 'property');

    // Swap content
    const app = document.getElementById('app');
    if (app) app.innerHTML = nextApp.innerHTML;

    document.body.dataset.route = normalized;
    currentPath = normalized;

    if (push) {
        history.pushState({ path: normalized }, '', fullUrl);
    }

    // Initialize new view
    if (route.module) {
        try {
            const mod = await route.module();
            currentModule = mod;
            if (typeof mod.init === 'function') {
                await mod.init();
            }
        } catch (e) {
            console.error('View module failed:', e);
        }
    }

    const url = new URL(path, location.href);
    if (url.hash) {
        const target = document.querySelector(url.hash);
        if (target) target.scrollIntoView();
    } else {
        window.scrollTo({ top: 0, behavior: 'auto' });
    }
    isLoading = false;
}

function onClick(e) {
    const link = e.composedPath ? e.composedPath().find(el => el instanceof HTMLAnchorElement) : e.target.closest('a');
    if (!link) return;

    if (link.target === '_blank' || link.download || link.dataset.noSpa !== undefined) return;
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

    let url;
    try {
        url = new URL(link.href, location.href);
    } catch {
        return;
    }

    if (url.origin !== location.origin) return;
    if (url.pathname === location.pathname && url.hash) return;

    const normalized = normalizePath(url.pathname);
    if (!ROUTES[normalized]) return;

    e.preventDefault();
    loadRoute(url.pathname + url.search + url.hash, true);
}

function onPopState(e) {
    const path = e.state && e.state.path ? e.state.path : location.pathname;
    loadRoute(path, false);
}

export function initRouter() {
    document.body.dataset.route = normalizePath(location.pathname);

    document.addEventListener('click', onClick);
    window.addEventListener('popstate', onPopState);

    currentPath = normalizePath(location.pathname);
    const route = ROUTES[currentPath];
    if (route && route.module) {
        route.module().then(mod => {
            currentModule = mod;
            if (typeof mod.init === 'function') {
                mod.init();
            }
        }).catch(e => console.error(e));
    }
}
