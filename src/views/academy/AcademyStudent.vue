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

      <!-- Setelah memilih nama -->
      <section v-else-if="hasil">
        <p class="text-sm font-bold text-[color:var(--ink-soft)]">Halo,</p>
        <p class="u-display text-2xl font-extrabold sm:text-3xl">{{ hasil.participant }}</p>

        <div class="mt-5">
          <h2 class="u-display text-xl font-extrabold">Quiz terbuka</h2>
          <p v-if="!hasil.tasks.length" class="u-card mt-3 p-4 text-[15px]">Belum ada quiz untuk Anda saat ini.</p>
          <div v-else class="mt-3 space-y-3">
            <button v-for="t in hasil.tasks" :key="t.token" type="button" class="u-card flex w-full items-center gap-4 p-4 text-left transition-transform active:translate-x-[2px] active:translate-y-[2px]" @click="buka(t)">
              <span class="min-w-0 flex-1">
                <span class="u-display block text-lg font-extrabold leading-snug">{{ t.topic }}</span>
                <span class="mt-1 block text-sm text-[color:var(--ink-soft)]">{{ t.kind === 'remedial' ? 'Quiz susulan' : 'Quiz' }} · {{ t.time_limit_minutes }} menit</span>
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
            <MaterialList class="mt-2" :materials="t.materials" :download="unduhBahan" />
          </div>
        </div>

        <div class="mt-8">
          <h2 class="u-display mb-3 text-xl font-extrabold">Progres belajar saya</h2>
          <StudentProgress :data="hasil.progress" />
        </div>
      </section>

      <!-- Pilih nama -->
      <section v-else>
        <p class="u-display text-2xl font-extrabold">Pilih nama Anda</p>
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
    </main>

    <div v-if="dipilih && !hasil" class="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-4" @click.self="gantiNama">
      <form class="u-card w-full max-w-md rounded-b-none p-6 sm:rounded-b-[var(--radius)]" role="dialog" aria-modal="true" aria-labelledby="judul-pin" @submit.prevent="konfirmasi">
        <p id="judul-pin" class="u-display text-xl font-extrabold">{{ dipilih.name }}</p>
        <template v-if="dipilih.needs_pin">
          <label for="pin" class="mt-2 block text-[15px]">Masukkan <b>4 digit terakhir</b> nomor WhatsApp Anda.</label>
          <input id="pin" ref="pinEl" v-model="pin" inputmode="numeric" pattern="[0-9]*" maxlength="4" autocomplete="off"
            class="mt-3 w-full rounded-xl border-[2.5px] border-[color:var(--ink)] bg-white p-3 text-center text-3xl font-extrabold tracking-[0.5em] focus:outline-none"
            @input="pin = pin.replace(/\D/g, '').slice(0, 4)" />
        </template>
        <p v-else class="mt-2 text-[15px]">Benar ini nama Anda?</p>
        <p v-if="error" class="mt-3 font-bold text-[color:var(--merah)]" role="alert">{{ error }}</p>
        <div class="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" class="u-btn" @click="gantiNama">Bukan saya</button>
          <button type="submit" class="u-btn u-btn-merah" :disabled="busy || (dipilih.needs_pin && pin.length < 4)">{{ busy ? 'Memeriksa…' : 'Lanjut' }}</button>
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
import { computed, nextTick, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ChevronRightIcon, ExclamationTriangleIcon, MagnifyingGlassIcon, PlayIcon } from '@heroicons/vue/24/outline'
import { pilihDb } from '../../utils/leader'
import StudentProgress from '../../components/academy/StudentProgress.vue'
import MaterialList from '../../components/academy/MaterialList.vue'
import LNotice from '../../components/leader/LNotice.vue'
import { downloadBase64 } from '../../services/leaderApi'

const route = useRoute()
const router = useRouter()
const kiosk = String(route.params.kiosk || '')
const db = String(route.query.db || '')
const SIMPAN = `kelas:${kiosk}`

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
const pinEl = ref(null)
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
    const data = await call('open')
    program.value = data.program
    peserta.value = data.participants
    const lama = ingatan()
    const p = lama && peserta.value.find((x) => x.id === lama.id)
    if (p) { dipilih.value = p; pin.value = lama.pin || ''; await konfirmasi() }
  } catch (e) {
    fatal.value = e.message
  } finally {
    loading.value = false
  }
}

async function pilih(p) {
  dipilih.value = p
  pin.value = ''
  error.value = ''
  if (p.needs_pin) { await nextTick(); pinEl.value?.focus() }
}

function gantiNama() {
  dipilih.value = null
  hasil.value = null
  pin.value = ''
  error.value = ''
  ingat(null)
}

async function konfirmasi() {
  busy.value = true
  error.value = ''
  try {
    hasil.value = await call('pick', { participant_id: dipilih.value.id, pin: pin.value })
    ingat({ id: dipilih.value.id, pin: pin.value })
  } catch (e) {
    error.value = e.message
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

const buka = (t) => router.push({ path: `/quiz/${t.token}`, query: { db, kelas: kiosk } })

onMounted(() => { document.title = 'Kelas Offline · Akademi Pitcar'; muat() })
</script>
