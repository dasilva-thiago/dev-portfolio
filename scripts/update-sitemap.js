import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const sitemapPath = resolve(__dirname, '../sitemap.xml');

const today = new Date().toISOString().slice(0, 10); // formato YYYY-MM-DD

const content = readFileSync(sitemapPath, 'utf-8');
const updated = content.replace(
    /<lastmod>[\d-]+<\/lastmod>/,
    `<lastmod>${today}</lastmod>`
);

writeFileSync(sitemapPath, updated, 'utf-8');
console.log(`sitemap.xml atualizado → lastmod: ${today}`);