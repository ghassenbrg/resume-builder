<script setup lang="ts">
import { useCvStore } from '@/stores/cvStore'

const store = useCvStore()
</script>

<template>
  <section class="card">
    <div class="card-head">
      <h2><span class="step">8</span> Languages</h2>
      <button class="btn btn-ghost btn-sm" @click="store.addLanguage()">+ Add language</button>
    </div>
    <div class="card-body">
      <p v-if="store.cv.languages.length === 0" class="empty-note">
        No languages yet. Click “Add language”.
      </p>

      <div class="list">
        <div v-for="(l, i) in store.cv.languages" :key="i" class="list-item">
          <div class="item-head">
            <span class="item-title">Language {{ i + 1 }}</span>
            <button class="btn btn-danger btn-sm" @click="store.removeLanguage(i)">Remove</button>
          </div>

          <div class="grid-2">
            <div class="field">
              <label class="field-label" :for="`lang-name-${i}`">Language</label>
              <input :id="`lang-name-${i}`" type="text" v-model="l.language" placeholder="English" />
            </div>
            <div class="field">
              <label class="field-label" :for="`lang-level-${i}`">Level</label>
              <input :id="`lang-level-${i}`" type="text" v-model="l.level" placeholder="Fluent" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
