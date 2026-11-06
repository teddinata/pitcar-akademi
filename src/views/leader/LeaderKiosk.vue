<template>
  <div class="ujian min-h-screen">
    <header class="sticky top-0 z-30 border-b-[2.5px] border-[color:var(--ink)] bg-[color:var(--paper)]">
      <div class="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
        <div class="min-w-0 flex-1">
          <p class="truncate text-xs font-bold uppercase tracking-wide text-[color:var(--ink-soft)]">Assessment Calon Kepala Bengkel</p>
          <p class="u-display truncate text-lg font-extrabold leading-tight sm:text-xl">{{ program || 'Memuat…' }}</p>
        </div>
        <button v-if="dipilih" class="u-btn !min-h-[40px] !px-3 !py-1.5 text-sm" @click="gantiNama">Ganti nama</button>
      </div>
    </header>

    <main class="mx-auto max-w-3xl px-4 py-6 pb-16 sm:py-8">
      <div v-if="loading" class="space-y-3">
        <div class="u-card h-16 animate-pulse"></div><div class="u-card h-16 animate-pulse"></div><div class="u-card h-16 animate-pulse"></div>
      </div>

      <section v-else-if="otherDb" class="u-card mx-auto max-w-xl p-6">
        <p class="u-display text-xl font-extrabold">Halaman ini untuk peserta</p>
        <p class="mt-2 text-[15px] leading-relaxed">
          Anda sedang masuk ke Akademi sebagai <b>{{ otherDb.name }}</b> di database lain. Pindai QR dengan HP peserta,
          atau lanjutkan di sini dan Anda akan keluar dari akun ini.
        </p>
        <button class="u-btn u-btn-hitam mt-5 w-full sm:w-auto" @click="keluarLalu">Keluar & lanjut sebagai peserta</button>
      </section>

      <section v-else-if="fatal" class="u-card mx-auto max-w-xl p-6 text-center">
        <ExclamationTriangleIcon class="mx-auto h-10 w-10 text-[color:var(--merah)]" />
        <p class="u-display mt-2 text-xl font-extrabold">QR tidak bisa dibuka</p>
        <p class="mt-1 text-[15px]">{{ fatal }}</p>
        <button class="u-btn mt-5" @click="muat">Coba lagi</button>
      </section>

      <!-- Tes milik peserta terpilih -->
      <section v-else-if="tugas" class="mx-auto max-w-2xl">
        <p class="text-sm font-bold text-[color:var(--ink-soft)]">Halo,</p>
        <p class="u-display text-2xl font-extrabold sm:text-3xl">{{ tugas.participant }}</p>
        <p class="mt-2 text-[15px]">Pilih tes yang akan dikerjakan sekarang.</p>
        <div class="mt-5 space-y-3">
          <button v-for="t in tugas.tasks" :key="t.token" class="u-card flex w-full items-center gap-4 p-4 text-left transition-transform active:translate-x-[2px] active:translate-y-[2px] sm:p-5" @click="buka(t)">
            <span class="min-w-0 flex-1">
              <span class="block u-display text-lg font-extrabold leading-snug">{{ t.topic }}</span>
              <span class="mt-1 block text-sm text-[color:var(--ink-soft)]">
                {{ t.kind === 'remedial' ? 'Tes susulan' : 'Tes awal' }} · {{ t.time_limit_minutes }} menit<template v-if="t.schedule_label"> · {{ t.schedule_label }}</template>
              </span>
              <span v-if="t.state === 'in_progress'" class="u-chip u-chip-kuning mt-2">Sedang dikerjakan · lanjutkan</span>
              <span v-else-if="t.open_until" class="mt-2 block text-xs font-bold">Berlaku sampai {{ wib(t.open_until) }} WIB</span>
            </span>
            <span class="u-btn u-btn-merah shrink-0"><PlayIcon class="h-5 w-5" />{{ t.state === 'in_progress' ? 'Lanjut' : 'Mulai' }}</span>
          </button>
        </div>
      </section>

      <!-- Pilih nama -->
      <section v-else>
        <p class="u-display text-2xl font-extrabold">Pilih nama Anda</p>
        <p class="mt-1 text-[15px]">Hanya peserta yang punya tes terbuka yang tampil di sini.</p>
        <label class="mt-4 block">
          <span class="sr-only">Cari nama</span>
          <span class="relative block">
            <MagnifyingGlassIcon class="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[color:var(--ink-soft)]" />
            <input v-model="cari" type="search" placeholder="Cari nama, cabang, atau jabatan" autocomplete="off"
                   class="w-full rounded-xl border-[2.5px] border-[color:var(--ink)] bg-white py-3 pl-10 pr-3 text-base focus:outline-none" />
          </span>
        </label>
        <p v-if="!peserta.length" class="u-card mt-5 p-5 text-center text-[15px]">Belum ada tes yang dibagikan. Tunggu arahan HR, lalu tekan <button class="font-bold underline" @click="muat">muat ulang</button>.</p>
        <p v-else-if="!tersaring.length" class="mt-5 text-center text-[15px]">Nama tidak ditemukan. Hubungi HR.</p>
        <ul class="mt-4 grid gap-3 sm:grid-cols-2">
          <li v-for="p in tersaring" :key="p.id">
            <button class="u-card flex w-full items-center gap-3 p-4 text-left transition-transform active:translate-x-[2px] active:translate-y-[2px]" @click="pilih(p)">
              <span class="u-nomor shrink-0 !h-10 !w-10 !text-base">{{ inisial(p.name) }}</span>
              <span class="min-w-0 flex-1">
                <span class="block truncate font-extrabold">{{ p.name }}</span>
                <span class="block truncate text-sm text-[color:var(--ink-soft)]">{{ [p.job, p.branch].filter(Boolean).join(' · ') || `${p.open_count} tes` }}</span>
              </span>
              <ChevronRightIcon class="h-5 w-5 shrink-0" />
            </button>
          </li>
        </ul>
      </section>
    </main>

    <!-- Konfirmasi 4 digit nomor WhatsApp -->
    <div v-if="dipilih && !tugas" class="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-4" @click.self="gantiNama">
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
import { computed, nextTick, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ChevronRightIcon, ExclamationTriangleIcon, MagnifyingGlassIcon, PlayIcon } from '@heroicons/vue/24/outline'
import { formatWib, pilihDb } from '../../utils/leader'

const route = useRoute()
const router = useRouter()
const kiosk = String(route.params.kiosk || '')
const db = String(route.query.db || '')

const loading = ref(true)
const busy = ref(false)
const fatal = ref('')
const error = ref('')
const otherDb = ref(null)
const program = ref('')
const peserta = ref([])
const cari = ref('')
const dipilih = ref(null)
const pin = ref('')
const pinEl = ref(null)
const tugas = ref(null)

const wib = (s) => formatWib(s)
const inisial = (name) => (name || '').replace(/[^\p{L}\s]/gu, ' ').split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?'

const tersaring = computed(() => {
  const q = cari.value.trim().toLowerCase()
  if (!q) return peserta.value
  return peserta.value.filter(p => [p.name, p.branch, p.job].join(' ').toLowerCase().includes(q))
})

async function call(path, params = {}) {
  const res = await fetch(`/web/v1/leader/kiosk/${path}`, {
    method: 'POST', credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
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
    otherDb.value = { name: localStorage.getItem('name') || localStorage.getItem('username') || 'pengguna lain' }
    return false
  }
  if (!loggedIn) await pilihDb(db)
  return true
}

async function keluarLalu() {
  try { await fetch('/web/session/destroy', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: '{}' }) } catch { /* abaikan */ }
  localStorage.clear()
  otherDb.value = null
  await muat()
}

async function muat() {
  loading.value = true
  fatal.value = ''
  try {
    if (!(await siapkanDb())) return
    const data = await call('open')
    program.value = data.program
    peserta.value = data.participants
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
  if (p.needs_pin) {
    await nextTick()
    pinEl.value?.focus()
  }
}

function gantiNama() {
  dipilih.value = null
  tugas.value = null
  pin.value = ''
  error.value = ''
}

async function konfirmasi() {
  busy.value = true
  error.value = ''
  try {
    const data = await call('pick', { participant_id: dipilih.value.id, pin: pin.value })
    if (data.tasks.length === 1) return buka(data.tasks[0])
    tugas.value = data
  } catch (e) {
    error.value = e.message
  } finally {
    busy.value = false
  }
}

function buka(t) {
  router.push({ path: `/ujian-kabeng/${t.token}`, query: { db, kelas: kiosk } })
}

onMounted(muat)
</script>
