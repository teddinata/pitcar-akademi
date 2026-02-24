<template>
  <div class="max-w-6xl mx-auto px-4 py-8">
    <Toast
      v-model:show="toast.show"
      :message="toast.message"
      :type="toast.type"
      :duration="toast.duration"
    />
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-xl font-semibold text-gray-900 flex items-center">
          <ArchiveBoxIcon class="w-6 h-6 text-amber-500 mr-2" />
          Archived Chats
        </h3>
        
        <router-link 
          to="/dashboard/ai-assistant" 
          class="flex items-center text-sm text-blue-600 hover:text-blue-800"
        >
          <ArrowLeftIcon class="w-4 h-4 mr-1" />
          Back to Active Chats
        </router-link>
      </div>
      
      <div v-if="loading" class="flex justify-center py-8">
        <div class="animate-spin h-8 w-8 text-blue-600 rounded-full border-4 border-blue-200 border-t-blue-600"></div>
      </div>
      
      <div v-else-if="archivedChats.length === 0" class="py-8 text-center text-gray-500">
        <ArchiveBoxIcon class="w-12 h-12 mx-auto text-gray-300 mb-3" />
        <p>No archived chats found</p>
        <p class="text-sm mt-2">Archived chats will appear here for easy recovery</p>
      </div>
      
      <div v-else>
        <div class="overflow-hidden bg-gray-50 rounded-lg border border-gray-200">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-100">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chat Name</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Message</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="chat in archivedChats" :key="chat.id">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{{ chat.name }}</div>
                  <div class="text-xs text-gray-500 mt-1 truncate max-w-xs">{{ chat.preview }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full" :class="getCategoryClass(chat.category)">
                    {{ chat.category }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDate(chat.last_message_date) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button 
                    @click="restoreChat(chat.id)" 
                    class="text-green-600 hover:text-green-900 mr-3"
                  >
                    Restore
                  </button>
                  <button 
                    @click="openChat(chat.id)" 
                    class="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    View
                  </button>
                  <button 
                    @click="deleteChat(chat.id)" 
                    class="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    
    <!-- Confirmation Modals -->
    <ConfirmationModal
      :show="showRestoreModal"
      title="Restore Chat"
      message="Are you sure you want to restore this chat from archives?"
      confirm-text="Restore"
      cancel-text="Cancel"
      type="success"
      @confirm="confirmRestoreChat"
      @cancel="cancelRestoreChat"
    />
    
    <ConfirmationModal
      :show="showDeleteModal"
      title="Delete Chat"
      message="Are you sure you want to permanently delete this chat? This action cannot be undone."
      confirm-text="Delete"
      cancel-text="Cancel"
      type="danger"
      @confirm="confirmDeleteChat"
      @cancel="cancelDeleteChat"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useChatStore } from '@/stores/chatStore'
import Toast from '@/components/Toast.vue'
import { useToast } from '@/composables/useToast'
import { format, formatDistance } from 'date-fns'
import { addHours } from 'date-fns'
import ConfirmationModal from '@/components/ConfirmationModal.vue'
import { 
  ArchiveBoxIcon, ArrowLeftIcon, 
  CheckCircleIcon, XCircleIcon
} from '@heroicons/vue/24/outline'

const router = useRouter()
const chatStore = useChatStore()
const { toast, showToast } = useToast()

const loading = ref(true)
const selectedChatId = ref(null)
const showRestoreModal = ref(false)
const showDeleteModal = ref(false)

// Computed
const archivedChats = computed(() => chatStore.archivedChats || [])

// Methods
function getCategoryClass(category) {
  switch (category) {
    case 'business': return 'bg-blue-100 text-blue-800'
    case 'general': return 'bg-purple-100 text-purple-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

function formatDate(dateString) {
  if (!dateString) return 'Unknown'
  
  // Konversi string ke objek Date dan tambahkan 7 jam (WIB)
  const date = addHours(new Date(dateString), 7)
  const now = new Date()
  
  // If today, show time
  if (date.toDateString() === now.toDateString()) {
    return format(date, 'HH:mm')
  }
  
  // If within last 7 days, show relative
  if (now.getTime() - date.getTime() < 7 * 24 * 60 * 60 * 1000) {
    return formatDistance(date, now, { addSuffix: true })
  }
  
  // Otherwise show date
  return format(date, 'dd/MM/yyyy')
}

function restoreChat(chatId) {
  selectedChatId.value = chatId
  showRestoreModal.value = true
}

function cancelRestoreChat() {
  selectedChatId.value = null
  showRestoreModal.value = false
}

function confirmRestoreChat() {
  if (!selectedChatId.value) return
  
  chatStore.restoreChat(selectedChatId.value)
    .then(() => {
      showToast({
        message: 'Chat restored successfully',
        type: 'success'
      })
      
      // Reload archived chats to update list
      fetchArchivedChats()
    })
    .catch((error) => {
      showToast({
        message: `Error restoring chat: ${error.message || 'Unknown error'}`,
        type: 'error'
      })
    })
    .finally(() => {
      selectedChatId.value = null
      showRestoreModal.value = false
    })
}

function openChat(chatId) {
  router.push(`/dashboard/ai-assistant/${chatId}`)
}

function deleteChat(chatId) {
  selectedChatId.value = chatId
  showDeleteModal.value = true
}

function cancelDeleteChat() {
  selectedChatId.value = null
  showDeleteModal.value = false
}

function confirmDeleteChat() {
  if (!selectedChatId.value) return
  
  // We need to implement deleteChat in chatStore first
  chatStore.deleteChat(selectedChatId.value)
    .then(() => {
      showToast({
        message: 'Chat deleted successfully',
        type: 'success'
      })
      
      // Reload archived chats to update list
      fetchArchivedChats()
    })
    .catch((error) => {
      showToast({
        message: `Error deleting chat: ${error.message || 'Unknown error'}`,
        type: 'error'
      })
    })
    .finally(() => {
      selectedChatId.value = null
      showDeleteModal.value = false
    })
}

// Function to fetch archived chats
async function fetchArchivedChats() {
  loading.value = true
  try {
    // Use the new method in chatStore
    await chatStore.fetchArchivedChats()
  } catch (error) {
    showToast({
      message: `Error loading archived chats: ${error.message || 'Unknown error'}`,
      type: 'error'
    })
  } finally {
    loading.value = false
  }
}



// Lifecycle
onMounted(async () => {
  // Fetch archived chats on component mount
  await fetchArchivedChats()
})
</script>