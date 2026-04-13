# Thiago da Silva — Developer Portfolio
A modern, responsive, and accessible developer portfolio built from scratch, designed to showcase real-world projects, technical skills, and continuous professional growth.

Personal portfolio website showcasing my journey as a Computer Engineering student building a career in tech. Built from scratch with a focus on clean code, responsiveness, and multilingual support.

**Live:** [dasilva-thiago.dev](https://www.dasilva-thiago.dev)

---

## Motivation

This portfolio was designed to solve a real problem: presenting my technical skills, projects, and contact information in a clear, professional, and accessible way.
I built everything from scratch to strengthen my understanding of frontend architecture, backend integration, and user experience.

---
## UI Overview

### Desktop

<p align="center">
  <img src="assets/img/preview.png" alt="Portfolio Preview — Desktop" width="800">
  <br>
  <em>Desktop layout with optimized spacing, component alignment, and Bootstrap grid.</em>
</p>

<br>

### Mobile

<p align="center">
  <img src="assets/img/preview_mobile.png" alt="Portfolio Preview — Mobile" width="300">
  <br>
  <em>Mobile-first implementation with custom breakpoints (600px, 740px, 850px).</em>
</p>

---

## Features

- **Dark mode** — toggles with a single click, persists via `localStorage`
- **Multilingual (i18n)** — English, Portuguese, and Spanish with dynamic JSON loading and browser language auto-detection
- **Responsive design** — mobile-first layout with custom breakpoints at 600px, 740px, and 850px
- **Project carousel** — Bootstrap-powered with keyboard and touch support
- **Contact form** — connected to an Express backend with rate limiting, input sanitization, and email delivery via Resend

---

## Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| HTML5 / CSS3 | Structure and styling |
| JavaScript (vanilla) | Dark mode, i18n, form submission |
| Bootstrap 5 | Carousel, responsive grid |
| Font Awesome 7 | Icons |

### Backend (`/server`)
| Technology | Purpose |
|---|---|
| Node.js + Express 5 | REST API |
| Resend | Email delivery |
| express-rate-limit | Abuse prevention (5 req / 15 min per IP) |
| dotenv | Environment variable management |
| cors | Origin allowlist |

---

## Project Structure

dev-portfolio/
├── index.html
├── css/
│   └── styles.css
├── js/
│   ├── contact.js       # Form submission logic
│   ├── darkMode.js      # Dark mode toggle
│   └── i18n.js          # Language switching
├── locales/
│   ├── pt.json          # Portuguese
│   └── es.json          # Spanish
├── assets/
│   ├── img/             # Profile photos, project screenshots
│   └── icons/
└── server/
    ├── server.js        # Express API
    └── package.json

## Projects Featured

| Project | Stack | Description |
|---|---|---|
| [Buenos Aires Explorer](https://github.com/dasilva-thiago/BuenosAiresExp) | C#, .NET, SQLite, Windows Forms | Desktop app for organizing points of interest with route planning and coordinate lookup |
| [Developer Portfolio](https://github.com/dasilva-thiago/dev-portfolio) | HTML, CSS, JS, Bootstrap | This website |
| [Aviation Safety Project](https://github.com/dasilva-thiago/aviation_safety_project) | Python, Power BI, Pandas, NumPy, OpenPyXL | Data visualization simulating an aeronautical control room |

---

## About Me

I am a Computer Engineering student focused on backend development, databases, and building real-world applications.

After working in an industrial laboratory environment, I transitioned into tech to pursue a career aligned with problem-solving, software engineering, and continuous learning.

I am currently seeking internship opportunities where I can contribute, learn fast, and grow as a developer.

---

## Contact

- **Website:** [dasilva-thiago.dev](https://www.dasilva-thiago.dev)
- **LinkedIn:** [linkedin.com/in/thiago-da-silva-876805269](https://www.linkedin.com/in/thiago-da-silva-876805269/)
- **GitHub:** [github.com/dasilva-thiago](https://github.com/dasilva-thiago)
- **Email:** thiagosilva785@gmail.com

---

<p align="center">Made with dedication by Thiago da Silva • Pindamonhangaba, SP, Brazil</p>
