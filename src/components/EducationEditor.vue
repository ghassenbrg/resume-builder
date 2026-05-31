<script setup lang="ts">
import { useCvStore } from '@/stores/cvStore'

const store = useCvStore()
</script>

<template>
  <section class="card">
    <div class="card-head">
      <h2><span class="step">3</span> Education</h2>
      <button class="btn btn-ghost btn-sm" @click="store.addEducation()">+ Add education</button>
    </div>
    <div class="card-body">
      <p v-if="store.cv.education.length === 0" class="empty-note">
        No education entries yet. Click “Add education”.
      </p>

      <div class="list">
        <div v-for="(edu, i) in store.cv.education" :key="i" class="list-item">
          <div class="item-head">
            <span class="item-title">Entry {{ i + 1 }}</span>
            <button class="btn btn-danger btn-sm" @click="store.removeEducation(i)">Remove</button>
          </div>

          <div class="field">
            <label class="field-label" :for="`edu-univ-${i}`">University / School</label>
            <input :id="`edu-univ-${i}`" type="text" v-model="edu.university" placeholder="ESPRIT, Tunis, Tunisia" />
          </div>

          <div class="grid-2">
            <div class="field">
              <label class="field-label" :for="`edu-prog-${i}`">Program / Degree</label>
              <input :id="`edu-prog-${i}`" type="text" v-model="edu.program" placeholder="Engineer’s Degree, Software Engineering" />
            </div>
            <div class="field">
              <label class="field-label" :for="`edu-grad-${i}`">Graduation</label>
              <input :id="`edu-grad-${i}`" type="text" v-model="edu.graduation" placeholder="July 2023" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
