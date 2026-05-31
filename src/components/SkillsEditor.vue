<script setup lang="ts">
import { useCvStore } from '@/stores/cvStore'
import { joinComma, splitComma } from '@/utils/listFields'

const store = useCvStore()
</script>

<template>
  <section class="card">
    <div class="card-head">
      <h2><span class="step">4</span> Technical Skills</h2>
      <button class="btn btn-ghost btn-sm" @click="store.addSkill()">+ Add skill</button>
    </div>
    <div class="card-body">
      <p v-if="store.cv.skills.length === 0" class="empty-note">
        No skill categories yet. Click “Add skill”.
      </p>

      <div class="list">
        <div v-for="(skill, i) in store.cv.skills" :key="i" class="list-item">
          <div class="item-head">
            <span class="item-title">Category {{ i + 1 }}</span>
            <button class="btn btn-danger btn-sm" @click="store.removeSkill(i)">Remove</button>
          </div>

          <div class="field">
            <label class="field-label" :for="`skill-cat-${i}`">Category</label>
            <input :id="`skill-cat-${i}`" type="text" v-model="skill.category" placeholder="Programming Languages" />
          </div>

          <div class="field">
            <label class="field-label" :for="`skill-list-${i}`">Skills</label>
            <input
              :id="`skill-list-${i}`"
              type="text"
              :value="joinComma(skill.skills)"
              @change="skill.skills = splitComma(($event.target as HTMLInputElement).value)"
              placeholder="Java, TypeScript, SQL"
            />
            <span class="field-help">Comma-separated (e.g. Java, TypeScript, SQL)</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
