<!-- Evaluasi mingguan: rubrik 1-4 per siswa (satu per minggu, simpan ulang = ubah) + catatan harian terbaru. -->
<template>
  <div>
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div class="flex items-center gap-2">
        <button type="button" class="u-btn !w-11 !p-0" aria-label="Minggu sebelumnya" @click="senin = tambahHari(senin, -7)"><ChevronLeftIcon class="h-5 w-5" /></button>
        <p class="u-display min-w-[12rem] text-center text-lg font-extrabold">Minggu {{ tanggal(senin, false) }}</p>
        <button type="button" class="u-btn !w-11 !p-0" aria-label="Minggu berikutnya" @click="senin = tambahHari(senin, 7)"><ChevronRightIcon class="h-5 w-5" /></button>
      </div>
      <p class="text-sm">1 kurang · 2 cukup · 3 baik · 4 sangat baik</p>
    </div>

    <div v-if="loading" class="u-card mt-4 h-48 animate-pulse" aria-busy="true"></div>
    <div v-else-if="error" class="u-card mt-4 p-6 text-center"><p class="font-bold">{{ error }}</p><button type="button" class="u-btn mt-3" @click="load">Coba lagi</button></div>
    <p v-else-if="!rows.length" class="u-card mt-4 p-6 text-center text-sm">Belum ada siswa.</p>

    <ul v-else class="mt-4 space-y-3">
      <li v-for="r in rows" :key="r.participant_id" class="u-card p-4">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <p class="font-extrabold">{{ r.name }}</p>
          <span v-if="r.saved" class="u-chip u-chip-hijau">Tersimpan{{ r.author ? ` · ${r.author}` : '' }}</span>
        </div>
        <div class="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <div v-for="k in RUBRIC" :key="k.value">
            <p class="text-xs font-extrabold">{{ k.label }}</p>
            <div class="mt-1 flex gap-1">
              <button v-for="n in 4" :key="n" type="button" class="u-att" :class="{ 'is-on': r.scores[k.value] === n }" :aria-pressed="r.scores[k.value] === n"
                :aria-label="`${r.name} ${k.label} ${n}`" @click="r.scores[k.value] = n; r.dirty = true">{{ n }}</button>
            </div>
          </div>
        </div>
        <label :for="`ev-${r.participant_id}`" class="u-label mt-3">Catatan untuk siswa</label>
        <div class="flex flex-col gap-2 sm:flex-row">
          <input :id="`ev-${r.participant_id}`" v-model="r.note" class="u-input flex-1" placeholder="Kekuatan & yang perlu ditingkatkan minggu depan" @input="r.dirty = true" />
          <button type="button" class="u-btn u-btn-merah" :disabled="!r.dirty || r.busy" @click="simpan(r)">{{ r.busy ? 'Menyimpan…' : 'Simpan' }}</button>
        </div>
      </li>
    </ul>

    <section v-if="notes.length" class="mt-8">
      <h3 class="u-display text-xl font-extrabold">Catatan harian minggu ini</h3>
      <ul class="mt-3 space-y-2">
        <li v-for="n in notes" :key="n.id" class="u-card flex flex-wrap items-start justify-between gap-2 p-3 text-sm">
          <div class="min-w-0">
            <p><b>{{ n.participant_name }}</b> · {{ tanggal(n.date) }} <LChip v-if="n.flag" :tone="n.flag === 'good' ? 'green' : 'amber'">{{ n.flag === 'good' ? 'Bagus' : 'Perlu perhatian' }}</LChip></p>
            <p class="mt-1">{{ n.note }}</p>
            <p class="text-xs text-[color:var(--ink-soft)]">{{ n.author }}{{ n.visible_to_student ? ' · terlihat siswa' : '' }}</p>
          </div>
          <button type="button" class="u-btn u-btn-ghost u-btn-bahaya !w-11 !p-0" :aria-label="`Hapus catatan ${n.participant_name}`" @click="hapus(n)"><TrashIcon class="h-5 w-5" /></button>
        </li>
      </ul>
    </section>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import { ChevronLeftIcon, ChevronRightIcon, TrashIcon } from '@heroicons/vue/24/outline'
import LChip from '../leader/LChip.vue'
import { notify } from '../leader/notice'
import { RUBRIC, academyApi, hariIniWib, seninDari, tambahHari, tanggal } from '../../services/academyApi'
import { leaderApi } from '../../services/leaderApi'

const props = defineProps({ program: Object })
const senin = ref(seninDari(hariIniWib()))
const rows = ref([])
const notes = ref([])
const loading = ref(true)
const error = ref('')

async function load() {
  loading.value = true
  error.value = ''
  try {
    const [students, evals] = await Promise.all([
      leaderApi.participants(props.program.id, true),
      academyApi.evaluations(props.program.id, { date_from: senin.value }),
    ])
    const akhir = tambahHari(senin.value, 6)
    const minggu = evals.filter((e) => e.date <= akhir)
    notes.value = minggu.filter((e) => e.kind === 'note')
    rows.value = students.filter((p) => p.student_state !== 'dropped' && p.student_state !== 'graduated').map((p) => {
      const e = minggu.find((x) => x.kind === 'weekly' && x.participant_id === p.id)
      return { participant_id: p.id, name: p.name, scores: { ...(e?.scores || {}) }, note: e?.note || '', saved: !!e, author: e?.author || '', dirty: false, busy: false }
    })
  } catch (e) { error.value = e.message } finally { loading.value = false }
}

async function simpan(r) {
  r.busy = true
  try {
    const res = await academyApi.evaluationSave(null, { participant_id: r.participant_id, kind: 'weekly', date: senin.value, scores: r.scores, note: r.note })
    Object.assign(r, { saved: true, dirty: false, author: res.author })
    notify.success(`Evaluasi ${r.name} tersimpan`)
  } catch (e) { notify.error(e.message) } finally { r.busy = false }
}

async function hapus(n) {
  try { await academyApi.evaluationDelete(n.id); notes.value = notes.value.filter((x) => x.id !== n.id); notify.success('Catatan dihapus') } catch (e) { notify.error(e.message) }
}

watch([senin, () => props.program.id], load)
onMounted(load)
</script>
