// Onboarding tour (driver.js) per halaman.
// - Muncul otomatis sekali per pengguna. Langkah terakhir yang dilihat disimpan
//   (server + cache lokal), jadi reload/ganti perangkat melanjutkan dari situ,
//   bukan mengulang dari awal.
// - Ditutup (Lewati / X / Esc) atau selesai = tidak muncul otomatis lagi;
//   tombol "?" memutar ulang dari awal kapan saja.
// - Hanya satu tour aktif; langkah yang elemennya tidak ada di layar dilewati.
import { onBeforeUnmount } from 'vue'
import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'
import '../styles/tour.css'
import { competencyApi } from '../services/competencyApi'

const cacheKey = () => `akademi-tour:${localStorage.getItem('uid') || 'anon'}`
let serverLoad = null
let active = null

function readCache() {
  try {
    const data = JSON.parse(localStorage.getItem(cacheKey()) || '{}')
    return data && typeof data === 'object' ? data : {}
  } catch {
    return {}
  }
}
function writeCache(name, step, done) {
  try {
    const data = readCache()
    const cur = data[name] || {}
    data[name] = { step: Math.max(cur.step || 0, step), done: !!cur.done || done }
    localStorage.setItem(cacheKey(), JSON.stringify(data))
  } catch { /* penyimpanan lokal opsional */ }
}
function loadServer() {
  if (!serverLoad) {
    serverLoad = competencyApi.tours().then((remote) => {
      Object.entries(remote || {}).forEach(([name, s]) => writeCache(name, s.step || 0, !!s.done))
    }).catch(() => { serverLoad = null })
  }
  return serverLoad
}
function save(name, step, done = false) {
  writeCache(name, step, done)
  competencyApi.saveTour(name, step, done).catch(() => { /* cache lokal tetap menahan tour */ })
}

/**
 * @param {string} name kunci tour, mis. 'peserta-tes'
 * @param {() => Array<{element?: string, title: string, text: string}>} buildSteps
 */
export function useTour(name, buildSteps) {
  let instance = null
  let leaving = false

  const visibleSteps = () => buildSteps().filter((s) => !s.element || document.querySelector(s.element))

  function run(fromStep) {
    if (active) return
    const steps = visibleSteps()
    if (!steps.length) return
    const startAt = Math.min(Math.max(0, fromStep), steps.length - 1)
    instance = driver({
      popoverClass: 'akademi-tour',
      showProgress: true,
      progressText: '{{current}} dari {{total}}',
      nextBtnText: 'Lanjut',
      prevBtnText: 'Kembali',
      doneBtnText: 'Selesai',
      allowClose: true,
      overlayClickBehavior: () => {}, // klik di luar tidak menutup tanpa sengaja
      stagePadding: 6,
      stageRadius: 12,
      smoothScroll: true,
      steps: steps.map((s) => ({
        element: s.element,
        popover: { title: s.title, description: s.text, side: s.side, align: s.align || 'start' },
      })),
      onHighlighted: (_el, _step, { state }) => save(name, state.activeIndex || 0),
      // Tombol tutup: ikon garis dari CSS (tour.css), bukan glyph teks ×. Tombol harus
      // kosong: driver.js mengenali klik dari event.target, anak elemen akan menelan klik.
      onPopoverRender: (popover) => {
        popover.closeButton.innerHTML = ''
        popover.closeButton.setAttribute('aria-label', 'Lewati panduan')
      },
      onDestroyed: () => {
        if (!leaving) save(name, steps.length - 1, true)
        active = null
        instance = null
      },
    })
    active = instance
    instance.drive(startAt)
  }

  /** Jalankan otomatis bila belum pernah selesai/dilewati. */
  async function autoStart() {
    const cached = readCache()[name]
    if (cached?.done) return
    await loadServer()
    const state = readCache()[name]
    if (state?.done || leaving || document.visibilityState === 'hidden') return
    // beri waktu layout selesai (gambar, data) supaya posisi sorotan tepat
    setTimeout(() => { if (!leaving) run(state?.step || 0) }, 450)
  }

  /** Putar ulang dari awal (tombol "?"). */
  function replay() {
    if (active && active !== instance) return
    instance?.destroy()
    run(0)
  }

  onBeforeUnmount(() => {
    leaving = true // pindah halaman di tengah tour: lanjutkan lain kali, jangan tandai selesai
    instance?.destroy()
  })

  return { autoStart, replay }
}
