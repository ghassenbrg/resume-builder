import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type {
  CertificationItem,
  CvData,
  EducationItem,
  ExperienceItem,
  LanguageItem,
  PositionItem,
  ProjectItem,
  SkillItem,
} from '@/types/cv'
import { sampleCv } from '@/data/sampleCv'
import { cleanCvData, createEmptyCvData, parseJsonStringToCvData, parseJsonToCvData } from '@/services/jsonParser'
import { generateLatex } from '@/services/latexGenerator'
import templateRaw from '@/assets/resume.tex?raw'

const clone = <T>(value: T): T => structuredClone(value)

// ---- Blank item factories (used by the "Add" buttons) ----------------------
const blankEducation = (): EducationItem => ({ university: '', graduation: '', program: '' })
const blankSkill = (): SkillItem => ({ category: '', skills: [] })
const blankPosition = (): PositionItem => ({ position: '', duration: '', bullets: [''] })
const blankExperience = (): ExperienceItem => ({
  company: '',
  location: '',
  position: '',
  duration: '',
  bullets: [''],
  positions: [],
})
const blankProject = (): ProjectItem => ({ title: '', duration: '', keyHighlight: '', bullets: [''] })
const blankCertification = (): CertificationItem => ({ category: '', skills: [] })
const blankLanguage = (): LanguageItem => ({ language: '', level: '' })

export interface ValidationResult {
  valid: boolean
  errors: string[]
}

const EMAIL_RE = /^\S+@\S+\.\S+$/

export const useCvStore = defineStore('cv', () => {
  // ---- State ---------------------------------------------------------------
  /** The editable CV (deeply reactive). Bind form fields directly to this. */
  const cv = ref<CvData>(clone(sampleCv))
  /** Raw reference template shown read-only in the preview. */
  const template = ref<string>(templateRaw)
  const templateName = ref<string>('resume.tex')
  /** Last generated `.tex` (empty until "Generate" is clicked). */
  const generatedTex = ref<string>('')
  /** Which tab the preview pane shows. Generating switches to 'generated'. */
  const previewTab = ref<'reference' | 'generated'>('reference')
  function setPreviewTab(tab: 'reference' | 'generated'): void {
    previewTab.value = tab
  }

  // ---- Validation ----------------------------------------------------------
  const validation = computed<ValidationResult>(() => {
    const errors: string[] = []
    const c = cv.value.contact
    if (!c.fullname.trim()) errors.push('Contact: full name is required.')
    if (!c.email.trim()) errors.push('Contact: email is required.')
    else if (!EMAIL_RE.test(c.email.trim())) errors.push('Contact: email format looks invalid.')
    if (!cv.value.education.some((e) => e.university.trim())) {
      errors.push('At least one education entry (with a university) is required.')
    }
    if (!cv.value.experience.some((e) => e.company.trim())) {
      errors.push('At least one experience entry (with a company) is required.')
    }
    return { valid: errors.length === 0, errors }
  })

  // ---- Output --------------------------------------------------------------
  /** Generate the `.tex`, store it, surface it in the preview, and return it. */
  function generate(): string {
    generatedTex.value = generateLatex(cv.value)
    previewTab.value = 'generated'
    return generatedTex.value
  }

  /** A cleaned copy of the data, suitable for JSON export. */
  function exportData(): CvData {
    return cleanCvData(cv.value)
  }

  // ---- Import / reset ------------------------------------------------------
  function loadCvData(data: CvData): void {
    cv.value = parseJsonToCvData(data)
    generatedTex.value = ''
  }

  /** Replace the CV from an already-parsed JSON value. Throws on bad input. */
  function importJson(json: unknown): void {
    cv.value = parseJsonToCvData(json)
    generatedTex.value = ''
  }

  /** Replace the CV from a raw JSON string. Throws on bad input. */
  function importJsonText(text: string): void {
    cv.value = parseJsonStringToCvData(text)
    generatedTex.value = ''
  }

  function resetToSample(): void {
    cv.value = clone(sampleCv)
    generatedTex.value = ''
  }

  function clearAll(): void {
    cv.value = createEmptyCvData()
    generatedTex.value = ''
  }

  // ---- Template ------------------------------------------------------------
  function loadTemplate(text: string, name: string): void {
    template.value = text
    templateName.value = name
  }

  function resetTemplate(): void {
    template.value = templateRaw
    templateName.value = 'resume.tex'
  }

  // ---- List add / remove helpers ------------------------------------------
  const addEducation = () => cv.value.education.push(blankEducation())
  const removeEducation = (i: number) => cv.value.education.splice(i, 1)

  const addSkill = () => cv.value.skills.push(blankSkill())
  const removeSkill = (i: number) => cv.value.skills.splice(i, 1)

  const addExperience = () => cv.value.experience.push(blankExperience())
  const removeExperience = (i: number) => cv.value.experience.splice(i, 1)

  const addPosition = (expIndex: number) => cv.value.experience[expIndex]?.positions.push(blankPosition())
  const removePosition = (expIndex: number, posIndex: number) =>
    cv.value.experience[expIndex]?.positions.splice(posIndex, 1)

  const addProject = () => cv.value.projects.push(blankProject())
  const removeProject = (i: number) => cv.value.projects.splice(i, 1)

  const addCertification = () => cv.value.certifications.push(blankCertification())
  const removeCertification = (i: number) => cv.value.certifications.splice(i, 1)

  const addLanguage = () => cv.value.languages.push(blankLanguage())
  const removeLanguage = (i: number) => cv.value.languages.splice(i, 1)

  return {
    // state
    cv,
    template,
    templateName,
    generatedTex,
    previewTab,
    setPreviewTab,
    // computed
    validation,
    // output
    generate,
    exportData,
    // import / reset
    loadCvData,
    importJson,
    importJsonText,
    resetToSample,
    clearAll,
    // template
    loadTemplate,
    resetTemplate,
    // list helpers
    addEducation,
    removeEducation,
    addSkill,
    removeSkill,
    addExperience,
    removeExperience,
    addPosition,
    removePosition,
    addProject,
    removeProject,
    addCertification,
    removeCertification,
    addLanguage,
    removeLanguage,
  }
})
