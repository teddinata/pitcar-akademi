<!-- Penanda proses AI di latar (pojok kanan bawah, semua halaman Akademi). Muncul selama ada ujian lisan
     yang dipantau; berubah hijau saat selesai, merah bila berhenti. -->
<template>
  <div v-if="aiWatch.items.length" class="fixed z-40 right-3 bottom-20 md:bottom-4 flex flex-col items-end gap-2 max-w-[calc(100vw-1.5rem)]" aria-live="polite">
    <div v-for="item in aiWatch.items" :key="item.oral_id"
      class="flex items-center gap-3 rounded-xl border-[2.5px] border-[#141414] shadow-[3px_3px_0_#141414] text-[#141414] px-3 py-2 text-sm max-w-sm"
      :class="kelas(item)">
      <span v-if="!selesai(item) && !gagal(item)" class="h-4 w-4 shrink-0 rounded-full border-2 border-current border-t-transparent animate-spin motion-reduce:animate-none" aria-hidden="true"></span>
      <CheckCircleIcon v-else-if="selesai(item)" class="h-5 w-5 shrink-0" aria-hidden="true" />
      <ExclamationTriangleIcon v-else class="h-5 w-5 shrink-0" aria-hidden="true" />
      <router-link :to="`/dashboard/asesmen/rekap/${item.participant_id}`" class="min-w-0 flex-1 hover:underline" @click="selesai(item) && unwatchOral(item.oral_id)">
        <span class="block truncate font-bold">{{ item.name || 'Ujian lisan' }}</span>
        <span class="block truncate text-xs">{{ keterangan(item) }}</span>
      </router-link>
      <button type="button" class="shrink-0 rounded p-1 hover:bg-black/10" :aria-label="`Tutup pemantau ${item.name}`" @click="unwatchOral(item.oral_id)">
        <XMarkIcon class="h-4 w-4" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { CheckCircleIcon, ExclamationTriangleIcon, XMarkIcon } from '@heroicons/vue/24/outline'
import { aiWatch, formatEta, startAiWatch, unwatchOral } from '../composables/useAiWatch'

const selesai = (i) => i.status?.ai_state === 'done'
const gagal = (i) => i.status?.ai_state === 'failed'
const kelas = (i) => (selesai(i) ? 'bg-[#dcf3e6]' : gagal(i) ? 'bg-[#fde8e8]' : 'bg-white')

function keterangan(i) {
  const s = i.status
  if (!s) return 'Penilaian AI berjalan…'
  if (selesai(i)) return 'Penilaian AI selesai. Buka hasil'
  if (gagal(i)) return 'Penilaian AI berhenti. Buka untuk proses ulang'
  const p = s.progress || {}
  const tahap = p.transcribed < p.recordings ? `Transkripsi ${p.transcribed}/${p.recordings}` : `Penilaian AI ${Math.min(p.passes + 1, p.total_passes)}/${p.total_passes}`
  return `${tahap} · ${formatEta(p.eta_seconds)}`
}

onMounted(startAiWatch)
</script>
