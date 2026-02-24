<template>
  <TransitionRoot as="template" :show="true">
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
        <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <TransitionChild
            as="template"
            enter="ease-out duration-300"
            enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enter-to="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leave-from="opacity-100 translate-y-0 sm:scale-100"
            leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <DialogPanel class="relative transform overflow-hidden rounded-xl bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
              <!-- Header -->
              <div class="bg-gradient-to-r from-[#b70000] to-[#950000] px-6 py-4">
                <div class="flex items-center justify-between">
                  <DialogTitle class="text-xl font-bold text-white flex items-center">
                    <PencilSquareIcon class="h-6 w-6 mr-2" />
                    Update {{ kpi.name }}
                  </DialogTitle>
                  <button
                    @click="$emit('close')"
                    class="text-white hover:text-gray-200 transition-colors"
                  >
                    <XMarkIcon class="h-6 w-6" />
                  </button>
                </div>
              </div>

              <!-- Body -->
              <div class="px-6 py-6">
                <!-- Info Alert -->
                <div class="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div class="flex">
                    <InformationCircleIcon class="h-5 w-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
                    <div class="text-sm text-blue-800">
                      <p class="font-medium mb-1">{{ getKPIDescription(kpi.type) }}</p>
                      <p class="text-blue-600">{{ kpi.measurement }}</p>
                    </div>
                  </div>
                </div>

                <!-- Form -->
                <form @submit.prevent="handleSubmit" class="space-y-6">
                  <!-- Value Input -->
                  <div>
                    <label class="block text-sm font-bold text-gray-900 mb-2">
                      {{ kpi.type === 'csat' ? 'CSAT Rating (1-5 Bintang)' : 'Turn Over Rate (%)' }}
                    </label>
                    <div class="relative">
                      <input
                        v-model.number="formData.value"
                        type="number"
                        :step="kpi.type === 'csat' ? '0.1' : '0.1'"
                        :min="kpi.type === 'csat' ? '1.0' : '0'"
                        :max="kpi.type === 'csat' ? '5.0' : '100'"
                        required
                        class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#b70000] focus:ring-[#b70000] text-lg font-semibold transition-colors"
                        :placeholder="kpi.type === 'csat' ? 'Masukkan rating 1.0-5.0' : 'Masukkan nilai 0-100'"
                      />
                      <div class="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                        <span class="text-gray-500 text-lg font-bold">
                          {{ kpi.type === 'csat' ? '⭐' : '%' }}
                        </span>
                      </div>
                    </div>
                    <p class="mt-2 text-xs text-gray-500">
                      {{ kpi.type === 'csat' ? 'Rating harus antara 1.0 - 5.0 bintang' : 'Nilai harus antara 0 - 100' }}
                    </p>
                  </div>

                  <!-- Visual Indicator -->
                  <div class="p-4 bg-gray-50 rounded-lg">
                    <div class="flex items-center justify-between mb-2">
                      <span class="text-sm font-medium text-gray-700">Preview {{ kpi.type === 'csat' ? 'Rating' : 'Score' }}</span>
                      <span 
                        class="text-2xl font-bold"
                        :class="getPreviewColor(formData.value, kpi.type)"
                      >
                        {{ formData.value || (kpi.type === 'csat' ? '0.0' : '0') }}{{ kpi.type === 'csat' ? ' ⭐' : '%' }}
                      </span>
                    </div>
                    <div v-if="kpi.type === 'csat'" class="mb-2">
                      <div class="text-xs text-gray-600 space-y-1">
                        <p>• > 4.8: Excellent (120%)</p>
                        <p>• = 4.8: Target Achieved (100%)</p>
                        <p>• 4.6-4.7: Below Target (50%)</p>
                        <p>• < 4.6: Poor (0%)</p>
                      </div>
                    </div>
                    <div class="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        class="h-full rounded-full transition-all duration-300"
                        :class="getProgressBarColor(formData.value, kpi.type)"
                        :style="{ width: `${getProgressWidth(formData.value, kpi.type)}%` }"
                      ></div>
                    </div>
                  </div>

                  <!-- Notes (Optional) -->
                  <div v-if="kpi.type === 'csat'">
                    <label class="block text-sm font-bold text-gray-900 mb-2">
                      Catatan (Optional)
                    </label>
                    <textarea
                      v-model="formData.notes"
                      rows="3"
                      class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#b70000] focus:ring-[#b70000] transition-colors resize-none"
                      placeholder="Tambahkan catatan atau keterangan..."
                    ></textarea>
                  </div>

                  <!-- Action Buttons -->
                  <div class="flex gap-3 pt-4">
                    <button
                      type="button"
                      @click="$emit('close')"
                      class="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg text-sm font-bold text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-all"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      :disabled="saving || !isValid"
                      class="flex-1 inline-flex items-center justify-center px-4 py-3 border border-transparent rounded-lg text-sm font-bold text-white bg-[#b70000] hover:bg-[#950000] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#b70000] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <CheckIcon v-if="!saving" class="h-5 w-5 mr-2" />
                      <ArrowPathIcon v-else class="h-5 w-5 mr-2 animate-spin" />
                      {{ saving ? 'Menyimpan...' : 'Simpan Data' }}
                    </button>
                  </div>
                </form>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  TransitionChild,
  TransitionRoot,
} from '@headlessui/vue'
import {
  XMarkIcon,
  PencilSquareIcon,
  InformationCircleIcon,
  CheckIcon,
  ArrowPathIcon
} from '@heroicons/vue/24/outline'
import apiClient from '@/config/api'
import { useToast } from '@/composables/useToast'

const props = defineProps({
  kpi: {
    type: Object,
    required: true
  },
  storeId: {
    type: [Number, String],
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

const emit = defineEmits(['close', 'save'])
const { showToast } = useToast()

const saving = ref(false)
const formData = ref({
  value: 0,
  notes: ''
})

const isValid = computed(() => {
  if (props.kpi.type === 'csat') {
    return formData.value.value >= 1.0 && formData.value.value <= 5.0
  }
  return formData.value.value >= 0 && formData.value.value <= 100
})

const getKPIDescription = (type) => {
  const descriptions = {
    csat: 'Rating kepuasan customer 1-5 bintang dari Cekat AI (Target: ≥4.8)',
    turnover_ytd: 'Year-to-Date Employee Turn Over Rate'
  }
  return descriptions[type] || ''
}

const getPreviewColor = (value, type) => {
  if (type === 'csat') {
    if (value > 4.8) return 'text-green-600'
    if (value === 4.8) return 'text-green-600'
    if (value >= 4.6) return 'text-amber-600'
    return 'text-red-600'
  }
  if (value >= 80) return 'text-green-600'
  if (value >= 60) return 'text-amber-600'
  return 'text-red-600'
}

const getProgressBarColor = (value, type) => {
  if (type === 'csat') {
    if (value > 4.8) return 'bg-green-500'
    if (value === 4.8) return 'bg-green-500'
    if (value >= 4.6) return 'bg-amber-500'
    return 'bg-red-500'
  }
  if (value >= 80) return 'bg-green-500'
  if (value >= 60) return 'bg-amber-500'
  return 'bg-red-500'
}

const getProgressWidth = (value, type) => {
  if (type === 'csat') {
    // Convert 1-5 rating to 0-100 percentage
    return Math.min((value / 5.0) * 100, 100)
  }
  return Math.min(value || 0, 100)
}

const loadCurrentValue = async () => {
  try {
    const endpoint = props.kpi.type === 'csat' 
      ? '/web/v2/kpi/outlet/csat/get'
      : '/web/v2/kpi/outlet/turnover/get'
    
    const params = props.kpi.type === 'csat'
      ? {
          store_id: parseInt(props.storeId),
          month: props.month,
          year: props.year
        }
      : {
          store_id: parseInt(props.storeId),
          year: props.year
        }
    
    const response = await apiClient.post(endpoint, {
      jsonrpc: '2.0',
      method: 'call',
      params
    })

    if (response.data.result.status === 'success') {
      const data = response.data.result.data
      formData.value.value = props.kpi.type === 'csat' 
        ? data.csat_value 
        : data.turnover_value
    }
  } catch (error) {
    console.error('Error loading current value:', error)
    // Set to current actual value from kpi
    formData.value.value = props.kpi.actual
  }
}

const handleSubmit = async () => {
  if (!isValid.value) return

  try {
    saving.value = true
    
    const endpoint = props.kpi.type === 'csat'
      ? '/web/v2/kpi/outlet/csat/update'
      : '/web/v2/kpi/outlet/turnover/update'
    
    const params = props.kpi.type === 'csat'
      ? {
          store_id: parseInt(props.storeId),
          month: props.month,
          year: props.year,
          csat_value: formData.value.value
        }
      : {
          store_id: parseInt(props.storeId),
          year: props.year,
          turnover_value: formData.value.value
        }
    
    const response = await apiClient.post(endpoint, {
      jsonrpc: '2.0',
      method: 'call',
      params
    })

    if (response.data.result.status === 'success') {
      showToast({
        message: response.data.result.message,
        type: 'success',
        duration: 3000
      })
      
      emit('save', formData.value)
    } else {
      throw new Error(response.data.result.message || 'Failed to save')
    }
  } catch (error) {
    console.error('Error saving KPI:', error)
    showToast({
      message: error.message || 'Gagal menyimpan data',
      type: 'error',
      duration: 5000
    })
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadCurrentValue()
})
</script>