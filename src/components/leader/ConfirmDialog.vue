<!-- Konfirmasi tindakan (pengganti window.confirm). -->
<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4" @click.self="$emit('cancel')">
      <section role="alertdialog" aria-modal="true" :aria-label="title" tabindex="-1" ref="panel"
        class="ujian l-dialog w-full max-w-sm rounded-[14px] border-[2.5px] border-[color:var(--ink)] p-5 shadow-[6px_6px_0_var(--ink)] outline-none" @keydown.esc="$emit('cancel')">
        <h2 class="u-display text-xl font-extrabold">{{ title }}</h2>
        <p class="mt-2 text-sm leading-relaxed text-[color:var(--ink-soft)]">{{ message }}</p>
        <div class="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" class="u-btn" :disabled="busy" @click="$emit('cancel')">Batal</button>
          <button type="button" class="u-btn u-btn-merah" :disabled="busy" @click="$emit('confirm')">{{ busy ? 'Memproses...' : confirmLabel }}</button>
        </div>
      </section>
    </div>
  </Teleport>
</template>

<script setup>
import { nextTick, ref, watch } from 'vue'

const props = defineProps({ open: Boolean, title: String, message: String, confirmLabel: { type: String, default: 'Ya, lanjutkan' }, busy: Boolean })
defineEmits(['confirm', 'cancel'])
const panel = ref(null)
watch(() => props.open, async (v) => { if (v) { await nextTick(); panel.value?.focus() } })
</script>
