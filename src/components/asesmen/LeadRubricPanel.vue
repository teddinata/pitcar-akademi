<!-- Bagian 3 paket: rubrik pilar L1-L4 yang dipakai lead menilai peserta, plus
     nama jenjang (dipakai juga di hasil & data karyawan). -->
<template>
  <div class="space-y-5">
    <div class="u-card p-4 bg-[#fffbe0] text-sm" data-tour="lead-cara">
      <p class="font-extrabold">Cara lead menilai</p>
      <p class="mt-1">Untuk tiap pilar, lead memilih L1–L4 yang paling cocok dengan kerja yang ia lihat sendiri, <b>wajib menulis bukti kejadian nyata</b>, atau memilih <b>Belum pernah melihat</b> (tidak dihitung). Nilai beberapa lead dirata-rata. Lead ditunjuk admin per peserta di halaman periode.</p>
    </div>

    <!-- Nama jenjang -->
    <form class="u-card p-4 sm:p-5" data-tour="lead-jenjang" @submit.prevent="simpanJenjang">
      <h3 class="u-display text-lg font-extrabold">Nama jenjang</h3>
      <p class="text-sm text-[color:var(--ink-soft)]">Tampil di hasil peserta dan data karyawan (PitClock).</p>
      <div class="mt-3 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <label v-for="n in 4" :key="n"><span class="u-level mb-1.5" :class="`l${n}`">L{{ n }}</span>
          <input v-model="nama[n]" class="u-input" /></label>
      </div>
      <div class="mt-3 flex items-center gap-3">
        <button class="u-btn u-btn-hitam !min-h-10" :disabled="busy">Simpan nama jenjang</button>
        <span v-if="pesan.jenjang" class="text-sm font-bold text-[color:var(--hijau)]">{{ pesan.jenjang }}</span>
      </div>
    </form>

    <!-- Pilar -->
    <form v-for="p in pillars" :key="p.id" class="u-card p-4 sm:p-5" data-tour="lead-pilar" @submit.prevent="simpanPilar(p)">
      <div class="grid md:grid-cols-[18rem_1fr] gap-3">
        <label><span class="u-label">Nama pilar</span><input v-model="edit[p.id].name" class="u-input font-bold" /></label>
        <label><span class="u-label">Keterangan</span><input v-model="edit[p.id].description" class="u-input" /></label>
      </div>
      <div class="mt-3 grid md:grid-cols-2 gap-3">
        <label v-for="n in 4" :key="n" class="block">
          <span class="flex items-center gap-2 mb-1.5"><span class="u-level !h-7 !min-w-0" :class="`l${n}`">L{{ n }}</span><span class="text-sm font-extrabold">{{ nama[n] }}</span></span>
          <textarea v-model="edit[p.id][`level_${n}`]" rows="3" class="u-input" :class="!edit[p.id][`level_${n}`]?.trim() ? '!border-[color:var(--merah)]' : ''" placeholder="Perilaku yang terlihat di jenjang ini"></textarea>
        </label>
      </div>
      <div class="mt-3">
        <span class="u-label">Kursus rekomendasi bila levelnya rendah</span>
        <div class="flex flex-wrap items-center gap-1.5">
          <span v-for="cid in edit[p.id].course_ids" :key="cid" class="u-chip !py-1">{{ kursusNama(cid) }}
            <button type="button" class="-mr-1 grid place-items-center w-5 h-5 rounded-full hover:bg-black/10" :aria-label="`Hapus ${kursusNama(cid)}`" @click="edit[p.id].course_ids = edit[p.id].course_ids.filter((x) => x !== cid)"><XMarkIcon class="w-3.5 h-3.5" /></button>
          </span>
          <select class="u-input !w-auto !min-h-9 !py-1 text-sm" @change="tambahKursus(p, $event)">
            <option value="">+ Tambah kursus</option>
            <option v-for="c in kursus.filter((k) => !edit[p.id].course_ids.includes(k.id))" :key="c.id" :value="c.id">{{ c.name }}</option>
          </select>
        </div>
      </div>
      <div class="mt-3 flex items-center gap-3">
        <button class="u-btn u-btn-hitam !min-h-10" :disabled="busy">Simpan {{ edit[p.id].name || 'pilar' }}</button>
        <span v-if="pesan[p.id]" class="text-sm font-bold text-[color:var(--hijau)]">{{ pesan[p.id] }}</span>
      </div>
    </form>
    <p v-if="error" class="rounded-lg border-2 border-[color:var(--merah)] bg-[color:var(--merah-muda)] p-2 text-sm font-bold text-[color:var(--merah-tua)]" role="alert">{{ error }}</p>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref, watch } from 'vue'
import { XMarkIcon } from '@heroicons/vue/24/outline'
import { competencyApi } from '../../services/competencyApi'

const props = defineProps({
  profile: { type: Object, required: true },
  pillars: { type: Array, required: true }, // diubah di tempat
})
const emit = defineEmits(['changed'])
const busy = ref(false)
const error = ref('')
const pesan = reactive({})
const nama = reactive({})
const edit = reactive({})
const kursus = ref([])

function isi() {
  for (let n = 1; n <= 4; n++) nama[n] = props.profile.level_names?.[n] || ''
  props.pillars.forEach((p) => {
    edit[p.id] = { name: p.name, description: p.description || '', course_ids: (p.courses || []).map((c) => c.id),
      level_1: p.rubric['1'] || '', level_2: p.rubric['2'] || '', level_3: p.rubric['3'] || '', level_4: p.rubric['4'] || '' }
  })
}
const kursusNama = (id) => kursus.value.find((k) => k.id === id)?.name
  || props.pillars.flatMap((p) => p.courses || []).find((c) => c.id === id)?.name || `Kursus #${id}`
function tambahKursus(p, e) {
  const id = Number(e.target.value)
  if (id && !edit[p.id].course_ids.includes(id)) edit[p.id].course_ids.push(id)
  e.target.value = ''
}
function tandai(key, teks) { pesan[key] = teks; setTimeout(() => { pesan[key] = '' }, 2500) }

async function simpanJenjang() {
  busy.value = true
  error.value = ''
  try {
    const saved = await competencyApi.saveProfile(props.profile.id, Object.fromEntries([1, 2, 3, 4].map((n) => [`level_${n}_name`, nama[n]])))
    Object.assign(props.profile, saved)
    tandai('jenjang', 'Tersimpan.')
    emit('changed')
  } catch (e) { error.value = e.message } finally { busy.value = false }
}
async function simpanPilar(p) {
  busy.value = true
  error.value = ''
  try {
    const saved = await competencyApi.savePillar(p.id, { ...edit[p.id] })
    props.pillars.splice(props.pillars.findIndex((x) => x.id === p.id), 1, saved)
    tandai(p.id, 'Tersimpan.')
    emit('changed')
  } catch (e) { error.value = e.message } finally { busy.value = false }
}

isi() // sebelum render pertama: form pilar terisi
watch(() => props.profile.id, isi)
onMounted(async () => {
  try { kursus.value = await competencyApi.courses() } catch { kursus.value = [] }
})
</script>
