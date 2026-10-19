<template>
  <div class="min-h-screen clay-surface p-4 md:p-6">
    <!-- Header -->
    <div class="flex items-start gap-3 mb-5">
      <button
        @click="goBack"
        class="mt-1 p-1.5 rounded-lg text-gray-500 hover:bg-white/70 hover:text-gray-800 transition-colors shrink-0"
        title="Kembali"
      >
        <ChevronLeftIcon class="w-5 h-5" />
      </button>
      <div class="min-w-0 flex-1">
        <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          {{ isFull ? 'Analitik Kursus' : 'Leaderboard Kursus' }}
          <span v-if="data?.course?.category" class="normal-case font-medium text-gray-400">· {{ data.course.category }}</span>
        </p>
        <h1 class="text-xl md:text-2xl font-bold text-gray-900 leading-snug">{{ data?.course?.name || 'Memuat...' }}</h1>
      </div>
      <button
        v-if="isFull"
        @click="exportCsv"
        class="shrink-0 flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-700 bg-white/80 border border-gray-200 rounded-lg hover:bg-white transition-colors"
      >
        <ArrowDownTrayIcon class="w-4 h-4" />
        <span class="hidden sm:inline">Unduh CSV</span>
      </button>
    </div>

    <!-- Loading / error -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <div class="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
    </div>
    <div v-else-if="error" class="clay-card p-6 text-center">
      <p class="text-red-600 font-medium">{{ error }}</p>
      <button @click="load" class="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700">Coba Lagi</button>
    </div>

    <template v-else-if="data">
      <!-- Tabs (admin) -->
      <div v-if="isFull" class="flex gap-2 mb-5 overflow-x-auto pb-1">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          @click="activeTab = tab.key"
          class="px-4 py-2 text-sm whitespace-nowrap clay-pill"
          :class="activeTab === tab.key ? 'clay-pill-active' : ''"
        >{{ tab.label }}</button>
      </div>

      <!-- ── RINGKASAN ── -->
      <template v-if="isFull && activeTab === 'summary'">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div class="clay-card-sm p-4">
            <p class="text-xs text-gray-500 font-medium uppercase tracking-wider">Peserta</p>
            <p class="text-2xl font-bold text-blue-600 mt-1">{{ s.enrolled }}</p>
            <p class="text-[11px] text-gray-500 mt-1">{{ s.not_started }} belum mulai · {{ s.in_progress }} berjalan</p>
          </div>
          <div class="clay-card-sm p-4">
            <p class="text-xs text-gray-500 font-medium uppercase tracking-wider">Selesai</p>
            <p class="text-2xl font-bold text-green-600 mt-1">{{ s.completed }} <span class="text-sm font-semibold text-gray-400">/ {{ s.enrolled }}</span></p>
            <p class="text-[11px] text-gray-500 mt-1">Completion {{ s.completion_rate }}%</p>
          </div>
          <div class="clay-card-sm p-4">
            <p class="text-xs text-gray-500 font-medium uppercase tracking-wider">Rata-rata Progres</p>
            <p class="text-2xl font-bold text-purple-600 mt-1">{{ fmtNum(s.avg_progress) }}%</p>
            <p class="text-[11px] text-gray-500 mt-1">{{ data.course.module_count }} modul</p>
          </div>
          <div class="clay-card-sm p-4">
            <p class="text-xs text-gray-500 font-medium uppercase tracking-wider">Rata-rata Nilai</p>
            <p class="text-2xl font-bold text-amber-600 mt-1">{{ fmtNum(s.avg_score) }}</p>
            <p class="text-[11px] text-gray-500 mt-1">{{ data.course.has_post_test ? 'dari post-test' : 'nilai terbaik quiz' }}</p>
          </div>
        </div>

        <!-- Pre vs Post -->
        <div class="clay-card p-5 mb-4">
          <div class="flex items-center justify-between gap-3 mb-4">
            <h2 class="font-semibold text-gray-800">Pre-test vs Post-test</h2>
            <button v-if="hasPrePost" @click="activeTab = 'prepost'" class="text-xs font-semibold text-blue-600 hover:underline">Rincian per peserta →</button>
          </div>
          <div v-if="!hasPrePost" class="text-sm text-gray-500 bg-gray-50 rounded-xl p-4">
            Kursus ini belum punya modul quiz berperan <b>Pre-test</b> atau <b>Post-test</b>.
            Atur di <router-link to="/dashboard/lms/modules" class="text-blue-600 font-semibold hover:underline">Modul &amp; Section</router-link>:
            edit modul quiz, lalu pilih "Peran di Kursus".
          </div>
          <div v-else class="grid md:grid-cols-3 gap-4 items-center">
            <div class="rounded-2xl bg-sky-50 border border-sky-100 p-4">
              <p class="text-xs font-semibold text-sky-700">PRE-TEST</p>
              <p class="text-3xl font-bold text-sky-700 mt-1">{{ fmtNum(s.avg_pre) }}</p>
              <p class="text-[11px] text-sky-700/80 mt-1 truncate">{{ s.pre_taken }} peserta · {{ data.course.pre_test_name || 'belum diatur' }}</p>
            </div>
            <div class="rounded-2xl bg-emerald-50 border border-emerald-100 p-4">
              <p class="text-xs font-semibold text-emerald-700">POST-TEST</p>
              <p class="text-3xl font-bold text-emerald-700 mt-1">{{ fmtNum(s.avg_post) }}</p>
              <p class="text-[11px] text-emerald-700/80 mt-1 truncate">{{ s.post_taken }} peserta · {{ data.course.post_test_name || 'belum diatur' }}</p>
            </div>
            <div class="rounded-2xl bg-white/70 border border-gray-100 p-4">
              <p class="text-xs font-semibold text-gray-500">KENAIKAN RATA-RATA (Δ)</p>
              <p class="text-3xl font-bold mt-1" :class="deltaClass(s.avg_delta)">{{ fmtDelta(s.avg_delta) }}</p>
              <p class="text-[11px] text-gray-500 mt-1">
                {{ s.paired }} peserta punya keduanya · {{ s.improved }} naik · {{ s.declined }} turun
              </p>
            </div>
          </div>
        </div>

        <!-- Top 5 + aktivitas terbaru -->
        <div class="grid lg:grid-cols-2 gap-4">
          <div class="clay-card p-5">
            <div class="flex items-center justify-between mb-3">
              <h2 class="font-semibold text-gray-800">Top 5 Leaderboard</h2>
              <button @click="activeTab = 'leaderboard'" class="text-xs font-semibold text-blue-600 hover:underline">Lihat semua →</button>
            </div>
            <LeaderRow v-for="p in leaderboard.slice(0, 5)" :key="p.rank" :p="p" />
            <p v-if="!leaderboard.length" class="text-sm text-gray-400">Belum ada peserta.</p>
          </div>
          <div class="clay-card p-5">
            <div class="flex items-center justify-between mb-3">
              <h2 class="font-semibold text-gray-800">Aktivitas Terbaru</h2>
              <button @click="activeTab = 'activity'" class="text-xs font-semibold text-blue-600 hover:underline">Lihat semua →</button>
            </div>
            <ul class="space-y-2.5">
              <li v-for="(ev, i) in data.activity.slice(0, 6)" :key="i" class="flex gap-2.5 text-sm">
                <span class="mt-0.5 shrink-0">{{ eventIcon(ev.type) }}</span>
                <div class="min-w-0">
                  <p class="text-gray-800"><b>{{ ev.name }}</b> · {{ ev.text }}</p>
                  <p class="text-[11px] text-gray-400">{{ fmtDate(ev.at) }}</p>
                </div>
              </li>
            </ul>
            <p v-if="!data.activity.length" class="text-sm text-gray-400">Belum ada aktivitas.</p>
          </div>
        </div>
      </template>

      <!-- ── PESERTA ── -->
      <template v-else-if="isFull && activeTab === 'participants'">
        <div class="clay-card p-3 mb-3 flex flex-wrap gap-2">
          <input v-model="search" placeholder="Cari nama / jabatan..." class="flex-1 min-w-40 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300" />
          <select v-model="statusFilter" class="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300">
            <option value="">Semua Status</option>
            <option value="not_started">Belum Mulai</option>
            <option value="in_progress">Berjalan</option>
            <option value="completed">Selesai</option>
            <option value="failed">Gagal</option>
          </select>
        </div>
        <div class="clay-card overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="bg-gray-50/80 text-gray-500 text-xs uppercase">
                <tr>
                  <th class="px-4 py-3 text-left font-medium">Peserta</th>
                  <th class="px-3 py-3 text-left font-medium">Status</th>
                  <th class="px-3 py-3 text-left font-medium min-w-36">Progres</th>
                  <th v-if="data.course.has_pre_test" class="px-3 py-3 text-center font-medium">Pre</th>
                  <th v-if="data.course.has_post_test" class="px-3 py-3 text-center font-medium">Post</th>
                  <th class="px-3 py-3 text-left font-medium whitespace-nowrap">Daftar</th>
                  <th class="px-3 py-3 text-left font-medium whitespace-nowrap">Selesai</th>
                  <th class="px-3 py-3 text-left font-medium whitespace-nowrap">Aktivitas Terakhir</th>
                  <th class="px-3 py-3"></th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-for="p in filteredParticipants" :key="p.enrollment_id" class="hover:bg-white/60">
                  <td class="px-4 py-3">
                    <p class="font-medium text-gray-800">{{ p.name }}</p>
                    <p class="text-[11px] text-gray-400">{{ [p.job, p.department].filter(Boolean).join(' · ') || '-' }}</p>
                  </td>
                  <td class="px-3 py-3"><span class="text-[11px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap" :class="statusClass(p.status)">{{ statusLabel(p.status) }}</span></td>
                  <td class="px-3 py-3">
                    <div class="flex items-center gap-2">
                      <div class="h-1.5 flex-1 bg-black/5 rounded-full overflow-hidden">
                        <div class="h-full rounded-full" :class="p.progress >= 100 ? 'bg-green-500' : 'bg-indigo-500'" :style="{ width: p.progress + '%' }"></div>
                      </div>
                      <span class="text-xs text-gray-600 w-10 text-right">{{ Math.round(p.progress) }}%</span>
                    </div>
                    <p class="text-[11px] text-gray-400 mt-0.5">{{ p.modules_done }}/{{ data.course.module_count }} modul</p>
                  </td>
                  <td v-if="data.course.has_pre_test" class="px-3 py-3 text-center"><ScoreCell :v="p.pre" /></td>
                  <td v-if="data.course.has_post_test" class="px-3 py-3 text-center"><ScoreCell :v="p.post" /></td>
                  <td class="px-3 py-3 text-xs text-gray-600 whitespace-nowrap">{{ fmtDate(p.enrollment_date) }}</td>
                  <td class="px-3 py-3 text-xs text-gray-600 whitespace-nowrap">{{ fmtDate(p.completion_date) }}</td>
                  <td class="px-3 py-3 text-xs text-gray-600 whitespace-nowrap">{{ fmtDate(p.last_activity) }}</td>
                  <td class="px-3 py-3 text-right">
                    <button @click="showActivityOf(p)" class="text-xs font-semibold text-blue-600 hover:underline whitespace-nowrap">Aktivitas →</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p v-if="!filteredParticipants.length" class="text-sm text-gray-400 text-center py-8">Tidak ada peserta.</p>
        </div>
      </template>

      <!-- ── PRE / POST ── -->
      <template v-else-if="isFull && activeTab === 'prepost'">
        <div v-if="!hasPrePost" class="clay-card p-6 text-sm text-gray-500">
          Kursus ini belum punya Pre-test / Post-test. Atur di
          <router-link to="/dashboard/lms/modules" class="text-blue-600 font-semibold hover:underline">Modul &amp; Section</router-link>.
        </div>
        <div v-else class="clay-card overflow-hidden">
          <div class="px-5 py-3 border-b border-gray-100 text-xs text-gray-500">
            Pre-test memakai nilai <b>percobaan pertama</b>; post-test memakai <b>nilai terbaik</b>. Δ = post − pre.
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="bg-gray-50/80 text-gray-500 text-xs uppercase">
                <tr>
                  <th class="px-4 py-3 text-left font-medium">Peserta</th>
                  <th class="px-3 py-3 text-center font-medium">Pre-test</th>
                  <th class="px-3 py-3 text-center font-medium">Post-test</th>
                  <th class="px-3 py-3 text-center font-medium">Δ</th>
                  <th class="px-3 py-3 text-left font-medium">Waktu Pre</th>
                  <th class="px-3 py-3 text-left font-medium">Waktu Post</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-for="p in prePostRows" :key="p.enrollment_id" class="hover:bg-white/60">
                  <td class="px-4 py-3">
                    <p class="font-medium text-gray-800">{{ p.name }}</p>
                    <p class="text-[11px] text-gray-400">{{ p.job || '-' }}</p>
                  </td>
                  <td class="px-3 py-3 text-center"><ScoreCell :v="p.pre" /></td>
                  <td class="px-3 py-3 text-center">
                    <ScoreCell :v="p.post" />
                    <p v-if="p.post?.attempts > 1" class="text-[10px] text-gray-400">{{ p.post.attempts }}x coba</p>
                  </td>
                  <td class="px-3 py-3 text-center font-bold" :class="deltaClass(p.delta)">{{ fmtDelta(p.delta) }}</td>
                  <td class="px-3 py-3 text-xs text-gray-600 whitespace-nowrap">{{ fmtDate(p.pre?.date) }}</td>
                  <td class="px-3 py-3 text-xs text-gray-600 whitespace-nowrap">{{ fmtDate(p.post?.date) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </template>

      <!-- ── MATERI ── -->
      <template v-else-if="isFull && activeTab === 'modules'">
        <div class="clay-card overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="bg-gray-50/80 text-gray-500 text-xs uppercase">
                <tr>
                  <th class="px-4 py-3 text-left font-medium">#</th>
                  <th class="px-3 py-3 text-left font-medium">Materi</th>
                  <th class="px-3 py-3 text-left font-medium min-w-36">Diselesaikan</th>
                  <th class="px-3 py-3 text-center font-medium whitespace-nowrap">Rata-rata Waktu</th>
                  <th class="px-3 py-3 text-center font-medium whitespace-nowrap">Nilai Quiz</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <template v-for="(g, gi) in moduleGroups" :key="gi">
                  <tr v-if="g.name" class="bg-gray-50/60">
                    <td colspan="5" class="px-4 py-2 text-xs font-bold text-gray-600 uppercase tracking-wide">{{ g.name }}</td>
                  </tr>
                  <tr v-for="m in g.modules" :key="m.id" class="hover:bg-white/60">
                    <td class="px-4 py-3 text-xs text-gray-400">{{ m.no }}</td>
                    <td class="px-3 py-3">
                      <p class="font-medium text-gray-800">{{ m.name }}</p>
                      <p class="text-[11px] text-gray-400 flex items-center gap-1.5 flex-wrap">
                        <span>{{ contentTypeLabel(m.content_type) }} · {{ m.duration_minutes }} mnt</span>
                        <span v-if="m.content_type === 'assessment' && m.quiz_role === 'pre_test'" class="font-bold text-sky-700">PRE-TEST</span>
                        <span v-else-if="m.content_type === 'assessment' && m.quiz_role === 'post_test'" class="font-bold text-emerald-700">POST-TEST</span>
                        <span v-if="m.quiz_bank_name" class="truncate max-w-56">🧩 {{ m.quiz_bank_name }}</span>
                      </p>
                    </td>
                    <td class="px-3 py-3">
                      <div class="flex items-center gap-2">
                        <div class="h-1.5 flex-1 bg-black/5 rounded-full overflow-hidden">
                          <div class="h-full rounded-full bg-green-500" :style="{ width: m.completion_rate + '%' }"></div>
                        </div>
                        <span class="text-xs text-gray-600 whitespace-nowrap">{{ m.completed }}/{{ s.enrolled }}</span>
                      </div>
                    </td>
                    <td class="px-3 py-3 text-center text-xs text-gray-600">
                      {{ m.avg_time_minutes != null ? fmtNum(m.avg_time_minutes) + ' mnt' : '-' }}
                      <p v-if="m.avg_watch_percentage != null" class="text-[10px] text-gray-400">ditonton {{ Math.round(m.avg_watch_percentage) }}%</p>
                    </td>
                    <td class="px-3 py-3 text-center text-xs">
                      <template v-if="m.content_type === 'assessment'">
                        <span class="font-semibold text-gray-800">{{ fmtNum(m.avg_best_score) }}</span>
                        <p class="text-[10px] text-gray-400">{{ m.pass_count }} lulus · {{ m.attempts }} percobaan</p>
                      </template>
                      <span v-else class="text-gray-300">-</span>
                    </td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>
          <p v-if="!data.modules.length" class="text-sm text-gray-400 text-center py-8">Kursus belum punya modul.</p>
        </div>
      </template>

      <!-- ── AKTIVITAS ── -->
      <template v-else-if="isFull && activeTab === 'activity'">
        <div class="clay-card p-3 mb-3 flex flex-wrap gap-2 items-center">
          <select v-model="activityPerson" class="flex-1 min-w-48 text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300">
            <option :value="null">Semua peserta</option>
            <option v-for="p in sortedByName" :key="p.enrollment_id" :value="p.enrollment_id">{{ p.name }}</option>
          </select>
          <select v-model="activityType" class="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300">
            <option value="">Semua jenis</option>
            <option value="quizzes">Quiz / Pre / Post</option>
            <option value="modules">Modul</option>
            <option value="course">Daftar & selesai kursus</option>
          </select>
          <span v-if="data.activity_total > data.activity.length" class="text-[11px] text-gray-400">
            Menampilkan {{ data.activity.length }} dari {{ data.activity_total }} aktivitas terbaru
          </span>
        </div>
        <div class="clay-card p-5">
          <ol class="relative border-l border-gray-200 ml-2">
            <li v-for="(ev, i) in filteredActivity" :key="i" class="ml-5 mb-4 last:mb-0">
              <span class="absolute -left-3 flex items-center justify-center w-6 h-6 rounded-full bg-white border border-gray-200 text-xs">{{ eventIcon(ev.type) }}</span>
              <p class="text-[11px] text-gray-400">{{ fmtDate(ev.at) }}</p>
              <p class="text-sm text-gray-800"><b>{{ ev.name }}</b> · {{ ev.text }}</p>
            </li>
          </ol>
          <p v-if="!filteredActivity.length" class="text-sm text-gray-400 text-center py-6">Belum ada aktivitas.</p>
        </div>
      </template>

      <!-- ── LEADERBOARD (admin tab & tampilan user) ── -->
      <template v-else>
        <div class="clay-card p-5 max-w-3xl">
          <div class="flex items-center justify-between mb-1">
            <h2 class="font-semibold text-gray-800 flex items-center gap-2"><TrophyIcon class="w-5 h-5 text-amber-500" /> Leaderboard</h2>
            <span class="text-xs text-gray-400">{{ leaderboard.length }} peserta</span>
          </div>
          <p class="text-[11px] text-gray-400 mb-4">
            Urutan: progres tertinggi, lalu nilai {{ data.course.has_post_test ? 'post-test' : 'quiz terbaik' }}, lalu yang selesai lebih dulu.
          </p>
          <LeaderRow v-for="p in leaderboard" :key="p.rank" :p="p" />
          <p v-if="!leaderboard.length" class="text-sm text-gray-400">Belum ada peserta.</p>
        </div>
      </template>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, defineComponent, h, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { lmsApi } from '../../services/lmsApi'
import { ChevronLeftIcon, TrophyIcon, ArrowDownTrayIcon } from '@heroicons/vue/24/outline'

const route = useRoute()
const router = useRouter()
const courseId = computed(() => parseInt(route.params.courseId))

const loading = ref(true)
const error = ref('')
const data = ref(null)
const activeTab = ref(route.query.tab || 'summary')
const search = ref('')
const statusFilter = ref('')
const activityPerson = ref(null)
const activityType = ref('')

const tabs = [
  { key: 'summary', label: 'Ringkasan' },
  { key: 'participants', label: 'Peserta' },
  { key: 'prepost', label: 'Pre / Post-test' },
  { key: 'leaderboard', label: 'Leaderboard' },
  { key: 'modules', label: 'Materi' },
  { key: 'activity', label: 'Aktivitas' },
]

const isFull = computed(() => data.value?.scope === 'full')
const s = computed(() => data.value?.summary || {})
const hasPrePost = computed(() => !!(data.value?.course?.has_pre_test || data.value?.course?.has_post_test))
const leaderboard = computed(() => (isFull.value ? data.value.participants : data.value?.leaderboard) || [])

const filteredParticipants = computed(() => {
  const q = search.value.trim().toLowerCase()
  return (data.value?.participants || []).filter(p =>
    (!statusFilter.value || p.status === statusFilter.value)
    && (!q || `${p.name} ${p.job} ${p.department}`.toLowerCase().includes(q))
  )
})
const sortedByName = computed(() => [...(data.value?.participants || [])].sort((a, b) => a.name.localeCompare(b.name)))
const prePostRows = computed(() => [...(data.value?.participants || [])].sort((a, b) =>
  (b.delta ?? -999) - (a.delta ?? -999) || a.name.localeCompare(b.name)))

const moduleGroups = computed(() => {
  const groups = []
  const map = {}
  ;(data.value?.modules || []).forEach((m, i) => {
    const key = m.section_name || '__none__'
    if (!map[key]) { map[key] = { name: m.section_name, modules: [] }; groups.push(map[key]) }
    map[key].modules.push({ ...m, no: i + 1 })
  })
  return groups
})

const typeGroups = {
  quizzes: ['quiz', 'pre_test', 'post_test'],
  modules: ['module_start', 'module_done'],
  course: ['enrolled', 'course_done'],
}
const filteredActivity = computed(() => (data.value?.activity || []).filter(ev =>
  (!activityPerson.value || ev.enrollment_id === activityPerson.value)
  && (!activityType.value || typeGroups[activityType.value].includes(ev.type))
))

function showActivityOf(p) {
  activityPerson.value = p.enrollment_id
  activityType.value = ''
  activeTab.value = 'activity'
}

// ── Format helpers ────────────────────────────────────────────────────
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
function fmtDate(v) {
  if (!v) return '-'
  const [d, t] = v.split(' ')
  const [y, m, day] = d.split('-')
  return `${parseInt(day)} ${MONTHS[parseInt(m) - 1]} ${y}${t ? ' ' + t : ''}`
}
function fmtNum(v) { return v == null ? '-' : (Math.round(v * 10) / 10).toString() }
function fmtDelta(v) { return v == null ? '-' : (v > 0 ? '+' : '') + fmtNum(v) }
function deltaClass(v) {
  if (v == null) return 'text-gray-400'
  return v > 0 ? 'text-green-600' : v < 0 ? 'text-red-500' : 'text-gray-600'
}
function statusLabel(st) {
  return { not_started: 'Belum Mulai', in_progress: 'Berjalan', completed: 'Selesai', failed: 'Gagal', cancelled: 'Batal' }[st] || st
}
function statusClass(st) {
  return {
    not_started: 'bg-gray-100 text-gray-600',
    in_progress: 'bg-indigo-100 text-indigo-700',
    completed: 'bg-green-100 text-green-700',
    failed: 'bg-red-100 text-red-600',
  }[st] || 'bg-gray-100 text-gray-600'
}
function contentTypeLabel(t) {
  return { video: 'Video', document: 'Dokumen', interactive: 'Interaktif', assessment: 'Quiz', external_link: 'Link' }[t] || t
}
function eventIcon(t) {
  return {
    enrolled: '📝', course_done: '🏁', module_start: '▶️', module_done: '✅',
    quiz: '🧩', pre_test: '🅿️', post_test: '🎯',
  }[t] || '•'
}

// ── Inline components ─────────────────────────────────────────────────
const ScoreCell = defineComponent({
  props: { v: Object },
  setup(props) {
    return () => {
      if (!props.v) return h('span', { class: 'text-gray-300' }, '-')
      return h('div', {}, [
        h('span', { class: 'font-semibold text-gray-800' }, fmtNum(props.v.score)),
        props.v.essay_pending ? h('p', { class: 'text-[10px] text-amber-600' }, 'esai belum dinilai') : null,
      ])
    }
  },
})

const LeaderRow = defineComponent({
  props: { p: Object },
  setup(props) {
    const medal = r => ({ 1: '🥇', 2: '🥈', 3: '🥉' }[r])
    return () => {
      const p = props.p
      return h('div', {
        class: `flex items-center gap-3 py-2.5 px-2 rounded-xl ${p.is_me ? 'bg-blue-50 ring-1 ring-blue-200' : ''}`,
      }, [
        h('div', { class: 'w-8 text-center shrink-0 font-bold text-gray-500' }, medal(p.rank) || `#${p.rank}`),
        h('div', { class: 'flex-1 min-w-0' }, [
          h('p', { class: 'text-sm font-semibold text-gray-800 truncate' }, [p.name, p.is_me ? h('span', { class: 'ml-1 text-[10px] text-blue-600' }, '(kamu)') : null]),
          h('div', { class: 'flex items-center gap-2 mt-1' }, [
            h('div', { class: 'h-1.5 flex-1 bg-black/5 rounded-full overflow-hidden' }, [
              h('div', { class: `h-full rounded-full ${p.progress >= 100 ? 'bg-green-500' : 'bg-indigo-500'}`, style: { width: p.progress + '%' } }),
            ]),
            h('span', { class: 'text-[11px] text-gray-500 w-9 text-right' }, Math.round(p.progress) + '%'),
          ]),
        ]),
        h('div', { class: 'w-14 text-right shrink-0' }, [
          h('p', { class: 'text-sm font-bold text-gray-800' }, fmtNum(p.score)),
          h('p', { class: 'text-[10px] text-gray-400' }, 'nilai'),
        ]),
      ])
    }
  },
})

// ── Export ────────────────────────────────────────────────────────────
function exportCsv() {
  const c = data.value.course
  const head = ['Peringkat', 'Nama', 'Jabatan', 'Departemen', 'Status', 'Progres %', 'Modul Selesai',
    ...(c.has_pre_test ? ['Pre-test'] : []), ...(c.has_post_test ? ['Post-test'] : []),
    ...(c.has_pre_test && c.has_post_test ? ['Delta'] : []),
    'Nilai', 'Tgl Daftar', 'Tgl Selesai', 'Aktivitas Terakhir']
  const rows = data.value.participants.map(p => [
    p.rank, p.name, p.job, p.department, statusLabel(p.status), p.progress, p.modules_done,
    ...(c.has_pre_test ? [p.pre?.score ?? ''] : []), ...(c.has_post_test ? [p.post?.score ?? ''] : []),
    ...(c.has_pre_test && c.has_post_test ? [p.delta ?? ''] : []),
    p.score ?? '', p.enrollment_date || '', p.completion_date || '', p.last_activity || '',
  ])
  const csv = [head, ...rows]
    .map(r => r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','))
    .join('\n')
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `analitik-${c.name.replace(/[^\w-]+/g, '_')}.csv`
  a.click()
  URL.revokeObjectURL(a.href)
}

function goBack() {
  if (window.history.length > 1) router.back()
  else router.push('/dashboard/lms/courses')
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    data.value = await lmsApi.courseDetailAnalytics(courseId.value)
  } catch (e) {
    error.value = e.message || 'Gagal memuat analitik kursus'
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>
