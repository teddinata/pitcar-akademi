<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
    <!-- Top bar -->
    <div class="glass-header sticky top-0 z-20">
      <div class="max-w-5xl mx-auto px-4 sm:px-6 py-4">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div class="flex items-start gap-3 sm:gap-4">
            <button
              @click="router.push('/dashboard/quiz/program')"
              class="p-2 rounded-xl text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-all shrink-0"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div class="min-w-0">
              <h1 class="text-lg sm:text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent truncate">
                {{ isEdit ? 'Edit Quiz Program' : 'Buat Quiz Program Baru' }}
              </h1>
              <div class="flex flex-wrap items-center gap-2 mt-1">
                <span v-if="program?.code" class="text-xs font-mono text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                  {{ program.code }}
                </span>
                <span
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
                  :class="stateCls(program?.state || 'draft')"
                >
                  {{ stateLabel(program?.state || 'draft') }}
                </span>
              </div>
            </div>
          </div>
          <div class="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              v-if="canEdit"
              @click="saveProgram"
              :disabled="saving"
              class="flex-1 sm:flex-none justify-center px-5 py-2.5 text-sm font-semibold bg-gradient-to-r from-[#B70000] to-[#950000] text-white rounded-xl hover:from-[#950000] hover:to-[#7a0000] transition-all disabled:opacity-50 shadow-sm hover:shadow-md min-h-[40px] flex items-center"
            >
              {{ saving ? 'Menyimpan...' : (isEdit ? 'Update' : 'Simpan Program') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Error -->
    <div v-if="error" class="max-w-5xl mx-auto px-6 mt-4">
      <div class="px-4 py-3 bg-red-50 border-l-4 border-red-500 rounded-r-xl flex items-start gap-3">
        <svg class="w-5 h-5 text-red-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div class="flex-1">
          <p class="text-sm font-semibold text-red-800">Error</p>
          <p class="text-sm text-red-700 mt-0.5">{{ error }}</p>
        </div>
        <button @click="error = ''" class="text-red-400 hover:text-red-600">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
      <p class="text-sm text-gray-500 mt-4">Memuat data...</p>
    </div>

    <!-- Form -->
    <div v-else class="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div class="clay-card overflow-hidden">
        <div class="px-4 sm:px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div>
              <h2 class="font-bold text-gray-900">Informasi Program</h2>
              <p class="text-xs text-gray-500">Detail program assessment</p>
            </div>
          </div>
        </div>

        <div class="p-4 sm:p-6 space-y-6">
          <!-- Nama Program -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              Nama Program <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.name"
              type="text"
              placeholder="e.g. Assessment March 2026"
              :disabled="!canEdit"
              class="w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 min-h-[44px]"
            />
          </div>

          <!-- Description -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              Deskripsi <span class="text-gray-400 text-xs">(opsional)</span>
            </label>
            <textarea
              v-model="form.description"
              rows="3"
              placeholder="Deskripsi singkat tentang program assessment ini..."
              :disabled="!canEdit"
              class="w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
            ></textarea>
          </div>

          <!-- Period Type -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              Tipe Periode <span class="text-red-500">*</span>
            </label>
            <select
              v-model="form.period_type"
              @change="handlePeriodTypeChange"
              :disabled="!canEdit"
              class="w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 min-h-[44px]"
            >
              <option value="">Pilih tipe periode</option>
              <option value="monthly">Bulanan (Monthly)</option>
              <option value="quarterly">Kuartalan (Quarterly)</option>
              <option value="yearly">Tahunan (Yearly)</option>
              <option value="onetime">Satu Kali (One Time)</option>
            </select>
          </div>

          <!-- Period -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              Periode <span class="text-red-500">*</span>
            </label>

            <!-- Monthly -->
            <input
              v-if="form.period_type === 'monthly'"
              v-model="form.period"
              type="month"
              :disabled="!canEdit"
              class="w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 min-h-[44px]"
            />

            <!-- Quarterly -->
            <div v-else-if="form.period_type === 'quarterly'" class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                v-model="quarterYear"
                type="number"
                placeholder="2026"
                min="2020"
                max="2099"
                :disabled="!canEdit"
                class="px-4 py-3 text-sm border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 min-h-[44px]"
              />
              <select
                v-model="quarterNumber"
                :disabled="!canEdit"
                class="px-4 py-3 text-sm border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 min-h-[44px]"
              >
                <option value="">Pilih kuartal</option>
                <option value="Q1">Q1 (Jan-Mar)</option>
                <option value="Q2">Q2 (Apr-Jun)</option>
                <option value="Q3">Q3 (Jul-Sep)</option>
                <option value="Q4">Q4 (Okt-Des)</option>
              </select>
            </div>

            <!-- Yearly -->
            <input
              v-else-if="form.period_type === 'yearly'"
              v-model="form.period"
              type="number"
              placeholder="2026"
              min="2020"
              max="2099"
              :disabled="!canEdit"
              class="w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 min-h-[44px]"
            />

            <!-- One Time -->
            <input
              v-else-if="form.period_type === 'onetime'"
              v-model="form.period"
              type="text"
              placeholder="ONETIME-2026"
              :disabled="!canEdit"
              class="w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 min-h-[44px]"
            />

            <!-- Default - belum pilih -->
            <input
              v-else
              type="text"
              placeholder="Pilih tipe periode terlebih dahulu"
              disabled
              class="w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-400 min-h-[44px]"
            />

            <p class="text-xs text-gray-400 mt-1.5">
              <span v-if="form.period_type === 'monthly'">Format: YYYY-MM</span>
              <span v-else-if="form.period_type === 'quarterly'">Format: YYYY-Q1/Q2/Q3/Q4</span>
              <span v-else-if="form.period_type === 'yearly'">Format: YYYY</span>
              <span v-else-if="form.period_type === 'onetime'">Format bebas, misal: ONETIME-2026</span>
              <span v-else>Pilih tipe periode terlebih dahulu</span>
            </p>
          </div>

          <!-- Deadline -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              Deadline <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.deadline"
              type="date"
              :disabled="!canEdit"
              class="w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 min-h-[44px]"
            />
          </div>

          <!-- Info box -->
          <div class="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div class="flex items-start gap-3">
              <svg class="w-5 h-5 text-blue-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div class="text-sm text-blue-700">
                <p class="font-semibold">Langkah selanjutnya:</p>
                <ol class="list-decimal list-inside mt-2 space-y-1 text-blue-600">
                  <li>Simpan program sebagai draft</li>
                  <li>Tambahkan quiz banks ke program ini</li>
                  <li>Submit quiz banks ke review</li>
                  <li>Aktifkan program untuk publish semua quiz banks sekaligus</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { quizApi } from '../../services/quizApi'

const router = useRouter()
const route = useRoute()

const loading = ref(false)
const saving = ref(false)
const error = ref('')
const program = ref(null)

// Quarterly helpers
const quarterYear = ref('')
const quarterNumber = ref('')

const form = ref({
  name: '',
  description: '',
  period: '',
  period_type: '',
  deadline: '',
})

const isEdit = computed(() => !!route.params.id)
const canEdit = computed(() => !program.value || program.value.state === 'draft')

// Watch quarterly changes to build period string
watch([quarterYear, quarterNumber], () => {
  if (form.value.period_type === 'quarterly' && quarterYear.value && quarterNumber.value) {
    form.value.period = `${quarterYear.value}-${quarterNumber.value}`
  }
})

async function load() {
  if (!isEdit.value) return
  loading.value = true
  error.value = ''
  try {
    const data = await quizApi.programDetail(route.params.id)
    program.value = data.program
    form.value = {
      name: program.value.name,
      description: program.value.description || '',
      period: program.value.period,
      period_type: program.value.period_type,
      deadline: program.value.deadline,
    }

    // Parse quarterly if needed
    if (program.value.period_type === 'quarterly' && program.value.period) {
      const match = program.value.period.match(/^(\d{4})-(Q[1-4])$/)
      if (match) {
        quarterYear.value = match[1]
        quarterNumber.value = match[2]
      }
    }
  } catch (e) {
    error.value = e.message || 'Gagal memuat data program'
  } finally {
    loading.value = false
  }
}

function handlePeriodTypeChange() {
  // Reset period when type changes
  form.value.period = ''
  quarterYear.value = ''
  quarterNumber.value = ''
}

async function saveProgram() {
  // Validation
  if (!form.value.name?.trim()) {
    error.value = 'Nama program wajib diisi'
    return
  }
  if (!form.value.period_type) {
    error.value = 'Tipe periode wajib dipilih'
    return
  }
  if (!form.value.period?.trim()) {
    error.value = 'Periode wajib diisi'
    return
  }

  // Validate period format based on type
  if (form.value.period_type === 'monthly') {
    if (!/^\d{4}-\d{2}$/.test(form.value.period)) {
      error.value = 'Format periode bulanan harus YYYY-MM (contoh: 2026-03)'
      return
    }
  } else if (form.value.period_type === 'quarterly') {
    if (!/^\d{4}-Q[1-4]$/.test(form.value.period)) {
      error.value = 'Format periode kuartalan harus YYYY-Q1/Q2/Q3/Q4 (contoh: 2026-Q1)'
      return
    }
  } else if (form.value.period_type === 'yearly') {
    if (!/^\d{4}$/.test(form.value.period)) {
      error.value = 'Format periode tahunan harus YYYY (contoh: 2026)'
      return
    }
  }

  if (!form.value.deadline) {
    error.value = 'Deadline wajib diisi'
    return
  }

  saving.value = true
  error.value = ''
  try {
    if (isEdit.value) {
      await quizApi.programUpdate(route.params.id, form.value)
      alert('Program berhasil diupdate!')
      await load()
    } else {
      const data = await quizApi.programCreate(form.value)
      alert('Program berhasil dibuat!')
      router.push(`/dashboard/quiz/program/${data.program.id}`)
    }
  } catch (e) {
    error.value = e.message || 'Gagal menyimpan program'
  } finally {
    saving.value = false
  }
}

function stateLabel(s) {
  return { draft: 'Draft', active: 'Aktif', closed: 'Tutup' }[s] || s
}

function stateCls(s) {
  return {
    draft: 'bg-gray-100 text-gray-600',
    active: 'bg-green-100 text-green-700',
    closed: 'bg-red-100 text-red-600',
  }[s] || 'bg-gray-100 text-gray-600'
}

onMounted(load)
</script>
