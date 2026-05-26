<template>
  <div class="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-xl md:text-2xl font-black text-gray-900 tracking-tight">Dashboard Assessment SOP</h1>
        <p class="text-xs md:text-sm text-gray-500 mt-1">Monitoring hasil quiz & kepatuhan SOP karyawan</p>
      </div>
      <div class="flex items-center gap-3 w-full sm:w-auto">
        <select
          v-model="selectedPeriod"
          @change="loadDashboard"
          class="flex-1 sm:flex-none text-xs md:text-sm border border-gray-200 rounded-xl px-3 py-2.5 bg-white focus:ring-2 focus:ring-[#B70000] focus:border-[#B70000] outline-none shadow-sm font-semibold text-gray-700"
        >
          <option value="">Semua Periode</option>
          <option v-for="p in periods" :key="p" :value="p">{{ formatPeriod(p) }}</option>
        </select>
        <button @click="loadDashboard" class="p-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 transition-all shadow-sm active:scale-95 shrink-0">
          <svg class="w-4 h-4 text-gray-600" :class="loading ? 'animate-spin' : ''" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Access denied -->
    <div v-if="accessDenied" class="flex flex-col items-center justify-center py-20 text-gray-500 bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
      <div class="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
        <svg class="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </div>
      <h3 class="font-bold text-gray-800 text-lg">Akses Ditolak</h3>
      <p class="text-sm text-center mt-2 text-gray-500 max-w-sm">Halaman ini hanya ditujukan untuk jabatan Kaizen / Admin / Manajemen.</p>
    </div>

    <!-- Loading skeleton -->
    <div v-else-if="loading" class="space-y-6">
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <div v-for="i in 5" :key="i" class="h-24 bg-gray-100 rounded-2xl animate-pulse"></div>
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="h-64 bg-gray-100 rounded-3xl animate-pulse"></div>
        <div class="lg:col-span-2 h-64 bg-gray-100 rounded-3xl animate-pulse"></div>
      </div>
    </div>

    <template v-else-if="dashData">
      <!-- Summary KPIs -->
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <div class="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <p class="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Total Submission</p>
          <p class="text-2xl md:text-3xl font-black text-gray-900 mt-2">{{ dashData.summary.total_submissions }}</p>
        </div>
        <div class="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <p class="text-[10px] text-gray-400 uppercase tracking-wider font-bold text-green-600">Lulus</p>
          <p class="text-2xl md:text-3xl font-black text-green-600 mt-2">{{ dashData.summary.total_passed }}</p>
        </div>
        <div class="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <p class="text-[10px] text-gray-400 uppercase tracking-wider font-bold text-red-600">Tidak Lulus</p>
          <p class="text-2xl md:text-3xl font-black text-red-600 mt-2">{{ dashData.summary.total_failed }}</p>
        </div>
        <div class="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <p class="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Pass Rate</p>
          <p class="text-2xl md:text-3xl font-black mt-2" :class="dashData.summary.overall_pass_rate >= 80 ? 'text-green-600' : 'text-amber-600'">
            {{ dashData.summary.overall_pass_rate?.toFixed(1) }}%
          </p>
        </div>
        <div class="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <p class="text-[10px] text-gray-400 uppercase tracking-wider font-bold text-blue-600">Avg Score</p>
          <p class="text-2xl md:text-3xl font-black text-blue-600 mt-2">{{ dashData.summary.overall_avg_score?.toFixed(1) }}%</p>
        </div>
      </div>

      <!-- Visualisasi & Analitik (Charts) -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <!-- Pass Rate Gauge (1/3 width) -->
        <div class="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between relative overflow-hidden">
          <div class="flex items-center gap-2 mb-4">
            <span class="w-1.5 h-4 bg-emerald-500 rounded-full"></span>
            <h2 class="font-bold text-gray-800 text-xs uppercase tracking-wider">Tingkat Kelulusan</h2>
          </div>
          
          <div class="flex flex-col items-center justify-center my-4 relative">
            <!-- SVG circular gauge -->
            <svg class="w-36 h-36 md:w-40 md:h-40 transform -rotate-90" viewBox="0 0 100 100">
              <!-- Background circle -->
              <circle 
                cx="50" cy="50" r="40" 
                stroke="#F3F4F6" stroke-width="8" 
                fill="transparent" 
              />
              <!-- Foreground progress circle -->
              <circle 
                cx="50" cy="50" r="40" 
                :stroke="dashData.summary.overall_pass_rate >= 80 ? '#10B981' : dashData.summary.overall_pass_rate >= 60 ? '#F59E0B' : '#EF4444'" 
                stroke-width="8" 
                fill="transparent" 
                :stroke-dasharray="2 * Math.PI * 40"
                :stroke-dashoffset="2 * Math.PI * 40 * (1 - (dashData.summary.overall_pass_rate || 0) / 100)"
                stroke-linecap="round"
                class="transition-all duration-1000 ease-out"
                style="filter: drop-shadow(0 0 4px rgba(16, 185, 129, 0.15))"
              />
            </svg>
            <!-- Center label -->
            <div class="absolute flex flex-col items-center justify-center">
              <span class="text-2xl md:text-3xl font-black text-gray-900 leading-none">
                {{ dashData.summary.overall_pass_rate?.toFixed(1) }}%
              </span>
              <span class="text-[9px] text-gray-400 font-bold uppercase tracking-wider mt-1.5">Pass Rate</span>
            </div>
          </div>
          
          <!-- Detailed summary distribution -->
          <div class="space-y-2.5 mt-4">
            <div>
              <div class="flex items-center justify-between text-xs text-gray-500 font-semibold mb-1">
                <span class="flex items-center gap-1.5">
                  <span class="w-2.5 h-2.5 rounded-full bg-green-500"></span>
                  Lulus ({{ dashData.summary.total_passed }})
                </span>
                <span>{{ dashData.summary.total_submissions ? ((dashData.summary.total_passed / dashData.summary.total_submissions) * 100).toFixed(0) : 0 }}%</span>
              </div>
              <div class="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div class="h-full bg-green-500 rounded-full" :style="{ width: `${dashData.summary.total_submissions ? (dashData.summary.total_passed / dashData.summary.total_submissions) * 100 : 0}%` }"></div>
              </div>
            </div>
            <div>
              <div class="flex items-center justify-between text-xs text-gray-500 font-semibold mb-1">
                <span class="flex items-center gap-1.5">
                  <span class="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                  Gagal ({{ dashData.summary.total_failed }})
                </span>
                <span>{{ dashData.summary.total_submissions ? ((dashData.summary.total_failed / dashData.summary.total_submissions) * 100).toFixed(0) : 0 }}%</span>
              </div>
              <div class="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div class="h-full bg-red-500 rounded-full" :style="{ width: `${dashData.summary.total_submissions ? (dashData.summary.total_failed / dashData.summary.total_submissions) * 100 : 0}%` }"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Quiz Performance Bar Chart (2/3 width) -->
        <div class="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 lg:col-span-2 relative overflow-visible">
          <div class="flex items-center gap-2 mb-4">
            <span class="w-1.5 h-4 bg-blue-500 rounded-full"></span>
            <h2 class="font-bold text-gray-800 text-xs uppercase tracking-wider">Performa Rata-Rata per Quiz</h2>
          </div>

          <div class="relative w-full h-[220px] mt-2">
            <!-- Native SVG responsive chart -->
            <svg class="w-full h-full" viewBox="0 0 500 240" preserveAspectRatio="none">
              <defs>
                <!-- Green Gradient -->
                <linearGradient id="grad-green" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stop-color="#34D399" />
                  <stop offset="100%" stop-color="#059669" />
                </linearGradient>
                <!-- Amber Gradient -->
                <linearGradient id="grad-amber" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stop-color="#FBBF24" />
                  <stop offset="100%" stop-color="#D97706" />
                </linearGradient>
                <!-- Red Gradient -->
                <linearGradient id="grad-red" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stop-color="#F87171" />
                  <stop offset="100%" stop-color="#DC2626" />
                </linearGradient>
              </defs>

              <!-- Grid horizontal lines -->
              <line x1="40" y1="20" x2="480" y2="20" stroke="#F3F4F6" stroke-width="1" />
              <line x1="40" y1="63.75" x2="480" y2="63.75" stroke="#F3F4F6" stroke-width="1" />
              <line x1="40" y1="107.5" x2="480" y2="107.5" stroke="#F3F4F6" stroke-width="1" />
              <line x1="40" y1="151.25" x2="480" y2="151.25" stroke="#F3F4F6" stroke-width="1" />
              <line x1="40" y1="195" x2="480" y2="195" stroke="#E5E7EB" stroke-width="1.5" />

              <!-- Y-axis labels -->
              <text x="32" y="24" fill="#9CA3AF" font-size="9" text-anchor="end" font-weight="600">100%</text>
              <text x="32" y="67.75" fill="#9CA3AF" font-size="9" text-anchor="end" font-weight="600">75%</text>
              <text x="32" y="111.5" fill="#9CA3AF" font-size="9" text-anchor="end" font-weight="600">50%</text>
              <text x="32" y="155.25" fill="#9CA3AF" font-size="9" text-anchor="end" font-weight="600">25%</text>
              <text x="32" y="199" fill="#9CA3AF" font-size="9" text-anchor="end" font-weight="600">0%</text>

              <!-- Empty state message if no quizzes -->
              <text v-if="!dashData.quiz_breakdown?.length" x="260" y="110" fill="#9CA3AF" font-size="12" text-anchor="middle">
                Tidak ada data performa
              </text>

              <!-- Dynamic Bars -->
              <g v-else>
                <g 
                  v-for="(quiz, idx) in dashData.quiz_breakdown" 
                  :key="quiz.quiz_id"
                  @mouseenter="showTooltip(idx, quiz)"
                  @mouseleave="hideTooltip()"
                  class="cursor-pointer"
                >
                  <!-- Background hover active area -->
                  <rect 
                    :x="45 + idx * (430 / dashData.quiz_breakdown.length)" 
                    y="10" 
                    :width="430 / dashData.quiz_breakdown.length - 8" 
                    height="185" 
                    fill="transparent"
                    class="hover:fill-gray-50/50 transition-colors"
                  />
                  <!-- Colored bar representing average score -->
                  <rect 
                    :x="45 + idx * (430 / dashData.quiz_breakdown.length) + (430 / dashData.quiz_breakdown.length - 8 - Math.min(24, 320 / dashData.quiz_breakdown.length)) / 2" 
                    :y="195 - (quiz.avg_score / 100 * 175)" 
                    :width="Math.min(24, 320 / dashData.quiz_breakdown.length)" 
                    :height="Math.max(4, (quiz.avg_score / 100 * 175))" 
                    :fill="quiz.avg_score >= 80 ? 'url(#grad-green)' : quiz.avg_score >= 60 ? 'url(#grad-amber)' : 'url(#grad-red)'"
                    rx="3"
                    class="transition-all duration-500 ease-out"
                    style="transform-origin: bottom;"
                  />
                  <!-- X-axis labels (short codes) -->
                  <text 
                    :x="45 + idx * (430 / dashData.quiz_breakdown.length) + (430 / dashData.quiz_breakdown.length - 8) / 2" 
                    y="212" 
                    fill="#4B5563" 
                    font-size="9" 
                    text-anchor="middle"
                    font-weight="bold"
                    class="truncate"
                  >
                    {{ getShortCode(quiz) }}
                  </text>
                </g>
              </g>
            </svg>

            <!-- Responsive percentage-positioned Tooltip Card -->
            <div 
              v-if="activeHoveredBar !== null && activeHoveredBarData" 
              class="absolute z-30 bg-gray-900/95 text-white p-3 rounded-xl shadow-xl text-[11px] space-y-1.5 pointer-events-none transition-all duration-200 border border-gray-800 min-w-44 -mt-24 transform -translate-x-1/2"
              :style="{ 
                left: `${(45 + activeHoveredBar * (430 / dashData.quiz_breakdown.length) + (430 / dashData.quiz_breakdown.length - 8)/2) / 500 * 100}%`,
                top: `${(195 - (activeHoveredBarData.avg_score / 100 * 175)) / 240 * 100}%` 
              }"
            >
              <!-- Small triangle pointer -->
              <div class="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1 w-2.5 h-2.5 bg-gray-900 border-r border-b border-gray-800 rotate-45"></div>
              
              <p class="font-extrabold text-[11px] leading-tight text-red-400 truncate">{{ activeHoveredBarData.quiz_name }}</p>
              <div class="flex items-center justify-between font-semibold">
                <span class="text-gray-400">Score Rata2:</span>
                <span class="font-bold text-green-400">{{ activeHoveredBarData.avg_score?.toFixed(1) }}%</span>
              </div>
              <div class="flex items-center justify-between font-semibold">
                <span class="text-gray-400">Total Ikut:</span>
                <span class="font-bold">{{ activeHoveredBarData.total }}</span>
              </div>
              <div class="flex items-center justify-between font-semibold">
                <span class="text-gray-400">Kelulusan:</span>
                <span class="font-bold text-blue-400">{{ activeHoveredBarData.total ? ((activeHoveredBarData.passed / activeHoveredBarData.total) * 100).toFixed(0) : 0 }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Program-level breakdown (NEW) -->
      <div v-if="dashData.program_breakdown && dashData.program_breakdown.length" class="space-y-4">
        <div class="flex items-center gap-2 px-1">
          <span class="w-1.5 h-4 bg-[#B70000] rounded-full"></span>
          <h2 class="font-bold text-gray-850 text-base md:text-lg">Program Assessment Bulanan & Kuartalan</h2>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div 
            v-for="prog in dashData.program_breakdown" 
            :key="prog.program_id"
            class="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group"
          >
            <!-- Badge status -->
            <div class="absolute top-0 right-0 w-24 h-24 pointer-events-none overflow-hidden">
              <div 
                class="absolute transform rotate-45 bg-gray-50 text-[10px] font-bold text-gray-500 text-center py-1 w-32 -right-8 top-5 border border-gray-100 uppercase tracking-wider"
                :class="{
                  'bg-emerald-50 text-emerald-700 border-emerald-100': prog.state === 'active',
                  'bg-red-50 text-red-700 border-red-100': prog.state === 'closed',
                }"
              >
                {{ prog.state === 'active' ? 'Aktif' : 'Ditutup' }}
              </div>
            </div>

            <div>
              <div class="flex items-start justify-between pr-14">
                <div>
                  <span class="text-[10px] font-bold uppercase tracking-wider text-red-600 bg-red-50 px-2 py-0.5 rounded-full inline-block">
                    {{ prog.period_type === 'monthly' ? 'Bulanan' : 'Kuartalan' }}
                  </span>
                  <h3 class="font-bold text-gray-900 text-base mt-1.5 leading-snug group-hover:text-[#B70000] transition-colors">
                    {{ prog.program_name }}
                  </h3>
                  <p class="text-xs text-gray-400 mt-0.5">{{ prog.program_code }}</p>
                </div>
              </div>

              <!-- Metrics Grid -->
              <div class="grid grid-cols-3 gap-2 mt-5 bg-gray-50 rounded-xl p-3 border border-gray-50/50">
                <div class="text-center">
                  <span class="text-[10px] text-gray-400 font-semibold block uppercase tracking-wider">Assigned</span>
                  <span class="text-base font-extrabold text-gray-800 block mt-0.5">{{ prog.total_assigned }}</span>
                </div>
                <div class="text-center border-x border-gray-200">
                  <span class="text-[10px] text-gray-400 font-semibold block uppercase tracking-wider">Selesai</span>
                  <span class="text-base font-extrabold text-emerald-600 block mt-0.5">{{ prog.completed_count }}</span>
                </div>
                <div class="text-center">
                  <span class="text-[10px] text-gray-400 font-semibold block uppercase tracking-wider">Avg Score</span>
                  <span class="text-base font-extrabold text-blue-600 block mt-0.5">{{ prog.avg_score }}%</span>
                </div>
              </div>
            </div>

            <div class="mt-5 space-y-3">
              <!-- Completion Progress Bar -->
              <div>
                <div class="flex items-center justify-between text-xs font-semibold text-gray-500 mb-1">
                  <span>Penyelesaian Program</span>
                  <span>{{ prog.completion_rate }}%</span>
                </div>
                <div class="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    class="h-full bg-gradient-to-r from-red-500 to-[#B70000] rounded-full transition-all duration-500"
                    :style="{ width: `${prog.completion_rate}%` }"
                  ></div>
                </div>
              </div>

              <!-- Program quizzes count info -->
              <div class="flex items-center justify-between text-xs text-gray-400 pt-1">
                <span>{{ prog.quizzes_count }} SOP / Quiz Bank</span>
                <span v-if="prog.deadline">DL: {{ formatPeriod(prog.period) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Per-quiz breakdown -->
      <div class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 class="font-bold text-gray-900 text-base">Breakdown per Quiz</h2>
          <span class="text-xs font-semibold text-red-650 bg-red-50 px-2.5 py-1 rounded-full">{{ dashData.quiz_breakdown?.length || 0 }} SOP</span>
        </div>

        <!-- Mobile Card List View (< md) -->
        <div class="block md:hidden divide-y divide-gray-100">
          <div 
            v-for="quiz in dashData.quiz_breakdown"
            :key="quiz.quiz_id"
            class="p-5 space-y-3 hover:bg-gray-50/50 transition-colors"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0 flex-1">
                <h3 class="font-bold text-gray-900 text-sm leading-snug truncate">{{ quiz.quiz_name }}</h3>
                <p class="text-[10px] font-semibold text-gray-400 mt-0.5 truncate">
                  {{ quiz.quiz_code }}
                  <span v-if="quiz.program_name" class="text-red-500 font-bold ml-1">· {{ quiz.program_name }}</span>
                </p>
              </div>
              <span class="text-xs px-2.5 py-1 bg-gray-50 text-gray-600 font-bold rounded-lg whitespace-nowrap shrink-0">
                {{ quiz.role_label || 'Semua Role' }}
              </span>
            </div>

            <!-- Metrics grid -->
            <div class="grid grid-cols-4 gap-2 bg-gray-50/50 rounded-xl p-3 border border-gray-100">
              <div class="text-center">
                <span class="text-[9px] text-gray-400 font-bold uppercase tracking-wider block">Total</span>
                <span class="text-sm font-bold text-gray-700 block mt-0.5">{{ quiz.total }}</span>
              </div>
              <div class="text-center">
                <span class="text-[9px] text-gray-400 font-bold uppercase tracking-wider block text-green-600">Lulus</span>
                <span class="text-sm font-bold text-green-600 block mt-0.5">{{ quiz.passed }}</span>
              </div>
              <div class="text-center">
                <span class="text-[9px] text-gray-400 font-bold uppercase tracking-wider block text-red-600">Gagal</span>
                <span class="text-sm font-bold text-red-600 block mt-0.5">{{ quiz.failed }}</span>
              </div>
              <div class="text-center">
                <span class="text-[9px] text-gray-400 font-bold uppercase tracking-wider block text-blue-600">Avg Score</span>
                <span class="text-sm font-bold text-blue-600 block mt-0.5">{{ quiz.avg_score?.toFixed(0) }}%</span>
              </div>
            </div>

            <!-- Progress bar -->
            <div class="flex items-center gap-3">
              <div class="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  class="h-full bg-gradient-to-r from-red-500 to-[#B70000]"
                  :style="{ width: `${Math.min(quiz.completion_rate || 0, 100)}%` }"
                ></div>
              </div>
              <span class="text-[10px] font-bold text-gray-500 whitespace-nowrap">Completion: {{ (quiz.completion_rate || 0).toFixed(0) }}%</span>
            </div>
          </div>
        </div>

        <!-- Desktop Table View (>= md) -->
        <div class="hidden md:block overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-gray-50">
              <tr>
                <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Quiz</th>
                <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                <th class="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                <th class="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Lulus</th>
                <th class="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Gagal</th>
                <th class="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Avg Score</th>
                <th class="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Completion</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr
                v-for="quiz in dashData.quiz_breakdown"
                :key="quiz.quiz_id"
                class="hover:bg-gray-50 transition-colors"
              >
                <td class="px-6 py-4">
                  <p class="font-medium text-gray-900 leading-snug">{{ quiz.quiz_name }}</p>
                  <p class="text-xs text-gray-400 mt-0.5">
                    {{ quiz.quiz_code }}
                    <span v-if="quiz.program_name" class="text-red-600 font-semibold ml-1">· {{ quiz.program_name }}</span>
                  </p>
                </td>
                <td class="px-4 py-4 text-gray-600">{{ quiz.role_label || '—' }}</td>
                <td class="px-4 py-4 text-center font-semibold text-gray-700">{{ quiz.total }}</td>
                <td class="px-4 py-4 text-center">
                  <span class="text-green-600 font-semibold">{{ quiz.passed }}</span>
                </td>
                <td class="px-4 py-4 text-center">
                  <span class="text-red-600 font-semibold">{{ quiz.failed }}</span>
                </td>
                <td class="px-4 py-4 text-center">
                  <span
                    class="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold"
                    :class="quiz.avg_score >= 80 ? 'bg-green-100 text-green-700' : quiz.avg_score >= 60 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'"
                  >
                    {{ quiz.avg_score?.toFixed(1) }}%
                  </span>
                </td>
                <td class="px-4 py-4 text-center">
                  <div class="flex items-center justify-center gap-2">
                    <div class="flex-1 max-w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        class="h-full bg-[#B70000] rounded-full"
                        :style="{ width: `${Math.min(quiz.completion_rate || 0, 100)}%` }"
                      ></div>
                    </div>
                    <span class="text-xs text-gray-500 w-10">{{ (quiz.completion_rate || 0).toFixed(0) }}%</span>
                  </div>
                </td>
              </tr>
              <tr v-if="!dashData.quiz_breakdown?.length">
                <td colspan="7" class="px-6 py-12 text-center text-gray-400">
                  Belum ada data untuk periode ini
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Flagged employees -->
      <div v-if="dashData.flagged_employees?.length" class="bg-white rounded-3xl shadow-sm border border-red-100 overflow-hidden">
        <div class="px-6 py-4 border-b border-red-100 flex items-center gap-2">
          <svg class="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
          </svg>
          <h2 class="font-bold text-red-800 text-sm md:text-base">Karyawan Perlu Retraining & Pembinaan ({{ dashData.flagged_employees.length }})</h2>
        </div>
        <div class="divide-y divide-gray-55">
          <div
            v-for="emp in dashData.flagged_employees"
            :key="`${emp.employee_id}-${emp.quiz_name}`"
            class="p-5 md:px-6 md:py-4"
          >
            <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div class="flex-1 min-w-0">
                <p class="font-bold text-gray-900 text-sm md:text-base">{{ emp.employee_name }}</p>
                <p class="text-xs md:text-sm text-gray-500 mt-1 font-semibold">
                  {{ emp.quiz_name }}
                  <span v-if="emp.program_name" class="text-red-600 font-extrabold ml-1">· {{ emp.program_name }}</span>
                </p>
                
                <!-- Expanded styled Weak Areas container -->
                <div v-if="emp.weak_areas" class="mt-3 bg-red-50/50 rounded-xl p-3 border border-red-100/50">
                  <span class="text-[10px] font-bold text-red-700 uppercase tracking-wider block mb-1">Materi Butuh Retraining:</span>
                  <p class="text-xs text-red-650 leading-relaxed whitespace-pre-wrap font-medium">{{ emp.weak_areas }}</p>
                </div>
              </div>
              <div class="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3 shrink-0 mt-2 sm:mt-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-gray-100">
                <div class="text-left sm:text-right">
                  <p class="text-xl font-black text-red-600">{{ emp.score?.toFixed(1) }}%</p>
                  <span class="text-[9px] font-bold text-gray-400 block uppercase tracking-wider sm:mt-0.5">Nilai Karyawan</span>
                </div>
                <span
                  v-if="emp.action_log_id"
                  class="text-[10px] px-2.5 py-1 rounded-full font-bold shadow-sm"
                  :class="{
                    'bg-yellow-100 text-yellow-750 border border-yellow-200': emp.action_log_status === 'open',
                    'bg-blue-100 text-blue-755 border border-blue-200': emp.action_log_status === 'in_progress',
                    'bg-green-100 text-green-755 border border-green-200': emp.action_log_status === 'done',
                    'bg-red-100 text-red-755 border border-red-200': emp.action_log_status === 'overdue',
                  }"
                >
                  Action Log: {{ actionLogLabel(emp.action_log_status) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { quizApi } from '../../services/quizApi'

const router = useRouter()
const loading = ref(true)
const accessDenied = ref(false)
const dashData = ref(null)
const selectedPeriod = ref('')

const activeHoveredBar = ref(null)
const activeHoveredBarData = ref(null)

function showTooltip(idx, quiz) {
  activeHoveredBar.value = idx
  activeHoveredBarData.value = quiz
}

function hideTooltip() {
  activeHoveredBar.value = null
  activeHoveredBarData.value = null
}

function getShortCode(quiz) {
  if (!quiz || !quiz.quiz_code) return ''
  const parts = quiz.quiz_code.split('-')
  if (parts.length >= 3) {
    return `${parts[1]}-${parts[2]}`
  }
  return quiz.quiz_code
}

// Generate last 6 months
const periods = (() => {
  const list = []
  const now = new Date()
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    list.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }
  return list
})()

async function loadDashboard() {
  loading.value = true
  accessDenied.value = false
  try {
    const params = {}
    if (selectedPeriod.value) params.period = selectedPeriod.value
    dashData.value = await quizApi.dashboard(params)
  } catch (e) {
    if (e.code === 'forbidden') accessDenied.value = true
    else if (e.code === 'unauthorized') router.push('/login')
  } finally {
    loading.value = false
  }
}

function formatPeriod(period) {
  if (!period) return ''
  const [year, month] = period.split('-')
  const months = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']
  return `${months[parseInt(month) - 1]} ${year}`
}

function actionLogLabel(status) {
  const map = { open: 'Terbuka', in_progress: 'Proses', done: 'Selesai', overdue: 'Terlambat' }
  return map[status] || status
}

onMounted(loadDashboard)
</script>
