<!-- Ringkasan satu siswa: kehadiran, peta materi (Belum/Diikuti/Tertinggal/Praktik/Kompeten), quiz, evaluasi,
     riwayat absen. Dipakai di admin (dialog siswa) dan halaman siswa lewat QR kelas. -->
<template>
  <div class="space-y-5">
    <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <div class="a-stat" :class="{ 'is-merah': rendah }">
        <p class="text-xs font-extrabold uppercase tracking-[.06em]">Kehadiran</p>
        <p class="u-angka !text-[1.9rem]">{{ data.attendance.rate == null ? '–' : `${data.attendance.rate}%` }}</p>
        <p class="text-xs">{{ data.attendance.present + data.attendance.late }} dari {{ data.attendance.sessions }} sesi</p>
      </div>
      <div class="a-stat is-kuning">
        <p class="text-xs font-extrabold uppercase tracking-[.06em]">Kompeten</p>
        <p class="u-angka !text-[1.9rem]">{{ data.tally.competent }}<span class="text-base">/{{ data.topics.length }}</span></p>
        <p class="text-xs">materi</p>
      </div>
      <div class="a-stat" :class="{ 'is-merah': data.tally.missed }">
        <p class="text-xs font-extrabold uppercase tracking-[.06em]">Tertinggal</p>
        <p class="u-angka !text-[1.9rem]">{{ data.tally.missed }}</p>
        <p class="text-xs">perlu susulan</p>
      </div>
      <div class="a-stat">
        <p class="text-xs font-extrabold uppercase tracking-[.06em]">Rata-rata quiz</p>
        <p class="u-angka !text-[1.9rem]">{{ data.quiz_avg ?? '–' }}</p>
        <p class="text-xs">{{ data.quiz_done }} quiz</p>
      </div>
    </div>

    <p v-if="data.risk?.length" class="u-notice !bg-[color:var(--merah-muda)]">Perlu perhatian: {{ data.risk.join(' · ') }}</p>

    <section>
      <h3 class="u-display text-lg font-extrabold">Peta materi</h3>
      <div class="mt-1 flex flex-wrap gap-2 text-xs font-bold">
        <span v-for="(s, k) in TOPIC_STATUS" :key="k" class="inline-flex items-center gap-1"><span class="a-cell !h-6 !min-w-6" :class="s.cls">{{ s.short }}</span>{{ s.label }} {{ data.tally[k] }}</span>
      </div>
      <div class="a-bar mt-2" role="img" :aria-label="`${pct}% materi sudah diikuti atau lebih`"><span :style="{ width: `${pct}%` }"></span></div>
      <template v-for="(group, mod) in perModul" :key="mod">
        <p class="mt-3 text-xs font-extrabold uppercase tracking-[.06em] text-[color:var(--ink-soft)]">{{ mod }}</p>
        <ul class="mt-1 space-y-1">
          <li v-for="t in group" :key="t.topic_id" class="flex items-center gap-2 rounded-lg border-2 border-[color:var(--ink)] bg-white px-2 py-1.5 text-sm">
            <span class="a-cell" :class="TOPIC_STATUS[t.status].cls" :title="TOPIC_STATUS[t.status].label">{{ TOPIC_STATUS[t.status].short }}</span>
            <span class="min-w-0 flex-1">
              <span class="block font-bold">{{ t.name }}</span>
              <span class="block text-xs text-[color:var(--ink-soft)]">{{ TOPIC_STATUS[t.status].label }}<template v-if="t.practice_score"> · praktik {{ t.practice_score }}/4</template><template v-if="t.quiz != null"> · quiz {{ t.quiz }}</template><template v-if="t.note"> · {{ t.note }}</template></span>
            </span>
            <slot name="topic-action" :topic="t" />
          </li>
        </ul>
      </template>
    </section>

    <section v-if="data.evaluations.length">
      <h3 class="u-display text-lg font-extrabold">Evaluasi & catatan</h3>
      <ul class="mt-2 space-y-2">
        <li v-for="e in data.evaluations" :key="e.id" class="rounded-xl border-2 border-[color:var(--ink)] bg-white p-3 text-sm">
          <p class="font-extrabold">{{ e.kind === 'weekly' ? `Evaluasi minggu ${tanggal(e.date, false)}` : tanggal(e.date) }}
            <LChip v-if="e.flag" :tone="e.flag === 'good' ? 'green' : 'amber'">{{ e.flag === 'good' ? 'Bagus' : 'Perlu perhatian' }}</LChip>
            <span v-if="e.average" class="ml-1 u-chip u-chip-kuning">rata-rata {{ e.average }}</span>
          </p>
          <p v-if="e.kind === 'weekly'" class="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs">
            <span v-for="r in RUBRIC" :key="r.value" class="whitespace-nowrap">{{ r.label }}: <b>{{ e.scores[r.value] || '–' }}</b></span>
          </p>
          <p v-if="e.note" class="mt-1">{{ e.note }}</p>
          <p class="text-xs text-[color:var(--ink-soft)]">{{ e.author }}</p>
        </li>
      </ul>
    </section>

    <section v-if="data.history.length">
      <h3 class="u-display text-lg font-extrabold">Riwayat kehadiran</h3>
      <ul class="mt-2 u-card">
        <li v-for="h in data.history" :key="h.session_id" class="flex items-center gap-2 border-t-2 border-[color:var(--ink)] px-3 py-2 text-sm first:border-t-0">
          <LChip :tone="ATT_STATUS[h.status].tone">{{ ATT_STATUS[h.status].label }}</LChip>
          <span class="min-w-0 flex-1"><b>{{ tanggal(h.date) }}</b><span class="block truncate text-xs text-[color:var(--ink-soft)]">{{ [h.title, h.left_early ? 'pulang lebih awal' : '', h.note].filter(Boolean).join(' · ') }}</span></span>
        </li>
      </ul>
    </section>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import LChip from '../leader/LChip.vue'
import { ATT_STATUS, RUBRIC, TOPIC_STATUS, tanggal } from '../../services/academyApi'

const props = defineProps({ data: { type: Object, required: true } })

const rendah = computed(() => props.data.attendance.rate != null && props.data.attendance.rate < 85)
const pct = computed(() => {
  const n = props.data.topics.length
  if (!n) return 0
  const t = props.data.tally
  return Math.round(((t.competent + t.practice + t.attended) / n) * 100)
})
const perModul = computed(() => props.data.topics.reduce((acc, t) => {
  const k = t.module_name || 'Materi'
  ;(acc[k] = acc[k] || []).push(t)
  return acc
}, {}))
</script>
