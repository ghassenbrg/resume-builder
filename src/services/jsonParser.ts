import type {
  CertificationItem,
  Contact,
  CvData,
  EducationItem,
  ExperienceItem,
  LanguageItem,
  PositionItem,
  ProjectItem,
  SkillItem,
} from '@/types/cv'

/** Error thrown when imported JSON cannot be interpreted as CV data. */
export class CvParseError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'CvParseError'
  }
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function asString(value: unknown): string {
  if (value === undefined || value === null) return ''
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  return ''
}

function asArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value
  if (value === undefined || value === null) return []
  // Tolerate a single object/value where an array is expected.
  return [value]
}

/**
 * Normalize a "skills" field. Accepts an array of strings, or a single
 * comma-separated string (so hand-written JSON like "Java, SQL" still works).
 */
function asStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map(asString).map((s) => s.trim()).filter(Boolean)
  }
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
  }
  return []
}

/** Normalize a "bullets" field. Accepts an array or a newline/string blob. */
function asBullets(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map(asString)
  }
  if (typeof value === 'string') {
    return value.split('\n')
  }
  return []
}

function parseContact(value: unknown): Contact {
  const c = isObject(value) ? value : {}
  return {
    fullname: asString(c.fullname),
    address: asString(c.address),
    email: asString(c.email),
    phone: asString(c.phone),
    linkedin: asString(c.linkedin),
  }
}

function parseEducation(value: unknown): EducationItem {
  const e = isObject(value) ? value : {}
  return {
    university: asString(e.university),
    graduation: asString(e.graduation),
    program: asString(e.program),
  }
}

function parseSkill(value: unknown): SkillItem {
  const s = isObject(value) ? value : {}
  return {
    category: asString(s.category),
    skills: asStringArray(s.skills),
  }
}

function parsePosition(value: unknown): PositionItem {
  const p = isObject(value) ? value : {}
  return {
    position: asString(p.position),
    duration: asString(p.duration),
    bullets: asBullets(p.bullets),
  }
}

function parseExperience(value: unknown): ExperienceItem {
  const x = isObject(value) ? value : {}
  return {
    company: asString(x.company),
    location: asString(x.location),
    position: asString(x.position),
    duration: asString(x.duration),
    bullets: asBullets(x.bullets),
    positions: asArray(x.positions).map(parsePosition),
  }
}

function parseProject(value: unknown): ProjectItem {
  const p = isObject(value) ? value : {}
  return {
    title: asString(p.title),
    duration: asString(p.duration),
    keyHighlight: asString(p.keyHighlight),
    bullets: asBullets(p.bullets),
  }
}

function parseCertification(value: unknown): CertificationItem {
  const c = isObject(value) ? value : {}
  return {
    category: asString(c.category),
    skills: asStringArray(c.skills),
  }
}

function parseLanguage(value: unknown): LanguageItem {
  const l = isObject(value) ? value : {}
  return {
    language: asString(l.language),
    level: asString(l.level),
  }
}

/**
 * Validate and normalize untrusted JSON into a fully-formed `CvData` object.
 * Missing fields fall back to sensible empty defaults; wrong-typed fields are
 * coerced where possible. Throws `CvParseError` only when the top-level value
 * is not an object.
 */
export function parseJsonToCvData(json: unknown): CvData {
  if (!isObject(json)) {
    throw new CvParseError('Invalid CV JSON: expected a top-level object.')
  }

  return {
    contact: parseContact(json.contact),
    summary: asString(json.summary),
    education: asArray(json.education).map(parseEducation),
    skills: asArray(json.skills).map(parseSkill),
    experience: asArray(json.experience).map(parseExperience),
    projects: asArray(json.projects).map(parseProject),
    certifications: asArray(json.certifications).map(parseCertification),
    languages: asArray(json.languages).map(parseLanguage),
  }
}

/** Parse a raw JSON string (from a dropped/uploaded file) into CV data. */
export function parseJsonStringToCvData(text: string): CvData {
  let json: unknown
  try {
    json = JSON.parse(text)
  } catch (err) {
    throw new CvParseError(`Invalid JSON: ${(err as Error).message}`)
  }
  return parseJsonToCvData(json)
}

/** An entirely empty CV (used by "Clear all"). */
export function createEmptyCvData(): CvData {
  return {
    contact: { fullname: '', address: '', email: '', phone: '', linkedin: '' },
    summary: '',
    education: [],
    skills: [],
    experience: [],
    projects: [],
    certifications: [],
    languages: [],
  }
}

const isBlank = (s: string): boolean => s.trim().length === 0

/**
 * Return a cleaned deep copy of the CV:
 *  - all strings trimmed,
 *  - empty bullets / skills removed,
 *  - fully-empty list entries dropped.
 *
 * Used both for `.tex` generation and JSON export so output is always valid.
 */
export function cleanCvData(cv: CvData): CvData {
  const cleanBullets = (bullets: string[]): string[] => bullets.map((b) => b.trim()).filter(Boolean)
  const cleanSkills = (skills: string[]): string[] => skills.map((s) => s.trim()).filter(Boolean)

  return {
    contact: {
      fullname: cv.contact.fullname.trim(),
      address: cv.contact.address.trim(),
      email: cv.contact.email.trim(),
      phone: cv.contact.phone.trim(),
      linkedin: cv.contact.linkedin.trim(),
    },
    summary: cv.summary.trim(),

    education: cv.education
      .map((e) => ({
        university: e.university.trim(),
        graduation: e.graduation.trim(),
        program: e.program.trim(),
      }))
      .filter((e) => !(isBlank(e.university) && isBlank(e.graduation) && isBlank(e.program))),

    skills: cv.skills
      .map((s) => ({ category: s.category.trim(), skills: cleanSkills(s.skills) }))
      .filter((s) => !(isBlank(s.category) && s.skills.length === 0)),

    experience: cv.experience
      .map((x) => {
        const positions = x.positions
          .map((p) => ({
            position: p.position.trim(),
            duration: p.duration.trim(),
            bullets: cleanBullets(p.bullets),
          }))
          .filter((p) => !(isBlank(p.position) && isBlank(p.duration) && p.bullets.length === 0))
        return {
          company: x.company.trim(),
          location: x.location.trim(),
          position: x.position.trim(),
          duration: x.duration.trim(),
          bullets: cleanBullets(x.bullets),
          positions,
        }
      })
      .filter(
        (x) =>
          !(
            isBlank(x.company) &&
            isBlank(x.location) &&
            isBlank(x.position) &&
            isBlank(x.duration) &&
            x.bullets.length === 0 &&
            x.positions.length === 0
          ),
      ),

    projects: cv.projects
      .map((p) => ({
        title: p.title.trim(),
        duration: p.duration.trim(),
        keyHighlight: p.keyHighlight.trim(),
        bullets: cleanBullets(p.bullets),
      }))
      .filter(
        (p) => !(isBlank(p.title) && isBlank(p.duration) && isBlank(p.keyHighlight) && p.bullets.length === 0),
      ),

    certifications: cv.certifications
      .map((c) => ({ category: c.category.trim(), skills: cleanSkills(c.skills) }))
      .filter((c) => !(isBlank(c.category) && c.skills.length === 0)),

    languages: cv.languages
      .map((l) => ({ language: l.language.trim(), level: l.level.trim() }))
      .filter((l) => !(isBlank(l.language) && isBlank(l.level))),
  }
}
