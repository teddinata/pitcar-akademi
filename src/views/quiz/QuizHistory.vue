<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-gradient-to-r from-[#B70000] to-[#950000] px-6 pt-8 pb-12 text-white">
      <button @click="router.push('/dashboard/quiz')" class="flex items-center gap-2 text-red-200 text-sm mb-4 hover:text-white transition-colors">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        Daftar Quiz
      </button>
      <h1 class="text-2xl font-bold">Riwayat Quiz</h1>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-20 gap-3">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#B70000]"></div>
    </div>

    <template v-else>
      <!-- Summary stats -->
      <div class="mx-4 -mt-6 grid grid-cols-2 gap-3 mb-4">
        <div class="bg-white rounded-xl shadow-sm p-4">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-2xl font-bold text-gray-900">{{ summary.pass_rate?.toFixed(0) || 0 }}%</div>
              <div class="text-xs text-gray-500 mt-1">Tingkat Kelulusan</div>
            </div>
            <div class="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <svg class="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
        <div class="bg-white rounded-xl shadow-sm p-4">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-2xl font-bold text-gray-900">{{ summary.avg_score?.toFixed(1) || '—' }}%</div>
              <div class="text-xs text-gray-500 mt-1">Rata-rata Score</div>
            </div>
            <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <svg class="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>
        <div class="bg-white rounded-xl shadow-sm p-4 text-center">
          <div class="text-xl font-bold text-green-600">{{ summary.total_passed || 0 }}</div>
          <div class="text-xs text-gray-500 mt-1">Lulus</div>
        </div>
        <div class="bg-white rounded-xl shadow-sm p-4 text-center">
          <div class="text-xl font-bold text-red-600">{{ summary.total_failed || 0 }}</div>
          <div class="text-xs text-gray-500 mt-1">Tidak Lulus</div>
        </div>
      </div>

      <!-- Period filter -->
      <div class="px-4 mb-3">
        <div class="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <button
            @click="filterPeriod = ''"
            class="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all"
            :class="filterPeriod === '' ? 'bg-[#B70000] text-white' : 'bg-white text-gray-600 border border-gray-200'"
          >
            Semua
          </button>
          <button
            v-for="p in availablePeriods"
            :key="p"
            @click="filterPeriod = p"
            class="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all"
            :class="filterPeriod === p ? 'bg-[#B70000] text-white' : 'bg-white text-gray-600 border border-gray-200'"
          >
            {{ formatPeriod(p) }}
          </button>
        </div>
      </div>

      <!-- History list -->
      <div class="px-4 pb-8 space-y-3">
        <div v-if="filteredHistory.length === 0" class="text-center py-16 text-gray-400">
          <p class="font-medium">Belum ada riwayat quiz</p>
        </div>

        <div
          v-for="item in filteredHistory"
          :key="item.result_id"
          @click="router.push(`/dashboard/quiz/result/${item.result_id}`)"
          class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 cursor-pointer hover:shadow-md transition-all active:scale-[0.99]"
        >
          <div class="flex items-start gap-3">
            <div
              class="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
              :class="item.is_passed ? 'bg-green-100' : 'bg-red-100'"
            >
              <svg v-if="item.is_passed" class="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
              </svg>
              <svg v-else class="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-semibold text-sm text-gray-900 truncate">{{ item.quiz?.name }}</p>
              <p class="text-xs text-gray-400 mt-0.5">{{ formatPeriod(item.period) }}</p>
              <p v-if="item.submitted_at" class="text-xs text-gray-400">
                {{ formatDateTime(item.submitted_at) }}
              </p>
            </div>
            <div class="text-right shrink-0">
              <p
                class="text-lg font-bold"
                :class="item.is_passed ? 'text-green-600' : 'text-red-600'"
              >
                {{ item.score?.toFixed(1) }}%
              </p>
              <span
                class="text-xs px-2 py-0.5 rounded-full font-medium"
                :class="item.is_passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
              >
                {{ item.is_passed ? 'Lulus' : 'Gagal' }}
              </span>
            </div>
          </div>

          <div v-if="item.needs_retraining" class="mt-2 text-xs text-amber-600 flex items-center gap-1">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Perlu retraining
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { quizApi } from '../../services/quizApi'

const router = useRouter()
const loading = ref(true)
const history = ref([])
const summary = ref({})
const filterPeriod = ref('')

const availablePeriods = computed(() => {
  const periods = [...new Set(history.value.map(h => h.period).filter(Boolean))]
  return periods.sort().reverse()
})

const filteredHistory = computed(() => {
  if (!filterPeriod.value) return history.value
  return history.value.filter(h => h.period === filterPeriod.value)
})

async function loadHistory() {
  loading.value = true
  try {
    const data = await quizApi.history()
    history.value = data.history || []
    summary.value = data.summary || {}
  } catch (e) {
    if (e.code === 'unauthorized') router.push('/login')
  } finally {
    loading.value = false
  }
}

function formatPeriod(period) {
  if (!period) return ''
  const [year, month] = period.split('-')
  const months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des']
  return `${months[parseInt(month) - 1]} ${year}`
}

function formatDateTime(dtStr) {
  if (!dtStr) return ''
  const d = new Date(dtStr.replace(' ', 'T') + 'Z')
  return d.toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

onMounted(loadHistory)
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
</style>
