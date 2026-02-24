<!-- ============================================================================
FILE: src/views/KPI/Holding.vue
VERSION: 1.2.0 - Progress Update Feature
DESIGN: Luxury Corporate Executive - White + Gold + Warm Gray
CHANGE: Tambah quick progress update per KPI tanpa ubah backend
============================================================================ -->

<template>
  <div class="min-h-screen holding-bg font-sans">

    <Toast v-model:show="toast.show" :message="toast.message" :type="toast.type" :duration="toast.duration" />

    <!-- ============================================================ HEADER -->
    <header class="holding-header border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-6 lg:px-10 py-5">
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div class="flex items-center gap-4">
            <div class="relative">
              <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#C9A84C] to-[#A0782A] flex items-center justify-center shadow-lg shadow-[#C9A84C]/20">
                <BuildingOffice2Icon class="h-6 w-6 text-white" />
              </div>
              <div class="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#C9A84C] border-2 border-white animate-pulse"></div>
            </div>
            <div>
              <div class="text-[10px] font-bold tracking-[0.25em] text-[#A0782A] uppercase mb-0.5">Pitcar Holding</div>
              <h1 class="text-xl font-bold text-gray-900 tracking-tight">KPI Perusahaan {{ filters.year }}</h1>
              <p class="text-xs text-gray-400 mt-0.5">Strategic Performance Dashboard</p>
            </div>
          </div>
          <div class="flex flex-wrap items-end gap-3">
            <div>
              <label class="block text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-1.5">Tahun</label>
              <select v-model="filters.year" @change="loadKPIData" class="holding-select w-28">
                <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
              </select>
            </div>
            <button @click="loadKPIData" :disabled="loading" class="holding-btn-outline flex items-center gap-2 px-5 py-2.5">
              <ArrowPathIcon class="h-4 w-4" :class="{ 'animate-spin': loading }" />
              <span>{{ loading ? 'Memuat...' : 'Refresh' }}</span>
            </button>
            <button @click="openSaveModal" class="holding-btn-gold flex items-center gap-2 px-5 py-2.5">
              <PencilSquareIcon class="h-4 w-4" />
              <span>Input Data</span>
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- ============================================================ MAIN -->
    <main class="max-w-7xl mx-auto px-6 lg:px-10 py-8">

      <!-- Loading -->
      <div v-if="loading" class="flex flex-col items-center justify-center h-96 gap-6">
        <div class="relative w-20 h-20">
          <div class="absolute inset-0 rounded-full border-2 border-[#C9A84C]/20"></div>
          <div class="absolute inset-0 rounded-full border-t-2 border-[#C9A84C] animate-spin"></div>
          <div class="absolute inset-3 rounded-full border-t-2 border-[#C9A84C]/40 animate-spin" style="animation-direction:reverse;animation-duration:0.8s"></div>
          <BuildingOffice2Icon class="absolute inset-0 m-auto h-7 w-7 text-[#C9A84C]" />
        </div>
        <div class="text-center">
          <p class="text-gray-700 font-semibold">Memuat KPI Holding...</p>
          <p class="text-gray-400 text-sm mt-1">Mengambil data strategis perusahaan</p>
        </div>
      </div>

      <!-- Data loaded -->
      <template v-else-if="kpiData">

        <!-- Hero Section -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

          <!-- Overall Score -->
          <div class="lg:col-span-2 relative overflow-hidden rounded-3xl p-8 holding-hero-card">
            <div class="absolute inset-0 opacity-[0.035]" style="background-image:radial-gradient(circle at 15% 50%,#C9A84C 0%,transparent 55%),radial-gradient(circle at 85% 15%,#C9A84C 0%,transparent 45%)"></div>
            <div class="absolute top-0 right-0 w-56 h-56 opacity-[0.05]">
              <svg viewBox="0 0 200 200" class="w-full h-full">
                <polygon points="100,10 190,55 190,145 100,190 10,145 10,55" fill="none" stroke="#C9A84C" stroke-width="1.5"/>
                <polygon points="100,32 168,67 168,133 100,168 32,133 32,67" fill="none" stroke="#C9A84C" stroke-width="0.7"/>
              </svg>
            </div>
            <div class="relative flex flex-col md:flex-row items-center gap-8">
              <div class="flex-shrink-0 relative">
                <svg class="w-44 h-44 -rotate-90" viewBox="0 0 176 176">
                  <circle cx="88" cy="88" r="72" fill="none" stroke="rgba(201,168,76,0.12)" stroke-width="12"/>
                  <circle cx="88" cy="88" r="72" fill="none" stroke="url(#goldGrad)" stroke-width="12" stroke-linecap="round"
                    :stroke-dasharray="2 * Math.PI * 72"
                    :stroke-dashoffset="2 * Math.PI * 72 * (1 - Math.min(kpiData.summary.overall_score, 100) / 100)"
                    class="transition-all duration-1000"/>
                  <defs>
                    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stop-color="#C9A84C"/><stop offset="100%" stop-color="#F0D080"/>
                    </linearGradient>
                  </defs>
                </svg>
                <div class="absolute inset-0 flex flex-col items-center justify-center">
                  <span class="text-5xl font-bold text-gray-900">{{ kpiData.summary.overall_score.toFixed(1) }}</span>
                  <span class="text-[10px] text-gray-400 font-bold tracking-widest uppercase mt-0.5">Score</span>
                </div>
              </div>
              <div class="flex-1 text-center md:text-left">
                <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-50 border border-amber-200 mb-4">
                  <div class="w-2 h-2 rounded-full" :class="getGradeBgColor(kpiData.summary.overall_grade)"></div>
                  <span class="text-amber-700 text-xs font-bold tracking-widest uppercase">{{ getOverallStatus(kpiData.summary.overall_score) }}</span>
                </div>
                <h2 class="text-2xl font-bold text-gray-900 mb-1">Overall Performance</h2>
                <p class="text-gray-400 text-sm mb-6">{{ formatDate(kpiData.period.start_date) }} — {{ formatDate(kpiData.period.end_date) }}</p>
                <div class="grid grid-cols-3 gap-3">
                  <div class="holding-stat-box">
                    <p class="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Grade</p>
                    <p class="text-3xl font-bold" :class="getGradeTextColor(kpiData.summary.overall_grade)">{{ kpiData.summary.overall_grade }}</p>
                  </div>
                  <div class="holding-stat-box">
                    <p class="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Duration</p>
                    <p class="text-2xl font-bold text-gray-800">{{ kpiData.period.duration_days }}<span class="text-sm text-gray-400 ml-1">hari</span></p>
                  </div>
                  <div class="holding-stat-box">
                    <p class="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Progress</p>
                    <p class="text-2xl font-bold text-gray-800">{{ kpiData.period.progress_pct }}<span class="text-sm text-gray-400 ml-1">%</span></p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Period Card -->
          <div class="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 flex flex-col">
            <div class="flex items-center gap-3 mb-5">
              <div class="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                <CalendarDaysIcon class="h-4 w-4 text-[#A0782A]" />
              </div>
              <p class="text-sm font-bold text-gray-700">Periode Berjalan</p>
            </div>
            <div class="flex-1 space-y-4">
              <div>
                <div class="flex justify-between text-xs mb-2">
                  <span class="text-gray-500">Hari Berjalan</span>
                  <span class="text-[#A0782A] font-bold">{{ kpiData.period.days_elapsed }} / {{ kpiData.period.duration_days }}</span>
                </div>
                <div class="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div class="h-full rounded-full bg-gradient-to-r from-[#C9A84C] to-[#F0D080] transition-all duration-700"
                    :style="{ width: `${Math.min(kpiData.period.progress_pct, 100)}%` }"></div>
                </div>
                <p class="text-right text-xs text-gray-400 mt-1">{{ kpiData.period.progress_pct }}% selesai</p>
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div class="bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <p class="text-[10px] text-gray-400 mb-1">Mulai</p>
                  <p class="text-xs font-bold text-gray-800">{{ formatDate(kpiData.period.start_date) }}</p>
                </div>
                <div class="bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <p class="text-[10px] text-gray-400 mb-1">Selesai</p>
                  <p class="text-xs font-bold text-gray-800">{{ formatDate(kpiData.period.end_date) }}</p>
                </div>
              </div>
              <div class="pt-3 border-t border-gray-100 grid grid-cols-3 gap-2 text-center">
                <div>
                  <p class="text-xl font-bold text-green-600">{{ countByStatus('excellent') + countByStatus('good') }}</p>
                  <p class="text-[10px] text-gray-400 mt-0.5">On Track</p>
                </div>
                <div>
                  <p class="text-xl font-bold text-amber-500">{{ countByStatus('fair') }}</p>
                  <p class="text-[10px] text-gray-400 mt-0.5">At Risk</p>
                </div>
                <div>
                  <p class="text-xl font-bold text-red-500">{{ countByStatus('poor') + countByStatus('critical') }}</p>
                  <p class="text-[10px] text-gray-400 mt-0.5">Critical</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ============================================================
             KPI CARDS — dengan progress bar + quick update button
        ============================================================ -->
        <div class="mb-8">
          <div class="flex items-center justify-between mb-5">
            <div>
              <h3 class="text-base font-bold text-gray-900">Strategic Objectives</h3>
              <p class="text-xs text-gray-400 mt-0.5">7 Key Performance Indicators · Klik <span class="text-[#A0782A] font-semibold">Update Progress</span> untuk update cepat</p>
            </div>
            <div class="hidden sm:flex items-center gap-3 text-xs text-gray-400">
              <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-green-500 inline-block"></span>Excellent</span>
              <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-blue-500 inline-block"></span>Good</span>
              <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>Fair</span>
              <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-red-500 inline-block"></span>Poor</span>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            <div
              v-for="kpi in kpiData.kpis" :key="kpi.no"
              class="holding-kpi-card group relative overflow-hidden rounded-2xl bg-white border border-gray-200"
            >
              <!-- Color stripe top -->
              <div class="h-1 w-full" :class="getStripeColor(kpi.status)"></div>

              <div class="p-5">
                <!-- Header row -->
                <div class="flex items-start justify-between mb-3">
                  <div class="flex items-center gap-2.5">
                    <div class="w-8 h-8 rounded-lg flex items-center justify-center" :class="getIconBgLight(kpi.status)">
                      <component :is="getKPIIcon(kpi.no)" class="h-4 w-4" :class="getIconColorLight(kpi.status)" />
                    </div>
                    <div class="text-[10px] text-gray-400 font-medium uppercase tracking-widest">#{{ kpi.no }} · {{ kpi.category }}</div>
                  </div>
                  <span class="text-[10px] font-bold px-2 py-1 rounded-full bg-gray-100 text-gray-500 border border-gray-200">{{ kpi.weight }}%</span>
                </div>

                <!-- KPI Name -->
                <h4 class="text-sm font-bold text-gray-900 leading-snug mb-3 min-h-[2.5rem]">{{ kpi.name }}</h4>

                <!-- Score -->
                <div class="flex items-baseline justify-between mb-2">
                  <span class="text-3xl font-bold" :class="getScoreColorLight(kpi.status)">
                    {{ kpi.score.toFixed(1) }}<span class="text-base text-gray-400">%</span>
                  </span>
                  <div class="text-right">
                    <div class="text-[10px] text-gray-400">Weighted</div>
                    <div class="text-sm font-bold text-gray-700">{{ kpi.weighted.toFixed(2) }}</div>
                  </div>
                </div>

                <!-- ── PROGRESS BAR (baru) ── -->
                <!-- Bar pencapaian KPI score -->
                <div class="mb-1">
                  <div class="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div class="h-full rounded-full transition-all duration-700" :class="getBarColor(kpi.status)"
                      :style="{ width: `${Math.min(kpi.score, 120) / 120 * 100}%` }"></div>
                  </div>
                </div>
                <!-- Bar progress aktual vs target (di bawahnya, lebih tipis) -->
                <div class="mb-3" v-if="getProgressPct(kpi) !== null">
                  <div class="flex justify-between text-[10px] text-gray-400 mb-1">
                    <span>Progress aktual</span>
                    <span class="font-semibold text-gray-600">{{ getProgressPct(kpi).toFixed(1) }}%</span>
                  </div>
                  <div class="h-1 bg-gray-100 rounded-full overflow-hidden">
                    <div class="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-[#C9A84C]/60 to-[#C9A84C]"
                      :style="{ width: `${Math.min(getProgressPct(kpi), 100)}%` }"></div>
                  </div>
                </div>

                <!-- Aktual / Target -->
                <div class="flex items-center justify-between pt-2 border-t border-gray-100 mb-3">
                  <div class="text-xs"><span class="text-gray-400">Aktual: </span><span class="text-gray-900 font-semibold">{{ formatActual(kpi) }}</span></div>
                  <div class="text-xs"><span class="text-gray-400">Target: </span><span class="text-gray-600">{{ formatTarget(kpi) }}</span></div>
                </div>

                <!-- Status badge + Quick Update button -->
                <div class="flex items-center justify-between">
                  <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider" :class="getStatusBadgeLight(kpi.status)">
                    <div class="w-1.5 h-1.5 rounded-full" :class="getStatusDotLight(kpi.status)"></div>
                    {{ kpi.status }}
                  </span>
                  <!-- Quick Update Button -->
                  <button
                    @click.stop="openProgressModal(kpi)"
                    class="quick-update-btn flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all"
                  >
                    <BoltIcon class="h-3 w-3" />
                    Update
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Detail Table (unchanged) -->
        <div class="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden mb-8">
          <div class="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 class="text-base font-bold text-gray-900">Rekapitulasi KPI</h3>
              <p class="text-xs text-gray-400 mt-0.5">Breakdown pencapaian seluruh indikator</p>
            </div>
            <div class="text-xs text-gray-500 font-mono bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
              Σ = {{ kpiData.summary.overall_score.toFixed(2) }} / 100
            </div>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="bg-gray-50 border-b border-gray-100">
                  <th class="holding-th w-10">No</th>
                  <th class="holding-th text-left">Indikator</th>
                  <th class="holding-th">Kategori</th>
                  <th class="holding-th">Bobot</th>
                  <th class="holding-th">Target</th>
                  <th class="holding-th">Aktual</th>
                  <th class="holding-th">Score %</th>
                  <th class="holding-th">Nilai</th>
                  <th class="holding-th">Status</th>
                  <th class="holding-th">Aksi</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="kpi in kpiData.kpis" :key="kpi.no" class="border-b border-gray-50 hover:bg-amber-50/30 transition-colors">
                  <td class="holding-td text-center text-gray-400 font-mono text-xs">{{ kpi.no }}</td>
                  <td class="holding-td">
                    <div class="flex items-center gap-3">
                      <div class="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" :class="getIconBgLight(kpi.status)">
                        <component :is="getKPIIcon(kpi.no)" class="h-3.5 w-3.5" :class="getIconColorLight(kpi.status)" />
                      </div>
                      <div>
                        <div class="text-sm font-semibold text-gray-900">{{ kpi.name }}</div>
                        <div class="text-[10px] text-gray-400">{{ kpi.formula }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="holding-td text-center">
                    <span class="text-[10px] px-2 py-1 rounded-full bg-gray-100 text-gray-500 border border-gray-200 font-medium">{{ kpi.category }}</span>
                  </td>
                  <td class="holding-td text-center text-gray-700 font-bold text-sm">{{ kpi.weight }}%</td>
                  <td class="holding-td text-center text-gray-500 text-sm">{{ formatTarget(kpi) }}</td>
                  <td class="holding-td text-center text-gray-900 font-semibold text-sm">{{ formatActual(kpi) }}</td>
                  <td class="holding-td text-center">
                    <div>
                      <span class="text-sm font-bold" :class="getScoreColorLight(kpi.status)">{{ kpi.score.toFixed(1) }}%</span>
                      <!-- Mini progress bar in table -->
                      <div class="mt-1 h-1 w-16 bg-gray-100 rounded-full overflow-hidden mx-auto">
                        <div class="h-full rounded-full" :class="getBarColor(kpi.status)"
                          :style="{ width: `${Math.min(kpi.score, 120) / 120 * 100}%` }"></div>
                      </div>
                    </div>
                  </td>
                  <td class="holding-td text-center font-bold text-sm text-[#A0782A]">{{ kpi.weighted.toFixed(2) }}</td>
                  <td class="holding-td text-center">
                    <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase" :class="getStatusBadgeLight(kpi.status)">{{ kpi.status }}</span>
                  </td>
                  <td class="holding-td text-center">
                    <button @click="openProgressModal(kpi)" class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold quick-update-btn transition-all">
                      <BoltIcon class="h-3 w-3" />Update
                    </button>
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr class="border-t-2 border-amber-200 bg-amber-50/70">
                  <td colspan="3" class="holding-td text-right pr-4 text-xs font-bold text-[#A0782A] uppercase tracking-widest">Total</td>
                  <td class="holding-td text-center text-[#A0782A] font-bold">100%</td>
                  <td class="holding-td" colspan="3"></td>
                  <td class="holding-td text-center text-[#A0782A] font-bold text-lg">{{ kpiData.summary.overall_score.toFixed(2) }}</td>
                  <td class="holding-td text-center">
                    <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-300 uppercase">
                      Grade {{ kpiData.summary.overall_grade }}
                    </span>
                  </td>
                  <td class="holding-td"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

      </template>

      <!-- Empty State -->
      <template v-else-if="!loading">
        <div class="bg-white rounded-3xl border border-gray-200 shadow-sm p-16 text-center">
          <div class="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6">
            <ChartBarSquareIcon class="h-10 w-10 text-gray-300" />
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-2">Belum Ada Data KPI</h3>
          <p class="text-gray-400 text-sm mb-6">Klik "Input Data" untuk memasukkan data KPI Holding tahun {{ filters.year }}</p>
          <button @click="openSaveModal" class="holding-btn-gold px-8 py-3 inline-flex items-center gap-2">
            <PlusCircleIcon class="h-5 w-5" />
            Input Data KPI {{ filters.year }}
          </button>
        </div>
      </template>

    </main>

    <!-- ============================================================
         MODAL: INPUT DATA LENGKAP (unchanged)
    ============================================================ -->
    <Teleport to="body">
      <div v-if="showSaveModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/30 backdrop-blur-sm" @click="closeSaveModal"></div>
        <div class="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl border border-gray-200">
          <div class="sticky top-0 bg-white border-b border-gray-100 px-7 py-5 flex items-center justify-between rounded-t-3xl z-10">
            <div>
              <div class="text-[10px] font-bold tracking-widest text-[#A0782A] uppercase mb-1">KPI Holding · {{ saveForm.year }}</div>
              <h3 class="text-lg font-bold text-gray-900">{{ editingId ? 'Update Data KPI' : 'Input Data KPI Baru' }}</h3>
            </div>
            <button @click="closeSaveModal" class="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition">
              <XMarkIcon class="h-4 w-4" />
            </button>
          </div>
          <div class="p-7 space-y-6">
            <div>
              <p class="modal-section-label">📅 Periode</p>
              <div class="grid grid-cols-2 gap-4">
                <div><label class="holding-label">Tanggal Mulai</label><input v-model="saveForm.start_date" type="date" class="holding-input" /></div>
                <div><label class="holding-label">Tanggal Selesai</label><input v-model="saveForm.end_date" type="date" class="holding-input" /></div>
              </div>
            </div>
            <div class="border-t border-gray-100"></div>
            <div>
              <p class="modal-section-label">🏪 KPI 1 · Ekspansi Outlet Franchise <span class="text-gray-400 normal-case font-normal text-xs">Bobot 15%</span></p>
              <div class="grid grid-cols-2 gap-4">
                <div><label class="holding-label">Target Outlet Baru</label><input v-model.number="saveForm.kpi1_target" type="number" min="0" class="holding-input" placeholder="4" /></div>
                <div><label class="holding-label">Aktual Outlet Terbentuk</label><input v-model.number="saveForm.kpi1_actual" type="number" min="0" class="holding-input" placeholder="0" /></div>
              </div>
            </div>
            <div>
              <p class="modal-section-label">🎓 KPI 2 · Learning Center <span class="text-gray-400 normal-case font-normal text-xs">Bobot 15%</span></p>
              <div class="grid grid-cols-2 gap-4">
                <div><label class="holding-label">Target Sistem</label><input v-model.number="saveForm.kpi2_target" type="number" min="0" step="0.01" class="holding-input" placeholder="1" /></div>
                <div><label class="holding-label">Aktual Sistem Terbentuk</label><input v-model.number="saveForm.kpi2_actual" type="number" min="0" step="0.01" class="holding-input" placeholder="0" /></div>
              </div>
            </div>
            <div>
              <p class="modal-section-label">🔗 KPI 3 · Supply Chain <span class="text-gray-400 normal-case font-normal text-xs">Bobot 15%</span></p>
              <div class="grid grid-cols-2 gap-4">
                <div><label class="holding-label">Target Revenue (Rp)</label><input v-model.number="saveForm.kpi3_revenue_target" type="number" min="0" class="holding-input" placeholder="0" /></div>
                <div><label class="holding-label">Aktual Revenue (Rp)</label><input v-model.number="saveForm.kpi3_revenue_actual" type="number" min="0" class="holding-input" placeholder="0" /></div>
              </div>
            </div>
            <div>
              <p class="modal-section-label">💰 KPI 4 · Target Omzet & Profit <span class="text-gray-400 normal-case font-normal text-xs">Bobot 20%</span></p>
              <div class="grid grid-cols-2 gap-4">
                <div><label class="holding-label">Target Omzet (Rp)</label><input v-model.number="saveForm.kpi4_omzet_target" type="number" min="0" class="holding-input" placeholder="0" /></div>
                <div><label class="holding-label">Aktual Omzet (Rp)</label><input v-model.number="saveForm.kpi4_omzet_actual" type="number" min="0" class="holding-input" placeholder="0" /></div>
              </div>
            </div>
            <div>
              <p class="modal-section-label">⭐ KPI 5 · Rating Kepuasan Customer <span class="text-gray-400 normal-case font-normal text-xs">Bobot 15%</span></p>
              <div class="grid grid-cols-2 gap-4">
                <div><label class="holding-label">Target Rating</label><input v-model.number="saveForm.kpi5_target_rating" type="number" step="0.01" min="0" max="5" class="holding-input" placeholder="4.8" /></div>
                <div><label class="holding-label">Aktual Rating</label><input v-model.number="saveForm.kpi5_actual_rating" type="number" step="0.01" min="0" max="5" class="holding-input" placeholder="0.0" /></div>
              </div>
              <p class="holding-hint">&gt;4.8 → 100% &nbsp;|&nbsp; 4.5–4.8 → 85% &nbsp;|&nbsp; 4.2–4.49 → 70% &nbsp;|&nbsp; &lt;4.2 → 0%</p>
            </div>
            <div>
              <p class="modal-section-label">🔁 KPI 6 · Retensi Customer Loyal <span class="text-gray-400 normal-case font-normal text-xs">Bobot 10% · Target &gt;30%</span></p>
              <div class="grid grid-cols-2 gap-4">
                <div><label class="holding-label">Target % Loyal</label><input v-model.number="saveForm.kpi6_target_pct" type="number" step="0.1" min="0" max="100" class="holding-input" placeholder="30" /></div>
                <div><label class="holding-label">Aktual % Loyal</label><input v-model.number="saveForm.kpi6_actual_pct" type="number" step="0.1" min="0" max="100" class="holding-input" placeholder="0" /></div>
              </div>
            </div>
            <div>
              <p class="modal-section-label">👥 KPI 7 · Turnover Karyawan <span class="text-gray-400 normal-case font-normal text-xs">Bobot 10% · Target &lt;10%</span></p>
              <div class="grid grid-cols-2 gap-4">
                <div><label class="holding-label">Target Max Turnover (%)</label><input v-model.number="saveForm.kpi7_target_turnover" type="number" step="0.1" min="0" max="100" class="holding-input" placeholder="10" /></div>
                <div><label class="holding-label">Aktual Turnover (%)</label><input v-model.number="saveForm.kpi7_actual_turnover" type="number" step="0.1" min="0" max="100" class="holding-input" placeholder="0" /></div>
              </div>
              <p class="holding-hint">&lt;5% → 120% &nbsp;|&nbsp; 5–10% → 100% &nbsp;|&nbsp; 11–15% → 80% &nbsp;|&nbsp; 16–20% → 60% &nbsp;|&nbsp; 21–25% → 40% &nbsp;|&nbsp; &gt;25% → 0%</p>
            </div>
            <div>
              <label class="holding-label">Catatan (opsional)</label>
              <textarea v-model="saveForm.notes" rows="3" class="holding-input resize-none" placeholder="Catatan tambahan..."></textarea>
            </div>
          </div>
          <div class="sticky bottom-0 bg-white border-t border-gray-100 px-7 py-4 flex items-center justify-between rounded-b-3xl">
            <button @click="closeSaveModal" class="px-5 py-2.5 rounded-xl text-gray-500 hover:text-gray-700 text-sm transition font-medium">Batal</button>
            <button @click="saveKPIData" :disabled="saving" class="holding-btn-gold flex items-center gap-2 px-7 py-2.5">
              <CheckCircleIcon v-if="!saving" class="h-4 w-4" />
              <ArrowPathIcon v-else class="h-4 w-4 animate-spin" />
              {{ saving ? 'Menyimpan...' : 'Simpan Data' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ============================================================
         MODAL: QUICK PROGRESS UPDATE (BARU)
         Fokus ke 1 KPI, input aktual + slider progress
    ============================================================ -->
    <Teleport to="body">
      <div v-if="showProgressModal && progressKPI" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="closeProgressModal"></div>
        <div class="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden">

          <!-- Stripe warna status -->
          <div class="h-1.5 w-full" :class="getStripeColor(progressKPI.status)"></div>

          <!-- Header -->
          <div class="px-6 pt-5 pb-4 flex items-start justify-between border-b border-gray-100">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl flex items-center justify-center" :class="getIconBgLight(progressKPI.status)">
                <component :is="getKPIIcon(progressKPI.no)" class="h-5 w-5" :class="getIconColorLight(progressKPI.status)" />
              </div>
              <div>
                <div class="text-[10px] font-bold tracking-widest text-[#A0782A] uppercase">KPI #{{ progressKPI.no }} · Update Progress</div>
                <h3 class="text-sm font-bold text-gray-900 leading-tight">{{ progressKPI.name }}</h3>
              </div>
            </div>
            <button @click="closeProgressModal" class="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 flex-shrink-0 mt-0.5">
              <XMarkIcon class="h-4 w-4" />
            </button>
          </div>

          <div class="p-6 space-y-5">

            <!-- Current Score Display -->
            <div class="flex items-center justify-between bg-gray-50 rounded-2xl px-5 py-3 border border-gray-100">
              <div>
                <p class="text-[10px] text-gray-400 uppercase tracking-widest mb-0.5">Score Sekarang</p>
                <p class="text-2xl font-bold" :class="getScoreColorLight(progressKPI.status)">{{ progressKPI.score.toFixed(1) }}%</p>
              </div>
              <div class="text-center">
                <p class="text-[10px] text-gray-400 uppercase tracking-widest mb-0.5">Target</p>
                <p class="text-lg font-bold text-gray-700">{{ formatTarget(progressKPI) }}</p>
              </div>
              <div class="text-center">
                <p class="text-[10px] text-gray-400 uppercase tracking-widest mb-0.5">Grade</p>
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold" :class="getStatusBadgeLight(progressKPI.status)">
                  {{ progressKPI.status }}
                </span>
              </div>
            </div>

            <!-- ── Input aktual VALUE (utama) ── -->
            <div>
              <label class="holding-label">{{ progressActualLabel }}</label>

              <!-- Input biasa untuk KPI 1, 2 (integer count) -->
              <template v-if="[1, 2].includes(progressKPI.no)">
                <div class="flex items-center gap-3">
                  <button @click="progressForm.actual = Math.max(0, (progressForm.actual || 0) - 1)"
                    class="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-lg flex-shrink-0 transition">−</button>
                  <!-- buat suoaya input 0,01 -->
                    <input v-model.number="progressForm.actual" type="number" min="0" 
                      step="0.01"
                      :max="progressKPI.target * 2" 
                      class="holding-input text-center text-2xl font-bold h-12" />
                  <button @click="progressForm.actual = (progressForm.actual || 0) + 1"
                    class="w-10 h-10 rounded-xl bg-amber-100 hover:bg-amber-200 flex items-center justify-center text-[#A0782A] font-bold text-lg flex-shrink-0 transition">+</button>
                </div>
                <p class="text-[11px] text-gray-400 text-center mt-1.5">dari target {{ progressKPI.target }}</p>
              </template>

              <!-- Input currency untuk KPI 3, 4 (Revenue / Omzet) -->
              <template v-else-if="[3, 4].includes(progressKPI.no)">
                <div class="relative">
                  <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">Rp</span>
                  <input v-model.number="progressForm.actual" type="number" min="0"  class="holding-input pl-10 pr-3 text-right no-spinner" placeholder="0" />
                </div>
                <p class="text-[11px] text-gray-400 mt-1.5">Target: {{ formatTarget(progressKPI) }}</p>
              </template>

              <!-- Input rating untuk KPI 5 -->
              <template v-else-if="progressKPI.no === 5">
                <input v-model.number="progressForm.actual" type="number" step="0.01" min="0" max="5" class="holding-input text-center text-xl font-bold no-spinner" placeholder="0.00" />
                <div class="flex justify-between text-[10px] text-gray-400 mt-1.5 px-1">
                  <span>0</span><span>&gt;4.8 = 100%</span><span>5</span>
                </div>
                <p class="holding-hint mt-2">&gt;4.8→100% &nbsp;|&nbsp; 4.5–4.8→85% &nbsp;|&nbsp; 4.2–4.49→70% &nbsp;|&nbsp; &lt;4.2→0%</p>
              </template>

              <!-- Input percentage untuk KPI 6, 7 -->
              <template v-else>
                <div class="relative">
                  <input v-model.number="progressForm.actual" type="number" step="0.1" min="0" max="100" class="holding-input pl-3 pr-8 text-left no-spinner" placeholder="0" />
                  <span class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">%</span>
                </div>
                <p v-if="progressKPI.no === 7" class="holding-hint mt-2">&lt;5%→120% &nbsp;|&nbsp; 5–10%→100% &nbsp;|&nbsp; 11–15%→80% &nbsp;|&nbsp; 16–20%→60% &nbsp;|&nbsp; 21–25%→40% &nbsp;|&nbsp; &gt;25%→0%</p>
              </template>
            </div>

            <!-- ── Slider Progress (untuk KPI berbasis jumlah/persen) ── -->
            <div v-if="showSlider">
              <div class="flex justify-between items-center mb-2">
                <label class="holding-label mb-0">Atau geser slider</label>
                <span class="text-[#A0782A] font-bold text-sm">{{ sliderPct.toFixed(0) }}%</span>
              </div>
              <input
                v-model.number="sliderValue"
                @input="onSliderChange"
                type="range"
                min="0"
                :max="sliderMax"
                :step="sliderStep"
                class="progress-slider w-full"
              />
              <div class="flex justify-between text-[10px] text-gray-400 mt-1">
                <span>0</span>
                <span>{{ formatSliderLabel(sliderMax / 2) }}</span>
                <span>{{ formatSliderLabel(sliderMax) }}</span>
              </div>
            </div>

            <!-- Preview score baru (computed live) -->
            <div v-if="progressForm.actual !== null && progressForm.actual !== '' && progressForm.actual !== undefined"
              class="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3 flex items-center justify-between">
              <div>
                <p class="text-[10px] text-gray-400 uppercase tracking-widest mb-0.5">Prediksi Score Baru</p>
                <p class="text-xl font-bold" :class="getScoreColorLight(getPreviewStatus(computedPreviewScore))">
                  {{ computedPreviewScore.toFixed(1) }}<span class="text-sm text-gray-400">%</span>
                </p>
              </div>
              <div v-if="computedPreviewScore !== progressKPI.score" class="flex items-center gap-1.5">
                <span class="text-[10px] text-gray-400">vs sekarang</span>
                <span class="font-bold text-sm" :class="computedPreviewScore >= progressKPI.score ? 'text-green-600' : 'text-red-500'">
                  {{ computedPreviewScore >= progressKPI.score ? '▲' : '▼' }}
                  {{ Math.abs(computedPreviewScore - progressKPI.score).toFixed(1) }}%
                </span>
              </div>
            </div>

          </div>

          <!-- Footer -->
          <div class="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <button @click="closeProgressModal" class="text-gray-500 hover:text-gray-700 text-sm font-medium px-3 py-2 transition">Batal</button>
            <div class="flex gap-2">
              <button @click="openSaveModal" class="holding-btn-outline flex items-center gap-1.5 px-4 py-2 text-xs">
                <PencilSquareIcon class="h-3.5 w-3.5" />Edit Semua
              </button>
              <button @click="saveProgress" :disabled="saving" class="holding-btn-gold flex items-center gap-2 px-5 py-2">
                <CheckCircleIcon v-if="!saving" class="h-4 w-4" />
                <ArrowPathIcon v-else class="h-4 w-4 animate-spin" />
                {{ saving ? 'Menyimpan...' : 'Simpan' }}
              </button>
            </div>
          </div>

        </div>
      </div>
    </Teleport>

  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import {
  ArrowPathIcon, CalendarDaysIcon, BuildingOffice2Icon, ChartBarSquareIcon,
  PencilSquareIcon, CheckCircleIcon, PlusCircleIcon, XMarkIcon, BoltIcon,
  BuildingStorefrontIcon, AcademicCapIcon, TruckIcon, CurrencyDollarIcon,
  StarIcon, UserGroupIcon, ArrowTrendingDownIcon,
} from '@heroicons/vue/24/outline'
import Toast from '@/components/Toast.vue'
import { useToast } from '@/composables/useToast'
import apiClient from '@/config/api'

const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 1 + i)
const { toast, showToast } = useToast()
const loading = ref(false)
const saving = ref(false)
const kpiData = ref(null)
const editingId = ref(null)
const showSaveModal = ref(false)
const filters = ref({ year: new Date().getFullYear() })

// ── Progress Modal State ──
const showProgressModal = ref(false)
const progressKPI = ref(null)          // KPI yang sedang di-update
const progressForm = reactive({ actual: null })
const sliderValue = ref(0)

// ── Save Form (unchanged) ──
const saveForm = reactive({
  start_date: `${new Date().getFullYear()}-01-01`,
  end_date: `${new Date().getFullYear()}-12-31`,
  year: new Date().getFullYear(),
  kpi1_target: 4, kpi1_actual: 0,
  kpi2_target: 1, kpi2_actual: 0,
  kpi3_revenue_target: 0, kpi3_revenue_actual: 0,
  kpi4_omzet_target: 0, kpi4_omzet_actual: 0,
  kpi5_target_rating: 4.8, kpi5_actual_rating: 0,
  kpi6_target_pct: 30, kpi6_actual_pct: 0,
  kpi7_target_turnover: 10, kpi7_actual_turnover: 0,
  notes: ''
})

// ─────────────────────────────────────────────────────────────
// PROGRESS MODAL: Computed
// ─────────────────────────────────────────────────────────────

/** Label input aktual berdasarkan KPI */
const progressActualLabel = computed(() => {
  if (!progressKPI.value) return 'Nilai Aktual'
  const labels = {
    1: 'Jumlah Outlet Franchise Terbentuk',
    2: 'Jumlah Sistem Learning Center Terbentuk',
    3: 'Revenue Aktual (Rp)',
    4: 'Omzet Aktual (Rp)',
    5: 'Rating Aktual (skala 0–5)',
    6: '% Customer Loyal Aktual',
    7: 'Turnover Rate Aktual (%)',
  }
  return labels[progressKPI.value.no] || 'Nilai Aktual'
})

/** Tampilkan slider hanya untuk KPI yang punya range numerik jelas */
const showSlider = computed(() => progressKPI.value && [1, 2, 3, 4, 6].includes(progressKPI.value.no))

/** Max value slider */
const sliderMax = computed(() => {
  if (!progressKPI.value) return 100
  const t = progressKPI.value.target || 1
  if ([1, 2].includes(progressKPI.value.no)) return Math.max(t * 2, 10)
  if ([3, 4].includes(progressKPI.value.no)) return t * 1.5
  return 100  // % based
})

const sliderStep = computed(() => {
  if (!progressKPI.value) return 1
  if (progressKPI.value.no === 5) return 0.01
  if ([6, 7].includes(progressKPI.value.no)) return 0.1
  return 1  // satuan (KPI 1, 2, 3, 4)
})

/** Persentase slider terhadap target */
const sliderPct = computed(() => {
  if (!progressKPI.value || !progressKPI.value.target) return 0
  return Math.min(200, ((sliderValue.value || 0) / progressKPI.value.target) * 100)
})

/** Format label slider */
const formatSliderLabel = (val) => {
  if (!progressKPI.value) return val
  if ([3, 4].includes(progressKPI.value.no)) return `Rp ${(val / 1e6).toFixed(0)}jt`
  if ([1, 2].includes(progressKPI.value.no)) return `${Math.round(val)}`
  return `${val.toFixed(0)}%`
}

/** Sinkronisasi slider → input field */
const onSliderChange = () => {
  progressForm.actual = sliderValue.value
}

/** Preview score setelah nilai aktual diubah — kalkulasi ulang di frontend */
const computedPreviewScore = computed(() => {
  if (!progressKPI.value || progressForm.actual === null || progressForm.actual === '') return progressKPI.value?.score ?? 0
  const a = parseFloat(progressForm.actual) || 0
  const t = progressKPI.value.target || 1
  const no = progressKPI.value.no

  if (no === 1 || no === 2) return Math.min(200, (a / t) * 100)
  if (no === 3) return Math.min(200, (a / t) * 100)
  if (no === 4) return Math.min(200, (a / t) * 100)
  if (no === 5) {
    if (a > 4.8) return 100
    if (a >= 4.5) return 85
    if (a >= 4.2) return 70
    return 0
  }
  if (no === 6) return Math.min(150, (a / t) * 100)
  if (no === 7) {
    if (a < 5) return 120
    if (a <= 10) return 100
    if (a <= 15) return 80
    if (a <= 20) return 60
    if (a <= 25) return 40
    return 0
  }
  return 0
})

const getPreviewStatus = (score) => {
  if (score >= 100) return 'excellent'
  if (score >= 85) return 'good'
  if (score >= 70) return 'fair'
  if (score >= 60) return 'poor'
  return 'critical'
}

// ─────────────────────────────────────────────────────────────
// PROGRESS MODAL: Open / Close / Save
// ─────────────────────────────────────────────────────────────

const openProgressModal = (kpi) => {
  progressKPI.value = kpi
  // Prefill dengan nilai aktual saat ini
  progressForm.actual = kpi.actual ?? 0
  sliderValue.value = kpi.actual ?? 0
  showProgressModal.value = true
}

const closeProgressModal = () => {
  showProgressModal.value = false
  progressKPI.value = null
}

/** Save progress — kirim semua field ke endpoint /save yang sudah ada,
    hanya ubah 1 field aktual yang di-update, sisanya tetap dari kpiData */
const saveProgress = async () => {
  if (!kpiData.value || !progressKPI.value) return
  try {
    saving.value = true

    // Susun payload lengkap dari data existing, override 1 field aktual
    const get = (no) => kpiData.value.kpis.find(k => k.no === no)
    const newActual = progressForm.actual !== null && progressForm.actual !== '' ? Number(progressForm.actual) : 0
    const no = progressKPI.value.no

    const params = {
      id: kpiData.value.id,
      start_date: kpiData.value.period.start_date,
      end_date: kpiData.value.period.end_date,
      // KPI 1
      kpi1_target: get(1)?.target ?? 4,
      kpi1_actual: no === 1 ? newActual : (get(1)?.actual ?? 0),
      // KPI 2
      kpi2_target: get(2)?.target ?? 1,
      kpi2_actual: no === 2 ? newActual : (get(2)?.actual ?? 0),
      // KPI 3
      kpi3_revenue_target: get(3)?.target ?? 0,
      kpi3_revenue_actual: no === 3 ? newActual : (get(3)?.actual ?? 0),
      // KPI 4
      kpi4_omzet_target: get(4)?.target ?? 0,
      kpi4_omzet_actual: no === 4 ? newActual : (get(4)?.actual ?? 0),
      // KPI 5
      kpi5_target_rating: get(5)?.target ?? 4.8,
      kpi5_actual_rating: no === 5 ? newActual : (get(5)?.actual ?? 0),
      // KPI 6
      kpi6_target_pct: get(6)?.target ?? 30,
      kpi6_actual_pct: no === 6 ? newActual : (get(6)?.actual ?? 0),
      // KPI 7
      kpi7_target_turnover: get(7)?.target ?? 10,
      kpi7_actual_turnover: no === 7 ? newActual : (get(7)?.actual ?? 0),
      notes: kpiData.value.notes || '',
    }

    const res = await apiClient.post('/web/kpi/holding/save', {
      jsonrpc: '2.0', method: 'call', params
    })

    if (res.data.result.success) {
      showToast({ message: `✅ Progress KPI ${progressKPI.value.no} berhasil diupdate`, type: 'success', duration: 2500 })
      closeProgressModal()
      await loadKPIData()
    } else {
      showToast({ message: res.data.result.error || 'Gagal menyimpan', type: 'error' })
    }
  } catch (e) {
    showToast({ message: 'Terjadi kesalahan', type: 'error' })
  } finally {
    saving.value = false
  }
}

// ─────────────────────────────────────────────────────────────
// API (unchanged)
// ─────────────────────────────────────────────────────────────

const loadKPIData = async () => {
  try {
    loading.value = true; kpiData.value = null
    const res = await apiClient.post('/web/kpi/holding/dashboard', {
      jsonrpc: '2.0', method: 'call', params: { year: filters.value.year }
    })
    if (res.data.result.success) kpiData.value = transformResponse(res.data.result.data)
  } catch (e) {
    if (e.response?.status !== 404) showToast({ message: e.response?.data?.result?.error || 'Gagal memuat data', type: 'error' })
  } finally { loading.value = false }
}

const saveKPIData = async () => {
  try {
    saving.value = true
    const params = { ...saveForm }
    if (editingId.value) params.id = editingId.value
    const res = await apiClient.post('/web/kpi/holding/save', { jsonrpc: '2.0', method: 'call', params })
    if (res.data.result.success) {
      showToast({ message: '✅ Data KPI berhasil disimpan', type: 'success', duration: 2500 })
      closeSaveModal(); await loadKPIData()
    } else { showToast({ message: res.data.result.error || 'Gagal menyimpan', type: 'error' }) }
  } catch (e) { showToast({ message: 'Terjadi kesalahan', type: 'error' })
  } finally { saving.value = false }
}

const transformResponse = (data) => ({ id: data.id, period: data.period, kpis: data.kpis, summary: data.summary, notes: data.notes })

const openSaveModal = () => {
  saveForm.start_date = `${filters.value.year}-01-01`
  saveForm.end_date = `${filters.value.year}-12-31`
  saveForm.year = filters.value.year
  if (kpiData.value) {
    editingId.value = kpiData.value.id
    const get = (no) => kpiData.value.kpis.find(k => k.no === no)
    saveForm.start_date = kpiData.value.period.start_date; saveForm.end_date = kpiData.value.period.end_date
    saveForm.kpi1_target = get(1)?.target ?? 4; saveForm.kpi1_actual = get(1)?.actual ?? 0
    saveForm.kpi2_target = get(2)?.target ?? 1; saveForm.kpi2_actual = get(2)?.actual ?? 0
    saveForm.kpi3_revenue_target = get(3)?.target ?? 0; saveForm.kpi3_revenue_actual = get(3)?.actual ?? 0
    saveForm.kpi4_omzet_target = get(4)?.target ?? 0; saveForm.kpi4_omzet_actual = get(4)?.actual ?? 0
    saveForm.kpi5_target_rating = get(5)?.target ?? 4.8; saveForm.kpi5_actual_rating = get(5)?.actual ?? 0
    saveForm.kpi6_target_pct = get(6)?.target ?? 30; saveForm.kpi6_actual_pct = get(6)?.actual ?? 0
    saveForm.kpi7_target_turnover = get(7)?.target ?? 10; saveForm.kpi7_actual_turnover = get(7)?.actual ?? 0
    saveForm.notes = kpiData.value.notes || ''
  } else {
    editingId.value = null
    Object.assign(saveForm, { kpi1_target:4, kpi1_actual:0, kpi2_target:1, kpi2_actual:0, kpi3_revenue_target:0, kpi3_revenue_actual:0, kpi4_omzet_target:0, kpi4_omzet_actual:0, kpi5_target_rating:4.8, kpi5_actual_rating:0, kpi6_target_pct:30, kpi6_actual_pct:0, kpi7_target_turnover:10, kpi7_actual_turnover:0, notes:'' })
  }
  showProgressModal.value = false  // tutup progress modal kalau terbuka
  showSaveModal.value = true
}
const closeSaveModal = () => { showSaveModal.value = false; editingId.value = null }

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

/** Progress persen aktual vs target (untuk progress bar tipis di card) */
const getProgressPct = (kpi) => {
  if (!kpi.target || kpi.target === 0) return null
  // KPI 7 (turnover): lebih rendah lebih baik, jadi invert
  if (kpi.no === 7) return null  // tidak relevan ditampilkan sebagai progress
  return Math.min(100, (kpi.actual / kpi.target) * 100)
}

// Formatters
const formatCurrency = (val) => (!val && val !== 0) ? '-' : new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val)
const formatDate = (d) => d ? new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'
const formatActual = (kpi) => { if ([3,4].includes(kpi.no)) return formatCurrency(kpi.actual); if ([6,7].includes(kpi.no)) return `${kpi.actual}%`; if (kpi.no===5) return kpi.actual ? kpi.actual.toFixed(2) : '0'; return kpi.actual ?? '-' }
const formatTarget = (kpi) => { if ([3,4].includes(kpi.no)) return formatCurrency(kpi.target); if ([6,7].includes(kpi.no)) return `${kpi.target}%`; if (kpi.no===5) return kpi.target ? kpi.target.toFixed(1) : '4.8'; return kpi.target ?? '-' }

// Style helpers
const countByStatus = (s) => kpiData.value?.kpis.filter(k => k.status === s).length ?? 0
const getOverallStatus = (s) => s >= 100 ? 'Excellent' : s >= 80 ? 'On Track' : s >= 70 ? 'At Risk' : s >= 60 ? 'Below Target' : 'Critical'
const getGradeTextColor = (g) => ({ A:'text-amber-600', B:'text-green-600', C:'text-blue-600', D:'text-orange-500', E:'text-red-500' }[g] || 'text-gray-700')
const getGradeBgColor = (g) => ({ A:'bg-amber-500', B:'bg-green-500', C:'bg-blue-500', D:'bg-orange-500', E:'bg-red-500' }[g] || 'bg-gray-400')
const getScoreColorLight = (s) => ({ excellent:'text-green-600', good:'text-blue-600', fair:'text-amber-600', poor:'text-orange-500', critical:'text-red-500' }[s] || 'text-gray-700')
const getBarColor = (s) => ({ excellent:'bg-gradient-to-r from-green-500 to-green-400', good:'bg-gradient-to-r from-blue-500 to-blue-400', fair:'bg-gradient-to-r from-amber-500 to-amber-400', poor:'bg-gradient-to-r from-orange-500 to-orange-400', critical:'bg-gradient-to-r from-red-500 to-red-400' }[s] || 'bg-gray-300')
const getStatusBadgeLight = (s) => ({ excellent:'bg-green-50 text-green-700 border border-green-200', good:'bg-blue-50 text-blue-700 border border-blue-200', fair:'bg-amber-50 text-amber-700 border border-amber-200', poor:'bg-orange-50 text-orange-700 border border-orange-200', critical:'bg-red-50 text-red-700 border border-red-200' }[s] || 'bg-gray-100 text-gray-500 border border-gray-200')
const getStatusDotLight = (s) => ({ excellent:'bg-green-500', good:'bg-blue-500', fair:'bg-amber-500', poor:'bg-orange-500', critical:'bg-red-500' }[s] || 'bg-gray-400')
const getStripeColor = (s) => ({ excellent:'bg-green-500', good:'bg-blue-500', fair:'bg-amber-500', poor:'bg-orange-500', critical:'bg-red-500' }[s] || 'bg-gray-300')
const getIconBgLight = (s) => ({ excellent:'bg-green-50', good:'bg-blue-50', fair:'bg-amber-50', poor:'bg-orange-50', critical:'bg-red-50' }[s] || 'bg-gray-100')
const getIconColorLight = (s) => ({ excellent:'text-green-600', good:'text-blue-600', fair:'text-amber-600', poor:'text-orange-500', critical:'text-red-500' }[s] || 'text-gray-400')
const getKPIIcon = (no) => ({ 1:BuildingStorefrontIcon, 2:AcademicCapIcon, 3:TruckIcon, 4:CurrencyDollarIcon, 5:StarIcon, 6:UserGroupIcon, 7:ArrowTrendingDownIcon }[no] || ChartBarSquareIcon)

onMounted(async () => { await loadKPIData() })
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=DM+Mono:wght@400;500&display=swap');

* { font-family: 'DM Sans', sans-serif; }

.holding-bg {
  background: #F7F7F5;
  background-image: radial-gradient(ellipse at 0% 0%, rgba(201,168,76,0.05) 0%, transparent 50%);
  min-height: 100vh;
}
.holding-header { background: rgba(255,255,255,0.97); backdrop-filter: blur(16px); position: sticky; top: 0; z-index: 40; }
.holding-hero-card { background: white; border: 1px solid #EDE8DF; box-shadow: 0 2px 16px rgba(201,168,76,0.06), 0 1px 4px rgba(0,0,0,0.04); }
.holding-stat-box { background: #FAFAF8; border: 1px solid #EDE8DF; border-radius: 14px; padding: 12px 14px; }
.holding-kpi-card { transition: all 0.22s ease; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
.holding-kpi-card:hover { box-shadow: 0 8px 24px rgba(0,0,0,0.08), 0 2px 8px rgba(201,168,76,0.08); transform: translateY(-2px); border-color: #D4C49A; }

/* Quick Update Button */
.quick-update-btn {
  background: #FEF3C7;
  color: #A0782A;
  border: 1px solid #FDE68A;
}
.quick-update-btn:hover {
  background: linear-gradient(135deg, #C9A84C, #A0782A);
  color: white;
  border-color: transparent;
  transform: translateY(-1px);
  box-shadow: 0 3px 10px rgba(160,120,42,0.25);
}

/* Buttons */
.holding-btn-outline { background: white; border: 1.5px solid #D1D5DB; color: #374151; border-radius: 12px; font-size: 0.8125rem; font-weight: 600; transition: all 0.2s; }
.holding-btn-outline:hover { background: #F9FAFB; border-color: #9CA3AF; }
.holding-btn-outline:disabled { opacity: 0.4; cursor: not-allowed; }
.holding-btn-gold { background: linear-gradient(135deg, #C9A84C, #A0782A); color: white; border-radius: 12px; font-size: 0.8125rem; font-weight: 700; letter-spacing: 0.01em; box-shadow: 0 3px 12px rgba(160,120,42,0.22); transition: all 0.2s; border: none; }
.holding-btn-gold:hover { background: linear-gradient(135deg, #D4B860, #B8892E); box-shadow: 0 5px 20px rgba(160,120,42,0.32); transform: translateY(-1px); }
.holding-btn-gold:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

/* Select */
.holding-select { background: white; border: 1.5px solid #D1D5DB; color: #374151; border-radius: 10px; padding: 8px 32px 8px 12px; font-size: 0.8125rem; font-weight: 500; transition: all 0.2s; appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 8px center; background-size: 16px; }
.holding-select:focus { outline: none; border-color: #C9A84C; box-shadow: 0 0 0 3px rgba(201,168,76,0.12); }

/* Progress Slider */
.progress-slider {
  -webkit-appearance: none;
  appearance: none;
  height: 6px;
  border-radius: 9999px;
  background: linear-gradient(to right, #C9A84C 0%, #C9A84C var(--pct, 50%), #E5E7EB var(--pct, 50%), #E5E7EB 100%);
  outline: none;
  cursor: pointer;
}
.progress-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 20px; height: 20px;
  border-radius: 50%;
  background: linear-gradient(135deg, #C9A84C, #A0782A);
  border: 3px solid white;
  box-shadow: 0 2px 8px rgba(160,120,42,0.35);
  cursor: pointer;
  transition: all 0.15s;
}
.progress-slider::-webkit-slider-thumb:hover { transform: scale(1.2); box-shadow: 0 4px 14px rgba(160,120,42,0.45); }
.progress-slider::-moz-range-thumb { width: 18px; height: 18px; border-radius: 50%; background: linear-gradient(135deg, #C9A84C, #A0782A); border: 3px solid white; box-shadow: 0 2px 8px rgba(160,120,42,0.35); cursor: pointer; }

/* Table */
.holding-th { padding: 11px 14px; font-size: 0.65rem; font-weight: 700; letter-spacing: 0.09em; text-transform: uppercase; color: #9CA3AF; text-align: center; }
.holding-td { padding: 13px 14px; }

/* Modal forms */
.modal-section-label { font-size: 0.7rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: #A0782A; margin-bottom: 12px; }
.holding-label { display: block; font-size: 0.65rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #6B7280; margin-bottom: 6px; }
.holding-input { width: 100%; background: white; border: 1.5px solid #E5E7EB; color: #111827; border-radius: 10px; padding: 9px 12px; font-size: 0.875rem; font-family: 'DM Mono', monospace; transition: all 0.2s; }
.holding-input:focus { outline: none; border-color: #C9A84C; box-shadow: 0 0 0 3px rgba(201,168,76,0.1); }
.holding-input::placeholder { color: #D1D5DB; }
.holding-hint { font-size: 0.65rem; color: #9CA3AF; margin-top: 8px; background: #F9FAFB; padding: 8px 12px; border-radius: 8px; border: 1px solid #F3F4F6; }

/* Hilangkan spinner arrow pada input number */
.no-spinner::-webkit-inner-spin-button,
.no-spinner::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
.no-spinner { -moz-appearance: textfield; appearance: textfield; }

/* Scrollbar */
::-webkit-scrollbar { width: 5px; height: 5px; }
::-webkit-scrollbar-track { background: #F3F4F6; border-radius: 10px; }
::-webkit-scrollbar-thumb { background: rgba(201,168,76,0.3); border-radius: 10px; }
::-webkit-scrollbar-thumb:hover { background: rgba(160,120,42,0.45); }
</style>