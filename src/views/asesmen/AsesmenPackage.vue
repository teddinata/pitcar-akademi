<!-- Paket Asesmen per peran: satu rangkaian 1 Ujian lisan -> 2 Studi kasus ->
     3 Rubrik lead -> 4 Komponen & bobot. Periode baru tinggal memilih paket. -->
<template>
  <div class="ujian min-h-screen p-4 md:p-6">
    <AsesmenNav title="Paket Asesmen" subtitle="Semua bahan asesmen satu peran dalam satu rangkaian. Periode baru cukup memilih paket ini, lalu isinya terbawa otomatis." @help="tour.replay()" />

    <div v-if="loading && !pkg" class="u-card h-64 animate-pulse"></div>
    <p v-else-if="error && !pkg" class="u-card p-5 font-bold text-[color:var(--merah)]">{{ error }}</p>

    <template v-else-if="pkg">
      <!-- Pilih paket -->
      <div class="flex flex-wrap gap-3 mb-5" data-tour="paket-pilih">
        <button v-for="p in packages" :key="p.profile.id" class="u-card !shadow-[3px_3px_0_var(--ink)] px-4 py-3 text-left transition-transform min-w-[13rem]"
          :class="profileId === p.profile.id ? '!bg-[color:var(--ink)] !text-white -translate-y-0.5' : ''" @click="pilihPaket(p.profile.id)">
          <p class="text-[11px] font-extrabold uppercase tracking-[.08em] opacity-80">Paket</p>
          <p class="u-display text-lg font-extrabold leading-tight">{{ p.profile.name }}</p>
          <p class="mt-1 text-xs font-extrabold" :class="siap(p.readiness) ? (profileId === p.profile.id ? 'text-[#9be3b8]' : 'text-[color:var(--hijau)]') : (profileId === p.profile.id ? 'text-[color:var(--stabilo)]' : 'text-[color:var(--merah-tua)]')">
            {{ siap(p.readiness) ? '✓ Siap dipakai' : `${p.readiness.filter((r) => !r.ok).length} bagian belum lengkap` }}
          </p>
        </button>
      </div>

      <!-- Rangkaian -->
      <nav class="grid grid-cols-2 md:grid-cols-4 gap-2 mb-5" aria-label="Rangkaian paket" data-tour="paket-rangkaian">
        <button v-for="(s, i) in STEPS" :key="s.key" class="relative text-left rounded-xl border-[2.5px] border-[color:var(--ink)] p-3 transition-transform"
          :class="step === s.key ? 'bg-[color:var(--stabilo)] shadow-[3px_3px_0_var(--ink)] -translate-y-0.5' : 'bg-white'" @click="ke(s.key)">
          <div class="flex items-center gap-2">
            <span class="u-nomor !w-8 !h-8 !text-base">{{ i + 1 }}</span>
            <span class="font-extrabold leading-tight flex-1">{{ s.label }}</span>
            <CheckCircleIcon v-if="cek(s.key)?.ok" class="w-6 h-6 text-[color:var(--hijau)] shrink-0" />
            <ExclamationCircleIcon v-else-if="cek(s.key)" class="w-6 h-6 text-[color:var(--merah)] shrink-0" />
            <MinusCircleIcon v-else-if="s.key !== 'bobot'" class="w-6 h-6 text-[color:var(--ink-soft)] shrink-0" />
          </div>
          <p class="mt-1.5 text-xs font-bold leading-snug" :class="cek(s.key) && !cek(s.key).ok ? 'text-[color:var(--merah-tua)]' : 'text-[color:var(--ink-soft)]'">{{ ringkas(s.key) }}</p>
          <ChevronRightIcon v-if="i < STEPS.length - 1" class="hidden md:block absolute -right-[13px] top-1/2 -translate-y-1/2 w-5 h-5 bg-[color:var(--grid-bg)] rounded-full" />
        </button>
      </nav>

      <p v-if="error" class="mb-4 rounded-lg border-2 border-[color:var(--merah)] bg-[color:var(--merah-muda)] p-2.5 text-sm font-bold text-[color:var(--merah-tua)]" role="alert">{{ error }}</p>

      <!-- Isi langkah -->
      <section>
        <div class="flex flex-wrap items-baseline justify-between gap-2 mb-3">
          <h2 class="u-display text-2xl font-extrabold">{{ STEPS.findIndex((s) => s.key === step) + 1 }} · {{ STEPS.find((s) => s.key === step).label }}</h2>
          <p class="text-sm text-[color:var(--ink-soft)] max-w-xl">{{ STEPS.find((s) => s.key === step).teks }}</p>
        </div>

        <template v-if="step === 'lisan'">
          <div v-if="!pkg.oral_enabled" class="u-card p-4 mb-4 bg-[#f6f6f6] font-bold">Ujian lisan tidak dipakai di paket ini. Nyalakan di langkah 4.</div>
          <OralBankPanel :profile-id="profileId" :questions="pkg.questions" :rubric="rubric" :level-names="pkg.profile.level_names" @changed="segarkan" />
        </template>
        <template v-else-if="step === 'kasus'">
          <PillarCoverage :pillars="pkg.pillars" :cases="pkg.cases.filter((c) => pkg.case_ids.includes(c.id))" :mode="pkg.case_mode" :lead-enabled="pkg.lead_enabled" />
          <CasesPanel :key="`k-${profileId}`" :profile-id="profileId" :cases="pkg.cases" :pillars="pkg.pillars"
          :level-names="pkg.profile.level_names" :selected="pkg.case_ids" @update:selected="pilihKasus" @changed="segarkan" />
        </template>
        <template v-else-if="step === 'lead'">
          <div v-if="!pkg.lead_enabled" class="u-card p-4 mb-4 bg-[#f6f6f6] font-bold">Penilaian lead tidak dipakai di paket ini. Nyalakan di langkah 4.</div>
          <LeadRubricPanel :key="`l-${profileId}`" :profile="pkg.profile" :pillars="pkg.pillars" @changed="segarkan" />
        </template>

        <!-- Komponen & bobot -->
        <form v-else class="grid lg:grid-cols-2 gap-5 items-start" data-tour="paket-bobot" @submit.prevent="simpanBobot">
          <div class="u-card p-4 sm:p-5 space-y-4">
            <h3 class="u-display text-lg font-extrabold">Komponen paket</h3>
            <label class="flex items-start gap-3 rounded-xl border-2 border-[color:var(--ink)] p-3"><input v-model="bobot.oral_enabled" type="checkbox" class="u-check" />
              <span><b>Ujian lisan</b><span class="block text-sm text-[color:var(--ink-soft)]">{{ pkg.questions.filter((q) => q.active).length }} soal aktif di langkah 1</span></span></label>
            <div class="rounded-xl border-2 border-[color:var(--ink)] p-3">
              <p class="font-bold">Studi kasus</p>
              <p class="text-sm text-[color:var(--ink-soft)]">{{ pkg.case_ids.length }} kasus dipilih di langkah 2</p>
              <div class="mt-2 grid grid-cols-2 gap-2">
                <button v-for="m in MODES" :key="m.key" type="button" class="u-tab !min-h-0 !py-2 text-left !whitespace-normal" :class="bobot.case_mode === m.key ? 'is-active' : ''" @click="bobot.case_mode = m.key">
                  <span class="block">{{ m.label }}</span><span class="block text-xs font-semibold opacity-80">{{ m.teks }}</span>
                </button>
              </div>
            </div>
            <label class="flex items-start gap-3 rounded-xl border-2 border-[color:var(--ink)] p-3"><input v-model="bobot.lead_enabled" type="checkbox" class="u-check" />
              <span><b>Penilaian lead</b><span class="block text-sm text-[color:var(--ink-soft)]">{{ pkg.pillars.length }} pilar di langkah 3</span></span></label>
          </div>
          <div class="u-card p-4 sm:p-5 space-y-4">
            <h3 class="u-display text-lg font-extrabold">Bobot</h3>
            <div>
              <span class="u-label">Bobot jenjang akhir</span>
              <div class="grid grid-cols-3 gap-2">
                <label v-for="k in BOBOT" :key="k.key" class="text-center"><span class="text-xs font-extrabold">{{ k.label }}</span>
                  <input v-model.number="bobot.weights[k.key]" type="number" min="0" class="u-input !px-2 text-center" /></label>
              </div>
              <p class="mt-1 text-xs text-[color:var(--ink-soft)]">Bobot relatif; komponen yang tidak dipakai tidak dihitung. Jenjang akhir paling tinggi satu level di atas komponen terendah.</p>
            </div>
            <div>
              <span class="u-label">Bobot soal ujian lisan (harus 100%)</span>
              <div class="grid grid-cols-4 gap-2">
                <label v-for="n in 4" :key="n" class="text-center"><span class="text-xs font-extrabold">L{{ n }}</span>
                  <input v-model.number="bobot.oral_weights[n]" type="number" min="0" max="100" class="u-input !px-2 text-center" /></label>
              </div>
              <p class="mt-1 text-xs font-bold" :class="totalLisan === 100 ? 'text-[color:var(--hijau)]' : 'text-[color:var(--merah)]'">Total {{ totalLisan }}%</p>
            </div>
            <div class="flex flex-wrap items-center gap-3">
              <button class="u-btn u-btn-hitam" :disabled="busy || totalLisan !== 100">{{ busy ? 'Menyimpan…' : 'Simpan pengaturan paket' }}</button>
              <span v-if="tersimpan" class="text-sm font-bold text-[color:var(--hijau)]">Tersimpan.</span>
            </div>
          </div>
        </form>

        <!-- Navigasi rangkaian -->
        <div class="mt-6 flex flex-wrap items-center justify-between gap-3 border-t-[2.5px] border-[color:var(--ink)] pt-4">
          <button v-if="prevStep" class="u-btn" @click="ke(prevStep.key)"><ChevronLeftIcon class="w-5 h-5" />{{ prevStep.label }}</button>
          <span v-else></span>
          <button v-if="nextStep" class="u-btn u-btn-hitam" @click="ke(nextStep.key)">Lanjut: {{ nextStep.label }}<ChevronRightIcon class="w-5 h-5" /></button>
          <router-link v-else :to="`/dashboard/asesmen?paket=${profileId}`" class="u-btn u-btn-merah" :class="!siap(pkg.readiness) ? 'opacity-60' : ''">
            Buat periode dari paket {{ pkg.profile.name }}<ChevronRightIcon class="w-5 h-5" />
          </router-link>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup>
import '@fontsource-variable/bricolage-grotesque'
import '../../styles/exam.css'
import '../../styles/asesmen.css'
import { computed, nextTick, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  CheckCircleIcon, ChevronLeftIcon, ChevronRightIcon, ExclamationCircleIcon, MinusCircleIcon,
} from '@heroicons/vue/24/outline'
import AsesmenNav from '../../components/asesmen/AsesmenNav.vue'
import OralBankPanel from '../../components/asesmen/OralBankPanel.vue'
import PillarCoverage from '../../components/asesmen/PillarCoverage.vue'
import CasesPanel from '../../components/asesmen/CasesPanel.vue'
import LeadRubricPanel from '../../components/asesmen/LeadRubricPanel.vue'
import { competencyApi } from '../../services/competencyApi'
import { useTour } from '../../composables/useTour'

const STEPS = [
  { key: 'lisan', label: 'Ujian lisan', check: 'oral', teks: 'Soal L1–L4 dengan kunci jawaban. Peserta menjawab dengan suara, dinilai AI memakai rubrik 6 aspek.' },
  { key: 'kasus', label: 'Studi kasus', check: 'case', teks: 'Pilih kasus yang masuk paket. Peserta mendapat semua kasus atau satu kasus acak.' },
  { key: 'lead', label: 'Rubrik lead', check: 'lead', teks: 'Deskripsi L1–L4 per pilar yang dipakai lead menilai peserta, plus nama jenjang.' },
  { key: 'bobot', label: 'Komponen & bobot', check: null, teks: 'Komponen yang dipakai dan bobotnya. Menjadi pengaturan awal setiap periode baru dari paket ini.' },
]
const MODES = [
  { key: 'random', label: 'Acak 1 kasus', teks: 'Peserta berurutan dapat kasus berbeda (anti contek).' },
  { key: 'all', label: 'Semua kasus', teks: 'Setiap peserta mengerjakan semua kasus paket.' },
]
const BOBOT = [{ key: 'oral', label: 'Lisan' }, { key: 'case', label: 'Kasus' }, { key: 'lead', label: 'Lead' }]

const route = useRoute()
const router = useRouter()
const loading = ref(true)
const busy = ref(false)
const error = ref('')
const tersimpan = ref(false)
const packages = ref([])
const rubric = ref(null)
const pkg = ref(null)
const profileId = ref(null)
const step = ref(STEPS.some((s) => s.key === route.query.bagian) ? route.query.bagian : 'lisan')
const bobot = reactive({ oral_enabled: true, lead_enabled: true, case_mode: 'random', weights: {}, oral_weights: {} })

const siap = (readiness) => (readiness || []).every((r) => r.ok)
const cek = (key) => pkg.value?.readiness.find((r) => r.key === STEPS.find((s) => s.key === key)?.check)
const ringkas = (key) => {
  if (key === 'bobot') return `Lisan ${pkg.value.weights.oral} · Kasus ${pkg.value.weights.case} · Lead ${pkg.value.weights.lead}`
  return cek(key)?.label || 'Tidak dipakai di paket ini'
}
const idx = computed(() => STEPS.findIndex((s) => s.key === step.value))
const prevStep = computed(() => STEPS[idx.value - 1])
const nextStep = computed(() => STEPS[idx.value + 1])
const totalLisan = computed(() => [1, 2, 3, 4].reduce((s, n) => s + (Number(bobot.oral_weights[n]) || 0), 0))

function terima(data) {
  pkg.value = data
  Object.assign(bobot, { oral_enabled: data.oral_enabled, lead_enabled: data.lead_enabled, case_mode: data.case_mode,
    weights: { ...data.weights }, oral_weights: { ...data.oral_weights } })
  const row = packages.value.find((p) => p.profile.id === data.profile.id)
  if (row) row.readiness = data.readiness
}
function ke(key) {
  step.value = key
  router.replace({ query: { paket: profileId.value, bagian: key } })
  window.scrollTo({ top: 0 })
  document.querySelector('.flex-1.overflow-auto')?.scrollTo({ top: 0 })
}
async function pilihPaket(id) {
  profileId.value = id
  router.replace({ query: { paket: id, bagian: step.value } })
  loading.value = true
  try { terima(await competencyApi.package(id)) } catch (e) { error.value = e.message } finally { loading.value = false }
}
// Setelah soal/kasus/rubrik berubah: perbarui daftar cek kesiapan saja (isi panel tetap).
async function segarkan() {
  try {
    const fresh = await competencyApi.package(profileId.value)
    pkg.value.readiness = fresh.readiness
    pkg.value.profile.level_names = fresh.profile.level_names
    const row = packages.value.find((p) => p.profile.id === profileId.value)
    if (row) row.readiness = fresh.readiness
  } catch { /* daftar cek diperbarui lain kali */ }
}
async function simpan(data) {
  busy.value = true
  error.value = ''
  try {
    const fresh = await competencyApi.savePackage(profileId.value, data)
    pkg.value.case_ids = fresh.case_ids
    Object.assign(pkg.value, { oral_enabled: fresh.oral_enabled, lead_enabled: fresh.lead_enabled, case_mode: fresh.case_mode,
      weights: fresh.weights, oral_weights: fresh.oral_weights, readiness: fresh.readiness })
    const row = packages.value.find((p) => p.profile.id === profileId.value)
    if (row) row.readiness = fresh.readiness
    return true
  } catch (e) { error.value = e.message; return false } finally { busy.value = false }
}
const pilihKasus = (ids) => simpan({ case_ids: ids })
async function simpanBobot() {
  if (await simpan({ ...bobot })) { tersimpan.value = true; setTimeout(() => { tersimpan.value = false }, 2500) }
}

const tour = useTour('asesmen-paket', () => [
  { element: '[data-tour="paket-pilih"]', title: 'Satu paket per peran', text: 'Paket Mekanik dan Kepala Bengkel. Isi paket dipakai setiap kali periode baru dibuat.', side: 'bottom' },
  { element: '[data-tour="paket-rangkaian"]', title: 'Satu rangkaian, empat langkah', text: 'Ujian lisan → Studi kasus → Rubrik lead → Komponen & bobot. Tanda centang hijau = bagian itu sudah siap.', side: 'bottom' },
  { element: '[data-tour="lisan-level"]', title: 'Langkah 1: soal lisan', text: 'Satu soal per level, boleh beberapa variasi. Kunci jawaban menentukan kualitas nilai AI.', side: 'top' },
  { element: '[data-tour="asm-help"]', title: 'Setelah semua siap', text: 'Di langkah terakhir ada tombol "Buat periode dari paket ini".', side: 'bottom', align: 'end' },
])

onMounted(async () => {
  try {
    const hasil = await competencyApi.packages()
    packages.value = hasil.packages
    rubric.value = hasil.rubric
    const q = Number(route.query.paket)
    const awal = packages.value.find((p) => p.profile.id === q) || packages.value.find((p) => p.profile.code === 'mekanik') || packages.value[0]
    if (awal) await pilihPaket(awal.profile.id)
  } catch (e) { error.value = e.message } finally { loading.value = false }
  nextTick(() => tour.autoStart())
})
</script>
