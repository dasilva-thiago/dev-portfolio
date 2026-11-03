import { existsSync, readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

const here = dirname(fileURLToPath(import.meta.url));
const a = resolve(here, process.env.BASELINE_DIR ?? 'shots');
const b = resolve(here, process.env.CURRENT_DIR ?? 'shots-local');
const diffDir = resolve(here, 'shots-diff');
mkdirSync(diffDir, { recursive: true });
const only = process.argv[2];

const rows = [];
for (const file of readdirSync(a).filter(f => f.endsWith('.png') && (!only || f.includes(only)))) {
    if (!existsSync(resolve(b, file))) continue;
    const base = PNG.sync.read(readFileSync(resolve(a, file)));
    const cur = PNG.sync.read(readFileSync(resolve(b, file)));
    const w = base.width;
    if (cur.width !== w) { rows.push([file, `width ${base.width} vs ${cur.width}`]); continue; }
    const h = Math.min(base.height, cur.height);
    const crop = png => { const o = new PNG({ width: w, height: h }); PNG.bitblt(png, o, 0, 0, w, h, 0, 0); return o; };
    const A = crop(base), B = crop(cur), D = new PNG({ width: w, height: h });
    const n = pixelmatch(A.data, B.data, D.data, w, h, { threshold: 0.1 });
    writeFileSync(resolve(diffDir, file), PNG.sync.write(D));
    rows.push([file, `${(100 * n / (w * h)).toFixed(2)}% differ`, `height ${base.height} -> ${cur.height}`]);
}
for (const r of rows) console.log(r.join('  |  '));
