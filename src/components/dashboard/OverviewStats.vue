<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
    <!-- Revenue Card -->
    <div class="bg-white rounded-xl shadow-sm p-4 sm:p-6 hover:shadow-lg transition-all duration-300 relative overflow-hidden group">
      <!-- Background Decoration -->
      <div class="absolute right-0 top-0 w-32 h-32 transform translate-x-16 -translate-y-16 bg-blue-500/5 rounded-full group-hover:scale-110 transition-transform duration-300"></div>
      
      <div class="relative">
        <div class="flex justify-between items-start">
          <!-- Icon -->
          <div class="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-lg shadow-md">
            <BanknotesIcon class="h-6 w-6 text-white" />
          </div>
          <!-- Trend Indicator -->
          <div class="flex items-center bg-blue-50 px-2 py-1 rounded-full text-xs text-blue-700">
            <!-- <ArrowUpIcon class="h-3 w-3 mr-1" />
            12% -->
          </div>
        </div>

        <!-- Content -->
        <div class="mt-4">
          <p class="text-sm font-medium text-gray-600">Total Revenue</p>
          <p class="mt-2 text-2xl font-bold text-gray-900">
            {{ formatCurrency(data?.total_revenue ?? 0) }}
          </p>
          <div class="mt-2 flex items-center text-sm">
            <InboxStackIcon class="h-4 w-4 text-gray-500 mr-1" />
            <span class="text-gray-600">{{ data?.total_orders ?? 0 }} orders</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Rating Card -->
    <div class="bg-white rounded-xl shadow-sm p-4 sm:p-6 hover:shadow-lg transition-all duration-300 relative overflow-hidden group">
      <!-- Background Decoration -->
      <div class="absolute right-0 top-0 w-32 h-32 transform translate-x-16 -translate-y-16 bg-yellow-500/5 rounded-full group-hover:scale-110 transition-transform duration-300"></div>

      <div class="relative">
        <div class="flex justify-between items-start">
          <div class="bg-gradient-to-br from-yellow-400 to-yellow-500 p-3 rounded-lg shadow-md">
            <StarIcon class="h-6 w-6 text-white" />
          </div>
          <div class="flex items-center bg-yellow-50 px-2 py-1 rounded-full text-xs text-yellow-700">
            <!-- <ArrowUpIcon class="h-3 w-3 mr-1" />
            4.2% -->
          </div>
        </div>

        <div class="mt-4">
          <p class="text-sm font-medium text-gray-600">Service Rating</p>
          <div class="mt-2 flex items-center gap-2">
            <span class="text-2xl font-bold text-gray-900">
              {{ formatNumber(data?.rating?.average ?? 0, 1) }}
            </span>
            <div class="flex">
              <StarIcon 
                v-for="i in 5" 
                :key="i"
                class="h-5 w-5"
                :class="[
                  i <= Math.round(data?.rating?.average ?? 0) 
                    ? 'text-yellow-400' 
                    : 'text-gray-200'
                ]"
              />
            </div>
          </div>
          <div class="mt-2 flex items-center text-sm">
            <ExclamationTriangleIcon class="h-4 w-4 text-gray-500 mr-1" />
            <span class="text-gray-600">from {{ data?.rating?.total_rated_orders ?? 0 }} feedbacks</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Performance Card -->
    <!-- <div class="bg-white rounded-xl shadow-sm p-4 sm:p-6 hover:shadow-lg transition-all duration-300 relative overflow-hidden group">
     
      <div class="absolute right-0 top-0 w-32 h-32 transform translate-x-16 -translate-y-16 bg-green-500/5 rounded-full group-hover:scale-110 transition-transform duration-300"></div>

      <div class="relative">
        <div class="flex justify-between items-start">
          <div class="bg-gradient-to-br from-green-500 to-green-600 p-3 rounded-lg shadow-md">
            <ChartBarIcon class="h-6 w-6 text-white" />
          </div>
          <div class="flex items-center bg-green-50 px-2 py-1 rounded-full text-xs text-green-700">
          </div>
        </div>

        <div class="mt-4">
          <p class="text-sm font-medium text-gray-600">Service Performance</p>
          <p class="mt-2 text-2xl font-bold text-gray-900">
            {{ formatPercentage(data?.performance?.duration_accuracy ?? 0) }}
          </p>
          <div class="mt-2 flex items-center justify-between text-xs">
            <div class="flex items-center text-green-600">
              <ArrowUpIcon class="h-3 w-3 mr-1" />
              <span>{{ formatPercentage(data?.performance?.early_completion_rate ?? 0) }}</span>
            </div>
            <div class="flex items-center text-red-600">
              <ArrowDownIcon class="h-3 w-3 mr-1" />
              <span>{{ formatPercentage(data?.performance?.late_completion_rate ?? 0) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div> -->

    <!-- On-time Card -->
    <div class="bg-white rounded-xl shadow-sm p-4 sm:p-6 hover:shadow-lg transition-all duration-300 relative overflow-hidden group">
      <!-- Background Decoration -->
      <div class="absolute right-0 top-0 w-32 h-32 transform translate-x-16 -translate-y-16 bg-purple-500/5 rounded-full group-hover:scale-110 transition-transform duration-300"></div>

      <div class="relative">
        <div class="flex justify-between items-start">
          <div class="bg-gradient-to-br from-purple-500 to-purple-600 p-3 rounded-lg shadow-md">
            <ClockIcon class="h-6 w-6 text-white" />
          </div>
          <div class="flex items-center bg-purple-50 px-2 py-1 rounded-full text-xs text-purple-700">
            <!-- <ArrowUpIcon class="h-3 w-3 mr-1" />
            5.3% -->
          </div>
        </div>

        <div class="mt-4">
          <p class="text-sm font-medium text-gray-600">Tingkat Ketepatan Waktu</p>
          <p class="mt-2 text-2xl font-bold text-gray-900">
            {{ formatPercentage(data?.on_time_rate ?? 0) }}
          </p>
          <div class="mt-3">
            <div class="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                class="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all duration-500"
                :style="{ width: `${data?.on_time_rate ?? 0}%` }"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Utilization Card -->
    <div class="bg-white rounded-xl shadow-sm p-4 sm:p-6 hover:shadow-lg transition-all duration-300 relative overflow-hidden group">
      <!-- Background Decoration -->
      <div class="absolute right-0 top-0 w-32 h-32 transform translate-x-16 -translate-y-16 bg-indigo-500/5 rounded-full group-hover:scale-110 transition-transform duration-300"></div>

      <div class="relative">
        <div class="flex justify-between items-start">
          <div class="bg-gradient-to-br from-indigo-500 to-indigo-600 p-3 rounded-lg shadow-md">
            <UserGroupIcon class="h-6 w-6 text-white" />
          </div>
          <div class="flex items-center bg-indigo-50 px-2 py-1 rounded-full text-xs text-indigo-700">
            <!-- <ArrowUpIcon class="h-3 w-3 mr-1" />
            3.8% -->
          </div>
        </div>

        <div class="mt-4">
          <p class="text-sm font-medium text-gray-600">Labor Utilization</p>
          <p class="mt-2 text-2xl font-bold text-gray-900">
            {{ formatPercentage(data?.utilization?.average_utilization ?? 0) }}
          </p>
          <div class="mt-2 space-y-1.5">
            <div class="flex items-center justify-between text-sm">
              <div class="flex items-center text-gray-600">
                <ClockIcon class="h-4 w-4 mr-1" />
                <span>{{ formatNumber(data?.utilization?.total_productive_hours ?? 0, 1) }}h</span>
              </div>
              <div class="flex items-center text-indigo-600">
                <ChartBarSquareIcon class="h-4 w-4 mr-1" />
                <span>Target {{ formatPercentage(85) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { 
  BanknotesIcon,
  StarIcon,
  ChartBarIcon,
  ClockIcon,
  InboxStackIcon,
  ExclamationTriangleIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  UserGroupIcon, // tambahkan import ini
  ArrowPathIcon, // menggantikan TargetIcon dengan ArrowPathIcon
  ChartBarSquareIcon
} from '@heroicons/vue/24/outline'
import { formatCurrency, formatNumber, formatPercentage } from '@/utils/formatters'

defineProps({
  data: {
    type: Object,
    default: () => ({})
  }
})
</script>