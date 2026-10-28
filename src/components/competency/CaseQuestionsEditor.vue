<!-- Daftar pertanyaan studi kasus: esai atau pilihan ganda. Tiap opsi pilihan
     ganda mewakili satu jenjang (L1-L4); peserta tidak melihat jenjangnya dan
     urutan opsi diacak per peserta. -->
<template>
  <div>
    <div class="flex items-baseline justify-between gap-3">
      <span class="text-xs font-semibold text-gray-600">Pertanyaan ({{ questions.length }})</span>
      <span class="text-xs text-gray-500">{{ ringkas }}</span>
    </div>

    <ol class="mt-2 space-y-3">
      <li v-for="(q, i) in questions" :key="q._key" class="rounded-xl border border-gray-200 bg-white p-3 sm:p-4">
        <div class="flex flex-wrap items-center gap-2">
          <span class="grid place-items-center w-7 h-7 rounded-lg bg-gray-900 text-white text-xs font-bold">{{ i + 1 }}</span>
          <div class="inline-flex rounded-lg bg-gray-100 p-0.5" role="radiogroup" :aria-label="`Tipe pertanyaan ${i + 1}`">
            <button
              v-for="t in TYPES" :key="t.key" type="button" role="radio" :aria-checked="q.qtype === t.key"
              class="px-2.5 py-1 rounded-md text-xs font-semibold transition-colors"
              :class="q.qtype === t.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'"
              @click="setType(q, t.key)"
            >{{ t.label }}</button>
          </div>
          <select v-model="q.pillar_id" class="h-8 rounded-lg border border-gray-200 bg-white px-2 text-xs" :aria-label="`Pilar pertanyaan ${i + 1}`">
            <option :value="null">{{ q.qtype === 'choice' ? 'Pilih pilar…' : 'Semua pilar (dinilai AI)' }}</option>
            <option v-for="p in pillars" :key="p.id" :value="p.id">{{ p.name }}</option>
          </select>
          <span class="flex-1"></span>
          <button type="button" class="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-30" :disabled="i === 0" :aria-label="`Naikkan pertanyaan ${i + 1}`" @click="move(i, -1)"><ArrowUpIcon class="w-4 h-4" /></button>
          <button type="button" class="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-30" :disabled="i === questions.length - 1" :aria-label="`Turunkan pertanyaan ${i + 1}`" @click="move(i, 1)"><ArrowDownIcon class="w-4 h-4" /></button>
          <button type="button" class="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-700" :aria-label="`Hapus pertanyaan ${i + 1}`" @click="questions.splice(i, 1)"><XMarkIcon class="w-4 h-4" /></button>
        </div>

        <textarea
          v-model="q.text" rows="2" :class="FIELD" class="!h-auto py-2"
          :placeholder="q.qtype === 'choice' ? 'Mis. Apa yang pertama Anda lakukan saat menerima mobil ini?' : 'Mis. Jelaskan langkah pemeriksaan Anda dan alasannya.'"
        ></textarea>
        <p v-if="q.qtype === 'choice' && !q.pillar_id" class="mt-1 text-xs text-amber-700">Pilih pilar: jenjang opsi yang dipilih peserta masuk ke pilar ini.</p>

        <div v-if="q.qtype === 'choice'" class="mt-3 space-y-2">
          <div v-for="(o, j) in q.options" :key="j" class="flex items-center gap-2">
            <span class="grid place-items-center w-7 h-7 shrink-0 rounded-full border-2 border-[#b70000] text-[#b70000] text-xs font-bold">{{ KEYS[j] }}</span>
            <input v-model="o.text" :class="FIELD" class="!mt-0 flex-1" :placeholder="`Tindakan khas L${o.level || j + 1}`" />
            <select v-model.number="o.level" class="h-10 w-36 sm:w-48 shrink-0 rounded-lg border border-gray-200 bg-white px-2 text-xs" :aria-label="`Jenjang opsi ${KEYS[j]}`">
              <option v-for="n in [1, 2, 3, 4]" :key="n" :value="n">L{{ n }} · {{ levelName(n, levelNames) }}</option>
            </select>
            <button type="button" class="p-1.5 text-gray-400 hover:text-red-700 disabled:opacity-30" :disabled="q.options.length <= 2" :aria-label="`Hapus opsi ${KEYS[j]}`" @click="q.options.splice(j, 1)"><XMarkIcon class="w-4 h-4" /></button>
          </div>
          <div class="flex flex-wrap items-center justify-between gap-2">
            <button v-if="q.options.length < KEYS.length" type="button" class="text-xs font-semibold text-blue-700" @click="q.options.push({ text: '', level: nextLevel(q) })">+ Tambah opsi</button>
            <span v-if="kurangJenjang(q)" class="text-xs text-gray-500">Belum ada opsi untuk {{ kurangJenjang(q) }}. Idealnya satu opsi per jenjang.</span>
          </div>
        </div>
      </li>
    </ol>

    <div class="mt-3 flex flex-wrap gap-2">
      <button type="button" class="px-3 py-2 rounded-lg text-sm font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100" @click="add('choice')">+ Pilihan ganda</button>
      <button type="button" class="px-3 py-2 rounded-lg text-sm font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100" @click="add('essay')">+ Esai</button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { ArrowDownIcon, ArrowUpIcon, XMarkIcon } from '@heroicons/vue/24/outline'
import { levelName } from '../../utils/competency'

const props = defineProps({
  questions: { type: Array, required: true }, // dimutasi langsung (reactive milik form induk)
  pillars: { type: Array, default: () => [] },
  levelNames: { type: Object, default: null },
})

const FIELD = 'mt-2 w-full h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300'
const TYPES = [{ key: 'choice', label: 'Pilihan ganda' }, { key: 'essay', label: 'Esai' }]
const KEYS = ['A', 'B', 'C', 'D', 'E', 'F']
let seq = 0

const ringkas = computed(() => {
  const pg = props.questions.filter((q) => q.qtype === 'choice').length
  return `${pg} pilihan ganda · ${props.questions.length - pg} esai`
})

const blankOptions = () => [1, 2, 3, 4].map((level) => ({ text: '', level }))
function add(qtype) {
  props.questions.push({ _key: `baru-${++seq}`, id: null, qtype, text: '', pillar_id: null, options: qtype === 'choice' ? blankOptions() : [] })
}
function setType(q, qtype) {
  q.qtype = qtype
  if (qtype === 'choice' && !q.options.length) q.options = blankOptions()
}
function move(i, d) {
  const [q] = props.questions.splice(i, 1)
  props.questions.splice(i + d, 0, q)
}
function nextLevel(q) {
  return [1, 2, 3, 4].find((n) => !q.options.some((o) => o.level === n)) || 4
}
function kurangJenjang(q) {
  const missing = [1, 2, 3, 4].filter((n) => !q.options.some((o) => o.level === n && o.text.trim()))
  return missing.length && missing.length < 4 ? missing.map((n) => `L${n}`).join(', ') : ''
}
</script>

<script>
// Data admin -> baris editor (dengan _key stabil untuk v-for), dan sebaliknya.
export function toEditorQuestions(questions = []) {
  return questions.map((q, i) => ({
    _key: q.id ? `q-${q.id}` : `x-${i}`, id: q.id || null, qtype: q.qtype || 'essay', text: q.text || '',
    pillar_id: q.pillar_id || null, options: (q.options || []).map((o) => ({ text: o.text, level: o.level })),
  }))
}
export function toPayloadQuestions(questions = []) {
  return questions.map(({ _key, ...q }) => ({ ...q, options: q.qtype === 'choice' ? q.options.filter((o) => o.text.trim()) : [] }))
}
</script>
