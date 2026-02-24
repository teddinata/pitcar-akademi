<!-- // src/components/dashboard/RevenueTrends.vue -->
<!-- RevenueTrends.vue -->
<template>
  <div class="bg-white rounded-xl shadow-sm p-4 sm:p-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h3 class="text-lg font-medium text-gray-900">Revenue Trends</h3>
        <p class="text-sm text-gray-500 mt-1">Daily performance overview</p>
      </div>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="metric in availableMetrics"
          :key="metric.value"
          @click="selectedMetric = metric.value"
          :class="[
            'px-3 py-1 text-sm rounded-full whitespace-nowrap',
            selectedMetric === metric.value
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          ]"
        >
          {{ metric.label }}
        </button>
      </div>
    </div>

    <!-- Chart Area with Responsive Height -->
    <div class="h-[250px] sm:h-[300px] lg:h-[400px]">
      <Line :data="chartData" :options="chartOptions" />
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t">
      <div v-for="stat in currentStats" :key="stat.label" class="text-center sm:text-left">
        <p class="text-sm text-gray-600">{{ stat.label }}</p>
        <p class="text-base sm:text-lg font-semibold mt-1 truncate">{{ stat.value }}</p>
        <p class="text-xs text-gray-500 mt-0.5">vs. previous period</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Line } from 'vue-chartjs'
import { Chart as ChartJS, registerables } from 'chart.js'
import { formatCurrency, formatNumber, formatPercentage } from '@/utils/formatters'

ChartJS.register(...registerables)

const props = defineProps({
  data: {
    type: Array,
    default: () => []
  },
  showOnTimeMetric: {
    type: Boolean,
    default: false
  }
})

const baseMetrics = [
  { label: 'Revenue', value: 'revenue' },
  { label: 'Orders', value: 'orders' },
  { label: 'Rating', value: 'rating' }
]

const onTimeMetric = { label: 'Tepat Waktu', value: 'on_time_rate' }

const availableMetrics = computed(() => {
  return props.showOnTimeMetric ? [...baseMetrics, onTimeMetric] : baseMetrics
})

const selectedMetric = ref('revenue')

const chartData = computed(() => {
  const labels = props.data.map(item => item.date)
  const datasets = [{
    label: selectedMetric.value.charAt(0).toUpperCase() + selectedMetric.value.slice(1),
    data: props.data.map(item => item.metrics[selectedMetric.value]),
    borderColor: '#2563eb',
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    fill: true,
    tension: 0.4
  }]
  
  return { labels, datasets }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      callbacks: {
        label: (context) => {
          const value = context.raw
          switch (selectedMetric.value) {
            case 'revenue':
              return formatCurrency(value)
            case 'on_time_rate':
              return formatNumber(value, 1) + '%'
            default:
              return formatNumber(value, 1)
          }
        }
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: (value) => {
          if (selectedMetric.value === 'revenue') {
            return formatCurrency(value, 0)
          }
          return value
        }
      }
    }
  }
}
</script>