<!-- Pemutar rekaman jawaban + transkrip bertanda waktu. Klik baris transkrip
     untuk loncat; seek(kind, detik) dipakai tombol kutipan AI. -->
<template>
  <div class="space-y-3">
    <p v-if="!recordings.length" class="rounded-lg border-2 border-dashed border-[color:var(--ink)] p-3 text-sm font-bold">Tidak ada rekaman.</p>
    <div v-for="r in recordings" :key="r.id" class="rounded-xl border-2 border-[color:var(--ink)] p-3 bg-white" :class="r.excluded ? 'opacity-60 border-dashed' : ''">
      <div class="flex flex-wrap items-center gap-2 mb-2">
        <span class="u-chip" :class="r.kind === 'followup' ? 'u-chip-kuning' : ''">{{ r.kind === 'followup' ? 'Jawaban pertanyaan lanjutan' : 'Jawaban utama' }}</span>
        <span v-if="r.uploaded_by" class="u-chip" :title="r.filename">Dilampirkan {{ r.uploaded_by }}</span>
        <span class="text-xs font-bold text-[color:var(--ink-soft)]">{{ r.duration ? `${mmss(r.duration)} · ` : '' }}{{ r.transcript_state === 'done' ? `${kata(r)} kata` : r.transcript_state === 'failed' ? '' : 'belum ditranskripsi' }}</span>
        <span v-if="r.transcript_state === 'failed'" class="u-chip u-chip-merah">Transkripsi gagal</span>
        <span v-if="r.excluded" class="u-chip">Diabaikan, tidak dinilai</span>
        <span v-if="editable" class="ml-auto flex flex-wrap gap-1.5">
          <button v-if="!r.excluded && !r.purged && r.size" type="button" class="u-btn !min-h-8 !px-2 !text-xs" :disabled="busy" @click="emit('retranscribe', r)"><ArrowPathIcon class="w-4 h-4" />Transkripsi ulang</button>
          <button type="button" class="u-btn !min-h-8 !px-2 !text-xs" :disabled="busy" @click="emit('use', r, r.excluded)">{{ r.excluded ? 'Pakai lagi' : 'Abaikan' }}</button>
        </span>
      </div>
      <p v-if="editable && r.transcript_state === 'failed' && r.transcript_error" class="mb-2 text-xs font-bold text-[color:var(--merah-tua)] break-words">{{ r.transcript_error }}</p>
      <p v-if="r.purged" class="text-sm font-bold">Rekaman sudah dihapus otomatis (lebih dari 90 hari). Transkrip tetap tersimpan.</p>
      <audio v-else :ref="(el) => setAudio(r.id, el)" :src="competencyApi.audioUrl(r.id)" controls preload="metadata" class="u-audio" @timeupdate="(e) => { now[r.id] = e.target.currentTime }"></audio>
      <div v-if="r.segments?.length" class="u-transkrip mt-2">
        <button v-for="(s, i) in r.segments" :key="i" type="button" :class="aktif(r, s, i) ? 'is-now' : ''" @click="lompat(r.id, s.start)">
          <time>{{ r.kind === 'followup' ? 'L' : '' }}{{ mmss(s.start) }}</time><span>{{ s.text }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { ArrowPathIcon } from '@heroicons/vue/24/outline'
import { competencyApi } from '../../services/competencyApi'
import { mmss } from '../../utils/competency'

const props = defineProps({
  recordings: { type: Array, default: () => [] },
  editable: { type: Boolean, default: false }, // asesor: transkripsi ulang / abaikan rekaman
  busy: { type: Boolean, default: false },
})
const emit = defineEmits(['retranscribe', 'use'])
const audios = {}
const now = reactive({})
const setAudio = (id, el) => { if (el) audios[id] = el }
const kata = (r) => (r.segments || []).reduce((n, s) => n + (s.text || '').split(/\s+/).filter(Boolean).length, 0)
const aktif = (r, s, i) => {
  const t = now[r.id]
  if (t == null) return false
  const next = r.segments[i + 1]
  return t >= s.start && (!next || t < next.start)
}

function lompat(id, t) {
  const el = audios[id]
  if (!el) return
  Object.values(audios).forEach((a) => { if (a !== el) a.pause() })
  el.currentTime = Math.max(0, t - 0.5)
  el.play().catch(() => {})
  el.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
}

/** Loncat ke detik t pada rekaman utama atau lanjutan (dari kutipan AI). */
function seek(followup, t) {
  const pakai = props.recordings.filter((x) => !x.purged && !x.excluded)
  const r = pakai.find((x) => (x.kind === 'followup') === followup) || pakai[0]
  if (r) lompat(r.id, t)
}
defineExpose({ seek })
</script>
