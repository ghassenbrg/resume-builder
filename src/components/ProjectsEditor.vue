<script setup lang="ts">
import { useCvStore } from '@/stores/cvStore'
import { joinLines, splitLines } from '@/utils/listFields'

const store = useCvStore()
</script>

<template>
  <section class="card">
    <div class="card-head">
      <h2><span class="step">6</span> Key Projects</h2>
      <button class="btn btn-ghost btn-sm" @click="store.addProject()">+ Add project</button>
    </div>
    <div class="card-body">
      <p v-if="store.cv.projects.length === 0" class="empty-note">
        No projects yet. Click “Add project”.
      </p>

      <div class="list">
        <div v-for="(p, i) in store.cv.projects" :key="i" class="list-item">
          <div class="item-head">
            <span class="item-title">{{ p.title || 'New project' }}</span>
            <button class="btn btn-danger btn-sm" @click="store.removeProject(i)">Remove</button>
          </div>

          <div class="field">
            <label class="field-label" :for="`proj-title-${i}`">Title</label>
            <input :id="`proj-title-${i}`" type="text" v-model="p.title" placeholder="Resume Builder" />
          </div>

          <div class="grid-2">
            <div class="field">
              <label class="field-label" :for="`proj-dur-${i}`">Duration</label>
              <input :id="`proj-dur-${i}`" type="text" v-model="p.duration" placeholder="2024 — Present" />
            </div>
            <div class="field">
              <label class="field-label" :for="`proj-high-${i}`">Key highlight</label>
              <input :id="`proj-high-${i}`" type="text" v-model="p.keyHighlight" placeholder="Generated LaTeX CVs from a JSON model." />
            </div>
          </div>

          <div class="field">
            <label class="field-label" :for="`proj-bullets-${i}`">Details</label>
            <textarea
              :id="`proj-bullets-${i}`"
              rows="4"
              :value="joinLines(p.bullets)"
              @change="p.bullets = splitLines(($event.target as HTMLTextAreaElement).value)"
              placeholder="Built a reactive editor…"
            ></textarea>
            <span class="field-help">One bullet point per line.</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
