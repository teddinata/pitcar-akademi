<!-- Mentor: nama bebas atau dari karyawan, ditugaskan ke satu/lebih angkatan, punya tautan pribadi untuk
     menjalankan kelas tanpa login. -->
<template>
  <div>
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h3 class="u-display text-xl font-extrabold">Mentor</h3>
        <p class="u-help">Mentor membuka tautan pribadinya di HP untuk memulai kelas, mengabsen siswa, dan mencatat materi. Tanpa login.</p>
      </div>
      <button type="button" class="u-btn u-btn-merah" @click="buka(null)"><PlusIcon class="h-5 w-5" />Tambah mentor</button>
    </div>

    <div v-if="loading" class="mt-4 space-y-2" aria-busy="true"><div v-for="i in 2" :key="i" class="u-card h-20 animate-pulse"></div></div>
    <div v-else-if="error" class="u-card mt-4 p-6 text-center"><p class="font-bold">{{ error }}</p><button type="button" class="u-btn mt-3" @click="load">Coba lagi</button></div>
    <p v-else-if="!mentors.length" class="u-card mt-4 p-6 text-center text-sm">Belum ada mentor.</p>

    <ul v-else class="mt-4 grid gap-3 lg:grid-cols-2">
      <li v-for="m in urut" :key="m.id" class="u-card p-4">
        <div class="flex flex-wrap items-start justify-between gap-2">
          <div class="min-w-0">
            <p class="font-extrabold">{{ m.name }}<span v-if="!m.active" class="ml-2 text-xs font-normal">(nonaktif)</span></p>
            <p class="text-xs text-[color:var(--ink-soft)]">{{ [m.job, m.phone, m.employee_name ? `karyawan: ${m.employee_name}` : ''].filter(Boolean).join(' · ') || 'Belum ada detail' }}</p>
            <p class="mt-1 text-xs">Angkatan: <b>{{ namaAngkatan(m) || '–' }}</b></p>
          </div>
          <label class="flex min-h-11 items-center gap-2 text-sm font-bold"><input type="checkbox" class="u-check" :checked="m.program_ids.includes(program.id)" @change="tugaskan(m, $event.target.checked)" />Mengajar di angkatan ini</label>
        </div>
        <div class="mt-3 flex flex-wrap gap-1">
          <button type="button" class="u-btn" @click="salin(m)"><ClipboardDocumentIcon class="h-5 w-5" />Salin tautan</button>
          <a v-if="waNumber(m.phone)" class="u-btn" :href="waLink(m)" target="_blank" rel="noopener"><PaperAirplaneIcon class="h-5 w-5" />Kirim WA</a>
          <button type="button" class="u-btn u-btn-ghost" @click="buka(m)"><PencilSquareIcon class="h-5 w-5" />Ubah</button>
          <button type="button" class="u-btn u-btn-ghost" @click="ganti = m">Ganti tautan</button>
          <button type="button" class="u-btn u-btn-ghost u-btn-bahaya !w-11 !p-0" :aria-label="`Hapus ${m.name}`" @click="hapus = m"><TrashIcon class="h-5 w-5" /></button>
        </div>
      </li>
    </ul>

    <LDialog :open="!!form" :title="form?.id ? 'Ubah mentor' : 'Tambah mentor'" @close="form = null">
      <form v-if="form" id="mt-form" class="space-y-4" @submit.prevent="simpan">
        <div>
          <label for="mt-emp" class="u-label">Ambil dari karyawan (opsional)</label>
          <input id="mt-emp" v-model="cari" type="search" class="u-input" placeholder="Cari nama karyawan" autocomplete="off" @input="cariKaryawan" />
          <p v-if="form.employee_id" class="u-help">Tertaut: {{ form.employee_label }} <button type="button" class="font-bold underline underline-offset-4" @click="form.employee_id = false; form.employee_label = ''">Lepas</button></p>
          <ul v-if="hasil.length" class="mt-1 max-h-44 overflow-y-auto rounded-xl border-2 border-[color:var(--ink)]">
            <li v-for="e in hasil" :key="e.id"><button type="button" class="block min-h-11 w-full px-3 py-2 text-left text-sm hover:bg-[#fffbe0]" @click="pilihKaryawan(e)">{{ e.name }}<span class="block text-xs text-[color:var(--ink-soft)]">{{ [e.job, e.department].filter(Boolean).join(' · ') }}</span></button></li>
          </ul>
        </div>
        <div><label for="mt-name" class="u-label">Nama</label><input id="mt-name" v-model="form.name" class="u-input" required /></div>
        <div class="grid gap-3 sm:grid-cols-2">
          <div><label for="mt-job" class="u-label">Jabatan / keahlian</label><input id="mt-job" v-model="form.job" class="u-input" placeholder="mis. Kabeng, spesialis kelistrikan" /></div>
          <div><label for="mt-phone" class="u-label">No. WhatsApp</label><input id="mt-phone" v-model="form.phone" type="tel" inputmode="tel" class="u-input" /></div>
        </div>
        <fieldset><legend class="u-label">Angkatan</legend>
          <label v-for="p in programs" :key="p.id" class="flex min-h-11 items-center gap-3 text-sm font-bold"><input v-model="form.program_ids" type="checkbox" :value="p.id" class="u-check" />{{ p.name }}</label>
        </fieldset>
        <div><label for="mt-note" class="u-label">Catatan</label><textarea id="mt-note" v-model="form.note" rows="2" class="u-input"></textarea></div>
        <label class="flex min-h-11 items-center gap-3 text-sm font-bold"><input v-model="form.active" type="checkbox" class="u-check" />Mentor aktif (tautan berfungsi)</label>
      </form>
      <template #footer>
        <button type="button" class="u-btn" @click="form = null">Batal</button>
        <button type="submit" form="mt-form" class="u-btn u-btn-merah" :disabled="busy">{{ busy ? 'Menyimpan…' : 'Simpan' }}</button>
      </template>
    </LDialog>

    <ConfirmDialog :open="!!ganti" title="Ganti tautan mentor?" :message="`Tautan lama ${ganti?.name} tidak berlaku lagi. Kirim tautan baru ke mentor.`" confirm-label="Ganti" :busy="busy" @cancel="ganti = null" @confirm="doGanti" />
    <ConfirmDialog :open="!!hapus" title="Hapus mentor?" :message="`${hapus?.name} akan dihapus. Bila sudah pernah mengajar, mentor hanya dinonaktifkan.`" confirm-label="Hapus" :busy="busy" @cancel="hapus = null" @confirm="doHapus" />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { ClipboardDocumentIcon, PaperAirplaneIcon, PencilSquareIcon, PlusIcon, TrashIcon } from '@heroicons/vue/24/outline'
import LDialog from '../leader/LDialog.vue'
import ConfirmDialog from '../leader/ConfirmDialog.vue'
import { notify } from '../leader/notice'
import { academyApi } from '../../services/academyApi'
import { leaderApi } from '../../services/leaderApi'
import { copyText, waNumber } from '../../utils/leader'

const props = defineProps({ program: Object, programs: Array })
const emit = defineEmits(['changed'])
const mentors = ref([])
const loading = ref(true)
const error = ref('')
const busy = ref(false)
const form = ref(null)
const ganti = ref(null)
const hapus = ref(null)
const cari = ref('')
const hasil = ref([])
let timer = null

const urut = computed(() => [...mentors.value].sort((a, b) => Number(b.program_ids.includes(props.program.id)) - Number(a.program_ids.includes(props.program.id)) || a.name.localeCompare(b.name)))
const namaAngkatan = (m) => props.programs.filter((p) => m.program_ids.includes(p.id)).map((p) => p.name).join(', ')
const waLink = (m) => `https://wa.me/${waNumber(m.phone)}?text=${encodeURIComponent(`Halo ${m.name}, ini tautan mentor Kelas Offline Akademi Pitcar. Buka di HP saat mengajar untuk memulai kelas, mengabsen siswa, dan mencatat materi:\n\n${m.link}\n\nTautan ini khusus untuk Anda, mohon tidak dibagikan.`)}`

async function load() {
  loading.value = true
  error.value = ''
  try { mentors.value = await academyApi.mentors() } catch (e) { error.value = e.message } finally { loading.value = false }
}

function buka(m) {
  cari.value = ''
  hasil.value = []
  form.value = m
    ? { id: m.id, name: m.name, job: m.job, phone: m.phone, note: m.note, active: m.active, employee_id: m.employee_id || false, employee_label: m.employee_name, program_ids: [...m.program_ids] }
    : { id: null, name: '', job: '', phone: '', note: '', active: true, employee_id: false, employee_label: '', program_ids: [props.program.id] }
}

const cariKaryawan = () => {
  clearTimeout(timer)
  if (cari.value.trim().length < 2) { hasil.value = []; return }
  timer = setTimeout(async () => { try { hasil.value = await leaderApi.employees(cari.value.trim()) } catch (e) { notify.error(e.message) } }, 300)
}
const pilihKaryawan = (e) => {
  Object.assign(form.value, { employee_id: e.id, employee_label: e.name, name: form.value.name || e.name, job: form.value.job || e.job })
  cari.value = ''
  hasil.value = []
}

async function aksi(fn, pesan) {
  busy.value = true
  try { const r = await fn(); notify.success(pesan); await load(); emit('changed'); return r } catch (e) { notify.error(e.message) } finally { busy.value = false }
}

async function simpan() {
  const { id, employee_label, ...data } = form.value
  if (await aksi(() => academyApi.mentorSave(id, data), 'Mentor tersimpan')) form.value = null
}
const tugaskan = (m, on) => aksi(() => academyApi.mentorSave(m.id, { program_ids: on ? [...m.program_ids, props.program.id] : m.program_ids.filter((i) => i !== props.program.id) }), on ? `${m.name} mengajar di angkatan ini` : `${m.name} dilepas dari angkatan ini`)
async function doGanti() { await aksi(() => academyApi.mentorSave(ganti.value.id, {}, true), 'Tautan baru dibuat'); ganti.value = null }
async function doHapus() { await aksi(() => academyApi.mentorDelete(hapus.value.id), 'Mentor diperbarui'); hapus.value = null }
async function salin(m) {
  if (await copyText(m.link)) notify.success('Tautan tersalin')
  else notify.error('Tautan belum bisa disalin')
}

onMounted(load)
</script>
