let phrases = [];
let phraseIndex = 0;
let charIndex = 0;
let isDeleting = false;
let typeTimeout;

export function setPhrases(newPhrases) {
    phrases = newPhrases;
}

export function resetTypewriter() {
    phraseIndex = 0;
    charIndex = 0;
    isDeleting = false;
    clearTimeout(typeTimeout);
    const el = document.getElementById('typewriter');
    if (el) el.textContent = '';
}

export function type() {
    if (!phrases.length) return;
    const el = document.getElementById('typewriter');
    if (!el) return;

    const current = phrases[phraseIndex];
    if (isDeleting) {
        el.textContent = current.substring(0, charIndex - 1);
        charIndex--;
    } else {
        el.textContent = current.substring(0, charIndex + 1);
        charIndex++;
    }

    let speed = isDeleting ? 30 : 80;
    if (!isDeleting && charIndex === current.length) {
        speed = 2500;
        isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        speed = 500;
    }
    typeTimeout = setTimeout(type, speed);
}
