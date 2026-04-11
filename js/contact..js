const form = document.querySelector('#contact-form');

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.querySelector('#name').value;
    const email = document.querySelector('#email').value;
    const message = document.querySelector('#message').value;

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