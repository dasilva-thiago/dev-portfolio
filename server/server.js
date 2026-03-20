const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { Resend } = require('resend');

const app = express();
const port = process.env.PORT || 3000;
const resend = new Resend(process.env.RESEND_API_KEY);

app.use(cors({
  origin: ['https://www.dasilva-thiago.dev', 'https://dasilva-thiago.dev']
}));
app.use(express.json());

app.post('/send-email', async (req, res) => {
  const { name, email, message } = req.body;

  try {
    const { error } = await resend.emails.send({
      from: 'Portfolio <onboarding@resend.dev>',
      to: process.env.EMAIL_TO,
      subject: `New message from ${name}`,
      text: `Nome: ${name}\nEmail: ${email}\nMensagem:\n${message}`
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