<!-- Tugas asesmen kompetensi milik pengguna: studi kasus (bila jadi peserta),
     penilaian diri/atasan/tim yang harus diisi, dan hasil periode yang sudah ditutup. -->
<template>
  <div class="min-h-screen clay-surface p-4 md:p-6">
    <div class="flex flex-wrap items-start justify-between gap-3 mb-5">
      <div>
        <h1 class="text-xl md:text-2xl font-bold text-gray-900">Asesmen Kompetensi</h1>
        <p class="text-sm text-gray-600 mt-0.5">Tugas asesmen yang perlu Anda kerjakan atau isi.</p>
      </div>
      <router-link
        v-if="data?.is_admin" to="/dashboard/lms/competency-map"
        class="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-gray-700 bg-white/80 border border-gray-200 rounded-lg hover:bg-white"
      ><Squares2X2Icon class="w-4 h-4" />Kelola peta kompetensi</router-link>
    </div>

    <div v-if="loading" class="space-y-3">
      <div v-for="i in 3" :key="i" class="h-20 rounded-2xl bg-white/70 animate-pulse"></div>
    </div>
    <div v-else-if="error" class="clay-card p-6 text-center">
      <p class="text-red-600 font-medium">{{ error }}</p>
      <button @click="load" class="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700">Coba lagi</button>
    </div>

    <template v-else-if="data">
      <div v-if="!data.cases.length && !data.ratings.length && !data.results.length" class="clay-card p-8 text-center">
        <ClipboardDocumentCheckIcon class="w-10 h-10 mx-auto text-gray-300" />
        <p class="mt-3 font-semibold text-gray-800">Belum ada tugas asesmen</p>
        <p class="text-sm text-gray-500 mt-1">Tugas muncul di sini saat admin membuka periode asesmen yang melibatkan Anda.</p>
      </div>

      <!-- Studi kasus -->
      <section v-if="data.cases.length" class="mb-6">
        <h2 class="text-sm font-bold text-gray-700 mb-2">Studi kasus</h2>
        <div class="space-y-3">
          <div v-for="c in data.cases" :key="c.attempt_id" class="clay-card p-4 flex flex-wrap items-center gap-4">
            <span class="grid place-items-center w-11 h-11 rounded-xl bg-indigo-50 text-indigo-700 shrink-0"><BriefcaseIcon class="w-6 h-6" /></span>
            <div class="flex-1 min-w-48">
              <p class="font-semibold text-gray-900">{{ c.case }}</p>
              <p class="text-xs text-gray-500">{{ c.profile }} · {{ c.cycle }} · saran waktu {{ c.time_limit_minutes }} menit · jawab tertulis atau lisan</p>
            </div>
            <span v-if="c.state === 'submitted'" class="text-xs font-semibold text-green-700 bg-green-50 px-2.5 py-1 rounded-full">Terkirim {{ fmtDateTime(c.submitted_at) }}</span>
            <router-link
              v-else :to="`/dashboard/lms/my-competency/case/${c.attempt_id}`"
              class="px-4 py-2 rounded-lg bg-[#b70000] text-white text-sm font-bold hover:bg-[#930000]"
            >Kerjakan</router-link>
          </div>
        </div>
      </section>

      <!-- Penilaian -->
      <section v-if="data.ratings.length" class="mb-6">
        <div class="flex items-baseline justify-between mb-2">
          <h2 class="text-sm font-bold text-gray-700">Penilaian yang perlu diisi</h2>
          <span class="text-xs text-gray-500">{{ pendingCount }} belum diisi</span>
        </div>
        <div class="clay-card divide-y divide-gray-100 overflow-hidden">
          <router-link
            v-for="r in sortedRatings" :key="r.id" :to="`/dashboard/lms/my-competency/rating/${r.id}`"
            class="flex items-center gap-3 px-4 py-3 hover:bg-white/70"
          >
            <span class="grid place-items-center w-9 h-9 rounded-full shrink-0" :class="r.rater_type === 'team' ? 'bg-violet-50 text-violet-700' : r.rater_type === 'self' ? 'bg-sky-50 text-sky-700' : 'bg-amber-50 text-amber-700'">
              <component :is="r.rater_type === 'team' ? UserGroupIcon : r.rater_type === 'self' ? UserIcon : ShieldCheckIcon" class="w-5 h-5" />
            </span>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold text-gray-900 truncate">
                {{ r.rater_type === 'self' ? 'Penilaian diri sendiri' : r.participant.name }}
              </p>
              <p class="text-xs text-gray-500 truncate">
                {{ r.rater_type === 'team' ? 'Feedback tim · anonim' : r.rater_type === 'supervisor' ? 'Sebagai atasan' : 'Jujur saja, tidak memengaruhi nilai akhir' }} · {{ r.cycle }}
              </p>
            </div>
            <span v-if="r.state === 'submitted'" class="text-xs font-semibold text-green-700">Sudah diisi</span>
            <span v-else class="text-xs font-bold text-[#b70000]">Isi sekarang</span>
            <ChevronRightIcon class="w-4 h-4 text-gray-400 shrink-0" />
          </router-link>
        </div>
      </section>

      <!-- Hasil -->
      <section v-if="data.results.length">
        <h2 class="text-sm font-bold text-gray-700 mb-2">Hasil asesmen saya</h2>
        <div class="clay-card divide-y divide-gray-100 overflow-hidden">
          <router-link
            v-for="r in data.results" :key="r.participant_id" :to="`/dashboard/lms/my-competency/result/${r.participant_id}`"
            class="flex items-center gap-3 px-4 py-3 hover:bg-white/70"
          >
            <ChartBarIcon class="w-5 h-5 text-emerald-600 shrink-0" />
            <span class="flex-1 text-sm font-semibold text-gray-900">{{ r.cycle }}</span>
            <ChevronRightIcon class="w-4 h-4 text-gray-400" />
          </router-link>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import {
  BriefcaseIcon, ChartBarIcon, ChevronRightIcon, ClipboardDocumentCheckIcon, ShieldCheckIcon,
  Squares2X2Icon, UserGroupIcon, UserIcon,
} from '@heroicons/vue/24/outline'
import { competencyApi } from '../../services/competencyApi'
import { fmtDateTime } from '../../utils/competency'

const loading = ref(true)
const error = ref('')
const data = ref(null)

const pendingCount = computed(() => (data.value?.ratings || []).filter((r) => r.state !== 'submitted').length)
const ORDER = { self: 0, supervisor: 1, team: 2 }
const sortedRatings = computed(() => [...(data.value?.ratings || [])].sort((a, b) =>
  (a.state === 'submitted') - (b.state === 'submitted') || ORDER[a.rater_type] - ORDER[b.rater_type]
  || a.participant.name.localeCompare(b.participant.name)))

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
}
onMounted(load)
</script>
