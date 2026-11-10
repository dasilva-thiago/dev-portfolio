// Regenerates the social share images (1200x630 JPEG, served from static/og) and the screenshot used by the
// "Developer Portfolio" project card. Run against a built site that is being served:
//   npm run build && npm run preview   (in one terminal)
//   npm run og:images                  (in another; or pass a base URL as the first argument)
import { chromium } from '@playwright/test';
import { readFileSync, writeFileSync } from 'node:fs';

const BASE = process.argv[2] ?? 'http://localhost:4173';
const WIDTH = 1200;
const HEIGHT = 630;
const IMG = 'src/shared/assets/img/';

// Project screenshots/banners letterboxed on a background that matches each image.
const PROJECTS = {
    eduassets: { file: 'eduAssets_banner.webp', fit: 'cover', background: '#05070d' },
    'buenos-aires-explorer': { file: 'BAexp_screenshot.webp', fit: 'contain', background: '#0d1420' },
    'aviation-safety': { file: 'Aviation_Safety_Project_screenshot.webp', fit: 'contain', background: '#ffffff' },
    'parkschool-alpr': { file: 'parkschool-alpr.webp', fit: 'cover', background: '#16130d' },
};

const browser = await chromium.launch();

async function screenshotSite(path, { dark, width, height }) {
    const context = await browser.newContext({ viewport: { width, height }, locale: 'en-US', reducedMotion: 'reduce' });
    await context.addInitScript((isDark) => {
        localStorage.setItem('darkMode', String(isDark));
        localStorage.setItem('highContrast', 'false');
        localStorage.setItem('lang', 'en');
    }, dark);
    const page = await context.newPage();
    await page.goto(BASE + path, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    const jpeg = await page.screenshot({ type: 'jpeg', quality: 86 });
    const png = await page.screenshot({ type: 'png' });
    await context.close();
    return { jpeg, png };
}

async function toWebp(png, width, height) {
    const page = await browser.newPage();
    const data = await page.evaluate(
        async ({ src, width, height }) => {
            const image = new Image();
            image.src = src;
            await image.decode();
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            canvas.getContext('2d').drawImage(image, 0, 0, width, height);
            return canvas.toDataURL('image/webp', 0.85).split(',')[1];
        },
        { src: `data:image/png;base64,${png.toString('base64')}`, width, height },
    );
    await page.close();
    return Buffer.from(data, 'base64');
}

async function composeCard({ file, fit, background }) {
    const page = await browser.newPage({ viewport: { width: WIDTH, height: HEIGHT } });
    const src = `data:image/webp;base64,${readFileSync(IMG + file).toString('base64')}`;
    await page.setContent(
        `<body style="margin:0;width:${WIDTH}px;height:${HEIGHT}px;display:flex;align-items:center;justify-content:center;background:${background}">` +
            `<img src="${src}" style="width:100%;height:100%;object-fit:${fit}"></body>`,
    );
    await page.evaluate(() => document.images[0].decode());
    const jpeg = await page.screenshot({ type: 'jpeg', quality: 86 });
    await page.close();
    return jpeg;
}

const home = await screenshotSite('/', { dark: false, width: WIDTH, height: HEIGHT });
writeFileSync('static/og/portfolio.jpg', home.jpeg);

const darkHome = await screenshotSite('/', { dark: true, width: WIDTH, height: HEIGHT });
writeFileSync('static/og/dev-portfolio.jpg', darkHome.jpeg);

const card = await screenshotSite('/', { dark: true, width: 1280, height: 640 });
writeFileSync(IMG + 'portfolio-preview.webp', await toWebp(card.png, 1280, 640));

for (const [slug, config] of Object.entries(PROJECTS)) {
    writeFileSync(`static/og/${slug}.jpg`, await composeCard(config));
}

await browser.close();
console.log('share images written to static/og and', IMG + 'portfolio-preview.webp');
