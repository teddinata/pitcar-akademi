<!-- Pembagian studi kasus: acak N kasus per peserta (N < jumlah kasus terpilih) atau semua kasus. -->
<template>
  <div>
    <div class="grid grid-cols-2 gap-2">
      <button v-for="m in pilihan" :key="m.key" type="button" class="u-tab !min-h-0 !py-2 text-left !whitespace-normal" :class="mode === m.key ? 'is-active' : ''" :aria-pressed="mode === m.key" @click="emit('update:mode', m.key)">
        <span class="block">{{ m.label }}</span><span class="block text-xs font-semibold opacity-80">{{ m.teks }}</span>
      </button>
    </div>
    <label v-if="mode === 'random' && maks > 1" class="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1">
      <span class="text-sm font-bold">Jumlah kasus per peserta</span>
      <select :value="jumlah" class="u-input !w-auto !py-1.5" @change="emit('update:count', Number($event.target.value))">
        <option v-for="n in maks" :key="n" :value="n">{{ n }} kasus</option>
      </select>
      <span class="basis-full text-xs text-[color:var(--ink-soft)]">Diambil acak dari {{ total }} kasus terpilih dan dibagi merata antar peserta.</span>
    </label>
  </div>
</template>

<script setup>
import { computed, watch } from 'vue'

const props = defineProps({
  mode: { type: String, default: 'random' }, count: { type: Number, default: 1 }, total: { type: Number, default: 0 },
  allText: { type: String, default: 'Setiap peserta mengerjakan semua kasus terpilih.' },
})
const emit = defineEmits(['update:mode', 'update:count'])

// Acak hanya bermakna bila jumlahnya kurang dari kasus terpilih; kalau sama, itu "Semua kasus".
const maks = computed(() => Math.max(1, props.total - 1))
const jumlah = computed(() => Math.min(Math.max(1, Math.trunc(Number(props.count)) || 1), maks.value))
const pilihan = computed(() => [
  { key: 'random', label: `Acak ${jumlah.value} kasus`, teks: 'Peserta berurutan dapat kasus berbeda (anti contek).' },
  { key: 'all', label: 'Semua kasus', teks: props.allText },
])
// Nilai induk di luar rentang (mis. tersimpan 3 padahal kasus terpilih tinggal 2) selalu dirapikan,
// supaya yang disimpan sama dengan yang tampil.
watch(() => [jumlah.value, props.count], ([n, asal]) => { if (n !== asal) emit('update:count', n) }, { immediate: true })
</script>
