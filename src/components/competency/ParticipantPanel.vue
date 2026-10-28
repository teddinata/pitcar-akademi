<!-- Rincian satu peserta: level per pilar per sumber (bisa diubah manual),
     penilaian AI studi kasus dengan kutipan & rekaman, catatan atasan/diri,
     rata-rata feedback tim (anonim), dan pengaturan penilai. -->
<template>
  <div class="fixed inset-0 z-[60] flex justify-end" role="dialog" aria-modal="true" :aria-label="data ? `Rincian ${data.employee.name}` : 'Rincian peserta'">
    <div class="absolute inset-0 bg-gray-950/40" @click="$emit('close')"></div>
    <div ref="scroller" class="relative w-full max-w-3xl h-full overflow-y-auto bg-gray-50 shadow-2xl">
      <div class="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-gray-200 px-5 py-4 flex items-start gap-3">
        <div class="min-w-0 flex-1">
          <p class="text-xs font-semibold text-gray-500">Rincian peserta</p>
          <h2 class="text-lg font-bold text-gray-900 truncate">{{ data?.employee.name || 'Memuat…' }}</h2>
          <p v-if="data" class="text-xs text-gray-500">{{ [data.employee.job, data.employee.department].filter(Boolean).join(' · ') || '-' }}</p>
        </div>
        <div v-if="data" class="text-right shrink-0">
          <p class="text-[11px] font-semibold text-gray-500">Jenjang</p>
          <p v-if="data.overall" class="mt-0.5 inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-bold ring-1" :class="LEVEL_STYLE[data.overall.level].cell">L{{ data.overall.level }} · {{ data.overall.name }}</p>
          <p v-else class="mt-0.5 text-xs text-gray-400">Belum lengkap</p>
        </div>
        <button class="p-2 rounded-lg text-gray-500 hover:bg-gray-100" aria-label="Tutup" @click="$emit('close')"><XMarkIcon class="w-5 h-5" /></button>
      </div>

      <div v-if="loading" class="p-5 space-y-3"><div v-for="i in 3" :key="i" class="h-28 rounded-2xl bg-white animate-pulse"></div></div>
      <p v-else-if="error" class="m-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">{{ error }}</p>

      <div v-else-if="data" class="p-4 sm:p-5 space-y-4">
        <!-- Level per pilar -->
        <section class="rounded-2xl bg-white p-4 shadow-sm">
          <h3 class="text-sm font-bold text-gray-900">Level per pilar</h3>
          <p class="text-xs text-gray-500 mt-0.5">Akhir = studi kasus 40% + atasan 30% + tim 30% (sumber yang belum ada dilewati). Diri sendiri hanya pembanding. Jenjang = rata-rata level akhir, paling tinggi satu level di atas pilar terlemah.</p>
          <div class="mt-3 overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="text-[11px] uppercase text-gray-500">
                <tr>
                  <th class="py-2 pr-2 text-left font-medium">Pilar</th>
                  <th v-for="k in ['case', 'supervisor', 'team', 'self']" :key="k" class="px-2 py-2 text-center font-medium whitespace-nowrap">{{ SHORT[k] }}</th>
                  <th class="px-2 py-2 text-center font-medium">Akhir</th>
                  <th></th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <template v-for="p in data.pillars" :key="p.id">
                  <tr>
                    <td class="py-2 pr-2 font-semibold text-gray-900">{{ p.name }}</td>
                    <td v-for="k in ['case', 'supervisor', 'team', 'self']" :key="k" class="px-2 py-2 text-center tabular-nums" :class="k === 'self' ? 'text-gray-400' : 'text-gray-700'">
                      {{ fmtLevel(res(p)[k]) }}
                      <span v-if="k === 'team' && !res(p).team && res(p).team_count" class="block text-[10px] text-gray-400">{{ res(p).team_count }}/{{ data.cycle.min_team_raters }}</span>
                    </td>
                    <td class="px-1 py-1.5 w-20"><LevelCell :result="res(p).band ? res(p) : null" /></td>
                    <td class="py-2 pl-2 text-right">
                      <button class="text-xs font-semibold text-blue-700 hover:underline whitespace-nowrap" @click="bukaManual(p)">{{ res(p).manual ? 'Ubah manual' : 'Atur manual' }}</button>
                    </td>
                  </tr>
                  <tr v-if="res(p).blind_spot != null && Math.abs(res(p).blind_spot) >= 1">
                    <td colspan="7" class="pb-2 pt-0 text-xs text-amber-800">
                      Blind spot: menilai diri {{ res(p).blind_spot > 0 ? 'lebih tinggi' : 'lebih rendah' }} {{ fmtLevel(Math.abs(res(p).blind_spot)) }} level dari hasil akhir.
                    </td>
                  </tr>
                  <tr v-if="res(p).manual">
                    <td colspan="7" class="pb-2 pt-0 text-xs text-gray-600">
                      <span class="font-semibold text-amber-700">Manual {{ fmtLevel(res(p).manual) }}</span> (hitungan {{ fmtLevel(res(p).computed) }}) · {{ res(p).manual_note }} <span class="text-gray-400">— {{ res(p).manual_by }}</span>
                    </td>
                  </tr>
                  <tr v-if="manual.pillarId === p.id">
                    <td colspan="7" class="pb-3">
                      <div class="rounded-xl bg-amber-50 p-3 ring-1 ring-amber-200">
                        <p class="text-xs font-semibold text-amber-900">Level manual {{ p.name }} (menimpa hitungan)</p>
                        <div class="mt-2 flex flex-wrap gap-2">
                          <button
                            v-for="n in [1, 1.5, 2, 2.5, 3, 3.5, 4]" :key="n"
                            class="h-9 min-w-11 px-2 rounded-lg text-sm font-bold ring-1"
                            :class="manual.level === n ? 'bg-gray-900 text-white ring-gray-900' : 'bg-white text-gray-700 ring-gray-200'"
                            @click="manual.level = n"
                          >{{ fmtLevel(n) }}</button>
                        </div>
                        <input v-model="manual.note" class="mt-2 w-full h-10 rounded-lg border border-amber-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300" placeholder="Alasan (wajib): bukti lapangan, koreksi penilaian AI, dll." />
                        <div class="mt-2 flex flex-wrap justify-between gap-2">
                          <button v-if="res(p).manual" class="text-xs font-semibold text-gray-600 hover:text-red-700" :disabled="busy" @click="simpanManual(p, 0)">Hapus level manual</button>
                          <span v-else></span>
                          <div class="flex gap-2">
                            <button class="px-3 py-1.5 rounded-lg text-sm font-semibold text-gray-700 hover:bg-white" @click="manual.pillarId = null">Batal</button>
                            <button class="px-4 py-1.5 rounded-lg bg-gray-900 text-white text-sm font-bold disabled:bg-gray-300" :disabled="!manual.level || !manual.note.trim() || busy" @click="simpanManual(p, manual.level)">Simpan</button>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>
          <div v-if="rekomendasi.length" class="mt-4 rounded-xl bg-indigo-50 p-3">
            <p class="text-xs font-bold text-indigo-900">Kursus rekomendasi (pilar L1–L2)</p>
            <ul class="mt-1 space-y-0.5 text-sm text-indigo-950">
              <li v-for="r in rekomendasi" :key="r.key"><b>{{ r.pillar }}:</b> {{ r.course }}</li>
            </ul>
          </div>
        </section>

        <!-- Studi kasus -->
        <section v-if="data.attempt" class="rounded-2xl bg-white p-4 shadow-sm">
          <div class="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h3 class="text-sm font-bold text-gray-900">Studi kasus · {{ data.attempt.case.name }}</h3>
              <p class="text-xs text-gray-500">{{ data.attempt.submitted_at ? `Dikirim ${fmtDateTime(data.attempt.submitted_at)}` : 'Belum dikirim peserta' }}</p>
            </div>
            <span class="text-[11px] font-bold px-2 py-0.5 rounded-full" :class="AI_STATE[data.attempt.ai_state].cls">{{ AI_STATE[data.attempt.ai_state].label }}</span>
          </div>

          <div v-if="data.attempt.ai_state === 'failed'" class="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-800">
            <p>{{ data.attempt.ai_error }}</p>
            <button class="mt-2 px-3 py-1.5 rounded-lg bg-red-700 text-white text-xs font-bold" :disabled="busy" @click="nilaiUlang">Nilai ulang</button>
          </div>
          <p v-else-if="['queued', 'running'].includes(data.attempt.ai_state)" class="mt-3 text-sm text-gray-600">Jawaban esai/rekaman sedang dinilai AI. Biasanya selesai dalam beberapa menit.</p>

          <template v-if="hasil">
            <p class="mt-3 text-sm leading-relaxed text-gray-800 max-w-prose">{{ hasil.ringkasan }}</p>
            <p class="mt-1 text-xs text-gray-500">Keyakinan AI: {{ hasil.keyakinan }} · {{ data.attempt.ai_model }}</p>
            <ul class="mt-3 space-y-3">
              <li v-for="row in hasil.pilar" :key="row.kode" class="rounded-xl border border-gray-200 p-3">
                <div class="flex items-center gap-2">
                  <span class="px-1.5 rounded ring-1 text-xs font-bold" :class="row.level ? LEVEL_STYLE[row.level].cell : EMPTY_CELL">{{ row.level ? `L${row.level}` : 'Tidak ada bukti' }}</span>
                  <span class="text-sm font-semibold text-gray-900">{{ row.nama }}</span>
                </div>
                <p class="mt-1.5 text-sm text-gray-700">{{ row.alasan }}</p>
                <blockquote v-if="row.kutipan && row.kutipan !== '-'" class="mt-1.5 border-l-2 border-gray-300 pl-3 text-sm italic text-gray-600">
                  “{{ row.kutipan }}”
                  <button v-if="detikDari(row.waktu) != null" class="not-italic ml-1 text-xs font-semibold text-blue-700 hover:underline" @click="putarDi(detikDari(row.waktu))">▶ {{ row.waktu }}</button>
                </blockquote>
              </li>
            </ul>
            <div class="mt-3 grid sm:grid-cols-2 gap-3">
              <div>
                <p class="text-xs font-bold text-green-800">Kekuatan</p>
                <ul class="mt-1 list-disc pl-5 text-sm text-gray-700 space-y-0.5"><li v-for="(k, i) in hasil.kekuatan" :key="i">{{ k }}</li></ul>
              </div>
              <div>
                <p class="text-xs font-bold text-amber-800">Area pengembangan</p>
                <ul class="mt-1 list-disc pl-5 text-sm text-gray-700 space-y-0.5"><li v-for="(k, i) in hasil.area_pengembangan" :key="i">{{ k }}</li></ul>
              </div>
            </div>
          </template>

          <!-- Pilihan ganda: opsi yang dipilih beserta jenjangnya -->
          <div v-if="data.attempt.choice_review?.length" class="mt-4">
            <p class="text-sm font-semibold text-gray-800">
              Pilihan ganda
              <span v-if="data.attempt.auto_submitted" class="ml-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">Terkirim otomatis (waktu habis)</span>
            </p>
            <ol class="mt-2 space-y-2">
              <li v-for="(c, i) in data.attempt.choice_review" :key="c.question_id" class="rounded-xl border border-gray-200 p-3">
                <p class="text-xs font-semibold text-gray-500">{{ i + 1 }}. {{ c.text }} <span class="font-normal">· {{ c.pillar }}</span></p>
                <div class="mt-1 flex items-start gap-2">
                  <span class="px-1.5 rounded ring-1 text-xs font-bold shrink-0" :class="c.level ? LEVEL_STYLE[c.level].cell : EMPTY_CELL">{{ c.level ? `L${c.level}` : 'Tidak dijawab' }}</span>
                  <span class="text-sm text-gray-800">{{ c.answer_text || '—' }}</span>
                </div>
              </li>
            </ol>
          </div>

          <!-- Jawaban esai tertulis -->
          <details v-if="(data.attempt.essay_answers || []).some((a) => a.answer && a.answer.trim())" class="mt-4 group">
            <summary class="cursor-pointer text-sm font-semibold text-gray-800">Jawaban esai tertulis</summary>
            <div v-for="(a, i) in data.attempt.essay_answers" :key="i" class="mt-3">
              <p class="text-xs font-semibold text-gray-500">{{ i + 1 }}. {{ a.text }}</p>
              <p class="mt-0.5 text-sm whitespace-pre-line text-gray-800">{{ a.answer || '—' }}</p>
            </div>
          </details>

          <!-- Rekaman & transkrip -->
          <div v-if="rekaman.length" class="mt-4">
            <p class="text-sm font-semibold text-gray-800">Rekaman jawaban lisan</p>
            <div v-for="r in rekaman" :key="r.id" class="mt-2 rounded-xl bg-gray-50 p-3">
              <p class="text-xs text-gray-500">Bagian {{ r.sequence }} · {{ mmss(r.duration) }}<template v-if="r.purged"> · suara sudah dihapus (lebih dari 90 hari)</template></p>
              <audio v-if="!r.purged" :ref="(el) => setAudio(r.id, el)" :src="competencyApi.audioUrl(r.id)" controls preload="none" class="mt-1.5 w-full h-9"></audio>
              <details v-if="r.segments.length" class="mt-2">
                <summary class="cursor-pointer text-xs font-semibold text-gray-700">Transkrip ({{ r.segments.length }} baris)</summary>
                <ol class="mt-2 space-y-1 text-sm">
                  <template v-for="(item, i) in transkrip(r)" :key="i">
                    <li v-if="item.marker" class="pt-2 text-xs font-bold text-gray-500">{{ item.label }}</li>
                    <li v-else class="flex gap-2">
                      <button class="shrink-0 font-mono text-xs text-blue-700 hover:underline" @click="putarRekaman(r.id, item.start)">{{ mmss(item.start) }}</button>
                      <span class="text-gray-800">{{ item.text }}</span>
                    </li>
                  </template>
                </ol>
              </details>
            </div>
          </div>
        </section>

        <!-- Atasan & diri -->
        <section class="rounded-2xl bg-white p-4 shadow-sm">
          <h3 class="text-sm font-bold text-gray-900">Penilaian atasan & diri sendiri</h3>
          <p v-if="data.pending_raters.length" class="mt-1 text-xs text-gray-500">Belum mengisi: {{ data.pending_raters.map((r) => `${r.name} (${r.rater_type === 'self' ? 'diri' : 'atasan'})`).join(', ') }}</p>
          <div v-for="r in data.ratings" :key="r.rater_type + r.rater" class="mt-3">
            <p class="text-xs font-bold text-gray-600">{{ r.rater_type === 'self' ? 'Diri sendiri' : `Atasan · ${r.rater}` }} <span class="font-normal text-gray-400">{{ fmtDateTime(r.submitted_at) }}</span></p>
            <ul class="mt-1 space-y-1 text-sm">
              <li v-for="l in r.lines" :key="l.pillar_id" class="flex gap-2">
                <span class="px-1.5 rounded ring-1 text-xs font-bold shrink-0 self-start" :class="LEVEL_STYLE[l.level].cell">L{{ l.level }}</span>
                <span class="text-gray-800"><b>{{ namaPilar(l.pillar_id) }}</b><template v-if="l.note"> · {{ l.note }}</template></span>
              </li>
            </ul>
            <p v-if="r.note" class="mt-1 text-sm text-gray-600 italic">{{ r.note }}</p>
          </div>
          <p v-if="!data.ratings.length" class="mt-2 text-sm text-gray-500">Belum ada yang mengisi.</p>
        </section>

        <!-- Tim -->
        <section class="rounded-2xl bg-white p-4 shadow-sm">
          <h3 class="text-sm font-bold text-gray-900">Feedback tim (anonim)</h3>
          <p v-if="!data.team.visible" class="mt-1 text-sm text-gray-600">
            {{ data.team.count }} dari minimal {{ data.cycle.min_team_raters }} penilai sudah mengisi. Rincian tampil setelah minimal terpenuhi supaya jawaban tidak bisa ditebak.
          </p>
          <ul v-else class="mt-3 space-y-2">
            <li v-for="q in data.team.questions" :key="q.id" class="text-sm">
              <div class="flex justify-between gap-3"><span class="text-gray-800">{{ q.text }}</span><span class="font-bold tabular-nums text-gray-900">{{ q.avg != null ? q.avg.toFixed(1).replace('.', ',') : '–' }}</span></div>
              <div class="mt-1 h-1.5 rounded-full bg-gray-100 overflow-hidden"><div class="h-full rounded-full" :class="q.avg >= 4 ? 'bg-emerald-500' : q.avg >= 3 ? 'bg-sky-500' : 'bg-amber-500'" :style="{ width: ((q.avg || 0) / 5 * 100) + '%' }"></div></div>
            </li>
            <li class="text-xs text-gray-500">{{ data.team.count }} penilai · skala 1–5</li>
          </ul>
        </section>

        <!-- Pengaturan penilai -->
        <section v-if="cycleState !== 'closed'" class="rounded-2xl bg-white p-4 shadow-sm">
          <h3 class="text-sm font-bold text-gray-900">Penilai</h3>
          <div class="mt-3">
            <p class="text-xs font-semibold text-gray-600">Atasan</p>
            <div class="mt-1 flex flex-wrap items-center gap-2">
              <span class="text-sm font-semibold text-gray-900">{{ data.supervisor?.name || 'Belum ada' }}</span>
              <EmployeePicker placeholder="Ganti atasan…" @pick="(e) => simpanPenilai({ supervisor_id: e.id })" />
            </div>
          </div>
          <div class="mt-4">
            <p class="text-xs font-semibold text-gray-600">Anggota tim (feedback 360)</p>
            <div class="mt-1 flex flex-wrap gap-1.5 items-center">
              <span v-for="e in data.team_raters" :key="e.id" class="inline-flex items-center gap-1 rounded-full bg-violet-50 text-violet-900 text-xs font-semibold pl-2.5 pr-1 py-1">
                {{ e.name }}
                <button class="rounded-full p-0.5 hover:bg-violet-100" :aria-label="`Lepas ${e.name}`" @click="simpanPenilai({ team_rater_ids: data.team_raters.filter((x) => x.id !== e.id).map((x) => x.id) })"><XMarkIcon class="w-3.5 h-3.5" /></button>
              </span>
              <EmployeePicker placeholder="+ Tambah anggota tim…" @pick="(e) => simpanPenilai({ team_rater_ids: [...data.team_raters.map((x) => x.id), e.id] })" />
            </div>
            <p class="mt-1 text-xs text-gray-500">Melepas penilai menghapus tugasnya bila belum diisi.</p>
          </div>
          <div class="mt-5 border-t border-gray-100 pt-3 flex justify-end">
            <button v-if="!hapusKonfirmasi" class="text-sm font-semibold text-red-700 hover:underline" @click="hapusKonfirmasi = true">Hapus dari periode</button>
            <div v-else class="flex flex-wrap items-center gap-2">
              <span class="text-sm text-gray-700">Hapus peserta beserta semua penilaiannya?</span>
              <button class="px-3 py-1.5 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100" @click="hapusKonfirmasi = false">Batal</button>
              <button class="px-3 py-1.5 rounded-lg bg-red-700 text-white text-sm font-bold" :disabled="busy" @click="hapus">Ya, hapus</button>
            </div>
          </div>
        </section>
        <p v-if="msg" class="text-sm" :class="msg.ok ? 'text-green-700' : 'text-red-700'" role="status">{{ msg.text }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, defineComponent, h, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { XMarkIcon } from '@heroicons/vue/24/outline'
import { competencyApi } from '../../services/competencyApi'
import { EMPTY_CELL, LEVEL_STYLE, fmtDateTime, fmtLevel, mmss } from '../../utils/competency'
import LevelCell from './LevelCell.vue'

const props = defineProps({ participantId: { type: Number, required: true }, cycleState: { type: String, default: 'draft' } })
const emit = defineEmits(['close', 'changed', 'removed'])

const SHORT = { case: 'Kasus', supervisor: 'Atasan', team: 'Tim', self: 'Diri' }
const AI_STATE = {
  none: { label: 'Belum dinilai', cls: 'bg-gray-100 text-gray-600' },
  queued: { label: 'Dalam antrean', cls: 'bg-indigo-50 text-indigo-700' },
  running: { label: 'Sedang dinilai', cls: 'bg-indigo-50 text-indigo-700' },
  done: { label: 'Dinilai AI', cls: 'bg-green-50 text-green-700' },
  failed: { label: 'Gagal', cls: 'bg-red-50 text-red-700' },
}

// Cari karyawan (dipakai untuk atasan & anggota tim).
const EmployeePicker = defineComponent({
  props: { placeholder: String },
  emits: ['pick'],
  setup(p, { emit: emitPick }) {
    const q = ref('')
    const list = ref([])
    let timer = null
    const cari = () => {
      clearTimeout(timer)
      if (!q.value.trim()) { list.value = []; return }
      timer = setTimeout(async () => { try { list.value = await competencyApi.employees(q.value.trim()) } catch { list.value = [] } }, 250)
    }
    return () => h('div', { class: 'relative' }, [
      h('input', {
        value: q.value, placeholder: p.placeholder,
        class: 'h-8 w-52 rounded-full border border-dashed border-gray-300 bg-white px-3 text-xs focus:outline-none focus:ring-2 focus:ring-blue-300',
        onInput: (e) => { q.value = e.target.value; cari() },
        onKeydown: (e) => { if (e.key === 'Escape') list.value = [] },
      }),
      list.value.length ? h('ul', { class: 'absolute left-0 top-full mt-1 z-20 w-72 max-h-60 overflow-y-auto rounded-xl bg-white shadow-xl ring-1 ring-gray-200 divide-y divide-gray-100' },
        list.value.map((e) => h('li', {}, h('button', {
          class: 'w-full text-left px-3 py-2 hover:bg-gray-50',
          onClick: () => { emitPick('pick', e); q.value = ''; list.value = [] },
        }, [h('span', { class: 'block text-sm font-semibold text-gray-900' }, e.name), h('span', { class: 'block text-xs text-gray-500' }, [e.job, e.department].filter(Boolean).join(' · ') || '-')])))) : null,
    ])
  },
})

const loading = ref(true)
const error = ref('')
const data = ref(null)
const busy = ref(false)
const msg = ref(null)
const hapusKonfirmasi = ref(false)
const manual = reactive({ pillarId: null, level: null, note: '' })
const audios = {}
const scroller = ref(null)
let poll = null

const res = (p) => data.value?.results[p.id] || {}
const namaPilar = (id) => data.value?.pillars.find((p) => p.id === id)?.name || '-'
const hasil = computed(() => data.value?.attempt?.ai_result || null)
const rekaman = computed(() => (data.value?.attempt?.recordings || []).filter((r) => r.size || r.segments.length))
const rekomendasi = computed(() => (data.value?.pillars || []).flatMap((p) => (res(p).band && res(p).band <= 2
  ? p.courses.map((c) => ({ key: `${p.id}-${c.id}`, pillar: p.name, course: c.name })) : [])))

function setAudio(id, el) { if (el) audios[id] = el }
function putarRekaman(id, detik) {
  const el = audios[id]
  if (!el) return
  el.currentTime = detik
  el.play().catch(() => {})
}
// Waktu kutipan AI dihitung dari awal rekaman pertama; cari segmen yang memuatnya.
function putarDi(detik) {
  let offset = 0
  for (const r of rekaman.value) {
    if (detik < offset + (r.duration || 0) || r === rekaman.value[rekaman.value.length - 1]) {
      putarRekaman(r.id, Math.max(0, detik - offset))
      return
    }
    offset += r.duration || 0
  }
}
function detikDari(waktu) {
  const m = /^(\d{1,3}):(\d{2})$/.exec((waktu || '').trim())
  return m ? Number(m[1]) * 60 + Number(m[2]) : null
}
function transkrip(r) {
  const markers = [...r.markers].sort((a, b) => a.t - b.t)
  const out = []
  let i = 0
  for (const s of r.segments) {
    while (i < markers.length && markers[i].t <= s.start) { out.push({ marker: true, label: markers[i].label }); i += 1 }
    out.push(s)
  }
  return out
}

async function load(diam = false) {
  if (!diam) loading.value = true
  try {
    data.value = await competencyApi.participantDetail(props.participantId)
    jadwalkanPoll()
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}
// Selama AI menilai, muat ulang berkala supaya hasilnya muncul sendiri.
function jadwalkanPoll() {
  clearTimeout(poll)
  if (['queued', 'running'].includes(data.value?.attempt?.ai_state)) {
    poll = setTimeout(async () => {
      await load(true)
      emit('changed', ringkas())
    }, 15000)
  }
}
const ringkas = () => ({ id: data.value.id, employee: data.value.employee, progress: data.value.progress, results: data.value.results, overall: data.value.overall, supervisor: data.value.supervisor, team_raters: data.value.team_raters })

async function jalankan(fn, pesan) {
  busy.value = true
  msg.value = null
  try {
    await fn()
    await load(true)
    emit('changed', ringkas())
    if (pesan) msg.value = { ok: true, text: pesan }
  } catch (e) {
    msg.value = { ok: false, text: e.message }
  } finally {
    busy.value = false
  }
}

function bukaManual(p) {
  manual.pillarId = manual.pillarId === p.id ? null : p.id
  manual.level = res(p).manual || null
  manual.note = res(p).manual_note || ''
}
const simpanManual = (p, level) => jalankan(() => competencyApi.setManual(data.value.id, p.id, level, manual.note), level ? `Level ${p.name} diubah manual.` : `Level manual ${p.name} dihapus.`)
  .then(() => { manual.pillarId = null })
const nilaiUlang = () => jalankan(() => competencyApi.requeue(data.value.attempt.id), 'Masuk antrean penilaian ulang.')
const simpanPenilai = (vals) => jalankan(() => competencyApi.updateParticipant(data.value.id, vals), 'Penilai diperbarui.')

async function hapus() {
  busy.value = true
  try {
    emit('removed', await competencyApi.removeParticipant(data.value.id))
  } catch (e) {
    msg.value = { ok: false, text: e.message }
  } finally {
    busy.value = false
  }
}

const tutupEsc = (e) => { if (e.key === 'Escape') emit('close') }
onMounted(() => { load(); window.addEventListener('keydown', tutupEsc) })
onBeforeUnmount(() => { clearTimeout(poll); window.removeEventListener('keydown', tutupEsc) })
</script>
