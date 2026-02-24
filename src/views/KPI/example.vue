<!-- ============================================================================
FILE: src/views/KPIOutletDashboard.vue
VERSION: 3.0.2 - PURE V3 (NO CALCULATE NEEDED)
============================================================================ -->

<template>
  <div class="min-h-screen bg-[#f4f5f5]">
    <!-- Toast -->
    <Toast
      v-model:show="toast.show"
      :message="toast.message"
      :type="toast.type"
      :duration="toast.duration"
    />
    
    <!-- Header -->
    <div class="bg-white shadow-sm border-b border-gray-200">
      <div class="w-full max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex flex-col space-y-4 lg:space-y-0 lg:flex-row lg:items-center lg:justify-between">
          <!-- Title -->
          <div class="space-y-1">
            <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">
              KPI Outlet Dashboard
            </h1>
            <p class="text-sm text-gray-500">
              Monitor performance metrics untuk setiap outlet (V3 - Real-time)
            </p>
          </div>
          
          <!-- Controls -->
          <div class="flex flex-wrap gap-3 items-center">
            <!-- Outlet -->
            <div class="relative">
              <label class="block text-xs font-medium text-gray-700 mb-1">
                Outlet
              </label>
              <select
                v-model="filters.store_id"
                @change="handleStoreChange"
                class="w-full sm:w-48 rounded-lg border-gray-300 shadow-sm text-sm focus:border-[#b70000] focus:ring-[#b70000]"
              >
                <option value="">Pilih Outlet</option>
                <option v-for="store in stores" :key="store.id" :value="store.id">
                  {{ store.name }}
                </option>
              </select>
            </div>

            <!-- Month -->
            <div class="relative">
              <label class="block text-xs font-medium text-gray-700 mb-1">
                Bulan
              </label>
              <select
                v-model="filters.month"
                @change="handlePeriodChange"
                class="w-full sm:w-36 rounded-lg border-gray-300 shadow-sm text-sm focus:border-[#b70000] focus:ring-[#b70000]"
              >
                <option v-for="(month, index) in months" :key="index" :value="index + 1">
                  {{ month }}
                </option>
              </select>
            </div>

            <!-- Year -->
            <div class="relative">
              <label class="block text-xs font-medium text-gray-700 mb-1">
                Tahun
              </label>
              <select
                v-model="filters.year"
                @change="handlePeriodChange"
                class="w-full sm:w-28 rounded-lg border-gray-300 shadow-sm text-sm focus:border-[#b70000] focus:ring-[#b70000]"
              >
                <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
              </select>
            </div>

            <!-- Action Buttons (NO CALCULATE!) -->
            <div class="flex gap-2 mt-5">
              <!-- ✅ HANYA REFRESH -->
              <button
                @click="loadKPIData"
                :disabled="loading || !filters.store_id"
                class="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#b70000] hover:bg-[#950000] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#b70000] disabled:opacity-50"
              >
                <ArrowPathIcon 
                  class="h-4 w-4 mr-2" 
                  :class="{ 'animate-spin': loading }" 
                />
                Refresh
              </button>

              <button
                @click="exportToCSV"
                :disabled="!kpiData || isExporting"
                class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#b70000] disabled:opacity-50"
              >
                <DocumentArrowDownIcon
                  class="h-4 w-4 mr-2"
                  :class="{ 'animate-spin': isExporting }"
                />
                Export CSV
              </button>

              <button
                @click="resetFilters"
                class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
              >
                <BackspaceIcon class="h-4 w-4 mr-2" />
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <main class="container max-w-full mx-auto px-4 py-6 sm:py-8">
      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center h-96">
        <div class="text-center">
          <div class="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#b70000] mx-auto"></div>
          <p class="mt-4 text-gray-600">Memuat data KPI...</p>
        </div>
      </div>

      <!-- Data Loaded -->
      <template v-else-if="kpiData">
        <!-- ... (keep ALL existing UI sama) ... -->
        <!-- Daily Progress Card, Overview Cards, KPI Cards, Table, Insights -->
      </template>

      <!-- No Data State (SIMPLIFIED - NO CALCULATE BUTTON!) -->
      <template v-else>
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div class="max-w-md mx-auto">
            <div class="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <ChartBarIcon class="h-8 w-8 text-gray-400" />
            </div>
            <h3 class="text-lg font-bold text-gray-900 mb-2">Belum Ada Data KPI</h3>
            <p class="text-sm text-gray-500 mb-6">
              Data KPI untuk periode ini belum diinput. Silakan input data manual (Profit, CSAT, Turnover, SDM) menggunakan tombol Edit pada masing-masing KPI card.
            </p>
            <p v-if="!filters.store_id" class="text-sm text-amber-600 font-medium">
              Pilih outlet terlebih dahulu
            </p>
          </div>
        </div>
      </template>
    </main>

    <!-- ❌ NO Calculate Modal -->

    <!-- ✅ ONLY Edit Modal V3 -->
    <EditKPIModalV3
      v-if="showEditModal"
      :kpi="editingKPI"
      :store-id="filters.store_id"
      :month="filters.month"
      :year="filters.year"
      @close="closeEditModal"
      @save="handleSaveKPI"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
// ... (imports sama)

const loading = ref(false)
const isExporting = ref(false)
// ❌ REMOVE: isCalculating
// ❌ REMOVE: showCalculateModal
const stores = ref([])
const kpiData = ref(null)
const showEditModal = ref(false)
const editingKPI = ref(null)

const filters = ref({
  store_id: '',  // ✅ KEEP store_id (backend support both)
  month: new Date().getMonth() + 1,
  year: new Date().getFullYear()
})

// ========================================
// API CALLS
// ========================================

const loadKPIData = async () => {
  if (!filters.value.store_id) {
    return
  }

  try {
    loading.value = true
    
    // ✅ V3 ENDPOINT (backend support store_id)
    const response = await apiClient.post('/api/v3/kpi/dashboard', {
      jsonrpc: '2.0',
      method: 'call',
      params: {
        store_id: parseInt(filters.value.store_id),  // ✅ Backend support this
        date: `${filters.value.year}-${String(filters.value.month).padStart(2, '0')}-15`
      }
    })

    if (response.data.result.success) {
      kpiData.value = transformV3Response(response.data.result.data)
      
      showToast({
        message: 'Data KPI berhasil dimuat',
        type: 'success',
        duration: 2000
      })
    } else {
      kpiData.value = null
    }
  } catch (error) {
    console.error('Error loading KPI data:', error)
    kpiData.value = null
    
    if (error.response?.status !== 404) {
      showToast({
        message: error.response?.data?.result?.error || 'Terjadi kesalahan saat memuat data',
        type: 'error'
      })
    }
  } finally {
    loading.value = false
  }
}

// ❌ REMOVE: openCalculateModal
// ❌ REMOVE: closeCalculateModal
// ❌ REMOVE: handleKPICalculated

// ✅ KEEP: handleSaveKPI, openEditModal, etc. (semua edit functions)

onMounted(async () => {
  await loadStores()
})
</script>

