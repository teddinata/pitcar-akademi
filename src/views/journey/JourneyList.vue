<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Training Journey</h1>
        <p class="text-sm text-gray-500 mt-1">Kelola journey pembinaan karyawan</p>
      </div>
      <div class="flex gap-2">
        <button @click="$router.push('/dashboard/journey/templates')"
          class="btn-secondary flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
          </svg>
          Template
        </button>
        <button @click="openCreateModal" class="btn-primary flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          Assign Journey
        </button>
      </div>
    </div>

    <!-- Stats bar -->
    <div class="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
      <div v-for="s in stats" :key="s.label"
        class="bg-white rounded-xl border border-gray-200 px-4 py-3 text-center">
        <div class="text-2xl font-bold" :class="s.color">{{ s.value }}</div>
        <div class="text-xs text-gray-500 mt-0.5">{{ s.label }}</div>
      </div>
    </div>

    <!-- Filters -->
    <div class="flex flex-wrap gap-3 mb-4">
      <select v-model="filter.state" class="filter-select" @change="load">
        <option value="">Semua Status</option>
        <option value="draft">Draft</option>
        <option value="in_progress">Berjalan</option>
        <option value="passed">Lulus</option>
        <option value="failed">Tidak Lulus</option>
        <option value="cancelled">Dibatalkan</option>
      </select>
      <input v-model="filter.search" @input="debouncedLoad" type="text"
        placeholder="Cari karyawan..." class="filter-input"/>
      <span class="text-xs text-gray-400 self-center ml-1">
        Klik baris untuk lihat timeline tahapan
      </span>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div v-if="loading" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
      <div v-else-if="!journeys.length" class="text-center py-12 text-gray-400">
        Tidak ada journey ditemukan
      </div>

      <table v-else class="w-full text-sm">
        <thead class="bg-gray-50 text-xs uppercase text-gray-500 font-semibold">
          <tr>
            <th class="px-4 py-3 text-left w-6"></th>
            <th class="px-4 py-3 text-left">Karyawan</th>
            <th class="px-4 py-3 text-left">Template</th>
            <th class="px-4 py-3 text-left">Status</th>
            <th class="px-4 py-3 text-left">Mulai</th>
            <th class="px-4 py-3 text-center">Nilai</th>
            <th class="px-4 py-3 text-left">Rekomendasi</th>
            <th class="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          <template v-for="j in journeys" :key="j.id">

            <!-- ── Main row ── -->
            <tr class="border-t border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
              :class="expandedIds[j.id] ? 'bg-blue-50/40' : ''"
              @click="toggleExpand(j.id)">

              <!-- Expand chevron -->
              <td class="pl-4 pr-1 py-3">
                <svg class="w-4 h-4 text-gray-400 transition-transform duration-200"
                  :class="expandedIds[j.id] ? 'rotate-90 text-blue-500' : ''"
                  fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                </svg>
              </td>

              <td class="px-4 py-3">
                <div class="font-medium text-gray-900">{{ j.employee_name }}</div>
                <div v-if="j.employee_job" class="text-xs text-gray-400">{{ j.employee_job }}</div>
              </td>
              <td class="px-4 py-3 text-gray-600">{{ j.template_name }}</td>
              <td class="px-4 py-3">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  :class="stateClass(j.state)">
                  {{ stateLabel(j.state) }}
                </span>
              </td>
              <td class="px-4 py-3 text-gray-500">{{ j.start_date || '—' }}</td>
              <td class="px-4 py-3 text-center">
                <span v-if="j.final_score > 0" class="font-semibold"
                  :class="j.state === 'passed' ? 'text-green-600' : j.state === 'failed' ? 'text-red-600' : 'text-gray-700'">
                  {{ j.final_score.toFixed(1) }}%
                </span>
                <span v-else class="text-gray-300">—</span>
              </td>
              <td class="px-4 py-3">
                <span v-if="j.recommendation" class="text-xs"
                  :class="recClass(j.recommendation)">
                  {{ recLabel(j.recommendation) }}
                </span>
              </td>
              <td class="px-4 py-3 text-right" @click.stop>
                <button @click="$router.push(`/dashboard/journey/${j.id}`)"
                  class="text-xs px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium">
                  Detail
                </button>
              </td>
            </tr>

            <!-- ── Expanded timeline row ── -->
            <tr v-if="expandedIds[j.id]" class="border-t-0">
              <td colspan="8" class="px-4 pb-4 pt-0 bg-blue-50/30">

                <!-- Loading stages -->
                <div v-if="stageLoading[j.id]" class="flex items-center gap-2 py-3 pl-6">
                  <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                  <span class="text-xs text-gray-400">Memuat tahapan...</span>
                </div>

                <!-- Stage mini-timeline -->
                <div v-else-if="stageCache[j.id]" class="pl-6 pt-2">

                  <!-- Progress bar summary -->
                  <div class="flex items-center gap-2 mb-3">
                    <div class="flex gap-0.5 flex-1 h-1.5">
                      <div v-for="s in stageCache[j.id]" :key="s.id"
                        class="flex-1 rounded-full transition-all"
                        :class="s.state === 'completed' ? 'bg-green-400'
                              : s.state === 'in_progress' ? 'bg-blue-400 animate-pulse'
                              : 'bg-gray-200'">
                      </div>
                    </div>
                    <span class="text-[10px] text-gray-400 shrink-0">
                      {{ stageCache[j.id].filter(s => s.state === 'completed').length }}/{{ stageCache[j.id].length }} selesai
                    </span>
                  </div>

                  <!-- Stage pills -->
                  <div class="flex flex-wrap gap-2">
                    <div v-for="(s, idx) in stageCache[j.id]" :key="s.id"
                      class="flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-medium transition-all"
                      :class="stagePillBg(s.state)">

                      <!-- State dot -->
                      <span class="w-2 h-2 rounded-full shrink-0 transition-all"
                        :class="s.state === 'completed' ? 'bg-green-500'
                               : s.state === 'in_progress' ? 'bg-blue-500 animate-pulse'
                               : s.state === 'skipped' ? 'bg-gray-300'
                               : 'bg-gray-300'">
                      </span>

                      <!-- Icon + name -->
                      <span>{{ stageIcon(s.stage_type) }}</span>
                      <span :class="s.state === 'pending' ? 'text-gray-400' : ''">
                        {{ s.stage_name }}
                      </span>

                      <!-- Score badge -->
                      <span v-if="s.score > 0"
                        class="ml-0.5 px-1.5 py-0.5 rounded-lg text-[10px] font-bold"
                        :class="s.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'">
                        {{ s.score.toFixed(0) }}%
                      </span>

                      <!-- In-progress tag -->
                      <span v-else-if="s.state === 'in_progress'"
                        class="ml-0.5 px-1.5 py-0.5 rounded-lg text-[10px] bg-blue-100 text-blue-600">
                        Berjalan
                      </span>

                      <!-- Arrow connector (except last) -->
                      <span v-if="idx < stageCache[j.id].length - 1" class="ml-1 text-gray-300">›</span>
                    </div>
                  </div>

                  <!-- Notes if any -->
                  <p v-if="j.notes" class="text-[11px] text-gray-400 italic mt-2 pl-1">
                    "{{ j.notes }}"
                  </p>
                </div>

              </td>
            </tr>

          </template>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="total > limit" class="flex justify-center gap-2 mt-4">
      <button :disabled="offset === 0" @click="prevPage" class="btn-secondary px-3 py-1 text-xs disabled:opacity-40">
        ← Prev
      </button>
      <span class="text-sm text-gray-500 py-1">
        {{ offset + 1 }}–{{ Math.min(offset + limit, total) }} dari {{ total }}
      </span>
      <button :disabled="offset + limit >= total" @click="nextPage" class="btn-secondary px-3 py-1 text-xs disabled:opacity-40">
        Next →
      </button>
    </div>

    <!-- Create Journey Modal -->
    <Teleport to="body">
      <div v-if="showCreateModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
        <div class="bg-white rounded-2xl w-full max-w-md shadow-xl">
          <div class="flex items-center justify-between px-6 py-4 border-b">
            <h2 class="text-lg font-semibold">Assign Journey</h2>
            <button @click="showCreateModal = false; clearEmp()" class="p-1.5 rounded hover:bg-gray-100 text-gray-400">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <div class="p-6 space-y-4">
            <!-- Employee searchable picker -->
            <div>
              <label class="form-label">Karyawan <span class="text-red-500">*</span></label>
              <div class="relative">
                <div v-if="empDropdownOpen" class="fixed inset-0 z-20" @click="empDropdownOpen = false"></div>
                <div class="relative z-30">
                  <div class="relative">
                    <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                      :class="createForm.employee_id ? 'text-emerald-500' : 'text-gray-400'"
                      fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                    </svg>
                    <input
                      v-model="empSearch"
                      type="text"
                      class="w-full pl-9 pr-9 py-2.5 text-sm border-2 rounded-xl transition-all focus:outline-none"
                      :class="createForm.employee_id
                        ? 'border-emerald-400 bg-emerald-50 text-emerald-800 focus:ring-2 focus:ring-emerald-300'
                        : 'border-gray-200 bg-white focus:border-red-400 focus:ring-2 focus:ring-red-100'"
                      placeholder="Ketik nama karyawan..."
                      autocomplete="off"
                      @input="onEmpSearch"
                      @focus="empSearch.length >= 2 && (empDropdownOpen = true)"
                    />
                    <div v-if="empSearching"
                      class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-gray-300 border-t-red-500 rounded-full animate-spin">
                    </div>
                    <button v-else-if="createForm.employee_id" type="button"
                      class="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-gray-200 hover:bg-red-100 hover:text-red-500 text-gray-400 flex items-center justify-center transition-colors"
                      @click="clearEmp">
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/>
                      </svg>
                    </button>
                  </div>
                  <div v-if="createForm.employee_id && selectedEmpName"
                    class="mt-2 flex items-center gap-3 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <div class="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {{ selectedEmpName.charAt(0).toUpperCase() }}
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-semibold text-emerald-800 truncate">{{ selectedEmpName }}</p>
                      <p v-if="selectedEmpJob" class="text-xs text-emerald-600 truncate">{{ selectedEmpJob }}</p>
                    </div>
                    <svg class="w-4 h-4 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                    </svg>
                  </div>
                  <p v-else-if="!empDropdownOpen" class="mt-1 text-xs text-gray-400">Ketik minimal 2 huruf untuk mencari</p>
                  <div v-if="empDropdownOpen && empResults.length"
                    class="absolute top-full left-0 right-0 mt-1.5 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden z-40"
                    style="max-height: 220px; overflow-y: auto;">
                    <div class="px-3 py-2 border-b border-gray-100 bg-gray-50">
                      <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        {{ empResults.length }} karyawan ditemukan
                      </p>
                    </div>
                    <button v-for="emp in empResults" :key="emp.id" type="button"
                      @click="selectEmp(emp)"
                      class="w-full px-3 py-2.5 text-left hover:bg-red-50 flex items-center gap-3 transition-colors group">
                      <div class="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                        :style="`background: hsl(${emp.id * 47 % 360}, 55%, 55%)`">
                        {{ emp.name.charAt(0).toUpperCase() }}
                      </div>
                      <div class="flex-1 min-w-0">
                        <p class="text-sm font-medium text-gray-800 group-hover:text-red-700 truncate">{{ emp.name }}</p>
                        <p class="text-xs text-gray-400 truncate">
                          <span v-if="emp.position?.name">{{ emp.position.name }}</span>
                          <span v-if="emp.position?.name && emp.department?.name" class="mx-1">·</span>
                          <span v-if="emp.department?.name">{{ emp.department.name }}</span>
                        </p>
                      </div>
                    </button>
                  </div>
                  <div v-if="empDropdownOpen && empSearch.length >= 2 && !empResults.length && !empSearching"
                    class="absolute top-full left-0 right-0 mt-1.5 bg-white border border-gray-200 rounded-2xl shadow-xl p-5 text-center z-40">
                    <p class="text-sm font-medium text-gray-500">Karyawan tidak ditemukan</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label class="form-label">Template <span class="text-red-500">*</span></label>
              <select v-model.number="createForm.template_id" class="form-input">
                <option value="">Pilih template...</option>
                <option v-for="t in allTemplates" :key="t.id" :value="t.id">{{ t.name }}</option>
              </select>
            </div>
            <div>
              <label class="form-label">Target Selesai</label>
              <input v-model="createForm.target_end_date" type="date" class="form-input"/>
            </div>
            <div>
              <label class="form-label">Catatan</label>
              <textarea v-model="createForm.notes" rows="2" class="form-input"></textarea>
            </div>
          </div>
          <div class="flex justify-end gap-3 px-6 py-4 border-t">
            <button @click="showCreateModal = false; clearEmp()" class="btn-secondary">Batal</button>
            <button @click="createJourney" :disabled="creating || !createForm.employee_id || !createForm.template_id"
              class="btn-primary min-w-[100px]">
              <span v-if="creating">Menyimpan...</span>
              <span v-else>Assign</span>
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
import { employeeApi } from '@/services/employeeApi'

const journeys = ref([])
const total = ref(0)
const loading = ref(false)
const limit = 20
const offset = ref(0)
const allTemplates = ref([])
const showCreateModal = ref(false)
const creating = ref(false)

const filter = ref({ state: '', search: '' })
const createForm = ref({ employee_id: null, template_id: '', target_end_date: '', notes: '' })

// ── Inline timeline state ──────────────────────────────────────
const expandedIds = ref({})    // journeyId → true (multi-expand)
const stageCache = ref({})     // journeyId → stages[]
const stageLoading = ref({})   // journeyId → boolean

async function toggleExpand(id) {
  const next = { ...expandedIds.value }
  if (next[id]) {
    delete next[id]
    expandedIds.value = next
    return
  }
  next[id] = true
  expandedIds.value = next
  if (stageCache.value[id]) return   // already cached

  stageLoading.value = { ...stageLoading.value, [id]: true }
  try {
    const detail = await journeyApi.detail(id)
    const stages = (detail.stages || []).slice().sort((a, b) => a.sequence - b.sequence)
    stageCache.value = { ...stageCache.value, [id]: stages }
  } catch {
    stageCache.value = { ...stageCache.value, [id]: [] }
  } finally {
    stageLoading.value = { ...stageLoading.value, [id]: false }
  }
}

function stagePillBg(state) {
  return {
    completed:   'border-green-200 bg-green-50 text-green-800',
    in_progress: 'border-blue-200 bg-blue-50 text-blue-800',
    pending:     'border-gray-200 bg-white text-gray-500',
    skipped:     'border-gray-100 bg-gray-50 text-gray-400',
  }[state] || 'border-gray-200 bg-white text-gray-500'
}

function stageIcon(t) {
  return { orientation: '🎯', lms_course: '📚', sop_quiz: '📝', practical: '🔧', final: '🏆' }[t] || '⚙️'
}

// ── Employee search ────────────────────────────────────────────
const empSearch = ref('')
const empResults = ref([])
const empDropdownOpen = ref(false)
const empSearching = ref(false)
const selectedEmpName = ref('')
const selectedEmpJob = ref('')

let empDebounce = null
function onEmpSearch() {
  createForm.value.employee_id = null
  selectedEmpName.value = ''
  selectedEmpJob.value = ''
  clearTimeout(empDebounce)
  if (empSearch.value.length < 2) { empResults.value = []; empDropdownOpen.value = false; return }
  empDebounce = setTimeout(async () => {
    empSearching.value = true
    empDropdownOpen.value = true
    try {
      const res = await employeeApi.list({ search: empSearch.value, limit: 8 })
      empResults.value = res?.rows || res?.employees || []
    } catch { empResults.value = [] } finally { empSearching.value = false }
  }, 300)
}

function selectEmp(emp) {
  createForm.value.employee_id = emp.id
  selectedEmpName.value = emp.name
  selectedEmpJob.value = emp.position?.name || emp.department?.name || ''
  empSearch.value = emp.name
  empDropdownOpen.value = false
}

function clearEmp() {
  createForm.value.employee_id = null
  selectedEmpName.value = ''
  selectedEmpJob.value = ''
  empSearch.value = ''
  empResults.value = []
}

// ── Load / pagination ──────────────────────────────────────────
let searchTimer = null
function debouncedLoad() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => { offset.value = 0; load() }, 400)
}

const stats = computed(() => [
  { label: 'Total',       value: total.value,                                                     color: 'text-gray-800' },
  { label: 'Draft',       value: journeys.value.filter(j => j.state === 'draft').length,          color: 'text-gray-500' },
  { label: 'Berjalan',    value: journeys.value.filter(j => j.state === 'in_progress').length,    color: 'text-blue-600' },
  { label: 'Lulus',       value: journeys.value.filter(j => j.state === 'passed').length,         color: 'text-green-600' },
  { label: 'Tidak Lulus', value: journeys.value.filter(j => j.state === 'failed').length,         color: 'text-red-600' },
])

async function load() {
  loading.value = true
  // Reset expanded state on reload
  expandedIds.value = {}
  stageCache.value = {}
  try {
    const params = { limit, offset: offset.value }
    if (filter.value.state) params.state = filter.value.state
    const res = await journeyApi.list(params)
    journeys.value = res.journeys || []
    total.value = res.total || 0
  } finally {
    loading.value = false
  }
}

async function createJourney() {
  creating.value = true
  try {
    await journeyApi.create(createForm.value)
    showCreateModal.value = false
    createForm.value = { employee_id: null, template_id: '', target_end_date: '', notes: '' }
    clearEmp()
    await load()
  } catch (e) {
    alert(e.message)
  } finally {
    creating.value = false
  }
}

function openCreateModal() {
  createForm.value = { employee_id: null, template_id: '', target_end_date: '', notes: '' }
  clearEmp()
  showCreateModal.value = true
}

function prevPage() { offset.value = Math.max(0, offset.value - limit); load() }
function nextPage() { offset.value += limit; load() }

// ── Style helpers ──────────────────────────────────────────────
function stateLabel(s) {
  return { draft: 'Draft', in_progress: 'Berjalan', completed: 'Selesai', passed: 'Lulus', failed: 'Tidak Lulus', cancelled: 'Dibatalkan' }[s] || s
}
function stateClass(s) {
  return {
    draft:       'bg-gray-100 text-gray-600',
    in_progress: 'bg-blue-100 text-blue-700',
    completed:   'bg-yellow-100 text-yellow-700',
    passed:      'bg-green-100 text-green-700',
    failed:      'bg-red-100 text-red-700',
    cancelled:   'bg-gray-100 text-gray-400',
  }[s] || 'bg-gray-100 text-gray-500'
}
function recLabel(r) {
  return { promote: '✓ Promosi', extend_training: '↺ Perpanjang', remedial: '✗ Remedial' }[r] || r
}
function recClass(r) {
  return { promote: 'text-green-600 font-medium', extend_training: 'text-yellow-600', remedial: 'text-red-600' }[r] || ''
}

onMounted(async () => {
  await load()
  allTemplates.value = await journeyApi.templateList()
})
</script>

<style scoped>
.btn-primary    { @apply px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50; }
.btn-secondary  { @apply px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors; }
.form-label     { @apply block text-sm font-medium text-gray-700 mb-1; }
.form-input     { @apply w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent; }
.filter-select  { @apply border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white; }
.filter-input   { @apply border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white min-w-[200px]; }
</style>
