<!-- Tugas asesmen kompetensi milik pengguna: tes studi kasus (bila jadi peserta),
     penilaian diri/atasan/tim yang harus diisi, dan hasil periode yang sudah ditutup. -->
<template>
  <div class="ujian min-h-screen p-4 md:p-6">
    <div class="max-w-4xl mx-auto">
      <div class="flex flex-wrap items-start justify-between gap-3 mb-6">
        <div>
          <h1 class="u-display text-[1.9rem] sm:text-[2.3rem] font-extrabold leading-none">Asesmen Kompetensi</h1>
          <p class="mt-2 text-[15px] text-[color:var(--ink-soft)]">Tes dan penilaian yang perlu Anda kerjakan.</p>
        </div>
        <div class="flex flex-wrap gap-2">
          <button class="u-btn !min-h-10" data-tour="daftar-help" @click="tour.replay()"><QuestionMarkCircleIcon class="w-5 h-5" />Cara pakai</button>
          <router-link v-if="data?.is_admin" to="/dashboard/lms/competency-map" class="u-btn !min-h-10"><Squares2X2Icon class="w-5 h-5" />Kelola</router-link>
        </div>
      </div>

      <div v-if="loading" class="space-y-4">
        <div v-for="i in 2" :key="i" class="u-card h-28 animate-pulse"></div>
      </div>
      <div v-else-if="error" class="u-card p-6 text-center">
        <p class="font-bold text-[color:var(--merah)]">{{ error }}</p>
        <button class="u-btn u-btn-hitam mt-3" @click="load">Coba lagi</button>
      </div>

      <template v-else-if="data">
        <div v-if="!data.cases.length && !data.ratings.length && !data.results.length" class="u-card p-8 text-center">
          <ClipboardDocumentCheckIcon class="w-12 h-12 mx-auto" />
          <p class="u-display mt-3 text-xl font-extrabold">Belum ada tugas asesmen</p>
          <p class="mt-1 text-[15px] text-[color:var(--ink-soft)]">Tugas muncul di sini saat admin membuka periode asesmen yang melibatkan Anda, atau lewat link tes yang dibagikan.</p>
        </div>

        <!-- Tes studi kasus -->
        <section v-if="data.cases.length" class="mb-8" data-tour="daftar-tes">
          <h2 class="u-display text-xl font-extrabold mb-3">Tes studi kasus</h2>
          <div class="space-y-4">
            <article v-for="c in data.cases" :key="c.attempt_id" class="u-card p-4 sm:p-5 flex flex-wrap items-center gap-4">
              <span class="grid place-items-center w-14 h-14 rounded-xl border-[2.5px] border-[color:var(--ink)] shrink-0" :class="STATUS[status(c)].icon">
                <component :is="STATUS[status(c)].glyph" class="w-7 h-7" />
              </span>
              <div class="flex-1 min-w-[12rem]">
                <div class="flex flex-wrap gap-1.5">
                  <span class="u-chip" :class="STATUS[status(c)].chip">{{ STATUS[status(c)].label }}</span>
                  <span class="u-chip">{{ c.profile }}</span>
                </div>
                <p class="u-display mt-2 text-lg font-bold leading-snug">{{ c.case }}</p>
                <p class="mt-0.5 text-sm text-[color:var(--ink-soft)]">
                  {{ c.question_count }} soal<span v-if="c.choice_count"> ({{ c.choice_count }} pilihan ganda)</span>
                  · {{ c.time_limit_minutes ? `${c.time_limit_minutes} menit` : 'tanpa batas waktu' }} · {{ c.cycle }}
                </p>
                <p v-if="status(c) === 'running' && c.deadline" class="mt-1 text-sm font-bold">Sisa waktu kira-kira {{ sisaMenit(c) }} menit</p>
                <p v-if="c.state === 'submitted'" class="mt-1 text-sm text-[color:var(--ink-soft)]">Dikirim {{ fmtDateTime(c.submitted_at) }}{{ c.auto_submitted ? ' (otomatis, waktu habis)' : '' }}</p>
              </div>
              <router-link
                v-if="c.state !== 'submitted'" :to="`/dashboard/lms/my-competency/case/${c.attempt_id}`"
                class="u-btn w-full sm:w-auto" :class="status(c) === 'running' ? 'u-btn-hitam' : 'u-btn-merah'"
              >{{ status(c) === 'running' ? 'Lanjutkan' : 'Buka tes' }}<ArrowRightIcon class="w-4 h-4" /></router-link>
            </article>
          </div>
        </section>

        <!-- Penilaian -->
        <section v-if="data.ratings.length" class="mb-8" data-tour="daftar-penilaian">
          <div class="flex items-baseline justify-between mb-3">
            <h2 class="u-display text-xl font-extrabold">Penilaian yang perlu diisi</h2>
            <span class="u-chip" :class="pendingCount ? 'u-chip-kuning' : 'u-chip-hijau'">{{ pendingCount ? `${pendingCount} belum diisi` : 'Semua sudah diisi' }}</span>
          </div>
          <div class="u-card overflow-hidden divide-y-2 divide-[color:var(--ink)]">
            <router-link
              v-for="r in sortedRatings" :key="r.id" :to="`/dashboard/lms/my-competency/rating/${r.id}`"
              class="flex items-center gap-3 px-4 py-3.5 hover:bg-[#fffbe0]"
            >
              <span class="grid place-items-center w-10 h-10 rounded-full border-2 border-[color:var(--ink)] shrink-0" :class="r.state === 'submitted' ? 'bg-[color:var(--ink)] text-white' : 'bg-white'">
                <component :is="r.rater_type === 'team' ? UserGroupIcon : r.rater_type === 'self' ? UserIcon : ShieldCheckIcon" class="w-5 h-5" />
              </span>
              <div class="flex-1 min-w-0">
                <p class="font-bold leading-snug">{{ r.rater_type === 'self' ? 'Penilaian diri sendiri' : r.participant.name }}</p>
                <p class="text-sm text-[color:var(--ink-soft)] leading-snug">
                  {{ r.rater_type === 'team' ? 'Feedback tim · anonim' : r.rater_type === 'supervisor' ? 'Sebagai atasan' : 'Jujur saja, tidak memengaruhi nilai akhir' }} · {{ r.cycle }}
                </p>
                <p class="sm:hidden mt-1 text-sm font-bold" :class="r.state === 'submitted' ? 'text-[color:var(--hijau)]' : 'text-[color:var(--merah)]'">{{ r.state === 'submitted' ? 'Sudah diisi' : 'Isi sekarang' }}</p>
              </div>
              <span class="hidden sm:inline text-sm font-bold" :class="r.state === 'submitted' ? 'text-[color:var(--hijau)]' : 'text-[color:var(--merah)]'">{{ r.state === 'submitted' ? 'Sudah diisi' : 'Isi sekarang' }}</span>
              <ChevronRightIcon class="w-5 h-5 shrink-0" />
            </router-link>
          </div>
        </section>

        <!-- Hasil -->
        <section v-if="data.results.length" data-tour="daftar-hasil">
          <h2 class="u-display text-xl font-extrabold mb-3">Hasil asesmen saya</h2>
          <div class="u-card overflow-hidden divide-y-2 divide-[color:var(--ink)]">
            <router-link
              v-for="r in data.results" :key="r.participant_id" :to="`/dashboard/lms/my-competency/result/${r.participant_id}`"
              class="flex items-center gap-3 px-4 py-3.5 hover:bg-[#fffbe0]"
            >
              <ChartBarIcon class="w-6 h-6 shrink-0" />
              <span class="flex-1 font-bold">{{ r.cycle }}</span>
              <ChevronRightIcon class="w-5 h-5" />
            </router-link>
          </div>
        </section>
      </template>
    </div>
  </div>
</template>

<script setup>
import '@fontsource-variable/bricolage-grotesque'
import '../../styles/exam.css'
import { computed, nextTick, onMounted, ref } from 'vue'
import {
  ArrowRightIcon, ChartBarIcon, CheckIcon, ChevronRightIcon, ClipboardDocumentCheckIcon, ClockIcon, PencilSquareIcon,
  QuestionMarkCircleIcon, ShieldCheckIcon, Squares2X2Icon, UserGroupIcon, UserIcon,
} from '@heroicons/vue/24/outline'
import { competencyApi } from '../../services/competencyApi'
import { useTour } from '../../composables/useTour'
import { fmtDateTime } from '../../utils/competency'

const STATUS = {
  new: { label: 'Belum dikerjakan', chip: 'u-chip-merah', icon: 'bg-white text-[color:var(--merah)]', glyph: PencilSquareIcon },
  running: { label: 'Sedang dikerjakan', chip: 'u-chip-kuning', icon: 'bg-[color:var(--stabilo)]', glyph: ClockIcon },
  done: { label: 'Terkirim', chip: 'u-chip-hijau', icon: 'bg-[color:var(--ink)] text-white', glyph: CheckIcon },
}

const loading = ref(true)
const error = ref('')
const data = ref(null)

const status = (c) => (c.state === 'submitted' ? 'done' : c.started ? 'running' : 'new')
const sisaMenit = (c) => Math.max(0, Math.ceil((new Date(`${c.deadline.replace(' ', 'T')}Z`) - Date.now()) / 60000))
const pendingCount = computed(() => (data.value?.ratings || []).filter((r) => r.state !== 'submitted').length)
const ORDER = { self: 0, supervisor: 1, team: 2 }
const sortedRatings = computed(() => [...(data.value?.ratings || [])].sort((a, b) =>
  (a.state === 'submitted') - (b.state === 'submitted') || ORDER[a.rater_type] - ORDER[b.rater_type]
  || a.participant.name.localeCompare(b.participant.name)))

const tour = useTour('peserta-daftar', () => [
  { title: 'Asesmen Kompetensi', text: 'Halaman ini berisi semua tugas asesmen Anda: tes studi kasus, penilaian untuk rekan, dan hasil Anda.' },
  { element: '[data-tour="daftar-tes"]', title: 'Tes studi kasus', text: 'Buka tes untuk melihat jumlah soal dan waktunya. Waktu baru berjalan setelah Anda menekan Mulai di dalam tes.', side: 'bottom' },
  { element: '[data-tour="daftar-penilaian"]', title: 'Penilaian', text: 'Isi penilaian diri, penilaian sebagai atasan, atau feedback tim (anonim) untuk rekan Anda.', side: 'top' },
  { element: '[data-tour="daftar-hasil"]', title: 'Hasil', text: 'Hasil dan jenjang Anda muncul di sini setelah admin menutup periode.', side: 'top' },
  { element: '[data-tour="daftar-help"]', title: 'Lihat lagi kapan saja', text: 'Tekan "Cara pakai" untuk memutar panduan ini lagi.', side: 'bottom', align: 'end' },
])

async function load() {
  loading.value = true
  error.value = ''
  try {
    data.value = await competencyApi.myTasks()
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
  if (data.value) nextTick(() => tour.autoStart())
}
onMounted(load)
</script>
