<!-- ============================================================================
FILE: src/views/KPIOutletDashboard.vue  
VERSION: 5.0.0 - FINAL: Complete Measurement Display + Status Badges
============================================================================
FEATURES:
1. ✅ Show measurement data untuk SEMUA KPI (extract dari nested/data)
2. ✅ Status badge dengan color coding
3. ✅ Detail modal baca dari nested structure
============================================================================ -->

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Toast -->
    <Toast
      v-model:show="toast.show"
      :message="toast.message"
      :type="toast.type"
      :duration="toast.duration"
    />
    
    <!-- Header - SAMA seperti sebelumnya -->
    <div class="bg-white shadow-sm border-b border-gray-200">
      <div class="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex flex-col space-y-4 lg:space-y-0 lg:flex-row lg:items-center lg:justify-between">
          
          <!-- Title -->
          <div class="flex items-center gap-4">
            <div class="p-3 bg-gradient-to-br from-[#b70000] to-[#950000] rounded-xl shadow-lg">
              <ChartBarSquareIcon class="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">
                KPI Outlet Dashboard
              </h1>
              <p class="text-sm text-gray-600 mt-1">
                📊 Monitor performance metrics • Real-time V3
              </p>
            </div>
          </div>
          
          <!-- Filter Controls -->
          <div class="flex flex-wrap gap-3 items-end">
            <!-- Outlet -->
            <div class="relative">
              <label class="block text-xs font-semibold text-gray-700 mb-1.5">
                <BuildingStorefrontIcon class="h-3 w-3 inline mr-1" />
                Outlet
              </label>
              <select
                v-model="filters.store_id"
                @change="handleStoreChange"
                class="w-full sm:w-52 pl-3 pr-10 py-2.5 text-sm font-medium border-2 border-gray-300 rounded-xl focus:border-[#b70000] focus:ring-4 focus:ring-[#b70000]/10 transition-all"
              >
                <option value="">🏪 Pilih Outlet</option>
                <option v-for="store in stores" :key="store.id" :value="store.id">
                  {{ store.name }}
                </option>
              </select>
            </div>

            <!-- Month -->
            <div class="relative">
              <label class="block text-xs font-semibold text-gray-700 mb-1.5">
                <CalendarIcon class="h-3 w-3 inline mr-1" />
                Bulan
              </label>
              <select
                v-model="filters.month"
                @change="handlePeriodChange"
                class="w-full sm:w-40 pl-3 pr-10 py-2.5 text-sm font-medium border-2 border-gray-300 rounded-xl focus:border-[#b70000] focus:ring-4 focus:ring-[#b70000]/10 transition-all"
              >
                <option v-for="(month, index) in months" :key="index" :value="index + 1">
                  {{ month }}
                </option>
              </select>
            </div>

            <!-- Year -->
            <div class="relative">
              <label class="block text-xs font-semibold text-gray-700 mb-1.5">
                <CalendarDaysIcon class="h-3 w-3 inline mr-1" />
                Tahun
              </label>
              <select
                v-model="filters.year"
                @change="handlePeriodChange"
                class="w-full sm:w-32 pl-3 pr-10 py-2.5 text-sm font-medium border-2 border-gray-300 rounded-xl focus:border-[#b70000] focus:ring-4 focus:ring-[#b70000]/10 transition-all"
              >
                <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
              </select>
            </div>

            <!-- Actions -->
            <div class="flex gap-2">
              <button
                @click="loadKPIData"
                :disabled="loading || !filters.store_id"
                class="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#b70000] to-[#950000] text-white rounded-xl text-sm font-semibold hover:from-[#950000] hover:to-[#7a0000] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
              >
                <ArrowPathIcon 
                  class="h-4 w-4" 
                  :class="{ 'animate-spin': loading }" 
                />
                {{ loading ? 'Loading...' : 'Refresh' }}
              </button>

              <button
                @click="exportToCSV"
                :disabled="!kpiData || isExporting"
                class="inline-flex items-center gap-2 px-4 py-2.5 border-2 border-gray-300 bg-white text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 disabled:opacity-50 transition-all"
              >
                <DocumentArrowDownIcon class="h-4 w-4" />
                Export
              </button>

              <button
                @click="resetFilters"
                class="inline-flex items-center gap-2 px-4 py-2.5 border-2 border-gray-300 bg-white text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all"
              >
                <BackspaceIcon class="h-4 w-4" />
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      
      <!-- Loading State - SAMA -->
      <div v-if="loading" class="flex justify-center items-center h-96">
        <div class="text-center">
          <div class="relative">
            <div class="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-[#b70000] mx-auto"></div>
            <div class="absolute inset-0 flex items-center justify-center">
              <ChartBarIcon class="h-8 w-8 text-[#b70000] animate-pulse" />
            </div>
          </div>
          <p class="mt-6 text-lg font-semibold text-gray-700">Memuat data KPI...</p>
        </div>
      </div>

      <!-- Main Content when data loaded -->
      <template v-else-if="kpiData">
        
        <!-- Hero Cards - SAMA -->
         <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          
          <!-- Total Score Card -->
          <div class="lg:col-span-2 bg-gradient-to-br from-[#b70000] via-[#950000] to-[#7a0000] rounded-2xl shadow-2xl p-8 text-white relative overflow-hidden">
            <div class="absolute inset-0 opacity-10">
              <div class="absolute inset-0" style="background-image: url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')"></div>
            </div>

            <div class="relative flex flex-col md:flex-row items-center justify-between gap-6">
              
              <!-- Score Circle -->
              <div class="flex-shrink-0">
                <div class="relative">
                  <svg class="w-44 h-44 transform -rotate-90">
                    <circle
                      class="text-white text-opacity-20"
                      stroke-width="14"
                      stroke="currentColor"
                      fill="transparent"
                      r="70"
                      cx="88"
                      cy="88"
                    />
                    <circle
                      class="text-white transition-all duration-1000"
                      stroke-width="14"
                      :stroke-dasharray="2 * Math.PI * 70"
                      :stroke-dashoffset="2 * Math.PI * 70 * (1 - kpiData.summary.total_score / 100)"
                      stroke-linecap="round"
                      stroke="currentColor"
                      fill="transparent"
                      r="70"
                      cx="88"
                      cy="88"
                    />
                  </svg>
                  <div class="absolute inset-0 flex flex-col items-center justify-center">
                    <span class="text-5xl font-bold">{{ formatNumber(kpiData.summary.total_score) }}</span>
                    <span class="text-sm opacity-90 font-medium">Total Score</span>
                  </div>
                </div>
              </div>

              <!-- Info -->
              <div class="flex-1 text-center md:text-left">
                <div class="mb-6">
                  <h2 class="text-3xl font-bold mb-2">Performance Overview</h2>
                  <p class="text-white/80 text-sm">{{ kpiData.store_info.name }} • {{ kpiData.period.display }}</p>
                </div>

                <div class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 mb-6">
                  <component 
                    :is="getStatusIcon(kpiData.summary.achievement_status)" 
                    class="h-5 w-5"
                  />
                  <span class="font-bold text-lg">{{ kpiData.summary.achievement_status }}</span>
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div class="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <p class="text-xs opacity-80 mb-1">Grade</p>
                    <p class="text-3xl font-bold">{{ kpiData.summary.grade }}</p>
                  </div>
                  <div class="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <p class="text-xs opacity-80 mb-1">Target</p>
                    <p class="text-3xl font-bold">{{ kpiData.summary.target_score }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Month Progress -->
          <div class="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <div class="flex items-center gap-3 mb-6">
              <div class="p-2 bg-gray-100 rounded-lg">
                <CalendarIcon class="h-6 w-6 text-[#b70000]" />
              </div>
              <div>
                <h3 class="text-lg font-bold text-gray-900">Progress Bulan</h3>
                <p class="text-xs text-gray-500">Tracking periode berjalan</p>
              </div>
            </div>

            <div class="space-y-4">
              <div>
                <div class="flex justify-between text-sm mb-2">
                  <span class="font-medium text-gray-700">Hari Berjalan</span>
                  <span class="font-bold text-[#b70000]">
                    {{ kpiData.period.days_elapsed }} / {{ kpiData.period.days_in_month }}
                  </span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-3">
                  <div
                    class="bg-gradient-to-r from-[#b70000] to-[#950000] h-3 rounded-full transition-all duration-500"
                    :style="{ width: `${kpiData.period.progress_pct}%` }"
                  ></div>
                </div>
                <p class="text-center text-2xl font-bold text-gray-900 mt-3">
                  {{ kpiData.period.progress_pct?.toFixed(1) }}%
                </p>
              </div>

              <div class="grid grid-cols-2 gap-3 pt-4 border-t border-gray-200">
                <div class="text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p class="text-xs text-gray-600 font-medium mb-1">Sisa Hari</p>
                  <p class="text-2xl font-bold text-[#b70000]">
                    {{ kpiData.period.days_in_month - kpiData.period.days_elapsed }}
                  </p>
                </div>
                <div class="text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p class="text-xs text-gray-600 font-medium mb-1">Status</p>
                  <p class="text-xl font-bold text-gray-900">
                    {{ getProgressStatus(kpiData.period.days_elapsed) }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- KPI Cards Grid -->
        <div class="mb-8">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl font-bold text-gray-900">📈 Key Performance Indicators</h3>
            <p class="text-sm text-gray-500">{{ kpiData.kpi_scores.length }} metrics</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            
            <!-- ========================================
                 KPI CARD dengan MEASUREMENT & STATUS
            ======================================== -->
            <div
              v-for="kpi in kpiData.kpi_scores"
              :key="kpi.type"
              class="group bg-white rounded-2xl shadow-md border-2 border-gray-200 hover:border-[#b70000] hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              <!-- Header - Pitcar Red Gradient -->
              <div class="p-5 pb-4 bg-gradient-to-br from-[#b70000] to-[#950000]">
                <div class="flex items-start justify-between mb-3">
                  <div class="flex items-center gap-2">
                    <span class="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-white/30 text-white text-xs font-bold">
                      #{{ kpi.no }}
                    </span>
                    <span class="text-xs font-bold text-white/90 bg-white/20 px-2 py-1 rounded-lg">
                      {{ kpi.weight }}%
                    </span>
                  </div>
                  <div class="p-2 bg-white/30 rounded-lg">
                    <component 
                      :is="getKPIIcon(kpi.name)" 
                      class="h-6 w-6 text-white"
                    />
                  </div>
                </div>
                <h4 class="text-lg font-bold text-white leading-tight">
                  {{ kpi.name }}
                </h4>
              </div>

              <!-- Body -->
              <!-- Body -->
              <div class="p-5">
                
                <!-- Value Display - CONDITIONAL LAYOUT -->
                <!-- Value Display - STANDARD LAYOUT FOR ALL -->
                <div class="mb-3">
                  <div class="flex items-baseline gap-2 mb-2">
                    <span class="text-3xl font-bold text-gray-900">
                      {{ kpi.name === 'Profit' ? kpi.achievement?.toFixed(1) : formatKPIValue(kpi) }}
                    </span>
                    <span class="text-sm text-gray-500">
                      / {{ kpi.name === 'Profit' ? '100' : formatKPITarget(kpi) }}
                    </span>
                  </div>
                  
                  <!-- Progress Bar -->
                  <div class="relative w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      class="absolute top-0 left-0 h-full rounded-full transition-all duration-700 bg-gradient-to-r from-[#b70000] to-[#950000]"
                      :style="{ width: `${Math.min(kpi.achievement, 100)}%` }"
                    ></div>
                  </div>
                </div>

                <!-- ========================================
                    MEASUREMENT SUMMARY - COMPACT
                ======================================== -->
                
                <!-- 1️⃣ PROFIT - COMPACT -->
                <div v-if="kpi.name === 'Profit'" class="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200 text-xs space-y-1.5">
                  <div class="pt-1 space-y-2">
                    <!-- Revenue -->
                    <div>
                      <span class="text-[10px] text-gray-500 block mb-0.5">Revenue:</span>
                      <span class="font-bold text-gray-900 text-sm">{{ kpi.formatted?.revenue || 'Rp 0' }}</span>
                    </div>

                    <!-- Daily Target -->
                    <div v-if="kpi.daily_tracking" class="pt-2 border-t border-gray-200">
                      <div class="mb-2">
                        <span class="text-[10px] text-blue-600 font-medium block mb-0.5">
                          Target Hari Ini ({{ kpi.daily_tracking.days_elapsed }}d):
                        </span>
                        <span class="font-bold text-blue-700 text-sm">
                          {{ formatDailyTracking(kpi.daily_tracking.target_daily) }}
                        </span>
                      </div>
                      
                      <!-- Gap / Status -->
                      <div>
                        <span class="text-[10px] font-medium block mb-0.5" :class="kpi.daily_tracking.gap_daily >= 0 ? 'text-green-600' : 'text-red-600'">
                          {{ kpi.daily_tracking.gap_daily >= 0 ? '✅ Di Atas' : '⚠️ Di Bawah' }}:
                        </span>
                        <span class="font-bold text-sm" :class="kpi.daily_tracking.gap_daily >= 0 ? 'text-green-700' : 'text-red-700'">
                          {{ formatDailyTracking(Math.abs(kpi.daily_tracking.gap_daily)) }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 2️⃣ LEAD TIME - COMPACT -->
                <div v-if="kpi.name === 'Lead Time' && kpi.detail" class="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200 text-xs space-y-1">
                  <!-- System Tracking -->
                  <div v-if="kpi.detail.tunggu_penerimaan" class="flex justify-between">
                    <span class="text-gray-600">Tunggu Penerimaan:</span>
                    <span class="font-bold" :class="getLeadTimeColor(kpi.detail.tunggu_penerimaan.rate)">
                      {{ kpi.detail.tunggu_penerimaan.rate?.toFixed(1) }}%
                    </span>
                  </div>
                  <div v-if="kpi.detail.lead_time_servis" class="flex justify-between">
                    <span class="text-gray-600">Lead Time Servis:</span>
                    <span class="font-bold" :class="getLeadTimeColor(kpi.detail.lead_time_servis.rate)">
                      {{ kpi.detail.lead_time_servis.rate?.toFixed(1) }}%
                    </span>
                  </div>
                  
                  <!-- ⭐ Manual Inputs -->
                  <div v-if="kpi.detail?.manual_inputs" class="pt-2 mt-2 border-t border-gray-200">
                    <div class="flex justify-between items-center mb-1">
                      <span class="text-gray-500 text-[10px]">AFRT (First Resp):</span>
                      <span class="font-semibold text-blue-700">{{ kpi.detail.manual_inputs.first_response }}m</span>
                    </div>
                    <div class="flex justify-between items-center">
                      <span class="text-gray-500 text-[10px]">ART (Avg Resp):</span>
                      <span class="font-semibold text-blue-700">{{ kpi.detail.manual_inputs.avg_response }}m</span>
                    </div>
                  </div>
                </div>

                <!-- 3️⃣ SAMPLING QUANTITY (INTERNAL) - COMPACT -->
                <div v-else-if="(kpi.name === 'Sampling Quantity' || kpi.name === 'Sampling Internal') && kpi.data" class="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200 text-xs space-y-1">
                  <div class="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">{{ kpi.data.description || 'Internal Check' }}</div>
                  <div v-if="kpi.data.explanation" class="text-[10px] text-blue-800 bg-blue-50 p-2 rounded mb-2 border border-blue-100 italic">
                    {{ kpi.data.explanation }}
                  </div>
                  <div class="flex justify-between items-center pb-1 border-b border-gray-200 mb-1">
                    <span class="text-gray-600">Target Bulanan:</span>
                    <span class="font-bold text-gray-900">{{ kpi.target_qty || 25 }} Qty</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Total Actual:</span>
                    <span class="font-bold text-gray-900">{{ kpi.data.total }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Pass:</span>
                    <span class="font-bold text-green-600">{{ kpi.data.pass }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Fail:</span>
                    <span class="font-bold text-red-600">{{ kpi.data.fail }}</span>
                  </div>
                  <!-- Failure List -->
                  <div v-if="kpi.data.failures?.length > 0" class="mt-2 pt-2 border-t border-gray-200">
                    <div class="text-[9px] font-bold text-gray-500 uppercase mb-1">Recent Failures</div>
                    <div v-for="(fail, idx) in kpi.data.failures" :key="idx" class="mb-1 border-b border-gray-100 last:border-0 pb-1">
                       <div class="flex justify-between items-start">
                         <span class="font-bold text-[10px] text-gray-800 leading-tight">{{ fail.sop_name }}</span>
                         <span class="text-[9px] text-gray-400 whitespace-nowrap ml-1">{{ fail.date_str }}</span>
                       </div>
                       <div v-if="fail.notes" class="text-[9px] text-gray-500 italic truncate">{{ fail.notes }}</div>
                    </div>
                  </div>
                </div>

                <!-- 4️⃣ SAMPLING QUALITY (EKSTERNAL) - COMPACT -->
                <div v-else-if="(kpi.name === 'Sampling Eksternal' || kpi.name === 'Sampling Quality (Ext)' || kpi.name === 'Sampling External') && kpi.data" class="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200 text-xs space-y-1">
                  <div class="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">{{ kpi.data.description || 'External Check' }}</div>
                  <div v-if="kpi.data.explanation" class="text-[10px] text-blue-800 bg-blue-50 p-2 rounded mb-2 border border-blue-100 italic">
                    {{ kpi.data.explanation }}
                  </div>
                  <div v-if="kpi.data.explanation" class="text-[10px] text-blue-800 bg-blue-50 p-2 rounded mb-2 border border-blue-100 italic">
                    {{ kpi.data.explanation }}
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Total:</span>
                    <span class="font-bold text-gray-900">{{ kpi.data.total }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Pass / Fail:</span>
                    <span class="font-bold">
                      <span class="text-green-600">{{ kpi.data.pass }}</span> / 
                      <span class="text-red-600">{{ kpi.data.fail }}</span>
                    </span>
                  </div>
                  <div v-if="kpi.data.fail > 0" class="flex flex-col gap-1 pt-1 pb-1 border-b border-gray-200">
                    <span class="text-[10px] text-gray-500">Detail Temuan:</span>
                    <div class="text-[10px] text-gray-700">
                      Crit:{{ kpi.data.fail_detail?.critical || 0 }} • 
                      Maj:{{ kpi.data.fail_detail?.major || 0 }} • 
                      Min:{{ kpi.data.fail_detail?.minor || 0 }}
                    </div>
                  </div>
                  <div class="flex justify-between border-t border-gray-300 pt-1">
                    <span class="text-gray-700 font-medium">Pass Rate:</span>
                    <span class="font-bold text-[#b70000]">{{ kpi.data.pass_rate?.toFixed(1) }}%</span>
                  </div>
                  <!-- Failure List -->
                  <div v-if="kpi.data.failures?.length > 0" class="mt-2 pt-2 border-t border-gray-200">
                    <div class="text-[9px] font-bold text-gray-500 uppercase mb-1">Recent Failures</div>
                    <div v-for="(fail, idx) in kpi.data.failures" :key="idx" class="mb-1 border-b border-gray-100 last:border-0 pb-1">
                       <div class="flex justify-between items-start">
                         <div class="flex flex-col">
                           <span class="font-bold text-[10px] leading-tight" :class="fail.severity === 'critical' ? 'text-red-700' : 'text-gray-800'">
                             {{ fail.sop_name }}
                           </span>
                           <span class="text-[9px] text-gray-500">{{ fail.severity }}</span>
                         </div>
                         <span class="text-[9px] text-gray-400 whitespace-nowrap ml-1">{{ fail.date_str }}</span>
                       </div>
                    </div>
                  </div>
                </div>

                <!-- 5️⃣ CSAT - COMPACT -->
                <div v-else-if="kpi.name === 'CSAT'" class="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200 text-xs">
                  <div class="flex items-center justify-center gap-2 mb-2">
                    <span class="text-3xl">{{ getCSATEmoji(kpi.value) }}</span>
                    <span class="font-bold text-gray-900 text-2xl">{{ kpi.value?.toFixed(1) || 0 }}</span>
                  </div>
                  <div class="text-center py-1.5 bg-white rounded border border-gray-300 mb-2">
                    <span class="text-xs font-bold text-gray-700">{{ getCSATLabel(kpi.value) }}</span>
                  </div>
                  <!-- Breakdown -->
                  <div v-if="kpi.breakdown" class="grid grid-cols-2 gap-2 pt-2 border-t border-gray-200 text-[10px]">
                    <div class="text-center">
                      <span class="text-gray-500 block">Cekat AI</span>
                      <span class="font-bold text-gray-800">{{ kpi.breakdown.cekat?.toFixed(1) }}</span>
                    </div>
                    <div class="text-center border-l border-gray-200">
                      <span class="text-gray-500 block">Google</span>
                      <span class="font-bold text-blue-600">{{ kpi.breakdown.google?.toFixed(1) }}</span>
                    </div>
                  </div>
                </div>

                <!-- 6️⃣ TURNOVER - COMPACT -->
                <div v-else-if="kpi.name === 'Turnover'" class="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200 text-xs">
                  <div class="flex justify-between mb-1">
                    <span class="text-gray-600">Rate:</span>
                    <span class="font-bold text-gray-900 text-lg">{{ kpi.value?.toFixed(1) || 0 }}%</span>
                  </div>
                  <div class="flex justify-between mb-2">
                    <span class="text-gray-600">Target:</span>
                    <span class="font-medium text-gray-700">≤ {{ kpi.target }}%</span>
                  </div>
                  <div class="text-center py-1 bg-white rounded border border-gray-300">
                    <span class="text-[10px] font-bold" :class="kpi.value <= kpi.target ? 'text-green-600' : 'text-red-600'">
                      {{ kpi.value <= kpi.target ? '✅ Below Target' : '⚠️ Above Target' }}
                    </span>
                  </div>
                </div>

                <!-- 7️⃣ SDM - COMPACT -->
                <div v-else-if="kpi.name === 'Pengembangan SDM'" class="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200 text-xs">
                  <div class="flex justify-between mb-1">
                    <span class="text-gray-600">Completion:</span>
                    <span class="font-bold text-gray-900 text-lg">{{ Math.round(kpi.value) }}%</span>
                  </div>
                  <div class="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div
                      class="bg-gradient-to-r from-[#b70000] to-[#950000] h-2 rounded-full transition-all"
                      :style="{ width: `${Math.min(kpi.value, 100)}%` }"
                    ></div>
                  </div>
                  <!-- Breakdown: Dokumentasi Kasus (otomatis) -->
                  <div v-if="kpi.breakdown" class="grid grid-cols-2 gap-1 mt-2 pt-2 border-t border-gray-200 text-[10px]">
                    <div class="text-center">
                      <span class="text-gray-500 block mb-0.5">Dokumentasi</span>
                      <span class="font-bold">{{ kpi.breakdown.doc_count ?? 0 }}</span>
                    </div>
                    <div class="text-center border-l border-gray-200">
                      <span class="text-gray-500 block mb-0.5">Target</span>
                      <span class="font-bold">{{ kpi.breakdown.target_docs ?? 0 }}</span>
                    </div>
                  </div>
                </div>

                <!-- Achievement -->
                <div class="flex items-center justify-between mb-3 p-2.5 rounded-xl bg-gray-50 border border-gray-200">
                  <span class="text-xs font-semibold text-gray-700">Achievement</span>
                  <span class="text-lg font-bold text-[#b70000]">
                    {{ formatNumber(kpi.achievement) }}%
                  </span>
                </div>

                <!-- ⭐ STATUS BADGE - COMPACT -->
                <div class="mb-3">
                  <div class="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold border-2 w-full justify-center" :class="getStatusBadgeClass(kpi.status)">
                    <component :is="getStatusBadgeIcon(kpi.status)" class="h-3.5 w-3.5" />
                    <span>{{ getStatusBadgeText(kpi.status) }}</span>
                  </div>
                </div>

                <!-- Detail Button -->
                <div v-if="['Profit', 'Lead Time'].includes(kpi.name)" class="mb-3">
                  <button
                    @click="openDetailModal(kpi)"
                    class="w-full inline-flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold transition-all border border-gray-300"
                  >
                    <InformationCircleIcon class="h-3.5 w-3.5" />
                    <span>Lihat Detail</span>
                  </button>
                </div>

                <!-- Edit Button -->
                <div v-if="kpi.editable" class="pt-3 border-t border-gray-200">
                  <button
                    @click="openEditModal(kpi)"
                    class="w-full inline-flex items-center justify-center gap-2 px-3 py-2 border-2 border-[#b70000] text-[#b70000] rounded-xl text-xs font-bold hover:bg-[#b70000] hover:text-white transition-all"
                  >
                    <PencilSquareIcon class="h-3.5 w-3.5" />
                    <span>Update Data</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ========================================
             DETAILED KPI TABLE
        ======================================== -->
        <div class="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden mb-8">
          <div class="p-6 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
             <div>
               <h3 class="text-lg font-bold text-gray-900">📊 Detail Pencapaian KPI</h3>
               <p class="text-sm text-gray-500">Breakdown data komprehensif per indikator</p>
             </div>
             <!-- Legend -->
             <div class="flex gap-3 text-xs">
                <div class="flex items-center gap-1"><div class="w-2 h-2 rounded-full bg-green-500"></div> Excellent (>95%)</div>
                <div class="flex items-center gap-1"><div class="w-2 h-2 rounded-full bg-blue-500"></div> Good (85-95%)</div>
                <div class="flex items-center gap-1"><div class="w-2 h-2 rounded-full bg-yellow-500"></div> Fair (70-85%)</div>
                <div class="flex items-center gap-1"><div class="w-2 h-2 rounded-full bg-red-500"></div> Poor (&lt;70%)</div>
             </div>
          </div>
          
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-12">No</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-48">Indikator KPI</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Target</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Actual</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Achv %</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-96">Detail / Breakdown</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="kpi in kpiData.kpi_scores" :key="kpi.no" class="hover:bg-gray-50 transition-colors">
                  <!-- No -->
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">
                    {{ kpi.no }}
                  </td>
                  
                  <!-- Indicator -->
                  <td class="px-6 py-4">
                    <div class="flex items-center">
                      <div class="flex-shrink-0 h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center mr-3 text-gray-600">
                         <component :is="getKPIIcon(kpi.name)" class="h-5 w-5" />
                      </div>
                      <div>
                        <div class="text-sm font-bold text-gray-900">{{ kpi.name }}</div>
                        <div class="text-xs text-gray-500">Bobot: {{ kpi.weight }}%</div>
                      </div>
                    </div>
                  </td>

                  <!-- Target -->
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    <div class="font-medium">
                      {{ kpi.name === 'Profit' ? kpi.formatted?.target : formatKPITarget(kpi) }}
                      <span v-if="kpi.name === 'Sampling Quantity'"> Qty</span>
                    </div>
                  </td>

                  <!-- Actual -->
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                     <div class="font-bold">
                       {{ kpi.name === 'Profit' ? kpi.formatted?.net_profit : formatKPIValue(kpi) }}
                       <span v-if="kpi.name === 'Turnover'">%</span>
                     </div>
                  </td>

                  <!-- Achievement -->
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center gap-2">
                       <span class="text-sm font-bold" :class="kpi.achievement >= 100 ? 'text-green-600' : (kpi.achievement >= 85 ? 'text-blue-600' : 'text-red-600')">
                         {{ kpi.achievement?.toFixed(1) }}%
                       </span>
                       <component 
                         :is="getStatusIcon(kpi.status)" 
                         class="h-4 w-4"
                         :class="kpi.status === 'success' || kpi.status === 'excellent' ? 'text-green-500' : 'text-gray-400'"
                       />
                    </div>
                  </td>

                  <!-- Detail / Breakdown (Rich Content) -->
                  <td class="px-6 py-4 text-xs text-gray-600">
                    
                    <!-- PROFIT BREAKDOWN -->
                    <div v-if="kpi.name === 'Profit'" class="grid grid-cols-2 gap-x-8 gap-y-1">
                       <div class="flex justify-between"><span class="text-gray-500">Revenue:</span> <span class="font-medium text-gray-900">{{ kpi.formatted?.revenue }}</span></div>
                       <div class="flex justify-between"><span class="text-gray-500">COGS:</span> <span class="font-medium text-gray-900">{{ kpi.formatted?.cogs }}</span></div>
                       <div class="flex justify-between"><span class="text-gray-500">Gross Profit:</span> <span class="font-medium text-gray-900">{{ kpi.formatted?.gross_profit }}</span></div>
                       <div class="flex justify-between"><span class="text-gray-500">OpEx:</span> <span class="font-medium text-gray-900">{{ kpi.formatted?.opex }}</span></div>
                       <div class="col-span-2 border-t border-gray-100 my-1 pt-1 flex justify-between">
                          <span class="text-gray-500">Daily Gap:</span>
                          <span :class="kpi.daily_tracking?.gap_daily >= 0 ? 'text-green-600 font-bold' : 'text-red-600 font-bold'">
                             {{ formatCurrency(kpi.daily_tracking?.gap_daily) }}
                          </span>
                       </div>
                    </div>

                    <!-- LEAD TIME BREAKDOWN -->
                    <div v-else-if="kpi.name === 'Lead Time'" class="space-y-2">
                       <div class="grid grid-cols-2 gap-x-4 gap-y-1">
                          <div class="flex justify-between"><span class="text-gray-500">Tunggu Penerimaan:</span> <span class="font-medium" :class="getLeadTimeColor(kpi.detail?.tunggu_penerimaan?.rate)">{{ kpi.detail?.tunggu_penerimaan?.rate?.toFixed(1) }}%</span></div>
                          <div class="flex justify-between"><span class="text-gray-500">Lead Time Servis:</span> <span class="font-medium" :class="getLeadTimeColor(kpi.detail?.lead_time_servis?.rate)">{{ kpi.detail?.lead_time_servis?.rate?.toFixed(1) }}%</span></div>
                          <div class="flex justify-between"><span class="text-gray-500">Tunggu Servis:</span> <span class="font-medium" :class="getLeadTimeColor(kpi.detail?.tunggu_servis?.rate)">{{ kpi.detail?.tunggu_servis?.rate?.toFixed(1) }}%</span></div>
                          <div class="flex justify-between"><span class="text-gray-500">Tunggu Konfirmasi:</span> <span class="font-medium" :class="getLeadTimeColor(kpi.detail?.tunggu_konfirmasi?.rate)">{{ kpi.detail?.tunggu_konfirmasi?.rate?.toFixed(1) }}%</span></div>
                       </div>
                       <div class="border-t border-gray-100 pt-1 flex gap-4">
                          <span class="text-blue-700 font-medium">AFRT: {{ kpi.detail?.manual_inputs?.first_response }}m</span>
                          <span class="text-blue-700 font-medium">ART: {{ kpi.detail?.manual_inputs?.avg_response }}m</span>
                       </div>
                    </div>

                    <!-- SAMPLING QUANTITY -->
                    <div v-else-if="kpi.name === 'Sampling Quantity' || kpi.name === 'Sampling Internal'" class="space-y-1">
                       <div class="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">{{ kpi.data?.description || 'Internal Check' }}</div>
                       <div v-if="kpi.data?.explanation" class="text-[10px] text-blue-700 italic border-l-2 border-blue-300 pl-2 mb-1">
                          {{ kpi.data.explanation }}
                       </div>
                       <div class="flex gap-4">
                         <div class="bg-gray-50 px-2 py-1 rounded border border-gray-200">
                            <span class="block text-[10px] text-gray-500">Total Check</span>
                            <span class="font-bold text-gray-900">{{ kpi.data?.total || 0 }}</span>
                         </div>
                         <div class="bg-green-50 px-2 py-1 rounded border border-green-200">
                            <span class="block text-[10px] text-green-600">Pass</span>
                            <span class="font-bold text-green-700">{{ kpi.data?.pass || 0 }}</span>
                         </div>
                         <div class="bg-red-50 px-2 py-1 rounded border border-red-200">
                            <span class="block text-[10px] text-red-600">Fail</span>
                            <span class="font-bold text-red-700">{{ kpi.data?.fail || 0 }}</span>
                         </div>
                       </div>
                    </div>

                    <!-- SAMPLING EXTERNAL -->
                    <div v-else-if="kpi.name === 'Sampling Quality (Ext)' || kpi.name === 'Sampling External'" class="space-y-1">
                       <div class="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">{{ kpi.data?.description || 'External Check' }}</div>
                       <div v-if="kpi.data?.explanation" class="text-[10px] text-blue-700 italic border-l-2 border-blue-300 pl-2 mb-1">
                          {{ kpi.data.explanation }}
                       </div>
                       <div class="flex gap-4 mb-1">
                          <span class="font-medium text-gray-900">Pass Rate: {{ kpi.data?.pass_rate }}%</span>
                          <span class="text-gray-400">|</span>
                          <span class="text-green-600 font-medium">{{ kpi.data?.pass }} Pass</span>
                          <span class="text-red-600 font-medium">{{ kpi.data?.fail }} Fail</span>
                       </div>
                       <div v-if="kpi.data?.fail > 0" class="flex flex-col gap-1">
                          <span class="text-[10px] text-gray-500 font-medium">Detail Temuan:</span>
                          <div class="text-[10px] bg-red-50 text-red-700 px-2 py-1 rounded inline-block border border-red-100">
                             Critical: {{ kpi.data?.fail_detail?.critical }} • Major: {{ kpi.data?.fail_detail?.major }} • Minor: {{ kpi.data?.fail_detail?.minor }}
                          </div>
                       </div>
                    </div>

                    <!-- CSAT -->
                    <div v-else-if="kpi.name === 'CSAT'" class="flex items-center gap-6">
                       <div class="text-center">
                          <div class="text-lg">{{ getCSATEmoji(kpi.value) }}</div>
                          <div class="font-bold text-gray-900">{{ kpi.value?.toFixed(1) }}</div>
                       </div>
                       <div class="space-y-1 border-l border-gray-200 pl-4">
                          <div class="flex justify-between w-32"><span class="text-gray-500">Cekat AI:</span> <span class="font-medium">{{ kpi.breakdown?.cekat?.toFixed(1) || '-' }}</span></div>
                          <div class="flex justify-between w-32"><span class="text-gray-500">Google:</span> <span class="font-medium">{{ kpi.breakdown?.google?.toFixed(1) || '-' }}</span></div>
                       </div>
                    </div>

                    <!-- TURNOVER -->
                    <div v-else-if="kpi.name === 'Turnover'">
                       <div v-if="kpi.value <= kpi.target" class="text-green-600 font-medium flex items-center gap-1">
                         <CheckCircleIcon class="h-4 w-4" /> Turnover aman (Di bawah {{ kpi.target }}%)
                       </div>
                       <div v-else class="text-red-600 font-medium flex items-center gap-1">
                         <ExclamationCircleIcon class="h-4 w-4" /> Turnover tinggi (Di atas {{ kpi.target }}%)
                       </div>
                    </div>

                    <!-- SDM -->
                    <div v-else-if="kpi.name === 'Pengembangan SDM'" class="flex gap-4 text-center">
                        <div>
                           <div class="text-[10px] text-gray-500">Doc</div>
                           <div class="font-bold">{{ kpi.breakdown?.doc }}%</div>
                        </div>
                        <div>
                           <div class="text-[10px] text-gray-500">Delivery</div>
                           <div class="font-bold">{{ kpi.breakdown?.delivery }}%</div>
                        </div>
                        <div>
                           <div class="text-[10px] text-gray-500">Result</div>
                           <div class="font-bold">{{ kpi.breakdown?.result }}%</div>
                        </div>
                    </div>

                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>


      </template>

      <!-- Empty State -->
      <template v-else>
        <div class="bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-12 text-center">
          <div class="max-w-md mx-auto">
            <div class="inline-flex items-center justify-center w-24 h-24 bg-gray-100 rounded-full mb-6">
              <ChartBarIcon class="h-12 w-12 text-gray-400" />
            </div>
            <h3 class="text-2xl font-bold text-gray-900 mb-3">Belum Ada Data KPI</h3>
            <p class="text-gray-600 mb-6">
              Pilih outlet dan periode untuk melihat data KPI
            </p>
            <div v-if="!filters.store_id" class="inline-flex items-center gap-2 px-6 py-3 bg-amber-100 text-amber-800 rounded-xl border-2 border-amber-300">
              <ExclamationCircleIcon class="h-5 w-5" />
              <span class="font-semibold">Pilih outlet terlebih dahulu</span>
            </div>
          </div>
        </div>
      </template>
    </main>

    <!-- Edit Modal -->
     <!-- Modals - SAMA -->
    <EditKPIModalV3
      v-if="showEditModal"
      :show="showEditModal"
      :kpi="editingKPI"
      :store-id="filters.store_id"
      :month="filters.month"
      :year="filters.year"
      @close="closeEditModal"
      @save="handleSaveKPI"
    />

    <KPIDetailModal
      v-if="showDetailModal"
      :show="showDetailModal"
      :kpi="detailKPI"
      @close="closeDetailModal"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import {
  ArrowPathIcon,
  BackspaceIcon,
  DocumentArrowDownIcon,
  CalendarIcon,
  CalendarDaysIcon,
  BuildingStorefrontIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ChartBarIcon,
  ChartBarSquareIcon,
  PencilSquareIcon,
  CurrencyDollarIcon,
  ClockIcon,
  ClipboardDocumentCheckIcon,
  UserGroupIcon,
  FaceSmileIcon,
  ArrowTrendingUpIcon,
  InformationCircleIcon,
  XCircleIcon
} from '@heroicons/vue/24/outline'
import { 
  CheckBadgeIcon,
  XCircleIcon as XCircleIconSolid
} from '@heroicons/vue/24/solid'
import Toast from '@/components/Toast.vue'
import EditKPIModalV3 from '@/components/EditKPIModalV3.vue'
import KPIDetailModal from '@/components/KPIDetailModal.vue'
import { useToast } from '@/composables/useToast'
import apiClient from '@/config/api'

// Constants
const months = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]

const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i)

// State
const { toast, showToast } = useToast()
const loading = ref(false)
const isExporting = ref(false)
const stores = ref([])
const kpiData = ref(null)
const showEditModal = ref(false)
const editingKPI = ref(null)
const showDetailModal = ref(false)
const detailKPI = ref(null)

const filters = ref({
  store_id: '',
  month: new Date().getMonth() + 1,
  year: new Date().getFullYear()
})

// ========================================
// ⭐ NEW HELPER FUNCTIONS
// ========================================

const getLeadTimeColor = (rate) => {
  if (rate >= 90) return 'text-green-600'
  if (rate >= 75) return 'text-amber-600'
  return 'text-red-600'
}

const getCSATEmoji = (rating) => {
  if (!rating) return '😐'
  if (rating > 4.8) return '🤩'
  if (rating >= 4.5) return '😊'
  if (rating >= 4.2) return '🙂'
  return '😕'
}

const getCSATLabel = (rating) => {
  if (!rating) return 'No Data'
  if (rating > 4.8) return 'Excellent'
  if (rating >= 4.5) return 'Very Good'
  if (rating >= 4.2) return 'Good'
  return 'Needs Improvement'
}

const getStatusBadgeClass = (status) => {
  const classes = {
    'excellent': 'bg-green-50 text-green-700 border-green-400',
    'good': 'bg-blue-50 text-blue-700 border-blue-400',
    'fair': 'bg-amber-50 text-amber-700 border-amber-400',
    'poor': 'bg-orange-50 text-orange-700 border-orange-400',
    'critical': 'bg-red-50 text-red-700 border-red-400'
  }
  return classes[status] || 'bg-gray-50 text-gray-700 border-gray-300'
}

const getStatusBadgeIcon = (status) => {
  if (status === 'excellent' || status === 'good') return CheckCircleIcon
  if (status === 'critical' || status === 'poor') return XCircleIcon
  return InformationCircleIcon
}

const getStatusBadgeText = (status) => {
  const texts = {
    'excellent': '🌟 Excellent',
    'good': '✅ Good',
    'fair': '⚠️ Fair',
    'poor': '📉 Poor',
    'critical': '🚨 Critical'
  }
  return texts[status] || status
}

// format number and currency helpers are reused from existing code
const formatDailyTracking = (value) => {
  if (!value || typeof value !== 'number') return 'Rp 0'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value)
}

// ========================================
// EXISTING HELPERS (SAMA)
// ========================================

const getStoreName = (outletId) => {
  const store = stores.value.find(s => s.id === parseInt(outletId))
  return store ? store.name : ''
}

const formatNumber = (value) => {
  if (typeof value !== 'number') return '0.0'
  return value.toFixed(1)
}

const formatCurrency = (value) => {
  if (typeof value !== 'number') return 'Rp 0'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(value)
}

const formatKPIValue = (kpi) => {
  if (kpi.name === 'Profit') {
    return formatCurrency(kpi.value || 0)
  }
  if (kpi.name === 'Lead Time') {
    return formatNumber(kpi.achievement || 0)
  }
  if (kpi.name === 'Sampling Quantity' || kpi.name === 'Sampling Internal') {
    return formatNumber(kpi.value || 0)
  }
  return formatNumber(kpi.actual || kpi.value || 0)
}

const formatKPITarget = (kpi) => {
  if (kpi.name === 'Profit') {
    return formatCurrency(kpi.target || 0)
  }
  return kpi.target || 0
}

const getStatusIcon = (status) => {
  return status === 'Achieved' ? CheckBadgeIcon : XCircleIconSolid
}

const getKPIIcon = (kpiName) => {
  const icons = {
    'Profit': CurrencyDollarIcon,
    'Lead Time': ClockIcon,
    'Sampling Internal': ClipboardDocumentCheckIcon,
    'Sampling Eksternal': ClipboardDocumentCheckIcon,
    'Sampling External': ClipboardDocumentCheckIcon,
    'CSAT': FaceSmileIcon,
    'Turnover': ArrowTrendingUpIcon,
    'Pengembangan SDM': UserGroupIcon
  }
  return icons[kpiName] || ChartBarIcon
}

const getProgressStatus = (daysElapsed) => {
  if (daysElapsed < 10) return '🟢 Early'
  if (daysElapsed < 20) return '🟡 Mid'
  return '🔴 Late'
}

// ========================================
// API CALLS (SAMA seperti sebelumnya)
// ========================================

const loadStores = async () => {
  try {
    loading.value = true
    const response = await apiClient.post('/web/v2/kpi/outlet/stores', {
      jsonrpc: '2.0',
      method: 'call',
      params: {}
    })

    if (response.data.result.status === 'success') {
      stores.value = response.data.result.data
    }
  } catch (error) {
    console.error('Error loading stores:', error)
    showToast({
      message: 'Gagal memuat data outlet',
      type: 'error'
    })
  } finally {
    loading.value = false
  }
}

const loadKPIData = async () => {
  if (!filters.value.store_id) {
    showToast({
      message: 'Pilih outlet terlebih dahulu',
      type: 'warning'
    })
    return
  }

  try {
    loading.value = true
    
    const response = await apiClient.post('/web/v3/kpi/dashboard', {
      jsonrpc: '2.0',
      method: 'call',
      params: {
        store_id: parseInt(filters.value.store_id),
        date: `${filters.value.year}-${String(filters.value.month).padStart(2, '0')}-15`
      }
    })

    if (response.data.result.success) {
      kpiData.value = transformV3Response(response.data.result.data)
      
      showToast({
        message: '✅ Data KPI berhasil dimuat',
        type: 'success',
        duration: 2000
      })
    } else {
      kpiData.value = null
    }
  } catch (error) {
    console.error('Error loading KPI data:', error)
    kpiData.value = null
    
    if (error.response?.status !== 404) {
      showToast({
        message: error.response?.data?.result?.error || 'Terjadi kesalahan',
        type: 'error'
      })
    }
  } finally {
    loading.value = false
  }
}

const transformV3Response = (v3Data) => {
  return {
    store_info: {
      id: filters.value.store_id,
      name: getStoreName(filters.value.store_id),
      code: '-'
    },
    period: {
      display: `${months[filters.value.month - 1]} ${filters.value.year}`,
      month: filters.value.month,
      year: filters.value.year,
      date_from: v3Data.period.month_start,
      date_to: v3Data.period.month_end,
      days_in_month: v3Data.period.days_in_month,
      days_elapsed: v3Data.period.days_elapsed,
      progress_pct: v3Data.period.progress_pct
    },
    kpi_scores: v3Data.kpis.map(kpi => ({
      no: kpi.no,
      name: kpi.name,
      type: kpi.name.toLowerCase().replace(/ /g, '_'),
      weight: kpi.weight,
      target: kpi.target || kpi.target_ontime || 95,
      actual: kpi.value !== undefined ? kpi.value : 
              (kpi.ontime_percentage !== undefined ? kpi.ontime_percentage : 
               kpi.pass_rate || 0),
      value: kpi.value,
      achievement: kpi.achievement,
      weighted_score: (kpi.achievement * kpi.weight / 100),
      status: kpi.status,
      editable: ['Profit', 'CSAT', 'Turnover', 'Pengembangan SDM'].includes(kpi.name),
      ...kpi  // ⭐ Keep ALL original data (breakdown, detail, data, daily_tracking, formatted)
    })),
    summary: {
      total_weight: 100,
      total_score: v3Data.overall.score,
      target_score: v3Data.overall.target || 80,
      achievement_status: v3Data.overall.score >= 80 ? 'Achieved' : 'Below Target',
      grade: v3Data.overall.grade
    }
  }
}

const handleStoreChange = () => {
  kpiData.value = null
  loadKPIData()
}

const handlePeriodChange = () => {
  if (filters.value.store_id) {
    kpiData.value = null
    loadKPIData()
  }
}

const exportToCSV = async () => {
  try {
    isExporting.value = true
    const baseUrl = window.location.origin
    const url = `${baseUrl}/web/v2/kpi/outlet/export?store_ids=${filters.value.store_id}&month=${filters.value.month}&year=${filters.value.year}`
    
    const link = document.createElement('a')
    link.href = url
    link.download = `KPI_Outlet_${filters.value.month}_${filters.value.year}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    showToast({
      message: '✅ Data berhasil diekspor',
      type: 'success'
    })
  } catch (error) {
    showToast({
      message: '❌ Gagal mengekspor data',
      type: 'error'
    })
  } finally {
    isExporting.value = false
  }
}

const resetFilters = () => {
  filters.value = {
    store_id: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  }
  kpiData.value = null
  showToast({
    message: 'Filter direset',
    type: 'info'
  })
}

const openEditModal = (kpi) => {
  editingKPI.value = { ...kpi }
  showEditModal.value = true
}

const closeEditModal = () => {
  showEditModal.value = false
  editingKPI.value = null
}

const openDetailModal = (kpi) => {
  detailKPI.value = { ...kpi }
  showDetailModal.value = true
}

const closeDetailModal = () => {
  showDetailModal.value = false
  detailKPI.value = null
}

const handleSaveKPI = async () => {
  await loadKPIData()
  closeEditModal()
  
  showToast({
    message: '✅ Data berhasil diupdate',
    type: 'success'
  })
}

onMounted(async () => {
  await loadStores()
})
</script>


<style scoped>
* {
  transition-property: color, background-color, border-color, transform, box-shadow;
  transition-duration: 200ms;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

.group:hover {
  transform: translateY(-2px);
}

::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #b70000 0%, #950000 100%);
  border-radius: 10px;
}
</style>