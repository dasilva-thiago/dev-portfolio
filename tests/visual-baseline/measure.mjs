import { chromium } from '@playwright/test';

const targets = {
    production: process.env.PROD_URL ?? 'https://www.dasilva-thiago.dev/',
    local: process.env.LOCAL_URL ?? 'http://localhost:4173/',
};
const width = Number(process.env.WIDTH ?? 1440);
const selectors = process.argv.slice(2).length ? process.argv.slice(2) : [
    '.hero-section', '.hero-greeting', '.hero-section h1', '.hero-subtitle', '.hero-description', '.hero-social-links', '.hero-buttons',
    '#about', '#about h2', '.about-identity', '.about-right', '#skills', '#skills h2', '.skills-icon-grid', '.skills-evolving',
    '#projects', '#projects h2', '.project-card--featured', '.project-card--secondary', '.projects-grid-secondary',
    '#contact', '#contact h2', '.contact-form-wrapper', 'footer',
];

const browser = await chromium.launch();
const out = {};
for (const [name, url] of Object.entries(targets)) {
    const ctx = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
    await ctx.addInitScript(() => { localStorage.setItem('darkMode', 'false'); localStorage.setItem('highContrast', 'false'); localStorage.setItem('lang', 'en'); });
    const page = await ctx.newPage();
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.addStyleTag({ content: '*,*::before,*::after{animation:none!important;transition:none!important}[data-aos]{transform:none!important;opacity:1!important}' });
    await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 400) { scrollTo(0, y); await new Promise(r => setTimeout(r, 80)); }
        scrollTo(0, 0);
    });
    await page.waitForTimeout(2500);
    out[name] = await page.evaluate(sels => Object.fromEntries(sels.map(s => {
        const el = document.querySelector(s);
        if (!el) return [s, null];
        const r = el.getBoundingClientRect();
        return [s, [Math.round(r.left), Math.round(r.top + scrollY), Math.round(r.width), Math.round(r.height)]];
    })), selectors);
    await ctx.close();
}
await browser.close();
const pad = (v) => (v ? v.join(',') : 'MISSING').padEnd(22);
console.log('selector'.padEnd(28), 'production (x,y,w,h)'.padEnd(22), 'local (x,y,w,h)'.padEnd(22), 'delta y/h');
for (const s of selectors) {
    const p = out.production[s], l = out.local[s];
    const d = p && l ? `y ${l[1] - p[1]}  h ${l[3] - p[3]}  w ${l[2] - p[2]}` : '';
    console.log(s.padEnd(28), pad(p), pad(l), d);
}
