import type {
  CvData,
  CertificationItem,
  EducationItem,
  ExperienceItem,
  LanguageItem,
  ProjectItem,
  SkillItem,
} from '@/types/cv'
import { cleanCvData } from './jsonParser'

/**
 * Map of LaTeX special characters to their escaped form.
 * A single-pass regex replace is used so escaped output (which itself contains
 * `{`, `}`, `\`) is never re-scanned and double-escaped.
 */
const LATEX_ESCAPE_MAP: Record<string, string> = {
  '\\': '\\textbackslash{}',
  '&': '\\&',
  '%': '\\%',
  $: '\\$',
  '#': '\\#',
  _: '\\_',
  '{': '\\{',
  '}': '\\}',
  '~': '\\textasciitilde{}',
  '^': '\\textasciicircum{}',
}

const LATEX_SPECIALS = /[\\&%$#_{}~^]/g

/**
 * Escape a plain-text value so it is safe to embed inside the LaTeX template.
 *
 * The data model stores *plain* text (e.g. "Jenkins & Docker", "50%"); this
 * function turns it into valid LaTeX ("Jenkins \& Docker", "50\%"). It is a
 * single-pass replace, so it never corrupts the escape sequences it inserts.
 */
export function escapeLatex(value: string | undefined | null): string {
  if (value === undefined || value === null) return ''
  return String(value).replace(LATEX_SPECIALS, (ch) => LATEX_ESCAPE_MAP[ch] ?? ch)
}

/** Render a key/value pair line for a `[...]` argument block. */
function kv(key: string, value: string): string {
  return `${key}={${escapeLatex(value)}}`
}

/** Render an `\begin{itemize} ... \end{itemize}` block, or '' if no bullets. */
function bulletList(bullets: string[]): string {
  const items = bullets.map((b) => b.trim()).filter(Boolean)
  if (items.length === 0) return ''
  const lines = items.map((b) => `\\item ${escapeLatex(b)}`).join('\n')
  return ['\\begin{itemize}', '\\itemsep -6pt {}', lines, '\\end{itemize}'].join('\n')
}

function introductionBlock(cv: CvData): string {
  const c = cv.contact
  return [
    '\\introduction[',
    `${kv('fullname', c.fullname)},`,
    `${kv('address', c.address)},`,
    `${kv('email', c.email)},`,
    `${kv('phone', c.phone)},`,
    kv('linkedin', c.linkedin),
    ']',
  ].join('\n')
}

function summaryBlock(cv: CvData): string {
  return ['\\summary{', escapeLatex(cv.summary), '}'].join('\n')
}

function educationItem(item: EducationItem): string {
  return [
    '\\educationItem[',
    `${kv('university', item.university)},`,
    `${kv('graduation', item.graduation)},`,
    kv('program', item.program),
    ']',
  ].join('\n')
}

function educationSection(items: EducationItem[]): string {
  return [
    '\\begin{educationSection}{Education}',
    ...items.map(educationItem),
    '\\end{educationSection}',
  ].join('\n')
}

/** Render a `\skillItem[...]` from a category + atomic list. */
function skillItem(category: string, skills: string[]): string {
  const joined = skills.map((s) => s.trim()).filter(Boolean).join(', ')
  return [
    '\\skillItem[',
    `${kv('category', category)},`,
    `skills={${escapeLatex(joined)}}`,
    ']',
  ].join('\n')
}

/** Join `\skillItem` blocks with the ` \\` separator the template uses. */
function joinSkillItems(blocks: string[]): string {
  return blocks.join(' \\\\\n')
}

function skillsSection(items: SkillItem[]): string {
  return [
    '\\begin{skillsSection}{Technical Skills}',
    joinSkillItems(items.map((s) => skillItem(s.category, s.skills))),
    '\\end{skillsSection}',
  ].join('\n')
}

function experienceItemHeader(item: ExperienceItem, withPosition: boolean): string {
  const lines = ['\\experienceItem[', `${kv('company', item.company)},`, `${kv('location', item.location)},`]
  if (withPosition) {
    lines.push(`${kv('position', item.position)},`)
  }
  lines.push(kv('duration', item.duration))
  lines.push(']')
  return lines.join('\n')
}

function experienceItem(item: ExperienceItem): string {
  const isMultiRole = item.positions.length > 0

  if (!isMultiRole) {
    const header = experienceItemHeader(item, true)
    const bullets = bulletList(item.bullets)
    return bullets ? `${header}\n${bullets}` : header
  }

  // Multiple roles at one company: header without position, then \positionItem blocks.
  const header = experienceItemHeader(item, false)
  const roles = item.positions
    .map((pos) => {
      const positionHeader = [
        '\\positionItem[',
        `${kv('position', pos.position)},`,
        kv('duration', pos.duration),
        ']',
      ].join('\n')
      const bullets = bulletList(pos.bullets)
      return bullets ? `${positionHeader}\n${bullets}` : positionHeader
    })
    .join('\n\n')

  return `${header}\n\n${roles}`
}

function experienceSection(items: ExperienceItem[]): string {
  return [
    '\\begin{experienceSection}{Professional Experience}',
    '',
    items.map(experienceItem).join('\n\n'),
    '',
    '\\end{experienceSection}',
  ].join('\n')
}

function projectItem(item: ProjectItem): string {
  const header = [
    '\\projectItem[',
    `${kv('title', item.title)},`,
    `${kv('duration', item.duration)},`,
    kv('keyHighlight', item.keyHighlight),
    ']',
  ].join('\n')
  const bullets = bulletList(item.bullets)
  return bullets ? `${header}\n${bullets}` : header
}

function projectsSection(items: ProjectItem[]): string {
  return [
    '\\begin{experienceSection}{Key Projects}',
    '',
    items.map(projectItem).join('\n\n'),
    '',
    '\\end{experienceSection}',
  ].join('\n')
}

function certificationsSection(items: CertificationItem[]): string {
  return [
    '\\begin{skillsSection}{Certifications}',
    joinSkillItems(items.map((c) => skillItem(c.category, c.skills))),
    '\\end{skillsSection}',
  ].join('\n')
}

function languagesSection(items: LanguageItem[]): string {
  // Languages reuse \skillItem: language -> category, level -> skills.
  return [
    '\\begin{skillsSection}{Languages}',
    joinSkillItems(items.map((l) => skillItem(l.language, [l.level]))),
    '\\end{skillsSection}',
  ].join('\n')
}

interface Section {
  comment: string
  content: string
}

/**
 * Generate a complete `.tex` document from the CV data, preserving the same
 * commands and section structure as `docs/resume.tex`.
 *
 * Input is cleaned first (trimmed, empty bullets/skills/items dropped) so empty
 * fields never produce invalid LaTeX. Sections with no content are omitted.
 */
export function generateLatex(rawCv: CvData): string {
  const cv = cleanCvData(rawCv)

  const headerComment = [
    '%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%',
    `% ${cv.contact.fullname || 'Curriculum Vitae'}`,
    '%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%',
  ].join('\n')

  // Always present.
  const fixed: Section[] = [
    { comment: '% --------- Contact Information -----------', content: introductionBlock(cv) },
    { comment: '% --------- Summary -----------', content: summaryBlock(cv) },
  ]

  // Optional — only emitted when they have content, to avoid empty sections.
  const optional: Section[] = []
  if (cv.education.length > 0) {
    optional.push({ comment: '% --------- Education ---------', content: educationSection(cv.education) })
  }
  if (cv.skills.length > 0) {
    optional.push({ comment: '% --------- Skills -----------', content: skillsSection(cv.skills) })
  }
  if (cv.experience.length > 0) {
    optional.push({
      comment: '% --------- Experience -----------',
      content: experienceSection(cv.experience),
    })
  }
  if (cv.projects.length > 0) {
    optional.push({ comment: '% --------- Projects -----------', content: projectsSection(cv.projects) })
  }
  if (cv.certifications.length > 0) {
    optional.push({
      comment: '% --------- Certifications -----------',
      content: certificationsSection(cv.certifications),
    })
  }
  if (cv.languages.length > 0) {
    optional.push({ comment: '% --------- Languages -----------', content: languagesSection(cv.languages) })
  }

  const sections = [...fixed, ...optional]

  const body = sections.map((s) => `${s.comment}\n\n${s.content}`).join('\n\n')

  return [
    headerComment,
    '',
    '\\documentclass{resume}',
    '',
    '\\begin{document}',
    '',
    body,
    '',
    '\\end{document}',
    '',
  ].join('\n')
}
