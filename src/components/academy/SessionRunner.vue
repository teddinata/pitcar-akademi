<!-- Menjalankan satu sesi kelas: mulai (absen mentor + semua siswa Hadir), tandai pengecualian, materi yang
     disampaikan, nilai praktik, catatan per siswa, selesai. Dipakai di halaman admin dan halaman mentor. -->
<template>
  <div>
    <div v-if="loading" class="space-y-3" aria-busy="true"><div class="u-card h-24 animate-pulse"></div><div class="u-card h-64 animate-pulse"></div></div>
    <div v-else-if="error" class="u-card p-6 text-center">
      <p class="font-bold">{{ error }}</p>
      <button type="button" class="u-btn mt-3" @click="load">Coba lagi</button>
    </div>

    <template v-else-if="d">
      <!-- Kepala sesi -->
      <section class="u-card p-4 sm:p-5">
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div class="min-w-0">
            <p class="text-xs font-extrabold uppercase tracking-[.06em] text-[color:var(--ink-soft)]">{{ d.session.program_name }}</p>
            <h2 class="u-display text-2xl font-extrabold leading-tight">{{ tanggal(d.session.date) }}</h2>
            <p class="mt-1 text-[15px]">{{ d.session.time_start }}–{{ d.session.time_end }}<template v-if="d.session.title"> · {{ d.session.title }}</template></p>
            <p class="text-sm text-[color:var(--ink-soft)]">Mentor: <b class="text-[color:var(--ink)]">{{ d.session.teacher_name || 'belum ditentukan' }}</b><template v-if="d.session.actual_mentor_name && d.session.mentor_name && d.session.actual_mentor_name !== d.session.mentor_name"> (pengganti {{ d.session.mentor_name }})</template></p>
          </div>
          <LChip :tone="SESSION_STATE[d.session.state].tone">{{ SESSION_STATE[d.session.state].label }}</LChip>
        </div>
        <p v-if="d.session.started_at" class="mt-2 text-sm">Mulai {{ jam(d.session.started_at) }}<template v-if="d.session.ended_at"> · selesai {{ jam(d.session.ended_at) }} ({{ durasi(d.session.minutes) }})</template></p>
        <p v-for="f in d.session.flags" :key="f" class="u-notice mt-2">{{ SESSION_FLAG[f] }}</p>

        <div v-if="d.session.state === 'planned'" class="mt-4 rounded-xl border-[2.5px] border-[color:var(--ink)] bg-[color:var(--stabilo)] p-4">
          <p class="font-extrabold">Siap mulai kelas?</p>
          <p class="mt-1 text-sm">Jam mulai tercatat sebagai absen masuk {{ mentorMode ? 'Anda' : 'mentor' }}. Semua siswa langsung tercatat <b>Hadir</b>, lalu tandai yang terlambat, izin, sakit, atau alpa.</p>
          <button type="button" class="u-btn u-btn-merah u-btn-besar mt-3 w-full sm:w-auto" :disabled="busy" @click="mulai"><PlayIcon class="h-5 w-5" />{{ busy ? 'Memulai…' : 'Mulai kelas' }}</button>
        </div>
      </section>

      <!-- Bahan materi rencana/hari ini -->
      <section v-if="bahanHariIni.length" class="mt-5">
        <h3 class="u-display text-xl font-extrabold">Bahan materi</h3>
        <p class="u-help">PDF/slide untuk materi sesi ini. Yang bertanda khusus pengajar tidak terlihat siswa.</p>
        <div v-for="t in bahanHariIni" :key="t.id" class="u-card mt-3 p-3 sm:p-4">
          <p class="font-extrabold">{{ t.code ? `${t.code} · ` : '' }}{{ t.name }}</p>
          <MaterialList class="mt-2" :materials="t.materials" :download="unduhBahan" :fetch-blob="bahanBlob" show-internal />
        </div>
      </section>

      <template v-if="d.session.state !== 'planned' && d.session.state !== 'cancelled'">
        <!-- Absen -->
        <section class="mt-5">
          <div class="flex flex-wrap items-end justify-between gap-2">
            <h3 class="u-display text-xl font-extrabold">Absen siswa</h3>
            <p class="flex flex-wrap gap-x-3 text-sm font-bold">
              <span v-for="(s, k) in ATT_STATUS" :key="k" class="whitespace-nowrap">{{ s.label }} {{ hitung[k] || 0 }}</span>
            </p>
          </div>
          <p class="u-help">Ketuk status untuk mengubah. Tersimpan langsung.</p>
          <p v-if="!d.attendance.length" class="u-card mt-3 p-5 text-center text-sm">Belum ada siswa aktif di angkatan ini.</p>
          <ul v-else class="u-card mt-3">
            <li v-for="a in d.attendance" :key="a.participant_id" class="border-t-2 border-[color:var(--ink)] px-3 py-3 first:border-t-0 sm:px-4">
              <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div class="min-w-0 flex-1">
                  <p class="font-extrabold">{{ a.name }}</p>
                  <p v-if="a.note || a.left_early" class="truncate text-xs text-[color:var(--ink-soft)]">{{ [a.left_early ? 'Pulang lebih awal' : '', a.note].filter(Boolean).join(' · ') }}</p>
                </div>
                <div class="grid grid-cols-5 gap-1 sm:flex" role="group" :aria-label="`Status ${a.name}`">
                  <button v-for="(s, k) in ATT_STATUS" :key="k" type="button" class="u-att !w-full sm:!w-11" :class="[`t-${s.tone}`, { 'is-on': a.status === k }]"
                    :aria-pressed="a.status === k" :title="s.label" @click="setStatus(a, k)">{{ s.short }}<span class="sr-only"> {{ s.label }}</span></button>
                </div>
              </div>
              <div class="mt-2 flex flex-wrap gap-1">
                <button type="button" class="u-btn u-btn-ghost u-btn-kecil" :aria-pressed="a.left_early" @click="setAtt(a, { left_early: !a.left_early })">{{ a.left_early ? '✓ Pulang awal' : 'Pulang awal' }}</button>
                <button type="button" class="u-btn u-btn-ghost u-btn-kecil" @click="ketAtt = { ...a }">Keterangan</button>
                <button type="button" class="u-btn u-btn-ghost u-btn-kecil" @click="bukaCatatan(a)">Catatan siswa<span v-if="catatanOf(a.participant_id).length" class="u-chip u-chip-kuning !py-0">{{ catatanOf(a.participant_id).length }}</span></button>
              </div>
            </li>
          </ul>
        </section>

        <!-- Materi -->
        <section class="mt-6">
          <h3 class="u-display text-xl font-extrabold">Materi yang disampaikan</h3>
          <p class="u-help">Centang materi yang benar-benar diajarkan hari ini. Siswa yang tidak hadir otomatis tercatat tertinggal materi ini.</p>
          <div class="u-card mt-3 p-3 sm:p-4">
            <p v-if="!d.topics.length" class="text-sm">Kurikulum belum diisi.</p>
            <template v-for="(group, mod) in perModul" :key="mod">
              <p class="mt-2 text-xs font-extrabold uppercase tracking-[.06em] text-[color:var(--ink-soft)] first:mt-0">{{ mod }}</p>
              <label v-for="t in group" :key="t.id" class="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-2 text-sm hover:bg-[#fffbe0]">
                <input type="checkbox" class="u-check" :checked="delivered.has(t.id)" @change="toggleTopic(t.id)" />
                <span class="flex-1 font-bold">{{ t.code ? `${t.code} · ` : '' }}{{ t.name }}</span>
                <span v-if="planned.has(t.id)" class="u-chip u-chip-abu !py-0">rencana</span>
                <span v-if="t.practice" class="u-chip u-chip-kuning !py-0">praktik</span>
              </label>
            </template>
          </div>
        </section>

        <!-- Nilai praktik -->
        <section v-if="praktik.length" class="mt-6">
          <h3 class="u-display text-xl font-extrabold">Nilai praktik</h3>
          <p class="u-help">1 = belum bisa · 2 = dengan bantuan · 3 = mandiri · 4 = mandiri, rapi & cepat. Kompeten = siap dilepas mengerjakan sendiri.</p>
          <div v-for="t in praktik" :key="t.id" class="u-card mt-3 p-3 sm:p-4">
            <p class="font-extrabold">{{ t.name }}</p>
            <ul class="mt-2">
              <li v-for="a in hadir" :key="a.participant_id" class="flex flex-col gap-1.5 border-t-2 border-dashed border-[color:var(--ink)] py-2 first:border-t-0 sm:flex-row sm:items-center sm:justify-between">
                <span class="min-w-0 flex-1 text-sm font-bold">{{ a.name }}</span>
                <span class="grid grid-cols-[repeat(4,minmax(0,1fr))_auto] gap-1 sm:flex">
                  <button v-for="n in 4" :key="n" type="button" class="u-att !w-full sm:!w-11" :class="{ 'is-on': skor(a.participant_id, t.id).practice_score === n }"
                    :aria-pressed="skor(a.participant_id, t.id).practice_score === n" :aria-label="`${a.name} ${t.name} nilai ${n}`" @click="setSkor(a.participant_id, t.id, { practice_score: n })">{{ n }}</button>
                  <button type="button" class="u-att !w-auto px-2" :class="{ 'is-on t-green': skor(a.participant_id, t.id).competent }" :aria-pressed="skor(a.participant_id, t.id).competent"
                    @click="setSkor(a.participant_id, t.id, { competent: !skor(a.participant_id, t.id).competent })">Kompeten</button>
                </span>
              </li>
            </ul>
          </div>
        </section>

        <!-- Jurnal -->
        <section class="mt-6">
          <label for="sr-note" class="u-display block text-xl font-extrabold">Catatan kelas</label>
          <p class="u-help">Jalannya kelas, kendala, alat yang kurang. Tersimpan saat kolom ditinggalkan.</p>
          <textarea id="sr-note" v-model="note" rows="3" class="u-input mt-2" @blur="simpanJurnal"></textarea>
        </section>

        <div class="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button v-if="d.session.state === 'running'" type="button" class="u-btn u-btn-hitam u-btn-besar" :disabled="busy" @click="selesaiOpen = true"><CheckIcon class="h-5 w-5" />Selesai kelas</button>
          <p v-else class="text-sm font-bold">Kelas sudah selesai. Absen, materi, dan nilai masih bisa dikoreksi.</p>
        </div>
      </template>
    </template>

    <!-- Keterangan absen -->
    <LDialog :open="!!ketAtt" :title="ketAtt?.name || ''" subtitle="Keterangan absen" @close="ketAtt = null">
      <label for="ka-note" class="u-label">Keterangan</label>
      <input id="ka-note" v-model="ketAtt.note" class="u-input" maxlength="200" placeholder="mis. izin keluarga, datang 09.15" v-if="ketAtt" />
      <template #footer>
        <button type="button" class="u-btn" @click="ketAtt = null">Batal</button>
        <button type="button" class="u-btn u-btn-merah" @click="simpanKet">Simpan</button>
      </template>
    </LDialog>

    <!-- Catatan siswa -->
    <LDialog :open="!!catatan" :title="catatan?.name || ''" subtitle="Catatan harian siswa" @close="catatan = null">
      <template v-if="catatan">
        <ul v-if="catatanOf(catatan.participant_id).length" class="mb-4 space-y-2">
          <li v-for="n in catatanOf(catatan.participant_id)" :key="n.id" class="rounded-xl border-2 border-[color:var(--ink)] p-2 text-sm">
            <LChip v-if="n.flag" :tone="n.flag === 'good' ? 'green' : 'amber'">{{ n.flag === 'good' ? 'Bagus' : 'Perlu perhatian' }}</LChip>
            <p class="mt-1">{{ n.note }}</p>
            <p class="text-xs text-[color:var(--ink-soft)]">{{ n.author }}{{ n.visible_to_student ? ' · terlihat siswa' : '' }}</p>
          </li>
        </ul>
        <p class="u-label">Tanda</p>
        <div class="flex gap-2">
          <label class="u-pilih" :class="{ 'is-on': catatan.flag === 'good' }"><input v-model="catatan.flag" type="radio" value="good" class="sr-only" />👍 Bagus</label>
          <label class="u-pilih" :class="{ 'is-on': catatan.flag === 'warn' }"><input v-model="catatan.flag" type="radio" value="warn" class="sr-only" />⚠️ Perlu perhatian</label>
        </div>
        <label for="cs-note" class="u-label mt-3">Catatan</label>
        <textarea id="cs-note" v-model="catatan.note" rows="3" class="u-input" placeholder="mis. kurang teliti saat mengencangkan baut roda"></textarea>
        <label class="mt-2 flex min-h-11 items-center gap-3 text-sm font-bold"><input v-model="catatan.visible" type="checkbox" class="u-check" />Siswa boleh melihat catatan ini</label>
      </template>
      <template #footer>
        <button type="button" class="u-btn" @click="catatan = null">Tutup</button>
        <button type="button" class="u-btn u-btn-merah" :disabled="busy || !(catatan?.note || catatan?.flag)" @click="simpanCatatan">Simpan catatan</button>
      </template>
    </LDialog>

    <ConfirmDialog :open="selesaiOpen" title="Selesaikan kelas?" :message="`Jam selesai tercatat sebagai absen pulang ${mentorMode ? 'Anda' : 'mentor'}. ${delivered.size} materi tercatat disampaikan.`" confirm-label="Selesai" :busy="busy" @cancel="selesaiOpen = false" @confirm="selesai" />
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { CheckIcon, PlayIcon } from '@heroicons/vue/24/outline'
import LChip from '../leader/LChip.vue'
import LDialog from '../leader/LDialog.vue'
import ConfirmDialog from '../leader/ConfirmDialog.vue'
import MaterialList from './MaterialList.vue'
import { base64ToBlob, downloadBase64 } from '../../services/leaderApi'
import { notify } from '../leader/notice'
import { ATT_STATUS, SESSION_FLAG, SESSION_STATE, tanggal } from '../../services/academyApi'

const props = defineProps({ api: { type: Object, required: true }, sessionId: { type: Number, required: true }, mentorMode: Boolean })
const emit = defineEmits(['changed'])

const d = ref(null)
const loading = ref(true)
const error = ref('')
const busy = ref(false)
const note = ref('')
const ketAtt = ref(null)
const catatan = ref(null)
const selesaiOpen = ref(false)
const skorMap = ref({})

const delivered = computed(() => new Set(d.value?.session.delivered_topic_ids || []))
const planned = computed(() => new Set(d.value?.session.planned_topic_ids || []))
const hitung = computed(() => (d.value?.attendance || []).reduce((acc, a) => { acc[a.status] = (acc[a.status] || 0) + 1; return acc }, {}))
const hadir = computed(() => (d.value?.attendance || []).filter((a) => a.status === 'present' || a.status === 'late'))
const bahanHariIni = computed(() => (d.value?.topics || []).filter((t) => t.materials?.length && (planned.value.has(t.id) || delivered.value.has(t.id))))
const unduhBahan = async (m) => {
  const f = await props.api.materialDownload(m.id)
  downloadBase64(f.filename, f.content, f.mimetype)
}
const bahanBlob = async (m) => {
  const f = await props.api.materialDownload(m.id)
  return base64ToBlob(f.content, f.mimetype)
}
const praktik = computed(() => (d.value?.topics || []).filter((t) => t.practice && delivered.value.has(t.id)))
const perModul = computed(() => (d.value?.topics || []).reduce((acc, t) => {
  const k = t.module_name || 'Materi'
  ;(acc[k] = acc[k] || []).push(t)
  return acc
}, {}))

const jam = (utc) => new Intl.DateTimeFormat('id-ID', { timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date(utc.replace(' ', 'T') + 'Z'))
const durasi = (m) => (m == null ? '-' : `${Math.floor(m / 60)} jam ${m % 60} menit`)
const catatanOf = (pid) => (d.value?.notes || []).filter((n) => n.participant_id === pid)
const skor = (pid, tid) => skorMap.value[`${pid}-${tid}`] || { practice_score: 0, competent: false }

async function muatSkor() {
  if (!praktik.value.length) return
  try {
    const prog = await props.api.progress(d.value.session.program_id)
    const map = {}
    for (const r of prog.rows) for (const c of r.cells) map[`${r.participant.id}-${c.topic_id}`] = { practice_score: c.practice_score, competent: c.competent }
    skorMap.value = map
  } catch (e) { notify.error(e.message) }
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    d.value = await props.api.sessionDetail(props.sessionId)
    note.value = d.value.session.note
    await muatSkor()
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

async function jalankan(fn, pesan) {
  busy.value = true
  try {
    const res = await fn()
    if (pesan) notify.success(pesan)
    emit('changed')
    return res
  } catch (e) {
    notify.error(e.message)
  } finally {
    busy.value = false
  }
}

async function mulai() {
  const res = await jalankan(() => props.api.sessionStart(props.sessionId), 'Kelas dimulai. Semua siswa tercatat Hadir.')
  if (res) { d.value = res; note.value = res.session.note; await muatSkor() }
}

async function setAtt(a, vals) {
  const before = { ...a }
  Object.assign(a, vals)
  try {
    Object.assign(a, await props.api.attendanceSet({ session_id: props.sessionId, participant_id: a.participant_id, ...vals }))
  } catch (e) {
    Object.assign(a, before)
    notify.error(e.message)
  }
}
const setStatus = (a, status) => { if (a.status !== status) setAtt(a, { status }) }

async function simpanKet() {
  const a = d.value.attendance.find((x) => x.participant_id === ketAtt.value.participant_id)
  await setAtt(a, { note: ketAtt.value.note || '' })
  ketAtt.value = null
}

async function toggleTopic(id) {
  const ids = new Set(delivered.value)
  if (ids.has(id)) ids.delete(id)
  else ids.add(id)
  const res = await jalankan(() => props.api.sessionJournal(props.sessionId, { delivered_topic_ids: [...ids] }))
  if (res) { d.value.session = res; await muatSkor() }
}

async function simpanJurnal() {
  if (note.value === d.value.session.note) return
  const res = await jalankan(() => props.api.sessionJournal(props.sessionId, { note: note.value }), 'Catatan kelas tersimpan')
  if (res) d.value.session = res
}

async function setSkor(pid, tid, vals) {
  const key = `${pid}-${tid}`
  const before = { ...skor(pid, tid) }
  skorMap.value = { ...skorMap.value, [key]: { ...before, ...vals } }
  try {
    const c = await props.api.progressSet({ participant_id: pid, topic_id: tid, ...vals })
    skorMap.value = { ...skorMap.value, [key]: { practice_score: c.practice_score, competent: c.competent } }
  } catch (e) {
    skorMap.value = { ...skorMap.value, [key]: before }
    notify.error(e.message)
  }
}

const bukaCatatan = (a) => { catatan.value = { participant_id: a.participant_id, name: a.name, flag: '', note: '', visible: false } }

async function simpanCatatan() {
  const c = catatan.value
  const res = await jalankan(() => props.api.evaluationSave(null, {
    participant_id: c.participant_id, kind: 'note', flag: c.flag || false, note: c.note, session_id: props.sessionId,
    visible_to_student: c.visible, date: d.value.session.date,
  }), 'Catatan tersimpan')
  if (res) { d.value.notes.push(res); catatan.value = null }
}

async function selesai() {
  const res = await jalankan(() => props.api.sessionFinish(props.sessionId, { note: note.value }), 'Kelas selesai. Terima kasih!')
  selesaiOpen.value = false
  if (res) { d.value = res; note.value = res.session.note }
}

watch(() => props.sessionId, load)
onMounted(load)
</script>
