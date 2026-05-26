<template>
  <div class="flex flex-col h-full bg-gray-50">
    <!-- Header -->
    <div class="bg-white border-b border-gray-200 px-6 py-4">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-xl font-bold text-gray-900">Manajemen Quiz Program</h1>
          <p class="text-sm text-gray-500 mt-0.5">Kelola program assessment untuk multiple quiz banks</p>
        </div>
        <button
          @click="router.push('/dashboard/quiz/program/new')"
          class="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#B70000] text-white text-sm font-semibold hover:bg-[#950000] transition-colors shadow-sm"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Buat Program Baru
        </button>
      </div>

      <!-- Filters -->
      <div class="flex flex-wrap gap-3 mt-4">
        <select
          v-model="filterState"
          @change="load"
          class="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#B70000]"
        >
          <option value="">Semua Status</option>
          <option value="draft">Draft</option>
          <option value="active">Aktif</option>
          <option value="closed">Tutup</option>
        </select>

        <select
          v-model="filterPeriod"
          @change="load"
          class="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#B70000]"
        >
          <option value="">Semua Periode</option>
          <option v-for="p in periods" :key="p" :value="p">{{ fmtPeriod(p) }}</option>
        </select>

        <button @click="load" class="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50">
          <svg
            class="w-4 h-4 text-gray-500"
            :class="loading ? 'animate-spin' : ''"
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Error -->
    <div v-if="error" class="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
      {{ error }}
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex-1 flex items-center justify-center">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#B70000]"></div>
    </div>

    <!-- Table -->
    <div v-else class="flex-1 overflow-auto">
      <table class="w-full min-w-[960px]">
        <thead class="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
          <tr>
            <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Program</th>
            <th class="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Quiz Banks</th>
            <th class="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Soal</th>
            <th class="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Periode</th>
            <th class="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Deadline</th>
            <th class="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Progress</th>
            <th class="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-28">Status</th>
            <th class="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 bg-white">
          <tr v-if="programs.length === 0">
            <td colspan="8" class="px-6 py-16 text-center">
              <svg class="w-10 h-10 mx-auto mb-3 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <p class="text-gray-400 font-medium">Belum ada quiz program</p>
              <button @click="router.push('/dashboard/quiz/program/new')" class="mt-2 text-sm text-[#B70000] font-semibold">
                Buat program pertama →
              </button>
            </td>
          </tr>

          <tr v-for="p in programs" :key="p.id" class="hover:bg-gray-50 transition-colors group">
            <!-- Name -->
            <td class="px-6 py-4">
              <p class="text-sm font-semibold text-gray-900">{{ p.name }}</p>
              <p class="text-xs text-gray-400 font-mono mt-0.5">{{ p.code }}</p>
              <p v-if="p.description" class="text-xs text-gray-500 mt-1 line-clamp-1">{{ p.description }}</p>
            </td>

            <!-- Bank count -->
            <td class="px-4 py-4 text-center">
              <span class="text-sm font-semibold text-gray-700">{{ p.bank_count || 0 }}</span>
              <div class="text-xs text-gray-400 mt-0.5 space-x-1">
                <span v-if="p.banks_draft" class="text-gray-400">{{ p.banks_draft }}D</span>
                <span v-if="p.banks_review" class="text-amber-500">{{ p.banks_review }}R</span>
                <span v-if="p.banks_active" class="text-green-600">{{ p.banks_active }}A</span>
                <span v-if="p.banks_closed" class="text-red-500">{{ p.banks_closed }}C</span>
              </div>
            </td>

            <!-- Total questions -->
            <td class="px-4 py-4 text-center">
              <span class="text-sm font-semibold text-gray-700">{{ p.total_questions || 0 }}</span>
              <span class="text-xs text-gray-400 block">{{ p.total_weight || 0 }}pt</span>
            </td>

            <!-- Period -->
            <td class="px-4 py-4 text-center">
              <span class="text-sm text-gray-600">{{ fmtPeriod(p.period) }}</span>
              <span class="text-xs text-gray-400 block">{{ fmtPeriodType(p.period_type) }}</span>
            </td>

            <!-- Deadline -->
            <td class="px-4 py-4 text-center text-sm text-gray-600">
              {{ p.deadline ? fmtDate(p.deadline) : '—' }}
            </td>

            <!-- Progress -->
            <td class="px-4 py-4">
              <div v-if="p.state === 'active' || p.state === 'closed'" class="flex items-center gap-2 justify-center">
                <div class="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div class="h-full bg-[#B70000] rounded-full" :style="{ width: `${Math.min(p.completion_rate || 0, 100)}%` }"></div>
                </div>
                <span class="text-xs text-gray-500 w-8">{{ (p.completion_rate || 0).toFixed(0) }}%</span>
              </div>
              <p class="text-xs text-gray-400 text-center mt-0.5" v-if="p.total_assignments">
                {{ p.total_assignments }} assigned
              </p>
              <div v-if="p.state === 'active' && p.avg_score" class="text-xs text-gray-500 text-center mt-0.5">
                Avg: {{ p.avg_score.toFixed(1) }}
              </div>
              <span v-if="p.state === 'draft'" class="text-xs text-gray-300">—</span>
            </td>

            <!-- State badge -->
            <td class="px-4 py-4 text-center">
              <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold" :class="stateCls(p.state)">
                {{ stateLabel(p.state) }}
              </span>
            </td>

            <!-- Actions -->
            <td class="px-6 py-4">
              <div class="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">

                <!-- View Detail -->
                <button
                  @click="router.push(`/dashboard/quiz/program/${p.id}`)"
                  class="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
                  title="Lihat Detail"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>

                <!-- Edit (draft only) -->
                <button
                  v-if="p.state === 'draft'"
                  @click="router.push(`/dashboard/quiz/program/${p.id}/edit`)"
                  class="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                  title="Edit"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>

                <!-- Activate (draft only) -->
                <button
                  v-if="p.state === 'draft' && p.banks_review > 0"
                  @click="doAction(p, 'activate')"
                  :disabled="!!actionId"
                  class="p-1.5 rounded-lg text-green-600 hover:bg-green-50 transition-colors disabled:opacity-40"
                  title="Aktifkan Program"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>

                <!-- Close (active only) -->
                <button
                  v-if="p.state === 'active'"
                  @click="doAction(p, 'close')"
                  :disabled="!!actionId"
                  class="p-1.5 rounded-lg text-orange-500 hover:bg-orange-50 transition-colors disabled:opacity-40"
                  title="Tutup Program"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 10h6v4H9z" />
                  </svg>
                </button>

                <!-- Reopen (closed only) -->
                <button
                  v-if="p.state === 'closed'"
                  @click="doAction(p, 'reopen')"
                  :disabled="!!actionId"
                  class="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 transition-colors disabled:opacity-40"
                  title="Buka Kembali"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>

                <!-- Monitoring (active/closed) -->
                <button
                  v-if="p.state === 'active' || p.state === 'closed'"
                  @click="openMonitoring(p)"
                  class="p-1.5 rounded-lg text-teal-600 hover:bg-teal-50 transition-colors"
                  title="Monitoring Karyawan"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </button>

                <!-- Delete (draft only) -->
                <button
                  v-if="p.state === 'draft'"
                  @click="deleteTarget = p"
                  class="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-colors"
                  title="Hapus"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>

              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- State flow legend -->
    <div class="bg-white border-t border-gray-200 px-6 py-3 flex items-center gap-6 text-xs text-gray-400">
      <span class="font-semibold text-gray-500">Alur Status:</span>
      <div class="flex items-center gap-1.5">
        <span class="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">Draft</span>
        <span>→ Activate →</span>
        <span class="px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">Aktif</span>
        <span>→ Close →</span>
        <span class="px-2 py-0.5 rounded-full bg-red-100 text-red-600 font-medium">Tutup</span>
      </div>
      <span class="ml-4 text-gray-400">Bank Status: <span class="text-gray-500">D=Draft, R=Review, A=Aktif, C=Closed</span></span>
    </div>

    <!-- Delete confirm modal -->
    <Teleport to="body">
      <div v-if="deleteTarget" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl w-full max-w-sm p-6 space-y-4">
          <div class="w-12 h-12 mx-auto bg-red-100 rounded-full flex items-center justify-center">
            <svg class="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="text-center">
            <h3 class="font-bold text-gray-900">Hapus Quiz Program?</h3>
            <p class="text-sm text-gray-500 mt-2">
              <strong>{{ deleteTarget.name }}</strong> beserta semua quiz banks di dalamnya akan dihapus permanen.
            </p>
          </div>
          <div class="flex gap-3">
            <button @click="deleteTarget = null" class="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600">Batal</button>
            <button @click="doDelete" :disabled="!!actionId" class="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-bold disabled:opacity-50">
              {{ actionId ? '...' : 'Hapus' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Program Monitoring Modal -->
    <Teleport to="body">
      <div v-if="monitoringTarget" class="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto" @click.self="monitoringTarget = null">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-5xl my-4" @click.stop>

          <!-- Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div>
              <h3 class="font-bold text-gray-900">Monitoring Program</h3>
              <p class="text-xs text-gray-500 mt-0.5">{{ monitoringTarget.name }}</p>
            </div>
            <div class="flex items-center gap-2">
              <button @click="openMonitoring(monitoringTarget)" :disabled="monitoringLoading"
                class="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 disabled:opacity-40" title="Refresh">
                <svg class="w-4 h-4" :class="monitoringLoading ? 'animate-spin' : ''" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              <button @click="monitoringTarget = null" class="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Loading -->
          <div v-if="monitoringLoading" class="py-16 flex justify-center">
            <div class="w-8 h-8 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
          </div>
          <div v-else-if="monitoringError" class="px-6 py-10 text-center text-red-500 text-sm">{{ monitoringError }}</div>

          <template v-else-if="monitoringData">
            <!-- Summary pills -->
            <div class="px-6 py-3 flex flex-wrap gap-2 border-b border-gray-50 bg-gray-50/50">
              <span class="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                {{ monitoringData.summary.total_employees }} karyawan
              </span>
              <span class="px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-600">
                Belum mulai: {{ monitoringData.summary.not_started }}
              </span>
              <span class="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-50 text-yellow-700">
                Sedang berjalan: {{ monitoringData.summary.in_progress }}
              </span>
              <span class="px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
                Sebagian selesai: {{ monitoringData.summary.partial }}
              </span>
              <span class="px-3 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700">
                Selesai semua: {{ monitoringData.summary.complete }}
              </span>
              <span class="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
                Lulus semua: {{ monitoringData.summary.passed_all }}
              </span>
            </div>

            <!-- Filter -->
            <div class="px-6 py-2 border-b border-gray-50 flex items-center gap-3">
              <select v-model="monitoringFilter"
                class="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-teal-500">
                <option value="">Semua Karyawan</option>
                <option value="not_started">Belum Mulai</option>
                <option value="in_progress">Sedang Berjalan</option>
                <option value="partial">Sebagian Selesai</option>
                <option value="complete">Selesai Semua</option>
              </select>
              <span class="text-xs text-gray-400">{{ filteredMonitoringEmployees.length }} ditampilkan</span>
            </div>

            <!-- Matrix table -->
            <div class="overflow-auto max-h-[60vh]">
              <table class="w-full text-xs min-w-max">
                <thead class="sticky top-0 bg-white border-b border-gray-100 z-10">
                  <tr>
                    <th class="px-4 py-3 text-left font-semibold text-gray-600 min-w-[180px]">Karyawan</th>
                    <th class="px-3 py-3 text-center font-semibold text-gray-500 min-w-[28px]">•</th>
                    <th class="px-3 py-2 text-center font-semibold text-gray-600 min-w-[80px]">Mulai</th>
                    <th class="px-3 py-2 text-center font-semibold text-gray-600 min-w-[80px]">Selesai</th>
                    <th class="px-3 py-2 text-center font-semibold text-gray-600 min-w-[80px]">Durasi</th>
                    <!-- Per quiz bank headers -->
                    <th v-for="bank in monitoringData.quiz_banks" :key="bank.id"
                      class="px-3 py-2 text-center font-semibold text-gray-600 min-w-[120px] border-l border-gray-100">
                      <p class="truncate max-w-[110px] mx-auto" :title="bank.name">{{ bank.name }}</p>
                      <p class="text-gray-400 font-normal">≥{{ bank.passing_score }}% · {{ bank.duration_minutes }}m</p>
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-50">
                  <tr v-for="emp in filteredMonitoringEmployees" :key="emp.employee_id"
                    class="hover:bg-gray-50 transition-colors">
                    <!-- Employee info -->
                    <td class="px-4 py-3">
                      <p class="font-semibold text-gray-800 text-sm">{{ emp.employee_name }}</p>
                      <p class="text-gray-400 text-xs">{{ emp.job_title }}</p>
                    </td>
                    <!-- Overall status dot -->
                    <td class="px-3 py-3 text-center">
                      <span class="inline-block w-2.5 h-2.5 rounded-full"
                        :class="{
                          'bg-red-400': emp.overall_status === 'not_started',
                          'bg-yellow-400 animate-pulse': emp.overall_status === 'partial' && emp.banks.some(b => b.status === 'in_progress'),
                          'bg-yellow-300': emp.overall_status === 'partial' && !emp.banks.some(b => b.status === 'in_progress'),
                          'bg-green-500': emp.overall_status === 'complete',
                        }" :title="{ not_started: 'Belum mulai', partial: 'Sebagian', complete: 'Selesai' }[emp.overall_status]">
                      </span>
                    </td>
                    <!-- Program start time -->
                    <td class="px-3 py-2 text-center text-gray-500">
                      <span v-if="emp.program_started_at" class="text-xs">{{ fmtShortTime(emp.program_started_at) }}</span>
                      <span v-else class="text-gray-300 text-xs">-</span>
                    </td>
                    <!-- Program finish time / elapsed -->
                    <td class="px-3 py-2 text-center">
                      <span v-if="emp.program_finished_at" class="text-xs text-green-600 font-semibold">
                        {{ fmtShortTime(emp.program_finished_at) }}
                      </span>
                      <span v-else-if="emp.program_started_iso && emp.overall_status !== 'not_started'"
                        class="font-mono text-xs text-yellow-600 font-semibold">
                        {{ formatElapsed(emp.program_started_iso) }}
                      </span>
                      <span v-else class="text-gray-300 text-xs">-</span>
                    </td>
                    <!-- Total duration -->
                    <td class="px-3 py-2 text-center text-gray-500 text-xs">
                      {{ emp.overall_status === 'complete' ? formatDuration(emp.total_duration_sec) : '-' }}
                    </td>
                    <!-- Per-bank cells -->
                    <td v-for="cell in emp.banks" :key="cell.bank_id"
                      class="px-3 py-2 text-center border-l border-gray-50">
                      <!-- not_started -->
                      <span v-if="cell.status === 'not_started'"
                        class="inline-block px-2 py-0.5 rounded-full bg-gray-100 text-gray-400 text-[10px]">
                        Belum
                      </span>
                      <!-- in_progress + countdown -->
                      <div v-else-if="cell.status === 'in_progress'">
                        <span class="inline-block px-2 py-0.5 rounded-full bg-yellow-50 text-yellow-700 text-[10px] font-semibold">
                          Sedang
                        </span>
                        <p v-if="cell.expires_at" class="font-mono font-bold mt-0.5"
                          :class="isExpired(cell.expires_at) ? 'text-orange-500' : parseInt(formatCountdown(cell.expires_at)) < 5 ? 'text-red-600 animate-pulse' : 'text-yellow-600'">
                          ⏱ {{ formatCountdown(cell.expires_at) }}
                        </p>
                      </div>
                      <!-- submitted -->
                      <div v-else-if="cell.status === 'submitted'">
                        <span class="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold"
                          :class="cell.is_passed ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'">
                          {{ cell.is_passed ? '✓ Lulus' : '✗ Gagal' }}
                        </span>
                        <p class="text-gray-500 font-semibold mt-0.5">{{ cell.score }}%</p>
                      </div>
                      <!-- expired -->
                      <span v-else-if="cell.status === 'expired'"
                        class="inline-block px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 text-[10px]">
                        Expired
                      </span>
                    </td>
                  </tr>
                  <tr v-if="filteredMonitoringEmployees.length === 0">
                    <td :colspan="5 + (monitoringData.quiz_banks?.length || 0)"
                      class="px-4 py-8 text-center text-gray-400">Tidak ada data</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </template>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { quizApi } from '../../services/quizApi'

const router = useRouter()
const loading = ref(true)
const error = ref('')
const programs = ref([])
const filterState = ref('')
const filterPeriod = ref('')
const actionId = ref(null)
const deleteTarget = ref(null)

const periods = (() => {
  const list = []
  const now = new Date()
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    list.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }
  return list
})()

async function load() {
  loading.value = true
  error.value = ''
  try {
    const params = {}
    if (filterState.value) params.state = filterState.value
    if (filterPeriod.value) params.period = filterPeriod.value
    const data = await quizApi.programList(params)
    programs.value = data.programs || []
  } catch (e) {
    error.value = e.message || 'Gagal memuat program'
  } finally {
    loading.value = false
  }
}

async function doAction(program, action) {
  const msgs = {
    activate: `Aktifkan "${program.name}"? Semua quiz banks yang ready akan dipublish dan karyawan di-assign.`,
    close: `Tutup "${program.name}"? Semua quiz banks akan ditutup.`,
    reopen: `Buka kembali "${program.name}"?`,
  }
  if (!confirm(msgs[action])) return
  actionId.value = program.id
  try {
    if (action === 'activate') await quizApi.programActivate(program.id)
    else if (action === 'close') await quizApi.programClose(program.id)
    else if (action === 'reopen') await quizApi.programReopen(program.id)
    await load()
  } catch (e) {
    error.value = e.message
  } finally {
    actionId.value = null
  }
}

async function doDelete() {
  if (!deleteTarget.value) return
  actionId.value = deleteTarget.value.id
  try {
    await quizApi.programDelete(deleteTarget.value.id)
    deleteTarget.value = null
    await load()
  } catch (e) {
    error.value = e.message
  } finally {
    actionId.value = null
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

function fmtDate(d) {
  return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

function fmtPeriod(p) {
  if (!p) return '—'
  const [y, m] = p.split('-')
  if (m) {
    return `${['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'][+m - 1]} ${y}`
  }
  return p
}

function fmtPeriodType(t) {
  return { monthly: 'Bulanan', quarterly: 'Kuartalan', yearly: 'Tahunan', onetime: 'Satu Kali' }[t] || t
}

// ── Monitoring ────────────────────────────────────────────────────────
const monitoringTarget = ref(null)
const monitoringData = ref(null)
const monitoringLoading = ref(false)
const monitoringError = ref('')
const monitoringFilter = ref('')
const now = ref(Date.now())
let clockInterval = null

const filteredMonitoringEmployees = computed(() => {
  if (!monitoringData.value?.employees) return []
  const emps = monitoringData.value.employees
  if (!monitoringFilter.value) return emps
  if (monitoringFilter.value === 'in_progress') {
    return emps.filter(e => e.banks.some(b => b.status === 'in_progress'))
  }
  return emps.filter(e => e.overall_status === monitoringFilter.value)
})

function formatCountdown(expiresAtIso) {
  if (!expiresAtIso) return '--:--'
  const remaining = Math.max(0, new Date(expiresAtIso).getTime() - now.value)
  if (remaining === 0) return '00:00'
  const totalSec = Math.floor(remaining / 1000)
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function isExpired(expiresAtIso) {
  return expiresAtIso ? new Date(expiresAtIso).getTime() <= now.value : false
}

// Elapsed time since program started (live ticking)
function formatElapsed(startedIso) {
  if (!startedIso) return '--:--'
  const elapsed = Math.floor((now.value - new Date(startedIso).getTime()) / 1000)
  if (elapsed < 0) return '00:00'
  const h = Math.floor(elapsed / 3600)
  const m = Math.floor((elapsed % 3600) / 60)
  const s = elapsed % 60
  if (h > 0) return `${h}j ${String(m).padStart(2, '0')}m`
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

// Format total duration from seconds
function formatDuration(totalSec) {
  if (!totalSec) return '-'
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  if (h > 0) return `${h}j ${m}m`
  if (m > 0) return `${m}m ${s}d`
  return `${s}d`
}

function fmtShortTime(dtStr) {
  if (!dtStr) return '-'
  // "2026-05-26 10:30:00" → "10:30"
  return dtStr.slice(11, 16)
}

async function openMonitoring(program) {
  monitoringTarget.value = program
  monitoringData.value = null
  monitoringError.value = ''
  monitoringFilter.value = ''
  monitoringLoading.value = true
  if (!clockInterval) {
    clockInterval = setInterval(() => { now.value = Date.now() }, 1000)
  }
  try {
    monitoringData.value = await quizApi.adminProgramMonitoring(program.id)
  } catch (e) {
    monitoringError.value = e.message || 'Gagal memuat data monitoring'
  } finally {
    monitoringLoading.value = false
  }
}

onUnmounted(() => { if (clockInterval) clearInterval(clockInterval) })

onMounted(load)
</script>
