<script setup lang="ts">
import { useCvStore } from '@/stores/cvStore'
import { joinComma, splitComma } from '@/utils/listFields'

const store = useCvStore()
</script>

<template>
  <section class="card">
    <div class="card-head">
      <h2><span class="step">7</span> Certifications</h2>
      <button class="btn btn-ghost btn-sm" @click="store.addCertification()">+ Add certification</button>
    </div>
    <div class="card-body">
      <p v-if="store.cv.certifications.length === 0" class="empty-note">
        No certifications yet. Click “Add certification”.
      </p>

      <div class="list">
        <div v-for="(c, i) in store.cv.certifications" :key="i" class="list-item">
          <div class="item-head">
            <span class="item-title">Certification {{ i + 1 }}</span>
            <button class="btn btn-danger btn-sm" @click="store.removeCertification(i)">Remove</button>
          </div>

          <div class="field">
            <label class="field-label" :for="`cert-cat-${i}`">Category / Issuer</label>
            <input :id="`cert-cat-${i}`" type="text" v-model="c.category" placeholder="Oracle" />
          </div>

          <div class="field">
            <label class="field-label" :for="`cert-list-${i}`">Details</label>
            <input
              :id="`cert-list-${i}`"
              type="text"
              :value="joinComma(c.skills)"
              @change="c.skills = splitComma(($event.target as HTMLInputElement).value)"
            />
            <span class="field-help">Comma-separated</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
