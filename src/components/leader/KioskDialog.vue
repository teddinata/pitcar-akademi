<!-- QR kelas: satu QR per program. Peserta memindai, memilih nama (+ 4 digit terakhir No. WA), lalu mengerjakan tesnya. -->
<template>
  <LDialog :open="open" title="QR kelas" subtitle="Tampilkan di layar kelas. Peserta memindai, memilih nama, lalu langsung mengerjakan tes yang dibagikan." @close="$emit('close')">
    <div v-if="loading" class="mx-auto aspect-square w-64 animate-pulse rounded-xl bg-[color:var(--grid-bg)]"></div>
    <ErrorState v-else-if="error" :message="error" @retry="load()" />
    <template v-else-if="info">
      <div class="mx-auto w-full max-w-[18rem] rounded-xl border-[2.5px] border-[color:var(--ink)] bg-white p-3">
        <img :src="qr" alt="QR kelas" class="block h-auto w-full" />
      </div>
      <p class="mt-3 text-center text-sm font-bold">{{ info.open_count }} tes terbuka di program ini</p>
      <ol class="mt-4 space-y-1 text-sm leading-relaxed">
        <li>1. Bagikan soal dulu ke peserta (tombol <b>Bagikan soal</b>). Hanya peserta dengan tes terbuka yang tampil.</li>
        <li>2. Peserta memindai QR, memilih nama, lalu memasukkan 4 digit terakhir nomor WhatsApp (bila nomornya terisi).</li>
        <li>3. Nilai masuk ke Penugasan dan Rekap Nilai seperti biasa.</li>
      </ol>
      <div class="mt-4 flex gap-2">
        <input :value="info.url" readonly class="u-input min-w-0 flex-1 font-mono text-xs" aria-label="Tautan QR kelas" @focus="$event.target.select()" />
        <button type="button" class="u-btn shrink-0" @click="salin"><ClipboardDocumentIcon class="h-5 w-5" aria-hidden="true" />Salin</button>
      </div>
    </template>
    <template #footer>
      <button type="button" class="u-btn" :disabled="!info || busy" @click="regenerate">{{ busy ? 'Membuat…' : 'Buat QR baru' }}</button>
      <button type="button" class="u-btn u-btn-merah" :disabled="!info" @click="besar = true"><ArrowsPointingOutIcon class="h-5 w-5" aria-hidden="true" />Tampilkan besar</button>
    </template>
  </LDialog>

  <ConfirmDialog :open="tanyaBaru" title="Buat QR baru?" message="QR lama tidak bisa dipakai lagi. Peserta yang sedang mengerjakan tes tidak terganggu." confirm-label="Buat QR baru" @cancel="tanyaBaru = false" @confirm="regenerate(true)" />

  <Teleport to="body">
    <div v-if="besar" class="ujian fixed inset-0 z-[90] flex flex-col items-center justify-center gap-5 bg-white p-6 text-center" role="dialog" aria-modal="true" aria-label="QR kelas" @keydown.esc="besar = false" tabindex="-1">
      <p class="u-display text-2xl font-extrabold sm:text-4xl">{{ info?.program }}</p>
      <img :src="qr" alt="QR kelas" class="h-auto w-[min(70vh,85vw)] max-w-full" />
      <p class="text-lg font-bold sm:text-2xl">Pindai, pilih nama Anda, lalu mulai tes.</p>
      <button type="button" class="u-btn" @click="besar = false"><XMarkIcon class="h-5 w-5" aria-hidden="true" />Tutup</button>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue'
import QRCode from 'qrcode'
import { ArrowsPointingOutIcon, ClipboardDocumentIcon, XMarkIcon } from '@heroicons/vue/24/outline'
import { leaderApi } from '../../services/leaderApi'
import { copyText } from '../../utils/leader'
import { notify } from './notice'
import LDialog from './LDialog.vue'
import ConfirmDialog from './ConfirmDialog.vue'
import ErrorState from './ErrorState.vue'

const props = defineProps({ open: Boolean, program: Object })
defineEmits(['close'])

const loading = ref(false)
const busy = ref(false)
const error = ref('')
const info = ref(null)
const qr = ref('')
const besar = ref(false)
const tanyaBaru = ref(false)

async function tampilkan(data) {
  info.value = data
  qr.value = await QRCode.toDataURL(data.url, { width: 720, margin: 1, errorCorrectionLevel: 'M' })
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    await tampilkan(await leaderApi.kiosk(props.program.id))
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

async function regenerate(confirmed = false) {
  if (confirmed !== true) { tanyaBaru.value = true; return }
  tanyaBaru.value = false
  busy.value = true
  try {
    await tampilkan(await leaderApi.kiosk(props.program.id, true))
    notify.success('QR baru siap. QR lama tidak berlaku lagi.')
  } catch (e) {
    notify.error(e.message)
  } finally {
    busy.value = false
  }
}

async function salin() {
  if (await copyText(info.value.url)) notify.success('Tautan QR kelas disalin.')
}

watch(() => props.open, (v) => { if (v) load() })
</script>
