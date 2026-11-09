<!-- Daftar bahan materi (PDF/slide) dengan tombol buka. Unduhan lewat fungsi `download` dari induk karena admin,
     mentor (tautan bertoken), dan siswa (QR kelas) memakai jalur API yang berbeda. Bila `fetchBlob` diisi,
     Buka menampilkan pratinjau di layar (PDF, gambar, PPTX, DOCX) dengan tombol unduh di dalamnya. -->
<template>
  <ul class="space-y-1.5">
    <li v-for="m in materials" :key="m.id" class="flex items-center gap-2 rounded-lg border-2 border-[color:var(--ink)] bg-white px-2 py-1.5 text-sm">
      <DocumentTextIcon class="h-5 w-5 shrink-0" aria-hidden="true" />
      <span class="min-w-0 flex-1">
        <span class="block truncate font-bold" :title="m.name">{{ m.name }}</span>
        <span class="block text-xs text-[color:var(--ink-soft)]">{{ ukuran(m.size) }}<template v-if="m.internal && showInternal"> · <b class="text-[color:var(--merah-tua)]">khusus pengajar</b></template></span>
      </span>
      <button type="button" class="u-btn u-btn-ghost u-btn-kecil shrink-0" :disabled="busyId === m.id" @click="buka(m)">
        <EyeIcon v-if="fetchBlob" class="h-4 w-4" aria-hidden="true" /><ArrowDownTrayIcon v-else class="h-4 w-4" aria-hidden="true" />{{ busyId === m.id ? 'Membuka…' : 'Buka' }}
      </button>
      <button v-if="removable" type="button" class="u-btn u-btn-ghost u-btn-bahaya u-btn-kecil !w-9 !p-0 shrink-0" :aria-label="`Hapus ${m.name}`" @click="$emit('remove', m)">
        <TrashIcon class="h-4 w-4" aria-hidden="true" />
      </button>
    </li>
  </ul>
  <FilePreview v-if="fetchBlob" :open="!!pratinjau" :name="pratinjau?.name || ''" :load="() => fetchBlob(pratinjau)" @close="pratinjau = null" />
</template>

<script setup>
import { ref } from 'vue'
import { ArrowDownTrayIcon, DocumentTextIcon, EyeIcon, TrashIcon } from '@heroicons/vue/24/outline'
import FilePreview from './FilePreview.vue'
import { notify } from '../leader/notice'

const props = defineProps({
  materials: { type: Array, default: () => [] },
  download: { type: Function, required: true },
  fetchBlob: { type: Function, default: null },
  showInternal: Boolean,
  removable: Boolean,
})
defineEmits(['remove'])

const busyId = ref(null)
const pratinjau = ref(null)
const ukuran = (b) => (!b ? '' : b < 1024 * 1024 ? `${Math.max(1, Math.round(b / 1024))} KB` : `${(b / 1024 / 1024).toFixed(1)} MB`)

async function buka(m) {
  if (props.fetchBlob) { pratinjau.value = m; return }
  busyId.value = m.id
  try {
    await props.download(m)
  } catch (e) {
    notify.error(e.message || 'Bahan belum bisa dibuka. Coba lagi.')
  } finally {
    busyId.value = null
  }
}
</script>
