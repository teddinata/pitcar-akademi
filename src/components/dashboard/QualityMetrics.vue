<!-- // src/components/dashboard/QualityMetrics.vue -->
<!-- QualityMetrics.vue -->
<template>
  <div class="bg-white rounded-lg shadow-sm p-4 sm:p-6">
    <h3 class="text-lg font-medium text-gray-900 mb-4 sm:mb-6">Quality Metrics</h3>
    <div class="space-y-4 sm:space-y-6">
      <!-- Rating Overview -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <span class="text-sm font-medium text-gray-600">Overall Rating</span>
        <div class="flex items-center">
          <div class="flex items-center mr-2">
            <StarIcon
              v-for="i in 5"
              :key="i"
              class="h-4 w-4 sm:h-5 sm:w-5"
              :class="[i <= Math.round(data?.average_rating ?? 0) ? 'text-yellow-400' : 'text-gray-300']"
            />
          </div>
          <span class="text-base sm:text-lg font-bold">
            {{ formatNumber(data?.average_rating ?? 0, 1) }}
          </span>
        </div>
      </div>

      <!-- Complaints Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div class="bg-white rounded-lg border p-3 sm:p-4">
          <p class="text-sm text-gray-600 mb-1">Total Complaints</p>
          <p class="text-lg sm:text-xl font-bold">{{ data?.complaints?.total ?? 0 }}</p>
        </div>
        <div class="bg-white rounded-lg border p-3 sm:p-4">
          <p class="text-sm text-gray-600 mb-1">Complaint Rate</p>
          <p class="text-lg sm:text-xl font-bold">
            {{ formatPercentage(data?.complaints?.rate ?? 0) }}
          </p>
        </div>
      </div>

      <!-- Performance Metrics -->
      <div class="space-y-3 sm:space-y-4">
        <!-- Duration Progress -->
        <div>
          <div class="flex justify-between text-sm mb-1">
            <span class="text-gray-600">Duration Accuracy</span>
            <span :class="data?.performance?.duration_accuracy >= 0.8 ? 'text-green-600' : 'text-red-600'">
              {{ formatPercentage(data?.performance?.duration_accuracy ?? 0) }}
            </span>
          </div>
          <div class="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              class="h-2 rounded-full transition-all duration-500"
              :class="data?.performance?.duration_accuracy >= 0.8 ? 'bg-green-500' : 'bg-red-500'"
              :style="{ width: `${(data?.performance?.duration_accuracy ?? 0) * 100}%` }"
            ></div>
          </div>
        </div>

        <!-- Completion Rates -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <div class="flex justify-between text-sm mb-1">
              <span class="text-gray-600">Early Completion</span>
              <span class="text-green-600">
                {{ formatPercentage(data?.performance?.early_completion_rate ?? 0) }}
              </span>
            </div>
          </div>
          <div>
            <div class="flex justify-between text-sm mb-1">
              <span class="text-gray-600">Late Completion</span>
              <span class="text-red-600">
                {{ formatPercentage(data?.performance?.late_completion_rate ?? 0) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { StarIcon } from '@heroicons/vue/24/outline'
import { formatNumber, formatPercentage } from '@/utils/formatters'

defineProps({
  data: {
    type: Object,
    default: () => ({})
  }
})
</script>