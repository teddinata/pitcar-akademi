<!-- Pilih beberapa orang (karyawan atau pengguna) lewat pencarian. -->
<template>
  <div class="relative">
    <div class="flex flex-wrap gap-1.5" :class="modelValue.length ? 'mb-2' : ''">
      <span v-for="p in modelValue" :key="p.id" class="u-chip !py-1">
        {{ p.name }}
        <button type="button" class="-mr-1 grid place-items-center w-5 h-5 rounded-full hover:bg-black/10" :aria-label="`Hapus ${p.name}`" @click="hapus(p)"><XMarkIcon class="w-3.5 h-3.5" /></button>
      </span>
    </div>
    <input v-model="q" class="u-input" :placeholder="placeholder" @input="cari" @focus="cari" @keydown.esc="hasil = []" />
    <ul v-if="hasil.length" class="absolute z-30 mt-1 w-full max-h-64 overflow-y-auto u-card !shadow-[4px_4px_0_var(--ink)] divide-y-2 divide-[color:var(--ink)]">
      <li v-for="p in hasil" :key="p.id">
        <button type="button" class="w-full text-left px-3 py-2.5 hover:bg-[#fffbe0]" @click="pilih(p)">
          <span class="font-bold">{{ p.name }}</span>
          <span v-if="p.job || p.login" class="block text-xs text-[color:var(--ink-soft)]">{{ [p.job, p.department, p.login].filter(Boolean).join(' · ') }}</span>
        </button>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { XMarkIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  search: { type: Function, required: true },
  placeholder: { type: String, default: 'Ketik nama…' },
})
const emit = defineEmits(['update:modelValue'])
const q = ref('')
const hasil = ref([])
let timer = null

function cari() {
  clearTimeout(timer)
  timer = setTimeout(async () => {
    try {
      const ada = new Set(props.modelValue.map((p) => p.id))
      hasil.value = (await props.search(q.value)).filter((p) => !ada.has(p.id)).slice(0, 12)
    } catch { hasil.value = [] }
  }, 220)
}
function pilih(p) {
  emit('update:modelValue', [...props.modelValue, { id: p.id, name: p.name }])
  q.value = ''
  hasil.value = []
}
function hapus(p) { emit('update:modelValue', props.modelValue.filter((x) => x.id !== p.id)) }
</script>
