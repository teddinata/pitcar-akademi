<!-- Bank soal ujian lisan per profil: soal L1-L4 (boleh beberapa variasi per level,
     diacak per peserta), kunci jawaban untuk AI, waktu menjawab; rubrik 6 aspek. -->
<template>
  <div class="ujian min-h-screen p-4 md:p-6">
    <AsesmenNav title="Soal Ujian Lisan" subtitle="Rubrik lama 6 aspek, kini dikerjakan mandiri dan dinilai AI. Tiap level boleh punya beberapa variasi soal; peserta mendapat satu secara acak." @help="tour.replay()" />

    <div v-if="loading" class="u-card h-64 animate-pulse"></div>
    <p v-else-if="error && !bank" class="u-card p-5 font-bold text-[color:var(--merah)]">{{ error }}</p>

    <template v-else-if="bank">
      <div class="flex flex-wrap items-center gap-2 mb-4" data-tour="lisan-profil">
        <span class="text-sm font-extrabold">Profil:</span>
        <button v-for="p in bank.profiles" :key="p.id" class="u-tab" :class="profileId === p.id ? 'is-active' : ''" @click="profileId = p.id">{{ p.name }}</button>
      </div>

      <!-- Rubrik -->
      <details class="u-card mb-5 group" data-tour="lisan-rubrik" open>
        <summary class="flex items-center justify-between gap-2 p-4 cursor-pointer list-none">
          <span class="u-display text-xl font-extrabold">Rubrik skor 1–5 per aspek</span>
          <ChevronDownIcon class="w-5 h-5 transition-transform group-open:rotate-180" />
        </summary>
        <div class="px-4 pb-4">
          <div class="overflow-x-auto rounded-xl border-2 border-[color:var(--ink)]">
            <table class="u-table min-w-[56rem]">
              <thead><tr><th>Aspek</th><th v-for="n in [5, 4, 3, 2, 1]" :key="n">Skor {{ n }}</th></tr></thead>
              <tbody>
                <tr v-for="a in bank.rubric.aspects" :key="a.code">
                  <td class="font-extrabold whitespace-nowrap">{{ a.name }}<span v-if="a.substance" class="u-chip !text-[10px] ml-1.5">substansi</span></td>
                  <td v-for="n in [5, 4, 3, 2, 1]" :key="n" class="text-sm leading-snug">{{ a.scores[n] }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <ul class="mt-3 grid md:grid-cols-3 gap-2 text-sm">
            <li class="rounded-lg border-2 border-[color:var(--ink)] p-2.5"><b>Skor soal</b> = rata-rata 6 aspek. <b>Persen</b> = Σ skor soal × bobot ÷ 5 (contoh Allan 63,67%).</li>
            <li class="rounded-lg border-2 border-[color:var(--ink)] p-2.5"><b>Lulus soal</b> bila rata-rata 4 aspek substansi ≥ {{ num(bank.rubric.pass_substance) }}. Jenjang = naik dari L1 sampai soal pertama yang belum lulus.</li>
            <li class="rounded-lg border-2 border-[color:var(--ink)] p-2.5"><b>Kunci jawaban</b> dipakai AI untuk menilai Ketepatan & Urutan. Peserta tidak pernah melihatnya.</li>
          </ul>
        </div>
      </details>

      <!-- Soal per level -->
      <div class="grid lg:grid-cols-2 gap-4" data-tour="lisan-level">
        <section v-for="n in [1, 2, 3, 4]" :key="n" class="u-card p-4">
          <div class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-2.5">
              <span class="u-level" :class="`l${n}`">L{{ n }}</span>
              <div>
                <p class="font-extrabold leading-tight">{{ levelNames[n] || `Level ${n}` }}</p>
                <p class="text-xs text-[color:var(--ink-soft)]">{{ soalLevel(n).filter((q) => q.active).length }} variasi aktif</p>
              </div>
            </div>
            <button class="u-btn !min-h-9" @click="edit({ level: n })"><PlusIcon class="w-4 h-4" />Variasi</button>
          </div>
          <p v-if="!soalLevel(n).some((q) => q.active)" class="mt-3 rounded-lg border-2 border-[color:var(--merah)] bg-[color:var(--merah-muda)] p-2 text-sm font-bold text-[color:var(--merah-tua)]">Belum ada soal aktif. Periode tidak bisa dimulai.</p>

          <div class="mt-3 space-y-3">
            <template v-for="q in soalLevel(n)" :key="q.id">
              <form v-if="form.id === q.id" class="rounded-xl border-[2.5px] border-[color:var(--ink)] p-3 bg-[#fffbe0] space-y-2" @submit.prevent="simpan">
                <FormSoal :form="form" />
              </form>
              <article v-else class="rounded-xl border-2 border-[color:var(--ink)] p-3" :class="q.active ? 'bg-white' : 'bg-[#f1f1f1] opacity-70'">
                <p class="font-bold leading-snug">{{ q.text }}</p>
                <details class="mt-2 text-sm">
                  <summary class="cursor-pointer font-bold">Kunci jawaban ({{ poin(q).length }} poin) · {{ Math.round(q.answer_seconds / 60) }} menit</summary>
                  <ul class="mt-1.5 list-disc pl-5 space-y-0.5 text-[color:var(--ink-soft)]"><li v-for="(k, i) in poin(q)" :key="i">{{ k }}</li></ul>
                </details>
                <div class="mt-2 flex gap-2">
                  <button class="u-btn !min-h-8 !text-xs" @click="edit(q)">Ubah</button>
                  <button class="u-btn !min-h-8 !text-xs" :disabled="busy" @click="arsip(q)">{{ q.active ? 'Arsipkan' : 'Aktifkan' }}</button>
                </div>
              </article>
            </template>
            <form v-if="form.id === null && form.level === n" class="rounded-xl border-[2.5px] border-[color:var(--ink)] p-3 bg-[#fffbe0] space-y-2" @submit.prevent="simpan">
              <FormSoal :form="form" />
            </form>
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
import { computed, defineComponent, h, nextTick, onMounted, reactive, ref } from 'vue'
import { ChevronDownIcon, PlusIcon } from '@heroicons/vue/24/outline'
import AsesmenNav from '../../components/asesmen/AsesmenNav.vue'
import { competencyApi } from '../../services/competencyApi'
import { useTour } from '../../composables/useTour'
import { num } from '../../utils/asesmen'

const loading = ref(true)
const busy = ref(false)
const error = ref('')
const bank = ref(null)
const profileId = ref(null)
const form = reactive({ id: undefined, level: null, text: '', key_points: '', answer_seconds: 180 })

const levelNames = computed(() => bank.value?.profiles.find((p) => p.id === profileId.value)?.level_names || {})
const soalLevel = (n) => (bank.value?.questions || []).filter((q) => q.profile_id === profileId.value && q.level === n)
  .sort((a, b) => b.active - a.active || a.id - b.id)
const poin = (q) => (q.key_points || '').split('\n').map((s) => s.trim()).filter(Boolean)

function edit(q) {
  Object.assign(form, { id: q.id ?? null, level: q.level, text: q.text || '', key_points: q.key_points || '',
    answer_seconds: q.answer_seconds || (q.level >= 3 ? 300 : 180) })
  error.value = ''
}
function batal() { Object.assign(form, { id: undefined, level: null }) }

async function simpan() {
  busy.value = true
  error.value = ''
  try {
    const saved = await competencyApi.saveOralQuestion(form.id, { ...form, profile_id: profileId.value })
    const i = bank.value.questions.findIndex((q) => q.id === saved.id)
    if (i >= 0) bank.value.questions.splice(i, 1, saved); else bank.value.questions.push(saved)
    batal()
  } catch (e) {
    error.value = e.message
  } finally {
    busy.value = false
  }
}
async function arsip(q) {
  busy.value = true
  try {
    const saved = await competencyApi.archiveOralQuestion(q.id, !q.active)
    bank.value.questions.splice(bank.value.questions.findIndex((x) => x.id === q.id), 1, saved)
  } catch (e) { error.value = e.message } finally { busy.value = false }
}

// Form soal dipakai untuk ubah dan tambah.
const FormSoal = defineComponent({
  props: { form: Object },
  setup(props) {
    return () => h('div', { class: 'space-y-2' }, [
      h('label', { class: 'block' }, [h('span', { class: 'u-label' }, `Pertanyaan L${props.form.level}`),
        h('textarea', { class: 'u-input', rows: 3, value: props.form.text, onInput: (e) => { props.form.text = e.target.value } })]),
      h('label', { class: 'block' }, [h('span', { class: 'u-label' }, 'Kunci jawaban / poin wajib (satu poin per baris)'),
        h('textarea', { class: 'u-input font-mono !text-[13px]', rows: 8, value: props.form.key_points,
          placeholder: 'Langkah 1 + alasannya\nLangkah 2 + alasannya\nJawaban salah yang sering muncul…',
          onInput: (e) => { props.form.key_points = e.target.value } })]),
      h('label', { class: 'block w-40' }, [h('span', { class: 'u-label' }, 'Waktu menjawab (menit)'),
        h('input', { class: 'u-input', type: 'number', min: 1, max: 15, value: Math.round(props.form.answer_seconds / 60),
          onInput: (e) => { props.form.answer_seconds = Math.max(1, Number(e.target.value) || 1) * 60 } })]),
      error.value ? h('p', { class: 'text-sm font-bold text-[color:var(--merah)]', role: 'alert' }, error.value) : null,
      h('div', { class: 'flex gap-2' }, [
        h('button', { class: 'u-btn u-btn-hitam !min-h-9', type: 'submit', disabled: busy.value || !props.form.text.trim() }, busy.value ? 'Menyimpan…' : 'Simpan soal'),
        h('button', { class: 'u-btn !min-h-9', type: 'button', onClick: batal }, 'Batal'),
      ]),
    ])
  },
})

const tour = useTour('asesmen-soal-lisan', () => [
  { element: '[data-tour="lisan-rubrik"]', title: 'Rubrik lama tetap dipakai', text: '6 aspek, skor 1–5, sama seperti sheet asesor. AI menilai memakai deskripsi ini.', side: 'bottom' },
  { element: '[data-tour="lisan-level"]', title: 'Satu soal per level', text: 'Tambah beberapa variasi per level supaya soal tidak bocor antar peserta. Peserta mendapat satu variasi secara acak.', side: 'top' },
  { element: '[data-tour="lisan-level"]', title: 'Kunci jawaban menentukan kualitas nilai', text: 'Tulis poin wajib satu per baris, beserta alasannya. Minta kabeng/asesor mengecek kunci sebelum periode dimulai.', side: 'top' },
])

onMounted(async () => {
  try {
    bank.value = await competencyApi.oralBank()
    profileId.value = (bank.value.profiles.find((p) => p.code === 'mekanik') || bank.value.profiles[0])?.id
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
  nextTick(() => tour.autoStart())
})
</script>
