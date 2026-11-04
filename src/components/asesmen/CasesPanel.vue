<!-- Bagian 2 paket: studi kasus profil. Centang "masuk paket" untuk kasus yang
     dipakai periode baru; editor kasus (pilihan ganda per jenjang + esai/lisan). -->
<template>
  <div class="grid lg:grid-cols-[21rem_minmax(0,1fr)] gap-5 items-start">
    <aside class="space-y-2.5" data-tour="kasus-daftar">
      <div class="u-card !shadow-[2px_2px_0_var(--ink)] p-3 bg-[#fffbe0]">
        <p class="font-extrabold">{{ selected.length }} kasus masuk paket</p>
        <p class="text-xs text-[color:var(--ink-soft)]">Centang kotak kiri untuk memasukkan/mengeluarkan kasus dari paket. Klik judul untuk mengubah isinya.</p>
      </div>
      <button class="u-btn u-btn-merah w-full" @click="edit(null)"><PlusIcon class="w-5 h-5" />Kasus baru</button>
      <div v-for="c in kasus" :key="c.id" class="u-card !shadow-[2px_2px_0_var(--ink)] flex items-stretch overflow-hidden"
        :class="[form.id === c.id ? '!bg-[color:var(--stabilo)]' : '', c.active ? '' : 'opacity-60']">
        <label class="grid place-items-center px-3 border-r-2 border-[color:var(--ink)] cursor-pointer" :title="inPaket(c) ? 'Keluarkan dari paket' : 'Masukkan ke paket'">
          <input type="checkbox" class="u-check" :checked="inPaket(c)" :disabled="!c.active" @change="toggle(c, $event.target.checked)" />
        </label>
        <button class="flex-1 text-left p-3" @click="edit(c)">
          <p class="font-extrabold leading-snug">{{ c.name }}</p>
          <p class="mt-1 text-xs font-bold text-[color:var(--ink-soft)]">{{ c.question_count }} soal · {{ c.choice_count }} PG · {{ c.time_limit_minutes }} mnt{{ c.active ? '' : ' · diarsipkan' }}</p>
        </button>
      </div>
    </aside>

    <form class="u-card p-4 sm:p-5 space-y-4" data-tour="kasus-editor" @submit.prevent="simpan">
      <div class="flex flex-wrap items-center gap-2">
        <h3 class="u-display text-xl font-extrabold flex-1">{{ form.id ? 'Ubah studi kasus' : 'Studi kasus baru' }}</h3>
        <span v-if="form.id && !form.active" class="u-chip">Diarsipkan</span>
        <span v-else-if="form.id" class="u-chip" :class="selected.includes(form.id) ? 'u-chip-hijau' : ''">{{ selected.includes(form.id) ? 'Masuk paket' : 'Tidak di paket' }}</span>
      </div>
      <div class="grid sm:grid-cols-[1fr_12rem] gap-3">
        <label><span class="u-label">Judul</span><input v-model="form.name" class="u-input" /></label>
        <label><span class="u-label">Kode</span><input v-model="form.code" class="u-input font-mono" placeholder="otomatis" /></label>
      </div>
      <label class="block"><span class="u-label">Skenario (data kendaraan, keluhan, kondisi, tekanan waktu)</span>
        <textarea v-model="form.scenario" rows="6" class="u-input"></textarea></label>
      <div class="rounded-xl border-2 border-[color:var(--ink)] p-3 bg-[color:var(--grid-bg)]">
        <CaseQuestionsEditor :questions="form.questions" :pillars="pillars" :level-names="levelNames" />
      </div>
      <div>
        <span class="u-label">Pilar yang dinilai</span>
        <div class="flex flex-wrap gap-2">
          <label v-for="p in pillars" :key="p.id" class="u-chip !py-1.5 cursor-pointer" :class="form.pillar_ids.includes(p.id) ? '!bg-[color:var(--ink)] !text-white' : ''">
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
        <router-link to="/dashboard/lms/competency-map" class="u-btn" title="Impor/ekspor Excel ada di Peta Kompetensi > Studi kasus"><ArrowUpTrayIcon class="w-5 h-5" />Impor Excel</router-link>
      </div>
    </form>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { ArrowUpTrayIcon, PlusIcon } from '@heroicons/vue/24/outline'
import CaseQuestionsEditor, { toEditorQuestions, toPayloadQuestions } from '../competency/CaseQuestionsEditor.vue'
import { competencyApi } from '../../services/competencyApi'

const props = defineProps({
  profileId: { type: Number, required: true },
  cases: { type: Array, required: true }, // diubah di tempat
  pillars: { type: Array, default: () => [] },
  levelNames: { type: Object, default: () => ({}) },
  selected: { type: Array, default: () => [] }, // id kasus dalam paket
})
const emit = defineEmits(['update:selected', 'changed'])

const GUIDE_CONTOH = 'Pertanyaan 2 - (topik)\nL1: ...\nL2: ...\nL3: ...\nL4: ...\n\nJawaban salah yang sering muncul\n- ...'
const busy = ref(false)
const error = ref('')
const ok = ref('')
const KOSONG = { id: null, code: '', name: '', scenario: '', questions: [], pillar_ids: [], time_limit_minutes: 25, guide: '', active: true }
const form = reactive({ ...KOSONG })

const kasus = computed(() => [...props.cases].sort((a, b) => b.active - a.active || inPaket(b) - inPaket(a) || a.name.localeCompare(b.name)))
const inPaket = (c) => props.selected.includes(c.id)
function toggle(c, on) { emit('update:selected', on ? [...props.selected, c.id] : props.selected.filter((id) => id !== c.id)) }

function edit(c) {
  ok.value = ''
  error.value = ''
  Object.assign(form, c ? { ...c, questions: toEditorQuestions(c.questions), pillar_ids: [...c.pillar_ids] } : { ...KOSONG, questions: [] })
}
function duplikat() {
  Object.assign(form, { id: null, code: '', name: `${form.name} (salinan)`, active: true,
    questions: toEditorQuestions(toPayloadQuestions(form.questions).map(({ id, ...q }) => q)) })
  ok.value = 'Salinan dibuat. Ubah lalu simpan.'
}
function pasang(saved, baru) {
  const i = props.cases.findIndex((c) => c.id === saved.id)
  if (i >= 0) props.cases.splice(i, 1, saved); else props.cases.push(saved)
  if (baru && saved.active && !inPaket(saved)) toggle(saved, true) // kasus baru langsung masuk paket
  emit('changed')
  edit(saved)
}
async function simpan() {
  busy.value = true
  error.value = ''
  ok.value = ''
  const baru = !form.id
  try {
    pasang(await competencyApi.saveCase(form.id, { ...form, profile_id: props.profileId, questions: toPayloadQuestions(form.questions) }), baru)
    ok.value = baru ? 'Studi kasus disimpan dan dimasukkan ke paket.' : 'Studi kasus disimpan.'
  } catch (e) { error.value = e.message } finally { busy.value = false }
}
async function arsip() {
  busy.value = true
  try {
    const saved = await competencyApi.archiveCase(form.id, !form.active)
    if (!saved.active && inPaket(saved)) toggle(saved, false)
    pasang(saved, false)
  } catch (e) { error.value = e.message } finally { busy.value = false }
}

watch(() => props.profileId, () => edit(kasus.value[0] || null))
onMounted(() => edit(kasus.value[0] || null))
</script>
