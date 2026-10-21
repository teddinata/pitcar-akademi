<!-- Penampil PDF berbasis pdf.js. Dipakai karena Chrome Android tidak bisa
     menampilkan PDF di dalam <iframe> (hanya muncul ikon PDF + tombol "Buka").
     Halaman dirender ke canvas saat mendekati layar, jadi PDF panjang tetap
     ringan di HP. Memakai build legacy pdf.js 3.x supaya jalan di Chrome lama. -->
<template>
  <div class="absolute inset-0 flex flex-col bg-gray-100">
    <div class="flex items-center justify-between gap-2 px-3 py-1.5 bg-white border-b border-gray-200 text-xs text-gray-600 shrink-0">
      <span class="tabular-nums">{{ pageCount ? `${pageCount} halaman` : 'Memuat dokumen…' }}</span>
      <div class="flex items-center gap-1">
        <button type="button" class="w-8 h-8 rounded-lg border border-gray-200 font-bold disabled:opacity-40" :disabled="zoom <= ZOOM_MIN" aria-label="Perkecil" @click="setZoom(zoom - 0.25)">−</button>
        <span class="w-11 text-center tabular-nums">{{ Math.round(zoom * 100) }}%</span>
        <button type="button" class="w-8 h-8 rounded-lg border border-gray-200 font-bold disabled:opacity-40" :disabled="zoom >= ZOOM_MAX" aria-label="Perbesar" @click="setZoom(zoom + 0.25)">+</button>
        <a v-if="downloadUrl" :href="downloadUrl" :download="fileName" class="ml-1 px-2.5 h-8 inline-flex items-center rounded-lg border border-gray-200 font-semibold">Unduh</a>
      </div>
    </div>

    <div ref="scroller" class="flex-1 min-h-0 overflow-auto">
      <div v-if="error" class="h-full flex flex-col items-center justify-center gap-3 px-6 text-center text-sm text-gray-500">
        <p>{{ error }}</p>
        <a v-if="downloadUrl" :href="downloadUrl" :download="fileName" class="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold">Unduh PDF</a>
      </div>
      <div v-else-if="!pageCount" class="h-full flex items-center justify-center">
        <div class="w-9 h-9 border-4 border-blue-300 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
      <div v-else class="py-3 px-2 space-y-3 w-max min-w-full">
        <div
          v-for="page in pages"
          :key="page.number"
          :ref="(el) => setPageEl(page.number, el)"
          :data-page="page.number"
          class="relative mx-auto bg-white shadow"
          :style="{ width: `${pageWidth}px`, height: `${pageWidth * page.ratio}px` }"
        >
          <canvas v-show="page.rendered" class="block w-full h-full"></canvas>
          <span v-if="!page.rendered" class="absolute inset-0 flex items-center justify-center text-xs text-gray-300">Halaman {{ page.number }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'

const props = defineProps({
  blob: { type: Blob, required: true },
  fileName: { type: String, default: 'dokumen.pdf' },
})

const ZOOM_MIN = 0.5
const ZOOM_MAX = 3
// Ketajaman canvas dibatasi supaya HP dengan memori kecil tidak kehabisan memori.
const MAX_DPR = 2

const scroller = ref(null)
const pages = ref([])
const pageCount = ref(0)
const pageWidth = ref(0)
const zoom = ref(1)
const error = ref('')
const downloadUrl = ref('')
const doc = shallowRef(null)

const pageEls = new Map()
let observer = null
let resizeObserver = null
let loadingTask = null
let generation = 0
const renderTasks = new Map()

const setPageEl = (number, el) => {
  if (el) pageEls.set(number, el)
  else pageEls.delete(number)
}

const hitungLebar = () => {
  const lebar = (scroller.value?.clientWidth || 0) - 16
  pageWidth.value = Math.max(200, Math.min(lebar, 1000)) * zoom.value
}

async function renderPage(page) {
  if (page.rendered || renderTasks.has(page.number) || !doc.value) return
  const el = pageEls.get(page.number)
  const canvas = el?.querySelector('canvas')
  if (!canvas) return
  const gen = generation
  const pdfPage = await doc.value.getPage(page.number)
  if (gen !== generation) return
  const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR)
  const dasar = pdfPage.getViewport({ scale: 1 })
  const viewport = pdfPage.getViewport({ scale: (pageWidth.value / dasar.width) * dpr })
  canvas.width = Math.floor(viewport.width)
  canvas.height = Math.floor(viewport.height)
  const task = pdfPage.render({ canvasContext: canvas.getContext('2d'), viewport })
  renderTasks.set(page.number, task)
  try {
    await task.promise
    if (gen === generation) page.rendered = true
  } catch (e) {
    if (e?.name !== 'RenderingCancelledException') console.error('Render PDF gagal', e)
  } finally {
    renderTasks.delete(page.number)
  }
}

function observePages() {
  observer?.disconnect()
  observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue
      const page = pages.value[Number(entry.target.dataset.page) - 1]
      if (page) renderPage(page)
    }
  }, { root: scroller.value, rootMargin: '600px 0px' })
  pageEls.forEach((el) => observer.observe(el))
}

// Ukuran berubah (zoom/rotasi layar): semua halaman digambar ulang.
async function rerender() {
  generation += 1
  renderTasks.forEach((task) => task.cancel())
  renderTasks.clear()
  hitungLebar()
  pages.value.forEach((page) => { page.rendered = false })
  await nextTick()
  observePages()
}

function setZoom(nilai) {
  zoom.value = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, Math.round(nilai * 100) / 100))
  rerender()
}

async function load() {
  error.value = ''
  pages.value = []
  pageCount.value = 0
  try {
    // pdf.js 3.x berformat UMD: hasil build menaruhnya di modul/default, sedangkan
    // dev server tanpa pre-bundle menaruhnya di globalThis.pdfjsLib.
    const modul = await import('pdfjs-dist/legacy/build/pdf')
    const pdfjs = [modul, modul.default, globalThis.pdfjsLib].find((m) => m?.GlobalWorkerOptions)
    const worker = await import('pdfjs-dist/legacy/build/pdf.worker.min.js?url')
    pdfjs.GlobalWorkerOptions.workerSrc = worker.default
    loadingTask = pdfjs.getDocument({ data: new Uint8Array(await props.blob.arrayBuffer()), isEvalSupported: false })
    const pdf = await loadingTask.promise
    doc.value = pdf
    // Rasio tiap halaman dibaca dulu supaya tinggi placeholder benar sebelum digambar.
    const daftar = []
    for (let i = 1; i <= pdf.numPages; i += 1) {
      const vp = (await pdf.getPage(i)).getViewport({ scale: 1 })
      daftar.push({ number: i, ratio: vp.height / vp.width, rendered: false })
    }
    hitungLebar()
    pages.value = daftar
    pageCount.value = pdf.numPages
    await nextTick()
    observePages()
  } catch (e) {
    console.error('Buka PDF gagal', e)
    error.value = 'Dokumen tidak bisa ditampilkan di perangkat ini. Silakan unduh untuk membacanya.'
  }
}

let resizeTimer = null
let lebarTerakhir = 0
onMounted(() => {
  downloadUrl.value = URL.createObjectURL(props.blob)
  lebarTerakhir = scroller.value?.clientWidth || 0
  resizeObserver = new ResizeObserver(() => {
    const lebar = scroller.value?.clientWidth || 0
    if (!pageCount.value || Math.abs(lebar - lebarTerakhir) < 2) return
    lebarTerakhir = lebar
    clearTimeout(resizeTimer)
    resizeTimer = setTimeout(rerender, 200)
  })
  resizeObserver.observe(scroller.value)
  load()
})

watch(() => props.blob, () => {
  if (downloadUrl.value) URL.revokeObjectURL(downloadUrl.value)
  downloadUrl.value = URL.createObjectURL(props.blob)
  zoom.value = 1
  generation += 1
  doc.value?.destroy()
  load()
})

onBeforeUnmount(() => {
  generation += 1
  clearTimeout(resizeTimer)
  observer?.disconnect()
  resizeObserver?.disconnect()
  renderTasks.forEach((task) => task.cancel())
  loadingTask?.destroy()
  doc.value?.destroy()
  if (downloadUrl.value) URL.revokeObjectURL(downloadUrl.value)
})
</script>
