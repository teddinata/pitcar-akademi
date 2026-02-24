<template>
  <div class="flex h-screen bg-gray-50 overflow-hidden">
    <Toast
      v-model:show="toast.show"
      :message="toast.message"
      :type="toast.type"
      :duration="toast.duration"
    />
    <!-- Sidebar Mobile Overlay -->
    <div 
      v-if="showSidebar && isMobile" 
      class="fixed inset-0 bg-black bg-opacity-50 z-40"
      @click="toggleSidebar(false)"
    ></div>
    
    <!-- Chat History Sidebar -->
    <div 
      class="w-72 bg-white border-r border-gray-200 flex-shrink-0 flex flex-col transition-all duration-300 h-screen fixed lg:relative z-50 shadow-lg lg:shadow-none"
      :class="showSidebar ? 'translate-x-0' : '-translate-x-full'"
    >
      <ChatSidebar 
        :current-chat-id="chatStore.currentChat?.id"
        @toggle-sidebar="toggleSidebar"
        @select-chat="selectChat"
        @create-chat="createNewChat"
      />
    </div>

    <!-- Main Chat Area -->
    <div class="flex-1 flex flex-col h-screen relative">
      <!-- Header -->
      <header class="flex items-center justify-between h-16 px-4 bg-white border-b border-gray-200 flex-shrink-0 z-10">
        <div class="flex items-center">
          <button 
            @click="toggleSidebar" 
            class="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 lg:hidden"
          >
            <Bars3Icon class="w-6 h-6" />
          </button>
          
          <h2 class="ml-3 text-lg font-semibold text-gray-800 truncate">
            {{ chatStore.currentChat?.name || 'AI Business Assistant' }}
          </h2>
          
          <span 
            v-if="chatStore.currentChat?.state === 'archived'" 
            class="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800"
          >
            Archived
          </span>
        </div>
        
        <div class="flex items-center space-x-2">
          <ModelSelector v-model="selectedModel" :remaining-gpt4="settingsStore.remainingGpt4" />
          
          <button 
            @click="exportChat" 
            class="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100" 
            title="Export"
            :disabled="!chatStore.currentChat?.id"
            :class="{'opacity-50 cursor-not-allowed': !chatStore.currentChat?.id}"
          >
            <ArrowDownTrayIcon class="w-5 h-5" />
          </button>
          
          <button 
            v-if="chatStore.currentChat?.state === 'archived'"
            @click="restoreChat" 
            class="p-2 rounded-md text-green-500 hover:text-green-700 hover:bg-green-100" 
            title="Restore Chat"
          >
            <ArrowUturnUpIcon class="w-5 h-5" />
          </button>
          
          <button 
            v-else
            @click="archiveChat" 
            class="p-2 rounded-md text-amber-500 hover:text-amber-700 hover:bg-amber-100" 
            title="Archive Chat"
          >
            <ArchiveBoxIcon class="w-5 h-5" />
          </button>
          
          <button 
            @click="clearChat" 
            class="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100" 
            title="Clear Chat"
          >
            <TrashIcon class="w-5 h-5" />
          </button>
          
          <button 
            @click="openSettings" 
            class="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100" 
            title="Settings"
          >
            <Cog6ToothIcon class="w-5 h-5" />
          </button>
        </div>
      </header>
      
      <!-- Chat Messages -->
      <div 
        ref="messagesContainer"
        class="flex-1 overflow-y-auto px-4 py-6 bg-gray-50"
      >
        <!-- REMOVED: Draft Notification -->
        
        <!-- Loading Messages -->
        <div 
          v-if="chatStore.isLoadingMessages" 
          class="flex flex-col items-center justify-center h-64 text-gray-500"
        >
          <svg class="animate-spin h-8 w-8 text-blue-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span class="text-sm font-medium">Memuat percakapan...</span>
        </div>
        
        <!-- Empty State -->
        <div 
          v-else-if="chatStore.messages.length === 0" 
          class="flex flex-col items-center justify-center h-64 text-gray-500"
        >
          <ChatBubbleLeftRightIcon class="h-12 w-12 text-gray-300 mb-4" />
          <h3 class="text-lg font-medium text-gray-700 mb-2">Tidak ada percakapan</h3>
          <p class="text-sm text-gray-500 text-center max-w-md mb-6">
            Mulai percakapan baru dengan mengirim pesan di bawah
          </p>
          <button 
            @click="focusInput"
            class="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Mulai Percakapan
          </button>
        </div>
        
        <!-- Messages -->
        <div v-else class="space-y-6 max-w-3xl mx-auto">
          <TransitionGroup name="message">
            <ChatMessage 
              v-for="message in chatStore.messages" 
              :key="message.id"
              :message="message"
              @copy="copyToClipboard"
              @save="saveAsNote"
              @export-viz="exportVisualization"
              @expand-viz="expandVisualization"
            />
          </TransitionGroup>
        </div>
        
        <!-- Thinking indicator -->
        <div 
          v-if="chatStore.isThinking" 
          class="max-w-3xl mx-auto mt-6"
        >
          <div class="flex items-start gap-3">
            <div class="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center flex-shrink-0">
              <SparklesIcon class="w-6 h-6" />
            </div>
            <div class="flex-1 bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
              <div class="flex justify-center items-center h-7">
                <div class="flex space-x-2">
                  <div class="w-2.5 h-2.5 bg-blue-600 rounded-full animate-pulse"></div>
                  <div class="w-2.5 h-2.5 bg-blue-600 rounded-full animate-pulse" style="animation-delay: 0.2s"></div>
                  <div class="w-2.5 h-2.5 bg-blue-600 rounded-full animate-pulse" style="animation-delay: 0.4s"></div>
                </div>
              </div>
              <div class="text-center text-sm text-gray-500 mt-1">
                <p>AI sedang berpikir...</p>
                <p v-if="chatStore.thinkingStatus" class="mt-1 text-xs text-gray-400">
                  {{ chatStore.thinkingStatus }}
                </p>
                <p v-else class="mt-1 text-xs text-gray-400">
                  Menganalisis pertanyaan Anda dan menyiapkan respons terbaik
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Input area -->
      <div class="border-t border-gray-200 bg-white p-4 flex-shrink-0 z-10">
        <div class="max-w-3xl mx-auto relative">
          <!-- Query Builder - Shown when activated -->
          <div 
            v-if="dataQueryMode" 
            class="bg-blue-50 p-4 border border-blue-100 rounded-t-lg border-b-0 -mb-2"
          >
            <QueryBuilder 
              v-model:modules="selectedModules" 
              v-model:timeRange="queryTimeRange"
              v-model:customStart="queryCustomStart"
              v-model:customEnd="queryCustomEnd"
              v-model:vizType="selectedVizType"
              @generate-query="useGeneratedQuery"
              @close="toggleDataQueryMode"
            />
          </div>
          
          <!-- Message Input Form -->
          <form @submit.prevent="sendMessage" class="relative">
            <div 
              class="relative bg-white border border-gray-300 rounded-lg shadow-sm transition-all focus-within:ring-2 focus-within:ring-blue-300 focus-within:border-blue-500"
              :class="{ 'rounded-t-none': dataQueryMode }"
            >
              <textarea 
                v-model="newMessage" 
                placeholder="Ketikkan pesan Anda di sini..." 
                class="w-full px-4 py-3 max-h-40 rounded-lg text-gray-800 resize-none focus:outline-none"
                :class="{ 'rounded-t-none': dataQueryMode }"
                rows="3"
                @keydown.enter.exact.prevent="sendMessage"
                @keydown.enter.shift.exact="newMessage += '\n'"
                ref="messageInput"
                :disabled="chatStore.isThinking"
              ></textarea>
              
              <!-- Input Actions -->
              <div class="absolute bottom-3 right-3 flex items-center space-x-2">
                <!-- Query Mode Selector -->
                <div class="relative inline-block">
                  <select 
                    v-model="queryMode" 
                    class="appearance-none rounded-md border border-gray-300 py-1.5 pl-3 pr-8 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="auto">Auto Detect</option>
                    <option value="business">Business Mode</option>
                    <option value="general">General Knowledge</option>
                  </select>
                  <ChevronDownIcon class="absolute right-2 top-2 w-4 h-4 text-gray-500 pointer-events-none" />
                </div>
                
                <!-- Query Builder Toggle -->
                <button 
                  type="button" 
                  @click="toggleDataQueryMode" 
                  class="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                  title="Business Query Builder"
                  :disabled="queryMode === 'general'"
                  :class="{'text-blue-500 bg-blue-50': dataQueryMode}"
                >
                  <BeakerIcon class="w-5 h-5" />
                </button>
                
                <!-- Submit Button -->
                <button 
                  type="submit" 
                  class="p-2.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  :disabled="chatStore.isThinking || (!newMessage.trim() && !dataQueryMode)"
                >
                  <PaperAirplaneIcon class="w-5 h-5" />
                </button>
              </div>
            </div>
          </form>
          
          <!-- Input Helpers Below Textarea -->
          <div class="flex justify-between items-center mt-2 text-xs text-gray-500">
            <div>
              <kbd class="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-gray-600 font-mono">Shift + Enter</kbd>
              <span class="ml-1">untuk baris baru</span>
            </div>
            <div>
              <span>Powered by <span class="font-medium">{{ selectedModel }}</span></span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Modals -->
    <ExportModal v-if="showExportModal" @close="showExportModal = false" />
    <VisualizationModal 
      v-if="showVizModal" 
      :visualization="currentViz" 
      @close="showVizModal = false" 
    />

    <!-- Di bagian bawah template ChatDetail.vue -->
    <!-- Modal Konfirmasi Hapus Pesan -->
    <ConfirmationModal
    :show="showClearChatModal"
    title="Hapus Semua Pesan"
    message="Apakah Anda yakin ingin menghapus semua pesan? Tindakan ini tidak dapat diurungkan."
    confirm-text="Hapus"
    cancel-text="Batal"
    type="danger"
    @confirm="confirmClearChat"
    @cancel="showClearChatModal = false"
    />

    <!-- Modal Konfirmasi Arsip Chat -->
    <ConfirmationModal
    :show="showArchiveModal"
    title="Arsipkan Chat"
    message="Apakah Anda yakin ingin mengarsipkan chat ini? Chat yang diarsipkan dapat dipulihkan kembali nanti."
    confirm-text="Arsipkan"
    cancel-text="Batal"
    type="warning"
    @confirm="confirmArchiveChat"
    @cancel="showArchiveModal = false"
    />

    <!-- Modal Konfirmasi Restore Chat -->
    <ConfirmationModal
    v-if="chatStore.currentChat?.state === 'archived'"
    :show="showRestoreModal"
    title="Pulihkan Chat"
    message="Apakah Anda yakin ingin memulihkan chat ini dari arsip?"
    confirm-text="Pulihkan"
    cancel-text="Batal"
    type="success"
    @confirm="confirmRestoreChat"
    @cancel="showRestoreModal = false"
    />
  </div>
</template>
 
<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useChatStore } from '@/stores/chatStore'
import { useSettingsStore } from '@/stores/settingsStore'
import Toast from '@/components/Toast.vue'
import { useToast } from '@/composables/useToast'

// Import components
import ChatSidebar from '@/components/chat/ChatSidebar.vue'
import ChatMessage from '@/components/chat/ChatMessage.vue'
import QueryBuilder from '@/components/chat/QueryBuilder.vue'
import ExportModal from '@/components/chat/ExportModal.vue'
import VisualizationModal from '@/components/chat/VisualizationModal.vue'
import ConfirmationModal from '@/components/ConfirmationModal.vue'

// Import icons
import { 
  ArrowLeftIcon, XMarkIcon, TrashIcon, ArrowDownTrayIcon, Bars3Icon,
  Cog6ToothIcon, PaperAirplaneIcon, ServerIcon, SparklesIcon,
  InformationCircleIcon, ClockIcon, ChatBubbleLeftRightIcon, ChevronDownIcon,
  BeakerIcon, ArchiveBoxIcon, ArrowUturnUpIcon
} from '@heroicons/vue/24/outline'

 
const route = useRoute()
const router = useRouter()
const chatStore = useChatStore()
const settingsStore = useSettingsStore()
const { toast, showToast } = useToast()
 
// Props
const props = defineProps({
  chatId: {
    type: [Number, String],
    default: null
  },
  isNew: {
    type: Boolean,
    default: false
  }
})
 
// State
const newMessage = ref('')
const dataQueryMode = ref(false)
const queryMode = ref('auto')
const selectedModel = ref('gpt-3.5-turbo')
const thinkingStatus = ref('')
const messagesContainer = ref(null)
const messageInput = ref(null)
const showClearChatModal = ref(false)
const showArchiveModal = ref(false)
const showRestoreModal = ref(false)

 
// UI state
const showExportModal = ref(false)
const showVizModal = ref(false)
const currentViz = ref({ title: "", content: "" })
 
// Query builder options
const selectedModules = ref([])
const queryTimeRange = ref('this_month')
const queryCustomStart = ref('')
const queryCustomEnd = ref('')
const selectedVizType = ref('auto')
 
// REMOVED: isTemporaryChat computed property

// Add sidebar state
const showSidebar = ref(window.innerWidth >= 1024) // Show on desktop, hide on mobile
const isMobile = ref(window.innerWidth < 1024)

// Method to toggle sidebar
function toggleSidebar(value) {
  showSidebar.value = typeof value === 'boolean' ? value : !showSidebar.value
}

function handleResize() {
  isMobile.value = window.innerWidth < 1024
  if (!isMobile.value) {
    showSidebar.value = true
  }
}
 
// Methods
function goToHome() {
  // MODIFIED: No need to confirm for temporary chats
  router.push('/')
}
 
// REMOVED: discardTemporaryChat function
 
async function sendMessage() {
  if (!newMessage.value.trim() && !dataQueryMode.value) return
  
  const messageContent = dataQueryMode.value ? 
    generateQueryPreview() : 
    newMessage.value.trim()
  
  // Reset input
  newMessage.value = ''
  
  if (dataQueryMode.value) {
    dataQueryMode.value = false
  }
  
  // Send message
  await chatStore.sendMessage(messageContent, selectedModel.value, queryMode.value)
  
  // Scroll to bottom after message is sent
  await nextTick()
  scrollToBottom()
}
 
function exportChat() {
  if (!chatStore.currentChat) return
  
  // MODIFIED: Check for chat ID instead of temporary status
  if (!chatStore.currentChat.id) {
    showToast({
      message: 'Kirim pesan terlebih dahulu untuk menyimpan chat ini sebelum diekspor',
      type: 'warning'
    })
    return
  }
  
  showExportModal.value = true
}
 
function openSettings() {
  router.push('/dashboard/ai-assistant/settings')
}
 
function toggleDataQueryMode() {
  dataQueryMode.value = !dataQueryMode.value
  
  if (dataQueryMode.value) {
    // Reset selected modules to default enabled ones
    selectedModules.value = chatStore.activeDataModules
  }
}
 
function useGeneratedQuery(query) {
  newMessage.value = query
  dataQueryMode.value = false
}
 
function generateQueryPreview() {
  // Generate a natural language query based on selected options
  let query = "Analisis "
  
  // Add modules
  if (selectedModules.value.length === 0) {
    query += "data bisnis saya"
  } else if (selectedModules.value.length === 1) {
    query += `data ${selectedModules.value[0].toLowerCase()} saya`
  } else {
    const lastModule = selectedModules.value.pop()
    query += `data ${selectedModules.value.join(', ').toLowerCase()} dan ${lastModule.toLowerCase()} saya`
    selectedModules.value.push(lastModule) // Restore the array
  }
  
  // Add time range
  switch (queryTimeRange.value) {
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
      query += ` dari ${queryCustomStart.value} sampai ${queryCustomEnd.value}`
      break
  }
  
  // Add visualization preference
  if (selectedVizType.value !== 'auto') {
    query += `. Tampilkan hasilnya sebagai grafik ${selectedVizType.value}`
  } else {
    query += ". Mohon sertakan visualisasi yang sesuai"
  }
  
  return query
}
 
// Visualization methods
function expandVisualization(viz) {
  currentViz.value = viz
  showVizModal.value = true
}
 
function exportVisualization(message) {
  showToast({
    message: 'Fitur ekspor visualisasi akan segera hadir',
    type: 'info'
  })
}
 
// Utility methods
function copyToClipboard(text) {
  navigator.clipboard.writeText(text)
    .then(() => showToast({
      message: 'Teks berhasil disalin',
      type: 'info',
      duration: 3000
    }))
    .catch(err => showToast({
      message: 'Gagal menyalin: ' + err,
      type: 'error'
    }))
}
 
function saveAsNote(message) {
  showToast({
      message: 'Fitur catatan akan segera hadir',
      type: 'info',
      duration: 3000
    })
}
 
function scrollToBottom() {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}
 
function getFormattedDate(daysOffset) {
  const date = new Date()
  date.setDate(date.getDate() + daysOffset)
  return date.toISOString().split('T')[0] // Format as YYYY-MM-DD
}

function focusInput() {
  if (messageInput.value) {
    messageInput.value.focus()
  }
}

// MODIFIED: Handle chat creation for new chat route
function createNewChat() {
  const category = localStorage.getItem('pendingCategory') || 'general'
  const title = localStorage.getItem('pendingTitle') || `Chat ${new Date().toLocaleDateString()}`
  
  console.log("Creating new chat with title:", title, "category:", category)
  
  // Create a new chat state (without server ID yet)
  chatStore.createChat(title, category)
}

function clearChat() {
  if (!chatStore.currentChat) return
  
  // Untuk chat yang belum ada ID (belum disimpan ke server)
  if (!chatStore.currentChat.id) {
    chatStore.messages = []
    return
  }
  
  // Tampilkan modal konfirmasi
  showClearChatModal.value = true
}

// Fungsi yang dijalankan ketika konfirmasi hapus pesan diterima
function confirmClearChat() {
  chatStore.clearChat(chatStore.currentChat.id)
    .then(() => {
      showToast({
        message: 'Semua pesan telah dihapus',
        type: 'success'
      })
    })
    .catch((error) => {
      showToast({
        message: `Gagal menghapus pesan: ${error.message || 'Unknown error'}`,
        type: 'error'
      })
    })
    .finally(() => {
      showClearChatModal.value = false
    })
}

// Fungsi arsip chat
function archiveChat() {
  if (!chatStore.currentChat?.id) return
  
  // Tampilkan modal konfirmasi
  showArchiveModal.value = true
}

// Fungsi yang dijalankan ketika konfirmasi arsip diterima
function confirmArchiveChat() {
  chatStore.archiveChat(chatStore.currentChat.id)
    .then(() => {
      showToast({
        message: 'Chat berhasil diarsipkan',
        type: 'success'
      })
    })
    .catch((error) => {
      showToast({
        message: `Gagal mengarsipkan chat: ${error.message || 'Unknown error'}`,
        type: 'error'
      })
    })
    .finally(() => {
      showArchiveModal.value = false
    })
}

// Fungsi restore chat
function restoreChat() {
  if (!chatStore.currentChat?.id) return
  
  // Tampilkan modal konfirmasi
  showRestoreModal.value = true
}

// Fungsi yang dijalankan ketika konfirmasi restore diterima
function confirmRestoreChat() {
  chatStore.restoreChat(chatStore.currentChat.id)
    .then(() => {
      showToast({
        message: 'Chat berhasil dipulihkan',
        type: 'success'
      })
    })
    .catch((error) => {
      showToast({
        message: `Gagal memulihkan chat: ${error.message || 'Unknown error'}`,
        type: 'error'
      })
    })
    .finally(() => {
      showRestoreModal.value = false
    })
}



 
// Lifecycle hooks
onMounted(async () => {
  console.log("ChatView component mounted")
  
  // Load settings
  await settingsStore.fetchSettings()
  selectedModel.value = settingsStore.defaultModel
  
  // Initialize date ranges
  queryCustomStart.value = getFormattedDate(-30)
  queryCustomEnd.value = getFormattedDate(0)
  
  // MODIFIED: Handle the new chat logic
  if (route.path.includes('/new')) {
    // Create a new chat state
    createNewChat()
    
    // Check for pending message from welcome screen
    const pendingMessage = localStorage.getItem('pendingMessage')
    console.log("Found pending message:", pendingMessage)
    
    if (pendingMessage) {
      // Set up message info
      newMessage.value = pendingMessage
      queryMode.value = localStorage.getItem('pendingQueryMode') || 'auto'
      selectedModel.value = localStorage.getItem('pendingModel') || selectedModel.value
      
      // Send the message after giving component enough time to fully mount
      setTimeout(() => {
        console.log("Sending pending message:", newMessage.value)
        sendMessage()
        
        // Clear localStorage after successful send
        localStorage.removeItem('pendingMessage')
        localStorage.removeItem('pendingModel')
        localStorage.removeItem('pendingQueryMode')
        localStorage.removeItem('pendingCategory')
        localStorage.removeItem('pendingTitle')
      }, 500) // Increase delay to 500ms
    }
  } else if (props.chatId) {
    // Load existing chat
    await chatStore.fetchMessages(props.chatId)
  }
  
  // Focus input after mounting
  nextTick(() => {
    if (messageInput.value) {
      messageInput.value.focus()
    }
  })
})


// Add watcher for sidebar
watch(() => showSidebar.value, (newValue) => {
  if (newValue && isMobile.value) {
    document.body.style.overflow = 'hidden' // Prevent body scroll when sidebar is open on mobile
  } else {
    document.body.style.overflow = ''
  }
})

// Add event listener for resize
onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
})
 
// Watch for scroll to bottom when messages change
watch(() => chatStore.messages.length, () => {
  nextTick(scrollToBottom)
})
 
// Watch for changes to route.params.id
watch(() => route.params.id, async (newId) => {
  if (newId === 'new') {
    createNewChat()
  } else if (newId) {
    // If it's a number, load it
    const id = parseInt(newId)
    if (!isNaN(id)) {
      await chatStore.fetchMessages(id)
    }
  }
})

// REMOVED: Clean up temporary chat on unmount
</script>