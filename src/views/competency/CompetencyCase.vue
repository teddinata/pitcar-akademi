<!-- Lembar tes studi kasus kompetensi (peserta).
     Sampul -> Mulai (waktu berjalan di server) -> satu soal per layar dengan
     navigator bulatan LJK -> kirim / terkirim otomatis saat waktu habis.
     Pilihan ganda langsung dinilai; esai dijawab tertulis atau direkam suara
     (rekaman ditandai per soal supaya AI tahu jawaban mana untuk soal mana). -->
<template>
  <div ref="rootEl" class="ujian min-h-screen pb-28 lg:pb-10">
    <!-- ── Memuat / gagal ── -->
    <div v-if="loading" class="p-4 md:p-6 max-w-3xl mx-auto">
      <div class="u-card h-72 animate-pulse"></div>
    </div>
    <div v-else-if="error" class="p-4 md:p-6 max-w-xl mx-auto">
      <div class="u-card p-6 text-center">
        <p class="u-display text-xl font-extrabold">Lembar tes tidak bisa dibuka</p>
        <p class="mt-1 text-sm text-[color:var(--ink-soft)]">{{ error }}</p>
        <div class="mt-4 flex justify-center gap-2">
          <router-link to="/dashboard/lms/my-competency" class="u-btn">Ke daftar tugas</router-link>
          <button class="u-btn u-btn-hitam" @click="load">Coba lagi</button>
        </div>
      </div>
    </div>

    <!-- ── Terkirim ── -->
    <div v-else-if="submitted" class="p-4 md:p-6 max-w-xl mx-auto">
      <div class="u-card p-6 sm:p-8 text-center">
        <span class="u-stempel is-anim">TERKIRIM</span>
        <h1 class="u-display mt-6 text-2xl font-extrabold leading-tight">{{ data.case.name }}</h1>
        <p class="mt-2 text-[15px] leading-relaxed text-[color:var(--ink-soft)]">
          <template v-if="data.auto_submitted">Waktu habis, jadi jawaban yang sudah tersimpan dikirim otomatis.</template>
          <template v-else>Terima kasih, jawaban Anda sudah diterima.</template>
          Pilihan ganda langsung dinilai{{ data.case.essay_count ? ', esai dinilai AI dalam beberapa menit' : '' }}.
          Hasil asesmen bisa dilihat setelah admin menutup periode.
        </p>
        <p class="mt-3 text-xs text-[color:var(--ink-soft)]">Dikirim {{ fmtDateTime(data.submitted_at) }}</p>
        <router-link to="/dashboard/lms/my-competency" class="u-btn u-btn-hitam mt-6">Kembali ke daftar tugas</router-link>
      </div>
    </div>

    <!-- ── Sampul (belum mulai) ── -->
    <div v-else-if="!started" class="p-4 md:p-6 max-w-3xl mx-auto max-lg:pb-40">
      <div class="flex items-center justify-between gap-2 mb-4">
        <router-link to="/dashboard/lms/my-competency" class="u-btn !min-h-10 !px-3" aria-label="Kembali ke daftar tugas"><ChevronLeftIcon class="w-5 h-5" /></router-link>
        <button class="u-btn !min-h-10 !px-3" data-tour="tes-help" @click="tour.replay()"><QuestionMarkCircleIcon class="w-5 h-5" />Cara mengerjakan</button>
      </div>

      <section class="u-card p-5 sm:p-7">
        <div class="flex flex-wrap gap-2">
          <span class="u-chip u-chip-kuning">{{ data.profile }}</span>
          <span class="u-chip">{{ data.cycle.name }}</span>
        </div>
        <h1 class="u-display mt-4 text-[1.85rem] sm:text-[2.4rem] font-extrabold leading-[1.08]">{{ data.case.name }}</h1>

        <div class="mt-6 grid grid-cols-3 gap-2 sm:gap-3" data-tour="tes-fakta">
          <div v-for="f in fakta" :key="f.label" class="rounded-xl border-2 border-[color:var(--ink)] px-3 py-3 sm:px-4" :class="f.cls">
            <p class="u-display text-3xl sm:text-4xl font-extrabold tabular-nums leading-none">{{ f.value }}</p>
            <p class="mt-1.5 text-xs sm:text-sm font-semibold leading-tight">{{ f.label }}</p>
          </div>
        </div>

        <ol class="mt-6 space-y-2.5" data-tour="tes-aturan">
          <li v-for="(a, i) in ATURAN" :key="i" class="flex gap-3 text-[15px] leading-relaxed">
            <span class="u-ljk !w-7 !h-7 !text-xs is-filled">{{ i + 1 }}</span>
            <span>{{ a }}</span>
          </li>
        </ol>

        <!-- Contoh menjawab: interaktif, tidak tersimpan -->
        <div class="mt-6 rounded-xl border-2 border-dashed border-[color:var(--ink)] p-3 sm:p-4" data-tour="tes-contoh">
          <p class="text-sm font-semibold"><span class="u-chip u-chip-kuning mr-1.5 align-middle">Contoh, tidak dinilai</span>Mobil masuk dengan lampu check engine menyala. Yang Anda lakukan pertama?</p>
          <div class="mt-2 grid sm:grid-cols-2 gap-2" role="radiogroup" aria-label="Contoh soal pilihan ganda">
            <button
              v-for="(o, i) in CONTOH" :key="i" type="button" role="radio" :aria-checked="contoh === i"
              class="u-opsi !py-2.5" :class="{ 'is-filled': contoh === i }" @click="contoh = i"
            ><span class="u-bubble !w-8 !h-8">{{ KEYS[i] }}</span><span class="text-sm pt-1">{{ o }}</span></button>
          </div>
        </div>

        <div class="mt-7 max-lg:fixed max-lg:inset-x-0 max-lg:bottom-0 max-lg:z-30 max-lg:mt-0 max-lg:bg-white max-lg:border-t-[2.5px] max-lg:border-[color:var(--ink)] max-lg:px-3 max-lg:pt-3 max-lg:pb-[max(.75rem,env(safe-area-inset-bottom))]">
          <template v-if="data.cycle.state === 'open'">
            <button class="u-btn u-btn-merah u-btn-besar w-full lg:w-auto" :disabled="starting" data-tour="tes-mulai" @click="mulai">
              {{ starting ? 'Menyiapkan lembar…' : 'Mulai mengerjakan' }}<ArrowRightIcon v-if="!starting" class="w-5 h-5" />
            </button>
            <p class="mt-2 text-sm text-center lg:text-left text-[color:var(--ink-soft)]">
              {{ data.case.time_limit_minutes ? `Waktu ${data.case.time_limit_minutes} menit mulai berjalan saat tombol ditekan.` : 'Tidak ada batas waktu.' }}
            </p>
          </template>
          <p v-else class="u-chip u-chip-merah !text-sm">Periode {{ data.cycle.state === 'closed' ? 'sudah ditutup' : 'belum dimulai' }}, tes belum bisa dikerjakan.</p>
          <p v-if="startError" class="mt-2 text-sm font-semibold text-[color:var(--merah)]" role="alert">{{ startError }}</p>
        </div>
      </section>
    </div>

    <!-- ── Mengerjakan ── -->
    <template v-else>
      <header class="sticky top-0 z-30 bg-white border-b-[2.5px] border-[color:var(--ink)]">
        <div class="max-w-6xl mx-auto px-3 sm:px-5 pt-2.5 pb-1 flex items-center gap-2 sm:gap-3">
          <router-link to="/dashboard/lms/my-competency" class="u-btn !min-h-10 !px-2.5 !shadow-none" aria-label="Kembali ke daftar tugas (waktu tetap berjalan)"><ChevronLeftIcon class="w-5 h-5" /></router-link>
          <div class="min-w-0 flex-1">
            <p class="u-display font-extrabold text-[15px] sm:text-lg leading-tight truncate">{{ data.case.name }}</p>
            <p class="text-xs text-[color:var(--ink-soft)]" aria-live="polite">
              {{ terjawab }}/{{ questions.length }} terjawab · <span :class="saveState === 'error' ? 'font-bold text-[color:var(--merah)]' : ''">{{ saveLabel }}</span>
            </p>
          </div>
          <span v-if="recorder.active.value" class="u-chip u-chip-merah !gap-1.5" aria-live="off">
            <span class="w-2 h-2 rounded-full bg-[color:var(--merah)]" :class="{ 'animate-pulse': recorder.state.value === 'recording' }"></span>{{ mmss(recorder.elapsed.value) }}
          </span>
          <div class="u-timer" :class="timerClass" role="timer" :aria-label="timerAria">
            <ClockIcon class="w-5 h-5" />{{ timeLeft == null ? '∞' : mmss(timeLeft) }}
          </div>
        </div>
        <!-- Navigator LJK -->
        <nav class="max-w-6xl mx-auto px-1 sm:px-3 flex gap-2.5 overflow-x-auto" aria-label="Nomor soal"><div class="flex gap-2.5 p-2 pb-3">
          <button
            v-for="(qq, i) in questions" :key="qq.id" type="button"
            class="u-ljk" :class="{ 'is-filled': sudahDijawab(qq), 'is-current': i === idx }"
            :aria-label="`Soal ${i + 1}${sudahDijawab(qq) ? ', sudah dijawab' : ''}`" :aria-current="i === idx ? 'step' : undefined"
            @click="ke(i)"
          >{{ i + 1 }}</button>
        </div></nav>
        <p class="sr-only" aria-live="assertive">{{ peringatanWaktu }}</p>
      </header>

      <div class="max-w-6xl mx-auto px-3 sm:px-5 pt-4 grid lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] gap-4 lg:gap-6 items-start">
        <!-- Situasi -->
        <aside ref="situasiEl" class="u-card lg:sticky lg:top-32 scroll-mt-[9.5rem]">
          <button type="button" class="w-full flex items-center justify-between gap-3 px-4 py-3 text-left lg:cursor-default" :aria-expanded="situasiTerbuka" @click="situasiTerbuka = !situasiTerbuka">
            <span class="u-display text-lg font-extrabold">Situasi</span>
            <span class="lg:hidden text-sm font-bold underline underline-offset-4">{{ situasiTerbuka ? 'Tutup' : 'Baca lagi' }}</span>
          </button>
          <div v-show="situasiTerbuka || isDesktop" class="px-4 pb-4 -mt-1">
            <p class="text-[15px] leading-relaxed whitespace-pre-line max-w-prose">{{ data.case.scenario }}</p>
          </div>
        </aside>

        <!-- Soal -->
        <main v-if="!meninjau" ref="soalEl" class="u-card p-4 sm:p-6 scroll-mt-36">
          <div class="flex items-start gap-3">
            <span class="u-nomor">{{ idx + 1 }}</span>
            <div class="min-w-0">
              <span class="u-chip" :class="q.qtype === 'choice' ? 'u-chip-kuning' : ''">{{ q.qtype === 'choice' ? 'Pilihan ganda · pilih satu' : 'Esai' }}</span>
              <h2 class="u-display mt-2 text-[1.2rem] sm:text-[1.35rem] font-bold leading-snug">{{ q.text }}</h2>
            </div>
          </div>

          <!-- Pilihan ganda -->
          <div v-if="q.qtype === 'choice'" class="mt-5 space-y-2.5" role="radiogroup" :aria-label="`Jawaban soal ${idx + 1}`">
            <button
              v-for="(o, i) in q.options" :key="o.key" type="button" role="radio" :aria-checked="answers[q.id] === o.key"
              class="u-opsi" :class="{ 'is-filled': answers[q.id] === o.key }" @click="pilih(q, o.key)"
            >
              <span class="u-bubble">{{ KEYS[i] }}</span>
              <span class="pt-1 text-[15px] leading-relaxed">{{ o.text }}</span>
            </button>
            <p class="pt-1 text-xs text-[color:var(--ink-soft)]">Pilih tindakan yang paling mendekati yang benar-benar Anda lakukan di bengkel.</p>
          </div>

          <!-- Esai -->
          <div v-else class="mt-5">
            <div class="inline-flex rounded-xl border-2 border-[color:var(--ink)] p-1 gap-1" role="tablist" aria-label="Cara menjawab esai">
              <button
                v-for="m in MODES" :key="m.key" type="button" role="tab" :aria-selected="essayMode === m.key"
                class="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold"
                :class="essayMode === m.key ? 'bg-[color:var(--ink)] text-white' : 'hover:bg-[#fffbe0]'"
                :disabled="recorder.active.value && m.key === 'written'"
                @click="essayMode = m.key"
              ><component :is="m.icon" class="w-4 h-4" />{{ m.label }}</button>
            </div>

            <template v-if="essayMode === 'written'">
              <label :for="`jawab-${q.id}`" class="sr-only">Jawaban soal {{ idx + 1 }}</label>
              <textarea
                :id="`jawab-${q.id}`" v-model="answers[q.id]" class="u-garis mt-3" rows="7"
                placeholder="Tulis langkah, alasan, dan keputusan Anda…" @input="jadwalSimpan"
              ></textarea>
            </template>

            <div v-else class="mt-3 rounded-xl border-2 border-[color:var(--ink)] p-4 bg-white">
              <template v-if="!recorder.active.value">
                <label v-if="!data.consent" class="flex items-start gap-2.5 text-sm cursor-pointer">
                  <input v-model="consent" type="checkbox" class="u-check" />
                  <span>Saya setuju jawaban lisan direkam, ditranskripsi, dan dinilai AI untuk asesmen ini. Rekaman dihapus otomatis setelah 90 hari.</span>
                </label>
                <button
                  class="u-btn u-btn-merah mt-3" :disabled="(!consent && !data.consent) || recorder.state.value === 'starting'"
                  @click="mulaiRekam"
                ><MicrophoneIcon class="w-5 h-5" />{{ recorder.state.value === 'starting' ? 'Menyiapkan…' : rekamanAda ? 'Rekam lanjutan' : 'Mulai rekam' }}</button>
                <p class="mt-2 text-xs text-[color:var(--ink-soft)]">Rekaman tetap berjalan saat Anda pindah soal; setiap soal esai ditandai otomatis.</p>
              </template>
              <template v-else>
                <div class="flex flex-wrap items-center gap-3">
                  <span class="u-display text-2xl font-extrabold tabular-nums">{{ mmss(recorder.elapsed.value) }}</span>
                  <span class="h-3 w-24 rounded-full border-2 border-[color:var(--ink)] bg-white overflow-hidden" aria-hidden="true">
                    <span class="block h-full bg-[color:var(--hijau)] transition-[width] duration-75" :style="{ width: Math.round(recorder.level.value * 100) + '%' }"></span>
                  </span>
                  <span class="text-sm font-semibold">{{ recorder.state.value === 'paused' ? 'Dijeda' : 'Sedang merekam soal ' + (idx + 1) }}</span>
                </div>
                <div class="mt-3 flex flex-wrap gap-2">
                  <button class="u-btn" :disabled="recorder.state.value === 'stopping'" @click="recorder.state.value === 'paused' ? recorder.resume() : recorder.pause()">
                    {{ recorder.state.value === 'paused' ? 'Lanjutkan' : 'Jeda' }}
                  </button>
                  <button class="u-btn u-btn-hitam" :disabled="recorder.state.value === 'stopping'" @click="selesaiRekam">
                    {{ recorder.state.value === 'stopping' ? 'Menyimpan…' : 'Selesai rekam' }}
                  </button>
                </div>
              </template>
              <p v-if="recorder.error.value" class="mt-3 text-sm font-semibold text-[color:var(--merah)]" role="alert">{{ recorder.error.value }}</p>
              <p v-if="recorder.upload.value.stopped" class="mt-3 text-sm font-semibold" role="alert">
                Koneksi terputus, potongan rekaman belum terkirim.
                <button class="underline" @click="recorder.retryUpload()">Kirim ulang</button>
              </p>
              <ul v-if="rekaman.length && !recorder.active.value" class="mt-3 divide-y-2 divide-dashed divide-black/15">
                <li v-for="r in rekaman" :key="r.id" class="flex items-center gap-2 py-2 text-sm">
                  <MicrophoneIcon class="w-4 h-4" />
                  <span class="flex-1">Rekaman {{ r.sequence }} · {{ mmss(r.duration) }}</span>
                  <button class="text-xs font-bold underline" @click="hapusRekaman(r)">Hapus</button>
                </li>
              </ul>
            </div>
          </div>

          <!-- Navigasi (desktop) -->
          <div class="hidden lg:flex mt-6 pt-4 border-t-2 border-dashed border-black/25 items-center justify-between gap-2">
            <button class="u-btn" :disabled="idx === 0" @click="ke(idx - 1)"><ArrowLeftIcon class="w-4 h-4" />Sebelumnya</button>
            <button v-if="idx < questions.length - 1" class="u-btn u-btn-hitam" @click="ke(idx + 1)">Berikutnya<ArrowRightIcon class="w-4 h-4" /></button>
            <button v-else class="u-btn u-btn-merah" @click="tinjau">Periksa & kirim</button>
          </div>
        </main>

        <!-- Tinjau sebelum kirim -->
        <main v-else class="u-card p-4 sm:p-6">
          <h2 class="u-display text-2xl font-extrabold">Periksa sebelum kirim</h2>
          <p class="mt-1 text-[15px] text-[color:var(--ink-soft)]">Setelah dikirim, jawaban tidak bisa diubah lagi.</p>
          <div class="mt-4 flex flex-wrap gap-2">
            <button
              v-for="(qq, i) in questions" :key="qq.id" type="button" class="u-ljk !w-11 !h-11 !text-sm"
              :class="{ 'is-filled': sudahDijawab(qq) }" :aria-label="`Soal ${i + 1}${sudahDijawab(qq) ? ', sudah dijawab' : ', belum dijawab'}`"
              @click="ke(i)"
            >{{ i + 1 }}</button>
          </div>
          <p class="mt-3 text-sm font-semibold" :class="belumDijawab.length ? 'text-[color:var(--merah)]' : 'text-[color:var(--hijau)]'">
            {{ belumDijawab.length ? `Belum dijawab: soal ${belumDijawab.join(', ')}. Ketuk nomornya untuk menjawab.` : 'Semua soal sudah dijawab.' }}
          </p>
          <p v-if="recorder.active.value" class="mt-2 text-sm font-semibold">Selesaikan rekaman dulu sebelum mengirim.</p>
          <div class="mt-5 flex flex-wrap gap-2">
            <button class="u-btn" @click="meninjau = false">Kembali ke soal</button>
            <button class="u-btn u-btn-merah" :disabled="!bisaKirim || submitting" @click="kirim">{{ submitting ? 'Mengirim…' : 'Kirim jawaban' }}</button>
          </div>
          <p v-if="submitError" class="mt-3 text-sm font-semibold text-[color:var(--merah)]" role="alert">{{ submitError }}</p>
        </main>
      </div>

      <!-- Navigasi (HP): selalu terjangkau jempol -->
      <div v-if="!meninjau" class="lg:hidden fixed inset-x-0 bottom-0 z-30 bg-white border-t-[2.5px] border-[color:var(--ink)] px-3 py-2.5 flex gap-2" style="padding-bottom: max(.625rem, env(safe-area-inset-bottom))">
        <button class="u-btn flex-1" :disabled="idx === 0" @click="ke(idx - 1)"><ArrowLeftIcon class="w-4 h-4" />Sebelumnya</button>
        <button v-if="idx < questions.length - 1" class="u-btn u-btn-hitam flex-1" @click="ke(idx + 1)">Berikutnya<ArrowRightIcon class="w-4 h-4" /></button>
        <button v-else class="u-btn u-btn-merah flex-1" @click="tinjau">Periksa & kirim</button>
      </div>

      <!-- Waktu habis -->
      <div v-if="waktuHabis" class="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4" role="alertdialog" aria-modal="true" aria-labelledby="judul-habis">
        <div class="u-card p-6 max-w-sm w-full text-center">
          <ClockIcon class="w-10 h-10 mx-auto" />
          <p id="judul-habis" class="u-display mt-2 text-2xl font-extrabold">Waktu habis</p>
          <p class="mt-1 text-[15px] text-[color:var(--ink-soft)]">{{ kirimOtomatisGagal ? 'Koneksi bermasalah. Jawaban yang sudah tersimpan tetap aman dan dikirim otomatis oleh server.' : 'Jawaban yang sudah tersimpan sedang dikirim…' }}</p>
          <button v-if="kirimOtomatisGagal" class="u-btn u-btn-hitam mt-4" @click="waktuHabisKirim">Coba kirim lagi</button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import '@fontsource-variable/bricolage-grotesque'
import '../../styles/exam.css'
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import {
  ArrowLeftIcon, ArrowRightIcon, ChevronLeftIcon, ClockIcon, MicrophoneIcon, PencilSquareIcon, QuestionMarkCircleIcon,
} from '@heroicons/vue/24/outline'
import { competencyApi } from '../../services/competencyApi'
import { useAnswerRecorder } from '../../composables/useAnswerRecorder'
import { useTour } from '../../composables/useTour'
import { fmtDateTime, mmss } from '../../utils/competency'

const KEYS = ['A', 'B', 'C', 'D', 'E', 'F']
const MODES = [
  { key: 'written', label: 'Tulis', icon: PencilSquareIcon },
  { key: 'oral', label: 'Rekam suara', icon: MicrophoneIcon },
]
const ATURAN = [
  'Waktu mulai berjalan saat Anda menekan Mulai dan tidak berhenti walau aplikasi ditutup.',
  'Jawaban tersimpan otomatis. Anda bisa pindah soal kapan saja lewat nomor di atas.',
  'Pilihan ganda: pilih tindakan yang benar-benar Anda lakukan di bengkel, bukan yang terdengar paling bagus.',
  'Esai bisa diketik atau dijawab dengan rekaman suara.',
  'Saat waktu habis, jawaban yang sudah tersimpan terkirim otomatis.',
]
const CONTOH = [
  'Hapus kode error lalu serahkan mobil.',
  'Scan kode error, catat, lalu cek penyebabnya.',
]

const route = useRoute()
const attemptId = Number(route.params.attemptId)
const loading = ref(true)
const error = ref('')
const data = ref(null)
const answers = reactive({})
const idx = ref(0)
const essayMode = ref('written')
const consent = ref(false)
const contoh = ref(null)
const starting = ref(false)
const startError = ref('')
const meninjau = ref(false)
const submitting = ref(false)
const submitError = ref('')
const saveState = ref('idle') // idle | saving | saved | error
const situasiTerbuka = ref(true)
const timeLeft = ref(null)
const waktuHabis = ref(false)
const kirimOtomatisGagal = ref(false)
const peringatanWaktu = ref('')
const soalEl = ref(null)
const rootEl = ref(null)
const situasiEl = ref(null)
// Area scroll ada di layout aplikasi (div overflow-auto), bukan window.
const keAtas = () => nextTick(() => rootEl.value?.scrollIntoView({ block: 'start' }))
const isDesktop = ref(window.matchMedia('(min-width: 1024px)').matches)
const recorder = useAnswerRecorder()

let clockOffset = 0
let ticker = null
let saveTimer = null
let saving = null
let dirty = false

const started = computed(() => !!data.value?.started_at)
const submitted = computed(() => data.value?.state === 'submitted')
const questions = computed(() => data.value?.questions || [])
const q = computed(() => questions.value[idx.value] || {})
const rekaman = computed(() => (data.value?.recordings || []).filter((r) => r.size > 0))
const rekamanAda = computed(() => rekaman.value.length > 0)
// Soal esai yang sudah punya bagian rekaman (penanda q<id> dari perekam).
const direkam = computed(() => new Set((data.value?.recordings || []).filter((r) => r.size > 0)
  .flatMap((r) => (r.markers || []).map((m) => m.code))))
const sudahDijawab = (qq) => (qq.qtype === 'choice'
  ? !!answers[qq.id]
  : !!(answers[qq.id] || '').trim() || direkam.value.has(`q${qq.id}`))
const terjawab = computed(() => questions.value.filter(sudahDijawab).length)
const belumDijawab = computed(() => questions.value.map((qq, i) => (sudahDijawab(qq) ? null : i + 1)).filter(Boolean))
const bisaKirim = computed(() => !recorder.active.value && !recorder.upload.value.pending && (terjawab.value > 0 || rekamanAda.value))
const saveLabel = computed(() => ({ saving: 'menyimpan…', error: 'gagal simpan' }[saveState.value] || 'tersimpan'))

const fakta = computed(() => {
  const c = data.value?.case || {}
  return [
    { value: c.choice_count || 0, label: 'pilihan ganda', cls: 'bg-[color:var(--stabilo)]' },
    { value: c.essay_count || 0, label: 'esai', cls: 'bg-white' },
    { value: c.time_limit_minutes || '∞', label: c.time_limit_minutes ? 'menit' : 'tanpa batas', cls: 'bg-[color:var(--merah)] text-white' },
  ]
})
const timerClass = computed(() => (timeLeft.value == null ? '' : timeLeft.value <= 60 ? 'is-danger' : timeLeft.value <= 300 ? 'is-warn' : ''))
const timerAria = computed(() => (timeLeft.value == null ? 'Tanpa batas waktu' : `Sisa waktu ${Math.floor(timeLeft.value / 60)} menit ${timeLeft.value % 60} detik`))

const parseUtc = (v) => new Date(`${v.replace(' ', 'T')}Z`).getTime()
function syncClock(serverNow) {
  if (serverNow) clockOffset = parseUtc(serverNow) - Date.now()
}

function terapkan(hasil) {
  data.value = hasil
  syncClock(hasil.server_now)
  Object.keys(answers).forEach((k) => delete answers[k])
  Object.assign(answers, hasil.answers || {})
  tick()
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    terapkan(await competencyApi.attempt(attemptId))
    const essays = questions.value.filter((qq) => qq.qtype === 'essay')
    if (rekamanAda.value && !essays.some((qq) => (answers[qq.id] || '').trim())) essayMode.value = 'oral'
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
  if (data.value && !started.value && !submitted.value) nextTick(() => tour.autoStart())
}

async function mulai() {
  starting.value = true
  startError.value = ''
  try {
    terapkan(await competencyApi.startAttempt(attemptId))
    idx.value = 0
    keAtas()
  } catch (e) {
    startError.value = e.message
  } finally {
    starting.value = false
  }
}

// ── Timer: dihitung dari batas waktu server, tahan reload & jam HP yang meleset ──
function tick() {
  const d = data.value
  if (!d?.deadline || d.state !== 'draft') { timeLeft.value = null; return }
  const sisa = Math.max(0, Math.round((parseUtc(d.deadline) - (Date.now() + clockOffset)) / 1000))
  if (timeLeft.value != null && timeLeft.value > 300 && sisa <= 300) peringatanWaktu.value = 'Sisa waktu 5 menit.'
  if (timeLeft.value != null && timeLeft.value > 60 && sisa <= 60) peringatanWaktu.value = 'Sisa waktu 1 menit.'
  timeLeft.value = sisa
  if (sisa === 0 && !waktuHabis.value) waktuHabisKirim()
}

async function waktuHabisKirim() {
  waktuHabis.value = true
  kirimOtomatisGagal.value = false
  try {
    if (recorder.active.value) {
      await Promise.race([recorder.stop(), new Promise((r) => setTimeout(r, 8000))])
    }
    clearTimeout(saveTimer)
    terapkan(await competencyApi.submitAttempt(attemptId, payload(), true))
    waktuHabis.value = false
  } catch {
    kirimOtomatisGagal.value = true
  }
}

// ── Simpan otomatis ──
const payload = () => Object.fromEntries(Object.entries(answers).filter(([, v]) => v != null && v !== ''))
function jadwalSimpan() {
  dirty = true
  saveState.value = 'saving'
  clearTimeout(saveTimer)
  saveTimer = setTimeout(simpan, 900)
}
async function simpan() {
  clearTimeout(saveTimer)
  saveTimer = null
  if (saving) { dirty = true; return saving }
  dirty = false
  saveState.value = 'saving'
  saving = competencyApi.saveAttempt(attemptId, payload())
    .then((res) => {
      syncClock(res.server_now)
      saveState.value = 'saved'
      if (res.state === 'submitted') return load() // waktu habis di server
      return null
    })
    .catch(() => { saveState.value = 'error' })
    .finally(() => {
      saving = null
      if (dirty) simpan()
    })
  return saving
}
function pilih(qq, key) {
  answers[qq.id] = key
  dirty = true
  simpan()
}

// ── Navigasi ──
function ke(i) {
  if (i < 0 || i >= questions.value.length) return
  meninjau.value = false
  idx.value = i
  // Di HP situasi dilipat setelah soal pertama supaya soal langsung terlihat.
  if (!isDesktop.value && i > 0) situasiTerbuka.value = false
  const target = questions.value[i]
  if (recorder.active.value && target.qtype === 'essay') recorder.marker(`q${target.id}`, `Pertanyaan ${i + 1}: ${target.text}`)
  if (saveTimer) simpan()
  // HP: mulai dari bar Situasi yang terlipat supaya tombol "Baca lagi" tetap terlihat.
  nextTick(() => (isDesktop.value ? soalEl : situasiEl).value?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
}
function tinjau() {
  if (saveTimer) simpan()
  if (!isDesktop.value) situasiTerbuka.value = false
  meninjau.value = true
  keAtas()
}

// ── Rekaman ──
async function mulaiRekam() {
  const ok = await recorder.start(attemptId)
  if (ok) {
    data.value.consent = true
    if (q.value.qtype === 'essay') recorder.marker(`q${q.value.id}`, `Pertanyaan ${idx.value + 1}: ${q.value.text}`)
  }
}
async function segarkanRekaman() {
  const segar = await competencyApi.attempt(attemptId)
  data.value.recordings = segar.recordings
}
async function selesaiRekam() {
  await recorder.stop()
  await segarkanRekaman().catch(() => {})
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
    clearTimeout(saveTimer)
    terapkan(await competencyApi.submitAttempt(attemptId, payload()))
    keAtas()
  } catch (e) {
    submitError.value = e.message
  } finally {
    submitting.value = false
  }
}

// ── Onboarding (sampul saja: waktu belum berjalan) ──
const tour = useTour('peserta-tes', () => [
  { element: '[data-tour="tes-fakta"]', title: 'Isi tes ini', text: 'Jumlah soal pilihan ganda, soal esai, dan batas waktunya. Waktu baru berjalan setelah Anda menekan Mulai.', side: 'bottom' },
  { element: '[data-tour="tes-aturan"]', title: 'Aturan singkat', text: 'Jawaban tersimpan otomatis dan bisa diubah sampai dikirim. Waktu tetap berjalan walau aplikasi ditutup.', side: 'top' },
  { element: '[data-tour="tes-contoh"]', title: 'Cara menjawab', text: 'Ketuk satu baris jawaban: bulatannya terisi hitam seperti LJK. Di atas lembar tes ada nomor soal; nomor yang terisi hitam berarti sudah dijawab.', side: 'top' },
  { element: '[data-tour="tes-mulai"]', title: 'Siap?', text: 'Tekan Mulai saat Anda punya waktu tenang. Di soal terakhir, tekan "Periksa & kirim".', side: 'top' },
  { element: '[data-tour="tes-help"]', title: 'Lihat lagi kapan saja', text: 'Tekan "Cara mengerjakan" untuk memutar panduan ini lagi.', side: 'bottom', align: 'end' },
])

const mq = window.matchMedia('(min-width: 1024px)')
const onMq = (e) => { isDesktop.value = e.matches }
const onVisible = () => { if (document.visibilityState === 'visible') tick() }
const peringatanTutup = (e) => { if (saveTimer || saving) { e.preventDefault(); e.returnValue = '' } }

onMounted(() => {
  load()
  ticker = setInterval(tick, 500)
  mq.addEventListener('change', onMq)
  document.addEventListener('visibilitychange', onVisible)
  window.addEventListener('beforeunload', peringatanTutup)
})
onBeforeUnmount(() => {
  clearInterval(ticker)
  mq.removeEventListener('change', onMq)
  document.removeEventListener('visibilitychange', onVisible)
  window.removeEventListener('beforeunload', peringatanTutup)
  if (saveTimer && data.value?.state === 'draft') simpan()
})
</script>
