<template>
  <div class="fixed inset-0 bg-gray-50 flex flex-col" style="z-index: 100">
    <!-- Top bar: timer + progress -->
    <div
      class="flex items-center justify-between px-4 py-3 border-b shadow-sm transition-colors duration-500"
      :class="timerCritical ? 'bg-red-600 border-red-700' : 'bg-white border-gray-200'"
    >
      <div class="flex items-center gap-3 min-w-0">
        <button
          @click="showLeaveConfirm = true"
          class="p-1.5 rounded-lg"
          :class="timerCritical ? 'text-red-100 hover:bg-red-700' : 'text-gray-500 hover:bg-gray-100'"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div class="truncate">
          <p class="text-xs font-semibold truncate" :class="timerCritical ? 'text-red-100' : 'text-gray-500'">
            {{ currentSopName }}
          </p>
          <p class="text-[10px]" :class="timerCritical ? 'text-red-200' : 'text-gray-400'">
            Soal {{ currentIndex + 1 }} / {{ questions.length }}
          </p>
        </div>
      </div>

      <!-- Timer -->
      <div
        class="flex items-center gap-1.5 font-mono font-bold text-base px-3 py-1.5 rounded-lg"
        :class="timerCritical
          ? 'text-white animate-pulse bg-red-700'
          : 'text-gray-800 bg-gray-100'"
      >
        <svg class="w-4 h-4" :class="timerCritical ? 'text-red-200' : 'text-gray-500'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {{ timerDisplay }}
      </div>
    </div>

    <!-- Progress bar -->
    <div class="h-1.5 bg-gray-200">
      <div
        class="h-full bg-gradient-to-r from-[#B70000] to-[#950000] transition-all duration-300"
        :style="{ width: `${progressPct}%` }"
      ></div>
    </div>

    <!-- Question area -->
    <div class="flex-1 overflow-y-auto px-4 py-5">
      <template v-if="currentQuestion">
        <p class="text-xs font-semibold text-[#B70000] uppercase tracking-wider mb-1">
          Soal {{ currentIndex + 1 }}
          <span v-if="currentQuestion.sop_section" class="text-gray-400 font-normal normal-case tracking-normal ml-2">
            {{ currentQuestion.sop_section }}
          </span>
        </p>
        <p class="text-base font-medium text-gray-900 leading-relaxed mb-6">
          {{ currentQuestion.question_text }}
        </p>

        <!-- Multiple choice options -->
        <div v-if="currentQuestion.question_type === 'multiple_choice'" class="space-y-3">
          <button
            v-for="(label, key) in currentQuestion.options"
            :key="key"
            @click="selectAnswer(key)"
            class="w-full text-left flex items-center gap-3 p-4 rounded-xl border-2 transition-all active:scale-[0.98]"
            :class="answers[currentQuestion.id] === key
              ? 'border-[#B70000] bg-red-50/50 text-[#B70000]'
              : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'"
          >
            <span
              class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 uppercase"
              :class="answers[currentQuestion.id] === key
                ? 'bg-[#B70000] text-white'
                : 'bg-gray-100 text-gray-500'"
            >
              {{ key }}
            </span>
            <span class="text-sm leading-snug">{{ label }}</span>
          </button>
        </div>

        <!-- True/False options -->
        <div v-else-if="currentQuestion.question_type === 'true_false'" class="space-y-3">
          <button
            v-for="opt in [{ key: 'true', label: 'Benar' }, { key: 'false', label: 'Salah' }]"
            :key="opt.key"
            @click="selectAnswer(opt.key)"
            class="w-full text-left flex items-center gap-3 p-4 rounded-xl border-2 transition-all active:scale-[0.98]"
            :class="answers[currentQuestion.id] === opt.key
              ? 'border-[#B70000] bg-red-50/50 text-[#B70000]'
              : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'"
          >
            <span
              class="w-8 h-8 rounded-full flex items-center justify-center text-lg shrink-0"
              :class="answers[currentQuestion.id] === opt.key
                ? 'bg-[#B70000] text-white'
                : 'bg-gray-100 text-gray-500'"
            >
              {{ opt.key === 'true' ? '✓' : '✗' }}
            </span>
            <span class="text-sm font-medium">{{ opt.label }}</span>
          </button>
        </div>

        <!-- Essay input -->
        <div v-else-if="currentQuestion.question_type === 'essay'" class="space-y-3">
          <div class="flex items-center gap-2 px-3 py-2 rounded-xl bg-purple-50 border border-purple-200 text-xs text-purple-700 font-medium">
            <span>✍️</span>
            <span>Soal esai — tulis jawabanmu di bawah. Akan dinilai oleh supervisor setelah quiz selesai.</span>
          </div>
          <textarea
            :value="essayAnswers[currentQuestion.id] || ''"
            @input="setEssayAnswer(currentQuestion.id, $event.target.value)"
            rows="6"
            placeholder="Tulis jawabanmu di sini..."
            class="w-full px-4 py-3 text-sm border-2 rounded-xl focus:outline-none resize-none leading-relaxed transition-colors"
            :class="(essayAnswers[currentQuestion.id] || '').trim()
              ? 'border-purple-400 bg-purple-50/30 focus:border-purple-500'
              : 'border-gray-200 bg-white focus:border-purple-400'"
          ></textarea>
          <p class="text-xs text-gray-400 text-right">
            {{ (essayAnswers[currentQuestion.id] || '').length }} karakter
          </p>
        </div>

        <!-- Unanswered hint -->
        <p v-if="currentQuestion.question_type !== 'essay' && !answers[currentQuestion.id]"
           class="text-xs text-gray-400 text-center mt-4">
          Pilih salah satu jawaban
        </p>
      </template>
    </div>

    <!-- Bottom navigation -->
    <div class="bg-white border-t border-gray-200 px-4 py-3 space-y-2">
      <!-- Question overview dots -->
      <div class="flex flex-wrap gap-1.5 justify-center pb-1 max-h-24 overflow-y-auto">
        <button
          v-for="(q, i) in questions"
          :key="q.id"
          @click="goToQuestion(i)"
          class="w-7 h-7 rounded-full text-xs font-bold transition-all shrink-0"
          :class="[
            i === currentIndex ? 'ring-2 ring-[#B70000] ring-offset-1 scale-110' : '',
            isQuestionAnswered(q)
              ? (q.question_type === 'essay' ? 'bg-purple-500 text-white' : 'bg-[#B70000] text-white')
              : 'bg-gray-100 text-gray-500'
          ]"
        >
          {{ i + 1 }}
        </button>
      </div>

      <!-- Prev / Submit / Next -->
      <div class="flex gap-2">
        <button
          @click="prevQuestion"
          :disabled="currentIndex === 0"
          class="flex-1 py-3.5 rounded-xl text-sm font-semibold transition-all"
          :class="currentIndex === 0
            ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 active:scale-95'"
        >
          ← Sebelumnya
        </button>

        <button
          v-if="currentIndex < questions.length - 1"
          @click="nextQuestion"
          class="flex-1 py-3.5 rounded-xl text-sm font-semibold bg-gray-800 text-white hover:bg-gray-700 active:scale-95 transition-all"
        >
          Selanjutnya →
        </button>

        <button
          v-else
          @click="showSubmitConfirm = true"
          :disabled="submitting"
          class="flex-1 py-3.5 rounded-xl text-sm font-bold transition-all active:scale-95"
          :class="submitting
            ? 'bg-gray-400 text-white cursor-not-allowed'
            : 'bg-gradient-to-r from-[#B70000] to-[#950000] text-white shadow-md'"
        >
          {{ submitting ? 'Menyimpan...' : 'Kumpulkan' }}
        </button>
      </div>

      <!-- Unanswered count indicator -->
      <p v-if="unansweredCount > 0" class="text-xs text-center text-amber-600 font-medium">
        {{ unansweredCount }} soal belum dijawab
      </p>
    </div>

    <!-- Submit confirm modal -->
    <Teleport to="body">
      <div v-if="showSubmitConfirm" class="fixed inset-0 bg-black/50 z-[150] flex items-end justify-center p-4">
        <div class="bg-white rounded-2xl w-full max-w-sm p-6 space-y-4 shadow-xl">
          <h3 class="text-lg font-bold text-gray-900">Kumpulkan Jawaban?</h3>
          <p class="text-sm text-gray-600">
            Kamu telah menjawab <strong class="text-[#B70000]">{{ answeredCount }} dari {{ questions.length }}</strong> soal.
            <span v-if="unansweredCount > 0" class="text-amber-600 block mt-1">
              Perhatian: {{ unansweredCount }} soal akan dianggap kosong.
            </span>
          </p>
          <p v-if="questions.some(q => q.question_type === 'essay')"
             class="text-xs text-purple-700 bg-purple-50 border border-purple-200 rounded-lg px-3 py-2 mt-1">
            Soal esai akan dinilai oleh supervisor setelah kamu mengumpulkan.
          </p>
          <p class="text-xs text-gray-500">Jawaban tidak bisa diubah setelah dikumpulkan.</p>
          <div class="flex gap-3">
            <button
              @click="showSubmitConfirm = false"
              class="flex-1 py-3.5 rounded-xl border-2 border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Periksa Lagi
            </button>
            <button
              @click="submitQuiz(false)"
              :disabled="submitting"
              class="flex-1 py-3.5 rounded-xl bg-[#B70000] text-white text-sm font-bold shadow-md hover:bg-[#950000] active:scale-95 transition-all flex items-center justify-center gap-1"
            >
              <span v-if="submitting" class="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
              {{ submitting ? 'Kirim...' : 'Ya, Kumpulkan' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Leave confirm modal -->
      <div v-if="showLeaveConfirm" class="fixed inset-0 bg-black/50 z-[150] flex items-end justify-center p-4">
        <div class="bg-white rounded-2xl w-full max-w-sm p-6 space-y-4 shadow-xl">
          <h3 class="text-lg font-bold text-gray-900">Keluar dari Quiz?</h3>
          <p class="text-sm text-gray-600">
            Timer tetap berjalan meski kamu keluar. Kamu bisa kembali lagi selama waktu belum habis.
          </p>
          <div class="flex gap-3">
            <button
              @click="showLeaveConfirm = false"
              class="flex-1 py-3.5 rounded-xl border-2 border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Lanjutkan Quiz
            </button>
            <button
              @click="leaveQuiz"
              class="flex-1 py-3.5 rounded-xl bg-gray-800 text-white text-sm font-bold hover:bg-gray-700 transition-colors"
            >
              Keluar
            </button>
          </div>
        </div>
      </div>

      <!-- Time up modal -->
      <div v-if="timeUp" class="fixed inset-0 bg-black/70 z-[180] flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl w-full max-w-sm p-6 space-y-4 text-center shadow-2xl">
          <div class="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
            <svg class="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 class="text-lg font-bold text-gray-900">Waktu Habis!</h3>
          <p class="text-sm text-gray-600">Jawaban kamu otomatis dikumpulkan.</p>
          <div v-if="submitting" class="flex items-center justify-center gap-2 text-sm text-gray-500">
            <svg class="animate-spin h-4 w-4 text-[#B70000]" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            Menyimpan...
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Program batch results summary overlay -->
    <div v-if="showProgramResults && programResults" class="fixed inset-0 bg-gray-50 flex flex-col overflow-y-auto z-[200]">
      <!-- Hero section -->
      <div
        class="px-6 pt-12 pb-10 text-white text-center shadow-lg"
        :class="programResults.is_passed
          ? 'bg-gradient-to-b from-green-600 to-green-700'
          : 'bg-gradient-to-b from-[#B70000] to-[#950000]'"
      >
        <!-- Icon -->
        <div class="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center shadow-inner"
          :class="programResults.is_passed ? 'bg-green-500' : 'bg-red-700'">
          <svg v-if="programResults.is_passed" class="w-10 h-10 text-white animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
          </svg>
          <svg v-else class="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>

        <h1 class="text-2xl font-black uppercase tracking-wider">Hasil Program</h1>
        <p class="text-xl font-bold mt-1">{{ programResults.is_passed ? 'LULUS PROGRAM' : 'PERLU PERBAIKAN' }}</p>
        <p class="text-sm opacity-90 mt-2">{{ sessionData?.programName }}</p>
      </div>

      <!-- Content -->
      <div class="px-4 py-6 flex-1 space-y-4">
        <!-- Notice box -->
        <div class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100/80">
          <h3 class="text-sm font-bold text-gray-800 mb-2">Pesan Evaluasi</h3>
          <p class="text-sm text-gray-600 leading-relaxed">{{ programResults.message }}</p>
        </div>

        <!-- Breakdown of each SOP -->
        <div class="clay-card/80 overflow-hidden">
          <div class="px-5 py-4 border-b border-gray-100/80 bg-slate-50/50">
            <h3 class="font-bold text-gray-900 text-sm">Rincian Hasil per SOP</h3>
          </div>
          <div class="divide-y divide-gray-100">
            <div
              v-for="res in programResults.results"
              :key="res.quiz_bank_id"
              class="px-5 py-4 flex items-center justify-between hover:bg-gray-50/30 transition-colors"
            >
              <div>
                <h4 class="text-sm font-bold text-gray-800 leading-snug">{{ res.quiz_bank_name }}</h4>
                <p class="text-xs text-gray-400 mt-1">Score kelulusan di database</p>
              </div>
              <div class="flex items-center gap-3">
                <div class="text-right">
                  <span
                    class="text-xs font-extrabold px-3 py-1 rounded-xl inline-block border shadow-sm"
                    :class="res.is_passed
                      ? 'bg-green-50 text-green-700 border-green-200'
                      : 'bg-red-50 text-red-700 border-red-200'"
                  >
                    {{ res.score?.toFixed(0) }}%
                  </span>
                  <span class="text-[9px] text-gray-400 font-bold block mt-1 uppercase tracking-wider">
                    {{ res.is_passed ? 'Lulus' : 'Remedial' }}
                  </span>
                </div>
                
                <!-- Detail link button -->
                <button
                  @click="router.push(`/dashboard/quiz/result/${res.result_id}`)"
                  class="p-2.5 rounded-xl bg-gray-50 text-gray-500 hover:text-[#B70000] hover:bg-red-50 transition-all border border-gray-100"
                  title="Lihat Detail Pembahasan"
                >
                  <svg class="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="space-y-3 pt-4 pb-8">
          <button
            @click="router.push('/dashboard/quiz')"
            class="w-full py-4 rounded-2xl font-bold text-white bg-gradient-to-r from-[#B70000] to-[#950000] shadow-md hover:shadow-lg transition-all active:scale-95 text-sm flex items-center justify-center gap-2"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Kembali ke Beranda
          </button>
          <button
            @click="router.push('/dashboard/quiz/history')"
            class="w-full py-4 rounded-2xl font-bold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 transition-all active:scale-95 text-sm flex items-center justify-center gap-2"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Lihat Semua Riwayat
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { quizApi } from '../../services/quizApi'

const router = useRouter()

const sessionData = ref(null)
const questions = ref([])
const answers = ref({})       // MC/TF: questionId → 'a'|'b'|'true'|'false'
const essayAnswers = ref({})  // essay: questionId → text
const currentIndex = ref(0)
const submitting = ref(false)
const showSubmitConfirm = ref(false)
const showLeaveConfirm = ref(false)
const timeUp = ref(false)
const showProgramResults = ref(false)
const programResults = ref(null)

let timerInterval = null
const remainingMs = ref(0)

const currentQuestion = computed(() => questions.value[currentIndex.value])
const progressPct = computed(() => ((currentIndex.value + 1) / Math.max(questions.value.length, 1)) * 100)

function isQuestionAnswered(q) {
  if (!q) return false
  if (q.question_type === 'essay') return !!(essayAnswers.value[q.id] || '').trim()
  return !!answers.value[q.id]
}

const answeredCount = computed(() => questions.value.filter(isQuestionAnswered).length)
const unansweredCount = computed(() => questions.value.length - answeredCount.value)
const timerCritical = computed(() => remainingMs.value < 5 * 60 * 1000 && remainingMs.value > 0)

const currentSopName = computed(() => {
  if (!sessionData.value) return 'Memuat...'
  if (!sessionData.value.isProgram) return sessionData.value.quizName
  
  const q = currentQuestion.value
  if (!q) return sessionData.value.programName
  
  const session = sessionData.value.sessions?.find(s => s.session_id === q.session_id)
  return session ? session.quiz_bank_name : sessionData.value.programName
})

const timerDisplay = computed(() => {
  const totalSec = Math.max(0, Math.ceil(remainingMs.value / 1000))
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
})

function selectAnswer(key) {
  if (!currentQuestion.value) return
  answers.value = { ...answers.value, [currentQuestion.value.id]: key }
  saveToStorage()
}

function setEssayAnswer(questionId, text) {
  essayAnswers.value = { ...essayAnswers.value, [questionId]: text }
  saveToStorage()
}

function nextQuestion() {
  if (currentIndex.value < questions.value.length - 1) currentIndex.value++
}

function prevQuestion() {
  if (currentIndex.value > 0) currentIndex.value--
}

function goToQuestion(i) {
  currentIndex.value = i
}

function saveToStorage() {
  if (!sessionData.value) return
  localStorage.setItem('quiz_active_session', JSON.stringify({
    ...sessionData.value,
    answers: answers.value,
    essayAnswers: essayAnswers.value,
  }))
}

function leaveQuiz() {
  showLeaveConfirm.value = false
  router.push('/dashboard/quiz')
}

async function submitQuiz(autoSubmit = false) {
  if (submitting.value) return
  showSubmitConfirm.value = false
  submitting.value = true

  try {
    if (sessionData.value.isProgram) {
      // Group answers by session_id
      const sessionGroup = {}
      questions.value.forEach(q => {
        const sId = q.session_id
        if (!sessionGroup[sId]) sessionGroup[sId] = []
        const entry = { question_id: q.id }
        if (q.question_type === 'essay') {
          entry.essay_answer = essayAnswers.value[q.id] || ''
        } else {
          entry.chosen_answer = answers.value[q.id] || ''
        }
        sessionGroup[sId].push(entry)
      })

      const submissions = Object.keys(sessionGroup).map(sId => ({
        session_id: parseInt(sId),
        answers: sessionGroup[sId],
      }))

      const data = await quizApi.programSubmit({ submissions })

      if (timerInterval) clearInterval(timerInterval)
      localStorage.removeItem('quiz_active_session')
      programResults.value = data
      showProgramResults.value = true
      submitting.value = false
    } else {
      const answersPayload = questions.value.map(q => {
        const entry = { question_id: q.id }
        if (q.question_type === 'essay') {
          entry.essay_answer = essayAnswers.value[q.id] || ''
        } else {
          entry.chosen_answer = answers.value[q.id] || ''
        }
        return entry
      })

      const data = await quizApi.submit(sessionData.value.sessionId, answersPayload)
      
      if (timerInterval) clearInterval(timerInterval)
      
      localStorage.removeItem('quiz_active_session')
      const resultId = data.result?.result_id
      if (resultId) {
        router.replace(`/dashboard/quiz/result/${resultId}`)
      } else {
        router.replace('/dashboard/quiz')
      }
    }
  } catch (e) {
    submitting.value = false
    if (!autoSubmit) {
      alert(e.message || 'Gagal mengumpulkan jawaban. Coba lagi.')
    }
  }
}

function startTimer() {
  if (!sessionData.value?.expiredAt) return

  // Parse Odoo UTC datetime
  const expiredAt = new Date(sessionData.value.expiredAt.replace(' ', 'T') + 'Z')

  function tick() {
    remainingMs.value = expiredAt - new Date()
    if (remainingMs.value <= 0) {
      remainingMs.value = 0
      clearInterval(timerInterval)
      timeUp.value = true
      submitQuiz(true)
    }
  }

  tick()
  timerInterval = setInterval(tick, 1000)
}

onMounted(() => {
  const raw = localStorage.getItem('quiz_active_session')
  if (!raw) {
    router.replace('/dashboard/quiz')
    return
  }
  try {
    const stored = JSON.parse(raw)
    sessionData.value = stored
    questions.value = stored.questions || []
    answers.value = stored.answers || {}
    essayAnswers.value = stored.essayAnswers || {}

    // Check if already expired
    if (stored.expiredAt) {
      const expiredAt = new Date(stored.expiredAt.replace(' ', 'T') + 'Z')
      if (expiredAt <= new Date()) {
        timeUp.value = true
        submitQuiz(true)
        return
      }
    }

    startTimer()
  } catch {
    router.replace('/dashboard/quiz')
  }
})

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval)
})
</script>
