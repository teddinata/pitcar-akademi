<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
    <div class="relative bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-fade-slide-up">
      <div class="flex justify-between items-center p-5 border-b border-gray-200">
        <h3 class="text-xl font-semibold text-gray-800">{{ visualization.title }}</h3>
        <button @click="$emit('close')" class="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100">
          <XMarkIcon class="w-5 h-5" />
        </button>
      </div>
      
      <div class="flex-1 overflow-y-auto p-5">
        <div class="w-full h-[500px] flex items-center justify-center bg-white" v-html="visualization.content"></div>
      </div>
      
      <div class="p-4 border-t border-gray-200 flex justify-end space-x-3">
        <button 
          @click="exportVisualization" 
          class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors flex items-center"
        >
          <ArrowDownTrayIcon class="w-4 h-4 mr-1.5" /> Ekspor
        </button>
        <button 
          @click="$emit('close')" 
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Tutup
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { XMarkIcon, ArrowDownTrayIcon } from '@heroicons/vue/24/outline'
import { useToast } from '@/composables/useToast'

const props = defineProps({
  visualization: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close'])
const { showToast } = useToast()

function exportVisualization() {
  // Implementasi ekspor akan ditambahkan di masa depan
  showToast({
    message: 'Fitur ekspor visualisasi akan segera hadir',
    type: 'info'
  })
}
</script>

<style scoped>
.animate-fade-slide-up {
  animation: fadeSlideUp 0.3s ease-out;
}

@keyframes fadeSlideUp {
  from { 
    opacity: 0;
    transform: translateY(20px);
  }
  to { 
    opacity: 1;
    transform: translateY(0);
  }
}
</style>