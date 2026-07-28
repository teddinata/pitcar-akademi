<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
    <!-- Top bar with gradient -->
    <div class="glass-header sticky top-0 z-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div class="flex items-start gap-3 sm:gap-4">
            <button
              @click="router.push('/dashboard/quiz/manage')"
              class="p-2 rounded-xl text-gray-400 hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 hover:text-blue-600 transition-all duration-200 shrink-0"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div class="min-w-0">
              <h1 class="text-lg sm:text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent truncate">
                {{ isEdit ? 'Edit Quiz Bank' : 'Buat Quiz Bank Baru' }}
              </h1>
              <div class="flex flex-wrap items-center gap-2 mt-1">
                <span v-if="quizData?.code" class="text-xs font-mono text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                  {{ quizData.code }}
                </span>
                <span
                  v-if="currentState"
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
                  :class="stateClass(currentState)"
                >
                  <span class="w-1.5 h-1.5 rounded-full mr-1.5" :class="stateDotClass(currentState)"></span>
                  {{ stateLabel(currentState) }}
                </span>
              </div>
            </div>
          </div>
          <div class="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-end">
            <!-- Draft / New: save draft -->
            <button
              v-if="canEdit"
              @click="saveQuiz"
              :disabled="!!saving"
              class="flex-1 sm:flex-none justify-center px-4 py-2.5 text-sm font-semibold border-2 border-gray-200 rounded-xl bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow min-h-[40px] flex items-center"
            >
              <span v-if="saving === 'save'" class="flex items-center gap-2">
                <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Menyimpan...
              </span>
              <span v-else class="flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                Simpan Draft
              </span>
            </button>
            <!-- Draft: submit review -->
            <button
              v-if="currentState === 'draft' && isEdit"
              @click="submitReview"
              :disabled="!!saving || activeQuestions.length === 0"
              class="flex-1 sm:flex-none justify-center px-4 py-2.5 text-sm font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md min-h-[40px] flex items-center"
              :class="activeQuestions.length > 0
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'"
              :title="activeQuestions.length === 0 ? 'Tambahkan minimal 1 soal terlebih dahulu' : ''"
            >
              {{ saving === 'review' ? 'Memproses...' : '📋 Submit Review' }}
            </button>
            <!-- Review: publish -->
            <button
              v-if="currentState === 'review'"
              @click="publishQuiz"
              :disabled="!!saving"
              class="flex-1 sm:flex-none justify-center px-4 py-2.5 text-sm font-bold bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 shadow-sm hover:shadow-md min-h-[40px] flex items-center"
            >
              {{ saving === 'publish' ? 'Memproses...' : '🚀 Publish Quiz' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Error banner -->
    <div v-if="saveError" class="max-w-7xl mx-auto px-6 mt-4">
      <div class="px-4 py-3 bg-red-50 border-l-4 border-red-500 rounded-r-xl flex items-start gap-3 shadow-sm">
        <svg class="w-5 h-5 text-red-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div class="flex-1">
          <p class="text-sm font-semibold text-red-800">Terjadi Kesalahan</p>
          <p class="text-sm text-red-700 mt-0.5">{{ saveError }}</p>
        </div>
        <button @click="saveError = ''" class="text-red-400 hover:text-red-600">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
      <p class="text-sm text-gray-500 mt-4">Memuat data quiz...</p>
    </div>

    <div v-else class="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">

      <!-- ── SECTION 1: INFO DASAR ── -->
      <section class="clay-card overflow-hidden hover:shadow-md transition-shadow">
        <div class="px-4 sm:px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 class="font-bold text-gray-900">Informasi Dasar</h2>
              <p class="text-xs text-gray-500">Detail umum tentang quiz</p>
            </div>
          </div>
        </div>
        <div class="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">

          <div class="col-span-1 md:col-span-2">
            <label class="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <svg class="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
              Nama Quiz <span class="text-red-500">*</span>
            </label>
            <input
              v-model="quizForm.name"
              type="text"
              placeholder="e.g. Quiz SOP Service Advisor — Mei 2026"
              :disabled="!canEdit"
              class="w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-400 transition-all"
            />
          </div>

          <!-- SOP: searchable select -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <svg class="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              SOP Terkait <span class="text-red-500">*</span>
              <span class="text-xs font-normal text-gray-400">(boleh lebih dari satu)</span>
            </label>

            <!-- Searchable multi-select when list is available -->
            <div v-if="sops.length > 0" class="relative">
              <!-- Backdrop -->
              <div v-if="sopDropdownOpen" class="fixed inset-0 z-20" @click="sopDropdownOpen = false"></div>

              <!-- Trigger -->
              <button
                type="button"
                :disabled="!canEdit"
                @click="canEdit && (sopDropdownOpen = !sopDropdownOpen)"
                class="w-full px-4 py-3 text-sm border-2 rounded-xl text-left flex items-center justify-between transition-all disabled:bg-gray-50 disabled:text-gray-400"
                :class="sopDropdownOpen ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-gray-200 hover:border-blue-300'"
              >
                <span :class="quizForm.sop_ids.length ? 'text-gray-900' : 'text-gray-400'">
                  {{ quizForm.sop_ids.length ? quizForm.sop_ids.length + ' SOP dipilih' : '— Pilih SOP —' }}
                </span>
                <svg class="w-4 h-4 text-gray-400 transition-transform duration-200 shrink-0" :class="sopDropdownOpen ? 'rotate-180' : ''" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <!-- Selected chips -->
              <div v-if="quizForm.sop_ids.length" class="flex flex-wrap gap-1.5 mt-2">
                <span
                  v-for="id in quizForm.sop_ids"
                  :key="id"
                  class="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium"
                >
                  {{ sopName(id) }}
                  <button v-if="canEdit" type="button" @click="toggleSop(id)" class="text-blue-400 hover:text-blue-600 transition-colors">
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              </div>

              <!-- Dropdown panel -->
              <div
                v-if="sopDropdownOpen"
                class="absolute z-30 w-full mt-1.5 bg-white border-2 border-blue-200 rounded-xl shadow-lg overflow-hidden"
              >
                <!-- Search box -->
                <div class="p-2 border-b border-gray-100">
                  <div class="relative">
                    <svg class="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      v-model="sopSearch"
                      type="text"
                      placeholder="Cari nama SOP..."
                      class="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      @click.stop
                      ref="sopSearchInput"
                    />
                  </div>
                </div>

                <!-- Options list (toggle) -->
                <div class="max-h-52 overflow-y-auto">
                  <button
                    v-for="s in filteredSops"
                    :key="s.id"
                    type="button"
                    @click="toggleSop(s.id)"
                    class="w-full px-4 py-2.5 text-sm text-left transition-colors flex items-center gap-2.5"
                    :class="isSopSelected(s.id)
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'text-gray-700 hover:bg-blue-50/60'"
                  >
                    <span
                      class="w-4 h-4 rounded border flex items-center justify-center shrink-0"
                      :class="isSopSelected(s.id) ? 'bg-blue-600 border-blue-600' : 'border-gray-300'"
                    >
                      <svg v-if="isSopSelected(s.id)" class="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    {{ s.name }}
                    <span v-if="s.code" class="ml-auto text-xs font-mono text-gray-400 shrink-0">{{ s.code }}</span>
                  </button>
                  <div v-if="filteredSops.length === 0" class="px-4 py-4 text-sm text-gray-400 text-center">
                    Tidak ada SOP yang cocok "{{ sopSearch }}"
                  </div>
                </div>
              </div>
            </div>

            <!-- Fallback: manual comma-separated IDs when SOP list unavailable -->
            <input
              v-else
              v-model="sopIdsManual"
              type="text"
              placeholder="ID SOP, pisahkan koma (mis. 2,4,5)"
              :disabled="!canEdit"
              class="w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-400 transition-all"
            />
            <p v-if="sops.length === 0" class="text-xs text-amber-600 mt-1.5 flex items-center gap-1">
              <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
              Daftar SOP tidak tersedia — masukkan ID manual (pisahkan koma)
            </p>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <svg class="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7" />
              </svg>
              Deskripsi
            </label>
            <input
              v-model="quizForm.description"
              type="text"
              placeholder="Deskripsi singkat quiz..."
              :disabled="!canEdit"
              class="w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-400 transition-all"
            />
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <svg class="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Tipe Periode <span class="text-red-500">*</span>
            </label>
            <select
              v-model="quizForm.period_type"
              @change="handlePeriodTypeChange"
              :disabled="!canEdit"
              class="w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-400 transition-all"
            >
              <option value="monthly">📅 Bulanan</option>
              <option value="quarterly">📊 Kuartalan</option>
              <option value="yearly">📈 Tahunan</option>
              <option value="onetime">🎯 Satu Kali</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <svg class="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Periode <span class="text-red-500">*</span>
            </label>

            <!-- Monthly -->
            <input
              v-if="quizForm.period_type === 'monthly'"
              v-model="quizForm.period"
              type="month"
              :disabled="!canEdit"
              class="w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-400 transition-all"
            />

            <!-- Quarterly -->
            <div v-else-if="quizForm.period_type === 'quarterly'" class="grid grid-cols-2 gap-3">
              <input
                v-model="quarterYear"
                type="number"
                placeholder="2026"
                min="2020"
                max="2099"
                :disabled="!canEdit"
                class="px-4 py-3 text-sm border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
              />
              <select
                v-model="quarterNumber"
                :disabled="!canEdit"
                class="px-4 py-3 text-sm border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
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
              v-else-if="quizForm.period_type === 'yearly'"
              v-model="quizForm.period"
              type="number"
              placeholder="2026"
              min="2020"
              max="2099"
              :disabled="!canEdit"
              class="w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
            />

            <!-- One Time -->
            <input
              v-else-if="quizForm.period_type === 'onetime'"
              v-model="quizForm.period"
              type="text"
              placeholder="ONETIME-2026"
              :disabled="!canEdit"
              class="w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
            />

            <!-- Default -->
            <input
              v-else
              type="text"
              placeholder="Pilih tipe periode terlebih dahulu"
              disabled
              class="w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-400"
            />

            <p class="text-xs text-gray-400 mt-1.5">
              <span v-if="quizForm.period_type === 'monthly'">Format: YYYY-MM</span>
              <span v-else-if="quizForm.period_type === 'quarterly'">Format: YYYY-Q1/Q2/Q3/Q4</span>
              <span v-else-if="quizForm.period_type === 'yearly'">Format: YYYY</span>
              <span v-else-if="quizForm.period_type === 'onetime'">Format bebas</span>
              <span v-else>Pilih tipe periode</span>
            </p>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <svg class="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Deadline <span class="text-red-500">*</span>
            </label>
            <input
              v-model="quizForm.deadline"
              type="date"
              :disabled="!canEdit"
              class="w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-400 transition-all"
            />
          </div>

        </div>
      </section>

      <!-- ── SECTION 2: TARGET PESERTA ── -->
      <section class="clay-card overflow-hidden hover:shadow-md transition-shadow">
        <div class="px-4 sm:px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-pink-50">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <h2 class="font-bold text-gray-900">Target Peserta</h2>
              <p class="text-xs text-gray-500">Tentukan siapa yang harus mengikuti quiz ini</p>
            </div>
          </div>
        </div>
        <div class="p-4 sm:p-6 space-y-4">

          <!-- Radio Option 1: All Positions -->
          <label
            class="flex items-start gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all"
            :class="[
              quizForm.assign_all_jobs
                ? 'border-purple-500 bg-gradient-to-r from-purple-50 to-pink-50 shadow-sm'
                : 'border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50/30',
              !canEdit ? 'pointer-events-none opacity-60' : ''
            ]"
            @click="canEdit && (quizForm.assign_all_jobs = true)"
          >
            <div class="relative flex items-center justify-center w-5 h-5 mt-0.5 shrink-0">
              <input
                type="radio"
                :checked="quizForm.assign_all_jobs"
                :disabled="!canEdit"
                class="w-5 h-5 text-purple-600 border-gray-300 focus:ring-purple-500 cursor-pointer"
              />
            </div>
            <div class="flex-1">
              <div class="flex items-center gap-2">
                <svg class="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span class="text-sm font-bold text-gray-900">Semua Karyawan</span>
              </div>
              <p class="text-xs text-gray-600 mt-1.5">Quiz ini wajib dikerjakan oleh seluruh karyawan di semua posisi/jabatan</p>
            </div>
          </label>

          <!-- Radio Option 2: Specific Positions -->
          <div
            class="flex items-start gap-4 p-4 border-2 rounded-xl transition-all"
            :class="[
              !quizForm.assign_all_jobs
                ? 'border-purple-500 bg-gradient-to-r from-purple-50 to-pink-50 shadow-sm'
                : 'border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50/30',
              !canEdit ? 'pointer-events-none opacity-60' : ''
            ]"
          >
            <div class="relative flex items-center justify-center w-5 h-5 mt-0.5 shrink-0">
              <input
                type="radio"
                :checked="!quizForm.assign_all_jobs"
                :disabled="!canEdit"
                @click="canEdit && (quizForm.assign_all_jobs = false)"
                class="w-5 h-5 text-purple-600 border-gray-300 focus:ring-purple-500 cursor-pointer"
              />
            </div>
            <div class="flex-1">
              <div class="flex items-center gap-2 cursor-pointer" @click="canEdit && (quizForm.assign_all_jobs = false)">
                <svg class="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span class="text-sm font-bold text-gray-900">Posisi Tertentu</span>
                <span v-if="!quizForm.assign_all_jobs" class="text-red-500 text-xs">*</span>
              </div>
              <p class="text-xs text-gray-600 mt-1.5 mb-3 cursor-pointer" @click="canEdit && (quizForm.assign_all_jobs = false)">Pilih posisi/jabatan spesifik yang wajib mengikuti quiz</p>

              <!-- Position Selector - Only shown when this option is selected -->
              <div v-if="!quizForm.assign_all_jobs" class="mt-3">
                <PositionMultiSelect
                  v-model="quizForm.job_ids"
                  :positions="availablePositions"
                  :loading="loadingPositions"
                  :disabled="!canEdit"
                />
              </div>
            </div>
          </div>

        </div>
      </section>

      <!-- ── SECTION 3: PENGATURAN QUIZ ── -->
      <section class="clay-card overflow-hidden hover:shadow-md transition-shadow">
        <div class="px-4 sm:px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h2 class="font-bold text-gray-900">Pengaturan Quiz</h2>
              <p class="text-xs text-gray-500">Konfigurasi aturan dan batasan quiz</p>
            </div>
          </div>
        </div>
        <div class="p-4 sm:p-6 space-y-6">

          <!-- Numerical settings -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <svg class="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Durasi (menit) <span class="text-red-500">*</span>
              </label>
              <input
                v-model.number="quizForm.duration_minutes"
                type="number"
                min="5"
                max="180"
                :disabled="!canEdit"
                class="w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-50 disabled:text-gray-400 transition-all"
              />
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <svg class="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
                Nilai Lulus (%) <span class="text-red-500">*</span>
              </label>
              <input
                v-model.number="quizForm.passing_score"
                type="number"
                min="1"
                max="100"
                :disabled="!canEdit"
                class="w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-50 disabled:text-gray-400 transition-all"
              />
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <svg class="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Maks. Percobaan
              </label>
              <input
                v-model.number="quizForm.max_attempts"
                type="number"
                min="1"
                max="10"
                :disabled="!canEdit"
                class="w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-50 disabled:text-gray-400 transition-all"
              />
              <p class="text-xs text-gray-400 mt-1.5">0 = tidak terbatas</p>
            </div>
          </div>

          <!-- Toggle options -->
          <div class="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-100 rounded-xl p-5">
            <h3 class="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
              <svg class="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Opsi Tambahan
            </h3>
            <div class="grid grid-cols-1 gap-4">
              <Toggle v-model="quizForm.randomize_questions" :disabled="!canEdit" label="🔀 Acak urutan soal" />
              <Toggle v-model="quizForm.show_result_immediately" :disabled="!canEdit" label="⚡ Tampilkan hasil langsung setelah selesai" />
              <Toggle v-model="quizForm.show_correct_answers" :disabled="!canEdit" label="✅ Tampilkan jawaban benar di hasil" />
            </div>
          </div>

        </div>
      </section>

      <!-- ── SECTION 4: BANK SOAL ── -->
      <section class="clay-card overflow-hidden">
        <div class="px-4 sm:px-6 py-4 border-b border-gray-100 bg-gray-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 class="font-semibold text-gray-900 text-sm">Bank Soal</h2>
            <p class="text-xs text-gray-400 mt-0.5">
              {{ activeQuestions.length }} soal ·
              Total bobot: {{ totalWeight }}
              <span v-if="!canEditQuestions" class="ml-2 text-amber-600 font-medium">
                (terkunci — quiz sudah dipublikasi)
              </span>
            </p>
          </div>
          <div v-if="canEditQuestions && isEdit" class="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-start sm:justify-end">
            <!-- Download Template -->
            <button
              @click="downloadQuestionTemplate"
              class="flex-1 sm:flex-none justify-center flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border border-gray-300 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors min-h-[36px]"
              title="Download Template Excel"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Template
            </button>

            <!-- Import Questions -->
            <button
              @click="showImportModal = true"
              class="flex-1 sm:flex-none justify-center flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border border-blue-300 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors min-h-[36px]"
              title="Import Soal dari Excel"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Import Soal
            </button>

            <!-- Add Question -->
            <button
              @click="addQuestion"
              class="w-full sm:w-auto justify-center flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-[#B70000] text-white rounded-lg hover:bg-[#950000] transition-colors min-h-[36px]"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Tambah Soal
            </button>
          </div>
          <span v-else-if="!isEdit" class="text-xs text-gray-400">Simpan draft dulu sebelum menambah soal</span>
        </div>

        <!-- Empty state -->
        <div v-if="activeQuestions.length === 0" class="px-4 sm:px-6 py-12 text-center text-gray-400">
          <svg class="w-10 h-10 mx-auto mb-3 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="font-medium text-gray-500">Belum ada soal</p>
          <p class="text-sm mt-1">
            {{ isEdit ? 'Klik "Tambah Soal" untuk mulai menambahkan pertanyaan' : 'Simpan quiz terlebih dahulu, lalu tambahkan soal' }}
          </p>
        </div>

        <!-- Question list -->
        <div class="divide-y divide-gray-100">
          <div v-for="(q, idx) in activeQuestions" :key="q._key" class="group">
            <!-- Collapsed header -->
            <div
              class="flex items-start gap-3 px-4 sm:px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
              @click="toggleQuestion(q._key)"
            >
              <div class="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 shrink-0 mt-0.5">
                {{ idx + 1 }}
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900 truncate">
                  {{ q.question_text || '(belum ada teks soal)' }}
                </p>
                <div class="flex flex-wrap gap-2 mt-1">
                  <span class="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">
                    {{ q.question_type === 'multiple_choice' ? 'Pilihan Ganda' : q.question_type === 'true_false' ? 'Benar/Salah' : '✍️ Esai' }}
                  </span>
                  <span class="text-xs text-gray-400">Bobot: {{ q.weight }}</span>
                  <span v-if="q.question_type !== 'essay' && !q.correct_answer" class="text-xs px-1.5 py-0.5 rounded bg-amber-100 text-amber-600 font-medium">
                    Belum ada jawaban
                  </span>
                  <span v-if="q._saving" class="text-xs text-blue-500">Menyimpan...</span>
                  <span v-if="q._error" class="text-xs text-red-500">{{ q._error }}</span>
                </div>
              </div>
              <svg
                class="w-4 h-4 text-gray-400 transition-transform duration-200 shrink-0 mt-1"
                :class="expandedKey === q._key ? 'rotate-180' : ''"
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            <!-- Expanded edit form -->
            <div v-show="expandedKey === q._key" class="px-4 sm:px-6 pb-6 bg-blue-50/30 border-t border-blue-100">
              <div class="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">

                <div class="col-span-1 sm:col-span-2">
                  <label class="block text-xs font-semibold text-gray-600 mb-1">Teks Soal *</label>
                  <textarea
                    v-model="q.question_text"
                    rows="3"
                    :disabled="!canEditQuestions"
                    placeholder="Masukkan pertanyaan..."
                    class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B70000] resize-none bg-white disabled:bg-gray-50"
                  ></textarea>
                </div>

                <div>
                  <label class="block text-xs font-semibold text-gray-600 mb-1">Tipe Soal</label>
                  <select
                    v-model="q.question_type"
                    :disabled="!canEditQuestions"
                    @change="q.correct_answer = ''"
                    class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B70000] bg-white disabled:bg-gray-50"
                  >
                    <option value="multiple_choice">Pilihan Ganda (A–D)</option>
                    <option value="true_false">Benar / Salah</option>
                    <option value="essay">Esai (Dinilai Supervisor)</option>
                  </select>
                </div>

                <div>
                  <label class="block text-xs font-semibold text-gray-600 mb-1">Bobot Soal</label>
                  <input
                    v-model.number="q.weight"
                    type="number"
                    min="1"
                    max="100"
                    :disabled="!canEditQuestions"
                    class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B70000] bg-white disabled:bg-gray-50"
                  />
                </div>

                <!-- Multiple choice -->
                <template v-if="q.question_type === 'multiple_choice'">
                  <div class="col-span-1 sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div v-for="opt in ['a','b','c','d']" :key="opt">
                      <label class="block text-xs font-semibold text-gray-600 mb-1 uppercase">Opsi {{ opt }}</label>
                      <div class="flex gap-2">
                        <input
                          v-model="q[`option_${opt}`]"
                          type="text"
                          :placeholder="`Pilihan ${opt.toUpperCase()}...`"
                          :disabled="!canEditQuestions"
                          class="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B70000] bg-white disabled:bg-gray-50"
                        />
                        <button
                          v-if="canEditQuestions"
                          @click="q.correct_answer = opt"
                          class="px-2.5 py-2 rounded-lg text-xs font-bold transition-all border shrink-0"
                          :class="q.correct_answer === opt
                            ? 'bg-green-600 text-white border-green-600'
                            : 'border-gray-200 text-gray-400 hover:border-green-400 hover:text-green-600'"
                        >✓</button>
                      </div>
                    </div>
                  </div>
                  <div v-if="q.correct_answer" class="col-span-1 sm:col-span-2 text-xs text-green-600 font-semibold">
                    Jawaban benar: Opsi {{ q.correct_answer.toUpperCase() }}
                  </div>
                </template>

                <!-- True/False -->
                <template v-else-if="q.question_type === 'true_false'">
                  <div class="col-span-1 sm:col-span-2">
                    <label class="block text-xs font-semibold text-gray-600 mb-2">Jawaban Benar</label>
                    <div class="flex gap-3">
                      <button
                        :disabled="!canEditQuestions"
                        @click="q.correct_answer = 'true'"
                        class="flex-1 py-2.5 rounded-lg text-sm font-semibold border-2 transition-all disabled:opacity-60 min-h-[44px]"
                        :class="q.correct_answer === 'true'"
                        :style="q.correct_answer === 'true' ? 'background-color:#16a34a;color:white;border-color:#16a34a' : 'border-color:#e5e7eb;color:#374151'"
                      >✓ Benar</button>
                      <button
                        :disabled="!canEditQuestions"
                        @click="q.correct_answer = 'false'"
                        class="flex-1 py-2.5 rounded-lg text-sm font-semibold border-2 transition-all disabled:opacity-60 min-h-[44px]"
                        :class="q.correct_answer === 'false'"
                        :style="q.correct_answer === 'false' ? 'background-color:#dc2626;color:white;border-color:#dc2626' : 'border-color:#e5e7eb;color:#374151'"
                      >✗ Salah</button>
                    </div>
                  </div>
                </template>

                <!-- Essay -->
                <template v-else-if="q.question_type === 'essay'">
                  <div class="col-span-1 sm:col-span-2">
                    <div class="flex items-start gap-3 p-3 rounded-xl bg-purple-50 border border-purple-200">
                      <span class="text-purple-500 text-lg shrink-0 mt-0.5">✍️</span>
                      <div class="text-sm text-purple-800">
                        <p class="font-semibold mb-1">Soal tipe Esai</p>
                        <p class="text-xs text-purple-600 leading-relaxed">
                          Karyawan akan menulis jawaban bebas. Supervisor / Kaizen menilai setelah quiz disubmit.
                          Tidak perlu mengisi pilihan atau jawaban benar.
                        </p>
                      </div>
                    </div>
                  </div>
                </template>

                <div>
                  <label class="block text-xs font-semibold text-gray-600 mb-1">Seksi SOP (opsional)</label>
                  <input
                    v-model="q.sop_section"
                    type="text"
                    :disabled="!canEditQuestions"
                    placeholder="e.g. Langkah 3 - Dokumentasi"
                    class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B70000] bg-white disabled:bg-gray-50"
                  />
                </div>

                <div>
                  <label class="block text-xs font-semibold text-gray-600 mb-1">Sequence</label>
                  <input
                    v-model.number="q.sequence"
                    type="number"
                    min="1"
                    :disabled="!canEditQuestions"
                    class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B70000] bg-white disabled:bg-gray-50"
                  />
                </div>

                <div class="col-span-1 sm:col-span-2">
                  <label class="block text-xs font-semibold text-gray-600 mb-1">Penjelasan Jawaban (opsional)</label>
                  <textarea
                    v-model="q.explanation"
                    rows="2"
                    :disabled="!canEditQuestions"
                    placeholder="Mengapa jawaban ini benar..."
                    class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B70000] resize-none bg-white disabled:bg-gray-50"
                  ></textarea>
                </div>

                <!-- Question actions -->
                <div v-if="canEditQuestions" class="col-span-1 sm:col-span-2 flex items-center justify-between pt-1">
                  <button
                    @click="saveQuestion(q)"
                    :disabled="q._saving"
                    class="flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-50 min-h-[40px]"
                  >
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    {{ q._saving ? 'Menyimpan...' : (q._new ? 'Simpan Soal' : 'Update Soal') }}
                  </button>
                  <button
                    @click="removeQuestion(q)"
                    :disabled="q._saving"
                    class="flex items-center gap-1.5 px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 min-h-[40px]"
                  >
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Hapus
                  </button>
                </div>

              </div>
            </div>
          </div>
        </div>

        <!-- Add shortcut at bottom -->
        <div v-if="canEditQuestions && isEdit && activeQuestions.length > 0" class="px-4 sm:px-6 py-4 border-t border-gray-100">
          <button
            @click="addQuestion"
            class="w-full py-2.5 border-2 border-dashed border-gray-200 rounded-lg text-sm text-gray-400 hover:border-[#B70000] hover:text-[#B70000] transition-colors min-h-[44px]"
          >
            + Tambah Soal Berikutnya
          </button>
        </div>
      </section>

      <div class="h-4"></div>
    </div>

    <!-- Import Questions Modal -->
    <Teleport to="body">
      <div v-if="showImportModal" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" @click.self="closeImportModal">
        <div class="bg-white rounded-2xl w-full max-w-lg p-6 space-y-5">
          <!-- Header -->
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-bold text-gray-900">Import Soal dari Excel</h3>
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
                  <li>Hanya 1 sheet: "Questions"</li>
                  <li>Kolom: question_text, question_type, option_a, option_b, correct_answer, dll</li>
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
              @click="doImportQuestions"
              :disabled="!importFile || importing"
              class="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700"
            >
              {{ importing ? 'Mengimport...' : 'Import' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, h } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { quizApi } from '../../services/quizApi'
import { employeeApi } from '../../services/employeeApi'
import PositionMultiSelect from '../../components/PositionMultiSelect.vue'

// ── inline Toggle component (using render function to avoid runtime compilation) ──
const Toggle = {
  props: { modelValue: Boolean, label: String, disabled: Boolean },
  emits: ['update:modelValue'],
  render() {
    return h('label', {
      class: ['flex items-center gap-3 cursor-pointer group', this.disabled && 'pointer-events-none opacity-60']
    }, [
      h('div', {
        class: ['w-11 h-6 rounded-full transition-all relative', this.modelValue ? 'bg-gradient-to-r from-green-500 to-emerald-500 shadow-md' : 'bg-gray-300'],
        onClick: () => this.$emit('update:modelValue', !this.modelValue)
      }, [
        h('div', {
          class: ['absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-lg transition-transform', this.modelValue ? 'translate-x-5' : 'translate-x-0.5']
        })
      ]),
      h('span', {
        class: 'text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors'
      }, this.label)
    ])
  }
}

const router = useRouter()
const route = useRoute()

const routeId = route.params.id
const quizId = ref(routeId && routeId !== 'new' ? parseInt(routeId) : null)
const isEdit = computed(() => !!quizId.value)

const loading = ref(true)
const saving = ref(null)   // null | 'save' | 'review' | 'publish'
const saveError = ref('')
const currentState = ref('draft')
const quizData = ref(null)
const expandedKey = ref(null)

const sops = ref([])
const availablePositions = ref([])
const loadingPositions = ref(false)

// SOP searchable select
const sopSearch = ref('')
const sopDropdownOpen = ref(false)
const sopSearchInput = ref(null)

const filteredSops = computed(() => {
  if (!sopSearch.value.trim()) return sops.value
  const q = sopSearch.value.toLowerCase()
  return sops.value.filter(s =>
    s.name.toLowerCase().includes(q) || (s.code && s.code.toLowerCase().includes(q))
  )
})

// Multi-SOP: nama SOP dari id (untuk chip)
function sopName(id) {
  return sops.value.find(s => s.id === id)?.name || `SOP #${id}`
}
function isSopSelected(id) {
  return quizForm.value.sop_ids.includes(id)
}
function toggleSop(id) {
  const arr = quizForm.value.sop_ids
  const i = arr.indexOf(id)
  if (i >= 0) arr.splice(i, 1)
  else arr.push(id)
  sopSearch.value = ''
}

// Fallback manual: teks "2,4,5" ⇄ quizForm.sop_ids
const sopIdsManual = computed({
  get: () => quizForm.value.sop_ids.join(','),
  set: (v) => {
    quizForm.value.sop_ids = String(v || '')
      .split(',')
      .map(x => parseInt(x.trim()))
      .filter(x => !isNaN(x))
  },
})

watch(sopDropdownOpen, (open) => {
  if (open) {
    setTimeout(() => sopSearchInput.value?.focus(), 50)
  }
})

// Import Questions state
const showImportModal = ref(false)
const importFile = ref(null)
const importing = ref(false)
const importError = ref('')
const importSuccess = ref('')
const fileInput = ref(null)

// Quarterly helpers
const quarterYear = ref('')
const quarterNumber = ref('')

const quizForm = ref({
  name: '',
  sop_ids: [],
  description: '',
  period: '',
  period_type: 'monthly',
  deadline: '',
  duration_minutes: 30,
  passing_score: 80,
  max_attempts: 3,
  assign_all_jobs: false,
  job_ids: [],  // Array of position IDs
  randomize_questions: false,
  show_result_immediately: true,
  show_correct_answers: false,
})

let _keyCounter = 0
const questions = ref([])

// Watch quarterly changes to build period string
watch([quarterYear, quarterNumber], () => {
  if (quizForm.value.period_type === 'quarterly' && quarterYear.value && quarterNumber.value) {
    quizForm.value.period = `${quarterYear.value}-${quarterNumber.value}`
  }
})

const activeQuestions = computed(() => questions.value.filter(q => !q._delete))
const totalWeight = computed(() => activeQuestions.value.reduce((s, q) => s + (q.weight || 0), 0))

const canEdit = computed(() => !isEdit.value || ['draft'].includes(currentState.value))
const canEditQuestions = computed(() => isEdit.value && ['draft', 'review'].includes(currentState.value))

function newKey() { return `q_${++_keyCounter}` }

function stateLabel(s) {
  return { draft: 'Draft', review: 'Review', active: 'Aktif', closed: 'Tutup' }[s] || s
}

function stateClass(s) {
  return {
    draft: 'bg-gray-100 text-gray-600',
    review: 'bg-amber-100 text-amber-700',
    active: 'bg-green-100 text-green-700',
    closed: 'bg-red-100 text-red-600',
  }[s] || 'bg-gray-100 text-gray-600'
}

function stateDotClass(s) {
  return {
    draft: 'bg-gray-400',
    review: 'bg-amber-500 animate-pulse',
    active: 'bg-green-500',
    closed: 'bg-red-500',
  }[s] || 'bg-gray-400'
}

function buildQuizParams() {
  const p = {
    name: quizForm.value.name.trim(),
    sop_ids: quizForm.value.sop_ids || [],
    description: quizForm.value.description || '',
    period: quizForm.value.period,
    period_type: quizForm.value.period_type,
    deadline: quizForm.value.deadline,
    duration_minutes: quizForm.value.duration_minutes,
    passing_score: quizForm.value.passing_score,
    max_attempts: quizForm.value.max_attempts,
    assign_all_jobs: quizForm.value.assign_all_jobs,
    randomize_questions: quizForm.value.randomize_questions,
    show_result_immediately: quizForm.value.show_result_immediately,
    show_correct_answers: quizForm.value.show_correct_answers,
  }
  if (!quizForm.value.assign_all_jobs) {
    p.job_ids = quizForm.value.job_ids || []
  }
  // Add quiz_id if provided in URL params (for creating quiz bank in program)
  if (route.query.program_id) {
    p.quiz_id = parseInt(route.query.program_id)
  }
  return p
}

function handlePeriodTypeChange() {
  // Reset period when type changes
  quizForm.value.period = ''
  quarterYear.value = ''
  quarterNumber.value = ''
}

function validateQuiz() {
  if (!quizForm.value.name.trim()) return 'Nama quiz wajib diisi.'
  if (!quizForm.value.period_type) return 'Tipe periode wajib dipilih.'
  if (!quizForm.value.period) return 'Periode wajib diisi.'

  // Validate period format based on type
  if (quizForm.value.period_type === 'monthly') {
    if (!/^\d{4}-\d{2}$/.test(quizForm.value.period)) {
      return 'Format periode bulanan harus YYYY-MM (contoh: 2026-05)'
    }
  } else if (quizForm.value.period_type === 'quarterly') {
    if (!/^\d{4}-Q[1-4]$/.test(quizForm.value.period)) {
      return 'Format periode kuartalan harus YYYY-Q1/Q2/Q3/Q4 (contoh: 2026-Q1)'
    }
  } else if (quizForm.value.period_type === 'yearly') {
    if (!/^\d{4}$/.test(quizForm.value.period)) {
      return 'Format periode tahunan harus YYYY (contoh: 2026)'
    }
  }

  if (!quizForm.value.deadline) return 'Deadline wajib diisi.'
  if (!quizForm.value.sop_ids.length) return 'Pilih minimal satu SOP terkait.'
  return null
}

async function saveQuiz() {
  const err = validateQuiz()
  if (err) { saveError.value = err; return }
  saving.value = 'save'
  saveError.value = ''
  try {
    const params = buildQuizParams()
    if (!isEdit.value) {
      const res = await quizApi.adminCreate(params)
      // Backend returns: { quiz: { id: 6, ... }, message: "..." }
      const newId = res?.quiz?.id || res?.id
      if (!newId) throw new Error('Gagal membuat quiz, tidak ada ID yang dikembalikan')

      // Set quiz ID first
      quizId.value = newId
      currentState.value = 'draft'

      // Check if quiz bank belongs to a program
      const programId = res?.quiz?.quiz_program?.id || params?.quiz_id

      if (programId) {
        // Redirect to program detail instead of quiz manage
        await router.push(`/dashboard/quiz/program/${programId}`)
      } else {
        // Load questions before redirecting to avoid race condition
        await loadQuestions()
        // Standalone quiz - redirect to quiz manage
        await router.push(`/dashboard/quiz/manage/${newId}`)
      }
    } else {
      await quizApi.adminUpdate(quizId.value, params)
    }
  } catch (e) {
    saveError.value = e.message || 'Gagal menyimpan quiz.'
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } finally {
    saving.value = null
  }
}

async function submitReview() {
  saving.value = 'review'
  saveError.value = ''
  try {
    await quizApi.adminSubmitReview(quizId.value)
    currentState.value = 'review'
  } catch (e) {
    saveError.value = e.message || 'Gagal submit review.'
  } finally {
    saving.value = null
  }
}

async function publishQuiz() {
  saving.value = 'publish'
  saveError.value = ''
  try {
    await quizApi.adminPublish(quizId.value)
    currentState.value = 'active'
  } catch (e) {
    saveError.value = e.message || 'Gagal publish quiz.'
  } finally {
    saving.value = null
  }
}

// ── Question CRUD ─────────────────────────────────────────────────────────────

function addQuestion() {
  const seq = activeQuestions.value.length + 1
  const q = {
    _key: newKey(),
    _new: true,
    _delete: false,
    _saving: false,
    _error: '',
    id: null,
    sequence: seq,
    question_text: '',
    question_type: 'multiple_choice',
    option_a: '', option_b: '', option_c: '', option_d: '',
    correct_answer: '',
    weight: 10,
    sop_section: '',
    explanation: '',
  }
  questions.value.push(q)
  expandedKey.value = q._key
}

function toggleQuestion(key) {
  expandedKey.value = expandedKey.value === key ? null : key
}

function buildQuestionParams(q) {
  return {
    question_text: q.question_text.trim(),
    question_type: q.question_type,
    option_a: q.option_a || '',
    option_b: q.option_b || '',
    option_c: q.option_c || '',
    option_d: q.option_d || '',
    correct_answer: q.correct_answer || '',
    weight: q.weight || 10,
    sop_section: q.sop_section || '',
    explanation: q.explanation || '',
    sequence: q.sequence || 10,
  }
}

async function saveQuestion(q) {
  if (!q.question_text.trim()) { q._error = 'Teks soal wajib diisi'; return }
  if (q.question_type !== 'essay' && !q.correct_answer) { q._error = 'Jawaban benar wajib dipilih'; return }
  q._error = ''
  q._saving = true
  try {
    const params = buildQuestionParams(q)
    if (q._new) {
      const res = await quizApi.adminQuestionCreate(quizId.value, params)
      q.id = res?.id || res
      q._new = false
    } else {
      await quizApi.adminQuestionUpdate(q.id, params)
    }
    expandedKey.value = null
  } catch (e) {
    q._error = e.message || 'Gagal menyimpan soal'
  } finally {
    q._saving = false
  }
}

async function removeQuestion(q) {
  if (q._new) {
    questions.value = questions.value.filter(x => x._key !== q._key)
    if (expandedKey.value === q._key) expandedKey.value = null
    return
  }
  q._saving = true
  try {
    await quizApi.adminQuestionDelete(q.id)
    questions.value = questions.value.filter(x => x._key !== q._key)
    if (expandedKey.value === q._key) expandedKey.value = null
  } catch (e) {
    q._error = e.message || 'Gagal menghapus soal'
    q._saving = false
  }
}

// ── Data loading ──────────────────────────────────────────────────────────────

async function loadSops() {
  try {
    const res = await quizApi.sopList({ sort_by: 'name', sort_order: 'asc' })
    const rows = res?.rows || res?.items || []
    sops.value = rows.map(s => ({ id: s.id, name: s.name, code: s.code }))
  } catch {
    sops.value = []
  }
}

async function loadPositions() {
  loadingPositions.value = true
  try {
    const res = await employeeApi.masters()
    // The call() function already unwraps result.data, so res is { positions: [...], departments: [...] }
    if (res?.positions) {
      availablePositions.value = res.positions.map(pos => ({
        id: pos.id,
        name: pos.name,
        department_id: pos.department?.id || pos.department_id,
        department_name: pos.department?.name || null,
        total_employees: pos.total_employees || 0
      }))
      console.log('Loaded positions:', availablePositions.value.length)
    } else {
      availablePositions.value = []
    }
  } catch (error) {
    console.error('Failed to load positions:', error)
    availablePositions.value = []
  } finally {
    loadingPositions.value = false
  }
}

async function loadQuestions() {
  if (!quizId.value) return
  try {
    const list = await quizApi.adminQuestionList(quizId.value)
    const rows = Array.isArray(list) ? list : (list?.questions || [])
    questions.value = rows
      .sort((a, b) => (a.sequence || 0) - (b.sequence || 0))
      .map(q => ({
        ...q,
        _key: newKey(),
        _new: false,
        _delete: false,
        _saving: false,
        _error: '',
      }))
  } catch {
    questions.value = []
  }
}

async function loadQuiz() {
  const res = await quizApi.adminList({ id: quizId.value })
  const items = Array.isArray(res) ? res : (res?.quizzes || res?.data || [])
  const found = items.find(x => x.id === quizId.value)
  if (found) return found
  // Fallback: fetch without filter (handles small lists)
  const fallback = await quizApi.adminList({})
  const all = Array.isArray(fallback) ? fallback : (fallback?.quizzes || fallback?.data || [])
  return all.find(x => x.id === quizId.value) || null
}

// Import Questions Functions
function downloadQuestionTemplate() {
  quizApi.adminDownloadTemplateQuestions()
}

function handleFileSelect(event) {
  const file = event.target.files[0]
  if (file) {
    importFile.value = file
    importError.value = ''
    importSuccess.value = ''
  }
}

async function doImportQuestions() {
  if (!importFile.value || !quizId.value) return

  importing.value = true
  importError.value = ''
  importSuccess.value = ''

  try {
    // Convert file to base64
    const base64 = await fileToBase64(importFile.value)

    // Call import API
    const result = await quizApi.adminImportQuestions(quizId.value, {
      file_data: base64,
      filename: importFile.value.name,
    })

    // Show success
    importSuccess.value = result.message || `${result.questions_added} soal berhasil ditambahkan!`

    // Reload questions after 2 seconds
    setTimeout(async () => {
      await loadQuestions()
      closeImportModal()
    }, 2000)
  } catch (e) {
    importError.value = e.message || 'Gagal mengimport soal dari Excel'
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
  importError.value = ''
  importSuccess.value = ''
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

onMounted(async () => {
  loading.value = true

  // Load master data in parallel
  await Promise.all([
    loadSops(),
    loadPositions()
  ])

  if (isEdit.value) {
    try {
      const rec = await loadQuiz()
      if (!rec) { router.replace('/dashboard/quiz/manage'); return }
      quizData.value = rec
      currentState.value = rec.state || 'draft'
      quizForm.value = {
        name: rec.name || '',
        sop_ids: (rec.sops && rec.sops.length)
          ? rec.sops.map(s => s.id)
          : (rec.sop?.id ? [rec.sop.id] : []),
        description: rec.description || '',
        period: rec.period || '',
        period_type: rec.period_type || 'monthly',
        deadline: rec.deadline || '',
        duration_minutes: rec.duration_minutes || 30,
        passing_score: rec.passing_score || 80,
        max_attempts: rec.max_attempts ?? 3,
        assign_all_jobs: rec.assign_all_jobs ?? false,
        job_ids: Array.isArray(rec.jobs) ? rec.jobs.map(j => j.id) : (rec.job_ids || []),  // Array of position IDs
        randomize_questions: rec.randomize_questions || false,
        show_result_immediately: rec.show_result_immediately !== false,
        show_correct_answers: rec.show_correct_answers || false,
      }

      // Parse quarterly if needed
      if (rec.period_type === 'quarterly' && rec.period) {
        const match = rec.period.match(/^(\d{4})-(Q[1-4])$/)
        if (match) {
          quarterYear.value = match[1]
          quarterNumber.value = match[2]
        }
      }

      await loadQuestions()
    } catch (e) {
      saveError.value = e.message || 'Gagal memuat data quiz'
    }
  }

  loading.value = false
})
</script>
