<template>
  <div class="min-h-screen clay-surface flex flex-col">
    <!-- Header -->
    <div class="bg-gradient-to-r from-[#B70000] to-[#950000] shadow-md">
      <div class="max-w-3xl mx-auto w-full px-4 pt-6 pb-6 text-white">
        <button @click="router.back()" class="flex items-center gap-2 text-red-200 text-sm mb-4 hover:text-white transition-colors">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Kembali
        </button>
        <div class="flex items-start justify-between">
          <div>
            <span v-if="isProgram" class="text-[10px] font-bold uppercase tracking-wider text-red-100 bg-red-800/60 px-2 py-0.5 rounded-full mb-1.5 inline-block border border-red-500/20">
              SOP Program
            </span>
            <span v-else class="text-[10px] font-bold uppercase tracking-wider text-red-100 bg-red-800/60 px-2 py-0.5 rounded-full mb-1.5 inline-block border border-red-500/20">
              SOP Mandiri
            </span>
            <h1 class="text-lg sm:text-xl font-bold leading-snug">{{ isProgram ? program?.name : quiz?.name || 'Memuat...' }}</h1>
            <p v-if="!isProgram && quiz?.sop" class="text-red-200 text-sm mt-1">{{ quiz.sop.name }}</p>
            <p v-else-if="isProgram && program" class="text-red-200 text-xs mt-1">Periode: {{ fmtPeriod(program.period) }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex-1 flex items-center justify-center">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#B70000]"></div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="mx-4 mt-6 p-4 bg-red-50 rounded-xl border border-red-200 shadow-sm">
      <p class="text-red-700 text-sm font-medium">{{ error }}</p>
    </div>

    <!-- Main Content -->
    <template v-else>
      <div class="flex-1 max-w-3xl mx-auto w-full px-4 py-5 space-y-4">
        <!-- Info grid for Program -->
        <div v-if="isProgram && program" class="grid grid-cols-2 gap-3">
          <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100/50">
            <div class="text-2xl font-extrabold text-[#B70000]">{{ getProgramDuration(program) }}</div>
            <div class="text-xs text-gray-500 font-medium mt-1">Durasi Gabungan (menit)</div>
          </div>
          <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100/50">
            <div class="text-2xl font-extrabold text-[#B70000]">{{ getProgramQuestions(program) }}</div>
            <div class="text-xs text-gray-500 font-medium mt-1">Jumlah Soal Gabungan</div>
          </div>
          <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100/50">
            <div class="text-2xl font-extrabold text-[#B70000]">{{ program.quizzes?.length || 0 }}</div>
            <div class="text-xs text-gray-500 font-medium mt-1">Total SOP Diuji</div>
          </div>
          <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100/50">
            <div class="text-sm font-bold text-gray-800 truncate">{{ formatDate(program.deadline) || '—' }}</div>
            <div class="text-xs text-gray-500 font-medium mt-1">Deadline</div>
          </div>
        </div>

        <!-- Info grid for Standalone Quiz -->
        <div v-else-if="!isProgram && quiz" class="grid grid-cols-2 gap-3">
          <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100/50">
            <div class="text-2xl font-extrabold text-[#B70000]">{{ quiz.duration_minutes }}</div>
            <div class="text-xs text-gray-500 font-medium mt-1">Durasi (menit)</div>
          </div>
          <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100/50">
            <div class="text-2xl font-extrabold text-[#B70000]">{{ quiz.question_count }}</div>
            <div class="text-xs text-gray-500 font-medium mt-1">Jumlah Soal</div>
          </div>
          <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100/50">
            <div class="text-2xl font-extrabold text-[#B70000]">{{ quiz.passing_score }}%</div>
            <div class="text-xs text-gray-500 font-medium mt-1">Nilai Minimum Lulus</div>
          </div>
          <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100/50">
            <div class="text-sm font-bold text-gray-800 truncate">{{ formatDate(quiz.deadline) || '—' }}</div>
            <div class="text-xs text-gray-500 font-medium mt-1">Deadline</div>
          </div>
        </div>

        <!-- Program SOP List -->
        <div v-if="isProgram && program" class="bg-white rounded-xl p-4 shadow-sm border border-gray-100/50">
          <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Daftar SOP yang Tercakup</h3>
          <div class="divide-y divide-gray-100">
            <div
              v-for="subQuiz in program.quizzes"
              :key="subQuiz.id"
              class="py-3 first:pt-0 last:pb-0 flex items-center justify-between"
            >
              <div>
                <h4 class="text-sm font-bold text-gray-800 leading-snug">{{ subQuiz.name }}</h4>
                <p class="text-xs text-gray-400 mt-0.5">{{ subQuiz.duration_minutes }} menit • {{ subQuiz.question_count }} soal</p>
              </div>
              <div>
                <span
                  v-if="subQuiz.already_submitted"
                  class="text-[10px] px-2 py-0.5 rounded-full font-bold"
                  :class="subQuiz.is_passed ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'"
                >
                  Selesai ({{ subQuiz.score?.toFixed(0) }}%)
                </span>
                <span
                  v-else
                  class="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-50 text-amber-700 border border-amber-200"
                >
                  Belum
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Description -->
        <div v-if="!isProgram && quiz?.description" class="bg-white rounded-xl p-4 shadow-sm border border-gray-100/50">
          <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Deskripsi</h3>
          <p class="text-sm text-gray-600 leading-relaxed">{{ quiz.description }}</p>
        </div>

        <!-- Warning box -->
        <div class="bg-amber-50 border border-amber-200 rounded-xl p-4 shadow-sm">
          <div class="flex gap-3">
            <svg class="w-5 h-5 text-amber-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p class="text-sm font-bold text-amber-800">Perhatian Sebelum Memulai</p>
              <ul class="text-xs text-amber-700 mt-1.5 space-y-1 list-disc list-inside">
                <li v-if="isProgram"><strong>Sekali Play</strong>: Seluruh SOP di atas akan digabung dalam 1x timer berjalan.</li>
                <li>Setelah klik Mulai, timer langsung berjalan dan tidak bisa di-pause.</li>
                <li>Jawaban tidak bisa diubah setelah dikumpulkan.</li>
                <li>Jika waktu habis, semua jawaban otomatis tersimpan & dikumpulkan.</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Already submitted -->
        <div v-if="alreadySubmitted" class="bg-blue-50 border border-blue-200 rounded-xl p-4 shadow-sm">
          <p class="text-sm text-blue-700 font-semibold flex items-center gap-1.5">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {{ isProgram ? 'Program ini sudah kamu selesaikan.' : 'Quiz ini sudah kamu kerjakan.' }}
          </p>
          <button
            @click="router.push(`/dashboard/quiz/history`)"
            class="mt-2.5 text-xs text-blue-600 font-bold flex items-center gap-1 hover:text-blue-800 transition-colors"
          >
            Lihat riwayat pengerjaan 
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Fixed bottom CTA -->
      <div class="sticky bottom-0 bg-white border-t border-gray-100 shadow-[0_-8px_20px_rgba(0,0,0,0.03)]">
        <div class="max-w-3xl mx-auto p-4 flex gap-3">
          <button
            v-if="!alreadySubmitted"
            @click="startQuiz"
            :disabled="starting"
            class="w-full py-4 rounded-xl font-bold text-white transition-all active:scale-95 text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg bg-gradient-to-r from-[#B70000] to-[#950000] disabled:bg-gray-450 disabled:cursor-not-allowed"
          >
            <span v-if="starting" class="flex items-center justify-center gap-2">
              <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Memulai Sesi...
            </span>
            <span v-else class="flex items-center justify-center gap-1.5">
              {{ isResuming ? 'Lanjutkan Pengerjaan' : 'Mulai Pengerjaan' }}
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            </span>
          </button>
          <button
            v-else
            @click="router.push('/dashboard/quiz')"
            class="w-full py-4 rounded-xl font-bold text-[#B70000] border-2 border-[#B70000] transition-all hover:bg-red-50 text-sm active:scale-95 flex items-center justify-center gap-1.5 bg-white"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Kembali ke Beranda
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { quizApi } from '../../services/quizApi'

const router = useRouter()
const route = useRoute()

const quizId = parseInt(route.params.id)
const isProgram = computed(() => route.query.type === 'program')

const loading = ref(true)
const error = ref('')
const starting = ref(false)
const quiz = ref(null)
const program = ref(null)
const alreadySubmitted = ref(false)

const isResuming = computed(() => {
  // 1. Check local storage first (instant resume)
  const raw = localStorage.getItem('quiz_active_session')
  if (raw) {
    try {
      const stored = JSON.parse(raw)
      const isSameProgram = isProgram.value && stored.isProgram && stored.programId === quizId
      const isSameQuiz = !isProgram.value && !stored.isProgram && stored.quizId === quizId
      
      if (isSameProgram || isSameQuiz) {
        if (stored.expiredAt) {
          const expiredAt = new Date(stored.expiredAt.replace(' ', 'T') + 'Z')
          if (expiredAt > new Date()) return true
        }
      }
    } catch {}
  }

  // 2. Check assignment state from backend data
  if (isProgram.value && program.value?.quizzes) {
    return program.value.quizzes.some(q => q.assignment?.state === 'in_progress')
  } else if (!isProgram.value && quiz.value) {
    return quiz.value.assignment?.state === 'in_progress'
  }
  
  return false
})

async function loadDetail() {
  loading.value = true
  error.value = ''
  try {
    if (isProgram.value) {
      const listData = await quizApi.list()
      const foundProgram = listData.programs?.find(p => p.id === quizId)
      if (!foundProgram) {
        error.value = 'Program tidak ditemukan atau tidak aktif.'
        return
      }
      program.value = foundProgram
      
      // A program is submitted if all its sub-quizzes are submitted
      alreadySubmitted.value = !foundProgram.quizzes?.some(q => !q.already_submitted)
    } else {
      const data = await quizApi.detail(quizId)
      quiz.value = data.quiz

      const listData = await quizApi.list()
      const matching = listData.standalone_quizzes?.find(q => q.id === quizId)
      if (matching) {
        alreadySubmitted.value = matching.already_submitted
      }
    }
  } catch (e) {
    if (e.code === 'unauthorized') { router.push('/login'); return }
    error.value = e.message || 'Gagal memuat detail'
  } finally {
    loading.value = false
  }
}

async function startQuiz() {
  // Check if there is an active session in local storage first to resume instantly
  const raw = localStorage.getItem('quiz_active_session')
  if (raw) {
    try {
      const stored = JSON.parse(raw)
      const isSameProgram = isProgram.value && stored.isProgram && stored.programId === quizId
      const isSameQuiz = !isProgram.value && !stored.isProgram && stored.quizId === quizId
      
      if (isSameProgram || isSameQuiz) {
        if (stored.expiredAt) {
          const expiredAt = new Date(stored.expiredAt.replace(' ', 'T') + 'Z')
          if (expiredAt > new Date()) {
            router.push('/dashboard/quiz/take')
            return
          }
        }
      }
    } catch (e) {
      // ignore
    }
  }

  if (starting.value) return
  starting.value = true
  try {
    if (isProgram.value) {
      const data = await quizApi.programStart(quizId)
      
      localStorage.setItem('quiz_active_session', JSON.stringify({
        isProgram: true,
        programId: quizId,
        programName: program.value?.name,
        expiredAt: data.expired_at,
        questions: data.questions, // already merged list from backend
        sessions: data.sessions,   // [{ session_id, quiz_bank_id, quiz_bank_name }, ...]
        answers: {},
      }))
    } else {
      const data = await quizApi.start(quizId)
      
      localStorage.setItem('quiz_active_session', JSON.stringify({
        isProgram: false,
        sessionId: data.session.id,
        quizId,
        quizName: quiz.value?.name,
        expiredAt: data.session.expired_at,
        questions: data.questions,
        answers: {},
      }))
    }
    router.push('/dashboard/quiz/take')
  } catch (e) {
    starting.value = false
    if (e.code === 'already_submitted') {
      alreadySubmitted.value = true
      error.value = 'Quiz ini sudah pernah dikerjakan.'
    } else if (e.code === 'unauthorized') {
      router.push('/login')
    } else {
      error.value = e.message || 'Gagal memulai quiz. Coba lagi.'
    }
  }
}

function getProgramDuration(prog) {
  if (!prog?.quizzes) return 0
  return prog.quizzes.reduce((sum, q) => sum + (q.duration_minutes || 0), 0)
}

function getProgramQuestions(prog) {
  if (!prog?.quizzes) return 0
  return prog.quizzes.reduce((sum, q) => sum + (q.question_count || 0), 0)
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

function fmtPeriod(p) {
  if (!p) return ''
  const [y, m] = p.split('-')
  if (m) {
    return `${['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'][+m - 1]} ${y}`
  }
  return p
}

onMounted(loadDetail)
</script>
