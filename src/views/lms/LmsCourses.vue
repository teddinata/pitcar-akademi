<template>
  <div class="min-h-screen clay-surface p-4 md:p-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Kursus</h1>
        <p class="text-sm text-gray-500 mt-1">Jelajahi dan ikuti kursus yang tersedia</p>
      </div>
      <button
        v-if="authStore.user?.is_admin"
        @click="openCreateModal"
        class="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
      >
        <PlusIcon class="w-4 h-4" />
        <span class="hidden sm:inline">Tambah Kursus</span>
      </button>
    </div>

    <!-- Filters -->
    <div class="clay-card p-4 mb-5 flex flex-wrap gap-3">
      <input
        v-model="filters.search"
        @input="debouncedLoad"
        placeholder="Cari kursus..."
        class="flex-1 min-w-40 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
      />
      <select
        v-model="filters.difficulty_level"
        @change="load"
        class="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
      >
        <option value="">Semua Level</option>
        <option value="basic">Basic</option>
        <option value="intermediate">Intermediate</option>
        <option value="advanced">Advanced</option>
      </select>
      <select
        v-if="authStore.user?.is_admin"
        v-model="filters.is_published"
        @change="load"
        class="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
      >
        <option :value="null">Semua Status</option>
        <option :value="true">Published</option>
        <option :value="false">Draft</option>
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
    <div v-else-if="!courses.length" class="bg-white rounded-xl p-12 text-center border border-gray-100 shadow-sm">
      <BookOpenIcon class="w-12 h-12 text-gray-300 mx-auto mb-3" />
      <p class="text-gray-500 font-medium">Tidak ada kursus ditemukan</p>
    </div>

    <!-- Course Grid -->
    <div v-else class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      <div
        v-for="course in courses"
        :key="course.id"
        class="clay-card hover:shadow-md transition-shadow overflow-hidden flex flex-col"
      >
        <!-- Color band -->
        <div class="h-2" :class="difficultyBand(course.difficulty_level)"></div>
        <div class="p-4 flex-1 flex flex-col">
          <div class="flex items-start justify-between gap-2 mb-2">
            <h3 class="font-semibold text-gray-900 text-sm leading-snug">{{ course.name }}</h3>
            <span v-if="!course.is_published" class="shrink-0 text-[10px] px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full font-bold border border-amber-200">Draft</span>
          </div>
          <p class="text-xs text-gray-400 mb-1">{{ course.category || '—' }}</p>
          <p class="text-xs text-gray-500 line-clamp-2 mb-3 flex-1">{{ course.description || 'Tidak ada deskripsi' }}</p>

          <div class="flex items-center justify-between text-xs text-gray-400 mb-3">
            <span class="px-2 py-0.5 rounded-full font-medium" :class="difficultyClass(course.difficulty_level)">
              {{ course.difficulty_level || 'basic' }}
            </span>
            <span>{{ course.duration_hours }}j · {{ course.module_count }} modul</span>
          </div>

          <div class="flex items-center gap-2 text-xs text-gray-400 mb-4">
            <span>{{ course.enrollment_count }} peserta</span>
            <span>·</span>
            <span>{{ course.completion_rate }}% selesai</span>
          </div>

          <div class="flex gap-2 mt-auto">
            <!-- Not enrolled -->
            <button
              v-if="!enrollmentMap[course.name]"
              @click="enrollCourse(course)"
              :disabled="enrolling === course.id"
              class="flex-1 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
            >{{ enrolling === course.id ? 'Mendaftar...' : 'Daftar' }}</button>
            <!-- not_started -->
            <button
              v-else-if="enrollmentMap[course.name]?.status === 'not_started'"
              @click="goLearn(course)"
              class="flex-1 py-1.5 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700 transition-colors"
            >Mulai Belajar</button>
            <!-- in_progress -->
            <button
              v-else-if="enrollmentMap[course.name]?.status === 'in_progress'"
              @click="goLearn(course)"
              class="flex-1 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition-colors"
            >Lanjutkan →</button>
            <!-- completed -->
            <div
              v-else-if="enrollmentMap[course.name]?.status === 'completed'"
              class="flex-1 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-semibold text-center border border-green-200"
            >✓ Selesai</div>
            <template v-if="authStore.user?.is_admin">
              <button
                @click="openEditModal(course)"
                class="px-3 py-1.5 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors"
              >
                <PencilIcon class="w-3.5 h-3.5" />
              </button>
              <button
                @click="togglePublish(course)"
                class="px-3 py-1.5 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors"
                :title="course.is_published ? 'Unpublish' : 'Publish'"
              >
                <EyeIcon v-if="course.is_published" class="w-3.5 h-3.5 text-green-500" />
                <EyeSlashIcon v-else class="w-3.5 h-3.5 text-gray-400" />
              </button>
              <button
                @click="deleteCourse(course)"
                class="px-3 py-1.5 border border-red-100 rounded-lg text-red-400 hover:bg-red-50 transition-colors"
              >
                <TrashIcon class="w-3.5 h-3.5" />
              </button>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="flex items-center justify-center gap-2 mt-2">
      <button
        @click="changePage(page - 1)"
        :disabled="page === 1"
        class="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
      >←</button>
      <span class="text-sm text-gray-500">Halaman {{ page }} / {{ totalPages }}</span>
      <button
        @click="changePage(page + 1)"
        :disabled="page === totalPages"
        class="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
      >→</button>
    </div>

    <!-- Create/Edit Modal -->
    <Teleport to="body">
      <div
        v-if="showModal"
        class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        @click.self="closeModal"
      >
        <div class="clay-card w-full max-w-lg max-h-[90vh] overflow-y-auto">
          <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 class="font-bold text-gray-900">{{ editTarget ? 'Edit Kursus' : 'Tambah Kursus' }}</h2>
            <button @click="closeModal" class="text-gray-400 hover:text-gray-600 transition-colors">
              <XMarkIcon class="w-5 h-5" />
            </button>
          </div>
          <div class="p-6 space-y-4">
            <div v-if="modalError" class="bg-red-50 border border-red-200 rounded-lg p-3 text-red-600 text-sm">{{ modalError }}</div>
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1">Nama Kursus *</label>
              <input v-model="form.name" @input="autoGenCode" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" placeholder="Nama kursus" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1">
                Kode Unik
                <span class="text-gray-400 font-normal ml-1">— di-generate otomatis, bisa diubah</span>
              </label>
              <input v-model="form.code" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 font-mono text-gray-500" placeholder="Akan diisi otomatis" @input="codeManuallyEdited = true" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1">Kategori</label>
              <select v-model="form.category_id" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white">
                <option :value="null">— Tanpa Kategori —</option>
                <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
              </select>
              <p v-if="categoriesLoading" class="text-xs text-gray-400 mt-1">Memuat kategori...</p>
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1">Deskripsi Singkat</label>
              <input v-model="form.short_description" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" placeholder="Deskripsi singkat" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1">Deskripsi</label>
              <textarea v-model="form.description" rows="3" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none" placeholder="Deskripsi lengkap kursus"></textarea>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-semibold text-gray-600 mb-1">Level Kesulitan</label>
                <select v-model="form.difficulty_level" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white">
                  <option value="basic">Basic</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-semibold text-gray-600 mb-1">Durasi (jam)</label>
                <input v-model.number="form.duration_hours" type="number" step="0.5" min="0.5" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
              </div>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-semibold text-gray-600 mb-1">Poin Penyelesaian</label>
                <input v-model.number="form.completion_points" type="number" min="0" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
              </div>
              <div class="flex items-end pb-2">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input v-model="form.is_mandatory" type="checkbox" class="w-4 h-4 rounded text-blue-600" />
                  <span class="text-sm font-medium text-gray-700">Kursus Wajib</span>
                </label>
              </div>
            </div>

            <!-- Target Jabatan — hanya muncul kalau is_mandatory = true -->
            <div v-if="form.is_mandatory">
              <label class="block text-xs font-semibold text-gray-600 mb-2">
                Wajib untuk Jabatan
                <span class="text-gray-400 font-normal ml-1">— pilih satu atau lebih jabatan</span>
              </label>
              <div v-if="jobPositionsLoading" class="text-xs text-gray-400 py-2">Memuat jabatan...</div>
              <div v-else class="border border-gray-200 rounded-lg overflow-hidden">
                <!-- Selected chips -->
                <div v-if="form.target_role_ids.length" class="flex flex-wrap gap-1.5 p-2.5 bg-blue-50 border-b border-blue-100">
                  <span
                    v-for="id in form.target_role_ids"
                    :key="id"
                    class="inline-flex items-center gap-1 bg-blue-600 text-white text-xs px-2.5 py-1 rounded-full"
                  >
                    {{ jobPositions.find(j => j.id === id)?.name ?? id }}
                    <button @click="removeRole(id)" class="hover:text-blue-200 leading-none">×</button>
                  </span>
                </div>
                <!-- Dropdown list -->
                <div class="max-h-36 overflow-y-auto">
                  <label
                    v-for="job in jobPositions"
                    :key="job.id"
                    class="flex items-center gap-2.5 px-3 py-2 hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      :value="job.id"
                      v-model="form.target_role_ids"
                      class="w-4 h-4 rounded text-blue-600"
                    />
                    <span class="text-sm text-gray-700">{{ job.name }}</span>
                  </label>
                  <p v-if="!jobPositions.length" class="text-xs text-gray-400 px-3 py-2">Tidak ada jabatan tersedia</p>
                </div>
              </div>
              <p v-if="form.is_mandatory && !form.target_role_ids.length" class="text-xs text-amber-500 mt-1">
                Pilih minimal satu jabatan agar kursus ini dihitung sebagai kewajiban karyawan
              </p>
            </div>
          </div>
          <div class="px-6 py-4 border-t border-gray-100 flex gap-3 justify-end">
            <button @click="closeModal" class="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">Batal</button>
            <button
              @click="saveModal"
              :disabled="saving"
              class="px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {{ saving ? 'Menyimpan...' : (editTarget ? 'Simpan' : 'Tambah') }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Feedback toast -->
    <div v-if="toast" class="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm px-5 py-2.5 rounded-full shadow-lg z-50 transition-all">
      {{ toast }}
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { lmsApi } from '../../services/lmsApi'
import {
  BookOpenIcon, PlusIcon, PencilIcon, TrashIcon,
  EyeIcon, EyeSlashIcon, XMarkIcon,
} from '@heroicons/vue/24/outline'

const router = useRouter()
const authStore = useAuthStore()
const loading = ref(false)
const enrollmentMap = ref({}) // { [course_name]: enrollment }
const error = ref('')
const courses = ref([])
const page = ref(1)
const totalPages = ref(1)
const enrolling = ref(null)
const toast = ref('')
const showModal = ref(false)
const editTarget = ref(null)
const saving = ref(false)
const modalError = ref('')

const filters = reactive({ search: '', difficulty_level: '', is_published: null })
const form = reactive({
  name: '', code: '', category_id: null, description: '',
  short_description: '', difficulty_level: 'basic',
  duration_hours: 1, completion_points: 10, is_mandatory: false,
  target_role_ids: [],
})

const jobPositions = ref([])
const jobPositionsLoading = ref(false)
const categories = ref([])
const categoriesLoading = ref(false)
const codeManuallyEdited = ref(false)

function slugify(name) {
  return name.trim().toUpperCase()
    .replace(/[^A-Z0-9\s]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 40)
}

function autoGenCode() {
  if (!codeManuallyEdited.value) form.code = slugify(form.name)
}

async function loadCategories() {
  if (categories.value.length) return
  categoriesLoading.value = true
  try {
    const res = await lmsApi.categorySearch({ limit: 100 })
    categories.value = res?.categories ?? []
  } catch { categories.value = [] }
  finally { categoriesLoading.value = false }
}

async function loadJobPositions() {
  if (jobPositions.value.length) return
  jobPositionsLoading.value = true
  try {
    const res = await lmsApi.jobPositions()
    jobPositions.value = Array.isArray(res) ? res : []
  } catch { jobPositions.value = [] }
  finally { jobPositionsLoading.value = false }
}

function removeRole(id) {
  form.target_role_ids = form.target_role_ids.filter(x => x !== id)
}

let debounceTimer = null
function debouncedLoad() {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => { page.value = 1; load() }, 400)
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    const params = { page: page.value, limit: 12 }
    if (filters.search) params.search = filters.search
    if (filters.difficulty_level) params.difficulty_level = filters.difficulty_level
    if (filters.is_published !== null) params.is_published = filters.is_published
    const res = await lmsApi.courseSearch(params)
    courses.value = res?.courses ?? []
    const p = res?.pagination ?? {}
    totalPages.value = p.total_pages ?? 1
  } catch (e) {
    error.value = e.message || 'Gagal memuat kursus'
  } finally {
    loading.value = false
  }
}

function changePage(p) {
  if (p < 1 || p > totalPages.value) return
  page.value = p
  load()
}

async function loadEnrollmentMap() {
  try {
    const res = await lmsApi.myEnrollments({ limit: 200 })
    const map = {}
    for (const e of (res?.enrollments ?? [])) {
      map[e.course_name] = e
    }
    enrollmentMap.value = map
  } catch (_) {
    // non-critical, enrollment status just won't show
  }
}

function goLearn(course) {
  const enrollment = enrollmentMap.value[course.name]
  if (enrollment?.id) {
    router.push(`/dashboard/lms/learn/${enrollment.id}`)
  } else {
    router.push('/dashboard/lms/enrollments')
  }
}

async function enrollCourse(course) {
  enrolling.value = course.id
  try {
    await lmsApi.courseEnroll({ course_id: course.id })
    showToast('Berhasil mendaftar ke kursus!')
    await loadEnrollmentMap()
    load()
  } catch (e) {
    showToast(e.message || 'Gagal mendaftar')
  } finally {
    enrolling.value = null
  }
}

async function togglePublish(course) {
  try {
    await lmsApi.coursePublish({ course_id: course.id, is_published: !course.is_published })
    showToast(course.is_published ? 'Kursus di-unpublish' : 'Kursus di-publish')
    load()
  } catch (e) {
    showToast(e.message || 'Gagal mengubah status')
  }
}

async function deleteCourse(course) {
  if (!confirm(`Hapus kursus "${course.name}"?`)) return
  try {
    await lmsApi.courseDelete({ course_id: course.id })
    showToast('Kursus dihapus')
    load()
  } catch (e) {
    showToast(e.message || 'Gagal menghapus kursus')
  }
}

function openCreateModal() {
  editTarget.value = null
  codeManuallyEdited.value = false
  Object.assign(form, {
    name: '', code: '', category_id: null, description: '', short_description: '',
    difficulty_level: 'basic', duration_hours: 1, completion_points: 10,
    is_mandatory: false, target_role_ids: [],
  })
  modalError.value = ''
  showModal.value = true
  loadJobPositions()
  loadCategories()
}

function openEditModal(course) {
  editTarget.value = course
  codeManuallyEdited.value = true // on edit, don't auto-overwrite existing code
  Object.assign(form, {
    name: course.name, code: course.code, category_id: course.category_id,
    description: course.description, short_description: course.short_description || '',
    difficulty_level: course.difficulty_level, duration_hours: course.duration_hours,
    completion_points: course.completion_points, is_mandatory: course.is_mandatory,
    target_role_ids: course.target_role_ids ? [...course.target_role_ids] : [],
  })
  modalError.value = ''
  showModal.value = true
  loadJobPositions()
  loadCategories()
}

function closeModal() {
  if (saving.value) return
  showModal.value = false
  editTarget.value = null
}

async function saveModal() {
  if (!form.name.trim()) {
    modalError.value = 'Nama kursus wajib diisi'
    return
  }
  if (!form.code.trim()) form.code = slugify(form.name)
  saving.value = true
  modalError.value = ''
  try {
    if (editTarget.value) {
      await lmsApi.courseUpdate({ course_id: editTarget.value.id, ...form })
      showToast('Kursus diperbarui')
    } else {
      await lmsApi.courseCreate({ ...form })
      showToast('Kursus berhasil dibuat')
    }
    showModal.value = false
    editTarget.value = null
    load()
  } catch (e) {
    modalError.value = e.message || 'Gagal menyimpan'
  } finally {
    saving.value = false
  }
}

function showToast(msg) {
  toast.value = msg
  setTimeout(() => { toast.value = '' }, 3000)
}

function difficultyBand(level) {
  return { basic: 'bg-green-400', intermediate: 'bg-yellow-400', advanced: 'bg-red-400' }[level] || 'bg-gray-300'
}

function difficultyClass(level) {
  return { basic: 'bg-green-50 text-green-700', intermediate: 'bg-yellow-50 text-yellow-700', advanced: 'bg-red-50 text-red-700' }[level] || 'bg-gray-100 text-gray-600'
}

onMounted(() => { load(); loadEnrollmentMap() })
</script>
