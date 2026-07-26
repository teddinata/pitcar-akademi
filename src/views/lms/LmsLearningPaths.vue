<template>
  <div class="min-h-screen clay-surface p-4 md:p-6">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Learning Path</h1>
        <p class="text-sm text-gray-500 mt-1">Jalur pembelajaran terstruktur</p>
      </div>
      <button
        v-if="authStore.user?.is_admin"
        @click="openCreateModal"
        class="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
      >
        <PlusIcon class="w-4 h-4" />
        <span class="hidden sm:inline">Tambah</span>
      </button>
    </div>

    <!-- Search -->
    <div class="clay-card p-4 mb-5">
      <input
        v-model="searchQuery"
        @input="debouncedLoad"
        placeholder="Cari learning path..."
        class="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
      />
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <div class="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
    </div>

    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
      <p class="text-red-600 font-medium">{{ error }}</p>
      <button @click="load" class="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700">Coba Lagi</button>
    </div>

    <div v-else-if="!paths.length" class="bg-white rounded-xl p-12 text-center border border-gray-100 shadow-sm">
      <MapIcon class="w-12 h-12 text-gray-300 mx-auto mb-3" />
      <p class="text-gray-500 font-medium">Tidak ada learning path</p>
    </div>

    <!-- Path Cards -->
    <div v-else class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      <div
        v-for="p in paths"
        :key="p.id"
        class="clay-card hover:shadow-md transition-shadow flex flex-col"
      >
        <div class="p-4 flex-1 flex flex-col">
          <h3 class="font-semibold text-gray-900 text-sm mb-1">{{ p.name }}</h3>
          <p class="text-xs text-gray-400 mb-2">{{ p.code }}</p>
          <p class="text-xs text-gray-500 line-clamp-2 mb-3 flex-1">{{ p.description || 'Tidak ada deskripsi' }}</p>

          <div class="flex items-center gap-3 text-xs text-gray-400 mb-3">
            <span>{{ p.course_count ?? 0 }} kursus</span>
            <span>·</span>
            <span>{{ p.total_duration_hours ?? 0 }}j total</span>
          </div>

          <!-- Progress if enrolled -->
          <div v-if="p.enrollment_progress !== null && p.enrollment_progress !== undefined" class="mb-3">
            <div class="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div class="h-full bg-blue-500 rounded-full" :style="{ width: (p.enrollment_progress || 0) + '%' }"></div>
            </div>
            <p class="text-xs text-gray-400 mt-1">{{ p.enrollment_progress }}% selesai</p>
          </div>

          <div class="flex gap-2 mt-auto">
            <button
              @click="enrollPath(p)"
              :disabled="enrolling === p.id"
              class="flex-1 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {{ enrolling === p.id ? 'Mendaftar...' : 'Ikuti' }}
            </button>
            <button
              @click="viewProgress(p)"
              class="px-3 py-1.5 border border-gray-200 text-gray-600 rounded-lg text-xs hover:bg-gray-50 transition-colors"
            >
              Progress
            </button>
            <template v-if="authStore.user?.is_admin">
              <button @click="openEditModal(p)" class="px-3 py-1.5 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors">
                <PencilIcon class="w-3.5 h-3.5" />
              </button>
              <button @click="deletePath(p)" class="px-3 py-1.5 border border-red-100 rounded-lg text-red-400 hover:bg-red-50 transition-colors">
                <TrashIcon class="w-3.5 h-3.5" />
              </button>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- Progress Modal -->
    <Teleport to="body">
      <div v-if="progressTarget" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" @click.self="progressTarget = null">
        <div class="clay-card w-full max-w-md max-h-[80vh] overflow-y-auto">
          <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 class="font-bold text-gray-900">Progress: {{ progressTarget.name }}</h2>
            <button @click="progressTarget = null"><XMarkIcon class="w-5 h-5 text-gray-400" /></button>
          </div>
          <div v-if="progressLoading" class="p-10 text-center">
            <div class="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          </div>
          <div v-else-if="progressData" class="p-6 space-y-3">
            <div class="text-center mb-4">
              <p class="text-3xl font-bold text-blue-600">{{ progressData.overall_progress ?? 0 }}%</p>
              <p class="text-sm text-gray-500 mt-1">Progress Keseluruhan</p>
            </div>
            <div v-if="progressData.course_progress?.length" class="space-y-2">
              <div v-for="c in progressData.course_progress" :key="c.course_id" class="bg-gray-50 rounded-lg p-3">
                <div class="flex justify-between items-center mb-1">
                  <p class="text-sm font-medium text-gray-800">{{ c.course_name }}</p>
                  <span class="text-xs px-2 py-0.5 rounded-full font-medium" :class="c.status === 'completed' ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-600'">
                    {{ c.status === 'completed' ? 'Selesai' : c.progress + '%' }}
                  </span>
                </div>
                <div class="h-1 bg-gray-200 rounded-full overflow-hidden">
                  <div class="h-full bg-blue-500 rounded-full" :style="{ width: (c.progress || 0) + '%' }"></div>
                </div>
              </div>
            </div>
            <div v-else class="text-center text-gray-400 text-sm py-4">Belum ada data progress</div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Create/Edit Modal -->
    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" @click.self="closeModal">
        <div class="clay-card w-full max-w-md max-h-[90vh] overflow-y-auto">
          <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 class="font-bold text-gray-900">{{ editTarget ? 'Edit Learning Path' : 'Tambah Learning Path' }}</h2>
            <button @click="closeModal"><XMarkIcon class="w-5 h-5 text-gray-400" /></button>
          </div>
          <div class="p-6 space-y-4">
            <div v-if="modalError" class="bg-red-50 border border-red-200 rounded-lg p-3 text-red-600 text-sm">{{ modalError }}</div>
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1">Nama *</label>
              <input v-model="form.name" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" placeholder="Nama learning path" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1">Kode</label>
              <input v-model="form.code" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" placeholder="Kode unik" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1">Deskripsi</label>
              <textarea v-model="form.description" rows="3" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-300" placeholder="Deskripsi learning path"></textarea>
            </div>
          </div>
          <div class="px-6 py-4 border-t border-gray-100 flex gap-3 justify-end">
            <button @click="closeModal" class="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">Batal</button>
            <button @click="saveModal" :disabled="saving" class="px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
              {{ saving ? 'Menyimpan...' : (editTarget ? 'Simpan' : 'Tambah') }}
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
import { useAuthStore } from '../../stores/auth'
import { lmsApi } from '../../services/lmsApi'
import { MapIcon, PlusIcon, PencilIcon, TrashIcon, XMarkIcon } from '@heroicons/vue/24/outline'

const authStore = useAuthStore()
const loading = ref(false)
const error = ref('')
const paths = ref([])
const searchQuery = ref('')
const toast = ref('')
const showModal = ref(false)
const editTarget = ref(null)
const saving = ref(false)
const modalError = ref('')
const enrolling = ref(null)

const progressTarget = ref(null)
const progressLoading = ref(false)
const progressData = ref(null)

const form = reactive({ name: '', code: '', description: '' })

let debounceTimer = null
function debouncedLoad() {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(load, 400)
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    const params = {}
    if (searchQuery.value) params.search = searchQuery.value
    const res = await lmsApi.learningPathSearch(params)
    paths.value = res?.learning_paths ?? []
  } catch (e) {
    error.value = e.message || 'Gagal memuat learning path'
  } finally {
    loading.value = false
  }
}

async function enrollPath(p) {
  enrolling.value = p.id
  try {
    await lmsApi.learningPathEnroll({ path_id: p.id })
    showToast('Berhasil mendaftar ke learning path!')
    load()
  } catch (e) {
    showToast(e.message || 'Gagal mendaftar')
  } finally {
    enrolling.value = null
  }
}

async function viewProgress(p) {
  progressTarget.value = p
  progressLoading.value = true
  progressData.value = null
  try {
    const res = await lmsApi.learningPathProgress({ path_id: p.id })
    progressData.value = res
  } catch (e) {
    showToast(e.message || 'Gagal memuat progress')
    progressTarget.value = null
  } finally {
    progressLoading.value = false
  }
}

async function deletePath(p) {
  if (!confirm(`Hapus learning path "${p.name}"?`)) return
  try {
    await lmsApi.learningPathDelete({ path_id: p.id })
    showToast('Learning path dihapus')
    load()
  } catch (e) {
    showToast(e.message || 'Gagal menghapus')
  }
}

function openCreateModal() {
  editTarget.value = null
  Object.assign(form, { name: '', code: '', description: '' })
  modalError.value = ''
  showModal.value = true
}

function openEditModal(p) {
  editTarget.value = p
  Object.assign(form, { name: p.name, code: p.code || '', description: p.description || '' })
  modalError.value = ''
  showModal.value = true
}

function closeModal() { if (saving.value) return; showModal.value = false; editTarget.value = null }

async function saveModal() {
  if (!form.name.trim()) { modalError.value = 'Nama wajib diisi'; return }
  saving.value = true
  modalError.value = ''
  try {
    if (editTarget.value) {
      await lmsApi.learningPathUpdate({ path_id: editTarget.value.id, ...form })
    } else {
      await lmsApi.learningPathCreate({ ...form })
    }
    showToast(editTarget.value ? 'Learning path diperbarui' : 'Learning path dibuat')
    closeModal()
    load()
  } catch (e) {
    modalError.value = e.message || 'Gagal menyimpan'
  } finally {
    saving.value = false
  }
}

function showToast(msg) { toast.value = msg; setTimeout(() => { toast.value = '' }, 3000) }

onMounted(load)
</script>
