<!-- // src/components/dashboard/MechanicTrendChart.vue -->
<template>
  <div>
    <div class="flex space-x-3 mb-6">
      <button 
        v-for="metric in metrics" 
        :key="metric.value"
        @click="selectedMetric = metric.value"
        :class="[
          'px-3 py-1 text-sm rounded-full',
          selectedMetric === metric.value 
            ? 'bg-blue-100 text-blue-700' 
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        ]"
      >
        {{ metric.label }}
      </button>
    </div>

    <div class="h-72">
      <Line :data="chartData" :options="chartOptions" />
    </div>

    <!-- Summary Stats -->
    <div class="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100">
      <div v-for="stat in summaryStats" :key="stat.label">
        <p class="text-sm text-gray-500">{{ stat.label }}</p>
        <p class="text-lg font-semibold mt-1">{{ stat.value }}</p>
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
  }
})

const metrics = [
  { label: 'Revenue', value: 'revenue' },
  { label: 'Orders', value: 'orders' },
  { label: 'Rating', value: 'rating' },
  { label: 'On-time Rate', value: 'on_time_rate' }
]

const selectedMetric = ref('revenue')

const chartData = computed(() => ({
  labels: props.data.map(item => new Date(item.date).toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  })),
  datasets: [{
    label: metrics.find(m => m.value === selectedMetric.value)?.label,
    data: props.data.map(item => item.metrics[selectedMetric.value]),
    borderColor: '#2563eb',
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    fill: true,
    tension: 0.4
  }]
}))

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      callbacks: {
        label: (context) => {
          const value = context.parsed.y
          switch (selectedMetric.value) {
            case 'revenue':
              return formatCurrency(value)
            case 'rating':
              return formatNumber(value, 1)
            case 'on_time_rate':
              return formatPercentage(value)
            default:
              return value
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
          switch (selectedMetric.value) {
            case 'revenue':
              return formatCurrency(value, 0)
            case 'rating':
              return formatNumber(value, 1)
            case 'on_time_rate':
              return formatPercentage(value)
            default:
              return value
          }
        }
      }
    }
  }
}))

const summaryStats = computed(() => {
  if (!props.data.length) return []
  
  const values = props.data.map(item => item.metrics[selectedMetric.value])
  const total = values.reduce((sum, val) => sum + val, 0)
  const avg = total / values.length
  const max = Math.max(...values)
  const min = Math.min(...values)

  return [
    {
      label: 'Average',
      value: formatMetricValue(avg)
    },
    {
      label: 'Highest',
      value: formatMetricValue(max)
    },
    {
      label: 'Lowest',
      value: formatMetricValue(min)
    },
    {
      label: 'Total',
      value: formatMetricValue(total)
    }
  ]
})

const formatMetricValue = (value) => {
  switch (selectedMetric.value) {
    case 'revenue':
      return formatCurrency(value)
    case 'rating':
      return formatNumber(value, 1)
    case 'on_time_rate':
      return formatPercentage(value)
    default:
      return value
  }
}
</script>