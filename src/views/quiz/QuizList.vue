<template>
  <div class="min-h-screen bg-gray-50 pb-12">
    <!-- Header -->
    <div class="bg-gradient-to-r from-[#B70000] to-[#950000] px-6 pt-8 pb-12 text-white">
      <h1 class="text-2xl font-bold">Assessment SOP</h1>
      <p v-if="employee" class="text-red-200 text-sm mt-1">
        {{ employee.name }}
        <span v-if="employee.job"> · {{ employee.job }}</span>
      </p>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-20 gap-3">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#B70000]"></div>
      <p class="text-sm text-gray-500">Memuat daftar quiz...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="mx-4 mt-6 p-4 bg-red-50 rounded-xl border border-red-200">
      <p class="text-red-700 text-sm font-medium">{{ error }}</p>
      <button @click="loadQuizzes" class="mt-2 text-sm text-red-600 font-semibold underline">
        Coba lagi
      </button>
    </div>

    <template v-else>
      <!-- Summary stats -->
      <div class="mx-4 -mt-6 grid grid-cols-3 gap-3">
        <div class="bg-white rounded-xl shadow-sm p-3 text-center">
          <div class="text-xl font-bold text-gray-900">{{ totalQuizzes }}</div>
          <div class="text-xs text-gray-500 mt-0.5">Total Quiz</div>
        </div>
        <div class="bg-white rounded-xl shadow-sm p-3 text-center">
          <div class="text-xl font-bold text-green-600">{{ passedCount }}</div>
          <div class="text-xs text-gray-500 mt-0.5">Lulus</div>
        </div>
        <div class="bg-white rounded-xl shadow-sm p-3 text-center">
          <div class="text-xl font-bold text-orange-500">{{ pendingCount }}</div>
          <div class="text-xs text-gray-500 mt-0.5">Belum</div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-if="programs.length === 0 && standaloneQuizzes.length === 0" class="flex flex-col items-center justify-center py-20 text-gray-400">
        <svg class="w-14 h-14 mb-4 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <p class="font-medium text-gray-500">Tidak ada quiz tersedia</p>
        <p class="text-sm mt-1 text-gray-400">Hubungi admin jika ada pertanyaan</p>
      </div>

      <!-- Grouped Program List -->
      <div v-else class="px-4 mt-4 space-y-5">
        
        <!-- Program card -->
        <div
          v-for="prog in programs"
          :key="prog.id"
          class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
        >
          <!-- Program Card Header (Gradient & Metadata) -->
          <div class="px-5 py-4 bg-gradient-to-r from-slate-50 to-blue-50/50 border-b border-gray-100 flex items-center justify-between">
            <div>
              <span class="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full mb-1 inline-block">
                SOP Program
              </span>
              <h2 class="font-bold text-gray-900 text-base leading-snug">{{ prog.name }}</h2>
              <div class="flex items-center gap-2 mt-1 text-xs text-gray-400">
                <span>{{ fmtPeriod(prog.period) }}</span>
                <span>•</span>
                <span>{{ prog.quizzes?.length || 0 }} SOP</span>
                <span>•</span>
                <span>{{ getProgramDuration(prog) }} Menit</span>
              </div>
            </div>
            
            <!-- Overall Program Action Button -->
            <button
              v-if="hasPendingQuizzes(prog)"
              @click="handleProgramClick(prog)"
              class="px-4 py-2 text-xs font-bold bg-[#B70000] text-white hover:bg-[#950000] transition-colors rounded-xl flex items-center gap-1.5 shadow-sm active:scale-95"
            >
              {{ getProgramActionLabel(prog) }}
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            <span v-else class="text-xs px-2.5 py-1 rounded-full font-semibold bg-green-50 text-green-700">
              Selesai ✓
            </span>
          </div>

          <!-- Program Progress bar -->
          <div class="h-1 bg-gray-100 relative">
            <div
              class="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500"
              :style="{ width: `${getProgramProgress(prog)}%` }"
            ></div>
          </div>

          <!-- Program child quizzes list -->
          <div class="divide-y divide-gray-50">
            <div
              v-for="quiz in prog.quizzes"
              :key="quiz.id"
              @click="handleQuizClick(quiz)"
              class="p-4 flex items-center justify-between hover:bg-gray-50/50 cursor-pointer transition-colors group"
            >
              <div class="min-w-0 pr-3">
                <h3 class="font-semibold text-gray-800 text-sm group-hover:text-[#B70000] transition-colors leading-snug">
                  {{ quiz.name }}
                </h3>
                <p v-if="quiz.sop" class="text-xs text-gray-400 mt-0.5 truncate">{{ quiz.sop.name }}</p>
                <div class="mt-2 flex items-center gap-3 text-[11px] text-gray-400">
                  <span class="flex items-center gap-1">
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {{ quiz.duration_minutes }} menit
                  </span>
                  <span>•</span>
                  <span>{{ quiz.question_count }} soal</span>
                </div>
              </div>

              <!-- Quiz status / action -->
              <div class="flex items-center gap-3 shrink-0">
                <!-- Score if submitted -->
                <div v-if="quiz.already_submitted" class="text-right">
                  <span
                    class="text-xs font-bold px-2.5 py-1 rounded-lg inline-block"
                    :class="quiz.is_passed ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'"
                  >
                    {{ quiz.score?.toFixed(0) }}%
                  </span>
                  <span class="text-[9px] text-gray-400 block mt-0.5 uppercase tracking-wider">
                    {{ quiz.is_passed ? 'Lulus' : 'Remedial' }}
                  </span>
                </div>
                
                <!-- Status pill for not submitted -->
                <span
                  v-else
                  class="text-[11px] px-2.5 py-1 rounded-full font-semibold shrink-0"
                  :class="statusClass(quiz)"
                >
                  {{ statusLabel(quiz) }}
                </span>

                <svg class="w-4 h-4 text-gray-300 group-hover:text-[#B70000] transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <!-- Standalone quizzes section -->
        <div v-if="standaloneQuizzes.length > 0" class="space-y-3 pt-2">
          <div class="flex items-center gap-2 px-1">
            <span class="w-1.5 h-4 bg-[#B70000] rounded-full"></span>
            <h3 class="text-sm font-bold text-gray-600 uppercase tracking-wider">Quiz Mandiri</h3>
          </div>

          <div
            v-for="quiz in standaloneQuizzes"
            :key="quiz.id"
            @click="handleQuizClick(quiz)"
            class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 cursor-pointer transition-all active:scale-[0.985] hover:shadow-md"
          >
            <!-- Status badge + title -->
            <div class="flex items-start gap-3">
              <div class="flex-1 min-w-0">
                <h2 class="font-semibold text-gray-900 text-sm leading-snug group-hover:text-[#B70000]">{{ quiz.name }}</h2>
                <p v-if="quiz.sop" class="text-xs text-gray-400 mt-0.5">{{ quiz.sop.name }}</p>
              </div>
              <span
                class="text-xs px-2.5 py-1 rounded-full font-semibold shrink-0 whitespace-nowrap"
                :class="statusClass(quiz)"
              >
                {{ statusLabel(quiz) }}
              </span>
            </div>

            <!-- Score if submitted -->
            <div v-if="quiz.already_submitted" class="mt-3 flex items-center gap-3">
              <div
                class="flex-1 rounded-lg px-3 py-2 text-center text-sm font-bold"
                :class="quiz.is_passed ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'"
              >
                {{ quiz.score?.toFixed(1) }}%
                <span class="font-normal text-xs block">{{ quiz.is_passed ? 'LULUS' : 'TIDAK LULUS' }}</span>
              </div>
              <div class="flex-1 rounded-lg bg-gray-50 px-3 py-2 text-center text-sm font-bold text-gray-600">
                {{ quiz.passing_score }}%
                <span class="font-normal text-xs block">Minimum</span>
              </div>
            </div>

            <!-- Meta info -->
            <div class="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400">
              <span class="flex items-center gap-1">
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {{ quiz.duration_minutes }} menit
              </span>
              <span class="flex items-center gap-1">
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {{ quiz.question_count }} soal
              </span>
              <span v-if="quiz.deadline" class="flex items-center gap-1">
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Deadline {{ formatDate(quiz.deadline) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { quizApi } from '../../services/quizApi'

const router = useRouter()
const loading = ref(true)
const error = ref('')
const programs = ref([])
const standaloneQuizzes = ref([])
const employee = ref(null)

// Computed all quizzes for stats
const allQuizzes = computed(() => {
  const list = []
  programs.value.forEach(p => {
    if (p.quizzes) {
      list.push(...p.quizzes)
    }
  })
  list.push(...standaloneQuizzes.value)
  return list
})

const passedCount = computed(() => allQuizzes.value.filter(q => q.already_submitted && q.is_passed).length)
const pendingCount = computed(() => allQuizzes.value.filter(q => !q.already_submitted).length)
const totalQuizzes = computed(() => allQuizzes.value.length)

async function loadQuizzes() {
  loading.value = true
  error.value = ''
  try {
    const data = await quizApi.list()
    programs.value = data.programs || []
    standaloneQuizzes.value = data.standalone_quizzes || []
    employee.value = data.employee
  } catch (e) {
    if (e.code === 'unauthorized') {
      router.push('/login')
      return
    }
    error.value = e.message || 'Gagal memuat daftar quiz'
  } finally {
    loading.value = false
  }
}

function hasPendingQuizzes(program) {
  return program.quizzes?.some(q => !q.already_submitted)
}

function getProgramActionLabel(program) {
  const quizzes = program.quizzes || []
  const hasInProgress = quizzes.some(q => q.assignment?.state === 'in_progress')
  return hasInProgress ? 'Lanjutkan Program' : 'Mulai Program'
}

function getProgramDuration(program) {
  if (!program.quizzes) return 0
  return program.quizzes.reduce((sum, q) => sum + (q.duration_minutes || 0), 0)
}

function getProgramProgress(program) {
  if (!program.quizzes || program.quizzes.length === 0) return 0
  const done = program.quizzes.filter(q => q.already_submitted).length
  return (done / program.quizzes.length) * 100
}

function handleProgramClick(program) {
  // Navigate to unified program detail take confirmation
  router.push(`/dashboard/quiz/${program.id}?type=program`)
}

function statusLabel(quiz) {
  if (quiz.already_submitted) {
    return quiz.is_passed ? 'Lulus ✓' : 'Tidak Lulus'
  }
  const state = quiz.assignment?.state
  if (state === 'overdue') return 'Terlewat'
  if (state === 'in_progress') return 'Sedang Dikerjakan'
  return 'Belum Dikerjakan'
}

function statusClass(quiz) {
  if (quiz.already_submitted) {
    return quiz.is_passed
      ? 'bg-green-100 text-green-700'
      : 'bg-red-100 text-red-700'
  }
  const state = quiz.assignment?.state
  if (state === 'overdue') return 'bg-gray-100 text-gray-500'
  if (state === 'in_progress') return 'bg-blue-100 text-blue-700'
  return 'bg-amber-100 text-amber-700'
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

function fmtPeriod(p) {
  if (!p) return ''
  const [y, m] = p.split('-')
  if (m) {
    return `${['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'][+m - 1]} ${y}`
  }
  return p
}

function handleQuizClick(quiz) {
  if (quiz.quiz_program) {
    router.push(`/dashboard/quiz/${quiz.quiz_program.id}?type=program`)
  } else {
    router.push(`/dashboard/quiz/${quiz.id}`)
  }
}

onMounted(loadQuizzes)
</script>
