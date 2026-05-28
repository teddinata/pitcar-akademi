<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-xl mx-auto">
      <!-- Back -->
      <button @click="$router.back()" class="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-5">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
        </svg>
        Kembali ke Detail Journey
      </button>

      <div class="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <!-- Header -->
        <div class="bg-teal-600 px-6 py-5 text-white">
          <h1 class="text-xl font-bold">Penilaian Praktek</h1>
          <p v-if="journey" class="text-teal-100 text-sm mt-1">
            {{ journey.employee_name }} · {{ journey.template_name }}
          </p>
        </div>

        <div class="p-6">
          <!-- Stage selector (if multiple practical stages) -->
          <div v-if="practicalStages.length > 1" class="mb-5">
            <label class="form-label">Pilih Tahapan Praktek</label>
            <select v-model="selectedStageId" class="form-input">
              <option value="">Pilih tahapan...</option>
              <option v-for="s in practicalStages" :key="s.id" :value="s.id">
                {{ s.stage_name }}
              </option>
            </select>
          </div>

          <!-- Criteria form -->
          <div v-if="criteria.length || loadingStage">
            <div v-if="loadingStage" class="flex justify-center py-8">
              <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600"></div>
            </div>

            <div v-else>
              <div class="mb-4">
                <label class="form-label">Tanggal Penilaian</label>
                <input v-model="form.assessment_date" type="date" class="form-input"/>
              </div>

              <div class="mb-5">
                <h3 class="form-label mb-3">Kriteria Penilaian</h3>
                <p class="text-xs text-gray-400 mb-3">1 = Sangat Kurang · 2 = Kurang · 3 = Cukup · 4 = Baik · 5 = Sangat Baik</p>

                <div v-for="(c, idx) in form.criteria_scores" :key="idx"
                  class="mb-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-sm font-medium text-gray-800">{{ c.criteria_name }}</span>
                    <span class="text-sm font-bold px-2 py-0.5 rounded"
                      :class="scoreColor(c.score)">{{ c.score }}/5</span>
                  </div>

                  <!-- Star-like number buttons -->
                  <div class="flex gap-2">
                    <button v-for="n in 5" :key="n" type="button"
                      @click="c.score = n"
                      class="flex-1 py-2 rounded-lg text-sm font-semibold transition-all"
                      :class="c.score === n
                        ? (n >= 4 ? 'bg-green-500 text-white' : n === 3 ? 'bg-yellow-400 text-white' : 'bg-red-400 text-white')
                        : 'bg-gray-200 text-gray-500 hover:bg-gray-300'">
                      {{ n }}
                    </button>
                  </div>

                  <input v-model="c.notes" type="text" class="form-input mt-2 text-xs" placeholder="Catatan (opsional)"/>
                </div>
              </div>

              <div class="mb-5">
                <label class="form-label">Catatan Umum</label>
                <textarea v-model="form.overall_notes" rows="3" class="form-input"
                  placeholder="Kesan umum, hal yang perlu ditingkatkan..."></textarea>
              </div>

              <!-- Score preview -->
              <div class="bg-teal-50 border border-teal-200 rounded-xl p-4 mb-5">
                <div class="flex items-center justify-between">
                  <span class="text-sm font-medium text-teal-700">Estimasi Nilai</span>
                  <span class="text-2xl font-bold" :class="previewScore >= 70 ? 'text-green-600' : 'text-red-600'">
                    {{ previewScore.toFixed(0) }}%
                  </span>
                </div>
                <div class="w-full bg-teal-100 rounded-full h-2 mt-2">
                  <div class="h-2 rounded-full transition-all"
                    :class="previewScore >= 70 ? 'bg-green-500' : 'bg-red-400'"
                    :style="`width: ${Math.min(previewScore, 100)}%`">
                  </div>
                </div>
                <p class="text-xs text-teal-600 mt-1">Rata-rata skor kriteria (skala 1–5 → 0–100%)</p>
              </div>
            </div>
          </div>

          <div v-else-if="!loadingJourney && journey" class="text-center py-8 text-gray-400">
            <p>Tidak ada kriteria penilaian untuk tahap ini.</p>
            <p class="text-xs mt-1">Pastikan template journey memiliki kriteria praktik yang didefinisikan.</p>
          </div>

          <div v-if="loading" class="flex justify-center py-8">
            <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600"></div>
          </div>
        </div>

        <div class="flex justify-end gap-3 px-6 py-4 border-t">
          <button @click="$router.back()" class="btn-secondary">Batal</button>
          <button @click="submit" :disabled="submitting || !criteria.length || !form.assessment_date"
            class="btn-teal min-w-[120px]">
            <span v-if="submitting" class="flex items-center gap-2 justify-center">
              <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Menyimpan...
            </span>
            <span v-else>Simpan Penilaian</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { journeyApi } from '@/services/journeyApi'

const route = useRoute()
const router = useRouter()

const journey = ref(null)
const loading = ref(true)
const loadingJourney = ref(true)
const loadingStage = ref(false)
const submitting = ref(false)
const selectedStageId = ref('')

const form = ref({
  assessment_date: new Date().toISOString().split('T')[0],
  overall_notes: '',
  criteria_scores: [],
})

const practicalStages = computed(() =>
  (journey.value?.stages || []).filter(s => s.stage_type === 'practical')
)

const criteria = computed(() => form.value.criteria_scores)

const previewScore = computed(() => {
  const scores = form.value.criteria_scores.map(c => c.score || 1)
  if (!scores.length) return 0
  return (scores.reduce((a, b) => a + b, 0) / scores.length / 5) * 100
})

// Watch only needed for multi-stage journeys — loads criteria for the newly selected stage
watch(selectedStageId, async (id) => {
  if (!id || !templateStages.value.length) return
  loadingStage.value = true
  try {
    const tmplStage = templateStages.value.find(s => s.stage_type === 'practical')
    if (tmplStage) {
      form.value.criteria_scores = buildCriteriaScores(tmplStage.practical_criteria)
    }
  } finally {
    loadingStage.value = false
  }
})

const templateStages = ref([])

function buildCriteriaScores(criteriaNames) {
  return (criteriaNames || []).map(name => ({ criteria_name: name, score: 3, notes: '' }))
}

async function load() {
  loadingJourney.value = true
  try {
    // Fetch journey and template in parallel
    const [journeyData, tmpl] = await Promise.all([
      journeyApi.detail(route.params.id),
      null, // placeholder, resolved after journey loaded
    ])
    journey.value = journeyData

    const tmplDetail = await journeyApi.templateDetail(journey.value.template_id)
    templateStages.value = tmplDetail.stages || []

    // Auto-select single practical stage
    const practical = practicalStages.value
    if (practical.length === 1) {
      selectedStageId.value = practical[0].id
    }

    // Load criteria from template
    const practicalTmplStage = templateStages.value.find(s => s.stage_type === 'practical')
    if (practicalTmplStage) {
      form.value.criteria_scores = buildCriteriaScores(practicalTmplStage.practical_criteria)
    }
  } finally {
    loadingJourney.value = false
    loading.value = false
  }
}

async function submit() {
  if (!form.value.criteria_scores.length) return
  submitting.value = true
  try {
    const payload = {
      stage_progress_id: selectedStageId.value || null,
      assessment_date: form.value.assessment_date,
      overall_notes: form.value.overall_notes,
      criteria_scores: form.value.criteria_scores,
    }
    await journeyApi.practicalAssess(route.params.id, payload)
    router.push(`/dashboard/journey/${route.params.id}`)
  } catch (e) {
    alert(e.message)
  } finally {
    submitting.value = false
  }
}

function scoreColor(n) {
  if (n >= 4) return 'bg-green-100 text-green-700'
  if (n === 3) return 'bg-yellow-100 text-yellow-700'
  return 'bg-red-100 text-red-700'
}

onMounted(load)
</script>

<style scoped>
.form-label { @apply block text-sm font-medium text-gray-700 mb-1; }
.form-input { @apply w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent; }
.btn-secondary { @apply px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors; }
.btn-teal { @apply px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50; }
</style>
