<template>
  <TransitionRoot as="template" :show="isOpen">
    <Dialog as="div" class="relative z-50" @close="closeModal">
      <TransitionChild
        as="template"
        enter="ease-out duration-300"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="ease-in duration-200"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity" />
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
            <DialogPanel class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl">
              <!-- Header -->
              <div class="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4">
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-3">
                    <div class="flex h-10 w-10 items-center justify-center rounded-full bg-white bg-opacity-20">
                      <ExclamationTriangleIcon class="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <DialogTitle class="text-lg font-semibold text-white">
                        Detail Komplain
                      </DialogTitle>
                      <p class="text-sm text-red-100">
                        {{ title }}
                      </p>
                    </div>
                  </div>
                  <button
                    @click="closeModal"
                    class="rounded-md p-1 text-red-100 hover:bg-white hover:bg-opacity-20 transition-colors"
                  >
                    <XMarkIcon class="h-6 w-6" />
                  </button>
                </div>
              </div>

              <!-- Content -->
              <div class="bg-gray-50 px-6 py-4">
                <!-- Stats Summary -->
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                  <div class="bg-white rounded-lg p-3 border border-gray-200">
                    <p class="text-xs text-gray-500 mb-1">Total Komplain</p>
                    <p class="text-2xl font-bold text-gray-900">{{ complaints.length }}</p>
                  </div>
                  <div class="bg-white rounded-lg p-3 border border-gray-200">
                    <p class="text-xs text-gray-500 mb-1">Rate Komplain</p>
                    <p class="text-2xl font-bold text-red-600">{{ complaintRate }}%</p>
                  </div>
                  <div class="bg-white rounded-lg p-3 border border-gray-200">
                    <p class="text-xs text-gray-500 mb-1">Rata-rata Rating</p>
                    <div class="flex items-center">
                      <p class="text-2xl font-bold text-gray-900">1.0</p>
                      <StarIcon class="h-5 w-5 text-red-500 ml-1" />
                    </div>
                  </div>
                  <div class="bg-white rounded-lg p-3 border border-gray-200">
                    <p class="text-xs text-gray-500 mb-1">Butuh Tindak Lanjut</p>
                    <p class="text-2xl font-bold text-orange-600">{{ pendingCount }}</p>
                  </div>
                </div>

                <!-- Complaints List -->
                <div class="space-y-4 max-h-96 overflow-y-auto pr-2">
                  <div
                    v-for="(complaint, index) in complaints"
                    :key="complaint.order_id"
                    class="bg-white rounded-lg border border-gray-200 hover:border-red-300 transition-all duration-200"
                  >
                    <!-- Complaint Header -->
                    <div class="p-4">
                      <div class="flex items-start justify-between mb-3">
                        <div class="flex-1">
                          <div class="flex items-center space-x-2 mb-2">
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Komplain #{{ complaints.length - index }}
                            </span>
                            <span class="text-sm font-medium text-gray-900">{{ complaint.order_name }}</span>
                          </div>
                          <div class="flex items-center space-x-4 text-sm text-gray-600">
                            <div class="flex items-center">
                              <UserIcon class="h-4 w-4 mr-1" />
                              <span>{{ complaint.customer_name }}</span>
                            </div>
                            <div class="flex items-center">
                              <CalendarIcon class="h-4 w-4 mr-1" />
                              <span>{{ formatDate(complaint.date_completed) }}</span>
                            </div>
                          </div>
                        </div>
                        <div class="text-right">
                          <div class="flex items-center justify-end mb-1">
                            <span class="text-lg font-bold text-red-600">{{ complaint.rating }}</span>
                            <StarIcon class="h-4 w-4 text-red-500 ml-1" />
                          </div>
                          <span class="text-xs text-gray-500">{{ formatCurrency(complaint.amount) }}</span>
                        </div>
                      </div>

                      <!-- Vehicle Info -->
                      <div class="flex items-center space-x-4 mb-3 pb-3 border-b border-gray-100">
                        <div class="flex items-center text-sm text-gray-600">
                          <TruckIcon class="h-4 w-4 mr-1" />
                          <span>{{ complaint.plate_number }}</span>
                        </div>
                        <div class="text-sm text-gray-600">
                          {{ complaint.car_info }}
                        </div>
                      </div>

                      <!-- Feedback -->
                      <div class="bg-gray-50 rounded-lg p-3 mb-3">
                        <p class="text-xs font-medium text-gray-700 mb-1 flex items-center">
                          <ChatBubbleLeftIcon class="h-4 w-4 mr-1" />
                          Feedback Customer:
                        </p>
                        <p class="text-sm text-gray-900 leading-relaxed">
                          {{ complaint.feedback || 'Tidak ada feedback' }}
                        </p>
                      </div>

                      <!-- Service Advisor -->
                      <div class="flex items-center justify-between">
                        <div class="flex items-center text-sm text-gray-600">
                          <UserCircleIcon class="h-4 w-4 mr-1" />
                          <span>Service Advisor: <span class="font-medium text-gray-900">{{ complaint.service_advisor }}</span></span>
                        </div>
                        <div>
                          <span
                            :class="[
                              'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                              complaint.satisfaction === 'very_dissatisfied' 
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-800'
                            ]"
                          >
                            {{ getSatisfactionLabel(complaint.satisfaction) }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Empty State -->
                  <div v-if="complaints.length === 0" class="text-center py-12">
                    <CheckCircleIcon class="mx-auto h-12 w-12 text-gray-400" />
                    <h3 class="mt-2 text-sm font-medium text-gray-900">Tidak ada komplain</h3>
                    <p class="mt-1 text-sm text-gray-500">Semua pelanggan puas dengan layanan.</p>
                  </div>
                </div>
              </div>

              <!-- Footer -->
              <div class="bg-gray-100 px-6 py-4 flex justify-end space-x-3">
                <button
                  @click="exportComplaints"
                  class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  <ArrowDownTrayIcon class="h-4 w-4 mr-2" />
                  Export
                </button>
                <button
                  @click="closeModal"
                  class="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors"
                >
                  Tutup
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
import { computed } from 'vue'
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  TransitionChild,
  TransitionRoot,
} from '@headlessui/vue'
import {
  ExclamationTriangleIcon,
  XMarkIcon,
  StarIcon,
  UserIcon,
  CalendarIcon,
  TruckIcon,
  ChatBubbleLeftIcon,
  UserCircleIcon,
  CheckCircleIcon,
  ArrowDownTrayIcon
} from '@heroicons/vue/24/outline'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  },
  complaints: {
    type: Array,
    default: () => []
  },
  title: {
    type: String,
    default: 'Semua Komplain'
  },
  complaintRate: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['close'])

const pendingCount = computed(() => {
  return props.complaints.filter(c => c.satisfaction !== 'very_dissatisfied').length
})

const closeModal = () => {
  emit('close')
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  try {
    return format(new Date(dateString), 'dd MMM yyyy HH:mm', { locale: id })
  } catch (error) {
    return dateString
  }
}

const formatCurrency = (value) => {
  if (!value) return 'Rp 0'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value)
}

const getSatisfactionLabel = (satisfaction) => {
  const labels = {
    'very_dissatisfied': 'Sangat Tidak Puas',
    'dissatisfied': 'Tidak Puas',
    'not_set': 'Belum Diset',
    'neutral': 'Netral'
  }
  return labels[satisfaction] || 'Tidak Diketahui'
}

const exportComplaints = () => {
  // Implementasi export ke CSV/Excel
  console.log('Exporting complaints...', props.complaints)
  // TODO: Implement actual export logic
}
</script>