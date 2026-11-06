<!-- Assessment Calon Kabeng (kelola): ringkasan program, materi, peserta & penugasan, rekap nilai. -->
<template>
  <div class="ujian min-h-screen p-4 md:p-6">
    <LNotice />
    <div class="mb-6 flex flex-wrap items-start justify-between gap-3">
      <div class="min-w-0">
        <p class="flex items-center gap-2 text-xs font-extrabold tracking-[.08em] uppercase text-[color:var(--ink-soft)]">Asesmen <span class="u-new is-hot">HOT!</span></p>
        <h1 class="u-display mt-1 text-[1.8rem] sm:text-[2.2rem] font-extrabold leading-none">Assessment Calon Kabeng</h1>
        <p class="mt-2 max-w-2xl text-[15px] text-[color:var(--ink-soft)]">Kelola materi dan soal, bagikan tautan ujian ke peserta, lalu pantau nilai dan kelulusan program.</p>
      </div>
      <button v-if="config" type="button" class="u-btn" @click="openProgram(null)"><PlusIcon class="h-5 w-5" />Program baru</button>
    </div>

    <div v-if="loading" class="space-y-3" aria-busy="true"><div class="u-card h-24 animate-pulse"></div><div class="u-card h-40 animate-pulse"></div></div>
    <ErrorState v-else-if="error" :message="error" @retry="load" />
    <div v-else-if="!config.programs.length" class="u-card p-8 text-center">
      <p class="u-display text-xl font-extrabold">Belum ada program</p>
      <p class="mt-1 text-[15px] text-[color:var(--ink-soft)]">Buat program pertama untuk mulai menambah materi dan peserta.</p>
      <button type="button" class="u-btn u-btn-merah mt-4" @click="openProgram(null)">Buat program</button>
    </div>

    <template v-else>
      <div v-if="config.programs.length > 1" class="mb-4 max-w-sm">
        <label for="lp-program" class="u-label">Program</label>
        <select id="lp-program" v-model="programId" class="u-input">
          <option v-for="p in config.programs" :key="p.id" :value="p.id">{{ p.name }}{{ p.active ? '' : ' (nonaktif)' }}</option>
        </select>
      </div>

      <section class="u-card p-4 sm:p-5">
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div class="min-w-0">
            <h2 class="u-display text-xl font-extrabold">{{ program.name }}</h2>
            <p v-if="program.description" class="mt-1 max-w-prose whitespace-pre-line text-sm text-[color:var(--ink-soft)]">{{ program.description }}</p>
          </div>
          <div class="flex flex-wrap gap-2">
            <button type="button" class="u-btn" @click="openProgram(program)"><PencilSquareIcon class="h-5 w-5" />Ubah</button>
            <button type="button" class="u-btn u-btn-ghost u-btn-bahaya" @click="deleteOpen = true"><TrashIcon class="h-5 w-5" />Hapus</button>
          </div>
        </div>
        <div class="mt-4 grid gap-3 sm:grid-cols-3">
          <div class="rounded-xl border-2 border-[color:var(--ink)] p-3"><p class="text-xs font-extrabold uppercase tracking-[.06em] text-[color:var(--ink-soft)]">Aturan lulus</p><p class="mt-1 text-sm">Nilai tiap materi minimal {{ program.pass_score }} dan rata-rata minimal {{ program.pass_score }}.</p></div>
          <div class="rounded-xl border-2 border-[color:var(--ink)] p-3"><p class="text-xs font-extrabold uppercase tracking-[.06em] text-[color:var(--ink-soft)]">Susulan</p><p class="mt-1 text-sm">Nilai {{ config.remedial_from }}-{{ program.pass_score - 1 }}: remedial. Di bawah {{ config.remedial_from }}: pembelajaran ulang.</p></div>
          <div class="rounded-xl border-2 border-[color:var(--ink)] bg-[color:var(--stabilo)] p-3"><p class="text-xs font-extrabold uppercase tracking-[.06em]">Peserta</p><p class="mt-1"><span class="u-angka !text-[2rem]">{{ program.participant_count }}</span> <span class="text-sm font-bold">orang · {{ program.topics.length }} materi</span></p></div>
        </div>
      </section>

      <nav class="u-tabs mt-6" role="tablist" aria-label="Bagian program">
        <button v-for="t in TABS" :key="t.value" type="button" role="tab" :aria-selected="tab === t.value" class="u-tab" :class="tab === t.value ? 'is-active' : ''" @click="setTab(t.value)">{{ t.label }}</button>
      </nav>

      <MaterialsTab v-if="tab === 'materi'" :program="program" :config="config" class="mt-5" @changed="load(true)" />
      <ParticipantsTab v-else-if="tab === 'peserta'" :program="program" :config="config" class="mt-5" />
      <RecapTab v-else :program="program" class="mt-5" />
    </template>

    <LDialog :open="programDialog" :title="programForm.id ? 'Ubah program' : 'Program baru'" @close="programDialog = false">
      <form id="lp-form" class="space-y-4" @submit.prevent="saveProgram">
        <div><label for="pf-name" class="u-label">Nama program</label><input id="pf-name" v-model="programForm.name" class="u-input" required /></div>
        <div><label for="pf-code" class="u-label">Kode (opsional)</label><input id="pf-code" v-model="programForm.code" class="u-input" /></div>
        <div><label for="pf-desc" class="u-label">Deskripsi</label><textarea id="pf-desc" v-model="programForm.description" rows="4" class="u-input"></textarea></div>
        <div class="grid grid-cols-2 gap-3">
          <div><label for="pf-pass" class="u-label">Nilai lulus</label><input id="pf-pass" v-model.number="programForm.pass_score" type="number" min="1" max="100" class="u-input" /></div>
          <div><label for="pf-seq" class="u-label">Urutan</label><input id="pf-seq" v-model.number="programForm.sequence" type="number" class="u-input" /></div>
        </div>
        <label class="flex min-h-11 items-center gap-3 text-sm font-bold"><input v-model="programForm.active" type="checkbox" class="u-check" />Program aktif</label>
      </form>
      <template #footer>
        <button type="button" class="u-btn" @click="programDialog = false">Batal</button>
        <button type="submit" form="lp-form" class="u-btn u-btn-merah" :disabled="saving">{{ saving ? 'Menyimpan...' : 'Simpan' }}</button>
      </template>
    </LDialog>

    <ConfirmDialog :open="deleteOpen" title="Hapus program?" :message="`Program &quot;${program?.name}&quot; akan dihapus. Bila sudah punya data, program hanya diarsipkan.`" confirm-label="Hapus" :busy="saving" @cancel="deleteOpen = false" @confirm="doProgramDelete" />
  </div>
</template>

<script setup>
import '@fontsource-variable/bricolage-grotesque'
import '../../styles/exam.css'
import '../../styles/asesmen.css'
import '../../styles/leader.css'
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { PencilSquareIcon, PlusIcon, TrashIcon } from '@heroicons/vue/24/outline'
import { leaderApi } from '../../services/leaderApi'
import LDialog from '../../components/leader/LDialog.vue'
import ConfirmDialog from '../../components/leader/ConfirmDialog.vue'
import ErrorState from '../../components/leader/ErrorState.vue'
import LNotice from '../../components/leader/LNotice.vue'
import { notify } from '../../components/leader/notice'
import MaterialsTab from '../../components/leader/MaterialsTab.vue'
import ParticipantsTab from '../../components/leader/ParticipantsTab.vue'
import RecapTab from '../../components/leader/RecapTab.vue'

const TABS = [
  { value: 'materi', label: 'Materi' },
  { value: 'peserta', label: 'Peserta & Penugasan' },
  { value: 'rekap', label: 'Rekap Nilai' },
]

const route = useRoute()
const router = useRouter()
const config = ref(null)
const loading = ref(true)
const error = ref('')
const programId = ref(Number(localStorage.getItem('leaderProgramId')) || null)
const tab = ref(TABS.some((t) => t.value === route.query.tab) ? route.query.tab : 'materi')
const programDialog = ref(false)
const deleteOpen = ref(false)
const saving = ref(false)
const programForm = reactive({ id: null, name: '', code: '', description: '', pass_score: 80, sequence: 10, active: true })

const program = computed(() => {
  const list = config.value?.programs || []
  const p = list.find((x) => x.id === programId.value) || list[0]
  return p ? { ...p, topics: p.topics || [] } : null
})

async function load(silent = false) {
  if (!silent) loading.value = true
  error.value = ''
  try {
    config.value = await leaderApi.config()
    if (!config.value.programs.some((p) => p.id === programId.value)) programId.value = config.value.programs[0]?.id || null
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

const setTab = (v) => { tab.value = v; router.replace({ query: { ...route.query, tab: v } }) }
watch(programId, (v) => { if (v) localStorage.setItem('leaderProgramId', v) })

const openProgram = (p) => {
  Object.assign(programForm, p
    ? { id: p.id, name: p.name, code: p.code || '', description: p.description || '', pass_score: p.pass_score, sequence: p.sequence, active: p.active }
    : { id: null, name: '', code: '', description: '', pass_score: 80, sequence: 10, active: true })
  programDialog.value = true
}

async function saveProgram() {
  saving.value = true
  try {
    const { id, ...data } = programForm
    const res = await leaderApi.programSave(id, data)
    if (!id && res?.id) programId.value = res.id
    programDialog.value = false
    notify.success('Program tersimpan')
    await load(true)
  } catch (e) {
    notify.error(e.message)
  } finally {
    saving.value = false
  }
}

async function doProgramDelete() {
  saving.value = true
  try {
    await leaderApi.programDelete(program.value.id)
    deleteOpen.value = false
    notify.success('Program dihapus')
    await load(true)
  } catch (e) {
    notify.error(e.message)
  } finally {
    saving.value = false
  }
}

onMounted(load)
</script>
