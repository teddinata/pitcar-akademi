<!-- ============================================================================
CALCULATE KPI MODAL COMPONENT
============================================================================
File: components/CalculateKPIModal.vue

Features:
1. Set profit target (optional)
2. Calculate KPI untuk periode tertentu
3. Loading state
4. Success/Error handling
============================================================================ -->

<template>
  <TransitionRoot :show="true" as="template">
    <Dialog as="div" class="relative z-50" @close="$emit('close')">
      <TransitionChild
        as="template"
        enter="ease-out duration-300"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="ease-in duration-200"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
      </TransitionChild>

      <div class="fixed inset-0 z-10 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
          <TransitionChild
            as="template"
            enter="ease-out duration-300"
            enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enter-to="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leave-from="opacity-100 translate-y-0 sm:scale-100"
            leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <DialogPanel class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
              <!-- Header -->
              <div class="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <div class="p-2 bg-white bg-opacity-20 rounded-lg">
                      <PlusCircleIcon class="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <DialogTitle class="text-lg font-bold text-white">
                        Calculate KPI
                      </DialogTitle>
                      <p class="text-sm text-white text-opacity-90">
                        {{ storeName }} - {{ monthName }} {{ year }}
                      </p>
                    </div>
                  </div>
                  <button
                    @click="$emit('close')"
                    class="text-white hover:text-gray-200 transition-colors"
                  >
                    <XMarkIcon class="h-6 w-6" />
                  </button>
                </div>
              </div>

              <!-- Body -->
              <div class="px-6 py-6 space-y-6">
                <!-- Info Box -->
                <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div class="flex gap-3">
                    <InformationCircleIcon class="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div class="text-sm text-blue-800">
                      <p class="font-medium mb-1">Apa yang akan dihitung?</p>
                      <ul class="list-disc list-inside space-y-1 text-xs">
                        <li>Profit (dari accounting data)</li>
                        <li>Lead Time (dari sale orders)</li>
                        <li>Sampling Internal & Eksternal</li>
                        <li>CSAT (jika sudah diinput)</li>
                        <li>Turn Over (jika sudah diinput)</li>
                        <li>Pengembangan SDM (jika sudah diinput)</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <!-- Profit Target Input (Optional) -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Target Profit Bulanan (Optional)
                    <span class="text-gray-500 font-normal">- Dalam Rupiah</span>
                  </label>
                  <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span class="text-gray-500 text-sm">Rp</span>
                    </div>
                    <input
                      v-model.number="profitTarget"
                      type="number"
                      placeholder="Contoh: 110000000"
                      class="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-sm"
                    />
                  </div>
                  <p class="mt-1 text-xs text-gray-500">
                    Target profit: {{ formatCurrency(profitTarget || 0) }}
                  </p>
                  <p class="mt-1 text-xs text-amber-600">
                    💡 Tip: Masukkan target profit untuk tracking harian. Bisa diubah nanti.
                  </p>
                </div>

                <!-- Common Targets (Quick Select) -->
                <!-- <div>
                  <p class="text-sm font-medium text-gray-700 mb-2">Quick Select (Target Umum):</p>
                  <div class="grid grid-cols-2 gap-2">
                    <button
                      @click="profitTarget = 110000000"
                      class="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left"
                    >
                      <span class="font-medium">110 Juta</span>
                      <span class="text-xs text-gray-500 block">Target Cilacap</span>
                    </button>
                    <button
                      @click="profitTarget = 165000000"
                      class="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left"
                    >
                      <span class="font-medium">165 Juta</span>
                      <span class="text-xs text-gray-500 block">Target PWT</span>
                    </button>
                    <button
                      @click="profitTarget = 50000000"
                      class="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left"
                    >
                      <span class="font-medium">50 Juta</span>
                      <span class="text-xs text-gray-500 block">Target Small</span>
                    </button>
                    <button
                      @click="profitTarget = 0"
                      class="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left"
                    >
                      <span class="font-medium">Skip</span>
                      <span class="text-xs text-gray-500 block">Set later</span>
                    </button>
                  </div>
                </div> -->

                <!-- Warning if no target -->
                <div v-if="!profitTarget" class="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <div class="flex gap-2">
                    <ExclamationTriangleIcon class="h-5 w-5 text-amber-600 flex-shrink-0" />
                    <p class="text-sm text-amber-800">
                      Tanpa target profit, tracking harian tidak akan tersedia. Anda bisa set target nanti via API atau UI.
                    </p>
                  </div>
                </div>
              </div>

              <!-- Footer -->
              <div class="bg-gray-50 px-6 py-4 flex gap-3 justify-end">
                <button
                  @click="$emit('close')"
                  :disabled="isCalculating"
                  class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 disabled:opacity-50 transition-all"
                >
                  Batal
                </button>
                <button
                  @click="handleCalculate"
                  :disabled="isCalculating"
                  class="inline-flex items-center px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition-all"
                >
                  <template v-if="isCalculating">
                    <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Menghitung KPI...
                  </template>
                  <template v-else>
                    <PlusCircleIcon class="h-4 w-4 mr-2" />
                    Calculate KPI
                  </template>
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
import { ref, computed } from 'vue'
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  TransitionRoot,
  TransitionChild
} from '@headlessui/vue'
import {
  PlusCircleIcon,
  XMarkIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/vue/24/outline'
import apiClient from '@/config/api'

const props = defineProps({
  storeId: {
    type: [Number, String],
    required: true
  },
  storeName: {
    type: String,
    required: true
  },
  month: {
    type: Number,
    required: true
  },
  year: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['close', 'calculated'])

// State
const profitTarget = ref(0)
const isCalculating = ref(false)

// Computed
const monthName = computed(() => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
  return months[props.month - 1]
})

// Methods
const formatCurrency = (value) => {
  if (!value) return 'Rp 0'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value)
}

const handleCalculate = async () => {
  try {
    isCalculating.value = true

    // Step 1: Calculate KPI
    const calculateResponse = await apiClient.post('/web/kpi-outlet/calculate', {
      jsonrpc: '2.0',
      method: 'call',
      params: {
        warehouse_id: parseInt(props.storeId),
        month: props.month,
        year: props.year
      }
    })

    if (calculateResponse.data.result.status !== 'success') {
      throw new Error(calculateResponse.data.result.message || 'Failed to calculate KPI')
    }

    // Step 2: Set profit target if provided
    if (profitTarget.value > 0) {
      await apiClient.post('/web/v2/kpi/outlet/set-profit-target', {
        jsonrpc: '2.0',
        method: 'call',
        params: {
          store_id: parseInt(props.storeId),
          month: props.month,
          year: props.year,
          profit_target_amount: profitTarget.value
        }
      })
    }

    // Success!
    emit('calculated')
  } catch (error) {
    console.error('Error calculating KPI:', error)
    alert(`Gagal menghitung KPI: ${error.message}`)
  } finally {
    isCalculating.value = false
  }
}
</script>