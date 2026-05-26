<template>
  <div class="min-h-screen bg-gray-50 p-4 md:p-6">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Modul Kursus</h1>
        <p class="text-sm text-gray-500 mt-1">Kelola modul dan konten kursus</p>
      </div>
      <button
        @click="openCreateModal"
        class="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
      >
        <PlusIcon class="w-4 h-4" />
        <span class="hidden sm:inline">Tambah Modul</span>
      </button>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-5 flex flex-wrap gap-3">
      <input
        v-model="filters.search"
        @input="debouncedLoad"
        placeholder="Cari modul..."
        class="flex-1 min-w-40 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
      />
      <select
        v-model="filters.course_id"
        @change="load"
        class="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 min-w-40"
      >
        <option :value="null">Semua Kursus</option>
        <option v-for="c in courseList" :key="c.id" :value="c.id">{{ c.name }}</option>
      </select>
      <select
        v-model="filters.content_type"
        @change="load"
        class="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
      >
        <option value="">Semua Tipe</option>
        <option value="video">Video</option>
        <option value="document">Dokumen/PDF</option>
        <option value="interactive">Interactive</option>
        <option value="assessment">Asesmen</option>
        <option value="external_link">Link Eksternal</option>
      </select>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <div class="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
    </div>

    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
      <p class="text-red-600 font-medium">{{ error }}</p>
      <button @click="load" class="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700">Coba Lagi</button>
    </div>

    <div v-else-if="!modules.length" class="bg-white rounded-xl p-12 text-center border border-gray-100 shadow-sm">
      <PuzzlePieceIcon class="w-12 h-12 text-gray-300 mx-auto mb-3" />
      <p class="text-gray-500 font-medium">Tidak ada modul ditemukan</p>
    </div>

    <!-- Table -->
    <div v-else class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mb-4">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 text-gray-500 text-xs uppercase">
          <tr>
            <th class="px-4 py-3 text-left font-medium">Nama Modul</th>
            <th class="px-4 py-3 text-center font-medium">Kursus</th>
            <th class="px-4 py-3 text-center font-medium">Tipe</th>
            <th class="px-4 py-3 text-center font-medium">Durasi</th>
            <th class="px-4 py-3 text-center font-medium">Asesmen</th>
            <th class="px-4 py-3 text-center font-medium">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50">
          <tr v-for="m in modules" :key="m.id" class="hover:bg-gray-50 transition-colors">
            <td class="px-4 py-3 font-medium text-gray-800">{{ m.name }}</td>
            <td class="px-4 py-3 text-center text-gray-500 text-xs">{{ m.course_name || '—' }}</td>
            <td class="px-4 py-3 text-center">
              <span class="text-xs px-2 py-0.5 rounded-full font-medium" :class="contentTypeClass(m.content_type)">
                {{ contentTypeLabel(m.content_type) }}
              </span>
            </td>
            <td class="px-4 py-3 text-center text-gray-500 text-xs">{{ m.duration_minutes }} mnt</td>
            <td class="px-4 py-3 text-center">
              <span v-if="m.is_assessment" class="text-xs px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 font-medium">Ya</span>
              <span v-else class="text-xs text-gray-300">—</span>
            </td>
            <td class="px-4 py-3 text-center">
              <div class="flex items-center justify-center gap-2">
                <button
                  v-if="m.content_type === 'assessment'"
                  @click="openQuestionManager(m)"
                  class="px-2 py-1 text-xs border border-purple-200 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors"
                  title="Kelola Soal"
                >
                  <ListBulletIcon class="w-3.5 h-3.5" />
                </button>
                <button v-else @click="openUploadModal(m)" class="px-2 py-1 text-xs border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors" title="Atur Konten">
                  <ArrowUpTrayIcon class="w-3.5 h-3.5" />
                </button>
                <button @click="openEditModal(m)" class="px-2 py-1 text-xs border border-gray-200 text-gray-500 rounded-lg hover:bg-gray-50 transition-colors">
                  <PencilIcon class="w-3.5 h-3.5" />
                </button>
                <button @click="deleteModule(m)" class="px-2 py-1 text-xs border border-red-100 text-red-400 rounded-lg hover:bg-red-50 transition-colors">
                  <TrashIcon class="w-3.5 h-3.5" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="flex items-center justify-center gap-2 mt-2">
      <button @click="changePage(page - 1)" :disabled="page === 1" class="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors">←</button>
      <span class="text-sm text-gray-500">{{ page }} / {{ totalPages }}</span>
      <button @click="changePage(page + 1)" :disabled="page === totalPages" class="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors">→</button>
    </div>

    <!-- Create/Edit Modal -->
    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" @click.self="showModal = false">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
          <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
            <h2 class="font-bold text-gray-900">{{ editTarget ? 'Edit Modul' : 'Tambah Modul' }}</h2>
            <button @click="showModal = false"><XMarkIcon class="w-5 h-5 text-gray-400" /></button>
          </div>
          <div class="p-6 space-y-4">
            <div v-if="modalError" class="bg-red-50 border border-red-200 rounded-lg p-3 text-red-600 text-sm">{{ modalError }}</div>

            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1">Nama Modul *</label>
              <input v-model="form.name" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" placeholder="Contoh: Pengenalan Servis Berkala" />
            </div>

            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1">Kursus *</label>
              <select v-model="form.course_id" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300">
                <option :value="null">— Pilih kursus —</option>
                <option v-for="c in courseList" :key="c.id" :value="c.id">{{ c.name }}</option>
              </select>
              <p v-if="coursesLoading" class="text-xs text-gray-400 mt-1">Memuat kursus...</p>
            </div>

            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1">Tipe Konten *</label>
              <select v-model="form.content_type" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300">
                <option value="video">🎬 Video</option>
                <option value="document">📄 Dokumen / PDF</option>
                <option value="assessment">📝 Asesmen / Quiz</option>
                <option value="external_link">🔗 Link Eksternal</option>
                <option value="interactive">⚙️ Interactive</option>
              </select>
            </div>

            <!-- Hint untuk assessment -->
            <div v-if="form.content_type === 'assessment'" class="bg-purple-50 border border-purple-100 rounded-lg px-3 py-2 text-xs text-purple-700">
              Quiz akan otomatis dibuat. Setelah modul tersimpan, klik tombol <strong>Kelola Soal</strong> (ikon daftar ungu) untuk menambahkan soal.
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-semibold text-gray-600 mb-1">Durasi (menit)</label>
                <input v-model.number="form.duration_minutes" type="number" min="0" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
              </div>
              <div>
                <label class="block text-xs font-semibold text-gray-600 mb-1">Urutan</label>
                <input v-model.number="form.sequence" type="number" min="1" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
              </div>
            </div>

            <label class="flex items-center gap-2 cursor-pointer">
              <input v-model="form.is_assessment" type="checkbox" class="w-4 h-4 rounded text-blue-600" />
              <span class="text-sm font-medium text-gray-700">Tandai sebagai Modul Asesmen</span>
            </label>
          </div>
          <div class="px-6 py-4 border-t border-gray-100 flex gap-3 justify-end sticky bottom-0 bg-white">
            <button @click="showModal = false" class="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">Batal</button>
            <button @click="saveModal" :disabled="saving" class="px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
              {{ saving ? 'Menyimpan...' : (editTarget ? 'Simpan' : 'Tambah') }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Upload/Set Content Modal -->
    <Teleport to="body">
      <div v-if="uploadTarget" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" @click.self="closeUploadModal">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-md">
          <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 class="font-bold text-gray-900">Atur Konten Modul</h2>
              <p class="text-xs text-gray-400 mt-0.5">{{ uploadTarget.name }}</p>
            </div>
            <button @click="closeUploadModal"><XMarkIcon class="w-5 h-5 text-gray-400" /></button>
          </div>
          <div class="p-6 space-y-4">
            <div v-if="uploadError" class="bg-red-50 border border-red-200 rounded-lg p-3 text-red-600 text-sm">{{ uploadError }}</div>

            <div v-if="uploadTarget.content_url" class="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
              <span class="text-xs text-gray-500 shrink-0">URL saat ini:</span>
              <a :href="uploadTarget.content_url" target="_blank" class="text-xs text-blue-600 hover:underline truncate flex-1">{{ uploadTarget.content_url }}</a>
            </div>

            <div class="flex rounded-lg border border-gray-200 overflow-hidden text-sm font-medium">
              <button @click="uploadMode = 'url'" :class="uploadMode === 'url' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'" class="flex-1 py-2 transition-colors">Link URL</button>
              <button @click="uploadMode = 'file'" :class="uploadMode === 'file' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'" class="flex-1 py-2 transition-colors border-l border-gray-200">Upload File</button>
            </div>

            <div v-if="uploadMode === 'url'" class="space-y-2">
              <p class="text-xs text-gray-400">Google Drive, YouTube, atau URL dokumen langsung</p>
              <input v-model="uploadUrl" placeholder="https://..." class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
              <p class="text-xs text-gray-400">Google Drive: buka file → Bagikan → "Siapapun dengan tautan"</p>
            </div>

            <div v-if="uploadMode === 'file'">
              <label class="block text-xs font-semibold text-gray-600 mb-2">Pilih File</label>
              <input type="file" @change="onFileChange" class="w-full text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
              <p class="text-xs text-gray-400 mt-1">Gunakan Link URL untuk file besar (video, PDF besar)</p>
            </div>
          </div>
          <div class="px-6 py-4 border-t border-gray-100 flex gap-3 justify-end">
            <button @click="closeUploadModal" class="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">Batal</button>
            <button @click="doSaveContent" :disabled="uploading || (uploadMode === 'url' ? !uploadUrl.trim() : !uploadFile)" class="px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
              {{ uploading ? 'Menyimpan...' : 'Simpan' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Question Manager Modal -->
    <Teleport to="body">
      <div v-if="qm.open" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" @click.self="qm.open = false">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
          <!-- Header -->
          <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
            <div>
              <h2 class="font-bold text-gray-900">Kelola Soal</h2>
              <p class="text-xs text-gray-400 mt-0.5">{{ qm.module?.name }}</p>
            </div>
            <button @click="qm.open = false"><XMarkIcon class="w-5 h-5 text-gray-400" /></button>
          </div>

          <div class="flex flex-col md:flex-row gap-0 flex-1 overflow-hidden">
            <!-- Left: Question List -->
            <div class="md:w-1/2 border-r border-gray-100 overflow-y-auto p-4 space-y-2">
              <div v-if="qm.loading" class="flex justify-center py-8">
                <div class="w-6 h-6 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
              </div>
              <div v-else-if="!qm.questions.length" class="text-center py-8 text-sm text-gray-400">
                Belum ada soal. Tambah soal di sebelah kanan.
              </div>
              <div
                v-for="(q, idx) in qm.questions"
                :key="q.id"
                class="border border-gray-100 rounded-xl p-3 bg-gray-50 hover:bg-white transition-colors"
              >
                <div class="flex items-start justify-between gap-2">
                  <div class="flex-1 min-w-0">
                    <p class="text-xs font-semibold text-gray-700 leading-snug truncate">{{ idx + 1 }}. {{ stripHtml(q.question_text) }}</p>
                    <div class="flex items-center gap-2 mt-1">
                      <span class="text-xs px-1.5 py-0.5 rounded bg-purple-50 text-purple-700">{{ qTypeLabel(q.question_type) }}</span>
                      <span class="text-xs text-gray-400">{{ q.points }} poin</span>
                    </div>
                    <!-- Options preview -->
                    <div v-if="q.options?.length" class="mt-2 space-y-0.5">
                      <div v-for="opt in q.options" :key="opt.id" class="flex items-center gap-1.5 text-xs">
                        <span :class="opt.is_correct ? 'text-green-600 font-semibold' : 'text-gray-400'">
                          {{ opt.is_correct ? '✓' : '○' }}
                        </span>
                        <span :class="opt.is_correct ? 'text-green-700 font-medium' : 'text-gray-500'">{{ opt.text }}</span>
                      </div>
                    </div>
                  </div>
                  <div class="flex flex-col gap-1 shrink-0">
                    <button @click="editQuestion(q)" class="p-1 text-gray-400 hover:text-blue-600 transition-colors" title="Edit">
                      <PencilIcon class="w-3.5 h-3.5" />
                    </button>
                    <button @click="deleteQuestion(q)" class="p-1 text-gray-400 hover:text-red-500 transition-colors" title="Hapus">
                      <TrashIcon class="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right: Add/Edit Form -->
            <div class="md:w-1/2 overflow-y-auto p-4 space-y-3">
              <h3 class="text-sm font-bold text-gray-700">{{ qm.editingQuestion ? 'Edit Soal' : 'Tambah Soal' }}</h3>

              <div v-if="qm.formError" class="bg-red-50 border border-red-200 rounded-lg p-2 text-xs text-red-600">{{ qm.formError }}</div>

              <div>
                <label class="block text-xs font-semibold text-gray-600 mb-1">Teks Soal *</label>
                <textarea v-model="qm.form.question_text" rows="3" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 resize-none" placeholder="Tulis pertanyaan di sini..."></textarea>
              </div>

              <div class="grid grid-cols-2 gap-2">
                <div>
                  <label class="block text-xs font-semibold text-gray-600 mb-1">Tipe</label>
                  <select v-model="qm.form.question_type" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-300">
                    <option value="multiple_choice">Pilihan Ganda</option>
                    <option value="true_false">Benar / Salah</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs font-semibold text-gray-600 mb-1">Poin</label>
                  <input v-model.number="qm.form.points" type="number" min="1" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" />
                </div>
              </div>

              <!-- Multiple Choice Options -->
              <div v-if="qm.form.question_type === 'multiple_choice'" class="space-y-2">
                <label class="block text-xs font-semibold text-gray-600">Pilihan Jawaban *</label>
                <div v-for="(opt, i) in qm.form.options" :key="i" class="flex items-center gap-2">
                  <input
                    type="checkbox"
                    v-model="opt.is_correct"
                    class="w-4 h-4 rounded text-purple-600 shrink-0"
                    title="Jawaban benar"
                  />
                  <input
                    v-model="opt.text"
                    :placeholder="`Pilihan ${String.fromCharCode(65 + i)}`"
                    class="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                  />
                </div>
                <p class="text-xs text-gray-400">Centang pilihan yang benar (boleh lebih dari satu)</p>
              </div>

              <!-- True/False Options -->
              <div v-if="qm.form.question_type === 'true_false'" class="space-y-2">
                <label class="block text-xs font-semibold text-gray-600">Jawaban Benar</label>
                <div class="flex gap-3">
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input type="radio" v-model="qm.form.correct_answer" value="true" class="w-4 h-4 text-purple-600" />
                    <span class="text-sm text-green-700 font-medium">Benar</span>
                  </label>
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input type="radio" v-model="qm.form.correct_answer" value="false" class="w-4 h-4 text-purple-600" />
                    <span class="text-sm text-red-600 font-medium">Salah</span>
                  </label>
                </div>
              </div>

              <div class="flex gap-2 pt-1">
                <button
                  v-if="qm.editingQuestion"
                  @click="resetQmForm()"
                  class="px-3 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >Batal Edit</button>
                <button
                  @click="saveQuestion"
                  :disabled="qm.saving"
                  class="flex-1 px-4 py-2 text-sm font-semibold text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                >{{ qm.saving ? 'Menyimpan...' : (qm.editingQuestion ? 'Simpan Perubahan' : 'Tambah Soal') }}</button>
              </div>
            </div>
          </div>

          <!-- Footer info -->
          <div class="px-6 py-3 border-t border-gray-100 shrink-0 flex items-center justify-between">
            <span class="text-xs text-gray-400">{{ qm.questions.length }} soal</span>
            <button @click="qm.open = false" class="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">Selesai</button>
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
import { PuzzlePieceIcon, PlusIcon, PencilIcon, TrashIcon, ArrowUpTrayIcon, XMarkIcon, ListBulletIcon } from '@heroicons/vue/24/outline'

const loading = ref(false)
const error = ref('')
const modules = ref([])
const page = ref(1)
const totalPages = ref(1)
const toast = ref('')
const showModal = ref(false)
const editTarget = ref(null)
const saving = ref(false)
const modalError = ref('')

const courseList = ref([])
const coursesLoading = ref(false)

const uploadTarget = ref(null)
const uploadFile = ref(null)
const uploadUrl = ref('')
const uploadMode = ref('url')
const uploading = ref(false)
const uploadError = ref('')

const filters = reactive({ search: '', course_id: null, content_type: '' })
const form = reactive({ name: '', course_id: null, content_type: 'video', duration_minutes: 0, sequence: 1, is_assessment: false })

async function loadCourses() {
  if (courseList.value.length) return
  coursesLoading.value = true
  try {
    const res = await lmsApi.courseSearch({ limit: 200 })
    courseList.value = res?.courses ?? []
  } catch { courseList.value = [] }
  finally { coursesLoading.value = false }
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
    const params = { page: page.value, limit: 20 }
    if (filters.search) params.search = filters.search
    if (filters.course_id) params.course_id = filters.course_id
    if (filters.content_type) params.content_type = filters.content_type
    const res = await lmsApi.moduleSearch(params)
    modules.value = res?.modules ?? []
    totalPages.value = res?.pagination?.total_pages ?? 1
  } catch (e) {
    error.value = e.message || 'Gagal memuat modul'
  } finally {
    loading.value = false
  }
}

function changePage(p) { if (p < 1 || p > totalPages.value) return; page.value = p; load() }

async function deleteModule(m) {
  if (!confirm(`Hapus modul "${m.name}"?`)) return
  try {
    await lmsApi.moduleDelete({ module_id: m.id })
    showToast('Modul berhasil dihapus')
    load()
  } catch (e) {
    showToast(e.message || 'Gagal menghapus modul')
  }
}

function openCreateModal() {
  editTarget.value = null
  Object.assign(form, { name: '', course_id: null, content_type: 'video', duration_minutes: 0, sequence: 1, is_assessment: false })
  modalError.value = ''
  showModal.value = true
  loadCourses()
}

function openEditModal(m) {
  editTarget.value = m
  Object.assign(form, {
    name: m.name,
    course_id: m.course_id,
    content_type: m.content_type,
    duration_minutes: m.duration_minutes,
    sequence: m.sequence || 1,
    is_assessment: m.is_assessment || false,
  })
  modalError.value = ''
  showModal.value = true
  loadCourses()
}

async function saveModal() {
  if (!form.name.trim()) { modalError.value = 'Nama modul wajib diisi'; return }
  if (!form.course_id) { modalError.value = 'Pilih kursus terlebih dahulu'; return }
  saving.value = true
  modalError.value = ''
  try {
    if (editTarget.value) {
      await lmsApi.moduleUpdate({ module_id: editTarget.value.id, ...form })
      showToast('Modul berhasil diperbarui')
    } else {
      await lmsApi.moduleCreate({ ...form })
      showToast('Modul berhasil dibuat')
    }
    showModal.value = false
    editTarget.value = null
    load()
  } catch (e) {
    modalError.value = e.message || 'Gagal menyimpan modul'
  } finally {
    saving.value = false
  }
}

function openUploadModal(m) {
  uploadTarget.value = m
  uploadFile.value = null
  uploadUrl.value = m.content_url || ''
  uploadMode.value = 'url'
  uploadError.value = ''
}

function closeUploadModal() {
  if (uploading.value) return
  uploadTarget.value = null
}

function onFileChange(e) { uploadFile.value = e.target.files[0] || null }

async function doSaveContent() {
  if (!uploadTarget.value) return
  uploading.value = true
  uploadError.value = ''
  try {
    if (uploadMode.value === 'url') {
      await lmsApi.moduleUploadContent({ module_id: uploadTarget.value.id, content_url: uploadUrl.value.trim() })
      showToast('URL konten berhasil disimpan')
      uploadTarget.value = null
      load()
    } else {
      if (!uploadFile.value) return
      const reader = new FileReader()
      reader.onload = async (ev) => {
        try {
          const base64 = ev.target.result.split(',')[1]
          await lmsApi.moduleUploadContent({ module_id: uploadTarget.value.id, content_data: base64, content_name: uploadFile.value.name })
          showToast('File berhasil diupload')
          uploadTarget.value = null
          load()
        } catch (e) {
          uploadError.value = e.message || 'Gagal upload'
        } finally {
          uploading.value = false
        }
      }
      reader.readAsDataURL(uploadFile.value)
      return
    }
  } catch (e) {
    uploadError.value = e.message || 'Gagal menyimpan konten'
  } finally {
    if (uploadMode.value === 'url') uploading.value = false
  }
}

function showToast(msg) { toast.value = msg; setTimeout(() => { toast.value = '' }, 3000) }

// ── QUESTION MANAGER ────────────────────────────────────────────────────────
const qm = reactive({
  open: false,
  loading: false,
  module: null,
  assessment: null,
  questions: [],
  expanded: {},
  saving: false,
  formError: '',
  editingQuestion: null,
  form: {
    question_text: '',
    question_type: 'multiple_choice',
    points: 1,
    difficulty: 'medium',
    options: [
      { text: '', is_correct: false },
      { text: '', is_correct: false },
      { text: '', is_correct: false },
      { text: '', is_correct: false },
    ],
    correct_answer: 'true',
  },
})

function stripHtml(html) {
  if (!html) return ''
  return html.replace(/<[^>]*>/g, '').trim()
}

function qTypeLabel(t) {
  return { multiple_choice: 'Pilihan Ganda', true_false: 'Benar/Salah', essay: 'Essay' }[t] || t
}

async function openQuestionManager(m) {
  qm.module = m
  qm.open = true
  qm.loading = true
  qm.questions = []
  qm.assessment = null
  qm.editingQuestion = null
  resetQmForm()
  try {
    const res = await lmsApi.assessmentForModule({ module_id: m.id })
    qm.assessment = res?.assessment ?? null
    qm.questions = res?.questions ?? []
  } catch (e) {
    showToast(e.message || 'Gagal memuat soal')
  } finally {
    qm.loading = false
  }
}

function resetQmForm() {
  qm.editingQuestion = null
  qm.formError = ''
  Object.assign(qm.form, {
    question_text: '',
    question_type: 'multiple_choice',
    points: 1,
    difficulty: 'medium',
    options: [
      { text: '', is_correct: false },
      { text: '', is_correct: false },
      { text: '', is_correct: false },
      { text: '', is_correct: false },
    ],
    correct_answer: 'true',
  })
}

function editQuestion(q) {
  qm.editingQuestion = q
  qm.formError = ''
  qm.form.question_text = q.question_text
  qm.form.question_type = q.question_type
  qm.form.points = q.points
  qm.form.difficulty = q.difficulty || 'medium'
  if (q.question_type === 'multiple_choice') {
    qm.form.options = q.options?.length
      ? q.options.map(o => ({ text: o.text, is_correct: o.is_correct }))
      : [{ text: '', is_correct: false }, { text: '', is_correct: false }, { text: '', is_correct: false }, { text: '', is_correct: false }]
  } else if (q.question_type === 'true_false') {
    const correctOpt = q.options?.find(o => o.is_correct)
    qm.form.correct_answer = correctOpt ? correctOpt.text.toLowerCase() : 'true'
  }
}

async function saveQuestion() {
  if (!qm.form.question_text.trim()) { qm.formError = 'Teks soal wajib diisi'; return }
  if (qm.form.question_type === 'multiple_choice') {
    const filled = qm.form.options.filter(o => o.text.trim())
    if (filled.length < 2) { qm.formError = 'Minimal 2 pilihan jawaban'; return }
    if (!filled.some(o => o.is_correct)) { qm.formError = 'Pilih setidaknya 1 jawaban benar'; return }
  }
  qm.saving = true
  qm.formError = ''
  try {
    const payload = {
      assessment_id: qm.assessment.id,
      question_text: qm.form.question_text.trim(),
      question_type: qm.form.question_type,
      points: qm.form.points,
      difficulty: qm.form.difficulty,
    }
    if (qm.form.question_type === 'multiple_choice') {
      payload.options = qm.form.options.filter(o => o.text.trim())
    } else if (qm.form.question_type === 'true_false') {
      payload.correct_answer = qm.form.correct_answer
    }
    if (qm.editingQuestion) {
      await lmsApi.assessmentUpdateQuestion({ question_id: qm.editingQuestion.id, ...payload })
      showToast('Soal berhasil diperbarui')
    } else {
      await lmsApi.assessmentAddQuestion(payload)
      showToast('Soal berhasil ditambahkan')
    }
    // Reload questions
    const res = await lmsApi.assessmentForModule({ module_id: qm.module.id })
    qm.questions = res?.questions ?? []
    if (res?.assessment) qm.assessment = res.assessment
    resetQmForm()
  } catch (e) {
    qm.formError = e.message || 'Gagal menyimpan soal'
  } finally {
    qm.saving = false
  }
}

async function deleteQuestion(q) {
  if (!confirm(`Hapus soal ini?`)) return
  try {
    await lmsApi.assessmentDeleteQuestion({ question_id: q.id })
    qm.questions = qm.questions.filter(x => x.id !== q.id)
    showToast('Soal dihapus')
  } catch (e) {
    showToast(e.message || 'Gagal menghapus soal')
  }
}

function contentTypeLabel(t) {
  return { video: 'Video', document: 'Dokumen', interactive: 'Interactive', assessment: 'Asesmen', external_link: 'Link' }[t] || t
}

function contentTypeClass(t) {
  return {
    video: 'bg-red-50 text-red-700',
    document: 'bg-blue-50 text-blue-700',
    assessment: 'bg-purple-50 text-purple-700',
    interactive: 'bg-orange-50 text-orange-700',
    external_link: 'bg-green-50 text-green-700',
  }[t] || 'bg-gray-100 text-gray-600'
}

onMounted(() => { load(); loadCourses() })
</script>
