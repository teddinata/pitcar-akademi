<template>
  <div class="min-h-screen clay-surface">
    <!-- Loading -->
    <div v-if="loading" class="flex flex-col items-center justify-center min-h-screen gap-3">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#B70000]"></div>
      <p class="text-sm text-gray-500">Memuat jawaban...</p>
    </div>

    <template v-else-if="detail">
      <!-- Header bar -->
      <div class="glass-header sticky top-0 z-10">
        <div class="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <button @click="goBack" class="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-all active:scale-95">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>
          <div class="flex-1 min-w-0">
            <h1 class="font-bold text-gray-900 text-sm truncate">{{ detail.employee?.name }}</h1>
            <p class="text-xs text-gray-500 truncate">{{ detail.quiz?.name }}</p>
          </div>
          <!-- Essay pending badge -->
          <span v-if="detail.session?.has_essay && !detail.session?.essay_graded"
            class="px-2 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 shrink-0">
            Esai belum dinilai
          </span>
        </div>
      </div>

      <div class="max-w-3xl mx-auto px-4 py-5 space-y-4">
        <!-- Employee + result summary -->
        <div class="bg-white rounded-2xl shadow-sm p-4">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0"
              :class="detail.session?.is_passed ? 'bg-green-500' : 'bg-red-500'">
              {{ initials(detail.employee?.name) }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-semibold text-gray-900">{{ detail.employee?.name }}</p>
              <p class="text-xs text-gray-500">{{ detail.employee?.job_title }} · {{ detail.employee?.department }}</p>
              <p class="text-xs text-gray-400 mt-0.5">
                Submit: {{ formatDate(detail.session?.submitted_at) }}
              </p>
            </div>
            <div class="text-right shrink-0">
              <div class="text-2xl font-black" :class="detail.session?.is_passed ? 'text-green-600' : 'text-red-600'">
                {{ (detail.result?.score ?? detail.session?.score ?? 0).toFixed(1) }}%
              </div>
              <div class="text-xs font-semibold mt-0.5" :class="detail.session?.is_passed ? 'text-green-600' : 'text-red-600'">
                {{ detail.session?.is_passed ? 'LULUS' : 'TIDAK LULUS' }}
              </div>
            </div>
          </div>

          <div class="grid grid-cols-3 gap-2 text-center text-xs">
            <div class="bg-gray-50 rounded-xl p-3">
              <div class="font-bold text-gray-900 text-base">{{ detail.result?.total_earned ?? '—' }}</div>
              <div class="text-gray-500 mt-0.5">Poin Didapat</div>
            </div>
            <div class="bg-gray-50 rounded-xl p-3">
              <div class="font-bold text-gray-900 text-base">{{ detail.result?.total_weight ?? '—' }}</div>
              <div class="text-gray-500 mt-0.5">Total Poin</div>
            </div>
            <div class="bg-gray-50 rounded-xl p-3">
              <div class="font-bold text-gray-900 text-base">{{ detail.quiz?.passing_score }}%</div>
              <div class="text-gray-500 mt-0.5">Min. Lulus</div>
            </div>
          </div>

          <!-- Weak areas -->
          <div v-if="detail.result?.weak_areas" class="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
            <p class="text-xs font-bold text-amber-800 mb-1">Area Lemah</p>
            <pre class="text-xs text-amber-700 whitespace-pre-wrap font-sans">{{ detail.result.weak_areas }}</pre>
          </div>

          <!-- Essay pending notice -->
          <div v-if="detail.session?.has_essay && !detail.session?.essay_graded"
            class="mt-3 p-3 bg-purple-50 border border-purple-200 rounded-xl flex items-center gap-2">
            <span class="text-purple-500">✍️</span>
            <p class="text-xs text-purple-700 font-medium">
              Terdapat soal esai yang belum dinilai. Nilai langsung di bawah atau lewat halaman "Nilai Esai".
            </p>
          </div>
        </div>

        <!-- Answer breakdown -->
        <div class="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div class="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <h2 class="font-semibold text-gray-900 text-sm">
              Detail Jawaban
              <span class="ml-1.5 text-xs font-normal text-gray-400">({{ detail.answers?.length }} soal)</span>
            </h2>
            <!-- Quick stats -->
            <div class="flex items-center gap-2 text-xs">
              <span class="text-green-600 font-semibold">{{ correctCount }} benar</span>
              <span class="text-gray-300">·</span>
              <span class="text-red-500 font-semibold">{{ wrongCount }} salah</span>
              <template v-if="essayCount">
                <span class="text-gray-300">·</span>
                <span class="text-purple-600 font-semibold">{{ essayCount }} esai</span>
              </template>
            </div>
          </div>

          <div class="divide-y divide-gray-50">
            <div v-for="(ans, idx) in detail.answers" :key="ans.answer_id" class="px-4 py-4">

              <!-- Essay -->
              <template v-if="ans.question_type === 'essay'">
                <div class="flex items-start gap-2 mb-2">
                  <span class="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
                    :class="ans.graded_by ? (ans.essay_score >= 60 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700') : 'bg-purple-100 text-purple-600'">
                    {{ ans.graded_by ? (ans.essay_score >= 60 ? '✓' : '~') : '✍' }}
                  </span>
                  <div class="flex-1">
                    <p class="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-0.5">
                      Soal {{ idx + 1 }} · Esai · {{ ans.weight }} poin
                      <span v-if="ans.sop_section"> · {{ ans.sop_section }}</span>
                    </p>
                    <p class="text-sm text-gray-800 leading-snug">{{ ans.question_text }}</p>
                  </div>
                </div>

                <div class="ml-7 space-y-2">
                  <!-- Employee answer -->
                  <div class="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs">
                    <p class="text-gray-400 font-semibold uppercase tracking-wide text-[10px] mb-1">Jawaban karyawan</p>
                    <p class="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {{ ans.essay_answer || '(tidak dijawab)' }}
                    </p>
                  </div>

                  <!-- Graded display -->
                  <div v-if="ans.graded_by"
                    class="flex items-center justify-between p-2.5 rounded-xl text-xs"
                    :class="ans.essay_score >= 60 ? 'bg-green-50' : 'bg-amber-50'">
                    <div>
                      <span class="text-gray-500">Dinilai oleh: </span>
                      <span class="font-semibold" :class="ans.essay_score >= 60 ? 'text-green-700' : 'text-amber-700'">
                        {{ ans.graded_by }}
                      </span>
                      <span v-if="ans.graded_at" class="text-gray-400 ml-1">· {{ formatDate(ans.graded_at) }}</span>
                    </div>
                    <span class="font-bold text-sm" :class="ans.essay_score >= 60 ? 'text-green-700' : 'text-amber-700'">
                      {{ ans.essay_score.toFixed(0) }} / 100
                    </span>
                  </div>

                  <!-- Inline grading form -->
                  <div v-else class="p-3 bg-purple-50 border border-purple-200 rounded-xl">
                    <p class="text-xs text-purple-700 font-semibold mb-2">Beri Nilai (0–100)</p>
                    <!-- Quick buttons -->
                    <div class="flex flex-wrap gap-1.5 mb-2">
                      <button v-for="v in [0, 50, 60, 70, 80, 90, 100]" :key="v"
                        @click="setEssayScore(ans.answer_id, v)"
                        class="px-2.5 py-1 rounded-lg text-xs font-bold transition-all active:scale-95"
                        :class="pendingScores[ans.answer_id] === v
                          ? 'bg-purple-600 text-white'
                          : 'bg-white border border-purple-200 text-purple-700 hover:bg-purple-100'">
                        {{ v }}
                      </button>
                    </div>
                    <div class="flex items-center gap-2">
                      <input
                        type="number" min="0" max="100"
                        :value="pendingScores[ans.answer_id] ?? ''"
                        @input="e => setEssayScore(ans.answer_id, parseInt(e.target.value))"
                        class="w-20 border border-purple-200 rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-purple-300"
                        placeholder="0–100"
                      />
                      <span class="text-xs text-gray-400">/ 100</span>
                      <span v-if="pendingScores[ans.answer_id] != null" class="text-xs text-gray-500 ml-1">
                        = {{ ((pendingScores[ans.answer_id] / 100) * ans.weight).toFixed(1) }} poin
                      </span>
                    </div>
                  </div>
                </div>
              </template>

              <!-- MC / TF -->
              <template v-else>
                <div class="flex items-start gap-2 mb-2">
                  <span class="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
                    :class="ans.is_correct ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'">
                    {{ ans.is_correct ? '✓' : '✗' }}
                  </span>
                  <div class="flex-1">
                    <p class="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-0.5">
                      Soal {{ idx + 1 }} · {{ ans.question_type === 'true_false' ? 'Benar/Salah' : 'Pilihan Ganda' }}
                      · {{ ans.score_earned }}/{{ ans.weight }} poin
                      <span v-if="ans.sop_section"> · {{ ans.sop_section }}</span>
                    </p>
                    <p class="text-sm text-gray-800 leading-snug">{{ ans.question_text }}</p>
                  </div>
                </div>

                <div class="ml-7 space-y-1 text-xs">
                  <!-- Options (MC only) -->
                  <div v-if="ans.question_type === 'multiple_choice'" class="grid grid-cols-1 gap-1 mb-1.5">
                    <div v-for="opt in visibleOptions(ans)" :key="opt.key"
                      class="flex items-center gap-2 px-3 py-1.5 rounded-lg"
                      :class="optionClass(opt.key, ans)">
                      <span class="font-bold uppercase w-4 shrink-0">{{ opt.key }}.</span>
                      <span>{{ opt.label }}</span>
                      <span v-if="opt.key === ans.correct_answer" class="ml-auto text-green-600 font-bold text-[10px]">BENAR</span>
                      <span v-else-if="opt.key === ans.chosen_answer && !ans.is_correct" class="ml-auto text-red-500 font-bold text-[10px]">PILIHAN</span>
                    </div>
                  </div>

                  <!-- TF simple -->
                  <template v-else>
                    <div class="flex items-center gap-2 text-xs">
                      <span class="text-gray-400 w-28 shrink-0">Jawaban karyawan:</span>
                      <span class="font-semibold" :class="ans.is_correct ? 'text-green-600' : 'text-red-600'">
                        {{ ans.chosen_answer === 'true' ? 'Benar' : ans.chosen_answer === 'false' ? 'Salah' : '(tidak dijawab)' }}
                      </span>
                    </div>
                    <div v-if="!ans.is_correct" class="flex items-center gap-2 text-xs">
                      <span class="text-gray-400 w-28 shrink-0">Jawaban benar:</span>
                      <span class="font-semibold text-green-600">
                        {{ ans.correct_answer === 'true' ? 'Benar' : 'Salah' }}
                      </span>
                    </div>
                  </template>

                  <!-- Explanation -->
                  <div v-if="ans.explanation" class="mt-1.5 p-2 bg-blue-50 rounded-lg text-blue-700 leading-relaxed">
                    {{ ans.explanation }}
                  </div>
                </div>
              </template>

              <!-- Tanggapan trainer (semua tipe soal, tampil ke karyawan) -->
              <div class="ml-7 mt-2.5">
                <label class="block text-[10px] font-bold uppercase tracking-wide text-indigo-500 mb-1">
                  Tanggapan / evaluasi trainer
                </label>
                <textarea
                  v-model="pendingFeedback[ans.answer_id]"
                  rows="2"
                  placeholder="Tulis tanggapan / contoh jawaban benar untuk karyawan…"
                  class="w-full px-3 py-2 text-xs border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-y bg-indigo-50/40"
                ></textarea>
              </div>
            </div>
          </div>
        </div>

        <!-- Save button (shows if any pending scores OR feedback changes) -->
        <div v-if="hasPendingScores || hasFeedbackChanges" class="sticky bottom-4">
          <button @click="saveEssayGrades" :disabled="saving"
            class="w-full py-3.5 rounded-2xl font-bold text-white shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
            :class="saving ? 'bg-purple-400' : 'bg-gradient-to-r from-purple-600 to-purple-700'">
            <div v-if="saving" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            <span>{{ saving ? 'Menyimpan...' : saveButtonLabel }}</span>
          </button>
        </div>

        <!-- Success toast -->
        <div v-if="saveSuccess"
          class="fixed bottom-6 left-1/2 -translate-x-1/2 bg-green-600 text-white text-sm font-semibold px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 z-50">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
          </svg>
          Perubahan berhasil disimpan
        </div>

        <div class="pb-6"></div>
      </div>
    </template>

    <!-- Error -->
    <div v-else class="flex flex-col items-center justify-center min-h-screen gap-4 px-4">
      <p class="text-gray-500 text-center">{{ error || 'Data tidak ditemukan.' }}</p>
      <button @click="goBack" class="text-[#B70000] font-semibold text-sm">Kembali</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { quizApi } from '../../services/quizApi'

const router = useRouter()
const route = useRoute()

const sessionId = parseInt(route.params.sessionId)
const loading = ref(true)
const saving = ref(false)
const saveSuccess = ref(false)
const error = ref('')
const detail = ref(null)

// essay scores waiting to be saved: { answerId: score }
const pendingScores = ref({})
// trainer feedback per answer: { answerId: text }
const pendingFeedback = ref({})
const initialFeedback = ref({})   // snapshot untuk deteksi perubahan

const correctCount = computed(() =>
  detail.value?.answers?.filter(a => a.question_type !== 'essay' && a.is_correct).length ?? 0
)
const wrongCount = computed(() =>
  detail.value?.answers?.filter(a => a.question_type !== 'essay' && !a.is_correct).length ?? 0
)
const essayCount = computed(() =>
  detail.value?.answers?.filter(a => a.question_type === 'essay').length ?? 0
)
const hasPendingScores = computed(() => Object.keys(pendingScores.value).length > 0)
const pendingScoreCount = computed(() => Object.keys(pendingScores.value).length)

const changedFeedbackIds = computed(() =>
  Object.keys(pendingFeedback.value).filter(
    id => (pendingFeedback.value[id] || '') !== (initialFeedback.value[id] || '')
  )
)
const hasFeedbackChanges = computed(() => changedFeedbackIds.value.length > 0)

const saveButtonLabel = computed(() => {
  if (hasPendingScores.value) return `Simpan Nilai & Tanggapan`
  return `Simpan Tanggapan (${changedFeedbackIds.value.length})`
})

function initials(name) {
  if (!name) return '?'
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

function formatDate(dt) {
  if (!dt) return '—'
  return new Date(dt).toLocaleString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function visibleOptions(ans) {
  return [
    { key: 'a', label: ans.option_a },
    { key: 'b', label: ans.option_b },
    { key: 'c', label: ans.option_c },
    { key: 'd', label: ans.option_d },
  ].filter(o => o.label)
}

function optionClass(key, ans) {
  if (key === ans.correct_answer && key === ans.chosen_answer)
    return 'bg-green-100 border border-green-300 text-green-800'
  if (key === ans.correct_answer)
    return 'bg-green-50 border border-green-200 text-green-700'
  if (key === ans.chosen_answer)
    return 'bg-red-50 border border-red-200 text-red-700'
  return 'bg-gray-50 border border-transparent text-gray-600'
}

function setEssayScore(answerId, val) {
  if (isNaN(val)) return
  const clamped = Math.max(0, Math.min(100, val))
  pendingScores.value = { ...pendingScores.value, [answerId]: clamped }
}

async function saveEssayGrades() {
  if (!hasPendingScores.value && !hasFeedbackChanges.value) return
  saving.value = true
  try {
    // Gabung skor esai + tanggapan trainer per answer_id
    const map = {}
    for (const [id, score] of Object.entries(pendingScores.value)) {
      map[id] = { answer_id: parseInt(id), score }
    }
    for (const id of changedFeedbackIds.value) {
      map[id] = {
        ...(map[id] || { answer_id: parseInt(id) }),
        feedback: pendingFeedback.value[id] || '',
      }
    }
    await quizApi.gradeEssays(sessionId, Object.values(map))
    pendingScores.value = {}
    saveSuccess.value = true
    setTimeout(() => { saveSuccess.value = false }, 3000)
    // Reload to show updated scores & feedback
    await loadDetail()
  } catch (e) {
    alert('Gagal menyimpan: ' + e.message)
  } finally {
    saving.value = false
  }
}

async function loadDetail() {
  loading.value = true
  error.value = ''
  try {
    const data = await quizApi.adminSessionDetail(sessionId)
    detail.value = data
    // Prefill tanggapan trainer + snapshot untuk deteksi perubahan
    const fb = {}
    ;(data.answers || []).forEach(a => { fb[a.answer_id] = a.trainer_feedback || '' })
    pendingFeedback.value = { ...fb }
    initialFeedback.value = { ...fb }
  } catch (e) {
    if (e.code === 'unauthorized') router.push('/login')
    else error.value = e.message
  } finally {
    loading.value = false
  }
}

function goBack() {
  if (window.history.length > 1) router.back()
  else router.push('/dashboard/quiz/manage')
}

onMounted(loadDetail)
</script>
