<!-- Kartu satu sesi (tanggal, jam, mentor, materi, status, absen ringkas). Klik = buka sesi. -->
<template>
  <button type="button" class="u-card flex w-full flex-col gap-1 p-4 text-left transition-transform active:translate-x-[2px] active:translate-y-[2px]" @click="$emit('open')">
    <span class="flex w-full items-start justify-between gap-2">
      <span class="min-w-0">
        <span class="block text-xs font-extrabold uppercase tracking-[.06em] text-[color:var(--ink-soft)]">{{ showProgram ? `${s.program_name} · ` : '' }}{{ tanggal(s.date) }}</span>
        <span class="u-display block text-lg font-extrabold leading-snug">{{ s.time_start }}–{{ s.time_end }}<template v-if="s.title"> · {{ s.title }}</template></span>
      </span>
      <LChip :tone="SESSION_STATE[s.state].tone">{{ SESSION_STATE[s.state].label }}</LChip>
    </span>
    <span class="text-sm">Mentor: <b>{{ s.teacher_name || '–' }}</b></span>
    <span v-if="materi.length" class="line-clamp-2 text-sm text-[color:var(--ink-soft)]">{{ materi.join(', ') }}</span>
    <span v-if="s.student_count" class="text-xs font-bold">Hadir {{ (s.attendance.present || 0) + (s.attendance.late || 0) }}/{{ s.student_count }}<template v-if="s.attendance.absent"> · alpa {{ s.attendance.absent }}</template></span>
    <span v-for="f in s.flags" :key="f" class="u-notice mt-1 block">{{ SESSION_FLAG[f] }}</span>
  </button>
</template>

<script setup>
import { computed } from 'vue'
import LChip from '../leader/LChip.vue'
import { SESSION_FLAG, SESSION_STATE, tanggal } from '../../services/academyApi'

const props = defineProps({ s: Object, showProgram: Boolean })
defineEmits(['open'])
const materi = computed(() => (props.s.delivered_topics.length ? props.s.delivered_topics : props.s.planned_topics))
</script>
