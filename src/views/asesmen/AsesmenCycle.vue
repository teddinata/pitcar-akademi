<!-- Atur satu periode Asesmen Terpadu: komponen, bobot, asesor, peserta, lead. -->
<template>
  <div class="ujian min-h-screen p-4 md:p-6">
    <AsesmenNav :title="cycle?.name || 'Periode'" subtitle="Atur komponen, peserta, lead, dan asesor. Setelah dimulai, peserta melihat tugasnya di Asesmen Saya." @help="tour.replay()">
      <template #actions>
        <router-link v-if="cycle" :to="`/dashboard/asesmen/rekap?periode=${cycle.id}`" class="u-btn !min-h-10"><ChartBarIcon class="w-5 h-5" />Rekap</router-link>
      </template>
    </AsesmenNav>

    <div v-if="loading" class="u-card h-64 animate-pulse"></div>
    <p v-else-if="error && !cycle" class="u-card p-5 font-bold text-[color:var(--merah)]">{{ error }}</p>

    <template v-else-if="cycle">
      <!-- Status + aksi -->
      <section class="u-card p-4 sm:p-5 mb-5 flex flex-wrap items-center gap-3" data-tour="asm-status">
        <span class="u-chip" :class="STATE[cycle.state].chip">{{ STATE[cycle.state].label }}</span>
        <p class="text-sm flex-1 min-w-[14rem]">{{ STATE[cycle.state].teks }}</p>
        <template v-if="cycle.state !== 'draft'">
          <button class="u-btn !min-h-10" @click="salinLink"><LinkIcon class="w-5 h-5" />{{ disalin ? 'Link disalin' : 'Salin link tes' }}</button>
        </template>
        <button v-if="cycle.state === 'draft'" class="u-btn u-btn-merah" :disabled="busy" data-tour="asm-mulai" @click="aksi('open')"><PlayIcon class="w-5 h-5" />Mulai periode</button>
        <template v-else-if="cycle.state === 'open'">
          <button v-if="!konfirmTutup" class="u-btn u-btn-hitam" :disabled="busy" @click="konfirmTutup = true"><LockClosedIcon class="w-5 h-5" />Tutup periode</button>
          <span v-else class="flex flex-wrap items-center gap-2 rounded-lg border-2 border-[color:var(--ink)] bg-[#fffbe0] p-2">
            <span class="text-sm font-bold">{{ belumSah }} peserta belum disahkan; jenjangnya tidak ditulis. Tutup sekarang?</span>
            <button class="u-btn u-btn-hitam !min-h-9" :disabled="busy" @click="aksi('close')">Ya, tutup</button>
            <button class="u-btn !min-h-9" @click="konfirmTutup = false">Batal</button>
          </span>
        </template>
        <button v-else class="u-btn" :disabled="busy" @click="aksi('reopen')">Buka lagi</button>
      </section>

      <div class="grid xl:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] gap-5 items-start">
        <!-- Pengaturan -->
        <form class="u-card p-4 sm:p-5 space-y-4" data-tour="asm-atur" @submit.prevent="simpan">
          <h2 class="u-display text-xl font-extrabold">Pengaturan</h2>
          <p class="rounded-lg border-2 border-[color:var(--ink)] bg-[#fffbe0] p-2.5 text-sm">
            Diisi dari <b>Paket {{ cycle.profile.name }}</b>. Perubahan di sini hanya untuk periode ini.
            <router-link :to="`/dashboard/asesmen/paket?paket=${cycle.profile.id}`" class="font-bold underline underline-offset-4">Ubah paket</router-link>
          </p>
          <label class="block"><span class="u-label">Nama periode</span><input v-model="form.name" class="u-input" /></label>
          <div class="grid grid-cols-2 gap-3">
            <label><span class="u-label">Mulai</span><input v-model="form.date_start" type="date" class="u-input" /></label>
            <label><span class="u-label">Selesai</span><input v-model="form.date_end" type="date" class="u-input" /></label>
          </div>

          <fieldset class="rounded-xl border-2 border-[color:var(--ink)] p-3">
            <legend class="px-1 text-sm font-extrabold">1 · Ujian lisan (rubrik lama + AI)</legend>
            <label class="flex items-center gap-2 font-bold"><input v-model="form.oral_enabled" type="checkbox" class="u-check" />Pakai ujian lisan</label>
            <div v-if="form.oral_enabled" class="mt-3">
              <span class="u-label">Bobot soal (harus 100%)</span>
              <div class="grid grid-cols-4 gap-2">
                <label v-for="n in 4" :key="n" class="text-center"><span class="text-xs font-extrabold">L{{ n }}</span>
                  <input v-model.number="form.oral_weights[n]" type="number" min="0" max="100" class="u-input !px-2 text-center" :disabled="lisanTerkunci" /></label>
              </div>
              <p class="mt-1 text-xs font-bold" :class="totalLisan === 100 ? 'text-[color:var(--hijau)]' : 'text-[color:var(--merah)]'">Total {{ totalLisan }}%{{ lisanTerkunci ? ' · terkunci, ujian sudah dikerjakan' : '' }}</p>
            </div>
          </fieldset>

          <fieldset class="rounded-xl border-2 border-[color:var(--ink)] p-3">
            <legend class="px-1 text-sm font-extrabold">2 · Studi kasus</legend>
            <p v-if="!kasusProfil.length" class="text-sm">Belum ada studi kasus untuk profil ini. Tambah di Studi Kasus.</p>
            <div class="space-y-1.5">
              <label v-for="c in kasusProfil" :key="c.id" class="flex items-start gap-2 text-sm">
                <input v-model="form.case_ids" type="checkbox" :value="c.id" class="u-check !w-5 !h-5" />
                <span><b>{{ c.name }}</b> <span class="text-[color:var(--ink-soft)]">· {{ c.question_count }} soal · {{ c.time_limit_minutes }} mnt</span></span>
              </label>
            </div>
            <CaseModePicker v-if="form.case_ids.length > 1" v-model:mode="form.case_mode" v-model:count="form.case_count" :total="form.case_ids.length" class="mt-3" />
          </fieldset>

          <fieldset class="rounded-xl border-2 border-[color:var(--ink)] p-3">
            <legend class="px-1 text-sm font-extrabold">3 · Penilaian lead</legend>
            <label class="flex items-center gap-2 font-bold"><input v-model="form.lead_enabled" type="checkbox" class="u-check" />Pakai penilaian lead</label>
            <p class="mt-1 text-xs text-[color:var(--ink-soft)]">Lead ditunjuk per peserta di tabel peserta (boleh lebih dari satu).</p>
          </fieldset>

          <fieldset class="rounded-xl border-2 border-[color:var(--ink)] p-3">
            <legend class="px-1 text-sm font-extrabold">Bobot jenjang akhir</legend>
            <div class="grid grid-cols-3 gap-2">
              <label v-for="k in BOBOT" :key="k.key" class="text-center"><span class="text-xs font-extrabold">{{ k.label }}</span>
                <input v-model.number="form.weights[k.key]" type="number" min="0" class="u-input !px-2 text-center" /></label>
            </div>
            <p class="mt-1 text-xs text-[color:var(--ink-soft)]">Bobot relatif; komponen yang tidak dipakai tidak dihitung.</p>
          </fieldset>

          <div>
            <span class="u-label">Asesor validator</span>
            <PeoplePicker v-model="form.validators" :search="(q) => competencyApi.users(q)" placeholder="Cari nama pengguna, mis. Roka" />
            <p class="mt-1 text-xs text-[color:var(--ink-soft)]">Asesor melihat Rekap periode ini, mendengar rekaman, memeriksa jawaban bertanda, dan mengesahkan.</p>
          </div>

          <p v-if="error" class="rounded-lg border-2 border-[color:var(--merah)] bg-[color:var(--merah-muda)] p-2 text-sm font-bold text-[color:var(--merah-tua)]" role="alert">{{ error }}</p>
          <button class="u-btn u-btn-hitam w-full" :disabled="busy || (form.oral_enabled && totalLisan !== 100)">{{ busy ? 'Menyimpan…' : 'Simpan pengaturan' }}</button>
        </form>

        <!-- Peserta -->
        <section class="u-card p-4 sm:p-5 min-w-0" data-tour="asm-peserta">
          <div class="flex flex-wrap items-baseline justify-between gap-2">
            <h2 class="u-display text-xl font-extrabold">Peserta <span class="text-[color:var(--ink-soft)]">{{ participants.length }}</span></h2>
            <button v-if="form.lead_enabled && participants.length" class="text-sm font-bold underline underline-offset-4" :disabled="busy" @click="pakaiAtasan">Isi lead kosong dengan atasan langsung</button>
          </div>
          <div v-if="cycle.state !== 'closed'" class="mt-3 grid sm:grid-cols-[1fr_auto] gap-2 items-end">
            <div><span class="u-label">Tambah peserta</span><PeoplePicker v-model="tambah" :search="(q) => competencyApi.employees(q)" placeholder="Cari karyawan…" /></div>
            <button class="u-btn u-btn-merah" :disabled="!tambah.length || busy" @click="tambahPeserta"><UserPlusIcon class="w-5 h-5" />Tambah {{ tambah.length || '' }}</button>
          </div>

          <!-- Atur lead massal -->
          <div v-if="form.lead_enabled && pilih.length" class="mt-4 rounded-xl border-2 border-[color:var(--ink)] bg-[#fffbe0] p-3" data-tour="asm-lead">
            <p class="font-extrabold">Atur lead untuk {{ pilih.length }} peserta terpilih</p>
            <PeoplePicker v-model="leadBaru" class="mt-2" :search="(q) => competencyApi.employees(q)" placeholder="Cari lead (kabeng, foreman, …)" />
            <div class="mt-2 flex flex-wrap gap-2">
              <button class="u-btn !min-h-9" :disabled="!leadBaru.length || busy" @click="aturLead('add')">Tambahkan</button>
              <button class="u-btn u-btn-hitam !min-h-9" :disabled="busy" @click="aturLead('replace')">Ganti semua lead</button>
              <button class="u-btn !min-h-9" :disabled="!leadBaru.length || busy" @click="aturLead('remove')">Lepas</button>
            </div>
          </div>

          <div class="mt-4 overflow-x-auto rounded-xl border-2 border-[color:var(--ink)]">
            <table class="u-table min-w-[44rem]">
              <thead><tr>
                <th class="w-8"><input type="checkbox" class="u-check !w-5 !h-5 !border-white" :checked="pilih.length && pilih.length === participants.length" aria-label="Pilih semua" @change="pilihSemua($event.target.checked)" /></th>
                <th>Peserta</th><th v-if="form.lead_enabled">Lead</th><th v-if="cycle.cases.length">Studi kasus</th><th v-if="form.oral_enabled">Lisan</th><th>Status</th><th></th>
              </tr></thead>
              <tbody>
                <tr v-if="!participants.length"><td colspan="7" class="text-center text-sm py-6">Belum ada peserta.</td></tr>
                <tr v-for="p in participants" :key="p.id">
                  <td><input v-model="pilih" type="checkbox" :value="p.id" class="u-check !w-5 !h-5" :aria-label="`Pilih ${p.employee.name}`" /></td>
                  <td><p class="font-bold leading-tight">{{ p.employee.name }}</p><p class="text-xs text-[color:var(--ink-soft)]">{{ p.employee.job }}</p></td>
                  <td v-if="form.lead_enabled">
                    <div class="flex flex-wrap gap-1">
                      <span v-for="r in p.ratings" :key="r.id" class="u-chip !text-[11px]" :class="r.state === 'submitted' ? 'u-chip-hijau' : ''">{{ r.name }}{{ r.state === 'submitted' ? ' ✓' : '' }}</span>
                      <span v-if="!p.leads.length" class="u-chip u-chip-merah !text-[11px]">Belum ada lead</span>
                    </div>
                  </td>
                  <td v-if="cycle.cases.length" class="text-sm">
                    <p v-for="a in p.cases" :key="a.attempt_id" class="leading-tight"><b>{{ a.case }}</b> · {{ CASE_STATE(a) }}</p>
                  </td>
                  <td v-if="form.oral_enabled" class="text-sm whitespace-nowrap">{{ p.oral ? ORAL_STATE(p.oral) : '–' }}</td>
                  <td><span class="u-chip !text-[11px] whitespace-nowrap" :class="STATUS[p.summary.status].chip">{{ STATUS[p.summary.status].label }}</span></td>
                  <td class="text-right whitespace-nowrap">
                    <router-link :to="`/dashboard/asesmen/rekap/${p.id}`" class="u-btn !min-h-9 !px-2.5" title="Lihat hasil"><ChevronRightIcon class="w-4 h-4" /></router-link>
                    <button v-if="cycle.state !== 'closed'" class="u-btn !min-h-9 !px-2.5 ml-1" title="Hapus peserta" :disabled="busy" @click="hapus(p)"><TrashIcon class="w-4 h-4" /></button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </template>
  </div>
</template>

<script setup>
import '@fontsource-variable/bricolage-grotesque'
import '../../styles/exam.css'
import '../../styles/asesmen.css'
import { computed, nextTick, onMounted, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import {
  ChartBarIcon, ChevronRightIcon, LinkIcon, LockClosedIcon, PlayIcon, TrashIcon, UserPlusIcon,
} from '@heroicons/vue/24/outline'
import AsesmenNav from '../../components/asesmen/AsesmenNav.vue'
import CaseModePicker from '../../components/asesmen/CaseModePicker.vue'
import PeoplePicker from '../../components/asesmen/PeoplePicker.vue'
import { competencyApi } from '../../services/competencyApi'
import { useTour } from '../../composables/useTour'
import { STATUS, ORAL_STATE, CASE_STATE } from '../../utils/asesmen'

const STATE = {
  draft: { label: 'Draf', chip: '', teks: 'Belum terlihat peserta. Atur semuanya dulu, lalu tekan Mulai periode.' },
  open: { label: 'Berjalan', chip: 'u-chip-kuning', teks: 'Peserta dan lead sedang mengisi. Bagikan link tes lewat WA. Hasil masuk ke Rekap begitu dinilai AI.' },
  closed: { label: 'Ditutup', chip: 'u-chip-hijau', teks: 'Periode selesai. Jenjang peserta yang sudah disahkan tercatat di data karyawan.' },
}
const BOBOT = [{ key: 'oral', label: 'Lisan' }, { key: 'case', label: 'Kasus' }, { key: 'lead', label: 'Lead' }]

const route = useRoute()
const cycleId = Number(route.params.id)
const loading = ref(true)
const busy = ref(false)
const error = ref('')
const cycle = ref(null)
const participants = ref([])
const cases = ref([])
const tambah = ref([])
const pilih = ref([])
const leadBaru = ref([])
const disalin = ref(false)
const konfirmTutup = ref(false)
const form = reactive({
  name: '', date_start: '', date_end: '', oral_enabled: true, lead_enabled: true, case_ids: [], case_mode: 'random', case_count: 1,
  oral_weights: { 1: 20, 2: 20, 3: 30, 4: 30 }, weights: { oral: 50, case: 30, lead: 20 }, validators: [],
})

const kasusProfil = computed(() => cases.value.filter((c) => c.profile_id === cycle.value?.profile.id && (c.active || form.case_ids.includes(c.id))))
const totalLisan = computed(() => [1, 2, 3, 4].reduce((s, n) => s + (Number(form.oral_weights[n]) || 0), 0))
const lisanTerkunci = computed(() => participants.value.some((p) => p.oral && p.oral.state !== 'draft'))
const belumSah = computed(() => participants.value.filter((p) => !p.validated).length)

function terima(detail) {
  cycle.value = detail.cycle
  participants.value = detail.participants
  pilih.value = pilih.value.filter((id) => detail.participants.some((p) => p.id === id))
  const c = detail.cycle
  Object.assign(form, {
    name: c.name, date_start: c.date_start || '', date_end: c.date_end || '', oral_enabled: c.oral_enabled,
    lead_enabled: c.lead_enabled, case_ids: c.cases.map((x) => x.id), case_mode: c.case_mode, case_count: c.case_count || 1,
    oral_weights: { ...c.oral_weights }, weights: { ...c.weights }, validators: c.validators.map((v) => ({ ...v })),
  })
}

async function run(fn) {
  busy.value = true
  error.value = ''
  try { return await fn() } catch (e) { error.value = e.message; return null } finally { busy.value = false }
}

async function load() {
  loading.value = true
  try {
    const [detail, config] = await Promise.all([competencyApi.terpaduCycle(cycleId), competencyApi.config()])
    cases.value = config.cases
    terima(detail)
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
  nextTick(() => tour.autoStart())
}

async function simpan() {
  const ok = await run(() => competencyApi.saveTerpaduCycle(cycleId, {
    name: form.name, profile_id: cycle.value.profile.id, date_start: form.date_start || null, date_end: form.date_end || null,
    oral_enabled: form.oral_enabled, lead_enabled: form.lead_enabled, case_ids: form.case_ids, case_mode: form.case_mode, case_count: form.case_count,
    oral_weights: form.oral_weights, weights: form.weights, validator_ids: form.validators.map((v) => v.id),
  }))
  if (ok) terima(await competencyApi.terpaduCycle(cycleId))
}

async function aksi(kind) {
  const fn = { open: competencyApi.openCycle, close: competencyApi.closeCycle, reopen: competencyApi.reopenCycle }[kind]
  const ok = await run(() => fn(cycleId))
  konfirmTutup.value = false
  if (ok) terima(await competencyApi.terpaduCycle(cycleId))
}

async function tambahPeserta() {
  const ok = await run(() => competencyApi.addParticipants(cycleId, tambah.value.map((p) => p.id)))
  if (ok) { tambah.value = []; terima(await competencyApi.terpaduCycle(cycleId)) }
}
async function hapus(p) {
  const ok = await run(() => competencyApi.removeParticipant(p.id))
  if (ok) terima(await competencyApi.terpaduCycle(cycleId))
}
async function aturLead(mode) {
  const detail = await run(() => competencyApi.setLeads(pilih.value, leadBaru.value.map((p) => p.id), mode))
  if (detail) { terima(detail); leadBaru.value = [] }
}
async function pakaiAtasan() {
  const detail = await run(() => competencyApi.useManagersAsLeads(cycleId))
  if (detail) terima(detail)
}
function pilihSemua(on) { pilih.value = on ? participants.value.map((p) => p.id) : [] }
async function salinLink() {
  try {
    await navigator.clipboard.writeText(`${window.location.origin}/dashboard/lms/competency/join/${cycle.value.access_token}`)
    disalin.value = true
    setTimeout(() => { disalin.value = false }, 2500)
  } catch { error.value = 'Browser menolak menyalin; salin manual dari alamat ini.' }
}

const tour = useTour('asesmen-periode', () => [
  { element: '[data-tour="asm-atur"]', title: 'Pilih komponen', text: 'Nyalakan ujian lisan, pilih studi kasus (acak satu per peserta atau semua), dan penilaian lead. Bobot bisa diubah.', side: 'right' },
  { element: '[data-tour="asm-peserta"]', title: 'Tambah peserta', text: 'Cari karyawan lalu Tambah. Centang beberapa peserta untuk mengatur lead sekaligus.', side: 'left' },
  { element: '[data-tour="asm-lead"]', title: 'Lead bisa lebih dari satu', text: 'Tambahkan, ganti, atau lepas lead untuk peserta terpilih. Hanya admin yang menunjuk lead.', side: 'top' },
  { element: '[data-tour="asm-mulai"]', title: 'Mulai periode', text: 'Setelah dimulai, tugas muncul di Asesmen Saya untuk peserta dan lead. Bagikan link tes lewat WA.', side: 'bottom' },
  { element: '[data-tour="asm-status"]', title: 'Tutup periode', text: 'Setelah asesor mengesahkan di Rekap, tutup periode supaya jenjang tercatat di PitClock.', side: 'bottom' },
])

onMounted(load)
</script>
