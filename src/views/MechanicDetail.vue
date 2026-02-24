<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow">
      <div class="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <button 
              @click="backToDashboard" 
              class="text-gray-500 hover:text-gray-700"
            >
              <ArrowLeftIcon class="h-5 w-5" />
            </button>
            <div>
              <h1 class="text-2xl font-semibold text-gray-900">{{ mechanicData.mechanic?.name }}</h1>
              <div class="flex items-center mt-1 text-sm text-gray-600">
                <span>{{ mechanicData.mechanic?.position }}</span>
                <span class="mx-2">•</span>
                <span class="flex items-center">
                  Leader: 
                  <span class="ml-1 font-medium">{{ mechanicData.mechanic?.leader?.name || '-' }}</span>
                </span>
                <!-- Navigation buttons -->
                <div class="flex items-center ml-4 space-x-2">
                  <button 
                    v-if="mechanicData.navigation?.previous"
                    @click="navigateToMechanic(mechanicData.navigation.previous.id)"
                    class="text-gray-500 hover:text-gray-700"
                  >
                    <ChevronLeftIcon class="h-5 w-5" />
                  </button>
                  <button 
                    v-if="mechanicData.navigation?.next"
                    @click="navigateToMechanic(mechanicData.navigation.next.id)"
                    class="text-gray-500 hover:text-gray-700"
                  >
                    <ChevronRightIcon class="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Date Range Filter -->
          <div class="flex items-center space-x-4">
            
            <select
              v-model="selectedRange"
              @change="handleDateRangeChange"
              class="rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="this_week">This Week</option>
              <option value="this_month">This Month</option>
              <option value="this_year">This Year</option>
              <option value="custom">Custom Date</option>
            </select>

            <!-- Custom Date Range Inputs -->
            <div v-if="selectedRange === 'custom'" class="flex items-center space-x-2">
              <input
                type="date"
                v-model="dateRange.start"
                @change="handleDateRangeChange"
                class="rounded-md border-gray-300 py-2 px-3 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <span class="text-gray-500">to</span>
              <input
                type="date"
                v-model="dateRange.end"
                @change="handleDateRangeChange"
                class="rounded-md border-gray-300 py-2 px-3 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div class="text-sm text-gray-500">
              <!-- {{ formatDateRange(mechanicData.date_range?.start, mechanicData.date_range?.end) }} -->
                {{ formattedDateRange }}
            </div>

            <button 
              @click="refreshData"
              class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <ArrowPathIcon class="h-4 w-4 mr-2" :class="{ 'animate-spin': loading }" />
              Refresh
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <main class="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="grid grid-cols-1 gap-8">
        <!-- Overview Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
          <!-- Revenue Card -->
          <div class="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
            <div class="flex justify-between items-start">
              <div>
                <p class="text-sm font-medium text-gray-600">Total Revenue</p>
                <p class="mt-2 text-2xl font-bold text-gray-900">
                  {{ formatCurrency(mechanicData.metrics?.revenue.total) }}
                </p>
                <p class="mt-2 text-sm text-gray-500">
                  Target: {{ formatCurrency(mechanicData.metrics?.revenue.target) }}
                </p>
              </div>
              <div class="bg-blue-50 rounded-full p-3 flex items-center justify-center w-12 h-12">
                <CurrencyDollarIcon class="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div class="mt-4">
              <div class="flex justify-between text-sm mb-1">
                <span>Achievement</span>
                <span>{{ formatPercentage(mechanicData.metrics?.revenue.achievement) }}</span>
              </div>
              <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  class="h-2 bg-blue-600 rounded-full transition-all duration-500"
                  :style="{ width: `${Math.min((mechanicData.metrics?.revenue.achievement || 0), 100)}%` }"
                ></div>
              </div>
            </div>
          </div>

          <!-- Orders Card -->
          <div class="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
            <div class="flex justify-between items-start">
              <div>
                <p class="text-sm font-medium text-gray-600">Total Orders</p>
                <p class="mt-2 text-2xl font-bold text-gray-900">
                  {{ mechanicData.metrics?.orders.total }}
                </p>
                <div class="mt-2 flex items-center text-sm">
                  <CurrencyDollarIcon class="h-4 w-4 text-gray-500 mr-1" />
                  <span class="text-gray-600">
                    Avg: {{ formatCurrency(mechanicData.metrics?.orders.average_value) }}
                  </span>
                </div>
              </div>
              <div class="bg-green-50 rounded-full p-3 flex items-center justify-center w-12 h-12">
                <InboxStackIcon class="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <!-- Rating Card -->
          <div class="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
            <div class="flex justify-between items-start">
              <div>
                <p class="text-sm font-medium text-gray-600">Performance Rating</p>
                <div class="mt-2 flex items-center">
                  <p class="text-2xl font-bold text-gray-900 mr-2">
                    {{ formatNumber(mechanicData.metrics?.performance.rating, 1) }}
                  </p>
                  <div class="flex">
                    <StarIcon 
                      v-for="i in 5" 
                      :key="i"
                      :class="[
                        'h-4 w-4',
                        i <= Math.round(mechanicData.metrics?.performance.rating || 0)
                          ? 'text-yellow-400'
                          : 'text-gray-200'
                      ]"
                    />
                  </div>
                </div>
                <div class="mt-2 flex items-center text-sm">
                  <InboxStackIcon class="h-4 w-4 text-gray-500 mr-1" />
                  <span class="text-gray-600">{{ mechanicData.metrics?.orders.total }} orders</span>
                </div>
              </div>
              <div class="bg-yellow-50 rounded-full p-3 flex items-center justify-center w-12 h-12">
                <StarIcon class="h-6 w-6 text-yellow-400" />
              </div>
            </div>
          </div>

          <!-- Utilization Card -->
          <div class="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
            <div class="flex justify-between items-start">
              <div>
                <p class="text-sm font-medium text-gray-600">Labor Utilization</p>
                <p class="mt-2 text-2xl font-bold text-gray-900">
                  {{ formatPercentage(getMetricValue('utilization_rate')) }}
                </p>
                <div class="mt-2 flex flex-col">
                  <div class="flex items-center text-sm text-gray-600">
                    <ClockIcon class="h-4 w-4 mr-1" />
                    <span>{{ formatNumber(getMetricValue('productive_hours'), 1) }}j productive</span>
                  </div>
                  <div class="flex items-center text-sm mt-1">
                    <ChartBarSquareIcon class="h-4 w-4 mr-1 text-blue-500" />
                    <span class="text-blue-600">Target: {{ formatPercentage(getMetricValue('target_rate', 85)) }}</span>
                  </div>
                </div>
              </div>
              <div class="bg-indigo-50 rounded-full p-3 flex items-center justify-center w-12 h-12">
                <ChartBarIcon class="h-6 w-6 text-indigo-600" />
              </div>
            </div>

            <!-- Progress Bar -->
            <div class="mt-4">
              <div class="flex justify-between text-sm mb-1">
                <span>Achievement</span>
                <span>{{ formatPercentage(getAchievementRate()) }}</span>
              </div>
              <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  class="h-2 bg-indigo-600 rounded-full transition-all duration-500"
                  :style="{ width: `${Math.min(getAchievementRate(), 100)}%` }"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Charts and Stats -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Trends Chart -->
          <div class="bg-white rounded-xl shadow-sm p-6">
            <h3 class="text-lg font-medium mb-6">Performance Trends</h3>
            <MechanicTrendChart :data="mechanicData.trends" />

            <!-- break line -->
            <hr class="my-6 border-gray-500 mt-8" />

            <!-- Performance Stats -->
            <div class="bg-white rounded-xl shadow-sm mt-8">
              <h3 class="text-lg font-medium mb-6">Service Performance</h3>
              <div class="space-y-6">
                <!-- Duration Accuracy -->
                <div>
                  <div class="flex justify-between text-sm mb-2">
                    <span class="text-gray-600">Duration Accuracy</span>
                    <span>{{ formatPercentage(Math.abs(mechanicData.metrics?.performance.duration_accuracy)) }}</span>
                  </div>
                  <div class="h-2 bg-gray-200 rounded-full">
                    <div 
                      class="h-2 rounded-full"
                      :class="mechanicData.metrics?.performance.duration_accuracy >= 0 ? 'bg-green-600' : 'bg-red-600'"
                      :style="{ width: `${Math.min(Math.abs(mechanicData.metrics?.performance.duration_accuracy || 0), 100)}%` }"
                    ></div>
                  </div>
                </div>

                <!-- Start Rate -->
                <div class="grid grid-cols-3 gap-4">
                  <div>
                    <p class="text-sm text-gray-600 mb-1">Mulai Lebih Awal</p>
                    <p class="text-lg font-semibold text-green-600">
                      {{ formatPercentage(mechanicData.metrics?.performance.early_start_rate) }}
                    </p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-600 mb-1">Mulai Tepat Waktu</p>
                    <p class="text-lg font-semibold text-blue-600">
                      {{ formatPercentage(mechanicData.metrics?.performance.ontime_start_rate) }}
                    </p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-600 mb-1">Keterlambatan Mulai</p>
                    <p class="text-lg font-semibold text-red-600">
                      {{ formatPercentage(mechanicData.metrics?.performance.late_start_rate) }}
                    </p>
                  </div>
                </div>

                <!-- Completion Rate -->
                <div class="grid grid-cols-2 gap-4">
                  <div class="bg-green-50 rounded-lg p-4">
                    <p class="text-sm text-gray-600 mb-1">Selesai Lebih Awal</p>
                    <p class="text-xl font-bold text-green-600">
                      {{ formatPercentage(mechanicData.metrics?.performance.early_completion_rate) }}
                    </p>
                  </div>
                  <div class="bg-red-50 rounded-lg p-4">
                    <p class="text-sm text-gray-600 mb-1">Keterlambatan Penyelesaian</p>
                    <p class="text-xl font-bold text-red-600">
                      {{ formatPercentage(mechanicData.metrics?.performance.late_completion_rate) }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Utilization Details -->
          <div class="bg-white rounded-xl shadow-sm p-6">
            <h3 class="text-lg font-medium mb-6">Utilization Analysis</h3>
            <div class="space-y-6">
              <!-- Daily Utilization Chart -->
              <div class="h-60 relative">
                <Line
                  v-if="chartData"
                  :data="chartData"
                  :options="chartOptions"
                />
              </div>

              <!-- Utilization Stats -->
              <div class="grid grid-cols-2 gap-4">
                <div class="bg-indigo-50 rounded-lg p-4">
                  <p class="text-sm text-gray-600 mb-1">Total Productive Hours</p>
                  <p class="text-xl font-bold text-indigo-600">
                    {{ formatNumber(getMetricValue('productive_hours'), 1) }}j
                  </p>
                </div>
                <div class="bg-blue-50 rounded-lg p-4">
                  <p class="text-sm text-gray-600 mb-1">Attendance Hours</p>
                  <p class="text-xl font-bold text-blue-600">
                    {{ formatNumber(getMetricValue('attendance_hours'), 1) }}j
                  </p>
                </div>
              </div>

              <!-- Daily Breakdown -->
              <div class="mt-4">
                <h4 class="text-sm font-medium text-gray-600 mb-3">Daily Productive Hours</h4>
                <div class="space-y-2">
                  <div v-for="day in (mechanicData.trends ?? [])" :key="day.date" 
                      class="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <span class="text-sm text-gray-600">{{ formatDate(day.date) }}</span>
                    <div class="flex items-center space-x-4">
                      <span class="text-sm font-medium">
                        {{ formatNumber(day.metrics?.utilization?.productive_hours ?? 0, 1) }}j
                      </span>
                      <div class="w-20 h-2 bg-gray-200 rounded-full">
                        <div 
                          class="h-2 bg-indigo-600 rounded-full"
                          :style="{ 
                            width: `${Math.min(((day.metrics?.utilization?.rate ?? 0)), 100)}%` 
                          }"
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Tambahkan section baru untuk detail utilization -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          
        </div>

        <div v-if="mechanicData.team_data" class="space-y-8">
          <h2 class="text-xl font-semibold text-gray-900">Team Performance</h2>
          
          <!-- Team Overview Cards -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
            <!-- Revenue Card -->
            <div class="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
              <div class="flex justify-between items-start">
                <div>
                  <p class="text-sm font-medium text-gray-600">Team Revenue</p>
                  <p class="mt-2 text-2xl font-bold text-gray-900">
                    {{ formatCurrency(mechanicData.team_data.summary.total_revenue) }}
                  </p>
                  <div class="mt-2 flex items-center text-sm">
                    <CurrencyDollarIcon class="h-4 w-4 text-gray-500 mr-1" />
                    <span class="text-gray-600">
                      Target: {{ formatCurrency(mechanicData.team_data.summary.target) }}
                    </span>
                  </div>
                </div>
                <div class="bg-blue-50 rounded-full p-3 flex items-center justify-center w-12 h-12">
                  <CurrencyDollarIcon class="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div class="mt-4">
                <div class="flex justify-between text-sm mb-1">
                  <span>Achievement</span>
                  <span>{{ formatPercentage(mechanicData.team_data.summary.total_revenue / mechanicData.team_data.summary.target * 100) }}</span>
                </div>
                <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    class="h-2 bg-blue-600 rounded-full transition-all duration-500"
                    :style="{ width: `${Math.min((mechanicData.team_data.summary.total_revenue / mechanicData.team_data.summary.target * 100), 100)}%` }"
                  ></div>
                </div>
              </div>
            </div>
  
            <!-- Orders Card -->
            <div class="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
              <div class="flex justify-between items-start">
                <div>
                  <p class="text-sm font-medium text-gray-600">Team Orders</p>
                  <p class="mt-2 text-2xl font-bold text-gray-900">
                    {{ mechanicData.team_data.summary.total_orders }}
                  </p>
                  <div class="mt-2 flex items-center text-sm">
                    <UsersIcon class="h-4 w-4 text-gray-500 mr-1" />
                    <span class="text-gray-600">
                      {{ mechanicData.team_data.summary.member_count }} Members
                    </span>
                  </div>
                </div>
                <div class="bg-green-50 rounded-full p-3 flex items-center justify-center w-12 h-12">
                  <InboxStackIcon class="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>
  
            <!-- Average Per Member Card -->
            <div class="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
              <div class="flex justify-between items-start">
                <div>
                  <p class="text-sm font-medium text-gray-600">Avg Revenue/Member</p>
                  <p class="mt-2 text-2xl font-bold text-gray-900">
                    {{ formatCurrency(mechanicData.team_data.summary.total_revenue / mechanicData.team_data.summary.member_count) }}
                  </p>
                  <div class="mt-2 flex items-center text-sm">
                    <InboxStackIcon class="h-4 w-4 text-gray-500 mr-1" />
                    <span class="text-gray-600">
                      Avg {{ Math.round(mechanicData.team_data.summary.total_orders / mechanicData.team_data.summary.member_count) }} orders
                    </span>
                  </div>
                </div>
                <div class="bg-purple-50 rounded-full p-3 flex items-center justify-center w-12 h-12">
                  <UsersIcon class="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>
  
            <!-- Team Rating Card -->
            <div class="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
              <div class="flex justify-between items-start">
                <div>
                  <p class="text-sm font-medium text-gray-600">Team Rating</p>
                  <div class="mt-2 flex items-center">
                    <p class="text-2xl font-bold text-gray-900 mr-2">
                      {{ formatNumber(mechanicData.team_data.metrics.performance.rating, 1) }}
                    </p>
                    <div class="flex">
                      <StarIcon 
                        v-for="i in 5" 
                        :key="i"
                        :class="[
                          'h-4 w-4',
                          i <= Math.round(mechanicData.team_data.metrics.performance.rating)
                            ? 'text-yellow-400'
                            : 'text-gray-200'
                        ]"
                      />
                    </div>
                  </div>
                  <div class="mt-2 flex items-center text-sm">
                    <InboxStackIcon class="h-4 w-4 text-gray-500 mr-1" />
                    <span class="text-gray-600">{{ mechanicData.team_data.summary.total_orders }} total orders</span>
                  </div>
                </div>
                <div class="bg-yellow-50 rounded-full p-3 flex items-center justify-center w-12 h-12">
                  <StarIcon class="h-6 w-6 text-yellow-400" />
                </div>
              </div>
            </div>
          </div>
  
          <!-- Individual vs Team Comparison -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="bg-white rounded-xl shadow-sm p-6">
              <h3 class="text-lg font-medium mb-6">Team Contribution Analysis</h3>
              <div class="space-y-6">
                <!-- Revenue Contribution -->
                <div>
                  <div class="flex justify-between text-sm mb-2">
                    <span class="text-gray-600">Revenue Contribution</span>
                    <span>{{ formatPercentage(mechanicData.metrics.revenue.total / mechanicData.team_data.summary.total_revenue * 100) }}</span>
                  </div>
                  <div class="h-2 bg-gray-200 rounded-full">
                    <div 
                      class="h-2 bg-blue-600 rounded-full"
                      :style="{ width: `${(mechanicData.metrics.revenue.total / mechanicData.team_data.summary.total_revenue * 100)}%` }"
                    ></div>
                  </div>
                </div>
  
                <!-- Orders Contribution -->
                <div>
                  <div class="flex justify-between text-sm mb-2">
                    <span class="text-gray-600">Orders Contribution</span>
                    <span>{{ formatPercentage(mechanicData.metrics.orders.total / mechanicData.team_data.summary.total_orders * 100) }}</span>
                  </div>
                  <div class="h-2 bg-gray-200 rounded-full">
                    <div 
                      class="h-2 bg-green-600 rounded-full"
                      :style="{ width: `${(mechanicData.metrics.orders.total / mechanicData.team_data.summary.total_orders * 100)}%` }"
                    ></div>
                  </div>
                </div>
  
                <!-- Rating Comparison -->
                <div class="grid grid-cols-2 gap-4">
                  <div class="bg-blue-50 rounded-lg p-4">
                    <p class="text-sm text-gray-600 mb-1">Individual Rating</p>
                    <div class="flex items-center">
                      <span class="text-xl font-bold text-blue-600 mr-2">
                        {{ formatNumber(mechanicData.metrics.performance.rating, 1) }}
                      </span>
                      <StarIcon class="h-5 w-5 text-yellow-400" />
                    </div>
                  </div>
                  <div class="bg-purple-50 rounded-lg p-4">
                    <p class="text-sm text-gray-600 mb-1">Team Rating</p>
                    <div class="flex items-center">
                      <span class="text-xl font-bold text-purple-600 mr-2">
                        {{ formatNumber(mechanicData.team_data.metrics.performance.rating, 1) }}
                      </span>
                      <StarIcon class="h-5 w-5 text-yellow-400" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
  
            <!-- Team Performance Chart (Optional) -->
           <!-- Team Performance Chart -->
            <div class="bg-white rounded-xl shadow-sm p-6">
              <div class="flex items-center justify-between mb-6">
                <h3 class="text-lg font-medium">Performance Overview</h3>
                <div class="flex items-center space-x-4 text-sm">
                  <div class="flex items-center">
                    <div class="w-3 h-3 bg-blue-500 rounded-sm mr-2"></div>
                    <span class="text-gray-600">Achievement</span>
                  </div>
                  <div class="flex items-center">
                    <div class="w-3 h-3 bg-green-500 rounded-sm mr-2"></div>
                    <span class="text-gray-600">Revenue</span>
                  </div>
                </div>
              </div>
              
              <TeamPerformanceChart :data="mechanicData" />

              <!-- Additional Insights -->
              <div class="mt-6 pt-6 border-t border-gray-100">
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <p class="text-sm text-gray-600">Individual vs Team Avg</p>
                    <p class="mt-1 text-lg font-semibold">
                      {{ 
                        formatPercentage(
                          (mechanicData.metrics.revenue.total / (mechanicData.team_data.summary.total_revenue / mechanicData.team_data.summary.member_count) - 1) * 100
                        ) 
                      }}
                    </p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-600">Team Revenue Share</p>
                    <p class="mt-1 text-lg font-semibold">
                      {{ 
                        formatPercentage(mechanicData.metrics.revenue.total / mechanicData.team_data.summary.total_revenue * 100)
                      }}
                    </p>
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
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { debounce } from 'lodash'
import { 
  ArrowLeftIcon,
  ArrowPathIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CurrencyDollarIcon,
  StarIcon,
  InboxStackIcon,
  UsersIcon,  // Tambahkan ini
  ClockIcon,
  ChartBarIcon,
  ChartBarSquareIcon,
} from '@heroicons/vue/24/outline'
import { format } from 'date-fns'
import { formatCurrency, formatNumber, formatPercentage } from '@/utils/formatters'
import apiClient from '@/config/api'
import MechanicTrendChart from '@/components/dashboard/MechanicTrendChart.vue'
import TeamPerformanceChart from '@/components/dashboard/TeamPerformanceChart.vue'
// Di bagian imports tambahkan
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
  Filler
} from 'chart.js'

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const selectedRange = ref('this_month')
const dateRange = ref({
  start: '',
  end: ''
})

const mechanicData = ref({
  mechanic: {},
  metrics: {
    revenue: {},
    orders: {},
    performance: {}
  },
  trends: []
})

// Tambahkan watch untuk route.params.id
watch(() => route.params.id, (newId, oldId) => {
  if (newId && newId !== oldId) {
    fetchMechanicData()
  }
})

const formattedDateRange = computed(() => {
  const { start, end } = mechanicData.value.date_range || {}
  if (!start || !end) return ''
  return `${format(new Date(start), 'dd MMM yyyy')} - ${format(new Date(end), 'dd MMM yyyy')}`
})

const formatDate = (dateString) => {
  return format(new Date(dateString), 'dd MMM')
}

const chartData = computed(() => {
  if (!mechanicData.value?.trends) return null;
  
  const validTrends = mechanicData.value.trends.filter(t => t?.metrics?.utilization);
  
  return {
    labels: validTrends.map(t => format(new Date(t.date), 'dd MMM')),
    datasets: [{
      label: 'Productive Hours',
      data: validTrends.map(t => t.metrics?.utilization?.productive_hours ?? 0),
      borderColor: '#4F46E5',
      backgroundColor: 'rgba(79, 70, 229, 0.1)',
      tension: 0.4,
      fill: true
    }]
  }
})

const fetchMechanicData = debounce(async () => {
  try {
    loading.value = true
    const params = {
      date_range: selectedRange.value
    }

    if (selectedRange.value === 'custom' && dateRange.value.start && dateRange.value.end) {
      params.start_date = dateRange.value.start
      params.end_date = dateRange.value.end
    }

    const response = await apiClient.post(`/web/v2/dashboard/mechanic/${route.params.id}`, {
      jsonrpc: '2.0',
      method: 'call',
      params
    })

    if (response.data.result?.data) {
      mechanicData.value = response.data.result.data
    }
  } catch (error) {
    console.error('Error fetching mechanic data:', error)
  } finally {
    loading.value = false
  }
}, 500)

const handleDateRangeChange = () => {
  if (selectedRange.value === 'custom') {
    if (dateRange.value.start && dateRange.value.end) {
      fetchMechanicData()
    }
  } else {
    fetchMechanicData()
  }
}

// Di script setup
const getMetricValue = (key, defaultValue = 0) => {
  return mechanicData.value?.metrics?.utilization?.[key] ?? defaultValue;
}

const getAchievementRate = () => {
  const utilRate = getMetricValue('utilization_rate');
  const targetRate = getMetricValue('target_rate', 85);
  return (utilRate / targetRate) * 100;
}


const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: 'Hours'
      }
    }
  },
  plugins: {
    legend: {
      display: true,
      position: 'top'
    },
    tooltip: {
      callbacks: {
        label: (context) => {
          let value = context.parsed.y;
          return `${formatNumber(value, 1)}j`;
        }
      }
    }
  }
}

const refreshData = () => {
  fetchMechanicData()
}

const navigateToMechanic = (id) => {
  router.push(`/dashboard/mechanic/${id}`)
}

const backToDashboard = () => {
  router.push('/dashboard/mechanics')
}

onMounted(() => {
  fetchMechanicData()
})
</script>

<style scoped>
.router-link-active {
  background-color: inherit;
}
.absolute {
  transition: all 0.2s ease-in-out;
}
.dropdown-item {
  transition: all 0.2s ease-in-out;
}
.dropdown-item:hover {
  background-color: #F3F4F6;
}
</style>