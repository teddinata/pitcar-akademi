<!-- Rekap nilai: matriks peserta x materi (desktop), kartu (mobile). Cetak/Simpan PDF lewat window.print. -->
<template>
  <div id="leader-recap">
    <div class="flex flex-wrap items-center justify-between gap-3 print:hidden">
      <h3 class="u-display text-xl font-extrabold">Rekap Nilai</h3>
      <button type="button" class="u-btn" :disabled="!data" @click="print"><PrinterIcon class="h-5 w-5" />Cetak / Simpan PDF</button>
    </div>

    <div v-if="loading" class="mt-4 space-y-2" aria-busy="true"><div v-for="i in 3" :key="i" class="u-card h-14 animate-pulse"></div></div>
    <ErrorState v-else-if="error" class="mt-4" :message="error" @retry="load" />
    <div v-else-if="!data.rows.length" class="u-card mt-4 p-8 text-center font-bold">Belum ada peserta di program ini.</div>

    <template v-else>
      <div class="print-title hidden">
        <h1>Rekap Nilai: {{ data.program?.name || program.name }}</h1>
        <p>Dicetak {{ todayWib() }}</p>
      </div>

      <p class="mt-3 text-xs text-[color:var(--ink-soft)]">Lulus program bila semua materi selesai, rata-rata minimal {{ passScore }}, dan tiap materi minimal {{ passScore }}. Nilai {{ data.remedial_from }}-{{ passScore - 1 }}: remedial. Di bawah {{ data.remedial_from }}: pembelajaran ulang. Nilai materi = terbaik dari tes awal dan susulan.</p>
      <div class="mt-2 flex flex-wrap gap-2 print:hidden">
        <LChip v-for="(s, k) in RESULT_STATUS" :key="k" :tone="s.tone">{{ s.label }}</LChip>
      </div>

      <!-- Desktop: matriks -->
      <div class="u-card mt-4 hidden overflow-x-auto md:block print:block !shadow-[4px_4px_0_var(--ink)]">
        <table class="u-table">
          <thead>
            <tr>
              <th scope="col">Peserta</th>
              <th v-for="t in data.topics" :key="t.id" scope="col" class="!text-center !normal-case">{{ t.name }}</th>
              <th scope="col" class="!text-center">Rata-rata</th>
              <th scope="col">Status program</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in data.rows" :key="r.participant.id">
              <th scope="row">{{ r.participant.name }}<span v-if="r.participant.job" class="block text-xs font-semibold text-[color:var(--ink-soft)]">{{ r.participant.job }}</span></th>
              <td v-for="c in r.cells" :key="c.topic_id" class="text-center">
                <div class="l-cell" :class="`t-${RESULT_STATUS[c.status]?.tone || 'gray'}`">
                  <span class="u-display text-base font-extrabold leading-tight">{{ fmtScore(c.final) }}</span>
                  <span class="text-[11px] font-semibold leading-tight"><template v-if="c.initial != null || c.remedials?.length">awal {{ fmtScore(c.initial) }}<template v-if="c.remedials?.length"> · susulan {{ fmtScore(c.remedials[c.remedials.length - 1]) }}</template></template><template v-else>{{ c.pending ? 'Sedang ditugaskan' : 'Belum' }}</template></span>
                  <span v-if="c.pending" class="text-[11px] font-bold">berjalan</span>
                </div>
              </td>
              <td class="text-center u-display text-lg font-extrabold">{{ fmtScore(r.average) }}</td>
              <td><LChip :tone="PROGRAM_STATUS[r.status].tone">{{ PROGRAM_STATUS[r.status].label }}</LChip><span class="ml-2 text-xs font-bold">{{ r.done }}/{{ r.total }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mobile: kartu per peserta -->
      <ul class="mt-4 space-y-3 md:hidden print:hidden">
        <li v-for="r in data.rows" :key="r.participant.id" class="u-card p-4">
          <div class="flex items-start justify-between gap-2">
            <div class="min-w-0"><p class="font-extrabold">{{ r.participant.name }}</p><p v-if="r.participant.job" class="text-xs text-[color:var(--ink-soft)]">{{ r.participant.job }}</p></div>
            <LChip :tone="PROGRAM_STATUS[r.status].tone" class="shrink-0">{{ PROGRAM_STATUS[r.status].label }}</LChip>
          </div>
          <p class="mt-2 text-sm">Rata-rata <b class="u-display text-lg">{{ fmtScore(r.average) }}</b> · {{ r.done }}/{{ r.total }} materi selesai</p>
          <ul class="mt-3 space-y-2">
            <li v-for="c in r.cells" :key="c.topic_id" class="flex items-center justify-between gap-3 rounded-xl border-2 border-[color:var(--ink)] px-3 py-2" :class="`l-bg-${RESULT_STATUS[c.status]?.tone || 'gray'}`">
              <span class="min-w-0 text-sm font-bold">{{ topicName(c.topic_id) }}<span class="block text-xs font-semibold"><template v-if="c.initial != null || c.remedials?.length">awal {{ fmtScore(c.initial) }}<template v-if="c.remedials?.length"> · susulan {{ fmtScore(c.remedials[c.remedials.length - 1]) }}</template></template><template v-else>{{ c.pending ? 'Sedang ditugaskan' : 'Belum' }}</template></span></span>
              <span class="u-display shrink-0 text-xl font-extrabold">{{ fmtScore(c.final) }}</span>
            </li>
          </ul>
        </li>
      </ul>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { PrinterIcon } from '@heroicons/vue/24/outline'
import { leaderApi } from '../../services/leaderApi'
import ErrorState from './ErrorState.vue'
import LChip from './LChip.vue'
import { RESULT_STATUS, fmtScore, todayWib } from '../../utils/leader'

const props = defineProps({ program: Object })
const PROGRAM_STATUS = {
  passed: { label: 'Lulus program', tone: 'green' },
  failed: { label: 'Belum lulus', tone: 'red' },
  in_progress: { label: 'Berjalan', tone: 'gray' },
}

const data = ref(null)
const loading = ref(true)
const error = ref('')
const passScore = computed(() => props.program.pass_score)
const topicName = (id) => data.value.topics.find((t) => t.id === id)?.name || ''

const load = async () => {
  loading.value = true
  error.value = ''
  try {
    data.value = await leaderApi.recap(props.program.id)
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

const print = () => window.print()

watch(() => props.program.id, load)
onMounted(load)
</script>
