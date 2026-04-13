const API_URL = 'https://dev-portfolio-production-4d77.up.railway.app';
const form = document.querySelector('#contact-form');

function getMsg(key) {
    const fullKey = 'contact.feedback.' + key;
    if (typeof currentLang !== 'undefined' && currentLang !== 'en' && translationCache[currentLang]) {
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

function showFeedback(message, type) {
    let feedback = form.querySelector('#form-feedback');
    if (!feedback) {
        feedback = document.createElement('p');
        feedback.id = 'form-feedback';
        form.appendChild(feedback);
    }
    feedback.textContent = message;
    feedback.className = type;
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.querySelector('#name').value.trim();
    const email = document.querySelector('#email').value.trim();
    const message = document.querySelector('#message').value.trim();

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
    button.textContent = '...';
    button.disabled = true;

    try {
        const response = await fetch(`${API_URL}/send-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, message })
        });

        const data = await response.json();

        if (data.success) {
            showFeedback(getMsg('success'), 'success');
            form.reset();
        } else {
            showFeedback(getMsg('failed'), 'error');
        }
    } catch (error) {
        console.error('Error sending message:', error);
        showFeedback(getMsg('error'), 'error');
    } finally {
        button.textContent = getMsg('button') || 'Get in Touch';
        button.disabled = false;
    }
});