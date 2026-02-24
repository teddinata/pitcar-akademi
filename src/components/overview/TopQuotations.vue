<!-- // src/components/overview/TopQuotations.vue -->
<!-- TopQuotations.vue -->
<template>
  <div class="p-4">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-medium text-gray-900">Active Quotations</h3>
      <button class="text-sm text-blue-600 hover:text-blue-700">View All</button>
    </div>
    
    <div class="space-y-2 sm:space-y-3">
      <div 
        v-for="quote in data" 
        :key="quote.id"
        class="p-3 hover:bg-gray-50 rounded-lg transition-colors"
      >
        <div class="flex flex-col sm:flex-row sm:items-start justify-between space-y-2 sm:space-y-0">
          <div class="min-w-0 flex-1">
            <p class="text-sm font-medium text-gray-900 truncate">{{ quote.name }}</p>
            <p class="text-xs text-gray-500 mt-1 truncate">{{ quote.customer || 'No Customer' }}</p>
          </div>
          <p :class="[
            'text-sm font-bold whitespace-nowrap',
            quote.amount > 0 ? 'text-gray-900' : 'text-gray-500'
          ]">
            {{ formatCurrency(quote.amount) }}
          </p>
        </div>
        
        <div class="mt-2 flex items-center text-xs text-gray-500">
          <UserIcon class="h-4 w-4 mr-1 flex-shrink-0" />
          <span class="truncate">{{ quote.service_advisor.join(', ') || 'Unassigned' }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { UserIcon } from '@heroicons/vue/24/outline'
import { formatCurrency } from '@/utils/formatters'

defineProps({
  data: {
    type: Array,
    default: () => []
  }
})
</script>
