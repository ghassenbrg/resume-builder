<script setup lang="ts">
import { computed } from 'vue'
import { useCvStore } from '@/stores/cvStore'
import { readFileAsText } from '@/services/fileDownloader'

const store = useCvStore()

const shownText = computed(() =>
  store.previewTab === 'reference' ? store.template : store.generatedTex || '',
)

async function onUpload(event: Event): Promise<void> {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  const text = await readFileAsText(file)
  store.loadTemplate(text, file.name)
  input.value = ''
}
</script>

<template>
  <section class="card">
    <div class="card-head">
      <h2>LaTeX Template</h2>
    </div>
    <div class="card-body">
      <div class="tabs">
        <button
          class="tab"
          :class="{ active: store.previewTab === 'reference' }"
          @click="store.setPreviewTab('reference')"
        >
          Reference template
        </button>
        <button
          class="tab"
          :class="{ active: store.previewTab === 'generated' }"
          @click="store.setPreviewTab('generated')"
        >
          Generated output
        </button>
      </div>

      <div class="toolbar">
        <span class="chip">{{ store.previewTab === 'generated' ? 'generated.tex' : store.templateName }}</span>
        <span class="spacer"></span>
        <template v-if="store.previewTab === 'reference'">
          <label class="btn btn-ghost btn-sm">
            Upload .tex
            <input
              type="file"
              accept=".tex,text/plain"
              class="hidden-input"
              @change="onUpload"
            />
          </label>
          <button class="btn btn-ghost btn-sm" @click="store.resetTemplate()">Reset</button>
        </template>
      </div>

      <p v-if="store.previewTab === 'generated' && !store.generatedTex" class="empty-note">
        Click “Generate .tex” in the Output panel to preview the generated file.
      </p>
      <pre v-else class="code-block code scroll-y" style="max-height: 60vh">{{ shownText }}</pre>
    </div>
  </section>
</template>
