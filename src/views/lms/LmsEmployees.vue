<template>
  <div class="min-h-screen p-4 md:p-6" style="background:#f0f1f5">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Karyawan LMS</h1>
      <p class="text-sm text-gray-500 mt-1">Manajemen karyawan dan integrasi LMS</p>
    </div>

    <!-- Tabs -->
    <div class="flex gap-2 mb-6 overflow-x-auto pb-1">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        @click="switchTab(tab.key)"
        class="px-4 py-2 text-sm whitespace-nowrap clay-pill"
        :class="activeTab === tab.key ? 'clay-pill-active' : ''"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- ── SEARCH TAB FILTERS ── -->
    <div v-if="activeTab === 'search'" class="clay-card p-4 mb-5 flex flex-wrap gap-3">
      <input
        v-model="searchQuery"
        @input="debouncedLoad"
        placeholder="Cari nama atau jabatan karyawan..."
        class="flex-1 min-w-48 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
      />
      <select
        v-model="filterDeptId"
        @change="page = 1; load()"
        class="min-w-44 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
      >
        <option :value="null">Semua Departemen</option>
        <option v-for="d in departments" :key="d.id" :value="d.id">{{ d.name }}</option>
      </select>
    </div>

    <!-- ── PROFILE TAB FILTERS ── -->
    <div v-else-if="activeTab === 'profile'" class="clay-card p-4 mb-5 flex flex-wrap gap-3 items-start">
      <EmployeePicker
        v-model:userId="profileUserId"
        placeholder="Cari nama karyawan untuk melihat profil..."
        class="flex-1 min-w-48"
        @select="load"
      />
    </div>

    <!-- ── COMPLIANCE TAB FILTERS ── -->
    <div v-else-if="activeTab === 'compliance'" class="clay-card p-4 mb-5 flex flex-wrap gap-3 items-center">
      <select
        v-model="filterDeptId"
        class="flex-1 min-w-44 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
      >
        <option :value="null">Semua Departemen</option>
        <option v-for="d in departments" :key="d.id" :value="d.id">{{ d.name }}</option>
      </select>
      <button @click="load" class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors">
        Tampilkan
      </button>
    </div>

    <!-- ── AUTO ENROLL TAB FILTERS ── -->
    <div v-else-if="activeTab === 'auto_enroll'" class="clay-card p-4 mb-5 flex flex-wrap gap-3 items-start">
      <EmployeePicker
        v-model:userId="autoEnrollUserId"
        placeholder="Pilih karyawan (kosongkan = semua karyawan)"
        class="flex-1 min-w-48"
        :clearable="true"
      />
      <button
        @click="doAutoEnroll"
        :disabled="autoEnrolling"
        class="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 self-start mt-0.5"
      >
        {{ autoEnrolling ? 'Mendaftarkan...' : 'Auto Enroll' }}
      </button>
    </div>

    <!-- ── PERFORMANCE TAB FILTERS ── -->
    <div v-else-if="activeTab === 'performance'" class="clay-card p-4 mb-5 flex flex-wrap gap-3 items-start">
      <EmployeePicker
        v-model:userId="filterUserId"
        placeholder="Filter karyawan tertentu (opsional)"
        class="flex-1 min-w-48"
        :clearable="true"
      />
      <select
        v-model="filterDeptId"
        class="flex-1 min-w-44 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
      >
        <option :value="null">Semua Departemen</option>
        <option v-for="d in departments" :key="d.id" :value="d.id">{{ d.name }}</option>
      </select>
      <button @click="load" class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors self-start mt-0.5">
        Tampilkan
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

    <!-- ── EMPLOYEE SEARCH RESULTS ── -->
    <template v-else-if="activeTab === 'search'">
      <div v-if="!data?.employees?.length" class="bg-white rounded-xl p-12 text-center border border-gray-100 shadow-sm">
        <UsersIcon class="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p class="text-gray-500 font-medium">Tidak ada karyawan ditemukan</p>
      </div>
      <div v-else class="clay-card overflow-hidden mb-4">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 text-gray-500 text-xs uppercase">
            <tr>
              <th rowspan="2" class="px-4 py-3 text-left font-medium align-bottom">Karyawan</th>
              <th rowspan="2" class="px-4 py-3 text-center font-medium align-bottom">Departemen</th>
              <th colspan="3" class="px-4 py-2 text-center font-semibold text-blue-600 border-b border-gray-100">Kursus LMS</th>
              <th colspan="3" class="px-4 py-2 text-center font-semibold text-purple-600 border-b border-gray-100">Quiz SOP</th>
              <th rowspan="2" class="px-4 py-3 text-center font-medium align-bottom">Aksi</th>
            </tr>
            <tr>
              <th class="px-3 py-2 text-center font-medium">Enrolled</th>
              <th class="px-3 py-2 text-center font-medium">Selesai</th>
              <th class="px-3 py-2 text-center font-medium">Compliance</th>
              <th class="px-3 py-2 text-center font-medium">Assigned</th>
              <th class="px-3 py-2 text-center font-medium">Selesai</th>
              <th class="px-3 py-2 text-center font-medium">%</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="e in data.employees" :key="e.user_id" class="hover:bg-gray-50 transition-colors">
              <td class="px-4 py-3">
                <p class="font-medium text-gray-800">{{ e.name }}</p>
                <p class="text-xs text-gray-400 mt-0.5">{{ e.job_title }}</p>
              </td>
              <td class="px-4 py-3 text-center text-gray-500 text-xs">{{ e.department }}</td>
              <td class="px-3 py-3 text-center text-blue-600 font-medium">{{ e.total_enrolled }}</td>
              <td class="px-3 py-3 text-center text-green-600 font-medium">{{ e.completed }}</td>
              <td class="px-3 py-3 text-center">
                <span class="text-xs font-semibold px-2 py-1 rounded-full"
                  :class="e.compliance_rate >= 80 ? 'bg-green-100 text-green-700' : e.compliance_rate >= 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-500'">
                  {{ e.compliance_rate ?? 0 }}%
                </span>
              </td>
              <td class="px-3 py-3 text-center text-gray-700 font-medium">
                {{ e.quiz_assigned ?? 0 }}
                <span v-if="e.quiz_overdue" class="ml-1 text-xs text-red-500" :title="e.quiz_overdue + ' terlambat'">⚠{{ e.quiz_overdue }}</span>
              </td>
              <td class="px-3 py-3 text-center text-green-600 font-medium">{{ e.quiz_done ?? 0 }}</td>
              <td class="px-3 py-3 text-center">
                <span v-if="e.quiz_completion !== null && e.quiz_completion !== undefined" class="text-xs font-semibold px-2 py-1 rounded-full"
                  :class="e.quiz_completion >= 80 ? 'bg-green-100 text-green-700' : e.quiz_completion >= 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-500'">
                  {{ e.quiz_completion }}%
                </span>
                <span v-else class="text-xs text-gray-300">—</span>
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center justify-center gap-2">
                  <button
                    @click="openQuizDetail(e.user_id, e.name)"
                    class="px-3 py-1 text-xs font-semibold text-[#B70000] bg-red-50 rounded-xl hover:bg-red-100 transition-colors"
                  >
                    Nilai Quiz
                  </button>
                  <button
                    @click="viewProfile(e.user_id, e.name)"
                    class="px-3 py-1 text-xs border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    Profil
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="(data?.pagination?.total_pages ?? 1) > 1" class="flex items-center justify-center gap-2 mt-2">
        <button @click="changePage(page - 1)" :disabled="page === 1" class="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors">←</button>
        <span class="text-sm text-gray-500">{{ page }} / {{ data.pagination.total_pages }}</span>
        <button @click="changePage(page + 1)" :disabled="page === data.pagination.total_pages" class="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors">→</button>
      </div>
    </template>

    <!-- ── EMPLOYEE PROFILE ── -->
    <template v-else-if="activeTab === 'profile'">
      <div v-if="!profileUserId" class="bg-white rounded-xl p-12 text-center border border-gray-100 shadow-sm">
        <UsersIcon class="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p class="text-gray-500 font-medium">Cari dan pilih karyawan untuk melihat profil LMS-nya</p>
      </div>
      <div v-else-if="!data" class="bg-white rounded-xl p-12 text-center border border-gray-100 shadow-sm text-gray-400">
        Memuat profil...
      </div>
      <div v-else class="space-y-4">
        <div class="clay-card p-5">
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-xl shadow">
              {{ (data.name || 'U').charAt(0).toUpperCase() }}
            </div>
            <div>
              <h2 class="font-bold text-gray-900 text-lg">{{ data.name }}</h2>
              <p class="text-sm text-gray-500">{{ data.job_title }} · {{ data.department }}</p>
            </div>
          </div>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="bg-white rounded-xl p-4 border border-gray-100 shadow-sm text-center">
            <p class="text-xs text-gray-500 font-medium uppercase tracking-wider">Enrolled</p>
            <p class="text-2xl font-bold text-blue-600 mt-1">{{ data.total_enrolled ?? 0 }}</p>
          </div>
          <div class="bg-white rounded-xl p-4 border border-gray-100 shadow-sm text-center">
            <p class="text-xs text-gray-500 font-medium uppercase tracking-wider">Selesai</p>
            <p class="text-2xl font-bold text-green-600 mt-1">{{ data.total_completed ?? 0 }}</p>
          </div>
          <div class="bg-white rounded-xl p-4 border border-gray-100 shadow-sm text-center">
            <p class="text-xs text-gray-500 font-medium uppercase tracking-wider">Total Poin</p>
            <p class="text-2xl font-bold text-purple-600 mt-1">{{ data.total_points ?? 0 }}</p>
          </div>
          <div class="bg-white rounded-xl p-4 border border-gray-100 shadow-sm text-center">
            <p class="text-xs text-gray-500 font-medium uppercase tracking-wider">Compliance</p>
            <p class="text-2xl font-bold mt-1" :class="(data.compliance_rate ?? 0) >= 80 ? 'text-green-600' : 'text-red-500'">
              {{ data.compliance_rate ?? 0 }}%
            </p>
          </div>
        </div>
        <!-- Quiz SOP Periodik -->
        <div class="clay-card overflow-hidden">
          <div class="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 class="font-semibold text-gray-800">Quiz SOP Periodik</h3>
            <span v-if="data.quiz_summary" class="text-xs font-semibold px-2 py-0.5 rounded-full"
              :class="(data.quiz_summary.completion ?? 0) >= 80 ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'">
              {{ data.quiz_summary.done }}/{{ data.quiz_summary.assigned }} selesai
              <template v-if="data.quiz_summary.completion !== null"> · {{ data.quiz_summary.completion }}%</template>
            </span>
          </div>
          <div v-if="data.quiz_assignments?.length" class="divide-y divide-gray-50">
            <div v-for="q in data.quiz_assignments" :key="q.id" class="px-5 py-3 flex items-center justify-between gap-3">
              <div class="min-w-0">
                <p class="font-medium text-gray-800 text-sm truncate">{{ q.quiz_name }}</p>
                <p class="text-xs text-gray-400 mt-0.5">
                  <span v-if="q.period">Periode {{ q.period }}</span>
                  <span v-if="q.deadline"> · Deadline {{ q.deadline }}</span>
                  <span v-if="q.score !== null"> · Skor {{ Math.round(q.score) }}%</span>
                </p>
              </div>
              <span class="text-xs px-2 py-0.5 rounded-full font-medium shrink-0"
                :class="{
                  'bg-green-50 text-green-700': q.state === 'done',
                  'bg-blue-50 text-blue-600': q.state === 'in_progress',
                  'bg-gray-100 text-gray-500': q.state === 'pending',
                  'bg-red-50 text-red-600': q.state === 'overdue',
                  'bg-gray-50 text-gray-400': q.state === 'excluded',
                }"
              >{{ { pending: 'Belum', in_progress: 'Sedang', done: 'Selesai', overdue: 'Terlambat', excluded: 'Dikecualikan' }[q.state] || q.state }}</span>
            </div>
          </div>
          <div v-else class="px-5 py-6 text-center text-sm text-gray-400">Belum ada quiz SOP yang di-assign.</div>
        </div>

        <!-- Kursus Sedang Berjalan -->
        <div v-if="data.current_enrollments?.length" class="clay-card overflow-hidden">
          <div class="px-5 py-4 border-b border-gray-100">
            <h3 class="font-semibold text-gray-800">Kursus Sedang Berjalan</h3>
          </div>
          <div class="divide-y divide-gray-50">
            <div v-for="e in data.current_enrollments" :key="e.id" class="px-5 py-3">
              <div class="flex justify-between items-center mb-1">
                <p class="font-medium text-gray-800 text-sm">{{ e.course_name }}</p>
                <span class="text-xs text-gray-400">{{ e.progress }}%</span>
              </div>
              <div class="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div class="h-full bg-blue-500 rounded-full" :style="{ width: (e.progress || 0) + '%' }"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Kursus Selesai -->
        <div v-if="data.completed_enrollments?.length" class="clay-card overflow-hidden">
          <div class="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 class="font-semibold text-gray-800">Kursus Selesai</h3>
            <span class="text-xs text-green-600 font-semibold bg-green-50 px-2 py-0.5 rounded-full">{{ data.completed_enrollments.length }} kursus</span>
          </div>
          <div class="divide-y divide-gray-50">
            <div v-for="e in data.completed_enrollments" :key="e.id">
              <!-- Row header -->
              <div
                class="px-5 py-3 flex items-center gap-3 hover:bg-gray-50 cursor-pointer transition-colors"
                @click="profileExpandedId = profileExpandedId === e.id ? null : e.id"
              >
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 flex-wrap">
                    <p class="font-medium text-gray-800 text-sm">{{ e.course_name }}</p>
                    <span class="text-xs px-1.5 py-0.5 rounded-full font-medium"
                      :class="e.passed ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'">
                      {{ e.passed ? 'Lulus' : 'Tidak Lulus' }}
                    </span>
                  </div>
                  <p class="text-xs text-gray-400 mt-0.5">
                    Selesai: {{ e.completion_date || '—' }}
                    <span v-if="e.final_score > 0"> · Skor: {{ e.final_score }}%</span>
                    <span v-if="e.points_earned > 0"> · +{{ e.points_earned }} poin</span>
                  </p>
                </div>
                <span class="text-gray-400 text-xs shrink-0 select-none">
                  {{ profileExpandedId === e.id ? '▲' : '▼' }}
                </span>
              </div>
              <!-- Expanded module detail -->
              <div v-if="profileExpandedId === e.id && e.module_progress?.length" class="bg-gray-50 border-t border-gray-100 px-5 py-3 space-y-2">
                <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Detail Per Modul</p>
                <div v-for="mp in e.module_progress" :key="mp.module_name" class="flex items-center gap-3">
                  <span class="text-xs text-gray-600 w-44 truncate shrink-0">{{ mp.module_name }}</span>
                  <div class="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden max-w-28">
                    <div
                      class="h-full rounded-full transition-all"
                      :class="mp.video_watch_percentage >= 90 ? 'bg-green-500' : mp.video_watch_percentage >= 50 ? 'bg-yellow-400' : 'bg-red-400'"
                      :style="{ width: (mp.video_watch_percentage || 0) + '%' }"
                    ></div>
                  </div>
                  <span class="text-xs tabular-nums w-8 text-right text-gray-500">{{ mp.video_watch_percentage }}%</span>
                  <span class="text-xs px-2 py-0.5 rounded-full font-medium shrink-0"
                    :class="{
                      'bg-green-50 text-green-700': mp.status === 'completed',
                      'bg-orange-50 text-orange-600': mp.status === 'skipped',
                      'bg-blue-50 text-blue-600': mp.status === 'in_progress',
                      'bg-gray-100 text-gray-400': mp.status === 'not_started',
                    }"
                  >{{ { completed: 'Selesai', skipped: 'Diskip', in_progress: 'Sedang', not_started: 'Belum' }[mp.status] || mp.status }}</span>
                  <span v-if="mp.best_score > 0" class="text-xs text-purple-600 shrink-0">{{ mp.best_score }}%</span>
                </div>
              </div>
              <div v-else-if="profileExpandedId === e.id" class="bg-gray-50 border-t border-gray-100 px-5 py-3 text-xs text-gray-400">
                Tidak ada data modul.
              </div>
            </div>
          </div>
        </div>

        <div v-if="!data.current_enrollments?.length && !data.completed_enrollments?.length" class="clay-card p-5 text-center text-gray-400 text-sm">
          Tidak ada riwayat kursus
        </div>
      </div>
    </template>

    <!-- ── COMPLIANCE REPORT ── -->
    <template v-else-if="activeTab === 'compliance'">
      <div v-if="!data" class="bg-white rounded-xl p-12 text-center border border-gray-100 shadow-sm text-gray-400">
        Pilih departemen lalu klik Tampilkan
      </div>
      <div v-else>
        <div class="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
          <div class="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <p class="text-xs text-gray-500 font-medium uppercase tracking-wider">Total Karyawan</p>
            <p class="text-2xl font-bold text-blue-600 mt-1">{{ data.total_employees ?? 0 }}</p>
          </div>
          <div class="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <p class="text-xs text-gray-500 font-medium uppercase tracking-wider">Compliant</p>
            <p class="text-2xl font-bold text-green-600 mt-1">{{ data.compliant_employees ?? 0 }}</p>
          </div>
          <div class="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <p class="text-xs text-gray-500 font-medium uppercase tracking-wider">Non-Compliant</p>
            <p class="text-2xl font-bold text-red-500 mt-1">{{ data.non_compliant_employees ?? 0 }}</p>
          </div>
        </div>
        <div v-if="data.non_compliant_list?.length" class="clay-card overflow-hidden">
          <div class="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 class="font-semibold text-gray-800">Karyawan Non-Compliant</h3>
            <span class="text-xs text-red-500 font-medium">{{ data.non_compliant_list.length }} karyawan</span>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <th class="px-4 py-3 text-left font-medium">Karyawan</th>
                  <th class="px-4 py-3 text-center font-medium">Departemen</th>
                  <th class="px-4 py-3 text-center font-medium">Kursus Wajib Pending</th>
                  <th class="px-4 py-3 text-center font-medium">Compliance Rate</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-50">
                <tr v-for="emp in data.non_compliant_list" :key="emp.user_id" class="hover:bg-gray-50 transition-colors">
                  <td class="px-4 py-3 font-medium text-gray-800">{{ emp.name }}</td>
                  <td class="px-4 py-3 text-center text-gray-500 text-xs">{{ emp.department }}</td>
                  <td class="px-4 py-3 text-center text-red-500 font-semibold">{{ emp.pending_mandatory }}</td>
                  <td class="px-4 py-3 text-center">
                    <span class="text-xs font-semibold px-2 py-1 rounded-full bg-red-100 text-red-600">{{ emp.compliance_rate }}%</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div v-else class="clay-card p-10 text-center text-green-600 font-medium">
          Semua karyawan sudah compliant
        </div>
      </div>
    </template>

    <!-- ── AUTO ENROLL ── -->
    <template v-else-if="activeTab === 'auto_enroll'">
      <div v-if="autoEnrollResult" class="bg-green-50 border border-green-200 rounded-xl p-6">
        <p class="font-semibold text-green-700 mb-3">Auto Enroll Berhasil</p>
        <div class="grid grid-cols-3 gap-4">
          <div class="bg-white rounded-lg p-3 text-center border border-green-100">
            <p class="text-xs text-gray-500">Karyawan Diproses</p>
            <p class="text-2xl font-bold text-green-700 mt-1">{{ autoEnrollResult.employees_processed }}</p>
          </div>
          <div class="bg-white rounded-lg p-3 text-center border border-green-100">
            <p class="text-xs text-gray-500">Enrollment Dibuat</p>
            <p class="text-2xl font-bold text-blue-600 mt-1">{{ autoEnrollResult.enrollments_created }}</p>
          </div>
          <div class="bg-white rounded-lg p-3 text-center border border-green-100">
            <p class="text-xs text-gray-500">Sudah Terdaftar</p>
            <p class="text-2xl font-bold text-gray-500 mt-1">{{ autoEnrollResult.already_enrolled }}</p>
          </div>
        </div>
        <button @click="autoEnrollResult = null" class="mt-4 text-sm text-green-600 hover:underline">Enroll lagi</button>
      </div>
      <div v-else class="bg-white rounded-xl p-8 border border-gray-100 shadow-sm text-center">
        <UsersIcon class="w-10 h-10 text-gray-300 mx-auto mb-3" />
        <p class="text-gray-500 text-sm">
          Jika karyawan dipilih, hanya karyawan tersebut yang akan di-enroll.<br>
          Jika kosong, semua karyawan aktif akan di-enroll ke kursus wajib mereka.
        </p>
      </div>
    </template>

    <!-- ── PERFORMANCE IMPACT ── -->
    <template v-else-if="activeTab === 'performance'">
      <div v-if="!data" class="bg-white rounded-xl p-12 text-center border border-gray-100 shadow-sm text-gray-400">
        Atur filter lalu klik Tampilkan
      </div>
      <div v-else class="space-y-4">
        <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div class="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <p class="text-xs text-gray-500 font-medium uppercase tracking-wider">Skor Korelasi</p>
            <p class="text-2xl font-bold text-blue-600 mt-1">{{ data.correlation_score ?? '—' }}</p>
          </div>
          <div class="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <p class="text-xs text-gray-500 font-medium uppercase tracking-wider">Avg Improvement</p>
            <p class="text-2xl font-bold text-green-600 mt-1">{{ data.avg_performance_improvement ?? '—' }}</p>
          </div>
          <div class="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <p class="text-xs text-gray-500 font-medium uppercase tracking-wider">Jumlah Sampel</p>
            <p class="text-2xl font-bold text-purple-600 mt-1">{{ data.sample_size ?? 0 }}</p>
          </div>
        </div>
        <div v-if="data.insights?.length" class="clay-card p-5">
          <h3 class="font-semibold text-gray-800 mb-3">Insights</h3>
          <ul class="space-y-2">
            <li v-for="(ins, i) in data.insights" :key="i" class="flex items-start gap-2 text-sm text-gray-600">
              <span class="text-blue-500 mt-0.5 shrink-0">•</span>{{ ins }}
            </li>
          </ul>
        </div>
      </div>
    </template>

    <!-- Quiz Detail Modal (claymorphism) -->
    <Teleport to="body">
      <div v-if="quizModal.open" class="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4" @click.self="quizModal.open = false">
        <div class="w-full max-w-xl max-h-[88vh] flex flex-col rounded-3xl p-6" style="background:#f0f1f5; box-shadow:12px 12px 28px rgba(174,174,192,0.55),-12px -12px 28px rgba(255,255,255,0.95)">
          <!-- Header -->
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg shrink-0"
                style="background:linear-gradient(135deg,#B70000,#ff5252); box-shadow:4px 4px 10px rgba(183,0,0,0.35),-2px -2px 6px rgba(255,255,255,0.6)">
                {{ (quizModal.name || 'U').charAt(0).toUpperCase() }}
              </div>
              <div>
                <h3 class="text-lg font-bold text-gray-800 leading-tight">{{ quizModal.name }}</h3>
                <p class="text-xs text-gray-500">Nilai Quiz SOP</p>
              </div>
            </div>
            <button @click="quizModal.open = false" class="w-9 h-9 flex items-center justify-center rounded-2xl text-gray-500" style="background:#f0f1f5; box-shadow:3px 3px 6px rgba(174,174,192,0.5),-3px -3px 6px rgba(255,255,255,0.9)">✕</button>
          </div>

          <div v-if="quizModal.loading" class="py-12 text-center text-gray-400 text-sm">Memuat data...</div>

          <template v-else>
            <!-- Summary cards -->
            <div class="grid grid-cols-3 gap-3 mb-5">
              <div class="rounded-2xl p-3 text-center" style="background:#f0f1f5; box-shadow:inset 3px 3px 7px rgba(174,174,192,0.55),inset -3px -3px 7px rgba(255,255,255,0.9)">
                <p class="text-[10px] text-gray-500 font-semibold uppercase tracking-wide">Assigned</p>
                <p class="text-2xl font-extrabold text-gray-800 mt-0.5">{{ quizModal.summary.assigned }}</p>
              </div>
              <div class="rounded-2xl p-3 text-center" style="background:#f0f1f5; box-shadow:inset 3px 3px 7px rgba(174,174,192,0.55),inset -3px -3px 7px rgba(255,255,255,0.9)">
                <p class="text-[10px] text-gray-500 font-semibold uppercase tracking-wide">Selesai</p>
                <p class="text-2xl font-extrabold text-emerald-600 mt-0.5">{{ quizModal.summary.done }}</p>
              </div>
              <div class="rounded-2xl p-3 text-center" style="background:#f0f1f5; box-shadow:inset 3px 3px 7px rgba(174,174,192,0.55),inset -3px -3px 7px rgba(255,255,255,0.9)">
                <p class="text-[10px] text-gray-500 font-semibold uppercase tracking-wide">Completion</p>
                <p class="text-2xl font-extrabold mt-0.5" :class="(quizModal.summary.completion ?? 0) >= 80 ? 'text-emerald-600' : 'text-amber-500'">{{ quizModal.summary.completion ?? 0 }}%</p>
              </div>
            </div>

            <!-- Quiz list -->
            <div class="flex-1 overflow-y-auto space-y-3 pr-1">
              <div v-if="!quizModal.assignments.length" class="py-8 text-center text-sm text-gray-400">Belum ada quiz yang di-assign.</div>
              <div
                v-for="q in quizModal.assignments"
                :key="q.id"
                class="rounded-2xl p-4 flex items-center gap-4"
                style="background:#f0f1f5; box-shadow:5px 5px 12px rgba(174,174,192,0.4),-5px -5px 12px rgba(255,255,255,0.85)"
              >
                <!-- Score dial -->
                <div class="w-16 h-16 rounded-2xl flex flex-col items-center justify-center shrink-0"
                  :style="scoreDialStyle(q)">
                  <span class="text-lg font-extrabold leading-none">{{ q.score !== null && q.score !== undefined ? Math.round(q.score) : '–' }}</span>
                  <span class="text-[9px] font-semibold opacity-80 mt-0.5">skor</span>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="font-bold text-gray-800 text-sm truncate">{{ q.quiz_name }}</p>
                  <p class="text-xs text-gray-500 mt-0.5">
                    <span v-if="q.period">Periode {{ q.period }}</span>
                    <span v-if="q.deadline"> · Deadline {{ q.deadline }}</span>
                  </p>
                  <div class="flex items-center gap-2 mt-1.5">
                    <span class="text-[10px] px-2 py-0.5 rounded-full font-bold"
                      :class="{
                        'bg-emerald-100 text-emerald-700': q.state === 'done',
                        'bg-blue-100 text-blue-700': q.state === 'in_progress',
                        'bg-gray-200 text-gray-600': q.state === 'pending',
                        'bg-red-100 text-red-600': q.state === 'overdue',
                        'bg-gray-100 text-gray-400': q.state === 'excluded',
                      }"
                    >{{ { pending: 'Belum', in_progress: 'Sedang', done: 'Selesai', overdue: 'Terlambat', excluded: 'Dikecualikan' }[q.state] || q.state }}</span>
                    <span v-if="q.is_passed === true" class="text-[10px] font-bold text-emerald-600">✓ Lulus</span>
                    <span v-else-if="q.is_passed === false && q.state === 'done'" class="text-[10px] font-bold text-red-500">✗ Belum Lulus</span>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
    </Teleport>

    <!-- Toast -->
    <div v-if="toast" class="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm px-5 py-2.5 rounded-full shadow-lg z-50">
      {{ toast }}
    </div>
  </div>
</template>

<script setup>
import { ref, defineComponent, h, watch, onMounted } from 'vue'
import { lmsApi } from '../../services/lmsApi'
import { UsersIcon } from '@heroicons/vue/24/outline'

const EmployeePicker = defineComponent({
  name: 'EmployeePicker',
  props: {
    userId: { type: Number, default: null },
    placeholder: { type: String, default: 'Cari karyawan...' },
    clearable: { type: Boolean, default: false },
  },
  emits: ['update:userId', 'select'],
  setup(props, { emit }) {
    const query = ref('')
    const suggestions = ref([])
    const selectedName = ref('')
    let debTimer = null

    watch(() => props.userId, (val) => {
      if (!val) { query.value = ''; selectedName.value = '' }
    })

    async function onInput() {
      selectedName.value = ''
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
      selectedName.value = emp.name
      query.value = emp.name
      suggestions.value = []
      emit('update:userId', emp.user_id)
      emit('select', emp)
    }

    function clear() {
      query.value = ''
      selectedName.value = ''
      suggestions.value = []
      emit('update:userId', null)
    }

    return () => h('div', { class: 'relative' }, [
      h('div', { class: 'flex gap-2' }, [
        h('div', { class: 'relative flex-1' }, [
          h('input', {
            value: query.value,
            onInput: (e) => { query.value = e.target.value; onInput() },
            placeholder: props.placeholder,
            class: 'w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 pr-8',
          }),
          selectedName.value && props.clearable
            ? h('button', {
                onClick: clear,
                class: 'absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg leading-none',
                title: 'Hapus pilihan',
              }, '×')
            : null,
        ]),
      ]),
      suggestions.value.length
        ? h('div', { class: 'absolute z-20 top-full left-0 right-0 mt-1 bg-white rounded-xl border border-gray-200 shadow-xl max-h-52 overflow-y-auto' },
            suggestions.value.map(emp =>
              h('button', {
                key: emp.user_id,
                onClick: () => select(emp),
                class: 'w-full px-4 py-2.5 text-left hover:bg-blue-50 transition-colors flex items-center justify-between gap-3',
              }, [
                h('div', {}, [
                  h('p', { class: 'text-sm font-medium text-gray-800' }, emp.name),
                  h('p', { class: 'text-xs text-gray-400' }, emp.job_title || emp.department),
                ]),
                h('span', { class: 'text-xs text-gray-300 shrink-0' }, emp.department),
              ])
            )
          )
        : null,
    ])
  },
})
// ─────────────────────────────────────────────────────────────────────

const loading = ref(false)
const error = ref('')
const data = ref(null)
const activeTab = ref('search')
const page = ref(1)
const toast = ref('')

const searchQuery = ref('')
const filterDeptId = ref(null)
const filterUserId = ref(null)
const profileUserId = ref(null)
const profileExpandedId = ref(null)
const autoEnrollUserId = ref(null)
const autoEnrolling = ref(false)
const autoEnrollResult = ref(null)

const departments = ref([])

const tabs = [
  { key: 'search', label: 'Cari Karyawan' },
  { key: 'profile', label: 'Profil LMS' },
  { key: 'compliance', label: 'Compliance' },
  { key: 'auto_enroll', label: 'Auto Enroll' },
  { key: 'performance', label: 'Impact Kinerja' },
]

async function loadDepartments() {
  try {
    const res = await lmsApi.employeeDepartments()
    departments.value = Array.isArray(res) ? res : []
  } catch { departments.value = [] }
}

function switchTab(key) {
  activeTab.value = key
  page.value = 1
  data.value = null
  profileExpandedId.value = null
  if (key === 'search') load()
}

let debounceTimer = null
function debouncedLoad() {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => { page.value = 1; load() }, 400)
}

async function load() {
  if (activeTab.value === 'auto_enroll') return
  if (activeTab.value === 'profile' && !profileUserId.value) return
  loading.value = true
  error.value = ''
  data.value = null
  try {
    if (activeTab.value === 'search') {
      const params = { page: page.value, limit: 20 }
      if (searchQuery.value) params.search = searchQuery.value
      if (filterDeptId.value) params.department_id = filterDeptId.value
      data.value = await lmsApi.employeeSearch(params)
    } else if (activeTab.value === 'profile') {
      data.value = await lmsApi.employeeProfile({ user_id: profileUserId.value })
    } else if (activeTab.value === 'compliance') {
      const params = {}
      if (filterDeptId.value) params.department_id = filterDeptId.value
      data.value = await lmsApi.employeeComplianceReport(params)
    } else if (activeTab.value === 'performance') {
      const params = {}
      if (filterUserId.value) params.user_id = filterUserId.value
      if (filterDeptId.value) params.department_id = filterDeptId.value
      data.value = await lmsApi.employeePerformanceImpact(params)
    }
  } catch (e) {
    error.value = e.message || 'Gagal memuat data'
  } finally {
    loading.value = false
  }
}

function viewProfile(userId, name) {
  profileUserId.value = userId
  activeTab.value = 'profile'
  load()
}

function changePage(p) {
  if (!data.value?.pagination) return
  if (p < 1 || p > data.value.pagination.total_pages) return
  page.value = p; load()
}

async function doAutoEnroll() {
  autoEnrolling.value = true
  autoEnrollResult.value = null
  error.value = ''
  try {
    const params = {}
    if (autoEnrollUserId.value) params.user_id = autoEnrollUserId.value
    autoEnrollResult.value = await lmsApi.employeeAutoEnroll(params)
    showToast('Auto enroll berhasil!')
  } catch (e) {
    error.value = e.message || 'Gagal auto enroll'
  } finally {
    autoEnrolling.value = false
  }
}

function showToast(msg) { toast.value = msg; setTimeout(() => { toast.value = '' }, 3000) }

// ── Quiz detail modal ─────────────────────────────────────────────────
const quizModal = ref({ open: false, loading: false, name: '', summary: {}, assignments: [] })

async function openQuizDetail(userId, name) {
  quizModal.value = { open: true, loading: true, name, summary: {}, assignments: [] }
  try {
    const res = await lmsApi.employeeProfile({ user_id: userId })
    quizModal.value.summary = res?.quiz_summary || { assigned: 0, done: 0, completion: 0 }
    quizModal.value.assignments = res?.quiz_assignments || []
  } catch (e) {
    showToast(e.message || 'Gagal memuat nilai quiz')
    quizModal.value.summary = { assigned: 0, done: 0, completion: 0 }
  } finally {
    quizModal.value.loading = false
  }
}

// Warna dial skor: hijau (lulus/tinggi), amber (sedang), merah (rendah), abu (belum)
function scoreDialStyle(q) {
  const inset = 'box-shadow:inset 3px 3px 6px rgba(0,0,0,0.12),inset -2px -2px 6px rgba(255,255,255,0.5);'
  if (q.score === null || q.score === undefined || q.state !== 'done') {
    return `background:#e2e4ea; color:#9ca3af; ${inset}`
  }
  const s = q.score
  if (q.is_passed || s >= 80) return `background:linear-gradient(135deg,#34d399,#10b981); color:#fff; ${inset}`
  if (s >= 60) return `background:linear-gradient(135deg,#fbbf24,#f59e0b); color:#fff; ${inset}`
  return `background:linear-gradient(135deg,#f87171,#ef4444); color:#fff; ${inset}`
}

onMounted(async () => {
  await loadDepartments()
  load()
})
</script>
