const form = document.querySelector('#contact-form');

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.querySelector('#name').value.trim();
    const email = document.querySelector('#email').value.trim();
    const message = document.querySelector('#message').value.trim();

    if (!name || !email || !message) {
    alert('Please fill in all fields before sending.');
    return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Please enter a valid email address.');
        return;
    }

    const button = form.querySelector('button');
    button.textContent = 'Sending...';
    button.disabled = true;

    try {
        const response = await fetch('https://dev-portfolio-production-4d77.up.railway.app/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, message })
        });

        const data = await response.json();

        if (data.success) {
            alert('Got it! I\'ll reply as soon as possible.');
            form.reset();
        } else {
            alert('Failed to send message. Please try again later.');
        }
    } catch (error) {
        console.error('Error sending message:', error);
        alert('An error occurred while sending your message. Please try again later.');
    } finally {
        button.textContent = 'Get in Touch';
        button.disabled = false;
    }
});