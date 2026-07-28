<template>
  <div class="min-h-screen clay-surface p-4 md:p-6">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Ringkasan Akademi</h1>
      <p class="text-sm text-gray-500 mt-1">Pantau kursus LMS dan quiz SOP dalam satu tampilan</p>
    </div>

    <div v-if="loading" class="flex items-center justify-center py-24">
      <div class="w-9 h-9 border-4 border-gray-300 border-t-[#B70000] rounded-full animate-spin"></div>
    </div>

    <template v-else>
      <!-- ── KURSUS LMS ── -->
      <div class="flex items-center justify-between mb-3">
        <h2 class="text-sm font-bold text-blue-600 uppercase tracking-wide">Kursus LMS</h2>
        <router-link to="/dashboard/lms/analytics" class="text-xs font-semibold text-blue-600 hover:underline">Lihat detail →</router-link>
      </div>
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div class="clay-card p-5">
          <p class="text-xs text-gray-500 font-medium uppercase tracking-wider">Total Kursus</p>
          <p class="text-3xl font-bold text-gray-800 mt-1">{{ lms.courses }}</p>
        </div>
        <div class="clay-card p-5">
          <p class="text-xs text-gray-500 font-medium uppercase tracking-wider">Total Enrollment</p>
          <p class="text-3xl font-bold text-blue-600 mt-1">{{ lms.enrollments }}</p>
        </div>
        <div class="clay-card p-5">
          <p class="text-xs text-gray-500 font-medium uppercase tracking-wider">Karyawan Enroll LMS</p>
          <p class="text-3xl font-bold text-gray-800 mt-1">{{ lms.enrolledUsers }}<span class="text-base text-gray-400">/{{ lms.totalEmployees }}</span></p>
        </div>
        <div class="clay-card p-5">
          <p class="text-xs text-gray-500 font-medium uppercase tracking-wider">Kursus Selesai</p>
          <p class="text-3xl font-bold text-green-600 mt-1">{{ lms.completed }}<span class="text-base text-gray-400">/{{ lms.enrollments }}</span></p>
        </div>
      </div>

      <!-- ── QUIZ SOP ── -->
      <div class="flex items-center justify-between mb-3">
        <h2 class="text-sm font-bold text-[#B70000] uppercase tracking-wide">Quiz SOP</h2>
        <router-link to="/dashboard/quiz/admin" class="text-xs font-semibold text-[#B70000] hover:underline">Lihat detail →</router-link>
      </div>
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div class="clay-card p-5">
          <p class="text-xs text-gray-500 font-medium uppercase tracking-wider">Total Submission</p>
          <p class="text-3xl font-bold text-gray-800 mt-1">{{ quiz.submissions }}</p>
        </div>
        <div class="clay-card p-5">
          <p class="text-xs text-gray-500 font-medium uppercase tracking-wider">Pass Rate</p>
          <p class="text-3xl font-bold mt-1" :class="quiz.passRate >= 80 ? 'text-green-600' : 'text-amber-600'">{{ quiz.passRate }}%</p>
        </div>
        <div class="clay-card p-5">
          <p class="text-xs text-gray-500 font-medium uppercase tracking-wider">Rata-rata Skor</p>
          <p class="text-3xl font-bold text-indigo-600 mt-1">{{ quiz.avgScore }}</p>
        </div>
        <div class="clay-card p-5">
          <p class="text-xs text-gray-500 font-medium uppercase tracking-wider">Perlu Retraining</p>
          <p class="text-3xl font-bold text-red-500 mt-1">{{ quiz.retraining }}</p>
        </div>
      </div>

      <!-- Quick links -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <router-link to="/dashboard/lms/employees" class="clay-card p-5 flex items-center gap-4 hover:brightness-[0.98] transition">
          <div class="w-11 h-11 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 clay-inset shrink-0">
            <UsersIcon class="w-6 h-6" />
          </div>
          <div>
            <p class="font-bold text-gray-800 text-sm">Data per Karyawan</p>
            <p class="text-xs text-gray-500">LMS + Quiz per orang</p>
          </div>
        </router-link>
        <router-link to="/dashboard/lms/analytics" class="clay-card p-5 flex items-center gap-4 hover:brightness-[0.98] transition">
          <div class="w-11 h-11 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 clay-inset shrink-0">
            <PresentationChartLineIcon class="w-6 h-6" />
          </div>
          <div>
            <p class="font-bold text-gray-800 text-sm">Analitik LMS</p>
            <p class="text-xs text-gray-500">Tren & performa kursus</p>
          </div>
        </router-link>
        <router-link to="/dashboard/quiz/admin" class="clay-card p-5 flex items-center gap-4 hover:brightness-[0.98] transition">
          <div class="w-11 h-11 rounded-2xl bg-red-50 flex items-center justify-center text-[#B70000] clay-inset shrink-0">
            <ChartBarSquareIcon class="w-6 h-6" />
          </div>
          <div>
            <p class="font-bold text-gray-800 text-sm">Dashboard Quiz</p>
            <p class="text-xs text-gray-500">Monitoring quiz SOP</p>
          </div>
        </router-link>
      </div>

      <!-- ── RANKING KARYAWAN (berdasarkan nilai quiz kursus) ── -->
      <div class="clay-card overflow-hidden mt-8">
        <div class="px-5 py-4 border-b border-white/40 flex items-center justify-between">
          <h2 class="text-sm font-bold text-gray-800 flex items-center gap-2">🏆 Ranking Karyawan</h2>
          <span class="text-xs text-gray-500">Berdasarkan nilai quiz kursus</span>
        </div>
        <div v-if="!leaderboard.length" class="py-8 text-center text-sm text-gray-400">Belum ada data ranking.</div>
        <div v-else class="divide-y divide-white/40">
          <router-link
            v-for="r in leaderboard"
            :key="r.user_id"
            :to="'/dashboard/lms/employees'"
            class="flex items-center gap-3 px-5 py-3 hover:bg-white/40 transition-colors"
          >
            <!-- Rank badge -->
            <div class="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-extrabold shrink-0"
              :class="r.rank === 1 ? 'bg-yellow-100 text-yellow-700' : r.rank === 2 ? 'bg-gray-200 text-gray-600' : r.rank === 3 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'">
              <span v-if="r.rank <= 3">{{ ['🥇','🥈','🥉'][r.rank - 1] }}</span>
              <span v-else>{{ r.rank }}</span>
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-semibold text-gray-800 text-sm truncate">{{ r.name }}</p>
              <p class="text-xs text-gray-400 truncate">{{ r.job_title || '—' }}<span v-if="r.department"> · {{ r.department }}</span></p>
            </div>
            <!-- Stats: nilai quiz kursus -->
            <div class="text-right shrink-0">
              <p class="text-base font-extrabold leading-none"
                :class="(r.avg_quiz_score || 0) >= 80 ? 'text-green-600' : (r.avg_quiz_score || 0) >= 60 ? 'text-amber-600' : 'text-red-500'">
                {{ Math.round(r.avg_quiz_score || 0) }}%
              </p>
              <p class="text-[10px] text-gray-400 mt-0.5">{{ r.quiz_count }} quiz</p>
            </div>
            <div class="w-14 shrink-0 hidden sm:block">
              <div class="h-1.5 bg-black/10 rounded-full overflow-hidden">
                <div class="h-full rounded-full"
                  :class="(r.avg_quiz_score || 0) >= 80 ? 'bg-green-500' : (r.avg_quiz_score || 0) >= 60 ? 'bg-amber-400' : 'bg-red-400'"
                  :style="{ width: Math.round(r.avg_quiz_score || 0) + '%' }"></div>
              </div>
              <p class="text-[9px] text-gray-400 mt-0.5 text-right">rata-rata</p>
            </div>
          </router-link>
        </div>
      </div>

      <p v-if="partialError" class="mt-6 text-xs text-amber-600">Sebagian data gagal dimuat — angka mungkin tidak lengkap.</p>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { lmsApi } from '../../services/lmsApi'
import { quizApi } from '../../services/quizApi'
import { UsersIcon, PresentationChartLineIcon, ChartBarSquareIcon } from '@heroicons/vue/24/outline'

const loading = ref(true)
const partialError = ref(false)
const lms = ref({ courses: 0, enrollments: 0, completed: 0, totalEmployees: 0, enrolledUsers: 0 })
const quiz = ref({ submissions: 0, passRate: 0, avgScore: 0, retraining: 0 })
const leaderboard = ref([])

async function safe(fn) {
  try { return await fn() } catch { partialError.value = true; return null }
}

onMounted(async () => {
  const [courseRes, enrollRes, doneRes, compRes, quizRes, lbRes] = await Promise.all([
    safe(() => lmsApi.courseSearch({ limit: 1 })),
    safe(() => lmsApi.enrollmentSearch({ limit: 1 })),
    safe(() => lmsApi.enrollmentSearch({ status: 'completed', limit: 1 })),
    safe(() => lmsApi.employeeComplianceReport({})),
    safe(() => quizApi.dashboard({})),
    safe(() => lmsApi.employeeLeaderboard({ limit: 10 })),
  ])

  if (lbRes?.leaderboard) leaderboard.value = lbRes.leaderboard

  if (courseRes?.pagination) lms.value.courses = courseRes.pagination.total ?? 0
  if (enrollRes?.pagination) lms.value.enrollments = enrollRes.pagination.total ?? 0
  if (doneRes?.pagination) lms.value.completed = doneRes.pagination.total ?? 0
  if (compRes) {
    lms.value.totalEmployees = compRes.total_employees ?? 0
    lms.value.enrolledUsers = compRes.enrolled_users ?? 0
  }
  if (quizRes?.summary) {
    const s = quizRes.summary
    quiz.value.submissions = s.total_submissions ?? 0
    quiz.value.passRate = s.overall_pass_rate ?? 0
    quiz.value.avgScore = s.overall_avg_score ?? 0
    quiz.value.retraining = s.total_needs_retraining ?? 0
  }
  loading.value = false
})
</script>
