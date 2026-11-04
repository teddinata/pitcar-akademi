<!-- Rekap Asesmen Terpadu per periode: tiga komponen, jenjang akhir, status
     validasi asesor. Klik peserta untuk mendengar rekaman dan mengesahkan. -->
<template>
  <div class="ujian min-h-screen p-4 md:p-6">
    <AsesmenNav title="Rekap & Validasi" subtitle="Nilai AI dari rekaman jadi penilaian utama. Asesor cukup mengecek peserta bertanda kuning, lalu mengesahkan." :admin="isAdmin" @help="tour.replay()">
      <template #actions>
        <button v-if="data?.rows.length" class="u-btn !min-h-10" @click="unduh"><ArrowDownTrayIcon class="w-5 h-5" />Unduh CSV</button>
      </template>
    </AsesmenNav>

    <div class="flex flex-wrap items-center gap-2 mb-4" data-tour="rekap-periode">
      <span class="text-sm font-extrabold">Periode:</span>
      <select v-model="cycleId" class="u-input !w-auto min-w-[16rem]" @change="pilihPeriode">
        <option v-for="c in cycles" :key="c.id" :value="c.id">{{ c.name }} · {{ STATE[c.state] }}</option>
      </select>
    </div>

    <div v-if="loading" class="u-card h-64 animate-pulse"></div>
    <p v-else-if="error" class="u-card p-5 font-bold text-[color:var(--merah)]">{{ error }}</p>
    <div v-else-if="!cycles.length" class="u-card p-8 text-center">
      <p class="u-display text-xl font-extrabold">Belum ada periode Asesmen Terpadu</p>
      <p class="mt-1 text-[15px] text-[color:var(--ink-soft)]">{{ isAdmin ? 'Buat periode dulu di tab Periode.' : 'Anda belum ditunjuk sebagai asesor.' }}</p>
    </div>

    <template v-else-if="data">
      <!-- Angka ringkas -->
      <section class="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5" data-tour="rekap-angka">
        <button v-for="s in KARTU" :key="s.key" class="u-card p-3 text-left transition-transform" :class="[filter === s.key ? '!bg-[color:var(--stabilo)] -translate-y-0.5' : '', s.bg]" @click="filter = filter === s.key ? 'all' : s.key">
          <p class="u-angka !text-[2rem]">{{ hitung(s.key) }}</p>
          <p class="text-sm font-extrabold mt-1">{{ s.label }}</p>
        </button>
      </section>

      <!-- Sebaran jenjang -->
      <section class="u-card p-4 mb-5" data-tour="rekap-sebaran">
        <p class="font-extrabold mb-2">Sebaran jenjang akhir <span class="text-sm font-bold text-[color:var(--ink-soft)]">({{ selesai }} peserta lengkap)</span></p>
        <div class="grid grid-cols-4 gap-2">
          <div v-for="n in 4" :key="n" class="rounded-lg border-2 border-[color:var(--ink)] p-2">
            <div class="flex items-center justify-between"><span class="u-level" :class="`l${n}`">L{{ n }}</span><span class="u-display text-2xl font-extrabold">{{ sebaran[n] }}</span></div>
            <p class="mt-1 text-xs font-bold leading-tight truncate">{{ data.level_names[n] }}</p>
            <div class="mt-1.5 h-2 rounded-full border-[1.5px] border-[color:var(--ink)] overflow-hidden"><div class="h-full bg-[color:var(--ink)]" :style="{ width: `${selesai ? (sebaran[n] / selesai) * 100 : 0}%` }"></div></div>
          </div>
        </div>
      </section>

      <!-- Tabel -->
      <section class="overflow-x-auto rounded-xl border-[2.5px] border-[color:var(--ink)] shadow-[4px_4px_0_var(--ink)] bg-white" data-tour="rekap-tabel">
        <table class="u-table min-w-[62rem]">
          <thead><tr>
            <th>Peserta</th>
            <th v-if="data.cycle.oral_enabled">Lisan ({{ data.cycle.weights.oral }})</th>
            <th v-if="data.cycle.cases.length">Studi kasus ({{ data.cycle.weights.case }})</th>
            <th v-if="data.cycle.lead_enabled">Lead ({{ data.cycle.weights.lead }})</th>
            <th>Jenjang akhir</th><th>Status</th><th></th>
          </tr></thead>
          <tbody>
            <tr v-if="!baris.length"><td colspan="7" class="text-center text-sm py-6">Tidak ada peserta di filter ini.</td></tr>
            <tr v-for="r in baris" :key="r.id" class="is-click" @click="buka(r)">
              <td><p class="font-bold leading-tight">{{ r.employee.name }}</p><p class="text-xs text-[color:var(--ink-soft)]">{{ r.employee.job }}</p></td>
              <td v-if="data.cycle.oral_enabled">
                <template v-if="r.summary.components.oral?.status === 'done'">
                  <span class="u-level mr-1.5" :class="levelClass(r.summary.components.oral.level)">{{ r.summary.components.oral.level ? `L${r.summary.components.oral.level}` : '<L1' }}</span>
                  <span class="font-extrabold tabular-nums">{{ pct(r.oral_percent) }}</span>
                  <span v-if="r.summary.open_flags" class="u-chip u-chip-kuning !text-[10px] ml-1.5">{{ r.summary.open_flags }} ditandai</span>
                </template>
                <span v-else class="text-sm">{{ r.oral ? ORAL_STATE(r.oral) : '–' }}</span>
              </td>
              <td v-if="data.cycle.cases.length"><Komponen :c="r.summary.components.case" /></td>
              <td v-if="data.cycle.lead_enabled"><Komponen :c="r.summary.components.lead" /></td>
              <td>
                <template v-if="r.summary.final_level">
                  <span class="u-level" :class="levelClass(r.summary.final_level)">L{{ r.summary.final_level }}</span>
                  <span class="ml-1.5 text-sm font-bold">{{ r.summary.final_name }}</span>
                  <span v-if="r.summary.inconsistent" class="block mt-1 text-[11px] font-extrabold text-[color:var(--merah-tua)]">Sumber berbeda {{ num(r.summary.spread, 1) }} level</span>
                </template>
                <span v-else class="text-sm">–</span>
              </td>
              <td><span class="u-chip !text-[11px]" :class="STATUS[r.summary.status].chip">{{ STATUS[r.summary.status].label }}</span></td>
              <td class="text-right"><ChevronRightIcon class="w-5 h-5 inline" /></td>
            </tr>
          </tbody>
        </table>
      </section>
      <p class="mt-3 text-sm text-[color:var(--ink-soft)]">Jenjang akhir = rata-rata berbobot komponen yang dipakai (angka di kepala kolom), paling tinggi satu level di atas komponen terendah. "Sumber berbeda" muncul bila selisih komponen ≥ 1,5 level: dengarkan rekamannya sebelum mengesahkan.</p>
    </template>
  </div>
</template>

<script setup>
import '@fontsource-variable/bricolage-grotesque'
import '../../styles/exam.css'
import '../../styles/asesmen.css'
import { computed, defineComponent, h, nextTick, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowDownTrayIcon, ChevronRightIcon } from '@heroicons/vue/24/outline'
import AsesmenNav from '../../components/asesmen/AsesmenNav.vue'
import { competencyApi } from '../../services/competencyApi'
import { useTour } from '../../composables/useTour'
import { COMPONENT_STATUS, ORAL_STATE, STATUS, levelClass, num, pct } from '../../utils/asesmen'

const STATE = { draft: 'Draf', open: 'Berjalan', closed: 'Ditutup' }
const KARTU = [
  { key: 'all', label: 'Peserta', bg: '' },
  { key: 'incomplete', label: 'Belum lengkap', bg: '' },
  { key: 'review', label: 'Perlu dicek', bg: 'bg-[#fff6bf]' },
  { key: 'ready', label: 'Siap disahkan', bg: 'bg-[#fde8e8]' },
  { key: 'validated', label: 'Disahkan', bg: 'bg-[#d9f2e3]' },
]

const Komponen = defineComponent({
  props: { c: Object },
  setup(props) {
    return () => {
      const c = props.c
      if (!c || c.status === 'none') return h('span', { class: 'text-sm' }, '–')
      if (c.status !== 'done') return h('span', { class: 'text-sm' }, `${COMPONENT_STATUS[c.status]}${c.total ? ` ${c.done}/${c.total}` : ''}`)
      return h('span', {}, [h('span', { class: `u-level ${levelClass(c.level)}` }, num(c.level, 1))])
    }
  },
})

const route = useRoute()
const router = useRouter()
const loading = ref(true)
const error = ref('')
const cycles = ref([])
const cycleId = ref(null)
const data = ref(null)
const isAdmin = ref(false)
const filter = ref('all')

const baris = computed(() => (data.value?.rows || []).filter((r) => filter.value === 'all' || r.summary.status === filter.value))
const hitung = (key) => (data.value?.rows || []).filter((r) => key === 'all' || r.summary.status === key).length
const selesai = computed(() => (data.value?.rows || []).filter((r) => r.summary.final_level).length)
const sebaran = computed(() => {
  const out = { 1: 0, 2: 0, 3: 0, 4: 0 }
  ;(data.value?.rows || []).forEach((r) => { if (r.summary.final_level) out[r.summary.final_level] += 1 })
  return out
})

async function muat() {
  if (!cycleId.value) return
  loading.value = true
  error.value = ''
  try {
    data.value = await competencyApi.recap(cycleId.value)
  } catch (e) { error.value = e.message } finally { loading.value = false }
}
function pilihPeriode() { router.replace({ query: { periode: cycleId.value } }); muat() }
function buka(r) { router.push(`/dashboard/asesmen/rekap/${r.id}`) }

function unduh() {
  const kolom = ['Peserta', 'Jabatan', 'Lisan persen', 'Lisan jenjang', 'Studi kasus', 'Lead', 'Gabungan', 'Jenjang akhir', 'Nama jenjang', 'Status']
  const sel = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const isi = data.value.rows.map((r) => [
    r.employee.name, r.employee.job, r.oral_percent ?? '', r.summary.components.oral?.level ?? '',
    r.summary.components.case?.level ?? '', r.summary.components.lead?.level ?? '', r.summary.combined ?? '',
    r.summary.final_level ? `L${r.summary.final_level}` : '', r.summary.final_name || '', STATUS[r.summary.status].label,
  ].map(sel).join(';'))
  const blob = new Blob([`﻿${[kolom.map(sel).join(';'), ...isi].join('\n')}`], { type: 'text/csv;charset=utf-8' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `rekap-${data.value.cycle.name.replace(/[^\w-]+/g, '-')}.csv`
  a.click()
  URL.revokeObjectURL(a.href)
}

const tour = useTour('asesmen-rekap', () => [
  { element: '[data-tour="rekap-periode"]', title: 'Pilih periode', text: 'Asesor hanya melihat periode tempat ia ditunjuk sebagai validator.', side: 'bottom' },
  { element: '[data-tour="rekap-angka"]', title: 'Mulai dari "Perlu dicek"', text: 'Klik kotak untuk menyaring. Kuning = ada jawaban lisan yang ditandai (mepet batas, yakin tapi salah, terlalu pendek, AI ragu).', side: 'bottom' },
  { element: '[data-tour="rekap-tabel"]', title: 'Satu baris satu peserta', text: 'Nilai tiap komponen dan jenjang akhir. Klik baris untuk mendengar rekaman, memeriksa, lalu mengesahkan.', side: 'top' },
])

onMounted(async () => {
  try {
    const hasil = await competencyApi.terpaduCycles()
    cycles.value = hasil.cycles
    isAdmin.value = hasil.is_admin
    const q = Number(route.query.periode)
    cycleId.value = cycles.value.some((c) => c.id === q) ? q : (cycles.value.find((c) => c.state === 'open') || cycles.value[0])?.id
    await muat()
  } catch (e) { error.value = e.message } finally { loading.value = false }
  nextTick(() => tour.autoStart())
})
</script>
