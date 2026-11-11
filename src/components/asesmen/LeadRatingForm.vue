<!-- Form lead Asesmen Terpadu (dunia lembar ujian, neo-brutal). Lead memilih deskripsi A-D per pilar;
     kotak bukti muncul tepat di bawah pilihan dengan pancingan Kapan / Mobil-WO / Apa yang dia lakukan / Hasilnya.
     Daftar periksa: kolom samping di desktop, bilah bulatan LJK lengket di bawah pada HP. -->
<template>
  <div class="ujian min-h-screen px-4 pt-4 pb-56 md:px-6 md:pt-6 md:pb-36 lg:pb-10">
    <div class="flex items-start gap-3">
      <router-link to="/dashboard/lms/my-competency" class="u-btn !min-h-10 !px-2.5 shrink-0" title="Kembali"><ChevronLeftIcon class="w-5 h-5" /></router-link>
      <div class="min-w-0">
        <p class="text-xs font-extrabold uppercase tracking-[.08em]">Penilaian lead</p>
        <h1 class="u-display text-[1.6rem] sm:text-[2rem] font-extrabold leading-tight">{{ data.participant.name }}</h1>
        <p class="text-sm text-[color:var(--ink-soft)]">{{ [data.participant.job, data.participant.department].filter(Boolean).join(' · ') }}</p>
      </div>
    </div>

    <div class="mt-4 lg:grid lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-5 lg:items-start">
      <div class="space-y-4 min-w-0">
        <div class="u-card p-4 !bg-[#fffbe0] text-[15px] leading-relaxed">
          <p class="font-extrabold">Pilih deskripsi yang paling sesuai dengan kerja yang Anda lihat sendiri.</p>
          <p class="mt-1">Urutan A–D sengaja diacak, jadi baca isinya. Setiap pilihan <b>wajib disertai satu kejadian nyata</b>: kapan, mobil/WO apa, dan apa yang dia kerjakan. Bila belum pernah melihat pekerjaannya di pilar itu, pilih <b>Belum pernah melihat</b>.</p>
        </div>
        <p v-if="data.state === 'submitted'" class="u-chip u-chip-hijau"><CheckCircleIcon class="w-4 h-4" />Sudah dikirim. Masih bisa diubah selama periode berjalan.</p>

        <fieldset v-for="(p, i) in data.pillars" :id="`pl-${p.id}`" :key="p.id" class="u-card p-4 sm:p-5 scroll-mt-4"
                  :class="tandai(p) ? '!border-[color:var(--merah)]' : ''">
          <legend class="sr-only">{{ p.name }}</legend>
          <div class="flex items-start gap-3">
            <span class="u-nomor !w-9 !h-9 !text-base">{{ i + 1 }}</span>
            <div class="flex-1 min-w-0">
              <h2 class="u-display text-lg font-extrabold leading-tight">{{ p.name }}</h2>
              <p class="mt-0.5 text-sm text-[color:var(--ink-soft)] max-w-prose">{{ p.description }}</p>
            </div>
            <span class="hidden sm:block shrink-0"><span class="u-chip !text-[11px]" :class="CHIP[status(p)]">{{ STATUS_BUKTI[status(p)] }}</span></span>
          </div>
          <p v-if="status(p) !== 'kosong'" class="sm:hidden mt-2"><span class="u-chip !text-[11px]" :class="CHIP[status(p)]">{{ STATUS_BUKTI[status(p)] }}</span></p>

          <div class="mt-3 space-y-2">
            <template v-for="n in urutan(p.id)" :key="n">
              <label class="u-opsi cursor-pointer" :class="levels[p.id].level === n ? 'is-filled !rounded-b-none !shadow-none' : ''">
                <input v-model="levels[p.id].level" type="radio" :name="`pilar-${p.id}`" :value="n" class="sr-only" :disabled="closed" />
                <span class="u-bubble">{{ label(n, p.id) }}</span>
                <span class="text-[15px] leading-snug pt-1.5">{{ p.rubric[n] }}</span>
              </label>
              <!-- Bukti menempel di bawah pilihan yang dipilih -->
              <div v-if="levels[p.id].level === n" class="-mt-2 rounded-b-xl border-2 border-t-0 border-[color:var(--ink)] bg-white p-3 sm:p-4 shadow-[2px_2px_0_var(--ink)]">
                <label :for="`bk-${p.id}`" class="font-extrabold">Kenapa {{ label(n, p.id) }}? Ceritakan satu kejadian.</label>
                <div class="mt-2 flex flex-wrap gap-1.5">
                  <button v-for="t in PANCINGAN" :key="t" type="button" class="u-chip !min-h-9 !px-3 hover:!bg-[color:var(--stabilo)]" :disabled="closed" @click="tambah(p, t)">+ {{ t }}</button>
                </div>
                <textarea :id="`bk-${p.id}`" v-model="levels[p.id].note" rows="3" :disabled="closed" class="u-input mt-2 text-[15px]"
                          :aria-invalid="tandai(p)" :aria-describedby="`bk-info-${p.id}`"
                          placeholder="mis. Senin lalu, Avanza WO-1234, dia cek relay kipas pakai multimeter sebelum ganti part" @blur="sentuh[p.id] = true" />
                <p :id="`bk-info-${p.id}`" class="mt-1 text-xs font-bold" :class="status(p) === 'ok' ? 'text-[color:var(--hijau)]' : status(p) === 'salin' ? 'text-[color:var(--merah-tua)]' : 'text-[color:var(--ink-soft)]'">
                  {{ status(p) === 'ok' ? '✓ Bukti cukup' : status(p) === 'salin' ? 'Isinya sama dengan pilar lain atau menyalin deskripsi. Tulis kejadian yang Anda lihat untuk pilar ini.' : `${huruf(p)}/${BUKTI_MIN} huruf minimal` }}
                </p>
              </div>
            </template>
          </div>
          <label class="mt-3 flex items-center gap-2.5 min-h-11 font-bold cursor-pointer">
            <input type="radio" :name="`pilar-${p.id}`" :checked="levels[p.id].level === 0" :disabled="closed" class="u-check !rounded-full" @change="levels[p.id].level = 0" />
            Belum pernah melihat pekerjaannya di pilar ini
          </label>
        </fieldset>

        <div class="u-card p-4">
          <label class="font-extrabold" for="catatan-umum">Catatan umum (opsional)</label>
          <textarea id="catatan-umum" :value="note" rows="2" :disabled="closed" class="u-input mt-2" @input="$emit('update:note', $event.target.value)"></textarea>
        </div>
        <p v-if="pesan || saveError" class="rounded-lg border-2 border-[color:var(--merah)] bg-[color:var(--merah-muda)] p-3 text-sm font-bold text-[color:var(--merah-tua)]" role="alert">{{ saveError || pesan }}</p>
        <p v-if="saved" class="u-chip u-chip-hijau" role="status">Penilaian terkirim. Terima kasih.</p>
      </div>

      <!-- Desktop: daftar periksa di samping -->
      <aside class="hidden lg:block u-card p-4 sticky top-4">
        <p class="u-display text-lg font-extrabold">Daftar periksa</p>
        <p class="text-sm font-bold" :class="kurang.length ? '' : 'text-[color:var(--hijau)]'">{{ jumlahOk }}/{{ data.pillars.length }} pilar lengkap</p>
        <ul class="mt-2 space-y-1">
          <li v-for="(p, i) in data.pillars" :key="p.id">
            <button type="button" class="w-full flex items-center gap-2.5 rounded-lg px-1.5 py-1.5 text-left hover:bg-[#fffbe0]" @click="ke(p)">
              <span class="u-ljk !w-8 !h-8" :class="LJK[status(p)]">{{ status(p) === 'ok' ? '✓' : i + 1 }}</span>
              <span class="min-w-0"><span class="block text-sm font-bold truncate">{{ p.name }}</span><span class="block text-xs" :class="status(p) === 'salin' ? 'text-[color:var(--merah-tua)] font-bold' : 'text-[color:var(--ink-soft)]'">{{ STATUS_BUKTI[status(p)] }}</span></span>
            </button>
          </li>
        </ul>
        <button class="u-btn u-btn-merah w-full mt-3" :disabled="saving || closed" @click="coba">{{ tombol }}</button>
        <p v-if="closed" class="mt-2 text-xs font-bold">Periode asesmen sudah ditutup.</p>
      </aside>
    </div>

    <!-- HP & tablet: bilah lengket di bawah, bulatan per pilar -->
    <!-- di bawah md, navigasi bawah aplikasi (h-16) ada di bawahnya -->
    <div class="lg:hidden fixed inset-x-0 bottom-16 md:bottom-0 z-30 border-t-[2.5px] border-[color:var(--ink)] bg-white px-4 pt-2.5 pb-3 md:pb-[max(.75rem,env(safe-area-inset-bottom))] md:pl-24">
      <div class="flex items-center gap-1.5 overflow-x-auto pb-1" aria-label="Status tiap pilar">
        <button v-for="(p, i) in data.pillars" :key="p.id" type="button" class="u-ljk !w-10 !h-10 shrink-0" :class="LJK[status(p)]"
                :aria-label="`${p.name}: ${STATUS_BUKTI[status(p)]}`" @click="ke(p)">{{ status(p) === 'ok' ? '✓' : i + 1 }}</button>
      </div>
      <div class="mt-1.5 flex items-center gap-3">
        <p class="flex-1 min-w-0 text-sm leading-tight"><b>{{ jumlahOk }}/{{ data.pillars.length }} lengkap</b>
          <span v-if="kurang.length" class="block truncate text-[color:var(--ink-soft)]">Berikutnya: {{ kurang[0].name }}</span></p>
        <button class="u-btn u-btn-merah shrink-0" :disabled="saving || closed" @click="coba">{{ tombol }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import '@fontsource-variable/bricolage-grotesque'
import '../../styles/exam.css'
import '../../styles/asesmen.css'
import { computed, reactive, ref } from 'vue'
import { CheckCircleIcon, ChevronLeftIcon } from '@heroicons/vue/24/outline'
import { BUKTI_MIN, STATUS_BUKTI, statusBukti } from '../../utils/leadEvidence'

const props = defineProps({
  data: { type: Object, required: true }, levels: { type: Object, required: true },
  urutan: { type: Function, required: true }, label: { type: Function, required: true },
  closed: Boolean, saving: Boolean, saved: Boolean, saveError: { type: String, default: '' }, note: { type: String, default: '' },
})
const emit = defineEmits(['kirim', 'update:note'])
const PANCINGAN = ['Kapan', 'Mobil / WO', 'Apa yang dia lakukan', 'Hasilnya']
const CHIP = { kosong: '', bukti: 'u-chip-kuning', salin: 'u-chip-merah', ok: 'u-chip-hijau' }
const LJK = { kosong: '', bukti: '!bg-[color:var(--stabilo)] !text-[color:var(--ink)] !border-[color:var(--ink)]', salin: '!bg-[color:var(--merah)] !text-white !border-[color:var(--merah)]', ok: 'is-filled' }

const status = (p) => statusBukti(p, props.data.pillars, props.levels)
const huruf = (p) => (props.levels[p.id].note || '').trim().length
const kurang = computed(() => props.data.pillars.filter((p) => status(p) !== 'ok'))
const jumlahOk = computed(() => props.data.pillars.length - kurang.value.length)
const tombol = computed(() => (props.saving ? 'Mengirim…' : props.data.state === 'submitted' ? 'Simpan perubahan' : 'Kirim penilaian'))

// Merah hanya setelah kotak ditinggalkan, Kirim ditekan, atau bukti disalin: tidak menghukum sebelum mulai mengisi.
const sentuh = reactive({})
const sudahCoba = ref(false)
const tandai = (p) => status(p) !== 'ok' && (sudahCoba.value || status(p) === 'salin' || (status(p) === 'bukti' && sentuh[p.id]))
const pesan = ref('')

function ke(p) {
  document.getElementById(`pl-${p.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  setTimeout(() => document.getElementById(`bk-${p.id}`)?.focus({ preventScroll: true }), 450)
}
function coba() {
  sudahCoba.value = true
  if (kurang.value.length) {
    pesan.value = `Belum bisa dikirim: ${kurang.value.map((p) => `${p.name} (${STATUS_BUKTI[status(p)].toLowerCase()})`).join(', ')}.`
    ke(kurang.value[0])
    return
  }
  pesan.value = ''
  emit('kirim')
}
function tambah(p, t) {
  const cur = props.levels[p.id].note || ''
  props.levels[p.id].note = `${cur}${cur && !/\s$/.test(cur) ? ' ' : ''}${t}: `
  document.getElementById(`bk-${p.id}`)?.focus()
}
</script>
