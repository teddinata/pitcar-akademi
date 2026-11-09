<!-- Halaman siswa lewat QR kelas (tanpa login): pilih nama + 4 digit terakhir No. WA, lalu lihat progres
     belajar dan kerjakan quiz yang terbuka. -->
<template>
  <div class="ujian min-h-screen">
    <LNotice />
    <header class="sticky top-0 z-30 border-b-[2.5px] border-[color:var(--ink)] bg-[color:var(--paper)]">
      <div class="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
        <div class="min-w-0 flex-1">
          <p class="truncate text-xs font-bold uppercase tracking-wide text-[color:var(--ink-soft)]">Kelas Offline · Akademi Pitcar</p>
          <p class="u-display truncate text-lg font-extrabold leading-tight sm:text-xl">{{ program || 'Memuat…' }}</p>
        </div>
        <button v-if="dipilih" type="button" class="u-btn !min-h-[40px] !px-3 !py-1.5 text-sm" @click="gantiNama">Ganti nama</button>
      </div>
    </header>

    <main class="mx-auto max-w-3xl px-4 py-6 pb-16 sm:py-8">
      <div v-if="loading" class="space-y-3"><div v-for="i in 3" :key="i" class="u-card h-16 animate-pulse"></div></div>

      <section v-else-if="otherDb" class="u-card mx-auto max-w-xl p-6">
        <p class="u-display text-xl font-extrabold">Halaman ini untuk siswa</p>
        <p class="mt-2 text-[15px] leading-relaxed">Anda sedang masuk ke Akademi sebagai <b>{{ otherDb }}</b> di database lain. Pindai QR dengan HP siswa, atau lanjutkan di sini dan Anda akan keluar dari akun itu.</p>
        <button type="button" class="u-btn u-btn-hitam mt-5" @click="keluarLalu">Keluar & lanjut sebagai siswa</button>
      </section>

      <section v-else-if="fatal" class="u-card mx-auto max-w-xl p-6 text-center">
        <ExclamationTriangleIcon class="mx-auto h-10 w-10 text-[color:var(--merah)]" />
        <p class="u-display mt-2 text-xl font-extrabold">QR tidak bisa dibuka</p>
        <p class="mt-1 text-[15px]">{{ fatal }}</p>
        <button type="button" class="u-btn mt-5" @click="muat">Coba lagi</button>
      </section>

      <template v-else>
      <!-- QR sesi quiz: kartu quiz yang dibuka mentor -->
      <section v-if="sesi && !sesi.closed && !hasil" class="u-card mb-6 p-4">
        <span class="u-chip u-chip-kuning">{{ sesi.set_label }}</span>
        <h1 class="u-display mt-2 text-[1.45rem] font-extrabold leading-tight">{{ sesi.topic }}</h1>
        <div class="mt-3 grid grid-cols-2 gap-2">
          <div class="rounded-xl border-2 border-[color:var(--ink)] bg-[color:var(--stabilo)] p-2.5"><p class="u-display text-2xl font-extrabold tabular-nums">{{ sesi.question_count }}</p><p class="text-xs font-bold">soal pilihan ganda</p></div>
          <div class="rounded-xl border-2 border-[color:var(--ink)] p-2.5"><p class="u-display text-2xl font-extrabold tabular-nums">{{ sesi.time_limit_minutes }}</p><p class="text-xs font-bold">menit</p></div>
        </div>
      </section>
      <p v-else-if="sesi?.closed && !hasil" class="u-card mb-6 p-4 text-[15px]"><b>Sesi quiz ini sudah ditutup.</b> Minta mentor menampilkan QR yang baru. Kamu tetap bisa melihat progres belajar di bawah.</p>

      <!-- Siap mengerjakan quiz dari QR sesi -->
      <section v-if="hasil && siap" class="pb-24">
        <p class="text-sm font-bold text-[color:var(--ink-soft)]">{{ hasil.participant }}</p>
        <span class="u-chip u-chip-kuning mt-2">{{ siap.set_label }}</span>
        <h1 class="u-display mt-2 text-[1.45rem] font-extrabold leading-tight">{{ siap.topic }}</h1>
        <h2 class="u-display mt-5 text-xl font-extrabold">Siap, {{ hasil.participant.split(' ')[0] }}?</h2>
        <ul class="u-card mt-3 divide-y-2 divide-dashed divide-[color:var(--ink)]/25 text-[15px]">
          <li class="flex gap-3 px-4 py-3"><span class="u-bubble !h-7 !w-7 !text-sm">1</span><span>{{ siap.question_count }} soal pilihan ganda, waktu {{ siap.time_limit_minutes }} menit sejak menekan Mulai.</span></li>
          <li class="flex gap-3 px-4 py-3"><span class="u-bubble !h-7 !w-7 !text-sm">2</span><span>Jawaban tersimpan otomatis. Kalau sinyal putus, scan QR lagi dan lanjutkan.</span></li>
          <li class="flex gap-3 px-4 py-3"><span class="u-bubble !h-7 !w-7 !text-sm">3</span><span>Kirim sekali saja; setelah dikirim tidak bisa diulang.</span></li>
        </ul>
        <p class="mt-3 rounded-xl border-2 border-dashed border-[color:var(--ink)] bg-[#fffbe0] p-3 text-sm">{{ siap.quiz_set === 'pre'
          ? 'Pre-test mengukur kemampuan awal sebelum materi diajarkan. Jawab apa adanya, tidak ada lulus atau gagal.'
          : 'Post-test mengukur pemahaman setelah materi diajarkan.' }}</p>
        <button type="button" class="mt-4 text-sm font-bold underline underline-offset-4" @click="siap = null">Lihat progres belajar saya</button>
        <div class="fixed inset-x-0 bottom-0 z-30 border-t-[2.5px] border-[color:var(--ink)] bg-[color:var(--paper)] px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
          <button type="button" class="u-btn u-btn-merah u-btn-besar mx-auto w-full max-w-md" @click="buka(siap)">
            <PlayIcon class="h-6 w-6" />{{ siap.state === 'in_progress' ? 'Lanjutkan' : 'Mulai' }} {{ siap.set_label.toLowerCase() }}
          </button>
        </div>
      </section>

      <!-- Setelah memilih nama -->
      <section v-else-if="hasil">
        <p v-if="hasil.focus?.done" class="u-card mb-5 border-[color:var(--hijau)] bg-[#dcf3e6] p-4 text-[15px]"><b>{{ hasil.focus.set_label }} {{ hasil.focus.topic }} sudah kamu kerjakan.</b> Terima kasih!</p>
        <p class="text-sm font-bold text-[color:var(--ink-soft)]">Halo,</p>
        <p class="u-display text-2xl font-extrabold sm:text-3xl">{{ hasil.participant }}</p>

        <div class="mt-5">
          <h2 class="u-display text-xl font-extrabold">Quiz terbuka</h2>
          <p v-if="!hasil.tasks.length" class="u-card mt-3 p-4 text-[15px]">Belum ada quiz untuk Anda saat ini.</p>
          <div v-else class="mt-3 space-y-3">
            <button v-for="t in hasil.tasks" :key="t.token" type="button" class="u-card flex w-full items-center gap-4 p-4 text-left transition-transform active:translate-x-[2px] active:translate-y-[2px]" @click="buka(t)">
              <span class="min-w-0 flex-1">
                <span class="u-display block text-lg font-extrabold leading-snug">{{ t.topic }}</span>
                <span class="mt-1 block text-sm text-[color:var(--ink-soft)]">{{ t.kind === 'remedial' ? 'Quiz susulan' : t.set_label || 'Quiz' }} · {{ t.time_limit_minutes }} menit</span>
                <span v-if="t.state === 'in_progress'" class="u-chip u-chip-kuning mt-2">Sedang dikerjakan · lanjutkan</span>
              </span>
              <span class="u-btn u-btn-merah shrink-0"><PlayIcon class="h-5 w-5" />{{ t.state === 'in_progress' ? 'Lanjut' : 'Mulai' }}</span>
            </button>
          </div>
        </div>

        <div class="mt-8">
          <h2 class="u-display text-xl font-extrabold">Bahan belajar</h2>
          <p class="u-help">PDF/slide materi yang sudah disampaikan di kelas. Bahan materi berikutnya terbuka setelah diajarkan.</p>
          <p v-if="!bahan.length" class="u-card mt-3 p-4 text-[15px]">Belum ada bahan yang dibagikan.</p>
          <div v-for="t in bahan" :key="t.topic_id" class="u-card mt-3 p-3 sm:p-4">
            <p class="font-extrabold">{{ t.name }}</p>
            <p v-if="t.module_name" class="text-xs text-[color:var(--ink-soft)]">{{ t.module_name }}</p>
            <MaterialList class="mt-2" :materials="t.materials" :download="unduhBahan" :fetch-blob="bahanBlob" />
          </div>
        </div>

        <div class="mt-8">
          <h2 class="u-display mb-3 text-xl font-extrabold">Progres belajar saya</h2>
          <StudentProgress :data="hasil.progress" />
        </div>
      </section>

      <!-- Pilih nama -->
      <section v-else>
        <p class="u-display text-2xl font-extrabold">{{ sesi && !sesi.closed ? 'Siapa kamu?' : 'Pilih nama Anda' }}</p>
        <p v-if="sesi && !sesi.closed" class="mt-1 text-[15px] text-[color:var(--ink-soft)]">Ketuk namamu di daftar kelas.</p>
        <label class="mt-4 block">
          <span class="sr-only">Cari nama</span>
          <span class="relative block">
            <MagnifyingGlassIcon class="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[color:var(--ink-soft)]" />
            <input v-model="cari" type="search" placeholder="Cari nama" autocomplete="off" class="w-full rounded-xl border-[2.5px] border-[color:var(--ink)] bg-white py-3 pl-10 pr-3 text-base focus:outline-none" />
          </span>
        </label>
        <p v-if="!peserta.length" class="u-card mt-5 p-5 text-center text-[15px]">Belum ada siswa terdaftar di kelas ini.</p>
        <p v-else-if="!tersaring.length" class="mt-5 text-center text-[15px]">Nama tidak ditemukan. Hubungi mentor.</p>
        <ul class="mt-4 grid gap-3 sm:grid-cols-2">
          <li v-for="p in tersaring" :key="p.id">
            <button type="button" class="u-card flex w-full items-center gap-3 p-4 text-left transition-transform active:translate-x-[2px] active:translate-y-[2px]" @click="pilih(p)">
              <span class="u-nomor shrink-0 !h-10 !w-10 !text-base">{{ inisial(p.name) }}</span>
              <span class="min-w-0 flex-1">
                <span class="block truncate font-extrabold">{{ p.name }}</span>
                <span class="block truncate text-sm text-[color:var(--ink-soft)]">{{ p.open_count ? `${p.open_count} quiz terbuka` : p.job || 'Lihat progres' }}</span>
              </span>
              <ChevronRightIcon class="h-5 w-5 shrink-0" />
            </button>
          </li>
        </ul>
      </section>
      </template>
    </main>

    <div v-if="dipilih && !hasil" class="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-4" @click.self="gantiNama">
      <form class="u-card w-full max-w-md rounded-b-none p-6 sm:rounded-b-[var(--radius)]" role="dialog" aria-modal="true" aria-labelledby="judul-pin" @submit.prevent="konfirmasi">
        <p id="judul-pin" class="u-display text-xl font-extrabold">{{ dipilih.name }}</p>
        <template v-if="dipilih.needs_pin">
          <p id="pin-help" class="mt-1 text-[15px]">Masukkan <b>4 angka terakhir</b> No. WhatsApp kamu.</p>
          <div class="mt-4 flex justify-center gap-3" aria-describedby="pin-help" :aria-label="`${pin.length} dari 4 angka terisi`" role="status">
            <span v-for="i in 4" :key="i" class="grid h-16 w-14 place-items-center rounded-xl border-[2.5px] text-3xl font-extrabold tabular-nums"
              :class="[error ? 'border-[color:var(--merah)] text-[color:var(--merah)]' : 'border-[color:var(--ink)]', pin.length === i - 1 ? 'shadow-[0_0_0_3px_var(--stabilo)]' : '']">{{ pin[i - 1] || '' }}</span>
          </div>
          <div class="mt-5 grid grid-cols-3 gap-2.5">
            <button v-for="k in KEYPAD" :key="k" :type="k === 'ok' ? 'submit' : 'button'" class="u-btn !min-h-[60px] !text-xl" :class="k === 'ok' ? 'u-btn-merah' : ''"
              :disabled="k === 'ok' && (busy || pin.length < 4)" :aria-label="k === 'hapus' ? 'Hapus angka' : k === 'ok' ? 'Lanjut' : k" @click="k !== 'ok' && ketik(k)">
              <BackspaceIcon v-if="k === 'hapus'" class="h-6 w-6" /><CheckIcon v-else-if="k === 'ok'" class="h-6 w-6" /><template v-else>{{ k }}</template>
            </button>
          </div>
        </template>
        <p v-else class="mt-2 text-[15px]">Benar ini nama Anda?</p>
        <p v-if="error" class="mt-3 font-bold text-[color:var(--merah)]" role="alert">{{ error }}</p>
        <div class="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" class="u-btn" @click="gantiNama">Bukan saya</button>
          <button v-if="!dipilih.needs_pin" type="submit" class="u-btn u-btn-merah" :disabled="busy">{{ busy ? 'Memeriksa…' : 'Lanjut' }}</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import '@fontsource-variable/bricolage-grotesque'
import '../../styles/exam.css'
import '../../styles/asesmen.css'
import '../../styles/leader.css'
import '../../styles/academy.css'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { BackspaceIcon, CheckIcon, ChevronRightIcon, ExclamationTriangleIcon, MagnifyingGlassIcon, PlayIcon } from '@heroicons/vue/24/outline'
import { pilihDb } from '../../utils/leader'
import StudentProgress from '../../components/academy/StudentProgress.vue'
import MaterialList from '../../components/academy/MaterialList.vue'
import LNotice from '../../components/leader/LNotice.vue'
import { base64ToBlob, downloadBase64 } from '../../services/leaderApi'

const route = useRoute()
const router = useRouter()
const kiosk = String(route.params.kiosk || '')
const db = String(route.query.db || '')
const SIMPAN = `kelas:${kiosk}`
// QR sesi quiz dari mentor: ?t=<materi>&s=pre|post
const sesiParam = route.query.t ? { topic_id: Number(route.query.t), quiz_set: String(route.query.s || '') } : {}
const sesi = ref(null)
const siap = ref(null)
const KEYPAD = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'hapus', '0', 'ok']

const loading = ref(true)
const busy = ref(false)
const fatal = ref('')
const error = ref('')
const otherDb = ref('')
const program = ref('')
const peserta = ref([])
const cari = ref('')
const dipilih = ref(null)
const pin = ref('')
const hasil = ref(null)

const inisial = (name) => (name || '').replace(/[^\p{L}\s]/gu, ' ').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || '?'
const tersaring = computed(() => {
  const q = cari.value.trim().toLowerCase()
  return q ? peserta.value.filter((p) => p.name.toLowerCase().includes(q)) : peserta.value
})

async function call(path, params = {}) {
  const res = await fetch(`/web/v1/leader/kiosk/${path}`, {
    method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', method: 'call', params: { kiosk, ...params } }),
  })
  if (!res.ok) throw new Error(`Server tidak bisa dihubungi (${res.status}).`)
  const data = await res.json()
  if (data.error) throw new Error(data.error.data?.message || data.error.message || 'Terjadi kesalahan.')
  if (data.result?.status === 'error') throw new Error(data.result.message)
  return data.result?.data
}

async function siapkanDb() {
  if (!db) return true
  const loggedIn = !!localStorage.getItem('uid')
  const current = localStorage.getItem('database')
  if (loggedIn && current && current !== db) {
    otherDb.value = localStorage.getItem('name') || localStorage.getItem('username') || 'pengguna lain'
    return false
  }
  if (!loggedIn) await pilihDb(db)
  return true
}

async function keluarLalu() {
  try { await fetch('/web/session/destroy', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: '{}' }) } catch { /* abaikan */ }
  localStorage.clear()
  otherDb.value = ''
  await muat()
}

// Nama + PIN diingat di HP ini (sessionStorage) supaya kembali dari quiz tidak perlu memilih ulang.
const ingat = (v) => { try { v ? sessionStorage.setItem(SIMPAN, JSON.stringify(v)) : sessionStorage.removeItem(SIMPAN) } catch { /* abaikan */ } }
const ingatan = () => { try { return JSON.parse(sessionStorage.getItem(SIMPAN) || 'null') } catch { return null } }

async function muat() {
  loading.value = true
  fatal.value = ''
  try {
    if (!(await siapkanDb())) return
    const data = await call('open', sesiParam)
    program.value = data.program
    peserta.value = data.participants
    sesi.value = data.session || null
    const lama = ingatan()
    const p = lama && peserta.value.find((x) => x.id === lama.id)
    if (p) { dipilih.value = p; pin.value = lama.pin || ''; await konfirmasi() }
  } catch (e) {
    fatal.value = e.message
  } finally {
    loading.value = false
  }
}

function pilih(p) {
  dipilih.value = p
  pin.value = ''
  error.value = ''
}

function ketik(k) {
  error.value = ''
  if (k === 'hapus') pin.value = pin.value.slice(0, -1)
  else if (pin.value.length < 4) pin.value += k
}
// Papan ketik fisik tetap bisa dipakai di keypad.
function onKey(e) {
  if (!dipilih.value || hasil.value || !dipilih.value.needs_pin) return
  if (/^[0-9]$/.test(e.key)) ketik(e.key)
  else if (e.key === 'Backspace') ketik('hapus')
  else if (e.key === 'Enter' && pin.value.length === 4 && !busy.value) konfirmasi()
}

function gantiNama() {
  dipilih.value = null
  hasil.value = null
  siap.value = null
  pin.value = ''
  error.value = ''
  ingat(null)
}

async function konfirmasi() {
  busy.value = true
  error.value = ''
  try {
    hasil.value = await call('pick', { participant_id: dipilih.value.id, pin: pin.value, ...sesiParam })
    siap.value = hasil.value.focus && !hasil.value.focus.done ? hasil.value.focus : null
    ingat({ id: dipilih.value.id, pin: pin.value })
  } catch (e) {
    error.value = e.message
    pin.value = ''
    ingat(null)
  } finally {
    busy.value = false
  }
}

const bahan = computed(() => (hasil.value?.progress?.topics || []).filter((t) => t.materials?.length))
async function unduhBahan(m) {
  const f = await call('material', { participant_id: dipilih.value.id, pin: pin.value, material_id: m.id })
  downloadBase64(f.filename, f.content, f.mimetype)
}
async function bahanBlob(m) {
  const f = await call('material', { participant_id: dipilih.value.id, pin: pin.value, material_id: m.id })
  return base64ToBlob(f.content, f.mimetype)
}

const buka = (t) => router.push({ path: `/quiz/${t.token}`, query: { db, kelas: kiosk } })

onMounted(() => { document.title = 'Kelas Offline · Akademi Pitcar'; window.addEventListener('keydown', onKey); muat() })
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>
