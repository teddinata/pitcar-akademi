<!-- Daftar materi program: jadwal, jumlah soal, status; tambah/ubah/hapus materi. -->
<template>
  <div>
    <div class="flex flex-wrap items-center justify-between gap-3">
      <h3 class="u-display text-xl font-extrabold">Materi ({{ program.topics.length }})</h3>
      <button type="button" class="u-btn u-btn-merah" @click="openTopic(null)"><PlusIcon class="h-5 w-5" />Tambah materi</button>
    </div>

    <div v-if="!program.topics.length" class="u-card mt-4 p-8 text-center font-bold">Belum ada materi. Tambah materi pertama, lalu isi soalnya.</div>

    <ul v-else class="mt-4 grid gap-4 lg:grid-cols-2">
      <li v-for="(t, i) in program.topics" :key="t.id" class="u-card p-4">
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div class="min-w-0 flex-1">
            <p class="text-xs font-extrabold uppercase tracking-[.06em] text-[color:var(--ink-soft)]">Materi {{ i + 1 }}<template v-if="t.schedule_label"> · {{ t.schedule_label }}</template></p>
            <router-link :to="`/dashboard/asesmen/calon-kabeng/materi/${t.id}`" class="u-display mt-0.5 block text-lg font-extrabold leading-snug hover:underline underline-offset-4">{{ t.name }}</router-link>
            <p v-if="t.description" class="mt-1 line-clamp-2 text-sm text-[color:var(--ink-soft)]">{{ t.description }}</p>
          </div>
          <LChip :tone="t.question_count && !t.missing_key ? 'green' : t.question_count ? 'amber' : 'gray'">
            {{ !t.question_count ? 'Belum ada soal' : t.missing_key ? 'Ada soal tanpa kunci' : 'Siap' }}
          </LChip>
        </div>
        <div class="mt-3 grid grid-cols-4 gap-2 text-center">
          <div class="rounded-lg border-2 border-[color:var(--ink)] py-2"><p class="u-display text-lg font-extrabold">{{ t.question_count }}</p><p class="text-[11px] font-bold">soal</p></div>
          <div class="rounded-lg border-2 border-[color:var(--ink)] py-2"><p class="u-display text-lg font-extrabold">{{ t.total_points }}</p><p class="text-[11px] font-bold">poin</p></div>
          <div class="rounded-lg border-2 border-[color:var(--ink)] py-2"><p class="u-display text-lg font-extrabold">{{ t.time_limit_minutes }}</p><p class="text-[11px] font-bold">menit</p></div>
          <div class="rounded-lg border-2 border-[color:var(--ink)] py-2"><p class="u-display text-lg font-extrabold">{{ t.material_count }}</p><p class="text-[11px] font-bold">bahan</p></div>
        </div>
        <p v-if="t.missing_key" class="u-notice mt-3">Beberapa soal belum punya kunci jawaban. Nilai peserta belum akurat sampai kunci diisi.</p>
        <div class="mt-3 flex flex-wrap gap-2">
          <router-link :to="`/dashboard/asesmen/calon-kabeng/materi/${t.id}`" class="u-btn u-btn-hitam">Buka soal & bahan</router-link>
          <button type="button" class="u-btn u-btn-ghost" @click="openTopic(t)"><PencilSquareIcon class="h-5 w-5" />Ubah</button>
          <button type="button" class="u-btn u-btn-ghost u-btn-bahaya" @click="toDelete = t"><TrashIcon class="h-5 w-5" />Hapus</button>
        </div>
      </li>
    </ul>

    <section class="u-card mt-6 p-4 sm:p-5">
      <h3 class="u-display text-xl font-extrabold">Dokumen program</h3>
      <p class="u-help">Panduan atau lampiran umum program. Peserta tidak melihat file ini kecuali Kakak membagikannya sendiri.</p>
      <ul v-if="docs.length" class="mt-3">
        <li v-for="d in docs" :key="d.id" class="flex items-center justify-between gap-3 border-t-2 border-[color:var(--ink)] py-2 text-sm first:border-t-0">
          <span class="min-w-0 truncate font-bold">{{ d.name }}</span>
          <span class="flex shrink-0 gap-1">
            <button type="button" class="u-btn u-btn-ghost" @click="download(d)"><ArrowDownTrayIcon class="h-5 w-5" />Unduh</button>
            <button type="button" class="u-btn u-btn-ghost u-btn-bahaya !w-11 !p-0" @click="removeDoc(d)"><TrashIcon class="h-5 w-5" /><span class="sr-only">Hapus</span></button>
          </span>
        </li>
      </ul>
      <p v-else class="mt-3 text-sm text-[color:var(--ink-soft)]">Belum ada dokumen.</p>
      <label class="u-btn mt-3 cursor-pointer" :class="{ 'opacity-60': uploading }">
        <ArrowUpTrayIcon class="h-5 w-5" />{{ uploading ? 'Mengunggah...' : 'Unggah dokumen' }}
        <input type="file" class="sr-only" :disabled="uploading" @change="upload" />
      </label>
    </section>

    <LDialog :open="dialog" :title="form.id ? 'Ubah materi' : 'Tambah materi'" @close="dialog = false">
      <form id="tp-form" class="space-y-4" @submit.prevent="save">
        <div><label for="tf-name" class="u-label">Nama materi</label><input id="tf-name" v-model="form.name" class="u-input" required /></div>
        <div><label for="tf-sch" class="u-label">Jadwal</label><input id="tf-sch" v-model="form.schedule_label" class="u-input" placeholder="Contoh: Minggu 1, Senin 10 Nov" /></div>
        <div class="grid grid-cols-2 gap-3">
          <div><label for="tf-time" class="u-label">Batas waktu (menit)</label><input id="tf-time" v-model.number="form.time_limit_minutes" type="number" min="1" class="u-input" /></div>
          <div><label for="tf-seq" class="u-label">Urutan</label><input id="tf-seq" v-model.number="form.sequence" type="number" class="u-input" /></div>
        </div>
        <p class="u-help">Ringkasan, petunjuk peserta, nilai lulus, dan hasil untuk peserta diatur di halaman materi.</p>
      </form>
      <template #footer>
        <button type="button" class="u-btn" @click="dialog = false">Batal</button>
        <button type="submit" form="tp-form" class="u-btn u-btn-merah" :disabled="saving">{{ saving ? 'Menyimpan...' : 'Simpan' }}</button>
      </template>
    </LDialog>

    <ConfirmDialog :open="!!toDelete" title="Hapus materi?" :message="`Materi &quot;${toDelete?.name}&quot; beserta soalnya akan dihapus. Bila sudah ada penugasan, materi hanya diarsipkan.`" confirm-label="Hapus" :busy="saving" @cancel="toDelete = null" @confirm="doDelete" />
  </div>
</template>

<script setup>
import { reactive, ref, watch } from 'vue'
import { ArrowDownTrayIcon, ArrowUpTrayIcon, PencilSquareIcon, PlusIcon, TrashIcon } from '@heroicons/vue/24/outline'
import { downloadMaterial, fileToBase64, leaderApi } from '../../services/leaderApi'
import LDialog from './LDialog.vue'
import ConfirmDialog from './ConfirmDialog.vue'
import LChip from './LChip.vue'
import { notify } from './notice'

const props = defineProps({ program: Object, config: Object })
const emit = defineEmits(['changed'])

const dialog = ref(false)
const saving = ref(false)
const toDelete = ref(null)
const uploading = ref(false)
const docs = ref([])
const form = reactive({ id: null, name: '', schedule_label: '', time_limit_minutes: 30, sequence: 10 })

watch(() => props.program, () => { docs.value = props.program.materials || [] }, { immediate: true })

const openTopic = (t) => {
  Object.assign(form, t
    ? { id: t.id, name: t.name, schedule_label: t.schedule_label || '', time_limit_minutes: t.time_limit_minutes, sequence: t.sequence }
    : { id: null, name: '', schedule_label: '', time_limit_minutes: 30, sequence: (props.program.topics.length + 1) * 10 })
  dialog.value = true
}

const save = async () => {
  saving.value = true
  try {
    const { id, ...data } = form
    if (!id) data.program_id = props.program.id
    await leaderApi.topicSave(id, data)
    dialog.value = false
    notify.success('Materi tersimpan')
    emit('changed')
  } catch (e) {
    notify.error(e.message)
  } finally {
    saving.value = false
  }
}

const doDelete = async () => {
  saving.value = true
  try {
    await leaderApi.topicDelete(toDelete.value.id)
    toDelete.value = null
    notify.success('Materi dihapus')
    emit('changed')
  } catch (e) {
    notify.error(e.message)
  } finally {
    saving.value = false
  }
}

const upload = async (ev) => {
  const file = ev.target.files?.[0]
  ev.target.value = ''
  if (!file) return
  uploading.value = true
  try {
    await leaderApi.materialUpload({ program_id: props.program.id, filename: file.name, content: await fileToBase64(file) })
    notify.success('Dokumen terunggah')
    emit('changed')
  } catch (e) {
    notify.error(e.message)
  } finally {
    uploading.value = false
  }
}

const download = async (d) => {
  try { await downloadMaterial(d) } catch { notify.error('Dokumen belum bisa diunduh. Coba lagi.') }
}

const removeDoc = async (d) => {
  try {
    await leaderApi.materialDelete(d.id)
    notify.success('Dokumen dihapus')
    emit('changed')
  } catch (e) {
    notify.error(e.message)
  }
}
</script>
