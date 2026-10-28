<!-- Menjawab studi kasus: tertulis per pertanyaan (tersimpan otomatis) dan/atau
     lisan lewat rekaman suara. Rekaman ditandai per pertanyaan supaya AI tahu
     jawaban mana untuk pertanyaan mana. -->
<template>
  <div class="min-h-screen clay-surface p-4 md:p-6">
    <div class="flex items-start gap-3 mb-5">
      <router-link to="/dashboard/lms/my-competency" class="mt-1 p-1.5 rounded-lg text-gray-500 hover:bg-white/70 hover:text-gray-800" title="Kembali">
        <ChevronLeftIcon class="w-5 h-5" />
      </router-link>
      <div class="min-w-0 flex-1">
        <p class="text-xs font-semibold text-gray-500">Studi kasus</p>
        <h1 class="text-xl md:text-2xl font-bold text-gray-900 leading-snug">{{ data?.case?.name || 'Memuat…' }}</h1>
      </div>
    </div>

    <div v-if="loading" class="h-64 rounded-2xl bg-white/70 animate-pulse"></div>
    <div v-else-if="error" class="clay-card p-6 text-center">
      <p class="text-red-600 font-medium">{{ error }}</p>
      <button @click="load" class="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium">Coba lagi</button>
    </div>

    <!-- Sudah dikirim -->
    <div v-else-if="data && data.state === 'submitted'" class="clay-card p-8 text-center max-w-xl mx-auto">
      <CheckCircleIcon class="w-12 h-12 mx-auto text-green-600" />
      <p class="mt-3 text-lg font-bold text-gray-900">Jawaban terkirim</p>
      <p class="text-sm text-gray-600 mt-1">Jawaban Anda sedang dinilai. Hasil asesmen bisa dilihat setelah periode ditutup.</p>
      <router-link to="/dashboard/lms/my-competency" class="inline-block mt-5 px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-bold">Kembali ke tugas</router-link>
    </div>

    <div v-else-if="data" class="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] gap-5 items-start">
      <!-- Skenario -->
      <section class="clay-card p-5 lg:sticky lg:top-4">
        <h2 class="text-sm font-bold text-gray-800">Situasi</h2>
        <p class="mt-2 text-[15px] leading-relaxed text-gray-800 whitespace-pre-line max-w-prose">{{ data.case.scenario }}</p>
        <p class="mt-4 text-xs text-gray-500">Saran waktu {{ data.case.time_limit_minutes }} menit. Jawab berdasarkan situasi di atas dan pengalaman kerja Anda: jelaskan langkah, alasan, dan keputusan Anda.</p>
      </section>

      <section class="space-y-4">
        <!-- Cara menjawab -->
        <div class="clay-card p-2 flex gap-1" role="tablist" aria-label="Cara menjawab">
          <button
            v-for="m in MODES" :key="m.key" role="tab" :aria-selected="mode === m.key"
            class="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors"
            :class="mode === m.key ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-white'"
            :disabled="recorder.active.value"
            @click="mode = m.key"
          ><component :is="m.icon" class="w-4 h-4" />{{ m.label }}</button>
        </div>

        <!-- Tertulis -->
        <template v-if="mode === 'written'">
          <div v-for="(q, i) in data.case.questions" :key="i" class="clay-card p-4">
            <label :for="`jawaban-${i}`" class="block text-sm font-semibold text-gray-900">
              <span class="text-gray-400 mr-1">{{ i + 1 }}.</span>{{ q }}
            </label>
            <textarea
              :id="`jawaban-${i}`" v-model="answers[i]" rows="5"
              class="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-300"
              placeholder="Tulis jawaban Anda…" @input="scheduleSave"
            ></textarea>
          </div>
          <p class="text-xs text-gray-500 text-right" aria-live="polite">{{ saveLabel }}</p>
        </template>

        <!-- Lisan -->
        <template v-else>
          <div class="clay-card p-5">
            <ol class="space-y-2">
              <li
                v-for="(q, i) in data.case.questions" :key="i"
                class="flex gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors"
                :class="i === currentQ && recorder.active.value ? 'bg-red-50 ring-1 ring-red-200 text-gray-900' : i < currentQ && recorder.active.value ? 'text-gray-400' : 'text-gray-700'"
              >
                <span class="font-bold w-5 shrink-0">{{ i + 1 }}.</span>
                <span class="leading-relaxed">{{ q }}</span>
              </li>
            </ol>

            <div class="mt-5 border-t border-gray-100 pt-5">
              <label v-if="!data.consent && !recorder.active.value" class="flex items-start gap-2 text-sm text-gray-700 mb-4 cursor-pointer">
                <input v-model="consent" type="checkbox" class="mt-0.5 rounded border-gray-300 text-[#b70000] focus:ring-red-300" />
                <span>Saya setuju jawaban lisan saya direkam, ditranskripsi, dan dinilai AI untuk asesmen ini. Rekaman suara dihapus otomatis setelah 90 hari.</span>
              </label>

              <div class="flex flex-wrap items-center gap-3">
                <button
                  v-if="!recorder.active.value"
                  class="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#b70000] text-white font-bold hover:bg-[#930000] disabled:bg-gray-300"
                  :disabled="(!consent && !data.consent) || recorder.state.value === 'starting'"
                  @click="mulaiRekam"
                ><MicrophoneIcon class="w-5 h-5" />{{ recorder.state.value === 'starting' ? 'Menyiapkan…' : rekamanAda ? 'Rekam lanjutan' : 'Mulai rekam' }}</button>
                <template v-else>
                  <span class="inline-flex items-center gap-2 font-mono text-lg tabular-nums text-gray-900" aria-live="off">
                    <span class="w-2.5 h-2.5 rounded-full" :class="recorder.state.value === 'recording' ? 'bg-red-600 animate-pulse' : 'bg-gray-400'"></span>
                    {{ mmss(recorder.elapsed.value) }}
                  </span>
                  <span class="h-2 w-20 rounded-full bg-gray-100 overflow-hidden" aria-hidden="true">
                    <span class="block h-full bg-green-500 transition-[width] duration-75" :style="{ width: Math.round(recorder.level.value * 100) + '%' }"></span>
                  </span>
                  <button
                    v-if="currentQ < data.case.questions.length - 1"
                    class="px-4 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-bold hover:bg-black"
                    :disabled="recorder.state.value === 'stopping'" @click="pertanyaanBerikut"
                  >Lanjut ke pertanyaan {{ currentQ + 2 }}</button>
                  <button
                    class="px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-700 bg-white ring-1 ring-gray-200 hover:bg-gray-50"
                    :disabled="recorder.state.value === 'stopping'"
                    @click="recorder.state.value === 'paused' ? recorder.resume() : recorder.pause()"
                  >{{ recorder.state.value === 'paused' ? 'Lanjutkan' : 'Jeda' }}</button>
                  <button
                    class="px-3 py-2.5 rounded-xl text-sm font-semibold text-red-700 bg-white ring-1 ring-red-200 hover:bg-red-50"
                    :disabled="recorder.state.value === 'stopping'" @click="selesaiRekam"
                  >{{ recorder.state.value === 'stopping' ? 'Menyimpan…' : 'Selesai rekam' }}</button>
                </template>
              </div>
              <p v-if="recorder.active.value" class="mt-3 text-xs text-gray-500">Sedang menjawab pertanyaan {{ currentQ + 1 }}. Tekan "Lanjut" saat pindah pertanyaan.</p>
              <p v-if="recorder.error.value" class="mt-3 text-sm text-red-700" role="alert">{{ recorder.error.value }}</p>
              <p v-if="recorder.upload.value.stopped" class="mt-3 text-sm text-amber-800" role="alert">
                Koneksi terputus, potongan rekaman belum terkirim.
                <button class="font-bold underline" @click="recorder.retryUpload()">Kirim ulang</button>
              </p>
              <p v-else-if="recorder.upload.value.pending > 1" class="mt-3 text-xs text-gray-500">Mengunggah {{ recorder.upload.value.pending }} potongan…</p>
            </div>
          </div>

          <div v-if="rekaman.length" class="clay-card p-4">
            <h3 class="text-sm font-semibold text-gray-800">Rekaman tersimpan</h3>
            <ul class="mt-2 divide-y divide-gray-100">
              <li v-for="r in rekaman" :key="r.id" class="flex items-center gap-3 py-2 text-sm">
                <MicrophoneIcon class="w-4 h-4 text-gray-400" />
                <span class="flex-1">Bagian {{ r.sequence }} · {{ mmss(r.duration) }}</span>
                <button
                  v-if="!recorder.active.value" class="text-xs font-semibold text-gray-500 hover:text-red-700"
                  @click="hapusRekaman(r)"
                >Hapus</button>
              </li>
            </ul>
          </div>
        </template>

        <!-- Kirim -->
        <div class="clay-card p-4">
          <div v-if="!confirming" class="flex flex-wrap items-center justify-between gap-3">
            <p class="text-xs text-gray-500">{{ ringkasJawaban }}</p>
            <button
              class="px-5 py-2.5 rounded-xl bg-[#b70000] text-white text-sm font-bold hover:bg-[#930000] disabled:bg-gray-300"
              :disabled="!bisaKirim" @click="confirming = true"
            >Kirim jawaban</button>
          </div>
          <div v-else>
            <p class="text-sm font-semibold text-gray-900">Kirim jawaban sekarang?</p>
            <p class="text-sm text-gray-600 mt-0.5">Setelah dikirim, jawaban tidak bisa diubah lagi.</p>
            <div class="mt-3 flex justify-end gap-2">
              <button class="px-4 py-2 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100" :disabled="submitting" @click="confirming = false">Periksa lagi</button>
              <button class="px-5 py-2 rounded-lg bg-[#b70000] text-white text-sm font-bold hover:bg-[#930000]" :disabled="submitting" @click="kirim">{{ submitting ? 'Mengirim…' : 'Ya, kirim' }}</button>
            </div>
          </div>
          <p v-if="submitError" class="mt-2 text-sm text-red-700" role="alert">{{ submitError }}</p>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import { CheckCircleIcon, ChevronLeftIcon, MicrophoneIcon, PencilSquareIcon } from '@heroicons/vue/24/outline'
import { competencyApi } from '../../services/competencyApi'
import { useAnswerRecorder } from '../../composables/useAnswerRecorder'
import { mmss } from '../../utils/competency'

const MODES = [
  { key: 'written', label: 'Jawab tertulis', icon: PencilSquareIcon },
  { key: 'oral', label: 'Jawab lisan (rekam)', icon: MicrophoneIcon },
]

const route = useRoute()
const attemptId = Number(route.params.attemptId)
const loading = ref(true)
const error = ref('')
const data = ref(null)
const mode = ref('written')
const answers = reactive([])
const consent = ref(false)
const currentQ = ref(0)
const confirming = ref(false)
const submitting = ref(false)
const submitError = ref('')
const saveState = ref('idle') // idle | saving | saved | error
const recorder = useAnswerRecorder()
let saveTimer = null

const rekaman = computed(() => (data.value?.recordings || []).filter((r) => r.size > 0))
const rekamanAda = computed(() => rekaman.value.length > 0)
const terisi = computed(() => answers.filter((a) => (a || '').trim()).length)
const bisaKirim = computed(() => !recorder.active.value && !recorder.upload.value.pending && (terisi.value > 0 || rekamanAda.value))
const ringkasJawaban = computed(() => {
  const n = data.value?.case?.questions?.length || 0
  const bagian = []
  if (terisi.value) bagian.push(`${terisi.value}/${n} pertanyaan dijawab tertulis`)
  if (rekamanAda.value) bagian.push(`${rekaman.value.length} rekaman lisan`)
  if (recorder.active.value) return 'Selesaikan rekaman dulu sebelum mengirim.'
  return bagian.length ? bagian.join(' · ') : 'Belum ada jawaban.'
})
const saveLabel = computed(() => ({ saving: 'Menyimpan…', saved: 'Tersimpan otomatis', error: 'Gagal menyimpan, coba ketik lagi' }[saveState.value] || ''))

async function load() {
  loading.value = true
  error.value = ''
  try {
    data.value = await competencyApi.attempt(attemptId)
    answers.splice(0, answers.length, ...data.value.case.questions.map((_q, i) => data.value.answers[i] || ''))
    if (!terisi.value && data.value.recordings.some((r) => r.size > 0)) mode.value = 'oral'
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

function scheduleSave() {
  clearTimeout(saveTimer)
  saveTimer = setTimeout(simpan, 1200)
}
async function simpan() {
  clearTimeout(saveTimer)
  saveTimer = null
  saveState.value = 'saving'
  try {
    await competencyApi.saveAttempt(attemptId, [...answers])
    saveState.value = 'saved'
  } catch {
    saveState.value = 'error'
  }
}

async function mulaiRekam() {
  currentQ.value = 0
  const ok = await recorder.start(attemptId)
  if (ok) {
    data.value.consent = true
    recorder.marker('q1', `Pertanyaan 1: ${data.value.case.questions[0]}`)
  }
}
function pertanyaanBerikut() {
  currentQ.value += 1
  const i = currentQ.value
  recorder.marker(`q${i + 1}`, `Pertanyaan ${i + 1}: ${data.value.case.questions[i]}`)
}
async function selesaiRekam() {
  await recorder.stop()
  const segar = await competencyApi.attempt(attemptId)
  data.value.recordings = segar.recordings
}
async function hapusRekaman(r) {
  try {
    await competencyApi.recordingDiscard(r.id)
    data.value.recordings = data.value.recordings.filter((x) => x.id !== r.id)
  } catch (e) {
    recorder.error.value = e.message
  }
}

async function kirim() {
  submitting.value = true
  submitError.value = ''
  try {
    data.value = await competencyApi.submitAttempt(attemptId, [...answers])
    confirming.value = false
  } catch (e) {
    submitError.value = e.message
  } finally {
    submitting.value = false
  }
}

onMounted(load)
onBeforeUnmount(() => { if (saveTimer) simpan() })
</script>
