<!-- Impor kurikulum / jadwal / siswa dari Excel, CSV, atau teks tempel. Pratinjau dulu, lalu simpan.
     Impor ulang aman: baris yang sudah ada (kode/nama materi, tanggal+jam sesi, No. WA/nama siswa) diperbarui. -->
<template>
  <LDialog :open="open" :title="INFO[target]?.title || 'Impor'" :subtitle="INFO[target]?.sub" wide @close="tutup">
    <div class="space-y-4">
      <div class="flex flex-wrap gap-2">
        <button type="button" class="u-btn" :disabled="busy" @click="unduhContoh"><ArrowDownTrayIcon class="h-5 w-5" />Unduh contoh file</button>
        <label class="u-btn cursor-pointer"><ArrowUpTrayIcon class="h-5 w-5" />{{ file ? file.name : 'Pilih file (.xlsx / .csv / .txt)' }}
          <input type="file" accept=".xlsx,.csv,.txt" class="sr-only" @change="pilihFile" />
        </label>
      </div>
      <p class="u-help">Judul kolom boleh beda-beda, mis. {{ INFO[target]?.cols }}. Baris judul dicari otomatis.</p>
      <div v-if="target === 'curriculum'">
        <label for="im-text" class="u-label">Atau tempel teks dari dokumen</label>
        <textarea id="im-text" v-model="text" rows="5" class="u-input font-mono text-sm" :placeholder="'# Sistem Rem\n1. Teori sistem rem (minggu 2)\n2. Ganti kampas rem'"></textarea>
        <p class="u-help">Baris diawali # atau "Modul:" menjadi nama modul; baris lain menjadi materi. "(minggu 2)" terbaca sebagai minggu ke-2.</p>
      </div>

      <p v-if="error" class="u-notice !bg-[color:var(--merah-muda)]" role="alert">{{ error }}</p>

      <div v-if="preview">
        <p class="font-extrabold">{{ preview.rows.length }} baris terbaca · {{ baru }} baru · {{ preview.rows.length - baru }} diperbarui</p>
        <ul v-if="preview.warnings.length" class="mt-2 space-y-1 text-sm">
          <li v-for="(w, i) in preview.warnings" :key="i" class="u-notice">{{ w }}</li>
        </ul>
        <div class="mt-3 max-h-72 overflow-auto rounded-xl border-2 border-[color:var(--ink)]">
          <table class="w-full text-left text-sm">
            <thead class="sticky top-0 bg-[color:var(--stabilo)]"><tr><th v-for="c in COLS[target]" :key="c.key" class="px-2 py-1.5 font-extrabold">{{ c.label }}</th><th class="px-2 py-1.5"></th></tr></thead>
            <tbody>
              <tr v-for="r in preview.rows" :key="r.row" class="border-t-2 border-[color:var(--ink)]">
                <td v-for="c in COLS[target]" :key="c.key" class="px-2 py-1.5">{{ tampil(r[c.key]) }}</td>
                <td class="px-2 py-1.5"><LChip :tone="r.action === 'create' ? 'green' : 'amber'">{{ r.action === 'create' ? 'baru' : 'ubah' }}</LChip></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    <template #footer>
      <button type="button" class="u-btn" @click="tutup">Batal</button>
      <button v-if="!preview" type="button" class="u-btn u-btn-hitam" :disabled="busy || (!file && !text.trim())" @click="jalankan(true)">{{ busy ? 'Membaca…' : 'Pratinjau' }}</button>
      <button v-else type="button" class="u-btn u-btn-merah" :disabled="busy" @click="jalankan(false)">{{ busy ? 'Menyimpan…' : `Simpan ${preview.rows.length} baris` }}</button>
    </template>
  </LDialog>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { ArrowDownTrayIcon, ArrowUpTrayIcon } from '@heroicons/vue/24/outline'
import LDialog from '../leader/LDialog.vue'
import LChip from '../leader/LChip.vue'
import { notify } from '../leader/notice'
import { downloadBase64, fileToBase64 } from '../../services/leaderApi'

const props = defineProps({ open: Boolean, target: String, programId: Number, api: Object })
const emit = defineEmits(['close', 'done'])

const INFO = {
  curriculum: { title: 'Impor kurikulum', sub: 'Materi baru ditambahkan, materi yang sudah ada (kode/nama sama) diperbarui.', cols: 'Modul, Kode, Materi, Minggu, Jam, Praktik, Ringkasan' },
  schedule: { title: 'Impor jadwal', sub: 'Sesi dengan tanggal dan jam mulai yang sama diperbarui. Mentor baru dibuat otomatis.', cols: 'Tanggal, Mulai, Selesai (atau Jam "08.00-12.00"), Mentor, Materi (kode/nama, pisahkan dengan ;)' },
  students: { title: 'Impor siswa', sub: 'Siswa dengan No. WA atau nama yang sama diperbarui.', cols: 'Nama, No WA, Asal / sekolah, Tanggal masuk, Catatan' },
}
const COLS = {
  curriculum: [{ key: 'module_name', label: 'Modul' }, { key: 'code', label: 'Kode' }, { key: 'name', label: 'Materi' }, { key: 'week', label: 'Minggu' }, { key: 'planned_hours', label: 'Jam' }, { key: 'practice', label: 'Praktik' }],
  schedule: [{ key: 'date', label: 'Tanggal' }, { key: 'time_start', label: 'Mulai' }, { key: 'time_end', label: 'Selesai' }, { key: 'mentor', label: 'Mentor' }, { key: 'topics', label: 'Materi' }, { key: 'title', label: 'Judul' }],
  students: [{ key: 'name', label: 'Nama' }, { key: 'phone', label: 'No WA' }, { key: 'origin', label: 'Asal' }],
}

const file = ref(null)
const text = ref('')
const busy = ref(false)
const error = ref('')
const preview = ref(null)
const baru = computed(() => (preview.value?.rows || []).filter((r) => r.action === 'create').length)

const tampil = (v) => (Array.isArray(v) ? v.join(', ') : v === true ? 'Ya' : v === false ? '' : v ?? '')

watch(() => props.open, (v) => { if (v) { file.value = null; text.value = ''; preview.value = null; error.value = '' } })
watch([file, text], () => { preview.value = null })

const tutup = () => emit('close')
const pilihFile = (ev) => { file.value = ev.target.files?.[0] || null; ev.target.value = ''; if (file.value) text.value = '' }

async function unduhContoh() {
  try {
    const res = await props.api.template(props.target)
    downloadBase64(res.filename, res.content)
  } catch (e) { notify.error(e.message) }
}

async function jalankan(isPreview) {
  busy.value = true
  error.value = ''
  try {
    const payload = { program_id: props.programId, target: props.target, preview: isPreview }
    if (file.value) Object.assign(payload, { filename: file.value.name, content: await fileToBase64(file.value) })
    else payload.text = text.value
    const res = await props.api.importFile(payload)
    if (isPreview) preview.value = res
    else {
      notify.success(`${res.created} baru, ${res.updated} diperbarui`)
      emit('done')
      emit('close')
    }
  } catch (e) {
    error.value = e.message
  } finally {
    busy.value = false
  }
}
</script>
