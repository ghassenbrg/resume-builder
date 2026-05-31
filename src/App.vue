<script setup lang="ts">
import { useCvStore } from '@/stores/cvStore'

import JsonImportExport from '@/components/JsonImportExport.vue'
import ContactForm from '@/components/ContactForm.vue'
import SummaryForm from '@/components/SummaryForm.vue'
import EducationEditor from '@/components/EducationEditor.vue'
import SkillsEditor from '@/components/SkillsEditor.vue'
import ExperienceEditor from '@/components/ExperienceEditor.vue'
import ProjectsEditor from '@/components/ProjectsEditor.vue'
import CertificationsEditor from '@/components/CertificationsEditor.vue'
import LanguagesEditor from '@/components/LanguagesEditor.vue'
import TemplatePreview from '@/components/TemplatePreview.vue'
import OutputActions from '@/components/OutputActions.vue'

const store = useCvStore()

function onResetSample() {
  if (confirm('Replace all current data with the built-in sample CV?')) store.resetToSample()
}

function onClearAll() {
  if (confirm('Clear all CV data? This cannot be undone.')) store.clearAll()
}
</script>

<template>
  <header class="app-header">
    <div class="brand">
      <div class="logo">CV</div>
      <div>
        <h1>LaTeX Resume Builder</h1>
        <div class="sub">Edit · import JSON · generate <code>.tex</code> / PDF</div>
      </div>
    </div>
    <div class="header-actions">
      <button class="btn btn-ghost btn-sm" @click="onResetSample">Load sample CV</button>
      <button class="btn btn-ghost btn-sm" @click="onClearAll">Clear all</button>
    </div>
  </header>

  <main class="layout">
    <section class="editor-pane">
      <JsonImportExport />
      <ContactForm />
      <SummaryForm />
      <EducationEditor />
      <SkillsEditor />
      <ExperienceEditor />
      <ProjectsEditor />
      <CertificationsEditor />
      <LanguagesEditor />
    </section>

    <aside class="preview-pane">
      <OutputActions />
      <TemplatePreview />
    </aside>
  </main>
</template>
