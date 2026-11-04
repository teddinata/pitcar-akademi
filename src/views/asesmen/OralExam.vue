<!-- Ujian lisan dipandu asesor (rubrik 6 aspek). Asesor/admin membacakan soal L1-L4
     dan merekam jawaban peserta dari perangkatnya. Soal baru terlihat saat rekaman
     mulai; waktu per soal dijaga server. Jawaban dangkal mendapat maksimal satu
     pertanyaan lanjutan dari AI yang dibacakan asesor. -->
<template>
  <div class="ujian min-h-screen pb-28">
    <header class="sticky top-0 z-20 bg-[color:var(--paper)] border-b-[2.5px] border-[color:var(--ink)]">
      <div class="max-w-3xl mx-auto px-4 h-16 flex items-center gap-3">
        <router-link :to="kembali" class="u-btn !min-h-10 !px-2.5" title="Kembali ke rincian peserta"><ChevronLeftIcon class="w-5 h-5" /></router-link>
        <div class="min-w-0 flex-1">
          <p class="text-xs font-bold text-[color:var(--ink-soft)] truncate">{{ data ? `Ujian lisan · ${data.cycle.name}` : 'Ujian lisan' }}</p>
          <p class="u-display font-extrabold leading-tight truncate">{{ data?.employee?.name || 'Ujian Lisan' }}</p>
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
          <p class="mt-2 text-[15px] text-[color:var(--ink-soft)] max-w-md mx-auto">Rekaman sedang ditranskripsi dan dinilai AI memakai rubrik 6 aspek. Pantau hasilnya, periksa jawaban bertanda, lalu sahkan di rincian peserta.</p>
          <router-link :to="kembali" class="u-btn u-btn-hitam mt-6">Buka rincian peserta</router-link>
        </section>

        <template v-else-if="current">
          <!-- Pembuka: aturan + persetujuan (sekali) -->
          <section v-if="!data.consent && stage === 'idle'" class="u-card p-5 sm:p-6" data-tour="lisan-aturan">
            <p class="u-chip u-chip-kuning">Sebelum mulai</p>
            <h1 class="u-display mt-3 text-[1.7rem] font-extrabold leading-tight">4 soal, Anda bacakan, peserta menjawab lisan</h1>
            <ol class="mt-4 space-y-3 text-[15px]">
              <li v-for="(t, i) in ATURAN" :key="i" class="flex gap-3"><span class="u-nomor !w-8 !h-8 !text-base">{{ i + 1 }}</span><span class="pt-1">{{ t }}</span></li>
            </ol>
            <label class="mt-5 flex gap-3 items-start rounded-xl border-2 border-[color:var(--ink)] p-3 bg-[#fffbe0]">
              <input v-model="consent" type="checkbox" class="u-check" />
              <span class="text-[15px] font-semibold">Peserta sudah diberi tahu dan setuju jawaban lisannya direkam, ditranskripsi, dan dinilai AI serta asesor. Rekaman disimpan 90 hari.</span>
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
                <p class="text-sm text-[color:var(--ink-soft)]">Pastikan ruangan tenang dan HP dekat peserta. Setelah tombol ditekan, bacakan soalnya; waktu langsung berjalan.</p>
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
                <p v-if="rec.level.value < 0.02 && rec.elapsed.value > 4" class="mt-2 text-sm font-bold text-[color:var(--merah-tua)]">Suara tidak terdengar. Dekatkan HP ke peserta atau cek izin mikrofon.</p>
                <button class="u-btn u-btn-hitam u-btn-besar w-full mt-4" :disabled="rec.state.value === 'stopping'" @click="selesai">
                  <StopIcon class="w-6 h-6" />{{ stage === 'followup-rec' ? 'Peserta selesai menjawab lanjutan' : 'Peserta selesai menjawab' }}
                </button>
              </div>

              <!-- Menunggu cek AI -->
              <div v-else-if="stage === 'processing'" class="mt-6 rounded-xl border-[2.5px] border-[color:var(--ink)] p-6 text-center bg-[color:var(--grid-bg)]" role="status">
                <ArrowPathIcon class="w-8 h-8 mx-auto animate-spin" />
                <p class="u-display mt-2 text-lg font-extrabold">AI sedang mendengarkan jawaban peserta…</p>
                <p class="text-sm text-[color:var(--ink-soft)]">Biasanya 10–20 detik. Jangan tutup halaman ini.</p>
              </div>

              <!-- Pertanyaan lanjutan -->
              <div v-else-if="current.state === 'followup'" class="mt-6 rounded-xl border-[2.5px] border-[color:var(--ink)] p-4 sm:p-5 bg-[#fffbe0]" data-tour="lisan-lanjutan">
                <p class="u-chip u-chip-kuning">Pertanyaan lanjutan dari AI · bacakan ke peserta</p>
                <p class="u-display mt-3 text-xl font-bold leading-snug">{{ current.followup_question }}</p>
                <p class="mt-2 text-sm text-[color:var(--ink-soft)]">Tekan rekam, bacakan pertanyaannya, lalu biarkan peserta menjawab (maksimal 2 menit). Lewati bila peserta tidak tahu.</p>
                <div class="mt-4 grid sm:grid-cols-2 gap-2">
                  <button class="u-btn u-btn-merah u-btn-besar" :disabled="stage !== 'idle'" @click="mulai('followup')"><MicrophoneIcon class="w-6 h-6" />Rekam jawaban lanjutan</button>
                  <button class="u-btn u-btn-besar" :disabled="stage !== 'idle'" @click="lewatiLanjutan">Lewati, lanjut soal berikutnya</button>
                </div>
              </div>

              <!-- Jawaban terekam, rekaman terputus (mis. halaman dimuat ulang) -->
              <div v-else-if="current.state === 'answering' && current.recorded" class="mt-6 rounded-xl border-2 border-[color:var(--ink)] p-4 bg-white">
                <p class="font-bold">Rekaman tadi terputus, tetapi jawaban peserta sudah tersimpan.</p>
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
  'Soal baru terlihat setelah Anda menekan "Buka soal & mulai rekam". Bacakan soalnya ke peserta; waktu langsung berjalan dan tidak bisa diulang.',
  'Minta peserta menjelaskan langkahnya urut beserta alasan teknisnya. Hindari memberi petunjuk jawaban.',
  'Bila jawaban kurang dalam, AI memberi satu pertanyaan lanjutan untuk Anda bacakan.',
  'Nilai dihitung AI dengan rubrik 6 aspek (suara Anda diabaikan), lalu Anda periksa dan sahkan di rincian peserta.',
]

const route = useRoute()
const oralId = Number(route.params.oralId)
const kembali = computed(() => (data.value ? `/dashboard/asesmen/rekap/${data.value.participant_id}` : '/dashboard/asesmen/rekap'))
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

const tour = useTour('asesor-lisan', () => [
  { title: 'Ujian lisan bersama peserta', text: 'Anda membacakan 4 soal dan merekam jawaban peserta dari HP atau laptop ini. AI menilai rekamannya dengan rubrik 6 aspek.' },
  { element: '[data-tour="lisan-tangga"]', title: 'Tangga soal L1–L4', text: 'Soal dikerjakan berurutan dari L1. Kotak kuning = soal sekarang, hitam = selesai. Persentase = bobot soal.', side: 'bottom' },
  { element: '[data-tour="lisan-aturan"]', title: 'Persetujuan peserta', text: 'Pastikan peserta setuju direkam, lalu centang sekali di awal.', side: 'bottom' },
  { element: '[data-tour="lisan-mulai"]', title: 'Soal terbuka saat rekaman mulai', text: 'Tekan bila peserta siap, lalu bacakan soalnya. Tekan "Peserta selesai menjawab" bila sudah cukup.', side: 'top' },
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
