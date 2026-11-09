// Pemantau proses AI ujian lisan di latar. Daftar ujian yang sedang dipantau disimpan di
// localStorage, jadi tetap terpantau saat asesor pindah halaman atau memuat ulang Akademi.
// Status diambil ringan lewat operation oral_status tiap 30 detik (hanya saat tab terlihat).
import { reactive } from 'vue'
import { competencyApi } from '../services/competencyApi'

const KEY = 'akademi.aiWatch'
const INTERVAL = 30000

function baca() {
  try {
    const data = JSON.parse(localStorage.getItem(KEY) || '[]')
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}
function simpan() {
  try {
    localStorage.setItem(KEY, JSON.stringify(aiWatch.items.map(({ oral_id, participant_id, name }) => ({ oral_id, participant_id, name }))))
  } catch { /* penyimpanan ditolak browser: pemantau tetap jalan selama halaman terbuka */ }
}

export const aiWatch = reactive({ items: baca().map((i) => ({ ...i, status: null })) })

export function formatEta(detik) {
  if (detik == null) return 'hampir selesai'
  if (detik < 60) return 'kurang dari 1 menit lagi'
  return `±${Math.ceil(detik / 60)} menit lagi`
}

export function watchOral({ oral_id, participant_id, name, status = null }) {
  const ada = aiWatch.items.find((i) => i.oral_id === oral_id)
  if (ada) {
    if (status) ada.status = status
    return
  }
  aiWatch.items.push({ oral_id, participant_id, name, status })
  simpan()
  mulai()
}

export function unwatchOral(oralId) {
  aiWatch.items = aiWatch.items.filter((i) => i.oral_id !== oralId)
  simpan()
}

export const notifSupported = typeof window !== 'undefined' && 'Notification' in window
export async function mintaIzinNotifikasi() {
  if (!notifSupported) return 'unsupported'
  try {
    return Notification.permission === 'default' ? await Notification.requestPermission() : Notification.permission
  } catch {
    return 'denied'
  }
}

function beriTahu(item) {
  if (!notifSupported || Notification.permission !== 'granted') return
  const selesai = item.status?.ai_state === 'done'
  try {
    const n = new Notification(selesai ? 'Penilaian AI selesai' : 'Penilaian AI berhenti', {
      body: `${item.name || 'Ujian lisan'}: ${selesai ? 'hasil sudah bisa dibuka.' : 'perlu diproses ulang.'}`,
      tag: `oral-${item.oral_id}`,
    })
    n.onclick = () => { window.focus(); window.location.href = `/dashboard/asesmen/rekap/${item.participant_id}` }
  } catch { /* sebagian browser HP hanya mengizinkan notifikasi lewat service worker */ }
}

let timer = null
let jalan = false

async function periksa() {
  const aktif = aiWatch.items.filter((i) => !['done', 'failed'].includes(i.status?.ai_state))
  if (!aktif.length || document.hidden || jalan) return
  jalan = true
  try {
    const rows = await competencyApi.oralStatus(aktif.map((i) => i.oral_id))
    const byId = Object.fromEntries((rows || []).map((r) => [r.oral_id, r]))
    for (const item of aktif) {
      const baru = byId[item.oral_id]
      if (!baru) continue
      const sebelumnya = item.status?.ai_state
      item.status = baru
      if (['done', 'failed'].includes(baru.ai_state) && sebelumnya !== baru.ai_state) beriTahu(item)
    }
  } catch { /* coba lagi di putaran berikutnya */ } finally {
    jalan = false
  }
}

function mulai() {
  if (timer || !aiWatch.items.length) return
  periksa()
  timer = setInterval(() => {
    if (!aiWatch.items.length) { clearInterval(timer); timer = null; return }
    periksa()
  }, INTERVAL)
}

if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => { if (!document.hidden) periksa() })
}

export function startAiWatch() {
  mulai()
}
