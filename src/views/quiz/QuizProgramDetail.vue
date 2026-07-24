<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white border-b border-gray-200 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 py-4">
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
            <div v-if="program" class="min-w-0">
              <h1 class="text-lg sm:text-xl font-bold text-gray-900 truncate">{{ program.name }}</h1>
              <div class="flex flex-wrap items-center gap-2 mt-1">
                <span class="text-xs font-mono text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                  {{ program.code }}
                </span>
                <span
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
                  :class="stateCls(program.state)"
                >
                  {{ stateLabel(program.state) }}
                </span>
                <span class="text-xs text-gray-400">
                  {{ fmtPeriod(program.period) }} • {{ fmtPeriodType(program.period_type) }}
                </span>
              </div>
            </div>
          </div>
          <div class="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-end">
            <!-- Edit (Draft only) -->
            <button
              v-if="program?.state === 'draft'"
              @click="router.push(`/dashboard/quiz/program/${program.id}/edit`)"
              class="flex-1 sm:flex-none justify-center px-4 py-2 text-sm font-semibold border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors min-h-[40px] flex items-center bg-white text-gray-700"
            >
              Edit Program
            </button>

            <!-- Activate (Draft only, with review banks) -->
            <button
              v-if="program?.state === 'draft' && program.banks_review > 0"
              @click="activateProgram"
              :disabled="saving === 'activate'"
              class="flex-1 sm:flex-none justify-center px-4 py-2 text-sm font-semibold bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 min-h-[40px] flex items-center"
            >
              {{ saving === 'activate' ? 'Mengaktifkan...' : 'Aktifkan Program' }}
            </button>

            <!-- Close (Active only) -->
            <button
              v-if="program?.state === 'active'"
              @click="closeProgram"
              :disabled="saving === 'close'"
              class="flex-1 sm:flex-none justify-center px-4 py-2 text-sm font-semibold bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 min-h-[40px] flex items-center"
            >
              {{ saving === 'close' ? 'Menutup...' : 'Tutup Program' }}
            </button>

            <!-- Reopen (Closed only) -->
            <button
              v-if="program?.state === 'closed'"
              @click="reopenProgram"
              :disabled="saving === 'reopen'"
              class="flex-1 sm:flex-none justify-center px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 min-h-[40px] flex items-center"
            >
              {{ saving === 'reopen' ? 'Membuka kembali...' : 'Buka Kembali' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Error -->
    <div v-if="error" class="max-w-7xl mx-auto px-6 mt-4">
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

    <!-- Content -->
    <div v-else-if="program" class="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">

      <!-- Stats Cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div>
              <p class="text-2xl font-bold text-gray-900">{{ program.bank_count }}</p>
              <p class="text-xs text-gray-500">Quiz Banks</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p class="text-2xl font-bold text-gray-900">{{ program.total_questions }}</p>
              <p class="text-xs text-gray-500">Total Soal</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <p class="text-2xl font-bold text-gray-900">{{ program.total_assignments || 0 }}</p>
              <p class="text-xs text-gray-500">Assignments</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <p class="text-2xl font-bold text-gray-900">{{ (program.completion_rate || 0).toFixed(0) }}%</p>
              <p class="text-xs text-gray-500">Completion</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Description -->
      <div v-if="program.description" class="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <p class="text-sm text-gray-600">{{ program.description }}</p>
      </div>

      <!-- Activation Guide (Draft state only) -->
      <div v-if="program.state === 'draft'" class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-sm border border-blue-200 p-5">
        <div class="flex items-start gap-4">
          <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
            <svg class="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="flex-1">
            <h3 class="font-bold text-gray-900 mb-2">Cara Mengaktifkan Program</h3>
            <ol class="space-y-2 text-sm text-gray-700">
              <li class="flex items-start gap-2">
                <span class="font-bold text-blue-600">1.</span>
                <span>Tambah quiz banks ke program (klik tombol "Tambah Quiz Bank")</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="font-bold text-blue-600">2.</span>
                <span>Masuk ke setiap quiz bank, tambahkan soal-soal, lalu submit ke review</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="font-bold text-blue-600">3.</span>
                <span>Setelah minimal 1 quiz bank berstatus "Review", tombol "Aktifkan Program" akan muncul</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="font-bold text-blue-600">4.</span>
                <span>Klik "Aktifkan Program" untuk publish semua quiz banks yang ready dan auto-assign karyawan</span>
              </li>
            </ol>
            <div class="mt-3 flex items-center gap-2 text-xs">
              <span class="font-semibold text-gray-700">Status Quiz Banks:</span>
              <div class="flex gap-3">
                <div class="flex items-center gap-1">
                  <span class="inline-block w-2 h-2 rounded-full bg-gray-400"></span>
                  <span class="text-gray-600">Draft: {{ program.banks_draft || 0 }}</span>
                </div>
                <div class="flex items-center gap-1">
                  <span class="inline-block w-2 h-2 rounded-full bg-amber-500"></span>
                  <span class="text-gray-600">Review: {{ program.banks_review || 0 }}</span>
                </div>
                <div class="flex items-center gap-1">
                  <span class="inline-block w-2 h-2 rounded-full bg-green-500"></span>
                  <span class="text-gray-600">Active: {{ program.banks_active || 0 }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quiz Banks List -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="px-4 sm:px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 class="font-bold text-gray-900">Quiz Banks</h2>
            <p class="text-xs text-gray-500 mt-0.5">Daftar quiz banks dalam program ini</p>
          </div>
          <div v-if="program.state === 'draft'" class="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <button
              @click="openAttachModal"
              class="w-full sm:w-auto justify-center flex items-center gap-1 px-4 py-2.5 text-sm font-semibold text-[#B70000] bg-red-50 rounded-2xl hover:bg-red-100 transition-all min-h-[44px] shadow-[3px_3px_8px_rgba(183,0,0,0.12),-3px_-3px_8px_rgba(255,255,255,0.9)]"
            >
              + Dari yang Ada
            </button>
            <button
              @click="router.push(`/dashboard/quiz/manage/new?program_id=${program.id}`)"
              class="w-full sm:w-auto justify-center flex items-center px-4 py-2.5 text-sm font-semibold bg-[#B70000] text-white rounded-2xl hover:bg-[#950000] transition-all min-h-[44px] shadow-[4px_4px_10px_rgba(183,0,0,0.25),-2px_-2px_6px_rgba(255,255,255,0.5)]"
            >
              + Buat Baru
            </button>
          </div>
        </div>

        <div v-if="!program.banks || program.banks.length === 0" class="p-12 text-center">
          <svg class="w-12 h-12 mx-auto mb-3 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p class="text-gray-400 font-medium">Belum ada quiz bank</p>
          <button
            v-if="program.state === 'draft'"
            @click="router.push(`/dashboard/quiz/manage/new?program_id=${program.id}`)"
            class="mt-2 text-sm text-[#B70000] font-semibold"
          >
            Tambah quiz bank pertama →
          </button>
        </div>

        <!-- Desktop Table (Desktop Only) -->
        <div v-else class="hidden md:block overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 border-b border-gray-100">
              <tr>
                <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Quiz Bank</th>
                <th class="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Soal</th>
                <th class="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Completion</th>
                <th class="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th class="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="bank in program.banks" :key="bank.id" class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4">
                  <p class="text-sm font-semibold text-gray-900">{{ bank.name }}</p>
                  <p class="text-xs text-gray-400 font-mono mt-0.5">{{ bank.code }}</p>
                  <p v-if="bank.sop" class="text-xs text-gray-500 mt-1">{{ bank.sop.name }}</p>
                </td>
                <td class="px-4 py-4 text-center">
                  <span class="text-sm font-semibold text-gray-700">{{ bank.question_count || 0 }}</span>
                  <span class="text-xs text-gray-400 block">{{ bank.total_weight || 0 }}pt</span>
                </td>
                <td class="px-4 py-4 text-center">
                  <div v-if="bank.state === 'active' || bank.state === 'closed'" class="flex items-center gap-2 justify-center">
                    <div class="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div class="h-full bg-[#B70000] rounded-full" :style="{ width: `${Math.min(bank.completion_rate || 0, 100)}%` }"></div>
                    </div>
                    <span class="text-xs text-gray-500 w-8">{{ (bank.completion_rate || 0).toFixed(0) }}%</span>
                  </div>
                  <span v-else class="text-xs text-gray-300">—</span>
                </td>
                <td class="px-4 py-4 text-center">
                  <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold" :class="bankStateCls(bank.state)">
                    {{ bankStateLabel(bank.state) }}
                  </span>
                </td>
                <td class="px-6 py-4 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <button
                      @click="openCopyModal(bank)"
                      class="p-1.5 rounded-lg text-purple-500 hover:bg-purple-50 transition-colors"
                      title="Salin ke program lain"
                    >
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                    <button
                      @click="router.push(`/dashboard/quiz/manage/${bank.id}`)"
                      class="text-sm text-blue-600 hover:text-blue-700 font-semibold"
                    >
                      Lihat Detail →
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Mobile Card List (Mobile Only) -->
        <div v-if="program.banks && program.banks.length > 0" class="block md:hidden divide-y divide-gray-100 bg-white">
          <div
            v-for="bank in program.banks"
            :key="bank.id"
            class="p-4 space-y-3 hover:bg-gray-50 transition-colors"
          >
            <!-- Header: Name, Code & Badge -->
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <p class="text-sm font-semibold text-gray-900 leading-snug">{{ bank.name }}</p>
                <p class="text-xs text-gray-400 font-mono mt-0.5">{{ bank.code }}</p>
                <p v-if="bank.sop" class="text-xs text-gray-500 mt-1 truncate">{{ bank.sop.name }}</p>
              </div>
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold shrink-0" :class="bankStateCls(bank.state)">
                {{ bankStateLabel(bank.state) }}
              </span>
            </div>

            <!-- Details -->
            <div class="flex items-center justify-between text-xs text-gray-600 border-t border-b border-gray-50 py-2">
              <div>
                <span class="text-gray-400 block">Soal & Bobot</span>
                <span class="font-bold text-gray-800">{{ bank.question_count || 0 }} soal ({{ bank.total_weight || 0 }}pt)</span>
              </div>
              <div class="text-right">
                <span class="text-gray-400 block">Completion</span>
                <span class="font-bold text-gray-800" v-if="bank.state === 'active' || bank.state === 'closed'">
                  {{ (bank.completion_rate || 0).toFixed(0) }}%
                </span>
                <span class="text-gray-300" v-else>—</span>
              </div>
            </div>

            <!-- Completion Progress Bar (Active/Closed) -->
            <div v-if="bank.state === 'active' || bank.state === 'closed'" class="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
              <div class="h-full bg-[#B70000] rounded-full" :style="{ width: `${Math.min(bank.completion_rate || 0, 100)}%` }"></div>
            </div>

            <!-- CTA buttons (44px target) -->
            <div class="flex gap-2 pt-1">
              <button
                @click="openCopyModal(bank)"
                class="py-2.5 px-3 rounded-lg border border-purple-100 bg-purple-50 text-purple-700 text-xs font-bold flex items-center gap-1.5 min-h-[44px]"
              >
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Salin
              </button>
              <button
                @click="router.push(`/dashboard/quiz/manage/${bank.id}`)"
                class="flex-1 justify-center flex items-center gap-1 py-2.5 px-4 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-xs font-bold text-blue-600 min-h-[44px]"
              >
                Lihat Detail →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- ── MONITORING PESERTA ──────────────────────────────────────── -->
    <div v-if="program" class="max-w-7xl mx-auto px-4 sm:px-6 pb-8">
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <!-- Section header -->
        <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h2 class="font-bold text-gray-900">Monitoring Peserta</h2>
            <p class="text-xs text-gray-400 mt-0.5">Status pengerjaan per karyawan per quiz bank</p>
          </div>
          <button
            @click="loadMonitoring"
            :disabled="monitoringLoading"
            class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all active:scale-95"
            :class="monitoringLoaded
              ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              : 'bg-[#B70000] text-white hover:bg-[#950000]'"
          >
            <svg class="w-4 h-4" :class="monitoringLoading ? 'animate-spin' : ''" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            {{ monitoringLoading ? 'Memuat...' : monitoringLoaded ? 'Refresh' : 'Muat Data' }}
          </button>
        </div>

        <!-- Not loaded yet -->
        <div v-if="!monitoringLoaded && !monitoringLoading" class="px-5 py-12 text-center text-gray-400 text-sm">
          Klik "Muat Data" untuk melihat monitoring peserta
        </div>

        <!-- Loading -->
        <div v-else-if="monitoringLoading" class="px-5 py-12 flex justify-center">
          <div class="w-8 h-8 border-4 border-gray-200 border-t-[#B70000] rounded-full animate-spin"></div>
        </div>

        <template v-else-if="monitoringData">
          <!-- Summary pills -->
          <div class="px-5 py-3 flex flex-wrap gap-2 border-b border-gray-50">
            <span class="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
              {{ monitoringData.summary.total_employees }} peserta
            </span>
            <span class="px-3 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700">
              Selesai semua: {{ monitoringData.summary.complete }}
            </span>
            <span class="px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
              Sebagian: {{ monitoringData.summary.partial }}
            </span>
            <span class="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-50 text-yellow-700">
              Sedang: {{ monitoringData.summary.in_progress }}
            </span>
            <span class="px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-600">
              Belum mulai: {{ monitoringData.summary.not_started }}
            </span>
            <span class="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
              Lulus semua: {{ monitoringData.summary.passed_all }}
            </span>
          </div>

          <!-- Filter bar -->
          <div class="px-5 py-2.5 border-b border-gray-50 flex items-center gap-3">
            <select v-model="monitoringFilter"
              class="text-xs border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#B70000] bg-white">
              <option value="">Semua Peserta</option>
              <option value="complete">Selesai Semua</option>
              <option value="partial">Sebagian Selesai</option>
              <option value="not_started">Belum Mulai</option>
            </select>
            <span class="text-xs text-gray-400">{{ filteredMonitoringEmployees.length }} karyawan ditampilkan</span>
          </div>

          <!-- Matrix table (desktop) -->
          <div class="hidden md:block overflow-x-auto">
            <table class="w-full text-sm min-w-max">
              <thead class="bg-gray-50 text-xs text-gray-500 uppercase">
                <tr>
                  <th class="px-4 py-3 text-left font-medium sticky left-0 bg-gray-50 z-10 min-w-[200px]">Karyawan</th>
                  <th v-for="bank in monitoringData.quiz_banks" :key="bank.id"
                    class="px-3 py-3 text-center font-medium min-w-[160px]">
                    <div class="truncate max-w-[140px] mx-auto" :title="bank.name">{{ bank.name }}</div>
                    <div class="text-[10px] text-gray-400 font-normal normal-case mt-0.5">Min. {{ bank.passing_score }}%</div>
                  </th>
                  <th class="px-4 py-3 text-center font-medium min-w-[100px]">Overall</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-50">
                <tr v-for="emp in filteredMonitoringEmployees" :key="emp.employee_id" class="hover:bg-gray-50/50">
                  <!-- Employee -->
                  <td class="px-4 py-3 sticky left-0 bg-white hover:bg-gray-50/50 z-10">
                    <p class="font-semibold text-gray-800 text-xs">{{ emp.employee_name }}</p>
                    <p class="text-[10px] text-gray-400">{{ emp.job_title }}</p>
                    <p v-if="emp.department" class="text-[10px] text-gray-400">{{ emp.department }}</p>
                  </td>
                  <!-- One cell per bank -->
                  <td v-for="cell in emp.banks" :key="cell.bank_id" class="px-3 py-3 text-center">
                    <div class="flex flex-col items-center gap-1">
                      <!-- Status badge -->
                      <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                        :class="{
                          'bg-red-50 text-red-500': cell.status === 'not_started',
                          'bg-yellow-50 text-yellow-700': cell.status === 'in_progress',
                          'bg-gray-100 text-gray-500': cell.status === 'expired',
                          'bg-green-100 text-green-700': cell.status === 'submitted' && cell.is_passed,
                          'bg-red-100 text-red-700': cell.status === 'submitted' && !cell.is_passed,
                        }">
                        {{ cellLabel(cell) }}
                      </span>
                      <!-- Score -->
                      <span v-if="cell.score != null" class="text-xs font-bold"
                        :class="cell.is_passed ? 'text-green-600' : 'text-red-500'">
                        {{ cell.score }}%
                      </span>
                      <!-- Essay badge -->
                      <span v-if="cell.status === 'submitted' && cell.essay_graded === false"
                        class="text-[10px] text-purple-600 font-semibold">✍ belum dinilai</span>
                      <!-- Lihat jawaban -->
                      <button
                        v-if="cell.session_id && (cell.status === 'submitted' || cell.status === 'expired')"
                        @click="router.push(`/dashboard/quiz/session/${cell.session_id}`)"
                        class="mt-0.5 inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold transition-all active:scale-95"
                        :class="cell.essay_graded === false
                          ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'">
                        <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                        </svg>
                        {{ cell.essay_graded === false ? 'Nilai Esai' : 'Jawaban' }}
                      </button>
                    </div>
                  </td>
                  <!-- Overall -->
                  <td class="px-4 py-3 text-center">
                    <span class="px-2 py-1 rounded-full text-xs font-semibold"
                      :class="{
                        'bg-green-100 text-green-700': emp.overall_status === 'complete',
                        'bg-blue-50 text-blue-700': emp.overall_status === 'partial',
                        'bg-gray-100 text-gray-500': emp.overall_status === 'not_started',
                      }">
                      {{ { complete: 'Selesai', partial: 'Sebagian', not_started: 'Belum' }[emp.overall_status] }}
                    </span>
                  </td>
                </tr>
                <tr v-if="filteredMonitoringEmployees.length === 0">
                  <td :colspan="(monitoringData.quiz_banks?.length || 0) + 2" class="px-4 py-8 text-center text-gray-400 text-sm">
                    Tidak ada data
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Mobile: card list view -->
          <div class="md:hidden divide-y divide-gray-100">
            <div v-for="emp in filteredMonitoringEmployees" :key="emp.employee_id" class="px-4 py-4">
              <!-- Employee header -->
              <div class="flex items-center justify-between mb-2">
                <div>
                  <p class="font-semibold text-gray-800 text-sm">{{ emp.employee_name }}</p>
                  <p class="text-xs text-gray-400">{{ emp.job_title }} · {{ emp.department }}</p>
                </div>
                <span class="px-2.5 py-1 rounded-full text-xs font-semibold"
                  :class="{
                    'bg-green-100 text-green-700': emp.overall_status === 'complete',
                    'bg-blue-50 text-blue-700': emp.overall_status === 'partial',
                    'bg-gray-100 text-gray-500': emp.overall_status === 'not_started',
                  }">
                  {{ { complete: 'Selesai Semua', partial: 'Sebagian', not_started: 'Belum Mulai' }[emp.overall_status] }}
                </span>
              </div>
              <!-- Per-bank rows -->
              <div class="space-y-1.5 mt-2">
                <div v-for="(cell, idx) in emp.banks" :key="cell.bank_id"
                  class="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-gray-50">
                  <div class="flex-1 min-w-0">
                    <p class="text-xs font-semibold text-gray-700 truncate">
                      {{ monitoringData.quiz_banks[idx]?.name }}
                    </p>
                    <div class="flex items-center gap-1.5 mt-0.5">
                      <span class="text-[10px] px-1.5 py-0.5 rounded-full font-semibold"
                        :class="{
                          'bg-red-50 text-red-500': cell.status === 'not_started',
                          'bg-yellow-50 text-yellow-700': cell.status === 'in_progress',
                          'bg-gray-100 text-gray-500': cell.status === 'expired',
                          'bg-green-100 text-green-700': cell.status === 'submitted' && cell.is_passed,
                          'bg-red-100 text-red-700': cell.status === 'submitted' && !cell.is_passed,
                        }">{{ cellLabel(cell) }}</span>
                      <span v-if="cell.score != null" class="text-xs font-bold"
                        :class="cell.is_passed ? 'text-green-600' : 'text-red-500'">{{ cell.score }}%</span>
                      <span v-if="cell.status === 'submitted' && cell.essay_graded === false"
                        class="text-[10px] text-purple-600 font-semibold">✍</span>
                    </div>
                  </div>
                  <button
                    v-if="cell.session_id && (cell.status === 'submitted' || cell.status === 'expired')"
                    @click="router.push(`/dashboard/quiz/session/${cell.session_id}`)"
                    class="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all active:scale-95"
                    :class="cell.essay_graded === false
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-white border border-gray-200 text-gray-600'">
                    {{ cell.essay_graded === false ? 'Nilai Esai' : 'Jawaban' }}
                  </button>
                </div>
              </div>
            </div>
            <div v-if="filteredMonitoringEmployees.length === 0" class="px-4 py-8 text-center text-gray-400 text-sm">
              Tidak ada data
            </div>
          </div>
        </template>
      </div>
    </div>

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
              <p class="text-xs text-gray-500">{{ copyTarget.question_count || 0 }} soal · {{ copyTarget.total_weight || 0 }}pt</p>
            </div>
          </div>

          <div class="space-y-3">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1.5">Nama Baru <span class="text-red-500">*</span></label>
              <input
                v-model="copyForm.name"
                type="text"
                placeholder="Nama quiz salinan..."
                class="w-full px-3 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1.5">Target Program</label>
              <select
                v-model="copyForm.target_program_id"
                class="w-full px-3 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option :value="null">— Standalone (tanpa program) —</option>
                <option v-for="p in programs" :key="p.id" :value="p.id">📦 {{ p.name }}</option>
              </select>
              <p v-if="copyForm.target_program_id === program?.id" class="text-xs text-amber-600 mt-1">
                ⚠ Menyalin ke program yang sama — nama baru wajib diubah.
              </p>
            </div>

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

    <!-- Attach Existing Bank Modal (claymorphism) -->
    <Teleport to="body">
      <div v-if="attachOpen" class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" @click.self="attachOpen = false">
        <div class="w-full max-w-lg max-h-[85vh] flex flex-col rounded-3xl bg-[#f0f1f5] p-6 shadow-[10px_10px_24px_rgba(174,174,192,0.5),-10px_-10px_24px_rgba(255,255,255,0.9)]">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h3 class="text-lg font-bold text-gray-800">Tambah dari Quiz Bank yang Ada</h3>
              <p class="text-xs text-gray-500 mt-0.5">Menautkan bank yang sudah ada — tidak membuat salinan</p>
            </div>
            <button @click="attachOpen = false" class="w-9 h-9 flex items-center justify-center rounded-2xl bg-[#f0f1f5] text-gray-500 shadow-[3px_3px_6px_rgba(174,174,192,0.5),-3px_-3px_6px_rgba(255,255,255,0.9)] active:shadow-[inset_2px_2px_4px_rgba(174,174,192,0.5),inset_-2px_-2px_4px_rgba(255,255,255,0.9)]">✕</button>
          </div>

          <div v-if="attachLoading" class="py-10 text-center text-gray-400 text-sm">Memuat daftar quiz...</div>
          <div v-else-if="!availableBanks.length" class="py-10 text-center text-gray-400 text-sm">
            Tidak ada quiz bank lain yang bisa ditambahkan.
          </div>
          <div v-else class="flex-1 overflow-y-auto space-y-2 pr-1">
            <label
              v-for="b in availableBanks"
              :key="b.id"
              class="flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all bg-[#f0f1f5]"
              :class="attachSelected.includes(b.id)
                ? 'shadow-[inset_3px_3px_7px_rgba(174,174,192,0.6),inset_-3px_-3px_7px_rgba(255,255,255,0.9)]'
                : 'shadow-[4px_4px_10px_rgba(174,174,192,0.4),-4px_-4px_10px_rgba(255,255,255,0.85)]'"
            >
              <input type="checkbox" :value="b.id" v-model="attachSelected" class="w-4 h-4 accent-[#B70000]" />
              <div class="flex-1 min-w-0">
                <p class="text-sm font-semibold text-gray-800 truncate">{{ b.name }}</p>
                <p class="text-xs text-gray-500">
                  {{ b.question_count }} soal · {{ bankStateLabel(b.state) }}
                  <span v-if="b.current_program"> · saat ini di: {{ b.current_program }}</span>
                  <span v-else> · standalone</span>
                </p>
              </div>
            </label>
          </div>

          <div v-if="attachError" class="mt-3 px-3 py-2.5 rounded-2xl bg-red-50 text-sm text-red-700">{{ attachError }}</div>

          <div class="flex gap-3 pt-4">
            <button @click="attachOpen = false" class="flex-1 py-2.5 rounded-2xl text-sm font-semibold text-gray-600 bg-[#f0f1f5] shadow-[4px_4px_10px_rgba(174,174,192,0.5),-4px_-4px_10px_rgba(255,255,255,0.9)] active:shadow-[inset_3px_3px_6px_rgba(174,174,192,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.9)]">Batal</button>
            <button
              @click="doAttach"
              :disabled="attaching || !attachSelected.length"
              class="flex-1 py-2.5 rounded-2xl text-sm font-bold text-white bg-[#B70000] disabled:opacity-50 shadow-[4px_4px_12px_rgba(183,0,0,0.35),-2px_-2px_6px_rgba(255,255,255,0.5)] active:shadow-[inset_2px_2px_6px_rgba(0,0,0,0.25)]"
            >
              {{ attaching ? 'Menambahkan...' : `Tambahkan (${attachSelected.length})` }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { quizApi } from '../../services/quizApi'

const router = useRouter()
const route = useRoute()

const loading = ref(true)
const saving = ref(null) // null | 'activate' | 'close' | 'reopen'
const error = ref('')
const program = ref(null)
const programs = ref([])

// ── Monitoring state ──────────────────────────────────────────────────
const monitoringData = ref(null)
const monitoringLoading = ref(false)
const monitoringLoaded = ref(false)
const monitoringFilter = ref('')

const filteredMonitoringEmployees = computed(() => {
  const employees = monitoringData.value?.employees || []
  if (!monitoringFilter.value) return employees
  return employees.filter(e => e.overall_status === monitoringFilter.value)
})

function cellLabel(cell) {
  if (cell.status === 'not_started') return 'Belum'
  if (cell.status === 'in_progress') return 'Sedang'
  if (cell.status === 'expired') return 'Expired'
  if (cell.status === 'submitted') return cell.is_passed ? 'Lulus' : 'Tidak Lulus'
  return cell.status
}

async function loadMonitoring() {
  monitoringLoading.value = true
  try {
    monitoringData.value = await quizApi.adminProgramMonitoring(route.params.id)
    monitoringLoaded.value = true
    monitoringFilter.value = ''
  } catch (e) {
    alert('Gagal memuat monitoring: ' + (e.message || 'Error'))
  } finally {
    monitoringLoading.value = false
  }
}

// Copy Quiz state
const copyTarget = ref(null)
const copyForm = ref({ name: '', target_program_id: null, period: '', deadline: '' })
const copying = ref(false)
const copyError = ref('')
const copySuccess = ref('')

async function loadPrograms() {
  try {
    const data = await quizApi.programList({ limit: 100 })
    programs.value = data.programs || []
  } catch { programs.value = [] }
}

function openCopyModal(bank) {
  copyTarget.value = bank
  copyForm.value = {
    name: `Copy of ${bank.name}`,
    target_program_id: program.value?.id ?? null,
    period: program.value?.period || '',
    deadline: program.value?.deadline || '',
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
    params.target_program_id = copyForm.value.target_program_id
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

// ── Attach existing bank ──────────────────────────────────────────────
const attachOpen = ref(false)
const attachLoading = ref(false)
const availableBanks = ref([])
const attachSelected = ref([])
const attaching = ref(false)
const attachError = ref('')

async function openAttachModal() {
  attachOpen.value = true
  attachLoading.value = true
  attachSelected.value = []
  attachError.value = ''
  availableBanks.value = []
  try {
    const res = await quizApi.programAvailableBanks(route.params.id)
    availableBanks.value = res?.banks || []
  } catch (e) {
    attachError.value = e.message || 'Gagal memuat daftar quiz'
  } finally {
    attachLoading.value = false
  }
}

async function doAttach() {
  if (!attachSelected.value.length) return
  attaching.value = true
  attachError.value = ''
  try {
    await quizApi.programAttachBanks(route.params.id, attachSelected.value)
    attachOpen.value = false
    await load()
  } catch (e) {
    attachError.value = e.message || 'Gagal menambahkan quiz bank'
  } finally {
    attaching.value = false
  }
}

function periodPlaceholder(type) {
  return { monthly: '2026-06', quarterly: '2026-Q2', yearly: '2026', onetime: 'ONETIME-2026' }[type] || 'Periode'
}

function periodHint(type) {
  return { monthly: 'Format: YYYY-MM', quarterly: 'Format: YYYY-Q1/Q2/Q3/Q4', yearly: 'Format: YYYY', onetime: 'Format bebas' }[type] || ''
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    const data = await quizApi.programDetail(route.params.id)
    program.value = data.program
  } catch (e) {
    error.value = e.message || 'Gagal memuat data program'
  } finally {
    loading.value = false
  }
}

async function activateProgram() {
  if (!confirm(`Aktifkan "${program.value.name}"? Semua quiz banks yang ready akan dipublish dan karyawan akan auto-assigned.`)) return
  saving.value = 'activate'
  error.value = ''
  try {
    await quizApi.programActivate(route.params.id)
    alert('Program berhasil diaktifkan!')
    await load()
  } catch (e) {
    error.value = e.message || 'Gagal mengaktifkan program'
  } finally {
    saving.value = null
  }
}

async function closeProgram() {
  if (!confirm(`Tutup program "${program.value.name}"? Program tidak akan dapat diakses lagi oleh karyawan.`)) return
  saving.value = 'close'
  error.value = ''
  try {
    await quizApi.programClose(route.params.id)
    alert('Program berhasil ditutup!')
    await load()
  } catch (e) {
    error.value = e.message || 'Gagal menutup program'
  } finally {
    saving.value = null
  }
}

async function reopenProgram() {
  if (!confirm(`Buka kembali program "${program.value.name}"?`)) return
  saving.value = 'reopen'
  error.value = ''
  try {
    await quizApi.programReopen(route.params.id)
    alert('Program berhasil dibuka kembali!')
    await load()
  } catch (e) {
    error.value = e.message || 'Gagal membuka kembali program'
  } finally {
    saving.value = null
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

function bankStateLabel(s) {
  return { draft: 'Draft', review: 'Review', active: 'Aktif', closed: 'Tutup' }[s] || s
}

function bankStateCls(s) {
  return {
    draft: 'bg-gray-100 text-gray-600',
    review: 'bg-amber-100 text-amber-700',
    active: 'bg-green-100 text-green-700',
    closed: 'bg-red-100 text-red-600',
  }[s] || 'bg-gray-100 text-gray-600'
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

onMounted(() => { load(); loadPrograms() })
</script>
