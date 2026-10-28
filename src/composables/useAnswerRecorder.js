// Perekam jawaban lisan studi kasus (port dari perekam wawancara PitClock).
// - Hanya suara (bitrate rendah), potongan tiap 10 detik langsung diunggah lewat
//   antrean berurutan; potongan tidak hilang saat sinyal putus.
// - Segmen baru otomatis tiap SEGMENT_MS supaya file tetap di bawah batas
//   layanan transkripsi.
// - marker() mencatat waktu pindah pertanyaan supaya transkrip terbagi per pertanyaan.
import { computed, onBeforeUnmount, ref } from 'vue'
import { competencyApi } from '../services/competencyApi'
import { createUploadQueue } from '../utils/uploadQueue'

const TIMESLICE_MS = 10000
const SEGMENT_MS = 45 * 60 * 1000
const BITRATE = 32000
const MIME_CANDIDATES = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4']

const blobToBase64 = (blob) => new Promise((resolve, reject) => {
  const reader = new FileReader()
  reader.onload = () => resolve(String(reader.result).split(',')[1] || '')
  reader.onerror = () => reject(new Error('Potongan rekaman tidak bisa dibaca'))
  reader.readAsDataURL(blob)
})

export const recorderSupported = () => typeof window !== 'undefined' && !!window.MediaRecorder && !!navigator.mediaDevices?.getUserMedia

export function useAnswerRecorder() {
  const state = ref('idle') // idle | starting | recording | paused | stopping
  const error = ref('')
  const elapsed = ref(0)
  const upload = ref({ pending: 0, failing: false, stopped: false })
  const level = ref(0) // volume mikrofon 0-1 untuk indikator

  let stream = null
  let recorder = null
  let recordingId = null
  let seq = 0
  let segmentStart = 0
  let lastTick = 0
  let timer = null
  let rotateTimer = null
  let attemptId = null
  let mimeType = ''
  let konversi = Promise.resolve()
  let audioCtx = null
  let analyser = null
  let meterFrame = null

  const queue = createUploadQueue({
    send: (item) => (item.kind === 'chunk'
      ? competencyApi.recordingChunk(item.recordingId, item.seq, item.data, item.duration)
      : item.kind === 'marker'
        ? competencyApi.recordingMarker(item.recordingId, item.t, item.code, item.label)
        : competencyApi.recordingStop(item.recordingId, item.duration)),
    onChange: (s) => { upload.value = s },
  })

  const tick = () => {
    const now = Date.now()
    if (state.value === 'recording') elapsed.value += (now - lastTick) / 1000
    lastTick = now
  }

  const startMeter = () => {
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)()
      analyser = audioCtx.createAnalyser()
      analyser.fftSize = 512
      audioCtx.createMediaStreamSource(stream).connect(analyser)
      const buf = new Uint8Array(analyser.fftSize)
      const loop = () => {
        analyser.getByteTimeDomainData(buf)
        let peak = 0
        for (const v of buf) peak = Math.max(peak, Math.abs(v - 128))
        level.value = state.value === 'recording' ? Math.min(1, peak / 64) : 0
        meterFrame = requestAnimationFrame(loop)
      }
      loop()
    } catch { /* indikator volume opsional */ }
  }

  const stopMeter = () => {
    cancelAnimationFrame(meterFrame)
    audioCtx?.close().catch(() => {})
    audioCtx = null
    level.value = 0
  }

  const startSegment = async () => {
    const hasil = await competencyApi.recordingStart(attemptId, true, mimeType)
    recordingId = hasil.recording_id
    seq = 0
    segmentStart = elapsed.value
    recorder = new MediaRecorder(stream, { mimeType, audioBitsPerSecond: BITRATE })
    const idSegmen = recordingId
    const mulaiSegmen = segmentStart
    recorder.ondataavailable = (e) => {
      if (!e.data || !e.data.size) return
      const nomor = seq
      seq += 1
      const durasi = elapsed.value - mulaiSegmen
      konversi = konversi
        .then(() => blobToBase64(e.data))
        .then((data) => queue.push({ kind: 'chunk', recordingId: idSegmen, seq: nomor, data, duration: durasi }))
        .catch((err) => { error.value = err.message })
    }
    recorder.start(TIMESLICE_MS)
    clearTimeout(rotateTimer)
    rotateTimer = setTimeout(rotate, SEGMENT_MS)
  }

  const stopSegment = () => new Promise((resolve) => {
    if (!recorder || recorder.state === 'inactive') { resolve(); return }
    const idSegmen = recordingId
    const durasi = elapsed.value - segmentStart
    recorder.addEventListener('stop', () => {
      konversi = konversi.then(() => queue.push({ kind: 'stop', recordingId: idSegmen, duration: durasi }))
      konversi.then(resolve)
    }, { once: true })
    recorder.stop()
  })

  const rotate = async () => {
    if (state.value !== 'recording') return
    await stopSegment()
    try { await startSegment() } catch (err) { error.value = err.message; state.value = 'idle' }
  }

  const start = async (idAttempt) => {
    if (!recorderSupported()) { error.value = 'Browser ini tidak bisa merekam suara. Pakai Chrome atau Safari versi terbaru.'; return false }
    error.value = ''
    state.value = 'starting'
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, channelCount: 1 } })
      mimeType = MIME_CANDIDATES.find((m) => MediaRecorder.isTypeSupported(m)) || ''
      attemptId = idAttempt
      await startSegment()
      lastTick = Date.now()
      timer = setInterval(tick, 500)
      state.value = 'recording'
      startMeter()
      return true
    } catch (err) {
      error.value = err?.name === 'NotAllowedError' ? 'Izin mikrofon ditolak. Izinkan mikrofon untuk situs ini di browser.' : (err.message || 'Gagal mulai merekam')
      stream?.getTracks().forEach((t) => t.stop())
      state.value = 'idle'
      return false
    }
  }

  const pause = () => { if (recorder?.state === 'recording') { tick(); recorder.pause(); state.value = 'paused' } }
  const resume = () => { if (recorder?.state === 'paused') { lastTick = Date.now(); recorder.resume(); state.value = 'recording' } }

  const marker = (code, label) => {
    if (!recordingId || !['recording', 'paused'].includes(state.value)) return
    queue.push({ kind: 'marker', recordingId, t: Math.round((elapsed.value - segmentStart) * 10) / 10, code, label })
  }

  const stop = async () => {
    if (!['recording', 'paused'].includes(state.value)) return queue.status()
    tick()
    state.value = 'stopping'
    clearTimeout(rotateTimer)
    clearInterval(timer)
    await stopSegment()
    stream?.getTracks().forEach((t) => t.stop())
    stream = null
    stopMeter()
    const hasil = await queue.drain()
    state.value = 'idle'
    return hasil
  }

  const active = computed(() => ['recording', 'paused', 'stopping'].includes(state.value))
  const peringatanTutup = (e) => { if (active.value || upload.value.pending) { e.preventDefault(); e.returnValue = '' } }
  window.addEventListener('beforeunload', peringatanTutup)
  onBeforeUnmount(() => {
    window.removeEventListener('beforeunload', peringatanTutup)
    clearTimeout(rotateTimer)
    clearInterval(timer)
    if (recorder && recorder.state !== 'inactive') recorder.stop()
    stream?.getTracks().forEach((t) => t.stop())
    stopMeter()
  })

  return { state, error, elapsed, upload, level, active, start, pause, resume, marker, stop, retryUpload: () => queue.retry() }
}
