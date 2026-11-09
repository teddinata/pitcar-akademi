<!-- Kelas Offline Akademi (admin): CRUD angkatan/periode, lalu ringkasan, jadwal & absen, kurikulum & quiz,
     siswa & quiz terkirim, progres materi, evaluasi, nilai quiz, mentor. -->
<template>
  <div class="ujian min-h-screen p-4 md:p-6">
    <LNotice />
    <div class="mb-6 flex flex-wrap items-start justify-between gap-3">
      <div class="min-w-0">
        <p class="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[.08em] text-[color:var(--ink-soft)]">Akademi <span class="u-new">NEW</span></p>
        <h1 class="u-display mt-1 text-[1.8rem] font-extrabold leading-none sm:text-[2.2rem]">Kelas Offline</h1>
        <p class="mt-2 max-w-2xl text-[15px] text-[color:var(--ink-soft)]">Absen dicatat mentor saat kelas berjalan, materi dan progres tiap siswa terlacak per hari, evaluasi mingguan, quiz lewat QR kelas.</p>
      </div>
      <div v-if="config" class="flex flex-wrap gap-2">
        <button v-if="config.programs.length" type="button" class="u-btn" @click="bukaSalin"><DocumentDuplicateIcon class="h-5 w-5" />Salin dari angkatan lama</button>
        <button type="button" class="u-btn u-btn-merah" @click="bukaAngkatan(null)"><PlusIcon class="h-5 w-5" />Angkatan baru</button>
      </div>
    </div>

    <div v-if="loading" class="space-y-3" aria-busy="true"><div class="u-card h-24 animate-pulse"></div><div class="u-card h-40 animate-pulse"></div></div>
    <ErrorState v-else-if="error" :message="error" @retry="load" />
    <div v-else-if="!config.programs.length" class="u-card p-8 text-center">
      <p class="u-display text-xl font-extrabold">Belum ada angkatan</p>
      <p class="mt-1 text-[15px] text-[color:var(--ink-soft)]">Mulai dengan membuat angkatan (periode kelas), lalu isi kurikulum, siswa, mentor, dan jadwal.</p>
      <button type="button" class="u-btn u-btn-merah mt-4" @click="bukaAngkatan(null)">Buat angkatan</button>
    </div>

    <template v-else>
      <div v-if="config.programs.length > 1" class="mb-4 max-w-sm">
        <label for="ak-program" class="u-label">Angkatan</label>
        <select id="ak-program" v-model="programId" class="u-input">
          <option v-for="p in config.programs" :key="p.id" :value="p.id">{{ p.name }}{{ p.active ? '' : ' (arsip)' }}</option>
        </select>
      </div>

      <section class="u-card p-4 sm:p-5">
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div class="min-w-0">
            <h2 class="u-display text-xl font-extrabold">{{ program.name }}<span v-if="!program.active" class="u-chip u-chip-abu ml-2">arsip</span></h2>
            <p class="mt-1 text-sm">{{ [program.start_date && program.end_date ? `${tanggal(program.start_date, false)} – ${tanggal(program.end_date, false)}` : '', program.location].filter(Boolean).join(' · ') || 'Tanggal & lokasi belum diisi' }}</p>
            <p v-if="program.description" class="mt-1 max-w-prose whitespace-pre-line text-sm text-[color:var(--ink-soft)]">{{ program.description }}</p>
          </div>
          <div class="flex flex-wrap gap-2">
            <button type="button" class="u-btn" @click="kioskOpen = true"><QrCodeIcon class="h-5 w-5" />QR kelas</button>
            <button type="button" class="u-btn" @click="bukaAngkatan(program)"><PencilSquareIcon class="h-5 w-5" />Ubah</button>
            <button type="button" class="u-btn u-btn-ghost u-btn-bahaya" @click="hapusOpen = true"><TrashIcon class="h-5 w-5" />Hapus</button>
          </div>
        </div>
        <div class="mt-4 grid gap-3 sm:grid-cols-3">
          <div class="rounded-xl border-2 border-[color:var(--ink)] bg-[color:var(--stabilo)] p-3"><p class="text-xs font-extrabold uppercase tracking-[.06em]">Siswa</p><p><span class="u-angka !text-[2rem]">{{ program.participant_count }}</span> <span class="text-sm font-bold">orang</span></p></div>
          <div class="rounded-xl border-2 border-[color:var(--ink)] p-3"><p class="text-xs font-extrabold uppercase tracking-[.06em] text-[color:var(--ink-soft)]">Kurikulum</p><p><span class="u-angka !text-[2rem]">{{ program.topics.length }}</span> <span class="text-sm font-bold">materi · {{ program.topics.filter((t) => t.question_count).length }} ber-quiz</span></p></div>
          <div class="rounded-xl border-2 border-[color:var(--ink)] p-3"><p class="text-xs font-extrabold uppercase tracking-[.06em] text-[color:var(--ink-soft)]">Mentor</p><p class="mt-1 text-sm font-bold">{{ program.mentors.map((m) => m.name).join(', ') || 'Belum ada' }}</p></div>
        </div>
      </section>

      <nav class="u-tabs mt-6 overflow-x-auto" role="tablist" aria-label="Bagian angkatan">
        <button v-for="t in TABS" :key="t.value" type="button" role="tab" :aria-selected="tab === t.value" class="u-tab whitespace-nowrap" :class="tab === t.value ? 'is-active' : ''" @click="setTab(t.value)">{{ t.label }}</button>
      </nav>

      <OverviewTab v-if="tab === 'ringkasan'" ref="tabRef" :program="program" class="mt-5" @open-session="bukaSesi" @open-student="bukaSiswa" />
      <ScheduleTab v-else-if="tab === 'jadwal'" ref="tabRef" :program="program" class="mt-5" @open-session="bukaSesi" @import="impor = 'schedule'" @changed="load(true)" />
      <MaterialsTab v-else-if="tab === 'kurikulum'" :program="program" :config="config" academy class="mt-5" @changed="load(true)" @import="impor = 'curriculum'" />
      <ParticipantsTab v-else-if="tab === 'siswa'" ref="tabRef" :program="program" :config="config" academy class="mt-5" @import="impor = 'students'" @open-student="bukaSiswa" @changed="load(true)" />
      <ProgressTab v-else-if="tab === 'progres'" :program="program" class="mt-5" @open-student="bukaSiswa" />
      <EvaluationTab v-else-if="tab === 'evaluasi'" :program="program" class="mt-5" />
      <RecapTab v-else-if="tab === 'quiz'" :program="program" class="mt-5" />
      <MentorsTab v-else :program="program" :programs="config.programs" class="mt-5" @changed="load(true)" />
    </template>

    <!-- Angkatan: tambah/ubah -->
    <LDialog :open="!!form" :title="form?.id ? 'Ubah angkatan' : 'Angkatan baru'" @close="form = null">
      <form v-if="form" id="ak-form" class="space-y-4" @submit.prevent="simpanAngkatan">
        <div><label for="af-name" class="u-label">Nama angkatan</label><input id="af-name" v-model="form.name" class="u-input" placeholder="mis. Angkatan 3 · Jan–Apr 2027" required /></div>
        <div class="grid grid-cols-2 gap-3">
          <div><label for="af-start" class="u-label">Mulai</label><input id="af-start" v-model="form.start_date" type="date" class="u-input" /></div>
          <div><label for="af-end" class="u-label">Selesai</label><input id="af-end" v-model="form.end_date" type="date" class="u-input" /></div>
        </div>
        <button v-if="form.start_date" type="button" class="u-btn u-btn-ghost u-btn-kecil" @click="form.end_date = tambahBulan(form.start_date, 4)">Isi selesai = 4 bulan dari mulai</button>
        <div class="grid grid-cols-2 gap-3">
          <div><label for="af-code" class="u-label">Kode (opsional)</label><input id="af-code" v-model="form.code" class="u-input" /></div>
          <div><label for="af-pass" class="u-label">Nilai lulus quiz</label><input id="af-pass" v-model.number="form.pass_score" type="number" min="1" max="100" class="u-input" /></div>
        </div>
        <div v-if="!salinDari"><label for="af-loc" class="u-label">Lokasi kelas</label><input id="af-loc" v-model="form.location" class="u-input" /></div>
        <div v-if="!salinDari"><label for="af-desc" class="u-label">Deskripsi</label><textarea id="af-desc" v-model="form.description" rows="3" class="u-input"></textarea></div>
        <div v-if="salinDari !== null">
          <label for="af-src" class="u-label">Salin dari angkatan</label>
          <select id="af-src" v-model="salinDari" class="u-input" required><option v-for="p in config.programs" :key="p.id" :value="p.id">{{ p.name }}</option></select>
          <p class="u-help">Yang disalin: kurikulum, quiz (soal), bahan, mentor, lokasi. Siswa, jadwal, absen, dan nilai tidak ikut.</p>
        </div>
        <label v-if="form.id" class="flex min-h-11 items-center gap-3 text-sm font-bold"><input v-model="form.active" type="checkbox" class="u-check" />Angkatan aktif (hilangkan centang untuk mengarsipkan)</label>
      </form>
      <template #footer>
        <button type="button" class="u-btn" @click="form = null">Batal</button>
        <button type="submit" form="ak-form" class="u-btn u-btn-merah" :disabled="saving">{{ saving ? 'Menyimpan…' : salinDari ? 'Buat salinan' : 'Simpan' }}</button>
      </template>
    </LDialog>

    <ConfirmDialog :open="hapusOpen" title="Hapus angkatan?" :message="`Angkatan &quot;${program?.name}&quot; akan dihapus. Bila sudah punya quiz yang dikerjakan, angkatan hanya diarsipkan.`" confirm-label="Hapus" :busy="saving" @cancel="hapusOpen = false" @confirm="hapusAngkatan" />

    <!-- Jalankan sesi -->
    <LDialog :open="!!sesiId" title="Kelas" wide @close="tutupSesi">
      <SessionRunner v-if="sesiId" :api="academyApi" :session-id="sesiId" @changed="sesiBerubah = true" />
    </LDialog>

    <!-- Detail siswa -->
    <LDialog :open="!!siswa" :title="siswa?.name || ''" :subtitle="siswa?.origin" wide @close="siswa = null">
      <div v-if="siswaLoading" class="u-card h-40 animate-pulse"></div>
      <StudentProgress v-else-if="siswaData" :data="siswaData" />
    </LDialog>

    <ImportDialog :open="!!impor" :target="impor" :program-id="program?.id" :api="academyApi" @close="impor = null" @done="setelahImpor" />
    <KioskDialog :open="kioskOpen" :program="program" academy @close="kioskOpen = false" />
  </div>
</template>

<script setup>
import '@fontsource-variable/bricolage-grotesque'
import '../../styles/exam.css'
import '../../styles/asesmen.css'
import '../../styles/leader.css'
import '../../styles/academy.css'
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { DocumentDuplicateIcon, PencilSquareIcon, PlusIcon, QrCodeIcon, TrashIcon } from '@heroicons/vue/24/outline'
import { academyApi, tanggal } from '../../services/academyApi'
import LDialog from '../../components/leader/LDialog.vue'
import ConfirmDialog from '../../components/leader/ConfirmDialog.vue'
import ErrorState from '../../components/leader/ErrorState.vue'
import LNotice from '../../components/leader/LNotice.vue'
import KioskDialog from '../../components/leader/KioskDialog.vue'
import { notify } from '../../components/leader/notice'
import MaterialsTab from '../../components/leader/MaterialsTab.vue'
import ParticipantsTab from '../../components/leader/ParticipantsTab.vue'
import RecapTab from '../../components/leader/RecapTab.vue'
import OverviewTab from '../../components/academy/OverviewTab.vue'
import ScheduleTab from '../../components/academy/ScheduleTab.vue'
import ProgressTab from '../../components/academy/ProgressTab.vue'
import EvaluationTab from '../../components/academy/EvaluationTab.vue'
import MentorsTab from '../../components/academy/MentorsTab.vue'
import SessionRunner from '../../components/academy/SessionRunner.vue'
import StudentProgress from '../../components/academy/StudentProgress.vue'
import ImportDialog from '../../components/academy/ImportDialog.vue'

const TABS = [
  { value: 'ringkasan', label: 'Ringkasan' },
  { value: 'jadwal', label: 'Jadwal & Absen' },
  { value: 'kurikulum', label: 'Kurikulum & Quiz' },
  { value: 'siswa', label: 'Siswa & Kirim Quiz' },
  { value: 'progres', label: 'Progres Materi' },
  { value: 'evaluasi', label: 'Evaluasi' },
  { value: 'quiz', label: 'Nilai Quiz' },
  { value: 'mentor', label: 'Mentor' },
]

const route = useRoute()
const router = useRouter()
const config = ref(null)
const loading = ref(true)
const error = ref('')
const programId = ref(Number(localStorage.getItem('academyProgramId')) || null)
const tab = ref(TABS.some((t) => t.value === route.query.tab) ? route.query.tab : 'ringkasan')
const tabRef = ref(null)
const form = ref(null)
const salinDari = ref(null)
const saving = ref(false)
const hapusOpen = ref(false)
const kioskOpen = ref(false)
const impor = ref(null)
const sesiId = ref(null)
const sesiBerubah = ref(false)
const siswa = ref(null)
const siswaData = ref(null)
const siswaLoading = ref(false)

const program = computed(() => {
  const list = config.value?.programs || []
  const p = list.find((x) => x.id === programId.value) || list[0]
  return p ? { ...p, topics: p.topics || [], mentors: p.mentors || [] } : null
})

async function load(silent = false) {
  if (!silent) loading.value = true
  error.value = ''
  try {
    config.value = await academyApi.config()
    if (!config.value.programs.some((p) => p.id === programId.value)) programId.value = config.value.programs.find((p) => p.active)?.id || config.value.programs[0]?.id || null
  } catch (e) { error.value = e.message } finally { loading.value = false }
}

const setTab = (v) => { tab.value = v; router.replace({ query: { ...route.query, tab: v } }) }
watch(programId, (v) => { if (v) localStorage.setItem('academyProgramId', v) })

const tambahBulan = (iso, n) => {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1 + n, d - 1)).toISOString().slice(0, 10)
}

function bukaAngkatan(p) {
  salinDari.value = null
  form.value = p
    ? { id: p.id, name: p.name, code: p.code || '', description: p.description || '', pass_score: p.pass_score, start_date: p.start_date || '', end_date: p.end_date || '', location: p.location || '', active: p.active }
    : { id: null, name: '', code: '', description: '', pass_score: 80, start_date: '', end_date: '', location: '', active: true }
}

function bukaSalin() {
  bukaAngkatan(null)
  salinDari.value = program.value?.id || config.value.programs[0].id
}

async function simpanAngkatan() {
  saving.value = true
  try {
    const { id, ...data } = form.value
    data.start_date = data.start_date || false
    data.end_date = data.end_date || false
    let res
    if (salinDari.value) {
      res = await academyApi.programCopy(salinDari.value, data)
      if (data.pass_score) await academyApi.programSave(res.id, { pass_score: data.pass_score })
      notify.success(`Angkatan dibuat dengan ${res.topics} materi tersalin`)
    } else {
      res = await academyApi.programSave(id, data)
      notify.success('Angkatan tersimpan')
    }
    if (!id && res?.id) programId.value = res.id
    form.value = null
    await load(true)
  } catch (e) { notify.error(e.message) } finally { saving.value = false }
}

async function hapusAngkatan() {
  saving.value = true
  try {
    const r = await academyApi.programDelete(program.value.id)
    hapusOpen.value = false
    notify.success(r?.archived ? 'Angkatan diarsipkan' : 'Angkatan dihapus')
    await load(true)
  } catch (e) { notify.error(e.message) } finally { saving.value = false }
}

const bukaSesi = (id) => { sesiId.value = id; sesiBerubah.value = false }
function tutupSesi() {
  sesiId.value = null
  if (sesiBerubah.value) tabRef.value?.load?.()
}

async function bukaSiswa(p) {
  siswa.value = p
  siswaData.value = null
  siswaLoading.value = true
  try { siswaData.value = await academyApi.student(p.id) } catch (e) { notify.error(e.message); siswa.value = null } finally { siswaLoading.value = false }
}

async function setelahImpor() {
  await load(true)
  tabRef.value?.load?.()
}

onMounted(load)
</script>
