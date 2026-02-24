<!-- ============================================================================
FILE: src/components/EditKPIModalV3.vue
VERSION: 3.1.0 - FIXED: Data persistence + Consistent Pitcar Red Theme
============================================================================ -->

<template>
  <TransitionRoot :show="show" as="template">
    <Dialog as="div" class="relative z-50" @close="closeModal">
      <!-- Backdrop -->
      <TransitionChild
        as="template"
        enter="ease-out duration-300"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="ease-in duration-200"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black/40 backdrop-blur-sm" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4">
          <TransitionChild
            as="template"
            enter="ease-out duration-300"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="ease-in duration-200"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
          >
            <DialogPanel class="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">
              
              <!-- Header - Pitcar Red -->
              <div class="bg-gradient-to-r from-[#b70000] to-[#950000] px-6 py-5">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <div class="p-2 bg-white/20 rounded-lg">
                      <component 
                        :is="getKPIIcon(kpi?.name)" 
                        class="h-6 w-6 text-white"
                      />
                    </div>
                    <div>
                      <DialogTitle class="text-xl font-bold text-white">
                        Edit {{ kpi?.name }}
                      </DialogTitle>
                      <p class="text-sm text-white/80 mt-0.5">
                        {{ getKPISubtitle(kpi?.name) }}
                      </p>
                    </div>
                  </div>
                  <button
                    @click="closeModal"
                    class="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <XMarkIcon class="h-5 w-5 text-white" />
                  </button>
                </div>
              </div>

              <!-- Loading State -->
              <div v-if="loading" class="px-6 py-12">
                <div class="text-center">
                  <div class="animate-spin h-12 w-12 border-4 border-[#b70000] border-t-transparent rounded-full mx-auto"></div>
                  <p class="mt-4 text-sm text-gray-600">Memuat data existing...</p>
                </div>
              </div>

              <!-- Form Content -->
              <div v-else class="px-6 py-6">
                
                <!-- ========================================
                     PROFIT INPUT
                ======================================== -->
                <div v-if="kpi?.name === 'Profit'" class="space-y-4">
                  <!-- Current Values Info -->
                  <div class="grid grid-cols-2 gap-3">
                    <!-- Current TARGET -->
                    <div class="bg-blue-50 rounded-xl p-4 border border-blue-200">
                      <div class="text-xs font-medium text-blue-700 mb-1">Target Bulanan</div>
                      <div class="text-lg font-bold text-blue-900">
                        {{ formatCurrency(formData.target_profit) }}
                      </div>
                    </div>
                    
                    <!-- Current VALUE (readonly) -->
                    <div class="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <div class="text-xs font-medium text-gray-700 mb-1">Actual (Accounting)</div>
                      <div class="text-lg font-bold text-gray-900">
                        {{ formatCurrency(kpi.value) }}
                      </div>
                    </div>
                  </div>

                  <!-- ⭐ Input TARGET -->
                  <div>
                    <label class="block text-sm font-semibold text-gray-900 mb-2">
                      <CurrencyDollarIcon class="h-4 w-4 inline mr-1" />
                      Update Target Profit Bulanan (Rp)
                    </label>
                    
                    <div class="relative">
                      <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <span class="text-gray-500 font-medium">Rp</span>
                      </div>
                      <input
                        v-model="formData.target_profit"
                        @input="handleTargetInput"
                        type="text"
                        class="w-full pl-12 pr-4 py-3 text-lg font-semibold border-2 border-gray-300 rounded-xl focus:border-[#b70000] focus:ring-4 focus:ring-[#b70000]/10 transition-all"
                        placeholder="0"
                      />
                    </div>
                    
                    <div class="mt-2 text-sm text-gray-600">
                      <span class="font-medium">Preview:</span>
                      <span class="ml-2 font-bold text-gray-900">
                        {{ formatCurrency(formData.target_profit) }}
                      </span>
                    </div>
                  </div>

                  <!-- Quick Amount Buttons -->
                  <div class="grid grid-cols-4 gap-2">
                    <button
                      v-for="amount in [50000000, 110000000, 165000000, 200000000]"
                      :key="amount"
                      @click="formData.target_profit = amount; handleTargetInput = formatNumber(amount)"
                      type="button"
                      class="px-3 py-2 text-xs font-medium bg-gray-100 hover:bg-[#b70000] hover:text-white rounded-lg transition-colors"
                    >
                      {{ formatCurrencyShort(amount) }}
                    </button>
                  </div>

                  <!-- Info Box -->
                  <div class="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <div class="flex items-start gap-2">
                      <InformationCircleIcon class="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div class="text-sm text-amber-900">
                        <strong>Catatan:</strong> Anda mengupdate <strong>TARGET</strong> profit bulanan. 
                        Nilai actual profit dihitung otomatis dari data accounting (Revenue - COGS - OpEx).
                      </div>
                    </div>
                  </div>
                </div>

                <!-- ========================================
                     LEAD TIME INPUT
                ======================================== -->
                <div v-if="kpi?.name === 'Lead Time'" class="space-y-4">
                  <div class="bg-blue-50 rounded-xl p-4 border border-blue-200">
                     <p class="text-sm text-blue-800">
                       Input ini hanya untuk display di dashboard (informational).
                       Data real tetap diambil otomatis dari sistem.
                     </p>
                  </div>

                  <!-- First Response -->
                  <div>
                    <label class="block text-sm font-semibold text-gray-900 mb-2">
                       Rata-rata First Response Time (Menit)
                    </label>
                    <input
                      v-model.number="formData.lead_time_first_response"
                      type="number"
                      step="1"
                      class="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-[#b70000] transition-all"
                      placeholder="Contoh: 5"
                    />
                  </div>
                  
                  <!-- Avg Response -->
                  <div>
                    <label class="block text-sm font-semibold text-gray-900 mb-2">
                       Rata-rata Response Time (Menit)
                    </label>
                    <input
                      v-model.number="formData.lead_time_avg_response"
                      type="number"
                      step="1"
                      class="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-[#b70000] transition-all"
                      placeholder="Contoh: 15"
                    />
                  </div>
                </div>

                <!-- ========================================
                     SAMPLING INPUT
                ======================================== -->
                <div v-if="kpi?.name === 'Sampling Quantity' || kpi?.name === 'Sampling Internal'" class="space-y-4">
                  <div>
                    <label class="block text-sm font-semibold text-gray-900 mb-2">
                       Target Sampling Bulanan (Qty)
                    </label>
                    <input
                      v-model.number="formData.sampling_target"
                      type="number"
                      step="1"
                      class="w-full px-4 py-3 text-2xl font-bold text-center border-2 border-gray-300 rounded-xl focus:border-[#b70000] transition-all"
                    />
                    <p class="text-xs text-gray-500 mt-2 text-center">
                      Target jumlah sampling yang harus dilakukan oleh tim per bulan.
                    </p>
                  </div>
                  
                  <div class="flex flex-wrap gap-2 justify-center">
                     <button
                       v-for="val in [20, 25, 30, 40, 50]"
                       :key="val"
                       @click="formData.sampling_target = val"
                       type="button"
                       class="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-semibold"
                     >
                       {{ val }}
                     </button>
                  </div>
                </div>

                <!-- ========================================
                     CSAT INPUT
                ======================================== -->
                <div v-if="kpi?.name === 'CSAT'" class="space-y-5">
                  <!-- Current Value Info -->
                  <div class="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div class="flex items-center justify-between mb-2">
                      <span class="text-sm font-medium text-gray-700">Current Rating</span>
                      <div class="flex items-center gap-2">
                        <span class="text-2xl">{{ getRatingEmoji(formData.csat_value) }}</span>
                        <span class="text-lg font-bold text-gray-900">
                          {{ formData.csat_value.toFixed(1) }}/5.0
                        </span>
                      </div>
                    </div>
                    <div class="text-xs text-gray-500">
                      Rating CSAT saat ini yang tersimpan
                    </div>
                  </div>

                  <!-- Star Rating Input -->
                  <div>
                    <label class="block text-sm font-semibold text-gray-900 mb-3 text-center">
                      Update Rating CSAT
                    </label>
                    
                    <!-- Star Display -->
                    <div class="flex items-center justify-center gap-3 mb-4">
                      <button
                        v-for="star in 5"
                        :key="star"
                        @click="formData.csat_value = star"
                        type="button"
                        class="transition-all duration-200 hover:scale-110"
                      >
                        <StarIcon
                          :class="[
                            'h-12 w-12 transition-colors',
                            star <= Math.floor(formData.csat_value)
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-gray-300'
                          ]"
                        />
                      </button>
                    </div>

                    <!-- Numeric Input for Decimal -->
                    <div class="max-w-xs mx-auto">
                      <label class="block text-xs font-medium text-gray-600 mb-2 text-center">
                        Atau input nilai decimal (0.0 - 5.0)
                      </label>
                      <input
                        v-model.number="formData.csat_value"
                        type="number"
                        step="0.1"
                        min="0"
                        max="5"
                        class="w-full text-center text-2xl font-bold border-2 border-gray-300 rounded-xl py-3 focus:border-[#b70000] focus:ring-4 focus:ring-[#b70000]/10"
                      />
                    </div>
                  </div>

                  <!-- Rating Description -->
                  <div class="bg-white border-2 border-gray-200 rounded-xl p-4">
                    <div class="flex items-center gap-3">
                      <div class="text-4xl">{{ getRatingEmoji(formData.csat_value) }}</div>
                      <div class="flex-1">
                        <div class="font-bold text-gray-900 text-lg">
                          {{ getRatingLabel(formData.csat_value) }}
                        </div>
                        <div class="text-sm text-gray-600">
                          {{ getRatingDescription(formData.csat_value) }}
                        </div>
                      </div>
                    </div>
                  </div>
                  <!-- ⭐ Google Rating Input -->
                   <div class="pt-4 border-t border-gray-200">
                     <label class="block text-sm font-semibold text-gray-900 mb-3 text-center">
                        Input Google Rating (Manual)
                     </label>
                     
                     <div class="max-w-xs mx-auto">
                        <input
                          v-model.number="formData.google_rating"
                          type="number"
                          step="0.1"
                          min="0"
                          max="5"
                          class="w-full text-center text-xl font-bold border-2 border-gray-300 rounded-xl py-2 focus:border-[#b70000] focus:ring-4"
                          placeholder="e.g. 4.8"
                        />
                        <p class="text-xs text-center text-gray-500 mt-1">
                          Rating dari Google Review periode ini
                        </p>
                     </div>
                   </div>
                </div>

                <!-- ========================================
                     TURNOVER INPUT
                ======================================== -->
                <div v-if="kpi?.name === 'Turnover'" class="space-y-5">
                  <!-- Current Value Info -->
                  <div class="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div class="flex items-center justify-between mb-2">
                      <span class="text-sm font-medium text-gray-700">Current Rate</span>
                      <span class="text-lg font-bold text-gray-900">
                        {{ formData.turnover_value.toFixed(1) }}%
                      </span>
                    </div>
                    <div class="text-xs text-gray-500">
                      Turnover rate saat ini yang tersimpan
                    </div>
                  </div>

                  <!-- Slider Input -->
                  <div>
                    <label class="block text-sm font-semibold text-gray-900 mb-3">
                      Update Turnover Rate (%)
                    </label>
                    
                    <!-- Value Display -->
                    <div class="text-center mb-4">
                      <div class="inline-flex items-baseline gap-2">
                        <span class="text-5xl font-bold text-gray-900">
                          {{ formData.turnover_value.toFixed(1) }}
                        </span>
                        <span class="text-2xl font-medium text-gray-500">%</span>
                      </div>
                      <div class="text-sm text-gray-600 mt-1">
                        Target: ≤ {{ kpi.target }}% (lower is better)
                      </div>
                    </div>

                    <!-- Slider -->
                    <div class="relative pt-1">
                      <input
                        v-model.number="formData.turnover_value"
                        type="range"
                        min="0"
                        max="30"
                        step="0.1"
                        class="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb"
                      />
                      <div class="flex justify-between text-xs text-gray-500 mt-2">
                        <span>0%</span>
                        <span>15%</span>
                        <span>30%</span>
                      </div>
                    </div>

                    <!-- Numeric Input -->
                    <div class="mt-4">
                      <input
                        v-model.number="formData.turnover_value"
                        type="number"
                        step="0.1"
                        min="0"
                        max="30"
                        class="w-full text-center text-xl font-bold border-2 border-gray-300 rounded-xl py-3 focus:border-[#b70000] focus:ring-4 focus:ring-[#b70000]/10"
                      />
                    </div>
                  </div>
                </div>

                <!-- ========================================
                     SDM INPUT
                ======================================== -->
                
                <!-- ⭐ NEW SDM INPUT (BREAKDOWN) -->
                <div v-if="kpi?.name === 'Pengembangan SDM'" class="space-y-6">
                  <!-- Info -->
                  <div class="bg-blue-50 p-4 rounded-xl border border-blue-200">
                    <p class="text-sm text-blue-800">
                      <strong>Formula Baru:</strong> Score adalah rata-rata dari 3 komponen di bawah ini.
                    </p>
                  </div>

                  <!-- 1. Dokumentasi Kasus -->
                  <div>
                    <label class="flex justify-between text-sm font-semibold text-gray-900 mb-1">
                      <span>Dokumentasi Kasus</span>
                      <span class="text-[#b70000]">{{ formData.sdm_case_doc }}</span>
                    </label>
                    <input 
                      type="range" min="0" max="100" v-model.number="formData.sdm_case_doc" 
                      class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb"
                    />
                  </div>

                  <!-- 2. Delivery -->
                  <div>
                    <label class="flex justify-between text-sm font-semibold text-gray-900 mb-1">
                      <span>Delivery</span>
                      <span class="text-[#b70000]">{{ formData.sdm_delivery }}</span>
                    </label>
                    <input 
                      type="range" min="0" max="100" v-model.number="formData.sdm_delivery" 
                      class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb"
                    />
                  </div>

                  <!-- 3. Result -->
                  <div>
                    <label class="flex justify-between text-sm font-semibold text-gray-900 mb-1">
                      <span>Result</span>
                      <span class="text-[#b70000]">{{ formData.sdm_result }}</span>
                    </label>
                    <input 
                      type="range" min="0" max="100" v-model.number="formData.sdm_result" 
                      class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb"
                    />
                  </div>
                  
                  <!-- Avg Preview -->
                  <div class="mt-4 p-3 bg-gray-50 rounded-xl text-center">
                    <span class="text-xs text-gray-500">Preview Score SDM</span>
                    <div class="text-2xl font-bold text-gray-900">
                      {{ ((formData.sdm_case_doc + formData.sdm_delivery + formData.sdm_result) / 3).toFixed(1) }}%
                    </div>
                  </div>
                </div>

              </div>

              <!-- Footer Actions -->
              <div class="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3">
                <button
                  @click="closeModal"
                  type="button"
                  class="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Batal
                </button>
                <button
                  @click="handleSave"
                  :disabled="saving"
                  type="button"
                  class="flex-1 px-6 py-3 bg-gradient-to-r from-[#b70000] to-[#950000] text-white rounded-xl text-sm font-semibold hover:from-[#950000] hover:to-[#7a0000] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
                >
                  <span v-if="saving" class="flex items-center justify-center gap-2">
                    <svg class="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    Menyimpan...
                  </span>
                  <span v-else>
                    💾 Simpan Data
                  </span>
                </button>
              </div>

            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { 
  Dialog, 
  DialogPanel, 
  DialogTitle, 
  TransitionRoot, 
  TransitionChild 
} from '@headlessui/vue'
import {
  XMarkIcon,
  CurrencyDollarIcon,
  FaceSmileIcon,
  ArrowTrendingUpIcon,
  UserGroupIcon,
  ClockIcon,
  StarIcon,
  ClipboardDocumentCheckIcon
} from '@heroicons/vue/24/outline'
import apiClient from '@/config/api'

const props = defineProps({
  show: Boolean,
  kpi: Object,
  storeId: [Number, String],
  month: [Number, String],
  year: [Number, String]
})

const emit = defineEmits(['close', 'save'])

// State
const loading = ref(false)
const saving = ref(false)
const profitInput = ref('')
const targetInput = ref('')

// ⭐ Store ALL KPI values to preserve data
const formData = ref({
  target_profit: 0,
  csat_value: 0,
  google_rating: 0,
  turnover_value: 0,
  sdm_value: 0,
  
  // NEW FIELDS
  lead_time_first_response: 0,
  lead_time_avg_response: 0,
  sampling_target: 25,
  sdm_case_doc: 0,
  sdm_delivery: 0,
  sdm_result: 0
})

// Computed for circular progress
const circumference = computed(() => 2 * Math.PI * 70)

// ========================================
// ⭐ CRITICAL: LOAD EXISTING VALUES
// ========================================
watch(() => props.show, async (newVal) => {
  if (newVal && props.storeId) {
    await loadExistingValues()
  }
})

const loadExistingValues = async () => {
  loading.value = true
  
  try {
    const response = await apiClient.post('/web/v3/kpi/dashboard', {
      jsonrpc: '2.0',
      method: 'call',
      params: {
        store_id: parseInt(props.storeId),
        date: `${props.year}-${String(props.month).padStart(2, '0')}-15`
      }
    })
    
    if (response.data.result.success) {
      const kpis = response.data.result.data.kpis
      
      const profitKPI = kpis.find(k => k.name === 'Profit')
      const csatKPI = kpis.find(k => k.name === 'CSAT')
      const turnoverKPI = kpis.find(k => k.name === 'Turnover')
      const sdmKPI = kpis.find(k => k.name === 'Pengembangan SDM')
      
      // ⭐ PROFIT: Load TARGET, bukan value
      formData.value = {
        target_profit: profitKPI?.target_profit,
        csat_value: csatKPI?.value || 0,
        google_rating: csatKPI?.breakdown?.google || 0,
        turnover_value: turnoverKPI?.value || 0,
        sdm_value: sdmKPI?.value || 0,
        
        // NEW FIELDS
        lead_time_first_response: kpis.find(k => k.name === 'Lead Time')?.detail?.manual_inputs?.first_response || 0,
        lead_time_avg_response: kpis.find(k => k.name === 'Lead Time')?.detail?.manual_inputs?.avg_response || 0,
        sampling_target: kpis.find(k => k.name === 'Sampling Quantity')?.target_qty || 25,
        sdm_case_doc: sdmKPI?.breakdown?.doc || 0,
        sdm_delivery: sdmKPI?.breakdown?.delivery || 0,
        sdm_result: sdmKPI?.breakdown?.result || 0
      }
      
      // Set profit input display (TARGET)
      targetInput.value = formatNumber(formData.value.target_profit)
      
      console.log('✅ Loaded existing values:', formData.value)
    }
  } catch (error) {
    console.error('Error loading existing values:', error)
  } finally {
    loading.value = false
  }
}


// ========================================
// FORMATTING HELPERS
// ========================================
const formatCurrency = (value) => {
  if (!value) return 'Rp 0'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(value)
}

const formatCurrencyShort = (value) => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(0)}M`
  }
  return formatCurrency(value)
}

const formatNumber = (value) => {
  if (!value) return ''
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

const handleProfitInput = (e) => {
  const value = e.target.value.replace(/,/g, '')
  if (!isNaN(value)) {
    formData.value.profit_value = parseFloat(value) || 0
    profitInput.value = formatNumber(value)
  }
}

const handleTargetInput = (e) => {
  const value = e.target.value.replace(/,/g, '')
  if (!isNaN(value)) {
    formData.value.profit_value = parseFloat(value) || 0
    targetInput.value = formatNumber(value)
  }
}

// ========================================
// CSAT RATING HELPERS
// ========================================
const getRatingEmoji = (rating) => {
  if (rating >= 4.5) return '🤩'
  if (rating >= 4.0) return '😊'
  if (rating >= 3.5) return '🙂'
  if (rating >= 3.0) return '😐'
  if (rating >= 2.0) return '😕'
  return '😞'
}

const getRatingLabel = (rating) => {
  if (rating >= 4.5) return 'Excellent!'
  if (rating >= 4.0) return 'Very Good'
  if (rating >= 3.5) return 'Good'
  if (rating >= 3.0) return 'Fair'
  if (rating >= 2.0) return 'Poor'
  return 'Very Poor'
}

const getRatingDescription = (rating) => {
  if (rating >= 4.5) return 'Pelanggan sangat puas dengan layanan'
  if (rating >= 4.0) return 'Pelanggan puas dengan layanan'
  if (rating >= 3.5) return 'Pelanggan cukup puas, masih ada ruang improvement'
  if (rating >= 3.0) return 'Pelanggan merasa biasa saja'
  if (rating >= 2.0) return 'Pelanggan kurang puas, perlu perbaikan'
  return 'Pelanggan tidak puas, segera lakukan perbaikan'
}

// ========================================
// GENERAL HELPERS
// ========================================
const getKPIIcon = (kpiName) => {
  const icons = {
    'Profit': CurrencyDollarIcon,
    'CSAT': FaceSmileIcon,
    'Turnover': ArrowTrendingUpIcon,
    'Pengembangan SDM': UserGroupIcon,
    'Sampling Internal': ClipboardDocumentCheckIcon,
    'Sampling Quantity': ClipboardDocumentCheckIcon
  }
  return icons[kpiName] || ClockIcon
}

const getKPISubtitle = (kpiName) => {
  const subtitles = {
    'Profit': 'Update target profit bulanan',
    'CSAT': 'Update manual rating (Google + Cekat)',
    'Turnover': 'Update turnover rate karyawan',
    'Pengembangan SDM': 'Update SDM breakdown score',
    'Lead Time': 'Update manual response times',
    'Lead Time': 'Update manual response times',
    'Sampling Quantity': 'Update monthly sampling target',
    'Sampling Internal': 'Update monthly sampling target'
  }
  return subtitles[kpiName] || 'Update KPI value'
}

// ========================================
// ⭐ SAVE HANDLER - SEND ALL VALUES
// ========================================
const handleSave = async () => {
  saving.value = true
  
  try {
    const period = `${props.year}-${String(props.month).padStart(2, '0')}-01`
    let endpoint = ''
    let params = {
      store_id: parseInt(props.storeId),
      period_month: period
    }
    
    // ⭐ Route ke endpoint yang sesuai
    if (props.kpi.name === 'Profit') {
      endpoint = '/web/v3/kpi/save-profit-target'
      params.target_profit = formData.value.target_profit
    } else if (props.kpi.name === 'CSAT') {
      endpoint = '/web/v3/kpi/save-csat'
      params.csat_value = formData.value.csat_value
      params.google_rating = formData.value.google_rating
    } else if (props.kpi.name === 'Turnover') {
      endpoint = '/web/v3/kpi/save-turnover'
      params.turnover_value = formData.value.turnover_value
    } else if (props.kpi.name === 'Pengembangan SDM') {
      endpoint = '/web/v3/kpi/save-sdm'
      // Send components, backend calculates average
      params.sdm_value = formData.value.sdm_value // Optional/Legacy
      params.sdm_case_doc = formData.value.sdm_case_doc
      params.sdm_delivery = formData.value.sdm_delivery
      params.sdm_result = formData.value.sdm_result
    } else if (props.kpi.name === 'Lead Time') {
      endpoint = '/web/v3/kpi/save-leadtime'
      params.lead_time_first_response = formData.value.lead_time_first_response
      params.lead_time_avg_response = formData.value.lead_time_avg_response
      params.lead_time_avg_response = formData.value.lead_time_avg_response
    } else if (props.kpi.name === 'Sampling Quantity' || props.kpi.name === 'Sampling Internal') {
      endpoint = '/web/v3/kpi/save-sampling'
      params.sampling_target = formData.value.sampling_target
    }
    
    const response = await apiClient.post(endpoint, {
      jsonrpc: '2.0',
      method: 'call',
      params
    })
    
    if (response.data.result.success) {
      console.log('✅ Save successful:', response.data.result.message)
      emit('save')
    } else {
      throw new Error(response.data.result.error || 'Failed to save')
    }
  } catch (error) {
    console.error('❌ Error saving KPI:', error)
    alert('Gagal menyimpan data: ' + (error.response?.data?.result?.error || error.message))
  } finally {
    saving.value = false
  }
}


const closeModal = () => {
  emit('close')
}
</script>

<style scoped>
/* Custom Slider Styles - Pitcar Red Theme */
.slider-thumb::-webkit-slider-thumb {
  appearance: none;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #b70000;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(183, 0, 0, 0.3);
  transition: all 0.2s;
}

.slider-thumb::-webkit-slider-thumb:hover {
  transform: scale(1.2);
  box-shadow: 0 4px 12px rgba(183, 0, 0, 0.4);
}

.slider-thumb::-moz-range-thumb {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #b70000;
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 8px rgba(183, 0, 0, 0.3);
}
</style>