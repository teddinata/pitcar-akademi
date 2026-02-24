<template>
  <div class="h-[360px] w-full">
    <Line
      :data="chartData"
      :options="chartOptions"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement
} from 'chart.js'
import { formatCurrency } from '@/utils/formatters'

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
)

const props = defineProps({
  data: {
    type: Object,
    required: true
  }
})

// Prepare chart data
const chartData = computed(() => {
  if (!props.data?.metrics) return {
    labels: [],
    datasets: []
  }

  const labels = ['Individual', 'Team Average']
  const achievementData = [
    props.data.metrics.revenue.achievement,
    (props.data.team_data.summary.total_revenue / props.data.team_data.summary.target) * 100
  ]
  const revenueData = [
    props.data.metrics.revenue.total,
    props.data.team_data.summary.total_revenue / props.data.team_data.summary.member_count
  ]

  return {
    labels,
    datasets: [
      {
        label: 'Achievement (%)',
        data: achievementData,
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 2,
        type: 'bar',
        yAxisID: 'y',
      },
      {
        label: 'Revenue',
        data: revenueData,
        backgroundColor: 'rgba(16, 185, 129, 0.5)',
        borderColor: 'rgb(16, 185, 129)',
        borderWidth: 2,
        type: 'line',
        yAxisID: 'y1',
        tension: 0.4,
        pointRadius: 6,
        pointHoverRadius: 8
      }
    ]
  }
})

// Chart options
const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'index',
    intersect: false,
  },
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        usePointStyle: true,
        padding: 20
      }
    },
    tooltip: {
      callbacks: {
        label: function(context) {
          let label = context.dataset.label || ''
          if (label) {
            label += ': '
          }
          if (context.datasetIndex === 0) {
            label += Math.round(context.parsed.y) + '%'
          } else {
            label += formatCurrency(context.parsed.y)
          }
          return label
        }
      }
    }
  },
  scales: {
    y: {
      type: 'linear',
      display: true,
      position: 'left',
      title: {
        display: true,
        text: 'Achievement (%)'
      },
      ticks: {
        callback: function(value) {
          return value + '%'
        }
      }
    },
    y1: {
      type: 'linear',
      display: true,
      position: 'right',
      title: {
        display: true,
        text: 'Revenue'
      },
      grid: {
        drawOnChartArea: false
      },
      ticks: {
        callback: function(value) {
          return formatCurrency(value)
        }
      }
    }
  }
}))
</script>