<!-- src/components/overview/RevenueTrendChart.vue -->
<template>
  <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
    <!-- Bagian Header -->
    <div class="flex flex-col lg:flex-row lg:items-center justify-between mb-6 space-y-4 lg:space-y-0">
      <div>
        <h3 class="text-xl font-semibold text-gray-900">Tren Kinerja</h3>
        <p class="text-sm text-gray-600 mt-1">Analitik komprehensif di semua metrik</p>
      </div>
      
      <!-- Pemilih Jenis Grafik -->
      <div class="flex items-center space-x-2">
        <div class="bg-gray-100 p-1 rounded-xl">
          <button
            v-for="chart in chartTypes"
            :key="chart.value"
            @click="activeChart = chart.value"
            :class="[
              'px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200',
              activeChart === chart.value
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            ]"
          >
            <component :is="chart.icon" class="h-4 w-4 mr-2 inline" />
            {{ chart.label }}
          </button>
        </div>
      </div>
    </div>

    <!-- Kontainer Grafik -->
    <div class="relative">
      <!-- Overlay Loading -->
      <div v-if="loading" class="absolute inset-0 bg-white/80 flex items-center justify-center z-10 rounded-lg">
        <div class="flex items-center space-x-3">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span class="text-gray-600">Memuat data grafik...</span>
        </div>
      </div>
      
      <!-- Grafik -->
      <div class="h-[300px] sm:h-[350px] lg:h-[400px]">
        <Line 
          v-if="data.length && !loading" 
          :data="chartData" 
          :options="chartOptions" 
        />
        <div 
          v-else-if="!loading" 
          class="h-full flex items-center justify-center bg-gray-50 rounded-lg"
        >
          <div class="text-center">
            <ChartBarIcon class="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p class="text-gray-500">Tidak ada data grafik tersedia</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Statistik Ringkasan yang Ditingkatkan -->
    <div class="mt-6 pt-6 border-t border-gray-100">
      <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
        <!-- Statistik Utama -->
        <div 
          v-for="stat in summaryStats" 
          :key="stat.label"
          class="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 hover:shadow-sm transition-shadow"
        >
          <div class="flex items-center justify-between mb-2">
            <component :is="stat.icon" class="h-5 w-5 text-gray-600" />
            <span :class="stat.trendClass" class="text-xs font-medium">
              {{ stat.trend }}
            </span>
          </div>
          <p class="text-xs text-gray-600 mb-1">{{ stat.label }}</p>
          <p class="text-lg font-bold text-gray-900 truncate">{{ stat.value }}</p>
          <p class="text-xs text-gray-500">{{ stat.comparison }}</p>
        </div>

        <!-- Metrik yang Ditingkatkan -->
        <div 
          v-for="metric in enhancedStats" 
          :key="metric.label"
          class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 hover:shadow-sm transition-shadow"
        >
          <div class="flex items-center justify-between mb-2">
            <component :is="metric.icon" class="h-5 w-5 text-blue-600" />
            <span :class="metric.trendClass" class="text-xs font-medium">
              {{ metric.trend }}
            </span>
          </div>
          <p class="text-xs text-blue-600 mb-1">{{ metric.label }}</p>
          <p class="text-lg font-bold text-gray-900 truncate">{{ metric.value }}</p>
          <p class="text-xs text-blue-500">{{ metric.comparison }}</p>
        </div>
      </div>
    </div>

    <!-- Legenda Grafik & Wawasan -->
    <div class="mt-6 pt-6 border-t border-gray-100">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Legenda -->
        <div>
          <h4 class="text-sm font-medium text-gray-900 mb-3">Informasi Grafik</h4>
          <div class="space-y-2">
            <div class="flex items-center text-sm">
              <div class="w-3 h-3 bg-blue-600 rounded-full mr-3"></div>
              <span class="text-gray-600">
                {{ getChartLabelIndonesian() }}
              </span>
            </div>
            <div class="flex items-center text-sm">
              <div class="w-3 h-3 bg-gray-300 rounded-full mr-3"></div>
              <span class="text-gray-600">Periode: {{ formatDateRange }}</span>
            </div>
          </div>
        </div>

        <!-- Wawasan -->
        <div>
          <h4 class="text-sm font-medium text-gray-900 mb-3">Wawasan Utama</h4>
          <div class="space-y-2 text-sm text-gray-600">
            <div class="flex items-start">
              <CheckCircleIcon class="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
              <span>{{ getInsightTextIndonesian() }}</span>
            </div>
            <div class="flex items-start">
              <InformationCircleIcon class="h-4 w-4 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
              <span>Data diperbarui secara real-time dari sistem Anda</span>
            </div>
            <div class="flex items-start">
              <SparklesIcon class="h-4 w-4 text-purple-500 mt-0.5 mr-2 flex-shrink-0" />
              <span>{{ getPerformanceRecommendation() }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- AI-Powered Analytics Section -->
    <div class="mt-6 pt-6 border-t border-gray-100">
      <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
        <div class="flex items-center justify-between mb-3">
          <h4 class="text-sm font-semibold text-blue-900 flex items-center">
            <SparklesIcon class="h-4 w-4 text-blue-600 mr-2" />
            Analisis Cerdas
          </h4>
          <span class="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded-full">
            {{ getAnalysisStatus() }}
          </span>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div class="space-y-2">
            <div class="flex justify-between">
              <span class="text-blue-700">Status Tren:</span>
              <span class="font-medium text-blue-900">{{ getTrendStatus() }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-blue-700">Volatilitas:</span>
              <span class="font-medium text-blue-900">{{ getVolatilityStatus() }}</span>
            </div>
          </div>
          
          <div class="space-y-2">
            <div class="flex justify-between">
              <span class="text-blue-700">Prediksi:</span>
              <span class="font-medium text-blue-900">{{ getPredictionStatus() }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-blue-700">Aksi:</span>
              <span class="font-medium text-blue-900">{{ getActionRecommendation() }}</span>
            </div>
          </div>
        </div>
        
        <p class="text-xs text-blue-600 mt-3 italic">
          {{ getDetailedInsight() }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Line } from 'vue-chartjs'
import { Chart as ChartJS, registerables } from 'chart.js'
import { format } from 'date-fns'
import { 
  CurrencyDollarIcon,
  ShoppingBagIcon,
  ClockIcon,
  ChartBarIcon,
  UserGroupIcon,
  WrenchScrewdriverIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  SparklesIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  PlusIcon,
  MinusIcon
} from '@heroicons/vue/24/outline'
import { formatCurrency, formatNumber, formatPercentage } from '@/utils/formatters'

ChartJS.register(...registerables)

const props = defineProps({
  data: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const chartTypes = [
  { label: 'Pendapatan', value: 'revenue', icon: CurrencyDollarIcon },
  { label: 'Pesanan', value: 'orders', icon: ShoppingBagIcon },
  { label: 'Flat Rate', value: 'flat_rate_hours', icon: WrenchScrewdriverIcon },
  { label: 'Waktu Tunggu', value: 'avg_lead_time', icon: ClockIcon },
  { label: 'Keanggotaan', value: 'membership_activity', icon: UserGroupIcon }
]

const activeChart = ref('revenue')

// Fungsi format mata uang kompak
const formatCompactCurrency = (value) => {
  if (value >= 1e9) {
    return `Rp ${(value / 1e9).toFixed(1)}M`
  } else if (value >= 1e6) {
    return `Rp ${(value / 1e6).toFixed(1)}Jt`
  } else if (value >= 1e3) {
    return `Rp ${(value / 1e3).toFixed(0)}Rb`
  }
  return formatCurrency(value, 0)
}

const chartData = computed(() => {
  if (!props.data.length) return { labels: [], datasets: [] }

  return {
    labels: props.data.map(item => 
      format(new Date(item.date), 'dd MMM')
    ),
    datasets: [
      {
        label: getChartLabel(),
        data: props.data.map(item => getChartValue(item)),
        borderColor: getChartColor(),
        backgroundColor: getChartGradient(),
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: '#ffffff',
        pointBorderColor: getChartColor(),
        pointBorderWidth: 2
      }
    ]
  }
})

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    intersect: false,
    mode: 'index'
  },
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      titleColor: '#ffffff',
      bodyColor: '#ffffff',
      borderColor: getChartColor(),
      borderWidth: 1,
      cornerRadius: 8,
      callbacks: {
        label: (context) => {
          const value = context.parsed.y
          return getTooltipLabel(value)
        }
      }
    }
  },
  scales: {
    x: {
      grid: {
        display: false
      },
      border: {
        display: false
      }
    },
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(0, 0, 0, 0.05)'
      },
      border: {
        display: false
      },
      ticks: {
        callback: (value) => getYAxisLabel(value)
      }
    }
  }
}))

const summaryStats = computed(() => {
  if (!props.data.length) return []

  const values = props.data.map(item => getChartValue(item))
  const total = values.reduce((sum, val) => sum + val, 0)
  const avg = total / values.length
  const max = Math.max(...values)
  const min = Math.min(...values)

  // Hitung tren
  const firstHalf = values.slice(0, Math.floor(values.length / 2))
  const secondHalf = values.slice(Math.floor(values.length / 2))
  const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length
  const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length
  const trend = secondAvg - firstAvg

  return [
    {
      label: 'Total',
      value: formatStatValue(total),
      comparison: 'Total periode',
      icon: PlusIcon,
      trend: formatPercentage((total / (avg * values.length)) * 100 - 100),
      trendClass: 'text-blue-600'
    },
    {
      label: 'Rata-rata',
      value: formatStatValue(avg),
      comparison: 'Per hari',
      icon: ChartBarIcon,
      trend: trend >= 0 ? '+' + formatStatValue(trend) : formatStatValue(trend),
      trendClass: trend >= 0 ? 'text-green-600' : 'text-red-600'
    },
    {
      label: 'Puncak',
      value: formatStatValue(max),
      comparison: 'Hari terbaik',
      icon: ArrowTrendingUpIcon,
      trend: formatPercentage((max / avg) * 100 - 100),
      trendClass: 'text-green-600'
    },
    {
      label: 'Terendah',
      value: formatStatValue(min),
      comparison: 'Hari terendah',
      icon: ArrowTrendingDownIcon,
      trend: formatPercentage((min / avg) * 100 - 100),
      trendClass: 'text-red-600'
    }
  ]
})

const enhancedStats = computed(() => {
  if (!props.data.length) return []
  
  // Hitung metrik yang ditingkatkan dari struktur data baru
  const flatRateTotal = props.data.reduce((sum, item) => sum + (item.flat_rate_hours || 0), 0)
  const leadTimeAvg = props.data.reduce((sum, item) => sum + (item.avg_lead_time || 0), 0) / props.data.length
  const membershipTotal = props.data.reduce((sum, item) => sum + (item.membership_activity || 0), 0)

  return [
    {
      label: 'Jam Flat Rate',
      value: formatNumber(flatRateTotal, 1) + 'j',
      comparison: 'Total jam',
      icon: WrenchScrewdriverIcon,
      trend: '+' + formatNumber(flatRateTotal / props.data.length, 1) + 'j',
      trendClass: 'text-blue-600'
    },
    {
      label: 'Rata-rata Waktu Tunggu',
      value: formatNumber(leadTimeAvg, 1) + 'j',
      comparison: 'Per layanan',
      icon: ClockIcon,
      trend: leadTimeAvg <= 3 ? 'Baik' : 'Tinggi',
      trendClass: leadTimeAvg <= 3 ? 'text-green-600' : 'text-orange-600'
    }
  ]
})

const formatDateRange = computed(() => {
  if (!props.data.length) return 'Tidak ada data'
  const start = new Date(props.data[0].date)
  const end = new Date(props.data[props.data.length - 1].date)
  return `${format(start, 'dd MMM')} - ${format(end, 'dd MMM')}`
})

// Fungsi helper
const getChartLabel = () => {
  const labels = {
    revenue: 'Pendapatan Harian',
    orders: 'Pesanan Harian', 
    flat_rate_hours: 'Jam Flat Rate',
    avg_lead_time: 'Rata-rata Waktu Tunggu (jam)',
    membership_activity: 'Aktivitas Keanggotaan'
  }
  return labels[activeChart.value] || 'Nilai'
}

const getChartLabelIndonesian = () => {
  const labels = {
    revenue: 'Pendapatan Harian',
    orders: 'Pesanan Harian',
    flat_rate_hours: 'Jam Flat Rate',
    avg_lead_time: 'Rata-rata Waktu Tunggu (jam)',
    membership_activity: 'Aktivitas Keanggotaan'
  }
  return labels[activeChart.value] || 'Nilai'
}

const getChartValue = (item) => {
  return item[activeChart.value] || 0
}

const getChartColor = () => {
  const colors = {
    revenue: '#3b82f6',
    orders: '#10b981',
    flat_rate_hours: '#f59e0b',
    avg_lead_time: '#ef4444',
    membership_activity: '#8b5cf6'
  }
  return colors[activeChart.value] || '#3b82f6'
}

const getChartGradient = () => {
  const gradients = {
    revenue: 'rgba(59, 130, 246, 0.1)',
    orders: 'rgba(16, 185, 129, 0.1)',
    flat_rate_hours: 'rgba(245, 158, 11, 0.1)',
    avg_lead_time: 'rgba(239, 68, 68, 0.1)',
    membership_activity: 'rgba(139, 92, 246, 0.1)'
  }
  return gradients[activeChart.value] || 'rgba(59, 130, 246, 0.1)'
}

const getTooltipLabel = (value) => {
  switch (activeChart.value) {
    case 'revenue':
      return formatCompactCurrency(value)
    case 'orders':
      return `${value} pesanan`
    case 'flat_rate_hours':
      return `${value} jam`
    case 'avg_lead_time':
      return `${value.toFixed(1)} jam`
    case 'membership_activity':
      return `${value} aktivitas`
    default:
      return value.toString()
  }
}

const getYAxisLabel = (value) => {
  switch (activeChart.value) {
    case 'revenue':
      return formatCompactCurrency(value)
    case 'flat_rate_hours':
    case 'avg_lead_time':
      return `${value}j`
    default:
      return value
  }
}

const formatStatValue = (value) => {
  switch (activeChart.value) {
    case 'revenue':
      return formatCompactCurrency(value)
    case 'orders':
      return formatNumber(value)
    case 'flat_rate_hours':
    case 'avg_lead_time':
      return formatNumber(value, 1) + 'j'
    case 'membership_activity':
      return formatNumber(value) + ' aktivitas'
    default:
      return formatNumber(value)
  }
}

const getInsightTextIndonesian = () => {
  if (!props.data.length) return 'Tidak ada data tersedia untuk analisis'
  
  const values = props.data.map(item => getChartValue(item))
  const trend = values[values.length - 1] - values[0]
  const isIncreasing = trend > 0
  
  const insights = {
    revenue: isIncreasing ? 'Pendapatan menunjukkan tren naik periode ini' : 'Pendapatan menunjukkan fluktuasi periode ini',
    orders: isIncreasing ? 'Volume pesanan berkembang dengan stabil' : 'Volume pesanan menunjukkan kinerja beragam',
    flat_rate_hours: 'Jam flat rate menunjukkan kompleksitas dan efisiensi layanan',
    avg_lead_time: 'Kinerja waktu tunggu mempengaruhi kepuasan pelanggan',
    membership_activity: 'Keterlibatan program loyalitas sedang dipantau'
  }
  
  return insights[activeChart.value] || 'Data sedang dianalisis untuk mendapatkan wawasan'
}

// Fungsi AI Analytics yang baru
const getAnalysisStatus = () => {
  const values = props.data.map(item => getChartValue(item))
  if (values.length < 3) return 'Terbatas'
  
  const variance = getVariance(values)
  const trend = getTrendDirection()
  
  if (variance < 0.1 && trend !== 'Stabil') return 'Optimal'
  if (variance < 0.3) return 'Baik'
  if (variance < 0.6) return 'Moderat'
  return 'Volatil'
}

const getTrendStatus = () => {
  return getTrendDirection()
}

const getTrendDirection = () => {
  if (!props.data.length) return 'Tidak Ada Data'
  
  const values = props.data.map(item => getChartValue(item))
  if (values.length < 2) return 'Stabil'
  
  const firstHalf = values.slice(0, Math.floor(values.length / 2))
  const secondHalf = values.slice(Math.floor(values.length / 2))
  
  const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length
  const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length
  
  const change = ((secondAvg - firstAvg) / firstAvg) * 100
  
  if (change > 10) return 'Naik Kuat'
  if (change > 3) return 'Naik'
  if (change > -3) return 'Stabil'
  if (change > -10) return 'Turun'
  return 'Turun Tajam'
}

const getVariance = (values) => {
  const avg = values.reduce((a, b) => a + b, 0) / values.length
  const variance = values.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / values.length
  return variance / (avg * avg) // Coefficient of variation
}

const getVolatilityStatus = () => {
  const values = props.data.map(item => getChartValue(item))
  const variance = getVariance(values)
  
  if (variance < 0.1) return 'Rendah'
  if (variance < 0.3) return 'Sedang'
  if (variance < 0.6) return 'Tinggi'
  return 'Sangat Tinggi'
}

const getPredictionStatus = () => {
  const trend = getTrendDirection()
  const volatility = getVolatilityStatus()
  
  if (trend === 'Naik Kuat' && volatility === 'Rendah') return 'Sangat Positif'
  if (trend === 'Naik' && ['Rendah', 'Sedang'].includes(volatility)) return 'Positif'
  if (trend === 'Stabil') return 'Stabil'
  if (trend === 'Turun' && volatility === 'Rendah') return 'Perlu Perhatian'
  return 'Butuh Tindakan'
}

const getActionRecommendation = () => {
  const prediction = getPredictionStatus()
  
  const actions = {
    'Sangat Positif': 'Pertahankan',
    'Positif': 'Optimisasi',
    'Stabil': 'Monitor',
    'Perlu Perhatian': 'Evaluasi',
    'Butuh Tindakan': 'Intervensi'
  }
  
  return actions[prediction] || 'Monitor'
}

const getPerformanceRecommendation = () => {
  const trend = getTrendDirection()
  const chart = activeChart.value
  
  const recommendations = {
    revenue: {
      'Naik Kuat': 'Manfaatkan momentum dengan ekspansi layanan',
      'Naik': 'Tingkatkan strategi pemasaran untuk mempertahankan pertumbuhan',
      'Stabil': 'Cari peluang diversifikasi untuk mendorong pertumbuhan',
      'Turun': 'Evaluasi strategi penetapan harga dan kepuasan pelanggan',
      'Turun Tajam': 'Lakukan review komprehensif model bisnis'
    },
    orders: {
      'Naik Kuat': 'Pastikan kapasitas operasional mencukupi',
      'Naik': 'Optimalkan proses untuk menangani volume yang meningkat',
      'Stabil': 'Fokus pada peningkatan nilai rata-rata pesanan',
      'Turun': 'Intensifkan upaya akuisisi pelanggan',
      'Turun Tajam': 'Review strategi pemasaran dan layanan pelanggan'
    },
    flat_rate_hours: {
      'Naik Kuat': 'Evaluasi kompleksitas layanan dan efisiensi',
      'Naik': 'Monitor beban kerja tim dan alokasi sumber daya',
      'Stabil': 'Pertahankan standar operasional saat ini',
      'Turun': 'Analisis apakah efisiensi meningkat atau permintaan menurun',
      'Turun Tajam': 'Pastikan tidak ada penurunan kualitas layanan'
    },
    avg_lead_time: {
      'Naik Kuat': 'Segera optimalkan proses untuk mengurangi waktu tunggu',
      'Naik': 'Identifikasi bottleneck dalam alur kerja',
      'Stabil': 'Pertahankan standar waktu tunggu saat ini',
      'Turun': 'Dokumentasikan best practice yang diterapkan',
      'Turun Tajam': 'Pastikan kualitas tidak terkompromikan demi kecepatan'
    },
    membership_activity: {
      'Naik Kuat': 'Kembangkan program loyalitas lebih lanjut',
      'Naik': 'Tingkatkan engagement dengan member aktif',
      'Stabil': 'Cari cara untuk meningkatkan partisipasi',
      'Turun': 'Review dan perbaharui program keanggotaan',
      'Turun Tajam': 'Evaluasi ulang strategi program loyalitas'
    }
  }
  
  return recommendations[chart]?.[trend] || 'Lanjutkan monitoring untuk mendapatkan wawasan lebih lanjut'
}

const getDetailedInsight = () => {
  const values = props.data.map(item => getChartValue(item))
  if (values.length < 7) return 'Butuh lebih banyak data untuk analisis mendalam'
  
  const weeklyAvgs = []
  for (let i = 0; i < values.length; i += 7) {
    const week = values.slice(i, i + 7)
    weeklyAvgs.push(week.reduce((a, b) => a + b, 0) / week.length)
  }
  
  if (weeklyAvgs.length < 2) return 'Analisis mingguan belum tersedia'
  
  const weeklyGrowth = ((weeklyAvgs[weeklyAvgs.length - 1] - weeklyAvgs[0]) / weeklyAvgs[0]) * 100
  
  if (Math.abs(weeklyGrowth) < 5) {
    return 'Kinerja menunjukkan konsistensi yang baik dengan fluktuasi minimal antar minggu'
  } else if (weeklyGrowth > 0) {
    return `Tren positif dengan pertumbuhan rata-rata ${weeklyGrowth.toFixed(1)}% per minggu`
  } else {
    return `Perlu perhatian: penurunan rata-rata ${Math.abs(weeklyGrowth).toFixed(1)}% per minggu`
  }
}
</script>

<style scoped>
/* Animasi untuk grafik yang smooth */
.chart-container {
  transition: all 0.3s ease-in-out;
}

/* Efek hover yang enhanced */
.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px -5px rgba(0, 0, 0, 0.1);
}

/* Animasi loading yang halus */
.loading-spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Gradien yang smooth untuk background */
.gradient-bg {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(99, 102, 241, 0.05) 100%);
}

/* Efek pulse untuk indikator real-time */
.pulse-indicator {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* Transisi smooth untuk semua elemen interaktif */
* {
  transition: all 0.2s ease-in-out;
}

/* Styling untuk chart buttons */
.chart-selector button {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.chart-selector button:hover {
  transform: translateY(-1px);
}

/* Enhanced shadow untuk cards */
.summary-card {
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
}

.summary-card:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

/* Responsive text scaling */
@media (max-width: 640px) {
  .chart-title {
    font-size: 1.125rem;
    line-height: 1.75rem;
  }
  
  .chart-subtitle {
    font-size: 0.875rem;
    line-height: 1.25rem;
  }
}

/* Custom scrollbar untuk area yang dapat di-scroll */
.scrollable::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}

.scrollable::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 2px;
}

.scrollable::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 2px;
}

.scrollable::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Animasi untuk insight cards */
.insight-card {
  animation: slideInUp 0.5s ease-out;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Efek glassmorphism untuk AI analytics section */
.ai-analytics {
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* Enhanced focus states untuk accessibility */
button:focus,
.chart-selector button:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Smooth color transitions */
.trend-positive {
  color: #10b981;
  transition: color 0.3s ease;
}

.trend-negative {
  color: #ef4444;
  transition: color 0.3s ease;
}

.trend-neutral {
  color: #6b7280;
  transition: color 0.3s ease;
}

/* Loading state styling */
.loading-overlay {
  backdrop-filter: blur(4px);
  background: rgba(255, 255, 255, 0.8);
}

/* Chart container responsive sizing */
.chart-responsive {
  min-height: 300px;
  max-height: 500px;
}

@media (min-width: 1024px) {
  .chart-responsive {
    min-height: 400px;
  }
}

/* Enhanced typography */
.metric-title {
  font-weight: 600;
  letter-spacing: -0.025em;
}

.metric-value {
  font-weight: 700;
  letter-spacing: -0.05em;
}

/* Status indicators */
.status-optimal {
  color: #10b981;
  background-color: rgba(16, 185, 129, 0.1);
}

.status-good {
  color: #3b82f6;
  background-color: rgba(59, 130, 246, 0.1);
}

.status-moderate {
  color: #f59e0b;
  background-color: rgba(245, 158, 11, 0.1);
}

.status-poor {
  color: #ef4444;
  background-color: rgba(239, 68, 68, 0.1);
}

/* Micro-interactions */
.interactive-element:hover {
  transform: scale(1.02);
}

.interactive-element:active {
  transform: scale(0.98);
}

/* Grid layout enhancements */
.stats-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
}

@media (min-width: 640px) {
  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }
}

/* Enhanced border radius untuk modern look */
.modern-card {
  border-radius: 1rem;
  overflow: hidden;
}

/* Subtle animation untuk data updates */
.data-update {
  animation: dataRefresh 0.5s ease-in-out;
}

@keyframes dataRefresh {
  0% {
    opacity: 0.7;
    transform: scale(0.98);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

/* Improved spacing untuk mobile */
@media (max-width: 640px) {
  .mobile-spacing {
    padding: 1rem;
    gap: 0.75rem;
  }
}

/* Performance optimizations */
.gpu-accelerated {
  transform: translateZ(0);
  will-change: transform;
}

/* Dark mode support (jika diperlukan di masa depan) */
@media (prefers-color-scheme: dark) {
  .dark-mode-ready {
    background-color: #1f2937;
    color: #f9fafb;
  }
}
</style>