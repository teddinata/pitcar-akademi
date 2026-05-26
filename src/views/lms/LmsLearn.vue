<template>
  <div class="h-screen flex flex-col bg-gray-900 overflow-hidden">
    <!-- Top header bar -->
    <div class="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 shrink-0 z-10">
      <button
        @click="$router.push('/dashboard/lms/enrollments')"
        class="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition-colors shrink-0"
      >
        <ChevronLeftIcon class="w-5 h-5" />
        <span class="hidden sm:inline">Kembali</span>
      </button>

      <div class="flex-1 min-w-0">
        <h1 class="font-semibold text-gray-900 text-sm truncate">{{ enrollment?.course_name || 'Memuat...' }}</h1>
        <div class="flex items-center gap-2 mt-0.5">
          <div class="h-1.5 w-28 bg-gray-100 rounded-full overflow-hidden">
            <div
              class="h-full bg-blue-500 rounded-full transition-all duration-500"
              :style="{ width: progressPercent + '%' }"
            ></div>
          </div>
          <span class="text-xs text-gray-400">{{ doneCount }}/{{ modules.length }} modul · {{ progressPercent }}%</span>
        </div>
      </div>

      <button
        v-if="enrollment && enrollment.status !== 'completed'"
        @click="finishCourse"
        :disabled="(!allDone && !isAdmin) || completing"
        class="shrink-0 px-3 py-1.5 text-xs font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-40 transition-colors"
      >{{ completing ? 'Menyimpan...' : 'Selesaikan Kursus' }}</button>
      <span
        v-else-if="enrollment?.status === 'completed'"
        class="shrink-0 text-xs text-green-600 font-semibold bg-green-50 px-3 py-1.5 rounded-lg border border-green-200"
      >✓ Selesai</span>
    </div>

    <!-- Main body: content + sidebar -->
    <div class="flex flex-1 min-h-0 overflow-hidden">
      <!-- Content viewer (main) -->
      <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
        <!-- Loading state -->
        <div v-if="loading" class="flex-1 flex items-center justify-center">
          <div class="w-10 h-10 border-4 border-blue-300 border-t-blue-600 rounded-full animate-spin"></div>
        </div>

        <!-- No module selected -->
        <div v-else-if="!activeModule" class="flex-1 flex flex-col items-center justify-center gap-4 p-8 text-gray-400">
          <BookOpenIcon class="w-16 h-16 opacity-30" />
          <p class="text-lg font-medium text-gray-300">Pilih modul untuk mulai belajar</p>
          <p class="text-sm text-gray-500">Gunakan daftar modul di sebelah kanan</p>
          <button
            v-if="modules.length"
            @click="activeModule = modules[0]"
            class="mt-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >Mulai dari Modul 1</button>
        </div>

        <!-- Content area -->
        <template v-else>
          <!-- Assessment Quiz UI -->
          <div v-if="activeModule.content_type === 'assessment'" class="flex-1 overflow-y-auto bg-gray-50">
            <!-- Loading -->
            <div v-if="quizLoading" class="flex items-center justify-center py-20">
              <div class="w-8 h-8 border-4 border-orange-300 border-t-orange-600 rounded-full animate-spin"></div>
            </div>
            <!-- No assessment -->
            <div v-else-if="!quizData" class="flex flex-col items-center justify-center py-20 gap-3 text-gray-400 px-4">
              <ClipboardDocumentCheckIcon class="w-14 h-14 opacity-30" />
              <p class="text-gray-300 font-medium">Belum ada quiz untuk modul ini</p>
              <p class="text-sm text-gray-500">Admin perlu membuat assessment terlebih dahulu</p>
            </div>
            <!-- Info screen -->
            <div v-else-if="quizState === 'info'" class="max-w-lg mx-auto py-8 px-4">
              <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div class="bg-orange-500 px-6 py-6">
                  <div class="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-3">
                    <ClipboardDocumentCheckIcon class="w-7 h-7 text-white" />
                  </div>
                  <h2 class="text-xl font-bold text-white">{{ quizData.name }}</h2>
                  <p v-if="quizData.instructions" class="text-orange-100 text-sm mt-1">{{ quizData.instructions }}</p>
                </div>
                <div class="p-6">
                  <div class="grid grid-cols-2 gap-3 mb-6">
                    <div class="bg-gray-50 rounded-xl p-3">
                      <p class="text-xs text-gray-400">Jumlah Soal</p>
                      <p class="text-2xl font-bold text-gray-900 mt-0.5">{{ quizData.questions?.length ?? quizData.question_count }}</p>
                    </div>
                    <div class="bg-gray-50 rounded-xl p-3">
                      <p class="text-xs text-gray-400">Nilai Lulus</p>
                      <p class="text-2xl font-bold text-gray-900 mt-0.5">{{ quizData.passing_score }}%</p>
                    </div>
                    <div class="bg-gray-50 rounded-xl p-3">
                      <p class="text-xs text-gray-400">Batas Waktu</p>
                      <p class="text-lg font-bold text-gray-900 mt-0.5">{{ quizData.time_limit_minutes ? quizData.time_limit_minutes + ' mnt' : 'Bebas' }}</p>
                    </div>
                    <div class="bg-gray-50 rounded-xl p-3">
                      <p class="text-xs text-gray-400">Maks Percobaan</p>
                      <p class="text-2xl font-bold text-gray-900 mt-0.5">{{ quizData.max_attempts || '∞' }}</p>
                    </div>
                  </div>
                  <button @click="startQuiz" class="w-full py-3 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition-colors">
                    Mulai Quiz
                  </button>
                </div>
              </div>
            </div>
            <!-- Taking screen -->
            <div v-else-if="quizState === 'taking'" class="max-w-2xl mx-auto py-6 px-4">
              <div class="space-y-4 mb-6">
                <div v-for="(q, qi) in quizData.questions" :key="q.id" class="bg-white rounded-xl border border-gray-200 p-5">
                  <div class="flex items-start gap-3 mb-4">
                    <span class="shrink-0 w-7 h-7 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-sm font-bold">{{ qi + 1 }}</span>
                    <p class="text-sm font-medium text-gray-900 leading-relaxed">{{ q.question_text }}</p>
                  </div>
                  <div v-if="q.question_type === 'multiple_choice' || q.question_type === 'true_false'" class="space-y-2 ml-10">
                    <label
                      v-for="opt in q.options" :key="opt.id"
                      class="flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors"
                      :class="answers[q.id] === String(opt.id) ? 'border-orange-400 bg-orange-50' : 'border-gray-200 hover:bg-gray-50'"
                    >
                      <input type="radio" :name="'q_' + q.id" :value="String(opt.id)" v-model="answers[q.id]" class="accent-orange-500" />
                      <span class="text-sm text-gray-800">{{ opt.text }}</span>
                    </label>
                  </div>
                  <div v-else-if="q.question_type === 'fill_blank'" class="ml-10">
                    <input type="text" v-model="answers[q.id]" placeholder="Ketik jawaban..." class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                  </div>
                  <div v-else class="ml-10">
                    <textarea v-model="answers[q.id]" rows="4" placeholder="Tulis jawaban..." class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"></textarea>
                    <p class="text-xs text-gray-400 mt-1">Jawaban akan diperiksa secara manual</p>
                  </div>
                </div>
              </div>
              <button @click="submitQuiz" :disabled="quizSubmitting" class="w-full py-3 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 disabled:opacity-50 transition-colors">
                {{ quizSubmitting ? 'Mengirim...' : 'Kirim Jawaban' }}
              </button>
            </div>
            <!-- Result screen -->
            <div v-else-if="quizState === 'result'" class="max-w-lg mx-auto py-8 px-4">
              <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden text-center">
                <div :class="quizResult?.passed ? 'bg-green-500' : 'bg-red-500'" class="px-6 py-8">
                  <p class="text-5xl font-bold text-white">{{ Math.round(quizResult?.score_percentage ?? 0) }}%</p>
                  <p class="text-white/80 mt-2 font-medium">{{ quizResult?.passed ? 'Selamat! Kamu Lulus' : 'Belum Lulus' }}</p>
                </div>
                <div class="p-6">
                  <p class="text-sm text-gray-500 mb-6">
                    <template v-if="quizResult?.passed">Modul ini telah ditandai selesai. Lanjutkan ke modul berikutnya.</template>
                    <template v-else>Nilai minimum lulus: {{ quizData?.passing_score }}%. Coba lagi untuk meningkatkan nilaimu.</template>
                  </p>
                  <div class="flex gap-3">
                    <button v-if="!quizResult?.passed" @click="retryQuiz" class="flex-1 py-2.5 border border-orange-500 text-orange-500 font-semibold rounded-xl hover:bg-orange-50 transition-colors">
                      Coba Lagi
                    </button>
                    <button
                      v-if="activeModuleIndex < modules.length - 1"
                      @click="nextModule"
                      class="flex-1 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
                    >Modul Berikutnya →</button>
                    <button
                      v-else-if="quizResult?.passed && allDone && enrollment?.status !== 'completed'"
                      @click="finishCourse"
                      :disabled="completing"
                      class="flex-1 py-2.5 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 disabled:opacity-50 transition-colors"
                    >{{ completing ? 'Menyimpan...' : 'Selesaikan Kursus' }}</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Video / Document / External content -->
          <div v-else class="flex-1 min-h-0 relative">
            <!-- YouTube: rendered by YT IFrame API (tracks actual playback position) -->
            <div v-if="isYouTube" ref="ytContainer" class="absolute inset-0 w-full h-full bg-black"></div>
            <!-- Other embeds: Google Drive, PDF, etc. -->
            <iframe
              v-else-if="activeEmbedUrl"
              :src="activeEmbedUrl"
              class="absolute inset-0 w-full h-full border-0"
              allow="autoplay; fullscreen; encrypted-media"
            ></iframe>
            <div v-else class="absolute inset-0 flex flex-col items-center justify-center gap-4 text-gray-400">
              <DocumentIcon class="w-16 h-16 opacity-30" />
              <div class="text-center">
                <p class="text-lg font-medium text-gray-300">{{ activeModule.name }}</p>
                <p class="text-sm text-gray-500 mt-1">Konten belum tersedia · Admin perlu menambahkan URL</p>
              </div>
              <button
                v-if="!modulesDone.has(activeModule.id)"
                @click="markDone(activeModule)"
                :disabled="saving === activeModule.id"
                class="mt-2 px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              >{{ saving === activeModule.id ? 'Menyimpan...' : 'Tandai Modul Selesai' }}</button>
              <span v-else class="mt-2 text-sm text-green-400 font-semibold">✓ Modul Selesai</span>
            </div>
          </div>

          <!-- Content footer -->
          <div class="bg-white border-t border-gray-100 px-4 py-2.5 flex items-center justify-between gap-3 shrink-0">
            <div class="flex items-center gap-2 min-w-0">
              <span class="text-xs text-gray-400 shrink-0">{{ activeModuleIndex + 1 }}/{{ modules.length }}</span>
              <span class="text-xs font-medium text-gray-700 truncate">{{ activeModule.name }}</span>
              <span class="shrink-0 text-xs px-1.5 py-0.5 rounded-full capitalize" :class="contentTypeClass(activeModule.content_type)">{{ activeModule.content_type }}</span>
            </div>
            <div class="flex items-center gap-2 shrink-0">
              <!-- Watch progress indicator -->
              <template v-if="videoGated && !modulesDone.has(activeModule.id)">
                <div class="flex items-center gap-1.5">
                  <div class="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      class="h-full rounded-full transition-all duration-700"
                      :class="videoWatchPercent >= 90 ? 'bg-green-500' : 'bg-blue-400'"
                      :style="{ width: videoWatchPercent + '%' }"
                    ></div>
                  </div>
                  <span class="text-xs tabular-nums" :class="videoWatchPercent >= 90 ? 'text-green-500 font-medium' : 'text-gray-400'">{{ videoWatchPercent }}%</span>
                </div>
              </template>
              <!-- Non-assessment: Selesai & Lanjut -->
              <template v-if="activeModule.content_type !== 'assessment'">
                <button
                  v-if="!modulesDone.has(activeModule.id)"
                  @click="markAndNext"
                  :disabled="saving === activeModule.id"
                  class="px-3 py-1.5 text-xs font-semibold text-white rounded-lg transition-colors disabled:opacity-50"
                  :class="videoGated && videoWatchPercent < 50 && !warnedOnce ? 'bg-amber-500 hover:bg-amber-600' : 'bg-green-600 hover:bg-green-700'"
                >{{ saving === activeModule.id ? '...' : 'Selesai & Lanjut →' }}</button>
                <template v-else>
                  <span class="text-xs text-green-600 font-semibold flex items-center gap-1">
                    <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" /></svg>
                    Selesai
                  </span>
                  <button
                    v-if="activeModuleIndex < modules.length - 1"
                    @click="nextModule"
                    class="px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >Berikut →</button>
                </template>
              </template>
              <!-- Assessment: show lulus badge once done -->
              <template v-else>
                <span v-if="modulesDone.has(activeModule.id)" class="text-xs text-green-600 font-semibold flex items-center gap-1">
                  <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" /></svg>
                  Lulus
                </span>
              </template>
            </div>
          </div>
        </template>
      </div>

      <!-- Desktop lesson sidebar -->
      <div class="w-72 bg-white border-l border-gray-100 flex-col shrink-0 hidden lg:flex">
        <div class="px-4 py-3 border-b border-gray-50 shrink-0">
          <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Daftar Modul</p>
          <p class="text-xs text-gray-400 mt-0.5">{{ doneCount }}/{{ modules.length }} selesai</p>
        </div>
        <div class="flex-1 overflow-y-auto">
          <div
            v-for="(mod, idx) in modules"
            :key="mod.id"
            @click="activeModule = mod"
            class="flex items-start gap-3 px-4 py-3.5 cursor-pointer transition-colors border-b border-gray-50 last:border-0"
            :class="activeModule?.id === mod.id ? 'bg-blue-50 border-r-2 border-r-blue-600' : 'hover:bg-gray-50'"
          >
            <div
              class="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mt-0.5 transition-colors"
              :class="modulesDone.has(mod.id) ? 'bg-green-500 text-white' : (activeModule?.id === mod.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500')"
            >
              <svg v-if="modulesDone.has(mod.id)" class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
              <span v-else>{{ idx + 1 }}</span>
            </div>
            <div class="flex-1 min-w-0">
              <p
                class="text-sm font-medium leading-snug"
                :class="activeModule?.id === mod.id ? 'text-blue-700' : 'text-gray-800'"
              >{{ mod.name }}</p>
              <p class="text-xs text-gray-400 mt-0.5 capitalize">{{ mod.content_type }} · {{ mod.duration_minutes }}m</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile lesson list (collapsible bottom panel) -->
    <div class="lg:hidden bg-white border-t border-gray-100 shrink-0">
      <button
        @click="showMobileList = !showMobileList"
        class="w-full px-4 py-2.5 flex items-center justify-between text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <span>Daftar Modul ({{ doneCount }}/{{ modules.length }})</span>
        <svg class="w-4 h-4 text-gray-400 transition-transform" :class="showMobileList ? 'rotate-180' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
        </svg>
      </button>
      <div v-if="showMobileList" class="max-h-52 overflow-y-auto border-t border-gray-50">
        <div
          v-for="(mod, idx) in modules"
          :key="mod.id"
          @click="activeModule = mod; showMobileList = false"
          class="flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors border-b border-gray-50 last:border-0"
          :class="activeModule?.id === mod.id ? 'bg-blue-50' : 'hover:bg-gray-50'"
        >
          <div
            class="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
            :class="modulesDone.has(mod.id) ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-500'"
          >
            <svg v-if="modulesDone.has(mod.id)" class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
            <span v-else>{{ idx + 1 }}</span>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-800 truncate">{{ mod.name }}</p>
            <p class="text-xs text-gray-400 capitalize">{{ mod.content_type }} · {{ mod.duration_minutes }}m</p>
          </div>
          <span v-if="modulesDone.has(mod.id)" class="text-xs text-green-600 font-medium shrink-0">✓</span>
        </div>
      </div>
    </div>

    <!-- Badge Celebration Modal -->
    <Teleport to="body">
      <Transition name="badge-pop">
        <div
          v-if="badgeModal.show"
          class="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4"
          @click.self="badgeModal.show = false"
        >
          <div class="bg-white rounded-3xl shadow-2xl w-full max-w-sm text-center overflow-hidden">
            <!-- Star burst top -->
            <div class="bg-gradient-to-br from-yellow-400 to-orange-500 px-6 pt-8 pb-6">
              <div class="text-6xl mb-2">🏆</div>
              <h2 class="text-white font-bold text-xl">Selamat!</h2>
              <p class="text-yellow-100 text-sm mt-1">Kursus berhasil diselesaikan</p>
            </div>
            <!-- Badge list -->
            <div class="px-6 py-5">
              <p class="text-sm font-semibold text-gray-700 mb-3">
                Kamu mendapatkan {{ badgeModal.badges.length }} lencana baru:
              </p>
              <div class="space-y-2 mb-5">
                <div
                  v-for="(name, i) in badgeModal.badges"
                  :key="i"
                  class="flex items-center gap-3 bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-2.5"
                >
                  <span class="text-2xl">🥇</span>
                  <span class="font-semibold text-yellow-800 text-sm">{{ name }}</span>
                </div>
              </div>
              <button
                @click="badgeModal.show = false"
                class="w-full py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold rounded-xl hover:opacity-90 transition-opacity text-sm"
              >Lanjutkan</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Course completed (no badge) confirmation -->
    <Teleport to="body">
      <Transition name="badge-pop">
        <div
          v-if="doneModal.show"
          class="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4"
          @click.self="doneModal.show = false"
        >
          <div class="bg-white rounded-3xl shadow-2xl w-full max-w-xs text-center overflow-hidden">
            <div class="bg-gradient-to-br from-green-500 to-emerald-600 px-6 pt-8 pb-5">
              <div class="text-5xl mb-2">✅</div>
              <h2 class="text-white font-bold text-lg">Kursus Selesai!</h2>
            </div>
            <div class="px-6 py-5">
              <p class="text-sm text-gray-600 mb-4">Kamu telah menyelesaikan kursus ini. Terus semangat belajar!</p>
              <button
                @click="doneModal.show = false"
                class="w-full py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors text-sm"
              >Oke</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <div v-if="toast" class="fixed bottom-20 lg:bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm px-5 py-2.5 rounded-full shadow-lg z-50">{{ toast }}</div>
  </div>
</template>

<style scoped>
.badge-pop-enter-active, .badge-pop-leave-active { transition: all 0.25s ease; }
.badge-pop-enter-from, .badge-pop-leave-to { opacity: 0; transform: scale(0.9); }
</style>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { lmsApi } from '../../services/lmsApi'
import { ChevronLeftIcon, BookOpenIcon, DocumentIcon, ClipboardDocumentCheckIcon } from '@heroicons/vue/24/outline'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const isAdmin = computed(() => authStore.user?.is_admin)
const enrollmentId = computed(() => parseInt(route.params.enrollmentId))

const loading = ref(true)
const enrollment = ref(null)
const modules = ref([])
const modulesDone = ref(new Set())
const activeModule = ref(null)
const saving = ref(null)
const completing = ref(false)
const toast = ref('')
const showMobileList = ref(false)

// Video watch tracking (reactive state)
const videoWatchPercent = ref(0)   // 0–100, tracks highest position reached
const videoGated = ref(false)      // true when current module has a watch gate
const ytContainer = ref(null)      // template ref for YouTube player div
// Internal handles (non-reactive)
let _vTimer = null
let _ytPlayer = null
let _ytPoll = null

// Quiz state
const quizData = ref(null)
const quizState = ref('info') // 'info' | 'taking' | 'result'
const answers = ref({})
const quizResult = ref(null)
const quizLoading = ref(false)
const quizSubmitting = ref(false)
const bestQuizScore = ref(0) // tracks highest score across all quizzes in this enrollment

// Completion modals
const badgeModal = reactive({ show: false, badges: [] })
const doneModal = reactive({ show: false })

const doneCount = computed(() => modulesDone.value.size)
const progressPercent = computed(() =>
  modules.value.length ? Math.round(doneCount.value / modules.value.length * 100) : 0
)
const allDone = computed(() => modules.value.length > 0 && doneCount.value >= modules.value.length)

const activeModuleIndex = computed(() => {
  if (!activeModule.value) return -1
  return modules.value.findIndex(m => m.id === activeModule.value.id)
})

const isYouTube = computed(() => /youtube\.com|youtu\.be/.test(activeModule.value?.content_url || ''))

const activeEmbedUrl = computed(() => {
  const url = activeModule.value?.content_url
  if (!url || isYouTube.value) return null   // YouTube handled by YT.Player, not iframe
  return getEmbedUrl(url)
})

function getEmbedUrl(url) {
  if (!url) return null
  const driveFile = url.match(/drive\.google\.com\/file\/d\/([^/?]+)/)
  if (driveFile) return `https://drive.google.com/file/d/${driveFile[1]}/preview`
  const driveOpen = url.match(/drive\.google\.com\/open\?id=([^&]+)/)
  if (driveOpen) return `https://drive.google.com/file/d/${driveOpen[1]}/preview`
  return url
}

function getYouTubeId(url) {
  return url.match(/youtube\.com\/watch\?.*v=([^&]+)/)?.[1]
    || url.match(/youtu\.be\/([^?]+)/)?.[1]
    || null
}

function cleanupVideoTracking() {
  clearInterval(_vTimer); _vTimer = null
  clearInterval(_ytPoll); _ytPoll = null
  if (_ytPlayer) { try { _ytPlayer.destroy() } catch (e) {} _ytPlayer = null }
}

function loadYTApi() {
  if (window.YT?.Player) return Promise.resolve()
  return new Promise(resolve => {
    const prev = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => { if (prev) prev(); resolve() }
    if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
      const s = document.createElement('script')
      s.src = 'https://www.youtube.com/iframe_api'
      document.head.appendChild(s)
    }
  })
}

async function startVideoTracking() {
  cleanupVideoTracking()
  videoWatchPercent.value = 0

  const mod = activeModule.value
  if (!mod || mod.content_type === 'assessment' || !mod.content_url) {
    videoGated.value = false
    return
  }
  if (isYouTube.value) {
    // YouTube: track actual playback position via IFrame API
    videoGated.value = true
    const videoId = getYouTubeId(mod.content_url)
    if (!videoId) return
    await loadYTApi()
    await nextTick()
    if (!ytContainer.value) return
    _ytPlayer = new window.YT.Player(ytContainer.value, {
      videoId,
      height: '100%',
      width: '100%',
      playerVars: { rel: 0, modestbranding: 1 },
      events: {
        onReady: () => {
          _ytPoll = setInterval(() => {
            if (!_ytPlayer) return
            try {
              const ct = _ytPlayer.getCurrentTime()
              const dur = _ytPlayer.getDuration()
              if (dur > 0) {
                const pct = Math.round(ct / dur * 100)
                if (pct > videoWatchPercent.value) videoWatchPercent.value = pct
              }
            } catch (e) {}
          }, 500)
        }
      }
    })
  } else {
    // Google Drive / non-YouTube: wall-clock proportional to duration_minutes
    const dur = mod.duration_minutes
    if (!dur || dur <= 0) {
      // No duration set → can't calculate accurate %, skip gating
      videoGated.value = false
      return
    }
    videoGated.value = true
    const required = dur * 60  // full duration in seconds (1:1 with real-time playback)
    let elapsed = 0
    _vTimer = setInterval(() => {
      elapsed++
      const pct = Math.min(100, Math.round(elapsed / required * 100))
      if (pct > videoWatchPercent.value) videoWatchPercent.value = pct
    }, 1000)
  }
}

function nextModule() {
  const idx = activeModuleIndex.value
  if (idx < modules.value.length - 1) activeModule.value = modules.value[idx + 1]
}

async function markDone(mod) {
  if (!mod || !enrollment.value || modulesDone.value.has(mod.id)) return
  saving.value = mod.id
  try {
    await lmsApi.enrollmentUpdateProgress({
      enrollment_id: enrollment.value.id,
      module_id: mod.id,
      progress_percentage: 100,
      video_watch_percentage: videoGated.value ? Math.round(videoWatchPercent.value) : null,
    })
    modulesDone.value = new Set([...modulesDone.value, mod.id])
  } catch (e) {
    showToast(e.message || 'Gagal update progress modul')
  } finally {
    saving.value = null
  }
}

const warnedOnce = ref(false)

async function markAndNext() {
  if (!activeModule.value) return
  if (videoGated.value && videoWatchPercent.value < 50 && !warnedOnce.value) {
    warnedOnce.value = true
    showToast('Anda belum selesai menonton — klik lagi untuk tetap lanjut')
    return
  }
  warnedOnce.value = false
  await markDone(activeModule.value)
  nextModule()
}

async function finishCourse() {
  if (!enrollment.value) return
  completing.value = true
  try {
    const res = await lmsApi.enrollmentComplete({ enrollment_id: enrollment.value.id, final_score: bestQuizScore.value })
    enrollment.value = { ...enrollment.value, status: 'completed' }
    const newBadges = res?.new_badges || []
    if (newBadges.length) {
      badgeModal.badges = newBadges
      badgeModal.show = true
    } else {
      doneModal.show = true
    }
  } catch (e) {
    showToast(e.message || 'Gagal menyelesaikan kursus')
  } finally {
    completing.value = false
  }
}

function contentTypeClass(t) {
  return {
    video: 'bg-red-50 text-red-600',
    document: 'bg-blue-50 text-blue-600',
    interactive: 'bg-purple-50 text-purple-600',
    assessment: 'bg-orange-50 text-orange-600',
    external_link: 'bg-green-50 text-green-600',
  }[t] || 'bg-gray-100 text-gray-500'
}

function showToast(msg, duration = 3000) { toast.value = msg; setTimeout(() => { toast.value = '' }, duration) }

async function loadQuiz(mod) {
  if (!mod || mod.content_type !== 'assessment') return
  quizData.value = null
  quizState.value = 'info'
  answers.value = {}
  quizResult.value = null
  quizLoading.value = true
  try {
    const searchRes = await lmsApi.assessmentSearch({ module_id: mod.id })
    const assessments = searchRes?.assessments ?? []
    if (!assessments.length) { quizLoading.value = false; return }
    const assessment = assessments[0]
    const questRes = await lmsApi.assessmentGetQuestions({ assessment_id: assessment.id })
    quizData.value = { ...assessment, questions: questRes?.questions ?? [] }
  } catch (e) {
    showToast(e.message || 'Gagal memuat quiz')
  } finally {
    quizLoading.value = false
  }
}

function startQuiz() {
  answers.value = {}
  quizState.value = 'taking'
}

async function submitQuiz() {
  if (!quizData.value || !enrollment.value) return
  quizSubmitting.value = true
  try {
    const res = await lmsApi.assessmentSubmit({
      assessment_id: quizData.value.id,
      answers: { ...answers.value },
    })
    quizResult.value = res
    quizState.value = 'result'
    if ((res?.score_percentage ?? 0) > bestQuizScore.value) bestQuizScore.value = res.score_percentage
    if (res?.passed) await markDone(activeModule.value)
  } catch (e) {
    showToast(e.message || 'Gagal mengirim jawaban')
  } finally {
    quizSubmitting.value = false
  }
}

function retryQuiz() {
  answers.value = {}
  quizState.value = 'taking'
}

watch(activeModule, (mod) => {
  if (mod?.content_type === 'assessment') loadQuiz(mod)
  warnedOnce.value = false
  startVideoTracking()
})

async function init() {
  loading.value = true
  try {
    const [progRes, courseSearchFn] = await Promise.all([
      lmsApi.myEnrollments({ include_progress: true, limit: 200 }),
      Promise.resolve(null),
    ])

    const allEnrollments = progRes?.enrollments ?? []
    const found = allEnrollments.find(e => e.id === enrollmentId.value)
    if (!found) { router.push('/dashboard/lms/enrollments'); return }
    enrollment.value = found

    // Fetch course modules
    const courseRes = await lmsApi.courseSearch({ search: found.course_name, include_stats: true, limit: 5 })
    const courses = courseRes?.courses ?? []
    const course = courses.find(c => c.name === found.course_name) || courses[0]
    modules.value = course?.modules ?? []

    // Pre-fill completed modules from progress
    if (found.module_progress?.length) {
      const doneNames = new Set(
        found.module_progress
          .filter(p => p.status === 'completed' || p.completion_percentage >= 100)
          .map(p => p.module_name)
      )
      modulesDone.value = new Set(
        modules.value.filter(m => doneNames.has(m.name)).map(m => m.id)
      )
    }

    // Auto-select: first incomplete module (or first module if all done)
    const firstIncomplete = modules.value.find(m => !modulesDone.value.has(m.id))
    activeModule.value = firstIncomplete ?? modules.value[0] ?? null
    startVideoTracking()
  } catch (e) {
    showToast(e.message || 'Gagal memuat data kursus')
  } finally {
    loading.value = false
  }
}

onMounted(init)
onUnmounted(cleanupVideoTracking)
</script>
