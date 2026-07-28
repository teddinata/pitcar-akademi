<template>
  <div class="min-h-screen clay-surface p-4 md:p-6">
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Dashboard LMS</h1>
      <p class="text-sm text-gray-500 mt-1">Ringkasan aktivitas pembelajaran Anda</p>
    </div>

    <!-- Tab (admin only) -->
    <div v-if="authStore.user?.is_admin" class="flex gap-2 mb-6 overflow-x-auto pb-1">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        @click="activeTab = tab.key; load()"
        class="px-4 py-2 text-sm whitespace-nowrap clay-pill"
        :class="activeTab === tab.key ? 'clay-pill-active' : ''"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <div class="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
      <p class="text-red-600 font-medium">{{ error }}</p>
      <button @click="load" class="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700">Coba Lagi</button>
    </div>

    <!-- My Dashboard -->
    <template v-else-if="activeTab === 'my'">
      <!-- Stats Grid -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div class="clay-tile clay-tile-sky flex items-center gap-3">
          <div class="clay-icon w-12 h-12 bg-white/70 text-blue-600 shrink-0"><BookOpenIcon class="w-6 h-6" /></div>
          <div>
            <p class="text-3xl font-extrabold text-blue-700 leading-none">{{ data?.stats?.total_enrollments ?? 0 }}</p>
            <p class="text-xs text-blue-900/60 font-semibold mt-1">Kursus Terdaftar</p>
          </div>
        </div>
        <div class="clay-tile clay-tile-mint flex items-center gap-3">
          <div class="clay-icon w-12 h-12 bg-white/70 text-emerald-600 shrink-0"><CheckBadgeIcon class="w-6 h-6" /></div>
          <div>
            <p class="text-3xl font-extrabold text-emerald-700 leading-none">{{ data?.stats?.completed_courses ?? 0 }}</p>
            <p class="text-xs text-emerald-900/60 font-semibold mt-1">Kursus Selesai</p>
          </div>
        </div>
        <div class="clay-tile clay-tile-sun flex items-center gap-3">
          <div class="clay-icon w-12 h-12 bg-white/70 text-amber-500 shrink-0"><TrophyIcon class="w-6 h-6" /></div>
          <div>
            <p class="text-3xl font-extrabold text-amber-600 leading-none">{{ data?.stats?.badges_earned ?? 0 }}</p>
            <p class="text-xs text-amber-900/60 font-semibold mt-1">Lencana</p>
          </div>
        </div>
        <div class="clay-tile clay-tile-grape flex items-center gap-3">
          <div class="clay-icon w-12 h-12 bg-white/70 text-purple-600 shrink-0"><StarIcon class="w-6 h-6" /></div>
          <div>
            <p class="text-3xl font-extrabold text-purple-700 leading-none">{{ data?.stats?.competencies_achieved ?? 0 }}</p>
            <p class="text-xs text-purple-900/60 font-semibold mt-1">Kompetensi</p>
          </div>
        </div>
      </div>

      <!-- ── GAMIFIKASI ── -->
      <div v-if="data?.gamification" class="grid md:grid-cols-3 gap-4 mb-6">
        <!-- Total Poin + rincian sumber -->
        <div class="clay-card p-5">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-2xl shrink-0">⭐</div>
            <div>
              <p class="text-3xl font-black text-amber-600 leading-none">{{ data.gamification.total_points }}</p>
              <p class="text-xs text-gray-500 font-semibold mt-1">Total Poin</p>
            </div>
          </div>
          <div class="mt-4 space-y-1.5 text-xs">
            <div class="flex justify-between"><span class="text-gray-500">Dari kursus</span><span class="font-bold text-gray-700">+{{ data.gamification.points_from_courses }}</span></div>
            <div class="flex justify-between"><span class="text-gray-500">Nilai lencana</span><span class="font-bold text-gray-700">+{{ data.gamification.points_from_badges }}</span></div>
          </div>
        </div>

        <!-- Lencana diraih -->
        <div class="clay-card p-5 md:col-span-2">
          <div class="flex items-center justify-between mb-3">
            <h2 class="font-semibold text-gray-800 text-sm flex items-center gap-2">🏅 Lencana Diraih <span class="text-xs text-gray-400">({{ data.gamification.badge_count }})</span></h2>
            <router-link to="/dashboard/lms/badges" class="text-xs font-semibold text-blue-600 hover:underline">Semua →</router-link>
          </div>
          <div v-if="data.gamification.earned_badges?.length" class="flex flex-wrap gap-2">
            <div v-for="b in data.gamification.earned_badges" :key="b.id"
              class="flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-xl border"
              :style="{ borderColor: b.color + '55', background: b.color + '11' }">
              <span class="w-7 h-7 rounded-lg flex items-center justify-center text-white text-sm shrink-0" :style="{ background: b.color }">
                <img v-if="b.icon_url" :src="b.icon_url" class="w-5 h-5 object-contain" alt="" />
                <span v-else>🏅</span>
              </span>
              <div class="min-w-0">
                <p class="text-xs font-bold text-gray-800 leading-none truncate">{{ b.name }}</p>
                <p class="text-[10px] text-gray-400 mt-0.5">+{{ b.points_awarded }} poin · {{ b.earned_date }}</p>
              </div>
            </div>
          </div>
          <div v-else class="text-sm text-gray-400 py-3 text-center">Belum ada lencana. Selesaikan kursus &amp; quiz untuk meraihnya!</div>
        </div>
      </div>

      <!-- Rincian poin per kursus -->
      <div v-if="data?.gamification?.course_points?.length" class="clay-card overflow-hidden mb-6">
        <div class="px-5 py-4 border-b border-gray-100">
          <h2 class="font-semibold text-gray-800 text-sm">Poin dari Kursus</h2>
        </div>
        <div class="divide-y divide-gray-50">
          <div v-for="(cp, i) in data.gamification.course_points" :key="i" class="px-5 py-3 flex items-center justify-between">
            <div class="min-w-0">
              <p class="font-medium text-gray-800 text-sm truncate">{{ cp.course_name }}</p>
              <p class="text-xs text-gray-400">{{ cp.date }}</p>
            </div>
            <span class="text-sm font-extrabold text-emerald-600 shrink-0">+{{ cp.points }}</span>
          </div>
        </div>
      </div>

      <!-- Active Enrollments -->
      <div class="grid md:grid-cols-2 gap-6">
        <div class="clay-card overflow-hidden">
          <div class="px-5 py-4 border-b border-gray-100">
            <h2 class="font-semibold text-gray-800">Kursus Aktif</h2>
          </div>
          <div v-if="data?.active_enrollments?.length" class="divide-y divide-gray-50">
            <div
              v-for="e in data.active_enrollments"
              :key="e.id"
              class="px-5 py-3 hover:bg-gray-50 transition-colors"
            >
              <p class="font-medium text-gray-800 text-sm truncate">{{ e.course_name }}</p>
              <div class="mt-1.5 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  class="h-full bg-blue-500 rounded-full transition-all"
                  :style="{ width: (e.progress || 0) + '%' }"
                ></div>
              </div>
              <p class="text-xs text-gray-400 mt-1">{{ e.progress || 0 }}% selesai</p>
            </div>
          </div>
          <div v-else class="px-5 py-8 text-center text-gray-400 text-sm">Belum ada kursus aktif</div>
        </div>

        <!-- Recommendations -->
        <div class="clay-card overflow-hidden">
          <div class="px-5 py-4 border-b border-gray-100">
            <h2 class="font-semibold text-gray-800">Rekomendasi Kursus</h2>
          </div>
          <div v-if="data?.recommended_courses?.length" class="divide-y divide-gray-50">
            <div
              v-for="c in data.recommended_courses"
              :key="c.id"
              class="px-5 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div class="flex-1 min-w-0 mr-3">
                <p class="font-medium text-gray-800 text-sm truncate">{{ c.name }}</p>
                <p class="text-xs text-gray-400">{{ c.category }} · {{ c.duration_hours }}j</p>
              </div>
              <span class="text-xs px-2 py-0.5 rounded-full font-medium"
                :class="difficultyClass(c.difficulty_level)">
                {{ c.difficulty_level }}
              </span>
            </div>
          </div>
          <div v-else class="px-5 py-8 text-center text-gray-400 text-sm">Tidak ada rekomendasi</div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div v-if="data?.recent_activity?.length" class="mt-6 clay-card overflow-hidden">
        <div class="px-5 py-4 border-b border-gray-100">
          <h2 class="font-semibold text-gray-800">Aktivitas Terbaru</h2>
        </div>
        <div class="divide-y divide-gray-50">
          <div
            v-for="(act, i) in data.recent_activity"
            :key="i"
            class="px-5 py-3 flex items-start gap-3 hover:bg-gray-50 transition-colors"
          >
            <div class="w-2 h-2 rounded-full bg-blue-400 mt-1.5 shrink-0"></div>
            <div>
              <p class="text-sm text-gray-700">{{ act.module_name }} — {{ act.course_name }}</p>
              <p class="text-xs text-gray-400 mt-0.5">{{ act.last_accessed || act.date }}</p>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Manager Dashboard -->
    <template v-else-if="activeTab === 'manager'">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div v-for="stat in managerStats" :key="stat.label" class="clay-card-sm p-4">
          <p class="text-xs text-gray-500 font-medium uppercase tracking-wider">{{ stat.label }}</p>
          <p class="text-2xl font-bold mt-1" :class="stat.color">{{ stat.value }}</p>
        </div>
      </div>
      <div v-if="data?.team_stats?.length" class="clay-card overflow-hidden">
        <div class="px-5 py-4 border-b border-gray-100">
          <h2 class="font-semibold text-gray-800">Anggota Tim</h2>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th class="px-4 py-3 text-left font-medium">Nama</th>
                <th class="px-4 py-3 text-center font-medium">Enroll</th>
                <th class="px-4 py-3 text-center font-medium">Selesai</th>
                <th class="px-4 py-3 text-center font-medium">Jam Belajar</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr v-for="m in data.team_stats" :key="m.employee_id" class="hover:bg-gray-50 transition-colors">
                <td class="px-4 py-3">
                  <p class="font-medium text-gray-800">{{ m.name }}</p>
                  <p class="text-xs text-gray-400">{{ m.job_title }}</p>
                </td>
                <td class="px-4 py-3 text-center text-blue-600 font-medium">{{ m.total_enrolled }}</td>
                <td class="px-4 py-3 text-center text-green-600 font-medium">{{ m.completed_courses }}</td>
                <td class="px-4 py-3 text-center text-gray-600">{{ m.learning_hours }}j</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div v-else class="clay-card p-10 text-center text-gray-400">
        Tidak ada data tim
      </div>
    </template>

    <!-- Company Overview -->
    <template v-else-if="activeTab === 'company'">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div v-for="stat in companyStats" :key="stat.label" class="clay-card-sm p-4">
          <p class="text-xs text-gray-500 font-medium uppercase tracking-wider">{{ stat.label }}</p>
          <p class="text-2xl font-bold mt-1" :class="stat.color">{{ stat.value }}</p>
        </div>
      </div>
      <div v-if="data?.department_stats?.length" class="clay-card overflow-hidden">
        <div class="px-5 py-4 border-b border-gray-100">
          <h2 class="font-semibold text-gray-800">Per Departemen</h2>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th class="px-4 py-3 text-left font-medium">Departemen</th>
                <th class="px-4 py-3 text-center font-medium">Karyawan</th>
                <th class="px-4 py-3 text-center font-medium">Completion Rate</th>
                <th class="px-4 py-3 text-center font-medium">Skor Rata-rata</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr v-for="d in data.department_stats" :key="d.id" class="hover:bg-gray-50 transition-colors">
                <td class="px-4 py-3 font-medium text-gray-800">{{ d.name }}</td>
                <td class="px-4 py-3 text-center text-gray-600">{{ d.employee_count }}</td>
                <td class="px-4 py-3 text-center">
                  <span class="font-medium" :class="d.completion_rate >= 80 ? 'text-green-600' : d.completion_rate >= 50 ? 'text-yellow-600' : 'text-red-500'">
                    {{ d.completion_rate || 0 }}%
                  </span>
                </td>
                <td class="px-4 py-3 text-center text-gray-600">{{ d.average_score || 0 }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>

    <!-- Analytics -->
    <template v-else-if="activeTab === 'analytics'">
      <div class="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div v-for="stat in analyticsStats" :key="stat.label" class="clay-card-sm p-4">
          <p class="text-xs text-gray-500 font-medium uppercase tracking-wider">{{ stat.label }}</p>
          <p class="text-2xl font-bold mt-1 text-blue-600">{{ stat.value }}</p>
        </div>
      </div>
      <div v-if="data?.top_courses?.length" class="clay-card overflow-hidden">
        <div class="px-5 py-4 border-b border-gray-100">
          <h2 class="font-semibold text-gray-800">Kursus Terpopuler</h2>
        </div>
        <div class="divide-y divide-gray-50">
          <div v-for="c in data.top_courses" :key="c.id" class="px-5 py-3 flex justify-between items-center hover:bg-gray-50 transition-colors">
            <p class="font-medium text-gray-800 text-sm">{{ c.name }}</p>
            <span class="text-sm font-bold text-blue-600">{{ c.enrollment_count }} peserta</span>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { lmsApi } from '../../services/lmsApi'
import { BookOpenIcon, CheckBadgeIcon, TrophyIcon, StarIcon } from '@heroicons/vue/24/outline'

const authStore = useAuthStore()
const loading = ref(false)
const error = ref('')
const data = ref(null)
const activeTab = ref('my')

const tabs = [
  { key: 'my', label: 'Dashboard Saya' },
  { key: 'manager', label: 'Tim Saya' },
  { key: 'company', label: 'Overview Perusahaan' },
  { key: 'analytics', label: 'Analitik' },
]

async function load() {
  loading.value = true
  error.value = ''
  try {
    if (activeTab.value === 'my') {
      data.value = await lmsApi.myDashboard({ include_recommendations: true, include_recent_activity: true })
    } else if (activeTab.value === 'manager') {
      data.value = await lmsApi.managerDashboard()
    } else if (activeTab.value === 'company') {
      data.value = await lmsApi.companyOverview()
    } else if (activeTab.value === 'analytics') {
      data.value = await lmsApi.dashboardAnalytics()
    }
  } catch (e) {
    error.value = e.message || 'Gagal memuat data dashboard'
  } finally {
    loading.value = false
  }
}

const managerStats = computed(() => [
  { label: 'Total Tim', value: data.value?.team_overview?.total_team_members ?? 0, color: 'text-blue-600' },
  { label: 'Sudah Enroll', value: data.value?.team_overview?.enrolled_users ?? 0, color: 'text-green-600' },
  { label: 'Total Enrollment', value: data.value?.team_overview?.total_enrollments ?? 0, color: 'text-purple-600' },
  { label: 'Aktif Belajar', value: data.value?.team_overview?.active_learners ?? 0, color: 'text-[#B70000]' },
])

const companyStats = computed(() => [
  { label: 'Total Karyawan', value: data.value?.total_employees ?? 0, color: 'text-blue-600' },
  { label: 'Total Kursus', value: data.value?.total_courses ?? 0, color: 'text-green-600' },
  { label: 'Total Enrollment', value: data.value?.total_enrollments ?? 0, color: 'text-purple-600' },
  { label: 'Completion Rate', value: (data.value?.overall_completion_rate ?? 0) + '%', color: 'text-yellow-600' },
])

const analyticsStats = computed(() => [
  { label: 'Enrollment Bulan Ini', value: data.value?.monthly_enrollments ?? 0 },
  { label: 'Penyelesaian Bulan Ini', value: data.value?.monthly_completions ?? 0 },
  { label: 'Skor Rata-rata', value: data.value?.average_score ?? 0 },
])

function difficultyClass(level) {
  return {
    basic: 'bg-green-50 text-green-700',
    intermediate: 'bg-yellow-50 text-yellow-700',
    advanced: 'bg-red-50 text-red-700',
  }[level] || 'bg-gray-100 text-gray-600'
}

onMounted(load)
</script>
