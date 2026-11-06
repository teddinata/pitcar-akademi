// Pemberitahuan singkat (pengganti toast/alert). Tampilkan lewat <LNotice /> di halaman.
import { reactive } from 'vue'

export const noticeState = reactive({ text: '', type: 'success', seq: 0 })
let timer = null

function show(type, text) {
  noticeState.type = type
  noticeState.text = text
  noticeState.seq++
  clearTimeout(timer)
  timer = setTimeout(() => { noticeState.text = '' }, type === 'error' ? 7000 : 3500)
}

export const notify = {
  success: (t) => show('success', t),
  error: (t) => show('error', t || 'Terjadi kesalahan. Coba lagi.'),
}
