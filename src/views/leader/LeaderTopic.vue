<!-- Editor materi: info materi, soal (inline), impor/ekspor, bahan, dan bagikan ke peserta. -->
<template>
  <div class="ujian min-h-screen p-4 md:p-6">
    <LNotice />
    <router-link to="/dashboard/asesmen/calon-kabeng" class="inline-flex min-h-[44px] items-center gap-1 text-sm font-bold hover:underline underline-offset-4"><ArrowLeftIcon class="h-5 w-5" aria-hidden="true" />Assessment Calon Kabeng</router-link>

    <div v-if="loading" class="mt-4 space-y-3" aria-busy="true"><div class="u-card h-16 animate-pulse"></div><div class="u-card h-48 animate-pulse"></div></div>
    <ErrorState v-else-if="error" class="mt-4" :message="error" @retry="load" />

    <template v-else>
      <div class="mt-2 flex flex-wrap items-end justify-between gap-3">
        <div class="min-w-0">
          <p class="text-xs text-[color:var(--ink-soft)]">{{ topic.program_name }}<template v-if="topic.schedule_label"> · {{ topic.schedule_label }}</template></p>
          <h1 class="u-display text-[1.6rem] sm:text-[2rem] font-extrabold leading-tight">{{ topic.name }}</h1>
          <p class="mt-1 text-sm text-[color:var(--ink-soft)]">{{ topic.question_count }} soal · {{ topic.total_points }} poin<template v-if="topic.missing_key"> · <span class="font-bold text-[color:var(--merah-tua)]">ada soal tanpa kunci</span></template></p>
        </div>
        <button type="button" class="u-btn u-btn-merah" :disabled="!topic.question_count || !participants.length" @click="assignOpen = true"><PaperAirplaneIcon class="h-5 w-5" aria-hidden="true" />Bagikan ke peserta</button>
      </div>
      <p v-if="!participants.length" class="u-help">Belum ada peserta di program ini. Tambahkan di tab Peserta & Penugasan.</p>

      <!-- Info materi -->
      <section class="u-card mt-5 p-4 sm:p-5">
        <h2 class="u-display text-xl font-extrabold">Info materi</h2>
        <form class="mt-4 grid gap-4 md:grid-cols-2" @submit.prevent="saveInfo">
          <div><label for="ti-name" class="u-label">Nama materi</label><input id="ti-name" v-model="info.name" class="u-input" required /></div>
          <div><label for="ti-sch" class="u-label">Jadwal</label><input id="ti-sch" v-model="info.schedule_label" class="u-input" /></div>
          <div class="md:col-span-2"><label for="ti-desc" class="u-label">Ringkasan</label><textarea id="ti-desc" v-model="info.description" rows="2" class="u-input"></textarea></div>
          <div class="md:col-span-2"><label for="ti-ins" class="u-label">Petunjuk untuk peserta</label><textarea id="ti-ins" v-model="info.instructions" rows="3" class="u-input"></textarea></div>
          <div><label for="ti-time" class="u-label">Batas waktu (menit)</label><input id="ti-time" v-model.number="info.time_limit_minutes" type="number" min="1" class="u-input" /></div>
          <div><label for="ti-pass" class="u-label">Nilai lulus</label><input id="ti-pass" v-model.number="info.pass_score" type="number" min="1" max="100" class="u-input" /></div>
          <div class="md:col-span-2">
            <label for="ti-vis" class="u-label">Hasil untuk peserta setelah selesai</label>
            <select id="ti-vis" v-model="info.result_visibility" class="u-input"><option v-for="v in config.visibility" :key="v.value" :value="v.value">{{ v.label }}</option></select>
          </div>
          <div class="md:col-span-2 flex justify-end"><button type="submit" class="u-btn u-btn-merah w-full sm:w-auto" :disabled="savingInfo">{{ savingInfo ? 'Menyimpan...' : 'Simpan info materi' }}</button></div>
        </form>
      </section>

      <!-- Soal -->
      <section class="mt-6">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <h2 class="u-display text-xl font-extrabold">Soal ({{ topic.questions.length }})</h2>
          <div class="flex flex-wrap gap-2">
            <button type="button" class="u-btn" @click="importOpen = true"><ArrowUpTrayIcon class="h-5 w-5" aria-hidden="true" />Impor soal</button>
            <button type="button" class="u-btn" :disabled="!topic.questions.length" @click="exportQuestions"><ArrowDownTrayIcon class="h-5 w-5" aria-hidden="true" />Ekspor</button>
            <button type="button" class="u-btn u-btn-merah" @click="startNew"><PlusIcon class="h-5 w-5" aria-hidden="true" />Tambah soal</button>
          </div>
        </div>
        <div class="mt-3 grid gap-3 sm:grid-cols-[minmax(0,1fr)_220px]">
          <div class="relative"><label for="q-search" class="sr-only">Cari soal</label><MagnifyingGlassIcon class="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[color:var(--ink-soft)]" aria-hidden="true" /><input id="q-search" v-model="search" type="search" class="u-input !pl-9" placeholder="Cari teks soal" /></div>
          <div><label for="q-cat" class="sr-only">Kategori</label><select id="q-cat" v-model="catFilter" class="u-input"><option value="">Semua kategori</option><option v-for="c in categories" :key="c" :value="c">{{ c }}</option></select></div>
        </div>

        <div v-if="editing && !editing.id" class="mt-4"><QuestionForm :model="editing" :categories="categories" :saving="savingQ" @save="saveQuestion" @cancel="editing = null" /></div>

        <div v-if="!topic.questions.length && !editing" class="u-card mt-4 p-8 text-center text-sm text-[color:var(--ink-soft)]">Belum ada soal. Tambah satu per satu atau impor dari file Excel.</div>
        <div v-else-if="!shown.length && topic.questions.length" class="u-card mt-4 p-6 text-center text-sm text-[color:var(--ink-soft)]">Tidak ada soal yang cocok.</div>
        <ol class="mt-4 space-y-3">
          <li v-for="q in shown" :key="q.id">
            <QuestionForm v-if="editing?.id === q.id" :model="editing" :categories="categories" :saving="savingQ" @save="saveQuestion" @cancel="editing = null" />
            <article v-else class="u-card p-4">
              <div class="flex items-start justify-between gap-2">
                <div class="min-w-0">
                  <p class="text-xs text-[color:var(--ink-soft)]">No. {{ numberOf(q) }}<template v-if="q.category"> · {{ q.category }}</template> · {{ q.points }} poin</p>
                  <p class="mt-1 whitespace-pre-line text-sm ">{{ q.text }}</p>
                </div>
                <LChip v-if="!q.answer_key" tone="amber">Tanpa kunci</LChip>
              </div>
              <ul class="mt-3 space-y-1 text-sm">
                <li v-for="o in q.options" :key="o.key" class="rounded-lg px-2 py-1" :class="o.key === q.answer_key ? 'bg-[#d9f2e3] font-bold' : 'text-[color:var(--ink-soft)]'"><b>{{ o.key }}.</b> {{ o.text }}</li>
              </ul>
              <p v-if="q.explanation" class="mt-2 text-xs leading-relaxed text-[color:var(--ink-soft)]"><b>Pembahasan:</b> {{ q.explanation }}</p>
              <p v-if="q.reference" class="mt-1 text-xs text-[color:var(--ink-soft)]">Rujukan: {{ q.reference }}</p>
              <div class="mt-3 flex flex-wrap gap-1">
                <button type="button" class="u-btn u-btn-ghost" :disabled="!canMove(q, -1)" @click="move(q, -1)"><ArrowUpIcon class="h-5 w-5" aria-hidden="true" /><span class="sr-only">Naikkan</span></button>
                <button type="button" class="u-btn u-btn-ghost" :disabled="!canMove(q, 1)" @click="move(q, 1)"><ArrowDownIcon class="h-5 w-5" aria-hidden="true" /><span class="sr-only">Turunkan</span></button>
                <button type="button" class="u-btn u-btn-ghost" @click="startEdit(q)"><PencilSquareIcon class="h-5 w-5" aria-hidden="true" />Ubah</button>
                <button type="button" class="u-btn u-btn-ghost u-btn-bahaya" @click="qDelete = q"><TrashIcon class="h-5 w-5" aria-hidden="true" />Hapus</button>
              </div>
            </article>
          </li>
        </ol>
      </section>

      <!-- Bahan -->
      <section class="u-card mt-6 p-4 sm:p-5">
        <h2 class="u-display text-xl font-extrabold">Bahan materi</h2>
        <p class="u-help">Slide atau PDF untuk materi ini. Tandai "khusus pengajar" untuk file internal.</p>
        <ul v-if="topic.materials.length" class="mt-3 ">
          <li v-for="m in topic.materials" :key="m.id" class="flex flex-wrap items-center justify-between gap-2 border-t-2 border-[color:var(--ink)] py-2 text-sm first:border-t-0">
            <span class="min-w-0 truncate ">{{ m.name }}<LChip v-if="m.internal" tone="amber" class="ml-2">Khusus pengajar</LChip></span>
            <span class="flex shrink-0 gap-1">
              <button type="button" class="u-btn u-btn-ghost" @click="downloadFile(m)"><ArrowDownTrayIcon class="h-5 w-5" aria-hidden="true" />Unduh</button>
              <button type="button" class="u-btn u-btn-ghost u-btn-bahaya" @click="removeMaterial(m)"><TrashIcon class="h-5 w-5" aria-hidden="true" /><span class="sr-only">Hapus {{ m.name }}</span></button>
            </span>
          </li>
        </ul>
        <p v-else class="mt-3 text-sm text-[color:var(--ink-soft)]">Belum ada bahan.</p>
        <div class="mt-3 flex flex-wrap items-center gap-3">
          <label class="flex min-h-[44px] items-center gap-2 text-sm "><input v-model="matInternal" type="checkbox" class="u-check" />Khusus pengajar</label>
          <label class="u-btn cursor-pointer" :class="{ 'opacity-60': uploading }"><ArrowUpTrayIcon class="h-5 w-5" aria-hidden="true" />{{ uploading ? 'Mengunggah...' : 'Unggah bahan' }}<input type="file" class="sr-only" :disabled="uploading" @change="uploadMaterial" /></label>
        </div>
      </section>
    </template>

    <!-- Impor soal -->
    <LDialog :open="importOpen" title="Impor soal" subtitle="Unggah file Excel atau CSV, periksa pratinjau, lalu simpan." wide @close="closeImport">
      <div class="space-y-4">
        <button type="button" class="u-btn" @click="downloadTemplate"><ArrowDownTrayIcon class="h-5 w-5" aria-hidden="true" />Unduh contoh file</button>
        <div>
          <label for="im-file" class="u-label">File soal (.xlsx atau .csv)</label>
          <input id="im-file" type="file" accept=".xlsx,.csv" class="block w-full text-sm  file:mr-3 file:min-h-[44px] file:cursor-pointer file:rounded-[10px] file:border-2 file:border-[color:var(--ink)] file:bg-white file:px-4 file:text-sm file:font-bold" @change="pickImport" />
        </div>
        <p v-if="previewing" class="text-sm text-[color:var(--ink-soft)]">Membaca file...</p>
        <template v-if="preview">
          <p class="text-sm "><b>{{ preview.questions.length }}</b> soal terbaca.</p>
          <ul v-if="preview.warnings.length" class="space-y-1 u-notice"><li v-for="(w, i) in preview.warnings" :key="i">{{ w }}</li></ul>
          <ol class="max-h-64 space-y-2 overflow-y-auto rounded-xl border-2 border-[color:var(--ink)] p-3 text-sm">
            <li v-for="(q, i) in preview.questions" :key="i"><span class="text-xs text-[color:var(--ink-soft)]">{{ i + 1 }}<template v-if="q.category"> · {{ q.category }}</template> · kunci {{ q.answer_key || '-' }}</span><br />{{ q.text }}</li>
          </ol>
        </template>
      </div>
      <template #footer>
        <button type="button" class="u-btn" @click="closeImport">Batal</button>
        <button type="button" class="u-btn" :disabled="!preview?.questions.length || importing || !topic.questions.length" @click="replaceAsk = true">Ganti semua soal</button>
        <button type="button" class="u-btn u-btn-merah" :disabled="!preview?.questions.length || importing" @click="runImport('append')">{{ importing ? 'Menyimpan...' : 'Tambahkan' }}</button>
      </template>
    </LDialog>
    <ConfirmDialog :open="replaceAsk" title="Ganti semua soal?" :message="`Semua ${topic?.questions.length} soal sekarang akan diganti dengan isi file. Soal yang sudah dijawab peserta tetap tersimpan di riwayat mereka.`" confirm-label="Ganti semua" :busy="importing" @cancel="replaceAsk = false" @confirm="runImport('replace')" />
    <ConfirmDialog :open="!!qDelete" title="Hapus soal?" message="Soal ini akan dihapus dari bank soal." confirm-label="Hapus" :busy="savingQ" @cancel="qDelete = null" @confirm="doDeleteQuestion" />
    <AssignDialog v-if="program" :open="assignOpen" :program="program" :participants="participants" :preset-topic-id="topic?.id" @close="assignOpen = false" />
  </div>
</template>

<script setup>
import '@fontsource-variable/bricolage-grotesque'
import '../../styles/exam.css'
import '../../styles/asesmen.css'
import '../../styles/leader.css'
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import { notify } from '../../components/leader/notice'
import { ArrowDownIcon, ArrowDownTrayIcon, ArrowLeftIcon, ArrowUpIcon, ArrowUpTrayIcon, MagnifyingGlassIcon, PaperAirplaneIcon, PencilSquareIcon, PlusIcon, TrashIcon } from '@heroicons/vue/24/outline'
import { downloadBase64, downloadMaterial, fileToBase64, leaderApi } from '../../services/leaderApi'
import LNotice from '../../components/leader/LNotice.vue'
import LDialog from '../../components/leader/LDialog.vue'
import ConfirmDialog from '../../components/leader/ConfirmDialog.vue'
import ErrorState from '../../components/leader/ErrorState.vue'
import LChip from '../../components/leader/LChip.vue'
import QuestionForm from '../../components/leader/QuestionForm.vue'
import AssignDialog from '../../components/leader/AssignDialog.vue'

const route = useRoute()
const topicId = computed(() => Number(route.params.id))
const topic = ref(null)
const config = ref(null)
const participants = ref([])
const loading = ref(true)
const error = ref('')
const info = reactive({})
const savingInfo = ref(false)
const search = ref('')
const catFilter = ref('')
const editing = ref(null)
const savingQ = ref(false)
const qDelete = ref(null)
const assignOpen = ref(false)
const matInternal = ref(false)
const uploading = ref(false)
const importOpen = ref(false)
const importFile = ref(null)
const preview = ref(null)
const previewing = ref(false)
const importing = ref(false)
const replaceAsk = ref(false)

const program = computed(() => config.value?.programs.find((p) => p.id === topic.value?.program_id) || null)
const categories = computed(() => [...new Set((topic.value?.questions || []).map((q) => q.category).filter(Boolean))])
const shown = computed(() => {
  const s = search.value.trim().toLowerCase()
  return topic.value.questions.filter((q) => (!catFilter.value || q.category === catFilter.value) && (!s || q.text.toLowerCase().includes(s)))
})
const numberOf = (q) => topic.value.questions.findIndex((x) => x.id === q.id) + 1

const INFO_FIELDS = ['name', 'schedule_label', 'description', 'instructions', 'time_limit_minutes', 'pass_score', 'result_visibility']

const load = async (silent = false) => {
  if (!silent) loading.value = true
  error.value = ''
  try {
    const [t, c] = await Promise.all([leaderApi.topicGet(topicId.value), config.value ? Promise.resolve(config.value) : leaderApi.config()])
    topic.value = t
    config.value = c
    INFO_FIELDS.forEach((k) => { info[k] = t[k] ?? '' })
    participants.value = await leaderApi.participants(t.program_id)
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

const saveInfo = async () => {
  savingInfo.value = true
  try {
    await leaderApi.topicSave(topic.value.id, { ...info })
    notify.success('Info materi tersimpan')
    await load(true)
  } catch (e) {
    notify.error(e.message)
  } finally {
    savingInfo.value = false
  }
}

// Soal
const blankQuestion = () => ({ id: null, category: '', text: '', options: [{ text: '' }, { text: '' }, { text: '' }, { text: '' }], answer_key: '', explanation: '', points: 1, reference: '', active: true })
const startNew = () => { editing.value = blankQuestion(); search.value = ''; catFilter.value = '' }
const startEdit = (q) => { editing.value = { ...q, options: q.options.map((o) => ({ text: o.text })), answer_key: q.answer_key || '' } }

const saveQuestion = async (model) => {
  savingQ.value = true
  try {
    const { id, ...data } = model
    const L = ['A', 'B', 'C', 'D', 'E', 'F']
    const keep = data.options.map((o, i) => ({ o, i })).filter((x) => x.o.text.trim())
    const keyIdx = L.indexOf(data.answer_key)
    data.options = keep.map((x) => ({ text: x.o.text }))
    data.answer_key = keyIdx >= 0 && keep.some((x) => x.i === keyIdx) ? L[keep.findIndex((x) => x.i === keyIdx)] : ''
    await leaderApi.questionSave({ id, topicId: topic.value.id, data })
    editing.value = null
    notify.success('Soal tersimpan')
    await load(true)
  } catch (e) {
    notify.error(e.message)
  } finally {
    savingQ.value = false
  }
}

const doDeleteQuestion = async () => {
  savingQ.value = true
  try {
    await leaderApi.questionDelete(qDelete.value.id)
    qDelete.value = null
    notify.success('Soal dihapus')
    await load(true)
  } catch (e) {
    notify.error(e.message)
  } finally {
    savingQ.value = false
  }
}

const canMove = (q, dir) => {
  const i = topic.value.questions.findIndex((x) => x.id === q.id)
  return i + dir >= 0 && i + dir < topic.value.questions.length
}
const move = async (q, dir) => {
  const list = [...topic.value.questions]
  const i = list.findIndex((x) => x.id === q.id)
  const [item] = list.splice(i, 1)
  list.splice(i + dir, 0, item)
  const before = topic.value.questions
  topic.value.questions = list
  try {
    await leaderApi.questionsReorder(list.map((x) => x.id))
  } catch (e) {
    topic.value.questions = before
    notify.error(e.message)
  }
}

// Impor / ekspor
const downloadTemplate = async () => {
  try {
    const f = await leaderApi.importTemplate()
    downloadBase64(f.filename, f.content)
  } catch (e) { notify.error(e.message) }
}
const exportQuestions = async () => {
  try {
    const f = await leaderApi.questionsExport(topic.value.id)
    downloadBase64(f.filename, f.content)
  } catch (e) { notify.error(e.message) }
}
const pickImport = async (ev) => {
  const file = ev.target.files?.[0]
  preview.value = null
  if (!file) return
  previewing.value = true
  try {
    importFile.value = { filename: file.name, content: await fileToBase64(file) }
    preview.value = await leaderApi.questionsImport({ topic_id: topic.value.id, ...importFile.value, preview: true, mode: 'append' })
  } catch (e) {
    importFile.value = null
    notify.error(e.message)
  } finally {
    previewing.value = false
  }
}
const runImport = async (mode) => {
  importing.value = true
  try {
    const res = await leaderApi.questionsImport({ topic_id: topic.value.id, ...importFile.value, preview: false, mode })
    notify.success(`${res.imported} soal masuk`)
    replaceAsk.value = false
    closeImport()
    await load(true)
  } catch (e) {
    notify.error(e.message)
  } finally {
    importing.value = false
  }
}
const closeImport = () => { importOpen.value = false; preview.value = null; importFile.value = null }

// Bahan
const uploadMaterial = async (ev) => {
  const file = ev.target.files?.[0]
  ev.target.value = ''
  if (!file) return
  uploading.value = true
  try {
    await leaderApi.materialUpload({ topic_id: topic.value.id, filename: file.name, content: await fileToBase64(file), internal: matInternal.value })
    notify.success('Bahan terunggah')
    await load(true)
  } catch (e) { notify.error(e.message) } finally { uploading.value = false }
}
const downloadFile = async (m) => {
  try { await downloadMaterial(m) } catch { notify.error('Bahan belum bisa diunduh. Coba lagi.') }
}
const removeMaterial = async (m) => {
  try {
    await leaderApi.materialDelete(m.id)
    notify.success('Bahan dihapus')
    await load(true)
  } catch (e) { notify.error(e.message) }
}

onMounted(load)
</script>
