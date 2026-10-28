<!-- Satu periode asesmen: peta kompetensi kabeng x pilar (heatmap), progres
     sumber penilaian per peserta, kelola peserta, dan rincian per peserta. -->
<template>
  <div class="min-h-screen clay-surface p-4 md:p-6">
    <div class="flex flex-wrap items-start gap-3 mb-5">
      <router-link to="/dashboard/lms/competency-map" class="mt-1 p-1.5 rounded-lg text-gray-500 hover:bg-white/70 hover:text-gray-800" title="Kembali">
        <ChevronLeftIcon class="w-5 h-5" />
      </router-link>
      <div class="min-w-0 flex-1">
        <p class="text-xs font-semibold text-gray-500">Peta kompetensi</p>
        <h1 class="text-xl md:text-2xl font-bold text-gray-900 leading-snug flex flex-wrap items-center gap-2">
          {{ cycle?.name || 'Memuat…' }}
          <span v-if="cycle" class="text-[11px] font-bold px-2 py-0.5 rounded-full" :class="STATE[cycle.state].cls">{{ STATE[cycle.state].label }}</span>
        </h1>
        <p v-if="cycle" class="text-sm text-gray-500">
          {{ cycle.profile.name }} · studi kasus: {{ cycle.case?.name || 'tidak ada' }} · minimal {{ cycle.min_team_raters }} penilai tim · {{ cycle.complete_count }}/{{ cycle.participant_count }} peserta lengkap
        </p>
      </div>
      <div v-if="cycle" class="flex flex-wrap gap-2">
        <button v-if="cycle.state === 'draft'" class="px-4 py-2 rounded-lg bg-[#b70000] text-white text-sm font-bold hover:bg-[#930000] disabled:bg-gray-300" :disabled="busy || !participants.length" @click="aksi('openCycle', 'Periode dimulai. Tugas penilaian sudah muncul di akun masing-masing.')">Mulai periode</button>
        <button v-if="cycle.state === 'open'" class="px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-bold disabled:bg-gray-300" :disabled="busy" @click="konfirmasiTutup = true">Tutup periode</button>
        <button v-if="cycle.state === 'closed'" class="px-4 py-2 rounded-lg text-sm font-semibold text-gray-700 bg-white ring-1 ring-gray-200 hover:bg-gray-50" :disabled="busy" @click="aksi('reopenCycle', 'Periode dibuka lagi.')">Buka lagi</button>
      </div>
    </div>

    <div v-if="loading" class="h-64 rounded-2xl bg-white/70 animate-pulse"></div>
    <div v-else-if="error" class="clay-card p-6 text-center"><p class="text-red-600 font-medium">{{ error }}</p></div>

    <template v-else-if="cycle">
      <div v-if="konfirmasiTutup" class="clay-card p-4 mb-4 flex flex-wrap items-center gap-3 ring-1 ring-gray-900/10">
        <p class="flex-1 text-sm text-gray-800">Tutup periode? Penilaian yang belum diisi tidak bisa dikirim lagi, dan peserta bisa melihat hasilnya.</p>
        <button class="px-3 py-2 rounded-lg text-sm font-semibold text-gray-700 hover:bg-white" @click="konfirmasiTutup = false">Batal</button>
        <button class="px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-bold" :disabled="busy" @click="konfirmasiTutup = false; aksi('closeCycle', 'Periode ditutup.')">Ya, tutup</button>
      </div>

      <!-- Tambah peserta -->
      <div v-if="cycle.state !== 'closed'" class="clay-card p-3 mb-4 relative">
        <div class="flex flex-wrap items-center gap-2">
          <MagnifyingGlassIcon class="w-4 h-4 text-gray-400 ml-1" />
          <input
            v-model="cari" class="flex-1 min-w-48 h-10 bg-transparent text-sm focus:outline-none"
            placeholder="Tambah peserta: ketik nama karyawan…" @input="cariKaryawan" @keydown.esc="hasilCari = []"
          />
        </div>
        <ul v-if="hasilCari.length" class="absolute left-3 right-3 top-full mt-1 z-20 max-h-72 overflow-y-auto rounded-xl bg-white shadow-xl ring-1 ring-gray-200 divide-y divide-gray-100">
          <li v-for="e in hasilCari" :key="e.id">
            <button
              class="w-full flex items-center justify-between gap-3 px-4 py-2.5 text-left hover:bg-gray-50 disabled:opacity-50"
              :disabled="sudahPeserta(e.id) || busy" @click="tambah(e)"
            >
              <span class="min-w-0">
                <span class="block text-sm font-semibold text-gray-900 truncate">{{ e.name }}</span>
                <span class="block text-xs text-gray-500 truncate">{{ [e.job, e.department].filter(Boolean).join(' · ') || '-' }}</span>
              </span>
              <span class="text-xs font-semibold" :class="sudahPeserta(e.id) ? 'text-gray-400' : 'text-[#b70000]'">{{ sudahPeserta(e.id) ? 'Sudah peserta' : '+ Tambah' }}</span>
            </button>
          </li>
        </ul>
      </div>

      <!-- Sebaran jenjang -->
      <div v-if="participants.length" class="grid grid-cols-2 lg:grid-cols-5 gap-2 mb-4">
        <div v-for="n in [4, 3, 2, 1]" :key="n" class="rounded-2xl px-4 py-3 ring-1" :class="LEVEL_STYLE[n].cell">
          <p class="text-[11px] font-bold">L{{ n }} · {{ levelName(n, cycle.profile.level_names) }}</p>
          <p class="text-2xl font-bold tabular-nums leading-tight">{{ sebaran[n] }} <span class="text-xs font-semibold opacity-70">orang</span></p>
        </div>
        <div class="col-span-2 lg:col-span-1 rounded-2xl px-4 py-3 ring-1 bg-gray-50 text-gray-500 ring-gray-200">
          <p class="text-[11px] font-bold">Belum lengkap</p>
          <p class="text-2xl font-bold tabular-nums leading-tight">{{ sebaran.none }} <span class="text-xs font-semibold opacity-70">orang</span></p>
        </div>
      </div>

      <!-- Peta -->
      <div class="clay-card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm border-separate border-spacing-0">
            <thead class="text-xs text-gray-500">
              <tr>
                <th class="sticky left-0 z-10 bg-gray-50 px-4 py-3 text-left font-medium uppercase min-w-44 border-b border-gray-100">Peserta</th>
                <th class="bg-gray-50 px-3 py-3 text-left font-medium uppercase border-b border-gray-100 min-w-40">Jenjang</th>
                <th v-for="p in pillars" :key="p.id" class="bg-gray-50 px-2 py-3 text-center font-semibold text-gray-700 border-b border-gray-100 min-w-24" :title="p.description">{{ p.name }}</th>
                <th class="bg-gray-50 px-3 py-3 text-left font-medium uppercase border-b border-gray-100 min-w-64">Kelengkapan penilaian</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in participants" :key="row.id" class="group cursor-pointer" @click="pilih(row)">
                <td class="sticky left-0 z-10 bg-white group-hover:bg-gray-50 px-4 py-2.5 border-b border-gray-100">
                  <p class="font-semibold text-gray-900 truncate max-w-48">{{ row.employee.name }}</p>
                  <p class="text-[11px] text-gray-500 truncate max-w-48">{{ row.employee.department || row.employee.job || '-' }}</p>
                </td>
                <td class="px-3 py-2.5 border-b border-gray-100 group-hover:bg-gray-50">
                  <span v-if="row.overall" class="inline-flex items-center rounded-lg px-2 py-1 text-xs font-bold ring-1 whitespace-nowrap" :class="LEVEL_STYLE[row.overall.level].cell">L{{ row.overall.level }} · {{ row.overall.name }}</span>
                  <span v-else class="text-xs text-gray-400">Belum lengkap</span>
                </td>
                <td v-for="p in pillars" :key="p.id" class="px-1.5 py-1.5 border-b border-gray-100 group-hover:bg-gray-50">
                  <LevelCell :result="row.results[p.id]" />
                </td>
                <td class="px-3 py-2.5 border-b border-gray-100 group-hover:bg-gray-50">
                  <div class="flex flex-wrap gap-1.5">
                    <ProgressChip v-if="row.progress.case !== 'none'" label="Kasus" :status="row.progress.case" />
                    <ProgressChip label="Atasan" :status="row.progress.supervisor" />
                    <ProgressChip label="Diri" :status="row.progress.self" />
                    <ProgressChip
                      :label="`Tim ${row.progress.team_done}/${row.progress.team_total}`"
                      :status="!row.progress.team_total ? 'none' : row.progress.team_done >= Math.min(row.progress.team_min, row.progress.team_total) ? 'done' : 'pending'"
                    />
                  </div>
                </td>
              </tr>
            </tbody>
            <tfoot v-if="participants.length > 1">
              <tr class="text-xs">
                <td class="sticky left-0 z-10 bg-gray-50 px-4 py-2.5 font-semibold text-gray-600">Rata-rata</td>
                <td class="bg-gray-50"></td>
                <td v-for="p in pillars" :key="p.id" class="bg-gray-50 px-2 py-2.5 text-center font-bold tabular-nums text-gray-700">{{ rataPilar(p.id) }}</td>
                <td class="bg-gray-50"></td>
              </tr>
            </tfoot>
          </table>
        </div>
        <div v-if="!participants.length" class="text-center py-10 px-4">
          <p class="font-semibold text-gray-800">Belum ada peserta</p>
          <p class="text-sm text-gray-500 mt-1">Cari nama karyawan di kotak di atas. Atasan dan anggota tim terisi otomatis dari struktur karyawan dan bisa diubah.</p>
        </div>
        <div class="px-4 py-3 border-t border-gray-100 flex flex-wrap gap-x-5 gap-y-1.5 text-[11px] text-gray-500">
          <span v-for="n in [1, 2, 3, 4]" :key="n" class="flex items-center gap-1.5">
            <span class="px-1.5 rounded ring-1 font-bold" :class="LEVEL_STYLE[n].cell">L{{ n }}</span>{{ levelName(n, cycle.profile.level_names) }}
          </span>
          <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-amber-500"></span>diubah manual</span>
          <span>Angka kecil = level rata-rata berbobot. Jenjang = rata-rata pilar, paling tinggi satu level di atas pilar terlemah. Klik baris untuk rincian.</span>
        </div>
      </div>
    </template>

    <ParticipantPanel
      v-if="selectedId" :participant-id="selectedId" :cycle-state="cycle?.state"
      @close="selectedId = null" @changed="perbaruiBaris" @removed="dihapus"
    />

    <div v-if="flash" class="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-[70] rounded-xl px-4 py-2.5 text-sm font-semibold shadow-lg" :class="flash.ok ? 'bg-gray-900 text-white' : 'bg-red-700 text-white'" role="status">{{ flash.text }}</div>
  </div>
</template>

<script setup>
import { computed, defineComponent, h, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { ChevronLeftIcon, MagnifyingGlassIcon } from '@heroicons/vue/24/outline'
import { competencyApi } from '../../services/competencyApi'
import { LEVEL_STYLE, levelName } from '../../utils/competency'
import LevelCell from '../../components/competency/LevelCell.vue'
import ParticipantPanel from '../../components/competency/ParticipantPanel.vue'

const STATE = {
  draft: { label: 'Draf', cls: 'bg-gray-100 text-gray-600' },
  open: { label: 'Berjalan', cls: 'bg-indigo-100 text-indigo-700' },
  closed: { label: 'Ditutup', cls: 'bg-green-100 text-green-700' },
}

const ProgressChip = defineComponent({
  props: { label: String, status: String },
  setup(props) {
    const tone = { done: 'bg-green-50 text-green-700 ring-green-200', pending: 'bg-white text-gray-600 ring-gray-200', processing: 'bg-indigo-50 text-indigo-700 ring-indigo-200', failed: 'bg-red-50 text-red-700 ring-red-200', none: 'bg-gray-50 text-gray-400 ring-gray-100' }
    const mark = { done: '✓ ', processing: '… ', failed: '! ' }
    return () => h('span', { class: `inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ${tone[props.status] || tone.none}` },
      (mark[props.status] || '') + props.label + (props.status === 'none' ? ' –' : ''))
  },
})

const route = useRoute()
const cycleId = Number(route.params.cycleId)
const loading = ref(true)
const error = ref('')
const busy = ref(false)
const cycle = ref(null)
const pillars = ref([])
const participants = ref([])
const selectedId = ref(null)
const konfirmasiTutup = ref(false)
const cari = ref('')
const hasilCari = ref([])
const flash = ref(null)
let cariTimer = null

const sebaran = computed(() => {
  const out = { 1: 0, 2: 0, 3: 0, 4: 0, none: 0 }
  for (const p of participants.value) out[p.overall?.level || 'none'] += 1
  return out
})

function toast(text, ok = true) {
  flash.value = { text, ok }
  setTimeout(() => { flash.value = null }, 2800)
}

function terapkan(detail) {
  cycle.value = detail.cycle
  pillars.value = detail.pillars
  participants.value = detail.participants
}

async function load() {
  loading.value = true
  try {
    terapkan(await competencyApi.cycleDetail(cycleId))
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

async function aksi(method, pesan) {
  busy.value = true
  try {
    terapkan(await competencyApi[method](cycleId))
    toast(pesan)
  } catch (e) {
    toast(e.message, false)
  } finally {
    busy.value = false
  }
}

function cariKaryawan() {
  clearTimeout(cariTimer)
  if (!cari.value.trim()) { hasilCari.value = []; return }
  cariTimer = setTimeout(async () => {
    try { hasilCari.value = await competencyApi.employees(cari.value.trim()) } catch { hasilCari.value = [] }
  }, 250)
}
const sudahPeserta = (employeeId) => participants.value.some((p) => p.employee.id === employeeId)
async function tambah(e) {
  busy.value = true
  try {
    terapkan(await competencyApi.addParticipants(cycleId, [e.id]))
    toast(`${e.name} ditambahkan.`)
    cari.value = ''
    hasilCari.value = []
  } catch (err) {
    toast(err.message, false)
  } finally {
    busy.value = false
  }
}

function pilih(row) { selectedId.value = row.id }
function perbaruiBaris(row) {
  const i = participants.value.findIndex((p) => p.id === row.id)
  if (i >= 0) participants.value.splice(i, 1, row)
}
function dihapus(detail) {
  selectedId.value = null
  terapkan(detail)
  toast('Peserta dihapus dari periode.')
}

function rataPilar(pillarId) {
  const vals = participants.value.map((p) => p.results[pillarId]?.final).filter((v) => v)
  return vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1).replace('.', ',') : '–'
}

onMounted(load)
</script>
