<template>
  <div class="flex flex-col h-full bg-gray-50">
    <!-- Header -->
    <div class="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 class="text-xl font-bold text-gray-900">Manajemen Quiz Bank</h1>
          <p class="text-sm text-gray-500 mt-0.5">Buat dan kelola quiz assessment SOP</p>
        </div>
        <div class="flex flex-wrap items-center gap-2 sm:gap-3 w-full lg:w-auto">
          <!-- Download Template -->
          <button
            @click="downloadTemplate"
            class="flex-1 sm:flex-none justify-center flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors min-h-[44px]"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Template
          </button>

          <!-- Import Excel -->
          <button
            @click="showImportModal = true"
            class="flex-1 sm:flex-none justify-center flex items-center gap-2 px-4 py-2.5 rounded-lg border border-blue-300 bg-blue-50 text-blue-700 text-sm font-semibold hover:bg-blue-100 transition-colors min-h-[44px]"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Import Excel
          </button>

          <!-- Create New -->
          <button
            @click="router.push('/dashboard/quiz/manage/new')"
            class="w-full sm:w-auto justify-center flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#B70000] text-white text-sm font-semibold hover:bg-[#950000] transition-colors shadow-sm min-h-[44px]"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Buat Quiz Baru
          </button>
        </div>
      </div>

      <!-- Filters -->
      <div class="grid grid-cols-1 sm:grid-cols-3 lg:flex lg:flex-wrap gap-3 mt-4">
        <select
          v-model="filterProgram"
          @change="load"
          class="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#B70000] w-full lg:w-auto min-h-[40px]"
        >
          <option value="">Semua (Standalone + Program)</option>
          <option value="standalone">Standalone Only</option>
          <option v-for="p in programs" :key="p.id" :value="p.id">📦 {{ p.name }}</option>
        </select>

        <select
          v-model="filterState"
          @change="load"
          class="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#B70000] w-full lg:w-auto min-h-[40px]"
        >
          <option value="">Semua Status</option>
          <option value="draft">Draft</option>
          <option value="review">Review</option>
          <option value="active">Aktif</option>
          <option value="closed">Tutup</option>
        </select>

        <select
          v-model="filterPeriod"
          @change="load"
          class="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#B70000] w-full lg:w-auto min-h-[40px]"
        >
          <option value="">Semua Periode</option>
          <option v-for="p in periods" :key="p" :value="p">{{ fmtPeriod(p) }}</option>
        </select>

        <button @click="load" class="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center w-full sm:w-auto lg:w-10 lg:h-10 shrink-0 min-h-[40px]">
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

    <!-- Loading -->
    <div v-if="loading" class="flex-1 flex items-center justify-center">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#B70000]"></div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
      {{ error }}
    </div>

    <!-- Main Content Container -->
    <div v-else class="flex-1 overflow-hidden flex flex-col min-h-0">
      <!-- Table (Desktop Only) -->
      <div class="flex-1 overflow-auto hidden md:block">
        <table class="w-full min-w-[960px]">
          <thead class="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
            <tr>
              <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Quiz</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Jabatan / SOP</th>
              <th class="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Soal</th>
              <th class="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Periode</th>
              <th class="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Deadline</th>
              <th class="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Completion</th>
              <th class="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-28">Status</th>
              <th class="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 bg-white">
            <tr v-if="quizzes.length === 0">
              <td colspan="8" class="px-6 py-16 text-center">
                <svg class="w-10 h-10 mx-auto mb-3 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p class="text-gray-400 font-medium">Belum ada quiz bank</p>
                <button @click="router.push('/dashboard/quiz/manage/new')" class="mt-2 text-sm text-[#B70000] font-semibold">
                  Buat quiz pertama →
                </button>
              </td>
            </tr>

            <tr v-for="q in quizzes" :key="q.id" class="hover:bg-gray-50 transition-colors group">
              <!-- Name -->
              <td class="px-6 py-4">
                <p class="text-sm font-semibold text-gray-900">{{ q.name }}</p>
                <p class="text-xs text-gray-400 font-mono mt-0.5">{{ q.code }}</p>
                <p v-if="q.quiz_program" class="text-xs text-blue-600 mt-1">
                  📦 {{ q.quiz_program.name }}
                </p>
              </td>

              <!-- Role / SOP -->
              <td class="px-4 py-4">
                <p class="text-sm text-gray-700">{{ q.role_label || '—' }}</p>
                <p class="text-xs text-gray-400">{{ q.sop?.name || '—' }}</p>
              </td>

              <!-- Question count -->
              <td class="px-4 py-4 text-center">
                <span class="text-sm font-semibold text-gray-700">{{ q.question_count || 0 }}</span>
                <span class="text-xs text-gray-400 block">soal · {{ q.total_weight || 0 }}pt</span>
              </td>

              <!-- Period -->
              <td class="px-4 py-4 text-center text-sm text-gray-600">{{ fmtPeriod(q.period) }}</td>

              <!-- Deadline -->
              <td class="px-4 py-4 text-center text-sm text-gray-600">
                {{ q.deadline ? fmtDate(q.deadline) : '—' }}
              </td>

              <!-- Completion -->
              <td class="px-4 py-4">
                <div v-if="q.state === 'active' || q.state === 'closed'" class="flex items-center gap-2 justify-center">
                  <div class="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div class="h-full bg-[#B70000] rounded-full" :style="{ width: `${Math.min(q.completion_rate || 0, 100)}%` }"></div>
                  </div>
                  <span class="text-xs text-gray-500 w-8">{{ (q.completion_rate || 0).toFixed(0) }}%</span>
                </div>
                <p class="text-xs text-gray-400 text-center mt-0.5" v-if="q.assignment_count">
                  {{ q.assignment_count }} assigned
                </p>
                <span v-if="q.state === 'draft' || q.state === 'review'" class="text-xs text-gray-300">—</span>
              </td>

              <!-- State badge -->
              <td class="px-4 py-4 text-center">
                <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold" :class="stateCls(q.state)">
                  {{ stateLabel(q.state) }}
                </span>
              </td>

              <!-- Actions -->
              <td class="px-6 py-4">
                <div class="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">

                  <!-- Edit (draft/review) -->
                  <button
                    v-if="q.state === 'draft' || q.state === 'review'"
                    @click="router.push(`/dashboard/quiz/manage/${q.id}`)"
                    class="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                    title="Edit"
                  >
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>

                  <!-- View (active/closed) -->
                  <button
                    v-else
                    @click="router.push(`/dashboard/quiz/manage/${q.id}`)"
                    class="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
                    title="Lihat Detail"
                  >
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>

                  <!-- Submit Review (draft only) -->
                  <button
                    v-if="q.state === 'draft'"
                    @click="doAction(q, 'review')"
                    :disabled="!!actionId"
                    class="p-1.5 rounded-lg text-amber-500 hover:bg-amber-50 transition-colors disabled:opacity-40"
                    title="Submit ke Review"
                  >
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>

                  <!-- Publish (review only) -->
                  <button
                    v-if="q.state === 'review'"
                    @click="doAction(q, 'publish')"
                    :disabled="!!actionId"
                    class="p-1.5 rounded-lg text-green-600 hover:bg-green-50 transition-colors disabled:opacity-40"
                    title="Publish (Aktifkan)"
                  >
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>

                  <!-- Close (active only) -->
                  <button
                    v-if="q.state === 'active'"
                    @click="doAction(q, 'close')"
                    :disabled="!!actionId"
                    class="p-1.5 rounded-lg text-orange-500 hover:bg-orange-50 transition-colors disabled:opacity-40"
                    title="Tutup Quiz"
                  >
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 10h6v4H9z" />
                    </svg>
                  </button>

                  <!-- Monitoring (active/closed) -->
                  <button
                    v-if="q.state === 'active' || q.state === 'closed'"
                    @click="openMonitoring(q)"
                    class="p-1.5 rounded-lg text-teal-600 hover:bg-teal-50 transition-colors"
                    title="Monitoring Karyawan"
                  >
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </button>

                  <!-- Copy (all states) -->
                  <button
                    @click="openCopyModal(q)"
                    class="p-1.5 rounded-lg text-purple-500 hover:bg-purple-50 transition-colors"
                    title="Salin Quiz"
                  >
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>

                  <!-- Delete (draft only) -->
                  <button
                    v-if="q.state === 'draft'"
                    @click="deleteTarget = q"
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

      <!-- Mobile Card List (Mobile Only) -->
      <div class="flex-1 overflow-y-auto block md:hidden p-4 space-y-4">
        <div v-if="quizzes.length === 0" class="py-16 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
          <svg class="w-10 h-10 mx-auto mb-3 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p class="text-gray-400 font-medium text-sm">Belum ada quiz bank</p>
          <button @click="router.push('/dashboard/quiz/manage/new')" class="mt-2 text-sm text-[#B70000] font-semibold">
            Buat quiz pertama →
          </button>
        </div>

        <div
          v-for="q in quizzes"
          :key="q.id"
          class="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm space-y-3.5"
        >
          <!-- Header: Name, Code & Badges -->
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <h3 class="text-sm font-bold text-gray-900 leading-snug">{{ q.name }}</h3>
              <p class="text-xs text-gray-400 font-mono mt-0.5">{{ q.code }}</p>
              <span v-if="q.quiz_program" class="inline-flex items-center gap-1 text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded font-semibold mt-1">
                📦 {{ q.quiz_program.name }}
              </span>
            </div>
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold shrink-0" :class="stateCls(q.state)">
              {{ stateLabel(q.state) }}
            </span>
          </div>

          <!-- Info details grid -->
          <div class="grid grid-cols-2 gap-3 text-xs border-t border-b border-gray-100 py-3">
            <div>
              <span class="text-gray-400 block font-medium">Jabatan / SOP</span>
              <span class="font-bold text-gray-800">{{ q.role_label || 'Semua Jabatan' }}</span>
              <span class="text-gray-500 block text-[10px] mt-0.5 truncate">{{ q.sop?.name || '—' }}</span>
            </div>
            <div>
              <span class="text-gray-400 block font-medium">Soal & Bobot</span>
              <span class="font-bold text-gray-800">{{ q.question_count || 0 }} soal</span>
              <span class="text-gray-500 block text-[10px] mt-0.5">{{ q.total_weight || 0 }}pt</span>
            </div>
            <div>
              <span class="text-gray-400 block font-medium">Periode</span>
              <span class="font-bold text-gray-800">{{ fmtPeriod(q.period) }}</span>
            </div>
            <div>
              <span class="text-gray-400 block font-medium">Deadline</span>
              <span class="font-bold text-gray-800 text-[#B70000]">{{ q.deadline ? fmtDate(q.deadline) : '—' }}</span>
            </div>
          </div>

          <!-- Completion Progress (Active/Closed) -->
          <div v-if="q.state === 'active' || q.state === 'closed'" class="bg-gray-50 p-3 rounded-xl space-y-1.5">
            <div class="flex items-center justify-between text-[10px]">
              <span class="text-gray-500 font-medium">Tingkat Penyelesaian</span>
              <span class="font-bold text-gray-700">{{ (q.completion_rate || 0).toFixed(0) }}%</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div class="h-full bg-[#B70000] rounded-full" :style="{ width: `${Math.min(q.completion_rate || 0, 100)}%` }"></div>
              </div>
              <span class="text-[10px] text-gray-400 font-medium shrink-0" v-if="q.assignment_count">
                {{ q.assignment_count }} assigned
              </span>
            </div>
          </div>

          <!-- Action buttons with high tap targets (44px) -->
          <div class="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-gray-50">
            <!-- Edit (draft/review) -->
            <button
              @click="router.push(`/dashboard/quiz/manage/${q.id}`)"
              v-if="q.state === 'draft' || q.state === 'review'"
              class="flex-1 py-2 px-3 rounded-lg border border-blue-200 bg-blue-50 text-blue-700 font-bold text-xs flex items-center justify-center gap-1.5 min-h-[44px]"
            >
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </button>

            <!-- View (active/closed) -->
            <button
              v-else
              @click="router.push(`/dashboard/quiz/manage/${q.id}`)"
              class="flex-1 py-2 px-3 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-bold text-xs flex items-center justify-center gap-1.5 min-h-[44px]"
            >
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Lihat Detail
            </button>

            <!-- Submit Review (draft only) -->
            <button
              v-if="q.state === 'draft'"
              @click="doAction(q, 'review')"
              :disabled="!!actionId"
              class="py-2 px-4 rounded-lg border border-amber-200 bg-amber-50 text-amber-700 font-bold text-xs flex items-center justify-center gap-1 min-h-[44px]"
            >
              Submit Review
            </button>

            <!-- Publish (review only) -->
            <button
              v-if="q.state === 'review'"
              @click="doAction(q, 'publish')"
              :disabled="!!actionId"
              class="py-2 px-4 rounded-lg border border-green-200 bg-green-50 text-green-700 font-bold text-xs flex items-center justify-center gap-1 min-h-[44px]"
            >
              Publish
            </button>

            <!-- Close (active only) -->
            <button
              v-if="q.state === 'active'"
              @click="doAction(q, 'close')"
              :disabled="!!actionId"
              class="py-2 px-4 rounded-lg border border-orange-200 bg-orange-50 text-orange-700 font-bold text-xs flex items-center justify-center gap-1 min-h-[44px]"
            >
              Tutup Quiz
            </button>

            <!-- Monitoring (active/closed) -->
            <button
              v-if="q.state === 'active' || q.state === 'closed'"
              @click="openMonitoring(q)"
              class="py-2 px-3 rounded-lg border border-teal-100 bg-teal-50 text-teal-700 hover:bg-teal-100 transition-colors flex items-center justify-center gap-1.5 min-h-[44px] text-xs font-bold"
            >
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Monitoring
            </button>

            <!-- Copy (all states) -->
            <button
              @click="openCopyModal(q)"
              class="py-2 px-3 rounded-lg border border-purple-100 bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors flex items-center justify-center gap-1.5 min-h-[44px] text-xs font-bold"
            >
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Salin
            </button>

            <!-- Delete (draft only) -->
            <button
              v-if="q.state === 'draft'"
              @click="deleteTarget = q"
              class="py-2 px-3 rounded-lg border border-red-100 bg-red-50 text-red-600 hover:bg-red-100 transition-colors flex items-center justify-center min-h-[44px]"
              title="Hapus"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- State flow legend -->
    <div class="bg-white border-t border-gray-200 px-4 sm:px-6 py-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-xs text-gray-400">
      <span class="font-semibold text-gray-500 shrink-0">Alur Status:</span>
      <div class="flex flex-wrap items-center gap-1.5">
        <span class="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">Draft</span>
        <span>→ Submit Review →</span>
        <span class="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">Review</span>
        <span>→ Publish →</span>
        <span class="px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">Aktif</span>
        <span>→ Tutup →</span>
        <span class="px-2 py-0.5 rounded-full bg-red-100 text-red-600 font-medium">Tutup</span>
      </div>
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
            <h3 class="font-bold text-gray-900">Hapus Quiz Bank?</h3>
            <p class="text-sm text-gray-500 mt-2">
              <strong>{{ deleteTarget.name }}</strong> beserta semua soalnya akan dihapus permanen.
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

    <!-- Copy Quiz Modal -->
    <Teleport to="body">
      <div v-if="copyTarget" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" @click.self="closeCopyModal">
        <div class="bg-white rounded-2xl w-full max-w-md p-6 space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-bold text-gray-900">Salin Quiz Bank</h3>
            <button @click="closeCopyModal" class="p-1 rounded-lg hover:bg-gray-100">
              <svg class="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Source info -->
          <div class="flex items-center gap-3 px-3 py-2.5 bg-purple-50 border border-purple-100 rounded-xl text-sm">
            <svg class="w-5 h-5 text-purple-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <div class="min-w-0">
              <p class="font-semibold text-gray-800 truncate">{{ copyTarget.name }}</p>
              <p class="text-xs text-gray-500">{{ copyTarget.question_count || 0 }} soal · {{ copyTarget.total_weight || 0 }}pt · <span :class="stateCls(copyTarget.state)" class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold">{{ stateLabel(copyTarget.state) }}</span></p>
            </div>
          </div>

          <div class="space-y-3">
            <!-- Nama baru -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1.5">Nama Baru <span class="text-red-500">*</span></label>
              <input
                v-model="copyForm.name"
                type="text"
                placeholder="Nama quiz salinan..."
                class="w-full px-3 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>

            <!-- Target program -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1.5">Target Program</label>
              <select
                v-model="copyForm.target_program_id"
                class="w-full px-3 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option :value="null">— Standalone (tanpa program) —</option>
                <option v-for="p in programs" :key="p.id" :value="p.id">📦 {{ p.name }}</option>
              </select>
            </div>

            <!-- Periode & Deadline -->
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1.5">Periode</label>
                <input
                  v-model="copyForm.period"
                  type="text"
                  :placeholder="periodPlaceholder(copyTarget.period_type)"
                  class="w-full px-3 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
                <p class="text-xs text-gray-400 mt-1">{{ periodHint(copyTarget.period_type) }}</p>
              </div>
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1.5">Deadline</label>
                <input
                  v-model="copyForm.deadline"
                  type="date"
                  class="w-full px-3 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
            </div>
          </div>

          <div v-if="copyError" class="px-3 py-2.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{{ copyError }}</div>
          <div v-if="copySuccess" class="px-3 py-2.5 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 font-medium">{{ copySuccess }}</div>

          <div class="flex gap-3 pt-1">
            <button @click="closeCopyModal" class="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50">Batal</button>
            <button
              @click="doCopy"
              :disabled="copying || !copyForm.name.trim()"
              class="flex-1 py-2.5 rounded-xl bg-purple-600 text-white text-sm font-bold disabled:opacity-50 hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
            >
              <svg v-if="copying" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              {{ copying ? 'Menyalin...' : 'Salin Quiz' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Import Excel Modal -->
    <Teleport to="body">
      <div v-if="showImportModal" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" @click.self="closeImportModal">
        <div class="bg-white rounded-2xl w-full max-w-lg p-6 space-y-5">
          <!-- Header -->
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-bold text-gray-900">Import Quiz Bank dari Excel</h3>
            <button @click="closeImportModal" class="p-1 rounded-lg hover:bg-gray-100">
              <svg class="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Info -->
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-700">
            <div class="flex gap-3">
              <svg class="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p class="font-semibold mb-1">Format Excel:</p>
                <ul class="list-disc list-inside space-y-0.5 text-xs">
                  <li>Sheet 1: "Quiz Info" (metadata quiz)</li>
                  <li>Sheet 2: "Questions" (daftar soal)</li>
                  <li>Download template untuk format lengkap</li>
                </ul>
              </div>
            </div>
          </div>

          <!-- File Input -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Pilih File Excel</label>
            <input
              ref="fileInput"
              type="file"
              accept=".xlsx,.xls"
              @change="handleFileSelect"
              class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
            />
            <p v-if="importFile" class="text-xs text-gray-500 mt-1">
              File: {{ importFile.name }} ({{ (importFile.size / 1024).toFixed(1) }} KB)
            </p>
          </div>

          <!-- Import Mode -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Mode Import</label>
            <div class="space-y-2">
              <label class="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-gray-50" :class="importMode === 'create_draft' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'">
                <input type="radio" v-model="importMode" value="create_draft" class="w-4 h-4 text-blue-600">
                <div>
                  <p class="text-sm font-medium text-gray-900">Draft</p>
                  <p class="text-xs text-gray-500">Import sebagai draft (bisa diedit)</p>
                </div>
              </label>
              <label class="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-gray-50" :class="importMode === 'create_and_publish' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'">
                <input type="radio" v-model="importMode" value="create_and_publish" class="w-4 h-4 text-blue-600">
                <div>
                  <p class="text-sm font-medium text-gray-900">Publish Langsung</p>
                  <p class="text-xs text-gray-500">Import dan publish (auto-assign karyawan)</p>
                </div>
              </label>
            </div>
          </div>

          <!-- Error Message -->
          <div v-if="importError" class="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
            {{ importError }}
          </div>

          <!-- Success Message -->
          <div v-if="importSuccess" class="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700">
            {{ importSuccess }}
          </div>

          <!-- Actions -->
          <div class="flex gap-3 pt-2">
            <button @click="closeImportModal" class="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50">
              Batal
            </button>
            <button
              @click="doImport"
              :disabled="!importFile || importing"
              class="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700"
            >
              {{ importing ? 'Mengimport...' : 'Import' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Monitoring Modal -->
    <Teleport to="body">
      <div v-if="monitoringTarget" class="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto" @click.self="monitoringTarget = null">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-4xl my-4" @click.stop>
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div>
              <h3 class="font-bold text-gray-900">Monitoring Karyawan</h3>
              <p class="text-xs text-gray-500 mt-0.5 truncate max-w-xs">{{ monitoringTarget.name }}</p>
            </div>
            <div class="flex items-center gap-2">
              <button @click="openMonitoring(monitoringTarget)" :disabled="monitoringLoading" class="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 disabled:opacity-40" title="Refresh">
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

          <div v-if="monitoringLoading" class="py-12 flex justify-center">
            <div class="w-8 h-8 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
          </div>
          <div v-else-if="monitoringError" class="px-6 py-8 text-center text-red-500 text-sm">{{ monitoringError }}</div>
          <div v-else-if="monitoringData">
            <!-- Summary Pills -->
            <div class="px-6 py-4 flex flex-wrap gap-3 border-b border-gray-50">
              <span class="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                Total {{ monitoringData.summary.total_assigned }} karyawan
              </span>
              <span class="px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-600">
                Belum mulai: {{ monitoringData.summary.not_started }}
              </span>
              <span class="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-50 text-yellow-700">
                Sedang berjalan: {{ monitoringData.summary.in_progress }}
              </span>
              <span class="px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
                Sudah submit: {{ monitoringData.summary.submitted }}
              </span>
              <span class="px-3 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700">
                Lulus: {{ monitoringData.summary.passed }}
              </span>
              <span class="px-3 py-1 rounded-full text-xs font-semibold bg-orange-50 text-orange-700">
                Tidak lulus: {{ monitoringData.summary.failed }}
              </span>
            </div>

            <!-- Filter -->
            <div class="px-6 py-3 border-b border-gray-50">
              <select v-model="monitoringFilter" class="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-teal-500">
                <option value="">Semua Status</option>
                <option value="not_started">Belum Mulai</option>
                <option value="in_progress">Sedang Berjalan</option>
                <option value="submitted">Sudah Submit</option>
                <option value="expired">Kedaluwarsa</option>
              </select>
            </div>

            <!-- Table -->
            <div class="overflow-x-auto max-h-[60vh] overflow-y-auto">
              <table class="w-full text-sm">
                <thead class="sticky top-0 bg-gray-50 text-xs text-gray-500 uppercase z-10">
                  <tr>
                    <th class="px-4 py-3 text-left font-medium">Karyawan</th>
                    <th class="px-4 py-3 text-left font-medium">Departemen</th>
                    <th class="px-4 py-3 text-center font-medium">Status</th>
                    <th class="px-4 py-3 text-center font-medium">Skor</th>
                    <th class="px-4 py-3 text-center font-medium">Lulus</th>
                    <th class="px-4 py-3 text-left font-medium">Mulai</th>
                    <th class="px-4 py-3 text-left font-medium">Submit</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-50">
                  <tr v-for="emp in filteredMonitoringEmployees" :key="emp.employee_id" class="hover:bg-gray-50">
                    <td class="px-4 py-3 font-medium text-gray-800">
                      {{ emp.employee_name }}
                      <p class="text-xs text-gray-400 font-normal">{{ emp.job_title }}</p>
                    </td>
                    <td class="px-4 py-3 text-gray-500 text-xs">{{ emp.department || '-' }}</td>
                    <td class="px-4 py-3 text-center">
                      <span class="px-2 py-0.5 rounded-full text-xs font-semibold"
                        :class="{
                          'bg-red-50 text-red-600': emp.status === 'not_started',
                          'bg-yellow-50 text-yellow-700': emp.status === 'in_progress' && !isExpired(emp.expires_at),
                          'bg-orange-50 text-orange-600': emp.status === 'in_progress' && isExpired(emp.expires_at),
                          'bg-blue-50 text-blue-700': emp.status === 'submitted',
                          'bg-gray-100 text-gray-500': emp.status === 'expired',
                        }">
                        {{ { not_started: 'Belum Mulai', submitted: 'Selesai', expired: 'Expired' }[emp.status]
                          || (emp.status === 'in_progress' ? (isExpired(emp.expires_at) ? 'Waktu Habis' : 'Sedang') : emp.status) }}
                      </span>
                      <!-- Live countdown for in_progress -->
                      <div v-if="emp.status === 'in_progress' && emp.expires_at" class="mt-1">
                        <span class="font-mono text-xs font-bold"
                          :class="isExpired(emp.expires_at) ? 'text-orange-500' : parseInt(formatCountdown(emp.expires_at)) < 5 ? 'text-red-600 animate-pulse' : 'text-yellow-600'">
                          ⏱ {{ formatCountdown(emp.expires_at) }}
                        </span>
                      </div>
                    </td>
                    <td class="px-4 py-3 text-center font-semibold" :class="emp.score >= (monitoringData.quiz?.passing_score || 70) ? 'text-green-600' : emp.score != null ? 'text-red-500' : 'text-gray-300'">
                      {{ emp.score != null ? emp.score : '-' }}
                    </td>
                    <td class="px-4 py-3 text-center">
                      <span v-if="emp.is_passed === true" class="text-green-600 font-bold text-xs">✓ Lulus</span>
                      <span v-else-if="emp.is_passed === false" class="text-red-500 font-bold text-xs">✗ Gagal</span>
                      <span v-else class="text-gray-300 text-xs">-</span>
                    </td>
                    <td class="px-4 py-3 text-xs text-gray-400">{{ emp.started_at || '-' }}</td>
                    <td class="px-4 py-3 text-xs text-gray-400">{{ emp.submitted_at || '-' }}</td>
                  </tr>
                  <tr v-if="filteredMonitoringEmployees.length === 0">
                    <td colspan="7" class="px-4 py-8 text-center text-gray-400">Tidak ada data</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
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
const quizzes = ref([])
const programs = ref([])
const filterProgram = ref('')
const filterState = ref('')
const filterPeriod = ref('')
const actionId = ref(null)
const deleteTarget = ref(null)

// Monitoring state
const monitoringTarget = ref(null)
const monitoringData = ref(null)
const monitoringLoading = ref(false)
const monitoringError = ref('')
const monitoringFilter = ref('')
const now = ref(Date.now())
let clockInterval = null

const filteredMonitoringEmployees = computed(() => {
  if (!monitoringData.value?.employees) return []
  if (!monitoringFilter.value) return monitoringData.value.employees
  return monitoringData.value.employees.filter(e => e.status === monitoringFilter.value)
})

function formatCountdown(expiresAtIso) {
  if (!expiresAtIso) return '--:--'
  const expiresMs = new Date(expiresAtIso).getTime()
  const remaining = Math.max(0, expiresMs - now.value)
  if (remaining === 0) return '00:00'
  const totalSec = Math.floor(remaining / 1000)
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function isExpired(expiresAtIso) {
  if (!expiresAtIso) return false
  return new Date(expiresAtIso).getTime() <= now.value
}

async function openMonitoring(quiz) {
  monitoringTarget.value = quiz
  monitoringData.value = null
  monitoringError.value = ''
  monitoringFilter.value = ''
  monitoringLoading.value = true
  if (!clockInterval) {
    clockInterval = setInterval(() => { now.value = Date.now() }, 1000)
  }
  try {
    monitoringData.value = await quizApi.adminMonitoring(quiz.id)
  } catch (e) {
    monitoringError.value = e.message || 'Gagal memuat data monitoring'
  } finally {
    monitoringLoading.value = false
  }
}

onUnmounted(() => {
  if (clockInterval) clearInterval(clockInterval)
})

// Copy Quiz state
const copyTarget = ref(null)
const copyForm = ref({ name: '', target_program_id: null, period: '', deadline: '' })
const copying = ref(false)
const copyError = ref('')
const copySuccess = ref('')

function openCopyModal(quiz) {
  copyTarget.value = quiz
  copyForm.value = {
    name: `Copy of ${quiz.name}`,
    target_program_id: quiz.quiz_program?.id ?? null,
    period: quiz.period || '',
    deadline: quiz.deadline || '',
  }
  copyError.value = ''
  copySuccess.value = ''
}

function closeCopyModal() {
  if (copying.value) return
  copyTarget.value = null
  copyError.value = ''
  copySuccess.value = ''
}

async function doCopy() {
  if (!copyTarget.value || !copyForm.value.name.trim()) return
  copying.value = true
  copyError.value = ''
  try {
    const params = { name: copyForm.value.name.trim() }
    params.target_program_id = copyForm.value.target_program_id  // null = standalone
    if (copyForm.value.period) params.period = copyForm.value.period
    if (copyForm.value.deadline) params.deadline = copyForm.value.deadline
    const res = await quizApi.adminCopy(copyTarget.value.id, params)
    copySuccess.value = res.message || 'Quiz berhasil disalin!'
    setTimeout(() => { closeCopyModal(); load() }, 1500)
  } catch (e) {
    copyError.value = e.message || 'Gagal menyalin quiz'
  } finally {
    copying.value = false
  }
}

function periodPlaceholder(type) {
  return { monthly: '2026-06', quarterly: '2026-Q2', yearly: '2026', onetime: 'ONETIME-2026' }[type] || 'Periode'
}

function periodHint(type) {
  return { monthly: 'Format: YYYY-MM', quarterly: 'Format: YYYY-Q1/Q2/Q3/Q4', yearly: 'Format: YYYY', onetime: 'Format bebas' }[type] || ''
}

// Import Excel state
const showImportModal = ref(false)
const importFile = ref(null)
const importMode = ref('create_draft')
const importing = ref(false)
const importError = ref('')
const importSuccess = ref('')
const fileInput = ref(null)

const periods = (() => {
  const list = []
  const now = new Date()
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    list.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }
  return list
})()

async function loadPrograms() {
  try {
    const data = await quizApi.programList({ limit: 100 })
    programs.value = data.programs || []
  } catch (e) {
    console.error('Failed to load programs:', e)
  }
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    const params = {}
    if (filterState.value) params.state = filterState.value
    if (filterPeriod.value) params.period = filterPeriod.value

    // Handle program filter
    if (filterProgram.value === 'standalone') {
      params.quiz_id = false  // Filter standalone only
    } else if (filterProgram.value) {
      params.quiz_id = parseInt(filterProgram.value)  // Filter by program ID
    }

    const data = await quizApi.adminList(params)
    quizzes.value = data.quizzes || []
  } catch (e) {
    error.value = e.message || 'Gagal memuat quiz'
  } finally {
    loading.value = false
  }
}

async function doAction(quiz, action) {
  const msgs = {
    review: `Submit "${quiz.name}" ke Review?`,
    publish: `Publish "${quiz.name}"? Karyawan akan langsung di-assign.`,
    close: `Tutup "${quiz.name}"? Karyawan tidak bisa mulai baru.`,
  }
  if (!confirm(msgs[action])) return
  actionId.value = quiz.id
  try {
    if (action === 'review') await quizApi.adminSubmitReview(quiz.id)
    else if (action === 'publish') await quizApi.adminPublish(quiz.id)
    else if (action === 'close') await quizApi.adminClose(quiz.id)
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
    await quizApi.adminDelete(deleteTarget.value.id)
    deleteTarget.value = null
    await load()
  } catch (e) {
    error.value = e.message
  } finally {
    actionId.value = null
  }
}

function stateLabel(s) {
  return { draft: 'Draft', review: 'Review', active: 'Aktif', closed: 'Tutup' }[s] || s
}

function stateCls(s) {
  return {
    draft: 'bg-gray-100 text-gray-600',
    review: 'bg-amber-100 text-amber-700',
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
  return `${['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'][+m - 1]} ${y}`
}

// Import Excel Functions
function downloadTemplate() {
  quizApi.adminDownloadTemplate()
}

function handleFileSelect(event) {
  const file = event.target.files[0]
  if (file) {
    importFile.value = file
    importError.value = ''
    importSuccess.value = ''
  }
}

async function doImport() {
  if (!importFile.value) return

  importing.value = true
  importError.value = ''
  importSuccess.value = ''

  try {
    // Convert file to base64
    const base64 = await fileToBase64(importFile.value)

    // Call import API
    const result = await quizApi.adminImportExcel({
      file_data: base64,
      filename: importFile.value.name,
      import_mode: importMode.value,
    })

    // Show success
    importSuccess.value = result.message || `Quiz "${result.quiz_name}" berhasil diimport! (${result.question_count} soal)`

    // Reload list after 2 seconds
    setTimeout(() => {
      closeImportModal()
      load()
    }, 2000)
  } catch (e) {
    importError.value = e.message || 'Gagal mengimport file Excel'
  } finally {
    importing.value = false
  }
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      // Remove data:...,base64 prefix
      const base64 = reader.result.split(',')[1]
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function closeImportModal() {
  showImportModal.value = false
  importFile.value = null
  importMode.value = 'create_draft'
  importError.value = ''
  importSuccess.value = ''
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

onMounted(() => {
  loadPrograms()
  load()
})
</script>
