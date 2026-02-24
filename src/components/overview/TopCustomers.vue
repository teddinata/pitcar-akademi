<!-- src/components/overview/TopCustomers.vue -->
<template>
  <div class="p-4 sm:p-6">
    <!-- Compact Header -->
    <div class="flex items-center justify-between mb-4">
      <div>
        <h3 class="text-lg font-semibold text-gray-900">Top Customers</h3>
        <p class="text-sm text-gray-600">{{ data.length }} pelanggan aktif</p>
      </div>
      <button 
        @click="showInsights = !showInsights"
        class="inline-flex items-center px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-sm rounded-lg transition-colors"
      >
        <SparklesIcon class="h-4 w-4 mr-1" />
        <span class="hidden sm:inline">{{ showInsights ? 'Hide' : 'Insights' }}</span>
        <span class="sm:hidden">AI</span>
      </button>
    </div>

    <!-- Ultra Compact AI Summary -->
    <div v-if="showInsights" class="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-3 mb-4 border border-indigo-200">
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
        <!-- Quick Stats -->
        <div class="bg-white rounded-lg p-2.5 border border-slate-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs text-gray-600">Top Customer</p>
              <p class="font-medium text-gray-900 text-sm truncate">{{ getTopCustomer().name }}</p>
            </div>
            <CrownIcon class="h-4 w-4 text-yellow-500" />
          </div>
        </div>

        <div class="bg-white rounded-lg p-2.5 border border-slate-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs text-gray-600">Avg Revenue</p>
              <p class="font-medium text-gray-900 text-sm">{{ formatCompactCurrency(getAverageRevenue()) }}</p>
            </div>
            <ChartBarIcon class="h-4 w-4 text-blue-500" />
          </div>
        </div>

        <div class="bg-white rounded-lg p-2.5 border border-slate-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs text-gray-600">Premium Rate</p>
              <p class="font-medium text-gray-900 text-sm">{{ formatPercentage(getPremiumRate()) }}</p>
            </div>
            <StarIcon class="h-4 w-4 text-purple-500" />
          </div>
        </div>

        <div class="bg-white rounded-lg p-2.5 border border-slate-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs text-gray-600">Status</p>
              <p class="font-medium text-sm" :class="getCustomerHealthColor()">{{ getCustomerHealth() }}</p>
            </div>
            <UserGroupIcon class="h-4 w-4 text-green-500" />
          </div>
        </div>
      </div>
      
      <!-- Single Line Recommendation -->
      <div class="bg-white rounded-lg p-2 border border-amber-200">
        <p class="text-xs text-amber-800 flex items-center">
          <LightBulbIcon class="h-3 w-3 mr-1.5 flex-shrink-0" />
          <span class="truncate">{{ getKeyRecommendation() }}</span>
        </p>
      </div>
    </div>

    <!-- Compact Customer Grid -->
    <div class="space-y-2">
      <template v-if="data.length">
        <div 
          v-for="(customer, index) in data" 
          :key="customer.id"
          class="group bg-white rounded-lg p-3 border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all duration-200"
        >
          <!-- Mobile Layout (< sm) -->
          <div class="sm:hidden">
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center space-x-2">
                <span :class="['w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center', getRankingStyle(index)]">
                  {{ index + 1 }}
                </span>
                <div class="relative">
                  <div :class="['w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium', getMembershipStyle(customer.membership_level)]">
                    {{ getInitials(customer.name) }}
                  </div>
                  <div :class="['absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border border-white text-xs flex items-center justify-center', getMembershipBadgeStyle(customer.membership_level)]">
                    {{ getMembershipEmoji(customer.membership_level) }}
                  </div>
                </div>
                <div class="min-w-0">
                  <p class="font-medium text-gray-900 text-sm truncate">{{ customer.name }}</p>
                  <div class="flex items-center space-x-2 text-xs text-gray-600">
                    <span>{{ customer.orders }} orders</span>
                    <span>•</span>
                    <span :class="getMembershipTextColor(customer.membership_level)">{{ getMembershipLabel(customer.membership_level) }}</span>
                  </div>
                </div>
              </div>
              <button @click="toggleCustomerInsight(customer.id)" class="text-indigo-600 text-xs">
                Detail
              </button>
            </div>
            <div class="flex items-center justify-between">
              <p class="text-base font-bold text-gray-900">{{ formatCompactCurrency(customer.revenue) }}</p>
              <span class="text-xs text-gray-600">{{ formatCompactCurrency(customer.revenue / customer.orders) }} avg</span>
            </div>
          </div>

          <!-- Desktop Layout (≥ sm) -->
          <div class="hidden sm:flex items-center justify-between">
            <div class="flex items-center space-x-3 min-w-0 flex-1">
              <!-- Ranking -->
              <span :class="['w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center flex-shrink-0', getRankingStyle(index)]">
                {{ index + 1 }}
              </span>
              
              <!-- Avatar with Membership -->
              <div class="relative flex-shrink-0">
                <div :class="['w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium', getMembershipStyle(customer.membership_level)]">
                  {{ getInitials(customer.name) }}
                </div>
                <div :class="['absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center', getMembershipBadgeStyle(customer.membership_level)]">
                  <span class="text-xs">{{ getMembershipEmoji(customer.membership_level) }}</span>
                </div>
              </div>
              
              <!-- Customer Info -->
              <div class="min-w-0 flex-1">
                <div class="flex items-center space-x-2 mb-1">
                  <p class="font-medium text-gray-900 truncate">{{ customer.name }}</p>
                  <span :class="['px-2 py-0.5 rounded-full text-xs font-medium', getMembershipLabelStyle(customer.membership_level)]">
                    {{ getMembershipLabel(customer.membership_level) }}
                  </span>
                </div>
                <div class="flex items-center space-x-3 text-sm text-gray-600">
                  <span class="flex items-center">
                    <ShoppingBagIcon class="h-3 w-3 mr-1" />
                    {{ customer.orders }}
                  </span>
                  <span v-if="customer.avg_lead_time" class="flex items-center">
                    <ClockIcon class="h-3 w-3 mr-1" />
                    {{ customer.avg_lead_time.toFixed(1) }}j
                  </span>
                  <span class="flex items-center">
                    <CurrencyDollarIcon class="h-3 w-3 mr-1" />
                    {{ formatCompactCurrency(customer.revenue / customer.orders) }}
                  </span>
                </div>
              </div>
            </div>
            
            <!-- Revenue & Actions -->
            <div class="flex items-center space-x-3 ml-4">
              <div class="text-right">
                <p class="text-lg font-bold text-gray-900">{{ formatCompactCurrency(customer.revenue) }}</p>
                <p class="text-xs text-gray-600">{{ getCustomerContribution(customer) }}% share</p>
              </div>
              <button 
                @click="toggleCustomerInsight(customer.id)"
                class="text-xs text-indigo-600 hover:text-indigo-800 hover:underline transition-colors"
              >
                Detail
              </button>
            </div>
          </div>

          <!-- Customer Detail Popup -->
          <div 
            v-if="activeCustomerInsight === customer.id"
            class="absolute mt-2 right-3 w-72 bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-40"
          >
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center space-x-2">
                <div :class="['w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium', getMembershipStyle(customer.membership_level)]">
                  {{ getInitials(customer.name) }}
                </div>
                <div>
                  <h6 class="font-medium text-gray-900 text-sm">{{ customer.name }}</h6>
                  <p class="text-xs text-gray-600">{{ getMembershipLabel(customer.membership_level) }} Member</p>
                </div>
              </div>
              <button @click="activeCustomerInsight = null" class="text-gray-400 hover:text-gray-600">
                <XMarkIcon class="h-4 w-4" />
              </button>
            </div>
            
            <div class="grid grid-cols-2 gap-3 mb-3">
              <div class="bg-gray-50 rounded-lg p-2">
                <p class="text-xs text-gray-600">Total Revenue</p>
                <p class="font-medium text-gray-900 text-sm">{{ formatCurrency(customer.revenue) }}</p>
              </div>
              <div class="bg-gray-50 rounded-lg p-2">
                <p class="text-xs text-gray-600">Total Orders</p>
                <p class="font-medium text-gray-900 text-sm">{{ customer.orders }}</p>
              </div>
              <div class="bg-gray-50 rounded-lg p-2">
                <p class="text-xs text-gray-600">Avg per Order</p>
                <p class="font-medium text-gray-900 text-sm">{{ formatCompactCurrency(customer.revenue / customer.orders) }}</p>
              </div>
              <div class="bg-gray-50 rounded-lg p-2">
                <p class="text-xs text-gray-600">Kontribusi</p>
                <p class="font-medium text-gray-900 text-sm">{{ getCustomerContribution(customer) }}%</p>
              </div>
            </div>
            
            <div class="bg-indigo-50 rounded-lg p-3 border border-indigo-200">
              <p class="text-xs text-indigo-800">
                <strong>Insight:</strong> {{ getCustomerInsight(customer) }}
              </p>
            </div>
          </div>
        </div>
      </template>

      <!-- Compact Empty State -->
      <div v-else class="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <UserGroupIcon class="mx-auto h-8 w-8 text-gray-400 mb-2" />
        <h3 class="text-sm font-medium text-gray-900 mb-1">Tidak Ada Data</h3>
        <p class="text-xs text-gray-600">Belum ada customer untuk periode ini</p>
      </div>
    </div>

    <!-- Compact Summary -->
    <div v-if="data.length" class="mt-4 pt-4 border-t border-gray-200">
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div class="bg-indigo-50 rounded-lg p-2.5 text-center">
          <p class="text-xs text-indigo-600 mb-0.5">Revenue</p>
          <p class="text-sm font-bold text-indigo-900">{{ formatCompactCurrency(getTotalRevenue()) }}</p>
        </div>
        
        <div class="bg-blue-50 rounded-lg p-2.5 text-center">
          <p class="text-xs text-blue-600 mb-0.5">Orders</p>
          <p class="text-sm font-bold text-blue-900">{{ getTotalOrders() }}</p>
        </div>

        <div class="bg-green-50 rounded-lg p-2.5 text-center">
          <p class="text-xs text-green-600 mb-0.5">Avg Rev</p>
          <p class="text-sm font-bold text-green-900">{{ formatCompactCurrency(getAverageRevenue()) }}</p>
        </div>

        <div class="bg-purple-50 rounded-lg p-2.5 text-center">
          <p class="text-xs text-purple-600 mb-0.5">Premium</p>
          <p class="text-sm font-bold text-purple-900">{{ formatPercentage(getPremiumRate()) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { 
  ShoppingBagIcon,
  ClockIcon,
  UserGroupIcon,
  SparklesIcon,
  XMarkIcon,
  ChartBarIcon,
  LightBulbIcon,
  CurrencyDollarIcon
} from '@heroicons/vue/24/outline'
import { StarIcon, StarIcon as CrownIcon } from '@heroicons/vue/24/solid'
import { formatCurrency, formatPercentage } from '@/utils/formatters'

const props = defineProps({
  data: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

// State
const showInsights = ref(false)
const activeCustomerInsight = ref(null)

// Close popups when clicking outside
const handleClickOutside = (event) => {
  if (!event.target.closest('.absolute') && !event.target.closest('button')) {
    activeCustomerInsight.value = null
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

// Utility Functions
const formatCompactCurrency = (value) => {
  if (value >= 1e9) return `Rp ${(value / 1e9).toFixed(1)}M`
  if (value >= 1e6) return `Rp ${(value / 1e6).toFixed(1)}Jt`
  if (value >= 1e3) return `Rp ${(value / 1e3).toFixed(0)}rb`
  return formatCurrency(value, 0)
}

// Computed properties
const getTotalRevenue = () => {
  return props.data.reduce((sum, customer) => sum + customer.revenue, 0)
}

const getTotalOrders = () => {
  return props.data.reduce((sum, customer) => sum + customer.orders, 0)
}

const getAverageRevenue = () => {
  if (props.data.length === 0) return 0
  return getTotalRevenue() / props.data.length
}

const getPremiumRate = () => {
  if (props.data.length === 0) return 0
  const premiumCustomers = props.data.filter(customer => 
    ['gold', 'platinum'].includes(customer.membership_level)
  ).length
  return (premiumCustomers / props.data.length) * 100
}

// AI Analysis Functions
const getTopCustomer = () => {
  if (props.data.length === 0) return { name: 'Tidak ada data' }
  return props.data[0]
}

const getCustomerHealth = () => {
  const avgRevenue = getAverageRevenue()
  const premiumRate = getPremiumRate()
  
  if (avgRevenue >= 3000000 && premiumRate >= 20) return 'Excellent'
  if (avgRevenue >= 2000000 && premiumRate >= 10) return 'Good'
  if (avgRevenue >= 1000000) return 'Fair'
  return 'Needs Focus'
}

const getCustomerHealthColor = () => {
  const health = getCustomerHealth()
  if (health === 'Excellent') return 'text-green-600'
  if (health === 'Good') return 'text-blue-600'
  if (health === 'Fair') return 'text-amber-600'
  return 'text-red-600'
}

const getKeyRecommendation = () => {
  const premiumRate = getPremiumRate()
  const avgRevenue = getAverageRevenue()
  
  if (premiumRate < 10) return 'Focus on premium membership upgrades'
  if (avgRevenue < 1500000) return 'Implement upselling strategies'
  return 'Maintain excellent customer relationships'
}

// Individual Customer Functions
const toggleCustomerInsight = (id) => {
  activeCustomerInsight.value = activeCustomerInsight.value === id ? null : id
}

const getCustomerInsight = (customer) => {
  const avgRevenue = getAverageRevenue()
  const performance = avgRevenue > 0 ? (customer.revenue / avgRevenue) * 100 : 0
  
  if (performance >= 200) return `VIP customer dengan revenue exceptional`
  if (performance >= 150) return `High-value customer dengan kontribusi besar`
  if (performance >= 100) return `Loyal customer dengan spending solid`
  return `Growth potential melalui engagement yang lebih baik`
}

const getCustomerContribution = (customer) => {
  const totalRevenue = getTotalRevenue()
  return totalRevenue > 0 ? ((customer.revenue / totalRevenue) * 100).toFixed(1) : '0'
}

// Style Functions
const getInitials = (name) => {
  return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2)
}

const getRankingStyle = (index) => {
  if (index === 0) return 'bg-yellow-500 text-white'
  if (index === 1) return 'bg-gray-400 text-white'
  if (index === 2) return 'bg-amber-600 text-white'
  return 'bg-gray-300 text-gray-700'
}

const getMembershipStyle = (level) => {
  const styles = {
    bronze: 'bg-amber-100 text-amber-700',
    silver: 'bg-gray-100 text-gray-700',
    gold: 'bg-yellow-100 text-yellow-700',
    platinum: 'bg-purple-100 text-purple-700'
  }
  return styles[level] || styles.bronze
}

const getMembershipBadgeStyle = (level) => {
  const styles = {
    bronze: 'bg-amber-500 text-white',
    silver: 'bg-gray-400 text-white',
    gold: 'bg-yellow-500 text-white',
    platinum: 'bg-purple-500 text-white'
  }
  return styles[level] || styles.bronze
}

const getMembershipLabelStyle = (level) => {
  const styles = {
    bronze: 'bg-amber-100 text-amber-800',
    silver: 'bg-gray-100 text-gray-800',
    gold: 'bg-yellow-100 text-yellow-800',
    platinum: 'bg-purple-100 text-purple-800'
  }
  return styles[level] || styles.bronze
}

const getMembershipTextColor = (level) => {
  const styles = {
    bronze: 'text-amber-600',
    silver: 'text-gray-600',
    gold: 'text-yellow-600',
    platinum: 'text-purple-600'
  }
  return styles[level] || styles.bronze
}

const getMembershipLabel = (level) => {
  const labels = {
    bronze: 'Bronze',
    silver: 'Silver', 
    gold: 'Gold',
    platinum: 'Platinum'
  }
  return labels[level] || 'Bronze'
}

const getMembershipEmoji = (level) => {
  const emojis = {
    bronze: '🥉',
    silver: '🥈',
    gold: '🥇',
    platinum: '💎'
  }
  return emojis[level] || '🥉'
}
</script>

<style scoped>
/* Ultra smooth transitions */
.transition-all {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Refined hover effects */
.group:hover {
  transform: translateY(-1px);
}

.hover\:shadow-md:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

/* Popup animation with spring */
.absolute {
  animation: slideInScale 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes slideInScale {
  from {
    opacity: 0;
    transform: translateY(-8px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Enhanced mobile responsiveness */
@media (max-width: 640px) {
  .absolute.mt-2.right-3 {
    position: fixed !important;
    top: 50% !important;
    left: 50% !important;
    right: auto !important;
    margin-top: 0 !important;
    transform: translate(-50%, -50%) !important;
    width: 90vw !important;
    max-width: 340px !important;
    z-index: 50 !important;
  }
  
  .absolute.mt-2.right-3::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.4);
    z-index: -1;
    backdrop-filter: blur(2px);
  }
}

/* Focus improvements */
button:focus {
  outline: 2px solid #6366f1;
  outline-offset: 2px;
  border-radius: 4px;
}

/* Membership badge subtle animation */
.group:hover .membership-badge {
  transform: scale(1.1);
  transition: transform 0.2s ease;
}

/* Grid layout optimization */
.grid {
  display: grid;
  gap: 0.75rem;
}

@media (min-width: 640px) {
  .grid {
    gap: 1rem;
  }
}

/* Text truncation improvements */
.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Card depth enhancement */
.bg-white {
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
}

.group:hover .bg-white {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

/* Performance optimizations */
* {
  will-change: auto;
}

.group:hover * {
  will-change: transform;
}
</style>