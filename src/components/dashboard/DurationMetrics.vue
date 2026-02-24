<!-- // src/components/dashboard/DurationMetrics.vue -->
<!-- DurationMetrics.vue -->
<template>
  <div class="bg-white rounded-lg shadow-sm p-4 sm:p-6">
    <h3 class="text-lg font-medium text-gray-900 mb-4 sm:mb-6">Duration Performance</h3>
    <div class="space-y-4 sm:space-y-6">
      <!-- Duration Accuracy -->
      <!-- <div>
        <div class="flex justify-between items-center mb-2">
          <span class="text-sm font-medium text-gray-600">Duration Accuracy</span>
          <span class="text-sm font-medium"
            :class="duration >= 0.8 ? 'text-green-600' : 'text-red-600'">
            {{ formatPercentage(duration) }}
          </span>
        </div>
        <div class="relative h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            class="absolute h-2 rounded-full transition-all duration-500"
            :class="duration >= 0.8 ? 'bg-green-500' : 'bg-red-500'"
            :style="{ width: `${duration * 100}%` }"
          ></div>
        </div>
      </div> -->

      <!-- Performance Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div class="bg-green-50 rounded-lg p-3 sm:p-4">
          <p class="text-sm text-gray-600 mb-1">Tingkat Selesai Lebih Cepat</p>
          <p class="text-lg sm:text-xl font-bold text-green-600">
            {{ formatPercentage(data?.performance?.early_completion_rate ?? 0) }}
          </p>
          <p class="text-sm text-gray-500 mt-1">
            {{ data?.performance?.early_completions ?? 0 }} orders
          </p>
        </div>
        <div class="bg-red-50 rounded-lg p-3 sm:p-4">
          <p class="text-sm text-gray-600 mb-1">Tingkat Keterlambatan Selesai</p>
          <p class="text-lg sm:text-xl font-bold text-red-600">
            {{ formatPercentage(data?.performance?.late_completion_rate ?? 0) }}
          </p>
          <p class="text-sm text-gray-500 mt-1">
            {{ data?.performance?.late_completions ?? 0 }} orders
          </p>
        </div>
      </div>

      <!-- Time Distribution -->
      <div class="bg-gray-50 rounded-lg p-3 sm:p-4">
        <h4 class="text-sm font-medium text-gray-900 mb-3">Time Distribution</h4>
        <div class="space-y-2">
          <div class="flex items-center justify-between text-sm">
            <span class="text-gray-600">Tingkat Mulai Lebih Awal</span>
            <span class="text-green-600">
              {{ formatPercentage(data?.performance?.early_start_rate ?? 0) }}
            </span>
          </div>
          <div class="flex items-center justify-between text-sm">
            <span class="text-gray-600">Tingkat Ketepatan Waktu</span>
            <span class="text-blue-600">
              {{ formatPercentage(data?.performance?.ontime_start_rate ?? 0) }}
            </span>
          </div>
          <div class="flex items-center justify-between text-sm">
            <span class="text-gray-600">Tingkat Keterlambatan Mulai</span>
            <span class="text-red-600">
              {{ formatPercentage(data?.performance?.late_start_rate ?? 0) }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { formatPercentage } from '@/utils/formatters'

const props = defineProps({
  data: {
    type: Object,
    default: () => ({})
  }
})

const duration = computed(() => props.data?.performance?.duration_accuracy ?? 0)
</script>