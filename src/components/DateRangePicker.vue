<!-- src/components/DateRangePicker.vue -->
<template>
  <!-- Overlay untuk menutup DatePicker saat klik di luar -->
  <div 
    v-if="isOpen" 
    class="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
    @click="closeAndEmit"
  ></div>

  <!-- Container DatePicker -->
  <div class="relative inline-block">
    <!-- Button Trigger -->
    <button
      @click="togglePicker"
      type="button"
      class="inline-flex items-center px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm hover:shadow-md"
    >
      <CalendarDaysIcon class="h-5 w-5 mr-2 text-gray-500" />
      <span v-if="!modelValue.start && !modelValue.end">Pilih Tanggal</span>
      <span v-else class="flex items-center space-x-2">
        <span>{{ formatDate(modelValue.start) }}</span>
        <span class="text-gray-400">-</span>
        <span>{{ formatDate(modelValue.end) }}</span>
      </span>
    </button>

    <!-- DatePicker Dropdown -->
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0 translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-1"
    >
      <div
        v-if="isOpen"
        class="absolute right-0 mt-2 z-50 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
        style="min-width: 320px;"
        @click.stop
      >
        <!-- Header -->
        <div class="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-white">Pilih Rentang Tanggal</h3>
            <button
              @click="closeAndEmit"
              class="text-white/80 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg"
            >
              <XMarkIcon class="h-5 w-5" />
            </button>
          </div>
          
          <!-- Selected Range Display -->
          <div v-if="localRange.start || localRange.end" class="mt-3 text-sm text-white/90">
            <div class="flex items-center space-x-2">
              <span v-if="localRange.start">{{ formatDate(localRange.start) }}</span>
              <span v-if="localRange.start && localRange.end">→</span>
              <span v-if="localRange.end">{{ formatDate(localRange.end) }}</span>
            </div>
          </div>
        </div>

        <!-- Calendar Grid -->
        <div class="p-6 space-y-4">
          <!-- Month Navigation -->
          <div class="flex items-center justify-between mb-4">
            <button
              @click="previousMonth"
              class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeftIcon class="h-5 w-5 text-gray-600" />
            </button>
            
            <div class="text-center">
              <h4 class="text-base font-semibold text-gray-900">
                {{ monthNames[currentMonth] }} {{ currentYear }}
              </h4>
            </div>

            <button
              @click="nextMonth"
              class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRightIcon class="h-5 w-5 text-gray-600" />
            </button>
          </div>

          <!-- Days Header -->
          <div class="grid grid-cols-7 gap-1 mb-2">
            <div 
              v-for="day in dayNames" 
              :key="day"
              class="text-center text-xs font-medium text-gray-500 py-2"
            >
              {{ day }}
            </div>
          </div>

          <!-- Calendar Days -->
          <div class="grid grid-cols-7 gap-1">
            <div
              v-for="(day, index) in calendarDays"
              :key="index"
              class="aspect-square"
            >
              <button
                v-if="day"
                @click="selectDate(day.date)"
                :disabled="day.disabled"
                :class="[
                  'w-full h-full flex items-center justify-center text-sm rounded-lg transition-all',
                  getDayClasses(day)
                ]"
              >
                {{ day.day }}
              </button>
            </div>
          </div>

          <!-- Quick Select Buttons -->
          <div class="border-t border-gray-200 pt-4 mt-4">
            <p class="text-xs font-medium text-gray-700 mb-3">Pilihan Cepat:</p>
            <div class="grid grid-cols-2 gap-2">
              <button
                v-for="preset in quickPresets"
                :key="preset.label"
                @click="applyPreset(preset)"
                class="px-3 py-2 text-xs font-medium bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg transition-colors border border-gray-200 hover:border-gray-300"
              >
                {{ preset.label }}
              </button>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex space-x-3 pt-4 border-t border-gray-200">
            <button
              @click="clearSelection"
              class="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-xl transition-all"
            >
              Clear
            </button>
            <button
              @click="applySelection"
              :disabled="!localRange.start || !localRange.end"
              class="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              Terapkan
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths, subMonths, isSameDay, isAfter, isBefore, isWithinInterval, parseISO } from 'date-fns'
import { id } from 'date-fns/locale'
import { 
  CalendarDaysIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon,
  XMarkIcon 
} from '@heroicons/vue/24/outline'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({ start: null, end: null })
  }
})

const emit = defineEmits(['update:modelValue', 'close'])

// State
const isOpen = ref(false)
const currentMonth = ref(new Date().getMonth())
const currentYear = ref(new Date().getFullYear())
const localRange = ref({
  start: props.modelValue.start ? parseISO(props.modelValue.start) : null,
  end: props.modelValue.end ? parseISO(props.modelValue.end) : null
})

// Constants
const monthNames = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]

const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']

const quickPresets = [
  {
    label: '7 Hari Terakhir',
    getValue: () => ({
      start: format(addDays(new Date(), -6), 'yyyy-MM-dd'),
      end: format(new Date(), 'yyyy-MM-dd')
    })
  },
  {
    label: '30 Hari Terakhir',
    getValue: () => ({
      start: format(addDays(new Date(), -29), 'yyyy-MM-dd'),
      end: format(new Date(), 'yyyy-MM-dd')
    })
  },
  {
    label: 'Bulan Ini',
    getValue: () => ({
      start: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
      end: format(endOfMonth(new Date()), 'yyyy-MM-dd')
    })
  },
  {
    label: 'Bulan Lalu',
    getValue: () => {
      const lastMonth = addMonths(new Date(), -1)
      return {
        start: format(startOfMonth(lastMonth), 'yyyy-MM-dd'),
        end: format(endOfMonth(lastMonth), 'yyyy-MM-dd')
      }
    }
  }
]

// Computed
const calendarDays = computed(() => {
  const firstDay = new Date(currentYear.value, currentMonth.value, 1)
  const lastDay = new Date(currentYear.value, currentMonth.value + 1, 0)
  
  const startDate = startOfWeek(firstDay, { weekStartsOn: 0 })
  const endDate = endOfWeek(lastDay, { weekStartsOn: 0 })
  
  const days = []
  let currentDate = startDate
  
  while (currentDate <= endDate) {
    const isCurrentMonth = currentDate.getMonth() === currentMonth.value
    const isToday = isSameDay(currentDate, new Date())
    const isFuture = isAfter(currentDate, new Date())
    
    days.push({
      date: new Date(currentDate),
      day: currentDate.getDate(),
      isCurrentMonth,
      isToday,
      disabled: isFuture
    })
    
    currentDate = addDays(currentDate, 1)
  }
  
  return days
})

// Methods
const togglePicker = () => {
  isOpen.value = !isOpen.value
}

const closeAndEmit = () => {
  isOpen.value = false
  emit('close')
}

const formatDate = (date) => {
  if (!date) return ''
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return format(dateObj, 'dd MMM yyyy', { locale: id })
}

const selectDate = (date) => {
  if (!localRange.value.start || (localRange.value.start && localRange.value.end)) {
    // Start new selection
    localRange.value = { start: date, end: null }
  } else if (isBefore(date, localRange.value.start)) {
    // Selected date is before start, swap them
    localRange.value = { start: date, end: localRange.value.start }
  } else {
    // Complete the range
    localRange.value.end = date
  }
}

const getDayClasses = (day) => {
  const classes = []
  
  if (!day.isCurrentMonth) {
    classes.push('text-gray-300 cursor-not-allowed')
  } else if (day.disabled) {
    classes.push('text-gray-300 cursor-not-allowed opacity-50')
  } else {
    classes.push('text-gray-700 hover:bg-blue-50 cursor-pointer')
  }
  
  if (day.isToday && day.isCurrentMonth) {
    classes.push('font-bold border-2 border-blue-400')
  }
  
  // Check if date is in selected range
  if (localRange.value.start && localRange.value.end) {
    const isInRange = isWithinInterval(day.date, {
      start: localRange.value.start,
      end: localRange.value.end
    })
    
    if (isInRange) {
      classes.push('bg-blue-100')
    }
  }
  
  // Highlight start and end dates
  if (localRange.value.start && isSameDay(day.date, localRange.value.start)) {
    classes.push('bg-blue-600 text-white hover:bg-blue-700 font-semibold')
  }
  
  if (localRange.value.end && isSameDay(day.date, localRange.value.end)) {
    classes.push('bg-blue-600 text-white hover:bg-blue-700 font-semibold')
  }
  
  return classes.join(' ')
}

const previousMonth = () => {
  if (currentMonth.value === 0) {
    currentMonth.value = 11
    currentYear.value--
  } else {
    currentMonth.value--
  }
}

const nextMonth = () => {
  if (currentMonth.value === 11) {
    currentMonth.value = 0
    currentYear.value++
  } else {
    currentMonth.value++
  }
}

const applyPreset = (preset) => {
  const range = preset.getValue()
  localRange.value = {
    start: parseISO(range.start),
    end: parseISO(range.end)
  }
  applySelection()
}

const clearSelection = () => {
  localRange.value = { start: null, end: null }
  emit('update:modelValue', { start: null, end: null })
}

const applySelection = () => {
  if (localRange.value.start && localRange.value.end) {
    emit('update:modelValue', {
      start: format(localRange.value.start, 'yyyy-MM-dd'),
      end: format(localRange.value.end, 'yyyy-MM-dd')
    })
    closeAndEmit()
  }
}

// Watch for external changes
watch(() => props.modelValue, (newValue) => {
  if (newValue.start && newValue.end) {
    localRange.value = {
      start: parseISO(newValue.start),
      end: parseISO(newValue.end)
    }
  }
}, { deep: true })
</script>

<style scoped>
/* Custom scrollbar untuk mobile */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* Animasi smooth untuk transitions */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .absolute {
    position: fixed !important;
    right: 1rem !important;
    left: 1rem !important;
    top: 50% !important;
    transform: translateY(-50%) !important;
    margin-top: 0 !important;
  }
}
</style>