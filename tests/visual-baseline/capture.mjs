import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const BASE = process.env.BASE_URL ?? 'https://www.dasilva-thiago.dev';
const out = resolve(here, process.env.SHOTS_DIR ?? 'shots');
const ARTICLE = process.env.ARTICLE_PATH ?? '#projects/eduassets';
mkdirSync(out, { recursive: true });

const widths = (process.env.WIDTHS ?? '360,768,1024,1440,2560').split(',').map(Number);
const themes = {
    light: { dark: 'false', contrast: 'false' },
    dark: { dark: 'true', contrast: 'false' },
    hc: { dark: 'false', contrast: 'true' },
};
const heights = { 360: 780, 768: 1024, 1024: 768, 1440: 900, 2560: 1080 };

const browser = await chromium.launch();

async function shoot(name, { width, theme, lang, hash }) {
    const ctx = await browser.newContext({
        viewport: { width, height: heights[width] },
        reducedMotion: 'reduce',
        locale: 'en-US',
    });
    await ctx.addInitScript(([t, l]) => {
        localStorage.setItem('darkMode', t.dark);
        localStorage.setItem('highContrast', t.contrast);
        localStorage.setItem('lang', l);
    }, [themes[theme], lang]);
    const page = await ctx.newPage();
    await page.goto(BASE + (hash ?? ''), { waitUntil: 'networkidle' });
    await page.addStyleTag({
        content: '*,*::before,*::after{animation:none!important;transition:none!important}[data-aos]{opacity:1!important;transform:none!important}.typewriter-cursor{visibility:hidden}#typewriter-target{visibility:hidden}',
    });
    await page.waitForTimeout(900);
    if (!hash) {
        await page.evaluate(async () => {
            const step = Math.max(200, innerHeight / 2);
            for (let y = 0; y < document.body.scrollHeight; y += step) {
                scrollTo(0, y);
                await new Promise(r => setTimeout(r, 120));
            }
            scrollTo(0, document.body.scrollHeight);
        });
        await page.waitForTimeout(2500);
        await page.evaluate(() => scrollTo(0, 0));
        await page.waitForTimeout(500);
    }
    await page.screenshot({ path: `${out}/${name}.png`, fullPage: !hash });
    await ctx.close();
}

for (const width of widths) {
    for (const theme of (process.env.THEMES ?? 'light,dark,hc').split(',')) {
        await shoot(`home-${width}-${theme}-en`, { width, theme, lang: 'en' });
    }
}
if (!process.env.WIDTHS) await shoot('home-1440-light-pt', { width: 1440, theme: 'light', lang: 'pt' });
if (!process.env.WIDTHS) await shoot('article-1440-light-en', { width: 1440, theme: 'light', lang: 'en', hash: ARTICLE });
await browser.close();
console.log('baseline captured from', BASE);
