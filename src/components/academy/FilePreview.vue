<!-- Pratinjau bahan materi langsung di layar: PDF (penampil browser), gambar, PPTX (slide dirender di browser),
     DOCX. Format lain: tombol unduh. Pustaka PPTX/DOCX dimuat hanya saat dibutuhkan.
     `load()` mengembalikan Blob file (admin: GET bertoken sesi; mentor/siswa: base64 dari API). -->
<template>
  <Teleport to="body">
    <div v-if="open" class="ujian fixed inset-0 z-[70] flex flex-col bg-black/60 p-2 sm:p-6" role="dialog" aria-modal="true" :aria-label="`Pratinjau ${name}`" @keydown.esc="$emit('close')">
      <div class="mx-auto flex h-full w-full max-w-6xl flex-col overflow-hidden rounded-[14px] border-[2.5px] border-[color:var(--ink)] bg-[color:var(--paper)] shadow-[4px_4px_0_var(--ink)]">
        <header class="flex items-center gap-3 border-b-[2.5px] border-[color:var(--ink)] px-4 py-3">
          <DocumentTextIcon class="h-5 w-5 shrink-0" aria-hidden="true" />
          <p class="min-w-0 flex-1 truncate font-bold" :title="name">{{ name }}</p>
          <span v-if="slides" class="hidden text-xs font-bold tabular-nums text-[color:var(--ink-soft)] sm:inline">{{ slides }} slide</span>
          <a v-if="url && jenis === 'pdf'" :href="url" target="_blank" rel="noopener" class="u-btn !min-h-9 !px-3 !text-sm"><ArrowTopRightOnSquareIcon class="h-4 w-4" />Tab baru</a>
          <button type="button" class="u-btn !min-h-9 !px-3 !text-sm" :disabled="!blob" @click="unduh"><ArrowDownTrayIcon class="h-4 w-4" />Unduh</button>
          <button v-if="removable" type="button" class="u-btn u-btn-ghost u-btn-bahaya !min-h-9 !px-3 !text-sm" @click="$emit('remove')"><TrashIcon class="h-4 w-4" />Hapus</button>
          <button ref="tutupBtn" type="button" class="u-btn !min-h-9 !px-2.5" aria-label="Tutup pratinjau" @click="$emit('close')"><XMarkIcon class="h-5 w-5" /></button>
        </header>
        <div class="relative min-h-0 flex-1 overflow-auto bg-[#e9edf5]">
          <div v-if="loading" class="absolute inset-0 grid place-items-center">
            <p class="flex items-center gap-2 font-bold"><span class="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:animate-none"></span>Membuka {{ name }}…</p>
          </div>
          <div v-else-if="error" class="grid h-full place-items-center p-6 text-center">
            <div>
              <p class="u-display text-lg font-extrabold">Pratinjau tidak tersedia</p>
              <p class="mt-1 text-sm">{{ error }}</p>
              <button v-if="blob" type="button" class="u-btn u-btn-merah mt-4" @click="unduh"><ArrowDownTrayIcon class="h-5 w-5" />Unduh file</button>
            </div>
          </div>
          <iframe v-if="jenis === 'pdf' && url" :src="url" class="h-full w-full border-0 bg-white" :title="name"></iframe>
          <img v-else-if="jenis === 'gambar' && url" :src="url" :alt="name" class="mx-auto max-h-full max-w-full object-contain p-4" />
          <div v-show="jenis === 'pptx' || jenis === 'docx'" ref="wadah" class="mx-auto w-full max-w-[1000px] p-3 sm:p-6"></div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { ArrowDownTrayIcon, ArrowTopRightOnSquareIcon, DocumentTextIcon, TrashIcon, XMarkIcon } from '@heroicons/vue/24/outline'

const props = defineProps({ open: Boolean, name: { type: String, default: '' }, load: { type: Function, required: true }, removable: Boolean })
defineEmits(['close', 'remove'])

const blob = ref(null)
const url = ref('')
const loading = ref(false)
const error = ref('')
const slides = ref(0)
const wadah = ref(null)
const tutupBtn = ref(null)
const ext = computed(() => (props.name.split('.').pop() || '').toLowerCase())
const jenis = computed(() => {
  if (ext.value === 'pdf') return 'pdf'
  if (['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(ext.value)) return 'gambar'
  if (ext.value === 'pptx') return 'pptx'
  if (ext.value === 'docx') return 'docx'
  return 'lain'
})

// Nomor permintaan: file yang selesai dimuat setelah ditutup/diganti tidak menimpa file yang sedang dibuka.
let req = 0

function bersihkan() {
  req++
  if (url.value) URL.revokeObjectURL(url.value)
  url.value = ''
  blob.value = null
  slides.value = 0
  error.value = ''
  if (wadah.value) wadah.value.innerHTML = ''
}

async function buka() {
  bersihkan()
  const my = req
  const basi = () => my !== req
  loading.value = true
  try {
    const b = await props.load()
    if (basi()) return
    const tipe = { pdf: 'application/pdf' }[ext.value]
    blob.value = tipe && b.type !== tipe ? new Blob([b], { type: tipe }) : b
    await nextTick()
    if (jenis.value === 'pdf' || jenis.value === 'gambar') {
      url.value = URL.createObjectURL(blob.value)
    } else if (jenis.value === 'pptx') {
      const { init } = await import('pptx-preview')
      if (basi()) return
      // Mode daftar: `height` = tinggi area gulir semua slide, jadi diisi setinggi jendela pratinjau.
      const area = wadah.value.parentElement
      const lebar = Math.min(wadah.value.clientWidth - 24, 960)
      const viewer = init(wadah.value, { width: lebar, height: Math.max(area.clientHeight - 32, Math.round(lebar * 9 / 16)), mode: 'list' })
      const buf = await blob.value.arrayBuffer()
      if (basi()) return
      await viewer.preview(buf)
      slides.value = viewer.slideCount || wadah.value.querySelectorAll('.pptx-preview-slide-wrapper').length || 0
    } else if (jenis.value === 'docx') {
      const { renderAsync } = await import('docx-preview')
      if (basi()) return
      await renderAsync(blob.value, wadah.value, null, { inWrapper: true })
    } else {
      error.value = `File .${ext.value} belum bisa ditampilkan di sini. Unduh untuk membukanya.`
    }
  } catch (e) {
    if (basi()) return
    error.value = jenis.value === 'pptx'
      ? 'Slide ini tidak bisa dirender di browser (mis. animasi/objek khusus). Unduh untuk membuka di PowerPoint, atau unggah versi PDF.'
      : e.message || 'File tidak bisa dibuka.'
  } finally {
    if (!basi()) {
      loading.value = false
      nextTick(() => tutupBtn.value?.focus())
    }
  }
}

function unduh() {
  if (!blob.value) return
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob.value)
  a.download = props.name
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 1000)
}

watch(() => props.open, (v) => (v ? buka() : bersihkan()))
onBeforeUnmount(bersihkan)
</script>
