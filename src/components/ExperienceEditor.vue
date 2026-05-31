<script setup lang="ts">
import { useCvStore } from '@/stores/cvStore'
import type { ExperienceItem } from '@/types/cv'
import { joinLines, splitLines } from '@/utils/listFields'

const store = useCvStore()

function hasRoleData(exp: ExperienceItem): boolean {
  return exp.positions.some(
    (p) => p.position.trim() || p.duration.trim() || p.bullets.some((b) => b.trim()),
  )
}

function toggleMulti(exp: ExperienceItem, i: number, checked: boolean): void {
  if (checked) {
    if (exp.positions.length === 0) store.addPosition(i)
    return
  }
  // Unchecking discards the role sub-list — confirm first if it holds real data.
  if (hasRoleData(exp) && !confirm('Switch to a single role? The entered roles will be removed.')) {
    return
  }
  exp.positions = []
}
</script>

<template>
  <section class="card">
    <div class="card-head">
      <h2><span class="step">5</span> Professional Experience</h2>
      <button class="btn btn-ghost btn-sm" @click="store.addExperience()">+ Add experience</button>
    </div>
    <div class="card-body">
      <p v-if="store.cv.experience.length === 0" class="empty-note">
        No experience entries yet. Click “Add experience”.
      </p>

      <div class="list">
        <div v-for="(exp, i) in store.cv.experience" :key="i" class="list-item">
          <div class="item-head">
            <span class="item-title">{{ exp.company || 'New company' }}</span>
            <button class="btn btn-danger btn-sm" @click="store.removeExperience(i)">Remove</button>
          </div>

          <div class="grid-2">
            <div class="field">
              <label class="field-label" :for="`exp-company-${i}`">Company</label>
              <input :id="`exp-company-${i}`" type="text" v-model="exp.company" placeholder="Acme Corp" />
            </div>
            <div class="field">
              <label class="field-label" :for="`exp-location-${i}`">Location</label>
              <input :id="`exp-location-${i}`" type="text" v-model="exp.location" placeholder="Tokyo, Japan" />
            </div>
          </div>

          <div class="field">
            <label class="field-label" :for="`exp-duration-${i}`">Duration</label>
            <input :id="`exp-duration-${i}`" type="text" v-model="exp.duration" placeholder="Dec 2025 – Present" />
          </div>

          <div class="field">
            <label class="field-label">
              <input
                type="checkbox"
                :checked="exp.positions.length > 0"
                @change="toggleMulti(exp, i, ($event.target as HTMLInputElement).checked)"
              />
              Multiple roles at this company
            </label>
          </div>

          <template v-if="exp.positions.length === 0">
            <div class="field">
              <label class="field-label" :for="`exp-position-${i}`">Position / Title</label>
              <input :id="`exp-position-${i}`" type="text" v-model="exp.position" placeholder="Senior Software Engineer" />
            </div>
            <div class="field">
              <label class="field-label" :for="`exp-bullets-${i}`">Responsibilities</label>
              <textarea
                :id="`exp-bullets-${i}`"
                rows="4"
                :value="joinLines(exp.bullets)"
                @change="exp.bullets = splitLines(($event.target as HTMLTextAreaElement).value)"
              ></textarea>
              <span class="field-help">One bullet point per line</span>
            </div>
          </template>

          <template v-else>
            <div class="sub-list">
              <div v-for="(pos, j) in exp.positions" :key="j" class="list-item">
                <div class="item-head">
                  <span class="item-title">Role {{ j + 1 }}</span>
                  <button class="btn btn-danger btn-sm" @click="store.removePosition(i, j)">
                    Remove role
                  </button>
                </div>

                <div class="grid-2">
                  <div class="field">
                    <label class="field-label" :for="`exp-${i}-pos-title-${j}`">Position / Title</label>
                    <input :id="`exp-${i}-pos-title-${j}`" type="text" v-model="pos.position" placeholder="Senior Software Engineer" />
                  </div>
                  <div class="field">
                    <label class="field-label" :for="`exp-${i}-pos-dur-${j}`">Duration</label>
                    <input :id="`exp-${i}-pos-dur-${j}`" type="text" v-model="pos.duration" placeholder="Dec 2025 – Present" />
                  </div>
                </div>

                <div class="field">
                  <label class="field-label" :for="`exp-${i}-pos-bullets-${j}`">Responsibilities</label>
                  <textarea
                    :id="`exp-${i}-pos-bullets-${j}`"
                    rows="4"
                    :value="joinLines(pos.bullets)"
                    @change="pos.bullets = splitLines(($event.target as HTMLTextAreaElement).value)"
                  ></textarea>
                  <span class="field-help">One bullet point per line</span>
                </div>
              </div>
            </div>

            <div class="btn-row">
              <button class="btn btn-ghost btn-sm" @click="store.addPosition(i)">+ Add role</button>
            </div>
          </template>
        </div>
      </div>
    </div>
  </section>
</template>
