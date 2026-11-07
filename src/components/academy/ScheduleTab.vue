<!-- Jadwal sesi per minggu: tambah/ubah/hapus sesi, buat jadwal berulang, impor jadwal. Klik sesi = jalankan. -->
<template>
  <div>
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div class="flex items-center gap-2">
        <button type="button" class="u-btn !w-11 !p-0" aria-label="Minggu sebelumnya" @click="geser(-7)"><ChevronLeftIcon class="h-5 w-5" /></button>
        <p class="u-display min-w-[12rem] text-center text-lg font-extrabold">{{ tanggal(senin, false) }} – {{ tanggal(tambahHari(senin, 6), false) }}</p>
        <button type="button" class="u-btn !w-11 !p-0" aria-label="Minggu berikutnya" @click="geser(7)"><ChevronRightIcon class="h-5 w-5" /></button>
        <button type="button" class="u-btn u-btn-ghost" @click="senin = seninDari(hariIniWib())">Minggu ini</button>
      </div>
      <div class="flex flex-wrap gap-2">
        <button type="button" class="u-btn" @click="$emit('import')"><ArrowUpTrayIcon class="h-5 w-5" />Impor jadwal</button>
        <button type="button" class="u-btn" @click="bukaGen"><ArrowPathIcon class="h-5 w-5" />Jadwal berulang</button>
        <button type="button" class="u-btn u-btn-merah" @click="bukaSesi(null)"><PlusIcon class="h-5 w-5" />Tambah sesi</button>
      </div>
    </div>

    <div v-if="loading" class="mt-4 space-y-3" aria-busy="true"><div v-for="i in 3" :key="i" class="u-card h-20 animate-pulse"></div></div>
    <div v-else-if="error" class="u-card mt-4 p-6 text-center"><p class="font-bold">{{ error }}</p><button type="button" class="u-btn mt-3" @click="load">Coba lagi</button></div>
    <div v-else class="mt-4 space-y-4">
      <section v-for="day in hari" :key="day">
        <p class="text-sm font-extrabold" :class="day === hariIniWib() ? 'text-[color:var(--merah)]' : ''">{{ tanggal(day) }}<template v-if="day === hariIniWib()"> · hari ini</template></p>
        <p v-if="!perHari[day]?.length" class="mt-1 text-sm text-[color:var(--ink-soft)]">Tidak ada sesi.</p>
        <ul v-else class="mt-2 grid gap-3 md:grid-cols-2">
          <li v-for="s in perHari[day]" :key="s.id" class="relative">
            <SessionCard :s="s" @open="$emit('open-session', s.id)" />
            <div class="mt-1 flex gap-1">
              <button type="button" class="u-btn u-btn-ghost u-btn-kecil" @click="bukaSesi(s)"><PencilSquareIcon class="h-4 w-4" />Ubah jadwal</button>
              <button type="button" class="u-btn u-btn-ghost u-btn-kecil u-btn-bahaya" @click="hapus = s"><TrashIcon class="h-4 w-4" />{{ s.state === 'planned' ? 'Hapus' : 'Batalkan' }}</button>
            </div>
          </li>
        </ul>
      </section>
    </div>

    <!-- Tambah / ubah sesi -->
    <LDialog :open="!!form" :title="form?.id ? 'Ubah sesi' : 'Tambah sesi'" @close="form = null">
      <form v-if="form" id="ss-form" class="space-y-4" @submit.prevent="simpan">
        <div class="grid grid-cols-3 gap-3">
          <div class="col-span-3 sm:col-span-1"><label for="ss-date" class="u-label">Tanggal</label><input id="ss-date" v-model="form.date" type="date" class="u-input" required /></div>
          <div><label for="ss-t0" class="u-label">Mulai</label><input id="ss-t0" v-model="form.time_start" type="time" class="u-input" required /></div>
          <div><label for="ss-t1" class="u-label">Selesai</label><input id="ss-t1" v-model="form.time_end" type="time" class="u-input" required /></div>
        </div>
        <div><label for="ss-title" class="u-label">Judul (opsional)</label><input id="ss-title" v-model="form.title" class="u-input" placeholder="mis. Praktik rem, Ujian modul 1" /></div>
        <div><label for="ss-mentor" class="u-label">Mentor</label>
          <select id="ss-mentor" v-model="form.mentor_id" class="u-input"><option :value="null">Belum ditentukan</option><option v-for="m in mentors" :key="m.id" :value="m.id">{{ m.name }}</option></select>
          <p v-if="!mentors.length" class="u-help">Belum ada mentor di angkatan ini. Tambahkan di tab Mentor.</p>
        </div>
        <fieldset>
          <legend class="u-label">Materi rencana</legend>
          <div class="max-h-56 overflow-y-auto rounded-xl border-2 border-[color:var(--ink)] p-2">
            <p v-if="!program.topics.length" class="text-sm">Kurikulum belum diisi.</p>
            <label v-for="t in program.topics" :key="t.id" class="flex min-h-11 items-center gap-3 rounded-lg px-2 text-sm hover:bg-[#fffbe0]">
              <input v-model="form.planned_topic_ids" type="checkbox" :value="t.id" class="u-check" />{{ t.code ? `${t.code} · ` : '' }}{{ t.name }}
            </label>
          </div>
        </fieldset>
      </form>
      <template #footer>
        <button type="button" class="u-btn" @click="form = null">Batal</button>
        <button type="submit" form="ss-form" class="u-btn u-btn-merah" :disabled="busy">{{ busy ? 'Menyimpan…' : 'Simpan' }}</button>
      </template>
    </LDialog>

    <!-- Jadwal berulang -->
    <LDialog :open="!!gen" title="Buat jadwal berulang" subtitle="Tanggal yang sudah punya sesi dilewati. Materi bisa diisi per sesi setelahnya." @close="gen = null">
      <form v-if="gen" id="sg-form" class="space-y-4" @submit.prevent="buatBerulang">
        <div class="grid grid-cols-2 gap-3">
          <div><label for="sg-from" class="u-label">Dari</label><input id="sg-from" v-model="gen.date_from" type="date" class="u-input" required /></div>
          <div><label for="sg-to" class="u-label">Sampai</label><input id="sg-to" v-model="gen.date_to" type="date" class="u-input" required /></div>
          <div><label for="sg-t0" class="u-label">Mulai</label><input id="sg-t0" v-model="gen.time_start" type="time" class="u-input" required /></div>
          <div><label for="sg-t1" class="u-label">Selesai</label><input id="sg-t1" v-model="gen.time_end" type="time" class="u-input" required /></div>
        </div>
        <fieldset><legend class="u-label">Hari</legend>
          <div class="flex flex-wrap gap-2">
            <label v-for="(h, i) in HARI" :key="i" class="u-pilih !flex-none px-3" :class="{ 'is-on': gen.weekdays.includes(i) }"><input v-model="gen.weekdays" type="checkbox" :value="i" class="sr-only" />{{ h }}</label>
          </div>
        </fieldset>
        <div><label for="sg-mentor" class="u-label">Mentor</label>
          <select id="sg-mentor" v-model="gen.mentor_id" class="u-input"><option :value="null">Belum ditentukan</option><option v-for="m in mentors" :key="m.id" :value="m.id">{{ m.name }}</option></select>
        </div>
        <div><label for="sg-skip" class="u-label">Tanggal libur (opsional)</label><input id="sg-skip" v-model="gen.skip" class="u-input" placeholder="2027-01-27, 2027-02-17" /><p class="u-help">Pisahkan dengan koma, format TTTT-BB-HH.</p></div>
      </form>
      <template #footer>
        <button type="button" class="u-btn" @click="gen = null">Batal</button>
        <button type="submit" form="sg-form" class="u-btn u-btn-merah" :disabled="busy || !gen?.weekdays.length">{{ busy ? 'Membuat…' : 'Buat jadwal' }}</button>
      </template>
    </LDialog>

    <ConfirmDialog :open="!!hapus" :title="hapus?.state === 'planned' ? 'Hapus sesi?' : 'Batalkan sesi?'"
      :message="hapus?.state === 'planned' ? 'Sesi terjadwal ini akan dihapus.' : 'Sesi sudah berjalan, jadi hanya ditandai batal. Absen dan jurnalnya tidak dihitung lagi.'"
      confirm-label="Ya" :busy="busy" @cancel="hapus = null" @confirm="doHapus" />
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { ArrowPathIcon, ArrowUpTrayIcon, ChevronLeftIcon, ChevronRightIcon, PencilSquareIcon, PlusIcon, TrashIcon } from '@heroicons/vue/24/outline'
import LDialog from '../leader/LDialog.vue'
import ConfirmDialog from '../leader/ConfirmDialog.vue'
import { notify } from '../leader/notice'
import SessionCard from './SessionCard.vue'
import { academyApi, hariIniWib, seninDari, tambahHari, tanggal } from '../../services/academyApi'

const props = defineProps({ program: Object })
const emit = defineEmits(['open-session', 'import', 'changed'])
const HARI = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']

const senin = ref(seninDari(hariIniWib()))
const sessions = ref([])
const loading = ref(true)
const error = ref('')
const busy = ref(false)
const form = ref(null)
const gen = ref(null)
const hapus = ref(null)

const mentors = computed(() => props.program.mentors || [])
const hari = computed(() => Array.from({ length: 7 }, (_, i) => tambahHari(senin.value, i)))
const perHari = computed(() => sessions.value.reduce((acc, s) => { (acc[s.date] = acc[s.date] || []).push(s); return acc }, {}))

const geser = (n) => { senin.value = tambahHari(senin.value, n) }

async function load() {
  loading.value = true
  error.value = ''
  try {
    sessions.value = await academyApi.sessions(props.program.id, { date_from: senin.value, date_to: tambahHari(senin.value, 6) })
  } catch (e) { error.value = e.message } finally { loading.value = false }
}

function bukaSesi(s) {
  form.value = s
    ? { id: s.id, date: s.date, time_start: s.time_start, time_end: s.time_end, title: s.title, mentor_id: s.mentor_id, planned_topic_ids: [...s.planned_topic_ids] }
    : { id: null, date: hariIniWib() < senin.value ? senin.value : hariIniWib(), time_start: '08:00', time_end: '16:00', title: '', mentor_id: mentors.value[0]?.id || null, planned_topic_ids: [] }
}

const bukaGen = () => {
  gen.value = { date_from: props.program.start_date || hariIniWib(), date_to: props.program.end_date || tambahHari(hariIniWib(), 30), time_start: '08:00', time_end: '16:00', weekdays: [0, 1, 2, 3, 4], mentor_id: mentors.value[0]?.id || null, skip: '' }
}

async function aksi(fn, pesan) {
  busy.value = true
  try { const r = await fn(); notify.success(typeof pesan === 'function' ? pesan(r) : pesan); await load(); emit('changed'); return r } catch (e) { notify.error(e.message) } finally { busy.value = false }
}

async function simpan() {
  const { id, ...data } = form.value
  if (!id) data.program_id = props.program.id
  const r = await aksi(() => academyApi.sessionSave(id, data), 'Sesi tersimpan')
  if (r) { form.value = null; senin.value = seninDari(r.date) }
}

async function buatBerulang() {
  const g = gen.value
  const r = await aksi(() => academyApi.sessionsGenerate({
    program_id: props.program.id, date_from: g.date_from, date_to: g.date_to, weekdays: g.weekdays, time_start: g.time_start,
    time_end: g.time_end, mentor_id: g.mentor_id, skip_dates: g.skip.split(',').map((x) => x.trim()).filter(Boolean),
  }), (res) => `${res.created} sesi dibuat`)
  if (r) { gen.value = null; senin.value = seninDari(g.date_from) }
}

async function doHapus() {
  await aksi(() => academyApi.sessionDelete(hapus.value.id), 'Sesi diperbarui')
  hapus.value = null
}

watch([senin, () => props.program.id], load)
onMounted(load)
defineExpose({ load })
</script>
