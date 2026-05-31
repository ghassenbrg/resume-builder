<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useCvStore } from '@/stores/cvStore'
import { downloadText, downloadBlob, slugify } from '@/services/fileDownloader'
import { compilePdf, checkPdfBackend, PdfBackendError } from '@/services/pdfClient'

const store = useCvStore()
const pdfBusy = ref(false)
const pdfError = ref('')
const backendOnline = ref<boolean | null>(null)

const baseName = computed(() => slugify(store.cv.contact.fullname))

onMounted(async () => {
  backendOnline.value = await checkPdfBackend()
})

function downloadTex(): void {
  const tex = store.generate()
  downloadText(baseName.value + '.tex', tex, 'application/x-tex;charset=utf-8')
}

async function generatePdf(): Promise<void> {
  pdfError.value = ''
  pdfBusy.value = true
  try {
    const tex = store.generate()
    const blob = await compilePdf(tex)
    downloadBlob(baseName.value + '.pdf', blob)
    backendOnline.value = true
  } catch (err) {
    pdfError.value = err instanceof PdfBackendError ? err.message : (err as Error).message
    if (err instanceof PdfBackendError) backendOnline.value = false
  } finally {
    pdfBusy.value = false
  }
}
</script>

<template>
  <section class="card">
    <div class="card-head">
      <h2>Output</h2>
    </div>
    <div class="card-body">
      <div v-if="store.validation.errors.length > 0" class="banner banner-warn">
        Some fields need attention:
        <ul>
          <li v-for="(error, i) in store.validation.errors" :key="i">{{ error }}</li>
        </ul>
      </div>
      <div v-else class="banner banner-ok">All required fields look good.</div>

      <div class="btn-row">
        <button class="btn" @click="store.generate()">Generate .tex</button>
        <button class="btn btn-primary" @click="downloadTex">Download .tex</button>
        <button class="btn" :disabled="pdfBusy" @click="generatePdf">
          {{ pdfBusy ? 'Compiling…' : 'Generate PDF' }}
        </button>
        <span v-if="backendOnline === true" class="chip ok">PDF backend online</span>
        <span v-else-if="backendOnline === false" class="chip warn">PDF backend offline</span>
        <span v-else class="chip">Checking…</span>
      </div>

      <div v-if="pdfError" class="banner banner-error">{{ pdfError }}</div>

      <p v-if="store.generatedTex" class="chip ok">✓ .tex generated — shown in the preview below</p>

      <p class="muted field-help">
        .tex always works locally. PDF needs the backend (npm run server) + a LaTeX install.
      </p>
    </div>
  </section>
</template>
