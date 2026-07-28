let observer = null;

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
}

export function destroyReveal() {
    if (observer) {
        observer.disconnect();
        observer = null;
    }
}
