const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();
const { Resend } = require('resend');

const app = express();
const port = process.env.PORT || 3000;
const resend = new Resend(process.env.RESEND_API_KEY);

// Rate limiter - max 5 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: { success: false, message: 'Too many requests. Please try again after 15 minutes.' }
});

app.use(cors({
  origin: ['https://www.dasilva-thiago.dev', 'https://dasilva-thiago.dev']
}));
app.use(limiter);
app.use(express.json());

// Simple sanitization function to prevent basic XSS attacks
function sanitize(str, maxLength = 500) { 
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')  
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .substring(0, maxLength);
}

app.post('/send-email', limiter, async (req, res) => {
    const name    = sanitize(req.body.name, 100);
    const email   = sanitize(req.body.email, 100);
    const message = sanitize(req.body.message, 2000);

   if (!name || !email || !message) {
        return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ success: false, message: 'Invalid email address.' });
    }

    try {
        const { error } = await resend.emails.send({
            from: 'Portfolio <onboarding@resend.dev>',
            to: process.env.EMAIL_TO,
            subject: `New message from ${name}`,
            text: `Name: ${name}\nEmail: ${email}\nMessage:\n${message}`
        });

        if (error) throw error;

        res.status(200).json({ success: true, message: 'Email sent successfully!' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ success: false, message: 'Error sending email.' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});