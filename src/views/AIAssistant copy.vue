<template>
  <div class="min-h-screen bg-gray-50 flex">
    <!-- Chat History Sidebar -->
    <div 
      class="w-64 bg-white border-r flex flex-col transition-all duration-300"
      :class="showSidebar ? 'translate-x-0' : '-translate-x-full'"
    >
      <!-- Sidebar Header -->
      <div class="p-4 border-b">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold text-gray-900">Chat History</h2>
          <button 
            class="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
            @click="showSidebar = false"
          >
            <XMarkIcon class="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <button
          @click="startNewChat"
          class="mt-2 w-full flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusIcon class="w-4 h-4 mr-2" />
          New Chat
        </button>
      </div>

      <!-- Chat List -->
      <div class="flex-1 overflow-y-auto p-2 space-y-2">
        <button
          v-for="chat in chatHistory"
          :key="chat.id"
          @click="selectChat(chat)"
          class="w-full text-left p-3 rounded-lg transition-all duration-200 hover:bg-gray-100 flex items-start space-x-3"
          :class="selectedChat?.id === chat.id ? 'bg-gray-100 ring-2 ring-blue-500' : ''"
        >
          <ChatBubbleLeftIcon class="w-5 h-5 text-gray-400 mt-0.5" />
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-900 truncate">{{ chat.title }}</p>
            <p class="text-xs text-gray-500">{{ formatDate(chat.timestamp) }}</p>
          </div>
        </button>
      </div>
    </div>

    <!-- Main Chat Area -->
    <div class="flex-1 flex flex-col min-w-0">
      <!-- Header -->
      <div class="bg-white shadow-sm border-b px-4 py-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center min-w-0">
            <button 
              class="lg:hidden mr-3 p-1 hover:bg-gray-100 rounded-lg"
              @click="showSidebar = true"
            >
              <Bars3Icon class="w-6 h-6 text-gray-500" />
            </button>
            <h1 class="text-xl font-semibold text-gray-900 truncate">
              {{ selectedChat?.title || 'New Chat' }}
            </h1>
          </div>
          <div class="flex items-center space-x-2">
            <button
              @click="clearChat"
              class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <TrashIcon class="h-4 w-4 mr-1.5" />
              Clear
            </button>
            <button
              class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Cog6ToothIcon class="h-4 w-4 mr-1.5" />
              Settings
            </button>
          </div>
        </div>
      </div>

      <!-- Messages Area -->
      <div class="flex-1 overflow-y-auto bg-gray-50" ref="messagesContainer">
        <div class="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <!-- Welcome Message -->
          <div v-if="messages.length === 0" class="text-center py-12">
            <div class="bg-white rounded-2xl p-8 shadow-sm border">
              <div class="flex items-center justify-center space-x-3 mb-6">
                <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <img src="/pitcar-modified.png" alt="PITCAR" class="w-10 h-10" />
                </div>
                <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <SparklesIcon class="h-8 w-8 text-blue-600" />
                </div>
              </div>
              <h3 class="mt-4 text-xl font-semibold text-gray-900">Selamat datang di PITCAR AI Assistant</h3>
              <p class="mt-2 text-gray-600">Saya siap membantu Anda dengan berbagai tugas di bengkel Pitcar Service.</p>
              <div class="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  v-for="(suggestion, index) in suggestions"
                  :key="index"
                  @click="usePromptSuggestion(suggestion)"
                  class="text-left p-4 rounded-xl border hover:border-red-500 hover:bg-red-50 transition-all duration-200"
                >
                  <h4 class="font-medium text-gray-900">{{ suggestion.title }}</h4>
                  <p class="mt-1 text-sm text-gray-500">{{ suggestion.description }}</p>
                </button>
              </div>
            </div>
          </div>

          <!-- Chat Messages -->
          <div v-else class="space-y-6">
            <div
              v-for="(message, index) in messages"
              :key="index"
              :class="[
                'flex items-start space-x-4 animate-fade-in',
                message.isUser ? 'justify-end' : ''
              ]"
            >
              <div 
                :class="[
                  'rounded-2xl p-5 shadow-sm max-w-3xl',
                  message.isUser ? 'bg-blue-600 text-white' : 'bg-white border'
                ]"
              >
                <div class="flex items-start space-x-3">
                  <!-- Avatar -->
                  <div 
                    :class="[
                      'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
                      message.isUser ? 'bg-blue-500' : 'bg-purple-100'
                    ]"
                  >
                    <UserCircleIcon v-if="message.isUser" class="w-5 h-5 text-white" />
                    <SparklesIcon v-else class="w-5 h-5 text-purple-600" />
                  </div>

                  <!-- Message Content -->
                  <div class="flex-1 min-w-0 space-y-1">
                    <p :class="[
                      'text-sm font-medium',
                      message.isUser ? 'text-blue-100' : 'text-gray-900'
                    ]">
                      {{ message.isUser ? 'You' : 'AI Assistant' }}
                    </p>
                    <div 
                      :class="[
                        'prose prose-sm max-w-none',
                        message.isUser ? 'prose-invert' : ''
                      ]"
                      v-html="formatMessage(message.content)"
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Loading Indicator -->
            <div v-if="isLoading" class="flex items-start space-x-4">
              <div class="rounded-2xl p-5 bg-white border shadow-sm">
                <div class="flex items-start space-x-3">
                  <div class="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                    <SparklesIcon class="w-5 h-5 text-purple-600" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-900">AI Assistant</p>
                    <div class="mt-1">
                      <div class="flex space-x-2">
                        <div class="w-2 h-2 rounded-full bg-gray-300 animate-bounce"></div>
                        <div class="w-2 h-2 rounded-full bg-gray-300 animate-bounce delay-100"></div>
                        <div class="w-2 h-2 rounded-full bg-gray-300 animate-bounce delay-200"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Input Area -->
      <div class="bg-white border-t px-4 py-4 sm:px-6 lg:px-8">
        <div class="max-w-4xl mx-auto">
          <form @submit.prevent="sendMessage" class="relative">
            <div class="rounded-xl border shadow-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
              <textarea
                v-model="newMessage"
                rows="1"
                class="block w-full rounded-xl border-0 resize-none bg-transparent py-3 px-4 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                placeholder="Type your message..."
                @keydown.enter.exact.prevent="sendMessage"
                @keydown.enter.shift.exact.prevent="newMessage += '\n'"
                @input="autoResizeTextarea"
                ref="messageInput"
              ></textarea>
              
              <div class="flex items-center justify-between px-3 py-2 border-t">
                <div class="flex items-center space-x-4">
                  <button
                    type="button"
                    class="text-gray-400 hover:text-gray-500"
                  >
                    <PaperClipIcon class="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    class="text-gray-400 hover:text-gray-500"
                  >
                    <MicrophoneIcon class="w-5 h-5" />
                  </button>
                </div>
                <button
                  type="submit"
                  :disabled="!newMessage.trim() || isLoading"
                  class="inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span class="mr-2">Send</span>
                  <PaperAirplaneIcon class="h-4 w-4" />
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from 'vue'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import { format } from 'date-fns'
import {
  SparklesIcon,
  UserCircleIcon,
  PaperAirplaneIcon,
  TrashIcon,
  Cog6ToothIcon,
  ChatBubbleLeftIcon,
  PlusIcon,
  XMarkIcon,
  Bars3Icon,
  PaperClipIcon,
  MicrophoneIcon
} from '@heroicons/vue/24/outline'

// State
const messages = ref([])
const newMessage = ref('')
const isLoading = ref(false)
const messagesContainer = ref(null)
const messageInput = ref(null)
const showSidebar = ref(window.innerWidth >= 1024) // Show by default on large screens
const selectedChat = ref(null)

// Mock chat history
const chatHistory = ref([
  {
    id: 1,
    title: 'Diagnosa BMW 320i',
    timestamp: new Date('2024-02-13T10:30:00'),
    messages: []
  },
  {
    id: 2,
    title: 'Service Berkala Mercedes C200',
    timestamp: new Date('2024-02-13T14:15:00'),
    messages: []
  },
  {
    id: 3,
    title: 'Penanganan Keluhan Pelanggan',
    timestamp: new Date('2024-02-12T16:45:00'),
    messages: []
  }
])

// Prompt suggestions
const suggestions = [
  {
    title: 'Diagnosis Kendaraan',
    description: 'Bantuan menganalisis gejala dan potensi masalah pada kendaraan pelanggan.'
  },
  {
    title: 'Estimasi Service',
    description: 'Panduan menghitung estimasi biaya dan waktu pengerjaan service.'
  },
  {
    title: 'SOP Bengkel',
    description: 'Informasi tentang prosedur standar operasional bengkel Pitcar.'
  },
  {
    title: 'Customer Service',
    description: 'Tips menangani pertanyaan dan keluhan pelanggan dengan profesional.'
  }
]

// Methods
const formatMessage = (content) => {
  return DOMPurify.sanitize(marked(content))
}

const formatDate = (date) => {
  return format(date, 'MMM d, yyyy')
}

const scrollToBottom = async () => {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

const mockAIResponse = async (message) => {
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  const responses = {
    default: "Saya mengerti pertanyaan Anda. Ada yang bisa saya bantu lebih lanjut?",
    greeting: "Halo! Ada yang bisa PITCAR AI Assistant bantu hari ini?",
    thanks: "Sama-sama! Ada hal lain yang ingin Anda tanyakan seputar layanan Pitcar Service?",
    help: "Saya siap membantu! Saya bisa membantu Anda dengan diagnosis kendaraan, estimasi service, informasi SOP, dan panduan pelayanan pelanggan. Apa yang ingin Anda ketahui?",
    service: "Untuk layanan service berkala, saya bisa membantu memberikan estimasi biaya dan waktu pengerjaan. Mohon berikan detail kendaraan seperti merk, tipe, dan tahun pembuatan.",
    diagnosis: "Untuk membantu diagnosis, mohon jelaskan gejala yang dialami kendaraan (suara, getaran, performa, dll). Semakin detail informasinya, semakin akurat analisis yang bisa saya berikan.",
    complaint: "Saya mengerti ada keluhan yang perlu ditangani. Mari kita bahas bersama untuk mencari solusi terbaik sesuai dengan standar layanan Pitcar Service."
  }

  const lowercaseMsg = message.toLowerCase()
  
  if (lowercaseMsg.includes('halo') || lowercaseMsg.includes('hi')) {
    return responses.greeting
  } else if (lowercaseMsg.includes('terima kasih')) {
    return responses.thanks
  } else if (lowercaseMsg.includes('bantu')) {
    return responses.help
  } else if (lowercaseMsg.includes('service') || lowercaseMsg.includes('servis')) {
    return responses.service
  } else if (lowercaseMsg.includes('diagnosis') || lowercaseMsg.includes('check')) {
    return responses.diagnosis
  } else if (lowercaseMsg.includes('keluhan') || lowercaseMsg.includes('komplain')) {
    return responses.complaint
  }
  
  return responses.default
}

const sendMessage = async () => {
  const message = newMessage.value.trim()
  if (!message || isLoading.value) return

  // Add user message
  messages.value.push({
    content: message,
    isUser: true,
    timestamp: new Date()
  })
  
  newMessage.value = ''
  await scrollToBottom()

  // Simulate AI response
  isLoading.value = true
  try {
    const response = await mockAIResponse(message)
    messages.value.push({
      content: response,
      isUser: false,
      timestamp: new Date()
    })
  } catch (error) {
    console.error('Error getting AI response:', error)
  } finally {
    isLoading.value = false
    await scrollToBottom()
  }
}

const clearChat = () => {
  messages.value = []
  newMessage.value = ''
}

const startNewChat = () => {
  selectedChat.value = null
  messages.value = []
  newMessage.value = ''
  messageInput.value?.focus()
}

const selectChat = (chat) => {
  selectedChat.value = chat
  messages.value = chat.messages
  if (window.innerWidth < 1024) {
    showSidebar.value = false
  }
}

const usePromptSuggestion = (suggestion) => {
  newMessage.value = `Help me with ${suggestion.title.toLowerCase()}: `
  messageInput.value?.focus()
}

const autoResizeTextarea = () => {
  const textarea = messageInput.value
  if (!textarea) return
  
  textarea.style.height = 'auto'
  textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px'
}

// Lifecycle hooks
onMounted(() => {
  messageInput.value?.focus()
  
  // Handle window resize for responsive sidebar
  window.addEventListener('resize', () => {
    showSidebar.value = window.innerWidth >= 1024
  })
})

// Watch for message changes to save to selected chat
watch(messages, (newMessages) => {
  if (selectedChat.value) {
    selectedChat.value.messages = [...newMessages]
  }
}, { deep: true })
</script>

<style>
/* Add custom scrollbar styling */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.5);
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background-color: rgba(156, 163, 175, 0.7);
}

/* Animation for new messages */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-out forwards;
}

/* Enhance prose styling for markdown content */
.prose {
  max-width: none;
}

.prose pre {
  background-color: #f3f4f6;
  padding: 1rem;
  border-radius: 0.5rem;
}

.prose code {
  color: #ef4444;
  background-color: #fee2e2;
  padding: 0.2em 0.4em;
  border-radius: 0.25em;
}

.prose-invert {
  color: white;
}

.prose-invert a {
  color: #93c5fd;
}

.prose-invert code {
  color: #fecaca;
  background-color: rgba(254, 202, 202, 0.1);
}

.prose-invert pre {
  background-color: rgba(0, 0, 0, 0.2);
}
</style>