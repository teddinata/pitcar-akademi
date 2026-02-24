<!-- // src/components/overview/TopSales.vue -->
<!-- TopSales.vue -->
<template>
  <div class="p-4">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-medium text-gray-900">Top Sales Orders</h3>
      <button class="text-sm text-blue-600 hover:text-blue-700">View All</button>
    </div>
    
    <div class="space-y-2 sm:space-y-3">
      <div 
        v-for="sale in data" 
        :key="sale.id"
        class="p-3 hover:bg-gray-50 rounded-lg transition-colors"
      >
        <div class="flex flex-col sm:flex-row sm:items-start justify-between space-y-2 sm:space-y-0">
          <div class="min-w-0 flex-1">
            <p class="text-sm font-medium text-gray-900 truncate">{{ sale.name }}</p>
            <p class="text-xs text-gray-500 mt-1 truncate">{{ sale.customer || 'No Customer' }}</p>
          </div>
          <p class="text-sm font-bold text-gray-900">{{ formatCurrency(sale.amount) }}</p>
        </div>
        
        <div class="mt-2 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:space-x-4">
          <div class="flex items-center text-xs text-gray-500">
            <UserIcon class="h-4 w-4 mr-1 flex-shrink-0" />
            <span class="truncate">{{ sale.service_advisor.join(', ') || 'Unassigned' }}</span>
          </div>
          <div class="flex items-center text-xs text-gray-500">
            <WrenchScrewdriverIcon class="h-4 w-4 mr-1 flex-shrink-0" />
            <span class="truncate">{{ sale.mechanic.join(', ') || 'Unassigned' }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { UserIcon, WrenchScrewdriverIcon } from '@heroicons/vue/24/outline'
import { formatCurrency } from '@/utils/formatters'

defineProps({
  data: {
    type: Array,
    default: () => []
  }
})
</script>
