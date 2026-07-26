<template>
  <div class="min-h-screen clay-surface p-4 md:p-6">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Kompetensi</h1>
        <p class="text-sm text-gray-500 mt-1">Kelola dan pantau kompetensi karyawan</p>
      </div>
    </div>

    <!-- Tabs -->
    <div class="flex gap-2 mb-6 overflow-x-auto pb-1">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        @click="activeTab = tab.key; load()"
        class="px-4 py-2 text-sm whitespace-nowrap clay-pill"
        :class="activeTab === tab.key ? 'clay-pill-active' : ''"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <div class="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
    </div>

    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
      <p class="text-red-600 font-medium">{{ error }}</p>
      <button @click="load" class="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700">Coba Lagi</button>
    </div>

    <!-- My Competencies -->
    <template v-else-if="activeTab === 'mine'">
      <div v-if="!items.length" class="bg-white rounded-xl p-12 text-center border border-gray-100 shadow-sm">
        <StarIcon class="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p class="text-gray-500 font-medium">Belum ada kompetensi</p>
      </div>
      <div v-else class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="c in items"
          :key="c.id"
          class="clay-card p-4"
        >
          <div class="flex items-start justify-between gap-2 mb-2">
            <h3 class="font-semibold text-gray-900 text-sm">{{ c.name }}</h3>
            <span class="shrink-0 text-xs px-2 py-0.5 rounded-full font-medium" :class="competencyStatusClass(c.status)">
              {{ competencyStatusLabel(c.status) }}
            </span>
          </div>
          <p class="text-xs text-gray-400 mb-2">{{ c.category || '—' }}</p>
          <div v-if="c.progress !== null && c.progress !== undefined" class="mb-2">
            <div class="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div class="h-full bg-blue-500 rounded-full" :style="{ width: (c.progress || 0) + '%' }"></div>
            </div>
            <p class="text-xs text-gray-400 mt-1">{{ c.progress }}% progress</p>
          </div>
          <div class="text-xs text-gray-500">
            <span v-if="c.achieved_date">Dicapai: {{ c.achieved_date }}</span>
            <span v-if="c.expiry_date" class="ml-2 text-orange-500">Exp: {{ c.expiry_date }}</span>
          </div>
        </div>
      </div>
    </template>

    <!-- Search/All Competencies -->
    <template v-else-if="activeTab === 'all'">
      <div class="clay-card p-4 mb-5 flex flex-wrap gap-3">
        <input
          v-model="searchQuery"
          @input="debouncedLoad"
          placeholder="Cari kompetensi..."
          class="flex-1 min-w-40 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
        <select
          v-model="categoryFilter"
          @change="load"
          class="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          <option value="">Semua Kategori</option>
          <option value="technical">Technical</option>
          <option value="soft_skill">Soft Skill</option>
          <option value="leadership">Leadership</option>
        </select>
      </div>
      <div v-if="!items.length" class="bg-white rounded-xl p-12 text-center border border-gray-100 shadow-sm">
        <StarIcon class="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p class="text-gray-500 font-medium">Tidak ada kompetensi ditemukan</p>
      </div>
      <div v-else class="clay-card overflow-hidden">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 text-gray-500 text-xs uppercase">
            <tr>
              <th class="px-4 py-3 text-left font-medium">Kompetensi</th>
              <th class="px-4 py-3 text-center font-medium">Kategori</th>
              <th class="px-4 py-3 text-center font-medium">Level</th>
              <th class="px-4 py-3 text-center font-medium">Total Tercapai</th>
              <th v-if="authStore.user?.is_admin" class="px-4 py-3 text-center font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="c in items" :key="c.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-4 py-3 font-medium text-gray-800">{{ c.name }}</td>
              <td class="px-4 py-3 text-center text-gray-500 text-xs">{{ c.category || '—' }}</td>
              <td class="px-4 py-3 text-center">
                <span class="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium">{{ c.level }}</span>
              </td>
              <td class="px-4 py-3 text-center text-gray-600">{{ c.achieved_count ?? '—' }}</td>
              <td v-if="authStore.user?.is_admin" class="px-4 py-3 text-center">
                <button
                  @click="openValidateModal(c)"
                  class="px-3 py-1 text-xs border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
                >
                  Validasi
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <!-- Leaderboard -->
    <template v-else-if="activeTab === 'leaderboard'">
      <div v-if="!items.length" class="bg-white rounded-xl p-12 text-center border border-gray-100 shadow-sm">
        <TrophyIcon class="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p class="text-gray-500 font-medium">Belum ada data leaderboard</p>
      </div>
      <div v-else class="clay-card overflow-hidden">
        <div class="divide-y divide-gray-50">
          <div
            v-for="(entry, i) in items"
            :key="entry.user_id"
            class="px-5 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors"
          >
            <div class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
              :class="i === 0 ? 'bg-yellow-400 text-white' : i === 1 ? 'bg-gray-300 text-gray-700' : i === 2 ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-500'"
            >
              {{ i + 1 }}
            </div>
            <div class="flex-1">
              <p class="font-semibold text-gray-800 text-sm">{{ entry.name }}</p>
              <p class="text-xs text-gray-400">{{ entry.department }}</p>
            </div>
            <div class="text-right">
              <p class="font-bold text-blue-600">{{ entry.total_competencies }}</p>
              <p class="text-xs text-gray-400">kompetensi</p>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- User Competencies (admin) -->
    <template v-else-if="activeTab === 'users'">
      <div class="clay-card p-4 mb-5 flex gap-3">
        <input
          v-model="searchQuery"
          @input="debouncedLoad"
          placeholder="Cari karyawan..."
          class="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
      </div>
      <div v-if="!items.length" class="bg-white rounded-xl p-12 text-center border border-gray-100 shadow-sm">
        <p class="text-gray-500 font-medium">Tidak ada data</p>
      </div>
      <div v-else class="clay-card overflow-hidden">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 text-gray-500 text-xs uppercase">
            <tr>
              <th class="px-4 py-3 text-left font-medium">Karyawan</th>
              <th class="px-4 py-3 text-center font-medium">Departemen</th>
              <th class="px-4 py-3 text-center font-medium">Kompetensi Tercapai</th>
              <th class="px-4 py-3 text-center font-medium">Kompetensi Pending</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="u in items" :key="u.user_id" class="hover:bg-gray-50 transition-colors">
              <td class="px-4 py-3 font-medium text-gray-800">{{ u.name }}</td>
              <td class="px-4 py-3 text-center text-gray-500 text-xs">{{ u.department }}</td>
              <td class="px-4 py-3 text-center text-green-600 font-semibold">{{ u.achieved_count }}</td>
              <td class="px-4 py-3 text-center text-orange-500 font-semibold">{{ u.pending_count }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <!-- Validate Modal -->
    <Teleport to="body">
      <div v-if="validateTarget" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" @click.self="validateTarget = null">
        <div class="clay-card w-full max-w-sm">
          <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 class="font-bold text-gray-900">Validasi Kompetensi</h2>
            <button @click="validateTarget = null"><XMarkIcon class="w-5 h-5 text-gray-400" /></button>
          </div>
          <div class="p-6 space-y-4">
            <div v-if="validateError" class="bg-red-50 border border-red-200 rounded-lg p-3 text-red-600 text-sm">{{ validateError }}</div>
            <p class="text-sm text-gray-600">Validasi kompetensi <strong>{{ validateTarget.name }}</strong></p>
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1">User ID *</label>
              <input v-model.number="validateForm.user_id" type="number" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" placeholder="ID karyawan" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1">Catatan</label>
              <textarea v-model="validateForm.notes" rows="2" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-300" placeholder="Catatan validasi"></textarea>
            </div>
          </div>
          <div class="px-6 py-4 border-t border-gray-100 flex gap-3 justify-end">
            <button @click="validateTarget = null" class="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">Batal</button>
            <button @click="doValidate" :disabled="validating" class="px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
              {{ validating ? 'Memvalidasi...' : 'Validasi' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <div v-if="toast" class="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm px-5 py-2.5 rounded-full shadow-lg z-50">{{ toast }}</div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { lmsApi } from '../../services/lmsApi'
import { StarIcon, TrophyIcon, XMarkIcon } from '@heroicons/vue/24/outline'

const authStore = useAuthStore()
const loading = ref(false)
const error = ref('')
const items = ref([])
const activeTab = ref('mine')
const toast = ref('')
const searchQuery = ref('')
const categoryFilter = ref('')

const validateTarget = ref(null)
const validating = ref(false)
const validateError = ref('')
const validateForm = ref({ user_id: null, notes: '' })

const tabs = computed(() => {
  const base = [
    { key: 'mine', label: 'Kompetensi Saya' },
    { key: 'all', label: 'Semua Kompetensi' },
    { key: 'leaderboard', label: 'Leaderboard' },
  ]
  if (authStore.user?.is_admin) base.push({ key: 'users', label: 'Per Karyawan' })
  return base
})

let debounceTimer = null
function debouncedLoad() {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(load, 400)
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    if (activeTab.value === 'mine') {
      const res = await lmsApi.myCompetencies({ include_progress: true })
      items.value = res?.competencies ?? []
    } else if (activeTab.value === 'all') {
      const params = {}
      if (searchQuery.value) params.search = searchQuery.value
      if (categoryFilter.value) params.category = categoryFilter.value
      const res = await lmsApi.competencySearch(params)
      items.value = res?.competencies ?? []
    } else if (activeTab.value === 'leaderboard') {
      const res = await lmsApi.competencyLeaderboard()
      items.value = res?.leaderboard ?? []
    } else if (activeTab.value === 'users') {
      const params = {}
      if (searchQuery.value) params.search = searchQuery.value
      const res = await lmsApi.competencySearchUsers(params)
      items.value = res?.users ?? []
    }
  } catch (e) {
    error.value = e.message || 'Gagal memuat data kompetensi'
  } finally {
    loading.value = false
  }
}

function openValidateModal(c) {
  validateTarget.value = c
  validateForm.value = { user_id: null, notes: '' }
  validateError.value = ''
}

async function doValidate() {
  if (!validateForm.value.user_id) { validateError.value = 'User ID wajib diisi'; return }
  validating.value = true
  validateError.value = ''
  try {
    await lmsApi.competencyValidate({
      competency_id: validateTarget.value.id,
      user_id: validateForm.value.user_id,
      notes: validateForm.value.notes,
    })
    showToast('Kompetensi berhasil divalidasi')
    validateTarget.value = null
    load()
  } catch (e) {
    validateError.value = e.message || 'Gagal memvalidasi'
  } finally {
    validating.value = false
  }
}

function showToast(msg) { toast.value = msg; setTimeout(() => { toast.value = '' }, 3000) }

function competencyStatusLabel(s) {
  return { achieved: 'Tercapai', in_progress: 'Berjalan', pending: 'Pending', expired: 'Kadaluarsa' }[s] || s
}

function competencyStatusClass(s) {
  return {
    achieved: 'bg-green-50 text-green-700',
    in_progress: 'bg-blue-50 text-blue-700',
    pending: 'bg-gray-100 text-gray-500',
    expired: 'bg-red-50 text-red-600',
  }[s] || 'bg-gray-100 text-gray-500'
}

onMounted(load)
</script>
