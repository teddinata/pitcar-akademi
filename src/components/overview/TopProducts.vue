<!-- src/components/overview/TopProducts.vue -->
<template>
  <div class="p-6">
    <!-- Header Simplified -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-3 sm:space-y-0">
      <div>
        <h3 class="text-lg font-semibold text-gray-900">Top Products & Services</h3>
        <p class="text-sm text-gray-600 mt-1">Analisis performa penjualan</p>
      </div>
      <div class="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
        <!-- Tab Selector -->
        <div class="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button 
            v-for="tab in tabs" 
            :key="tab.value"
            @click="activeTab = tab.value"
            :class="[
              'px-3 py-1.5 text-sm rounded-md transition-all duration-200 flex items-center space-x-1',
              activeTab === tab.value 
                ? 'bg-white text-gray-900 shadow-sm font-medium' 
                : 'text-gray-600 hover:text-gray-900'
            ]"
          >
            <component :is="tab.icon" class="h-4 w-4" />
            <span>{{ tab.label }}</span>
            <span class="text-xs px-1.5 py-0.5 rounded-full" :class="activeTab === tab.value ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-500'">
              {{ itemCounts[tab.value] }}
            </span>
          </button>
        </div>
        
        <!-- AI Insights Toggle -->
        <button 
          @click="showInsights = !showInsights"
          class="inline-flex items-center px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 text-sm rounded-lg transition-colors"
        >
          <SparklesIcon class="h-4 w-4 mr-1" />
          {{ showInsights ? 'Sembunyikan' : 'AI Insights' }}
        </button>
      </div>
    </div>

    <!-- Compact AI Summary (Collapsible) -->
    <div v-if="showInsights" class="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 mb-6 border border-purple-200">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
        <!-- Top Performer -->
        <div class="bg-white rounded-lg p-3 border border-slate-200">
          <h5 class="font-medium text-purple-900 mb-2 flex items-center text-sm">
            <TrophyIcon class="h-4 w-4 mr-1" />
            Top Performer
          </h5>
          <div class="space-y-1 text-sm">
            <p class="font-medium text-gray-900 truncate text-xs" :title="getTopProduct().name">
              {{ getTopProduct().name }}
            </p>
            <div class="flex justify-between text-xs">
              <span class="text-gray-600">Revenue:</span>
              <span class="font-medium">{{ formatCurrency(getTopProduct().revenue || 0) }}</span>
            </div>
            <div class="flex justify-between text-xs">
              <span class="text-gray-600">Orders:</span>
              <span class="font-medium">{{ getTopProduct().orders || 0 }}</span>
            </div>
          </div>
        </div>

        <!-- Category Summary -->
        <div class="bg-white rounded-lg p-3 border border-slate-200">
          <h5 class="font-medium text-blue-900 mb-2 flex items-center text-sm">
            <ChartBarIcon class="h-4 w-4 mr-1" />
            Ringkasan
          </h5>
          <div class="space-y-1 text-sm">
            <div class="flex justify-between text-xs">
              <span class="text-gray-600">Total Items:</span>
              <span class="font-medium">{{ filteredItems.length }}</span>
            </div>
            <div class="flex justify-between text-xs">
              <span class="text-gray-600">Avg Revenue:</span>
              <span class="font-medium">{{ formatCurrency(getAverageRevenue()) }}</span>
            </div>
            <div class="flex justify-between text-xs">
              <span class="text-gray-600">Konsentrasi:</span>
              <span class="font-medium" :class="getConcentrationColor()">{{ getConcentrationStatus() }}</span>
            </div>
          </div>
        </div>

        <!-- Quick Recommendation -->
        <div class="bg-white rounded-lg p-3 border border-slate-200">
          <h5 class="font-medium text-green-900 mb-2 flex items-center text-sm">
            <LightBulbIcon class="h-4 w-4 mr-1" />
            Rekomendasi
          </h5>
          <p class="text-xs text-green-800">{{ getKeyRecommendation() }}</p>
        </div>
      </div>
    </div>

    <!-- Product List - Simplified -->
    <div class="space-y-3">
      <template v-if="filteredItems.length">
        <div 
          v-for="(item, index) in filteredItems" 
          :key="item.id"
          class="bg-white rounded-lg p-4 border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all duration-200"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-start flex-1 min-w-0">
              <!-- Ranking & Icon -->
              <div class="flex items-center space-x-3 mr-4">
                <span 
                  class="flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold"
                  :class="getRankingStyle(index)"
                >
                  {{ index + 1 }}
                </span>
                <div :class="[
                  'flex-shrink-0 rounded-lg p-2',
                  activeTab === 'services' ? 'bg-blue-100' : 'bg-green-100'
                ]">
                  <component
                    :is="activeTab === 'services' ? WrenchScrewdriverIcon : CubeIcon"
                    class="h-5 w-5"
                    :class="activeTab === 'services' ? 'text-blue-600' : 'text-green-600'"
                  />
                </div>
              </div>

              <!-- Product Info -->
              <div class="min-w-0 flex-1">
                <!-- Product Name with tooltip -->
                <div class="relative group">
                  <h4 class="text-base font-medium text-gray-900 truncate mb-2">
                    {{ item.name }}
                  </h4>
                  <!-- Simplified Tooltip -->
                  <div v-if="isNameLong(item.name)" class="tooltip absolute z-20 -top-8 left-0 bg-gray-800 text-white text-xs rounded py-1 px-2 max-w-xs opacity-0 group-hover:opacity-100 transition-opacity">
                    {{ item.name }}
                  </div>
                </div>
                
                <!-- Compact Metrics -->
                <div class="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                  <div class="flex items-center">
                    <ShoppingBagIcon class="h-4 w-4 mr-1" />
                    <span class="font-medium">{{ item.orders }}</span>
                    <span class="ml-1">orders</span>
                  </div>
                  <div class="flex items-center" v-if="totalOrders">
                    <span class="font-medium">{{ formatPercentage(item.orders / totalOrders * 100) }}</span>
                    <span class="ml-1">share</span>
                  </div>
                  <div class="flex items-center">
                    <CurrencyDollarIcon class="h-4 w-4 mr-1" />
                    <span class="font-medium">{{ formatCurrency(item.revenue / item.orders) }}</span>
                    <span class="ml-1">avg</span>
                  </div>
                </div>

                <!-- Simple Progress Bar -->
                <div class="mt-3">
                  <div class="flex justify-between text-xs mb-1">
                    <span class="text-gray-600">Kontribusi</span>
                    <span class="font-medium" :class="activeTab === 'services' ? 'text-blue-600' : 'text-green-600'">
                      {{ formatPercentage(item.revenue / totalRevenue * 100) }}
                    </span>
                  </div>
                  <div class="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      class="h-2 rounded-full transition-all duration-1000"
                      :class="activeTab === 'services' ? 'bg-gradient-to-r from-blue-500 to-blue-600' : 'bg-gradient-to-r from-green-500 to-green-600'"
                      :style="{ width: `${Math.min(100, (item.revenue / totalRevenue) * 100)}%` }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Revenue & Detail -->
            <div class="text-right ml-4">
              <p class="text-lg font-bold text-gray-900 mb-1">
                {{ formatCurrency(item.revenue) }}
              </p>
              
              <!-- Detail Button -->
              <div class="relative">
                <button 
                  @click="toggleItemInsight(item.id)"
                  :class="[
                    'text-xs hover:underline transition-colors',
                    activeTab === 'services' ? 'text-blue-600 hover:text-blue-800' : 'text-green-600 hover:text-green-800'
                  ]"
                >
                  Detail
                </button>
                
                <!-- Compact Item Popup -->
                <div 
                  v-if="activeItemInsight === item.id"
                  class="absolute top-6 right-0 w-52 bg-white rounded-lg shadow-xl border border-gray-200 p-3 z-40"
                >
                  <div class="flex items-center justify-between mb-2">
                    <h6 class="font-medium text-gray-900 text-xs truncate">{{ item.name }}</h6>
                    <button @click="activeItemInsight = null" class="text-gray-400 hover:text-gray-600 ml-2">
                      <XMarkIcon class="h-3 w-3" />
                    </button>
                  </div>
                  <div class="space-y-2 text-xs">
                    <div class="flex justify-between">
                      <span class="text-gray-600">Total Revenue:</span>
                      <span class="font-medium">{{ formatCurrency(item.revenue) }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-gray-600">Avg per Order:</span>
                      <span class="font-medium">{{ formatCurrency(item.revenue / item.orders) }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-gray-600">Market Share:</span>
                      <span class="font-medium">{{ getItemContribution(item) }}%</span>
                    </div>
                    <div v-if="activeTab === 'services' && item.flat_rate_hours" class="flex justify-between">
                      <span class="text-gray-600">Flat Rate:</span>
                      <span class="font-medium">{{ item.flat_rate_hours.toFixed(1) }}j</span>
                    </div>
                    <div class="pt-2 border-t border-gray-100">
                      <p :class="activeTab === 'services' ? 'text-blue-700' : 'text-green-700'">
                        {{ getItemPerformanceAnalysis(item) }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- Simplified Empty State -->
      <div v-else class="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <InboxIcon class="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 class="text-base font-medium text-gray-900 mb-2">Tidak Ada Data</h3>
        <p class="text-gray-600 text-sm">
          Tidak ada {{ activeTab === 'services' ? 'layanan' : 'produk' }} ditemukan untuk periode ini.
        </p>
      </div>
    </div>

    <!-- Compact Summary Section -->
    <div v-if="filteredItems.length" class="mt-6 pt-4 border-t border-gray-200">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div class="bg-blue-50 rounded-lg p-3 text-center">
          <p class="text-xs text-blue-600 mb-1">Total Revenue</p>
          <p class="text-base font-bold text-blue-900">{{ formatCurrency(totalRevenue) }}</p>
        </div>
        
        <div class="bg-green-50 rounded-lg p-3 text-center">
          <p class="text-xs text-green-600 mb-1">Total Orders</p>
          <p class="text-base font-bold text-green-900">{{ formatNumber(totalOrders) }}</p>
        </div>

        <div class="bg-purple-50 rounded-lg p-3 text-center">
          <p class="text-xs text-purple-600 mb-1">Avg Revenue</p>
          <p class="text-base font-bold text-purple-900">{{ formatCurrency(getAverageRevenue()) }}</p>
        </div>

        <div class="bg-amber-50 rounded-lg p-3 text-center">
          <p class="text-xs text-amber-600 mb-1">Top 3 Share</p>
          <p class="text-base font-bold text-amber-900">{{ formatPercentage(getTop3Share()) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { 
  WrenchScrewdriverIcon,
  CubeIcon,
  ShoppingBagIcon,
  ChartBarIcon,
  InboxIcon,
  SparklesIcon,
  XMarkIcon,
  CurrencyDollarIcon,
  TrophyIcon,
  LightBulbIcon
} from '@heroicons/vue/24/outline'
import { formatCurrency, formatPercentage, formatNumber } from '@/utils/formatters'

const props = defineProps({
  data: {
    type: Object,
    default: () => ({
      top_data: {
        products: {
          services: [],
          physical: []
        }
      }
    })
  },
  loading: {
    type: Boolean,
    default: false
  }
})

// State
const activeTab = ref('services')
const showInsights = ref(false)
const activeItemInsight = ref(null)

// Tabs configuration
const tabs = [
  { 
    label: 'Services', 
    value: 'services',
    icon: WrenchScrewdriverIcon
  },
  { 
    label: 'Products', 
    value: 'physical',
    icon: CubeIcon
  }
]

// Close popups when clicking outside
const handleClickOutside = (event) => {
  if (!event.target.closest('.absolute') && !event.target.closest('.relative')) {
    activeItemInsight.value = null
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

// Computed properties
const getProductsData = computed(() => {
  return props.data?.top_data?.products || { services: [], physical: [] }
})

const filteredItems = computed(() => {
  const products = getProductsData.value
  return products[activeTab.value] || []
})

const itemCounts = computed(() => {
  const products = getProductsData.value
  return {
    services: products.services?.length || 0,
    physical: products.physical?.length || 0
  }
})

const totalOrders = computed(() => 
  filteredItems.value.reduce((sum, item) => sum + (Number(item.orders) || 0), 0)
)

const totalRevenue = computed(() => 
  filteredItems.value.reduce((sum, item) => sum + (Number(item.revenue) || 0), 0)
)

// Simplified AI Analysis Functions
const getTopProduct = () => {
  if (filteredItems.value.length === 0) return { name: 'Tidak ada data', revenue: 0, orders: 0 }
  return filteredItems.value[0]
}

const getAverageRevenue = () => {
  if (filteredItems.value.length === 0) return 0
  return totalRevenue.value / filteredItems.value.length
}

const getTop3Share = () => {
  if (filteredItems.value.length === 0) return 0
  const top3Revenue = filteredItems.value.slice(0, 3).reduce((sum, item) => sum + item.revenue, 0)
  return (top3Revenue / totalRevenue.value) * 100
}

const getConcentrationStatus = () => {
  const top3Share = getTop3Share()
  if (top3Share >= 70) return 'Tinggi'
  if (top3Share >= 50) return 'Sedang'
  return 'Rendah'
}

const getConcentrationColor = () => {
  const status = getConcentrationStatus()
  if (status === 'Tinggi') return 'text-red-600'
  if (status === 'Sedang') return 'text-amber-600'
  return 'text-green-600'
}

const getKeyRecommendation = () => {
  const concentration = getConcentrationStatus()
  const avgRevenue = getAverageRevenue()
  
  if (concentration === 'Tinggi') {
    return 'Diversifikasi portfolio untuk mengurangi risiko'
  }
  
  if (activeTab.value === 'services') {
    if (avgRevenue < 5000000) {
      return 'Pertimbangkan bundling layanan untuk nilai lebih tinggi'
    }
    return 'Optimisasi efisiensi operasional layanan'
  } else {
    // if (avgRevenue <script 2000000) {
    //   return 'Evaluasi strategi pricing dan margin produk'
    // }
    if (avgRevenue < 2000000) {
      return 'Evaluasi strategi pricing dan margin produk'
    }
    return 'Focus pada inventory turnover dan volume'
  }
}

// Individual Item Analysis
const toggleItemInsight = (id) => {
  activeItemInsight.value = activeItemInsight.value === id ? null : id
}

const getItemPerformanceAnalysis = (item) => {
  const avgRevenue = getAverageRevenue()
  const performance = avgRevenue > 0 ? (item.revenue / avgRevenue) * 100 : 0
  
  if (performance >= 150) return `Performa sangat baik ${performance.toFixed(0)}% di atas rata-rata`
  if (performance >= 100) return `Kinerja solid sesuai standar kategori`
  return `Peluang peningkatan ${(100 - performance).toFixed(0)}% gap dari rata-rata`
}

const getItemContribution = (item) => {
  return totalRevenue.value > 0 ? ((item.revenue / totalRevenue.value) * 100).toFixed(1) : '0'
}

// Utility Functions
const isNameLong = (name) => {
  return name && name.length > 25
}

const getRankingStyle = (index) => {
  if (index === 0) return 'bg-yellow-500 text-white'
  if (index === 1) return 'bg-gray-400 text-white'
  if (index === 2) return 'bg-amber-600 text-white'
  return 'bg-gray-300 text-gray-700'
}

</script>