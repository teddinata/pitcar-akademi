<template>
  <div class="min-h-screen clay-surface p-4 md:p-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Enrollment</h1>
        <p class="text-sm text-gray-500 mt-1">Kelola pendaftaran kursus</p>
      </div>
      <div class="flex gap-2">
        <button
          v-if="authStore.user?.is_admin"
          @click="showBulkModal = true"
          class="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors shadow-sm"
        >
          <UsersIcon class="w-4 h-4" />
          <span class="hidden sm:inline">Bulk Enroll</span>
        </button>
        <button
          @click="viewMode = viewMode === 'my' ? 'all' : 'my'; load()"
          v-if="authStore.user?.is_admin"
          class="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
        >
          {{ viewMode === 'my' ? 'Semua Enrollment' : 'Enrollment Saya' }}
        </button>
      </div>
    </div>

    <!-- Filters (admin all view) -->
    <div v-if="viewMode === 'all' && authStore.user?.is_admin" class="clay-card p-4 mb-5 flex flex-wrap gap-3">
      <select
        v-model="filters.status"
        @change="load"
        class="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
      >
        <option value="">Semua Status</option>
        <option value="not_started">Belum Mulai</option>
        <option value="in_progress">Sedang Berjalan</option>
        <option value="completed">Selesai</option>
        <option value="expired">Kadaluarsa</option>
      </select>
      <select
        v-model="filters.enrollment_type"
        @change="load"
        class="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
      >
        <option value="">Semua Tipe</option>
        <option value="mandatory">Wajib</option>
        <option value="voluntary">Sukarela</option>
      </select>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <div class="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
      <p class="text-red-600 font-medium">{{ error }}</p>
      <button @click="load" class="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700">Coba Lagi</button>
    </div>

    <!-- Empty -->
    <div v-else-if="!enrollments.length" class="bg-white rounded-xl p-12 text-center border border-gray-100 shadow-sm">
      <RectangleStackIcon class="w-12 h-12 text-gray-300 mx-auto mb-3" />
      <p class="text-gray-500 font-medium">Tidak ada enrollment</p>
    </div>

    <!-- Desktop Table -->
    <div v-else class="hidden md:block clay-card overflow-hidden mb-4">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 text-gray-500 text-xs uppercase">
          <tr>
            <th class="px-4 py-3 text-left font-medium">Kursus</th>
            <th v-if="viewMode === 'all'" class="px-4 py-3 text-left font-medium">Peserta</th>
            <th class="px-4 py-3 text-center font-medium">Status</th>
            <th class="px-4 py-3 text-center font-medium">Tipe</th>
            <th class="px-4 py-3 text-center font-medium">Progress</th>
            <th class="px-4 py-3 text-left font-medium">Terdaftar</th>
            <th class="px-4 py-3 text-center font-medium">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="e in enrollments" :key="e.id">
            <tr class="hover:bg-gray-50 transition-colors border-b border-gray-50">
              <td class="px-4 py-3 font-medium text-gray-800 max-w-48 truncate">{{ e.course_name }}</td>
              <td v-if="viewMode === 'all'" class="px-4 py-3 text-gray-600">{{ e.user_name }}</td>
              <td class="px-4 py-3 text-center">
                <span class="text-xs px-2 py-0.5 rounded-full font-medium" :class="statusClass(e.status)">
                  {{ statusLabel(e.status) }}
                </span>
              </td>
              <td class="px-4 py-3 text-center">
                <span class="text-xs px-2 py-0.5 rounded-full" :class="e.enrollment_type === 'mandatory' ? 'bg-red-50 text-red-600 font-semibold' : 'bg-gray-100 text-gray-500'">
                  {{ e.enrollment_type === 'mandatory' ? 'Wajib' : 'Sukarela' }}
                </span>
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center gap-2">
                  <div class="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div class="h-full bg-blue-500 rounded-full" :style="{ width: (e.progress_percentage || 0) + '%' }"></div>
                  </div>
                  <span class="text-xs text-gray-500 w-8 text-right">{{ e.progress_percentage || 0 }}%</span>
                </div>
              </td>
              <td class="px-4 py-3 text-gray-500 text-xs">{{ e.enrollment_date }}</td>
              <td class="px-4 py-3 text-center">
                <div class="flex items-center justify-center gap-1">
                  <button
                    v-if="authStore.user?.is_admin && e.module_progress?.length"
                    @click="expandedId = expandedId === e.id ? null : e.id"
                    class="px-2 py-1 text-xs border border-gray-200 text-gray-500 rounded-lg hover:bg-gray-50 transition-colors"
                    :title="expandedId === e.id ? 'Tutup detail' : 'Lihat detail tontonan'"
                  >{{ expandedId === e.id ? '▲' : '▼' }}</button>
                  <button
                    v-if="e.status === 'not_started'"
                    @click="goToLearn(e)"
                    class="px-2 py-1 text-xs border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                  >Mulai</button>
                  <button
                    v-if="e.status === 'in_progress'"
                    @click="goToLearn(e)"
                    class="px-2 py-1 text-xs border border-indigo-200 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
                  >Lanjutkan</button>
                  <button
                    v-if="e.status === 'completed'"
                    @click="goToLearn(e)"
                    class="px-2 py-1 text-xs border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                  >Lihat Materi</button>
                  <button
                    v-if="authStore.user?.is_admin && e.status !== 'completed'"
                    @click="completeEnrollment(e)"
                    class="px-2 py-1 text-xs border border-green-200 text-green-600 rounded-lg hover:bg-green-50 transition-colors"
                  >Selesai</button>
                  <button
                    v-if="authStore.user?.is_admin"
                    @click="resetEnrollment(e)"
                    class="px-2 py-1 text-xs border border-gray-200 text-gray-500 rounded-lg hover:bg-gray-50 transition-colors"
                  >Reset</button>
                </div>
              </td>
            </tr>
            <!-- Detail tontonan per modul (admin only) -->
            <tr v-if="authStore.user?.is_admin && expandedId === e.id" class="bg-amber-50 border-b border-gray-100">
              <td :colspan="viewMode === 'all' ? 7 : 6" class="px-6 py-3">
                <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Detail Tontonan Per Modul</p>
                <div class="space-y-1.5">
                  <div v-for="mp in e.module_progress" :key="mp.module_name" class="flex items-center gap-3">
                    <span class="text-xs text-gray-600 w-48 truncate shrink-0">{{ mp.module_name }}</span>
                    <div class="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden max-w-32">
                      <div
                        class="h-full rounded-full transition-all"
                        :class="mp.video_watch_percentage >= 90 ? 'bg-green-500' : mp.video_watch_percentage >= 50 ? 'bg-yellow-400' : 'bg-red-400'"
                        :style="{ width: (mp.video_watch_percentage || 0) + '%' }"
                      ></div>
                    </div>
                    <span class="text-xs tabular-nums w-8 text-right" :class="mp.video_watch_percentage >= 90 ? 'text-green-600 font-medium' : 'text-gray-500'">{{ Math.round(mp.video_watch_percentage || 0) }}%</span>
                    <span class="text-xs px-1.5 py-0.5 rounded-full font-medium shrink-0"
                      :class="{
                        'bg-green-50 text-green-700': mp.status === 'completed',
                        'bg-orange-50 text-orange-600': mp.status === 'skipped',
                        'bg-blue-50 text-blue-600': mp.status === 'in_progress',
                        'bg-gray-100 text-gray-400': mp.status === 'not_started',
                      }"
                    >{{ { completed: 'Selesai', skipped: 'Diskip', in_progress: 'Sedang', not_started: 'Belum' }[mp.status] || mp.status }}</span>
                    <span v-if="mp.time_spent_minutes" class="text-xs text-gray-400 shrink-0">{{ mp.time_spent_minutes }}m</span>
                  </div>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    <!-- Mobile Cards -->
    <div class="md:hidden space-y-3 mb-4">
      <div v-for="e in enrollments" :key="e.id" class="clay-card p-4">
        <div class="flex items-start justify-between gap-2 mb-2">
          <p class="font-semibold text-gray-900 text-sm">{{ e.course_name }}</p>
          <span class="shrink-0 text-xs px-2 py-0.5 rounded-full font-medium" :class="statusClass(e.status)">{{ statusLabel(e.status) }}</span>
        </div>
        <p v-if="viewMode === 'all'" class="text-xs text-gray-500 mb-2">{{ e.user_name }}</p>
        <div class="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-1">
          <div class="h-full bg-blue-500 rounded-full" :style="{ width: (e.progress_percentage || 0) + '%' }"></div>
        </div>
        <p class="text-xs text-gray-400 mb-3">{{ e.progress_percentage || 0 }}% selesai · {{ e.enrollment_date }}</p>
        <div class="flex gap-2">
          <button v-if="e.status === 'not_started'" @click="goToLearn(e)" class="flex-1 py-1.5 text-xs border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium">Mulai Belajar</button>
          <button v-if="e.status === 'in_progress'" @click="goToLearn(e)" class="flex-1 py-1.5 text-xs border border-indigo-200 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors font-medium">Lanjutkan</button>
          <button v-if="e.status === 'completed'" @click="goToLearn(e)" class="flex-1 py-1.5 text-xs border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors font-medium">Lihat Materi</button>
          <button v-if="authStore.user?.is_admin && e.status !== 'completed'" @click="completeEnrollment(e)" class="flex-1 py-1.5 text-xs border border-green-200 text-green-600 rounded-lg hover:bg-green-50 transition-colors">Selesai</button>
          <button v-if="authStore.user?.is_admin" @click="resetEnrollment(e)" class="flex-1 py-1.5 text-xs border border-gray-200 text-gray-500 rounded-lg hover:bg-gray-50 transition-colors">Reset</button>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="flex items-center justify-center gap-2 mt-2">
      <button @click="changePage(page - 1)" :disabled="page === 1" class="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors">←</button>
      <span class="text-sm text-gray-500">{{ page }} / {{ totalPages }}</span>
      <button @click="changePage(page + 1)" :disabled="page === totalPages" class="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors">→</button>
    </div>

    <!-- Bulk Enroll Modal -->
    <Teleport to="body">
      <div v-if="showBulkModal" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" @click.self="showBulkModal = false">
        <div class="clay-card w-full max-w-md">
          <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 class="font-bold text-gray-900">Bulk Enrollment</h2>
            <button @click="showBulkModal = false"><XMarkIcon class="w-5 h-5 text-gray-400" /></button>
          </div>
          <div class="p-6 space-y-4">
            <div v-if="bulkError" class="bg-red-50 border border-red-200 rounded-lg p-3 text-red-600 text-sm">{{ bulkError }}</div>
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1">Course ID *</label>
              <input v-model.number="bulkForm.course_id" type="number" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" placeholder="ID kursus" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1">User IDs (pisahkan koma) *</label>
              <input v-model="bulkForm.user_ids_raw" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" placeholder="1,2,3,..." />
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1">Tipe</label>
              <select v-model="bulkForm.enrollment_type" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300">
                <option value="voluntary">Sukarela</option>
                <option value="mandatory">Wajib</option>
              </select>
            </div>
          </div>
          <div class="px-6 py-4 border-t border-gray-100 flex gap-3 justify-end">
            <button @click="showBulkModal = false" class="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">Batal</button>
            <button @click="doBulkEnroll" :disabled="bulkSaving" class="px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
              {{ bulkSaving ? 'Mendaftarkan...' : 'Daftarkan' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <div v-if="toast" class="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm px-5 py-2.5 rounded-full shadow-lg z-50">{{ toast }}</div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { lmsApi } from '../../services/lmsApi'
import { RectangleStackIcon, UsersIcon, XMarkIcon } from '@heroicons/vue/24/outline'

const router = useRouter()
const authStore = useAuthStore()
const loading = ref(false)
const error = ref('')
const enrollments = ref([])
const expandedId = ref(null)
const page = ref(1)
const totalPages = ref(1)
const viewMode = ref('my')
const toast = ref('')
const showBulkModal = ref(false)
const bulkSaving = ref(false)
const bulkError = ref('')

const filters = reactive({ status: '', enrollment_type: '' })
const bulkForm = reactive({ course_id: null, user_ids_raw: '', enrollment_type: 'voluntary' })

async function load() {
  loading.value = true
  error.value = ''
  try {
    let res
    if (viewMode.value === 'my') {
      res = await lmsApi.myEnrollments({ page: page.value, limit: 20, include_progress: true })
    } else {
      const params = { page: page.value, limit: 20, include_progress: true }
      if (filters.status) params.status = filters.status
      if (filters.enrollment_type) params.enrollment_type = filters.enrollment_type
      res = await lmsApi.enrollmentSearch(params)
    }
    enrollments.value = res?.enrollments ?? []
    totalPages.value = res?.pagination?.total_pages ?? 1
  } catch (e) {
    error.value = e.message || 'Gagal memuat enrollment'
  } finally {
    loading.value = false
  }
}

function changePage(p) {
  if (p < 1 || p > totalPages.value) return
  page.value = p; load()
}

async function completeEnrollment(e) {
  try {
    await lmsApi.enrollmentComplete({ enrollment_id: e.id })
    showToast('Enrollment ditandai selesai')
    load()
  } catch (err) {
    showToast(err.message || 'Gagal')
  }
}

async function resetEnrollment(e) {
  if (!confirm('Reset progress enrollment ini?')) return
  try {
    await lmsApi.enrollmentReset({ enrollment_id: e.id })
    showToast('Progress di-reset')
    load()
  } catch (err) {
    showToast(err.message || 'Gagal')
  }
}

async function doBulkEnroll() {
  if (!bulkForm.course_id) { bulkError.value = 'Course ID wajib diisi'; return }
  const ids = bulkForm.user_ids_raw.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n))
  if (!ids.length) { bulkError.value = 'Masukkan minimal satu User ID'; return }
  bulkSaving.value = true
  bulkError.value = ''
  try {
    await lmsApi.bulkEnroll({ course_id: bulkForm.course_id, user_ids: ids, enrollment_type: bulkForm.enrollment_type })
    showToast('Bulk enrollment berhasil')
    showBulkModal.value = false
    load()
  } catch (e) {
    bulkError.value = e.message || 'Gagal bulk enroll'
  } finally {
    bulkSaving.value = false
  }
}

function goToLearn(enrollment) {
  router.push(`/dashboard/lms/learn/${enrollment.id}`)
}

function showToast(msg) { toast.value = msg; setTimeout(() => { toast.value = '' }, 3000) }


function statusLabel(s) {
  return { not_started: 'Belum Mulai', in_progress: 'Berjalan', completed: 'Selesai', expired: 'Kadaluarsa' }[s] || s
}

function statusClass(s) {
  return {
    not_started: 'bg-gray-100 text-gray-500',
    in_progress: 'bg-blue-50 text-blue-700',
    completed: 'bg-green-50 text-green-700',
    expired: 'bg-red-50 text-red-600',
  }[s] || 'bg-gray-100 text-gray-500'
}

onMounted(load)
</script>
