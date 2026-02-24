<template>
  <div class="flex h-screen bg-gradient-to-br from-white to-blue-50 overflow-hidden">
    <Toast
      v-model:show="toast.show"
      :message="toast.message"
      :type="toast.type"
      :duration="toast.duration"
    />
    <!-- Sidebar Mobile Overlay - sama seperti di ChatDetail.vue -->
    <div 
      v-if="showSidebar && isMobile" 
      class="fixed inset-0 bg-black bg-opacity-50 z-40"
      @click="toggleSidebar(false)"
    ></div>
    
    <!-- Chat History Sidebar - PERBAIKAN: Tambahkan div container dengan class positioning -->
    <div 
      class="w-72 bg-white border-r border-gray-200 flex-shrink-0 flex flex-col transition-all duration-300 h-screen fixed lg:relative z-50 shadow-lg lg:shadow-none"
      :class="showSidebar ? 'translate-x-0' : '-translate-x-full'"
    >
      <ChatSidebar 
        @toggle-sidebar="toggleSidebar"
      />
    </div>
    
    <!-- Main Content - Area konten utama yang menyesuaikan dengan sidebar -->
    <div class="flex-1 flex flex-col h-screen transition-all duration-300"
         >
      <div class="max-w-full mx-auto px-4 py-8 md:py-12 w-full overflow-y-auto">
        <!-- Header Section -->
        <div class="text-center mb-10">
          <h1 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            <span class="text-blue-600">Jarvis AI</span> Business Assistant
          </h1>
          <p class="text-gray-600 text-lg max-w-2xl mx-auto">
            Dapatkan insight instan dari data bisnis Anda dan jawaban untuk pertanyaan apapun dengan bantuan AI.
          </p>
        </div>

        <!-- Input form -->
        <div class="max-w-3xl mx-auto mb-8">
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <h3 class="text-lg font-medium text-gray-800 mb-4 flex items-center">
              <ChatBubbleOvalLeftEllipsisIcon class="w-5 h-5 text-blue-500 mr-2" />
              Tanyakan sesuatu...
            </h3>
            
            <form @submit.prevent="sendFromWelcome">
              <div class="relative bg-white border border-gray-300 rounded-lg transition-all focus-within:ring-2 focus-within:ring-blue-300 focus-within:border-blue-500">
                <textarea 
                  v-model="welcomeMessage" 
                  placeholder="Coba: 'Apa produk terlaris saya bulan lalu?' atau 'Bagaimana cara meningkatkan retensi pelanggan?'"
                  class="w-full px-4 py-3 rounded-lg text-gray-800 resize-none focus:outline-none"
                  rows="2"
                  @keydown.enter.exact.prevent="sendFromWelcome"
                  @keydown.enter.shift.exact="welcomeMessage += '\n'"
                  ref="welcomeInput"
                ></textarea>
                
                <!-- Type detection indicator -->
                <div 
                  v-if="welcomeMessage.trim().length > 5"
                  class="absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-medium"
                  :class="{
                    'bg-blue-100 text-blue-700': isBusiness,
                    'bg-purple-100 text-purple-700': !isBusiness
                  }"
                >
                  <component 
                    :is="isBusiness ? 'ChartBarIcon' : 'ChatBubbleLeftRightIcon'" 
                    class="w-3 h-3 inline mr-0.5" 
                  />
                  {{ isBusiness ? 'Business' : 'General' }}
                </div>
                
                <div class="absolute bottom-2 right-2 flex items-center gap-2">
                  <!-- Pilihan Mode -->
                  <div class="inline-block">
                    <select 
                      v-model="queryMode" 
                      class="rounded-md border-gray-300 py-1 pl-2 pr-7 text-sm bg-gray-50 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="auto">Auto Detect</option>
                      <option value="business">Business</option>
                      <option value="general">General</option>
                    </select>
                  </div>
                  
                  <!-- Pilihan Model -->
                  <div class="inline-block">
                    <select 
                      v-model="selectedModel" 
                      class="rounded-md border-gray-300 py-1 pl-2 pr-7 text-sm bg-gray-50 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="gpt-3.5-turbo">GPT-3.5</option>
                      <option value="gpt-4">GPT-4 ({{ remainingGpt4 }} left)</option>
                      <option value="gpt-4o">GPT-4o</option>
                    </select>
                  </div>
                  
                  <button 
                    type="submit" 
                    class="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                    :disabled="!welcomeMessage.trim()"
                  >
                    <PaperAirplaneIcon class="w-5 h-5" />
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        <!-- "Jarvis bisa bantu kamu ngapain aja?" Section -->
        <div class="max-w-3xl mx-auto mb-10 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div class="bg-blue-600 px-6 py-4">
            <h2 class="text-xl font-semibold text-white flex items-center">
              <SparklesIcon class="w-6 h-6 mr-2" />
              Jarvis bisa bantu kamu ngapain aja?
            </h2>
          </div>
          
          <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="flex items-start space-x-3">
                <ChartBarIcon class="w-5 h-5 text-blue-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 class="font-medium text-gray-800">Analisis Bisnis</h3>
                  <p class="text-sm text-gray-600">Analisis penjualan, revenue, inventori, dan trend bisnis Anda</p>
                </div>
              </div>
              
              <div class="flex items-start space-x-3">
                <UserGroupIcon class="w-5 h-5 text-blue-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 class="font-medium text-gray-800">Analisis Pelanggan</h3>
                  <p class="text-sm text-gray-600">Segmentasi, RFM analysis, retensi, dan perilaku pelanggan</p>
                </div>
              </div>
              
              <div class="flex items-start space-x-3">
                <CubeIcon class="w-5 h-5 text-blue-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 class="font-medium text-gray-800">Manajemen Inventori</h3>
                  <p class="text-sm text-gray-600">Stok, produk, harga, dan optimasi persediaan</p>
                </div>
              </div>
              
              <div class="flex items-start space-x-3">
                <CurrencyDollarIcon class="w-5 h-5 text-blue-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 class="font-medium text-gray-800">Analisis Keuangan</h3>
                  <p class="text-sm text-gray-600">Laporan keuangan, profit margin, dan analisis pendapatan</p>
                </div>
              </div>
              
              <div class="flex items-start space-x-3">
                <ClockIcon class="w-5 h-5 text-blue-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 class="font-medium text-gray-800">Efisiensi Workflow</h3>
                  <p class="text-sm text-gray-600">Menganalisis dan mengoptimalkan proses bisnis dan lead time</p>
                </div>
              </div>
              
              <div class="flex items-start space-x-3">
                <UserIcon class="w-5 h-5 text-blue-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 class="font-medium text-gray-800">Kinerja Karyawan</h3>
                  <p class="text-sm text-gray-600">Analisis absensi, produktivitas, dan performa mekanik/SA</p>
                </div>
              </div>
              
              <div class="flex items-start space-x-3">
                <LightBulbIcon class="w-5 h-5 text-blue-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 class="font-medium text-gray-800">Peluang Bisnis</h3>
                  <p class="text-sm text-gray-600">Identifikasi peluang pertumbuhan dan strategi pengembangan</p>
                </div>
              </div>
              
              <div class="flex items-start space-x-3">
                <ChartPieIcon class="w-5 h-5 text-blue-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 class="font-medium text-gray-800">Prediksi & Forecast</h3>
                  <p class="text-sm text-gray-600">Proyeksi penjualan dan analisis trend masa depan</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Quick Start Cards -->
        <div class="mb-12">
          <h2 class="text-2xl font-semibold text-gray-900 mb-6 md:text-center">
            Mulai Menggunakan Jarvis
          </h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Business Analysis Card -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-300 p-6">
              <div class="flex items-start">
                <div class="flex-shrink-0 bg-blue-100 p-3 rounded-lg text-blue-600 mr-4">
                  <ChartBarIcon class="w-8 h-8" />
                </div>
                <div class="flex-1">
                  <h3 class="text-xl font-semibold text-gray-900 mb-2">Analisis Bisnis</h3>
                  <p class="text-gray-600 mb-4">Analisis data penjualan, inventaris, dan keuangan Anda dengan insight dan visualisasi yang detail.</p>
                  <button 
                    @click="startBusinessChat" 
                    class="w-full md:w-auto mt-2 inline-flex items-center justify-center px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <ChartBarIcon class="w-5 h-5 mr-2" />
                    Mulai Analisis Bisnis
                  </button>
                </div>
              </div>
            </div>
            
            <!-- General Chat Card -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all duration-300 p-6">
              <div class="flex items-start">
                <div class="flex-shrink-0 bg-purple-100 p-3 rounded-lg text-purple-600 mr-4">
                  <ChatBubbleLeftRightIcon class="w-8 h-8" />
                </div>
                <div class="flex-1">
                  <h3 class="text-xl font-semibold text-gray-900 mb-2">Bantuan Umum</h3>
                  <p class="text-gray-600 mb-4">Dapatkan jawaban untuk pertanyaan apapun, brainstorm ide, atau chat tentang topik di luar data bisnis.</p>
                  <button 
                    @click="startGeneralChat" 
                    class="w-full md:w-auto mt-2 inline-flex items-center justify-center px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <ChatBubbleLeftRightIcon class="w-5 h-5 mr-2" />
                    Mulai Chat Umum
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Common Questions Section -->
        <div class="mb-12">
          <h2 class="text-2xl font-semibold text-gray-900 mb-6 flex items-center justify-center">
            <SparklesIcon class="w-6 h-6 text-amber-500 mr-2" />
            Pertanyaan Populer
          </h2>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div 
              v-for="(suggestion, index) in suggestions" 
              :key="index"
              class="bg-white p-4 rounded-lg border border-gray-200 cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
              @click="startWithSuggestion(suggestion)"
            >
              <div class="flex items-center mb-2">
                <component :is="suggestion.icon" class="w-5 h-5 text-blue-500 mr-2" />
                <h4 class="font-medium text-gray-800">{{ suggestion.title }}</h4>
              </div>
              <p class="text-gray-600 text-sm">{{ suggestion.description }}</p>
            </div>
          </div>
        </div>
        
        <!-- Jarvis Features Section -->
        <div class="mb-12">
          <h2 class="text-2xl font-semibold text-gray-900 mb-6 md:text-center">
            Fitur Unggulan Jarvis
          </h2>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex flex-col items-center text-center">
              <div class="bg-blue-100 p-3 rounded-full text-blue-600 mb-4">
                <DocumentChartBarIcon class="w-8 h-8" />
              </div>
              <h3 class="text-lg font-semibold mb-2">Laporan Komprehensif</h3>
              <p class="text-gray-600 text-sm">
                Dapatkan laporan lengkap yang mencakup berbagai aspek bisnis untuk insight yang lebih dalam.
              </p>
            </div>
            
            <div class="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex flex-col items-center text-center">
              <div class="bg-blue-100 p-3 rounded-full text-blue-600 mb-4">
                <ChartBarSquareIcon class="w-8 h-8" />
              </div>
              <h3 class="text-lg font-semibold mb-2">Analisis RFM</h3>
              <p class="text-gray-600 text-sm">
                Segmentasi pelanggan berdasarkan Recency, Frequency, dan Monetary untuk strategi pemasaran yang lebih efektif.
              </p>
            </div>
            
            <div class="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex flex-col items-center text-center">
              <div class="bg-blue-100 p-3 rounded-full text-blue-600 mb-4">
                <PresentationChartLineIcon class="w-8 h-8" />
              </div>
              <h3 class="text-lg font-semibold mb-2">Prediksi Bisnis</h3>
              <p class="text-gray-600 text-sm">
                Dapatkan proyeksi dan prediksi bisnis untuk membantu perencanaan strategis Anda.
              </p>
            </div>
          </div>
        </div>
        
        <!-- Contoh Prompt Section -->
        <div class="mb-12">
          <h2 class="text-2xl font-semibold text-gray-900 mb-6 md:text-center">
            Contoh Prompt untuk Hasil Maksimal
          </h2>
          
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 class="font-medium text-gray-800 mb-3 flex items-center">
                  <DocumentTextIcon class="w-5 h-5 text-blue-500 mr-2" />
                  Analisis Bisnis Komprehensif
                </h3>
                <div class="bg-gray-50 p-3 rounded-lg border border-gray-200 text-sm text-gray-700">
                  "Berikan laporan komprehensif tentang kinerja bisnis saya selama 3 bulan terakhir, termasuk penjualan, keuangan, inventori, dan performa karyawan."
                </div>
              </div>
              
              <div>
                <h3 class="font-medium text-gray-800 mb-3 flex items-center">
                  <UserGroupIcon class="w-5 h-5 text-blue-500 mr-2" />
                  Analisis Pelanggan RFM
                </h3>
                <div class="bg-gray-50 p-3 rounded-lg border border-gray-200 text-sm text-gray-700">
                  "Buat segmentasi pelanggan saya menggunakan analisis RFM. Identifikasi pelanggan Champions dan At Risk untuk strategi retensi."
                </div>
              </div>
              
              <div>
                <h3 class="font-medium text-gray-800 mb-3 flex items-center">
                  <ClockIcon class="w-5 h-5 text-blue-500 mr-2" />
                  Efisiensi Workflow
                </h3>
                <div class="bg-gray-50 p-3 rounded-lg border border-gray-200 text-sm text-gray-700">
                  "Analisis lead time servis kami dan temukan bottleneck dalam proses. Berikan rekomendasi untuk meningkatkan efisiensi workflow."
                </div>
              </div>
              
              <div>
                <h3 class="font-medium text-gray-800 mb-3 flex items-center">
                  <PresentationChartLineIcon class="w-5 h-5 text-blue-500 mr-2" />
                  Prediksi Penjualan
                </h3>
                <div class="bg-gray-50 p-3 rounded-lg border border-gray-200 text-sm text-gray-700">
                  "Prediksi penjualan untuk 3 bulan ke depan berdasarkan data historis. Identifikasi tren dan faktor yang mempengaruhi."
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useChatStore } from '@/stores/chatStore'
import { useSettingsStore } from '@/stores/settingsStore'
import ChatSidebar from '@/components/chat/ChatSidebar.vue'
import Toast from '@/components/Toast.vue'
import { useToast } from '@/composables/useToast'

import { 
  // Import icons yang digunakan
  ChatBubbleOvalLeftEllipsisIcon, ChartBarIcon, ChatBubbleLeftRightIcon,
  SparklesIcon, PaperAirplaneIcon, Bars3Icon, CubeIcon, UserGroupIcon, 
  CurrencyDollarIcon, ChartBarSquareIcon, ScaleIcon,
  // Import icons baru
  DocumentChartBarIcon, PresentationChartLineIcon, LightBulbIcon,
  DocumentTextIcon, ClockIcon, UserIcon, ChartPieIcon
} from '@heroicons/vue/24/outline'

const router = useRouter()
const chatStore = useChatStore()
const settingsStore = useSettingsStore()
const welcomeInput = ref(null)
const { toast, showToast } = useToast()

const welcomeMessage = ref('')
const queryMode = ref('auto')
const selectedModel = ref('gpt-3.5-turbo')
// State untuk sidebar - penting untuk diinisialisasi dengan benar
const showSidebar = ref(window.innerWidth >= 1024) // Default true untuk desktop
const isMobile = ref(window.innerWidth < 1024)

// Computed properties
const isBusiness = computed(() => {
  if (queryMode.value === 'business') return true
  if (queryMode.value === 'general') return false
  
  // Auto-detect based on content
  return detectBusinessContext(welcomeMessage.value)
})

const remainingGpt4 = computed(() => {
  return settingsStore.remainingGpt4
})

// Methods
function toggleSidebar(value) {
  showSidebar.value = typeof value === 'boolean' ? value : !showSidebar.value
}

// Methods
function detectBusinessContext(message) {
  if (!message) return false
  
  const businessKeywords = [
    'sales', 'revenue', 'inventory', 'stock', 'finance', 'invoice', 
    'customer', 'product', 'order', 'purchase', 'company', 'business',
    'profit', 'expense', 'accounting', 'balance', 'vendor', 'employee',
    'penjualan', 'persediaan', 'stok', 'keuangan', 'faktur', 'pelanggan',
    'produk', 'pesanan', 'pembelian', 'perusahaan', 'bisnis', 'keuntungan',
    'biaya', 'akuntansi', 'saldo', 'vendor', 'karyawan', 'report', 'laporan'
  ]
  
  const lowerMessage = message.toLowerCase()
  return businessKeywords.some(keyword => lowerMessage.includes(keyword))
}

// PERBAIKAN: Fungsi sendFromWelcome yang lebih robust
async function sendFromWelcome() {
  console.log("Function sendFromWelcome called")
  if (!welcomeMessage.value.trim()) return
  
  try {
    // Simpan informasi pesan di localStorage
    const messageText = welcomeMessage.value.trim();
    localStorage.setItem('pendingMessage', messageText)
    localStorage.setItem('pendingModel', selectedModel.value)
    localStorage.setItem('pendingQueryMode', queryMode.value)
    
    // Tentukan kategori chat
    const category = isBusiness.value ? 'business' : 'general'
    localStorage.setItem('pendingCategory', category)
    
    // Buat nama chat yang sesuai
    const shortText = messageText.length > 20 ? messageText.substring(0, 20) + '...' : messageText;
    const chatName = category === 'business' 
      ? `Business: ${shortText}` 
      : `Chat: ${shortText}`
    localStorage.setItem('pendingTitle', chatName)
    
    // Reset input pesan
    welcomeMessage.value = ''
    
    console.log("Navigating to new chat page")
    // Navigasi ke halaman chat baru - pastikan ini sudah dikerjakan sebelum navigation
    await router.push('/dashboard/ai-assistant/new')
  } catch (error) {
    console.error("Error in sendFromWelcome:", error)
  }
}

// Perbaikan pada fungsi startWithSuggestion
function startWithSuggestion(suggestion) {
  console.log("Starting with suggestion:", suggestion.title)
  // Store suggestion prompt in localStorage
  localStorage.setItem('pendingMessage', suggestion.prompt)
  localStorage.setItem('pendingCategory', 'business')
  localStorage.setItem('pendingTitle', suggestion.title)
  localStorage.setItem('pendingModel', selectedModel.value) // Tambahkan ini
  localStorage.setItem('pendingQueryMode', 'business') // Tambahkan ini
  
  // Navigate to new chat
  router.push('/dashboard/ai-assistant/new')
}

// Perbaikan pada fungsi startBusinessChat dan startGeneralChat
function startBusinessChat() {
  console.log("Starting business chat")
  // Store info for business type chat
  localStorage.setItem('pendingCategory', 'business')
  localStorage.setItem('pendingTitle', "Business Chat")
  
  router.push('/dashboard/ai-assistant/new')
}

function startGeneralChat() {
  console.log("Starting general chat")
  // Store info for general type chat
  localStorage.setItem('pendingCategory', 'general')
  localStorage.setItem('pendingTitle', "General Chat")
  
  router.push('/dashboard/ai-assistant/new')
}


// Expanded suggestions based on backend capabilities
// Expanded suggestions based on backend capabilities
const suggestions = ref([
  {
    title: 'Analisis Penjualan Bulanan',
    description: 'Dapatkan insight tentang performa penjualan Anda dari waktu ke waktu',
    icon: ChartBarIcon,
    prompt: 'Analisis performa penjualan perusahaan saya selama 3 bulan terakhir. Tunjukkan tren, produk terlaris, dan perubahan yang signifikan.'
  },
  {
    title: 'Status Inventaris',
    description: 'Periksa level stok dan identifikasi item dengan stok rendah',
    icon: CubeIcon,
    prompt: 'Berikan laporan tentang status inventaris saat ini. Sorot produk dengan level stok rendah dan sarankan opsi pemesanan ulang.'
  },
  {
    title: 'Insight Pelanggan',
    description: 'Analisis perilaku pelanggan dan riwayat pembelian',
    icon: UserGroupIcon,
    prompt: 'Siapa 5 pelanggan teratas saya berdasarkan pendapatan? Produk apa yang biasanya mereka beli, dan seberapa sering mereka memesan?'
  },
  {
    title: 'Analisis RFM Pelanggan',
    description: 'Segmentasi pelanggan berdasarkan Recency, Frequency, dan Monetary',
    icon: UserGroupIcon,
    prompt: 'Buat analisis RFM untuk pelanggan saya selama 6 bulan terakhir. Identifikasi segmen Champions dan At Risk.'
  },
  {
    title: 'Ringkasan Keuangan',
    description: 'Dapatkan gambaran cepat tentang performa keuangan',
    icon: CurrencyDollarIcon,
    prompt: 'Berikan ringkasan performa keuangan bulan ini dibandingkan bulan lalu. Sertakan pendapatan, pengeluaran, dan margin keuntungan.'
  },
  {
    title: 'Prediksi Penjualan',
    description: 'Dapatkan perkiraan penjualan untuk periode mendatang',
    icon: ChartBarSquareIcon,
    prompt: 'Berdasarkan data historis, prediksi penjualan untuk 3 bulan ke depan. Identifikasi faktor-faktor yang mungkin mempengaruhi performa.'
  },
  {
    title: 'Analisis Lead Time Servis',
    description: 'Analisis efisiensi proses servis dan identifikasi bottleneck',
    icon: ClockIcon,
    prompt: 'Analisis lead time servis kami selama 3 bulan terakhir. Identifikasi bottleneck utama dan berikan rekomendasi peningkatan.'
  },
  {
    title: 'Kinerja Mekanik',
    description: 'Evaluasi performa mekanik berdasarkan efisiensi dan waktu servis',
    icon: UserIcon,
    prompt: 'Analisis kinerja mekanik selama bulan ini. Bandingkan efisiensi waktu servis dan kepuasan pelanggan.'
  },
  {
    title: 'Peluang Bisnis',
    description: 'Identifikasi area potensial untuk pertumbuhan bisnis',
    icon: LightBulbIcon,
    prompt: 'Analisis peluang bisnis berdasarkan data penjualan 6 bulan terakhir. Identifikasi area potensial untuk ekspansi dan pertumbuhan.'
  }
])

// Lifecycle hooks
onMounted(() => {
  console.log("AIAssistant component mounted")
  
  // Fetch settings from server
  settingsStore.fetchSettings()
  
  // Fetch chat list from server
  chatStore.fetchChats()
  
  // Focus input
  if (welcomeInput.value) {
    welcomeInput.value.focus()
  }

  // Event listener for responsive sidebar
  window.addEventListener('resize', handleResize)

  showToast({
    message: 'Selamat datang di Jarvis AI Business Assistant!',
    type: 'info',
    duration: 4000
  })
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
})

function handleResize() {
  isMobile.value = window.innerWidth < 1024
  if (!isMobile.value) {
    showSidebar.value = true
  }
}

</script>

<style scoped>
/* PERBAIKAN: Tambahkan style untuk transisi sidebar */
.lg\:pl-72 {
  padding-left: 18rem;
}
</style> 