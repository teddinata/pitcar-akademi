<!-- Bagikan soal: pilih materi + peserta + jenis + batas waktu, lalu tampilkan tautan tiap peserta. -->
<template>
  <LDialog :open="open" :title="result ? 'Tautan siap dibagikan' : 'Bagikan soal'" :subtitle="result ? 'Tautan hanya untuk satu peserta. Kirim lewat WhatsApp atau salin.' : ''" wide @close="$emit('close')">
    <ul v-if="result" class="space-y-3">
      <li v-for="a in result" :key="a.id" class="rounded-xl border-2 border-[color:var(--ink)] p-3">
        <p class="font-extrabold">{{ a.participant_name }}</p>
        <p class="text-xs text-[color:var(--ink-soft)]">{{ a.topic_name }} · {{ KIND_LABEL[a.kind] }} · {{ a.time_limit_minutes }} menit</p>
        <input :value="a.link" readonly class="u-input mt-2 font-mono !text-xs" aria-label="Tautan" @focus="$event.target.select()" />
        <div class="mt-2 flex flex-wrap gap-2">
          <button type="button" class="u-btn" @click="copy(a)"><ClipboardDocumentIcon class="h-5 w-5" />Salin</button>
          <a :href="waUrl(a, partOf(a))" target="_blank" rel="noopener" class="u-btn u-btn-merah"><ChatBubbleLeftEllipsisIcon class="h-5 w-5" />Kirim WhatsApp</a>
        </div>
        <p v-if="!waNumber(partOf(a)?.phone)" class="u-help">Nomor WhatsApp belum diisi. WhatsApp terbuka tanpa tujuan, pilih kontaknya sendiri.</p>
      </li>
    </ul>

    <form v-else id="as-form" class="space-y-5" @submit.prevent="submit">
      <div>
        <label for="as-topic" class="u-label">Materi</label>
        <select id="as-topic" v-model="form.topic_id" class="u-input" required>
          <option value="" disabled>Pilih materi</option>
          <option v-for="t in program.topics" :key="t.id" :value="t.id">{{ t.name }} ({{ t.question_count }} soal)</option>
        </select>
        <p v-if="topic && !topic.question_count" class="u-notice mt-2">Materi ini belum punya soal.</p>
        <p v-else-if="topic?.missing_key" class="u-notice mt-2">Ada soal tanpa kunci jawaban, nilai belum akurat.</p>
      </div>

      <fieldset>
        <legend class="u-label">Peserta</legend>
        <label class="flex min-h-11 items-center gap-3 text-sm font-bold"><input type="checkbox" class="u-check" :checked="allSelected" @change="toggleAll" />Pilih semua ({{ active.length }})</label>
        <ul class="mt-1 max-h-56 overflow-y-auto rounded-xl border-2 border-[color:var(--ink)]">
          <li v-for="p in active" :key="p.id" class="border-b-2 border-[color:var(--ink)] last:border-0">
            <label class="flex min-h-11 cursor-pointer items-center gap-3 px-3 text-sm"><input v-model="form.participant_ids" type="checkbox" :value="p.id" class="u-check" /><span class="font-bold">{{ p.name }}</span><span v-if="p.job" class="text-xs text-[color:var(--ink-soft)]">{{ p.job }}</span></label>
          </li>
        </ul>
      </fieldset>

      <fieldset>
        <legend class="u-label">Jenis</legend>
        <div class="flex gap-2">
          <label v-for="(label, k) in KIND_LABEL" :key="k" class="u-pilih" :class="form.kind === k ? 'is-on' : ''">
            <input v-model="form.kind" type="radio" :value="k" class="sr-only" />{{ label }}
          </label>
        </div>
      </fieldset>

      <div class="grid gap-3 sm:grid-cols-2">
        <div><label for="as-min" class="u-label">Batas waktu (menit)</label><input id="as-min" v-model.number="form.minutes" type="number" min="1" class="u-input" /><p class="u-help">Bawaan dari materi.</p></div>
        <div><label for="as-until" class="u-label">Berlaku sampai (WIB, opsional)</label><input id="as-until" v-model="form.until" type="datetime-local" class="u-input" /></div>
      </div>
    </form>

    <template #footer>
      <template v-if="result">
        <button type="button" class="u-btn u-btn-hitam" @click="$emit('close')">Selesai</button>
      </template>
      <template v-else>
        <button type="button" class="u-btn" @click="$emit('close')">Batal</button>
        <button type="submit" form="as-form" class="u-btn u-btn-merah" :disabled="saving || !form.topic_id || !form.participant_ids.length">{{ saving ? 'Membagikan...' : `Bagikan ke ${form.participant_ids.length} peserta` }}</button>
      </template>
    </template>
  </LDialog>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { ChatBubbleLeftEllipsisIcon, ClipboardDocumentIcon } from '@heroicons/vue/24/outline'
import { leaderApi } from '../../services/leaderApi'
import LDialog from './LDialog.vue'
import { notify } from './notice'
import { KIND_LABEL, copyText, waNumber, waUrl, wibInputToUtc } from '../../utils/leader'

const props = defineProps({ open: Boolean, program: Object, participants: Array, presetTopicId: { type: Number, default: null } })
const emit = defineEmits(['close', 'done'])

const form = reactive({ topic_id: '', participant_ids: [], kind: 'initial', minutes: 30, until: '' })
const result = ref(null)
const saving = ref(false)

const active = computed(() => props.participants.filter((p) => p.active))
const topic = computed(() => props.program.topics.find((t) => t.id === form.topic_id))
const allSelected = computed(() => active.value.length > 0 && form.participant_ids.length === active.value.length)
const partOf = (a) => props.participants.find((p) => p.id === a.participant_id)

const toggleAll = () => { form.participant_ids = allSelected.value ? [] : active.value.map((p) => p.id) }

watch(() => form.topic_id, () => { if (topic.value) form.minutes = topic.value.time_limit_minutes })
watch(() => props.open, (v) => {
  if (!v) return
  result.value = null
  Object.assign(form, { topic_id: props.presetTopicId || '', participant_ids: [], kind: 'initial', minutes: 30, until: '' })
  if (topic.value) form.minutes = topic.value.time_limit_minutes
})

const submit = async () => {
  saving.value = true
  try {
    const payload = { topic_id: form.topic_id, participant_ids: form.participant_ids, kind: form.kind, time_limit_minutes: form.minutes || undefined }
    const until = wibInputToUtc(form.until)
    if (until) payload.open_until = until
    result.value = await leaderApi.assign(payload)
    emit('done')
  } catch (e) {
    notify.error(e.message)
  } finally {
    saving.value = false
  }
}

const copy = async (a) => {
  if (await copyText(a.link)) notify.success('Tautan tersalin')
  else notify.error('Tautan belum bisa disalin')
}
</script>
