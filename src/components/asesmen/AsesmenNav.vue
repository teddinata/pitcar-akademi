<!-- Kepala halaman menu Asesmen: judul, cara pakai, dan tab antar-halaman admin. -->
<template>
  <div class="mb-6">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div class="min-w-0">
        <p class="flex items-center gap-2 text-xs font-extrabold tracking-[.08em] uppercase text-[color:var(--ink-soft)]">
          Asesmen <span class="u-new">NEW</span>
        </p>
        <h1 class="u-display mt-1 text-[1.8rem] sm:text-[2.2rem] font-extrabold leading-none">{{ title }}</h1>
        <p v-if="subtitle" class="mt-2 text-[15px] text-[color:var(--ink-soft)] max-w-2xl">{{ subtitle }}</p>
      </div>
      <div class="flex flex-wrap gap-2">
        <slot name="actions" />
        <button v-if="help" class="u-btn !min-h-10" data-tour="asm-help" @click="$emit('help')"><QuestionMarkCircleIcon class="w-5 h-5" />Cara pakai</button>
      </div>
    </div>
    <nav v-if="admin" class="u-tabs mt-5" aria-label="Menu Asesmen" data-tour="asm-nav">
      <router-link v-for="t in TABS" :key="t.to" :to="t.to" class="u-tab" :class="aktif(t) ? 'is-active' : ''">{{ t.label }}</router-link>
    </nav>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { QuestionMarkCircleIcon } from '@heroicons/vue/24/outline'

defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  admin: { type: Boolean, default: true },
  help: { type: Boolean, default: true },
})
defineEmits(['help'])

const TABS = [
  { to: '/dashboard/asesmen', label: 'Periode', exact: true },
  { to: '/dashboard/asesmen/paket', label: 'Paket Asesmen' },
  { to: '/dashboard/asesmen/rekap', label: 'Rekap & Validasi' },
]
const route = useRoute()
const aktif = (t) => (t.exact ? route.path === t.to || route.path.startsWith('/dashboard/asesmen/periode') : route.path.startsWith(t.to))
</script>
