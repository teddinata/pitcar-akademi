<template>
  <div>
    <div class="flex justify-between items-center mb-3">
      <h3 class="font-medium text-blue-700">Query Builder Bisnis</h3>
      <button 
        type="button" 
        @click="$emit('close')" 
        class="p-1.5 rounded-full text-blue-500 hover:text-blue-700 hover:bg-blue-200"
      >
        <XMarkIcon class="w-5 h-5" />
      </button>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Modules selection -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Modul Data:</label>
        <div class="space-y-1.5">
          <div 
            v-for="(module, idx) in dataModules" 
            :key="idx"
            class="flex items-center"
          >
            <input 
              :id="`module-${idx}`"
              v-model="selectedModulesArray" 
              :value="module.name"
              type="checkbox"
              class="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
            <label :for="`module-${idx}`" class="ml-2 text-sm text-gray-700 flex items-center">
              <component :is="module.icon" class="w-4 h-4 text-gray-500 mr-1.5" />
              {{ module.name }}
            </label>
          </div>
        </div>
      </div>
      
      <!-- Time range -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Rentang Waktu:</label>
        <select 
          v-model="timeRangeModel"
          class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="this_month">Bulan Ini</option>
          <option value="last_month">Bulan Lalu</option>
          <option value="last_3_months">3 Bulan Terakhir</option>
          <option value="last_6_months">6 Bulan Terakhir</option>
          <option value="this_year">Tahun Ini</option>
         <option value="last_year">Tahun Lalu</option>
         <option value="custom">Kustom</option>
       </select>
       
       <div v-if="timeRangeModel === 'custom'" class="grid grid-cols-2 gap-2 mt-2">
         <div>
           <label class="block text-xs text-gray-500 mb-1">Dari:</label>
           <input 
             type="date" 
             v-model="customStartModel"
             class="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
           >
         </div>
         <div>
           <label class="block text-xs text-gray-500 mb-1">Sampai:</label>
           <input 
             type="date" 
             v-model="customEndModel"
             class="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
           >
         </div>
       </div>
     </div>
   </div>
   
   <!-- Visualization type -->
   <div class="mt-4">
     <label class="block text-sm font-medium text-gray-700 mb-2">Jenis Visualisasi:</label>
     <div class="flex flex-wrap gap-2">
       <button
         v-for="(vizType, idx) in visualizationTypes" 
         :key="idx"
         class="px-3 py-1.5 rounded-md text-sm flex items-center gap-2 transition-colors"
         :class="vizTypeModel === vizType.value ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
         @click="vizTypeModel = vizType.value"
       >
         <component :is="vizType.icon" class="w-4 h-4" />
         <span>{{ vizType.label }}</span>
       </button>
     </div>
   </div>
   
   <!-- Preview and generate button -->
   <div class="mt-4">
     <div class="p-3 bg-white border border-gray-200 rounded-md text-sm text-blue-600 mb-3">
       <p>{{ generatedQuery }}</p>
     </div>
     
     <button 
       @click="$emit('generate-query', generatedQuery)" 
       class="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
     >
       Gunakan Query Ini
     </button>
   </div>
 </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { 
 XMarkIcon,
 ChartBarIcon, ChartBarSquareIcon, ChartPieIcon, 
 TableCellsIcon, WrenchScrewdriverIcon
} from '@heroicons/vue/24/outline'

// Import store
import { useDataStore } from '@/stores/dataStore'

const dataStore = useDataStore()

// Props
const props = defineProps({
 modules: {
   type: Array,
   default: () => []
 },
 timeRange: {
   type: String,
   default: 'this_month'
 },
 customStart: {
   type: String,
   default: ''
 },
 customEnd: {
   type: String,
   default: ''
 },
 vizType: {
   type: String,
   default: 'auto'
 }
})

// Emits
const emit = defineEmits([
 'update:modules',
 'update:timeRange',
 'update:customStart',
 'update:customEnd',
 'update:vizType',
 'generate-query',
 'close'
])

// Local state for checkboxes (easier to manage)
const selectedModulesArray = ref([...props.modules])

// Watch for changes and emit updates
watch(selectedModulesArray, (newVal) => {
 emit('update:modules', [...newVal])
})

// Two-way binding for other props
const timeRangeModel = computed({
 get: () => props.timeRange,
 set: (value) => emit('update:timeRange', value)
})

const customStartModel = computed({
 get: () => props.customStart,
 set: (value) => emit('update:customStart', value)
})

const customEndModel = computed({
 get: () => props.customEnd,
 set: (value) => emit('update:customEnd', value)
})

const vizTypeModel = computed({
 get: () => props.vizType,
 set: (value) => emit('update:vizType', value)
})

// Data
const dataModules = computed(() => {
 // Ambil modul dari store
 return dataStore.dataModules
})

const visualizationTypes = [
 { label: 'Auto', value: 'auto', icon: WrenchScrewdriverIcon },
 { label: 'Bar Chart', value: 'bar', icon: ChartBarSquareIcon },
 { label: 'Line Chart', value: 'line', icon: ChartBarIcon },
 { label: 'Pie Chart', value: 'pie', icon: ChartPieIcon },
 { label: 'Table', value: 'table', icon: TableCellsIcon }
]

// Computed
const generatedQuery = computed(() => {
 // Generate a natural language query based on selected options
 let query = "Analisis "
 
 // Add modules
 if (selectedModulesArray.value.length === 0) {
   query += "data bisnis saya"
 } else if (selectedModulesArray.value.length === 1) {
   query += `data ${selectedModulesArray.value[0].toLowerCase()} saya`
 } else {
   const moduleNames = [...selectedModulesArray.value]
   const lastModule = moduleNames.pop()
   query += `data ${moduleNames.join(', ').toLowerCase()} dan ${lastModule.toLowerCase()} saya`
 }
 
 // Add time range
 switch (timeRangeModel.value) {
   case 'this_month':
     query += " untuk bulan ini"
     break
   case 'last_month':
     query += " untuk bulan lalu"
     break
   case 'last_3_months':
     query += " untuk 3 bulan terakhir"
     break
   case 'last_6_months':
     query += " untuk 6 bulan terakhir"
     break
   case 'this_year':
     query += " untuk tahun ini"
     break
   case 'last_year':
     query += " untuk tahun lalu"
     break
   case 'custom':
     query += ` dari ${customStartModel.value} sampai ${customEndModel.value}`
     break
 }
 
 // Add visualization preference
 if (vizTypeModel.value !== 'auto') {
   query += `. Tampilkan hasilnya sebagai grafik ${vizTypeModel.value}`
 } else {
   query += ". Mohon sertakan visualisasi yang sesuai"
 }
 
 return query
})
</script>