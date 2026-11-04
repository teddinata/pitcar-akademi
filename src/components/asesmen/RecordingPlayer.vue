<!-- Pemutar rekaman jawaban + transkrip bertanda waktu. Klik baris transkrip
     untuk loncat; seek(kind, detik) dipakai tombol kutipan AI. -->
<template>
  <div class="space-y-3">
    <p v-if="!recordings.length" class="rounded-lg border-2 border-dashed border-[color:var(--ink)] p-3 text-sm font-bold">Tidak ada rekaman.</p>
    <div v-for="r in recordings" :key="r.id" class="rounded-xl border-2 border-[color:var(--ink)] p-3 bg-white">
      <div class="flex flex-wrap items-center gap-2 mb-2">
        <span class="u-chip" :class="r.kind === 'followup' ? 'u-chip-kuning' : ''">{{ r.kind === 'followup' ? 'Jawaban pertanyaan lanjutan' : 'Jawaban utama' }}</span>
        <span class="text-xs font-bold text-[color:var(--ink-soft)]">{{ mmss(r.duration) }} · {{ kata(r) }} kata</span>
        <span v-if="r.transcript_state === 'failed'" class="u-chip u-chip-merah">Transkripsi gagal</span>
      </div>
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
import { competencyApi } from '../../services/competencyApi'
import { mmss } from '../../utils/competency'

const props = defineProps({ recordings: { type: Array, default: () => [] } })
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
  const r = props.recordings.find((x) => (x.kind === 'followup') === followup && !x.purged) || props.recordings.find((x) => !x.purged)
  if (r) lompat(r.id, t)
}
defineExpose({ seek })
</script>
