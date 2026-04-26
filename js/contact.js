const API_URL = 'https://api.web3forms.com/submit';
const ACCESS_KEY = '4d21fb04-9824-401d-8bad-03cf53e79abf';
const form = document.querySelector('#contact-form');

/**
 * Retrieves localized feedback messages.
 * Falls back to English if the translation is missing.
 */
function getMsg(key) {
    const fullKey = 'contact.feedback.' + key;

    if (
        typeof currentLang !== 'undefined' &&
        typeof translationCache !== 'undefined' &&
        typeof getNestedValue !== 'undefined' &&
        currentLang !== 'en' &&
        translationCache[currentLang]
    ) {
        const value = getNestedValue(translationCache[currentLang], fullKey);
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

    const button = form.querySelector('button');
    const originalBtnText = button.textContent;
    button.textContent = '...';
    button.disabled = true;

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
        } else {
            showFeedback(getMsg('failed'), 'error');
        }
    } catch (error) {
        console.error('Submission Error:', error);
        showFeedback(getMsg('error'), 'error');
    } finally {
        button.textContent = originalBtnText;
        button.disabled = false;
    }
});