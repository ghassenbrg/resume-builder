/**
 * Optional PDF backend for the CV generator (zero npm dependencies).
 *
 * POST /api/compile   body: { "tex": "<latex source>" }  -> application/pdf
 * GET  /health                                            -> { ok, compiler }
 *
 * It writes the received `.tex` next to `server/resume.cls`, runs a local LaTeX
 * engine (pdflatex / xelatex / tectonic — whichever is found), and streams back
 * the resulting PDF. Requires a LaTeX distribution installed on the machine
 * (e.g. MacTeX/BasicTeX, TeX Live, MiKTeX, or Tectonic).
 *
 *   node server/index.mjs        (or: npm run server)
 */
import { createServer } from 'node:http'
import { spawn, spawnSync } from 'node:child_process'
import { mkdtemp, writeFile, readFile, copyFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PORT = Number(process.env.PORT ?? 3001)
const CLASS_FILE = join(__dirname, 'resume.cls')
const MAX_BODY = 5 * 1024 * 1024 // 5 MB

/** Candidate engines, in order of preference. */
const ENGINES = [
  { cmd: 'pdflatex', args: (tex) => ['-interaction=nonstopmode', '-halt-on-error', tex] },
  { cmd: 'xelatex', args: (tex) => ['-interaction=nonstopmode', '-halt-on-error', tex] },
  { cmd: 'tectonic', args: (tex) => [tex] },
]

function detectEngine() {
  for (const engine of ENGINES) {
    const probe = spawnSync(engine.cmd, ['--version'], { stdio: 'ignore' })
    if (!probe.error && probe.status === 0) return engine
  }
  return null
}

function runEngine(engine, texName, cwd) {
  return new Promise((resolve) => {
    const child = spawn(engine.cmd, engine.args(texName), { cwd })
    let log = ''
    child.stdout.on('data', (d) => (log += d))
    child.stderr.on('data', (d) => (log += d))
    child.on('error', (err) => resolve({ ok: false, log: String(err) }))
    child.on('close', (code) => resolve({ ok: code === 0, log }))
  })
}

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload)
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Content-Length': Buffer.byteLength(body),
  })
  res.end(body)
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    let size = 0
    req.on('data', (chunk) => {
      size += chunk.length
      if (size > MAX_BODY) {
        const err = new Error('Request body too large (limit 5 MB).')
        err.code = 'BODY_TOO_LARGE'
        req.pause() // stop buffering but keep the socket open so we can respond
        reject(err)
        return
      }
      chunks.push(chunk)
    })
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')))
    req.on('error', reject)
  })
}

async function compile(tex) {
  const engine = detectEngine()
  if (!engine) {
    const err = new Error(
      'No LaTeX engine found. Install pdflatex/xelatex (TeX Live, MacTeX, MiKTeX) or tectonic, then restart the server.',
    )
    err.code = 'NO_ENGINE'
    throw err
  }

  const work = await mkdtemp(join(tmpdir(), 'cv-build-'))
  try {
    const texName = 'resume.tex'
    await writeFile(join(work, texName), tex, 'utf-8')
    await copyFile(CLASS_FILE, join(work, 'resume.cls'))

    // Two passes so section rules / references settle (skipped for tectonic).
    const passes = engine.cmd === 'tectonic' ? 1 : 2
    let last = { ok: false, log: '' }
    for (let i = 0; i < passes; i++) {
      last = await runEngine(engine, texName, work)
      if (!last.ok) break
    }

    let pdf
    try {
      pdf = await readFile(join(work, 'resume.pdf'))
    } catch {
      pdf = null
    }
    if (!pdf) {
      const err = new Error('LaTeX compilation failed.')
      err.code = 'COMPILE_FAILED'
      err.log = last.log.slice(-4000)
      throw err
    }
    return pdf
  } finally {
    await rm(work, { recursive: true, force: true })
  }
}

const server = createServer(async (req, res) => {
  // CORS preflight.
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    })
    res.end()
    return
  }

  if (req.method === 'GET' && req.url === '/health') {
    const engine = detectEngine()
    sendJson(res, 200, { ok: true, compiler: engine ? engine.cmd : null })
    return
  }

  if (req.method === 'POST' && req.url === '/api/compile') {
    try {
      const raw = await readBody(req)
      const { tex } = JSON.parse(raw || '{}')
      if (typeof tex !== 'string' || !tex.trim()) {
        sendJson(res, 400, { error: 'Missing "tex" string in request body.' })
        return
      }
      const pdf = await compile(tex)
      res.writeHead(200, {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="resume.pdf"',
        'Access-Control-Allow-Origin': '*',
        'Content-Length': pdf.length,
      })
      res.end(pdf)
    } catch (err) {
      const status =
        err.code === 'NO_ENGINE'
          ? 501
          : err.code === 'COMPILE_FAILED'
            ? 422
            : err.code === 'BODY_TOO_LARGE'
              ? 413
              : 400
      sendJson(res, status, { error: err.message, log: err.log })
    }
    return
  }

  sendJson(res, 404, { error: 'Not found' })
})

server.listen(PORT, () => {
  const engine = detectEngine()
  console.log(`CV PDF backend listening on http://localhost:${PORT}`)
  console.log(engine ? `LaTeX engine: ${engine.cmd}` : 'WARNING: no LaTeX engine found — PDF compile will return 501.')
})
