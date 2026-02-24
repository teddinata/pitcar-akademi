<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
    <div class="relative bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] flex flex-col animate-fade-slide-up">
      <div class="flex justify-between items-center p-5 border-b border-gray-200">
        <h3 class="text-xl font-semibold text-gray-800">Ekspor Percakapan</h3>
        <button @click="$emit('close')" class="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100">
          <XMarkIcon class="w-5 h-5" />
        </button>
      </div>
      
      <div class="flex-1 overflow-y-auto p-5 space-y-3">
        <div 
          v-for="format in exportFormats" 
          :key="format.value"
          class="flex gap-4 p-4 border rounded-lg cursor-pointer transition-colors"
          :class="[
            selectedFormat === format.value ? 
            'border-blue-500 bg-blue-50' : 
            'border-gray-200 hover:border-blue-300'
          ]"
          @click="selectedFormat = format.value"
        >
          <div class="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-blue-500 text-xl">
            <component :is="format.icon" class="w-6 h-6" />
          </div>
          <div>
            <h4 class="text-lg font-medium text-gray-800 mb-1">{{ format.name }}</h4>
            <p class="text-sm text-gray-500">{{ format.description }}</p>
          </div>
        </div>
      </div>
      
      <div class="p-4 border-t border-gray-200 flex justify-end space-x-3">
        <button 
          @click="$emit('close')" 
          class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Batal
        </button>
        <button 
          @click="downloadExport" 
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
        >
          <ArrowDownTrayIcon class="w-4 h-4 mr-1.5" /> Unduh
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { 
  XMarkIcon, 
  ArrowDownTrayIcon,
  DocumentIcon,
  DocumentTextIcon,
  CodeBracketIcon,
  TableCellsIcon
} from '@heroicons/vue/24/outline'

import { useChatStore } from '@/stores/chatStore'
import { useToast } from '@/composables/useToast'

const chatStore = useChatStore()
const { showToast } = useToast()

const emit = defineEmits(['close'])

const selectedFormat = ref('json')
const exportFormats = [
  {
    name: 'JSON',
    value: 'json',
    icon: CodeBracketIcon,
    description: 'Data lengkap dengan semua metadata'
  },
  {
    name: 'Text',
    value: 'txt',
    icon: DocumentTextIcon,
    description: 'Format teks sederhana'
  },
  {
    name: 'HTML',
    value: 'html',
    icon: CodeBracketIcon,
    description: 'Halaman web terformat'
  },
  {
    name: 'Markdown',
    value: 'markdown',
    icon: DocumentIcon,
    description: 'Dokumen Markdown'
  },
  {
    name: 'CSV',
    value: 'csv',
    icon: TableCellsIcon,
    description: 'Data dalam format CSV'
  }
]

async function downloadExport() {
  try {
    await chatStore.exportChat(selectedFormat.value)
    emit('close')
  } catch (error) {
    showToast({
      message: `Error: ${error.message}`,
      type: 'error'
    })
  }
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