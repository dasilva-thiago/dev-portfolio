import { createHash } from "node:crypto";

const SCRIPT = /<script(?![^>]*\bsrc=)([^>]*)>([\s\S]*?)<\/script>/g;

// Executable inline scripts only: JSON data blocks (ld+json) are not subject to script-src.
export function inlineScripts(html: string): string[] {
  const found: string[] = [];
  for (const match of html.matchAll(SCRIPT)) {
    const attributes = match[1] ?? "";
    const body = match[2] ?? "";
    if (/type=["']?application\/(ld\+)?json/i.test(attributes)) continue;
    if (body.trim() !== "") found.push(body);
  }
  return found;
}

export const sha256 = (value: string): string =>
  `'sha256-${createHash("sha256").update(value, "utf8").digest("base64")}'`;

export function buildCsp(scriptHashes: string[]): string {
  return [
    "default-src 'none'",
    `script-src 'self' ${scriptHashes.join(" ")} https://www.googletagmanager.com`,
    "style-src 'self' 'unsafe-inline'",
    "font-src 'self'",
    // Analytics sources follow Google's tag CSP guide (GA without Ads features).
    "img-src 'self' data: https://www.googletagmanager.com https://*.google-analytics.com",
    "connect-src 'self' https://api.web3forms.com https://www.googletagmanager.com https://*.google-analytics.com https://*.analytics.google.com https://*.google.com",
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'none'",
  ].join("; ");
}

// The policy is delivered as a <meta> tag right after the charset declaration (which must stay within the first
// 1024 bytes), so it governs every script and resource that follows.
export function injectCsp(html: string): string {
  const hashes = [...new Set(inlineScripts(html).map(sha256))];
  const meta = `<meta http-equiv="Content-Security-Policy" content="${buildCsp(hashes)}"/>`;
  const charset = /<meta charSet="utf-8"\/?>/i.exec(html);
  if (charset) {
    const end = charset.index + charset[0].length;
    return html.slice(0, end) + meta + html.slice(end);
  }
  if (!html.includes("<head>")) throw new Error("Cannot inject CSP: no <head> element");
  return html.replace("<head>", `<head>${meta}`);
}
