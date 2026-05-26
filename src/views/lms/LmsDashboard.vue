<template>
  <div class="min-h-screen bg-gray-50 p-4 md:p-6">
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Dashboard LMS</h1>
      <p class="text-sm text-gray-500 mt-1">Ringkasan aktivitas pembelajaran Anda</p>
    </div>

    <!-- Tab (admin only) -->
    <div v-if="authStore.user?.is_admin" class="flex gap-2 mb-6 overflow-x-auto pb-1">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        @click="activeTab = tab.key; load()"
        class="px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all"
        :class="activeTab === tab.key
          ? 'bg-blue-600 text-white shadow'
          : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300'"
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
        <div class="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p class="text-xs text-gray-500 font-medium uppercase tracking-wider">Terdaftar</p>
          <p class="text-2xl font-bold text-blue-600 mt-1">{{ data?.stats?.total_enrollments ?? 0 }}</p>
          <p class="text-xs text-gray-400 mt-0.5">kursus</p>
        </div>
        <div class="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p class="text-xs text-gray-500 font-medium uppercase tracking-wider">Selesai</p>
          <p class="text-2xl font-bold text-green-600 mt-1">{{ data?.stats?.completed_courses ?? 0 }}</p>
          <p class="text-xs text-gray-400 mt-0.5">kursus</p>
        </div>
        <div class="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p class="text-xs text-gray-500 font-medium uppercase tracking-wider">Lencana</p>
          <p class="text-2xl font-bold text-yellow-500 mt-1">{{ data?.stats?.badges_earned ?? 0 }}</p>
          <p class="text-xs text-gray-400 mt-0.5">diperoleh</p>
        </div>
        <div class="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p class="text-xs text-gray-500 font-medium uppercase tracking-wider">Kompetensi</p>
          <p class="text-2xl font-bold text-purple-600 mt-1">{{ data?.stats?.competencies_achieved ?? 0 }}</p>
          <p class="text-xs text-gray-400 mt-0.5">dicapai</p>
        </div>
      </div>

      <!-- Active Enrollments -->
      <div class="grid md:grid-cols-2 gap-6">
        <div class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
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
        <div class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
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
      <div v-if="data?.recent_activity?.length" class="mt-6 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
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
        <div v-for="stat in managerStats" :key="stat.label" class="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p class="text-xs text-gray-500 font-medium uppercase tracking-wider">{{ stat.label }}</p>
          <p class="text-2xl font-bold mt-1" :class="stat.color">{{ stat.value }}</p>
        </div>
      </div>
      <div v-if="data?.team_members?.length" class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div class="px-5 py-4 border-b border-gray-100">
          <h2 class="font-semibold text-gray-800">Anggota Tim</h2>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th class="px-4 py-3 text-left font-medium">Nama</th>
                <th class="px-4 py-3 text-center font-medium">Terdaftar</th>
                <th class="px-4 py-3 text-center font-medium">Selesai</th>
                <th class="px-4 py-3 text-center font-medium">Progress</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr v-for="m in data.team_members" :key="m.id" class="hover:bg-gray-50 transition-colors">
                <td class="px-4 py-3 font-medium text-gray-800">{{ m.name }}</td>
                <td class="px-4 py-3 text-center text-gray-600">{{ m.enrolled }}</td>
                <td class="px-4 py-3 text-center text-green-600 font-medium">{{ m.completed }}</td>
                <td class="px-4 py-3">
                  <div class="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div class="h-full bg-blue-500 rounded-full" :style="{ width: (m.completion_rate || 0) + '%' }"></div>
                  </div>
                  <p class="text-xs text-gray-400 text-center mt-1">{{ m.completion_rate || 0 }}%</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div v-else class="bg-white rounded-xl p-10 text-center text-gray-400 border border-gray-100 shadow-sm">
        Tidak ada data tim
      </div>
    </template>

    <!-- Company Overview -->
    <template v-else-if="activeTab === 'company'">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div v-for="stat in companyStats" :key="stat.label" class="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p class="text-xs text-gray-500 font-medium uppercase tracking-wider">{{ stat.label }}</p>
          <p class="text-2xl font-bold mt-1" :class="stat.color">{{ stat.value }}</p>
        </div>
      </div>
      <div v-if="data?.department_stats?.length" class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
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
        <div v-for="stat in analyticsStats" :key="stat.label" class="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p class="text-xs text-gray-500 font-medium uppercase tracking-wider">{{ stat.label }}</p>
          <p class="text-2xl font-bold mt-1 text-blue-600">{{ stat.value }}</p>
        </div>
      </div>
      <div v-if="data?.top_courses?.length" class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
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
  { label: 'Total Tim', value: data.value?.total_members ?? 0, color: 'text-blue-600' },
  { label: 'Aktif Belajar', value: data.value?.active_learners ?? 0, color: 'text-green-600' },
  { label: 'Completion Rate', value: (data.value?.team_completion_rate ?? 0) + '%', color: 'text-purple-600' },
  { label: 'Kursus Wajib Pending', value: data.value?.pending_mandatory ?? 0, color: 'text-red-500' },
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
