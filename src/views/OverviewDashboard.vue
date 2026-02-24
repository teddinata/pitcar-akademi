<!-- src/views/OverviewDashboard.vue -->
<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
    <Toast
      v-model:show="toast.show"
      :message="toast.message"
      :type="toast.type"
      :duration="toast.duration"
    />
    
    <!-- Header yang Ditingkatkan -->
    <div class="bg-white/80 backdrop-blur-lg border-b border-slate-200/60 sticky top-0 z-40">
      <div class="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
          <!-- Bagian Judul yang Ditingkatkan -->
          <div class="flex items-center space-x-4">
            <div class="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
              <ChartBarIcon class="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 class="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Intelijen Bisnis
              </h1>
              <p class="text-sm text-gray-600 mt-1">Analitik & wawasan real-time</p>
            </div>
          </div>
          
          <!-- Kontrol yang Ditingkatkan -->
          <div class="flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-3">
            <!-- Pemilih Rentang Tanggal -->
            <div class="relative">
              <select
                v-model="selectedRange"
                @change="handleDateRangeChange"
                class="appearance-none bg-white border border-slate-200 rounded-xl py-3 pl-4 pr-12 text-sm font-medium text-gray-700 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="today">Hari Ini</option>
                <option value="yesterday">Kemarin</option>
                <option value="this_week">Minggu Ini</option>
                <option value="this_month">Bulan Ini</option>
                <option value="this_year">Tahun Ini</option>
                <option value="all_time">Semua Waktu</option>
                <option value="specific_month">Bulan Tertentu</option>
                <option value="custom">Rentang Khusus</option>
              </select>
              <ChevronDownIcon class="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>

            <!-- Pemilih Bulan/Tahun -->
            <div v-if="selectedRange === 'specific_month'" class="flex space-x-2">
              <select
                v-model="specificMonth.month"
                @change="handleSpecificMonthChange"
                class="appearance-none bg-white border border-slate-200 rounded-xl py-3 pl-4 pr-10 text-sm font-medium text-gray-700 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option v-for="(monthName, index) in monthNames" :key="index" :value="index + 1">
                  {{ monthName }}
                </option>
              </select>
              <select
                v-model="specificMonth.year"
                @change="handleSpecificMonthChange"
                class="appearance-none bg-white border border-slate-200 rounded-xl py-3 pl-4 pr-10 text-sm font-medium text-gray-700 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option v-for="year in availableYears" :key="year" :value="year">
                  {{ year }}
                </option>
              </select>
            </div>

            <!-- Pemilih Tanggal Khusus dengan Portal -->
            <div v-if="showDatePicker" class="relative z-50">
              <DateRangePicker
                v-model="dateRange"
                @update:modelValue="handleCustomDateChange"
                @close="showDatePicker = false"
                class="w-full sm:w-auto"
              />
            </div>

            <!-- Tampilan Tanggal -->
            <div class="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 px-4 py-3 rounded-xl flex items-center space-x-3">
              <CalendarDaysIcon class="h-5 w-5 text-blue-600" />
              <span class="text-sm font-medium text-blue-900">
                {{ getFormattedDateRange }}
              </span>
            </div>

            <!-- Tombol Aksi -->
            <div class="flex space-x-2">
              <button
                @click="refreshData"
                :disabled="loading"
                class="inline-flex items-center px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowPathIcon 
                  class="h-4 w-4 mr-2" 
                  :class="{ 'animate-spin': loading }" 
                />
                Refresh
              </button>
              <button
                @click="resetFilters"
                class="inline-flex items-center px-4 py-3 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-xl border border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md transition-all duration-200"
              >
                <BackspaceIcon class="h-4 w-4 mr-2" />
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Konten Utama -->
    <main class="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="space-y-8">
        <!-- Metrik Utama - Ditingkatkan dengan Kartu Pendapatan yang Dapat Dibalik -->
        <div class="relative">
          <KeyMetrics 
            :data="dashboardData.metrics" 
            :loading="loading" 
          />
        </div>

        <!-- Grid Grafik -->
        <div class="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <!-- Grafik Pendapatan Utama - Mengambil 2 kolom -->
          <div class="xl:col-span-2">
            <RevenueTrendChart 
              :data="dashboardData.trends" 
              :loading="loading" 
            />
          </div>
        </div>

        <!-- Analisis Kohort yang Ditingkatkan -->
        <div class="bg-white rounded-2xl shadow-sm border border-slate-200">
          <CohortAnalysis 
            :data="dashboardData" 
            :loading="loading"
            @update:segment="updateCohortSegment"
            @update:depth="updateCohortDepth"
            @update:metrics="updateCohortMetrics"
            @update:interval="updateCohortInterval"
            @refresh="fetchCohortData"
          />
        </div>

        <!-- Grid Produk & Analitik -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- Produk Teratas yang Ditingkatkan -->
          <div class="bg-white rounded-2xl shadow-sm border border-slate-200">
            <TopProducts :data="dashboardData" :loading="loading" />
          </div>

          <div class="bg-white rounded-2xl shadow-sm border border-slate-200">
            <TeamPerformance 
              :advisors="dashboardData?.advisors || []"
              :mechanics="dashboardData?.mechanics || []"
              :loading="loading" 
            />
          </div>
        </div>

        <!-- Bagian Bawah -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- Pelanggan Teratas yang Ditingkatkan -->
          <div class="bg-white rounded-2xl shadow-sm border border-slate-200">
            <TopCustomers 
              :data="dashboardData.top_data?.customers || []" 
              :loading="loading" 
            />
          </div>

          <!-- Ringkasan Intelijen Bisnis -->
          <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div class="flex items-center justify-between mb-6">
              <div>
                <h3 class="text-lg font-semibold text-gray-900">Intelijen Bisnis</h3>
                <p class="text-sm text-gray-600">Wawasan cerdas & rekomendasi</p>
              </div>
              <div class="bg-gradient-to-br from-blue-100 to-purple-100 p-3 rounded-xl">
                <ChartBarIcon class="h-6 w-6 text-blue-600" />
              </div>
            </div>

            <div class="space-y-4">
              <!-- Wawasan Pendapatan -->
              <div class="p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-200">
                <h4 class="text-sm font-semibold text-emerald-900 mb-2">Analisis Pendapatan</h4>
                <div class="space-y-2 text-sm text-emerald-800">
                  <div class="flex justify-between">
                    <span>Akuntansi vs Pendapatan Penjualan:</span>
                    <span class="font-medium">
                      {{ getRevenueComparisonIndonesian() }}
                    </span>
                  </div>
                  <p class="text-xs text-emerald-600">
                    {{ getRevenueInsightIndonesian() }}
                  </p>
                </div>
              </div>

              <!-- Wawasan Layanan -->
              <div class="p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-200">
                <h4 class="text-sm font-semibold text-orange-900 mb-2">Efisiensi Layanan</h4>
                <div class="space-y-2 text-sm text-orange-800">
                  <div class="flex justify-between">
                    <span>Kinerja Waktu Tunggu:</span>
                    <span class="font-medium">
                      {{ getLeadTimeStatusIndonesian() }}
                    </span>
                  </div>
                  <p class="text-xs text-orange-600">
                    {{ getServiceInsightIndonesian() }}
                  </p>
                </div>
              </div>

              <!-- Wawasan Pelanggan -->
              <div class="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200">
                <h4 class="text-sm font-semibold text-purple-900 mb-2">Analisis Pelanggan</h4>
                <div class="space-y-2 text-sm text-purple-800">
                  <div class="flex justify-between">
                    <span>Distribusi Keanggotaan:</span>
                    <span class="font-medium">
                      {{ getMembershipDistributionIndonesian() }}
                    </span>
                  </div>
                  <p class="text-xs text-purple-600">
                    {{ getMembershipInsightIndonesian() }}
                  </p>
                </div>
              </div>

              <!-- Rekomendasi -->
              <div class="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                <h4 class="text-sm font-semibold text-blue-900 mb-2">Rekomendasi</h4>
                <div class="space-y-1 text-xs text-blue-700">
                  <div v-for="recommendation in getRecommendationsIndonesian()" :key="recommendation" class="flex items-start">
                    <span class="text-blue-500 mr-2">•</span>
                    <span>{{ recommendation }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, h, computed, onMounted } from 'vue'
import { debounce } from 'lodash'
import { 
  CalendarDaysIcon, 
  ArrowPathIcon,  
  BackspaceIcon,
  ChartBarIcon,
  ChevronDownIcon,
  ClockIcon,
  UserGroupIcon,
  ArrowTrendingDownIcon,
  ArrowTrendingUpIcon
} from '@heroicons/vue/24/outline'
import { format, sub } from 'date-fns'
import apiClient from '@/config/api'
import { formatNumber, formatCurrency, formatPercentage } from '@/utils/formatters'

// Komponen
import DateRangePicker from '@/components/DateRangePicker.vue'
import KeyMetrics from '@/components/overview/KeyMetrics.vue'
import RevenueTrendChart from '@/components/overview/RevenueTrendChart.vue'
import TopProducts from '@/components/overview/TopProducts.vue'
import TopCustomers from '@/components/overview/TopCustomers.vue'
import TeamPerformance from '@/components/overview/TeamPerformance.vue'
import CohortAnalysis from '@/components/overview/CohortAnalysis.vue'

import Toast from '@/components/Toast.vue'
import { useToast } from '@/composables/useToast'

const { toast, showToast } = useToast()

// State
const loading = ref(false)
const selectedRange = ref('this_month')
const showDatePicker = ref(false)
const dateRange = ref({ start: null, end: null })

// State analisis kohort
const cohortParams = ref({
  depth: 12,
  segment_by: '',
  include_metrics: false,
  interval_type: '3_month'
})

// State pemilihan bulan
const specificMonth = ref({
  month: new Date().getMonth() + 1,
  year: new Date().getFullYear()
})

const monthNames = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]

const availableYears = computed(() => {
  const currentYear = new Date().getFullYear()
  return Array.from({length: 7}, (_, i) => currentYear - 5 + i)
})

// Struktur data dashboard yang ditingkatkan
const dashboardData = ref({
  metrics: {
    quotations: { current: 0, previous: 0, growth: 0 },
    orders: { current: 0, previous: 0, growth: 0 },
    sales_revenue: { current: 0, previous: 0, growth: 0 },
    average_order: { current: 0, previous: 0, growth: 0 },
    accounting_revenue: { current: 0, previous: 0, growth: 0, account_breakdown: {} },
    lead_time: { 
      current: { avg_lead_time: 0, on_time_rate: 0, completed_orders: 0, overnight_orders: 0, avg_service_time: 0, avg_overall_time: 0 },
      previous: {},
      growth: {}
    },
    membership: { 
      total_members: 0,
      level_distribution: {},
      current: {},
      previous: {},
      growth: {}
    },
    flat_rate: {
      current_hours: 0,
      previous_hours: 0,
      growth: 0
    }
  },
  trends: [],
  cohort_analysis: {
    segmented: false,
    interval_type: '3_month',
    cohorts: []
  },
  top_data: {
    products: { services: [], physical: [] },
    sales: [],
    customers: [],
    categories: [],
    advisors: [],
    mechanics: []
  }
})

// Properti computed
const getFormattedDateRange = computed(() => {
  if (!dashboardData.value.date_range) return ''
  
  const { type, start, end } = dashboardData.value.date_range
  
  if (selectedRange.value === 'specific_month') {
    return `${monthNames[specificMonth.value.month - 1]} ${specificMonth.value.year}`
  }
  
  switch (type) {
    case 'today':
      return `Hari Ini, ${format(new Date(start), 'dd MMM yyyy')}`
    case 'yesterday':
      return `Kemarin, ${format(sub(new Date(start), { days: 1 }), 'dd MMM yyyy')}`
    case 'this_week':
      return `Minggu Ini, ${format(new Date(start), 'dd MMM')} - ${format(new Date(end), 'dd MMM yyyy')}`
    case 'this_month':
      return `Bulan Ini, ${format(new Date(start), 'MMMM yyyy')}`
    case 'this_year':
      return `Tahun ${format(new Date(start), 'yyyy')}`
    case 'all_time':
      return `Semua Waktu, hingga ${format(new Date(end), 'dd MMM yyyy')}`
    case 'custom':
      return `${format(new Date(start), 'dd MMM yyyy')} - ${format(new Date(end), 'dd MMM yyyy')}`
    default:
      return `${format(new Date(start), 'dd MMM yyyy')} - ${format(new Date(end), 'dd MMM yyyy')}`
  }
})

const getRevenueInsightIndonesian = () => {
  const revenueGrowth = dashboardData.value.metrics.sales_revenue?.growth || 0
  const orderGrowth = dashboardData.value.metrics.orders?.growth || 0
  
  const avgGrowth = (revenueGrowth + orderGrowth) / 2
  
  if (avgGrowth > 10) return 'Pertumbuhan Kuat'
  if (avgGrowth > 5) return 'Pertumbuhan Stabil'
  if (avgGrowth > 0) return 'Pertumbuhan Moderat'
  if (avgGrowth > -5) return 'Stabil'
  return 'Menurun'
}

// Metode Intelijen Bisnis dalam Bahasa Indonesia
const getEfficiencyScore = () => {
  const onTimeRate = dashboardData.value.metrics.lead_time?.current?.on_time_rate || 0
  const avgLeadTime = dashboardData.value.metrics.lead_time?.current?.avg_lead_time || 0
  
  // Hitung efisiensi berdasarkan tingkat tepat waktu dan kinerja waktu tunggu
  const timeScore = Math.max(0, 100 - (avgLeadTime - 1) * 20) // Penalti untuk waktu tunggu > 1 jam
  const efficiency = Math.round((onTimeRate + timeScore) / 2)
  
  return Math.min(100, Math.max(0, efficiency))
}

const getGrowthTrendIndonesian = () => {
  const revenueGrowth = dashboardData.value.metrics.sales_revenue?.growth || 0
  const orderGrowth = dashboardData.value.metrics.orders?.growth || 0
  
  const avgGrowth = (revenueGrowth + orderGrowth) / 2
  
  if (avgGrowth > 10) return 'Pertumbuhan Kuat'
  if (avgGrowth > 5) return 'Pertumbuhan Stabil'
  if (avgGrowth > 0) return 'Pertumbuhan Moderat'
  if (avgGrowth > -5) return 'Stabil'
  return 'Menurun'
}

const getRevenueComparisonIndonesian = () => {
  const salesRevenue = dashboardData.value.metrics.sales_revenue?.current || 0
  const accountingRevenue = dashboardData.value.metrics.accounting_revenue?.current || 0
  
  if (accountingRevenue > salesRevenue) {
    const diff = ((accountingRevenue - salesRevenue) / salesRevenue * 100).toFixed(1)
    return `+${diff}% Lebih Tinggi`
  } else if (salesRevenue > accountingRevenue) {
    const diff = ((salesRevenue - accountingRevenue) / accountingRevenue * 100).toFixed(1)
    return `-${diff}% Lebih Rendah`
  }
  return 'Selaras'
}

const getLeadTimeStatusIndonesian = () => {
  const avgLeadTime = dashboardData.value.metrics.lead_time?.current?.avg_lead_time || 0
  const onTimeRate = dashboardData.value.metrics.lead_time?.current?.on_time_rate || 0
  
  if (avgLeadTime <= 2 && onTimeRate >= 80) return 'Sangat Baik'
  if (avgLeadTime <= 3 && onTimeRate >= 70) return 'Baik'
  if (avgLeadTime <= 4 && onTimeRate >= 60) return 'Rata-rata'
  return 'Perlu Perbaikan'
}

const getServiceInsightIndonesian = () => {
  const avgLeadTime = dashboardData.value.metrics.lead_time?.current?.avg_lead_time || 0
  const overnightRate = dashboardData.value.metrics.lead_time?.current?.overnight_rate || 0
  
  if (avgLeadTime > 4) {
    return `Waktu tunggu ${avgLeadTime.toFixed(1)} jam melebihi target - pertimbangkan optimisasi alur kerja`
  } else if (overnightRate > 10) {
    return `${overnightRate.toFixed(1)}% pekerjaan menginap - tinjau efisiensi penjadwalan`
  } else {
    return 'Kinerja layanan berada dalam parameter yang dapat diterima'
  }
}

const getMembershipDistributionIndonesian = () => {
  const distribution = dashboardData.value.metrics.membership?.level_distribution
  if (!distribution) return 'Tidak Ada Data'
  
  const total = Object.values(distribution).reduce((sum, level) => sum + level.count, 0)
  const premiumCount = (distribution.gold?.count || 0) + (distribution.platinum?.count || 0)
  const premiumRate = (premiumCount / total * 100).toFixed(1)
  
  return `${premiumRate}% Premium`
}

const getMembershipInsightIndonesian = () => {
  const distribution = dashboardData.value.metrics.membership?.level_distribution
  if (!distribution) return 'Data keanggotaan tidak tersedia'
  
  const bronzeRate = distribution.bronze?.percentage || 0
  
  if (bronzeRate > 95) {
    return 'Konsentrasi tinggi di tingkat perunggu - pertimbangkan peningkatan program loyalitas'
  } else if (bronzeRate > 90) {
    return 'Sebagian besar anggota di tingkat perunggu - peluang untuk kemajuan tingkat'
  } else {
    return 'Distribusi tingkat keanggotaan yang baik di semua level'
  }
}

const getRecommendationsIndonesian = () => {
  const recommendations = []
  const metrics = dashboardData.value.metrics
  
  // Rekomendasi pendapatan
  const revenueGrowth = metrics.sales_revenue?.growth || 0
  if (revenueGrowth < 0) {
    recommendations.push('Fokus pada strategi pemulihan pendapatan dan retensi pelanggan')
  }
  
  // Rekomendasi waktu tunggu
  const avgLeadTime = metrics.lead_time?.current?.avg_lead_time || 0
  if (avgLeadTime > 3) {
    recommendations.push('Optimisasi alur kerja layanan untuk mengurangi waktu tunggu')
  }
  
  // Rekomendasi keanggotaan
  const bronzeRate = metrics.membership?.level_distribution?.bronze?.percentage || 0
  if (bronzeRate > 95) {
    recommendations.push('Terapkan insentif upgrade tingkat untuk anggota perunggu')
  }
  
  // Rekomendasi efisiensi
  const onTimeRate = metrics.lead_time?.current?.on_time_rate || 0
  if (onTimeRate < 70) {
    recommendations.push('Tinjau proses penjadwalan untuk meningkatkan pengiriman tepat waktu')
  }
  
  if (recommendations.length === 0) {
    recommendations.push('Lanjutkan memantau metrik utama untuk peluang optimisasi')
  }
  
  return recommendations
}

const getLevelNameIndonesian = (level) => {
  const names = {
    bronze: 'Perunggu',
    silver: 'Perak',
    gold: 'Emas',
    platinum: 'Platinum'
  }
  return names[level] || level
}

// Metode
const handleDateRangeChange = () => {
  if (selectedRange.value === 'custom') {
    showDatePicker.value = true
  } else if (selectedRange.value === 'specific_month') {
    showDatePicker.value = false
    handleSpecificMonthChange()
  } else {
    showDatePicker.value = false
    fetchDashboardData()
  }
}

const handleSpecificMonthChange = () => {
  const year = specificMonth.value.year
  const month = specificMonth.value.month
  const startDate = new Date(year, month - 1, 1)
  const endDate = new Date(year, month, 0)

  dateRange.value = {
    start: format(startDate, 'yyyy-MM-dd'),
    end: format(endDate, 'yyyy-MM-dd')
  }

  fetchDashboardData()
}

const handleCustomDateChange = () => {
  if (dateRange.value.start && dateRange.value.end) {
    showDatePicker.value = false
    fetchDashboardData()
  }
}

const fetchDashboardData = debounce(async () => {
  try {
    loading.value = true
    const params = {
      jsonrpc: '2.0',
      method: 'call',
      params: {
        date_range: selectedRange.value === 'specific_month' ? 'custom' : selectedRange.value,
        cohort: {
          depth: cohortParams.value.depth,
          segment_by: cohortParams.value.segment_by || undefined,
          include_metrics: cohortParams.value.include_metrics,
          interval_type: cohortParams.value.interval_type
        }
      }
    }

    if (selectedRange.value === 'custom' || selectedRange.value === 'specific_month') {
      params.params.start_date = dateRange.value.start
      params.params.end_date = dateRange.value.end
    }

    console.log('Mengambil data dashboard yang ditingkatkan:', JSON.stringify(params))
    const response = await apiClient.post('/web/v3/statistics/overview', params)
    
    if (response.data.result?.data) {
      dashboardData.value = response.data.result.data
      
      if (selectedRange.value === 'specific_month' && dashboardData.value.date_range) {
        dashboardData.value.date_range.type = 'specific_month'
      }
      
      showToast({
        message: `Data dashboard yang ditingkatkan berhasil dimuat`,
        type: 'success'
      })
    }
  } catch (error) {
    console.error('Error mengambil data dashboard yang ditingkatkan:', error)
    showToast({
      message: error.message || 'Gagal memuat data dashboard',
      type: 'error',
      duration: 5000
    })
  } finally {
    loading.value = false
  }
}, 500)

const fetchCohortData = async () => {
  try {
    loading.value = true
    const params = {
      jsonrpc: '2.0',
      method: 'call',
      params: {
        date_range: selectedRange.value === 'specific_month' ? 'custom' : selectedRange.value,
        cohort: {
          depth: cohortParams.value.depth,
          segment_by: cohortParams.value.segment_by || undefined,
          include_metrics: cohortParams.value.include_metrics,
          interval_type: cohortParams.value.interval_type
        }
      }
    }

    if (selectedRange.value === 'custom' || selectedRange.value === 'specific_month') {
      params.params.start_date = dateRange.value.start
      params.params.end_date = dateRange.value.end
    }

    const response = await apiClient.post('/web/v3/statistics/overview', params)
    if (response.data.result?.data?.cohort_analysis) {
      dashboardData.value.cohort_analysis = response.data.result.data.cohort_analysis
      showToast({
        message: 'Analisis kohort diperbarui',
        type: 'success'
      })
    }
  } catch (error) {
    console.error('Error mengambil data kohort:', error)
    showToast({
      message: error.message || 'Gagal memuat data kohort',
      type: 'error',
      duration: 5000
    })
  } finally {
    loading.value = false
  }
}

// Metode update kohort
const updateCohortSegment = (segment) => {
  cohortParams.value.segment_by = segment
  fetchCohortData()
}

const updateCohortDepth = (depth) => {
  cohortParams.value.depth = depth
  fetchCohortData()
}

const updateCohortMetrics = (includeMetrics) => {
  cohortParams.value.include_metrics = includeMetrics
  fetchCohortData()
}

const updateCohortInterval = (interval) => {
  cohortParams.value.interval_type = interval
  fetchCohortData()
}

const resetFilters = () => {
  selectedRange.value = 'this_month'
  dateRange.value = { start: null, end: null }
  showDatePicker.value = false
  
  specificMonth.value = {
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  }
  
  cohortParams.value = {
    depth: 12,
    segment_by: '',
    include_metrics: false,
    interval_type: '3_month'
  }
  
  fetchDashboardData()
  showToast({
    message: 'Filter direset ke default',
    type: 'info'
  })
}

const refreshData = () => {
  fetchDashboardData()
}

const getLevelEmoji = (level) => {
  const emojis = {
    bronze: '🥉',
    silver: '🥈', 
    gold: '🥇',
    platinum: '💎'
  }
  return emojis[level] || '👤'
}

// Komponen GrowthIndicator untuk digunakan dalam template
const GrowthIndicator = {
  props: {
    growth: Number,
    size: {
      type: String,
      default: 'md'
    }
  },
  setup(props) {
    const sizeClasses = {
      sm: 'text-xs',
      md: 'text-sm'
    }
    
    const iconSizeClasses = {
      sm: 'h-3 w-3',
      md: 'h-4 w-4'
    }

    return () => {
      const growth = props.growth || 0
      const isPositive = growth >= 0
      
      return h('div', {
        class: `flex items-center ${sizeClasses[props.size]}`
      }, [
        h(isPositive ? ArrowTrendingUpIcon : ArrowTrendingDownIcon, {
          class: `${iconSizeClasses[props.size]} mr-1 ${isPositive ? 'text-emerald-500' : 'text-red-500'}`
        }),
        h('span', {
          class: `font-medium ${isPositive ? 'text-emerald-600' : 'text-red-600'}`
        }, formatPercentage(growth)),
        h('span', {
          class: 'text-gray-500 ml-1'
        }, props.size === 'sm' ? '' : 'vs sebelumnya')
      ])
    }
  }
}

onMounted(() => {
  fetchDashboardData()
})
</script>

<style scoped>
/* Animasi loading yang halus */
.loading-shimmer {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

/* Transisi halus untuk semua elemen interaktif */
* {
  transition: all 0.2s ease-in-out;
}

/* Efek hover untuk better UX */
.metric-summary:hover {
  background-color: rgba(0, 0, 0, 0.02);
}

/* Peningkatan aksesibilitas */
.insight-card:focus-within {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

button:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Animasi untuk kartu yang muncul */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Responsif untuk mobile */
@media (max-width: 640px) {
  .grid-responsive {
    grid-template-columns: 1fr;
  }
}

/* Peningkatan visual untuk status loading */
.loading-indicator {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Peningkatan tipografi untuk readability */
.text-readable {
  line-height: 1.6;
  letter-spacing: 0.025em;
}

/* Efek glassmorphism untuk header */
.glass-header {
  backdrop-filter: blur(20px);
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* Animasi hover untuk kartu */
.card-hover:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

/* Peningkatan visual untuk gradient text */
.gradient-text {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Animasi untuk elemen yang sedang dimuat */
.pulse-loading {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* Peningkatan spacing untuk layout yang lebih baik */
.spacing-optimal {
  margin: 1.5rem 0;
  padding: 1rem;
}

/* Efek bayangan yang konsisten */
.shadow-consistent {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.shadow-consistent:hover {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}
</style>