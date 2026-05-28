<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Template Journey</h1>
        <p class="text-sm text-gray-500 mt-1">Blueprint alur pembinaan per jabatan</p>
      </div>
      <button @click="openCreateModal" class="btn-primary flex items-center gap-2">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
        </svg>
        Template Baru
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-16">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
    </div>

    <!-- Empty -->
    <div v-else-if="!templates.length" class="text-center py-16 text-gray-400">
      <svg class="w-12 h-12 mx-auto mb-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
      </svg>
      <p class="font-medium">Belum ada template</p>
      <p class="text-sm">Buat template journey untuk mulai</p>
    </div>

    <!-- Grid -->
    <div v-else class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <div v-for="t in templates" :key="t.id"
        class="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
        <div class="flex items-start justify-between mb-3">
          <div>
            <span class="inline-block px-2 py-0.5 rounded text-xs font-medium mb-1"
              :class="t.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'">
              {{ t.is_active ? 'Aktif' : 'Nonaktif' }}
            </span>
            <h3 class="font-semibold text-gray-900">{{ t.name }}</h3>
            <p v-if="t.description" class="text-xs text-gray-500 mt-0.5 line-clamp-2">{{ t.description }}</p>
          </div>
          <div class="flex gap-1 ml-2 shrink-0">
            <button @click="openEdit(t)" class="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
              </svg>
            </button>
            <button @click="confirmDelete(t)" class="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Meta -->
        <div class="flex flex-wrap gap-2 text-xs text-gray-500 mb-3">
          <span class="flex items-center gap-1">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            Lulus {{ t.final_passing_score }}%
          </span>
          <span class="flex items-center gap-1">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            {{ t.journey_count }} journey
          </span>
          <span v-if="t.auto_assign" class="flex items-center gap-1 text-blue-600">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
            Auto assign
          </span>
        </div>

        <!-- Jobs -->
        <div v-if="t.job_ids.length" class="flex flex-wrap gap-1">
          <span v-for="j in t.job_ids" :key="j.id"
            class="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">
            {{ j.name }}
          </span>
        </div>
      </div>
    </div>

    <!-- Modal Create/Edit -->
    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 py-8 px-4">
        <div class="bg-white rounded-2xl w-full max-w-2xl shadow-xl">
          <div class="flex items-center justify-between px-6 py-4 border-b">
            <h2 class="text-lg font-semibold">{{ editingId ? 'Edit Template' : 'Template Baru' }}</h2>
            <button @click="closeModal" class="p-1.5 rounded hover:bg-gray-100 text-gray-400">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <div class="p-6 space-y-4">
            <!-- Basic fields -->
            <div class="grid grid-cols-2 gap-4">
              <div class="col-span-2">
                <label class="form-label">Nama Template <span class="text-red-500">*</span></label>
                <input v-model="form.name" type="text" class="form-input" placeholder="Contoh: Mekanik Baru"/>
              </div>
              <div class="col-span-2">
                <label class="form-label">Deskripsi</label>
                <textarea v-model="form.description" rows="2" class="form-input" placeholder="Deskripsi singkat journey ini..."></textarea>
              </div>
              <div>
                <label class="form-label">Nilai Kelulusan (%)</label>
                <input v-model.number="form.final_passing_score" type="number" min="0" max="100" class="form-input"/>
              </div>
              <div class="flex items-center gap-4 pt-5">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input v-model="form.is_active" type="checkbox" class="w-4 h-4 accent-red-600"/>
                  <span class="text-sm">Aktif</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input v-model="form.auto_assign" type="checkbox" class="w-4 h-4 accent-red-600"/>
                  <span class="text-sm">Auto assign</span>
                </label>
              </div>
            </div>

            <!-- Stages -->
            <div>
              <div class="flex items-center justify-between mb-2">
                <label class="form-label mb-0">Tahapan Journey</label>
                <button @click="addStage" type="button"
                  class="text-xs px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium">
                  + Tambah Tahap
                </button>
              </div>

              <div v-if="!form.stages.length" class="text-center py-4 text-gray-400 text-sm border-2 border-dashed rounded-lg">
                Belum ada tahapan
              </div>

              <div v-for="(stage, idx) in form.stages" :key="idx"
                class="border border-gray-200 rounded-xl p-4 mb-3 bg-gray-50">
                <div class="flex items-center justify-between mb-3">
                  <span class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Tahap {{ idx + 1 }}</span>
                  <button @click="removeStage(idx)" type="button" class="text-red-400 hover:text-red-600">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                </div>
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="form-label">Nama Tahap</label>
                    <input v-model="stage.name" type="text" class="form-input" placeholder="Contoh: Training Teori"/>
                  </div>
                  <div>
                    <label class="form-label">Tipe</label>
                    <select v-model="stage.stage_type" class="form-input">
                      <option value="orientation">Orientasi</option>
                      <option value="lms_course">Training Teori (LMS)</option>
                      <option value="sop_quiz">Kuis SOP</option>
                      <option value="practical">Training Praktek</option>
                      <option value="final">Penilaian Akhir</option>
                    </select>
                  </div>
                  <div>
                    <label class="form-label">Bobot (%)</label>
                    <input v-model.number="stage.weight" type="number" min="0" max="100" class="form-input"/>
                  </div>
                  <div>
                    <label class="form-label">Nilai Lulus (%)</label>
                    <input v-model.number="stage.passing_score" type="number" min="0" max="100" class="form-input"/>
                  </div>
                  <!-- LMS course selector -->
                  <div v-if="stage.stage_type === 'lms_course'" class="col-span-2">
                    <label class="form-label">Kursus LMS</label>
                    <select v-model.number="stage.course_id" class="form-input">
                      <option :value="null">— Belum ditentukan —</option>
                      <option v-for="c in allCourses" :key="c.id" :value="c.id">{{ c.name }}</option>
                    </select>
                    <p class="text-xs text-gray-400 mt-0.5">Link ke kursus LMS untuk sync nilai otomatis</p>
                  </div>

                  <!-- SOP quiz program selector -->
                  <div v-if="stage.stage_type === 'sop_quiz'" class="col-span-2">
                    <label class="form-label">Program Kuis SOP</label>
                    <select v-model.number="stage.quiz_program_id" class="form-input">
                      <option :value="null">— Belum ditentukan —</option>
                      <option v-for="q in allQuizPrograms" :key="q.id" :value="q.id">{{ q.name }}</option>
                    </select>
                    <p class="text-xs text-gray-400 mt-0.5">Link ke program quiz SOP untuk sync nilai otomatis</p>
                  </div>

                  <!-- Practical criteria -->
                  <div v-if="stage.stage_type === 'practical'" class="col-span-2">
                    <label class="form-label">Kriteria Penilaian (satu per baris)</label>
                    <textarea v-model="stage.practical_criteria_text" rows="3" class="form-input"
                      placeholder="Contoh:&#10;Ganti Oli&#10;Diagnosa Rem&#10;Tune Up Mesin"></textarea>
                  </div>
                  <div class="col-span-2 flex items-center gap-4">
                    <label class="flex items-center gap-2 cursor-pointer">
                      <input v-model="stage.is_blocking" type="checkbox" class="w-4 h-4 accent-red-600"/>
                      <span class="text-sm">Harus lulus untuk lanjut</span>
                    </label>
                    <div class="flex items-center gap-2">
                      <span class="text-sm text-gray-600">Target durasi:</span>
                      <input v-model.number="stage.duration_days" type="number" min="1" class="form-input w-20 py-1"/>
                      <span class="text-sm text-gray-500">hari</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Weight total indicator -->
              <div v-if="form.stages.length" class="flex items-center gap-2 mt-2">
                <span class="text-xs text-gray-500">Total bobot:</span>
                <span class="text-sm font-semibold" :class="totalWeight === 100 ? 'text-green-600' : 'text-red-600'">
                  {{ totalWeight }}%
                </span>
                <span v-if="totalWeight !== 100" class="text-xs text-red-500">(harus tepat 100%)</span>
              </div>
            </div>
          </div>

          <div class="flex justify-end gap-3 px-6 py-4 border-t">
            <button @click="closeModal" class="btn-secondary">Batal</button>
            <button @click="saveTemplate" :disabled="saving || !form.name"
              class="btn-primary min-w-[100px]">
              <span v-if="saving" class="flex items-center gap-2">
                <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Menyimpan...
              </span>
              <span v-else>Simpan</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { journeyApi } from '@/services/journeyApi'

const templates = ref([])
const allCourses = ref([])
const allQuizPrograms = ref([])
const loading = ref(false)
const showModal = ref(false)
const saving = ref(false)
const editingId = ref(null)

const defaultForm = () => ({
  name: '',
  description: '',
  final_passing_score: 70,
  is_active: true,
  auto_assign: true,
  stages: [],
})

const form = ref(defaultForm())

const totalWeight = computed(() =>
  form.value.stages.reduce((s, st) => s + (st.weight || 0), 0)
)

async function loadTemplates() {
  loading.value = true
  try {
    templates.value = await journeyApi.templateList({ include_inactive: true })
  } finally {
    loading.value = false
  }
}

function openCreateModal() {
  editingId.value = null
  form.value = defaultForm()
  showModal.value = true
}

async function openEdit(t) {
  editingId.value = t.id
  const detail = await journeyApi.templateDetail(t.id)
  form.value = {
    name: detail.name,
    description: detail.description,
    final_passing_score: detail.final_passing_score,
    is_active: detail.is_active,
    auto_assign: detail.auto_assign,
    stages: (detail.stages || []).map(s => ({
      ...s,
      course_id: s.course_id || null,
      quiz_program_id: s.quiz_program_id || null,
      practical_criteria_text: (s.practical_criteria || []).join('\n'),
    })),
  }
  showModal.value = true
}

function closeModal() {
  showModal.value = false
}

function addStage() {
  form.value.stages.push({
    name: '',
    stage_type: 'lms_course',
    weight: 0,
    passing_score: 70,
    is_blocking: false,
    duration_days: 7,
    practical_criteria_text: '',
    sequence: (form.value.stages.length + 1) * 10,
  })
}

function removeStage(idx) {
  form.value.stages.splice(idx, 1)
}

async function saveTemplate() {
  if (!form.value.name) return
  saving.value = true
  try {
    const stages = form.value.stages.map((s, i) => ({
      sequence: (i + 1) * 10,
      name: s.name,
      stage_type: s.stage_type,
      course_id: s.course_id || null,
      quiz_program_id: s.quiz_program_id || null,
      practical_criteria: s.practical_criteria_text
        ? s.practical_criteria_text.split('\n').map(l => l.trim()).filter(Boolean)
        : [],
      weight: s.weight || 0,
      passing_score: s.passing_score || 70,
      is_blocking: s.is_blocking || false,
      duration_days: s.duration_days || 7,
    }))
    const payload = {
      name: form.value.name,
      description: form.value.description,
      final_passing_score: form.value.final_passing_score,
      is_active: form.value.is_active,
      auto_assign: form.value.auto_assign,
      stages,
    }
    if (editingId.value) {
      await journeyApi.templateUpdate(editingId.value, payload)
    } else {
      await journeyApi.templateCreate(payload)
    }
    closeModal()
    await loadTemplates()
  } catch (e) {
    alert(e.message)
  } finally {
    saving.value = false
  }
}

async function confirmDelete(t) {
  if (!confirm(`Hapus template "${t.name}"?`)) return
  try {
    await journeyApi.templateDelete(t.id)
    await loadTemplates()
  } catch (e) {
    alert(e.message)
  }
}

onMounted(async () => {
  await loadTemplates()
  try {
    const [courses, quizzes] = await Promise.all([
      journeyApi.courseList(),
      journeyApi.quizProgramList(),
    ])
    allCourses.value = Array.isArray(courses) ? courses : []
    allQuizPrograms.value = Array.isArray(quizzes) ? quizzes : []
  } catch { /* non-critical */ }
})
</script>

<style scoped>
.btn-primary {
  @apply px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50;
}
.btn-secondary {
  @apply px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors;
}
.form-label {
  @apply block text-sm font-medium text-gray-700 mb-1;
}
.form-input {
  @apply w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent;
}
</style>
