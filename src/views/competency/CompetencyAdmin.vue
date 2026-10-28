<!-- Admin Peta Kompetensi: periode asesmen, rubrik pilar L1-L4, studi kasus,
     dan pernyataan feedback tim (360). -->
<template>
  <div class="min-h-screen clay-surface p-4 md:p-6">
    <div class="mb-5 flex flex-wrap items-start justify-between gap-3">
      <div>
      <h1 class="text-xl md:text-2xl font-bold text-gray-900">Peta Kompetensi</h1>
      <p class="text-sm text-gray-600 mt-0.5 max-w-3xl">
        Petakan level karyawan L1–L4 per peran (kabeng, mekanik, …) dari studi kasus yang dinilai AI (40%),
        penilaian atasan (30%), dan feedback tim (30%). Penilaian diri ditampilkan sebagai pembanding.
      </p>
      </div>
      <button
        data-tour="admin-help"
        class="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-gray-700 bg-white/80 border border-gray-200 rounded-lg hover:bg-white"
        @click="tab === 'cases' ? tourKasus.replay() : tourKelola.replay()"
      ><QuestionMarkCircleIcon class="w-4 h-4" />Cara pakai</button>
    </div>

    <div class="flex gap-2 mb-5 overflow-x-auto pb-1" data-tour="admin-tabs">
      <button
        v-for="t in TABS" :key="t.key" @click="tab = t.key"
        class="px-4 py-2 text-sm whitespace-nowrap clay-pill" :class="tab === t.key ? 'clay-pill-active' : ''"
      >{{ t.label }}</button>
    </div>

    <!-- Profil peran untuk tab rubrik, studi kasus, pernyataan -->
    <div v-if="tab !== 'cycles' && config.profiles.length" class="mb-4 flex flex-wrap items-center gap-2" data-tour="admin-profiles">
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
        <div class="clay-card p-4" data-tour="admin-new-cycle">
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

        <div class="clay-card overflow-hidden" data-tour="admin-cycle-list">
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
      <section v-else-if="tab === 'cases'" class="space-y-4">
        <!-- Impor/ekspor Excel -->
        <div class="clay-card p-3 flex flex-wrap items-center gap-2" data-tour="admin-excel">
          <TableCellsIcon class="w-5 h-5 text-emerald-700 ml-1" />
          <p class="text-sm text-gray-700 mr-auto">Susun soal di Excel lalu impor, atau ekspor soal {{ activeProfile?.name }} untuk diedit.</p>
          <button class="px-3 py-2 rounded-lg text-sm font-semibold text-gray-700 bg-white ring-1 ring-gray-200 hover:bg-gray-50" :disabled="excelBusy" @click="unduhTemplate">Unduh template</button>
          <button class="px-3 py-2 rounded-lg text-sm font-semibold text-gray-700 bg-white ring-1 ring-gray-200 hover:bg-gray-50 disabled:opacity-50" :disabled="excelBusy || !profileCases.length" @click="eksporKasus">Ekspor Excel</button>
          <button class="px-3 py-2 rounded-lg text-sm font-bold text-white bg-emerald-700 hover:bg-emerald-800 disabled:bg-gray-300" :disabled="excelBusy" @click="fileInput.click()">{{ excelBusy ? 'Membaca…' : 'Impor Excel' }}</button>
          <input ref="fileInput" type="file" accept=".xlsx,.xls" class="hidden" @change="pilihFile" />
        </div>

        <!-- Pratinjau impor: dicek server dulu, baru disimpan -->
        <div v-if="impor" class="clay-card p-4 sm:p-5" role="region" aria-label="Pratinjau impor">
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 class="text-sm font-bold text-gray-900">Pratinjau impor: {{ impor.file }}</h2>
              <p class="text-xs text-gray-500 mt-0.5">Belum ada yang disimpan. Periksa daftar di bawah, lalu simpan.</p>
            </div>
            <button class="p-1.5 rounded-lg text-gray-400 hover:bg-white hover:text-gray-700" aria-label="Tutup pratinjau" @click="impor = null"><XMarkIcon class="w-5 h-5" /></button>
          </div>
          <ul v-if="impor.problems.length || impor.result?.errors.length" class="mt-3 space-y-1 rounded-lg bg-red-50 p-3 text-sm text-red-800" role="alert">
            <li v-for="(m, i) in impor.problems" :key="`p${i}`">{{ m }}</li>
            <li v-for="(e, i) in impor.result?.errors || []" :key="`e${i}`"><b>{{ e.case }}</b>: {{ e.message }}</li>
          </ul>
          <table v-if="impor.result?.cases.length" class="mt-3 w-full text-sm">
            <thead class="text-xs text-gray-500"><tr>
              <th class="text-left font-medium py-1.5">Kode</th><th class="text-left font-medium py-1.5">Judul</th>
              <th class="text-left font-medium py-1.5 hidden sm:table-cell">Profil</th><th class="text-left font-medium py-1.5">Soal</th><th class="text-left font-medium py-1.5">Aksi</th>
            </tr></thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="c in impor.result.cases" :key="c.code">
                <td class="py-2 pr-2 font-mono text-xs text-gray-600">{{ c.code }}</td>
                <td class="py-2 pr-2 font-semibold text-gray-900">{{ c.name }}</td>
                <td class="py-2 pr-2 text-gray-600 hidden sm:table-cell">{{ c.profile }}</td>
                <td class="py-2 pr-2 tabular-nums text-gray-700">{{ c.questions }} <span class="text-xs text-gray-500">({{ c.choice }} PG)</span></td>
                <td class="py-2">
                  <span class="text-[11px] font-bold px-2 py-0.5 rounded-full" :class="IMPORT_ACTION[c.action].cls">{{ IMPORT_ACTION[c.action].label }}</span>
                  <span v-if="c.note" class="block mt-0.5 text-[11px] text-gray-500">{{ c.note }}</span>
                </td>
              </tr>
            </tbody>
          </table>
          <div class="mt-4 flex justify-end gap-2">
            <button class="px-4 py-2 rounded-lg text-sm font-semibold text-gray-700 hover:bg-white" @click="impor = null">Batal</button>
            <button
              class="px-4 py-2 rounded-lg bg-emerald-700 text-white text-sm font-bold disabled:bg-gray-300"
              :disabled="busy || !impor.result?.changes || impor.problems.length > 0 || impor.result?.errors.length > 0" @click="simpanImpor"
            >Simpan {{ impor.result?.changes || 0 }} studi kasus</button>
          </div>
        </div>

        <div class="grid lg:grid-cols-[280px_1fr] gap-4 items-start">
          <div class="clay-card p-2" data-tour="admin-case-list">
            <button class="w-full text-left px-3 py-2 rounded-lg text-sm font-bold text-[#b70000] hover:bg-white" @click="editCase(null)">+ Studi kasus baru</button>
            <button
              v-for="c in profileCases" :key="c.id" @click="editCase(c)"
              class="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-white"
              :class="caseForm.id === c.id ? 'bg-white font-semibold text-gray-900' : 'text-gray-700'"
            >
              <span class="block">{{ c.name }}<span v-if="!c.active" class="ml-1 text-xs text-gray-400">(arsip)</span></span>
              <span class="block text-xs font-normal text-gray-500">{{ c.question_count }} soal · {{ c.choice_count }} PG · {{ c.time_limit_minutes ? `${c.time_limit_minutes} menit` : 'tanpa batas' }}</span>
            </button>
          </div>
          <div class="clay-card p-4 sm:p-5 space-y-4">
            <div class="grid sm:grid-cols-[1fr_180px] gap-3">
              <label class="block"><span class="text-xs font-semibold text-gray-600">Judul</span>
                <input v-model="caseForm.name" :class="FIELD" /></label>
              <label class="block"><span class="text-xs font-semibold text-gray-600">Kode (untuk Excel)</span>
                <input v-model="caseForm.code" :class="FIELD" class="font-mono" placeholder="otomatis" /></label>
            </div>
            <label class="block"><span class="text-xs font-semibold text-gray-600">Skenario (pakai angka yang realistis)</span>
              <textarea v-model="caseForm.scenario" rows="7" :class="FIELD" class="!h-auto py-2"></textarea></label>
            <div data-tour="admin-questions">
              <CaseQuestionsEditor :questions="caseForm.questions" :pillars="profilePillars" :level-names="activeProfile?.level_names" />
            </div>
            <div class="flex flex-wrap gap-x-5 gap-y-2 items-center">
              <span class="text-xs font-semibold text-gray-600">Pilar dinilai:</span>
              <label v-for="p in profilePillars" :key="p.id" class="flex items-center gap-1.5 text-sm">
                <input v-model="caseForm.pillar_ids" type="checkbox" :value="p.id" class="rounded border-gray-300" />{{ p.name }}
              </label>
            </div>
            <label class="block w-56"><span class="text-xs font-semibold text-gray-600">Batas waktu (menit)</span>
              <input v-model.number="caseForm.time_limit_minutes" type="number" min="0" :class="FIELD" />
              <span class="block mt-1 text-xs text-gray-500">0 = tanpa batas. Waktu habis: jawaban terkirim otomatis.</span></label>
            <label class="block" data-tour="admin-guide">
              <span class="text-xs font-semibold text-gray-600">Panduan penilaian</span>
              <span class="block text-xs text-gray-500">Indikator jawaban L1–L4 untuk pertanyaan esai dan jawaban salah yang sering muncul. Hanya terlihat admin; dipakai AI sebagai acuan bersama rubrik pilar. Peserta tidak bisa melihatnya.</span>
              <textarea v-model="caseForm.guide" rows="12" :class="FIELD" class="!h-auto py-2 font-mono text-xs" :placeholder="GUIDE_CONTOH"></textarea>
            </label>
            <div class="flex flex-wrap justify-between gap-2 pt-2">
              <div class="flex gap-1">
                <button v-if="caseForm.id" class="px-3 py-2 rounded-lg text-sm font-semibold text-gray-600 hover:bg-white" :disabled="busy" @click="arsipCase">
                  {{ caseForm.active ? 'Arsipkan' : 'Aktifkan lagi' }}
                </button>
                <button v-if="caseForm.id" class="px-3 py-2 rounded-lg text-sm font-semibold text-gray-600 hover:bg-white" :disabled="busy" @click="duplikatCase">Duplikat</button>
              </div>
              <button class="px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-bold disabled:bg-gray-300" :disabled="busy" data-tour="admin-save-case" @click="simpanCase">Simpan studi kasus</button>
            </div>
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
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ChevronRightIcon, QuestionMarkCircleIcon, TableCellsIcon, XMarkIcon } from '@heroicons/vue/24/outline'
import { competencyApi } from '../../services/competencyApi'
import CaseQuestionsEditor, { toEditorQuestions, toPayloadQuestions } from '../../components/competency/CaseQuestionsEditor.vue'
import { downloadTemplate, exportCases, parseCasesFile } from '../../utils/caseExcel'
import { useTour } from '../../composables/useTour'
import { LEVEL_STYLE, fmtDateTime, levelName } from '../../utils/competency'

const FIELD = 'mt-1 w-full h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300'
const TABS = [
  { key: 'cycles', label: 'Periode' },
  { key: 'pillars', label: 'Rubrik pilar' },
  { key: 'cases', label: 'Studi kasus' },
  { key: 'questions', label: 'Pernyataan tim' },
]
const IMPORT_ACTION = {
  create: { label: 'Baru', cls: 'bg-emerald-100 text-emerald-800' },
  update: { label: 'Perbarui', cls: 'bg-amber-100 text-amber-800' },
  skip: { label: 'Dilewati', cls: 'bg-gray-100 text-gray-600' },
}
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
const caseForm = reactive({ id: null, code: '', profile_id: null, name: '', scenario: '', questions: [], pillar_ids: [], time_limit_minutes: 30, guide: '', active: true })
const fileInput = ref(null)
const excelBusy = ref(false)
const impor = ref(null) // { file, cases, problems, result }
const GUIDE_CONTOH = 'Pertanyaan 1 - (topik)\nL1: ...\nL2: ...\nL3: ...\nL4: ...\n\nJawaban salah yang sering muncul\n- ...'

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
    ? { id: c.id, code: c.code || '', profile_id: c.profile_id, name: c.name, scenario: c.scenario, questions: toEditorQuestions(c.questions), pillar_ids: [...c.pillar_ids], time_limit_minutes: c.time_limit_minutes, guide: c.guide || '', active: c.active }
    : { id: null, code: '', profile_id: profileId.value, name: '', scenario: '', questions: [], pillar_ids: profilePillars.value.map((p) => p.id), time_limit_minutes: 20, guide: '', active: true })
}
function duplikatCase() {
  // Salinan bisa diubah bebas walau aslinya sudah dikerjakan peserta.
  Object.assign(caseForm, {
    id: null, code: '', name: `${caseForm.name} (salinan)`, active: true,
    questions: toEditorQuestions(toPayloadQuestions(caseForm.questions).map(({ id, ...q }) => q)),
  })
  toast('Salinan dibuat. Ubah lalu simpan.')
}
async function simpanCase() {
  const payload = { ...caseForm, questions: toPayloadQuestions(caseForm.questions) }
  const hasil = await run(() => competencyApi.saveCase(caseForm.id, payload), 'Studi kasus disimpan.')
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

// ── Excel ──
async function unduhTemplate() {
  excelBusy.value = true
  try { await downloadTemplate(config.profiles, config.pillars) } catch (e) { toast(e.message, false) } finally { excelBusy.value = false }
}
async function eksporKasus() {
  excelBusy.value = true
  try {
    const nama = `studi-kasus-${activeProfile.value?.code || 'kompetensi'}.xlsx`
    await exportCases(profileCases.value, config.profiles, config.pillars, nama)
  } catch (e) { toast(e.message, false) } finally { excelBusy.value = false }
}
async function pilihFile(event) {
  const file = event.target.files?.[0]
  event.target.value = ''
  if (!file) return
  excelBusy.value = true
  try {
    const { cases, problems } = await parseCasesFile(file)
    impor.value = { file: file.name, cases, problems, result: null }
    if (cases.length) impor.value.result = await competencyApi.importCases(cases, true)
  } catch (e) {
    impor.value = { file: file.name, cases: [], problems: [e.message || 'File tidak bisa dibaca.'], result: null }
  } finally {
    excelBusy.value = false
  }
}
async function simpanImpor() {
  const hasil = await run(() => competencyApi.importCases(impor.value.cases, false))
  if (!hasil) return
  if (!hasil.saved) { impor.value.result = hasil; return }
  toast(`${hasil.changes} studi kasus disimpan.`)
  impor.value = null
  Object.assign(config, await competencyApi.config())
  editCase(profileCases.value[0] || null)
}

async function simpanPernyataan() {
  const hasil = await run(() => competencyApi.saveQuestions(profileId.value, profileQuestions.value), 'Pernyataan disimpan.')
  if (hasil) config.questions = hasil
}

const tourKelola = useTour('admin-kelola', () => [
  { title: 'Peta Kompetensi', text: 'Di sini Anda menyiapkan asesmen jenjang L1–L4 per peran: rubrik, studi kasus, pernyataan tim, lalu periode asesmen untuk peserta.' },
  { element: '[data-tour="admin-tabs"]', title: 'Empat menu', text: 'Periode: jalankan asesmen. Rubrik pilar: deskripsi L1–L4 dan nama jenjang. Studi kasus: bank soal pilihan ganda & esai. Pernyataan tim: feedback 360.', side: 'bottom' },
  { element: '[data-tour="admin-new-cycle"]', title: 'Buat periode', text: 'Pilih profil peran dan studi kasus, lalu buat periode. Setelah itu tambahkan peserta dan bagikan link tes.', side: 'bottom' },
  { element: '[data-tour="admin-cycle-list"]', title: 'Pantau periode', text: 'Klik periode untuk melihat peta (heatmap), progres tiap peserta, dan link undangan tes. Saat periode ditutup, jenjang peserta otomatis tercatat di data karyawan.', side: 'top' },
  { element: '[data-tour="admin-help"]', title: 'Lihat lagi kapan saja', text: 'Tekan "Cara pakai" untuk memutar panduan ini lagi.', side: 'bottom', align: 'end' },
])
const tourKasus = useTour('admin-studi-kasus', () => [
  { element: '[data-tour="admin-excel"]', title: 'Susun soal di Excel', text: 'Unduh template, isi soal di Excel, lalu Impor. Isi file dicek dulu dan ditampilkan sebagai pratinjau sebelum disimpan. Ekspor untuk mengedit soal yang sudah ada.', side: 'bottom' },
  { element: '[data-tour="admin-case-list"]', title: 'Bank studi kasus', text: 'Pilih kasus untuk diedit, atau buat yang baru. Kasus yang sudah dikerjakan peserta terkunci; pakai Duplikat untuk membuat versi baru.', side: 'right' },
  { element: '[data-tour="admin-questions"]', title: 'Pilihan ganda & esai', text: 'Pilihan ganda: tiap opsi mewakili tindakan khas satu jenjang (L1–L4) dan langsung dinilai. Esai dijawab tertulis atau lisan, lalu dinilai AI. Peserta tidak pernah melihat jenjang opsi, dan urutan opsi diacak.', side: 'top' },
  { element: '[data-tour="admin-guide"]', title: 'Panduan penilaian', text: 'Tulis contoh jawaban L1–L4 untuk soal esai. Hanya admin dan AI yang membacanya.', side: 'top' },
  { element: '[data-tour="admin-save-case"]', title: 'Simpan', text: 'Simpan, lalu pilih studi kasus ini saat membuat periode.', side: 'top', align: 'end' },
])
watch(tab, (t) => { if (t === 'cases') nextTick(() => tourKasus.autoStart()) })

onMounted(async () => {
  await load()
  if (!error.value) nextTick(() => (tab.value === 'cases' ? tourKasus : tourKelola).autoStart())
})
</script>
