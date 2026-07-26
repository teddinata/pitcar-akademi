<template>
  <div class="min-h-screen clay-surface p-4 sm:p-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-xl sm:text-2xl font-bold text-gray-900">Penilaian Esai</h1>
        <p class="text-sm text-gray-500 mt-0.5">
          {{ gradingSession ? 'Nilai jawaban esai karyawan' : 'Daftar sesi yang menunggu penilaian' }}
        </p>
      </div>
      <button v-if="gradingSession" @click="gradingSession = null"
        class="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
        </svg>
        Kembali ke daftar
      </button>
    </div>

    <!-- ── LIST VIEW ──────────────────────────────────────────────────── -->
    <template v-if="!gradingSession">
      <div v-if="loading" class="flex justify-center py-16">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>

      <div v-else-if="!sessions.length"
           class="text-center py-16 bg-white rounded-2xl border border-gray-200">
        <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-green-50 flex items-center justify-center">
          <svg class="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
          </svg>
        </div>
        <p class="font-semibold text-gray-700">Semua esai sudah dinilai!</p>
        <p class="text-sm text-gray-400 mt-1">Tidak ada sesi yang menunggu penilaian.</p>
      </div>

      <div v-else class="space-y-3">
        <!-- Stats bar -->
        <div class="bg-purple-50 border border-purple-200 rounded-xl px-4 py-3 flex items-center gap-3">
          <span class="text-purple-500 text-2xl">✍️</span>
          <div>
            <p class="text-sm font-semibold text-purple-800">{{ sessions.length }} sesi menunggu penilaian</p>
            <p class="text-xs text-purple-600">Klik pada sesi untuk mulai menilai jawaban esai</p>
          </div>
        </div>

        <div v-for="s in sessions" :key="s.session_id"
             @click="openGrading(s)"
             class="bg-white rounded-2xl border border-gray-200 p-4 cursor-pointer hover:border-purple-300 hover:shadow-sm transition-all group">
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-center gap-3 min-w-0">
              <!-- Avatar -->
              <div class="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                   :style="`background: hsl(${s.employee.id * 47 % 360}, 55%, 55%)`">
                {{ s.employee.name.charAt(0).toUpperCase() }}
              </div>
              <div class="min-w-0">
                <p class="font-semibold text-gray-900 truncate">{{ s.employee.name }}</p>
                <p class="text-xs text-gray-400 truncate">{{ s.employee.job || '—' }}</p>
              </div>
            </div>

            <!-- Essay count badge -->
            <div class="flex items-center gap-2 shrink-0">
              <span class="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700">
                {{ s.ungraded_essay_count }} esai
              </span>
              <svg class="w-4 h-4 text-gray-300 group-hover:text-purple-400 transition-colors"
                   fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </div>
          </div>

          <div class="mt-3 pt-3 border-t border-gray-100 flex flex-wrap gap-3 text-xs text-gray-500">
            <span class="flex items-center gap-1">
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
              {{ s.quiz.name }}
            </span>
            <span class="flex items-center gap-1">
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              Submit: {{ formatDate(s.submitted_at) }}
            </span>
            <span class="flex items-center gap-1 font-medium text-gray-700">
              Skor MC saat ini: {{ s.mc_score.toFixed(1) }}%
            </span>
          </div>
        </div>
      </div>
    </template>

    <!-- ── GRADING VIEW ───────────────────────────────────────────────── -->
    <template v-else>
      <!-- Employee info card -->
      <div class="bg-white rounded-2xl border border-gray-200 p-4 mb-5 flex items-center gap-4">
        <div class="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shrink-0"
             :style="`background: hsl(${gradingSession.employee.id * 47 % 360}, 55%, 55%)`">
          {{ gradingSession.employee.name.charAt(0).toUpperCase() }}
        </div>
        <div class="flex-1 min-w-0">
          <p class="font-bold text-gray-900">{{ gradingSession.employee.name }}</p>
          <p class="text-xs text-gray-500">{{ gradingSession.quiz.name }} · Submit {{ formatDate(gradingSession.submitted_at) }}</p>
        </div>
        <div class="text-right shrink-0">
          <p class="text-xs text-gray-400">Skor MC</p>
          <p class="font-bold text-gray-800 text-lg">{{ gradingSession.mc_score.toFixed(1) }}%</p>
        </div>
      </div>

      <!-- Grading instructions -->
      <div class="bg-purple-50 border border-purple-200 rounded-xl px-4 py-3 mb-5 text-sm text-purple-800 flex items-start gap-2">
        <span class="text-purple-400 shrink-0 mt-0.5">ℹ️</span>
        <span>Berikan nilai <strong>0–100</strong> untuk setiap jawaban esai. Nilai akan dikombinasikan dengan skor pilihan ganda sesuai bobot soal.</span>
      </div>

      <!-- Essay questions -->
      <div class="space-y-4 mb-6">
        <div v-for="(essay, idx) in gradingSession.essays" :key="essay.answer_id"
             class="bg-white rounded-2xl border overflow-hidden transition-all"
             :class="gradings[essay.answer_id] !== undefined ? 'border-purple-300' : 'border-gray-200'">
          <!-- Question header -->
          <div class="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="w-6 h-6 rounded-full bg-purple-100 text-purple-700 text-xs font-bold flex items-center justify-center shrink-0">
                {{ idx + 1 }}
              </span>
              <span v-if="essay.sop_section" class="text-xs text-gray-400">{{ essay.sop_section }}</span>
            </div>
            <span class="text-xs text-gray-400">Bobot: {{ essay.weight }} poin</span>
          </div>

          <div class="p-4 space-y-4">
            <!-- Question text -->
            <p class="text-sm font-medium text-gray-900 leading-relaxed">{{ essay.question_text }}</p>

            <!-- Employee's answer -->
            <div class="rounded-xl bg-gray-50 border border-gray-200 p-3">
              <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Jawaban Karyawan</p>
              <p class="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {{ essay.essay_answer || '(tidak menjawab)' }}
              </p>
            </div>

            <!-- Score input -->
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-2">
                Nilai Esai
                <span class="text-gray-400 font-normal ml-1">(0 = kosong / tidak relevan, 100 = sempurna)</span>
              </label>
              <div class="flex items-center gap-3">
                <!-- Quick score buttons -->
                <div class="flex gap-1.5 flex-wrap">
                  <button v-for="preset in [0, 50, 60, 70, 80, 90, 100]" :key="preset"
                    @click="setScore(essay.answer_id, preset)"
                    class="px-2.5 py-1.5 rounded-lg text-xs font-bold border-2 transition-all"
                    :class="gradings[essay.answer_id] === preset
                      ? 'border-purple-500 bg-purple-500 text-white'
                      : 'border-gray-200 text-gray-500 hover:border-purple-300 hover:text-purple-600'">
                    {{ preset }}
                  </button>
                </div>
                <!-- Manual input -->
                <input
                  :value="gradings[essay.answer_id] ?? ''"
                  @input="setScore(essay.answer_id, Number($event.target.value))"
                  type="number" min="0" max="100"
                  placeholder="0–100"
                  class="w-20 text-center px-3 py-1.5 text-sm border-2 rounded-xl focus:outline-none transition-colors"
                  :class="gradings[essay.answer_id] !== undefined
                    ? 'border-purple-400 bg-purple-50 text-purple-800 font-bold'
                    : 'border-gray-200 focus:border-purple-400'"
                />
              </div>

              <!-- Score preview -->
              <p v-if="gradings[essay.answer_id] !== undefined" class="text-xs text-purple-600 mt-1.5">
                Poin didapat: {{ Math.round(essay.weight * gradings[essay.answer_id] / 100) }} / {{ essay.weight }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Submit error -->
      <div v-if="submitError" class="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
        {{ submitError }}
      </div>

      <!-- Submit button -->
      <div class="sticky bottom-4">
        <button
          @click="submitGradings"
          :disabled="!allGraded || submitting"
          class="w-full py-4 rounded-2xl font-bold text-sm transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
          :class="allGraded && !submitting
            ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'">
          <svg v-if="submitting" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          <span v-if="submitting">Menyimpan penilaian...</span>
          <span v-else-if="!allGraded">
            Nilai {{ ungradedCount }} soal esai lagi
          </span>
          <span v-else>Simpan Penilaian</span>
        </button>
        <p v-if="!allGraded" class="text-center text-xs text-gray-400 mt-2">
          Semua soal esai harus dinilai sebelum bisa disimpan
        </p>
      </div>
    </template>

    <!-- Success overlay -->
    <Teleport to="body">
      <div v-if="showSuccess" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl w-full max-w-sm p-6 text-center shadow-2xl">
          <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
            <svg class="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
            </svg>
          </div>
          <h3 class="text-lg font-bold text-gray-900">Penilaian Tersimpan!</h3>
          <p class="text-sm text-gray-600 mt-2">
            Score final <strong>{{ lastResult?.session?.score?.toFixed(1) }}%</strong> —
            <span :class="lastResult?.session?.is_passed ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'">
              {{ lastResult?.session?.is_passed ? 'LULUS' : 'TIDAK LULUS' }}
            </span>
          </p>
          <p class="text-xs text-gray-400 mt-1">untuk {{ gradedEmployeeName }}</p>
          <button @click="afterSuccess"
            class="mt-4 w-full py-3 rounded-xl bg-purple-600 text-white font-bold text-sm hover:bg-purple-700 transition-colors">
            OK, Lanjut ke Daftar
          </button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { quizApi } from '@/services/quizApi'

const loading = ref(true)
const sessions = ref([])
const gradingSession = ref(null)
const gradings = ref({})   // answerId → score (0-100)
const submitting = ref(false)
const submitError = ref('')
const showSuccess = ref(false)
const lastResult = ref(null)
const gradedEmployeeName = ref('')

const allGraded = computed(() => {
  if (!gradingSession.value) return false
  return gradingSession.value.essays.every(e => gradings.value[e.answer_id] !== undefined)
})

const ungradedCount = computed(() => {
  if (!gradingSession.value) return 0
  return gradingSession.value.essays.filter(e => gradings.value[e.answer_id] === undefined).length
})

async function load() {
  loading.value = true
  try {
    const data = await quizApi.pendingGrading()
    sessions.value = data.sessions || []
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

function openGrading(session) {
  gradingSession.value = session
  gradings.value = {}
  submitError.value = ''
  // Pre-fill already-graded essays
  session.essays.forEach(e => {
    if (e.graded) gradings.value[e.answer_id] = e.essay_score
  })
}

function setScore(answerId, val) {
  const clamped = Math.max(0, Math.min(100, Number(val) || 0))
  gradings.value = { ...gradings.value, [answerId]: clamped }
}

async function submitGradings() {
  if (!allGraded.value || submitting.value) return
  submitError.value = ''
  submitting.value = true
  try {
    const gradingsList = Object.entries(gradings.value).map(([aid, score]) => ({
      answer_id: parseInt(aid),
      score,
    }))
    const data = await quizApi.gradeEssays(gradingSession.value.session_id, gradingsList)
    lastResult.value = data
    gradedEmployeeName.value = gradingSession.value.employee.name
    showSuccess.value = true
  } catch (e) {
    submitError.value = e.message || 'Gagal menyimpan penilaian. Coba lagi.'
  } finally {
    submitting.value = false
  }
}

function afterSuccess() {
  showSuccess.value = false
  gradingSession.value = null
  load()
}

function formatDate(dtStr) {
  if (!dtStr) return '—'
  try {
    const d = new Date(dtStr.replace(' ', 'T'))
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
      + ' ' + d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  } catch { return dtStr }
}

onMounted(load)
</script>
