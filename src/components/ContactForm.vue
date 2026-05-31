<script setup lang="ts">
import { computed } from 'vue'
import { useCvStore } from '@/stores/cvStore'

const store = useCvStore()
const contact = computed(() => store.cv.contact)
</script>

<template>
  <section class="card">
    <div class="card-head">
      <h2><span class="step">1</span> Contact information</h2>
    </div>
    <div class="card-body">
      <div class="grid-2">
        <div class="field">
          <label class="field-label" for="c-fullname">Full name<span class="req">*</span></label>
          <input
            id="c-fullname"
            type="text"
            v-model="contact.fullname"
            placeholder="Ghassen Bargougui"
            :class="{ invalid: !contact.fullname.trim() }"
          />
        </div>
        <div class="field">
          <label class="field-label" for="c-email">Email<span class="req">*</span></label>
          <input
            id="c-email"
            type="email"
            v-model="contact.email"
            placeholder="you@example.com"
            :class="{ invalid: !contact.email.trim() }"
          />
        </div>
        <div class="field">
          <label class="field-label" for="c-address">Address</label>
          <input id="c-address" type="text" v-model="contact.address" placeholder="Fukuoka, Japan" />
        </div>
        <div class="field">
          <label class="field-label" for="c-phone">Phone</label>
          <input id="c-phone" type="tel" v-model="contact.phone" placeholder="+81 70 0000 0000" />
        </div>
        <div class="field" style="grid-column: 1 / -1">
          <label class="field-label" for="c-linkedin">LinkedIn</label>
          <input
            id="c-linkedin"
            type="text"
            v-model="contact.linkedin"
            placeholder="linkedin.com/in/yourname"
          />
        </div>
      </div>
    </div>
  </section>
</template>
