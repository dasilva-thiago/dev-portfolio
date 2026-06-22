import { getCurrentLang, translationCache } from './i18n.js';

const target = document.getElementById('typewriter-target');

const PHRASES_EN = [
    'a full stack developer',
    'an IT support technician',
    'a computer engineering student',
];

const TYPE_SPEED   = 75;
const DELETE_SPEED = 40;
const PAUSE_AFTER  = 1800;
const PAUSE_BEFORE = 300;

let phraseIndex = 0;
let charIndex   = 0;
let isDeleting  = false;

function getPhrases() {
    const lang = getCurrentLang();
    const phrases = translationCache[lang]?.hero?.typewriter;
    return Array.isArray(phrases) && phrases.length ? phrases : PHRASES_EN;
}

function tick() {
    const phrases = getPhrases();
    const current = phrases[phraseIndex % phrases.length];

    if (isDeleting) {
        charIndex--;
        target.textContent = current.slice(0, charIndex);

        if (charIndex === 0) {
            isDeleting = false;
            phraseIndex = (phraseIndex + 1) % phrases.length;
            setTimeout(tick, PAUSE_BEFORE);
            return;
        }
        setTimeout(tick, DELETE_SPEED);
    } else {
        charIndex++;
        target.textContent = current.slice(0, charIndex);

        if (charIndex === current.length) {
            isDeleting = true;
            setTimeout(tick, PAUSE_AFTER);
            return;
        }
        setTimeout(tick, TYPE_SPEED);
    }
}

setTimeout(tick, 600);