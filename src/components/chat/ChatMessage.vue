<template>
  <div 
    class="flex gap-3"
    :class="message.type === 'user' ? 'justify-end' : ''"
  >
    <!-- Avatar untuk AI (hanya ditampilkan untuk pesan AI) -->
    <div 
      v-if="message.type !== 'user'"
      class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
      :class="{
        'bg-green-500 text-white': message.type === 'assistant',
        'bg-yellow-500 text-white': message.type === 'system'
      }"
    >
      <SparklesIcon v-if="message.type === 'assistant'" class="w-6 h-6" />
      <ExclamationTriangleIcon v-else class="w-6 h-6" />
    </div>
    
    <!-- Message Content -->
    <div 
      class="rounded-xl p-4 max-w-[85%] group"
      :class="{
        'bg-blue-600 text-white ml-auto': message.type === 'user',
        'bg-white border border-gray-200 shadow-sm': message.type === 'assistant',
        'bg-yellow-50 border border-yellow-200': message.type === 'system'
      }"
    >
      <!-- Avatar untuk user (hanya ditampilkan untuk pesan user) -->
      <div 
        v-if="message.type === 'user'"
        class="w-8 h-8 rounded-full bg-blue-700 text-white flex items-center justify-center absolute -right-10 top-0"
      >
        <UserCircleIcon class="w-5 h-5" />
      </div>
      
      <!-- Message metadata for assistant -->
      <div 
        v-if="message.type === 'assistant'" 
        class="flex flex-wrap gap-2 mb-3 pb-2 border-b border-gray-100"
      >
        <span class="px-2 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded-full">
          {{ message.model_used || 'AI' }}
        </span>
        
        <!-- Type badge -->
        <span 
          v-if="responseType" 
          class="px-2 py-0.5 rounded-full text-xs font-medium"
          :class="{
            'bg-blue-100 text-blue-800': responseType === 'BUSINESS',
            'bg-purple-100 text-purple-800': responseType === 'GENERAL'
          }"
        >
          {{ responseType === 'BUSINESS' ? 'Business' : 'General Knowledge' }}
        </span>

        <span v-if="message.token_count" class="text-gray-400 text-xs">
          {{ message.token_count }} tokens
        </span>
        
        <span 
          v-if="message.data_sources && message.data_sources.length" 
          class="flex items-center text-xs text-gray-600"
        >
          <ServerIcon class="w-3 h-3 mr-1" /> 
          <span>
            {{ message.data_sources.join(', ') }}
          </span>
        </span>
      </div>
      
      <!-- Message text -->
      <div 
        class="prose prose-sm max-w-none mb-1"
        :class="{ 'prose-invert': message.type === 'user' }"
        v-html="formattedContent"
      ></div>
      
      <!-- Visualizations section -->
      <div 
        v-if="message.visualizations && message.visualizations.length" 
        class="mt-4 space-y-4"
      >
        <div 
          v-for="(viz, vizIndex) in message.visualizations" 
          :key="vizIndex" 
          class="border border-gray-200 rounded-md overflow-hidden bg-white"
        >
          <div class="bg-gray-50 px-3 py-2 flex justify-between items-center border-b border-gray-200">
            <h4 class="font-medium text-gray-700 text-sm">{{ viz.title }}</h4>
            <button 
              @click="$emit('expand-viz', viz)" 
              class="p-1 text-gray-500 hover:text-gray-700 rounded hover:bg-gray-100"
            >
              <ArrowsPointingOutIcon class="w-4 h-4" />
            </button>
          </div>
          <div class="p-4 overflow-auto max-h-[400px]" v-html="viz.content"></div>
        </div>
      </div>
      
      <!-- Message timestamp -->
      <div 
        :class="message.type === 'user' ? 'text-blue-300' : 'text-gray-400'"
        class="text-xs mt-2 text-right"
      >
        {{ formatTime(message.timestamp) }}
      </div>
      
      <!-- Message actions -->
      <div 
        v-if="message.type === 'assistant'" 
        class="flex pt-3 mt-3 border-t border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <button 
          @click="$emit('copy', message.content)" 
          class="mr-4 text-xs text-gray-500 hover:text-gray-700 flex items-center"
        >
          <ClipboardDocumentIcon class="w-4 h-4 mr-1.5" /> Salin
        </button>
        <button 
          @click="$emit('save', message)" 
          class="mr-4 text-xs text-gray-500 hover:text-gray-700 flex items-center"
        >
          <BookmarkIcon class="w-4 h-4 mr-1.5" /> Simpan
        </button>
        <button 
          v-if="message.visualizations && message.visualizations.length" 
          @click="$emit('export-viz', message)" 
          class="text-xs text-gray-500 hover:text-gray-700 flex items-center"
        >
          <ArrowDownTrayIcon class="w-4 h-4 mr-1.5" /> Ekspor
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { format } from 'date-fns'
import { marked } from 'marked'
import DOMPurify from 'dompurify'

import { 
  UserCircleIcon, SparklesIcon, ExclamationTriangleIcon,
  ServerIcon, ArrowsPointingOutIcon, ClipboardDocumentIcon,
  BookmarkIcon, ArrowDownTrayIcon
} from '@heroicons/vue/24/outline'

const props = defineProps({
  message: {
    type: Object,
    required: true
  }
})

defineEmits(['copy', 'save', 'export-viz', 'expand-viz'])

// Deteksi jenis respons
const responseType = computed(() => {
  if (props.message.type !== 'assistant') return null
  
  const content = props.message.content || ''
  if (content.includes('[RESPONSE_TYPE:')) {
    const match = content.match(/\[RESPONSE_TYPE:\s*(.*?)\]/)
    if (match) {
      return match[1] // 'BUSINESS' atau 'GENERAL'
    }
  }
  return null
})

// Format konten pesan
const formattedContent = computed(() => {
  let content = props.message.content || ''
  
  // Hapus indikator dari konten jika ada
  if (responseType.value) {
    const regex = new RegExp(`\\[RESPONSE_TYPE:\\s*${responseType.value}\\]`, 'g')
    content = content.replace(regex, '')
  }
  
  // Format angka rupiah
  content = formatCurrency(content)
  
  // Gunakan DOMPurify dan marked untuk format markdown
  const html = marked(content)
  return DOMPurify.sanitize(html)
})

function formatTime(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  
  // Add 7 hours to adjust for Indonesia timezone (UTC+7)
  const adjustedDate = new Date(date.getTime() + (7 * 60 * 60 * 1000))
  
  return format(adjustedDate, 'HH:mm')
}

// Format angka rupiah dalam teks
function formatCurrency(text) {
  // Find patterns like: Rp 1000000
  const regex = /Rp\s*(\d{1,3}(?:\.\d{3})*(?:,\d+)?|\d+(?:,\d+)?)/g
  
  return text.replace(regex, (match) => {
    // Extract the number part
    const numPart = match.replace(/Rp\s*/, '')
    
    // Remove any existing formatting
    const cleanNum = numPart.replace(/\./g, '').replace(/,/g, '.')
    
    // Format with spacing for better readability if it's a large number
    try {
      const num = parseFloat(cleanNum)
      return `Rp ${num.toLocaleString('id-ID')}`
    } catch {
      return match
    }
  })
}
</script>

<style scoped>
.message-enter-active,
.message-leave-active {
  transition: all 0.3s ease;
}
.message-enter-from,
.message-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>