<!-- Matriks progres: siswa × materi. Klik sel untuk nilai praktik / kompeten / catatan. Bisa dicetak. -->
<template>
  <div>
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div class="flex flex-wrap gap-3 text-xs font-bold">
        <span v-for="(s, k) in TOPIC_STATUS" :key="k" class="inline-flex items-center gap-1"><span class="a-cell !h-6 !min-w-6" :class="s.cls">{{ s.short }}</span>{{ s.label }}</span>
      </div>
      <div class="flex gap-2">
        <select v-model="modul" class="u-input !w-auto" aria-label="Filter modul"><option value="">Semua modul</option><option v-for="m in modules" :key="m" :value="m">{{ m }}</option></select>
        <button type="button" class="u-btn" @click="cetak"><PrinterIcon class="h-5 w-5" />Cetak</button>
      </div>
    </div>

    <div v-if="loading" class="u-card mt-4 h-64 animate-pulse" aria-busy="true"></div>
    <div v-else-if="error" class="u-card mt-4 p-6 text-center"><p class="font-bold">{{ error }}</p><button type="button" class="u-btn mt-3" @click="load">Coba lagi</button></div>
    <p v-else-if="!data.rows.length || !data.topics.length" class="u-card mt-4 p-6 text-center text-sm">Isi kurikulum dan siswa dulu untuk melihat progres.</p>

    <div v-else id="academy-print" class="mt-4">
      <p class="hidden text-lg font-extrabold print:block">Progres materi · {{ program.name }}</p>
      <div class="overflow-x-auto rounded-[14px] border-[2.5px] border-[color:var(--ink)] bg-white">
        <table class="a-matrix text-sm">
          <thead class="bg-[color:var(--stabilo)]">
            <tr>
              <th class="a-sticky !bg-[color:var(--stabilo)] text-left font-extrabold">Siswa</th>
              <th v-for="t in topics" :key="t.id" class="max-w-[6rem] align-bottom text-[11px] font-extrabold leading-tight" :title="t.name">{{ t.code || t.name.slice(0, 14) }}</th>
              <th class="text-left font-extrabold">Ringkas</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in data.rows" :key="r.participant.id" class="border-t-2 border-[color:var(--ink)]">
              <th class="a-sticky whitespace-nowrap text-left font-extrabold"><button type="button" class="hover:underline underline-offset-4" @click="$emit('open-student', r.participant)">{{ r.participant.name }}</button></th>
              <td v-for="t in topics" :key="t.id" class="text-center">
                <button type="button" class="a-cell" :class="TOPIC_STATUS[cell(r, t).status].cls"
                  :aria-label="`${r.participant.name}, ${t.name}: ${TOPIC_STATUS[cell(r, t).status].label}`" @click="buka(r, t)">
                  {{ cell(r, t).practice_score && cell(r, t).status !== 'competent' ? cell(r, t).practice_score : TOPIC_STATUS[cell(r, t).status].short }}
                </button>
              </td>
              <td class="whitespace-nowrap text-xs font-bold">K {{ r.tally.competent }} · ! {{ r.tally.missed }} · hadir {{ r.attendance.rate ?? '–' }}%</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="u-help">Angka di sel = nilai praktik terakhir (1–4). "!" = materi disampaikan saat siswa tidak hadir, perlu susulan.</p>
    </div>

    <LDialog :open="!!edit" :title="edit?.name || ''" :subtitle="edit?.topic" @close="edit = null">
      <div v-if="edit" class="space-y-4">
        <p class="text-sm">Status sekarang: <b>{{ TOPIC_STATUS[edit.status].label }}</b><template v-if="edit.quiz != null"> · quiz {{ edit.quiz }}</template></p>
        <div>
          <p class="u-label">Nilai praktik</p>
          <div class="flex gap-2">
            <button v-for="n in [0, 1, 2, 3, 4]" :key="n" type="button" class="u-att" :class="{ 'is-on': edit.practice_score === n }" :aria-pressed="edit.practice_score === n" @click="edit.practice_score = n">{{ n || '–' }}</button>
          </div>
          <p class="u-help">1 belum bisa · 2 dengan bantuan · 3 mandiri · 4 mandiri, rapi & cepat. – = hapus nilai.</p>
        </div>
        <label class="flex min-h-11 items-center gap-3 text-sm font-bold"><input v-model="edit.competent" type="checkbox" class="u-check" />Dinyatakan kompeten</label>
        <div><label for="pg-note" class="u-label">Catatan</label><input id="pg-note" v-model="edit.note" class="u-input" placeholder="mis. susulan 12 Jan" /></div>
      </div>
      <template #footer>
        <button type="button" class="u-btn" @click="edit = null">Batal</button>
        <button type="button" class="u-btn u-btn-merah" :disabled="busy" @click="simpan">{{ busy ? 'Menyimpan…' : 'Simpan' }}</button>
      </template>
    </LDialog>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { PrinterIcon } from '@heroicons/vue/24/outline'
import LDialog from '../leader/LDialog.vue'
import { notify } from '../leader/notice'
import { TOPIC_STATUS, academyApi } from '../../services/academyApi'

const props = defineProps({ program: Object })
defineEmits(['open-student'])
const data = ref({ rows: [], topics: [] })
const loading = ref(true)
const error = ref('')
const busy = ref(false)
const edit = ref(null)
const modul = ref('')

const modules = computed(() => [...new Set(data.value.topics.map((t) => t.module_name).filter(Boolean))])
const topics = computed(() => data.value.topics.filter((t) => !modul.value || t.module_name === modul.value))
const cell = (r, t) => r.cells.find((c) => c.topic_id === t.id)

async function load() {
  loading.value = true
  error.value = ''
  try { data.value = await academyApi.progress(props.program.id) } catch (e) { error.value = e.message } finally { loading.value = false }
}

const buka = (r, t) => {
  const c = cell(r, t)
  edit.value = { participant_id: r.participant.id, topic_id: t.id, name: r.participant.name, topic: t.name, status: c.status, quiz: c.quiz,
    practice_score: c.practice_score || 0, competent: c.competent, note: c.note || '' }
}

async function simpan() {
  busy.value = true
  try {
    const e = edit.value
    const c = await academyApi.progressSet({ participant_id: e.participant_id, topic_id: e.topic_id, practice_score: e.practice_score, competent: e.competent, note: e.note })
    const row = data.value.rows.find((r) => r.participant.id === e.participant_id)
    const i = row.cells.findIndex((x) => x.topic_id === e.topic_id)
    row.cells[i] = c
    edit.value = null
    notify.success('Progres tersimpan')
    load()
  } catch (err) { notify.error(err.message) } finally { busy.value = false }
}

const cetak = () => window.print()

watch(() => props.program.id, load)
onMounted(load)
</script>
