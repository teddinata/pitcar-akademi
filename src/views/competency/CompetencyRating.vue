<!-- Form penilaian kompetensi: diri sendiri & atasan memilih level L1-L4 per
     pilar dari rubrik; tim (360) menjawab pernyataan perilaku skala 1-5, anonim. -->
<template>
  <div class="min-h-screen clay-surface p-4 md:p-6">
    <div class="flex items-start gap-3 mb-5">
      <router-link to="/dashboard/lms/my-competency" class="mt-1 p-1.5 rounded-lg text-gray-500 hover:bg-white/70 hover:text-gray-800" title="Kembali">
        <ChevronLeftIcon class="w-5 h-5" />
      </router-link>
      <div class="min-w-0 flex-1">
        <p class="text-xs font-semibold text-gray-500">{{ data ? RATER_LABEL[data.rater_type] : 'Penilaian' }}</p>
        <h1 class="text-xl md:text-2xl font-bold text-gray-900 leading-snug">
          {{ !data ? 'Memuat…' : data.rater_type === 'self' ? 'Penilaian diri sendiri' : data.participant.name }}
        </h1>
        <p v-if="data && data.rater_type !== 'self'" class="text-sm text-gray-500">{{ [data.participant.job, data.participant.department].filter(Boolean).join(' · ') }}</p>
      </div>
    </div>

    <div v-if="loading" class="h-64 rounded-2xl bg-white/70 animate-pulse"></div>
    <div v-else-if="error" class="clay-card p-6 text-center"><p class="text-red-600 font-medium">{{ error }}</p></div>

    <div v-else-if="data" class="max-w-3xl space-y-4">
      <div class="rounded-2xl p-4 text-sm" :class="data.rater_type === 'team' ? 'bg-violet-50 text-violet-950' : 'bg-white/70 text-gray-700'">
        <template v-if="data.rater_type === 'team'">
          <p class="font-semibold flex items-center gap-1.5"><LockClosedIcon class="w-4 h-4" />Jawaban Anda anonim</p>
          <p class="mt-1 text-violet-900">Yang dinilai dan admin hanya melihat rata-rata dari minimal beberapa penilai, tidak pernah jawaban per orang. Jawab berdasarkan pengalaman kerja sehari-hari.</p>
        </template>
        <template v-else-if="data.rater_type === 'self'">Pilih level yang paling menggambarkan cara Anda bekerja <b>saat ini</b>, bukan target. Penilaian diri tidak ikut nilai akhir; dipakai untuk melihat perbedaan cara pandang.</template>
        <template v-else>Pilih level yang paling sesuai dengan perilaku yang Anda lihat sendiri. Tambahkan contoh kejadian bila ada; catatan membantu kabeng berkembang.</template>
      </div>

      <p v-if="data.state === 'submitted'" class="flex items-center gap-1.5 text-sm font-semibold text-green-700">
        <CheckCircleIcon class="w-5 h-5" />Sudah dikirim. Masih bisa diubah selama periode berjalan.
      </p>

      <!-- Diri / atasan: rubrik per pilar -->
      <template v-if="data.rater_type !== 'team'">
        <fieldset v-for="p in data.pillars" :key="p.id" class="clay-card p-4 sm:p-5">
          <legend class="sr-only">{{ p.name }}</legend>
          <div class="flex items-baseline justify-between gap-2">
            <h2 class="text-base font-bold text-gray-900">{{ p.name }}</h2>
            <span v-if="levels[p.id]?.level" class="text-xs font-semibold text-gray-500">L{{ levels[p.id].level }} dipilih</span>
          </div>
          <p class="text-xs text-gray-500 mt-0.5 max-w-prose">{{ p.description }}</p>
          <div class="mt-3 grid sm:grid-cols-2 gap-2">
            <label
              v-for="n in [1, 2, 3, 4]" :key="n"
              class="flex gap-3 rounded-xl border p-3 cursor-pointer transition-colors focus-within:ring-2 focus-within:ring-blue-300"
              :class="levels[p.id]?.level === n ? 'border-gray-900 bg-gray-50 ring-1 ring-gray-900' : 'border-gray-200 hover:border-gray-300 bg-white'"
            >
              <input v-model="levels[p.id].level" type="radio" :name="`pilar-${p.id}`" :value="n" class="sr-only" :disabled="closed" />
              <span class="grid place-items-center w-9 h-9 rounded-lg text-sm font-bold shrink-0 ring-1" :class="LEVEL_STYLE[n].cell">L{{ n }}</span>
              <span class="text-sm leading-snug text-gray-700">{{ p.rubric[n] }}</span>
            </label>
          </div>
          <input
            v-model="levels[p.id].note" type="text" :disabled="closed"
            class="mt-3 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            :placeholder="data.rater_type === 'self' ? 'Contoh nyata (opsional)' : 'Contoh kejadian yang Anda lihat (opsional)'"
          />
        </fieldset>
      </template>

      <!-- Tim: skala 1-5 -->
      <div v-else class="clay-card divide-y divide-gray-100">
        <fieldset v-for="(q, i) in data.questions" :key="q.id" class="p-4">
          <legend class="text-sm font-semibold text-gray-900"><span class="text-gray-400 mr-1">{{ i + 1 }}.</span>{{ q.text }}</legend>
          <div class="mt-3 grid grid-cols-5 gap-1.5">
            <label
              v-for="opt in LIKERT" :key="opt.v"
              class="flex flex-col items-center gap-1 rounded-lg border px-1 py-2 text-center cursor-pointer focus-within:ring-2 focus-within:ring-blue-300"
              :class="answers[q.id] === opt.v ? 'border-violet-700 bg-violet-50 text-violet-900' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'"
            >
              <input v-model="answers[q.id]" type="radio" :name="`q-${q.id}`" :value="opt.v" class="sr-only" :disabled="closed" />
              <span class="text-base font-bold">{{ opt.v }}</span>
              <span class="text-[10px] leading-tight">{{ opt.label }}</span>
            </label>
          </div>
        </fieldset>
      </div>

      <div class="clay-card p-4">
        <template v-if="data.rater_type !== 'team'">
          <label class="block text-sm font-semibold text-gray-800" for="catatan-umum">Catatan umum (opsional)</label>
          <textarea id="catatan-umum" v-model="note" rows="2" :disabled="closed" class="mt-2 mb-3 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"></textarea>
        </template>
        <div class="flex flex-wrap items-center justify-between gap-3">
          <p class="text-xs text-gray-500">{{ progressLabel }}</p>
          <button
            class="px-5 py-2.5 rounded-xl bg-[#b70000] text-white text-sm font-bold hover:bg-[#930000] disabled:bg-gray-300"
            :disabled="!lengkap || saving || closed" @click="kirim"
          >{{ saving ? 'Mengirim…' : data.state === 'submitted' ? 'Simpan perubahan' : 'Kirim penilaian' }}</button>
        </div>
        <p v-if="closed" class="mt-2 text-xs text-gray-500">Periode asesmen sudah ditutup.</p>
        <p v-if="saveError" class="mt-2 text-sm text-red-700" role="alert">{{ saveError }}</p>
        <p v-if="saved" class="mt-2 text-sm text-green-700" role="status">Penilaian terkirim. Terima kasih.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import { CheckCircleIcon, ChevronLeftIcon, LockClosedIcon } from '@heroicons/vue/24/outline'
import { competencyApi } from '../../services/competencyApi'
import { LEVEL_STYLE, RATER_LABEL } from '../../utils/competency'

const LIKERT = [
  { v: 1, label: 'Sangat tidak setuju' }, { v: 2, label: 'Tidak setuju' }, { v: 3, label: 'Kadang' },
  { v: 4, label: 'Setuju' }, { v: 5, label: 'Sangat setuju' },
]

const route = useRoute()
const ratingId = Number(route.params.ratingId)
const loading = ref(true)
const error = ref('')
const data = ref(null)
const levels = reactive({})
const answers = reactive({})
const note = ref('')
const saving = ref(false)
const saveError = ref('')
const saved = ref(false)

const closed = computed(() => data.value?.cycle?.state !== 'open')
const total = computed(() => (data.value?.rater_type === 'team' ? data.value.questions.length : data.value?.pillars.length) || 0)
const terisi = computed(() => (data.value?.rater_type === 'team'
  ? data.value.questions.filter((q) => answers[q.id]).length
  : (data.value?.pillars || []).filter((p) => levels[p.id]?.level).length))
const lengkap = computed(() => total.value > 0 && terisi.value === total.value)
const progressLabel = computed(() => (data.value?.rater_type === 'team'
  ? `${terisi.value}/${total.value} pernyataan dijawab`
  : `${terisi.value}/${total.value} pilar dinilai`))

function isi(d) {
  data.value = d
  note.value = d.note || ''
  if (d.rater_type === 'team') {
    d.questions.forEach((q) => { answers[q.id] = q.score || null })
  } else {
    d.pillars.forEach((p) => {
      levels[p.id] = { level: d.levels[String(p.id)]?.level || null, note: d.levels[String(p.id)]?.note || '' }
    })
  }
}

async function load() {
  loading.value = true
  try {
    isi(await competencyApi.rating(ratingId))
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

async function kirim() {
  saving.value = true
  saveError.value = ''
  saved.value = false
  try {
    const payload = data.value.rater_type === 'team'
      ? { answers: { ...answers }, note: note.value }
      : { levels: Object.fromEntries(Object.entries(levels).map(([k, v]) => [k, { level: v.level, note: v.note }])), note: note.value }
    isi(await competencyApi.submitRating(ratingId, payload))
    saved.value = true
  } catch (e) {
    saveError.value = e.message
  } finally {
    saving.value = false
  }
}

onMounted(load)
</script>
