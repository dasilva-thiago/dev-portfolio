# cv-site

Static site served at <https://cv.dasilva-thiago.dev>, deployed as its own Vercel project
(Root Directory: `cv-site`, Output Directory: `public`, no build step on deploy). It is separate from the
portfolio build on purpose: updating a resume never rebuilds the portfolio.

It uses the portfolio's visual identity: the same color tokens (light, dark and high contrast), fonts
(DM Sans, Syne, DM Mono), Font Awesome icons and flags. The theme is stored per browser, like on the portfolio.

| URL | File |
|-----|------|
| `/` | `public/index.html`: short about, links and the three resumes (pt/en/es) |
| `/pt`, `/en`, `/es` | `public/{pt,en,es}.html` (`cleanUrls`), with a sticky bar: language flags, theme and PDF download |
| `/thiago-da-silva-cv-{pt,en,es}.pdf` | PDF downloads |

The public versions carry no phone number. Every response is `noindex`.

## Updating a resume

1. Generate the JSON payload and the PDF with career-ops (`build-cv-html.mjs`, then `generate-pdf.mjs`).
2. Copy the payload to `src/data/cv-{lang}.json` and the PDF to `public/thiago-da-silva-cv-{lang}.pdf`.
3. `node tools/build.mjs` rewrites `public/index.html` and `public/{pt,en,es}.html`. Commit `public/`.

Landing page texts live at the top of `tools/build.mjs` and follow the portfolio hero copy.
