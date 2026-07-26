<template>
  <div class="min-h-screen clay-surface p-4 md:p-6">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Kategori Kursus</h1>
        <p class="text-sm text-gray-500 mt-1">Kelola kategori kursus LMS</p>
      </div>
      <button
        @click="openCreateModal"
        class="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
      >
        <PlusIcon class="w-4 h-4" />
        <span class="hidden sm:inline">Tambah Kategori</span>
      </button>
    </div>

    <!-- Search -->
    <div class="clay-card p-4 mb-5">
      <input
        v-model="searchQuery"
        @input="debouncedLoad"
        placeholder="Cari kategori..."
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

    <div v-else-if="!categories.length" class="bg-white rounded-xl p-12 text-center border border-gray-100 shadow-sm">
      <TagIcon class="w-12 h-12 text-gray-300 mx-auto mb-3" />
      <p class="text-gray-500 font-medium">Tidak ada kategori</p>
    </div>

    <!-- Table -->
    <div v-else class="clay-card overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 text-gray-500 text-xs uppercase">
          <tr>
            <th class="px-4 py-3 text-left font-medium">Nama</th>
            <th class="px-4 py-3 text-center font-medium">Kode</th>
            <th class="px-4 py-3 text-center font-medium">Parent</th>
            <th class="px-4 py-3 text-center font-medium">Jumlah Kursus</th>
            <th class="px-4 py-3 text-center font-medium">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50">
          <tr v-for="c in categories" :key="c.id" class="hover:bg-gray-50 transition-colors">
            <td class="px-4 py-3 font-medium text-gray-800">{{ c.name }}</td>
            <td class="px-4 py-3 text-center text-gray-500 font-mono text-xs">{{ c.code }}</td>
            <td class="px-4 py-3 text-center text-gray-500 text-xs">{{ c.parent_name || '—' }}</td>
            <td class="px-4 py-3 text-center text-gray-600">{{ c.course_count ?? 0 }}</td>
            <td class="px-4 py-3 text-center">
              <div class="flex items-center justify-center gap-2">
                <button
                  @click="openEditModal(c)"
                  class="px-3 py-1 text-xs border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Edit
                </button>
                <button
                  @click="deleteCategory(c)"
                  class="px-3 py-1 text-xs border border-red-100 text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                >
                  Hapus
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Create/Edit Modal -->
    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" @click.self="closeModal">
        <div class="clay-card w-full max-w-md">
          <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 class="font-bold text-gray-900">{{ editTarget ? 'Edit Kategori' : 'Tambah Kategori' }}</h2>
            <button @click="closeModal"><XMarkIcon class="w-5 h-5 text-gray-400" /></button>
          </div>
          <div class="p-6 space-y-4">
            <div v-if="modalError" class="bg-red-50 border border-red-200 rounded-lg p-3 text-red-600 text-sm">{{ modalError }}</div>
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1">Nama *</label>
              <input v-model="form.name" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" placeholder="Nama kategori" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1">Kode</label>
              <input v-model="form.code" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" placeholder="Kode unik kategori" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1">Parent Category ID</label>
              <input v-model.number="form.parent_id" type="number" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" placeholder="ID kategori induk (opsional)" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1">Deskripsi</label>
              <textarea v-model="form.description" rows="2" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-300" placeholder="Deskripsi kategori"></textarea>
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
import { lmsApi } from '../../services/lmsApi'
import { TagIcon, PlusIcon, XMarkIcon } from '@heroicons/vue/24/outline'

const loading = ref(false)
const error = ref('')
const categories = ref([])
const searchQuery = ref('')
const toast = ref('')
const showModal = ref(false)
const editTarget = ref(null)
const saving = ref(false)
const modalError = ref('')

const form = reactive({ name: '', code: '', parent_id: null, description: '' })

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
    const res = await lmsApi.categorySearch(params)
    categories.value = res?.categories ?? []
  } catch (e) {
    error.value = e.message || 'Gagal memuat kategori'
  } finally {
    loading.value = false
  }
}

async function deleteCategory(c) {
  if (!confirm(`Hapus kategori "${c.name}"?`)) return
  try {
    await lmsApi.categoryDelete({ category_id: c.id })
    showToast('Kategori dihapus')
    load()
  } catch (e) {
    showToast(e.message || 'Gagal menghapus')
  }
}

function openCreateModal() {
  editTarget.value = null
  Object.assign(form, { name: '', code: '', parent_id: null, description: '' })
  modalError.value = ''
  showModal.value = true
}

function openEditModal(c) {
  editTarget.value = c
  Object.assign(form, { name: c.name, code: c.code || '', parent_id: c.parent_id || null, description: c.description || '' })
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
      await lmsApi.categoryUpdate({ category_id: editTarget.value.id, ...form })
    } else {
      await lmsApi.categoryCreate({ ...form })
    }
    showToast(editTarget.value ? 'Kategori diperbarui' : 'Kategori dibuat')
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
