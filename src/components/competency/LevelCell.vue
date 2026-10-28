<!-- Sel peta kompetensi: level akhir L1-L4 berwarna, angka rata-rata berbobot,
     dan titik bila level diubah manual oleh admin. -->
<template>
  <div
    class="relative rounded-lg px-2 py-2 text-center ring-1"
    :class="band ? LEVEL_STYLE[band].cell : EMPTY_CELL"
    :title="title"
  >
    <span class="block text-sm font-bold leading-none">{{ band ? `L${band}` : '–' }}</span>
    <span class="block mt-1 text-[10px] tabular-nums opacity-75">{{ band ? fmtLevel(result.final) : 'belum ada' }}</span>
    <span v-if="result?.manual" class="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-amber-500" aria-label="diubah manual"></span>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { EMPTY_CELL, LEVEL_STYLE, SOURCE_LABEL, fmtLevel } from '../../utils/competency'

const props = defineProps({ result: { type: Object, default: null } })
const band = computed(() => props.result?.band || null)
const title = computed(() => {
  const r = props.result
  if (!r) return 'Belum ada penilaian'
  const parts = ['case', 'supervisor', 'team', 'self'].filter((k) => r[k]).map((k) => `${SOURCE_LABEL[k]}: ${fmtLevel(r[k])}`)
  if (r.manual) parts.unshift(`Manual: ${fmtLevel(r.manual)}`)
  return parts.join(' · ') || 'Belum ada penilaian'
})
</script>
