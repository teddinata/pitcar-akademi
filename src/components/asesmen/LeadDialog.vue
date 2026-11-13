<!-- Atur lead untuk satu atau beberapa peserta. Klik nama = langsung jadi lead; × pada lead = lepas.
     Tidak ada tombol simpan: tiap klik tersimpan, dan daftar "Lead sekarang" menunjukkan hasilnya.
     Harus dipasang di dalam elemen .ujian (gaya u-* berlaku di sana). -->
<template>
  <div v-if="open" class="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-3 sm:items-center sm:p-6" @mousedown.self="$emit('close')">
    <div ref="panel" role="dialog" aria-modal="true" aria-labelledby="lead-judul" tabindex="-1"
         class="u-card w-full max-w-xl p-4 sm:p-5 focus:outline-none" @keydown.esc.stop="$emit('close')" @keydown.tab="jebak">
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <h2 id="lead-judul" class="u-display text-xl font-extrabold leading-tight">{{ judul }}</h2>
          <p class="mt-1 text-sm text-[color:var(--ink-soft)]">Klik nama untuk menjadikannya lead. Boleh lebih dari satu, dan langsung tersimpan.</p>
        </div>
        <button type="button" class="u-btn !min-h-11 !px-2.5 shrink-0" aria-label="Tutup" @click="$emit('close')"><XMarkIcon class="h-5 w-5" aria-hidden="true" /></button>
      </div>

      <!-- Lead sekarang -->
      <section class="mt-4" aria-labelledby="lead-sekarang">
        <h3 id="lead-sekarang" class="u-label">Lead sekarang</h3>
        <p v-if="!sekarang.length" class="text-sm font-bold text-[color:var(--merah-tua)]">Belum ada lead.</p>
        <ul v-else class="flex flex-wrap gap-1.5">
          <li v-for="l in sekarang" :key="l.id">
            <span class="u-chip !py-1 !text-sm" :class="l.jumlah === targets.length ? 'u-chip-hijau' : ''">
              {{ l.name }}<span v-if="targets.length > 1" class="font-normal"> · {{ l.jumlah === targets.length ? 'semua' : `${l.jumlah} dari ${targets.length}` }}</span>
              <button type="button" class="-mr-1.5 grid h-7 w-7 cursor-pointer place-items-center rounded-full hover:bg-black/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[color:var(--ink)] disabled:cursor-not-allowed disabled:opacity-50"
                      :disabled="!!sibuk" :aria-label="`Lepas ${l.name} dari lead`" @click="ubah(l, 'remove')"><XMarkIcon class="h-4 w-4" aria-hidden="true" /></button>
            </span>
          </li>
        </ul>
        <p v-if="targets.length > 1 && sekarang.some((l) => l.jumlah < targets.length)" class="mt-1.5 text-xs text-[color:var(--ink-soft)]">Lead yang belum di semua peserta: klik namanya di daftar bawah untuk menambahkannya ke semua.</p>
      </section>

      <!-- Cari & pilih -->
      <section class="mt-4" aria-labelledby="lead-cari-label">
        <label id="lead-cari-label" for="lead-cari" class="u-label">Tambah lead</label>
        <input id="lead-cari" ref="kolomCari" v-model="q" type="search" class="u-input" placeholder="Cari nama, misalnya kabeng atau foreman" autocomplete="off" @input="cari" />
        <div v-if="!q.trim() && saranTampil.length" class="mt-2">
          <p class="text-xs font-bold text-[color:var(--ink-soft)]">Sudah jadi lead di periode ini</p>
          <div class="mt-1 flex flex-wrap gap-1.5">
            <button v-for="s in saranTampil" :key="s.id" type="button" class="u-chip !py-1.5 !text-sm cursor-pointer hover:bg-[#fffbe0] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--ink)] disabled:cursor-not-allowed disabled:opacity-50"
                    :disabled="!!sibuk" @click="ubah(s, 'add')"><PlusIcon class="h-4 w-4" aria-hidden="true" />{{ s.name }}</button>
          </div>
        </div>
        <div class="mt-2 max-h-64 min-h-[6rem] overflow-y-auto rounded-xl border-2 border-[color:var(--ink)]" aria-live="polite">
          <p v-if="mencari && !hasil.length" class="px-3 py-3 text-sm">Mencari…</p>
          <p v-else-if="galatCari" class="px-3 py-3 text-sm text-[color:var(--merah-tua)]" role="alert">Daftar karyawan tidak bisa dimuat: {{ galatCari }} <button type="button" class="cursor-pointer font-bold underline" @click="cari">Coba lagi</button></p>
          <p v-else-if="!pilihan.length" class="px-3 py-3 text-sm">{{ q.trim() ? `Tidak ada karyawan bernama "${q.trim()}".` : 'Ketik nama untuk mencari karyawan.' }}</p>
          <ul v-else class="divide-y-2 divide-[color:var(--ink)]">
            <li v-for="p in pilihan" :key="p.id">
              <button type="button" class="flex min-h-11 w-full cursor-pointer items-center justify-between gap-3 px-3 py-2 text-left hover:bg-[#fffbe0] focus-visible:bg-[#fffbe0] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                      :disabled="!!sibuk" @click="ubah(p, 'add')">
                <span class="min-w-0"><span class="block font-bold leading-tight">{{ p.name }}</span><span v-if="p.job || p.department" class="block text-xs text-[color:var(--ink-soft)]">{{ [p.job, p.department].filter(Boolean).join(' · ') }}</span></span>
                <span class="shrink-0 text-xs font-extrabold">{{ sibuk === p.id ? 'Menyimpan…' : 'Jadikan lead' }}</span>
              </button>
            </li>
          </ul>
        </div>
      </section>

      <p v-if="galat" class="mt-3 rounded-lg border-2 border-[color:var(--merah)] bg-[color:var(--merah-muda)] px-3 py-2 text-sm font-bold text-[color:var(--merah-tua)]" role="alert">{{ galat }}</p>
      <div class="mt-4 flex justify-end"><button type="button" class="u-btn u-btn-hitam" @click="$emit('close')">Selesai</button></div>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { PlusIcon, XMarkIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  open: Boolean,
  /** Peserta yang diatur: [{ id, employee: { id, name }, leads: [{ id, name }] }] */
  targets: { type: Array, default: () => [] },
  /** Lead yang sudah dipakai di periode ini (pilihan cepat). */
  suggestions: { type: Array, default: () => [] },
  search: { type: Function, required: true },
  /** (lead, 'add' | 'remove') => Promise; melempar Error bila gagal. */
  apply: { type: Function, required: true },
})
defineEmits(['close'])

const panel = ref(null)
const kolomCari = ref(null)
const q = ref('')
const hasil = ref([])
const mencari = ref(false)
const galatCari = ref('')
const sibuk = ref(null)
const galat = ref('')

const judul = computed(() => (props.targets.length === 1 ? `Lead untuk ${props.targets[0].employee.name}` : `Lead untuk ${props.targets.length} peserta`))

// Gabungan lead semua peserta yang diatur, dengan jumlah peserta yang memakainya.
const sekarang = computed(() => {
  const peta = new Map()
  props.targets.forEach((t) => t.leads.forEach((l) => {
    const ada = peta.get(l.id) || { id: l.id, name: l.name, jumlah: 0 }
    ada.jumlah += 1
    peta.set(l.id, ada)
  }))
  return [...peta.values()].sort((a, b) => b.jumlah - a.jumlah || a.name.localeCompare(b.name))
})
// Yang sudah jadi lead semua peserta tidak ditawarkan lagi; peserta tunggal tidak bisa jadi lead dirinya.
const penuh = computed(() => new Set(sekarang.value.filter((l) => l.jumlah === props.targets.length).map((l) => l.id)))
const diri = computed(() => (props.targets.length === 1 ? props.targets[0].employee.id : null))
const boleh = (p) => !penuh.value.has(p.id) && p.id !== diri.value
const pilihan = computed(() => hasil.value.filter(boleh))
const saranTampil = computed(() => props.suggestions.filter(boleh))

let jeda = null
let tiket = 0
const muat = async () => {
  const mine = ++tiket
  mencari.value = true
  galatCari.value = ''
  try {
    const data = await props.search(q.value.trim())
    if (mine === tiket) hasil.value = data.slice(0, 30)
  } catch (e) {
    if (mine === tiket) { hasil.value = []; galatCari.value = e.message }
  } finally {
    if (mine === tiket) mencari.value = false
  }
}
const cari = () => { clearTimeout(jeda); jeda = setTimeout(muat, 220) }

const ubah = async (orang, mode) => {
  if (sibuk.value) return
  sibuk.value = orang.id
  galat.value = ''
  try {
    await props.apply({ id: orang.id, name: orang.name }, mode)
    if (mode === 'add' && q.value) { q.value = ''; muat() }
    await nextTick()
    kolomCari.value?.focus()
  } catch (e) {
    galat.value = e.message
  } finally {
    sibuk.value = null
  }
}

// Tab berputar di dalam dialog.
const jebak = (e) => {
  const el = [...panel.value.querySelectorAll('button:not(:disabled), input, [href]')]
  if (!el.length) return
  const awal = el[0]
  const akhir = el[el.length - 1]
  if (e.shiftKey && document.activeElement === awal) { e.preventDefault(); akhir.focus() }
  else if (!e.shiftKey && document.activeElement === akhir) { e.preventDefault(); awal.focus() }
}

let pembuka = null
watch(() => props.open, async (v) => {
  if (v) {
    pembuka = document.activeElement
    q.value = ''
    galat.value = ''
    hasil.value = []
    muat()
    await nextTick()
    kolomCari.value?.focus()
  } else {
    tiket++
    pembuka?.focus?.()
  }
})
onBeforeUnmount(() => clearTimeout(jeda))
</script>
