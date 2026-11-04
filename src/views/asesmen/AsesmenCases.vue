<!-- Bank studi kasus untuk Asesmen Terpadu (data sama dengan Peta Kompetensi).
     Kasus dipilih per periode; peserta mendapat semua atau satu kasus acak. -->
<template>
  <div class="ujian min-h-screen p-4 md:p-6">
    <AsesmenNav title="Studi Kasus" subtitle="Kasus nyata bengkel yang menuntut analisis dan keputusan (HOTS): pilihan ganda per jenjang + esai/lisan yang dinilai AI per pilar." @help="tour.replay()">
      <template #actions>
        <router-link to="/dashboard/lms/competency-map" class="u-btn !min-h-10" title="Impor/ekspor Excel ada di Peta Kompetensi > Studi kasus"><ArrowUpTrayIcon class="w-5 h-5" />Impor Excel</router-link>
      </template>
    </AsesmenNav>

    <div v-if="loading" class="u-card h-64 animate-pulse"></div>
    <p v-else-if="error && !config" class="u-card p-5 font-bold text-[color:var(--merah)]">{{ error }}</p>

    <template v-else-if="config">
      <div class="flex flex-wrap items-center gap-2 mb-4">
        <span class="text-sm font-extrabold">Profil:</span>
        <button v-for="p in config.profiles" :key="p.id" class="u-tab" :class="profileId === p.id ? 'is-active' : ''" @click="gantiProfil(p.id)">{{ p.name }}</button>
      </div>

      <div class="grid lg:grid-cols-[20rem_minmax(0,1fr)] gap-5 items-start">
        <!-- Daftar kasus -->
        <aside class="space-y-2.5" data-tour="kasus-daftar">
          <button class="u-btn u-btn-merah w-full" @click="baru"><PlusIcon class="w-5 h-5" />Kasus baru</button>
          <button v-for="c in kasus" :key="c.id" class="w-full text-left u-card !shadow-[2px_2px_0_var(--ink)] p-3 transition-transform"
            :class="[form.id === c.id ? '!bg-[color:var(--stabilo)] -translate-y-0.5' : '', c.active ? '' : 'opacity-60']" @click="edit(c)">
            <p class="font-extrabold leading-snug">{{ c.name }}</p>
            <p class="mt-1 text-xs font-bold text-[color:var(--ink-soft)]">{{ c.question_count }} soal · {{ c.choice_count }} PG · {{ c.time_limit_minutes }} mnt{{ c.active ? '' : ' · diarsipkan' }}</p>
            <div class="mt-1.5 flex flex-wrap gap-1"><span v-for="pid in c.pillar_ids" :key="pid" class="u-chip !text-[10px] !py-0">{{ pilarNama(pid) }}</span></div>
          </button>
        </aside>

        <!-- Editor -->
        <form class="u-card p-4 sm:p-5 space-y-4" data-tour="kasus-editor" @submit.prevent="simpan">
          <div class="flex flex-wrap items-center gap-2">
            <h2 class="u-display text-xl font-extrabold flex-1">{{ form.id ? 'Ubah studi kasus' : 'Studi kasus baru' }}</h2>
            <span v-if="form.id && !form.active" class="u-chip">Diarsipkan</span>
          </div>
          <div class="grid sm:grid-cols-[1fr_12rem] gap-3">
            <label><span class="u-label">Judul</span><input v-model="form.name" class="u-input" /></label>
            <label><span class="u-label">Kode</span><input v-model="form.code" class="u-input font-mono" placeholder="otomatis" /></label>
          </div>
          <label class="block"><span class="u-label">Skenario (data kendaraan, keluhan, kondisi, tekanan waktu)</span>
            <textarea v-model="form.scenario" rows="6" class="u-input"></textarea></label>
          <div class="rounded-xl border-2 border-[color:var(--ink)] p-3 bg-[color:var(--grid-bg)]">
            <CaseQuestionsEditor :questions="form.questions" :pillars="pilarProfil" :level-names="levelNames" />
          </div>
          <div>
            <span class="u-label">Pilar yang dinilai</span>
            <div class="flex flex-wrap gap-2">
              <label v-for="p in pilarProfil" :key="p.id" class="u-chip !py-1.5 cursor-pointer" :class="form.pillar_ids.includes(p.id) ? '!bg-[color:var(--ink)] !text-white' : ''">
                <input v-model="form.pillar_ids" type="checkbox" :value="p.id" class="sr-only" />{{ p.name }}
              </label>
            </div>
          </div>
          <label class="block w-44"><span class="u-label">Batas waktu (menit)</span><input v-model.number="form.time_limit_minutes" type="number" min="0" class="u-input" /></label>
          <label class="block" data-tour="kasus-panduan"><span class="u-label">Panduan penilaian L1–L4 per pertanyaan (hanya admin & AI)</span>
            <textarea v-model="form.guide" rows="10" class="u-input font-mono !text-[13px]" :placeholder="GUIDE_CONTOH"></textarea></label>
          <div class="rounded-xl border-2 border-[color:var(--ink)] bg-[#fffbe0] p-3 text-sm">
            <p class="font-extrabold">Ciri soal HOTS yang baik</p>
            <ul class="mt-1 list-disc pl-5 space-y-0.5">
              <li>Ada data yang harus dianalisis (km, riwayat servis, hasil ukur), bukan sekadar hafalan.</li>
              <li>Ada keputusan dengan tekanan nyata: janji waktu, part kosong, customer menolak biaya.</li>
              <li>Opsi pilihan ganda L1–L4 semuanya masuk akal; L4 menambah sisi mencegah terulang / mengajari tim.</li>
            </ul>
          </div>
          <p v-if="error" class="rounded-lg border-2 border-[color:var(--merah)] bg-[color:var(--merah-muda)] p-2 text-sm font-bold text-[color:var(--merah-tua)]" role="alert">{{ error }}</p>
          <p v-if="ok" class="text-sm font-bold text-[color:var(--hijau)]" role="status">{{ ok }}</p>
          <div class="flex flex-wrap gap-2">
            <button class="u-btn u-btn-hitam" :disabled="busy">{{ busy ? 'Menyimpan…' : 'Simpan studi kasus' }}</button>
            <button v-if="form.id" type="button" class="u-btn" :disabled="busy" @click="duplikat">Duplikat</button>
            <button v-if="form.id" type="button" class="u-btn" :disabled="busy" @click="arsip">{{ form.active ? 'Arsipkan' : 'Aktifkan lagi' }}</button>
          </div>
        </form>
      </div>
    </template>
  </div>
</template>

<script setup>
import '@fontsource-variable/bricolage-grotesque'
import '../../styles/exam.css'
import '../../styles/asesmen.css'
import { computed, nextTick, onMounted, reactive, ref } from 'vue'
import { ArrowUpTrayIcon, PlusIcon } from '@heroicons/vue/24/outline'
import AsesmenNav from '../../components/asesmen/AsesmenNav.vue'
import CaseQuestionsEditor, { toEditorQuestions, toPayloadQuestions } from '../../components/competency/CaseQuestionsEditor.vue'
import { competencyApi } from '../../services/competencyApi'
import { useTour } from '../../composables/useTour'

const GUIDE_CONTOH = 'Pertanyaan 2 - (topik)\nL1: ...\nL2: ...\nL3: ...\nL4: ...\n\nJawaban salah yang sering muncul\n- ...'
const loading = ref(true)
const busy = ref(false)
const error = ref('')
const ok = ref('')
const config = ref(null)
const profileId = ref(null)
const KOSONG = { id: null, code: '', name: '', scenario: '', questions: [], pillar_ids: [], time_limit_minutes: 25, guide: '', active: true }
const form = reactive({ ...KOSONG })

const kasus = computed(() => (config.value?.cases || []).filter((c) => c.profile_id === profileId.value)
  .sort((a, b) => b.active - a.active || a.name.localeCompare(b.name)))
const pilarProfil = computed(() => (config.value?.pillars || []).filter((p) => p.profile_id === profileId.value))
const levelNames = computed(() => config.value?.profiles.find((p) => p.id === profileId.value)?.level_names)
const pilarNama = (id) => pilarProfil.value.find((p) => p.id === id)?.name || ''

function edit(c) {
  ok.value = ''
  error.value = ''
  Object.assign(form, c ? { ...c, questions: toEditorQuestions(c.questions), pillar_ids: [...c.pillar_ids] } : { ...KOSONG, questions: [] })
}
function baru() { edit(null) }
function gantiProfil(id) { profileId.value = id; edit(kasus.value[0] || null) }
function duplikat() {
  Object.assign(form, { id: null, code: '', name: `${form.name} (salinan)`, active: true,
    questions: toEditorQuestions(toPayloadQuestions(form.questions).map(({ id, ...q }) => q)) })
  ok.value = 'Salinan dibuat. Ubah lalu simpan.'
}
function pasang(saved) {
  const i = config.value.cases.findIndex((c) => c.id === saved.id)
  if (i >= 0) config.value.cases.splice(i, 1, saved); else config.value.cases.push(saved)
  edit(saved)
}
async function simpan() {
  busy.value = true
  error.value = ''
  ok.value = ''
  try {
    pasang(await competencyApi.saveCase(form.id, { ...form, profile_id: profileId.value, questions: toPayloadQuestions(form.questions) }))
    ok.value = 'Studi kasus disimpan.'
  } catch (e) { error.value = e.message } finally { busy.value = false }
}
async function arsip() {
  busy.value = true
  try { pasang(await competencyApi.archiveCase(form.id, !form.active)) } catch (e) { error.value = e.message } finally { busy.value = false }
}

const tour = useTour('asesmen-studi-kasus', () => [
  { element: '[data-tour="kasus-daftar"]', title: 'Bank studi kasus', text: 'Kasus mekanik siap pakai: mesin brebet, rem komplain balik, aki tekor, AC, overheat, dan kaki-kaki. Pilih kasusnya di pengaturan periode.', side: 'right' },
  { element: '[data-tour="kasus-editor"]', title: 'Soal per jenjang', text: 'Pilihan ganda: tiap opsi mewakili L1–L4 dan langsung dinilai. Esai/lisan dinilai AI per pilar dengan kutipan jawaban.', side: 'left' },
  { element: '[data-tour="kasus-panduan"]', title: 'Panduan penilaian', text: 'Indikator L1–L4 per pertanyaan + jawaban salah yang sering muncul. Ini yang membuat nilai AI konsisten.', side: 'top' },
])

onMounted(async () => {
  try {
    config.value = await competencyApi.config()
    profileId.value = (config.value.profiles.find((p) => p.code === 'mekanik') || config.value.profiles[0])?.id
    edit(kasus.value[0] || null)
  } catch (e) { error.value = e.message } finally { loading.value = false }
  nextTick(() => tour.autoStart())
})
</script>
