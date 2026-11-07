<!-- Peserta (CRUD), bagikan soal (penugasan + tautan), dan daftar penugasan. -->
<template>
  <div class="space-y-8">
    <div v-if="loading" class="space-y-2" aria-busy="true"><div v-for="i in 2" :key="i" class="u-card h-16 animate-pulse"></div></div>
    <ErrorState v-else-if="error" :message="error" @retry="load" />

    <template v-else>
      <!-- Peserta -->
      <section>
        <div class="flex items-center justify-between gap-3">
          <h3 class="u-display text-xl font-extrabold">{{ academy ? 'Siswa' : 'Peserta' }} ({{ participants.length }})</h3>
          <div class="flex flex-wrap gap-2">
            <button v-if="academy" type="button" class="u-btn" @click="$emit('import')"><ArrowUpTrayIcon class="h-5 w-5" aria-hidden="true" />Impor siswa</button>
            <button type="button" class="u-btn" @click="openParticipant(null)"><PlusIcon class="h-5 w-5" aria-hidden="true" />{{ academy ? 'Tambah siswa' : 'Tambah peserta' }}</button>
          </div>
        </div>
        <div v-if="!participants.length" class="u-card mt-3 p-6 text-center text-sm text-[color:var(--ink-soft)]">{{ academy ? 'Belum ada siswa. Tambah atau impor siswa dulu.' : 'Belum ada peserta. Tambah peserta dulu sebelum membagikan soal.' }}</div>
        <ul v-else class="u-card mt-3 ">
          <li v-for="p in participants" :key="p.id" class="flex flex-wrap items-center justify-between gap-2 border-t-2 border-[color:var(--ink)] px-4 py-3 first:border-t-0">
            <div class="min-w-0">
              <p class="font-extrabold"><button v-if="academy" type="button" class="text-left hover:underline underline-offset-4" @click="$emit('open-student', p)">{{ p.name }}</button><template v-else>{{ p.name }}</template><span v-if="academy && p.student_state && p.student_state !== 'active'" class="u-chip u-chip-abu ml-2 !py-0">{{ STUDENT_STATE[p.student_state] }}</span><span v-if="!p.active" class="ml-2 text-xs font-normal text-[color:var(--ink-soft)]">(nonaktif)</span></p>
              <p class="text-xs text-[color:var(--ink-soft)]">{{ (academy ? [p.origin, p.phone, p.join_date ? `masuk ${p.join_date}` : ''] : [p.job, p.branch, p.phone]).filter(Boolean).join(' · ') || 'Belum ada detail' }}<template v-if="p.employee_name"> · karyawan: {{ p.employee_name }}</template></p>
              <p v-if="p.note" class="mt-0.5 text-xs text-[color:var(--ink-soft)]">{{ p.note }}</p>
            </div>
            <div class="flex gap-1">
              <button type="button" class="u-btn u-btn-ghost" @click="openParticipant(p)"><PencilSquareIcon class="h-5 w-5" aria-hidden="true" />Ubah</button>
              <button type="button" class="u-btn u-btn-ghost u-btn-bahaya" @click="pDelete = p"><TrashIcon class="h-5 w-5" aria-hidden="true" /><span class="sr-only">Hapus {{ p.name }}</span></button>
            </div>
          </li>
        </ul>
      </section>

      <!-- Penugasan -->
      <section>
        <div class="flex flex-wrap items-center justify-between gap-3">
          <h3 class="u-display text-xl font-extrabold">{{ academy ? 'Quiz terkirim' : 'Penugasan' }} ({{ filtered.length }})</h3>
          <div class="flex flex-wrap gap-2">
            <button type="button" class="u-btn" @click="kioskOpen = true"><QrCodeIcon class="h-5 w-5" aria-hidden="true" />QR kelas</button>
            <button type="button" class="u-btn u-btn-merah" :disabled="!participants.length || !program.topics.length" @click="assignOpen = true"><PaperAirplaneIcon class="h-5 w-5" aria-hidden="true" />{{ academy ? 'Kirim quiz' : 'Bagikan soal' }}</button>
          </div>
        </div>
        <div class="mt-3 grid gap-3 sm:grid-cols-3">
          <div><label for="af-topic" class="sr-only">Materi</label><select id="af-topic" v-model="f.topic" class="u-input"><option value="">Semua materi</option><option v-for="t in program.topics" :key="t.id" :value="t.id">{{ t.name }}</option></select></div>
          <div><label for="af-part" class="sr-only">Peserta</label><select id="af-part" v-model="f.participant" class="u-input"><option value="">{{ academy ? 'Semua siswa' : 'Semua peserta' }}</option><option v-for="p in participants" :key="p.id" :value="p.id">{{ p.name }}</option></select></div>
          <div><label for="af-state" class="sr-only">Status</label><select id="af-state" v-model="f.state" class="u-input"><option value="">Semua status</option><option v-for="(s, k) in ATTEMPT_STATE" :key="k" :value="k">{{ s.label }}</option></select></div>
        </div>

        <div v-if="!attempts.length" class="u-card mt-3 p-6 text-center text-sm text-[color:var(--ink-soft)]">Belum ada soal yang dibagikan.</div>
        <div v-else-if="!filtered.length" class="u-card mt-3 p-6 text-center text-sm text-[color:var(--ink-soft)]">Tidak ada penugasan yang cocok dengan filter.</div>
        <ul v-else class="mt-3 space-y-3">
          <li v-for="a in filtered" :key="a.id" class="u-card p-4">
            <div class="flex flex-wrap items-start justify-between gap-2">
              <div class="min-w-0">
                <p class="font-extrabold">{{ a.participant_name }}</p>
                <p class="text-sm text-[color:var(--ink-soft)]">{{ a.topic_name }} · {{ KIND_LABEL[a.kind] }}</p>
              </div>
              <div class="flex flex-wrap items-center gap-2">
                <LChip :tone="ATTEMPT_STATE[a.state]?.tone">{{ ATTEMPT_STATE[a.state]?.label }}</LChip>
                <LChip v-if="a.status" :tone="RESULT_STATUS[a.status]?.tone">{{ RESULT_STATUS[a.status]?.label }}</LChip>
              </div>
            </div>
            <p class="mt-2 text-xs text-[color:var(--ink-soft)]">{{ a.time_limit_minutes }} menit · {{ timeNote(a) }}<template v-if="a.state === 'in_progress'"> · terjawab {{ a.answered }}/{{ a.question_count }}</template><template v-if="a.focus_lost"> · keluar halaman {{ a.focus_lost }}x</template><template v-if="a.auto_submitted"> · dikumpulkan otomatis</template></p>
            <p v-if="a.state === 'submitted'" class="mt-1 text-sm ">Nilai <b class="text-lg">{{ fmtScore(a.score) }}</b> <span class="text-[color:var(--ink-soft)]">({{ a.correct_count }}/{{ a.question_count }} benar)</span></p>
            <div class="mt-3 flex flex-wrap gap-1">
              <button type="button" class="u-btn" @click="copyLink(a)"><ClipboardDocumentIcon class="h-5 w-5" aria-hidden="true" />Salin tautan</button>
              <button v-if="a.state === 'submitted'" type="button" class="u-btn" @click="detailId = a.id">Lihat jawaban</button>
              <button v-if="a.state !== 'submitted'" type="button" class="u-btn u-btn-ghost" @click="openAct('extend', a)">Perpanjang berlaku</button>
              <button v-if="a.state === 'in_progress'" type="button" class="u-btn u-btn-ghost" @click="openAct('minutes', a)">Tambah menit</button>
              <button v-if="a.state === 'in_progress'" type="button" class="u-btn u-btn-ghost" @click="openAct('finish', a)">Akhiri sekarang</button>
              <button v-if="a.state !== 'assigned'" type="button" class="u-btn u-btn-ghost" @click="openAct('reset', a)">Ulang dari awal</button>
              <button type="button" class="u-btn u-btn-ghost u-btn-bahaya" @click="openAct('delete', a)">Hapus</button>
            </div>
          </li>
        </ul>
      </section>
    </template>

    <!-- Peserta: tambah/ubah -->
    <LDialog :open="pDialog" :title="academy ? (pForm.id ? 'Ubah siswa' : 'Tambah siswa') : (pForm.id ? 'Ubah peserta' : 'Tambah peserta')" @close="pDialog = false">
      <form id="pt-form" class="space-y-4" @submit.prevent="saveParticipant">
        <div v-if="!academy">
          <label for="pt-emp" class="u-label">Tautkan karyawan Akademi (opsional)</label>
          <input id="pt-emp" v-model="empQuery" type="search" class="u-input" placeholder="Cari nama karyawan" autocomplete="off" @input="searchEmployees" />
          <p v-if="pForm.employee_id" class="u-help">Tertaut: {{ pForm.employee_label }} <button type="button" class="underline underline-offset-4 font-bold" @click="pForm.employee_id = false; pForm.employee_label = ''">Lepas</button></p>
          <ul v-if="empResults.length" class="mt-1 max-h-44 overflow-y-auto rounded-xl border-2 border-[color:var(--ink)]">
            <li v-for="e in empResults" :key="e.id"><button type="button" class="block min-h-[44px] w-full px-3 py-2 text-left text-sm hover:bg-[#fffbe0]" @click="pickEmployee(e)">{{ e.name }}<span class="block text-xs text-[color:var(--ink-soft)]">{{ [e.job, e.department].filter(Boolean).join(' · ') }}</span></button></li>
          </ul>
        </div>
        <div><label for="pt-name" class="u-label">Nama</label><input id="pt-name" v-model="pForm.name" class="u-input" required /></div>
        <div v-if="academy" class="grid gap-3 sm:grid-cols-2">
          <div><label for="pt-origin" class="u-label">Asal / sekolah</label><input id="pt-origin" v-model="pForm.origin" class="u-input" /></div>
          <div><label for="pt-join" class="u-label">Tanggal masuk</label><input id="pt-join" v-model="pForm.join_date" type="date" class="u-input" /></div>
          <div class="sm:col-span-2"><label for="pt-state" class="u-label">Status siswa</label><select id="pt-state" v-model="pForm.student_state" class="u-input"><option v-for="(l, k) in STUDENT_STATE" :key="k" :value="k">{{ l }}</option></select></div>
        </div>
        <div v-else class="grid gap-3 sm:grid-cols-2">
          <div><label for="pt-branch" class="u-label">Cabang</label><input id="pt-branch" v-model="pForm.branch" class="u-input" /></div>
          <div><label for="pt-job" class="u-label">Jabatan</label><input id="pt-job" v-model="pForm.job" class="u-input" /></div>
        </div>
        <div><label for="pt-phone" class="u-label">No. WhatsApp</label><input id="pt-phone" v-model="pForm.phone" type="tel" inputmode="tel" class="u-input" placeholder="08xxxxxxxxxx" /><p v-if="academy" class="u-help">4 digit terakhir dipakai siswa saat memindai QR kelas.</p></div>
        <div><label for="pt-note" class="u-label">Catatan</label><textarea id="pt-note" v-model="pForm.note" rows="2" class="u-input"></textarea></div>
        <label class="flex min-h-[44px] items-center gap-3 text-sm font-bold"><input v-model="pForm.active" type="checkbox" class="u-check" />{{ academy ? 'Siswa aktif' : 'Peserta aktif' }}</label>
      </form>
      <template #footer>
        <button type="button" class="u-btn" @click="pDialog = false">Batal</button>
        <button type="submit" form="pt-form" class="u-btn u-btn-merah" :disabled="saving">{{ saving ? 'Menyimpan...' : 'Simpan' }}</button>
      </template>
    </LDialog>
    <ConfirmDialog :open="!!pDelete" title="Hapus peserta?" :message="`${pDelete?.name} akan dihapus. Bila sudah punya penugasan, peserta hanya dinonaktifkan.`" confirm-label="Hapus" :busy="saving" @cancel="pDelete = null" @confirm="doParticipantDelete" />

    <KioskDialog :open="kioskOpen" :program="program" :academy="academy" @close="kioskOpen = false; load(true)" />
    <AssignDialog :open="assignOpen" :program="program" :participants="participants" @close="assignOpen = false" @done="load(true)" />
    <AttemptDialog :attempt-id="detailId" @close="detailId = null" />

    <!-- Tindakan penugasan -->
    <LDialog :open="!!act" :title="ACT_TITLE[act?.type]" :subtitle="act ? `${act.attempt.participant_name} · ${act.attempt.topic_name}` : ''" @close="act = null">
      <template v-if="act">
        <div v-if="act.type === 'extend'"><label for="ac-until" class="u-label">Berlaku sampai (WIB)</label><input id="ac-until" v-model="act.value" type="datetime-local" class="u-input" /><p class="u-help">Kosongkan untuk tanpa batas berlaku.</p></div>
        <div v-else-if="act.type === 'minutes'"><label for="ac-min" class="u-label">Tambah berapa menit</label><input id="ac-min" v-model.number="act.value" type="number" min="1" class="u-input" /></div>
        <p v-else class="text-sm leading-relaxed text-[color:var(--ink-soft)]">{{ ACT_TEXT[act.type] }}</p>
      </template>
      <template #footer>
        <button type="button" class="u-btn" @click="act = null">Batal</button>
        <button type="button" class="u-btn u-btn-merah" :disabled="saving" @click="runAct">{{ saving ? 'Memproses...' : 'Lanjutkan' }}</button>
      </template>
    </LDialog>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { notify } from './notice'
import { ArrowUpTrayIcon, ClipboardDocumentIcon, PaperAirplaneIcon, PencilSquareIcon, PlusIcon, QrCodeIcon, TrashIcon } from '@heroicons/vue/24/outline'
import { leaderApi } from '../../services/leaderApi'
import LDialog from './LDialog.vue'
import ConfirmDialog from './ConfirmDialog.vue'
import ErrorState from './ErrorState.vue'
import LChip from './LChip.vue'
import AssignDialog from './AssignDialog.vue'
import KioskDialog from './KioskDialog.vue'
import AttemptDialog from './AttemptDialog.vue'
import { ATTEMPT_STATE, KIND_LABEL, RESULT_STATUS, copyText, fmtScore, timeNote, utcToWibInput, wibInputToUtc } from '../../utils/leader'

const props = defineProps({ program: Object, config: Object, academy: Boolean })
defineEmits(['import', 'open-student'])
const STUDENT_STATE = { active: 'Aktif', leave: 'Cuti', graduated: 'Lulus', dropped: 'Keluar' }

const ACT_TITLE = { extend: 'Perpanjang masa berlaku', minutes: 'Tambah menit', finish: 'Akhiri sekarang', reset: 'Ulang dari awal', delete: 'Hapus penugasan' }
const ACT_TEXT = {
  finish: 'Jawaban yang sudah masuk dinilai sekarang dan peserta tidak bisa melanjutkan.',
  reset: 'Jawaban dan nilai dihapus, peserta bisa mengerjakan lagi dari awal dengan tautan yang sama.',
  delete: 'Penugasan beserta tautannya dihapus. Tindakan ini tidak bisa dibatalkan.'
}

const participants = ref([])
const attempts = ref([])
const loading = ref(true)
const error = ref('')
const saving = ref(false)
const f = reactive({ topic: '', participant: '', state: '' })
const assignOpen = ref(false)
const kioskOpen = ref(false)
const detailId = ref(null)
const act = ref(null)

const filtered = computed(() => attempts.value.filter((a) =>
  (!f.topic || a.topic_id === f.topic) && (!f.participant || a.participant_id === f.participant) && (!f.state || a.state === f.state)))

const load = async (silent = false) => {
  if (!silent) loading.value = true
  error.value = ''
  try {
    const [p, a] = await Promise.all([leaderApi.participants(props.program.id, props.academy), leaderApi.attempts({ program_id: props.program.id })])
    participants.value = p
    attempts.value = a
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

// Peserta
const pDialog = ref(false)
const pDelete = ref(null)
const P_BLANK = { id: null, name: '', employee_id: false, employee_label: '', branch: '', job: '', phone: '', note: '', active: true, origin: '', join_date: '', student_state: 'active' }
const pForm = reactive({ ...P_BLANK })
const empQuery = ref('')
const empResults = ref([])
let empTimer = null

const openParticipant = (p) => {
  Object.assign(pForm, p
    ? { ...P_BLANK, id: p.id, name: p.name, employee_id: p.employee_id || false, employee_label: p.employee_name || '', branch: p.branch || '', job: p.job || '', phone: p.phone || '', note: p.note || '', active: p.active,
        origin: p.origin || '', join_date: p.join_date || '', student_state: p.student_state || 'active' }
    : { ...P_BLANK })
  empQuery.value = ''
  empResults.value = []
  pDialog.value = true
}

const searchEmployees = () => {
  clearTimeout(empTimer)
  if (empQuery.value.trim().length < 2) { empResults.value = []; return }
  empTimer = setTimeout(async () => {
    try { empResults.value = await leaderApi.employees(empQuery.value.trim()) } catch (e) { notify.error(e.message) }
  }, 300)
}

const pickEmployee = (e) => {
  pForm.employee_id = e.id
  pForm.employee_label = e.name
  if (!pForm.name) pForm.name = e.name
  if (!pForm.job && e.job) pForm.job = e.job
  empQuery.value = ''
  empResults.value = []
}

const saveParticipant = async () => {
  saving.value = true
  try {
    const { id, employee_label, ...data } = pForm
    if (props.academy) { delete data.employee_id; data.join_date = data.join_date || false } else { delete data.origin; delete data.join_date; delete data.student_state }
    await leaderApi.participantSave(id, { ...data, program_id: props.program.id })
    pDialog.value = false
    notify.success(props.academy ? 'Siswa tersimpan' : 'Peserta tersimpan')
    await load(true)
  } catch (e) {
    notify.error(e.message)
  } finally {
    saving.value = false
  }
}

const doParticipantDelete = async () => {
  saving.value = true
  try {
    await leaderApi.participantDelete(pDelete.value.id)
    pDelete.value = null
    notify.success('Peserta dihapus')
    await load(true)
  } catch (e) {
    notify.error(e.message)
  } finally {
    saving.value = false
  }
}

// Penugasan
const copyLink = async (a) => {
  const ok = await copyText(a.link)
  if (ok) notify.success('Tautan tersalin')
  else notify.error('Tautan belum bisa disalin')
}

const openAct = (type, attempt) => {
  act.value = { type, attempt, value: type === 'extend' ? utcToWibInput(attempt.open_until) : type === 'minutes' ? 10 : null }
}

const runAct = async () => {
  const { type, attempt, value } = act.value
  saving.value = true
  try {
    if (type === 'extend') await leaderApi.attemptUpdate(attempt.id, { open_until: wibInputToUtc(value) })
    else if (type === 'minutes') await leaderApi.attemptUpdate(attempt.id, { add_minutes: Number(value) || 0 })
    else if (type === 'finish') await leaderApi.attemptFinish(attempt.id)
    else if (type === 'reset') await leaderApi.attemptReset(attempt.id)
    else await leaderApi.attemptDelete(attempt.id)
    act.value = null
    notify.success('Tersimpan')
    await load(true)
  } catch (e) {
    notify.error(e.message)
  } finally {
    saving.value = false
  }
}

watch(() => props.program.id, () => load())
onMounted(load)
defineExpose({ load })
</script>
