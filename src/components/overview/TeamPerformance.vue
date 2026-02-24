<!-- src/components/overview/TeamPerformance.vue -->
<template>
  <div class="p-6">
    <!-- Header Simplified -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h3 class="text-lg font-semibold text-gray-900">Kinerja Tim</h3>
        <p class="text-sm text-gray-600 mt-1">Performa advisor dan mechanic</p>
      </div>
      <div class="flex items-center space-x-3">
        <div class="text-right">
          <p class="text-sm text-gray-500">Total Tim</p>
          <p class="text-lg font-bold text-gray-900">{{ totalTeamMembers }}</p>
        </div>
        <button 
          @click="showInsights = !showInsights"
          class="inline-flex items-center px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm rounded-lg transition-colors"
        >
          <SparklesIcon class="h-4 w-4 mr-1" />
          {{ showInsights ? 'Sembunyikan' : 'AI Insights' }}
        </button>
      </div>
    </div>

    <!-- Compact AI Summary (Collapsible) -->
    <div v-if="showInsights" class="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 mb-6 border border-blue-200">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Quick Advisor Insight -->
        <div class="bg-white rounded-lg p-3 border border-slate-200">
          <h5 class="font-medium text-blue-900 mb-2 flex items-center text-sm">
            <UserGroupIcon class="h-4 w-4 mr-1" />
            Service Advisors
          </h5>
          <div class="space-y-1 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-600">Top:</span>
              <span class="font-medium text-gray-900 truncate ml-2">{{ getTopAdvisor().name }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Status:</span>
              <span class="font-medium" :class="getAdvisorEfficiencyColor()">{{ getAdvisorEfficiencyStatus() }}</span>
            </div>
          </div>
        </div>

        <!-- Quick Mechanic Insight -->
        <div class="bg-white rounded-lg p-3 border border-slate-200">
          <h5 class="font-medium text-green-900 mb-2 flex items-center text-sm">
            <WrenchScrewdriverIcon class="h-4 w-4 mr-1" />
            Mechanics
          </h5>
          <div class="space-y-1 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-600">Top:</span>
              <span class="font-medium text-gray-900 truncate ml-2">{{ getTopMechanic().name }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Status:</span>
              <span class="font-medium" :class="getMechanicDistributionColor()">{{ getMechanicDistributionStatus() }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Single Key Recommendation -->
      <div class="mt-3 p-2 bg-amber-50 rounded-lg border border-amber-200">
        <p class="text-xs text-amber-800 flex items-center">
          <LightBulbIcon class="h-3 w-3 mr-1" />
          {{ getKeyRecommendation() }}
        </p>
      </div>
    </div>

    <!-- Service Advisors Section - Simplified -->
    <div class="mb-8">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center space-x-2">
          <div class="bg-blue-100 p-2 rounded-lg">
            <UserGroupIcon class="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <h4 class="text-base font-medium text-gray-900">Service Advisors</h4>
            <p class="text-xs text-gray-600">{{ advisors.length }} aktif</p>
          </div>
        </div>
        <div class="text-right">
          <p class="text-xs text-gray-500">Total Revenue</p>
          <p class="text-sm font-bold text-blue-600">{{ formatCurrency(totalAdvisorRevenue) }}</p>
        </div>
      </div>

      <div class="space-y-3">
        <div 
          v-for="(advisor, index) in sortedAdvisors" 
          :key="advisor.id" 
          class="bg-white rounded-lg p-4 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center min-w-0 flex-1">
              <!-- Ranking & Avatar -->
              <div class="flex items-center space-x-3">
                <span 
                  class="flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold"
                  :class="getRankingStyle(index)"
                >
                  {{ index + 1 }}
                </span>
                <div class="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 text-sm font-medium">
                  {{ getInitials(advisor.name) }}
                </div>
              </div>
              
              <!-- Info -->
              <div class="ml-3 min-w-0 flex-1">
                <p class="font-medium text-gray-900 truncate">{{ advisor.name }}</p>
                <div class="flex items-center space-x-3 mt-1 text-xs text-gray-600">
                  <span>{{ advisor.orders }} orders</span>
                  <span>{{ formatPercentage(advisor.orders / totalAdvisorOrders * 100) }}</span>
                </div>
              </div>
            </div>
            
            <!-- Revenue -->
            <div class="text-right ml-4">
              <p class="text-base font-bold text-gray-900">{{ formatCurrency(advisor.revenue) }}</p>
              
              <!-- Individual Insight Button -->
              <div class="relative mt-1">
                <button 
                  @click="toggleAdvisorInsight(advisor.id)"
                  class="text-xs text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Detail
                </button>
                
                <!-- Compact Popup -->
                <div 
                  v-if="activeAdvisorInsight === advisor.id"
                  class="absolute top-6 right-0 w-48 bg-white rounded-lg shadow-xl border border-gray-200 p-3 z-40"
                >
                  <div class="flex items-center justify-between mb-2">
                    <h6 class="font-medium text-gray-900 text-xs">{{ advisor.name }}</h6>
                    <button @click="activeAdvisorInsight = null" class="text-gray-400 hover:text-gray-600">
                      <XMarkIcon class="h-3 w-3" />
                    </button>
                  </div>
                  <div class="space-y-2 text-xs">
                    <div class="flex justify-between">
                      <span class="text-gray-600">Avg per Order:</span>
                      <span class="font-medium">{{ formatCurrency(advisor.revenue / advisor.orders) }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-gray-600">Kontribusi:</span>
                      <span class="font-medium">{{ getAdvisorContribution(advisor) }}%</span>
                    </div>
                    <p class="text-blue-700 mt-2">{{ getIndividualAdvisorInsight(advisor) }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Simple Progress Bar -->
          <div class="mt-3">
            <div class="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                class="h-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-700"
                :style="{ width: `${Math.min(100, (advisor.orders / totalAdvisorOrders) * 100)}%` }"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Mechanics Section - Simplified -->
    <div>
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center space-x-2">
          <div class="bg-green-100 p-2 rounded-lg">
            <WrenchScrewdriverIcon class="h-4 w-4 text-green-600" />
          </div>
          <div>
            <h4 class="text-base font-medium text-gray-900">Mechanics</h4>
            <p class="text-xs text-gray-600">{{ mechanics.length }} aktif</p>
          </div>
        </div>
        <div class="text-right">
          <p class="text-xs text-gray-500">Total Revenue</p>
          <p class="text-sm font-bold text-green-600">{{ formatCurrency(totalMechanicRevenue) }}</p>
        </div>
      </div>

      <div class="space-y-3">
        <div 
          v-for="(mechanic, index) in sortedMechanics" 
          :key="mechanic.id" 
          class="bg-white rounded-lg p-4 border border-gray-200 hover:border-green-300 hover:shadow-md transition-all duration-200"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center min-w-0 flex-1">
              <!-- Ranking & Avatar -->
              <div class="flex items-center space-x-3">
                <span 
                  class="flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold"
                  :class="getRankingStyle(index)"
                >
                  {{ index + 1 }}
                </span>
                <div class="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center text-green-600 text-sm font-medium">
                  {{ getInitials(mechanic.name) }}
                </div>
              </div>
              
              <!-- Info -->
              <div class="ml-3 min-w-0 flex-1">
                <p class="font-medium text-gray-900 truncate">{{ mechanic.name }}</p>
                <div class="flex items-center space-x-3 mt-1 text-xs text-gray-600">
                  <span>{{ mechanic.orders }} orders</span>
                  <span>{{ formatPercentage(mechanic.orders / totalMechanicOrders * 100) }}</span>
                </div>
              </div>
            </div>
            
            <!-- Revenue -->
            <div class="text-right ml-4">
              <p class="text-base font-bold text-gray-900">{{ formatCurrency(mechanic.revenue) }}</p>
              
              <!-- Individual Insight Button -->
              <div class="relative mt-1">
                <button 
                  @click="toggleMechanicInsight(mechanic.id)"
                  class="text-xs text-green-600 hover:text-green-800 transition-colors"
                >
                  Detail
                </button>
                
                <!-- Compact Popup -->
                <div 
                  v-if="activeMechanicInsight === mechanic.id"
                  class="absolute top-6 right-0 w-48 bg-white rounded-lg shadow-xl border border-gray-200 p-3 z-40"
                >
                  <div class="flex items-center justify-between mb-2">
                    <h6 class="font-medium text-gray-900 text-xs">{{ mechanic.name }}</h6>
                    <button @click="activeMechanicInsight = null" class="text-gray-400 hover:text-gray-600">
                      <XMarkIcon class="h-3 w-3" />
                    </button>
                  </div>
                  <div class="space-y-2 text-xs">
                    <div class="flex justify-between">
                      <span class="text-gray-600">Avg per Order:</span>
                      <span class="font-medium">{{ formatCurrency(mechanic.revenue / mechanic.orders) }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-gray-600">Kontribusi:</span>
                      <span class="font-medium">{{ getMechanicContribution(mechanic) }}%</span>
                    </div>
                    <p class="text-green-700 mt-2">{{ getIndividualMechanicInsight(mechanic) }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Simple Progress Bar -->
          <div class="mt-3">
            <div class="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                class="h-2 bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-700"
                :style="{ width: `${Math.min(100, (mechanic.orders / totalMechanicOrders) * 100)}%` }"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { 
  UserGroupIcon,
  WrenchScrewdriverIcon,
  SparklesIcon,
  XMarkIcon,
  LightBulbIcon
} from '@heroicons/vue/24/outline'
import { formatCurrency, formatPercentage } from '@/utils/formatters'

const props = defineProps({
  advisors: {
    type: Array,
    default: () => []
  },
  mechanics: {
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
const activeAdvisorInsight = ref(null)
const activeMechanicInsight = ref(null)

// Close popups when clicking outside
const handleClickOutside = (event) => {
  if (!event.target.closest('.absolute') && !event.target.closest('.relative')) {
    activeAdvisorInsight.value = null
    activeMechanicInsight.value = null
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

// Computed properties
const sortedAdvisors = computed(() => 
  [...props.advisors].sort((a, b) => b.revenue - a.revenue)
)

const sortedMechanics = computed(() => 
  [...props.mechanics].sort((a, b) => b.revenue - a.revenue)
)

const totalAdvisorOrders = computed(() => 
  props.advisors.reduce((sum, advisor) => sum + advisor.orders, 0)
)

const totalMechanicOrders = computed(() => 
  props.mechanics.reduce((sum, mechanic) => sum + mechanic.orders, 0)
)

const totalAdvisorRevenue = computed(() => 
  props.advisors.reduce((sum, advisor) => sum + advisor.revenue, 0)
)

const totalMechanicRevenue = computed(() => 
  props.mechanics.reduce((sum, mechanic) => sum + mechanic.revenue, 0)
)

const totalTeamMembers = computed(() => 
  props.advisors.length + props.mechanics.length
)

// Simplified AI Analysis Functions
const getTopAdvisor = () => {
  if (props.advisors.length === 0) return { name: 'Tidak ada data' }
  return sortedAdvisors.value[0]
}

const getTopMechanic = () => {
  if (props.mechanics.length === 0) return { name: 'Tidak ada data' }
  return sortedMechanics.value[0]
}

const getAverageAdvisorRevenue = () => {
  if (props.advisors.length === 0) return 0
  return totalAdvisorRevenue.value / props.advisors.length
}

const getAverageMechanicRevenue = () => {
  if (props.mechanics.length === 0) return 0
  return totalMechanicRevenue.value / props.mechanics.length
}

const getAdvisorEfficiencyStatus = () => {
  const avgRevenue = getAverageAdvisorRevenue()
  const topRevenue = getTopAdvisor().revenue || 0
  const gap = topRevenue > 0 ? ((topRevenue - avgRevenue) / topRevenue * 100) : 0
  
  if (gap < 30) return 'Seimbang'
  if (gap < 50) return 'Cukup Baik'
  return 'Perlu Perbaikan'
}

const getAdvisorEfficiencyColor = () => {
  const status = getAdvisorEfficiencyStatus()
  if (status === 'Seimbang') return 'text-green-600'
  if (status === 'Cukup Baik') return 'text-blue-600'
  return 'text-amber-600'
}

const getMechanicDistributionStatus = () => {
  const avgRevenue = getAverageMechanicRevenue()
  const topRevenue = getTopMechanic().revenue || 0
  const gap = topRevenue > 0 ? ((topRevenue - avgRevenue) / topRevenue * 100) : 0
  
  if (gap < 40) return 'Optimal'
  if (gap < 60) return 'Baik'
  return 'Perlu Optimisasi'
}

const getMechanicDistributionColor = () => {
  const status = getMechanicDistributionStatus()
  if (status === 'Optimal') return 'text-green-600'
  if (status === 'Baik') return 'text-blue-600'
  return 'text-amber-600'
}

const getKeyRecommendation = () => {
  const advisorStatus = getAdvisorEfficiencyStatus()
  const mechanicStatus = getMechanicDistributionStatus()
  
  if (advisorStatus === 'Perlu Perbaikan') {
    return 'Fokus pada pelatihan dan mentoring advisor untuk pemerataan kinerja'
  }
  if (mechanicStatus === 'Perlu Optimisasi') {
    return 'Optimisasi distribusi pekerjaan antar mechanic berdasarkan keahlian'
  }
  return 'Tim menunjukkan performa yang baik - pertahankan momentum saat ini'
}

// Individual Analysis Functions
const toggleAdvisorInsight = (id) => {
  activeAdvisorInsight.value = activeAdvisorInsight.value === id ? null : id
  activeMechanicInsight.value = null // Close other popup
}

const toggleMechanicInsight = (id) => {
  activeMechanicInsight.value = activeMechanicInsight.value === id ? null : id
  activeAdvisorInsight.value = null // Close other popup
}

const getIndividualAdvisorInsight = (advisor) => {
  const avgRevenue = getAverageAdvisorRevenue()
  const performance = avgRevenue > 0 ? (advisor.revenue / avgRevenue) * 100 : 0
  
  if (performance >= 130) return 'Performa sangat baik di atas rata-rata tim'
  if (performance >= 90) return 'Kinerja solid sesuai standar tim'
  return 'Ada peluang peningkatan melalui training'
}

const getIndividualMechanicInsight = (mechanic) => {
  const avgRevenue = getAverageMechanicRevenue()
  const performance = avgRevenue > 0 ? (mechanic.revenue / avgRevenue) * 100 : 0
  
  if (performance >= 130) return 'Teknisi berprestasi di atas rata-rata'
  if (performance >= 90) return 'Performa konsisten sesuai standar'
  return 'Peluang pengembangan skill dan efisiensi'
}

const getAdvisorContribution = (advisor) => {
  return totalAdvisorRevenue.value > 0 ? ((advisor.revenue / totalAdvisorRevenue.value) * 100).toFixed(1) : '0'
}

const getMechanicContribution = (mechanic) => {
  return totalMechanicRevenue.value > 0 ? ((mechanic.revenue / totalMechanicRevenue.value) * 100).toFixed(1) : '0'
}

// Utility Functions
const getInitials = (name) => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const getRankingStyle = (index) => {
  if (index === 0) return 'bg-yellow-500 text-white'
  if (index === 1) return 'bg-gray-400 text-white'
  if (index === 2) return 'bg-amber-600 text-white'
  return 'bg-gray-300 text-gray-700'
}
</script>

<style scoped>
/* Smooth transitions */
.transition-all {
  transition: all 0.2s ease-in-out;
}

/* Hover effects */
.hover\:shadow-md:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

/* Progress bar animation */
.progress-bar {
  transition: width 0.7s ease-out;
}

/* Popup animation */
.absolute {
  animation: slideIn 0.2s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Mobile responsive popup */
@media (max-width: 640px) {
  .absolute.top-6.right-0 {
    position: fixed !important;
    top: 50% !important;
    left: 50% !important;
    transform: translate(-50%, -50%) !important;
    width: 85vw !important;
    max-width: 280px !important;
    z-index: 50 !important;
  }
  
  .absolute.top-6.right-0::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.3);
    z-index: -1;
  }
}

/* Focus states */
button:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}
</style>