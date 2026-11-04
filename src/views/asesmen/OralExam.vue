<!-- Ujian lisan mandiri (rubrik 6 aspek). Satu soal per layar, berjenjang L1-L4.
     Soal baru terlihat saat rekaman mulai; waktu per soal dijaga server.
     Jawaban dangkal mendapat maksimal satu pertanyaan lanjutan dari AI. -->
<template>
  <div class="ujian min-h-screen pb-28">
    <header class="sticky top-0 z-20 bg-[color:var(--paper)] border-b-[2.5px] border-[color:var(--ink)]">
      <div class="max-w-3xl mx-auto px-4 h-16 flex items-center gap-3">
        <router-link to="/dashboard/lms/my-competency" class="u-btn !min-h-10 !px-2.5" title="Kembali"><ChevronLeftIcon class="w-5 h-5" /></router-link>
        <div class="min-w-0 flex-1">
          <p class="text-xs font-bold text-[color:var(--ink-soft)] truncate">{{ data?.cycle.name || 'Ujian lisan' }}</p>
          <p class="u-display font-extrabold leading-tight truncate">Ujian Lisan Mandiri</p>
        </div>
        <span v-if="timerSisa !== null" class="u-timer" :class="timerSisa <= 15 ? 'is-danger' : timerSisa <= 45 ? 'is-warn' : ''" role="timer" aria-live="off">
          <ClockIcon class="w-5 h-5" />{{ mmss(timerSisa) }}
        </span>
        <button class="u-btn !min-h-10 !px-2.5" title="Cara pakai" data-tour="lisan-help" @click="tour.replay()"><QuestionMarkCircleIcon class="w-5 h-5" /></button>
      </div>
      <!-- Tangga level L1-L4 -->
      <div v-if="data" class="max-w-3xl mx-auto px-4 pb-3 flex gap-2" data-tour="lisan-tangga">
        <div v-for="l in data.lines" :key="l.id" class="flex-1 flex items-center gap-1.5 rounded-lg border-2 border-[color:var(--ink)] px-2 py-1.5"
          :class="l.state === 'done' ? 'bg-[color:var(--ink)] text-white' : current?.id === l.id ? 'bg-[color:var(--stabilo)]' : 'bg-white'">
          <span class="u-display font-extrabold">L{{ l.level }}</span>
          <span class="text-[11px] font-bold opacity-80">{{ l.weight }}%</span>
          <CheckIcon v-if="l.state === 'done'" class="w-4 h-4 ml-auto" />
        </div>
      </div>
    </header>

    <main class="max-w-3xl mx-auto px-4 pt-6">
      <div v-if="loading" class="u-card h-64 animate-pulse"></div>
      <div v-else-if="error" class="u-card p-6 text-center">
        <p class="font-bold text-[color:var(--merah)]">{{ error }}</p>
        <button class="u-btn u-btn-hitam mt-3" @click="load">Coba lagi</button>
      </div>

      <template v-else-if="data">
        <!-- Selesai -->
        <section v-if="data.state === 'submitted'" class="u-card p-6 sm:p-8 text-center">
          <span class="u-stempel is-anim">TERKIRIM</span>
          <p class="u-display mt-6 text-2xl font-extrabold">Ujian lisan selesai</p>
          <p class="mt-2 text-[15px] text-[color:var(--ink-soft)] max-w-md mx-auto">Rekaman Anda sedang dinilai AI memakai rubrik 6 aspek, lalu dicek asesor. Hasil (persen dan jenjang) muncul di Asesmen Saya setelah periode ditutup.</p>
          <router-link to="/dashboard/lms/my-competency" class="u-btn u-btn-hitam mt-6">Kembali ke Asesmen Saya</router-link>
        </section>

        <template v-else-if="current">
          <!-- Pembuka: aturan + persetujuan (sekali) -->
          <section v-if="!data.consent && stage === 'idle'" class="u-card p-5 sm:p-6" data-tour="lisan-aturan">
            <p class="u-chip u-chip-kuning">Sebelum mulai</p>
            <h1 class="u-display mt-3 text-[1.7rem] font-extrabold leading-tight">4 soal, dijawab dengan suara</h1>
            <ol class="mt-4 space-y-3 text-[15px]">
              <li v-for="(t, i) in ATURAN" :key="i" class="flex gap-3"><span class="u-nomor !w-8 !h-8 !text-base">{{ i + 1 }}</span><span class="pt-1">{{ t }}</span></li>
            </ol>
            <label class="mt-5 flex gap-3 items-start rounded-xl border-2 border-[color:var(--ink)] p-3 bg-[#fffbe0]">
              <input v-model="consent" type="checkbox" class="u-check" />
              <span class="text-[15px] font-semibold">Saya setuju jawaban lisan saya direkam, ditranskripsi, dan dinilai AI serta asesor. Rekaman disimpan 90 hari.</span>
            </label>
          </section>

          <!-- Kartu soal -->
          <section class="u-card p-5 sm:p-6 mt-5" :class="!data.consent && stage === 'idle' ? 'mt-5' : 'mt-0'" data-tour="lisan-soal">
            <div class="flex items-center gap-3">
              <span class="u-nomor">L{{ current.level }}</span>
              <div>
                <p class="u-display text-lg font-extrabold leading-tight">Soal level {{ current.level }}</p>
                <p class="text-sm text-[color:var(--ink-soft)]">Bobot {{ current.weight }}% · waktu menjawab {{ Math.round((current.answer_seconds || 180) / 60) }} menit</p>
              </div>
            </div>

            <!-- Belum dibuka -->
            <div v-if="current.state === 'pending' || (current.state === 'answering' && !current.recorded && stage === 'idle')" class="mt-5">
              <div class="rounded-xl border-2 border-dashed border-[color:var(--ink)] p-6 text-center bg-[color:var(--grid-bg)]">
                <LockClosedIcon class="w-8 h-8 mx-auto" />
                <p class="mt-2 font-bold">Soal terbuka saat rekaman mulai</p>
                <p class="text-sm text-[color:var(--ink-soft)]">Siapkan diri di tempat yang tenang. Setelah tombol ditekan, waktu langsung berjalan.</p>
              </div>
              <button class="u-btn u-btn-merah u-btn-besar w-full mt-4" :disabled="(!data.consent && !consent) || stage !== 'idle'" data-tour="lisan-mulai" @click="mulai('main')">
                <MicrophoneIcon class="w-6 h-6" />{{ current.state === 'answering' ? 'Rekam ulang jawaban (mikrofon tadi gagal)' : 'Buka soal & mulai rekam' }}
              </button>
            </div>

            <!-- Soal terbuka -->
            <template v-else>
              <p class="u-display mt-5 text-[1.35rem] sm:text-[1.55rem] font-bold leading-snug">{{ current.question }}</p>

              <!-- Sedang merekam jawaban utama / lanjutan -->
              <div v-if="rec.active.value" class="mt-6 rounded-xl border-[2.5px] border-[color:var(--ink)] p-4 bg-[#fff2f2]" aria-live="polite">
                <p v-if="stage === 'followup-rec'" class="text-sm font-extrabold text-[color:var(--merah-tua)]">Menjawab pertanyaan lanjutan</p>
                <div class="flex items-center gap-3">
                  <span class="u-rec-dot w-3.5 h-3.5 rounded-full bg-[color:var(--merah)]"></span>
                  <span class="font-extrabold">Merekam</span>
                  <span class="tabular-nums font-bold">{{ mmss(rec.elapsed.value) }}</span>
                  <div class="u-meter ml-auto" aria-hidden="true">
                    <span v-for="i in 7" :key="i" :style="{ height: `${Math.max(4, Math.min(28, rec.level.value * 40 * (1 - Math.abs(i - 4) / 5)))}px` }"></span>
                  </div>
                </div>
                <p v-if="rec.level.value < 0.02 && rec.elapsed.value > 4" class="mt-2 text-sm font-bold text-[color:var(--merah-tua)]">Suara tidak terdengar. Dekatkan HP ke mulut atau cek izin mikrofon.</p>
                <button class="u-btn u-btn-hitam u-btn-besar w-full mt-4" :disabled="rec.state.value === 'stopping'" @click="selesai">
                  <StopIcon class="w-6 h-6" />{{ stage === 'followup-rec' ? 'Selesai menjawab pertanyaan lanjutan' : 'Selesai menjawab' }}
                </button>
              </div>

              <!-- Menunggu cek AI -->
              <div v-else-if="stage === 'processing'" class="mt-6 rounded-xl border-[2.5px] border-[color:var(--ink)] p-6 text-center bg-[color:var(--grid-bg)]" role="status">
                <ArrowPathIcon class="w-8 h-8 mx-auto animate-spin" />
                <p class="u-display mt-2 text-lg font-extrabold">Sedang mendengarkan jawabanmu…</p>
                <p class="text-sm text-[color:var(--ink-soft)]">Biasanya 10–20 detik. Jangan tutup halaman ini.</p>
              </div>

              <!-- Pertanyaan lanjutan -->
              <div v-else-if="current.state === 'followup'" class="mt-6 rounded-xl border-[2.5px] border-[color:var(--ink)] p-4 sm:p-5 bg-[#fffbe0]" data-tour="lisan-lanjutan">
                <p class="u-chip u-chip-kuning">Pertanyaan lanjutan · sekali saja</p>
                <p class="u-display mt-3 text-xl font-bold leading-snug">{{ current.followup_question }}</p>
                <p class="mt-2 text-sm text-[color:var(--ink-soft)]">Jawab dengan suara, maksimal 2 menit. Lewati bila tidak tahu.</p>
                <div class="mt-4 grid sm:grid-cols-2 gap-2">
                  <button class="u-btn u-btn-merah u-btn-besar" :disabled="stage !== 'idle'" @click="mulai('followup')"><MicrophoneIcon class="w-6 h-6" />Jawab sekarang</button>
                  <button class="u-btn u-btn-besar" :disabled="stage !== 'idle'" @click="lewatiLanjutan">Lewati, lanjut soal berikutnya</button>
                </div>
              </div>

              <!-- Jawaban terekam, rekaman terputus (mis. halaman dimuat ulang) -->
              <div v-else-if="current.state === 'answering' && current.recorded" class="mt-6 rounded-xl border-2 border-[color:var(--ink)] p-4 bg-white">
                <p class="font-bold">Rekaman tadi terputus, tetapi jawaban Anda sudah tersimpan.</p>
                <button class="u-btn u-btn-hitam u-btn-besar w-full mt-3" :disabled="stage !== 'idle'" @click="kirimJawaban">Kirim jawaban & lanjut</button>
              </div>
            </template>

            <p v-if="rec.error.value || pesan" class="mt-4 rounded-lg border-2 border-[color:var(--merah)] bg-[color:var(--merah-muda)] p-3 text-sm font-bold text-[color:var(--merah-tua)]" role="alert">{{ rec.error.value || pesan }}</p>
            <div v-if="rec.upload.value.failing" class="mt-3 flex items-center gap-2 text-sm font-bold">
              <ExclamationTriangleIcon class="w-5 h-5" />Sinyal lemah, sebagian rekaman belum terkirim.
              <button class="u-btn !min-h-9" @click="rec.retryUpload()">Kirim ulang</button>
            </div>
          </section>
        </template>
      </template>
    </main>
  </div>
</template>

<script setup>
import '@fontsource-variable/bricolage-grotesque'
import '../../styles/exam.css'
import '../../styles/asesmen.css'
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import {
  ArrowPathIcon, CheckIcon, ChevronLeftIcon, ClockIcon, ExclamationTriangleIcon, LockClosedIcon, MicrophoneIcon,
  QuestionMarkCircleIcon, StopIcon,
} from '@heroicons/vue/24/outline'
import { competencyApi } from '../../services/competencyApi'
import { useAnswerRecorder } from '../../composables/useAnswerRecorder'
import { useTour } from '../../composables/useTour'
import { mmss } from '../../utils/competency'

const ATURAN = [
  'Ada 4 soal berjenjang, L1 sampai L4, dikerjakan berurutan. Soal L3 dan L4 bobotnya lebih besar.',
  'Soal baru terlihat setelah Anda menekan "Buka soal & mulai rekam". Waktu langsung berjalan dan tidak bisa diulang.',
  'Jawab dengan suara seperti menjelaskan ke asesor: sebut langkahnya urut dan alasan teknisnya.',
  'Bila jawaban kurang dalam, muncul satu pertanyaan lanjutan. Ini normal, bukan berarti salah.',
  'Nilai dihitung AI dengan rubrik 6 aspek, lalu diperiksa asesor sebelum disahkan.',
]

const route = useRoute()
const oralId = Number(route.params.oralId)
const loading = ref(true)
const error = ref('')
const data = ref(null)
const consent = ref(false)
const stage = ref('idle') // idle | main-rec | followup-rec | processing
const pesan = ref('')
const offset = ref(0) // server_now - waktu perangkat (ms)
const now = ref(Date.now())
let clock = null
let autoStop = false

const rec = useAnswerRecorder({
  startRecording: (target, mime) => (target.kind === 'main'
    ? competencyApi.oralStart(target.lineId, consent.value || data.value?.consent, mime)
    : competencyApi.oralFollowupStart(target.lineId, mime)),
})

const current = computed(() => data.value?.lines.find((l) => l.state !== 'done') || null)
const parseUtc = (v) => (v ? new Date(`${v.replace(' ', 'T')}Z`).getTime() : null)
const timerSisa = computed(() => {
  const l = current.value
  if (!l) return null
  const batas = l.state === 'answering' && l.deadline ? parseUtc(l.deadline)
    : l.state === 'followup' && stage.value === 'followup-rec' && l.followup_deadline ? parseUtc(l.followup_deadline) : null
  if (!batas) return null
  return Math.max(0, Math.round((batas - (now.value + offset.value)) / 1000))
})

function terima(oral) {
  data.value = oral
  offset.value = parseUtc(oral.server_now) - Date.now()
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    terima(await competencyApi.oral(oralId))
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
  if (data.value && data.value.state !== 'submitted') nextTick(() => tour.autoStart())
}

async function mulai(kind) {
  pesan.value = ''
  const line = current.value
  stage.value = kind === 'main' ? 'main-rec' : 'followup-rec'
  const ok = await rec.start({ kind, lineId: line.id }, { reset: true })
  if (!ok) { stage.value = 'idle'; return }
  const hasil = rec.lastStart()
  if (hasil?.oral) terima(hasil.oral)
}

async function selesai() {
  const kind = stage.value
  const line = current.value
  const status = await rec.stop()
  if (status?.failing) pesan.value = 'Sebagian rekaman belum terkirim. Tekan Kirim ulang bila sinyal sudah bagus; jawaban tetap diproses.'
  stage.value = 'processing'
  try {
    terima(kind === 'followup-rec' ? await competencyApi.oralFollowupFinish(line.id) : await competencyApi.oralFinish(line.id))
  } catch (e) {
    pesan.value = e.message
    await load()
  } finally {
    stage.value = 'idle'
    autoStop = false
  }
}

async function kirimJawaban() {
  stage.value = 'processing'
  try { terima(await competencyApi.oralFinish(current.value.id)) } catch (e) { pesan.value = e.message } finally { stage.value = 'idle' }
}

async function lewatiLanjutan() {
  stage.value = 'processing'
  try { terima(await competencyApi.oralFollowupFinish(current.value.id)) } catch (e) { pesan.value = e.message } finally { stage.value = 'idle' }
}

const tour = useTour('peserta-lisan', () => [
  { title: 'Ujian lisan mandiri', text: 'Anda menjawab 4 soal dengan suara, tanpa asesor di samping. Penilaian memakai rubrik yang sama dengan ujian lisan bersama asesor.' },
  { element: '[data-tour="lisan-tangga"]', title: 'Tangga soal L1–L4', text: 'Soal dikerjakan berurutan dari L1. Kotak kuning = soal sekarang, hitam = selesai. Persentase = bobot soal.', side: 'bottom' },
  { element: '[data-tour="lisan-aturan"]', title: 'Baca aturannya', text: 'Centang persetujuan rekaman sekali di awal.', side: 'bottom' },
  { element: '[data-tour="lisan-mulai"]', title: 'Soal terbuka saat rekaman mulai', text: 'Tekan tombol ini bila sudah siap. Soal muncul dan waktu berjalan. Tekan "Selesai menjawab" bila sudah cukup.', side: 'top' },
  { element: '[data-tour="lisan-help"]', title: 'Lihat lagi kapan saja', text: 'Tombol ? memutar panduan ini lagi.', side: 'bottom', align: 'end' },
])

onMounted(() => {
  load()
  clock = setInterval(() => {
    now.value = Date.now()
    // Waktu habis: rekaman dihentikan dan jawaban yang sudah terekam dikirim.
    if (timerSisa.value === 0 && rec.active.value && !autoStop && rec.state.value === 'recording') {
      autoStop = true
      selesai()
    }
  }, 500)
})
onBeforeUnmount(() => clearInterval(clock))
</script>
