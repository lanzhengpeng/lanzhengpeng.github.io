let observer = null;

function revealVisibleSections() {
    document.querySelectorAll('section').forEach((section) => {
        const rect = section.getBoundingClientRect();
        const inViewport = rect.top < window.innerHeight && rect.bottom > 0;
        if (inViewport) {
            section.classList.add('visible');
        }
    });
}

export function initReveal() {
    destroyReveal();
    observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('section').forEach(section => observer.observe(section));

    // IntersectionObserver may not fire for elements already in the viewport
    // (e.g. after a hash link scroll), so reveal them immediately on init.
    revealVisibleSections();
}

export function destroyReveal() {
    if (observer) {
        observer.disconnect();
        observer = null;
    }
}
