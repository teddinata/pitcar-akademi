<!-- QR link tes periode asesmen untuk ditampilkan di kelas: peserta memindai, login, lalu langsung ke lembar tesnya. -->
<template>
  <LDialog :open="open" title="QR link tes" subtitle="Tampilkan di layar kelas. Peserta memindai dengan kamera HP, login dengan akun Akademi, lalu langsung masuk ke tesnya." @close="$emit('close')">
    <div v-if="!qr" class="mx-auto aspect-square w-64 animate-pulse rounded-xl bg-[color:var(--grid-bg)]"></div>
    <div v-else class="mx-auto w-full max-w-[18rem] rounded-xl border-[2.5px] border-[color:var(--ink)] bg-white p-3">
      <img :src="qr" alt="QR link tes" class="block h-auto w-full" />
    </div>
    <p class="mt-3 text-center text-sm font-bold">{{ title }}</p>
    <div class="mt-4 flex gap-2">
      <input :value="url" readonly class="u-input min-w-0 flex-1 font-mono text-xs" aria-label="Link tes" @focus="$event.target.select()" />
      <button type="button" class="u-btn shrink-0" @click="salin"><ClipboardDocumentIcon class="h-5 w-5" aria-hidden="true" />{{ disalin ? 'Disalin' : 'Salin' }}</button>
    </div>
    <template #footer>
      <button type="button" class="u-btn u-btn-merah" :disabled="!qr" @click="besar = true"><ArrowsPointingOutIcon class="h-5 w-5" aria-hidden="true" />Tampilkan besar</button>
    </template>
  </LDialog>

  <Teleport to="body">
    <div v-if="besar" ref="layar" class="ujian fixed inset-0 z-[90] flex flex-col items-center justify-center gap-5 bg-white p-6 text-center" role="dialog" aria-modal="true" aria-label="QR link tes" tabindex="-1" @keydown.esc="besar = false">
      <p class="u-display text-2xl font-extrabold sm:text-4xl">{{ title }}</p>
      <img :src="qr" alt="QR link tes" class="h-auto w-[min(70vh,85vw)] max-w-full" />
      <p class="text-lg font-bold sm:text-2xl">Pindai, login, lalu mulai tes.</p>
      <button type="button" class="u-btn" @click="besar = false"><XMarkIcon class="h-5 w-5" aria-hidden="true" />Tutup</button>
    </div>
  </Teleport>
</template>

<script setup>
import { nextTick, ref, watch } from 'vue'
import QRCode from 'qrcode'
import { ArrowsPointingOutIcon, ClipboardDocumentIcon, XMarkIcon } from '@heroicons/vue/24/outline'
import LDialog from '../leader/LDialog.vue'

const props = defineProps({ open: Boolean, url: { type: String, default: '' }, title: { type: String, default: '' } })
defineEmits(['close'])

const qr = ref('')
const besar = ref(false)
const disalin = ref(false)
const layar = ref(null)

watch(() => [props.open, props.url], async ([open, url]) => {
  if (!open || !url) return
  qr.value = await QRCode.toDataURL(url, { width: 720, margin: 1, errorCorrectionLevel: 'M' })
}, { immediate: true })

watch(besar, async (on) => { if (on) { await nextTick(); layar.value?.focus() } })

async function salin() {
  try {
    await navigator.clipboard.writeText(props.url)
    disalin.value = true
    setTimeout(() => { disalin.value = false }, 2500)
  } catch { /* kolom link bisa dipilih & disalin manual */ }
}
</script>
