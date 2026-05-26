<template>
  <div class="min-h-screen bg-gray-50 p-4 md:p-6">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Analitik LMS</h1>
      <p class="text-sm text-gray-500 mt-1">Laporan dan analisis pembelajaran</p>
    </div>

    <!-- Tabs -->
    <div class="flex gap-2 mb-6 overflow-x-auto pb-1">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        @click="switchTab(tab.key)"
        class="px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all"
        :class="activeTab === tab.key ? 'bg-blue-600 text-white shadow' : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300'"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Filter row -->
    <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-5 flex flex-wrap gap-3 items-start">

      <!-- Per Kursus -->
      <template v-if="activeTab === 'course'">
        <select
          v-model="filterCourseId"
          class="flex-1 min-w-52 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
        >
          <option :value="null">Semua Kursus</option>
          <option v-for="c in courseList" :key="c.id" :value="c.id">{{ c.name }}</option>
        </select>
      </template>

      <!-- Per Karyawan -->
      <template v-else-if="activeTab === 'user'">
        <EmployeePicker
          v-model:userId="filterUserId"
          placeholder="Semua karyawan (atau cari nama tertentu)"
          class="flex-1 min-w-52"
          :clearable="true"
        />
      </template>

      <!-- Per Departemen -->
      <template v-else-if="activeTab === 'department'">
        <select
          v-model="filterDeptId"
          class="flex-1 min-w-52 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
        >
          <option :value="null">Semua Departemen</option>
          <option v-for="d in departments" :key="d.id" :value="d.id">{{ d.name }}</option>
        </select>
      </template>

      <!-- Trend -->
      <template v-else-if="activeTab === 'trend'">
        <select
          v-model="filterMetricType"
          class="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          <option value="enrollments">Enrollment baru</option>
          <option value="completions">Penyelesaian</option>
          <option value="scores">Rata-rata skor</option>
        </select>
        <input v-model="filterDateFrom" type="date" class="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300" />
        <input v-model="filterDateTo" type="date" class="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300" />
      </template>

      <!-- Custom report: no filter needed -->
      <template v-else-if="activeTab === 'custom'">
        <span class="text-sm text-gray-400 self-center">Ringkasan keseluruhan LMS</span>
      </template>

      <button
        @click="load"
        class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors self-start"
      >
        Tampilkan
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <div class="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
    </div>

    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
      <p class="text-red-600 font-medium">{{ error }}</p>
      <button @click="load" class="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700">Coba Lagi</button>
    </div>

    <div v-else-if="!data" class="bg-white rounded-xl p-12 text-center border border-gray-100 shadow-sm">
      <PresentationChartLineIcon class="w-12 h-12 text-gray-300 mx-auto mb-3" />
      <p class="text-gray-500 font-medium">Pilih filter lalu klik Tampilkan</p>
    </div>

    <!-- ── COURSE ANALYTICS ── -->
    <template v-else-if="activeTab === 'course'">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Enrollment" :value="data.total_enrollments ?? 0" color="blue" />
        <StatCard label="Selesai" :value="data.completed_count ?? 0" color="green" />
        <StatCard label="Completion Rate" :value="(data.completion_rate ?? 0) + '%'" color="purple" />
        <StatCard label="Skor Rata-rata" :value="data.average_score ?? 0" color="yellow" />
      </div>
      <div v-if="data.course_breakdown?.length" class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div class="px-5 py-4 border-b border-gray-100">
          <h2 class="font-semibold text-gray-800">Breakdown per Kursus</h2>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th class="px-4 py-3 text-left font-medium">Kursus</th>
                <th class="px-4 py-3 text-center font-medium">Enrollment</th>
                <th class="px-4 py-3 text-center font-medium">Selesai</th>
                <th class="px-4 py-3 text-center font-medium">Rate</th>
                <th class="px-4 py-3 text-center font-medium">Avg Skor</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr v-for="c in data.course_breakdown" :key="c.course_id" class="hover:bg-gray-50">
                <td class="px-4 py-3 font-medium text-gray-800">{{ c.course_name }}</td>
                <td class="px-4 py-3 text-center text-gray-600">{{ c.total_enrollments }}</td>
                <td class="px-4 py-3 text-center text-green-600 font-medium">{{ c.completed }}</td>
                <td class="px-4 py-3 text-center">
                  <span :class="rateClass(c.completion_rate)" class="font-medium">{{ c.completion_rate }}%</span>
                </td>
                <td class="px-4 py-3 text-center text-gray-600">{{ c.average_score }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>

    <!-- ── USER ANALYTICS ── -->
    <template v-else-if="activeTab === 'user'">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Enrolled" :value="data.total_enrolled ?? 0" color="blue" />
        <StatCard label="Selesai" :value="data.completed ?? 0" color="green" />
        <StatCard label="Total Poin" :value="data.total_points ?? 0" color="purple" />
        <StatCard label="Lencana" :value="data.total_badges ?? 0" color="yellow" />
      </div>
      <div v-if="data.user_list?.length" class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div class="px-5 py-4 border-b border-gray-100">
          <h2 class="font-semibold text-gray-800">Detail per Karyawan</h2>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th class="px-4 py-3 text-left font-medium">Karyawan</th>
                <th class="px-4 py-3 text-center font-medium">Enrolled</th>
                <th class="px-4 py-3 text-center font-medium">Selesai</th>
                <th class="px-4 py-3 text-center font-medium">Poin</th>
                <th class="px-4 py-3 text-center font-medium">Avg Skor</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr v-for="u in data.user_list" :key="u.user_id" class="hover:bg-gray-50">
                <td class="px-4 py-3 font-medium text-gray-800">{{ u.name }}</td>
                <td class="px-4 py-3 text-center text-gray-600">{{ u.enrolled }}</td>
                <td class="px-4 py-3 text-center text-green-600 font-medium">{{ u.completed }}</td>
                <td class="px-4 py-3 text-center text-purple-600 font-medium">{{ u.points }}</td>
                <td class="px-4 py-3 text-center text-gray-600">{{ u.average_score }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>

    <!-- ── DEPARTMENT ANALYTICS ── -->
    <template v-else-if="activeTab === 'department'">
      <div v-if="data.departments?.length" class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div class="px-5 py-4 border-b border-gray-100">
          <h2 class="font-semibold text-gray-800">Analytics per Departemen</h2>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th class="px-4 py-3 text-left font-medium">Departemen</th>
                <th class="px-4 py-3 text-center font-medium">Karyawan</th>
                <th class="px-4 py-3 text-center font-medium">Aktif Belajar</th>
                <th class="px-4 py-3 text-center font-medium">Completion Rate</th>
                <th class="px-4 py-3 text-center font-medium">Avg Skor</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr v-for="d in data.departments" :key="d.dept_id" class="hover:bg-gray-50">
                <td class="px-4 py-3 font-medium text-gray-800">{{ d.name }}</td>
                <td class="px-4 py-3 text-center text-gray-600">{{ d.employee_count }}</td>
                <td class="px-4 py-3 text-center text-blue-600 font-medium">{{ d.active_learners }}</td>
                <td class="px-4 py-3 text-center">
                  <span :class="rateClass(d.completion_rate)" class="font-medium">{{ d.completion_rate }}%</span>
                </td>
                <td class="px-4 py-3 text-center text-gray-600">{{ d.average_score }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div v-else class="bg-white rounded-xl p-10 text-center border border-gray-100 shadow-sm text-gray-400">Tidak ada data departemen</div>
    </template>

    <!-- ── TREND ANALYSIS ── -->
    <template v-else-if="activeTab === 'trend'">
      <div v-if="data.trends?.length" class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div class="px-5 py-4 border-b border-gray-100">
          <h2 class="font-semibold text-gray-800">Trend — {{ metricLabel }}</h2>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th class="px-4 py-3 text-left font-medium">Periode</th>
                <th class="px-4 py-3 text-center font-medium">Nilai</th>
                <th class="px-4 py-3 text-center font-medium">Perubahan</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr v-for="t in data.trends" :key="t.period" class="hover:bg-gray-50">
                <td class="px-4 py-3 font-medium text-gray-800">{{ t.period }}</td>
                <td class="px-4 py-3 text-center font-bold text-blue-600">{{ t.value }}</td>
                <td class="px-4 py-3 text-center">
                  <span v-if="t.change != null" :class="t.change >= 0 ? 'text-green-600' : 'text-red-500'" class="font-medium text-xs">
                    {{ t.change >= 0 ? '+' : '' }}{{ t.change }}%
                  </span>
                  <span v-else class="text-gray-400 text-xs">—</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div v-else class="bg-white rounded-xl p-10 text-center border border-gray-100 shadow-sm text-gray-400">Tidak ada data trend untuk periode ini</div>
    </template>

    <!-- ── CUSTOM REPORT ── -->
    <template v-else-if="activeTab === 'custom'">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Kursus" :value="data.total_courses ?? 0" color="blue" />
        <StatCard label="Total Enrollment" :value="data.total_enrollments ?? 0" color="purple" />
        <StatCard label="Kursus Selesai" :value="data.completed_enrollments ?? 0" color="green" />
        <StatCard label="Partisipasi" :value="(data.participation_rate ?? 0) + '%'" color="yellow" />
      </div>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Sedang Belajar" :value="data.in_progress_enrollments ?? 0" color="blue" />
        <StatCard label="Total Karyawan" :value="data.total_employees ?? 0" color="purple" />
        <StatCard label="Aktif Belajar" :value="data.active_learners ?? 0" color="green" />
        <StatCard label="Completion Rate" :value="(data.completion_rate ?? 0) + '%'" color="yellow" />
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, defineComponent, h, watch, onMounted } from 'vue'
import { lmsApi } from '../../services/lmsApi'
import { PresentationChartLineIcon } from '@heroicons/vue/24/outline'

// ── Inline StatCard ───────────────────────────────────────────────────
const StatCard = defineComponent({
  props: { label: String, value: [String, Number], color: String },
  setup(props) {
    const colorMap = {
      blue: 'text-blue-600', green: 'text-green-600',
      purple: 'text-purple-600', yellow: 'text-yellow-600',
    }
    return () => h('div', { class: 'bg-white rounded-xl p-4 border border-gray-100 shadow-sm' }, [
      h('p', { class: 'text-xs text-gray-500 font-medium uppercase tracking-wider' }, props.label),
      h('p', { class: `text-2xl font-bold mt-1 ${colorMap[props.color] || 'text-gray-800'}` }, String(props.value)),
    ])
  },
})

// ── Inline EmployeePicker ─────────────────────────────────────────────
const EmployeePicker = defineComponent({
  name: 'EmployeePicker',
  props: {
    userId: { type: Number, default: null },
    placeholder: { type: String, default: 'Cari karyawan...' },
    clearable: { type: Boolean, default: false },
  },
  emits: ['update:userId', 'select'],
  setup(props, { emit }) {
    const query = ref('')
    const suggestions = ref([])
    let debTimer = null

    watch(() => props.userId, (val) => { if (!val) query.value = '' })

    async function onInput() {
      emit('update:userId', null)
      clearTimeout(debTimer)
      if (!query.value || query.value.length < 2) { suggestions.value = []; return }
      debTimer = setTimeout(async () => {
        try {
          const res = await lmsApi.employeeSearch({ search: query.value, limit: 8 })
          suggestions.value = res?.employees || []
        } catch { suggestions.value = [] }
      }, 300)
    }

    function select(emp) {
      query.value = emp.name; suggestions.value = []
      emit('update:userId', emp.user_id); emit('select', emp)
    }

    function clear() {
      query.value = ''; suggestions.value = []; emit('update:userId', null)
    }

    return () => h('div', { class: 'relative' }, [
      h('div', { class: 'relative' }, [
        h('input', {
          value: query.value,
          onInput: (e) => { query.value = e.target.value; onInput() },
          placeholder: props.placeholder,
          class: 'w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300',
        }),
        props.clearable && props.userId
          ? h('button', { onClick: clear, class: 'absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg' }, '×')
          : null,
      ]),
      suggestions.value.length
        ? h('div', { class: 'absolute z-20 top-full left-0 right-0 mt-1 bg-white rounded-xl border border-gray-200 shadow-xl max-h-52 overflow-y-auto' },
            suggestions.value.map(emp =>
              h('button', { key: emp.user_id, onClick: () => select(emp), class: 'w-full px-4 py-2.5 text-left hover:bg-blue-50 flex items-center justify-between gap-3' }, [
                h('div', {}, [
                  h('p', { class: 'text-sm font-medium text-gray-800' }, emp.name),
                  h('p', { class: 'text-xs text-gray-400' }, emp.job_title || emp.department),
                ]),
                h('span', { class: 'text-xs text-gray-300 shrink-0' }, emp.department),
              ])
            )
          )
        : null,
    ])
  },
})
// ─────────────────────────────────────────────────────────────────────

const loading = ref(false)
const error = ref('')
const data = ref(null)
const activeTab = ref('course')

const filterCourseId = ref(null)
const filterUserId = ref(null)
const filterDeptId = ref(null)
const filterMetricType = ref('enrollments')
const filterDateFrom = ref('')
const filterDateTo = ref('')

const courseList = ref([])
const departments = ref([])

const tabs = [
  { key: 'course', label: 'Per Kursus' },
  { key: 'user', label: 'Per Karyawan' },
  { key: 'department', label: 'Per Departemen' },
  { key: 'trend', label: 'Trend' },
  { key: 'custom', label: 'Ringkasan' },
]

const metricLabel = computed(() => ({
  enrollments: 'Enrollment Baru',
  completions: 'Penyelesaian',
  scores: 'Rata-rata Skor',
})[filterMetricType.value] || filterMetricType.value)

function rateClass(rate) {
  return rate >= 80 ? 'text-green-600' : rate >= 50 ? 'text-yellow-600' : 'text-red-500'
}

async function loadMeta() {
  try {
    const [courses, depts] = await Promise.all([
      lmsApi.courseSearch({ limit: 200 }),
      lmsApi.employeeDepartments(),
    ])
    courseList.value = courses?.courses ?? []
    departments.value = Array.isArray(depts) ? depts : []
  } catch { /* non-critical */ }
}

function switchTab(key) {
  activeTab.value = key
  data.value = null
  if (key === 'custom') load()
}

async function load() {
  loading.value = true
  error.value = ''
  data.value = null
  try {
    if (activeTab.value === 'course') {
      const params = {}
      if (filterCourseId.value) params.course_id = filterCourseId.value
      data.value = await lmsApi.courseAnalytics(params)
    } else if (activeTab.value === 'user') {
      const params = {}
      if (filterUserId.value) params.user_id = filterUserId.value
      data.value = await lmsApi.userAnalytics(params)
    } else if (activeTab.value === 'department') {
      const params = {}
      if (filterDeptId.value) params.department_id = filterDeptId.value
      data.value = await lmsApi.departmentAnalytics(params)
    } else if (activeTab.value === 'trend') {
      const params = { metric_type: filterMetricType.value }
      if (filterDateFrom.value) params.date_from = filterDateFrom.value
      if (filterDateTo.value) params.date_to = filterDateTo.value
      data.value = await lmsApi.trendAnalysis(params)
    } else if (activeTab.value === 'custom') {
      data.value = await lmsApi.customReport()
    }
  } catch (e) {
    error.value = e.message || 'Gagal memuat analitik'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await loadMeta()
  load()
})
</script>
