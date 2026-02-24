<!-- src/components/overview/CohortAnalysis.vue -->
<template>
  <div class="cohort-analysis p-6">
    <!-- Header Section -->
    <div class="flex flex-col lg:flex-row lg:items-center justify-between mb-6">
      <div>
        <h3 class="text-xl font-semibold text-gray-900 flex items-center">
          <UsersIcon class="h-6 w-6 text-blue-600 mr-2" />
          Analisis Loyalitas Pelanggan
        </h3>
        <p class="text-sm text-gray-600 mt-1">Pantau tingkat kembalinya pelanggan untuk servis berkala</p>
      </div>
      
      <!-- Controls Container -->
      <div class="flex flex-wrap items-center mt-4 lg:mt-0 gap-3">
        <!-- Interval Type Select -->
        <div class="flex flex-col">
          <label class="text-xs font-medium text-gray-700 mb-1">Interval Servis</label>
          <select 
            v-model="selectedInterval" 
            @change="onIntervalChange"
            class="rounded-lg border-gray-300 py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
          >
            <option value="monthly">Bulanan</option>
            <option value="3_month">3 Bulan (Rutin)</option>
            <option value="6_month">6 Bulan (Berkala)</option>
            <option value="12_month">Tahunan</option>
          </select>
        </div>
        
        <!-- Segmentation Select -->
        <div class="flex flex-col">
          <label class="text-xs font-medium text-gray-700 mb-1">Segmentasi</label>
          <select 
            v-model="selectedSegment" 
            @change="onSegmentChange"
            class="rounded-lg border-gray-300 py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
          >
            <option value="">Tanpa Segmentasi</option>
            <option value="car_brand">Merek Kendaraan</option>
            <option value="service_category">Kategori Servis</option>
            <option value="service_advisor">Service Advisor</option>
            <option value="customer_rating">Rating Pelanggan</option>
          </select>
        </div>
        
        <!-- Depth Select -->
        <div class="flex flex-col">
          <label class="text-xs font-medium text-gray-700 mb-1">Periode</label>
          <select 
            v-model="selectedDepth" 
            @change="onDepthChange"
            class="rounded-lg border-gray-300 py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
          >
            <option :value="4">4 Periode</option>
            <option :value="8">8 Periode</option>
            <option :value="12">12 Periode</option>
          </select>
        </div>
        
        <!-- Advanced Metrics Toggle -->
        <div class="flex flex-col">
          <label class="text-xs font-medium text-gray-700 mb-1">Metrik Lanjutan</label>
          <div class="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-3 py-2">
            <input 
              id="advanced-metrics" 
              v-model="includeMetrics" 
              @change="onMetricsToggle"
              type="checkbox" 
              class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label for="advanced-metrics" class="text-sm text-gray-700 cursor-pointer">Tampilkan</label>
          </div>
        </div>

        <!-- Refresh Button -->
        <div class="flex flex-col">
          <label class="text-xs font-medium text-gray-700 mb-1 opacity-0">Aksi</label>
          <button 
            @click="$emit('refresh')" 
            :disabled="loading"
            class="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            <ArrowPathIcon class="h-4 w-4 mr-2" :class="{ 'animate-spin': loading }" />
            Refresh
          </button>
        </div>
      </div>
    </div>

    <!-- Quick Insights Cards -->
    <div v-if="hasCohortData && !loading" class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-blue-900">Rata-rata Retensi</p>
            <p class="text-2xl font-bold text-blue-600">{{ getAverageRetention() }}%</p>
          </div>
          <ArrowTrendingUpIcon class="h-8 w-8 text-blue-600" />
        </div>
        <p class="text-xs text-blue-600 mt-2">{{ getRetentionInsight() }}</p>
      </div>

      <div class="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-green-900">Kohort Terbaik</p>
            <p class="text-lg font-bold text-green-600">{{ getBestCohort().name }}</p>
          </div>
          <StarIcon class="h-8 w-8 text-green-600" />
        </div>
        <p class="text-xs text-green-600 mt-2">Retensi {{ getBestCohort().rate }}%</p>
      </div>

      <div class="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-purple-900">Total Pelanggan</p>
            <p class="text-2xl font-bold text-purple-600">{{ getTotalCustomers() }}</p>
          </div>
          <UsersIcon class="h-8 w-8 text-purple-600" />
        </div>
        <p class="text-xs text-purple-600 mt-2">Dalam analisis ini</p>
      </div>
    </div>
    
    <!-- Loading state -->
    <div v-if="loading" class="flex justify-center items-center py-16">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
        <p class="text-gray-600">Memuat data analisis kohort...</p>
      </div>
    </div>
    
    <!-- No data state -->
    <div v-else-if="!hasCohortData" class="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-8 text-center border border-gray-200">
      <ChartBarIcon class="h-16 w-16 text-gray-400 mx-auto mb-4" />
      <h4 class="text-lg font-medium text-gray-900 mb-2">Belum Ada Data Kohort</h4>
      <p class="text-gray-600 mb-4">Data kohort belum tersedia untuk periode yang dipilih.</p>
      <button 
        @click="$emit('refresh')" 
        class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
      >
        Muat Data Kohort
      </button>
    </div>
    
    <!-- Segment selector (if data is segmented) -->
    <div v-else-if="isSegmented && segments.length > 0" class="mb-6">
      <div class="flex items-center justify-between mb-3">
        <h4 class="text-sm font-medium text-gray-900">Filter berdasarkan {{ segmentLabel }}:</h4>
        <span class="text-xs text-gray-500">{{ segments.length }} segmen tersedia</span>
      </div>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="segment in segments"
          :key="segment"
          @click="activeSegment = segment"
          class="px-4 py-2 text-sm rounded-lg font-medium transition-all duration-200"
          :class="activeSegment === segment 
            ? 'bg-blue-600 text-white shadow-lg transform scale-105' 
            : 'bg-gray-100 text-gray-800 hover:bg-gray-200 hover:shadow-md'"
        >
          {{ segment }}
        </button>
      </div>
    </div>
    
    <!-- Main Cohort Table -->
    <div v-else class="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <!-- Table Header -->
      <div class="bg-gradient-to-r from-gray-50 to-blue-50 px-6 py-4 border-b border-gray-200">
        <h4 class="text-lg font-medium text-gray-900">Tabel Analisis Loyalitas</h4>
        <p class="text-sm text-gray-600">Persentase pelanggan yang kembali pada setiap periode</p>
      </div>

      <!-- Scrollable Table Container -->
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="sticky left-0 bg-gray-50 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                Periode Kohort
              </th>
              <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Jumlah Pelanggan
              </th>
              <th v-for="month in months" :key="month" class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                {{ formatPeriodHeader(month) }}
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr 
              v-for="(cohort, index) in displayData" 
              :key="cohort.cohort" 
              :class="index % 2 === 0 ? 'bg-white' : 'bg-gray-50'"
              class="hover:bg-blue-50 transition-colors"
            >
              <td class="sticky left-0 bg-inherit px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-r border-gray-200">
                <div class="flex items-center">
                  <CalendarIcon class="h-4 w-4 text-gray-400 mr-2" />
                  {{ cohort.cohort_display }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-center">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {{ formatNumber(cohort.total_customers) }}
                </span>
              </td>
              <td 
                v-for="month in months" 
                :key="`${cohort.cohort}-${month}`" 
                :class="getCellClass(cohort[month])"
                class="px-6 py-4 whitespace-nowrap text-center text-sm font-medium transition-all duration-200 hover:scale-105"
              >
                <div class="flex items-center justify-center">
                  {{ formatPercentage(cohort[month]) }}
                  <ArrowTrendingUpIcon v-if="cohort[month] >= 60" class="h-3 w-3 ml-1 opacity-60" />
                  <ArrowTrendingDownIcon v-else-if="cohort[month] < 30 && cohort[month] > 0" class="h-3 w-3 ml-1 opacity-60" />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Additional Metrics Block -->
      <div v-if="includeMetrics && displayData.length > 0 && hasAdvancedMetrics" class="border-t border-gray-200 bg-gray-50 p-6">
        <h4 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <SparklesIcon class="h-5 w-5 text-purple-600 mr-2" />
          Metrik Lanjutan
        </h4>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <!-- Average Rating -->
          <div class="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <h5 class="text-sm font-medium text-gray-700 mb-3 flex items-center">
              <StarIcon class="h-4 w-4 text-yellow-500 mr-2" />
              Rating Rata-rata
            </h5>
            <div class="space-y-2">
              <div v-for="cohort in displayData.slice(0, 5)" :key="`rating-${cohort.cohort}`" class="flex justify-between items-center">
                <span class="text-xs text-gray-600">{{ cohort.cohort_display }}</span>
                <span class="text-sm font-medium" :class="getRatingColorClass(cohort.avg_rating)">
                  {{ formatRating(cohort.avg_rating) }}
                </span>
              </div>
            </div>
          </div>
          
          <!-- Booking Rate -->
          <div class="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <h5 class="text-sm font-medium text-gray-700 mb-3 flex items-center">
              <CalendarIcon class="h-4 w-4 text-blue-500 mr-2" />
              Tingkat Booking
            </h5>
            <div class="space-y-2">
              <div v-for="cohort in displayData.slice(0, 5)" :key="`booking-${cohort.cohort}`" class="flex justify-between items-center">
                <span class="text-xs text-gray-600">{{ cohort.cohort_display }}</span>
                <span class="text-sm font-medium text-blue-600">
                  {{ formatPercentage(cohort.booking_rate) }}
                </span>
              </div>
            </div>
          </div>
          
          <!-- Feedback Rate -->
          <div class="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <h5 class="text-sm font-medium text-gray-700 mb-3 flex items-center">
              <ChatBubbleLeftRightIcon class="h-4 w-4 text-green-500 mr-2" />
              Tingkat Feedback
            </h5>
            <div class="space-y-2">
              <div v-for="cohort in displayData.slice(0, 5)" :key="`feedback-${cohort.cohort}`" class="flex justify-between items-center">
                <span class="text-xs text-gray-600">{{ cohort.cohort_display }}</span>
                <span class="text-sm font-medium text-green-600">
                  {{ formatPercentage(cohort.feedback_rate) }}
                </span>
              </div>
            </div>
          </div>
          
          <!-- Cars Per Customer -->
          <div class="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <h5 class="text-sm font-medium text-gray-700 mb-3 flex items-center">
              <TruckIcon class="h-4 w-4 text-purple-500 mr-2" />
              Mobil per Pelanggan
            </h5>
            <div class="space-y-2">
              <div v-for="cohort in displayData.slice(0, 5)" :key="`cars-${cohort.cohort}`" class="flex justify-between items-center">
                <span class="text-xs text-gray-600">{{ cohort.cohort_display }}</span>
                <span class="text-sm font-medium text-purple-600">
                  {{ formatNumber(cohort.cars_per_customer, 1) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Legend -->
    <div class="mt-6 bg-white rounded-xl border border-gray-200 p-4">
      <h4 class="text-sm font-medium text-gray-900 mb-3">Panduan Membaca Data</h4>
      <p class="text-sm text-gray-600 mb-4">
        Tingkat retensi pelanggan ditampilkan dalam persentase. Periode awal selalu 100%.
      </p>
      <div class="flex flex-wrap gap-2 mb-4">
        <span class="inline-flex items-center px-3 py-1 rounded-full bg-blue-800 text-white text-xs font-medium">80-100% Sangat Baik</span>
        <span class="inline-flex items-center px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-medium">60-79% Baik</span>
        <span class="inline-flex items-center px-3 py-1 rounded-full bg-blue-400 text-white text-xs font-medium">40-59% Cukup</span>
        <span class="inline-flex items-center px-3 py-1 rounded-full bg-blue-300 text-gray-800 text-xs font-medium">20-39% Perlu Perbaikan</span>
        <span class="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-gray-800 text-xs font-medium">0-19% Rendah</span>
      </div>
    </div>
    
    <!-- Information Panel -->
    <div class="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6">
      <h4 class="text-lg font-medium text-gray-900 mb-3 flex items-center">
        <InformationCircleIcon class="h-5 w-5 text-blue-600 mr-2" />
        Tentang Analisis Loyalitas Pelanggan
      </h4>
      <div class="space-y-4 text-sm text-gray-700">
        <p>
          Analisis ini melacak berapa banyak pelanggan yang kembali untuk servis berdasarkan tanggal servis pertama mereka. 
          Dengan memilih interval yang berbeda, Anda dapat menyesuaikan analisis dengan jadwal servis khas kendaraan.
        </p>
        
        <div v-if="selectedInterval !== 'monthly'" class="bg-white rounded-lg p-4 border border-blue-200">
          <p class="font-medium text-blue-900 mb-2">Interval {{ getIntervalLabel }} saat ini:</p>
          <p class="text-blue-800">
            Pelanggan dianggap "kembali" jika mereka melakukan servis dalam rentang waktu 
            <span class="font-medium">{{ window }}</span> dari tanggal servis yang diharapkan.
          </p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p class="font-medium text-gray-900 mb-2">Rekomendasi Interval:</p>
            <ul class="space-y-1 text-sm">
              <li class="flex items-center"><span class="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>3 bulan: Servis ringan/tune up rutin</li>
              <li class="flex items-center"><span class="w-2 h-2 bg-green-600 rounded-full mr-2"></span>6 bulan: Servis berkala menengah</li>
              <li class="flex items-center"><span class="w-2 h-2 bg-purple-600 rounded-full mr-2"></span>Tahunan: Servis besar/overhaul</li>
            </ul>
          </div>
          
          <div>
            <p class="font-medium text-gray-900 mb-2">Tips Interpretasi:</p>
            <ul class="space-y-1 text-sm">
              <li class="flex items-center"><span class="w-2 h-2 bg-emerald-600 rounded-full mr-2"></span>Retensi >70%: Loyalitas tinggi</li>
              <li class="flex items-center"><span class="w-2 h-2 bg-yellow-600 rounded-full mr-2"></span>Retensi 40-70%: Perlu perhatian</li>
              <li class="flex items-center"><span class="w-2 h-2 bg-red-600 rounded-full mr-2"></span>Retensi <40%: Butuh perbaikan</li>
            </ul>
          </div>
        </div>
        
        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p class="text-yellow-800">
            <strong>Catatan:</strong> Perhitungan mempertimbangkan bahwa satu pelanggan dapat memiliki beberapa kendaraan. 
            Semakin tinggi persentase, semakin baik loyalitas dan kepuasan pelanggan terhadap layanan Anda.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import {
  UsersIcon,
  ChartBarIcon,
  CalendarIcon,
  ArrowPathIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  StarIcon,
  SparklesIcon,
  InformationCircleIcon,
  ChatBubbleLeftRightIcon,
  TruckIcon
} from '@heroicons/vue/24/outline'
import { formatNumber, formatPercentage } from '@/utils/formatters'

const props = defineProps({
  data: {
    type: Object,
    default: () => ({})
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:segment', 'update:depth', 'update:metrics', 'update:interval', 'refresh'])

// State
const selectedSegment = ref('')
const selectedDepth = ref(12)
const includeMetrics = ref(false)
const selectedInterval = ref('3_month')  // Default to 3-month intervals
const activeSegment = ref('')

// Computed properties
const hasCohortData = computed(() => {
  if (!props.data.cohort_analysis) return false
  
  if (props.data.cohort_analysis.segmented) {
    return Object.keys(props.data.cohort_analysis.segments || {}).length > 0
  } else {
    return (props.data.cohort_analysis.cohorts || []).length > 0
  }
})

const isSegmented = computed(() => 
  props.data.cohort_analysis?.segmented || false
)

const segments = computed(() => {
  if (!isSegmented.value || !props.data.cohort_analysis?.segments) return []
  return Object.keys(props.data.cohort_analysis.segments)
})

const segmentLabel = computed(() => {
  const labels = {
    'car_brand': 'Merek Kendaraan',
    'service_category': 'Kategori Servis',
    'service_advisor': 'Service Advisor',
    'customer_rating': 'Rating Pelanggan'
  }
  return labels[props.data.cohort_analysis?.segment_by] || props.data.cohort_analysis?.segment_by || ''
})

const displayData = computed(() => {
  if (!props.data.cohort_analysis) return []
  
  if (isSegmented.value) {
    if (!activeSegment.value && segments.value.length > 0) {
      activeSegment.value = segments.value[0]
    }
    
    if (activeSegment.value && props.data.cohort_analysis.segments?.[activeSegment.value]) {
      return props.data.cohort_analysis.segments[activeSegment.value]
    }
    return []
  } else {
    return props.data.cohort_analysis.cohorts || []
  }
})

const months = computed(() => {
  if (!displayData.value.length) return []
  
  const sampleCohort = displayData.value[0]
  return Object.keys(sampleCohort)
    .filter(key => key.startsWith('month'))
    .sort((a, b) => parseInt(a.replace('month', '')) - parseInt(b.replace('month', '')))
})

const hasAdvancedMetrics = computed(() => {
  if (!displayData.value.length) return false
  return displayData.value[0].avg_rating !== undefined || 
         displayData.value[0].booking_rate !== undefined ||
         displayData.value[0].feedback_rate !== undefined ||
         displayData.value[0].cars_per_customer !== undefined
})

const getIntervalLabel = computed(() => {
  const intervalLabels = {
    'monthly': 'Bulanan',
    '3_month': '3 Bulan',
    '6_month': '6 Bulan',
    '12_month': 'Tahunan'
  }
  return intervalLabels[selectedInterval.value] || 'Kustom'
})

const window = computed(() => {
  const windows = {
    'monthly': '±15 hari',
    '3_month': '±1 bulan',
    '6_month': '±2 bulan',
    '12_month': '±3 bulan'
  }
  return windows[selectedInterval.value] || '±1 bulan'
})

// Analytics Methods
const getAverageRetention = () => {
  if (!displayData.value.length || !months.value.length) return 0
  
  let totalRetention = 0
  let count = 0
  
  displayData.value.forEach(cohort => {
    months.value.forEach(month => {
      if (month !== 'month0' && cohort[month] !== undefined) {
        totalRetention += cohort[month]
        count++
      }
    })
  })
  
  return count > 0 ? (totalRetention / count).toFixed(1) : 0
}

const getRetentionInsight = () => {
  const avgRetention = parseFloat(getAverageRetention())
  
  if (avgRetention >= 70) return 'Loyalitas pelanggan sangat baik'
  if (avgRetention >= 50) return 'Loyalitas pelanggan cukup baik'
  if (avgRetention >= 30) return 'Perlu strategi retensi'
  return 'Memerlukan perbaikan signifikan'
}

const getBestCohort = () => {
  if (!displayData.value.length) return { name: 'N/A', rate: 0 }
  
  let bestCohort = displayData.value[0]
  let bestRate = 0
  
  displayData.value.forEach(cohort => {
    const lastMonth = months.value[months.value.length - 1]
    if (lastMonth && cohort[lastMonth] > bestRate) {
      bestRate = cohort[lastMonth]
      bestCohort = cohort
    }
  })
  
  return {
    name: bestCohort.cohort_display || 'N/A',
    rate: bestRate.toFixed(1)
  }
}

const getTotalCustomers = () => {
  if (!displayData.value.length) return 0
  
  return displayData.value.reduce((total, cohort) => {
    return total + (cohort.total_customers || 0)
  }, 0)
}

// Formatting Methods
const formatRating = (rating) => {
  if (!rating && rating !== 0) return 'N/A'
  return rating.toFixed(1) + '⭐'
}

// Existing Methods
const getCellClass = (value) => {
  if (!value && value !== 0) return 'bg-gray-100 text-gray-500'
  
  if (value >= 80) return 'bg-blue-800 text-white shadow-lg'
  if (value >= 60) return 'bg-blue-600 text-white shadow-md'
  if (value >= 40) return 'bg-blue-400 text-white shadow-sm'
  if (value >= 20) return 'bg-blue-300 text-gray-800'
  return 'bg-blue-100 text-gray-800'
}

const getRatingColorClass = (rating) => {
  if (!rating) return 'text-gray-500'
  
  if (rating >= 4.5) return 'text-green-600'
  if (rating >= 3.5) return 'text-green-500' 
  if (rating >= 2.5) return 'text-yellow-500'
  return 'text-red-500'
}

const formatPeriodHeader = (month) => {
  if (month === 'month0') return 'Awal'
  
  const periodNum = parseInt(month.replace('month', ''))
  
  if (selectedInterval.value === 'monthly') {
    return `Bulan ${periodNum}`
  } else if (selectedInterval.value === '3_month') {
    return `Q${periodNum}`
  } else if (selectedInterval.value === '6_month') {
    return `Semester ${periodNum}`
  } else if (selectedInterval.value === '12_month') {
    return `Tahun ${periodNum}`
  } else {
    return `Periode ${periodNum}`
  }
}

const onSegmentChange = () => {
  emit('update:segment', selectedSegment.value)
}

const onDepthChange = () => {
  emit('update:depth', selectedDepth.value)
}

const onMetricsToggle = () => {
  emit('update:metrics', includeMetrics.value)
}

const onIntervalChange = () => {
  emit('update:interval', selectedInterval.value)
}

// Reset active segment when segment type changes
watch(() => props.data.cohort_analysis?.segment_by, (newValue) => {
  if (newValue !== undefined) {
    activeSegment.value = ''
  }
})
</script>

<style scoped>
/* Smooth transitions untuk semua elemen interaktif */
* {
  transition: all 0.2s ease-in-out;
}

/* Enhanced table styling */
.cohort-table {
  border-collapse: separate;
  border-spacing: 0;
}

/* Sticky header enhancement */
.sticky-header {
  position: sticky;
  top: 0;
  z-index: 10;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Hover effects untuk table rows */
tbody tr:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* Enhanced cell hover effects */
td:hover {
  transform: scale(1.02);
  z-index: 5;
  position: relative;
}

/* Loading animation */
.loading-spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Gradient backgrounds */
.gradient-bg-blue {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%);
}

.gradient-bg-green {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%);
}

.gradient-bg-purple {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(124, 58, 237, 0.1) 100%);
}

/* Enhanced button styles */
.btn-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  box-shadow: 0 4px 14px 0 rgba(59, 130, 246, 0.39);
}

.btn-primary:hover {
  background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
  transform: translateY(-2px);
}

/* Card hover effects */
.insight-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

/* Responsive text scaling */
@media (max-width: 640px) {
  .cohort-title {
    font-size: 1.125rem;
    line-height: 1.75rem;
  }
  
  .cohort-subtitle {
    font-size: 0.875rem;
    line-height: 1.25rem;
  }
  
  .control-container {
    flex-direction: column;
    gap: 0.75rem;
  }
}

/* Enhanced scrollbar */
.overflow-x-auto::-webkit-scrollbar {
  height: 8px;
}

.overflow-x-auto::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 4px;
}

.overflow-x-auto::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

.overflow-x-auto::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Table cell transitions */
.cohort-cell {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.cohort-cell:hover {
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
  border-radius: 4px;
}

/* Enhanced focus states untuk accessibility */
select:focus,
input:focus,
button:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Pulse animation untuk real-time indicators */
.pulse-indicator {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

/* Enhanced segment buttons */
.segment-button {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.segment-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.segment-button.active {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
}

/* Legend styling enhancements */
.legend-item {
  transition: all 0.2s ease-in-out;
}

.legend-item:hover {
  transform: scale(1.1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

/* Advanced metrics cards */
.metric-card {
  transition: all 0.3s ease-in-out;
  border: 1px solid transparent;
}

.metric-card:hover {
  border-color: rgba(59, 130, 246, 0.3);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  transform: translateY(-4px);
}

/* Information panel styling */
.info-panel {
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.9);
}

/* Mobile optimizations */
@media (max-width: 768px) {
  .table-container {
    border-radius: 0.5rem;
    overflow: hidden;
  }
  
  .mobile-stack {
    flex-direction: column;
    gap: 1rem;
  }
  
  .mobile-full-width {
    width: 100%;
  }
}

/* Dark mode support (untuk masa depan) */
@media (prefers-color-scheme: dark) {
  .dark-mode-ready {
    background-color: #1f2937;
    color: #f9fafb;
    border-color: #374151;
  }
}

/* Performance optimizations */
.gpu-accelerated {
  transform: translateZ(0);
  will-change: transform;
}

/* Enhanced animation untuk data refresh */
.data-refresh {
  animation: dataUpdate 0.6s ease-out;
}

@keyframes dataUpdate {
  0% {
    opacity: 0.5;
    transform: scale(0.98);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

/* Cohort value highlights */
.value-excellent {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  color: white;
  font-weight: 600;
}

.value-good {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  font-weight: 600;
}

.value-average {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
  font-weight: 600;
}

.value-poor {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  font-weight: 600;
}

/* Table sticky positioning */
.sticky-left {
  position: sticky;
  left: 0;
  z-index: 5;
}

/* Enhanced tooltip styles */
.tooltip {
  position: relative;
}

.tooltip::after {
  content: attr(data-tooltip);
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s;
}

.tooltip:hover::after {
  opacity: 1;
}

/* Loading state enhancements */
.loading-container {
  background: linear-gradient(45deg, #f8fafc, #e2e8f0);
}

.loading-text {
  animation: fadeInOut 2s infinite;
}

@keyframes fadeInOut {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
</style>