<script setup lang="ts">
import { computed } from 'vue'
import { useCvStore } from '@/stores/cvStore'

const store = useCvStore()
const charCount = computed(() => store.cv.summary.trim().length)
</script>

<template>
  <section class="card">
    <div class="card-head">
      <h2><span class="step">2</span> Summary</h2>
      <span class="hint">{{ charCount }} chars</span>
    </div>
    <div class="card-body">
      <div class="field">
        <textarea
          v-model="store.cv.summary"
          rows="6"
          aria-label="Professional summary"
          placeholder="A short professional summary…"
        ></textarea>
        <span class="field-help">Plain text — LaTeX special characters are escaped automatically.</span>
      </div>
    </div>
  </section>
</template>
