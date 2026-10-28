<!-- Hasil asesmen kompetensi untuk peserta (setelah periode ditutup): level per
     pilar dengan arti rubriknya, kekuatan, area pengembangan, dan kursus saran. -->
<template>
  <div class="min-h-screen clay-surface p-4 md:p-6">
    <div class="flex items-start gap-3 mb-5">
      <router-link to="/dashboard/lms/my-competency" class="mt-1 p-1.5 rounded-lg text-gray-500 hover:bg-white/70 hover:text-gray-800" title="Kembali">
        <ChevronLeftIcon class="w-5 h-5" />
      </router-link>
      <div>
        <p class="text-xs font-semibold text-gray-500">Hasil asesmen kompetensi</p>
        <h1 class="text-xl md:text-2xl font-bold text-gray-900">{{ data?.cycle.name || 'Memuat…' }}</h1>
      </div>
    </div>

    <div v-if="loading" class="h-64 rounded-2xl bg-white/70 animate-pulse"></div>
    <div v-else-if="error" class="clay-card p-6 text-center"><p class="text-red-600 font-medium">{{ error }}</p></div>

    <div v-else-if="data" class="max-w-3xl space-y-4">
      <div class="clay-card p-4 sm:p-5 flex flex-wrap items-center gap-4">
        <span v-if="data.overall" class="grid place-items-center w-14 h-14 rounded-2xl text-xl font-bold ring-1 shrink-0" :class="LEVEL_STYLE[data.overall.level].cell">L{{ data.overall.level }}</span>
        <div class="min-w-0 flex-1">
          <p class="text-xs font-semibold text-gray-500">Jenjang {{ data.cycle.profile.name }}</p>
          <p class="text-lg font-bold text-gray-900">{{ data.overall ? data.overall.name : 'Belum bisa ditentukan' }}</p>
          <p class="text-xs text-gray-500 mt-0.5">
            {{ data.overall && data.overall.level < 4
              ? `Untuk naik ke L${data.overall.level + 1} (${levelName(data.overall.level + 1, data.cycle.profile.level_names)}), kuatkan pilar dengan level terendah di bawah.`
              : data.overall ? 'Jenjang tertinggi. Pertahankan dan bimbing rekan lain.' : 'Sebagian pilar belum punya cukup penilaian.' }}
          </p>
        </div>
      </div>
      <div v-for="p in data.pillars" :key="p.id" class="clay-card p-4 sm:p-5 flex gap-4">
        <div class="w-20 shrink-0"><LevelCell :result="data.results[p.id]?.band ? data.results[p.id] : null" /></div>
        <div class="min-w-0">
          <h2 class="font-bold text-gray-900">{{ p.name }}</h2>
          <p class="text-sm text-gray-700 mt-1 leading-relaxed">{{ band(p) ? p.rubric[band(p)] : 'Belum cukup data untuk pilar ini.' }}</p>
          <p v-if="band(p) && band(p) < 4" class="text-xs text-gray-500 mt-2"><b>Langkah ke L{{ band(p) + 1 }}:</b> {{ p.rubric[band(p) + 1] }}</p>
          <p v-if="band(p) && band(p) <= 2 && p.courses.length" class="text-xs text-indigo-800 mt-2"><b>Kursus disarankan:</b> {{ p.courses.map((c) => c.name).join(', ') }}</p>
        </div>
      </div>
      <div v-if="data.strengths.length || data.development.length" class="clay-card p-4 sm:p-5 grid sm:grid-cols-2 gap-4">
        <div>
          <p class="text-sm font-bold text-green-800">Kekuatan Anda</p>
          <ul class="mt-1 list-disc pl-5 text-sm text-gray-700 space-y-0.5"><li v-for="(k, i) in data.strengths" :key="i">{{ k }}</li></ul>
        </div>
        <div>
          <p class="text-sm font-bold text-amber-800">Yang perlu dikembangkan</p>
          <ul class="mt-1 list-disc pl-5 text-sm text-gray-700 space-y-0.5"><li v-for="(k, i) in data.development" :key="i">{{ k }}</li></ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { ChevronLeftIcon } from '@heroicons/vue/24/outline'
import { competencyApi } from '../../services/competencyApi'
import LevelCell from '../../components/competency/LevelCell.vue'
import { LEVEL_STYLE, levelName } from '../../utils/competency'

const route = useRoute()
const loading = ref(true)
const error = ref('')
const data = ref(null)
const band = (p) => data.value?.results[p.id]?.band || null

onMounted(async () => {
  try {
    data.value = await competencyApi.myResult(Number(route.params.participantId))
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
})
</script>
