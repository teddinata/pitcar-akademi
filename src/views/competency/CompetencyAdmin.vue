<!-- Admin Peta Kompetensi: periode asesmen, rubrik pilar L1-L4, studi kasus,
     dan pernyataan feedback tim (360). -->
<template>
  <div class="min-h-screen clay-surface p-4 md:p-6">
    <div class="mb-5">
      <h1 class="text-xl md:text-2xl font-bold text-gray-900">Peta Kompetensi</h1>
      <p class="text-sm text-gray-600 mt-0.5 max-w-3xl">
        Petakan level karyawan L1–L4 per peran (kabeng, mekanik, …) dari studi kasus yang dinilai AI (40%),
        penilaian atasan (30%), dan feedback tim (30%). Penilaian diri ditampilkan sebagai pembanding.
      </p>
    </div>

    <div class="flex gap-2 mb-5 overflow-x-auto pb-1">
      <button
        v-for="t in TABS" :key="t.key" @click="tab = t.key"
        class="px-4 py-2 text-sm whitespace-nowrap clay-pill" :class="tab === t.key ? 'clay-pill-active' : ''"
      >{{ t.label }}</button>
    </div>

    <!-- Profil peran untuk tab rubrik, studi kasus, pernyataan -->
    <div v-if="tab !== 'cycles' && config.profiles.length" class="mb-4 flex flex-wrap items-center gap-2">
      <span class="text-xs font-semibold text-gray-500">Profil peran:</span>
      <button
        v-for="pr in config.profiles" :key="pr.id" @click="profileId = pr.id"
        class="px-3 py-1.5 rounded-lg text-sm font-semibold ring-1 transition-colors"
        :class="profileId === pr.id ? 'bg-gray-900 text-white ring-gray-900' : 'bg-white text-gray-700 ring-gray-200 hover:bg-gray-50'"
      >{{ pr.name }}</button>
    </div>

    <div v-if="loading" class="h-48 rounded-2xl bg-white/70 animate-pulse"></div>
    <div v-else-if="error" class="clay-card p-6 text-center">
      <p class="text-red-600 font-medium">{{ error }}</p>
      <button @click="load" class="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium">Coba lagi</button>
    </div>

    <template v-else>
      <!-- ── PERIODE ── -->
      <section v-if="tab === 'cycles'" class="space-y-4">
        <div class="clay-card p-4">
          <h2 class="text-sm font-bold text-gray-800">Periode asesmen baru</h2>
          <div class="mt-3 grid sm:grid-cols-2 lg:grid-cols-[2fr_1.3fr_1fr_1fr_2fr_auto] gap-3 items-end">
            <label class="block"><span class="text-xs font-semibold text-gray-600">Nama</span>
              <input v-model="cycleForm.name" :class="FIELD" placeholder="Mis. Mapping mekanik Nov 2026" /></label>
            <label class="block"><span class="text-xs font-semibold text-gray-600">Profil peran</span>
              <select v-model="cycleForm.profile_id" :class="FIELD" @change="cycleForm.case_id = null">
                <option v-for="pr in config.profiles" :key="pr.id" :value="pr.id">{{ pr.name }}</option>
              </select></label>
            <label class="block"><span class="text-xs font-semibold text-gray-600">Mulai</span>
              <input v-model="cycleForm.date_start" type="date" :class="FIELD" /></label>
            <label class="block"><span class="text-xs font-semibold text-gray-600">Selesai</span>
              <input v-model="cycleForm.date_end" type="date" :class="FIELD" /></label>
            <label class="block"><span class="text-xs font-semibold text-gray-600">Studi kasus</span>
              <select v-model="cycleForm.case_id" :class="FIELD">
                <option :value="null">Tanpa studi kasus</option>
                <option v-for="c in activeCases.filter((x) => x.profile_id === cycleForm.profile_id)" :key="c.id" :value="c.id">{{ c.name }}</option>
              </select></label>
            <button
              class="h-10 px-4 rounded-lg bg-gray-900 text-white text-sm font-bold disabled:bg-gray-300"
              :disabled="!cycleForm.name.trim() || !cycleForm.profile_id || busy" @click="buatPeriode"
            >Buat periode</button>
          </div>
        </div>

        <div class="clay-card overflow-hidden">
          <table class="w-full text-sm">
            <thead class="bg-gray-50/80 text-gray-500 text-xs uppercase">
              <tr>
                <th class="px-4 py-3 text-left font-medium">Periode</th>
                <th class="px-3 py-3 text-left font-medium">Profil</th>
                <th class="px-3 py-3 text-left font-medium">Status</th>
                <th class="px-3 py-3 text-left font-medium">Studi kasus</th>
                <th class="px-3 py-3 text-left font-medium">Peserta lengkap</th>
                <th class="px-3 py-3"></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="c in cycles" :key="c.id" class="hover:bg-white/60 cursor-pointer" @click="$router.push(`/dashboard/lms/competency-map/${c.id}`)">
                <td class="px-4 py-3">
                  <p class="font-semibold text-gray-900">{{ c.name }}</p>
                  <p class="text-xs text-gray-500">{{ c.date_start ? fmtDateTime(c.date_start) : '-' }} – {{ c.date_end ? fmtDateTime(c.date_end) : '…' }}</p>
                </td>
                <td class="px-3 py-3 text-gray-700">{{ c.profile.name }}</td>
                <td class="px-3 py-3"><span class="text-[11px] font-bold px-2 py-0.5 rounded-full" :class="STATE[c.state].cls">{{ STATE[c.state].label }}</span></td>
                <td class="px-3 py-3 text-gray-700">{{ c.case?.name || '-' }}</td>
                <td class="px-3 py-3 tabular-nums text-gray-700">{{ c.complete_count }} / {{ c.participant_count }}</td>
                <td class="px-3 py-3 text-right"><ChevronRightIcon class="w-4 h-4 text-gray-400 inline" /></td>
              </tr>
            </tbody>
          </table>
          <p v-if="!cycles.length" class="text-sm text-gray-500 text-center py-8">Belum ada periode. Buat periode pertama di atas, lalu tambahkan karyawan sebagai peserta.</p>
        </div>
      </section>

      <!-- ── RUBRIK ── -->
      <section v-else-if="tab === 'pillars'" class="space-y-4 max-w-5xl">
        <div v-if="activeProfile" class="clay-card p-4 sm:p-5">
          <h2 class="text-sm font-bold text-gray-900">Nama jenjang {{ activeProfile.name }}</h2>
          <p class="text-xs text-gray-500 mt-0.5">Tampil di peta dan hasil peserta, mis. L1 Helper / Junior Mekanik sampai L4 Foreman. Jenjang = rata-rata level pilar, paling tinggi satu level di atas pilar terlemah.</p>
          <div class="mt-3 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <label v-for="n in ['1', '2', '3', '4']" :key="n" class="block">
              <span class="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600"><span class="px-1.5 rounded ring-1" :class="LEVEL_STYLE[n].cell">L{{ n }}</span></span>
              <input v-model="activeProfile.level_names[n]" :class="FIELD" :placeholder="LEVEL_STYLE[n].label" />
            </label>
          </div>
          <div class="mt-3 flex justify-end">
            <button class="px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-bold disabled:bg-gray-300" :disabled="busy" @click="simpanJenjang">Simpan nama jenjang</button>
          </div>
        </div>
        <div v-for="p in profilePillars" :key="p.id" class="clay-card p-4 sm:p-5">
          <div class="grid sm:grid-cols-[1fr_2fr] gap-3">
            <label class="block"><span class="text-xs font-semibold text-gray-600">Nama pilar</span>
              <input v-model="p.name" :class="FIELD" /></label>
            <label class="block"><span class="text-xs font-semibold text-gray-600">Keterangan</span>
              <input v-model="p.description" :class="FIELD" /></label>
          </div>
          <div class="mt-3 grid md:grid-cols-2 gap-3">
            <label v-for="n in ['1', '2', '3', '4']" :key="n" class="block">
              <span class="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600">
                <span class="px-1.5 rounded ring-1" :class="LEVEL_STYLE[n].cell">L{{ n }}</span>{{ levelName(n, activeProfile?.level_names) }}
              </span>
              <textarea v-model="p.rubric[n]" rows="3" :class="FIELD" class="!h-auto py-2"></textarea>
            </label>
          </div>
          <div class="mt-3">
            <span class="text-xs font-semibold text-gray-600">Kursus rekomendasi bila levelnya rendah</span>
            <div class="mt-1 flex flex-wrap gap-1.5">
              <span v-for="c in p.courses" :key="c.id" class="inline-flex items-center gap-1 rounded-full bg-indigo-50 text-indigo-800 text-xs font-semibold pl-2.5 pr-1 py-1">
                {{ c.name }}
                <button class="rounded-full p-0.5 hover:bg-indigo-100" :aria-label="`Hapus ${c.name}`" @click="p.courses = p.courses.filter((x) => x.id !== c.id)"><XMarkIcon class="w-3.5 h-3.5" /></button>
              </span>
              <select class="text-xs rounded-full border border-dashed border-gray-300 bg-white px-2 py-1" @change="tambahKursus(p, $event)">
                <option value="">+ Tambah kursus</option>
                <option v-for="c in courses.filter((x) => !p.courses.some((y) => y.id === x.id))" :key="c.id" :value="c.id">{{ c.name }}</option>
              </select>
            </div>
          </div>
          <div class="mt-4 flex justify-end">
            <button class="px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-bold disabled:bg-gray-300" :disabled="busy" @click="simpanPilar(p)">Simpan {{ p.name }}</button>
          </div>
        </div>
      </section>

      <!-- ── STUDI KASUS ── -->
      <section v-else-if="tab === 'cases'" class="grid lg:grid-cols-[280px_1fr] gap-4 items-start">
        <div class="clay-card p-2">
          <button class="w-full text-left px-3 py-2 rounded-lg text-sm font-bold text-[#b70000] hover:bg-white" @click="editCase(null)">+ Studi kasus baru</button>
          <button
            v-for="c in profileCases" :key="c.id" @click="editCase(c)"
            class="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-white"
            :class="caseForm.id === c.id ? 'bg-white font-semibold text-gray-900' : 'text-gray-700'"
          >{{ c.name }}<span v-if="!c.active" class="ml-1 text-xs text-gray-400">(arsip)</span></button>
        </div>
        <div class="clay-card p-4 sm:p-5 space-y-3">
          <label class="block"><span class="text-xs font-semibold text-gray-600">Judul</span>
            <input v-model="caseForm.name" :class="FIELD" /></label>
          <label class="block"><span class="text-xs font-semibold text-gray-600">Skenario (pakai angka yang realistis)</span>
            <textarea v-model="caseForm.scenario" rows="7" :class="FIELD" class="!h-auto py-2"></textarea></label>
          <div>
            <span class="text-xs font-semibold text-gray-600">Pertanyaan</span>
            <div v-for="(q, i) in caseForm.questions" :key="i" class="mt-1.5 flex gap-2">
              <span class="pt-2 text-sm text-gray-400 w-5">{{ i + 1 }}.</span>
              <textarea v-model="caseForm.questions[i]" rows="2" :class="FIELD" class="!h-auto py-2 flex-1"></textarea>
              <button class="self-start p-2 text-gray-400 hover:text-red-700" :aria-label="`Hapus pertanyaan ${i + 1}`" @click="caseForm.questions.splice(i, 1)"><XMarkIcon class="w-4 h-4" /></button>
            </div>
            <button class="mt-2 text-sm font-semibold text-blue-700" @click="caseForm.questions.push('')">+ Tambah pertanyaan</button>
          </div>
          <div class="flex flex-wrap gap-x-5 gap-y-2 items-center">
            <span class="text-xs font-semibold text-gray-600">Pilar dinilai:</span>
            <label v-for="p in profilePillars" :key="p.id" class="flex items-center gap-1.5 text-sm">
              <input v-model="caseForm.pillar_ids" type="checkbox" :value="p.id" class="rounded border-gray-300" />{{ p.name }}
            </label>
          </div>
          <label class="block w-40"><span class="text-xs font-semibold text-gray-600">Saran waktu (menit)</span>
            <input v-model.number="caseForm.time_limit_minutes" type="number" min="5" :class="FIELD" /></label>
          <div class="flex flex-wrap justify-between gap-2 pt-2">
            <button v-if="caseForm.id" class="px-3 py-2 rounded-lg text-sm font-semibold text-gray-600 hover:bg-white" :disabled="busy" @click="arsipCase">
              {{ caseForm.active ? 'Arsipkan' : 'Aktifkan lagi' }}
            </button>
            <span v-else></span>
            <button class="px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-bold disabled:bg-gray-300" :disabled="busy" @click="simpanCase">Simpan studi kasus</button>
          </div>
        </div>
      </section>

      <!-- ── PERNYATAAN TIM ── -->
      <section v-else-if="tab === 'questions'" class="max-w-4xl">
        <div class="clay-card p-4 sm:p-5">
          <p class="text-sm text-gray-600">Rekan kerja (mekanik, SA, anggota tim) menjawab tiap pernyataan dengan skala 1–5. Rata-rata per pilar diubah ke L1–L4 dan baru dihitung bila penilai yang mengisi mencapai minimal periode (bawaan 3), supaya tetap anonim.</p>
          <div v-for="(q, i) in profileQuestions" :key="q.id || `baru-${i}`" class="mt-3 flex flex-wrap sm:flex-nowrap gap-2">
            <select v-model="q.pillar_id" :class="FIELD" class="sm:!w-48">
              <option v-for="p in profilePillars" :key="p.id" :value="p.id">{{ p.name }}</option>
            </select>
            <input v-model="q.text" :class="FIELD" class="flex-1" placeholder="Mis. Hasil kerjanya jarang perlu diulang QC." />
            <button class="p-2 text-gray-400 hover:text-red-700" :aria-label="`Hapus pernyataan ${i + 1}`" @click="config.questions.splice(config.questions.indexOf(q), 1)"><XMarkIcon class="w-4 h-4" /></button>
          </div>
          <div class="mt-4 flex justify-between">
            <button class="text-sm font-semibold text-blue-700" @click="config.questions.push({ id: null, profile_id: profileId, pillar_id: profilePillars[0]?.id, text: '' })">+ Tambah pernyataan</button>
            <button class="px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-bold disabled:bg-gray-300" :disabled="busy" @click="simpanPernyataan">Simpan pernyataan</button>
          </div>
        </div>
      </section>
    </template>

    <div v-if="flash" class="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-xl px-4 py-2.5 text-sm font-semibold shadow-lg" :class="flash.ok ? 'bg-gray-900 text-white' : 'bg-red-700 text-white'" role="status">{{ flash.text }}</div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ChevronRightIcon, XMarkIcon } from '@heroicons/vue/24/outline'
import { competencyApi } from '../../services/competencyApi'
import { LEVEL_STYLE, fmtDateTime, levelName } from '../../utils/competency'

const FIELD = 'mt-1 w-full h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300'
const TABS = [
  { key: 'cycles', label: 'Periode' },
  { key: 'pillars', label: 'Rubrik pilar' },
  { key: 'cases', label: 'Studi kasus' },
  { key: 'questions', label: 'Pernyataan tim' },
]
const STATE = {
  draft: { label: 'Draf', cls: 'bg-gray-100 text-gray-600' },
  open: { label: 'Berjalan', cls: 'bg-indigo-100 text-indigo-700' },
  closed: { label: 'Ditutup', cls: 'bg-green-100 text-green-700' },
}

const router = useRouter()
const tab = ref('cycles')
const loading = ref(true)
const error = ref('')
const busy = ref(false)
const cycles = ref([])
const config = reactive({ profiles: [], pillars: [], questions: [], cases: [] })
const profileId = ref(null)
const courses = ref([])
const flash = ref(null)
const cycleForm = reactive({ name: '', profile_id: null, date_start: '', date_end: '', case_id: null })
const caseForm = reactive({ id: null, profile_id: null, name: '', scenario: '', questions: [''], pillar_ids: [], time_limit_minutes: 30, active: true })

const activeCases = computed(() => config.cases.filter((c) => c.active))
const activeProfile = computed(() => config.profiles.find((pr) => pr.id === profileId.value) || null)
const profilePillars = computed(() => config.pillars.filter((p) => p.profile_id === profileId.value))
const profileCases = computed(() => config.cases.filter((c) => c.profile_id === profileId.value))
const profileQuestions = computed(() => config.questions.filter((q) => q.profile_id === profileId.value))
watch(profileId, () => {
  if (caseForm.profile_id !== profileId.value) editCase(profileCases.value[0] || null)
})

function toast(text, ok = true) {
  flash.value = { text, ok }
  setTimeout(() => { flash.value = null }, 2600)
}

async function run(fn, pesan) {
  busy.value = true
  try {
    const hasil = await fn()
    if (pesan) toast(pesan)
    return hasil
  } catch (e) {
    toast(e.message, false)
    return null
  } finally {
    busy.value = false
  }
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    const [daftar, konfigurasi, kursus] = await Promise.all([competencyApi.cycles(), competencyApi.config(), competencyApi.courses()])
    cycles.value = daftar
    Object.assign(config, konfigurasi)
    courses.value = kursus
    profileId.value = profileId.value || config.profiles[0]?.id || null
    cycleForm.profile_id = cycleForm.profile_id || profileId.value
    if (!caseForm.id) editCase(profileCases.value[0] || null)
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

async function buatPeriode() {
  const hasil = await run(() => competencyApi.saveCycle(null, { ...cycleForm }), 'Periode dibuat.')
  if (hasil) router.push(`/dashboard/lms/competency-map/${hasil.id}`)
}

async function simpanJenjang() {
  const pr = activeProfile.value
  const names = pr.level_names
  const hasil = await run(() => competencyApi.saveProfile(pr.id, {
    level_1_name: names['1'], level_2_name: names['2'], level_3_name: names['3'], level_4_name: names['4'],
  }), `Nama jenjang ${pr.name} disimpan.`)
  if (hasil) Object.assign(pr, hasil)
}

function tambahKursus(p, event) {
  const course = courses.value.find((c) => c.id === Number(event.target.value))
  if (course) p.courses.push(course)
  event.target.value = ''
}
async function simpanPilar(p) {
  const hasil = await run(() => competencyApi.savePillar(p.id, {
    name: p.name, description: p.description,
    level_1: p.rubric['1'], level_2: p.rubric['2'], level_3: p.rubric['3'], level_4: p.rubric['4'],
    course_ids: p.courses.map((c) => c.id),
  }), `Rubrik ${p.name} disimpan.`)
  if (hasil) Object.assign(p, hasil)
}

function editCase(c) {
  Object.assign(caseForm, c
    ? { id: c.id, profile_id: c.profile_id, name: c.name, scenario: c.scenario, questions: [...c.questions], pillar_ids: [...c.pillar_ids], time_limit_minutes: c.time_limit_minutes, active: c.active }
    : { id: null, profile_id: profileId.value, name: '', scenario: '', questions: [''], pillar_ids: profilePillars.value.map((p) => p.id), time_limit_minutes: 30, active: true })
}
async function simpanCase() {
  const hasil = await run(() => competencyApi.saveCase(caseForm.id, { ...caseForm }), 'Studi kasus disimpan.')
  if (!hasil) return
  const i = config.cases.findIndex((c) => c.id === hasil.id)
  if (i >= 0) config.cases.splice(i, 1, hasil)
  else config.cases.unshift(hasil)
  editCase(hasil)
}
async function arsipCase() {
  const hasil = await run(() => competencyApi.archiveCase(caseForm.id, !caseForm.active), caseForm.active ? 'Studi kasus diarsipkan.' : 'Studi kasus aktif lagi.')
  if (!hasil) return
  config.cases.splice(config.cases.findIndex((c) => c.id === hasil.id), 1, hasil)
  editCase(hasil)
}

async function simpanPernyataan() {
  const hasil = await run(() => competencyApi.saveQuestions(profileId.value, profileQuestions.value), 'Pernyataan disimpan.')
  if (hasil) config.questions = hasil
}

onMounted(load)
</script>
