# cv-site

Static site served at <https://cv.dasilva-thiago.dev>, deployed as its own Vercel project
(Root Directory: `cv-site`, no build step). It is separate from the portfolio build on purpose:
updating a resume never rebuilds the portfolio.

| URL | File |
|-----|------|
| `/` | `index.html` (language picker) |
| `/pt`, `/en`, `/es` | `pt.html`, `en.html`, `es.html` (`cleanUrls`) |
| `/thiago-da-silva-cv-{pt,en,es}.pdf` | PDF downloads |

The public versions carry no phone number. Every response is `noindex`.

## Updating a resume

1. Generate the HTML and PDF with career-ops (`build-cv-html.mjs`, then `generate-pdf.mjs`).
2. Copy the PDF here as `thiago-da-silva-cv-{lang}.pdf`.
3. `node tools/publish-cv.mjs {lang} path/to/generated.html` writes `{lang}.html` with the language
   switcher, the download link and the noindex/hreflang tags.
