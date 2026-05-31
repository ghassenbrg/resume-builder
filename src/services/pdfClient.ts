/**
 * Client for the optional PDF backend (`server/index.mjs`).
 *
 * The backend takes the generated `.tex`, compiles it with a local LaTeX engine
 * (pdflatex / xelatex / tectonic) against `server/resume.cls`, and returns a PDF.
 * If the backend is not running, a friendly error is thrown.
 */

const API_BASE = (import.meta.env.VITE_PDF_API as string | undefined) ?? 'http://localhost:3001'

export class PdfBackendError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'PdfBackendError'
  }
}

/** Whether the PDF backend is reachable AND has a working LaTeX engine. */
export async function checkPdfBackend(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/health`, { method: 'GET' })
    if (!res.ok) return false
    const data = (await res.json()) as { ok?: boolean; compiler?: string | null }
    return Boolean(data.ok && data.compiler)
  } catch {
    return false
  }
}

/** Compile a `.tex` string to a PDF Blob via the backend. */
export async function compilePdf(tex: string): Promise<Blob> {
  let res: Response
  try {
    res = await fetch(`${API_BASE}/api/compile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tex }),
    })
  } catch {
    throw new PdfBackendError(
      `Could not reach the PDF backend at ${API_BASE}. Start it with "npm run server" ` +
        '(requires a local LaTeX installation: pdflatex, xelatex, or tectonic).',
    )
  }

  if (!res.ok) {
    let detail = ''
    try {
      const data = await res.json()
      detail = (data && (data.error || data.message)) || ''
    } catch {
      detail = await res.text().catch(() => '')
    }
    throw new PdfBackendError(detail || `PDF compilation failed (HTTP ${res.status}).`)
  }

  return res.blob()
}
