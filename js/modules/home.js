import { initLanguage, destroyLanguage } from './language.js';
import { initReveal, destroyReveal } from './reveal.js';
import { initGame, destroyGame } from './game.js';
import { initAvatar, destroyAvatar } from './avatar.js';
import { initStats, destroyStats } from './stats.js';

export function init() {
    initLanguage();
    initReveal();
    initGame();
    initAvatar();
    initStats();
}

export function destroy() {
    destroyStats();
    destroyAvatar();
    destroyGame();
    destroyReveal();
    destroyLanguage();
}
