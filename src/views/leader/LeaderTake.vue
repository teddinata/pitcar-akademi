<template>
  <div class="ujian min-h-screen">
    <!-- Kepala: identitas tes + timer (menempel saat mengerjakan) -->
    <header class="sticky top-0 z-30 border-b-[2.5px] border-[color:var(--ink)] bg-[color:var(--paper)]">
      <div class="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
        <div class="min-w-0 flex-1">
          <p class="truncate text-xs font-bold uppercase tracking-wide text-[color:var(--ink-soft)]">
            {{ st?.program || (academy ? 'Quiz Akademi Pitcar' : 'Assessment Calon Kepala Bengkel') }}
          </p>
          <p class="u-display truncate text-lg font-extrabold leading-tight sm:text-xl">{{ st?.topic || 'Memuat…' }}</p>
        </div>
        <span v-if="st?.state === 'in_progress'" class="u-timer" :class="timerTone" role="timer" :aria-label="`Sisa waktu ${clock}`">
          <ClockIcon class="h-5 w-5" />{{ clock }}
        </span>
      </div>
      <div v-if="st?.state === 'in_progress'" class="h-1.5 bg-[color:var(--grid-line)]">
        <div class="h-full bg-[color:var(--ink)] transition-all" :style="{ width: `${progress}%` }"></div>
      </div>
    </header>

    <main class="mx-auto max-w-5xl px-4 py-6 pb-28 sm:py-8">
      <!-- Memuat / galat -->
      <div v-if="loading" class="space-y-3">
        <div class="u-card h-32 animate-pulse"></div><div class="u-card h-48 animate-pulse"></div>
      </div>

      <section v-else-if="otherDb" class="u-card mx-auto max-w-xl p-6">
        <p class="u-display text-xl font-extrabold">Tautan ini untuk peserta</p>
        <p class="mt-2 text-[15px] leading-relaxed">
          Anda sedang masuk ke Akademi sebagai <b>{{ otherDb.name }}</b>. Buka tautan ini di HP peserta atau jendela
          penyamaran. Kalau tetap dilanjutkan di sini, Anda akan keluar dari akun ini.
        </p>
        <button class="u-btn u-btn-hitam mt-5 w-full sm:w-auto" @click="lanjutSebagaiPeserta">Keluar & buka sebagai peserta</button>
      </section>

      <section v-else-if="error && !st" class="u-card mx-auto max-w-xl p-6 text-center">
        <ExclamationTriangleIcon class="mx-auto h-10 w-10 text-[color:var(--merah)]" />
        <p class="u-display mt-2 text-xl font-extrabold">Tautan tidak bisa dibuka</p>
        <p class="mt-1 text-[15px]">{{ error }}</p>
        <button class="u-btn mt-5" @click="muat">Coba lagi</button>
      </section>

      <!-- Sebelum mulai -->
      <section v-else-if="st.state === 'assigned'" class="mx-auto max-w-2xl">
        <div class="u-card p-5 sm:p-7">
          <p class="text-sm font-bold text-[color:var(--ink-soft)]">Halo,</p>
          <p class="u-display text-2xl font-extrabold sm:text-3xl">{{ st.participant }}</p>
          <p class="mt-3 text-[15px] leading-relaxed">
            Anda akan mengerjakan <b>{{ st.kind === 'remedial' ? 'tes susulan' : 'assessment' }} materi {{ st.topic }}</b>.
          </p>
          <dl class="mt-5 grid grid-cols-3 gap-3">
            <div class="rounded-xl border-2 border-[color:var(--ink)] p-3 text-center">
              <dt class="text-xs font-bold text-[color:var(--ink-soft)]">Soal</dt>
              <dd class="u-display text-2xl font-extrabold">{{ st.question_count }}</dd>
            </div>
            <div class="rounded-xl border-2 border-[color:var(--ink)] p-3 text-center">
              <dt class="text-xs font-bold text-[color:var(--ink-soft)]">Waktu</dt>
              <dd class="u-display text-2xl font-extrabold">{{ st.time_limit_minutes }}<span class="text-sm"> mnt</span></dd>
            </div>
            <div class="rounded-xl border-2 border-[color:var(--ink)] p-3 text-center">
              <dt class="text-xs font-bold text-[color:var(--ink-soft)]">Lulus</dt>
              <dd class="u-display text-2xl font-extrabold">{{ fmt(st.pass_score) }}</dd>
            </div>
          </dl>
          <p v-if="st.instructions" class="mt-5 whitespace-pre-line rounded-xl bg-[color:var(--grid-bg)] p-4 text-[15px] leading-relaxed">{{ st.instructions }}</p>
          <ul class="mt-4 space-y-1.5 text-sm leading-relaxed">
            <li>• Waktu berjalan sejak tombol <b>Mulai</b> ditekan dan tidak berhenti walau halaman ditutup.</li>
            <li>• Setiap jawaban tersimpan otomatis. Saat waktu habis, jawaban terkirim sendiri.</li>
            <li>• Kerjakan sendiri dan tetap di halaman ini sampai selesai.</li>
          </ul>
          <p v-if="st.open_until" class="mt-3 text-sm font-bold">Tautan berlaku sampai {{ wib(st.open_until) }} WIB.</p>
          <p v-if="error" class="mt-4 font-bold text-[color:var(--merah)]">{{ error }}</p>
          <button class="u-btn u-btn-merah u-btn-besar mt-6 w-full" :disabled="busy" @click="mulai">
            <PlayIcon class="h-6 w-6" />{{ busy ? 'Menyiapkan soal…' : 'Mulai sekarang' }}
          </button>
          <button v-if="kelas" class="mt-3 w-full text-center text-sm font-bold underline" @click="keKelas">Bukan tes saya, kembali ke daftar</button>
        </div>
      </section>

      <!-- Mengerjakan -->
      <div v-else-if="st.state === 'in_progress'" class="lg:grid lg:grid-cols-[1fr_15rem] lg:gap-6">
        <ol class="space-y-5">
          <li v-for="(q, i) in st.questions" :id="`soal-${q.id}`" :key="q.id" class="u-card scroll-mt-28 p-4 sm:p-5">
            <div class="flex items-start gap-3">
              <span class="u-nomor !h-9 !w-9 !text-base">{{ i + 1 }}</span>
              <div class="min-w-0 flex-1">
                <p v-if="q.category" class="text-xs font-bold uppercase tracking-wide text-[color:var(--ink-soft)]">{{ q.category }}</p>
                <p class="whitespace-pre-line text-[16px] font-semibold leading-relaxed">{{ q.text }}</p>
              </div>
            </div>
            <div class="mt-4 space-y-2.5" role="radiogroup" :aria-label="`Soal ${i + 1}`">
              <button
                v-for="o in q.options" :key="o.key" type="button" role="radio"
                class="u-opsi" :class="{ 'is-filled': q.chosen === o.key }" :aria-checked="q.chosen === o.key"
                @click="jawab(q, o.key)"
              >
                <span class="u-bubble">{{ o.key }}</span>
                <span class="pt-1 text-[15px] leading-relaxed">{{ o.text }}</span>
              </button>
            </div>
            <p v-if="gagal[q.id]" class="mt-2 text-sm font-bold text-[color:var(--merah)]">Belum tersimpan. Ketuk lagi pilihan Anda.</p>
          </li>
        </ol>

        <!-- Navigator LJK (desktop) -->
        <aside class="hidden lg:block">
          <div class="u-card sticky top-28 p-4">
            <p class="text-sm font-extrabold">{{ terjawab }} / {{ st.questions.length }} terjawab</p>
            <div class="mt-3 grid grid-cols-5 gap-2">
              <a v-for="(q, i) in st.questions" :key="q.id" :href="`#soal-${q.id}`" class="u-ljk" :class="{ 'is-filled': q.chosen }">{{ i + 1 }}</a>
            </div>
            <p class="mt-3 text-xs text-[color:var(--ink-soft)]">{{ simpanTeks }}</p>
            <button class="u-btn u-btn-hitam mt-4 w-full" @click="tanyaKirim = true">Kirim jawaban</button>
          </div>
        </aside>

        <!-- Bilah bawah (mobile & tablet) -->
        <div class="fixed inset-x-0 bottom-0 z-30 border-t-[2.5px] border-[color:var(--ink)] bg-[color:var(--paper)] px-4 py-3 lg:hidden">
          <div class="mx-auto flex max-w-5xl items-center gap-3">
            <button class="min-h-11 flex-1 text-left" @click="navOpen = !navOpen">
              <span class="block text-sm font-extrabold">{{ terjawab }} / {{ st.questions.length }} terjawab</span>
              <span class="block text-xs text-[color:var(--ink-soft)]">{{ navOpen ? 'Tutup daftar nomor' : 'Lihat nomor soal' }} · {{ simpanTeks }}</span>
            </button>
            <button class="u-btn u-btn-hitam" @click="tanyaKirim = true">Kirim</button>
          </div>
          <div v-if="navOpen" class="mx-auto mt-3 grid max-w-5xl grid-cols-8 gap-2 sm:grid-cols-10">
            <a v-for="(q, i) in st.questions" :key="q.id" :href="`#soal-${q.id}`" class="u-ljk" :class="{ 'is-filled': q.chosen }" @click="navOpen = false">{{ i + 1 }}</a>
          </div>
        </div>
      </div>

      <!-- Selesai -->
      <section v-else-if="st.state === 'submitted'" class="mx-auto max-w-3xl">
        <div class="u-card p-6 text-center sm:p-8">
          <span class="u-stempel is-anim">TERKIRIM</span>
          <p class="u-display mt-5 text-2xl font-extrabold">Terima kasih, {{ st.participant }}</p>
          <p class="mt-1 text-[15px]">
            Jawaban {{ st.topic }} {{ st.auto_submitted ? 'terkirim otomatis saat waktu habis' : 'sudah terkirim' }}
            <template v-if="st.submitted_at">pada {{ wib(st.submitted_at) }} WIB</template>.
          </p>
          <template v-if="st.score != null">
            <p class="u-angka mt-5 !text-6xl">{{ fmt(st.score) }}</p>
            <p class="mt-1 font-bold">{{ st.correct_count }} dari {{ st.question_count }} benar · {{ st.grade }}</p>
            <span class="u-chip mt-3" :class="STATUS[st.status]?.chip">{{ STATUS[st.status]?.label }}</span>
          </template>
          <p v-else class="mt-4 rounded-xl bg-[color:var(--grid-bg)] p-4 text-[15px]">Nilai akan diumumkan oleh HR setelah peninjauan.</p>
          <button v-if="kelas" class="u-btn mt-5" @click="keKelas">Kembali ke daftar tes</button>
        </div>

        <div v-if="st.review?.length" class="mt-6 space-y-4">
          <h2 class="u-display text-xl font-extrabold">Pembahasan</h2>
          <article v-for="(r, i) in st.review" :key="r.id" class="u-card p-4 sm:p-5">
            <div class="flex items-start gap-3">
              <span class="u-nomor !h-9 !w-9 !text-base" :class="r.correct ? '!bg-[color:var(--hijau)]' : '!bg-[color:var(--merah)]'">{{ i + 1 }}</span>
              <p class="whitespace-pre-line pt-1 font-semibold leading-relaxed">{{ r.text }}</p>
            </div>
            <ul class="mt-3 space-y-1.5 text-[15px]">
              <li v-for="o in r.options" :key="o.key" class="flex gap-2 rounded-lg px-2 py-1.5"
                  :class="o.key === r.key ? 'bg-green-100 font-bold' : (o.key === r.chosen ? 'bg-red-100' : '')">
                <span class="w-5 shrink-0 font-extrabold">{{ o.key }}.</span><span>{{ o.text }}</span>
              </li>
            </ul>
            <p class="mt-2 text-sm font-bold">{{ r.chosen ? `Jawaban Anda: ${r.chosen}` : 'Tidak dijawab' }} · Kunci: {{ r.key || '-' }}</p>
            <p v-if="r.explanation" class="mt-2 rounded-lg bg-[color:var(--grid-bg)] p-3 text-sm leading-relaxed">{{ r.explanation }}</p>
          </article>
        </div>
      </section>

      <!-- Kedaluwarsa -->
      <section v-else class="u-card mx-auto max-w-xl p-6 text-center">
        <p class="u-display text-xl font-extrabold">Tautan sudah tidak berlaku</p>
        <p class="mt-1 text-[15px]">Batas waktu membuka tes ini sudah lewat. Hubungi HR untuk tautan baru.</p>
      </section>
    </main>

    <!-- Konfirmasi kirim -->
    <div v-if="tanyaKirim" class="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4" @click.self="tanyaKirim = false">
      <div class="u-card w-full max-w-md rounded-b-none p-6 sm:rounded-b-[var(--radius)]" role="dialog" aria-modal="true" aria-labelledby="judul-kirim">
        <p id="judul-kirim" class="u-display text-xl font-extrabold">Kirim jawaban sekarang?</p>
        <p class="mt-2 text-[15px]">
          <template v-if="belum">Masih ada <b>{{ belum }} soal</b> yang belum dijawab. </template>
          Setelah dikirim, jawaban tidak bisa diubah.
        </p>
        <p v-if="error" class="mt-3 font-bold text-[color:var(--merah)]">{{ error }}</p>
        <div class="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button class="u-btn" @click="tanyaKirim = false">Periksa lagi</button>
          <button class="u-btn u-btn-merah" :disabled="busy" @click="kirim">{{ busy ? 'Mengirim…' : 'Ya, kirim' }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import '@fontsource-variable/bricolage-grotesque'
import '../../styles/exam.css'
import '../../styles/asesmen.css'
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ClockIcon, ExclamationTriangleIcon, PlayIcon } from '@heroicons/vue/24/outline'
import { pilihDb } from '../../utils/leader'

const STATUS = {
  passed: { label: 'Lulus', chip: 'u-chip-hijau' },
  remedial: { label: 'Remedial', chip: 'u-chip-kuning' },
  relearn: { label: 'Pembelajaran ulang', chip: 'u-chip-merah' },
}

const route = useRoute()
const token = String(route.params.token || '')
const db = String(route.query.db || '')
const kelas = String(route.query.kelas || '') // dibuka dari QR kelas
const router = useRouter()
const academy = route.path.startsWith('/quiz/')
const keKelas = () => router.push({ path: `${academy ? '/kelas' : '/kelas-kabeng'}/${kelas}`, query: { db } })

const loading = ref(true)
const busy = ref(false)
const error = ref('')
const st = ref(null)
const otherDb = ref(null)
const navOpen = ref(false)
const tanyaKirim = ref(false)
const gagal = reactive({})
const menyimpan = ref(0)
const sisa = ref(null) // detik, dihitung dari waktu server
let deadline = 0
let ticker = null
let autoSent = false

// Panggilan publik: tanpa header sesi akun (memakai sesi cookie yang terikat ke DB Akademi).
async function call(path, params = {}) {
  const res = await fetch(`/web/v1/leader/take/${path}`, {
    method: 'POST', credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', method: 'call', params: { token, ...params } }),
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
    otherDb.value = { name: localStorage.getItem('name') || localStorage.getItem('username') || 'pengguna lain' }
    return false
  }
  if (!loggedIn) await pilihDb(db)
  return true
}

async function lanjutSebagaiPeserta() {
  try { await fetch('/web/session/destroy', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: '{}' }) } catch { /* abaikan */ }
  localStorage.clear()
  otherDb.value = null
  await muat()
}

function terima(data) {
  st.value = data
  if (data.state === 'in_progress' && data.seconds_left != null) {
    deadline = Date.now() + data.seconds_left * 1000
    tick()
    if (!ticker) ticker = setInterval(tick, 1000)
  } else {
    clearInterval(ticker); ticker = null
  }
}

function tick() {
  sisa.value = Math.max(0, Math.round((deadline - Date.now()) / 1000))
  if (sisa.value === 0 && st.value?.state === 'in_progress' && !autoSent) {
    autoSent = true
    kirim(true)
  }
}

async function muat() {
  loading.value = true
  error.value = ''
  try {
    if (await siapkanDb()) terima(await call('open'))
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

async function mulai() {
  busy.value = true
  error.value = ''
  try {
    terima(await call('start'))
    window.scrollTo({ top: 0 })
  } catch (e) {
    error.value = e.message
  } finally {
    busy.value = false
  }
}

async function jawab(q, key) {
  const sebelumnya = q.chosen
  q.chosen = key
  delete gagal[q.id]
  menyimpan.value++
  try {
    const res = await call('answer', { question_id: q.id, key })
    if (res && !res.saved && res.state === 'submitted') terima(await call('open'))
    else if (res?.seconds_left != null) deadline = Date.now() + res.seconds_left * 1000
  } catch {
    q.chosen = sebelumnya
    gagal[q.id] = true
  } finally {
    menyimpan.value--
  }
}

async function kirim(otomatis = false) {
  busy.value = true
  error.value = ''
  try {
    terima(await call('submit'))
    tanyaKirim.value = false
    window.scrollTo({ top: 0 })
  } catch (e) {
    error.value = e.message
    if (otomatis) setTimeout(() => { autoSent = false }, 5000) // coba lagi bila koneksi putus
  } finally {
    busy.value = false
  }
}

function onVisibility() {
  if (document.visibilityState === 'hidden' && st.value?.state === 'in_progress') call('focus').catch(() => {})
}

const terjawab = computed(() => (st.value?.questions || []).filter((q) => q.chosen).length)
const belum = computed(() => (st.value?.questions?.length || 0) - terjawab.value)
const progress = computed(() => (st.value?.questions?.length ? (terjawab.value / st.value.questions.length) * 100 : 0))
const simpanTeks = computed(() => (menyimpan.value ? 'Menyimpan…' : 'Jawaban tersimpan otomatis'))
const clock = computed(() => {
  const s = sisa.value ?? 0
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
})
const timerTone = computed(() => (sisa.value <= 60 ? 'is-danger' : sisa.value <= 300 ? 'is-warn' : ''))
const fmt = (n) => (n == null ? '-' : Number(n).toLocaleString('id-ID', { maximumFractionDigits: 1 }))
const wib = (utc) => new Date(`${utc.replace(' ', 'T')}Z`).toLocaleString('id-ID', {
  timeZone: 'Asia/Jakarta', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
})

onMounted(() => {
  document.title = academy ? 'Quiz Akademi Pitcar' : 'Assessment Calon Kepala Bengkel'
  document.addEventListener('visibilitychange', onVisibility)
  muat()
})
onBeforeUnmount(() => {
  clearInterval(ticker)
  document.removeEventListener('visibilitychange', onVisibility)
})
</script>
