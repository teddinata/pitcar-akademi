<!-- src/components/overview/KeyMetrics.vue -->
<template>
  <div class="space-y-6">
    <!-- Grid Metrik Utama - Dioptimalkan untuk 3 kartu -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 auto-rows-fr">
      <!-- Kartu Pesanan -->
      <div class="relative group flex">
        <MetricCard
          :title="primaryMetrics.orders.title"
          :value="getValue('orders')"
          :icon="primaryMetrics.orders.icon"
          :iconColor="primaryMetrics.orders.iconColor"
          :iconBg="primaryMetrics.orders.iconBg"
          :growth="data.orders?.growth"
          :growthSummary="getGrowthSummary('orders')"
          :loading="loading"
          class="hover:scale-[1.02] transition-transform duration-200 w-full"
        />

        
        <!-- Tombol AI Insight -->
        <div class="absolute -top-2 -right-2 z-30">
          <div class="relative">
            <button 
              @click="toggleInsight('orders')"
              data-insight-trigger
              class="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-1.5 shadow-lg transition-colors group-hover:scale-110"
              title="Lihat Analisis AI"
            >
              <SparklesIcon class="h-3 w-3" />
            </button>
            
            <!-- Popup Insight -->
            <div 
              v-if="activeInsight === 'orders'"
              class="insight-popup absolute top-8 right-0 w-72 bg-white rounded-xl shadow-xl border border-gray-200 p-4 z-40 animate-in fade-in duration-200"
            >
              <div class="flex items-center justify-between mb-3">
                <h4 class="font-semibold text-gray-900 flex items-center">
                  <SparklesIcon class="h-4 w-4 text-blue-500 mr-2" />
                  Analisis Cerdas
                </h4>
                <button @click="activeInsight = null" class="text-gray-400 hover:text-gray-600">
                  <XMarkIcon class="h-4 w-4" />
                </button>
              </div>
              
              <div class="space-y-3 text-sm">
                <div class="p-3 bg-blue-50 rounded-lg">
                  <p class="font-medium text-blue-900 mb-1">📊 Kinerja</p>
                  <p class="text-blue-800">{{ getOrdersInsight() }}</p>
                </div>
                
                <div class="p-3 bg-amber-50 rounded-lg">
                  <p class="font-medium text-amber-900 mb-1">💡 Rekomendasi</p>
                  <p class="text-amber-800">{{ getOrdersRecommendation() }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Kartu Pendapatan yang Dapat Dibalik - OPTIMIZED -->
      <div class="relative group flex">
        <div 
          class="flip-card-container w-full cursor-pointer group" 
          @click="flipRevenue"
        >
          <div 
            class="flip-card transition-transform duration-700 transform-style-preserve-3d min-h-[280px]"
            :class="{ 'rotate-y-180': revenueFlipped }"
          >
            <!-- ========== SISI DEPAN - PENDAPATAN AKUNTANSI ========== -->
            <div class="flip-card-face flip-card-front absolute inset-0 backface-hidden">
              <div class="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-slate-200 p-4 relative overflow-hidden group-hover:border-slate-300 h-full flex flex-col">
                
                <!-- Indikator Flip -->
                <div class="absolute top-2 right-2 z-20" title="Klik untuk lihat Pendapatan Penjualan">
                  <div class="bg-emerald-100 p-1.5 rounded-full group-hover:bg-emerald-200 transition-colors flip-indicator">
                    <ArrowPathIcon class="h-3 w-3 text-emerald-600" />
                  </div>
                </div>

                <!-- Header - Compact -->
                <div class="flex items-center space-x-2 mb-3">
                  <div class="bg-emerald-50 p-2 rounded-lg transition-all duration-300 group-hover:scale-110 flex-shrink-0">
                    <BanknotesIcon class="h-4 w-4 text-emerald-600" />
                  </div>
                  <div class="min-w-0">
                    <p class="text-xs font-medium text-gray-900 truncate">Pendapatan Akuntansi</p>
                    <p class="text-[10px] text-gray-500 truncate">Dari jurnal akuntansi</p>
                  </div>
                </div>

                <!-- Bagian Nilai - Compact -->
                <div class="flex-1 flex flex-col justify-center py-2">
                  <div 
                    class="revenue-display-area group/revenue"
                    @mouseenter="showFullAccounting = true"
                    @mouseleave="showFullAccounting = false"
                  >
                    <p 
                      class="revenue-text font-bold text-gray-900 tracking-tight mb-1 transition-all duration-300 leading-tight"
                      :class="showFullAccounting ? 'text-base lg:text-lg' : 'text-lg lg:text-xl xl:text-2xl'"
                      :title="formatCurrency(data.accounting_revenue?.current || 0)"
                    >
                      {{ showFullAccounting 
                        ? formatCurrency(data.accounting_revenue?.current || 0) 
                        : formatCompactCurrency(data.accounting_revenue?.current || 0) 
                      }}
                    </p>
                    
                    <div class="flex items-center justify-between text-xs">
                      <GrowthIndicator :growth="data.accounting_revenue?.growth" size="sm" />
                      <div class="flex items-center text-gray-400 opacity-0 group-hover/revenue:opacity-100 transition-opacity">
                        <EyeIcon class="h-3 w-3 mr-1" />
                        <span class="text-[10px]">Hover</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Footer - Ultra Compact -->
                <div class="mt-auto space-y-2">
                  <!-- Status Badge -->
                  <div class="bg-emerald-50 rounded-lg p-1.5">
                    <p class="text-[10px] text-emerald-700 font-medium truncate">
                      💰 {{ getAccountingRevenueStatus() }}
                    </p>
                  </div>

                  <!-- Target Section - Compact -->
                  <div class="pt-2 border-t border-emerald-100">
                    <div class="flex items-center justify-between mb-1.5">
                      <span class="text-[10px] font-semibold text-gray-700 truncate">🎯 Target Bulan Ini</span>
                      <span 
                        class="text-[9px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap"
                        :class="getAccountingTargetBadgeColor()"
                      >
                        {{ getAccountingTargetStatus() }}
                      </span>
                    </div>

                    <!-- Progress Bar - Slim -->
                    <div class="mb-1.5">
                      <div class="flex justify-between items-baseline mb-1">
                        <span class="text-[10px] text-gray-600 truncate">{{ formatCompactCurrency(getAccountingTargetAmount()) }}</span>
                        <span class="text-xs font-bold text-emerald-700 tabular-nums">
                          {{ getAccountingTargetAchievement() }}%
                        </span>
                      </div>
                      <div class="w-full bg-gray-200 rounded-full h-1.5 shadow-inner">
                        <div 
                          class="h-1.5 rounded-full transition-all duration-500"
                          :class="getAccountingProgressBarColor()"
                          :style="{ width: `${Math.min(getAccountingTargetAchievement(), 100)}%` }"
                        ></div>
                      </div>
                    </div>

                    <!-- Gap & Detail - Compact -->
                    <div class="flex justify-between items-center text-[10px]">
                      <span 
                        class="font-medium truncate"
                        :class="getAccountingGapAmount() < 0 ? 'text-red-600' : 'text-green-600'"
                      >
                        Gap: {{ formatCompactCurrency(Math.abs(getAccountingGapAmount())) }}
                      </span>
                      <button
                        @click.stop="openAccountingTargetDetail"
                        class="text-blue-500 hover:text-blue-700 hover:underline font-medium transition-colors whitespace-nowrap ml-2"
                      >
                        Detail →
                      </button>
                    </div>
                  </div>
                </div>

                <div class="absolute inset-0 bg-gradient-to-br from-transparent to-emerald-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
            </div>

            <!-- ========== SISI BELAKANG - PENDAPATAN PENJUALAN ========== -->
            <div class="flip-card-face flip-card-back absolute inset-0 backface-hidden rotate-y-180">
              <div class="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-slate-200 p-4 relative overflow-hidden group-hover:border-slate-300 h-full flex flex-col">
                
                <!-- Indikator Flip -->
                <div class="absolute top-2 right-2 z-20" title="Klik untuk lihat Pendapatan Akuntansi">
                  <div class="bg-purple-100 p-1.5 rounded-full group-hover:bg-purple-200 transition-colors flip-indicator">
                    <ArrowPathIcon class="h-3 w-3 text-purple-600" />
                  </div>
                </div>

                <!-- Header - Compact -->
                <div class="flex items-center space-x-2 mb-3">
                  <div class="bg-purple-50 p-2 rounded-lg transition-all duration-300 group-hover:scale-110 flex-shrink-0">
                    <CurrencyDollarIcon class="h-4 w-4 text-purple-600" />
                  </div>
                  <div class="min-w-0">
                    <p class="text-xs font-medium text-gray-900 truncate">Pendapatan Penjualan</p>
                    <p class="text-[10px] text-gray-500 truncate">Dari pesanan penjualan</p>
                  </div>
                </div>

                <!-- Bagian Nilai - Compact -->
                <div class="flex-1 flex flex-col justify-center py-2">
                  <div 
                    class="revenue-display-area group/revenue"
                    @mouseenter="showFullSales = true"
                    @mouseleave="showFullSales = false"
                  >
                    <p 
                      class="revenue-text font-bold text-purple-600 tracking-tight mb-1 transition-all duration-300 leading-tight"
                      :class="showFullSales ? 'text-base lg:text-lg' : 'text-lg lg:text-xl xl:text-2xl'"
                      :title="formatCurrency(data.sales_revenue?.current || 0)"
                    >
                      {{ showFullSales 
                        ? formatCurrency(data.sales_revenue?.current || 0) 
                        : formatCompactCurrency(data.sales_revenue?.current || 0) 
                      }}
                    </p>
                    
                    <div class="flex items-center justify-between text-xs">
                      <GrowthIndicator :growth="data.sales_revenue?.growth" size="sm" />
                      <div class="flex items-center text-gray-400 opacity-0 group-hover/revenue:opacity-100 transition-opacity">
                        <EyeIcon class="h-3 w-3 mr-1" />
                        <span class="text-[10px]">Hover</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Footer - Ultra Compact -->
                <div class="mt-auto space-y-2">
                  <!-- Status Badge -->
                  <div class="bg-purple-50 rounded-lg p-1.5">
                    <p class="text-[10px] text-purple-700 font-medium truncate">
                      📈 {{ getSalesRevenueStatus() }}
                    </p>
                  </div>

                  <!-- Target Section - Compact -->
                  <div class="pt-2 border-t border-purple-100">
                    <div class="flex items-center justify-between mb-1.5">
                      <span class="text-[10px] font-semibold text-gray-700 truncate">🎯 Target Bulan Ini</span>
                      <span 
                        class="text-[9px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap"
                        :class="getSalesTargetBadgeColor()"
                      >
                        {{ getSalesTargetStatus() }}
                      </span>
                    </div>

                    <!-- Progress Bar - Slim -->
                    <div class="mb-1.5">
                      <div class="flex justify-between items-baseline mb-1">
                        <span class="text-[10px] text-gray-600 truncate">{{ formatCompactCurrency(getSalesTargetAmount()) }}</span>
                        <span class="text-xs font-bold text-purple-700 tabular-nums">
                          {{ getSalesTargetAchievement() }}%
                        </span>
                      </div>
                      <div class="w-full bg-gray-200 rounded-full h-1.5 shadow-inner">
                        <div 
                          class="h-1.5 rounded-full transition-all duration-500"
                          :class="getSalesProgressBarColor()"
                          :style="{ width: `${Math.min(getSalesTargetAchievement(), 100)}%` }"
                        ></div>
                      </div>
                    </div>

                    <!-- Gap & Detail - Compact -->
                    <div class="flex justify-between items-center text-[10px]">
                      <span 
                        class="font-medium truncate"
                        :class="getSalesGapAmount() < 0 ? 'text-red-600' : 'text-green-600'"
                      >
                        Gap: {{ formatCompactCurrency(Math.abs(getSalesGapAmount())) }}
                      </span>
                      <button
                        @click.stop="openSalesTargetDetail"
                        class="text-blue-500 hover:text-blue-700 hover:underline font-medium transition-colors whitespace-nowrap ml-2"
                      >
                        Detail →
                      </button>
                    </div>
                  </div>
                </div>

                <div class="absolute inset-0 bg-gradient-to-br from-transparent to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
            </div>
          </div>
        </div>

        
        <!-- POPUP ACCOUNTING BREAKDOWN -->
        <div 
          v-if="showAccountingDetail"
          class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm"
          @click.self="showAccountingDetail = false"
        >
          <div class="bg-white rounded-xl shadow-2xl border border-gray-200 p-6 w-full max-w-xl max-h-[85vh] overflow-hidden">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-gray-900 flex items-center">
                <BanknotesIcon class="h-5 w-5 text-emerald-500 mr-2" />
                Breakdown Akun Pendapatan
              </h3>
              <button 
                @click="showAccountingDetail = false" 
                class="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-colors"
              >
                <XMarkIcon class="h-5 w-5" />
              </button>
            </div>
            
            <div class="bg-emerald-50 rounded-lg p-4 mb-4 border border-emerald-100">
              <div class="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p class="text-sm text-gray-600 mb-1">Periode Saat Ini</p>
                  <p class="text-xl font-bold text-emerald-600">
                    {{ formatCurrency(data.accounting_revenue?.current || 0) }}
                  </p>
                </div>
                <div>
                  <p class="text-sm text-gray-600 mb-1">Periode Sebelumnya</p>
                  <p class="text-xl font-bold text-gray-500">
                    {{ formatCurrency(data.accounting_revenue?.previous || 0) }}
                  </p>
                </div>
              </div>
              <div class="mt-3 pt-3 border-t border-emerald-200 flex justify-between items-center">
                <span class="text-sm text-gray-600">Perubahan:</span>
                <div class="text-right">
                  <span class="text-sm font-semibold" :class="(data.accounting_revenue?.current || 0) >= (data.accounting_revenue?.previous || 0) ? 'text-green-600' : 'text-red-600'">
                    {{ (data.accounting_revenue?.current || 0) >= (data.accounting_revenue?.previous || 0) ? '+' : '' }}{{ formatCurrency(Math.abs((data.accounting_revenue?.current || 0) - (data.accounting_revenue?.previous || 0))) }}
                  </span>
                  <span class="ml-2 text-xs font-medium px-2 py-1 rounded-full" :class="(data.accounting_revenue?.growth >= 0) ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'">
                    {{ formatPercentage(data.accounting_revenue?.growth || 0) }}
                  </span>
                </div>
              </div>
            </div>
            
            <div class="space-y-2 max-h-80 overflow-y-auto custom-scroll-emerald pr-1">
              <div 
                v-for="(account, code) in data.accounting_revenue?.account_breakdown" 
                :key="code"
                class="bg-gray-50 hover:bg-emerald-50 rounded-lg p-3 transition-colors border border-gray-100"
              >
                <div class="flex justify-between items-center">
                  <div class="flex-1 mr-3 min-w-0">
                    <h4 class="font-medium text-gray-900 text-sm truncate">
                      {{ account.name || account.code }}
                    </h4>
                    <p class="text-xs text-gray-500 mt-0.5">{{ account.code }}</p>
                  </div>
                  <div class="text-right flex-shrink-0">
                    <p class="font-semibold text-gray-900 text-sm">
                      {{ formatCurrency(account.amount) }}
                    </p>
                    <p class="text-xs text-emerald-600 font-medium">
                      {{ ((account.amount / (data.accounting_revenue?.current || 1)) * 100).toFixed(1) }}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="mt-4 pt-4 border-t border-gray-200">
              <div class="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg p-4 text-white">
                <div class="flex justify-between items-center">
                  <div>
                    <p class="text-sm font-medium text-emerald-100 mb-1">Total Pendapatan</p>
                    <p class="text-xl font-bold">
                      {{ formatCurrency(data.accounting_revenue?.current || 0) }}
                    </p>
                  </div>
                  <div class="text-right">
                    <p class="text-sm text-emerald-100">{{ Object.keys(data.accounting_revenue?.account_breakdown || {}).length }} akun</p>
                    <p class="text-sm font-medium" :class="(data.accounting_revenue?.growth >= 0) ? 'text-emerald-100' : 'text-red-200'">
                      {{ (data.accounting_revenue?.growth >= 0) ? '↗' : '↘' }} {{ formatPercentage(Math.abs(data.accounting_revenue?.growth || 0)) }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- AI Insight Button -->
        <div class="absolute -top-2 -right-2 z-30">
          <div class="relative">
            <button 
              @click="toggleInsight('revenue')"
              data-insight-trigger
              class="bg-gradient-to-r from-emerald-500 to-purple-500 hover:from-emerald-600 hover:to-purple-600 text-white rounded-full p-1.5 shadow-lg transition-all group-hover:scale-110"
              title="Lihat Analisis Pendapatan AI"
            >
              <ChartBarIcon class="h-3 w-3" />
            </button>
            
            <div 
              v-if="activeInsight === 'revenue'"
              class="insight-popup absolute top-8 right-0 w-80 bg-white rounded-xl shadow-xl border border-gray-200 p-4 z-40 animate-in fade-in duration-200"
            >
              <div class="flex items-center justify-between mb-3">
                <h4 class="font-semibold text-gray-900 flex items-center">
                  <ChartBarIcon class="h-4 w-4 text-emerald-500 mr-2" />
                  Analisis Pendapatan
                </h4>
                <button @click="activeInsight = null" class="text-gray-400 hover:text-gray-600">
                  <XMarkIcon class="h-4 w-4" />
                </button>
              </div>
              
              <div class="space-y-3 text-sm">
                <div class="p-3 bg-emerald-50 rounded-lg">
                  <p class="font-medium text-emerald-900 mb-2">💰 Akuntansi vs Penjualan</p>
                  <div class="space-y-1 text-emerald-800 text-xs">
                    <div class="flex justify-between">
                      <span>Akuntansi:</span>
                      <span class="font-medium">{{ formatCurrency(data.accounting_revenue?.current || 0) }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span>Penjualan:</span>
                      <span class="font-medium">{{ formatCurrency(data.sales_revenue?.current || 0) }}</span>
                    </div>
                    <div class="flex justify-between border-t border-emerald-200 pt-1">
                      <span>Selisih:</span>
                      <span class="font-medium">{{ formatCurrency(Math.abs((data.accounting_revenue?.current || 0) - (data.sales_revenue?.current || 0))) }}</span>
                    </div>
                  </div>
                  <p class="text-emerald-800 mt-2">{{ getRevenueComparison() }}</p>
                </div>
                
                <div class="p-3 bg-purple-50 rounded-lg">
                  <p class="font-medium text-purple-900 mb-1">📊 Kinerja</p>
                  <p class="text-purple-800">{{ getRevenuePerformance() }}</p>
                </div>
                
                <div class="p-3 bg-blue-50 rounded-lg">
                  <p class="font-medium text-blue-900 mb-1">🎯 Langkah Selanjutnya</p>
                  <p class="text-blue-800">{{ getRevenueActionItems() }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Kartu COGS dengan Perbandingan Revenue -->
      <div class="relative group">
        <div class="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-slate-200 p-6 relative overflow-hidden group hover:border-slate-300 h-full">
          <div class="flex flex-col h-full relative z-10">
            <!-- Header -->
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center space-x-3">
                <div class="bg-red-50 p-2 rounded-lg transition-all duration-300 group-hover:scale-110">
                  <CurrencyDollarIcon class="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-900">Rasio COGS</p>
                  <p class="text-xs text-gray-500">Perbandingan dengan Revenue</p>
                </div>
              </div>
            </div>
            
            <!-- Nilai Utama - Sesuaikan dengan card lain -->
            <div class="flex-1 flex flex-col justify-center">
              <div>
                <p class="text-xl lg:text-2xl xl:text-3xl font-bold text-red-600 tracking-tight mb-1">
                  {{ (data.cogs?.percentage_of_revenue?.current || 0).toFixed(1) }}%
                </p>
                
                <div class="flex items-center justify-between">
                  <p class="text-sm font-medium text-gray-700 mb-2 font-mono tabular-nums">
                    {{ formatCompactCurrency(data.cogs?.current || 0) }}
                  </p>
                  <!-- <GrowthIndicator :growth="data.cogs?.growth" size="sm" />
                  <span class="text-xs text-gray-500">{{ getCOGSRatioEfficiency() }}</span> -->
                </div>
              </div>
            </div>

            <!-- Footer - Kompakt seperti card lain -->
            <div class="mt-auto">
              <div class="bg-red-50 rounded-lg p-2 mb-2">
                <p class="text-xs text-red-700 font-medium">
                  💰 {{ getCOGSRatioStatus() }}
                </p>
              </div>
              
              <!-- Quick breakdown -->
              <div class="pt-2 border-t border-gray-100">
                <div class="flex justify-between items-center text-xs mb-1">
                  <span class="text-gray-500">Gross Margin:</span>
                  <span class="font-medium text-green-600">{{ (data.gross_profit?.current_margin || 0).toFixed(1) }}%</span>
                </div>
                <div class="flex justify-between items-center text-xs">
                  <button 
                    type="button"
                    @click.stop.prevent="openCOGSDetail"
                    class="text-blue-500 hover:text-blue-700 hover:underline text-xs font-medium transition-colors cursor-pointer"
                    title="Klik untuk melihat detail breakdown COGS"
                  >
                    Lihat Detail Breakdown
                  </button>
                  <span class="text-gray-500">vs {{ (data.cogs?.percentage_of_revenue?.previous || 0).toFixed(1) }}%</span>
                </div>
              </div>
            </div>
          </div>

          <div class="absolute inset-0 bg-gradient-to-br from-transparent to-red-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
        
        <!-- Tombol AI Insight -->
        <div class="absolute -top-2 -right-2 z-30">
          <div class="relative">
            <button 
              @click="toggleInsight('cogs')"
              data-insight-trigger
              class="bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-lg transition-colors group-hover:scale-110"
              title="Lihat Analisis COGS vs Revenue"
            >
              <CurrencyDollarIcon class="h-3 w-3" />
            </button>
            
            <!-- Popup Analisis COGS - Ringkas -->
            <div 
              v-if="activeInsight === 'cogs'"
              class="insight-popup absolute top-8 right-0 w-72 bg-white rounded-xl shadow-xl border border-gray-200 p-4 z-40"
            >
              <div class="flex items-center justify-between mb-3">
                <h4 class="font-semibold text-gray-900 flex items-center">
                  <CurrencyDollarIcon class="h-4 w-4 text-red-500 mr-2" />
                  Analisis COGS
                </h4>
                <button @click="activeInsight = null" class="text-gray-400 hover:text-gray-600">
                  <XMarkIcon class="h-4 w-4" />
                </button>
              </div>
              
              <div class="space-y-3 text-sm">
                <div class="p-3 bg-red-50 rounded-lg">
                  <p class="font-medium text-red-900 mb-1">📊 Kinerja</p>
                  <p class="text-red-800">{{ getCOGSRatioAnalysis() }}</p>
                </div>
                
                <div class="p-3 bg-amber-50 rounded-lg">
                  <p class="font-medium text-amber-900 mb-1">💡 Rekomendasi</p>
                  <p class="text-amber-800">{{ getCOGSOptimizationRecommendation() }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- MODAL POPUP DETAIL COGS - Comprehensive -->
      <div 
        v-if="showCOGSDetail"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm"
        @click.self="closeCOGSDetail"
      >
        <div class="bg-white rounded-xl shadow-2xl border border-gray-200 p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <!-- Header -->
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl font-semibold text-gray-900 flex items-center">
              <CurrencyDollarIcon class="h-6 w-6 text-red-500 mr-3" />
              Detail Analisis COGS
            </h3>
            <button 
              type="button"
              @click="closeCOGSDetail" 
              class="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-colors"
              title="Tutup modal"
            >
              <XMarkIcon class="h-5 w-5" />
            </button>
          </div>
          
          <!-- Summary Cards -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div class="bg-red-50 rounded-lg p-4 text-center border border-red-100">
              <p class="text-sm text-red-600 mb-1">Rasio COGS Saat Ini</p>
              <p class="text-2xl font-bold text-red-700">{{ (data.cogs?.percentage_of_revenue?.current || 0).toFixed(1) }}%</p>
            </div>
            <div class="bg-gray-50 rounded-lg p-4 text-center border border-gray-200">
              <p class="text-sm text-gray-600 mb-1">Rasio Sebelumnya</p>
              <p class="text-2xl font-bold text-gray-700">{{ (data.cogs?.percentage_of_revenue?.previous || 0).toFixed(1) }}%</p>
            </div>
            <div class="rounded-lg p-4 text-center border" :class="(data.cogs?.percentage_of_revenue?.change || 0) <= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'">
              <p class="text-sm mb-1" :class="(data.cogs?.percentage_of_revenue?.change || 0) <= 0 ? 'text-green-600' : 'text-red-600'">Perubahan</p>
              <p class="text-2xl font-bold" :class="(data.cogs?.percentage_of_revenue?.change || 0) <= 0 ? 'text-green-700' : 'text-red-700'">
                {{ (data.cogs?.percentage_of_revenue?.change || 0) >= 0 ? '+' : '' }}{{ (data.cogs?.percentage_of_revenue?.change || 0).toFixed(2) }}%
              </p>
            </div>
          </div>
          
          <!-- Revenue vs COGS Comparison -->
          <div class="bg-gradient-to-r from-blue-50 to-red-50 rounded-lg p-4 mb-6 border border-gray-200">
            <h4 class="font-semibold text-gray-900 mb-3">Perbandingan Revenue vs COGS</h4>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="text-sm text-gray-600 mb-2">Total Revenue</p>
                <p class="text-lg font-semibold text-blue-600">{{ formatCurrency(data.sales_revenue?.current || 0) }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-600 mb-2">Total COGS</p>
                <p class="text-lg font-semibold text-red-600">{{ formatCurrency(data.cogs?.current || 0) }}</p>
              </div>
            </div>
            <div class="mt-4 pt-3 border-t border-gray-300">
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600">Gross Profit:</span>
                <span class="text-lg font-semibold text-green-600">
                  {{ formatCurrency(data.gross_profit?.current_gross_profit || 0) }} 
                  ({{ (data.gross_profit?.current_margin || 0).toFixed(1) }}%)
                </span>
              </div>
            </div>
          </div>
          
          <!-- Breakdown COGS Detail -->
          <div class="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
            <h4 class="font-semibold text-gray-900 mb-4">Breakdown COGS Detail</h4>
            <div class="space-y-3">
              <!-- HPP Stok -->
              <div class="bg-white rounded-lg p-4 border border-gray-200">
                <div class="flex justify-between items-center mb-2">
                  <h5 class="font-medium text-gray-900">HPP Stok (Stock COGS)</h5>
                  <span class="text-sm text-blue-600 font-medium">
                    {{ ((data.cogs?.account_breakdown?.['51000010']?.amount || 0) / (data.cogs?.current || 1) * 100).toFixed(1) }}%
                  </span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-sm text-gray-600">{{ data.cogs?.account_breakdown?.['51000010']?.name || 'HPP Stok / Stok COGS' }}</span>
                  <span class="font-semibold text-gray-900">
                    {{ formatCurrency(data.cogs?.account_breakdown?.['51000010']?.amount || 0) }}
                  </span>
                </div>
                <p class="text-xs text-gray-500 mt-1">
                  {{ data.cogs?.account_breakdown?.['51000010']?.entry_count || 0 }} transaksi
                </p>
              </div>
              
              <!-- HPP Non Stok -->
              <div class="bg-white rounded-lg p-4 border border-gray-200">
                <div class="flex justify-between items-center mb-2">
                  <h5 class="font-medium text-gray-900">HPP Non Stok (Partner COGS)</h5>
                  <span class="text-sm text-purple-600 font-medium">
                    {{ ((data.cogs?.account_breakdown?.['51000020']?.amount || 0) / (data.cogs?.current || 1) * 100).toFixed(1) }}%
                  </span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-sm text-gray-600">{{ data.cogs?.account_breakdown?.['51000020']?.name || 'HPP Non Stok / Partner COGS' }}</span>
                  <span class="font-semibold text-gray-900">
                    {{ formatCurrency(data.cogs?.account_breakdown?.['51000020']?.amount || 0) }}
                  </span>
                </div>
                <p class="text-xs text-gray-500 mt-1">
                  {{ data.cogs?.account_breakdown?.['51000020']?.entry_count || 0 }} transaksi
                </p>
              </div>
            </div>
          </div>
          
          <!-- Profitability Analysis -->
          <div class="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 mb-6 border border-green-200">
            <h4 class="font-semibold text-green-900 mb-3">Analisis Profitabilitas</h4>
            <div class="space-y-2 text-sm">
              <p class="text-green-800">{{ getProfitabilityImpact() }}</p>
              <div class="pt-2 border-t border-green-200">
                <p class="text-green-700 font-medium">Rekomendasi:</p>
                <p class="text-green-800">{{ getCOGSOptimizationRecommendation() }}</p>
              </div>
            </div>
          </div>
          
          

          <!-- Action Buttons -->
          <div class="flex justify-end space-x-3">
            <button 
              type="button"
              @click="closeCOGSDetail"
              class="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Tutup
            </button>
            <button 
              type="button"
              @click="closeCOGSDetail"
              class="px-4 py-2 text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
            >
              Simpan Analisis
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ===== MODAL DETAIL TARGET ACCOUNTING ===== -->
    <div 
      v-if="showAccountingTargetDetail"
      class="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 bg-black/50 backdrop-blur-sm animate-fadeIn"
      @click.self="closeAccountingTargetDetail"
    >
      <div class="accounting-modal-container bg-white rounded-xl shadow-2xl border border-gray-200 w-full h-[95vh] overflow-hidden flex flex-col">
        
        <!-- Header - Compact -->
        <div class="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-green-50 flex-shrink-0">
          <h3 class="text-base sm:text-lg xl:text-xl font-bold text-gray-900 flex items-center">
            <BanknotesIcon class="h-5 w-5 sm:h-6 sm:w-6 text-emerald-500 mr-2 sm:mr-3 flex-shrink-0" />
            <span class="hidden sm:inline">Detail Pendapatan Akuntansi</span>
            <span class="sm:hidden">Pendapatan Akuntansi</span>
          </h3>
          <button 
            @click="closeAccountingTargetDetail" 
            class="text-gray-400 hover:text-gray-600 hover:bg-white rounded-full p-1.5 sm:p-2 transition-colors flex-shrink-0"
          >
            <XMarkIcon class="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>

        <!-- Content - 2 Kolom Responsive -->
        <div class="flex-1 overflow-y-auto p-3 sm:p-4 xl:p-6 custom-scroll-emerald bg-gray-50">
          <div class="grid grid-cols-1 xl:grid-cols-2 gap-3 sm:gap-4 xl:gap-6">
            
            <!-- ========== KOLOM KIRI: TARGET & PROYEKSI ========== -->
            <div class="space-y-3 sm:space-y-4">
              
              <!-- Target Overview -->
              <div class="bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg xl:rounded-xl p-4 sm:p-5 xl:p-6 border-2 border-emerald-200 shadow-sm">
                <div class="text-center mb-4">
                  <p class="text-xs sm:text-sm text-emerald-600 font-medium mb-2">🎯 Target Bulan Ini</p>
                  <p class="text-2xl sm:text-3xl xl:text-4xl font-bold text-emerald-700 tabular-nums">
                    {{ formatCurrency(getAccountingTargetAmount()) }}
                  </p>
                </div>
                
                <div class="mb-4">
                  <div class="flex justify-between items-center mb-2">
                    <span class="text-xs sm:text-sm font-medium text-emerald-700">Progress Pencapaian</span>
                    <span class="text-base sm:text-lg xl:text-xl font-bold text-emerald-900 tabular-nums">
                      {{ getAccountingTargetAchievement() }}%
                    </span>
                  </div>
                  <div class="w-full bg-emerald-200 rounded-full h-4 sm:h-5 shadow-inner overflow-hidden">
                    <div 
                      class="h-4 sm:h-5 rounded-full bg-gradient-to-r from-emerald-500 to-green-500 transition-all duration-500 flex items-center justify-end pr-2"
                      :style="{ width: `${Math.min(getAccountingTargetAchievement(), 100)}%` }"
                    >
                      <span v-if="getAccountingTargetAchievement() > 15" class="text-[10px] sm:text-xs font-bold text-white drop-shadow">
                        {{ getAccountingTargetAchievement() }}%
                      </span>
                    </div>
                  </div>
                </div>
                
                <div class="grid grid-cols-2 gap-3">
                  <div class="bg-white rounded-lg p-3 sm:p-4 border border-emerald-100 shadow-sm">
                    <p class="text-gray-600 text-xs mb-1">✅ Tercapai</p>
                    <p class="font-bold text-emerald-700 text-sm sm:text-base tabular-nums">
                      {{ formatCompactCurrency(data.accounting_revenue?.current || 0) }}
                    </p>
                  </div>
                  <div class="bg-white rounded-lg p-3 sm:p-4 border border-emerald-100 shadow-sm">
                    <p class="text-gray-600 text-xs mb-1">
                      {{ getAccountingGapAmount() < 0 ? '⚠️ Kurang' : '🎉 Lebih' }}
                    </p>
                    <p class="font-bold text-sm sm:text-base tabular-nums" :class="getAccountingGapAmount() < 0 ? 'text-red-600' : 'text-green-600'">
                      {{ formatCompactCurrency(Math.abs(getAccountingGapAmount())) }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- Daily Progress -->
              <div class="bg-blue-50 rounded-lg xl:rounded-xl p-4 sm:p-5 xl:p-6 border-2 border-blue-200 shadow-sm">
                <h4 class="font-bold text-blue-900 mb-4 flex items-center text-sm sm:text-base">
                  📊 Progress Harian
                </h4>
                <div class="space-y-3">
                  <div class="flex justify-between items-center p-3 sm:p-4 bg-white rounded-lg shadow-sm">
                    <span class="text-blue-700 text-xs sm:text-sm font-medium">Target per hari:</span>
                    <span class="font-bold text-blue-900 text-sm sm:text-base xl:text-lg tabular-nums">
                      {{ formatCompactCurrency(getAccountingDailyTarget()) }}
                    </span>
                  </div>
                  <div class="flex justify-between items-center p-3 sm:p-4 bg-white rounded-lg shadow-sm">
                    <span class="text-blue-700 text-xs sm:text-sm font-medium">Actual per hari:</span>
                    <span class="font-bold text-sm sm:text-base xl:text-lg tabular-nums" :class="getAccountingDailyActual() >= getAccountingDailyTarget() ? 'text-green-600' : 'text-red-600'">
                      {{ formatCompactCurrency(getAccountingDailyActual()) }}
                    </span>
                  </div>
                  <div class="flex justify-between items-center p-3 sm:p-4 bg-gradient-to-r from-blue-100 to-blue-50 rounded-lg border-2 border-blue-200 shadow-sm">
                    <span class="text-blue-900 text-xs sm:text-sm font-bold">Selisih:</span>
                    <span class="font-bold text-base sm:text-lg xl:text-xl tabular-nums" :class="(getAccountingDailyActual() - getAccountingDailyTarget()) >= 0 ? 'text-green-600' : 'text-red-600'">
                      {{ (getAccountingDailyActual() - getAccountingDailyTarget()) >= 0 ? '+' : '' }}{{ formatCompactCurrency(Math.abs(getAccountingDailyActual() - getAccountingDailyTarget())) }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Projection -->
              <div class="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg xl:rounded-xl p-4 sm:p-5 xl:p-6 border-2 border-amber-200 shadow-sm">
                <h4 class="font-bold text-amber-900 mb-3 flex items-center text-sm sm:text-base">
                  📈 Proyeksi Akhir Bulan
                </h4>
                <div class="bg-white rounded-lg p-4 mb-3 shadow-sm">
                  <div class="flex justify-between items-center mb-2">
                    <span class="text-xs sm:text-sm text-amber-700 font-medium">Proyeksi:</span>
                    <span class="text-xl sm:text-2xl xl:text-3xl font-bold tabular-nums" :class="getAccountingProjection() >= getAccountingTargetAmount() ? 'text-green-600' : 'text-red-600'">
                      {{ formatCompactCurrency(getAccountingProjection()) }}
                    </span>
                  </div>
                  <div class="w-full bg-gray-200 rounded-full h-2 sm:h-3 mt-2 overflow-hidden">
                    <div 
                      class="h-2 sm:h-3 rounded-full transition-all duration-500"
                      :class="getAccountingProjection() >= getAccountingTargetAmount() ? 'bg-green-500' : 'bg-red-500'"
                      :style="{ width: `${Math.min((getAccountingProjection() / getAccountingTargetAmount()) * 100, 100)}%` }"
                    ></div>
                  </div>
                </div>
                <div class="bg-white rounded-lg p-3 border-l-4 shadow-sm" :class="getAccountingProjection() >= getAccountingTargetAmount() ? 'border-green-500' : 'border-red-500'">
                  <p class="text-xs sm:text-sm font-medium leading-relaxed" :class="getAccountingProjection() >= getAccountingTargetAmount() ? 'text-green-700' : 'text-red-700'">
                    {{ getAccountingProjection() >= getAccountingTargetAmount() 
                      ? '✓ Proyeksi mencapai target jika tren berlanjut' 
                      : '⚠️ Perlu peningkatan untuk mencapai target' 
                    }}
                  </p>
                  <p class="text-xs text-gray-600 mt-2">
                    Selisih: 
                    <span class="font-bold tabular-nums" :class="getAccountingProjection() >= getAccountingTargetAmount() ? 'text-green-600' : 'text-red-600'">
                      {{ formatCompactCurrency(Math.abs(getAccountingProjection() - getAccountingTargetAmount())) }}
                    </span>
                  </p>
                </div>
              </div>

              <!-- Recommendation -->
              <div class="bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg xl:rounded-xl p-4 sm:p-5 xl:p-6 border-2 border-gray-200 shadow-sm">
                <h4 class="font-bold text-gray-900 mb-3 flex items-center text-sm sm:text-base">
                  💡 Rekomendasi
                </h4>
                <div class="bg-white rounded-lg p-4 border-l-4 border-emerald-500 shadow-sm">
                  <p class="text-xs sm:text-sm text-gray-700 leading-relaxed">
                    {{ getAccountingTargetRecommendation() }}
                  </p>
                </div>
              </div>
            </div>

            <!-- ========== KOLOM KANAN: BREAKDOWN DETAIL ========== -->
            <div class="space-y-3 sm:space-y-4">
              
              <!-- Summary Comparison -->
              <div class="bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg xl:rounded-xl p-4 sm:p-5 xl:p-6 border-2 border-emerald-200 shadow-sm">
                <h4 class="font-bold text-emerald-900 mb-4 flex items-center text-sm sm:text-base">
                  📊 Perbandingan Periode
                </h4>
                <div class="grid grid-cols-2 gap-3 sm:gap-4 mb-4">
                  <div class="bg-white rounded-lg p-4 border-2 border-emerald-300 shadow-sm">
                    <p class="text-xs sm:text-sm text-gray-600 mb-2 font-medium">Saat Ini</p>
                    <p class="text-lg sm:text-xl xl:text-2xl font-bold text-emerald-600 tabular-nums">
                      {{ formatCompactCurrency(data.accounting_revenue?.current || 0) }}
                    </p>
                  </div>
                  <div class="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                    <p class="text-xs sm:text-sm text-gray-600 mb-2 font-medium">Sebelumnya</p>
                    <p class="text-lg sm:text-xl xl:text-2xl font-bold text-gray-500 tabular-nums">
                      {{ formatCompactCurrency(data.accounting_revenue?.previous || 0) }}
                    </p>
                  </div>
                </div>
                
                <div class="bg-white rounded-lg p-4 shadow-sm">
                  <div class="flex justify-between items-center flex-wrap gap-2">
                    <span class="text-xs sm:text-sm text-gray-600 font-medium">Perubahan:</span>
                    <div class="text-right">
                      <span class="text-base sm:text-lg xl:text-xl font-bold tabular-nums" :class="(data.accounting_revenue?.current || 0) >= (data.accounting_revenue?.previous || 0) ? 'text-green-600' : 'text-red-600'">
                        {{ (data.accounting_revenue?.current || 0) >= (data.accounting_revenue?.previous || 0) ? '+' : '' }}{{ formatCompactCurrency(Math.abs((data.accounting_revenue?.current || 0) - (data.accounting_revenue?.previous || 0))) }}
                      </span>
                      <span class="ml-2 text-xs sm:text-sm font-bold px-2 sm:px-3 py-1 rounded-full inline-block" :class="(data.accounting_revenue?.growth >= 0) ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'">
                        {{ formatPercentage(data.accounting_revenue?.growth || 0) }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Account Breakdown -->
              <div class="bg-white rounded-lg xl:rounded-xl p-4 sm:p-5 xl:p-6 border-2 border-gray-200 flex flex-col shadow-sm min-h-[350px] xl:min-h-[450px]">
                <h4 class="font-bold text-gray-900 mb-4 flex items-center text-sm sm:text-base flex-shrink-0">
                  🏦 Breakdown Akun Pendapatan
                </h4>
                
                <div class="flex-1 overflow-y-auto custom-scroll-emerald pr-2 space-y-3">
                  <div 
                    v-for="(account, code) in data.accounting_revenue?.account_breakdown" 
                    :key="code"
                    class="bg-gradient-to-r from-gray-50 to-emerald-50 hover:from-emerald-50 hover:to-emerald-100 rounded-lg p-4 transition-all duration-200 border border-gray-200 hover:border-emerald-300 hover:shadow-md cursor-pointer"
                  >
                    <div class="flex justify-between items-start mb-2">
                      <div class="flex-1 mr-3 min-w-0">
                        <h5 class="font-semibold text-gray-900 text-xs sm:text-sm truncate">
                          {{ account.name || account.code }}
                        </h5>
                        <p class="text-[10px] sm:text-xs text-gray-500 mt-1">{{ account.code }}</p>
                      </div>
                      <div class="flex items-center bg-emerald-100 px-2 py-1 rounded-full flex-shrink-0">
                        <span class="text-[10px] sm:text-xs font-bold text-emerald-700 tabular-nums">
                          {{ ((account.amount / (data.accounting_revenue?.current || 1)) * 100).toFixed(1) }}%
                        </span>
                      </div>
                    </div>
                    
                    <div class="flex justify-between items-center mb-2">
                      <span class="text-base sm:text-lg xl:text-xl font-bold text-gray-900 tabular-nums">
                        {{ formatCompactCurrency(account.amount) }}
                      </span>
                      <span class="text-[10px] sm:text-xs text-gray-500">
                        {{ account.entry_count || 0 }} transaksi
                      </span>
                    </div>

                    <!-- Mini progress bar -->
                    <div class="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                      <div 
                        class="h-1.5 rounded-full bg-gradient-to-r from-emerald-400 to-green-500 transition-all duration-300"
                        :style="{ width: `${((account.amount / (data.accounting_revenue?.current || 1)) * 100)}%` }"
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Total Summary -->
              <div class="bg-gradient-to-r from-emerald-500 to-green-600 rounded-lg xl:rounded-xl p-4 sm:p-5 xl:p-6 text-white shadow-lg">
                <div class="flex justify-between items-center flex-wrap gap-4">
                  <div class="flex-1 min-w-0">
                    <p class="text-xs sm:text-sm font-medium text-emerald-100 mb-2">Total Pendapatan</p>
                    <p class="text-2xl sm:text-3xl xl:text-4xl font-bold tabular-nums truncate">
                      {{ formatCompactCurrency(data.accounting_revenue?.current || 0) }}
                    </p>
                  </div>
                  <div class="text-right flex-shrink-0">
                    <div class="bg-white bg-opacity-20 rounded-lg px-3 py-2 mb-2 backdrop-blur-sm">
                      <p class="text-xs sm:text-sm text-emerald-100">Total Akun</p>
                      <p class="text-xl sm:text-2xl xl:text-3xl font-bold tabular-nums">
                        {{ Object.keys(data.accounting_revenue?.account_breakdown || {}).length }}
                      </p>
                    </div>
                    <p class="text-xs sm:text-sm font-bold" :class="(data.accounting_revenue?.growth >= 0) ? 'text-emerald-100' : 'text-red-200'">
                      {{ (data.accounting_revenue?.growth >= 0) ? '↗' : '↘' }} {{ formatPercentage(Math.abs(data.accounting_revenue?.growth || 0)) }}
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        <!-- Footer Actions -->
        <div class="flex flex-col sm:flex-row justify-between items-center px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200 bg-gray-50 gap-3 sm:gap-0 flex-shrink-0">
          <div class="text-xs sm:text-sm text-gray-600 order-2 sm:order-1">
            <span class="font-medium">Diperbarui:</span> <span class="tabular-nums">{{ new Date().toLocaleDateString('id-ID') }}</span>
          </div>
          <div class="flex space-x-3 w-full sm:w-auto order-1 sm:order-2">
            <button 
              @click="closeAccountingTargetDetail"
              class="flex-1 sm:flex-none px-6 py-2.5 text-sm sm:text-base text-gray-700 bg-white border-2 border-gray-300 hover:bg-gray-100 rounded-lg transition-colors font-medium"
            >
              Tutup
            </button>
            <button 
              class="flex-1 sm:flex-none px-6 py-2.5 text-sm sm:text-base text-white bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 rounded-lg transition-all font-medium shadow-md hover:shadow-lg"
            >
              💾 Simpan
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ===== MODAL DETAIL TARGET SALES ===== -->
    <div 
      v-if="showSalesTargetDetail"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm"
      @click.self="closeSalesTargetDetail"
    >
      <div class="bg-white rounded-xl shadow-2xl border border-gray-200 p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto">
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-semibold text-gray-900 flex items-center">
            <CurrencyDollarIcon class="h-5 w-5 text-purple-500 mr-2" />
            Detail Target Penjualan
          </h3>
          <button 
            @click="closeSalesTargetDetail" 
            class="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-colors"
          >
            <XMarkIcon class="h-5 w-5" />
          </button>
        </div>
        
        <!-- Target Overview -->
        <div class="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-4 mb-6 border border-purple-200">
          <div class="text-center mb-3">
            <p class="text-sm text-purple-600 mb-1">Target Bulan Ini</p>
            <p class="text-3xl font-bold text-purple-700">
              {{ formatCurrency(getSalesTargetAmount()) }}
            </p>
          </div>
          
          <div class="mb-3">
            <div class="flex justify-between items-center mb-1">
              <span class="text-sm text-purple-700">Progress</span>
              <span class="text-sm font-semibold text-purple-900">
                {{ getSalesTargetAchievement() }}%
              </span>
            </div>
            <div class="w-full bg-purple-200 rounded-full h-3">
              <div 
                class="h-3 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-500"
                :style="{ width: `${Math.min(getSalesTargetAchievement(), 100)}%` }"
              ></div>
            </div>
          </div>
          
          <div class="grid grid-cols-2 gap-3 text-sm">
            <div class="bg-white rounded p-2">
              <p class="text-gray-600 text-xs">Tercapai</p>
              <p class="font-semibold text-purple-700">
                {{ formatCurrency(data.sales_revenue?.current || 0) }}
              </p>
            </div>
            <div class="bg-white rounded p-2">
              <p class="text-gray-600 text-xs">Gap</p>
              <p class="font-semibold" :class="getSalesGapAmount() < 0 ? 'text-red-600' : 'text-green-600'">
                {{ formatCurrency(Math.abs(getSalesGapAmount())) }}
              </p>
            </div>
          </div>
        </div>
        
        <!-- Daily Progress -->
        <div class="bg-blue-50 rounded-lg p-4 mb-4 border border-blue-200">
          <h4 class="font-semibold text-blue-900 mb-3 flex items-center">
            📊 Progress Harian
          </h4>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-blue-700">Target per hari:</span>
              <span class="font-semibold text-blue-900">
                {{ formatCurrency(getSalesDailyTarget()) }}
              </span>
            </div>
            <div class="flex justify-between">
              <span class="text-blue-700">Actual per hari:</span>
              <span class="font-semibold" :class="getSalesDailyActual() >= getSalesDailyTarget() ? 'text-green-600' : 'text-red-600'">
                {{ formatCurrency(getSalesDailyActual()) }}
              </span>
            </div>
            <div class="flex justify-between pt-2 border-t border-blue-200">
              <span class="text-blue-700">Selisih:</span>
              <span class="font-bold" :class="(getSalesDailyActual() - getSalesDailyTarget()) >= 0 ? 'text-green-600' : 'text-red-600'">
                {{ (getSalesDailyActual() - getSalesDailyTarget()) >= 0 ? '+' : '' }}{{ formatCurrency(Math.abs(getSalesDailyActual() - getSalesDailyTarget())) }}
              </span>
            </div>
          </div>
        </div>
        
        <!-- Projection -->
        <div v-if="getSalesProjection()" class="bg-amber-50 rounded-lg p-4 mb-4 border border-amber-200">
          <h4 class="font-semibold text-amber-900 mb-2 flex items-center">
            📈 Proyeksi Akhir Bulan
          </h4>
          <div class="flex justify-between items-center">
            <span class="text-sm text-amber-700">Berdasarkan tren saat ini:</span>
            <span class="text-lg font-bold" :class="getSalesProjection() >= getSalesTargetAmount() ? 'text-green-600' : 'text-red-600'">
              {{ formatCurrency(getSalesProjection()) }}
            </span>
          </div>
          <p class="text-xs text-amber-600 mt-2">
            {{ getSalesProjection() >= getSalesTargetAmount() 
              ? '✓ Proyeksi mencapai target jika tren berlanjut' 
              : '⚠️ Perlu peningkatan untuk mencapai target' 
            }}
          </p>
        </div>
        
        <!-- Status & Recommendation -->
        <div class="bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg p-4 border border-gray-200">
          <h4 class="font-semibold text-gray-900 mb-2">Status & Rekomendasi</h4>
          <div class="space-y-2 text-sm text-gray-700">
            <p>{{ getSalesTargetRecommendation() }}</p>
          </div>
        </div>
        
        <!-- Action Buttons -->
        <div class="flex justify-end space-x-3 mt-6">
          <button 
            @click="closeSalesTargetDetail"
            class="px-4 py-2 text-white bg-purple-500 hover:bg-purple-600 rounded-lg transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>

    <!-- Bagian Analitik Lanjutan -->
    <div class="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl p-6 border border-slate-200">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
        <div>
          <h3 class="text-lg font-semibold text-gray-900">Analitik Lanjutan</h3>
          <p class="text-sm text-gray-600 mt-1">Wawasan bisnis yang komprehensif</p>
        </div>
        <div class="mt-3 sm:mt-0">
          <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Data Real-time
          </span>
        </div>
      </div>

      <!-- Grid Metrik Sekunder yang Ditingkatkan -->
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        
        <!-- Kartu Nilai Rata-rata Pesanan -->
        <div class="relative group">
          <div class="bg-white rounded-xl p-5 shadow-sm border border-slate-200 hover:shadow-md transition-shadow h-full">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center">
                <div class="bg-indigo-100 p-2 rounded-lg">
                  <CalculatorIcon class="h-6 w-6 text-indigo-600" />
                </div>
                <div class="ml-3">
                  <h4 class="text-sm font-medium text-gray-900">Nilai Rata-rata Pesanan</h4>
                  <p class="text-xs text-gray-500">Pendapatan per transaksi</p>
                </div>
              </div>
            </div>
            
            <div class="space-y-3">
              <div>
                <p class="text-2xl font-bold text-gray-900">
                  {{ formatCompactCurrency(data.average_order?.current || 0) }}
                </p>
                <div class="flex items-center justify-between mt-1">
                  <GrowthIndicator :growth="data.average_order?.growth" size="sm" />
                  <span class="text-xs text-gray-500">{{ getGrowthSummary('average_order') }}</span>
                </div>
              </div>
              
              <!-- Ringkasan AI -->
              <div class="bg-indigo-50 rounded-lg p-2">
                <p class="text-xs text-indigo-700 font-medium">
                  💰 {{ getAOVStatus() }}
                </p>
              </div>
              
              <!-- Rincian AOV -->
              <div class="pt-3 border-t border-gray-100">
                <div class="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <p class="text-gray-600">Total Pendapatan</p>
                    <p class="font-medium text-gray-900">{{ formatCompactCurrency((data.sales_revenue?.current || 0)) }}</p>
                  </div>
                  <div>
                    <p class="text-gray-600">Total Pesanan</p>
                    <p class="font-medium text-gray-900">{{ formatNumber(data.orders?.current || 0) }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Tombol AI Insight -->
          <div class="absolute -top-2 -right-2 z-30">
            <div class="relative">
              <button 
                @click="toggleInsight('aov')"
                data-insight-trigger
                class="bg-indigo-500 hover:bg-indigo-600 text-white rounded-full p-1.5 shadow-lg transition-colors group-hover:scale-110"
                title="Lihat Analisis Nilai Pesanan"
              >
                <CalculatorIcon class="h-3 w-3" />
              </button>
              
              <!-- Popup Analisis AOV -->
              <div 
                v-if="activeInsight === 'aov'"
                class="insight-popup absolute top-8 right-0 w-72 bg-white rounded-xl shadow-xl border border-gray-200 p-4 z-40"
              >
                <div class="flex items-center justify-between mb-3">
                  <h4 class="font-semibold text-gray-900 flex items-center">
                    <CalculatorIcon class="h-4 w-4 text-indigo-500 mr-2" />
                    Analisis Nilai Pesanan
                  </h4>
                  <button @click="activeInsight = null" class="text-gray-400 hover:text-gray-600">
                    <XMarkIcon class="h-4 w-4" />
                  </button>
                </div>
                
                <div class="space-y-3 text-sm">
                  <div class="p-3 bg-indigo-50 rounded-lg">
                    <p class="font-medium text-indigo-900 mb-1">📊 Kinerja</p>
                    <p class="text-indigo-800">{{ getAOVAnalysis() }}</p>
                  </div>
                  
                  <div class="p-3 bg-green-50 rounded-lg">
                    <p class="font-medium text-green-900 mb-1">🎯 Strategi</p>
                    <p class="text-green-800">{{ getAOVStrategy() }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Kartu Kinerja Flat Rate -->
        <div class="relative group">
          <div class="bg-white rounded-xl p-5 shadow-sm border border-slate-200 hover:shadow-md transition-shadow h-full">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center">
                <div class="bg-amber-100 p-2 rounded-lg">
                  <WrenchScrewdriverIcon class="h-6 w-6 text-amber-600" />
                </div>
                <div class="ml-3">
                  <h4 class="text-sm font-medium text-gray-900">Kinerja Flat Rate</h4>
                  <p class="text-xs text-gray-500">Efisiensi mekanik</p>
                </div>
              </div>
            </div>
            
            <div class="space-y-3">
              <div>
                <p class="text-2xl font-bold text-gray-900">
                  {{ formatNumber(data.flat_rate?.current_hours || 0, 1) }}j
                </p>
                <div class="flex items-center justify-between mt-1">
                  <GrowthIndicator :growth="data.flat_rate?.growth" size="sm" />
                  <span class="text-xs text-gray-500">{{ getGrowthSummary('flat_rate') }}</span>
                </div>
              </div>
              
              <!-- Ringkasan AI -->
              <div class="bg-amber-50 rounded-lg p-2">
                <p class="text-xs text-amber-700 font-medium">
                  ⚙️ {{ getFlatRateStatus() }}
                </p>
              </div>
              
              <!-- Metrik Efisiensi -->
              <div class="pt-3 border-t border-gray-100">
                <div class="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <p class="text-gray-600">Jam Saat Ini</p>
                    <p class="font-medium text-gray-900">{{ formatNumber(data.flat_rate?.current_hours || 0, 1) }}</p>
                  </div>
                  <div>
                    <p class="text-gray-600">Jam Sebelumnya</p>
                    <p class="font-medium text-gray-900">{{ formatNumber(data.flat_rate?.previous_hours || 0, 1) }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Tombol AI Insight -->
          <div class="absolute -top-2 -right-2 z-30">
            <div class="relative">
              <button 
                @click="toggleInsight('flatrate')"
                data-insight-trigger
                class="bg-amber-500 hover:bg-amber-600 text-white rounded-full p-1.5 shadow-lg transition-colors group-hover:scale-110"
                title="Lihat Analisis Flat Rate"
              >
                <WrenchScrewdriverIcon class="h-3 w-3" />
              </button>
              
              <!-- Popup Analisis Flat Rate -->
              <div 
                v-if="activeInsight === 'flatrate'"
                class="insight-popup absolute top-8 right-0 w-72 bg-white rounded-xl shadow-xl border border-gray-200 p-4 z-40"
              >
                <div class="flex items-center justify-between mb-3">
                  <h4 class="font-semibold text-gray-900 flex items-center">
                    <WrenchScrewdriverIcon class="h-4 w-4 text-amber-500 mr-2" />
                    Analisis Flat Rate
                  </h4>
                  <button @click="activeInsight = null" class="text-gray-400 hover:text-gray-600">
                    <XMarkIcon class="h-4 w-4" />
                  </button>
                </div>
                
                <div class="space-y-3 text-sm">
                  <div class="p-3 bg-amber-50 rounded-lg">
                    <p class="font-medium text-amber-900 mb-1">⚙️ Efisiensi</p>
                    <p class="text-amber-800">{{ getFlatRateAnalysis() }}</p>
                  </div>
                  
                  <div class="p-3 bg-blue-50 rounded-lg">
                    <p class="font-medium text-blue-900 mb-1">🔧 Optimisasi</p>
                    <p class="text-blue-800">{{ getFlatRateOptimization() }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Kartu Analitik Waktu Tunggu -->
        <div class="relative group">
          <div class="bg-white rounded-xl p-5 shadow-sm border border-slate-200 hover:shadow-md transition-shadow h-full">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center">
                <div class="bg-orange-100 p-2 rounded-lg">
                  <ClockIcon class="h-6 w-6 text-orange-600" />
                </div>
                <div class="ml-3">
                  <h4 class="text-sm font-medium text-gray-900">Kinerja Waktu Tunggu</h4>
                  <p class="text-xs text-gray-500">Efisiensi layanan</p>
                </div>
              </div>
            </div>
            
            <div class="space-y-3">
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <p class="text-lg font-bold text-gray-900">
                    {{ (data.lead_time?.current?.avg_lead_time || 0).toFixed(1) }}j
                  </p>
                  <p class="text-xs text-gray-500">Rata-rata Waktu</p>
                </div>
                <div>
                  <p class="text-lg font-bold text-gray-900">
                    {{ (data.lead_time?.current?.on_time_rate || 0).toFixed(1) }}%
                  </p>
                  <p class="text-xs text-gray-500">Tingkat Tepat Waktu</p>
                </div>
              </div>
              
              <!-- Ringkasan AI -->
              <div class="bg-orange-50 rounded-lg p-2">
                <p class="text-xs text-orange-700 font-medium">
                  ⏱️ {{ getAdvancedServiceStatus() }}
                </p>
              </div>
              
              <div class="pt-3 border-t border-gray-100">
                <div class="flex justify-between items-center text-xs">
                  <span class="text-gray-600">Pesanan Selesai:</span>
                  <span class="font-medium text-gray-900">{{ data.lead_time?.current?.completed_orders || 0 }}</span>
                </div>
                <div class="flex justify-between items-center text-xs mt-1">
                  <span class="text-gray-600">Pekerjaan Menginap:</span>
                  <span class="font-medium text-gray-900">{{ data.lead_time?.current?.overnight_orders || 0 }}</span>
                </div>
              </div>
              
              <div class="flex items-center justify-between mt-2">
                <GrowthIndicator :growth="data.lead_time?.growth?.avg_lead_time" size="sm" />
                <span class="text-xs text-gray-500">{{ getGrowthSummary('detailed_lead_time') }}</span>
              </div>
            </div>
          </div>
          
          <!-- Tombol AI Insight -->
          <div class="absolute -top-2 -right-2 z-30">
            <div class="relative">
              <button 
                @click="toggleInsight('leadtime')"
                data-insight-trigger
                class="bg-orange-500 hover:bg-orange-600 text-white rounded-full p-1.5 shadow-lg transition-colors group-hover:scale-110"
                title="Lihat Analisis Waktu Tunggu"
              >
                <ClockIcon class="h-3 w-3" />
              </button>
              
              <!-- Popup Analisis Layanan Lanjutan -->
              <div 
                v-if="activeInsight === 'leadtime'"
                class="insight-popup absolute top-8 right-0 w-80 bg-white rounded-xl shadow-xl border border-gray-200 p-4 z-40"
              >
                <div class="flex items-center justify-between mb-3">
                  <h4 class="font-semibold text-gray-900 flex items-center">
                    <ClockIcon class="h-4 w-4 text-orange-500 mr-2" />
                    Analitik Layanan Lanjutan
                  </h4>
                  <button @click="activeInsight = null" class="text-gray-400 hover:text-gray-600">
                    <XMarkIcon class="h-4 w-4" />
                  </button>
                </div>
                
                <div class="space-y-3 text-sm">
                  <div class="p-3 bg-orange-50 rounded-lg">
                    <p class="font-medium text-orange-900 mb-1">⏱️ Rincian Waktu Tunggu</p>
                    <p class="text-orange-800">{{ getDetailedLeadTimeAnalysis() }}</p>
                  </div>
                  
                  <div class="p-3 bg-green-50 rounded-lg">
                    <p class="font-medium text-green-900 mb-1">📈 Tren Efisiensi</p>
                    <p class="text-green-800">{{ getEfficiencyTrends() }}</p>
                  </div>
                  
                  <div class="p-3 bg-red-50 rounded-lg">
                    <p class="font-medium text-red-900 mb-1">🚨 Tindakan Diperlukan</p>
                    <p class="text-red-800">{{ getServiceActionItems() }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Kartu Analitik Keanggotaan -->
        <div class="relative group">
          <div class="bg-white rounded-xl p-5 shadow-sm border border-slate-200 hover:shadow-md transition-shadow h-full">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center">
                <div class="bg-purple-100 p-2 rounded-lg">
                  <UserGroupIcon class="h-6 w-6 text-purple-600" />
                </div>
                <div class="ml-3">
                  <h4 class="text-sm font-medium text-gray-900">Wawasan Keanggotaan</h4>
                  <p class="text-xs text-gray-500">Loyalitas pelanggan</p>
                </div>
              </div>
            </div>
            
            <div class="space-y-3">
              <div>
                <p class="text-2xl font-bold text-gray-900">
                  {{ formatNumber(data.membership?.total_members || 0) }}
                </p>
                <p class="text-xs text-gray-500">Total Anggota</p>
              </div>
              
              <!-- Ringkasan AI -->
              <div class="bg-purple-50 rounded-lg p-2">
                <p class="text-xs text-purple-700 font-medium">
                  👥 {{ getMembershipStatus() }}
                </p>
              </div>
              
              <!-- Distribusi Level -->
              <div v-if="data.membership?.level_distribution" class="pt-3 border-t border-gray-100">
                <p class="text-xs font-medium text-gray-700 mb-2">Level Anggota:</p>
                <div class="space-y-1">
                  <div 
                    v-for="(level, key) in data.membership.level_distribution" 
                    :key="key"
                    class="flex justify-between items-center text-xs"
                  >
                    <div class="flex items-center">
                      <span :class="getLevelIcon(key)" class="mr-1">{{ getLevelEmoji(key) }}</span>
                      <span class="text-gray-600 capitalize">{{ getLevelName(key) }}</span>
                    </div>
                    <span class="font-medium text-gray-900">{{ level.count }}</span>
                  </div>
                </div>
              </div>
              
              <div class="flex items-center justify-between mt-2">
                <GrowthIndicator :growth="data.membership?.growth?.new_members" size="sm" />
                <span class="text-xs text-gray-500">{{ getGrowthSummary('membership') }}</span>
              </div>
            </div>
          </div>
          
          <!-- Tombol AI Insight -->
          <div class="absolute -top-2 -right-2 z-30">
            <div class="relative">
              <button 
                @click="toggleInsight('membership')"
                data-insight-trigger
                class="bg-purple-500 hover:bg-purple-600 text-white rounded-full p-1.5 shadow-lg transition-colors group-hover:scale-110"
                title="Lihat Analisis Keanggotaan"
              >
                <UserGroupIcon class="h-3 w-3" />
              </button>
              
              <!-- Popup Analisis Keanggotaan -->
              <div 
                v-if="activeInsight === 'membership'"
                class="insight-popup absolute top-8 right-0 w-72 bg-white rounded-xl shadow-xl border border-gray-200 p-4 z-40"
              >
                <div class="flex items-center justify-between mb-3">
                  <h4 class="font-semibold text-gray-900 flex items-center">
                    <UserGroupIcon class="h-4 w-4 text-purple-500 mr-2" />
                    Analisis Keanggotaan
                  </h4>
                  <button @click="activeInsight = null" class="text-gray-400 hover:text-gray-600">
                    <XMarkIcon class="h-4 w-4" />
                  </button>
                </div>
                
                <div class="space-y-3 text-sm">
                  <div class="p-3 bg-purple-50 rounded-lg">
                    <p class="font-medium text-purple-900 mb-1">👥 Distribusi</p>
                    <p class="text-purple-800">{{ getMembershipDistributionAnalysis() }}</p>
                  </div>
                  
                  <div class="p-3 bg-amber-50 rounded-lg">
                    <p class="font-medium text-amber-900 mb-1">💡 Peluang</p>
                    <p class="text-amber-800">{{ getMembershipOpportunity() }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, h, ref, onMounted, onUnmounted } from 'vue'
import { 
  DocumentTextIcon,
  ShoppingBagIcon,
  CurrencyDollarIcon,
  CalculatorIcon,
  BanknotesIcon,
  ClockIcon,
  UserGroupIcon,
  WrenchScrewdriverIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ArrowPathIcon,
  SparklesIcon,
  XMarkIcon,
  ChartBarIcon,
  EyeIcon
} from '@heroicons/vue/24/outline'
import { formatCurrency, formatNumber, formatPercentage } from '@/utils/formatters'

const props = defineProps({
  data: {
    type: Object,
    default: () => ({})
  },
  loading: {
    type: Boolean,
    default: false
  }
})

// State untuk flipping dan hover details
const revenueFlipped = ref(false)
const activeInsight = ref(null)

// State untuk hover detail amounts
const showFullAccounting = ref(false)
const showFullSales = ref(false)
const showFullAccountBreakdown = ref(false)
const showFullAOV = ref(false)
const showCOGSDetail = ref(false)
// State untuk target detail modals
const showAccountingTargetDetail = ref(false)
const showSalesTargetDetail = ref(false)

// Tutup popup insight ketika klik di luar
const handleClickOutside = (event) => {
  if (activeInsight.value && !event.target.closest('.insight-popup') && !event.target.closest('[data-insight-trigger]')) {
    activeInsight.value = null
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

// Konfigurasi metrik utama
const primaryMetrics = {
  orders: {
    title: 'Jumlah Pesanan',
    icon: ShoppingBagIcon,
    iconColor: 'text-green-600',
    iconBg: 'bg-green-50'
  }
}

// State untuk detail sections
const showAccountingDetail = ref(false)
const showSalesDetail = ref(false)

// Toggle functions
const toggleAccountingDetail = () => {
  showAccountingDetail.value = !showAccountingDetail.value
}

const toggleSalesDetail = () => {
  showSalesDetail.value = !showSalesDetail.value
}

// Helper functions untuk AOV calculations
const getPreviousAOV = () => {
  const prevRevenue = props.data.sales_revenue?.previous || 0
  const prevOrders = props.data.orders?.previous || 1
  return prevRevenue / prevOrders
}

const getAOVChange = () => {
  const currentAOV = getAverageOrderValue()
  const previousAOV = getPreviousAOV()
  return currentAOV - previousAOV
}


// Fungsi utilitas
const toggleInsight = (type) => {
  activeInsight.value = activeInsight.value === type ? null : type
}

const getValue = (key) => {
  const value = props.data[key]?.current || 0
  return key.includes('revenue') || key.includes('average_order') 
    ? formatCompactCurrency(value)
    : formatNumber(value)
}

const getTopAccount = () => {
  const breakdown = props.data.accounting_revenue?.account_breakdown
  if (!breakdown) return { code: 'Tidak ada data', amount: 0 }
  
  const topAccount = Object.values(breakdown)
    .sort((a, b) => b.amount - a.amount)[0]
  
  return topAccount || { code: 'Tidak ada data', amount: 0 }
}

const getAverageOrderValue = () => {
  const revenue = props.data.sales_revenue?.current || 0
  const orders = props.data.orders?.current || 1
  return revenue / orders
}


const flipRevenue = () => {
  revenueFlipped.value = !revenueFlipped.value
}


// Fungsi format mata uang kompak
const formatCompactCurrency = (value) => {
  if (value >= 1e9) {
    return `Rp ${(value / 1e9).toFixed(1)}M`
  } else if (value >= 1e6) {
    return `Rp ${(value / 1e6).toFixed(1)}Jt`
  } else if (value >= 1e3) {
    return `Rp ${(value / 1e3).toFixed(0)}Rb`
  }
  return formatCurrency(value, 0)
}

// ===== ACCOUNTING TARGET FUNCTIONS =====

// Di bagian methods atau computed
const getAccountingProjection = () => {
  const current = props.data.accounting_revenue?.current || 0
  const daysInPeriod = 30 // atau sesuaikan
  const daysPassed = new Date().getDate() // hari yang sudah lewat di bulan ini
  const daysRemaining = daysInPeriod - daysPassed
  
  const dailyAverage = current / daysPassed
  const projection = current + (dailyAverage * daysRemaining)
  
  return projection
}

const getAccountingDailyTarget = () => {
  const target = getAccountingTargetAmount()
  const daysInPeriod = 30
  return target / daysInPeriod
}

const getAccountingDailyActual = () => {
  const current = props.data.accounting_revenue?.current || 0
  const daysPassed = new Date().getDate()
  return current / daysPassed
}

const getAccountingTargetAmount = () => {
  return props.data.accounting_revenue?.target_comparison?.target_amount || 450000000
}

const getAccountingTargetAchievement = () => {
  const achievement = props.data.accounting_revenue?.target_comparison?.achievement_percentage || 0
  return parseFloat(achievement.toFixed(1))
}

const getAccountingTargetStatus = () => {
  const achievement = getAccountingTargetAchievement()
  if (achievement >= 100) return '✓ Tercapai'
  if (achievement >= 95) return 'Hampir'
  if (achievement >= 80) return 'On Track'
  return 'Below'
}

const getAccountingTargetBadgeColor = () => {
  const achievement = getAccountingTargetAchievement()
  if (achievement >= 100) return 'bg-green-100 text-green-700'
  if (achievement >= 95) return 'bg-blue-100 text-blue-700'
  if (achievement >= 80) return 'bg-yellow-100 text-yellow-700'
  return 'bg-red-100 text-red-700'
}

const getAccountingProgressBarColor = () => {
  const achievement = getAccountingTargetAchievement()
  if (achievement >= 100) return 'bg-green-500'
  if (achievement >= 95) return 'bg-blue-500'
  if (achievement >= 80) return 'bg-yellow-500'
  return 'bg-red-500'
}

const getAccountingGapAmount = () => {
  return props.data.accounting_revenue?.target_comparison?.gap_amount || 0
}

// const getAccountingDailyTarget = () => {
//   return props.data.accounting_revenue?.target_comparison?.daily_target || 0
// }

// const getAccountingDailyActual = () => {
//   return props.data.accounting_revenue?.target_comparison?.daily_actual || 0
// }

const openAccountingTargetDetail = () => {
  showAccountingTargetDetail.value = true
}

const closeAccountingTargetDetail = () => {
  showAccountingTargetDetail.value = false
}

// ===== SALES TARGET FUNCTIONS =====
const getSalesTargetAmount = () => {
  return props.data.sales_revenue?.target_comparison?.target_amount || 550000000
}

const getSalesTargetAchievement = () => {
  const achievement = props.data.sales_revenue?.target_comparison?.achievement_percentage || 0
  return parseFloat(achievement.toFixed(1))
}

const getSalesTargetStatus = () => {
  const achievement = getSalesTargetAchievement()
  if (achievement >= 100) return '✓ Tercapai'
  if (achievement >= 95) return 'Hampir'
  if (achievement >= 80) return 'On Track'
  return 'Below'
}

const getSalesTargetBadgeColor = () => {
  const achievement = getSalesTargetAchievement()
  if (achievement >= 100) return 'bg-green-100 text-green-700'
  if (achievement >= 95) return 'bg-blue-100 text-blue-700'
  if (achievement >= 80) return 'bg-yellow-100 text-yellow-700'
  return 'bg-red-100 text-red-700'
}

const getSalesProgressBarColor = () => {
  const achievement = getSalesTargetAchievement()
  if (achievement >= 100) return 'bg-green-500'
  if (achievement >= 95) return 'bg-blue-500'
  if (achievement >= 80) return 'bg-yellow-500'
  return 'bg-red-500'
}

const getSalesGapAmount = () => {
  return props.data.sales_revenue?.target_comparison?.gap_amount || 0
}

const getSalesDailyTarget = () => {
  return props.data.sales_revenue?.target_comparison?.daily_target || 0
}

const getSalesDailyActual = () => {
  return props.data.sales_revenue?.target_comparison?.daily_actual || 0
}

const getSalesProjection = () => {
  const daysInPeriod = props.data.sales_revenue?.target_comparison?.days_in_period || 22
  const dailyActual = getSalesDailyActual()
  const totalDays = 30
  const projection = dailyActual * totalDays
  return projection > 0 ? projection : null
}

const openSalesTargetDetail = () => {
  showSalesTargetDetail.value = true
}

const closeSalesTargetDetail = () => {
  showSalesTargetDetail.value = false
}

// ===== TARGET RECOMMENDATION FUNCTIONS =====
const getAccountingTargetRecommendation = () => {
  const achievement = getAccountingTargetAchievement()
  const gap = Math.abs(getAccountingGapAmount())
  const dailyActual = getAccountingDailyActual()
  const dailyTarget = getAccountingDailyTarget()
  
  if (achievement >= 100) {
    return '🎉 Target tercapai! Pertahankan momentum dan tingkatkan target bulan depan untuk pertumbuhan berkelanjutan.'
  }
  if (achievement >= 95) {
    return `✨ Hampir mencapai target! Hanya kurang ${formatCompactCurrency(gap)}. Fokus pada closing transaksi yang tertunda.`
  }
  if (achievement >= 80) {
    return `📈 On track untuk mencapai target. Pertahankan daily rate ${formatCompactCurrency(dailyActual)} untuk hasil optimal.`
  }
  if (dailyActual < dailyTarget) {
    return `⚠️ Daily actual (${formatCompactCurrency(dailyActual)}) di bawah target (${formatCompactCurrency(dailyTarget)}). Tingkatkan aktivitas penjualan harian.`
  }
  return `🚨 Perlu akselerasi signifikan. Gap ${formatCompactCurrency(gap)} memerlukan strategi intensif untuk mencapai target.`
}

const getSalesTargetRecommendation = () => {
  const achievement = getSalesTargetAchievement()
  const gap = Math.abs(getSalesGapAmount())
  const dailyActual = getSalesDailyActual()
  const dailyTarget = getSalesDailyTarget()
  const projection = getSalesProjection()
  
  if (achievement >= 100) {
    return '🎉 Target tercapai! Evaluasi untuk set target lebih tinggi bulan depan dan identifikasi faktor sukses untuk replikasi.'
  }
  if (achievement >= 95) {
    return `✨ Sangat dekat dengan target! Gap ${formatCompactCurrency(gap)} bisa ditutup dengan push sales di minggu terakhir.`
  }
  if (achievement >= 80 && projection >= getSalesTargetAmount()) {
    return `📈 Proyeksi positif ${formatCompactCurrency(projection)}. Maintain daily rate untuk mencapai target akhir bulan.`
  }
  if (achievement >= 80) {
    return `⚡ On track tapi perlu boost. Tingkatkan daily dari ${formatCompactCurrency(dailyActual)} ke ${formatCompactCurrency(dailyTarget)} minimal.`
  }
  if (dailyActual < dailyTarget * 0.7) {
    return `🚨 Daily actual terlalu rendah (${formatCompactCurrency(dailyActual)} vs target ${formatCompactCurrency(dailyTarget)}). Butuh intervention strategi penjualan segera.`
  }
  return `⚠️ Gap signifikan ${formatCompactCurrency(gap)}. Review pricing, promosi, dan sales pipeline untuk recovery.`
}


// Fungsi ringkasan pertumbuhan dalam bahasa Indonesia
const getGrowthSummary = (metric) => {
  let growth = 0
  
  switch (metric) {
    case 'orders':
      growth = props.data.orders?.growth || 0
      break
    case 'average_order':
      growth = props.data.average_order?.growth || 0
      break
    case 'flat_rate':
      growth = props.data.flat_rate?.growth || 0
      break
    case 'cogs':
      growth = props.data.cogs?.growth || 0
      break
    case 'lead_time':
      growth = props.data.lead_time?.growth?.avg_lead_time || 0
      break
    case 'detailed_lead_time':
      growth = props.data.lead_time?.growth?.avg_lead_time || 0
      break
    case 'membership':
      growth = props.data.membership?.growth?.new_members || 0
      break
    default:
      return 'Stabil'
  }
  
  if (growth > 15) return 'Sangat Baik'
  if (growth > 5) return 'Meningkat'
  if (growth > -5) return 'Stabil'
  if (growth > -15) return 'Menurun'
  return 'Perlu Perhatian'
}

// Fungsi nama level dalam bahasa Indonesia
const getLevelName = (level) => {
  const names = {
    bronze: 'Perunggu',
    silver: 'Perak',
    gold: 'Emas',
    platinum: 'Platinum'
  }
  return names[level] || level
}

// Fungsi analisis AI dalam bahasa Indonesia
const getOrdersInsight = () => {
  const orders = props.data.orders?.current || 0
  const growth = props.data.orders?.growth || 0
  
  if (orders === 0) return "Tidak ada pesanan yang tercatat pada periode ini"
  if (growth > 15) return `Pertumbuhan yang kuat dengan ${orders} pesanan (+${growth.toFixed(1)}%)`
  if (growth > 5) return `Peningkatan stabil dengan ${orders} pesanan (+${growth.toFixed(1)}%)`
  if (growth > -5) return `Kinerja stabil dengan ${orders} pesanan`
  return `Tren menurun dengan ${orders} pesanan (${growth.toFixed(1)}%)`
}

const getOrdersRecommendation = () => {
  const orders = props.data.orders?.current || 0
  const growth = props.data.orders?.growth || 0
  
  if (growth < -10) return "Fokus pada retensi pelanggan dan kampanye pemasaran"
  if (growth < 0) return "Tinjau strategi harga dan kualitas layanan"
  if (growth < 5) return "Pertimbangkan aktivitas promosi untuk meningkatkan pesanan"
  return "Pertahankan strategi saat ini dan bersiap untuk ekspansi"
}

const getAccountingRevenueStatus = () => {
  const growth = props.data.accounting_revenue?.growth || 0
  
  if (growth > 10) return "Pertumbuhan pendapatan akuntansi yang kuat"
  if (growth > 0) return "Tren pendapatan positif tercatat"
  if (growth > -5) return "Pendapatan relatif stabil"
  return "Pendapatan menunjukkan penurunan"
}

const getSalesRevenueStatus = () => {
  const growth = props.data.sales_revenue?.growth || 0
  
  if (growth > 10) return "Kinerja penjualan yang sangat baik"
  if (growth > 0) return "Pendapatan penjualan bertumbuh"
  if (growth > -5) return "Penjualan tetap stabil"
  return "Pendapatan penjualan menurun"
}

const getServicePerformanceStatus = () => {
  const leadTime = props.data.lead_time?.current?.avg_lead_time || 0
  const onTimeRate = props.data.lead_time?.current?.on_time_rate || 0
  
  if (leadTime <= 2 && onTimeRate >= 80) return "Efisiensi layanan sangat baik"
  if (leadTime <= 3 && onTimeRate >= 70) return "Kinerja layanan baik"
  if (leadTime <= 4 && onTimeRate >= 60) return "Tingkat kinerja rata-rata"
  return "Efisiensi layanan perlu perbaikan"
}

const getRevenueComparison = () => {
  const salesRevenue = props.data.sales_revenue?.current || 0
  const accountingRevenue = props.data.accounting_revenue?.current || 0
  
  const difference = Math.abs(accountingRevenue - salesRevenue)
  const percentDiff = (difference / Math.max(salesRevenue, 1)) * 100
  
  if (percentDiff < 5) return "Pendapatan penjualan dan akuntansi selaras dengan baik"
  if (accountingRevenue > salesRevenue) return "Pendapatan akuntansi lebih tinggi - periksa akrual atau pembayaran di muka"
  return "Pendapatan penjualan lebih tinggi - verifikasi semua transaksi tercatat"
}

const getRevenuePerformance = () => {
  const salesGrowth = props.data.sales_revenue?.growth || 0
  const accountingGrowth = props.data.accounting_revenue?.growth || 0
  const avgGrowth = (salesGrowth + accountingGrowth) / 2
  
  if (avgGrowth > 15) return "Kinerja pendapatan luar biasa di kedua metrik"
  if (avgGrowth > 5) return "Tren pertumbuhan pendapatan yang solid dipertahankan"
  if (avgGrowth > -5) return "Kinerja pendapatan tetap stabil"
  return "Pendapatan menunjukkan penurunan yang mengkhawatirkan - diperlukan tindakan"
}

const getRevenueActionItems = () => {
  const salesGrowth = props.data.sales_revenue?.growth || 0
  const orders = props.data.orders?.current || 0
  
  if (salesGrowth < -10) return "Mendesak: Tinjau strategi harga, pemasaran, dan retensi pelanggan"
  if (salesGrowth < 0) return "Pantau kepuasan pelanggan dan posisi kompetitif"
  if (orders < 300) return "Fokus pada generasi prospek dan optimisasi konversi"
  return "Lanjutkan memantau tren dan siapkan strategi pertumbuhan"
}

const getLeadTimeAnalysis = () => {
  const leadTime = props.data.lead_time?.current?.avg_lead_time || 0
  
  if (leadTime <= 2) return `Waktu tunggu ${leadTime.toFixed(1)} jam sangat baik - memimpin industri`
  if (leadTime <= 3) return `Waktu tunggu ${leadTime.toFixed(1)} jam baik - memenuhi standar`
  if (leadTime <= 4) return `Waktu tunggu ${leadTime.toFixed(1)} jam rata-rata - ada ruang perbaikan`
  return `Waktu tunggu ${leadTime.toFixed(1)} jam tinggi - perlu optimisasi`
}

const getOnTimeAnalysis = () => {
  const onTimeRate = props.data.lead_time?.current?.on_time_rate || 0
  const completedOrders = props.data.lead_time?.current?.completed_orders || 0
  
  if (onTimeRate >= 90) return `Pengiriman tepat waktu ${onTimeRate.toFixed(0)}% sangat baik dari ${completedOrders} pesanan`
  if (onTimeRate >= 80) return `Tingkat tepat waktu ${onTimeRate.toFixed(0)}% baik dengan ${completedOrders} pesanan selesai`
  if (onTimeRate >= 70) return `Kinerja tepat waktu ${onTimeRate.toFixed(0)}% rata-rata - bisa diperbaiki`
  return `Tingkat tepat waktu ${onTimeRate.toFixed(0)}% rendah - perlu perhatian segera`
}

const getServiceOptimization = () => {
  const leadTime = props.data.lead_time?.current?.avg_lead_time || 0
  const overnightRate = props.data.lead_time?.current?.overnight_rate || 0
  
  if (overnightRate > 10) return "Kurangi pekerjaan menginap melalui penjadwalan dan alokasi sumber daya yang lebih baik"
  if (leadTime > 3) return "Sederhanakan proses untuk mengurangi waktu tunggu rata-rata"
  if (leadTime < 2) return "Pertahankan proses efisien saat ini dan pertimbangkan ekspansi kapasitas"
  return "Seimbangkan kecepatan dengan kualitas - optimisasi efisiensi alur kerja"
}

// Fungsi untuk analitik lanjutan
const getAOVStatus = () => {
  const aov = props.data.average_order?.current || 0
  const growth = props.data.average_order?.growth || 0
  
  if (aov >= 1000000) return "Transaksi bernilai tinggi dipertahankan"
  if (growth > 5) return "Nilai rata-rata pesanan menunjukkan pertumbuhan positif"
  if (growth > -5) return "Nilai rata-rata pesanan tetap stabil"
  return "Nilai rata-rata pesanan menurun - tinjau harga"
}

const getAOVAnalysis = () => {
  const aov = props.data.average_order?.current || 0
  const orders = props.data.orders?.current || 0
  
  if (aov > 1500000) return `Nilai rata-rata pesanan ${formatCompactCurrency(aov)} sangat baik menunjukkan posisi layanan premium`
  if (aov > 1000000) return `Nilai rata-rata pesanan ${formatCompactCurrency(aov)} baik dengan ${orders} pesanan menunjukkan nilai transaksi yang sehat`
  if (aov > 500000) return `Nilai rata-rata pesanan ${formatCompactCurrency(aov)} rata-rata - ada peluang untuk penjualan tambahan`
  return `Nilai rata-rata pesanan ${formatCompactCurrency(aov)} rendah - fokus pada layanan bernilai tambah`
}

const getAOVStrategy = () => {
  const growth = props.data.average_order?.growth || 0
  const aov = props.data.average_order?.current || 0
  
  if (growth < -10) return "Terapkan strategi bundling dan paket layanan premium"
  if (aov < 800000) return "Perkenalkan pelatihan upselling dan layanan pelengkap"
  if (growth > 10) return "Lanjutkan strategi harga saat ini dan perluas penawaran premium"
  return "Pertahankan daya saing harga sambil menambah layanan berbasis nilai"
}

const getFlatRateStatus = () => {
  const growth = props.data.flat_rate?.growth || 0
  
  if (growth < -15) return "Peningkatan efisiensi yang signifikan"
  if (growth < -5) return "Optimisasi efisiensi yang baik"
  if (growth < 5) return "Kinerja flat rate stabil"
  return "Kompleksitas layanan meningkat"
}

const getFlatRateAnalysis = () => {
  const currentHours = props.data.flat_rate?.current_hours || 0
  const previousHours = props.data.flat_rate?.previous_hours || 0
  const orders = props.data.orders?.current || 0
  
  const avgHoursPerOrder = orders > 0 ? (currentHours / orders).toFixed(1) : 0
  
  return `${currentHours.toFixed(1)} total jam dengan rata-rata ${avgHoursPerOrder} jam per pesanan. ${currentHours > previousHours ? 'Kompleksitas meningkat' : 'Efisiensi membaik'} dibanding periode sebelumnya`
}

const getFlatRateOptimization = () => {
  const growth = props.data.flat_rate?.growth || 0
  
  if (growth > 15) return "Tinjau kompleksitas layanan dan pertimbangkan optimisasi proses"
  if (growth > 5) return "Pantau waktu layanan dan pastikan alokasi sumber daya yang tepat"
  if (growth < -10) return "Peningkatan efisiensi sangat baik - dokumentasikan praktik terbaik"
  return "Pertahankan tingkat efisiensi saat ini dan latih tim tentang prosedur standar"
}

const getAdvancedServiceStatus = () => {
  const leadTime = props.data.lead_time?.current?.avg_lead_time || 0
  const onTimeRate = props.data.lead_time?.current?.on_time_rate || 0
  const overnightRate = props.data.lead_time?.current?.overnight_rate || 0
  
  if (leadTime <= 2 && onTimeRate >= 85) return "Pengiriman layanan premium"
  if (leadTime <= 3 && onTimeRate >= 75) return "Standar layanan yang baik"
  if (overnightRate > 8) return "Tingkat pekerjaan menginap tinggi"
  return "Efisiensi layanan perlu perhatian"
}

const getDetailedLeadTimeAnalysis = () => {
  const leadTime = props.data.lead_time?.current?.avg_lead_time || 0
  const serviceTime = props.data.lead_time?.current?.avg_service_time || 0
  const overallTime = props.data.lead_time?.current?.avg_overall_time || 0
  
  return `Tunggu: ${leadTime.toFixed(1)}j, Layanan: ${serviceTime.toFixed(1)}j, Keseluruhan: ${overallTime.toFixed(1)}j. ${leadTime < serviceTime ? 'Proses penerimaan efisien' : 'Ada keterlambatan dalam inisiasi layanan'}`
}

const getEfficiencyTrends = () => {
  const leadTimeGrowth = props.data.lead_time?.growth?.avg_lead_time || 0
  const onTimeGrowth = props.data.lead_time?.growth?.on_time_rate || 0
  
  if (leadTimeGrowth < -10 && onTimeGrowth > 5) return "Peningkatan luar biasa dalam kecepatan dan keandalan"
  if (leadTimeGrowth > 15) return "Waktu tunggu meningkat - investigasi kemacetan"
  if (onTimeGrowth < -10) return "Kinerja tepat waktu menurun - tinjau penjadwalan"
  return "Tren kinerja campuran - fokus pada konsistensi"
}

const getServiceActionItems = () => {
  const overnightRate = props.data.lead_time?.current?.overnight_rate || 0
  const onTimeRate = props.data.lead_time?.current?.on_time_rate || 0
  const leadTime = props.data.lead_time?.current?.avg_lead_time || 0
  
  if (overnightRate > 10) return "Kurangi pekerjaan menginap melalui penjadwalan dan perencanaan sumber daya yang lebih baik"
  if (onTimeRate < 70) return "Fokus segera pada peningkatan tingkat pengiriman tepat waktu"
  if (leadTime > 4) return "Sederhanakan proses untuk mengurangi waktu tunggu pelanggan"
  return "Lanjutkan pemantauan dan pertahankan keunggulan layanan saat ini"
}

const getMembershipStatus = () => {
  const totalMembers = props.data.membership?.total_members || 0
  const distribution = props.data.membership?.level_distribution || {}
  const bronzeRate = distribution.bronze?.percentage || 0
  
  if (totalMembers > 5000) return "Basis keanggotaan yang kuat telah terbentuk"
  if (bronzeRate > 95) return "Sebagian besar anggota di tingkat pemula"
  if (totalMembers < 1000) return "Program keanggotaan sedang berkembang"
  return "Distribusi keanggotaan yang sehat"
}

const getMembershipDistributionAnalysis = () => {
  const distribution = props.data.membership?.level_distribution || {}
  const totalMembers = props.data.membership?.total_members || 0
  const premiumMembers = (distribution.gold?.count || 0) + (distribution.platinum?.count || 0)
  const premiumRate = totalMembers > 0 ? (premiumMembers / totalMembers * 100).toFixed(1) : 0
  
  return `${premiumRate}% anggota premium (Emas + Platinum) dari ${totalMembers} total. ${premiumRate > 5 ? 'Konversi premium yang baik' : 'Peluang untuk upgrade tingkat'}`
}

const getMembershipOpportunity = () => {
  const distribution = props.data.membership?.level_distribution || {}
  const bronzeCount = distribution.bronze?.count || 0
  const silverCount = distribution.silver?.count || 0
  
  if (bronzeCount > silverCount * 10) return "Fokus pada kampanye upgrade perunggu-ke-perak dengan manfaat yang tepat sasaran"
  if (silverCount > 100) return "Kembangkan insentif upgrade tingkat emas untuk anggota perak"
  return "Terapkan program reward bertingkat untuk mendorong peningkatan level"
}

const getLevelEmoji = (level) => {
  const emojis = {
    bronze: '🥉',
    silver: '🥈', 
    gold: '🥇',
    platinum: '💎'
  }
  return emojis[level] || '👤'
}

const getLevelIcon = (level) => {
  const colors = {
    bronze: 'text-amber-600',
    silver: 'text-gray-600',
    gold: 'text-yellow-500',
    platinum: 'text-purple-600'
  }
  return colors[level] || 'text-gray-500'
}

const getCOGSEfficiency = () => {
  const change = props.data.cogs?.percentage_of_revenue?.change || 0
  
  if (change <= -2) return "Efisiensi Sangat Baik"
  if (change <= -0.5) return "Efisiensi Membaik"
  if (change <= 0.5) return "Stabil"
  if (change <= 2) return "Sedikit Menurun"
  return "Perlu Perhatian"
}

const getCOGSRatioStatus = () => {
  const currentRatio = props.data.cogs?.percentage_of_revenue?.current || 0
  const change = props.data.cogs?.percentage_of_revenue?.change || 0
  
  if (currentRatio <= 35 && change <= 0) return "Rasio COGS optimal dan efisien"
  if (currentRatio <= 40 && change <= 0) return "Kontrol biaya yang baik"
  if (currentRatio <= 45) return "Rasio COGS dalam batas wajar"
  if (change > 2) return "Kenaikan rasio COGS perlu perhatian"
  return "Efisiensi biaya perlu ditingkatkan"
}

const getCOGSRatioAnalysis = () => {
  const currentRatio = props.data.cogs?.percentage_of_revenue?.current || 0
  const change = props.data.cogs?.percentage_of_revenue?.change || 0
  const cogsAmount = props.data.cogs?.current || 0
  
  if (change <= -1) {
    return `Rasio COGS ${currentRatio.toFixed(1)}% membaik ${Math.abs(change).toFixed(2)}% dari periode sebelumnya - efisiensi operasional meningkat`
  }
  if (change >= 2) {
    return `Rasio COGS naik ${change.toFixed(2)}% menjadi ${currentRatio.toFixed(1)}% - perlu review supplier dan proses`
  }
  if (currentRatio > 50) {
    return `Rasio COGS ${currentRatio.toFixed(1)}% tinggi dengan biaya ${formatCompactCurrency(cogsAmount)} - optimisasi mendesak diperlukan`
  }
  return `Rasio COGS ${currentRatio.toFixed(1)}% stabil menunjukkan kontrol biaya yang konsisten`
}

const getProfitabilityImpact = () => {
  const grossMargin = props.data.gross_profit?.current_margin || 0
  const marginChange = props.data.gross_profit?.margin_change || 0
  const cogsChange = props.data.cogs?.percentage_of_revenue?.change || 0
  
  if (marginChange > 2) {
    return `Gross profit margin meningkat ${marginChange.toFixed(1)}% menjadi ${grossMargin.toFixed(1)}% - profitabilitas membaik signifikan`
  }
  if (marginChange < -2) {
    return `Gross profit margin turun ${Math.abs(marginChange).toFixed(1)}% menjadi ${grossMargin.toFixed(1)}% - dampak negatif pada profitabilitas`
  }
  if (cogsChange <= 0 && marginChange >= 0) {
    return `Margin ${grossMargin.toFixed(1)}% stabil dengan efisiensi COGS yang baik - kinerja profitabilitas solid`
  }
  return `Margin ${grossMargin.toFixed(1)}% dengan perubahan ${marginChange.toFixed(1)}% - monitoring profitabilitas diperlukan`
}

const getCOGSOptimizationRecommendation = () => {
  const currentRatio = props.data.cogs?.percentage_of_revenue?.current || 0
  const change = props.data.cogs?.percentage_of_revenue?.change || 0
  
  if (change > 3) return "Prioritas tinggi: Review kontrak supplier dan negosiasi ulang harga parts"
  if (currentRatio > 50) return "Implementasi lean operations dan audit biaya comprehensive"
  if (currentRatio > 45) return "Optimisasi inventory management dan supplier relationship"
  if (change > 1) return "Monitor tren biaya dan evaluasi pricing strategy"
  if (currentRatio < 35) return "Pertahankan efisiensi saat ini dan eksplorasi margin improvement"
  return "Lanjutkan monitoring cost control dan cari peluang optimisasi berkelanjutan"
}

const getCOGSRatioEfficiency = () => {
  const change = props.data.cogs?.percentage_of_revenue?.change || 0
  
  if (change <= -2) return "Rasio Sangat Membaik"
  if (change <= -0.5) return "Rasio Membaik"
  if (change <= 0.5) return "Rasio Stabil"
  if (change <= 2) return "Rasio Sedikit Naik"
  return "Rasio Naik Signifikan"
}

const openCOGSDetail = () => {
  console.log('Opening COGS Detail Modal') // Debug log
  showCOGSDetail.value = true
}

const closeCOGSDetail = () => {
  console.log('Closing COGS Detail Modal') // Debug log
  showCOGSDetail.value = false
}

// Fungsi-fungsi COGS untuk KeyMetrics
const getCOGSStatus = () => {
  const growth = props.data.cogs?.growth || 0
  const current = props.data.cogs?.current || 0
  
  if (current === 0) return "Tidak ada data COGS"
  if (growth < -10) return "Efisiensi biaya sangat baik"
  if (growth < -5) return "Penurunan biaya yang baik" 
  if (growth < 5) return "Biaya produksi stabil"
  if (growth < 15) return "Kenaikan biaya moderat"
  return "Kenaikan biaya signifikan - perlu perhatian"
}

const getCOGSAnalysis = () => {
  const current = props.data.cogs?.current || 0
  const growth = props.data.cogs?.growth || 0
  const revenue = props.data.sales_revenue?.current || 1
  
  const cogsRatio = (current / revenue * 100).toFixed(1)
  
  if (growth > 15) return `COGS ${formatCompactCurrency(current)} naik ${growth.toFixed(1)}% - review supplier dan efisiensi`
  if (growth > 5) return `COGS ${formatCompactCurrency(current)} (${cogsRatio}% dari revenue) naik moderat`
  if (growth < -10) return `COGS ${formatCompactCurrency(current)} turun signifikan - optimisasi berhasil`
  return `COGS ${formatCompactCurrency(current)} stabil pada ${cogsRatio}% dari revenue`
}

const getCOGSOptimization = () => {
  const categories = props.data.cogs?.categories || {}
  const partsAmount = categories.parts_and_materials?.amount || 0
  const otherAmount = categories.other_direct_costs?.amount || 0
  const total = props.data.cogs?.current || 1
  
  const partsRatio = (partsAmount / total * 100).toFixed(1)
  const otherRatio = (otherAmount / total * 100).toFixed(1)
  
  if (partsRatio > 60) return "Fokus negosiasi harga parts - porsi terbesar dalam COGS"
  if (otherRatio > 60) return "Review efisiensi operasional - biaya langsung lain dominan"
  return `Distribusi biaya seimbang: Parts ${partsRatio}%, Lainnya ${otherRatio}%`
}

</script>

<script>
// Komponen MetricCard - Dioptimalkan untuk angka panjang
const MetricCard = {
  props: {
    title: String,
    value: [String, Number],
    icon: Object,
    iconColor: String,
    iconBg: String,
    growth: Number,
    growthSummary: String,
    loading: Boolean
  },
  setup(props) {
    return () => {
      if (props.loading) {
        return h('div', {
          class: 'bg-white rounded-2xl shadow-sm border border-slate-200 p-6 animate-pulse h-full'
        }, [
          h('div', { class: 'flex items-center space-x-3 mb-4' }, [
            h('div', { class: 'h-10 w-10 bg-gray-200 rounded-lg' }),
            h('div', { class: 'flex-1' }, [
              h('div', { class: 'h-4 bg-gray-200 rounded w-24 mb-2' }),
              h('div', { class: 'h-3 bg-gray-200 rounded w-16' })
            ])
          ]),
          h('div', { class: 'space-y-3' }, [
            h('div', { class: 'h-8 bg-gray-200 rounded w-32' }),
            h('div', { class: 'h-4 bg-gray-200 rounded w-20' })
          ])
        ])
      }

      return h('div', {
        class: `bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300
                border border-slate-200 p-6 relative overflow-hidden group
                hover:border-slate-300 h-full`
      }, [
        // Konten
        h('div', { class: 'flex flex-col h-full relative z-10' }, [
          // Header dengan ikon dan title
          h('div', { class: 'flex items-center space-x-3 mb-4' }, [
            h('div', {
              class: `${props.iconBg} p-2 rounded-lg transition-all duration-300 
                     group-hover:scale-110 flex-shrink-0`
            }, [
              h(props.icon, {
                class: `h-5 w-5 ${props.iconColor}`
              })
            ]),
            h('div', { class: 'min-w-0 flex-1' }, [
              h('p', {
                class: 'text-sm font-medium text-gray-900 truncate'
              }, props.title),
              h('p', {
                class: 'text-xs text-gray-500'
              }, 'Periode saat ini')
            ])
          ]),
          
          // Bagian nilai - flex-1 untuk mengambil ruang tersisa
          h('div', { class: 'flex-1 flex flex-col justify-center' }, [
            h('p', {
              class: 'text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900 tracking-tight mb-2 break-all'
            }, props.value)
          ]),
          
          // Indikator pertumbuhan di bagian bawah dengan ringkasan
          h('div', { class: 'mt-auto pt-3 border-t border-gray-100' }, [
            h('div', { class: 'flex items-center justify-between' }, [
              h(GrowthIndicator, {
                growth: props.growth,
                size: 'sm'
              }),
              h('span', {
                class: 'text-xs text-gray-500 font-medium'
              }, props.growthSummary || 'Stabil')
            ])
          ])
        ]),
        
        // Efek gradien latar belakang
        h('div', {
          class: `absolute inset-0 bg-gradient-to-br from-transparent to-slate-50/50 
                 opacity-0 group-hover:opacity-100 transition-opacity duration-300`
        })
      ])
    }
  }
}

// Komponen GrowthIndicator
const GrowthIndicator = {
  props: {
    growth: Number,
    size: {
      type: String,
      default: 'md'
    }
  },
  setup(props) {
    const sizeClasses = {
      sm: 'text-xs',
      md: 'text-sm'
    }
    
    const iconSizeClasses = {
      sm: 'h-3 w-3',
      md: 'h-4 w-4'
    }

    return () => {
      const growth = props.growth || 0
      const isPositive = growth >= 0
      
      return h('div', {
        class: `flex items-center ${sizeClasses[props.size]}`
      }, [
        h(isPositive ? ArrowTrendingUpIcon : ArrowTrendingDownIcon, {
          class: `${iconSizeClasses[props.size]} mr-1 ${isPositive ? 'text-emerald-500' : 'text-red-500'}`
        }),
        h('span', {
          class: `font-medium ${isPositive ? 'text-emerald-600' : 'text-red-600'}`
        }, formatPercentage(growth)),
        h('span', {
          class: 'text-gray-500 ml-1'
        }, props.size === 'sm' ? '' : 'vs sebelumnya')
      ])
    }
  }
}
</script>

<style scoped>
/* === COMPLETE STYLES === */

/* Custom scrollbar untuk breakdown - Emerald theme */
.custom-scroll-emerald {
  scrollbar-width: thin;
  scrollbar-color: #10b981 #f0fdf4;
}

.custom-scroll-emerald::-webkit-scrollbar {
  width: 6px;
}

.custom-scroll-emerald::-webkit-scrollbar-track {
  background: #f0fdf4;
  border-radius: 3px;
}

.custom-scroll-emerald::-webkit-scrollbar-thumb {
  background: #10b981;
  border-radius: 3px;
}

.custom-scroll-emerald::-webkit-scrollbar-thumb:hover {
  background: #059669;
}

/* Responsive adjustments */
@media (max-width: 1024px) {
  .grid.lg\:grid-cols-2 {
    grid-template-columns: 1fr;
  }
  
  .max-w-6xl {
    max-width: 95vw;
  }
}

/* Smooth transitions untuk text size changes */
.revenue-text {
  transition: font-size 0.3s ease-in-out, line-height 0.3s ease-in-out;
}

/* Custom scrollbar untuk breakdown details - Accounting */
.breakdown-scroll-accounting::-webkit-scrollbar {
  width: 6px;
}

.breakdown-scroll-accounting::-webkit-scrollbar-track {
  background: #ecfdf5;
  border-radius: 3px;
}

.breakdown-scroll-accounting::-webkit-scrollbar-thumb {
  background: #a7f3d0;
  border-radius: 3px;
}

.breakdown-scroll-accounting::-webkit-scrollbar-thumb:hover {
  background: #6ee7b7;
}

/* Custom scrollbar untuk breakdown details - General */
.breakdown-scroll::-webkit-scrollbar {
  width: 4px;
}

.breakdown-scroll::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 2px;
}

.breakdown-scroll::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 2px;
}

.breakdown-scroll::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Shimmer animation untuk progress bar */
@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.animate-shimmer {
  animation: shimmer 2s infinite;
}

/* === POPUP OVERLAY STYLES - COMPACT & ELEGANT === */


@keyframes fadeInOverlay {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* === MODAL CONTAINER SIZING === */
.accounting-modal-container {
  max-width: 1600px;
}

@media (min-width: 1536px) {
  .accounting-modal-container {
    max-width: 1400px;
  }
}

@media (min-width: 1280px) and (max-width: 1535px) {
  .accounting-modal-container {
    max-width: 1200px;
  }
}

@media (min-width: 1024px) and (max-width: 1279px) {
  .accounting-modal-container {
    max-width: 1000px;
  }
}

@media (max-width: 1023px) {
  .accounting-modal-container {
    max-width: 95vw;
    height: 92vh;
  }
}

@media (max-width: 640px) {
  .accounting-modal-container {
    max-width: 100vw;
    height: 100vh;
    border-radius: 0;
  }
}

/* === CUSTOM SCROLLBAR - EMERALD === */
.custom-scroll-emerald {
  scrollbar-width: thin;
  scrollbar-color: #10b981 #f0fdf4;
}

.custom-scroll-emerald::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.custom-scroll-emerald::-webkit-scrollbar-track {
  background: #f0fdf4;
  border-radius: 3px;
}

.custom-scroll-emerald::-webkit-scrollbar-thumb {
  background: #10b981;
  border-radius: 3px;
}

.custom-scroll-emerald::-webkit-scrollbar-thumb:hover {
  background: #059669;
}

/* === ANIMATIONS === */
@keyframes fadeInOverlay {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes popupSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Apply animation to modal content */
.accounting-modal-container {
  animation: popupSlideIn 0.3s ease-out;
}

/* === UTILITY CLASSES === */
.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.leading-relaxed {
  line-height: 1.625;
}


@keyframes popupSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* === COMPACT EMERALD SCROLLBAR === */
.custom-scroll-emerald::-webkit-scrollbar {
  width: 4px;
}

.custom-scroll-emerald::-webkit-scrollbar-track {
  background: #f9fafb;
  border-radius: 2px;
}

.custom-scroll-emerald::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 2px;
}

.custom-scroll-emerald::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

/* === RESPONSIVE POPUP - COMPACT === */
@media (max-width: 768px) {
  .fixed.inset-0.z-50 > div {
    max-width: 95vw;
    max-height: 90vh;
    padding: 1rem;
  }
  
  /* Smaller spacing on mobile */
  .space-y-2 > * + * {
    margin-top: 0.25rem;
  }
  
  /* Single column grid on mobile */
  .grid.grid-cols-2 {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
}

@media (max-width: 640px) {
  .fixed.inset-0.z-50 > div {
    padding: 0.75rem;
  }
  
  /* Smaller fonts on mobile */
  .text-xl {
    font-size: 1.125rem;
    line-height: 1.75rem;
  }
  
  .text-lg {
    font-size: 1rem;
    line-height: 1.5rem;
  }
}

/* === COMPACT BUTTON STYLES === */
.hover\:bg-gray-100:hover {
  background-color: #f3f4f6;
}

/* === COMPACT BADGE STYLES === */
.px-1\.5 {
  padding-left: 0.375rem;
  padding-right: 0.375rem;
}

.py-0\.5 {
  padding-top: 0.125rem;
  padding-bottom: 0.125rem;
}

/* === SUBTLE GRADIENTS === */
.bg-gradient-to-r.from-emerald-500.to-emerald-600 {
  background: linear-gradient(to right, #10b981, #059669);
}

/* === COMPACT SPACING === */
.max-h-\[85vh\] {
  max-height: 85vh;
}

/* === CLEAN BORDERS === */
.border-gray-100 {
  border-color: #f3f4f6;
}

.border-gray-200 {
  border-color: #e5e7eb;
}

.border-emerald-100 {
  border-color: #d1fae5;
}

.border-emerald-200 {
  border-color: #a7f3d0;
}

/* === HOVER EFFECTS === */
.hover\:bg-emerald-50:hover {
  background-color: #ecfdf5;
}

.transition-colors {
  transition-property: color, background-color, border-color;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

/* === EMERALD BACKGROUND === */
.bg-emerald-25 {
  background-color: #f0fdf4;
}

/* Animation untuk detail sections - Sales Card */
.detail-section {
  animation: slideDown 0.3s ease-out;
  max-height: 300px;
  overflow: hidden;
}

@keyframes slideDown {
  from {
    opacity: 0;
    max-height: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    max-height: 300px;
    transform: translateY(0);
  }
}

/* === FLIP CARD CORE STYLES === */
.flip-card-container {
  perspective: 1000px;
}

.flip-card {
  transform-style: preserve-3d;
}

.flip-card-face {
  backface-visibility: hidden;
}

.flip-card-back {
  transform: rotateY(180deg);
}

.rotate-y-180 {
  transform: rotateY(180deg);
}

.backface-hidden {
  backface-visibility: hidden;
}

.transform-style-preserve-3d {
  transform-style: preserve-3d;
}

/* === BACKGROUND COLORS === */
.bg-emerald-25 {
  background-color: #f0fdf4;
}

.bg-purple-25 {
  background-color: #faf5ff;
}

/* Hover state untuk accounting breakdown items */
.hover\:bg-emerald-25:hover {
  background-color: #f0fdf4;
}

/* === ENHANCED SHADOW EFFECTS === */
.insight-popup {
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

/* === FLIP INDICATOR ANIMATION === */
.flip-card-container:hover .flip-indicator {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

/* === CURRENCY TEXT HANDLING === */
.currency-text {
  word-break: break-all;
  hyphens: auto;
  line-height: 1.3;
}

/* === POPUP INSIGHT ANIMATION === */
.insight-popup {
  animation: slideInDown 0.3s ease-out;
}

@keyframes slideInDown {
  from {
    opacity: 0;
    transform: translateY(-10px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* === RESPONSIVE DESIGN === */
@media (max-width: 640px) {
  .revenue-text {
    font-size: 1.125rem;
    line-height: 1.5rem;
  }
  
  .revenue-text.text-lg {
    font-size: 1rem;
    line-height: 1.5rem;
  }
  
  .insight-popup {
    position: fixed !important;
    top: 50% !important;
    left: 50% !important;
    transform: translate(-50%, -50%) !important;
    width: 90vw !important;
    max-width: 320px !important;
    max-height: 80vh !important;
    overflow-y: auto;
    z-index: 50 !important;
  }
  
  /* Smaller breakdown sections on mobile */
  .detail-section-accounting {
    max-height: 250px;
  }
  
  .breakdown-scroll-accounting {
    max-height: 120px;
  }
}

@media (min-width: 641px) and (max-width: 1024px) {
  .revenue-text {
    font-size: 1.25rem;
    line-height: 1.75rem;
  }
  
  .revenue-text.text-xl {
    font-size: 1.125rem;
    line-height: 1.75rem;
  }
}

/* === HOVER EFFECTS === */
.hover\:bg-emerald-100:hover {
  background-color: #d1fae5;
}

.hover\:bg-purple-50:hover {
  background-color: #faf5ff;
}

/* === FOCUS STATES FOR ACCESSIBILITY === */
button:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* === ICON ROTATION === */
.rotate-180 {
  transform: rotate(180deg);
}

/* === TRANSITION EFFECTS === */
.transition-colors {
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.transition-transform {
  transition-property: transform;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

/* === SPECIFIC ACCOUNTING BREAKDOWN STYLING === */
.detail-section-accounting .bg-white {
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
}

.detail-section-accounting .border-emerald-100 {
  border-color: #d1fae5;
}

.detail-section-accounting .border-emerald-200 {
  border-color: #a7f3d0;
}

.detail-section-accounting .border-emerald-300 {
  border-color: #6ee7b7;
}

/* === TEXT UTILITIES === */
.leading-tight {
  line-height: 1.25;
}

.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.whitespace-nowrap {
  white-space: nowrap;
}

/* === CARD BACKGROUND GRADIENTS === */
.bg-gradient-to-br {
  background-image: linear-gradient(to bottom right, var(--tw-gradient-stops));
}

.from-transparent {
  --tw-gradient-from: transparent;
  --tw-gradient-to: rgb(0 0 0 / 0);
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);
}

.to-emerald-50\/50 {
  --tw-gradient-to: rgb(236 253 245 / 0.5);
}

.to-purple-50\/50 {
  --tw-gradient-to: rgb(250 245 255 / 0.5);
}

/* === OPACITY UTILITIES === */
.opacity-0 {
  opacity: 0;
}

.opacity-100 {
  opacity: 1;
}

/* === Z-INDEX MANAGEMENT === */
.z-10 {
  z-index: 10;
}

.z-20 {
  z-index: 20;
}

.z-30 {
  z-index: 30;
}

.z-40 {
  z-index: 40;
}

.z-50 {
  z-index: 50;
}

/* === ANIMATION UTILITIES === */
.animate-in {
  animation-fill-mode: both;
}

.fade-in {
  animation-name: fadeIn;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.duration-200 {
  animation-duration: 200ms;
}

/* === CUSTOM HOVER STATES === */
.group:hover .group-hover\:scale-110 {
  transform: scale(1.1);
}

.group:hover .group-hover\:bg-emerald-200 {
  background-color: #a7f3d0;
}

.group:hover .group-hover\:bg-purple-200 {
  background-color: #e9d5ff;
}

.group:hover .group-hover\:opacity-100 {
  opacity: 1;
}

/* === BORDER UTILITIES === */
.border {
  border-width: 1px;
}

.border-t {
  border-top-width: 1px;
}

.border-t-2 {
  border-top-width: 2px;
}

.rounded-md {
  border-radius: 0.375rem;
}

.rounded-lg {
  border-radius: 0.5rem;
}

.rounded-xl {
  border-radius: 0.75rem;
}

.rounded-2xl {
  border-radius: 1rem;
}

.rounded-full {
  border-radius: 9999px;
}

/* === SHADOW UTILITIES === */
.shadow-sm {
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
}

.shadow-lg {
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -2px rgb(0 0 0 / 0.05);
}

.shadow-xl {
  box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 10px 10px -5px rgb(0 0 0 / 0.04);
}

.shadow-2xl {
  box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);
}

.hover\:shadow-md:hover {
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -1px rgb(0 0 0 / 0.06);
}

.hover\:shadow-lg:hover {
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -2px rgb(0 0 0 / 0.05);
}
</style>