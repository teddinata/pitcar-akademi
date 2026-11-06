<!-- Formulir soal inline (tambah / ubah). -->
<template>
  <form class="u-card space-y-4 p-4 !bg-[#fffdf0]" @submit.prevent="$emit('save', form)">
    <div class="grid gap-3 sm:grid-cols-[1fr_120px]">
      <div>
        <label :for="`${uid}-cat`" class="u-label">Kategori</label>
        <input :id="`${uid}-cat`" v-model="form.category" :list="`${uid}-cats`" class="u-input" />
        <datalist :id="`${uid}-cats`"><option v-for="c in categories" :key="c" :value="c" /></datalist>
      </div>
      <div><label :for="`${uid}-pts`" class="u-label">Poin</label><input :id="`${uid}-pts`" v-model.number="form.points" type="number" min="0" step="any" class="u-input" /></div>
    </div>
    <div><label :for="`${uid}-text`" class="u-label">Teks soal</label><textarea :id="`${uid}-text`" v-model="form.text" rows="3" class="u-input" required></textarea></div>
    <fieldset>
      <legend class="u-label">Pilihan jawaban</legend>
      <div v-for="(o, i) in form.options" :key="i" class="mb-2 flex items-center gap-2">
        <span class="u-nomor !h-9 !w-9 !text-base">{{ LETTERS[i] }}</span>
        <input v-model="o.text" class="u-input" :aria-label="`Pilihan ${LETTERS[i]}`" />
        <button type="button" class="u-btn u-btn-ghost !min-h-11 !w-11 shrink-0 !p-0" :aria-label="`Hapus pilihan ${LETTERS[i]}`" :disabled="form.options.length <= 2" @click="removeOption(i)"><XMarkIcon class="h-5 w-5" /></button>
      </div>
      <button v-if="form.options.length < 6" type="button" class="u-btn u-btn-ghost u-btn-kecil underline underline-offset-4" @click="form.options.push({ text: '' })">+ Tambah pilihan</button>
    </fieldset>
    <div>
      <label :for="`${uid}-key`" class="u-label">Kunci jawaban</label>
      <select :id="`${uid}-key`" v-model="form.answer_key" class="u-input"><option value="">Belum ditentukan</option><option v-for="(o, i) in filled" :key="i" :value="LETTERS[form.options.indexOf(o)]">{{ LETTERS[form.options.indexOf(o)] }}. {{ o.text }}</option></select>
    </div>
    <div><label :for="`${uid}-exp`" class="u-label">Pembahasan</label><textarea :id="`${uid}-exp`" v-model="form.explanation" rows="2" class="u-input"></textarea></div>
    <div><label :for="`${uid}-ref`" class="u-label">Rujukan</label><input :id="`${uid}-ref`" v-model="form.reference" class="u-input" /></div>
    <div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
      <button type="button" class="u-btn" @click="$emit('cancel')">Batal</button>
      <button type="submit" class="u-btn u-btn-merah" :disabled="saving">{{ saving ? 'Menyimpan...' : 'Simpan soal' }}</button>
    </div>
  </form>
</template>

<script setup>
import { computed, reactive } from 'vue'
import { XMarkIcon } from '@heroicons/vue/24/outline'

const props = defineProps({ model: Object, categories: Array, saving: Boolean })
defineEmits(['save', 'cancel'])
const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F']
const uid = `q${props.model.id || 'new'}`
const form = reactive({ ...props.model, options: props.model.options.map((o) => ({ text: o.text })) })
const filled = computed(() => form.options.filter((o) => o.text.trim()))
const removeOption = (i) => {
  const removed = LETTERS[i]
  form.options.splice(i, 1)
  if (form.answer_key === removed) form.answer_key = ''
  else if (form.answer_key && LETTERS.indexOf(form.answer_key) > i) form.answer_key = LETTERS[LETTERS.indexOf(form.answer_key) - 1]
}
</script>
