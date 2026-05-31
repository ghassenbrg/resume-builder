<script setup lang="ts">
import { ref } from 'vue'
import { useCvStore } from '@/stores/cvStore'
import { downloadJson, readFileAsText, slugify } from '@/services/fileDownloader'
import { sampleCv } from '@/data/sampleCv'

const store = useCvStore()

const fileInput = ref<HTMLInputElement | null>(null)
const dragging = ref(false)
const message = ref<{ type: 'ok' | 'error'; text: string } | null>(null)

async function importFile(file: File): Promise<void> {
  try {
    const text = await readFileAsText(file)
    store.importJsonText(text)
    message.value = { type: 'ok', text: 'Imported "' + file.name + '".' }
  } catch (err) {
    message.value = { type: 'error', text: (err as Error).message }
  }
}

function onDrop(e: DragEvent): void {
  dragging.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file) void importFile(file)
}

function onFileChange(e: Event): void {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) void importFile(file)
  input.value = ''
}

function exportJson(): void {
  downloadJson(slugify(store.cv.contact.fullname) + '-cv.json', store.exportData())
}

function downloadSample(): void {
  downloadJson('sample-cv.json', sampleCv)
}
</script>

<template>
  <section class="card">
    <div class="card-head">
      <h2><span class="step">⇄</span> Import / Export JSON</h2>
    </div>
    <div class="card-body">
      <div
        class="dropzone"
        :class="{ dragging }"
        @click="fileInput?.click()"
        @dragover.prevent="dragging = true"
        @dragleave.prevent="dragging = false"
        @drop.prevent="onDrop"
      >
        Drop a .json file here, or click to choose
        <input
          ref="fileInput"
          type="file"
          accept="application/json,.json"
          class="hidden-input"
          @change="onFileChange"
        />
      </div>

      <div v-if="message" :class="message.type === 'ok' ? 'banner banner-ok' : 'banner banner-error'">
        {{ message.text }}
      </div>

      <div class="btn-row">
        <button class="btn" @click="exportJson">Export JSON</button>
        <button class="btn btn-ghost" @click="downloadSample">Download sample</button>
      </div>

      <p class="muted">Importing a JSON file fills the form below automatically.</p>
    </div>
  </section>
</template>
