<!-- Halaman mentor Kelas Offline (tautan pribadi bertoken, tanpa login): kelas hari ini, kelas yang belum
     ditutup, jadwal 7 hari, QR quiz. Ketuk sesi untuk menjalankannya. -->
<template>
  <div class="ujian min-h-screen">
    <LNotice />
    <header class="sticky top-0 z-30 border-b-[2.5px] border-[color:var(--ink)] bg-[color:var(--paper)]">
      <div class="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
        <button v-if="sesiId" type="button" class="u-btn !w-11 !p-0" aria-label="Kembali ke daftar kelas" @click="tutupSesi"><ArrowLeftIcon class="h-5 w-5" /></button>
        <div class="min-w-0 flex-1">
          <p class="truncate text-xs font-bold uppercase tracking-wide text-[color:var(--ink-soft)]">Mentor Kelas Offline · Akademi Pitcar</p>
          <p class="u-display truncate text-lg font-extrabold leading-tight sm:text-xl">{{ home?.mentor.name || 'Memuat…' }}</p>
        </div>
      </div>
    </header>

    <main class="mx-auto max-w-3xl px-4 py-6 pb-16">
      <div v-if="loading" class="space-y-3"><div class="u-card h-24 animate-pulse"></div><div class="u-card h-24 animate-pulse"></div></div>

      <section v-else-if="otherDb" class="u-card mx-auto max-w-xl p-6">
        <p class="u-display text-xl font-extrabold">Halaman ini untuk mentor</p>
        <p class="mt-2 text-[15px] leading-relaxed">Anda sedang masuk ke Akademi sebagai <b>{{ otherDb }}</b> di database lain. Lanjutkan di sini dan Anda akan keluar dari akun itu.</p>
        <button type="button" class="u-btn u-btn-hitam mt-5" @click="keluarLalu">Keluar & lanjut sebagai mentor</button>
      </section>

      <section v-else-if="fatal" class="u-card mx-auto max-w-xl p-6 text-center">
        <ExclamationTriangleIcon class="mx-auto h-10 w-10 text-[color:var(--merah)]" />
        <p class="u-display mt-2 text-xl font-extrabold">Tautan tidak bisa dibuka</p>
        <p class="mt-1 text-[15px]">{{ fatal }}</p>
        <button type="button" class="u-btn mt-5" @click="muat">Coba lagi</button>
      </section>

      <SessionRunner v-else-if="sesiId" :api="api" :session-id="sesiId" mentor-mode @changed="berubah = true" />

      <template v-else-if="home">
        <p v-if="!home.programs.length" class="u-card p-5 text-[15px]">Anda belum ditugaskan ke angkatan mana pun. Hubungi admin Akademi.</p>

        <section v-if="home.open_past.length" class="mb-6">
          <h2 class="u-display text-xl font-extrabold">Belum ditutup</h2>
          <p class="u-help">Kelas yang lewat tapi belum dimulai atau belum diselesaikan. Lengkapi absennya.</p>
          <ul class="mt-3 space-y-3"><li v-for="s in home.open_past" :key="s.id"><SessionCard :s="s" :show-program="multi" @open="bukaSesi(s.id)" /></li></ul>
        </section>

        <section>
          <h2 class="u-display text-xl font-extrabold">Kelas hari ini · {{ tanggal(home.today_date) }}</h2>
          <p v-if="!home.today.length" class="u-card mt-3 p-5 text-[15px]">Tidak ada kelas terjadwal hari ini.</p>
          <ul v-else class="mt-3 space-y-3"><li v-for="s in home.today" :key="s.id"><SessionCard :s="s" :show-program="multi" @open="bukaSesi(s.id)" /></li></ul>
        </section>

        <section v-if="home.programs.length" class="mt-6">
          <h2 class="u-display text-xl font-extrabold">Quiz di kelas</h2>
          <p class="u-help">Tampilkan QR di layar. Siswa memindai, memilih nama, lalu mengerjakan quiz yang sudah dikirim admin.</p>
          <div class="mt-3 flex flex-wrap gap-2">
            <button v-for="p in home.programs" :key="p.id" type="button" class="u-btn" @click="kioskProgram = p"><QrCodeIcon class="h-5 w-5" />QR {{ p.name }}</button>
          </div>
        </section>

        <section v-if="bahanProgram.length" class="mt-6">
          <h2 class="u-display text-xl font-extrabold">Bahan materi</h2>
          <p class="u-help">Semua PDF/slide kurikulum, termasuk yang khusus pengajar. Ketuk materi untuk melihat bahannya.</p>
          <div v-for="p in bahanProgram" :key="p.id" class="mt-3">
            <p v-if="multi" class="text-xs font-extrabold uppercase tracking-[.06em] text-[color:var(--ink-soft)]">{{ p.name }}</p>
            <details v-for="t in p.topics" :key="t.id" class="u-card mt-2 p-3">
              <summary class="flex min-h-11 cursor-pointer items-center gap-2 font-bold">
                <span class="min-w-0 flex-1">{{ t.code ? `${t.code} · ` : '' }}{{ t.name }}</span>
                <span class="u-chip u-chip-abu !py-0">{{ t.materials.length }} file</span>
              </summary>
              <MaterialList class="mt-2" :materials="t.materials" :download="unduhBahan" show-internal />
            </details>
          </div>
        </section>

        <section v-if="home.upcoming.length" class="mt-6">
          <h2 class="u-display text-xl font-extrabold">7 hari ke depan</h2>
          <ul class="mt-3 space-y-3"><li v-for="s in home.upcoming" :key="s.id"><SessionCard :s="s" :show-program="multi" @open="bukaSesi(s.id)" /></li></ul>
        </section>
      </template>
    </main>

    <KioskDialog :open="!!kioskProgram" :program="kioskProgram" academy :api="api" @close="kioskProgram = null" />
  </div>
</template>

<script setup>
import '@fontsource-variable/bricolage-grotesque'
import '../../styles/exam.css'
import '../../styles/asesmen.css'
import '../../styles/leader.css'
import '../../styles/academy.css'
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { ArrowLeftIcon, ExclamationTriangleIcon, QrCodeIcon } from '@heroicons/vue/24/outline'
import { mentorClient, tanggal } from '../../services/academyApi'
import { pilihDb } from '../../utils/leader'
import LNotice from '../../components/leader/LNotice.vue'
import KioskDialog from '../../components/leader/KioskDialog.vue'
import MaterialList from '../../components/academy/MaterialList.vue'
import { downloadBase64 } from '../../services/leaderApi'
import SessionCard from '../../components/academy/SessionCard.vue'
import SessionRunner from '../../components/academy/SessionRunner.vue'

const route = useRoute()
const token = String(route.params.token || '')
const db = String(route.query.db || '')
const api = mentorClient(token)

const home = ref(null)
const loading = ref(true)
const fatal = ref('')
const otherDb = ref('')
const sesiId = ref(Number(route.query.sesi) || null)
const berubah = ref(false)
const kioskProgram = ref(null)
const multi = computed(() => (home.value?.programs.length || 0) > 1)
const bahanProgram = computed(() => (home.value?.programs || [])
  .map((p) => ({ ...p, topics: p.topics.filter((t) => t.materials?.length) }))
  .filter((p) => p.topics.length))
const unduhBahan = async (m) => {
  const f = await api.materialDownload(m.id)
  downloadBase64(f.filename, f.content, f.mimetype)
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

async function muat() {
  loading.value = true
  fatal.value = ''
  try {
    if (!(await siapkanDb())) return
    home.value = await api.mentorHome()
  } catch (e) {
    fatal.value = e.message
  } finally {
    loading.value = false
  }
}

const bukaSesi = (id) => { sesiId.value = id; berubah.value = false; window.scrollTo(0, 0) }
async function tutupSesi() {
  sesiId.value = null
  if (berubah.value) home.value = await api.mentorHome().catch(() => home.value)
}

onMounted(() => { document.title = 'Mentor · Kelas Offline Akademi'; muat() })
</script>
