# LaTeX Resume Builder

A simple, local Vue 3 + TypeScript tool to edit your CV in a friendly UI and
generate a `.tex` file (and optionally a `.pdf`) using the same LaTeX template
structure as [`docs/resume.tex`](docs/resume.tex) / `resume.cls`.

- ✏️ Edit every CV section in forms (contact, summary, education, skills,
  experience with nested roles, projects, certifications, languages).
- 📥 Import CV data from a JSON file (drag & drop or file picker) — the UI
  auto-fills.
- 📤 Export the current data back to JSON, or download a sample template.
- 📄 Generate and download a clean `.tex` that preserves the original LaTeX
  commands and section structure.
- 🖨️ Optionally compile to PDF via a tiny local backend (`pdflatex` /
  `xelatex` / `tectonic`).

## Quick start

```bash
npm install
npm run dev          # open http://localhost:5173
```

The app loads pre-filled with the sample CV (transcribed from `docs/resume.tex`).
Edit anything, then use the **Output** panel to generate and download `.tex`.

### Build / type-check

```bash
npm run type-check   # vue-tsc, no emit
npm run build        # type-check + production build to dist/
```

## Optional: PDF generation (backend)

PDF compilation runs through a zero-dependency Node backend that shells out to a
local LaTeX engine. It requires a LaTeX distribution installed on your machine:

- **macOS:** [MacTeX](https://www.tug.org/mactex/) or the smaller BasicTeX
  (`brew install --cask basictex`), or [Tectonic](https://tectonic-typesetting.github.io/) (`brew install tectonic`).
- **Linux:** `sudo apt install texlive-latex-recommended` (or `tectonic`).
- **Windows:** [MiKTeX](https://miktex.org/) or TeX Live.

Then run the backend alongside the dev server:

```bash
npm run server       # http://localhost:3001  (uses server/resume.cls)
```

In the app, click **Generate PDF**. The frontend POSTs the generated `.tex` to
`POST http://localhost:3001/api/compile`, which compiles it against
[`server/resume.cls`](server/resume.cls) and streams back the PDF.

If no LaTeX engine is found, the endpoint returns a clear error and the app
tells you what to install. `.tex` export always works without the backend.

> The PDF backend URL can be overridden with `VITE_PDF_API` (e.g.
> `VITE_PDF_API=http://localhost:4000`).

## How it works

The tool is **not** blind text replacement. It uses a typed data model and a
LaTeX generation service:

- [`src/types/cv.ts`](src/types/cv.ts) — the `CvData` model.
- [`src/services/latexGenerator.ts`](src/services/latexGenerator.ts) —
  `generateLatex(cv)` and `escapeLatex(value)`.
- [`src/services/jsonParser.ts`](src/services/jsonParser.ts) —
  `parseJsonToCvData(json)` (validate + normalize) and `cleanCvData(cv)`.
- [`src/stores/cvStore.ts`](src/stores/cvStore.ts) — Pinia store; the single
  source of truth the components bind to.

### Text is stored plain, escaped at generation

Values are stored as **plain text** (e.g. `Jenkins & Docker`, `50%`). The
generator escapes LaTeX specials (`& % $ # _ { } ~ ^ \`) at generation time, so
you never type backslashes. Empty bullets / skills / list items are dropped
automatically so the output is always valid LaTeX.

## JSON format

Use **Export JSON** / **Download sample JSON** in the app to get a file matching
the exact structure. A ready-made sample lives at
[`docs/sample-cv.json`](docs/sample-cv.json). Shape:

```jsonc
{
  "contact": { "fullname": "", "address": "", "email": "", "phone": "", "linkedin": "" },
  "summary": "",
  "education": [{ "university": "", "graduation": "", "program": "" }],
  "skills": [{ "category": "", "skills": ["", ""] }],
  "experience": [
    {
      "company": "", "location": "", "position": "", "duration": "",
      "bullets": ["", ""],
      "positions": []
    },
    {
      "company": "", "location": "", "duration": "",
      "positions": [
        { "position": "", "duration": "", "bullets": ["", ""] }
      ]
    }
  ],
  "projects": [{ "title": "", "duration": "", "keyHighlight": "", "bullets": ["", ""] }],
  "certifications": [{ "category": "", "skills": [""] }],
  "languages": [{ "language": "", "level": "" }]
}
```

An experience entry is rendered as a **single role** when `positions` is empty
(uses `position` + `bullets`); when `positions` has entries it becomes a
**multi-role** company block (`\positionItem` per role).

## Project structure

```txt
src/
  components/        Vue SFCs (one per CV section + JSON IO + preview + output)
  services/          latexGenerator, jsonParser, fileDownloader, pdfClient
  stores/            cvStore (Pinia)
  types/             cv.ts (CvData model)
  utils/             listFields (comma / line helpers)
  data/              sampleCv (default data)
  assets/            resume.tex (reference template, imported ?raw)
  styles/            main.css (global design system)
server/
  index.mjs          optional PDF backend (no npm deps)
  resume.cls         LaTeX class implementing the template commands
docs/
  resume.tex         original reference template
  sample-cv.json     sample import file
```

## Validation

- Contact full name and email are required (email format checked).
- At least one education entry and one experience entry are expected.
- These show as non-blocking warnings in the **Output** panel — you can still
  generate, but the warnings flag missing required content.
