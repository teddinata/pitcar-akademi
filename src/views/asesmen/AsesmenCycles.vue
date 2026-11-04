<!-- Beranda menu Asesmen (admin & asesor): cara kerja, rumus, daftar periode Asesmen Terpadu. -->
<template>
  <div class="ujian min-h-screen p-4 md:p-6">
    <AsesmenNav title="Asesmen Terpadu" subtitle="Ujian lisan rubrik lama dinilai AI, studi kasus, dan penilaian lead dalam satu periode. Asesor cukup memvalidasi." :admin="isAdmin" @help="tour.replay()" />

    <!-- Cara kerja -->
    <section class="mb-6" data-tour="asm-alur">
      <h2 class="u-display text-xl font-extrabold mb-3">Cara kerjanya</h2>
      <ol class="u-langkah" style="--kolom: 4">
        <li v-for="(s, i) in ALUR" :key="i">
          <span class="u-nomor !w-9 !h-9 !text-lg">{{ i + 1 }}</span>
          <div><p class="font-extrabold leading-snug">{{ s.judul }}</p><p class="mt-0.5 text-sm text-[color:var(--ink-soft)] leading-snug">{{ s.teks }}</p></div>
        </li>
      </ol>
    </section>

    <!-- Rumus -->
    <section class="u-card p-4 sm:p-5 mb-6 grid md:grid-cols-3 gap-4" data-tour="asm-rumus">
      <div v-for="k in KOMPONEN" :key="k.key" class="flex gap-3">
        <span class="u-angka !text-[2rem] shrink-0 w-16">{{ k.bobot }}</span>
        <div>
          <p class="font-extrabold">{{ k.nama }}</p>
          <p class="text-sm text-[color:var(--ink-soft)] leading-snug">{{ k.teks }}</p>
        </div>
      </div>
      <p class="md:col-span-3 text-sm border-t-2 border-[color:var(--ink)] pt-3">
        <b>Jenjang akhir</b> = rata-rata berbobot tiga komponen, paling tinggi satu level di atas komponen terendah. Bobot bisa diubah per periode. Hasil baru masuk ke data karyawan setelah <b>disahkan asesor</b> dan periode ditutup.
      </p>
    </section>

    <div class="flex flex-wrap items-end justify-between gap-3 mb-3">
      <h2 class="u-display text-xl font-extrabold">Periode</h2>
      <router-link to="/dashboard/lms/competency-map" class="text-sm font-bold underline underline-offset-4 inline-flex items-center gap-1.5">
        Metode 360° lama ada di Peta Kompetensi <span class="u-new is-abu">360°</span>
      </router-link>
    </div>

    <!-- Buat periode -->
    <form v-if="isAdmin" class="u-card p-4 mb-4 grid sm:grid-cols-[1fr_12rem_auto] gap-3 items-end" data-tour="asm-buat" @submit.prevent="buat">
      <label><span class="u-label">Nama periode baru</span><input v-model="baru.name" class="u-input" placeholder="mis. Asesmen Mekanik Nov 2026" /></label>
      <label><span class="u-label">Profil peran</span>
        <select v-model="baru.profile_id" class="u-input"><option v-for="p in profiles" :key="p.id" :value="p.id">{{ p.name }}</option></select>
      </label>
      <button class="u-btn u-btn-merah" :disabled="!baru.name.trim() || busy"><PlusIcon class="w-5 h-5" />Buat periode</button>
    </form>

    <div v-if="loading" class="space-y-3"><div v-for="i in 2" :key="i" class="u-card h-24 animate-pulse"></div></div>
    <p v-else-if="error" class="u-card p-5 font-bold text-[color:var(--merah)]">{{ error }}</p>
    <div v-else-if="!cycles.length" class="u-card p-8 text-center">
      <p class="u-display text-xl font-extrabold">Belum ada periode</p>
      <p class="mt-1 text-[15px] text-[color:var(--ink-soft)]">{{ isAdmin ? 'Buat periode di atas, lalu atur komponen, peserta, lead, dan asesor.' : 'Anda belum ditunjuk sebagai asesor di periode mana pun.' }}</p>
    </div>
    <div v-else class="grid md:grid-cols-2 gap-4" data-tour="asm-daftar">
      <router-link v-for="c in cycles" :key="c.id" :to="isAdmin ? `/dashboard/asesmen/periode/${c.id}` : `/dashboard/asesmen/rekap?periode=${c.id}`" class="u-card p-4 sm:p-5 block hover:-translate-y-0.5 transition-transform">
        <div class="flex flex-wrap items-center gap-1.5">
          <span class="u-chip" :class="STATE[c.state].chip">{{ STATE[c.state].label }}</span>
          <span class="u-chip">{{ c.profile.name }}</span>
          <span v-if="c.date_start" class="text-xs font-bold text-[color:var(--ink-soft)]">{{ fmtDateTime(c.date_start) }}{{ c.date_end ? ` – ${fmtDateTime(c.date_end)}` : '' }}</span>
        </div>
        <p class="u-display mt-2 text-xl font-extrabold leading-snug">{{ c.name }}</p>
        <div class="mt-2 flex flex-wrap gap-1.5 text-xs font-bold">
          <span v-if="c.oral_enabled" class="u-chip">Ujian lisan</span>
          <span v-if="c.cases.length" class="u-chip">{{ c.cases.length }} studi kasus</span>
          <span v-if="c.lead_enabled" class="u-chip">Lead</span>
        </div>
        <div class="mt-4 grid grid-cols-3 gap-2 text-center">
          <div class="rounded-lg border-2 border-[color:var(--ink)] py-2"><p class="u-display text-xl font-extrabold">{{ c.participant_count }}</p><p class="text-[11px] font-bold">peserta</p></div>
          <div class="rounded-lg border-2 border-[color:var(--ink)] py-2"><p class="u-display text-xl font-extrabold">{{ c.complete_count }}</p><p class="text-[11px] font-bold">lengkap</p></div>
          <div class="rounded-lg border-2 border-[color:var(--ink)] py-2 bg-[#d9f2e3]"><p class="u-display text-xl font-extrabold">{{ c.validated_count || 0 }}</p><p class="text-[11px] font-bold">disahkan</p></div>
        </div>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import '@fontsource-variable/bricolage-grotesque'
import '../../styles/exam.css'
import '../../styles/asesmen.css'
import { computed, nextTick, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { PlusIcon } from '@heroicons/vue/24/outline'
import AsesmenNav from '../../components/asesmen/AsesmenNav.vue'
import { competencyApi } from '../../services/competencyApi'
import { useTour } from '../../composables/useTour'
import { fmtDateTime } from '../../utils/competency'
import { useAuthStore } from '../../stores/auth'

const ALUR = [
  { judul: 'Siapkan soal', teks: 'Soal ujian lisan L1–L4 + kunci jawaban, dan studi kasus. Contoh mekanik sudah tersedia.' },
  { judul: 'Buat periode', teks: 'Pilih komponen, tambah peserta, tunjuk lead (boleh lebih dari satu) dan asesor validator.' },
  { judul: 'Peserta & lead mengisi', teks: 'Peserta ujian lisan & studi kasus dari HP lewat Asesmen Saya. Lead menilai rubrik pilar dengan bukti.' },
  { judul: 'Asesor validasi', teks: 'AI menilai rekaman. Asesor cukup cek jawaban bertanda di Rekap, lalu sahkan. Tutup periode = jenjang ke PitClock.' },
]
const KOMPONEN = [
  { key: 'oral', bobot: '50%', nama: 'Ujian lisan (rubrik lama)', teks: '6 aspek skor 1–5 per soal L1–L4. Persen = Σ skor × bobot ÷ 5; jenjang = lulus berjenjang (substansi ≥ 3,5).' },
  { key: 'case', bobot: '30%', nama: 'Studi kasus', teks: 'Kasus HOTS pilihan ganda + esai/lisan, dinilai AI per pilar L1–L4 dengan kutipan jawaban.' },
  { key: 'lead', bobot: '20%', nama: 'Penilaian lead', teks: 'Rubrik pilar L1–L4 oleh lead yang ditunjuk admin. Wajib bukti kejadian nyata; "belum pernah lihat" tidak dihitung.' },
]
const STATE = {
  draft: { label: 'Draf', chip: '' },
  open: { label: 'Berjalan', chip: 'u-chip-kuning' },
  closed: { label: 'Ditutup', chip: 'u-chip-hijau' },
}

const router = useRouter()
const auth = useAuthStore()
const loading = ref(true)
const error = ref('')
const busy = ref(false)
const cycles = ref([])
const profiles = ref([])
const serverAdmin = ref(false)
const isAdmin = computed(() => serverAdmin.value || !!auth.user?.is_admin)
const baru = reactive({ name: '', profile_id: null })

async function load() {
  loading.value = true
  error.value = ''
  try {
    const hasil = await competencyApi.terpaduCycles()
    cycles.value = hasil.cycles
    serverAdmin.value = hasil.is_admin
    if (hasil.is_admin) {
      profiles.value = (await competencyApi.oralBank()).profiles
      const mekanik = profiles.value.find((p) => p.code === 'mekanik') || profiles.value[0]
      if (!baru.profile_id && mekanik) baru.profile_id = mekanik.id
    }
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
  nextTick(() => tour.autoStart())
}

async function buat() {
  busy.value = true
  try {
    const c = await competencyApi.saveTerpaduCycle(null, { name: baru.name, profile_id: baru.profile_id })
    router.push(`/dashboard/asesmen/periode/${c.id}`)
  } catch (e) {
    error.value = e.message
  } finally {
    busy.value = false
  }
}

const tour = useTour('asesmen-beranda', () => [
  { title: 'Menu Asesmen (baru)', text: 'Tempat semua asesmen kenaikan jenjang: ujian lisan rubrik lama yang kini direkam & dinilai AI, studi kasus, dan penilaian lead.' },
  { element: '[data-tour="asm-nav"]', title: 'Empat halaman', text: 'Periode: jalankan asesmen. Rekap & Validasi: hasil akhir dan pemeriksaan asesor. Soal Ujian Lisan dan Studi Kasus: bank soal.', side: 'bottom' },
  { element: '[data-tour="asm-alur"]', title: 'Alurnya 4 langkah', text: 'Ikuti urutan ini setiap kali menjalankan asesmen.', side: 'bottom' },
  { element: '[data-tour="asm-rumus"]', title: 'Cara hasil dihitung', text: 'AI dan rekaman jadi penilaian utama; asesor hanya memvalidasi jawaban yang ditandai.', side: 'top' },
  { element: '[data-tour="asm-buat"]', title: 'Mulai dari sini', text: 'Beri nama periode dan pilih profil peran, lalu atur detailnya.', side: 'top' },
  { element: '[data-tour="asm-help"]', title: 'Panduan ada di tiap halaman', text: 'Tekan Cara pakai untuk memutar panduan lagi.', side: 'bottom', align: 'end' },
])

onMounted(load)
</script>
