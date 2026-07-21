import { getCurrentLang, translationCache, getNestedValue } from '../core/i18n.js';

const API_URL = 'https://api.web3forms.com/submit';
const ACCESS_KEY = '4d21fb04-9824-401d-8bad-03cf53e79abf';
const form = document.querySelector('#contact-form');

// Character counter for message field
const messageField = document.querySelector('#message');
const charCounter = document.createElement('span');
charCounter.className = 'char-counter';
charCounter.textContent = '0 / 2000';
messageField.insertAdjacentElement('afterend', charCounter);

messageField.addEventListener('input', () => {
    const len = messageField.value.length;
    charCounter.textContent = `${len} / 2000`;
    charCounter.classList.toggle('char-counter--1000', len >= 1000);
    charCounter.classList.toggle('char-counter--1500', len >= 1500);
    charCounter.classList.toggle('char-counter--1800', len >= 1800);
    charCounter.classList.toggle('char-counter--2000', len >= 2000);
});

/**
 * Retrieves localized feedback messages.
 * Falls back to English if the translation is missing.
 */
function getMsg(key) {
    const fullKey = 'contact.feedback.' + key;
    const lang = getCurrentLang();

    if (lang !== 'en' && translationCache[lang]) {
        const value = getNestedValue(translationCache[lang], fullKey);
        if (value) return value;
    }

    const defaults = {
        emptyFields: 'Please fill in all fields before sending.',
        invalidEmail: 'Please enter a valid email address.',
        success: "Got it! I'll reply as soon as possible.",
        failed: 'Failed to send message. Please try again later.',
        error: 'An error occurred. Please try again later.'
    };

    return defaults[key];
}

/**
 * Displays feedback messages to the user below the form.
 */
function showFeedback(message, type) {
    let feedback = form.querySelector('#form-feedback');
    if (!feedback) {
        feedback = document.createElement('p');
        feedback.id = 'form-feedback';
        form.appendChild(feedback);
    }
    feedback.textContent = message;
    feedback.className = type; // Expects 'success' or 'error' CSS classes
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Honeypot check to prevent spam bots from submitting the form
    const honeypot = form.querySelector('input[name="_honey"]');
    if (honeypot && honeypot.value !== '') {
        showFeedback(getMsg('success'), 'success'); // silent fail to avoid tipping off bots
        form.reset();
        return;
    }

    const name = document.querySelector('#name').value.trim();
    const email = document.querySelector('#email').value.trim();
    const message = document.querySelector('#message').value.trim();

    // Basic validation
    if (!name || !email || !message) {
        showFeedback(getMsg('emptyFields'), 'error');
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showFeedback(getMsg('invalidEmail'), 'error');
        return;
    }

    const button = form.querySelector('button[type="submit"]');
    const originalBtnHTML = button.innerHTML;

    // loading state
    button.disabled = true;
    button.innerHTML = `<span class="btn-spinner" aria-hidden="true"></span> Sending...`;


    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                access_key: ACCESS_KEY,
                from_name: "Contato - Portfolio",
                subject: `Nova mensagem de ${name}`,
                name: name,
                email: email,
                message: message,
            })
        });

        const result = await response.json();

        if (result.success) {
            showFeedback(getMsg('success'), 'success');
            form.reset();
            charCounter.textContent = '0 / 2000';
            charCounter.classList.remove('char-counter--near', 'char-counter--full');
        } else {
            showFeedback(getMsg('failed'), 'error');
        }
    } catch (error) {
        console.error('Submission Error:', error);
        showFeedback(getMsg('error'), 'error');
    } finally {
        // reset button state
        button.disabled = false;
        button.innerHTML = originalBtnHTML;
    }
});