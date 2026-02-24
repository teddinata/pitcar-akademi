<template>
  <div class="bg-white rounded-lg shadow-sm overflow-hidden">
    <!-- Header Section -->
    <div class="p-4 sm:px-6 border-b border-gray-200">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h3 class="text-lg font-medium text-gray-900">Mechanic Performance</h3>
        <div class="flex flex-col sm:flex-row gap-3 sm:items-center">
          <!-- Search -->
          <div class="relative rounded-md shadow-sm">
            <input 
              type="text"
              v-model="searchQuery"
              class="w-full rounded-md border-gray-300 pl-10 pr-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Search mechanic..."
            >
            <div class="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
              <MagnifyingGlassIcon class="h-4 w-4 text-gray-400" />
            </div>
          </div>

          <!-- Filter -->
          <select 
            v-model="filterPosition"
            class="w-full sm:w-auto rounded-md border-gray-300 py-2 pl-3 pr-10 text-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">All Positions</option>
            <option value="Mechanic">Mechanic</option>
            <option value="Team Leader">Team Leader</option>
          </select>
        </div>
      </div>
    </div>

    <div class="overflow-x-auto">
       <!-- Mobile View -->
      <div class="sm:hidden divide-y divide-gray-200">
        <div 
          v-for="mechanic in filteredMechanics" 
          :key="mechanic.id"
          @click="goToDetail(mechanic.id)"
          class="p-4 hover:bg-gray-50 cursor-pointer space-y-3"
        >
          <div class="flex justify-between items-start">
            <div>
              <p class="font-medium text-gray-900">{{ mechanic.name }}</p>
              <p class="text-sm text-gray-500">{{ mechanic.position }}</p>
            </div>
            <div class="text-right">
              <p class="font-medium text-gray-900">{{ formatCurrency(mechanic.metrics.revenue.total) }}</p>
              <p class="text-sm text-gray-500">{{ mechanic.metrics.orders.total }} orders</p>
            </div>
          </div>
          
          <!-- Performance Bar -->
          <div class="w-full">
            <div class="flex justify-between text-xs mb-1">
              <span class="text-gray-500">Achievement</span>
              <span>{{ formatPercentage(mechanic.metrics.revenue.achievement) }}</span>
            </div>
            <div class="h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div 
                class="h-1.5 bg-blue-600 rounded-full"
                :style="{ width: `${Math.min(mechanic.metrics.revenue.achievement, 100)}%` }"
              ></div>
            </div>
          </div>
        </div>
      </div>
      <table class="hidden sm:table min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Name & Position
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Team Leader
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Revenue & Achievement
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Orders
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Performance
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Utilization
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 bg-white">
          <tr 
            v-for="mechanic in filteredMechanics" 
            :key="mechanic.id"
            @click="goToDetail(mechanic.id)"
            class="hover:bg-gray-50 cursor-pointer"
          >
            <td class="px-6 py-4">
              <div class="font-medium text-gray-900">{{ mechanic.name }}</div>
              <div class="text-sm text-gray-500">{{ mechanic.position }}</div>
            </td>
            <td class="px-6 py-4">
              <div v-if="mechanic.leader" class="flex items-center">
                <div class="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span class="font-medium text-blue-800">
                    {{ getInitials(mechanic.leader.name) }}
                  </span>
                </div>
                <div class="ml-3">
                  <div class="text-sm font-medium text-gray-900">{{ mechanic.leader.name }}</div>
                </div>
              </div>
              <div v-else class="text-sm text-gray-500">-</div>
            </td>
            <td class="px-6 py-4">
              <div class="font-medium">{{ formatCurrency(mechanic.metrics.revenue.total) }}</div>
              <div class="flex items-center mt-1">
                <div class="flex-1 h-1.5 bg-gray-200 rounded-full mr-2">
                  <div 
                    class="h-1.5 bg-blue-600 rounded-full transition-all duration-500"
                    :style="{ width: `${Math.min(mechanic.metrics.revenue.achievement, 100)}%` }"
                  ></div>
                </div>
                <span class="text-xs">
                  {{ formatPercentage(mechanic.metrics.revenue.achievement) }}
                </span>
              </div>
            </td>
            <td class="px-6 py-4">
              <div class="text-sm">
                <div class="font-medium">{{ mechanic.metrics.orders.total }} orders</div>
                <div class="text-gray-500">
                  Avg: {{ formatCurrency(mechanic.metrics.orders.average_value) }}
                </div>
              </div>
            </td>
            <td class="px-6 py-4">
              <div class="space-y-2">
                <div class="flex items-center">
                  <div class="flex mr-2">
                    <StarIcon 
                      v-for="i in 5" 
                      :key="i"
                      :class="[
                        'h-4 w-4',
                        i <= Math.round(mechanic.metrics.performance.rating)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      ]"
                    />
                  </div>
                  <span class="text-sm">
                    {{ formatNumber(mechanic.metrics.performance.rating, 1) }}
                  </span>
                </div>
                <div class="flex justify-between text-xs">
                  <span class="text-gray-500">Tepat Waktu:</span>
                  <span>{{ formatPercentage(mechanic.metrics.performance.on_time_rate) }}</span>
                </div>
                <div class="flex justify-between text-xs">
                  <span class="text-gray-500">Penyelesaian Lebih Awal:</span>
                  <span class="text-green-600">
                    {{ formatPercentage(mechanic.metrics.performance.early_start_rate) }}
                  </span>
                </div>
                <div class="flex justify-between text-xs">
                  <span class="text-gray-500">Keterlambatan Selesai:</span>
                  <span class="text-red-600">
                    {{ formatPercentage(mechanic.metrics.performance.late_completion_rate) }}
                  </span>
                </div>
                
              </div>
            </td>
            <td class="px-6 py-4">
              <div class="space-y-2">
                <div class="flex justify-between text-xs">
                  <span class="text-gray-500">Labor Utilization:</span>
                  <span>{{ formatPercentage(mechanic.metrics.utilization.utilization_rate) }}</span>
                </div>
                <div class="flex justify-between text-xs">
                  <span class="text-gray-500">Productive Hours:</span>
                  <span>{{ formatNumber(mechanic.metrics.utilization.productive_hours, 1) }}j</span>
                </div>
                <div class="flex justify-between text-xs">
                  <span class="text-gray-500">Target Rate:</span>
                  <span>{{ formatPercentage(mechanic.metrics.utilization.target_rate) }}</span>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { 
  StarIcon, 
  MagnifyingGlassIcon,
} from '@heroicons/vue/24/solid'
import { formatCurrency, formatPercentage, formatNumber } from '@/utils/formatters'
import { useRouter } from 'vue-router'

const router = useRouter()

const props = defineProps({
  mechanics: {
    type: Array,
    default: () => []
  }
})

const goToDetail = (id) => {
  router.push(`/dashboard/mechanic/${id}`)
}


const searchQuery = ref('')
const filterPosition = ref('')

const getInitials = (name) => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase();
};

const filteredMechanics = computed(() => {
  let result = props.mechanics

  // Position filter
  if (filterPosition.value) {
    result = result.filter(m => m.position === filterPosition.value)
  }

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(m => 
      m.name.toLowerCase().includes(query) || 
      m.position.toLowerCase().includes(query)
    )
  }

  // Sort by revenue
  return result.sort((a, b) => b.metrics.revenue.total - a.metrics.revenue.total)
})
</script>