<template>
  <div class="min-h-screen bg-gray-50">
    <Toast
      v-model:show="toast.show"
      :message="toast.message"
      :type="toast.type"
      :duration="toast.duration"
    />
    <div class="bg-white shadow">
      <div class="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
          <!-- Title -->
          <h1 class="text-xl sm:text-2xl font-semibold text-gray-900">Performance Dashboard</h1>
          
          <!-- Controls -->
          <div class="flex flex-col sm:flex-row gap-3 sm:items-center">
            <!-- Date Range Filter -->
            <div class="flex flex-wrap gap-3 items-center">
              <select
                v-model="selectedRange"
                @change="handleDateRangeChange"
                class="w-full sm:w-auto rounded-md border-gray-300 py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="this_week">This Week</option>
                <option value="this_month">This Month</option>
                <option value="this_year">This Year</option>
                <option value="custom">Custom Range</option>
              </select>
  
              <!-- Date Picker -->
              <DateRangePicker
                v-if="showDatePicker"
                v-model="dateRange"
                @update:modelValue="handleCustomDateChange"
                @close="showDatePicker = false"
                class="w-full sm:w-auto"
              />
  
              <!-- Date Display -->
              <div class="bg-gray-100 px-3 py-2 rounded-md text-sm text-gray-600 truncate">
                {{ formattedDateRange }}
              </div>
            </div>
  
            <!-- Refresh Button -->
            <button
              @click="refreshData"
              class="w-full sm:w-auto inline-flex justify-center items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <ArrowPathIcon 
                class="h-4 w-4 mr-1.5" 
                :class="{ 'animate-spin': loading }" 
                aria-hidden="true"
              />
              Refresh
            </button>
            <!-- Reset Button -->
            <button
              @click="resetFilters"
              class="w-full sm:w-auto inline-flex justify-center items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <BackspaceIcon class="h-4 w-4 mr-1.5" />
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <main class="w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="space-y-6">
        <!-- Overview Stats -->
        <div class="rounded-lg shadow-sm p-4">
          <OverviewStats :data="dashboardData.overview" :loading="loading" />
        </div>

        <!-- Revenue Trends - Full Width -->
        <div class="bg-white rounded-lg shadow-sm p-4">
          <RevenueTrends 
            :data="dashboardData.trends" 
            :loading="loading"
            :show-on-time-metric="true" 
          />
        </div>

         <!-- Three Column Layout -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Team Performance - 2 Columns -->
          <div class="lg:col-span-2">
            <div class="bg-white rounded-lg shadow-sm p-4">
              <TeamPerformance :teams="filteredTeams" :mechanics="filteredMechanics"
              :loading="loading" />
            </div>
          </div>

          <!-- Combined Metrics - 1 Column -->
          <div class="lg:col-span-1">
            <div class="bg-white rounded-lg shadow-sm p-4 space-y-6">
              <!-- Quality Metrics -->
              <!-- <div>
                <QualityMetrics :data="dashboardData.overview" :loading="loading" />
              </div> -->
              
              <!-- Divider -->
              <!-- <hr class="border-gray-200" /> -->
              
              <!-- Duration Metrics -->
              <div>
                <DurationMetrics :data="dashboardData.overview" :loading="loading" />
              </div>
            </div>
          </div>

          <!-- Mechanic Table - Full Column -->
          <div class="lg:col-span-3">
            <div class="bg-white rounded-lg shadow-sm">
              <MechanicTable :mechanics="filteredMechanics" :loading="loading" />
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { debounce } from 'lodash'
import { 
  ArrowPathIcon,
  BackspaceIcon
} from '@heroicons/vue/24/outline'
import { format } from 'date-fns'
import apiClient from '@/config/api'
import DateRangePicker from '@/components/DateRangePicker.vue'
import OverviewStats from '@/components/dashboard/OverviewStats.vue'
import RevenueTrends from '@/components/dashboard/RevenueTrends.vue'
import TeamPerformance from '@/components/dashboard/TeamPerformance.vue'
import MechanicTable from '@/components/dashboard/MechanicTable.vue'
import DurationMetrics from '@/components/dashboard/DurationMetrics.vue'
import QualityMetrics from '@/components/dashboard/QualityMetrics.vue'

import Toast from '@/components/Toast.vue' // Import Toast component
import { useToast } from '@/composables/useToast' // Import toast composable

const { toast, showToast } = useToast() // Use the toast composable

const loading = ref(false)
const selectedRange = ref('this_week')
const showDatePicker = ref(false)
const dateRange = ref({ start: null, end: null })
const dashboardData = ref({
  date_range: {
    type: 'this_week',
    start: '',
    end: ''
  },
  overview: {
    total_revenue: 0,
    total_orders: 0,
    average_rating: 0,
    on_time_rate: 0,
    complaints: {
      total: 0,
      rate: 0
    },
    performance: {
      duration_accuracy: 0,
      early_completion_rate: 0,
      late_completion_rate: 0
    }
  },
  teams: [], // struktur data teams sudah berubah
  mechanics: [],
  trends: []
})

// Update computed untuk filter team
const filteredTeams = computed(() => 
  dashboardData.value.teams.filter(team => team.position === 'Team')
)

// Update computed untuk filter mechanics (termasuk team leader)
const filteredMechanics = computed(() => 
  dashboardData.value.mechanics.filter(mech => 
    ['Mechanic', 'Team Leader'].includes(mech.position)
  ).sort((a, b) => b.metrics.revenue.total - a.metrics.revenue.total)
)


// Computed properties
const formattedDateRange = computed(() => {
  const { start, end } = dashboardData.value.date_range
  if (!start || !end) return ''
  return `${format(new Date(start), 'dd MMM yyyy')} - ${format(new Date(end), 'dd MMM yyyy')}`
})

// Debounced fetch data function
const fetchDashboardData = debounce(async () => {
  try {
    loading.value = true
    const params = {
      date_range: selectedRange.value
    }

    if (selectedRange.value === 'custom' && dateRange.value.start && dateRange.value.end) {
      params.start_date = dateRange.value.start
      params.end_date = dateRange.value.end
    }

    const response = await apiClient.post('/web/v2/dashboard/mechanic', {
      jsonrpc: '2.0',
      method: 'call',
      params
    })

    if (response.data.result?.data) {
      dashboardData.value = response.data.result.data
      showToast({
        message: `Data berhasil dimuat untuk ${
          selectedRange.value === 'custom' 
            ? 'rentang tanggal yang dipilih' 
            : getDateRangeText(selectedRange.value)
        }`,
        type: 'success'
      })
    }
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    showToast({
      message: error.message || 'Gagal memuat data dashboard',
      type: 'error',
      duration: 5000
    })
  } finally {
    loading.value = false
  }
}, 500)

const getDateRangeText = (range) => {
  const rangeTexts = {
    'today': 'hari ini',
    'yesterday': 'kemarin',
    'this_week': 'minggu ini',
    'this_month': 'bulan ini',
    'this_year': 'tahun ini'
  }
  return rangeTexts[range] || range
}

const handleDateRangeChange = () => {
  if (selectedRange.value === 'custom') {
    showDatePicker.value = true
  } else {
    showDatePicker.value = false
    fetchDashboardData()
  }
}

const handleCustomDateChange = () => {
  if (dateRange.value.start && dateRange.value.end) {
    fetchDashboardData()
  }
}

const resetFilters = () => {
  selectedRange.value = 'this_week'
  dateRange.value = { start: null, end: null }
  showDatePicker.value = false
  fetchDashboardData()
  showToast({
    message: 'Filter telah direset ke default',
    type: 'info'
  })
}

const handleSort = (column) => {
  // Implement sorting logic if needed
}

const refreshData = () => {
  fetchDashboardData()
}

onMounted(() => {
  fetchDashboardData()
})
</script>