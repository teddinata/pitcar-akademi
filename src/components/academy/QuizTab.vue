<!-- Tab Quiz Kelas Offline: per minggu, sub-tab Soal & QR | Nilai.
     Kirim quiz = buka sesi QR pre-test/post-test di layar kelas; siswa scan, pilih nama + 4 digit WA.
     Soal dikelola per set (impor/salin hanya mengisi set itu). Nilai yang terlewat bisa diisi manual. -->
<template>
  <section class="space-y-4">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div class="inline-flex rounded-xl border-[2.5px] border-[color:var(--ink)] bg-white p-1" role="tablist" aria-label="Bagian quiz">
        <button v-for="b in BAGIAN" :key="b.v" type="button" role="tab" :aria-selected="bagian === b.v" class="rounded-lg px-4 py-2 text-sm font-bold"
          :class="bagian === b.v ? 'bg-[color:var(--ink)] text-white' : 'hover:bg-[#fffbe0]'" @click="bagian = b.v">{{ b.label }}</button>
      </div>
      <p class="text-sm text-[color:var(--ink-soft)]">Siswa mengerjakan dengan <b class="text-[color:var(--ink)]">scan QR sesi</b> di kelas, tanpa kirim tautan satu per satu.</p>
    </div>

    <div v-if="!program.topics.length" class="u-card p-8 text-center font-bold">Kurikulum masih kosong. Isi kurikulum dulu di tab Kurikulum.</div>
    <div v-else class="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
      <WeekNav v-model="minggu" :weeks="mingguList" :lengkap="(w) => w.topics.filter((t) => t.question_count).length" label="ada quiz" />

      <!-- Soal & QR -->
      <ul v-if="bagian === 'soal'" class="u-card h-fit divide-y-2 divide-[color:var(--ink)]/15 overflow-hidden">
        <li v-for="t in mingguAktif.topics" :key="t.id">
          <div class="grid gap-3 px-4 py-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center" :class="buka === t.id ? 'bg-[#fffbe0]' : ''">
            <button type="button" class="flex min-w-0 items-start gap-2 text-left" :aria-expanded="buka === t.id" @click="toggle(t)">
              <ChevronRightIcon class="mt-0.5 h-5 w-5 shrink-0 transition-transform" :class="buka === t.id ? 'rotate-90' : ''" aria-hidden="true" />
              <span class="min-w-0">
                <span class="block text-xs font-bold tabular-nums text-[color:var(--ink-soft)]">{{ t.code || 'Tanpa kode' }}</span>
                <span class="block font-bold leading-snug">{{ t.name }}</span>
              </span>
            </button>
            <div class="flex flex-wrap gap-2 pl-7 sm:pl-0">
              <div v-for="set in SET" :key="set.v" class="flex items-center gap-2 rounded-xl border-2 border-[color:var(--ink)] bg-white py-1 pl-3 pr-1"
                :class="t.session_set === set.v ? 'ring-2 ring-[color:var(--stabilo)]' : ''">
                <span class="text-xs leading-tight">
                  <b class="block">{{ set.label }}<span v-if="t.session_set === set.v" class="ml-1 text-[color:var(--merah)]">· sesi terbuka</span></b>
                  <span class="tabular-nums text-[color:var(--ink-soft)]">{{ statusSet(t, set.v) }}</span>
                </span>
                <button type="button" class="u-btn u-btn-merah !min-h-8 !px-2.5 !text-xs" :disabled="!jumlah(t, set.v)"
                  :title="jumlah(t, set.v) ? `QR ${set.label}` : 'Belum ada soal'" @click="bukaSesi(t, set.v)">
                  <QrCodeIcon class="h-4 w-4" aria-hidden="true" />QR
                </button>
              </div>
            </div>
          </div>
          <div v-if="buka === t.id" class="border-t-2 border-dashed border-[color:var(--ink)]/30 bg-white px-4 py-4">
            <div class="flex flex-wrap items-center gap-2">
              <div class="inline-flex rounded-xl border-2 border-[color:var(--ink)] p-0.5" role="tablist" aria-label="Set soal">
                <button v-for="set in SET" :key="set.v" type="button" role="tab" :aria-selected="setAktif === set.v" class="rounded-lg px-3 py-1.5 text-sm font-bold"
                  :class="setAktif === set.v ? 'bg-[color:var(--ink)] text-white' : ''" @click="setAktif = set.v">{{ set.label }} ({{ jumlah(t, set.v) }})</button>
              </div>
              <label class="u-btn !min-h-9 cursor-pointer" :class="{ 'opacity-60': sibuk }">
                <ArrowUpTrayIcon class="h-4 w-4" aria-hidden="true" />Impor ke {{ labelSet }}
                <input type="file" accept=".xlsx,.csv" class="sr-only" :disabled="sibuk" @change="impor(t, $event)" />
              </label>
              <button type="button" class="u-btn !min-h-9" :disabled="sibuk || !jumlah(t, setLain)" @click="salin(t)"><DocumentDuplicateIcon class="h-4 w-4" />Salin dari {{ setLain === 'pre' ? 'pre-test' : 'post-test' }}</button>
              <router-link :to="`/dashboard/akademi-offline/materi/${t.id}?set=${setAktif}`" class="u-btn !min-h-9"><PencilSquareIcon class="h-4 w-4" />Tambah / ubah soal</router-link>
            </div>
            <p class="mt-2 text-xs text-[color:var(--ink-soft)]">Impor hanya menambah ke {{ labelSet }}. 10 soal pre-test + 10 soal post-test tetap 10 + 10.</p>
            <p v-if="!soal[t.id]" class="mt-3 text-sm">Memuat soal…</p>
            <ol v-else-if="soalSet(t).length" class="mt-3 space-y-1.5 text-sm">
              <li v-for="(q, i) in soalSet(t)" :key="q.id" class="flex items-start gap-3 rounded-lg border-2 border-[color:var(--ink)]/20 px-3 py-1.5" :class="q.active ? '' : 'opacity-50'">
                <span class="w-6 shrink-0 font-bold tabular-nums">{{ i + 1 }}.</span><span class="min-w-0 flex-1">{{ q.text }}</span>
                <span v-if="!q.answer_key" class="u-chip u-chip-kuning !py-0 !text-[10px]">tanpa kunci</span>
              </li>
            </ol>
            <p v-else class="mt-3 rounded-lg border-2 border-dashed border-[color:var(--ink)] px-3 py-4 text-center text-sm">Belum ada soal {{ labelSet }}. Impor dari Excel/CSV, salin dari set lain, atau tambah satu per satu.</p>
          </div>
        </li>
      </ul>

      <!-- Nilai -->
      <div v-else class="u-card h-fit overflow-x-auto">
        <div class="border-b-2 border-[color:var(--ink)] px-4 py-3">
          <p class="font-bold">Nilai {{ mingguAktif.week ? `minggu ${mingguAktif.week}` : '' }}</p>
          <p class="text-xs text-[color:var(--ink-soft)]">Tes yang terlewat bisa diisi manual (mis. ujian kertas susulan); nilai manual diberi tanda. Pre-test mengukur kemampuan awal, lulus/gagal dari post-test.</p>
        </div>
        <p v-if="!grid" class="px-4 py-8 text-center text-sm">Memuat nilai…</p>
        <table v-else-if="nilaiTopik.length && grid.students.length" class="w-full min-w-[640px] text-sm">
          <thead class="text-left text-xs uppercase tracking-[.06em]">
            <tr class="border-b-2 border-[color:var(--ink)]"><th class="px-4 py-2">Siswa</th>
              <th v-for="t in nilaiTopik" :key="t.id" class="px-3 py-2 normal-case tracking-normal"><span class="block text-[11px] text-[color:var(--ink-soft)]">{{ t.code }}</span><span class="block max-w-[12rem] truncate" :title="t.name">{{ t.name }}</span></th></tr>
          </thead>
          <tbody>
            <tr v-for="s in grid.students" :key="s.id" class="border-b border-[color:var(--ink)]/15">
              <td class="whitespace-nowrap px-4 py-2.5 font-bold">{{ s.name }}</td>
              <td v-for="t in nilaiTopik" :key="t.id" class="px-3 py-2.5 align-top">
                <div class="grid grid-cols-[2.5rem_auto] items-center gap-x-2 gap-y-1 text-xs">
                  <template v-for="set in SET" :key="set.v">
                    <span class="font-bold text-[color:var(--ink-soft)]">{{ set.short }}</span>
                    <span v-if="sel(s, t, set.v)?.score != null" class="flex items-center gap-1" :title="sel(s, t, set.v).manual ? `Manual: ${sel(s, t, set.v).note}` : ''">
                      <b class="text-base tabular-nums" :class="set.v === 'post' && sel(s, t, set.v).score < t.pass_score ? 'text-[color:var(--merah)]' : ''">{{ angka(sel(s, t, set.v).score) }}</b>
                      <span v-if="sel(s, t, set.v).manual" class="u-chip !py-0 !text-[10px]">manual</span>
                    </span>
                    <span v-else-if="sel(s, t, set.v)?.state === 'in_progress'" class="font-semibold text-[color:var(--ink-soft)]">mengerjakan…</span>
                    <button v-else-if="jumlah(t, set.v)" type="button" class="w-fit rounded-md border-2 border-dashed border-[color:var(--ink)] px-1.5 py-0.5 font-bold hover:bg-[#fffbe0]"
                      @click="manual = { s, t, set, score: null, note: '' }">+ Isi nilai</button>
                    <span v-else class="text-[color:var(--ink-soft)]">–</span>
                  </template>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <p v-else class="px-4 py-8 text-center text-sm">{{ grid.students.length ? 'Minggu ini belum ada materi ber-quiz.' : 'Belum ada siswa.' }}</p>
      </div>
    </div>

    <!-- Sesi QR -->
    <LDialog :open="!!sesi" :title="sesi ? `${sesi.set_label || 'Quiz'} · ${sesi.topic}` : ''" wide @close="sesi = null">
      <div v-if="sesi" class="grid gap-6 md:grid-cols-[auto_minmax(0,1fr)] md:items-start">
        <div class="mx-auto">
          <img v-if="qr" :src="qr" alt="QR sesi quiz" class="h-64 w-64 rounded-xl border-[2.5px] border-[color:var(--ink)] bg-white p-2 sm:h-72 sm:w-72" />
          <div v-else class="grid h-64 w-64 place-items-center rounded-xl border-2 border-dashed border-[color:var(--ink)] text-sm">Sesi ditutup</div>
        </div>
        <div class="min-w-0">
          <p v-if="sesi.quiz_set" class="u-chip u-chip-kuning">{{ sesi.set_label }} · {{ sesi.question_count }} soal · {{ sesi.time_limit_minutes }} menit</p>
          <ol class="mt-3 space-y-2 text-[15px]">
            <li class="flex gap-3"><span class="u-bubble !h-7 !w-7 !text-sm">1</span>Scan QR ini dengan kamera HP</li>
            <li class="flex gap-3"><span class="u-bubble !h-7 !w-7 !text-sm">2</span>Pilih nama, isi 4 angka terakhir No. WA</li>
            <li class="flex gap-3"><span class="u-bubble !h-7 !w-7 !text-sm">3</span>Kerjakan, lalu kirim</li>
          </ol>
          <div class="mt-4 rounded-xl border-2 border-[color:var(--ink)] p-3">
            <p class="text-sm font-bold tabular-nums">Sudah masuk {{ masuk }}/{{ sesi.students.length }} · selesai {{ selesai }}</p>
            <ul class="mt-1 max-h-48 space-y-0.5 overflow-y-auto text-sm">
              <li v-for="s in sesi.students" :key="s.id" class="flex items-center gap-2">
                <span class="h-2.5 w-2.5 shrink-0 rounded-full" :class="s.state === 'submitted' ? 'bg-[color:var(--hijau)]' : s.state === 'none' ? 'bg-[color:var(--ink)]/25' : 'bg-[color:var(--stabilo)] ring-1 ring-[color:var(--ink)]'"></span>
                <span class="min-w-0 flex-1 truncate">{{ s.name }}</span>
                <span class="text-xs text-[color:var(--ink-soft)]">{{ STATUS[s.state] || s.state }}<template v-if="s.score != null"> · {{ angka(s.score) }}</template></span>
              </li>
            </ul>
          </div>
          <p class="mt-3 text-xs text-[color:var(--ink-soft)]">Tutup sesi setelah semua selesai supaya QR ini tidak membuat tes baru. Yang sudah mulai tetap bisa menyelesaikan.</p>
        </div>
      </div>
      <template #footer>
        <button type="button" class="u-btn" @click="sesi = null">Biarkan terbuka</button>
        <button type="button" class="u-btn u-btn-hitam" :disabled="sibuk || !sesi?.quiz_set" @click="tutupSesi">Tutup sesi</button>
      </template>
    </LDialog>

    <!-- Nilai manual -->
    <LDialog :open="!!manual" title="Isi nilai manual" @close="manual = null">
      <form v-if="manual" id="nilai-manual-form" class="space-y-3" @submit.prevent="simpanManual">
        <p class="text-sm">{{ manual.s.name }} · {{ manual.set.label }}<br /><span class="text-[color:var(--ink-soft)]">{{ manual.t.code }} {{ manual.t.name }}</span></p>
        <div><label for="nm-score" class="u-label">Nilai (0–100)</label><input id="nm-score" v-model.number="manual.score" type="number" min="0" max="100" step="0.1" required inputmode="decimal" class="u-input tabular-nums" /></div>
        <div><label for="nm-note" class="u-label">Sumber nilai</label><input id="nm-note" v-model="manual.note" required maxlength="200" placeholder="mis. tes kertas susulan 12 Nov" class="u-input" /></div>
      </form>
      <template #footer>
        <button type="button" class="u-btn" @click="manual = null">Batal</button>
        <button type="submit" form="nilai-manual-form" class="u-btn u-btn-merah" :disabled="sibuk">{{ sibuk ? 'Menyimpan…' : 'Simpan nilai' }}</button>
      </template>
    </LDialog>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'
import QRCode from 'qrcode'
import { ArrowUpTrayIcon, ChevronRightIcon, DocumentDuplicateIcon, PencilSquareIcon, QrCodeIcon } from '@heroicons/vue/24/outline'
import WeekNav from './WeekNav.vue'
import LDialog from '../leader/LDialog.vue'
import { notify } from '../leader/notice'
import { fileToBase64, leaderApi } from '../../services/leaderApi'

const props = defineProps({ program: Object, focusTopic: Number })
const emit = defineEmits(['changed'])
const BAGIAN = [{ v: 'soal', label: 'Soal & QR' }, { v: 'nilai', label: 'Nilai' }]
const SET = [{ v: 'pre', label: 'Pre-test', short: 'Pre' }, { v: 'post', label: 'Post-test', short: 'Post' }]
const STATUS = { none: 'belum scan', assigned: 'sudah masuk', in_progress: 'mengerjakan', submitted: 'selesai', expired: 'kedaluwarsa' }
const angka = (n) => (n == null ? '–' : Number(n).toLocaleString('id-ID', { maximumFractionDigits: 1 }))

const bagian = ref('soal')
const mingguList = computed(() => {
  const map = new Map()
  for (const t of props.program.topics) {
    const w = t.week || 0
    if (!map.has(w)) map.set(w, { week: w, module: t.module_name || (w ? `Minggu ${w}` : 'Tanpa minggu'), topics: [] })
    map.get(w).topics.push(t)
  }
  return [...map.values()].sort((a, b) => (a.week || 99) - (b.week || 99))
})
const minggu = ref(null)
const mingguAktif = computed(() => mingguList.value.find((w) => w.week === minggu.value) || mingguList.value[0] || { week: 0, topics: [] })
// Minggu terpilih selalu salah satu minggu yang ada, supaya tombolnya tersorot.
watch(mingguList, (list) => {
  if (list.length && !list.some((w) => w.week === minggu.value)) minggu.value = list[0].week
}, { immediate: true })
const buka = ref(null)
const setAktif = ref('pre')
const setLain = computed(() => (setAktif.value === 'pre' ? 'post' : 'pre'))
const labelSet = computed(() => (setAktif.value === 'pre' ? 'pre-test' : 'post-test'))
const jumlah = (t, set) => (set === 'pre' ? t.pre_count : t.post_count) || 0
const sibuk = ref(false)

// soal per materi (dimuat saat baris dibuka)
const soal = reactive({})
async function muatSoal(t, force = false) {
  if (soal[t.id] && !force) return
  try { soal[t.id] = (await leaderApi.topicGet(t.id)).questions } catch (e) { notify.error(e.message) }
}
const soalSet = (t) => (soal[t.id] || []).filter((q) => q.quiz_set === setAktif.value)
function toggle(t) {
  buka.value = buka.value === t.id ? null : t.id
  if (buka.value) muatSoal(t)
}
async function impor(t, ev) {
  const file = ev.target.files?.[0]
  ev.target.value = ''
  if (!file) return
  sibuk.value = true
  try {
    const res = await leaderApi.questionsImport({ topic_id: t.id, quiz_set: setAktif.value, filename: file.name, content: await fileToBase64(file), mode: 'append' })
    notify.success(`${res.imported} soal masuk ke ${labelSet.value}${res.warnings?.length ? ` (${res.warnings.length} catatan)` : ''}`)
    await muatSoal(t, true)
    emit('changed')
  } catch (e) { notify.error(e.message) } finally { sibuk.value = false }
}
async function salin(t) {
  sibuk.value = true
  try {
    const res = await leaderApi.questionsCopySet(t.id, setAktif.value)
    notify.success(`${res.copied} soal disalin ke ${labelSet.value}`)
    await muatSoal(t, true)
    emit('changed')
  } catch (e) { notify.error(e.message) } finally { sibuk.value = false }
}

// nilai
const grid = ref(null)
async function muatNilai() {
  const pid = props.program.id
  try {
    const res = await leaderApi.quizGrid(pid)
    if (pid === props.program.id) grid.value = res // abaikan jawaban angkatan sebelumnya
  } catch (e) { notify.error(e.message) }
}
const sel = (s, t, set) => grid.value?.cells[`${s.id}-${t.id}`]?.[set] || null
const nilaiTopik = computed(() => mingguAktif.value.topics.filter((t) => t.question_count))
function statusSet(t, set) {
  if (!jumlah(t, set)) return 'Belum ada soal'
  const n = grid.value?.students.filter((s) => sel(s, t, set)?.score != null).length || 0
  return `${jumlah(t, set)} soal · ${n ? `${n}/${grid.value.students.length} selesai` : 'belum dikerjakan'}`
}
const manual = ref(null)
async function simpanManual() {
  const m = manual.value
  sibuk.value = true
  try {
    await leaderApi.attemptManual({ topic_id: m.t.id, participant_id: m.s.id, quiz_set: m.set.v, score: m.score, note: m.note })
    notify.success(`Nilai ${m.set.label} ${m.s.name} tersimpan (manual)`)
    manual.value = null
    await muatNilai()
  } catch (e) { notify.error(e.message) } finally { sibuk.value = false }
}

// sesi QR
const sesi = ref(null)
const qr = ref('')
let poll = null
async function tampilkan(data) {
  sesi.value = data
  qr.value = data.url ? await QRCode.toDataURL(data.url, { width: 720, margin: 1, errorCorrectionLevel: 'M' }) : ''
}
async function bukaSesi(t, set) {
  sibuk.value = true
  try {
    await tampilkan(await leaderApi.quizSessionOpen(t.id, set))
    emit('changed')
  } catch (e) { notify.error(e.message) } finally { sibuk.value = false }
}
async function tutupSesi() {
  sibuk.value = true
  try {
    await leaderApi.quizSessionClose(sesi.value.topic_id)
    notify.success('Sesi ditutup. QR ini tidak membuat tes baru lagi.')
    sesi.value = null
    emit('changed')
    muatNilai()
  } catch (e) { notify.error(e.message) } finally { sibuk.value = false }
}
const masuk = computed(() => sesi.value?.students.filter((s) => s.state !== 'none').length || 0)
const selesai = computed(() => sesi.value?.students.filter((s) => s.state === 'submitted').length || 0)
watch(sesi, (v, old) => {
  clearInterval(poll)
  if (v && v.quiz_set) {
    poll = setInterval(async () => {
      if (document.hidden || !sesi.value) return
      const id = sesi.value.topic_id
      try {
        const res = await leaderApi.quizSessionStatus(id)
        if (sesi.value?.topic_id !== id) return // dialog sudah ditutup / ganti materi saat menunggu
        if (!res.url) qr.value = '' // sesi ditutup dari tempat lain
        sesi.value = { ...sesi.value, ...res }
      } catch { /* coba lagi */ }
    }, 4000)
  } else if (!v && old) muatNilai()
  if (!v?.url) qr.value = ''
})
onBeforeUnmount(() => clearInterval(poll))

// buka dari kurikulum ("Quiz →")
function fokus(id) {
  const t = props.program.topics.find((x) => x.id === id)
  if (!t) return
  minggu.value = t.week || 0
  bagian.value = 'soal'
  buka.value = t.id
  muatSoal(t)
}
watch(() => props.focusTopic, (id) => id && fokus(id), { immediate: true })
watch(() => props.program.id, () => { grid.value = null; muatNilai() })
muatNilai()
</script>
