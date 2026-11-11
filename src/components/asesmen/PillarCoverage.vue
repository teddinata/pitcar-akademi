<!-- Cakupan pilar paket: pilar mana diuji kasus terpilih (lewat esai/lisan atau pilihan ganda) dan
     mana yang hanya dinilai lead. Mode acak = peserta hanya mendapat satu kasus, jadi tiap kasus dicek sendiri. -->
<template>
  <div class="u-card p-4 sm:p-5 mb-4">
    <div class="flex flex-wrap items-baseline justify-between gap-2">
      <h3 class="u-display text-lg font-extrabold">Cakupan pilar</h3>
      <p class="text-sm font-bold" :class="celah.length ? 'text-[color:var(--merah-tua)]' : 'text-[color:var(--hijau)]'">
        {{ celah.length ? `${celah.length} pilar belum diuji studi kasus mana pun` : 'Semua pilar diuji minimal satu kasus' }}
      </p>
    </div>
    <p class="mt-1 text-sm text-[color:var(--ink-soft)] max-w-[75ch]">
      {{ mode === 'random' ? 'Mode acak: tiap peserta hanya mendapat satu kasus, jadi pilar yang tidak diuji suatu kasus hanya dinilai lead untuk peserta yang mendapat kasus itu.' : 'Mode semua kasus: pilar cukup diuji di salah satu kasus.' }}
      Pilar yang memang hanya terlihat di kerja nyata (mis. Kecepatan &amp; Kerapihan) boleh dinilai lead saja.
    </p>
    <p v-if="!cases.length" class="mt-3 text-sm font-bold">Pilih studi kasus di bawah dulu.</p>
    <div v-else class="mt-3 overflow-x-auto rounded-xl border-[2.5px] border-[color:var(--ink)] bg-white">
      <table class="u-table min-w-[36rem]">
        <thead>
          <tr>
            <th class="!text-left">Pilar</th>
            <th v-for="c in cases" :key="c.id" class="!whitespace-normal !text-[11px] leading-tight max-w-[10rem]" :title="c.name">{{ c.name }}</th>
            <th class="!text-[11px]">Lead</th>
            <th class="!text-left !text-[11px]">Kesimpulan</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in rows" :key="r.pillar.id">
            <td class="font-bold !whitespace-normal min-w-[10rem]">{{ r.pillar.name }}</td>
            <td v-for="c in r.cells" :key="c.id" class="text-center text-xs font-bold">
              <span v-if="c.essay && c.choice" class="u-chip u-chip-hijau !text-[11px]">esai + PG</span>
              <span v-else-if="c.essay" class="u-chip u-chip-hijau !text-[11px]">esai</span>
              <span v-else-if="c.choice" class="u-chip u-chip-kuning !text-[11px]" title="Hanya pilihan ganda: AI tidak punya jawaban tertulis untuk pilar ini">PG saja</span>
              <span v-else class="text-[color:var(--ink-soft)]">tidak diuji</span>
            </td>
            <td class="text-center text-xs font-bold">{{ leadEnabled ? '✓' : '–' }}</td>
            <td class="text-xs font-bold !whitespace-normal" :class="r.verdict.cls">{{ r.verdict.text }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  pillars: { type: Array, required: true }, cases: { type: Array, required: true },
  mode: { type: String, default: 'random' }, leadEnabled: Boolean,
})
function cell(c, p) {
  const qs = c.questions || []
  const judged = c.pillar_ids?.length ? c.pillar_ids.includes(p.id) : true
  return { id: c.id, essay: judged && qs.some((q) => q.qtype === 'essay'), choice: qs.some((q) => q.qtype === 'choice' && q.pillar_id === p.id) }
}
const rows = computed(() => props.pillars.map((p) => {
  const cells = props.cases.map((c) => cell(c, p))
  const diuji = cells.filter((c) => c.essay || c.choice).length
  const esai = cells.filter((c) => c.essay).length
  let verdict
  if (!diuji) verdict = props.leadEnabled ? { text: 'Hanya dinilai lead', cls: 'text-[color:var(--merah-tua)]' } : { text: 'Tidak dinilai sama sekali', cls: 'text-[color:var(--merah-tua)]' }
  else if (props.mode === 'random' && diuji < cells.length) verdict = { text: `Diuji ${diuji} dari ${cells.length} kasus`, cls: 'text-[#8a6100]' }
  else if (!esai) verdict = { text: 'Hanya pilihan ganda, tambah pertanyaan esai', cls: 'text-[#8a6100]' }
  else verdict = { text: 'Tercakup', cls: 'text-[color:var(--hijau)]' }
  return { pillar: p, cells, diuji, verdict }
}))
const celah = computed(() => rows.value.filter((r) => !r.diuji))
</script>
