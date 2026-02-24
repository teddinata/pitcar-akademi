<template>
  <div class="min-h-screen bg-gray-50">
    <Toast
      v-model:show="toast.show"
      :message="toast.message"
      :type="toast.type"
      :duration="toast.duration"
    />

    <!-- Complaint Detail Modal -->
    <ComplaintModal
      :isOpen="showComplaintModal"
      :complaints="selectedComplaints"
      :title="complaintModalTitle"
      :complaintRate="selectedComplaintRate"
      @close="showComplaintModal = false"
    />

    <!-- Header -->
    <div class="bg-white border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <!-- Title Section -->
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Performa Service Advisor</h1>
            <p class="mt-1 text-sm text-gray-500">Monitor performa dan komplain layanan</p>
          </div>

          <!-- Controls -->
          <div class="flex flex-wrap items-center gap-3">
            <!-- Date Range -->
            <select
              v-model="selectedRange"
              @change="handleDateRangeChange"
              class="rounded-lg border-gray-300 text-sm focus:ring-red-500 focus:border-red-500"
            >
              <option value="today">Hari Ini</option>
              <option value="yesterday">Kemarin</option>
              <option value="this_week">Minggu Ini</option>
              <option value="this_month">Bulan Ini</option>
              <option value="this_year">Tahun Ini</option>
              <option value="custom">Pilih Tanggal</option>
            </select>

            <!-- Date Picker -->
            <DateRangePicker
              v-if="showDatePicker"
              v-model="dateRange"
              @update:modelValue="handleCustomDateChange"
              @close="showDatePicker = false"
            />

            <!-- Date Display -->
            <div v-if="!loading" class="hidden sm:flex items-center px-3 py-2 bg-gray-100 rounded-lg text-sm text-gray-600">
              <CalendarIcon class="h-4 w-4 mr-2" />
              {{ formattedDateRange }}
            </div>

            <!-- Refresh -->
            <button
              @click="refreshData"
              :disabled="loading"
              class="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:bg-gray-400 transition-colors"
            >
              <ArrowPathIcon 
                class="h-4 w-4 mr-2" 
                :class="{ 'animate-spin': loading }" 
              />
              Refresh
            </button>

            <!-- Reset -->
            <button
              @click="resetFilters"
              class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              <BackspaceIcon class="h-4 w-4 mr-2" />
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="space-y-6">
        
        <!-- Overview Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <!-- Revenue Card -->
          <div class="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300">
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <p class="text-sm font-medium text-gray-600">Total Pendapatan</p>
                <p class="mt-2 text-2xl font-bold text-gray-900">
                  {{ formatCurrency(dashboardData.overview?.total_revenue) }}
                </p>
                <p class="mt-2 flex items-center text-sm text-gray-500">
                  <InboxStackIcon class="h-4 w-4 mr-1" />
                  {{ dashboardData.overview?.total_orders }} Order
                </p>
              </div>
              <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-gray-100 to-gray-200">
                <CurrencyDollarIcon class="h-6 w-6 text-gray-600" />
              </div>
            </div>
          </div>

          <!-- Service Performance -->
          <div class="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300">
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <p class="text-sm font-medium text-gray-600">Performa Layanan</p>
                <p class="mt-2 text-2xl font-bold text-gray-900">
                  {{ formatPercentage(dashboardData.overview?.service_performance?.on_time_rate) }}
                </p>
                <p class="mt-2 flex items-center text-sm text-gray-500">
                  <ClockIcon class="h-4 w-4 mr-1" />
                  On-time Rate
                </p>
              </div>
              <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-100 to-green-200">
                <ChartBarIcon class="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <!-- Customer Rating -->
          <div class="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300">
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <p class="text-sm font-medium text-gray-600">Rating Customer</p>
                <div class="mt-2 flex items-center space-x-2">
                  <p class="text-2xl font-bold text-gray-900">
                    {{ formatNumber(dashboardData.overview?.rating?.average, 1) }}
                  </p>
                  <div class="flex">
                    <StarIcon 
                      v-for="i in 5" 
                      :key="i"
                      :class="[
                        'h-4 w-4',
                        i <= Math.round(dashboardData.overview?.rating?.average || 0)
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300'
                      ]"
                    />
                  </div>
                </div>
                <p class="mt-2 flex items-center text-sm text-gray-500">
                  <UserGroupIcon class="h-4 w-4 mr-1" />
                  {{ dashboardData.overview?.rating?.total_rated_orders }} Feedback
                </p>
              </div>
              <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-100 to-yellow-200">
                <StarIcon class="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <!-- Complaints Card - REDESIGNED -->
          <div 
            @click="openComplaintModal(dashboardData.overview?.complaints)"
            class="bg-white rounded-xl border-2 border-red-200 p-6 hover:shadow-lg hover:border-red-300 transition-all duration-300 cursor-pointer group"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <p class="text-sm font-medium text-gray-600">Komplain</p>
                <p class="mt-2 text-2xl font-bold text-red-600">
                  {{ dashboardData.overview?.complaints?.total || 0 }}
                </p>
                <p class="mt-2 flex items-center text-sm text-red-500">
                  <ExclamationCircleIcon class="h-4 w-4 mr-1" />
                  Rate: {{ formatPercentage(dashboardData.overview?.complaints?.rate) }}
                </p>
              </div>
              <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-red-100 to-red-200 group-hover:scale-110 transition-transform">
                <ExclamationTriangleIcon class="h-6 w-6 text-red-600" />
              </div>
            </div>
            <!-- Click indicator -->
            <div class="mt-3 flex items-center justify-center">
              <span class="text-xs text-red-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                Klik untuk melihat detail →
              </span>
            </div>
          </div>
        </div>

        <!-- Revenue Trends Chart -->
        <div class="bg-white rounded-xl border border-gray-200 p-6">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-semibold text-gray-900">Tren Pendapatan</h3>
          </div>
          <RevenueTrends 
            :data="dashboardData.trends" 
            :loading="loading"
            :show-on-time-metric="false" 
          />
        </div>

        <!-- Team Performance Section -->
        <div class="bg-white rounded-xl border border-gray-200 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-6">Performa Tim</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            <!-- Service Performance -->
            <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border border-blue-200">
              <div class="flex items-center justify-between mb-4">
                <h4 class="font-semibold text-gray-900">Performa Layanan</h4>
                <ChartBarIcon class="h-5 w-5 text-blue-600" />
              </div>
              
              <!-- Average Time -->
              <div class="mb-4">
                <div class="flex justify-between text-sm mb-2">
                  <span class="text-gray-700">Waktu Rata-rata</span>
                  <span :class="[
                    'font-semibold',
                    dashboardData.overview?.service_performance?.average_time <= 15 ? 'text-green-600' : 
                    dashboardData.overview?.service_performance?.average_time <= 20 ? 'text-yellow-600' : 'text-red-600'
                  ]">
                    {{ formatNumber(dashboardData.overview?.service_performance?.average_time, 1) }} menit
                  </span>
                </div>
                <!-- Progress bar -->
                <div class="h-2 bg-white/50 rounded-full overflow-hidden">
                  <div 
                    class="h-full rounded-full transition-all duration-500"
                    :class="{
                      'bg-green-500': dashboardData.overview?.service_performance?.average_time <= 15,
                      'bg-yellow-500': dashboardData.overview?.service_performance?.average_time > 15 && dashboardData.overview?.service_performance?.average_time <= 20,
                      'bg-red-500': dashboardData.overview?.service_performance?.average_time > 20
                    }"
                    :style="{ width: `${Math.min((dashboardData.overview?.service_performance?.average_time / 30) * 100, 100)}%` }"
                  ></div>
                </div>
              </div>

              <!-- Stats -->
              <div class="grid grid-cols-2 gap-3">
                <div class="bg-white/80 rounded-lg p-3">
                  <p class="text-xs text-gray-600 mb-1">On-time</p>
                  <p class="text-xl font-bold text-green-600">
                    {{ dashboardData.overview?.service_performance?.on_time_services }}
                  </p>
                </div>
                <div class="bg-white/80 rounded-lg p-3">
                  <p class="text-xs text-gray-600 mb-1">Total</p>
                  <p class="text-xl font-bold text-blue-600">
                    {{ dashboardData.overview?.service_performance?.total_services }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Team Revenue -->
            <div class="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-5 border border-green-200">
              <div class="flex items-center justify-between mb-4">
                <h4 class="font-semibold text-gray-900">Pendapatan Tim</h4>
                <CurrencyDollarIcon class="h-5 w-5 text-green-600" />
              </div>
              
              <div v-for="team in dashboardData.teams" :key="team.id" class="space-y-4">
                <div>
                  <p class="text-sm text-gray-600 mb-2">Total Pendapatan</p>
                  <p class="text-2xl font-bold text-green-600">
                    {{ formatCurrency(team.metrics.revenue.total) }}
                  </p>
                </div>

                <!-- Progress -->
                <div>
                  <div class="flex justify-between text-xs mb-2">
                    <span class="text-gray-600">Target</span>
                    <span class="font-medium text-gray-900">
                      {{ formatCurrency(team.metrics.revenue.target) }}
                    </span>
                  </div>
                  <div class="h-3 bg-white/50 rounded-full overflow-hidden">
                    <div
                      class="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-500"
                      :style="{ width: `${Math.min(team.metrics.revenue.achievement, 100)}%` }"
                    ></div>
                  </div>
                  <p class="text-sm font-semibold text-green-700 mt-2">
                    {{ formatPercentage(team.metrics.revenue.achievement) }} tercapai
                  </p>
                </div>
              </div>
            </div>

            <!-- Team Complaints - NEW -->
            <div 
              @click="openComplaintModal(dashboardData.teams[0]?.metrics?.performance?.complaints)"
              class="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-5 border border-red-200 cursor-pointer hover:shadow-lg transition-all duration-300 group"
            >
              <div class="flex items-center justify-between mb-4">
                <h4 class="font-semibold text-gray-900">Komplain Tim</h4>
                <ExclamationTriangleIcon class="h-5 w-5 text-red-600" />
              </div>
              
              <div v-if="dashboardData.teams && dashboardData.teams.length > 0" class="space-y-4">
                <div>
                  <p class="text-sm text-gray-600 mb-2">Total Komplain</p>
                  <p class="text-3xl font-bold text-red-600">
                    {{ dashboardData.teams[0]?.metrics?.performance?.complaints?.total || 0 }}
                  </p>
                </div>

                <div class="bg-white/80 rounded-lg p-3">
                  <p class="text-xs text-gray-600 mb-1">Rate Komplain</p>
                  <p class="text-lg font-semibold text-red-600">
                    {{ formatPercentage(dashboardData.teams[0]?.metrics?.performance?.complaints?.rate) }}
                  </p>
                </div>

                <!-- Click indicator -->
                <div class="mt-3 text-center">
                  <span class="text-xs text-red-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    Klik untuk detail →
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Service Advisors Table -->
        <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div class="px-6 py-5 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900">Performa Service Advisor</h3>
          </div>

          <!-- Desktop Table -->
          <div class="hidden lg:block overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Advisor
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Team Leader
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pendapatan
                  </th>
                  <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Target
                  </th>
                  <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rating
                  </th>
                  <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Komplain
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr 
                  v-for="advisor in dashboardData.advisors" 
                  :key="advisor.id"
                  class="hover:bg-gray-50 transition-colors"
                >
                  <!-- Advisor Info -->
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div class="font-medium text-gray-900">{{ advisor.name }}</div>
                      <div class="text-sm text-gray-500">{{ advisor.metrics.orders.total }} Order</div>
                    </div>
                  </td>

                  <!-- Team Leader -->
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div v-if="advisor.leader" class="flex items-center">
                      <div class="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                        <span class="text-xs font-medium text-gray-600">
                          {{ getInitials(advisor.leader.name) }}
                        </span>
                      </div>
                      <span class="ml-2 text-sm text-gray-900">{{ advisor.leader.name }}</span>
                    </div>
                    <span v-else class="text-sm text-gray-400">-</span>
                  </td>

                  <!-- Revenue -->
                  <td class="px-6 py-4">
                    <div class="space-y-2">
                      <div class="font-medium text-gray-900">
                        {{ formatCurrency(advisor.metrics.revenue.total) }}
                      </div>
                      <div class="text-xs text-gray-500">
                        Avg: {{ formatCurrency(advisor.metrics.orders.average_value) }}
                      </div>
                    </div>
                  </td>

                  <!-- Target Progress -->
                  <td class="px-6 py-4">
                    <div class="flex flex-col items-center">
                      <div class="relative w-16 h-16">
                        <svg class="w-16 h-16 transform -rotate-90">
                          <circle
                            class="text-gray-200"
                            stroke-width="4"
                            stroke="currentColor"
                            fill="transparent"
                            r="28"
                            cx="32"
                            cy="32"
                          />
                          <circle
                            :class="[
                              advisor.metrics.revenue.achievement >= 100 ? 'text-green-500' :
                              advisor.metrics.revenue.achievement >= 80 ? 'text-yellow-500' :
                              'text-red-500'
                            ]"
                            stroke-width="4"
                            :stroke-dasharray="circumference"
                            :stroke-dashoffset="dashOffset(advisor.metrics.revenue.achievement)"
                            stroke="currentColor"
                            fill="transparent"
                            r="28"
                            cx="32"
                            cy="32"
                          />
                        </svg>
                        <span class="absolute inset-0 flex items-center justify-center text-xs font-bold">
                          {{ Math.round(advisor.metrics.revenue.achievement) }}%
                        </span>
                      </div>
                    </div>
                  </td>

                  <!-- Rating -->
                  <td class="px-6 py-4">
                    <div class="flex flex-col items-center">
                      <div class="flex items-center">
                        <span class="text-lg font-bold text-gray-900">
                          {{ formatNumber(advisor.metrics.performance.rating.average, 1) }}
                        </span>
                        <StarIcon class="h-5 w-5 text-yellow-400 ml-1 fill-yellow-400" />
                      </div>
                      <div class="text-xs text-gray-500 mt-1">
                        {{ advisor.metrics.performance.rating.total_rated_orders }} feedback
                      </div>
                    </div>
                  </td>

                  <!-- Complaints - CLICKABLE -->
                  <td class="px-6 py-4">
                    <button
                      @click="openComplaintModal(advisor.metrics.performance.complaints, advisor.name)"
                      :class="[
                        'flex flex-col items-center w-full py-2 px-3 rounded-lg transition-all',
                        advisor.metrics.performance.complaints?.total > 0
                          ? 'hover:bg-red-50 cursor-pointer'
                          : 'cursor-default'
                      ]"
                    >
                      <span 
                        :class="[
                          'text-2xl font-bold',
                          advisor.metrics.performance.complaints?.total > 0 ? 'text-red-600' : 'text-green-600'
                        ]"
                      >
                        {{ advisor.metrics.performance.complaints?.total || 0 }}
                      </span>
                      <span 
                        :class="[
                          'text-xs mt-1',
                          advisor.metrics.performance.complaints?.total > 0 ? 'text-red-500' : 'text-green-500'
                        ]"
                      >
                        {{ formatPercentage(advisor.metrics.performance.complaints?.rate) }}
                      </span>
                      <span v-if="advisor.metrics.performance.complaints?.total > 0" class="text-xs text-red-600 mt-1 opacity-0 group-hover:opacity-100">
                        Lihat detail
                      </span>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Mobile View -->
          <div class="lg:hidden divide-y divide-gray-200">
            <div 
              v-for="advisor in dashboardData.advisors" 
              :key="advisor.id"
              class="p-4 space-y-4"
            >
              <!-- Header -->
              <div class="flex justify-between items-start">
                <div>
                  <div class="font-semibold text-gray-900">{{ advisor.name }}</div>
                  <div class="text-sm text-gray-500">{{ advisor.metrics.orders.total }} Order</div>
                </div>
                <div class="text-right">
                  <div class="font-semibold text-gray-900">
                    {{ formatCurrency(advisor.metrics.revenue.total) }}
                  </div>
                  <div class="text-sm text-gray-500">
                    {{ Math.round(advisor.metrics.revenue.achievement) }}% target
                  </div>
                </div>
              </div>

              <!-- Stats Grid -->
              <div class="grid grid-cols-2 gap-3">
                <div class="bg-gray-50 rounded-lg p-3">
                  <div class="text-xs text-gray-500 mb-1">Rating</div>
                  <div class="flex items-center">
                    <span class="font-semibold text-gray-900">
                      {{ formatNumber(advisor.metrics.performance.rating.average, 1) }}
                    </span>
                    <StarIcon class="h-4 w-4 text-yellow-400 ml-1" />
                  </div>
                </div>
                <button
                  @click="openComplaintModal(advisor.metrics.performance.complaints, advisor.name)"
                  :class="[
                    'bg-gray-50 rounded-lg p-3 text-left',
                    advisor.metrics.performance.complaints?.total > 0 ? 'hover:bg-red-50' : ''
                  ]"
                >
                  <div class="text-xs text-gray-500 mb-1">Komplain</div>
                  <div 
                    :class="[
                      'font-semibold',
                      advisor.metrics.performance.complaints?.total > 0 ? 'text-red-600' : 'text-green-600'
                    ]"
                  >
                    {{ advisor.metrics.performance.complaints?.total || 0 }}
                  </div>
                </button>
              </div>
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
  CurrencyDollarIcon,
  ChartBarIcon,
  StarIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  UserGroupIcon,
  InboxStackIcon,
  BackspaceIcon,
  CalendarIcon
} from '@heroicons/vue/24/outline'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import apiClient from '@/config/api'
import { formatCurrency, formatNumber, formatPercentage } from '@/utils/formatters'
import DateRangePicker from '@/components/DateRangePicker.vue'
import RevenueTrends from '@/components/dashboard/RevenueTrends.vue'
import Toast from '@/components/Toast.vue'
import ComplaintModal from '@/components/ComplaintModal.vue'
import { useToast } from '@/composables/useToast'

const { toast, showToast } = useToast()

const loading = ref(false)
const selectedRange = ref('this_month')
const showDatePicker = ref(false)
const dateRange = ref({ start: null, end: null })

// Complaint Modal State
const showComplaintModal = ref(false)
const selectedComplaints = ref([])
const complaintModalTitle = ref('')
const selectedComplaintRate = ref(0)

const dashboardData = ref({
  date_range: {
    type: 'this_month',
    start: '',
    end: ''
  },
  overview: {
    total_revenue: 0,
    total_orders: 0,
    rating: {
      average: 0,
      total_rated_orders: 0
    },
    service_performance: {
      average_time: 0,
      on_time_rate: 0,
      total_services: 0,
      on_time_services: 0
    },
    complaints: {
      total: 0,
      rate: 0,
      details: []
    }
  },
  teams: [],
  advisors: [],
  trends: []
})

const circumference = 2 * Math.PI * 28
const dashOffset = (percentage) => {
  return circumference - (percentage / 100) * circumference
}

const getInitials = (name) => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
}

const formattedDateRange = computed(() => {
  const { start, end } = dashboardData.value.date_range
  if (!start || !end) return ''
  return `${format(new Date(start), 'dd MMM yyyy', { locale: id })} - ${format(new Date(end), 'dd MMM yyyy', { locale: id })}`
})

// Open Complaint Modal
const openComplaintModal = (complaintsData, advisorName = null) => {
  if (!complaintsData || !complaintsData.details || complaintsData.details.length === 0) {
    showToast({
      message: 'Tidak ada komplain untuk ditampilkan',
      type: 'info'
    })
    return
  }

  selectedComplaints.value = complaintsData.details || []
  selectedComplaintRate.value = complaintsData.rate || 0
  complaintModalTitle.value = advisorName 
    ? `Komplain - ${advisorName}` 
    : 'Semua Komplain'
  showComplaintModal.value = true
}

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

    const response = await apiClient.post('/web/v2/dashboard/service-advisor', {
      jsonrpc: '2.0',
      method: 'call',
      params
    })

    if (response.data.result?.status === 'success') {
      dashboardData.value = response.data.result.data
      showToast({
        message: 'Data berhasil dimuat',
        type: 'success'
      })
    } else {
      throw new Error(response.data.result?.message || 'Terjadi kesalahan')
    }
  } catch (error) {
    console.error('Error fetching data:', error)
    showToast({
      message: error.message || 'Gagal memuat data dashboard',
      type: 'error',
      duration: 5000
    })
  } finally {
    loading.value = false
  }
}, 500)

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

const refreshData = () => {
  fetchDashboardData()
}

const resetFilters = () => {
  selectedRange.value = 'this_month'
  dateRange.value = { start: null, end: null }
  showDatePicker.value = false
  fetchDashboardData()
  showToast({
    message: 'Filter telah direset',
    type: 'info'
  })
}

onMounted(() => {
  fetchDashboardData()
})
</script>

<style scoped>
/* Custom animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}
</style>