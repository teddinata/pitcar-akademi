<!-- Hasil Asesmen Terpadu untuk peserta (setelah periode ditutup). -->
<template>
  <div class="ujian min-h-screen p-4 md:p-6">
    <div class="max-w-3xl mx-auto">
      <router-link to="/dashboard/lms/my-competency" class="u-btn !min-h-10 mb-4"><ChevronLeftIcon class="w-5 h-5" />Asesmen Saya</router-link>
      <div v-if="loading" class="u-card h-64 animate-pulse"></div>
      <p v-else-if="error" class="u-card p-5 font-bold text-[color:var(--merah)]">{{ error }}</p>
      <template v-else-if="d">
        <p class="text-sm font-bold text-[color:var(--ink-soft)]">{{ d.cycle.name }}</p>
        <h1 class="u-display text-[2rem] font-extrabold leading-none">Hasil asesmen Anda</h1>

        <section class="u-card mt-5 p-5 text-center bg-[#fffbe0]">
          <template v-if="d.validated && d.summary.final_level">
            <p class="text-xs font-extrabold uppercase tracking-[.08em]">Jenjang Anda</p>
            <p class="u-angka mt-2 !text-[3.4rem]">L{{ d.summary.final_level }}</p>
            <p class="u-display text-2xl font-extrabold">{{ d.summary.final_name }}</p>
          </template>
          <p v-else class="u-display text-xl font-extrabold">Hasil belum disahkan asesor</p>
        </section>

        <section v-if="d.oral" class="u-card mt-5 p-4 sm:p-5">
          <div class="flex flex-wrap items-baseline justify-between gap-2">
            <h2 class="u-display text-xl font-extrabold">Ujian lisan</h2>
            <p class="u-display text-2xl font-extrabold tabular-nums">{{ pct(d.oral.percent) }}</p>
          </div>
          <div class="mt-3 space-y-2">
            <div v-for="l in d.oral.lines" :key="l.level" class="flex items-center gap-3 rounded-lg border-2 border-[color:var(--ink)] p-2.5">
              <span class="u-level" :class="`l${l.level}`">L{{ l.level }}</span>
              <p class="flex-1 text-sm leading-snug">{{ l.question }}</p>
              <span class="u-chip" :class="l.passed ? 'u-chip-hijau' : 'u-chip-merah'">{{ l.passed ? 'Lulus' : 'Latih lagi' }}</span>
            </div>
          </div>
          <div v-if="d.oral.practice" class="mt-4 rounded-xl border-2 border-[color:var(--ink)] p-3 bg-[color:var(--grid-bg)] text-sm">
            <p class="font-extrabold">Yang perlu dilatih (soal L{{ d.oral.practice.level }})</p>
            <p v-if="d.oral.practice.aspects.length" class="mt-1">Aspek: {{ d.oral.practice.aspects.join(', ') }}</p>
            <ul v-if="d.oral.practice.missed.length" class="mt-1 list-disc pl-5"><li v-for="(m, i) in d.oral.practice.missed" :key="i">{{ m }}</li></ul>
          </div>
          <div v-if="d.oral.ai_summary?.kekuatan?.length" class="mt-4 grid sm:grid-cols-2 gap-3 text-sm">
            <div><p class="font-extrabold">Kekuatan</p><ul class="mt-1 list-disc pl-5"><li v-for="(t, i) in d.oral.ai_summary.kekuatan" :key="i">{{ t }}</li></ul></div>
            <div><p class="font-extrabold">Area pengembangan</p><ul class="mt-1 list-disc pl-5"><li v-for="(t, i) in d.oral.ai_summary.area_pengembangan" :key="i">{{ t }}</li></ul></div>
          </div>
        </section>
      </template>
    </div>
  </div>
</template>

<script setup>
import '@fontsource-variable/bricolage-grotesque'
import '../../styles/exam.css'
import '../../styles/asesmen.css'
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { ChevronLeftIcon } from '@heroicons/vue/24/outline'
import { competencyApi } from '../../services/competencyApi'
import { pct } from '../../utils/asesmen'

const route = useRoute()
const loading = ref(true)
const error = ref('')
const d = ref(null)
onMounted(async () => {
  try { d.value = await competencyApi.terpaduResult(Number(route.params.participantId)) } catch (e) { error.value = e.message } finally { loading.value = false }
})
</script>
