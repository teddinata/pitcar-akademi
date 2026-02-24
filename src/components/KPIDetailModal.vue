<!-- ============================================================================
FILE: src/components/KPIDetailModal.vue
Detail Modal for Profit & Lead Time KPIs
============================================================================ -->

<template>
  <TransitionRoot :show="show" as="template">
    <Dialog as="div" class="relative z-50" @close="emit('close')">
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
            <DialogPanel class="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden">
              
              <!-- Header -->
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
                        Detail {{ kpi?.name }}
                      </DialogTitle>
                      <p class="text-sm text-white/80 mt-0.5">
                        Breakdown lengkap {{ kpi?.name }} KPI
                      </p>
                    </div>
                  </div>
                  <button
                    @click="emit('close')"
                    class="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <XMarkIcon class="h-5 w-5 text-white" />
                  </button>
                </div>
              </div>

              <!-- Content -->
              <div class="p-6 max-h-[70vh] overflow-y-auto">
                
                <!-- ========================================
                     PROFIT BREAKDOWN
                ======================================== -->
                <!-- File: src/components/KPIDetailModal.vue -->

                <!-- ========================================
                    PROFIT BREAKDOWN - FIX DATA ACCESS
                ======================================== -->
                <div v-if="kpi?.name === 'Profit'">
      
                  <!-- Summary Cards - TRANSLATED -->
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div class="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <p class="text-xs text-gray-600 font-medium mb-1">Pendapatan</p>
                      <p class="text-2xl font-bold text-gray-900">
                        {{ kpi.formatted?.revenue || formatCurrency(kpi.breakdown?.revenue) }}
                      </p>
                    </div>
                    <div class="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <p class="text-xs text-gray-600 font-medium mb-1">Laba Kotor</p>
                      <p class="text-2xl font-bold text-gray-900">
                        {{ kpi.formatted?.gross_profit || formatCurrency(kpi.breakdown?.gross_profit) }}
                      </p>
                      <p class="text-xs text-gray-500 mt-1">
                        Margin: {{ kpi.breakdown?.gross_profit_margin?.toFixed(2) || 0 }}%
                      </p>
                    </div>
                    <div class="bg-gradient-to-br from-[#b70000] to-[#950000] rounded-xl p-4 text-white">
                      <p class="text-xs opacity-90 font-medium mb-1">Laba Bersih</p>
                      <p class="text-2xl font-bold">
                        {{ kpi.formatted?.net_profit || formatCurrency(kpi.value) }}
                      </p>
                      <p class="text-xs opacity-90 mt-1">
                        Margin: {{ kpi.breakdown?.net_profit_margin?.toFixed(2) || 0 }}%
                      </p>
                    </div>
                  </div>

                  <!-- Detailed Breakdown Table - TRANSLATED -->
                  <div class="bg-white border border-gray-200 rounded-xl overflow-hidden mb-6">
                    <div class="px-4 py-3 bg-gray-50 border-b border-gray-200">
                      <h4 class="font-bold text-gray-900">Rincian Laba Rugi</h4>
                    </div>
                    <table class="min-w-full">
                      <tbody class="divide-y divide-gray-200">
                        <tr>
                          <td class="px-4 py-3 text-sm font-medium text-gray-900">Pendapatan</td>
                          <td class="px-4 py-3 text-sm text-right font-bold text-gray-900">
                            {{ kpi.formatted?.revenue || formatCurrency(kpi.breakdown?.revenue) }}
                          </td>
                        </tr>
                        <tr>
                          <td class="px-4 py-3 text-sm font-medium text-gray-900">Harga Pokok Penjualan (HPP)</td>
                          <td class="px-4 py-3 text-sm text-right font-semibold text-red-600">
                            -{{ kpi.formatted?.cogs || formatCurrency(kpi.breakdown?.cogs) }}
                          </td>
                        </tr>
                        <tr class="bg-gray-50">
                          <td class="px-4 py-3 text-sm font-bold text-gray-900">Laba Kotor</td>
                          <td class="px-4 py-3 text-sm text-right font-bold text-gray-900">
                            {{ kpi.formatted?.gross_profit || formatCurrency(kpi.breakdown?.gross_profit) }}
                          </td>
                        </tr>
                        <tr>
                          <td class="px-4 py-3 text-sm font-medium text-gray-900">Biaya Operasional</td>
                          <td class="px-4 py-3 text-sm text-right font-semibold text-red-600">
                            -{{ kpi.formatted?.opex || formatCurrency(kpi.breakdown?.opex) }}
                          </td>
                        </tr>
                        <tr class="bg-gradient-to-r from-[#b70000]/10 to-[#950000]/10">
                          <td class="px-4 py-3 text-base font-bold text-[#b70000]">Laba Bersih</td>
                          <td class="px-4 py-3 text-base text-right font-bold text-[#b70000]">
                            {{ kpi.formatted?.net_profit || formatCurrency(kpi.value) }}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <!-- Daily Tracking - TRANSLATED -->
                  <div v-if="kpi.daily_tracking" class="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
                    <h4 class="font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <CalendarIcon class="h-5 w-5 text-[#b70000]" />
                      Tracking Harian
                    </h4>
                    
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div class="bg-white rounded-lg p-3 border border-gray-200">
                        <p class="text-xs text-gray-600 mb-1">Hari Berjalan</p>
                        <p class="text-xl font-bold text-gray-900">
                          {{ kpi.daily_tracking.days_elapsed }} / {{ kpi.daily_tracking.days_in_month }}
                        </p>
                      </div>
                      
                      <div class="bg-white rounded-lg p-3 border border-gray-200">
                        <p class="text-xs text-gray-600 mb-1">Target Harian</p>
                        <p class="text-lg font-bold text-gray-900">
                          {{ formatCurrency(kpi.daily_tracking.target_daily) }}
                        </p>
                      </div>
                      
                      <div class="bg-white rounded-lg p-3 border border-gray-200">
                        <p class="text-xs text-gray-600 mb-1">Pencapaian Harian</p>
                        <p class="text-xl font-bold text-[#b70000]">
                          {{ kpi.daily_tracking.achievement_daily?.toFixed(1) || 0 }}%
                        </p>
                      </div>
                      
                      <div class="bg-white rounded-lg p-3 border border-gray-200">
                        <p class="text-xs text-gray-600 mb-1">Status</p>
                        <p class="text-lg font-bold" :class="kpi.daily_tracking.status === 'ahead' ? 'text-green-600' : 'text-red-600'">
                          {{ kpi.daily_tracking.status === 'ahead' ? '🟢 Di Atas Target' : '🔴 Di Bawah Target' }}
                        </p>
                      </div>
                    </div>

                    <div class="mt-4 p-4 bg-white rounded-lg border border-gray-200">
                      <div class="flex justify-between items-center mb-2">
                        <span class="text-sm font-medium text-gray-700">Selisih Harian</span>
                        <span class="font-bold" :class="kpi.daily_tracking.gap_daily >= 0 ? 'text-green-600' : 'text-red-600'">
                          {{ formatCurrency(Math.abs(kpi.daily_tracking.gap_daily)) }}
                          {{ kpi.daily_tracking.gap_daily >= 0 ? '(di atas target)' : '(di bawah target)' }}
                        </span>
                      </div>
                      <div class="flex justify-between items-center">
                        <span class="text-sm font-medium text-gray-700">Selisih Bulanan</span>
                        <span class="font-bold" :class="kpi.daily_tracking.gap_monthly >= 0 ? 'text-green-600' : 'text-red-600'">
                          {{ formatCurrency(Math.abs(kpi.daily_tracking.gap_monthly)) }}
                          {{ kpi.daily_tracking.gap_monthly >= 0 ? '(di atas target)' : '(di bawah target)' }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>


                <!-- ========================================
                     LEAD TIME BREAKDOWN
                ======================================== -->
                <div v-if="kpi?.name === 'Lead Time'">
                  
                  <!-- Summary -->
                  <div class="bg-gradient-to-br from-[#b70000] to-[#950000] rounded-xl p-6 text-white mb-6">
                    <div class="flex items-center justify-between">
                      <div>
                        <p class="text-sm opacity-90 mb-1">On-time Percentage</p>
                        <p class="text-4xl font-bold">{{ kpi.ontime_percentage?.toFixed(1) || 0 }}%</p>
                      </div>
                      <div class="text-right">
                        <p class="text-sm opacity-90 mb-1">Target</p>
                        <p class="text-3xl font-bold">{{ kpi.target_ontime || 90 }}%</p>
                      </div>
                    </div>
                    <div class="mt-4 w-full bg-white/20 rounded-full h-3">
                      <div
                        class="bg-white h-3 rounded-full transition-all"
                        :style="{ width: `${Math.min((kpi.ontime_percentage / kpi.target_ontime * 100), 100)}%` }"
                      ></div>
                    </div>
                  </div>

                  <!-- Components Table -->
                  <div class="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <div class="px-4 py-3 bg-gray-50 border-b border-gray-200">
                      <h4 class="font-bold text-gray-900">Lead Time Components</h4>
                      <p class="text-xs text-gray-500 mt-1">5 KPI components + 3 informational</p>
                    </div>
                    
                    <!-- Lead Time Components Table -->
                    <div class="overflow-x-auto">
                      <table class="min-w-full">
                        <thead class="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th class="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Component</th>
                            <th class="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase">Count</th>
                            <th class="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase">On-time</th>
                            <th class="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase">Rate</th>
                            <th class="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase">Avg Time</th>
                            <th class="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase">Standard</th>
                          </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200">
                          
                          <!-- ⭐ Existing KPI Components (5) -->
                          <tr v-for="(component, key) in getKPIComponents(kpi.detail)" :key="key" class="hover:bg-gray-50">
                            <td class="px-4 py-3">
                              <div class="flex items-center gap-2">
                                <span class="text-xs font-bold text-white bg-[#b70000] px-2 py-1 rounded">KPI</span>
                                <span class="font-medium text-gray-900">{{ formatComponentName(key) }}</span>
                              </div>
                            </td>
                            <td class="px-4 py-3 text-center font-semibold text-gray-900">{{ component.count }}</td>
                            <td class="px-4 py-3 text-center font-semibold text-gray-900">{{ component.ontime }}</td>
                            <td class="px-4 py-3 text-center">
                              <span class="font-bold" :class="component.rate >= 90 ? 'text-green-600' : component.rate >= 75 ? 'text-amber-600' : 'text-red-600'">
                                {{ component.rate?.toFixed(1) }}%
                              </span>
                            </td>
                            <td class="px-4 py-3 text-center text-sm text-gray-700">
                              {{ component.avg_minutes?.toFixed(0) }} min
                            </td>
                            <td class="px-4 py-3 text-center text-sm font-medium text-gray-600">
                              {{ (component.standard_hours * 60).toFixed(0) }} min
                            </td>
                          </tr>

                          <!-- ⭐ NEW: Lead Time Servis Component -->
                          <!-- <tr v-if="kpi.detail?.lead_time_servis" class="hover:bg-gray-50 bg-purple-50/50">
                            <td class="px-4 py-3">
                              <div class="flex items-center gap-2">
                                <span class="text-xs font-bold text-white bg-purple-600 px-2 py-1 rounded">KPI</span>
                                <span class="font-medium text-gray-900">Lead Time Servis</span>
                              </div>
                            </td>
                            <td class="px-4 py-3 text-center font-semibold text-gray-900">
                              {{ kpi.detail.lead_time_servis.count }}
                            </td>
                            <td class="px-4 py-3 text-center font-semibold text-gray-900">
                              {{ kpi.detail.lead_time_servis.ontime }}
                            </td>
                            <td class="px-4 py-3 text-center">
                              <span class="font-bold" :class="kpi.detail.lead_time_servis.rate >= 90 ? 'text-green-600' : kpi.detail.lead_time_servis.rate >= 75 ? 'text-amber-600' : 'text-red-600'">
                                {{ kpi.detail.lead_time_servis.rate?.toFixed(1) }}%
                              </span>
                            </td>
                            <td class="px-4 py-3 text-center">
                              <div class="text-sm">
                                <div class="font-semibold text-gray-900">
                                  {{ kpi.detail.lead_time_servis.avg_minutes?.toFixed(0) }} min
                                </div>
                                <div class="text-xs text-gray-500">
                                  vs {{ kpi.detail.lead_time_servis.avg_estimated_minutes?.toFixed(0) }} min estimasi
                                </div>
                              </div>
                            </td>
                            <td class="px-4 py-3 text-center">
                              <div class="text-sm">
                                <div class="font-medium text-purple-700">
                                  {{ kpi.detail.lead_time_servis.avg_estimated_minutes?.toFixed(0) }} min
                                </div>
                                <div class="text-xs text-purple-600">
                                  (dinamis per order)
                                </div>
                              </div>
                            </td>
                          </tr> -->

                          <!-- Info Components (3) -->
                          <tr v-for="(component, key) in getInfoComponents(kpi.detail)" :key="key" class="hover:bg-gray-50 bg-blue-50/50">
                            <td class="px-4 py-3">
                              <div class="flex items-center gap-2">
                                <span class="text-xs font-bold text-white bg-blue-600 px-2 py-1 rounded">INFO</span>
                                <span class="font-medium text-gray-900">{{ formatComponentName(key) }}</span>
                              </div>
                            </td>
                            <td class="px-4 py-3 text-center font-semibold text-gray-900">{{ component.count }}</td>
                            <td class="px-4 py-3 text-center text-gray-400">-</td>
                            <td class="px-4 py-3 text-center text-gray-400">-</td>
                            <td class="px-4 py-3 text-center text-sm text-gray-700">
                              {{ component.avg_minutes?.toFixed(0) }} min
                            </td>
                            <td class="px-4 py-3 text-center text-gray-400">-</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <!-- ⭐ NEW: Lead Time Servis Explanation -->
                  <div v-if="kpi.detail?.lead_time_servis" class="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <p class="text-sm font-semibold text-purple-900 mb-2">📊 Lead Time Servis Metrics:</p>
                    <ul class="text-xs text-purple-800 space-y-1">
                      <li>
                        <span class="font-bold">Efficiency:</span> 
                        <span :class="kpi.detail.lead_time_servis.efficiency >= 100 ? 'text-green-600 font-bold' : 'text-red-600 font-bold'">
                          {{ kpi.detail.lead_time_servis.efficiency }}%
                        </span>
                        {{ kpi.detail.lead_time_servis.efficiency >= 100 ? '(Lebih cepat dari estimasi ✅)' : '(Lebih lambat dari estimasi ⚠️)' }}
                      </li>
                      <li>
                        <span class="font-bold">On-Time Criteria:</span> Actual ≤ 110% dari estimasi (toleransi 10%)
                      </li>
                      <li>
                        <span class="font-bold">Standard:</span> Dinamis berdasarkan estimasi controller per order
                      </li>
                      <li>
                        <span class="font-bold">Masuk KPI:</span> Ya, berkontribusi ke overall on-time rate bersama 5 komponen lainnya
                      </li>
                    </ul>
                  </div>

                  <!-- Legend - Update -->
                  <div class="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p class="text-sm font-semibold text-blue-900 mb-2">ℹ️ Keterangan:</p>
                    <ul class="text-xs text-blue-800 space-y-1">
                      <li><span class="font-bold">KPI Components (6):</span> 5 komponen dengan standard tetap + Lead Time Servis dengan standard dinamis</li>
                      <li><span class="font-bold">Info Components (3):</span> Tunggu Part Online, Tunggu Sublet, informational saja (tidak masuk KPI)</li>
                      <li><span class="font-bold">Lead Time Servis:</span> On-time jika actual ≤ 110% estimasi controller</li>
                      <li><span class="font-bold">Overall On-Time:</span> Dihitung dari SEMUA 6 komponen KPI</li>
                    </ul>
                  </div>
                </div>

              </div>

              <!-- Footer -->
              <div class="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <button
                  @click="emit('close')"
                  class="w-full px-6 py-3 bg-gradient-to-r from-[#b70000] to-[#950000] text-white rounded-xl text-sm font-semibold hover:from-[#950000] hover:to-[#7a0000] transition-all shadow-lg"
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
  ClockIcon,
  CalendarIcon
} from '@heroicons/vue/24/outline'

const props = defineProps({
  show: Boolean,
  kpi: Object
})

const emit = defineEmits(['close'])

const formatCurrency = (value) => {
  if (!value) return 'Rp 0'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(value)
}

const getKPIIcon = (kpiName) => {
  return kpiName === 'Profit' ? CurrencyDollarIcon : ClockIcon
}

const formatComponentName = (key) => {
  const names = {
    'tunggu_penerimaan': 'Tunggu Penerimaan',
    'penerimaan': 'Penerimaan',
    'tunggu_servis': 'Tunggu Servis',
    'tunggu_konfirmasi': 'Tunggu Konfirmasi',
    'tunggu_part_offline': 'Tunggu Part (Offline)',
    'lead_time_servis': 'Lead Time Servis',  // ⭐ NEW
    'tunggu_part_online': 'Tunggu Part (Online)',
    'tunggu_sublet': 'Tunggu Sublet'
  }
  return names[key] || key
}

const getKPIComponents = (detail) => {
  if (!detail) return {}
  
  const kpiKeys = [
    'tunggu_penerimaan',
    'penerimaan',
    'tunggu_servis',
    'tunggu_konfirmasi',
    'tunggu_part_offline',
    'lead_time_servis'  // ⭐ NEW
  ]
  
  const result = {}
  kpiKeys.forEach(key => {
    if (detail[key]) {
      result[key] = detail[key]
    }
  })
  
  return result
}


const getInfoComponents = (detail) => {
  if (!detail) return {}
  
  const infoKeys = [
    'tunggu_part_online',
    'tunggu_sublet',
    'lead_time_servis'
  ]
  
  const result = {}
  infoKeys.forEach(key => {
    if (detail[key]) {
      result[key] = detail[key]
    }
  })
  
  return result
}
</script>