<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Loading -->
    <div v-if="loading" class="flex flex-col items-center justify-center min-h-screen gap-3">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#B70000]"></div>
      <p class="text-sm text-gray-500">Memuat hasil quiz...</p>
    </div>

    <template v-else-if="result">
      <!-- Hero section -->
      <div
        class="px-4 sm:px-6 pt-12 pb-10 text-white text-center"
        :class="result.is_passed
          ? 'bg-gradient-to-b from-green-600 to-green-700'
          : 'bg-gradient-to-b from-[#B70000] to-[#950000]'"
      >
        <!-- Pass/fail icon -->
        <div class="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center shadow-md"
          :class="result.is_passed ? 'bg-green-500' : 'bg-red-700'">
          <svg v-if="result.is_passed" class="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
          </svg>
          <svg v-else class="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>

        <h1 class="text-4xl sm:text-5xl font-black tracking-tight">{{ result.score?.toFixed(1) }}%</h1>
        <p class="text-lg font-bold mt-1.5">{{ result.is_passed ? 'LULUS' : 'TIDAK LULUS' }}</p>
        <p class="text-sm opacity-90 mt-2">{{ result.quiz?.name }}</p>
      </div>

      <div class="max-w-3xl mx-auto px-4 py-5 space-y-4">
        <!-- Score card -->
        <div class="grid grid-cols-3 gap-2.5 sm:gap-3">
          <div class="bg-white rounded-xl p-4 shadow-sm text-center">
            <div class="text-xl font-bold text-gray-900">{{ result.total_earned }}</div>
            <div class="text-xs text-gray-500 mt-1">Poin Didapat</div>
          </div>
          <div class="bg-white rounded-xl p-4 shadow-sm text-center">
            <div class="text-xl font-bold text-gray-900">{{ result.total_weight }}</div>
            <div class="text-xs text-gray-500 mt-1">Total Poin</div>
          </div>
          <div class="bg-white rounded-xl p-4 shadow-sm text-center">
            <div class="text-xl font-bold" :class="result.is_passed ? 'text-green-600' : 'text-red-600'">
              {{ result.session?.passing_score || '—' }}%
            </div>
            <div class="text-xs text-gray-500 mt-1">Min. Lulus</div>
          </div>
        </div>

        <!-- Message / Weak areas -->
        <div v-if="result.weak_areas" class="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <h3 class="text-sm font-bold text-amber-800 mb-2 flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Area yang Perlu Dipelajari Ulang
          </h3>
          <pre class="text-sm text-amber-700 whitespace-pre-wrap font-sans">{{ result.weak_areas }}</pre>
        </div>

        <!-- Needs retraining notice -->
        <div v-if="result.needs_retraining" class="bg-red-50 border border-red-200 rounded-xl p-4">
          <p class="text-sm text-red-700 font-medium">
            Kamu perlu mengikuti sesi coaching ulang. Kepala bengkel akan menghubungi kamu.
          </p>
        </div>

        <!-- Answer breakdown -->
        <div v-if="result.answers?.length" class="bg-white rounded-xl shadow-sm overflow-hidden">
          <div class="px-4 py-3 border-b border-gray-100">
            <h3 class="font-semibold text-gray-900 text-sm">Pembahasan Jawaban</h3>
          </div>
          <div class="divide-y divide-gray-50">
            <div
              v-for="(ans, i) in result.answers"
              :key="ans.question_id"
              class="px-4 py-4"
            >
              <div class="flex items-start gap-2 mb-2">
                <span
                  class="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
                  :class="ans.is_correct ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
                >
                  {{ ans.is_correct ? '✓' : '✗' }}
                </span>
                <p class="text-sm text-gray-800 leading-snug">{{ ans.question_text }}</p>
              </div>

              <div class="ml-7 space-y-1 text-xs">
                <div class="flex gap-2">
                  <span class="text-gray-400 w-20 shrink-0">Jawaban kamu:</span>
                  <span :class="ans.is_correct ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'">
                    {{ ans.chosen_answer || '(tidak dijawab)' }}
                  </span>
                </div>
                <div v-if="!ans.is_correct" class="flex gap-2">
                  <span class="text-gray-400 w-20 shrink-0">Jawaban benar:</span>
                  <span class="text-green-700 font-semibold">{{ ans.correct_answer }}</span>
                </div>
                <div v-if="ans.explanation" class="mt-2 p-2 bg-blue-50 rounded-lg text-blue-700 leading-relaxed">
                  {{ ans.explanation }}
                </div>
                <div class="flex items-center gap-2 text-gray-400">
                  <span>{{ ans.score_earned }} / {{ ans.score_earned + (ans.is_correct ? 0 : 0) }} poin</span>
                  <span v-if="ans.sop_section">· {{ ans.sop_section }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="space-y-2 pb-6">
          <button
            @click="router.push('/dashboard/quiz')"
            class="w-full py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-[#B70000] to-[#950000] shadow-md transition-all active:scale-95"
          >
            Kembali ke Beranda
          </button>
          <button
            @click="router.push('/dashboard/quiz/history')"
            class="w-full py-3.5 rounded-xl font-semibold text-gray-700 bg-white border border-gray-200 transition-all active:scale-95"
          >
            Lihat Riwayat Quiz
          </button>
        </div>
      </div>
    </template>

    <!-- Error -->
    <div v-else class="flex flex-col items-center justify-center min-h-screen gap-4 px-4">
      <p class="text-gray-500 text-center">Hasil quiz tidak ditemukan.</p>
      <button @click="router.push('/dashboard/quiz')" class="text-[#B70000] font-semibold">
        Kembali ke Beranda
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { quizApi } from '../../services/quizApi'

const router = useRouter()
const route = useRoute()

const loading = ref(true)
const result = ref(null)

const resultId = parseInt(route.params.resultId)

async function loadResult() {
  loading.value = true
  try {
    const data = await quizApi.result(resultId)
    result.value = data.result
  } catch (e) {
    if (e.code === 'unauthorized') router.push('/login')
  } finally {
    loading.value = false
  }
}

onMounted(loadResult)
</script>
