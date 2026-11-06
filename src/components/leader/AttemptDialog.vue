<!-- Detail penugasan selesai: jawaban per soal dan rincian per kategori. -->
<template>
  <LDialog :open="!!attemptId" :title="data ? data.participant_name : 'Detail jawaban'" :subtitle="data ? `${data.topic_name} · ${KIND_LABEL[data.kind]}` : ''" wide @close="$emit('close')">
    <div v-if="loading" class="space-y-2" aria-busy="true"><div class="h-12 w-full animate-pulse rounded-xl border-2 border-[color:var(--ink)] bg-gray-100"></div><div class="h-12 w-full animate-pulse rounded-xl border-2 border-[color:var(--ink)] bg-gray-100"></div></div>
    <ErrorState v-else-if="error" :message="error" @retry="load" />
    <template v-else-if="data">
      <div class="flex flex-wrap items-center gap-3">
        <p class="u-angka">{{ fmtScore(data.score) }}</p>
        <LChip v-if="data.status" :tone="RESULT_STATUS[data.status]?.tone">{{ RESULT_STATUS[data.status]?.label }}</LChip>
        <p class="text-sm font-bold">{{ data.correct_count }}/{{ data.question_count }} benar<template v-if="data.grade"> · {{ data.grade }}</template></p>
      </div>
      <p class="mt-2 text-xs text-[color:var(--ink-soft)]">Dikumpulkan {{ formatWib(data.submitted_at) }}<template v-if="data.auto_submitted"> (otomatis, waktu habis)</template><template v-if="data.focus_lost"> · keluar halaman {{ data.focus_lost }}x</template></p>

      <div v-if="data.categories?.length" class="mt-4">
        <h3 class="u-display text-base font-extrabold">Per kategori</h3>
        <ul class="mt-2 grid gap-2 sm:grid-cols-2">
          <li v-for="c in data.categories" :key="c.category" class="rounded-xl border-2 border-[color:var(--ink)] px-3 py-2 text-sm">
            <div class="flex justify-between gap-2"><span class="font-bold">{{ c.category || 'Tanpa kategori' }}</span><span class="font-extrabold">{{ c.correct }}/{{ c.total }}</span></div>
            <div class="mt-1.5 h-2 rounded border-2 border-[color:var(--ink)] bg-white"><div class="h-full bg-[color:var(--merah)]" :style="{ width: `${c.total ? (c.correct / c.total) * 100 : 0}%` }"></div></div>
          </li>
        </ul>
      </div>

      <h3 class="u-display mt-5 text-base font-extrabold">Jawaban per soal</h3>
      <ol class="mt-2 space-y-3">
        <li v-for="(it, i) in data.items" :key="it.id" class="rounded-xl border-2 p-3" :class="it.correct ? 'border-[color:var(--hijau)]' : 'border-[color:var(--merah)]'">
          <div class="flex items-start justify-between gap-2">
            <p class="text-sm"><span class="font-extrabold">{{ i + 1 }}.</span> {{ it.text }}</p>
            <LChip :tone="it.correct ? 'green' : 'red'" class="shrink-0">{{ it.correct ? 'Benar' : it.chosen ? 'Salah' : 'Kosong' }}</LChip>
          </div>
          <ul class="mt-2 space-y-1 text-sm">
            <li v-for="o in it.options" :key="o.key" class="rounded-lg px-2 py-1" :class="o.key === it.key ? 'bg-[#d9f2e3] font-bold' : o.key === it.chosen ? 'bg-[color:var(--merah-muda)] font-bold' : ''">
              <b>{{ o.key }}.</b> {{ o.text }}<span v-if="o.key === it.chosen" class="ml-1 text-xs">(dipilih)</span><span v-if="o.key === it.key" class="ml-1 text-xs">(kunci)</span>
            </li>
          </ul>
          <p v-if="it.explanation" class="mt-2 text-xs leading-relaxed text-[color:var(--ink-soft)]"><b>Pembahasan:</b> {{ it.explanation }}</p>
        </li>
      </ol>
    </template>
  </LDialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { leaderApi } from '../../services/leaderApi'
import LDialog from './LDialog.vue'
import ErrorState from './ErrorState.vue'
import LChip from './LChip.vue'
import { KIND_LABEL, RESULT_STATUS, fmtScore, formatWib } from '../../utils/leader'

const props = defineProps({ attemptId: Number })
defineEmits(['close'])
const data = ref(null)
const loading = ref(false)
const error = ref('')

const load = async () => {
  if (!props.attemptId) return
  loading.value = true
  error.value = ''
  data.value = null
  try {
    data.value = await leaderApi.attemptDetail(props.attemptId)
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}
watch(() => props.attemptId, load)
</script>
