<template>
  <div class="min-h-screen clay-surface">
    <!-- Loading -->
    <div v-if="loading" class="flex flex-col items-center justify-center min-h-screen gap-3">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#B70000]"></div>
      <p class="text-sm text-gray-500">Memuat hasil quiz...</p>
    </div>

    <template v-else-if="result">
      <!-- Hero section -->
      <div
        class="px-4 sm:px-6 pt-12 pb-10 text-white text-center"
        :class="result.essay_pending
          ? 'bg-gradient-to-b from-purple-600 to-purple-700'
          : result.is_passed
            ? 'bg-gradient-to-b from-green-600 to-green-700'
            : 'bg-gradient-to-b from-[#B70000] to-[#950000]'"
      >
        <!-- Icon -->
        <div class="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center shadow-md"
          :class="result.essay_pending ? 'bg-purple-500' : result.is_passed ? 'bg-green-500' : 'bg-red-700'">
          <!-- Essay pending: clock icon -->
          <svg v-if="result.essay_pending" class="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <svg v-else-if="result.is_passed" class="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
          </svg>
          <svg v-else class="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>

        <h1 class="text-4xl sm:text-5xl font-black tracking-tight">{{ result.score?.toFixed(1) }}%</h1>
        <p class="text-lg font-bold mt-1.5">
          {{ result.essay_pending ? 'MENUNGGU PENILAIAN ESAI' : result.is_passed ? 'LULUS' : 'TIDAK LULUS' }}
        </p>
        <p class="text-sm opacity-90 mt-2">{{ result.quiz?.name }}</p>
        <p v-if="result.essay_pending" class="text-sm opacity-80 mt-1">
          Skor di atas adalah skor soal pilihan ganda. Score final akan diperbarui setelah supervisor menilai soal esai.
        </p>
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

        <!-- Essay pending banner -->
        <div v-if="result.essay_pending"
             class="bg-purple-50 border border-purple-200 rounded-xl p-4 flex items-start gap-3">
          <span class="text-purple-500 text-xl shrink-0">✍️</span>
          <div>
            <p class="text-sm font-semibold text-purple-800">Menunggu Penilaian Esai</p>
            <p class="text-xs text-purple-600 mt-0.5 leading-relaxed">
              Quiz ini mengandung soal esai yang belum dinilai. Supervisor akan menilai jawabanmu dan
              score final akan diperbarui setelahnya. Kamu akan diberitahu hasilnya.
            </p>
          </div>
        </div>

        <!-- Answer breakdown -->
        <div v-if="result.answers?.length" class="bg-white rounded-xl shadow-sm overflow-hidden">
          <div class="px-4 py-3 border-b border-gray-100">
            <h3 class="font-semibold text-gray-900 text-sm">Pembahasan Jawaban</h3>
          </div>
          <div class="divide-y divide-gray-50">
            <div
              v-for="ans in result.answers"
              :key="ans.question_id"
              class="px-4 py-4"
            >
              <!-- Essay answer -->
              <template v-if="ans.question_type === 'essay'">
                <div class="flex items-start gap-2 mb-2">
                  <span class="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
                    :class="ans.graded_by ? (ans.essay_score >= 60 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700') : 'bg-purple-100 text-purple-600'">
                    {{ ans.graded_by ? (ans.essay_score >= 60 ? '✓' : '~') : '✍' }}
                  </span>
                  <p class="text-sm text-gray-800 leading-snug">{{ ans.question_text }}</p>
                </div>
                <div class="ml-7 space-y-2 text-xs">
                  <div class="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p class="text-gray-500 mb-1 font-semibold uppercase tracking-wide text-[10px]">Jawaban kamu:</p>
                    <p class="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {{ ans.essay_answer || '(tidak dijawab)' }}
                    </p>
                  </div>
                  <div v-if="ans.graded_by"
                       class="flex items-center justify-between p-2 rounded-lg"
                       :class="ans.essay_score >= 60 ? 'bg-green-50' : 'bg-amber-50'">
                    <span class="text-gray-500">Nilai supervisor:</span>
                    <span class="font-bold text-sm"
                      :class="ans.essay_score >= 60 ? 'text-green-700' : 'text-amber-700'">
                      {{ ans.essay_score.toFixed(0) }} / 100
                    </span>
                  </div>
                  <div v-else class="flex items-center gap-1.5 text-purple-600">
                    <svg class="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Menunggu penilaian supervisor...
                  </div>
                  <div class="text-gray-400">
                    <span>Bobot: {{ ans.weight }} poin</span>
                    <span v-if="ans.sop_section"> · {{ ans.sop_section }}</span>
                  </div>
                </div>
              </template>

              <!-- MC / True-False answer -->
              <template v-else>
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
                  <div v-if="!ans.is_correct && ans.correct_answer" class="flex gap-2">
                    <span class="text-gray-400 w-20 shrink-0">Jawaban benar:</span>
                    <span class="text-green-700 font-semibold">{{ ans.correct_answer }}</span>
                  </div>
                  <div v-if="ans.explanation" class="mt-2 p-2 bg-blue-50 rounded-lg text-blue-700 leading-relaxed">
                    {{ ans.explanation }}
                  </div>
                  <div class="flex items-center gap-2 text-gray-400">
                    <span>{{ ans.score_earned }} / {{ ans.weight }} poin</span>
                    <span v-if="ans.sop_section">· {{ ans.sop_section }}</span>
                  </div>
                </div>
              </template>
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
