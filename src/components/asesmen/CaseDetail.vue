<!-- Rincian satu lembar studi kasus untuk asesor: level per pilar beserta asalnya (AI dari esai/lisan,
     pilihan ganda, atau keduanya), kekuatan & area pengembangan dari AI, alasan + kutipan per pilar,
     dan pilar yang memang tidak diuji kasus ini (bukan "–" tanpa keterangan). -->
<template>
  <article :id="`kasus-${row.attempt.id}`" class="u-card overflow-hidden scroll-mt-20">
    <div class="p-4 sm:p-5 border-b-[2.5px] border-[color:var(--ink)]">
      <div class="flex flex-wrap items-center gap-2">
        <span v-if="nomor" class="u-nomor">{{ nomor }}</span>
        <p class="u-display text-lg font-extrabold flex-1 min-w-[12rem]">{{ a.case.name }}</p>
        <span v-if="row.avg" class="u-level" :class="levelClass(row.avg)" :title="`Rata-rata ${row.tested.length} pilar yang dinilai`">{{ num(row.avg, 1) }}</span>
        <span class="u-chip">{{ CASE_STATE({ state: a.state, ai_state: a.ai_state, started: !!a.started_at }) }}</span>
        <button v-if="a.ai_state === 'failed'" class="u-btn !min-h-9" :disabled="busy" @click="$emit('requeue', a)">Nilai ulang</button>
      </div>
      <p v-if="a.ai_error" class="mt-2 text-sm font-bold text-[color:var(--merah-tua)]">{{ a.ai_error }}</p>
      <p v-if="hasil.ringkasan" class="mt-3 text-[15px] leading-relaxed max-w-[80ch]">{{ hasil.ringkasan }}</p>
    </div>

    <template v-if="a.ai_state === 'done'">
      <!-- Kekuatan & area pengembangan: format sama dengan Poin disebut / Poin terlewat di ujian lisan -->
      <div v-if="hasil.kekuatan?.length || hasil.area_pengembangan?.length" class="grid md:grid-cols-2 border-b-[2.5px] border-[color:var(--ink)]">
        <div class="p-4 sm:p-5 bg-[#eefaf2] md:border-r-[2.5px] border-[color:var(--ink)]">
          <p class="font-extrabold text-[color:var(--hijau)]">Kekuatan</p>
          <ul v-if="hasil.kekuatan?.length" class="mt-1.5 list-disc pl-5 space-y-1 text-sm"><li v-for="(t, i) in hasil.kekuatan" :key="i">{{ t }}</li></ul>
          <p v-else class="mt-1 text-sm text-[color:var(--ink-soft)]">AI tidak mencatat kekuatan khusus.</p>
        </div>
        <div class="p-4 sm:p-5 bg-[#fff2f2] border-t-[2.5px] md:border-t-0 border-[color:var(--ink)]">
          <p class="font-extrabold text-[color:var(--merah-tua)]">Perlu dikembangkan</p>
          <ul v-if="hasil.area_pengembangan?.length" class="mt-1.5 list-disc pl-5 space-y-1 text-sm"><li v-for="(t, i) in hasil.area_pengembangan" :key="i">{{ t }}</li></ul>
          <p v-else class="mt-1 text-sm text-[color:var(--ink-soft)]">AI tidak mencatat area pengembangan.</p>
        </div>
      </div>

      <!-- Pilar yang diuji -->
      <div class="p-4 sm:p-5">
        <p class="font-extrabold">Penilaian per pilar</p>
        <div class="mt-2 grid lg:grid-cols-2 gap-3">
          <div v-for="c in row.tested" :key="c.pillar.code" :id="`kasus-${a.id}-${c.pillar.code}`"
               class="rounded-xl border-2 border-[color:var(--ink)] p-3 text-sm scroll-mt-24" :class="sorot === c.pillar.code ? 'ring-4 ring-[color:var(--stabilo)]' : ''">
            <div class="flex items-center gap-2">
              <span class="u-level !min-w-[2.6rem] !h-8 !text-sm" :class="levelClass(c.level)">{{ c.level ? num(c.level, 1) : '–' }}</span>
              <p class="font-extrabold flex-1">{{ c.pillar.name }}</p>
              <span class="text-[11px] font-bold text-[color:var(--ink-soft)] text-right leading-tight">{{ asal(c) }}</span>
            </div>
            <p v-if="!c.ai?.level && c.pg" class="mt-2 rounded-lg bg-[#fffbe0] border-2 border-dashed border-[color:var(--ink)] px-2.5 py-1.5 text-xs font-bold">
              Jawaban tertulis/lisan belum memberi bukti untuk pilar ini. Level {{ num(c.pg, 1) }} berasal dari pilihan ganda saja.
            </p>
            <p v-else-if="!c.level" class="mt-2 text-xs font-bold text-[color:var(--merah-tua)]">Tidak ada bukti di jawaban; pilar ini tidak dihitung dari kasus ini.</p>
            <p v-if="c.ai?.alasan" class="mt-1.5 leading-snug" :class="lengkap[c.pillar.code] ? '' : 'line-clamp-3'">{{ c.ai.alasan }}</p>
            <button v-if="c.ai?.alasan?.length > 220 || (c.ai?.kutipan && c.ai.kutipan !== '-')" type="button" class="mt-1 text-xs font-extrabold underline underline-offset-2"
                    :aria-expanded="!!lengkap[c.pillar.code]" @click="lengkap[c.pillar.code] = !lengkap[c.pillar.code]">{{ lengkap[c.pillar.code] ? 'Ringkas' : 'Selengkapnya & kutipan' }}</button>
            <p v-if="lengkap[c.pillar.code] && c.ai?.kutipan && c.ai.kutipan !== '-'" class="mt-1.5"><span v-if="c.ai.waktu && c.ai.waktu !== '-'" class="font-mono text-xs font-bold text-[color:var(--biru)] mr-1">{{ c.ai.waktu }}</span><span class="u-kutipan">“{{ c.ai.kutipan }}”</span></p>
          </div>
        </div>
        <!-- Pilar yang tidak masuk "Pilar dinilai" kasus ini: kartu abu-abu bertanda "–" -->
        <div v-if="row.untested.length" class="mt-3">
          <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
            <div v-for="p in row.untested" :key="p.code" class="flex items-center gap-2 rounded-xl border-2 border-dashed border-[color:var(--ink-soft)] bg-[#f6f6f6] px-3 py-2 text-sm">
              <span class="u-level l0 !min-w-[2.6rem] !h-8 !text-sm">–</span>
              <span class="min-w-0"><span class="block font-extrabold leading-tight">{{ p.name }}</span><span class="block text-xs font-bold text-[color:var(--ink-soft)]">Tidak diuji di kasus ini</span></span>
            </div>
          </div>
          <p class="mt-2 text-xs text-[color:var(--ink-soft)]">Pilar bertanda “–” tidak masuk “Pilar dinilai” kasus ini, jadi tidak ikut dihitung dari kasus ini. Nilainya datang dari kasus lain atau penilaian lead.</p>
        </div>
      </div>
    </template>

    <div class="px-4 sm:px-5 pb-4 sm:pb-5 space-y-2 text-sm">
      <details v-if="a.choice_review?.length">
        <summary class="cursor-pointer font-bold">Jawaban pilihan ganda ({{ a.choice_review.length }})</summary>
        <ol class="mt-1.5 space-y-1.5 list-decimal pl-5">
          <li v-for="q in a.choice_review" :key="q.question_id">{{ q.text }}<span v-if="q.pillar" class="text-xs text-[color:var(--ink-soft)]"> · {{ q.pillar }}</span><br /><b>{{ q.answer_text || 'tidak dijawab' }}</b> <span v-if="q.level" class="u-level !min-w-0 !h-6 !text-xs ml-1" :class="`l${q.level}`">L{{ q.level }}</span></li>
        </ol>
      </details>
      <details v-if="a.essay_answers?.some((e) => e.answer)">
        <summary class="cursor-pointer font-bold">Jawaban esai</summary>
        <div v-for="(e, i) in a.essay_answers" :key="i" class="mt-2"><p class="font-bold">{{ e.text }}</p><p class="whitespace-pre-line">{{ e.answer || '–' }}</p></div>
      </details>
      <div v-if="a.recordings?.length"><RecordingPlayer :recordings="a.recordings" /></div>
    </div>
  </article>
</template>

<script setup>
import { computed, reactive, watch } from 'vue'
import RecordingPlayer from './RecordingPlayer.vue'
import { CASE_STATE, levelClass, num } from '../../utils/asesmen'

const props = defineProps({ row: { type: Object, required: true }, nomor: { type: String, default: '' }, busy: Boolean, sorot: { type: String, default: '' } })
defineEmits(['requeue'])
const a = computed(() => props.row.attempt)
const hasil = computed(() => a.value.ai_result || {})
// Accordion per pilar: alasan dipotong 3 baris, kutipan muncul saat dibuka. Disorot dari luar = dibuka.
const lengkap = reactive({})
watch(() => props.sorot, (code) => { if (code) lengkap[code] = true })
const asal = (c) => (c.ai?.level && c.pg ? `AI L${c.ai.level} · PG ${num(c.pg, 1)}` : c.ai?.level ? 'dari jawaban esai/lisan' : c.pg ? 'pilihan ganda saja' : '')
</script>
