<template>
  <div class="min-h-screen clay-surface p-4 md:p-6">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Lencana</h1>
        <p class="text-sm text-gray-500 mt-1">Penghargaan dan pencapaian pembelajaran</p>
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

    <!-- My Badges -->
    <template v-else-if="activeTab === 'mine'">
      <div v-if="!items.length" class="bg-white rounded-xl p-12 text-center border border-gray-100 shadow-sm">
        <TrophyIcon class="w-16 h-16 text-gray-200 mx-auto mb-3" />
        <p class="text-gray-500 font-medium">Belum ada lencana yang diperoleh</p>
        <p class="text-xs text-gray-400 mt-1">Selesaikan kursus untuk mendapatkan lencana</p>
      </div>
      <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        <div
          v-for="b in items"
          :key="b.id"
          class="clay-card p-4 text-center hover:shadow-md transition-shadow"
        >
          <div class="w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center text-2xl shadow-inner"
            :class="badgeBg(b.badge_type)">
            {{ badgeEmoji(b.badge_type) }}
          </div>
          <p class="font-semibold text-gray-800 text-sm">{{ b.name }}</p>
          <p class="text-xs text-gray-400 mt-1">{{ b.awarded_date }}</p>
          <p v-if="b.course_name" class="text-xs text-blue-500 mt-0.5">{{ b.course_name }}</p>
        </div>
      </div>
    </template>

    <!-- All Badges catalog -->
    <template v-else-if="activeTab === 'all'">
      <div v-if="!items.length" class="bg-white rounded-xl p-12 text-center border border-gray-100 shadow-sm">
        <TrophyIcon class="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p class="text-gray-500 font-medium">Tidak ada lencana tersedia</p>
      </div>
      <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        <div
          v-for="b in items"
          :key="b.id"
          class="clay-card p-4 text-center hover:shadow-md transition-shadow"
        >
          <div class="w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center text-2xl shadow-inner"
            :class="badgeBg(b.badge_type)">
            {{ badgeEmoji(b.badge_type) }}
          </div>
          <p class="font-semibold text-gray-800 text-sm">{{ b.name }}</p>
          <p class="text-xs text-gray-400 mt-1">{{ stripHtml(b.description) }}</p>
          <p class="text-xs text-gray-500 mt-1">{{ b.awarded_count }} diperoleh</p>
          <button
            v-if="authStore.user?.is_admin"
            @click="openAwardModal(b)"
            class="mt-3 w-full py-1 text-xs border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
          >
            Berikan
          </button>
        </div>
      </div>
    </template>

    <!-- Leaderboard -->
    <template v-else-if="activeTab === 'leaderboard'">
      <div v-if="!items.length" class="bg-white rounded-xl p-12 text-center border border-gray-100 shadow-sm">
        <p class="text-gray-500 font-medium">Belum ada data leaderboard</p>
      </div>
      <div v-else class="clay-card overflow-hidden">
        <div class="divide-y divide-gray-50">
          <div
            v-for="(entry, i) in items"
            :key="entry.user_id"
            class="px-5 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors"
          >
            <div class="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
              :class="i === 0 ? 'bg-yellow-400 text-white' : i === 1 ? 'bg-gray-300 text-gray-700' : i === 2 ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-500'"
            >
              {{ i + 1 }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-semibold text-gray-800 text-sm truncate">{{ entry.name }}</p>
              <p class="text-xs text-gray-400">{{ entry.department }}</p>
            </div>
            <div class="text-right shrink-0">
              <p class="font-bold text-yellow-600">{{ entry.total_badges }}</p>
              <p class="text-xs text-gray-400">lencana</p>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Admin: Kelola Lencana -->
    <template v-else-if="activeTab === 'manage'">
      <div class="flex items-center justify-between mb-4">
        <p class="text-sm text-gray-500">{{ items.length }} lencana terdaftar</p>
        <button
          @click="openCreateBadgeModal"
          class="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white text-sm font-semibold rounded-lg hover:bg-yellow-600 transition-colors"
        >
          <PlusIcon class="w-4 h-4" />
          Buat Lencana
        </button>
      </div>

      <div v-if="!items.length" class="bg-white rounded-xl p-12 text-center border border-gray-100 shadow-sm">
        <TrophyIcon class="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p class="text-gray-500 font-medium">Belum ada lencana</p>
        <button @click="openCreateBadgeModal" class="mt-3 px-4 py-2 bg-yellow-500 text-white text-sm font-semibold rounded-lg hover:bg-yellow-600">Buat Pertama</button>
      </div>
      <div v-else class="clay-card overflow-hidden">
        <div class="divide-y divide-gray-50">
          <div
            v-for="b in items"
            :key="b.id"
            class="px-5 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors"
          >
            <div class="w-10 h-10 rounded-full flex items-center justify-center text-xl shrink-0"
              :class="badgeBg(b.badge_type)">
              {{ badgeEmoji(b.badge_type) }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-semibold text-gray-800 text-sm">{{ b.name }}</p>
              <p class="text-xs text-gray-400 mt-0.5">{{ badgeTypeLabel(b.badge_type) }} · Kode: {{ b.code }}</p>
              <div class="flex items-center gap-3 mt-1 text-xs text-gray-400">
                <span v-if="b.courses_required">≥{{ b.courses_required }} kursus</span>
                <span v-if="b.points_required">≥{{ b.points_required }} poin</span>
                <span v-if="b.min_score_required">≥{{ b.min_score_required }}% skor</span>
                <span class="text-yellow-600 font-medium">+{{ b.points_awarded }} poin</span>
              </div>
            </div>
            <div class="shrink-0 text-right">
              <p class="text-sm font-bold text-gray-700">{{ b.awarded_count }}</p>
              <p class="text-xs text-gray-400">diraih</p>
            </div>
            <div class="flex items-center gap-2 shrink-0">
              <button @click="openEditBadgeModal(b)" class="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition-colors">
                <PencilIcon class="w-4 h-4" />
              </button>
              <button @click="confirmDeleteBadge(b)" class="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition-colors">
                <TrashIcon class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Award Modal (admin) -->
    <Teleport to="body">
      <div v-if="awardTarget" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" @click.self="awardTarget = null">
        <div class="clay-card w-full max-w-sm">
          <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 class="font-bold text-gray-900">Berikan Lencana</h2>
            <button @click="awardTarget = null"><XMarkIcon class="w-5 h-5 text-gray-400" /></button>
          </div>
          <div class="p-6 space-y-4">
            <div v-if="awardError" class="bg-red-50 border border-red-200 rounded-lg p-3 text-red-600 text-sm">{{ awardError }}</div>
            <p class="text-sm text-gray-600">Berikan lencana <strong>{{ awardTarget.name }}</strong> kepada:</p>
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1">Karyawan *</label>
              <EmployeePicker v-model:userId="awardUserId" placeholder="Cari nama karyawan..." />
            </div>
          </div>
          <div class="px-6 py-4 border-t border-gray-100 flex gap-3 justify-end">
            <button @click="awardTarget = null" class="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">Batal</button>
            <button @click="doAward" :disabled="awarding" class="px-5 py-2 text-sm font-semibold text-white bg-yellow-500 rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50">
              {{ awarding ? 'Memberikan...' : 'Berikan' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Badge Create/Edit Modal -->
    <Teleport to="body">
      <div v-if="badgeForm.open" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" @click.self="badgeForm.open = false">
        <div class="clay-card w-full max-w-md max-h-[90vh] overflow-y-auto">
          <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
            <h2 class="font-bold text-gray-900">{{ badgeForm.id ? 'Edit Lencana' : 'Buat Lencana Baru' }}</h2>
            <button @click="badgeForm.open = false"><XMarkIcon class="w-5 h-5 text-gray-400" /></button>
          </div>
          <div class="p-6 space-y-4">
            <div v-if="badgeForm.error" class="bg-red-50 border border-red-200 rounded-lg p-3 text-red-600 text-sm">{{ badgeForm.error }}</div>

            <div class="grid grid-cols-2 gap-4">
              <div class="col-span-2">
                <label class="block text-xs font-semibold text-gray-600 mb-1">Nama Lencana *</label>
                <input v-model="badgeForm.name" type="text" placeholder="Contoh: Pejuang Servis" class="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-300" />
              </div>
              <div>
                <label class="block text-xs font-semibold text-gray-600 mb-1">Kode Unik *</label>
                <input v-model="badgeForm.code" type="text" placeholder="BADGE_001" :disabled="!!badgeForm.id" class="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-300 disabled:bg-gray-50 disabled:text-gray-400" />
              </div>
              <div>
                <label class="block text-xs font-semibold text-gray-600 mb-1">Tipe</label>
                <select v-model="badgeForm.badge_type" class="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-300">
                  <option v-for="t in badgeTypes" :key="t.value" :value="t.value">{{ t.label }}</option>
                </select>
              </div>
              <div class="col-span-2">
                <label class="block text-xs font-semibold text-gray-600 mb-1">Deskripsi</label>
                <textarea v-model="badgeForm.description" rows="2" placeholder="Penjelasan singkat lencana ini..." class="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-300 resize-none"></textarea>
              </div>
            </div>

            <p class="text-xs font-bold text-gray-500 uppercase tracking-wide pt-1">Syarat Mendapat Lencana</p>
            <div class="grid grid-cols-3 gap-3">
              <div>
                <label class="block text-xs font-semibold text-gray-600 mb-1">Kursus Selesai</label>
                <input v-model.number="badgeForm.courses_required" type="number" min="0" class="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-300" />
              </div>
              <div>
                <label class="block text-xs font-semibold text-gray-600 mb-1">Min. Poin</label>
                <input v-model.number="badgeForm.points_required" type="number" min="0" class="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-300" />
              </div>
              <div>
                <label class="block text-xs font-semibold text-gray-600 mb-1">Min. Skor (%)</label>
                <input v-model.number="badgeForm.min_score_required" type="number" min="0" max="100" class="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-300" />
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1">Poin Diberikan saat Dapat Lencana</label>
              <input v-model.number="badgeForm.points_awarded" type="number" min="0" class="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-300" />
            </div>
          </div>
          <div class="px-6 py-4 border-t border-gray-100 flex gap-3 justify-end sticky bottom-0 bg-white">
            <button @click="badgeForm.open = false" class="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">Batal</button>
            <button @click="saveBadge" :disabled="badgeForm.saving" class="px-5 py-2 text-sm font-semibold text-white bg-yellow-500 rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50">
              {{ badgeForm.saving ? 'Menyimpan...' : (badgeForm.id ? 'Simpan' : 'Buat') }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <div v-if="toast" class="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm px-5 py-2.5 rounded-full shadow-lg z-50">{{ toast }}</div>
  </div>
</template>

<script setup>
import { ref, computed, defineComponent, h, watch, onMounted } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { lmsApi } from '../../services/lmsApi'
import { TrophyIcon, XMarkIcon, PlusIcon, PencilIcon, TrashIcon } from '@heroicons/vue/24/outline'

// ── Inline EmployeePicker ─────────────────────────────────────────────
const EmployeePicker = defineComponent({
  name: 'EmployeePicker',
  props: {
    userId: { type: Number, default: null },
    placeholder: { type: String, default: 'Cari nama karyawan...' },
  },
  emits: ['update:userId'],
  setup(props, { emit }) {
    const query = ref('')
    const suggestions = ref([])
    let debTimer = null
    watch(() => props.userId, (val) => { if (!val) query.value = '' })
    async function onInput() {
      emit('update:userId', null)
      clearTimeout(debTimer)
      if (!query.value || query.value.length < 2) { suggestions.value = []; return }
      debTimer = setTimeout(async () => {
        try {
          const res = await lmsApi.employeeSearch({ search: query.value, limit: 8 })
          suggestions.value = res?.employees || []
        } catch { suggestions.value = [] }
      }, 300)
    }
    function select(emp) {
      query.value = emp.name; suggestions.value = []
      emit('update:userId', emp.user_id)
    }
    return () => h('div', { class: 'relative' }, [
      h('input', {
        value: query.value,
        onInput: (e) => { query.value = e.target.value; onInput() },
        placeholder: props.placeholder,
        class: 'w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-300',
      }),
      suggestions.value.length
        ? h('div', { class: 'absolute z-20 top-full left-0 right-0 mt-1 bg-white rounded-xl border border-gray-200 shadow-xl max-h-48 overflow-y-auto' },
            suggestions.value.map(emp =>
              h('button', { key: emp.user_id, onClick: () => select(emp), class: 'w-full px-4 py-2.5 text-left hover:bg-yellow-50 flex items-center justify-between gap-3' }, [
                h('p', { class: 'text-sm font-medium text-gray-800' }, emp.name),
                h('p', { class: 'text-xs text-gray-400' }, emp.department),
              ])
            )
          )
        : null,
    ])
  },
})

const authStore = useAuthStore()
const loading = ref(false)
const error = ref('')
const items = ref([])
const activeTab = ref('mine')
const toast = ref('')

const awardTarget = ref(null)
const awardUserId = ref(null)
const awarding = ref(false)
const awardError = ref('')

const badgeTypes = [
  { value: 'course_completion', label: 'Penyelesaian Kursus' },
  { value: 'assessment_excellence', label: 'Keunggulan Assessment' },
  { value: 'participation', label: 'Partisipasi' },
  { value: 'competency_achievement', label: 'Pencapaian Kompetensi' },
  { value: 'path_completion', label: 'Penyelesaian Learning Path' },
  { value: 'special', label: 'Pencapaian Khusus' },
]

const badgeForm = ref({
  open: false,
  id: null,
  name: '',
  code: '',
  badge_type: 'course_completion',
  description: '',
  courses_required: 0,
  points_required: 0,
  min_score_required: 0,
  points_awarded: 10,
  saving: false,
  error: '',
})

const tabs = computed(() => {
  const base = [
    { key: 'mine', label: 'Lencana Saya' },
    { key: 'all', label: 'Semua Lencana' },
    { key: 'leaderboard', label: 'Leaderboard' },
  ]
  if (authStore.user?.is_admin) base.push({ key: 'manage', label: 'Kelola Lencana' })
  return base
})

async function load() {
  loading.value = true
  error.value = ''
  try {
    if (activeTab.value === 'mine') {
      const res = await lmsApi.myBadges()
      items.value = res?.badges ?? []
    } else if (activeTab.value === 'all') {
      const res = await lmsApi.badgeSearch()
      items.value = res?.badges ?? []
    } else if (activeTab.value === 'leaderboard') {
      const res = await lmsApi.badgeLeaderboard()
      items.value = res?.leaderboard ?? []
    } else if (activeTab.value === 'manage') {
      const res = await lmsApi.badgeSearch()
      items.value = res?.badges ?? []
    }
  } catch (e) {
    error.value = e.message || 'Gagal memuat lencana'
  } finally {
    loading.value = false
  }
}

function openAwardModal(b) {
  awardTarget.value = b
  awardUserId.value = null
  awardError.value = ''
}

async function doAward() {
  if (!awardUserId.value) { awardError.value = 'Pilih karyawan terlebih dahulu'; return }
  awarding.value = true
  awardError.value = ''
  try {
    await lmsApi.badgeAward({ badge_id: awardTarget.value.id, user_id: awardUserId.value })
    showToast('Lencana berhasil diberikan!')
    awardTarget.value = null
    if (activeTab.value === 'all') load()
  } catch (e) {
    awardError.value = e.message || 'Gagal memberikan lencana'
  } finally {
    awarding.value = false
  }
}

function openCreateBadgeModal() {
  badgeForm.value = {
    open: true, id: null, name: '', code: '', badge_type: 'course_completion',
    description: '', courses_required: 0, points_required: 0, min_score_required: 0,
    points_awarded: 10, saving: false, error: '',
  }
}

function openEditBadgeModal(b) {
  badgeForm.value = {
    open: true, id: b.id, name: b.name, code: b.code, badge_type: b.badge_type,
    description: stripHtml(b.description), courses_required: b.courses_required || 0,
    points_required: b.points_required || 0, min_score_required: b.min_score_required || 0,
    points_awarded: b.points_awarded || 10, saving: false, error: '',
  }
}

async function saveBadge() {
  const f = badgeForm.value
  if (!f.name.trim() || (!f.id && !f.code.trim())) {
    f.error = 'Nama dan kode wajib diisi'
    return
  }
  f.saving = true
  f.error = ''
  try {
    if (f.id) {
      await lmsApi.badgeUpdate({
        badge_id: f.id, name: f.name, badge_type: f.badge_type,
        description: f.description, courses_required: f.courses_required,
        points_required: f.points_required, min_score_required: f.min_score_required,
        points_awarded: f.points_awarded,
      })
      showToast('Lencana berhasil diperbarui')
    } else {
      await lmsApi.badgeCreate({
        name: f.name, code: f.code, badge_type: f.badge_type,
        description: f.description, courses_required: f.courses_required,
        points_required: f.points_required, min_score_required: f.min_score_required,
        points_awarded: f.points_awarded,
      })
      showToast('Lencana berhasil dibuat!')
    }
    f.open = false
    load()
  } catch (e) {
    f.error = e.message || 'Gagal menyimpan'
  } finally {
    f.saving = false
  }
}

async function confirmDeleteBadge(b) {
  if (!confirm(`Arsipkan lencana "${b.name}"? Lencana yang sudah diraih tidak akan hilang.`)) return
  try {
    await lmsApi.badgeDelete({ badge_id: b.id })
    showToast('Lencana diarsipkan')
    load()
  } catch (e) {
    showToast(e.message || 'Gagal mengarsipkan')
  }
}

function showToast(msg) { toast.value = msg; setTimeout(() => { toast.value = '' }, 3000) }

function badgeEmoji(type) {
  return { course_completion: '🎓', assessment_pass: '📝', assessment_excellence: '📝', competency: '⭐', competency_achievement: '⭐', learning_path: '🗺️', path_completion: '🗺️', participation: '🤝', special: '🏅' }[type] || '🏆'
}

function badgeBg(type) {
  return {
    course_completion: 'bg-blue-50',
    assessment_pass: 'bg-purple-50',
    assessment_excellence: 'bg-purple-50',
    competency: 'bg-yellow-50',
    competency_achievement: 'bg-yellow-50',
    learning_path: 'bg-green-50',
    path_completion: 'bg-green-50',
    participation: 'bg-teal-50',
    special: 'bg-orange-50',
  }[type] || 'bg-gray-50'
}

function badgeTypeLabel(type) {
  return badgeTypes.find(t => t.value === type)?.label || type
}

function stripHtml(html) {
  if (!html) return ''
  return html.replace(/<[^>]*>/g, '').trim()
}

onMounted(load)
</script>
