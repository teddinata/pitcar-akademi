<template>
  <div 
    class="w-72 bg-white border-r flex-shrink-0 flex flex-col transition-all duration-300 h-screen overflow-hidden z-40"
    :class="showSidebar ? 'translate-x-0' : '-translate-x-full'"
  >
    <!-- Sidebar Header - Fixed -->
    <div class="p-4 border-b flex-shrink-0 bg-white">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold text-gray-900">AI Business Assistant</h2>
        <button 
          class="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
          @click="toggleSidebar(false)"
        >
          <XMarkIcon class="w-5 h-5 text-gray-500" />
        </button>
      </div>
      <button
        @click="createNewChat"
        class="mt-2 w-full flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <PlusIcon class="w-4 h-4 mr-2" />
        Chat Baru
      </button>
    </div>

    <div class="px-4 py-3 border-b border-gray-200">
      <div class="relative">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon class="h-5 w-5 text-gray-400" />
        </div>
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Cari chat..." 
          class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </div>
      
      <!-- Filter Tabs -->
      <div class="flex mt-3 border-b border-gray-200">
        <button 
          v-for="(tab, index) in filterTabs" 
          :key="index"
          @click="currentFilter = tab.value"
          class="px-3 py-2 text-sm font-medium focus:outline-none"
          :class="currentFilter === tab.value ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <!-- Chat List - Scrollable Container -->
    <div class="flex-1 overflow-y-auto p-2 space-y-1 bg-white" ref="chatListContainer">
      <div v-if="isLoading" class="flex flex-col items-center justify-center p-6 text-gray-500">
        <div class="w-6 h-6 border-2 border-t-blue-500 border-gray-200 rounded-full animate-spin mb-3"></div>
        <span>Loading...</span>
      </div>
      
      <div v-else-if="!hasChats" class="flex flex-col items-center justify-center p-6 text-gray-500">
        <p class="mb-4">Belum ada percakapan.</p>
        <button @click="createNewChat" class="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors">
          Mulai chat baru
        </button>
      </div>
      
      <div v-else-if="filteredChats.length === 0" class="text-center py-6 text-gray-500">
        <ChatBubbleLeftRightIcon class="h-8 w-8 mx-auto text-gray-300 mb-2" />
        <p>{{ searchQuery ? 'No chats found' : 'No chats in this category' }}</p>
      </div>
      
      <div v-else class="space-y-2">
          <button 
            v-for="chat in filteredChats" 
            :key="chat.id"
            @click="selectChat(chat.id)" 
            class="w-full text-left px-3 py-2 rounded-md text-sm transition-colors focus:outline-none"
            :class="[
              chat.id === currentChatId 
                ? 'bg-blue-100 text-blue-800 border-l-4 border-blue-500 pl-2' 
                : 'hover:bg-gray-100 text-gray-800'
            ]"
          >
          <div class="flex items-center justify-between">
            <div class="mr-2 truncate">{{ chat.name }}</div>
            <div 
              v-if="chat.state === 'archived'" 
              class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800"
            >
              Archived
            </div>
          </div>
          <div class="flex items-center justify-between mt-1 text-xs">
            <div class="text-gray-500 truncate">{{ chat.preview }}</div>
            <div class="text-gray-400 flex-shrink-0">{{ formatDate(chat.last_message_date) }}</div>
          </div>
        </button>
      </div>
    </div>

    <!-- Sidebar Footer - Fixed -->
    <div class="flex p-3 border-t border-gray-200 flex-shrink-0">
      <button @click="goToSettings" class="flex-1 flex justify-center items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm mr-2">
        <Cog6ToothIcon class="w-4 h-4 mr-1.5" />
        Pengaturan
      </button>
      <button @click="showArchivedChats" class="flex-1 flex justify-center items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm">
        <ArchiveBoxIcon class="w-4 h-4 mr-1.5" />
        Arsip
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { format, formatDistance, addHours } from 'date-fns'
import { id } from 'date-fns/locale'
import { useChatStore } from '@/stores/chatStore'
import { useRoute } from 'vue-router'


import {
  XMarkIcon,
  PlusIcon,
  ChatBubbleLeftIcon,
  ChatBubbleLeftRightIcon,
  BriefcaseIcon,
  LifebuoyIcon,
  Cog6ToothIcon,
  ArchiveBoxIcon,
  MagnifyingGlassIcon
} from '@heroicons/vue/24/outline'


const route = useRoute()
const router = useRouter()
const chatStore = useChatStore()
const chatListContainer = ref(null)
const searchQuery = ref('')


// Props
const props = defineProps({
  showSidebar: {
    type: Boolean,
    default: true
  }
})

const filterTabs = [
  { label: 'All', value: 'all' },
  { label: 'Business', value: 'business' },
  { label: 'General', value: 'general' },
  { label: 'Archived', value: 'archived' }
]

const filteredChats = computed(() => {
  let filteredList = chatStore.chats
  
  // Apply category filter
  if (currentFilter.value !== 'all') {
    if (currentFilter.value === 'archived') {
      filteredList = filteredList.filter(chat => chat.state === 'archived')
    } else {
      filteredList = filteredList.filter(chat => {
        return chat.category === currentFilter.value && chat.state !== 'archived'
      })
    }
  } else {
    // Show only active chats in "All" filter
    filteredList = filteredList.filter(chat => chat.state !== 'archived')
  }
  
  // Apply search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filteredList = filteredList.filter(chat => {
      return (
        chat.name.toLowerCase().includes(query) || 
        (chat.preview && chat.preview.toLowerCase().includes(query))
      )
    })
  }
  
  return filteredList
})


// Emits
const emit = defineEmits(['toggle-sidebar'])

// Variables
const currentFilter = ref('all')

// Categories/Filters
const categories = [
  { label: 'Semua', value: 'all', icon: ChatBubbleLeftIcon },
  { label: 'Bisnis', value: 'business', icon: BriefcaseIcon },
  { label: 'Dukungan', value: 'support', icon: LifebuoyIcon }
]

// Computed
const isLoading = computed(() => chatStore.isLoading)

const currentChat = computed(() => chatStore.currentChat)

// const filteredChats = computed(() => {
//   // Ensure we never return undefined or null
//   const chats = chatStore.filteredChats(currentFilter.value) || [];
//   return chats;
// })

const hasChats = computed(() => {
  return filteredChats.value && filteredChats.value.length > 0;
})

// Methods
function toggleSidebar(value) {
  emit('toggle-sidebar', value)
}

// UPDATED: Modified to use new chat pattern
function createNewChat() {
  // Store default category - can be customized based on your needs
  // localStorage.setItem('pendingCategory', 'general');
  
  // Navigate to new chat page
  router.push('/dashboard/ai-assistant/');
}

function selectChat(chatId) {
  // Validate the chat ID exists first
  if (!chatId) {
    console.error('Invalid chat ID');
    return;
  }
  
  // If it's the same chat as currently active, don't do anything
  if (currentChat.value && currentChat.value.id === chatId) return;
  
  // Navigate to the selected chat
  router.push(`/dashboard/ai-assistant/${chatId}`);
}

function setFilter(filter) {
  currentFilter.value = filter
}

function goToSettings() {
  router.push('/dashboard/ai-assistant/settings')
}

function showArchivedChats() {
  // Future implementation
  router.push('/dashboard/ai-assistant/archived')
}


function formatDate(dateString) {
  if (!dateString) return ''
  
  // Konversi string ke objek Date dan tambahkan 7 jam
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

const currentChatId = ref(props.currentChatId || null)

// Update currentChatId when route changes
watch(() => route.params.id, (newId) => {
  if (newId && newId !== 'new') {
    const numId = parseInt(newId)
    if (!isNaN(numId)) {
      currentChatId.value = numId
    }
  }
}, { immediate: true })

// Also watch the prop
watch(() => props.currentChatId, (newId) => {
  if (newId) {
    currentChatId.value = newId
  }
})




// Ensure chat list is fetched on mount
onMounted(async () => {
  try {
    if (chatStore.chats.length === 0) {
      await chatStore.fetchChats()
    }
  } catch (error) {
    console.error('Error fetching chats:', error)
  }
})





// Watch for changes in filteredChats to ensure proper rendering
watch(filteredChats, (newChats) => {
  if (newChats && newChats.length > 0) {
    // Force a re-render by using nextTick
    nextTick(() => {
      if (chatListContainer.value) {
        chatListContainer.value.scrollTop = 0
      }
    })
  }
}, { immediate: true })

// Watch for showSidebar changes to ensure proper rendering
watch(() => props.showSidebar, (isVisible) => {
  if (isVisible) {
    // When sidebar becomes visible, update the chat list
    nextTick(() => {
      if (chatStore.chats.length === 0) {
        chatStore.fetchChats()
      }
    })
  }
}, { immediate: true })
</script>

<style scoped>
/* Fix for render issues */
.overflow-y-auto {
  -webkit-overflow-scrolling: touch;
}

/* Ensure proper z-indexing */
.z-40 {
  z-index: 40;
}
</style>