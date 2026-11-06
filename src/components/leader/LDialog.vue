<!-- Dialog umum gaya Akademi: layar penuh di mobile, kartu di tengah di desktop. -->
<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-[70] flex items-stretch justify-center bg-black/50 sm:items-center sm:p-6" @click.self="$emit('close')">
      <section role="dialog" aria-modal="true" :aria-label="title" tabindex="-1" ref="panel"
        class="ujian l-dialog flex h-full w-full flex-col border-[2.5px] border-[color:var(--ink)] outline-none sm:h-auto sm:max-h-[90vh] sm:rounded-[14px] sm:shadow-[6px_6px_0_var(--ink)]"
        :class="wide ? 'sm:max-w-3xl' : 'sm:max-w-lg'" @keydown.esc="$emit('close')">
        <header class="flex items-start justify-between gap-3 border-b-[2.5px] border-[color:var(--ink)] px-4 py-3 sm:px-6 sm:py-4">
          <div class="min-w-0">
            <h2 class="u-display text-xl font-extrabold leading-tight">{{ title }}</h2>
            <p v-if="subtitle" class="mt-0.5 text-sm text-[color:var(--ink-soft)]">{{ subtitle }}</p>
          </div>
          <button type="button" class="u-btn !min-h-11 !w-11 !p-0 shrink-0" aria-label="Tutup" @click="$emit('close')"><XMarkIcon class="h-5 w-5" /></button>
        </header>
        <div class="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6"><slot /></div>
        <footer v-if="$slots.footer" class="flex flex-col-reverse gap-2 border-t-[2.5px] border-[color:var(--ink)] px-4 py-3 sm:flex-row sm:justify-end sm:px-6">
          <slot name="footer" />
        </footer>
      </section>
    </div>
  </Teleport>
</template>

<script setup>
import { nextTick, ref, watch } from 'vue'
import { XMarkIcon } from '@heroicons/vue/24/outline'

const props = defineProps({ open: Boolean, title: { type: String, default: '' }, subtitle: { type: String, default: '' }, wide: Boolean })
defineEmits(['close'])
const panel = ref(null)
watch(() => props.open, async (v) => { if (v) { await nextTick(); panel.value?.focus() } })
</script>
