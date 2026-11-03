// Minimal static host that mirrors the Vercel behavior this site relies on (to be re-verified on a Preview deployment):
//  - /path serves path/index.html; a trailing slash redirects to the clean URL (trailingSlash: false)
//  - unknown URLs return the real 404.html with status 404 (no SPA fallback)
import { createServer } from 'node:http';
import { brotliCompressSync, constants, gzipSync } from 'node:zlib';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { extname, join, normalize, resolve } from 'node:path';

const root = resolve(process.argv[2] ?? 'build/client');
const port = Number(process.argv[3] ?? 4173);

// Compressed bodies are cached: compressing on every request blocks the event loop under parallel test workers.
const compressed = new Map();
function compress(file, body, encoding) {
    const key = `${encoding}:${file}`;
    if (!compressed.has(key)) {
        compressed.set(key, encoding === 'br'
            ? brotliCompressSync(body, { params: { [constants.BROTLI_PARAM_QUALITY]: 5 } })
            : gzipSync(body));
    }
    return compressed.get(key);
}

const types = {
    '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
    '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.ico': 'image/x-icon',
    '.woff': 'font/woff', '.woff2': 'font/woff2', '.txt': 'text/plain', '.xml': 'application/xml', '.data': 'text/x-script',
};

function locate(urlPath) {
    const clean = normalize(decodeURIComponent(urlPath)).replace(/^([/\\])+/, '');
    const direct = join(root, clean);
    if (!direct.startsWith(root)) return null;
    if (existsSync(direct) && statSync(direct).isFile()) return direct;
    const index = join(direct, 'index.html');
    if (existsSync(index)) return index;
    return null;
}

createServer((req, res) => {
    const { pathname, search } = new URL(req.url ?? '/', 'http://localhost');
    if (pathname.length > 1 && pathname.endsWith('/')) {
        res.writeHead(308, { location: pathname.replace(/\/+$/, '') + search });
        res.end();
        return;
    }
    const file = locate(pathname);
    if (!file) {
        const notFound = join(root, '404.html');
        if (existsSync(notFound)) {
            res.writeHead(404, { 'content-type': types['.html'] });
            res.end(readFileSync(notFound));
        } else {
            res.writeHead(404, { 'content-type': 'text/plain' });
            res.end('Not Found');
        }
        return;
    }
    const type = types[extname(file)] ?? 'application/octet-stream';
    const body = readFileSync(file);
    const accepts = String(req.headers['accept-encoding'] ?? '');
    const compressible = /^text\/|^application\/(json|xml)|svg|javascript/.test(type);
    if (compressible && /\bbr\b/.test(accepts)) {
        res.writeHead(200, { 'content-type': type, 'content-encoding': 'br', vary: 'accept-encoding' });
        res.end(compress(file, body, 'br'));
    } else if (compressible && /\bgzip\b/.test(accepts)) {
        res.writeHead(200, { 'content-type': type, 'content-encoding': 'gzip', vary: 'accept-encoding' });
        res.end(compress(file, body, 'gzip'));
    } else {
        res.writeHead(200, { 'content-type': type });
        res.end(body);
    }
}).listen(port, () => console.log(`serving ${root} on http://localhost:${port}`));
