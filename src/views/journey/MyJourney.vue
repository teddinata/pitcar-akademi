<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-2xl mx-auto">
      <h1 class="text-2xl font-bold text-gray-900 mb-1">Journey Saya</h1>
      <p class="text-sm text-gray-500 mb-6">Program pembinaan dan pengembangan kompetensi Anda</p>

      <div v-if="loading" class="flex justify-center py-20">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>

      <div v-else-if="!journeys.length" class="text-center py-20">
        <svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
            d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
        </svg>
        <p class="text-gray-500 font-medium">Belum ada journey aktif</p>
        <p class="text-sm text-gray-400 mt-1">Hubungi HR untuk mendaftarkan program pembinaan</p>
      </div>

      <div v-else class="space-y-6">
        <div v-for="j in journeys" :key="j.id"
          class="bg-white rounded-2xl border overflow-hidden shadow-sm"
          :class="j.state === 'in_progress' ? 'border-blue-200' : 'border-gray-200'">

          <!-- Journey header -->
          <div class="px-6 py-4 border-b" :class="j.state === 'passed' ? 'bg-green-50' : j.state === 'failed' ? 'bg-red-50' : 'bg-gray-50'">
            <div class="flex items-start justify-between">
              <div>
                <span class="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium mb-2"
                  :class="stateClass(j.state)">{{ stateLabel(j.state) }}</span>
                <h2 class="font-bold text-gray-900">{{ j.template_name }}</h2>
                <p v-if="j.start_date" class="text-xs text-gray-400 mt-0.5">
                  Mulai {{ j.start_date }}<span v-if="j.target_end_date"> · Target {{ j.target_end_date }}</span>
                </p>
              </div>
              <div v-if="j.final_score > 0" class="text-right">
                <div class="text-2xl font-bold"
                  :class="j.state === 'passed' ? 'text-green-600' : j.state === 'failed' ? 'text-red-600' : 'text-gray-700'">
                  {{ j.final_score.toFixed(0) }}%
                </div>
                <div class="text-xs text-gray-400">nilai akhir</div>
              </div>
            </div>

            <!-- Recommendation banner -->
            <div v-if="j.recommendation && j.state !== 'in_progress'"
              class="mt-3 px-3 py-2 rounded-lg text-sm font-medium"
              :class="recBgClass(j.recommendation)">
              {{ recFullLabel(j.recommendation) }}
            </div>
          </div>

          <!-- Stages timeline -->
          <div class="px-6 py-4">
            <div v-if="!j.stages || !j.stages.length" class="text-sm text-gray-400 py-2">
              Journey belum dimulai
            </div>
            <div v-else class="space-y-3">
              <div v-for="(stage, idx) in sortedStages(j)" :key="stage.id"
                class="flex items-start gap-3">
                <!-- Step dot + line -->
                <div class="flex flex-col items-center">
                  <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                    :class="stageIconClass(stage.state)">
                    <svg v-if="stage.state === 'completed'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
                    </svg>
                    <div v-else-if="stage.state === 'in_progress'" class="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                    <span v-else class="text-gray-400">{{ idx + 1 }}</span>
                  </div>
                  <div v-if="idx < sortedStages(j).length - 1"
                    class="w-0.5 h-6 mt-1"
                    :class="stage.state === 'completed' ? 'bg-green-300' : 'bg-gray-200'">
                  </div>
                </div>

                <!-- Stage info -->
                <div class="flex-1 pb-3">
                  <div class="flex items-center justify-between">
                    <div>
                      <span class="font-medium text-sm text-gray-900">{{ stage.stage_name }}</span>
                      <span class="ml-2 text-xs px-1.5 py-0.5 rounded" :class="stagePillClass(stage.stage_type)">
                        {{ stageTypeLabel(stage.stage_type) }}
                      </span>
                    </div>
                    <div v-if="stage.score > 0" class="text-sm font-semibold"
                      :class="stage.passed ? 'text-green-600' : 'text-red-600'">
                      {{ stage.score.toFixed(0) }}%
                    </div>
                  </div>
                  <div class="text-xs text-gray-400 mt-0.5">
                    Bobot {{ stage.weight }}% · Lulus ≥ {{ stage.passing_score }}%
                  </div>

                  <!-- Progress bar for in_progress -->
                  <div v-if="stage.state === 'in_progress'" class="mt-2">
                    <div class="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div class="h-full bg-blue-500 rounded-full animate-pulse" style="width: 50%"></div>
                    </div>
                    <p class="text-xs text-blue-600 mt-1">Sedang berlangsung...</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { journeyApi } from '@/services/journeyApi'

const journeys = ref([])
const loading = ref(true)

async function load() {
  loading.value = true
  try {
    const res = await journeyApi.myJourney()
    journeys.value = res.journeys || []
  } finally {
    loading.value = false
  }
}

function sortedStages(j) {
  return (j.stages || []).slice().sort((a, b) => a.sequence - b.sequence)
}

function stateLabel(s) {
  return { draft: 'Draft', in_progress: 'Sedang Berjalan', completed: 'Selesai', passed: 'Lulus ✓', failed: 'Tidak Lulus', cancelled: 'Dibatalkan' }[s] || s
}
function stateClass(s) {
  return {
    draft: 'bg-gray-100 text-gray-600',
    in_progress: 'bg-blue-100 text-blue-700',
    passed: 'bg-green-100 text-green-700',
    failed: 'bg-red-100 text-red-700',
    cancelled: 'bg-gray-100 text-gray-400',
  }[s] || 'bg-gray-100 text-gray-600'
}
function recFullLabel(r) {
  return {
    promote: '🎉 Selamat! Anda dinyatakan siap untuk promosi / penugasan penuh.',
    extend_training: '⏳ Disarankan untuk memperpanjang periode training.',
    remedial: '📚 Diperlukan program remedial sebelum evaluasi ulang.',
  }[r] || r
}
function recBgClass(r) {
  return { promote: 'bg-green-100 text-green-800', extend_training: 'bg-yellow-100 text-yellow-800', remedial: 'bg-red-100 text-red-800' }[r] || ''
}
function stageIconClass(s) {
  return {
    completed: 'bg-green-100 text-green-600 border-2 border-green-400',
    in_progress: 'bg-blue-100 border-2 border-blue-400',
    pending: 'bg-gray-100 border-2 border-gray-300',
    skipped: 'bg-gray-50 border-2 border-gray-200',
  }[s] || 'bg-gray-100 border-2 border-gray-200'
}
function stagePillClass(t) {
  return {
    orientation: 'bg-purple-100 text-purple-600',
    lms_course: 'bg-blue-100 text-blue-600',
    sop_quiz: 'bg-orange-100 text-orange-600',
    practical: 'bg-teal-100 text-teal-600',
    final: 'bg-gray-100 text-gray-600',
  }[t] || 'bg-gray-100 text-gray-500'
}
function stageTypeLabel(t) {
  return { orientation: 'Orientasi', lms_course: 'Teori', sop_quiz: 'Kuis SOP', practical: 'Praktek', final: 'Penilaian Akhir' }[t] || t
}

onMounted(load)
</script>
