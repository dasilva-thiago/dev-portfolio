import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { buildCsp, injectCsp, inlineScripts, sha256 } from "./csp";

const page = `<!DOCTYPE html><html><head><meta charSet="utf-8"/><meta name="viewport" content="x"/>
<script>var a = 1;</script>
<script src="/x.js"></script>
<script type="module">import("/entry.js")</script>
<script type="application/ld+json">{"@type":"Person"}</script>
<script></script>
</head><body></body></html>`;

describe("inlineScripts", () => {
  it("returns executable inline scripts only", () => {
    expect(inlineScripts(page)).toEqual(["var a = 1;", 'import("/entry.js")']);
  });
});

describe("sha256", () => {
  it("matches the CSP source-expression format", () => {
    const expected = createHash("sha256").update("var a = 1;", "utf8").digest("base64");
    expect(sha256("var a = 1;")).toBe(`'sha256-${expected}'`);
  });
});

describe("buildCsp", () => {
  const csp = buildCsp(["'sha256-abc'"]);

  it("denies by default and never allows unsafe script execution", () => {
    expect(csp).toContain("default-src 'none'");
    expect(csp).not.toMatch(/script-src[^;]*'unsafe-(inline|eval)'/);
    expect(csp).toContain("'sha256-abc'");
  });

  it("allows every source Google documents for GA4 (img and connect)", () => {
    const directive = (name: string) => csp.split("; ").find((part) => part.startsWith(`${name} `)) ?? "";
    for (const source of ["https://www.googletagmanager.com", "https://*.google-analytics.com"]) {
      expect(directive("img-src")).toContain(source);
    }
    for (const source of ["https://www.googletagmanager.com", "https://*.google-analytics.com", "https://*.google.com"]) {
      expect(directive("connect-src")).toContain(source);
    }
    expect(directive("script-src")).toContain("https://www.googletagmanager.com");
  });

  it("limits the third-party origins to analytics and the contact provider", () => {
    expect(csp).toContain("https://api.web3forms.com");
    expect(csp).toContain("https://www.googletagmanager.com");
    expect(csp).not.toMatch(/jsdelivr|cdnjs|gstatic|googleapis/);
    expect(csp).toContain("form-action 'none'");
    expect(csp).toContain("frame-src 'none'");
  });
});

describe("injectCsp", () => {
  const out = injectCsp(page);

  it("places the policy right after the charset declaration", () => {
    expect(out.indexOf('<meta charSet="utf-8"/>')).toBeLessThan(out.indexOf("Content-Security-Policy"));
    expect(out.indexOf("Content-Security-Policy")).toBeLessThan(out.indexOf('name="viewport"'));
    expect(out.indexOf("Content-Security-Policy")).toBeLessThan(out.indexOf("<script"));
  });

  it("hashes every inline script and nothing else", () => {
    expect(out).toContain(sha256("var a = 1;"));
    expect(out).toContain(sha256('import("/entry.js")'));
    expect(out).not.toContain(sha256('{"@type":"Person"}'));
  });

  it("keeps the charset inside the first 1024 bytes", () => {
    expect(Buffer.byteLength(out.slice(0, out.indexOf('<meta charSet="utf-8"/>') + 30))).toBeLessThan(1024);
  });
});
