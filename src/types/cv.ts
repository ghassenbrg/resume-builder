/**
 * Data model for the CV generator.
 *
 * This mirrors the structure of the LaTeX template (`resume.cls` commands)
 * defined in `docs/resume.tex`:
 *
 *   \introduction[...]        -> Contact
 *   \summary{...}             -> summary
 *   educationSection          -> education[]   (\educationItem)
 *   skillsSection             -> skills[]       (\skillItem)
 *   experienceSection         -> experience[]   (\experienceItem / \positionItem)
 *   experienceSection         -> projects[]     (\projectItem)
 *   skillsSection             -> certifications[] (\skillItem)
 *   skillsSection             -> languages[]     (\skillItem)
 */

/** Header / contact block — maps to `\introduction[...]`. */
export interface Contact {
  fullname: string
  address: string
  email: string
  phone: string
  linkedin: string
}

/** A single `\educationItem[...]` entry. */
export interface EducationItem {
  university: string
  graduation: string
  program: string
}

/**
 * A single `\skillItem[...]` entry (Technical Skills).
 * `skills` is an atomic list rendered as a comma-joined string in LaTeX.
 */
export interface SkillItem {
  category: string
  skills: string[]
}

/** A nested role under a single company — maps to `\positionItem[...]`. */
export interface PositionItem {
  position: string
  duration: string
  bullets: string[]
}

/**
 * A single `\experienceItem[...]` entry.
 *
 * Two shapes are supported:
 *  - Single role:  use `position`, `duration`, `bullets`; leave `positions` empty.
 *  - Multiple roles at one company: leave `position`/`bullets` unused and fill
 *    `positions` with `\positionItem` entries. The generator switches on
 *    `positions.length > 0`.
 */
export interface ExperienceItem {
  company: string
  location: string
  position: string
  duration: string
  bullets: string[]
  positions: PositionItem[]
}

/** A single `\projectItem[...]` entry under "Key Projects". */
export interface ProjectItem {
  title: string
  duration: string
  keyHighlight: string
  bullets: string[]
}

/** A single `\skillItem[...]` entry under "Certifications". */
export interface CertificationItem {
  category: string
  skills: string[]
}

/** A single `\skillItem[...]` entry under "Languages". */
export interface LanguageItem {
  language: string
  level: string
}

/** The complete CV document model. */
export interface CvData {
  contact: Contact
  summary: string
  education: EducationItem[]
  skills: SkillItem[]
  experience: ExperienceItem[]
  projects: ProjectItem[]
  certifications: CertificationItem[]
  languages: LanguageItem[]
}
