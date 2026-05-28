<template>
  <div class="min-h-screen bg-gray-50 p-4 pb-10">
    <div class="max-w-xl mx-auto">

      <!-- Back -->
      <button @click="$router.back()"
        class="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-5 transition-colors">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
        </svg>
        Kembali ke Detail Journey
      </button>

      <!-- Loading -->
      <div v-if="loading" class="flex justify-center py-20">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-yellow-500"></div>
      </div>

      <template v-else-if="journey">

        <!-- ── HEADER ── -->
        <div class="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-4">
          <div class="bg-gradient-to-r from-yellow-500 to-amber-500 px-6 py-5 text-white">
            <div class="flex items-center gap-2.5">
              <div class="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center text-xl">🏆</div>
              <div>
                <h1 class="text-lg font-bold leading-tight">Penilaian Akhir Journey</h1>
                <p class="text-yellow-100 text-sm mt-0.5">
                  {{ journey.employee_name }} · {{ journey.template_name }}
                </p>
              </div>
            </div>
          </div>

          <div class="px-6 py-4 bg-yellow-50 border-b border-yellow-100">
            <p class="text-sm text-yellow-800">
              Tinjau rekap nilai semua tahap training di bawah ini sebelum mengkonfirmasi selesai.
              Nilai akhir dihitung otomatis berdasarkan bobot masing-masing tahap.
            </p>
          </div>
        </div>

        <!-- ── SCORECARD ── -->
        <div class="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-4">
          <div class="px-5 py-4 border-b border-gray-100">
            <h2 class="text-sm font-bold text-gray-700 uppercase tracking-wider">Rekap Nilai Per Tahap</h2>
          </div>

          <div class="divide-y divide-gray-50">
            <div v-for="s in nonFinalStages" :key="s.id"
              class="flex items-center gap-3 px-5 py-3.5">

              <!-- Type icon -->
              <div class="w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0"
                :class="stageIconBg(s.stage_type)">
                {{ stageIcon(s.stage_type) }}
              </div>

              <!-- Name + status -->
              <div class="flex-1 min-w-0">
                <p class="text-sm font-semibold text-gray-800 truncate">{{ s.stage_name }}</p>
                <div class="flex items-center gap-1.5 mt-0.5">
                  <span class="text-[10px] px-1.5 py-0.5 rounded font-medium" :class="stageStatePillClass(s.state)">
                    {{ stageStateLabel(s.state) }}
                  </span>
                  <span v-if="s.weight > 0" class="text-[10px] text-gray-400">Bobot {{ s.weight }}%</span>
                </div>
              </div>

              <!-- Score -->
              <div class="shrink-0 text-right">
                <div v-if="s.state === 'completed'" class="text-sm font-bold"
                  :class="s.passed ? 'text-green-600' : 'text-red-500'">
                  {{ s.score > 0 ? s.score.toFixed(1) + '%' : '—' }}
                  <span v-if="s.passed" class="text-green-500">✓</span>
                  <span v-else-if="s.score > 0" class="text-red-400">✗</span>
                </div>
                <div v-else class="text-sm text-gray-400 font-medium">—</div>
                <p v-if="s.passing_score > 0" class="text-[10px] text-gray-400 mt-0.5">
                  min. {{ s.passing_score }}%
                </p>
              </div>
            </div>
          </div>

          <!-- Divider + summary row -->
          <div class="px-5 py-3 bg-gray-50 border-t border-gray-200">
            <div class="flex items-center justify-between">
              <span class="text-xs text-gray-500">
                {{ completedCount }}/{{ nonFinalStages.length }} tahap selesai
              </span>
              <span class="text-xs text-gray-500">
                Bobot terhitung: {{ weightedBasis.toFixed(0) }}%
              </span>
            </div>
          </div>
        </div>

        <!-- ── PROJECTED FINAL SCORE ── -->
        <div class="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-4">
          <div class="p-5">
            <div class="flex items-center justify-between mb-3">
              <div>
                <h2 class="text-sm font-bold text-gray-800">Proyeksi Nilai Akhir</h2>
                <p class="text-xs text-gray-500 mt-0.5">Rata-rata tertimbang dari semua tahap yang selesai</p>
              </div>
              <div class="text-right">
                <span class="text-4xl font-extrabold leading-none"
                  :class="projectedScore >= 70 ? 'text-green-600' : 'text-red-500'">
                  {{ projectedScore.toFixed(0) }}
                </span>
                <span class="text-lg font-bold text-gray-400">%</span>
              </div>
            </div>

            <!-- Progress bar -->
            <div class="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
              <div class="h-3 rounded-full transition-all duration-700"
                :class="projectedScore >= 70 ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 'bg-gradient-to-r from-red-400 to-red-500'"
                :style="`width: ${Math.min(projectedScore, 100)}%`">
              </div>
            </div>
            <div class="flex justify-between text-[10px] text-gray-400 mt-1">
              <span>0%</span>
              <span class="font-medium text-gray-500">Batas Lulus 70%</span>
              <span>100%</span>
            </div>

            <!-- Recommendation badge -->
            <div class="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
              <span class="text-sm text-gray-600 font-medium">Rekomendasi:</span>
              <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold"
                :class="recClass(projectedScore)">
                {{ recEmoji(projectedScore) }} {{ recLabel(projectedScore) }}
              </span>
            </div>
          </div>
        </div>

        <!-- ── ADMIN NOTES ── -->
        <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 mb-5">
          <label class="block text-sm font-bold text-gray-700 mb-2">
            Catatan Keputusan
            <span class="text-gray-400 font-normal text-xs ml-1">(opsional)</span>
          </label>
          <textarea v-model="notes" rows="4"
            class="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent resize-none"
            placeholder="Keputusan akhir, hal yang perlu ditindaklanjuti, catatan untuk karyawan...">
          </textarea>
        </div>

        <!-- ── ACTION BUTTONS ── -->
        <div class="flex gap-3">
          <button @click="$router.back()"
            class="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-semibold transition-colors">
            Kembali
          </button>
          <button @click="submit" :disabled="submitting"
            class="flex-1 px-4 py-3 text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-50 shadow-sm flex items-center justify-center gap-2"
            :class="projectedScore >= 70 ? 'bg-green-600 hover:bg-green-700' : 'bg-orange-500 hover:bg-orange-600'">
            <div v-if="submitting" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <template v-else>
              <span>{{ projectedScore >= 70 ? '🏆' : '📋' }}</span>
              <span>{{ submitting ? 'Menyimpan...' : 'Selesaikan Journey' }}</span>
            </template>
          </button>
        </div>

      </template>

      <div v-else class="text-center py-20 text-gray-400">Journey tidak ditemukan</div>

    </div>

    <!-- ── RESULT OVERLAY ── -->
    <transition name="fade">
      <div v-if="result" class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" @click.self="goToDetail">
        <div class="bg-white rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl">
          <!-- Result header -->
          <div class="py-8 px-6 text-center"
            :class="result.state === 'passed' ? 'bg-gradient-to-b from-green-500 to-green-600' : 'bg-gradient-to-b from-orange-400 to-orange-500'">
            <div class="text-5xl mb-3">{{ result.state === 'passed' ? '🎉' : '📋' }}</div>
            <h2 class="text-xl font-extrabold text-white">
              {{ result.state === 'passed' ? 'Lulus!' : 'Selesai' }}
            </h2>
            <p class="text-white/80 text-sm mt-1">Journey training telah dikonfirmasi</p>
          </div>

          <!-- Score display -->
          <div class="px-6 py-5">
            <div class="flex items-center justify-between mb-3">
              <span class="text-sm text-gray-600 font-medium">Nilai Akhir</span>
              <span class="text-3xl font-extrabold"
                :class="result.state === 'passed' ? 'text-green-600' : 'text-orange-500'">
                {{ result.final_score?.toFixed(1) }}%
              </span>
            </div>

            <div v-if="result.recommendation" class="flex items-center gap-2 py-3 border-t border-gray-100">
              <span class="text-sm text-gray-500">Rekomendasi:</span>
              <span class="px-2.5 py-1 rounded-full text-sm font-semibold"
                :class="recClassFromKey(result.recommendation)">
                {{ recEmojiFromKey(result.recommendation) }} {{ recLabelFromKey(result.recommendation) }}
              </span>
            </div>

            <div v-if="result.certificate_number" class="flex items-center gap-2 py-3 border-t border-gray-100">
              <svg class="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
              <span class="text-sm text-gray-600 font-mono">{{ result.certificate_number }}</span>
            </div>
          </div>

          <div class="px-6 pb-6">
            <button @click="goToDetail"
              class="w-full py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-sm font-semibold transition-colors">
              Lihat Hasil Lengkap
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { journeyApi } from '@/services/journeyApi'

const route = useRoute()
const router = useRouter()

const journey = ref(null)
const loading = ref(true)
const submitting = ref(false)
const notes = ref('')
const result = ref(null)

const nonFinalStages = computed(() =>
  (journey.value?.stages || [])
    .filter(s => s.stage_type !== 'final')
    .sort((a, b) => a.sequence - b.sequence)
)

const finalStage = computed(() =>
  (journey.value?.stages || []).find(s => s.stage_type === 'final') || null
)

const completedCount = computed(() =>
  nonFinalStages.value.filter(s => s.state === 'completed').length
)

// Total weight of non-final stages that are completed
const weightedBasis = computed(() => {
  return nonFinalStages.value
    .filter(s => s.state === 'completed' && s.weight > 0)
    .reduce((sum, s) => sum + s.weight, 0)
})

// Projected score: weighted average of completed non-final stages
const projectedScore = computed(() => {
  if (journey.value?.final_score > 0) return journey.value.final_score
  const stages = nonFinalStages.value.filter(s => s.state === 'completed' && s.weight > 0)
  if (!stages.length) return 0
  const totalWeight = stages.reduce((s, x) => s + x.weight, 0)
  const weightedSum = stages.reduce((s, x) => s + (x.score || 0) * x.weight, 0)
  return totalWeight > 0 ? weightedSum / totalWeight : 0
})

async function load() {
  loading.value = true
  try {
    journey.value = await journeyApi.detail(route.params.id)
  } finally {
    loading.value = false
  }
}

async function submit() {
  submitting.value = true
  try {
    // 1. Mark final stage as completed (with projected score)
    if (finalStage.value && finalStage.value.state !== 'completed') {
      await journeyApi.stageUpdateState(route.params.id, finalStage.value.id, {
        state: 'completed',
        score: Math.round(projectedScore.value * 10) / 10,
        notes: notes.value || undefined,
      })
    }
    // 2. Complete the journey → computes final_score + recommendation
    const completed = await journeyApi.complete(route.params.id, {
      notes: notes.value || undefined,
    })
    result.value = completed
  } catch (e) {
    alert(e.message || 'Gagal menyelesaikan journey')
  } finally {
    submitting.value = false
  }
}

function goToDetail() {
  router.replace(`/dashboard/journey/${route.params.id}`)
}

// ── Style helpers ────────────────────────────────────────────────

function recLabel(score) {
  if (score >= 70) return 'Siap Promosi / Lanjut'
  if (score >= 55) return 'Perpanjang Training'
  return 'Perlu Remedial'
}
function recEmoji(score) {
  if (score >= 70) return '🎉'
  if (score >= 55) return '⏳'
  return '📚'
}
function recClass(score) {
  if (score >= 70) return 'bg-green-100 text-green-700'
  if (score >= 55) return 'bg-yellow-100 text-yellow-700'
  return 'bg-red-100 text-red-700'
}

const REC_MAP = {
  promote:        { label: 'Siap Promosi / Lanjut', emoji: '🎉', cls: 'bg-green-100 text-green-700' },
  extend_training:{ label: 'Perpanjang Training',  emoji: '⏳', cls: 'bg-yellow-100 text-yellow-700' },
  remedial:       { label: 'Perlu Remedial',        emoji: '📚', cls: 'bg-red-100 text-red-700' },
}
function recLabelFromKey(k)  { return REC_MAP[k]?.label || k }
function recEmojiFromKey(k)  { return REC_MAP[k]?.emoji || '' }
function recClassFromKey(k)  { return REC_MAP[k]?.cls || 'bg-gray-100 text-gray-600' }

function stageIcon(t) {
  return { orientation: '🎯', lms_course: '📚', sop_quiz: '📝', practical: '🔧', final: '🏆' }[t] || '⚙️'
}
function stageIconBg(t) {
  return {
    orientation: 'bg-purple-100',
    lms_course:  'bg-blue-100',
    sop_quiz:    'bg-orange-100',
    practical:   'bg-teal-100',
    final:       'bg-yellow-100',
  }[t] || 'bg-gray-100'
}
function stageStateLabel(s) {
  return { pending: 'Belum Mulai', in_progress: 'Sedang Berjalan', completed: 'Selesai', skipped: 'Dilewati' }[s] || s
}
function stageStatePillClass(s) {
  return {
    pending:     'bg-gray-100 text-gray-500',
    in_progress: 'bg-blue-100 text-blue-600',
    completed:   'bg-green-100 text-green-700',
    skipped:     'bg-gray-100 text-gray-400',
  }[s] || 'bg-gray-100 text-gray-500'
}

onMounted(load)
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.25s ease; }
.fade-enter-from, .fade-leave-to       { opacity: 0; }
</style>
