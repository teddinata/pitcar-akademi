<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Top nav bar -->
    <div class="bg-white border-b sticky top-0 z-10">
      <div class="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
        <button @click="$router.back()"
          class="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
        </button>
        <div>
          <h1 class="text-sm font-bold text-gray-900 leading-tight">Detail Journey</h1>
          <p v-if="journey" class="text-xs text-gray-400">{{ journey.employee_name }}</p>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-24">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
    </div>

    <template v-else-if="journey">
      <div class="max-w-2xl mx-auto px-4 py-5 space-y-4">

        <!-- ── HERO CARD ── -->
        <div class="bg-white rounded-2xl border shadow-sm overflow-hidden">
          <!-- Colored top bar by state -->
          <div class="h-1.5 w-full" :class="stateBarColor(journey.state)"></div>

          <div class="p-5">
            <div class="flex items-start justify-between gap-3">
              <!-- Employee info -->
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg font-bold shrink-0"
                  :style="`background: hsl(${journey.employee_id * 47 % 360}, 55%, 52%)`">
                  {{ journey.employee_name?.charAt(0)?.toUpperCase() }}
                </div>
                <div>
                  <div class="flex items-center gap-1.5 mb-0.5">
                    <span class="text-[11px] px-2 py-0.5 rounded-full font-semibold"
                      :class="stateClass(journey.state)">
                      {{ stateLabel(journey.state) }}
                    </span>
                    <span v-if="journey.recommendation && journey.final_score > 0"
                      class="text-[11px] px-2 py-0.5 rounded-full font-semibold"
                      :class="recBadgeClass(journey.recommendation)">
                      {{ recEmoji(journey.recommendation) }} {{ recLabel(journey.recommendation) }}
                    </span>
                  </div>
                  <h2 class="font-bold text-gray-900">{{ journey.employee_name }}</h2>
                  <p class="text-xs text-gray-500 mt-0.5">{{ journey.employee_job }} · {{ journey.template_name }}</p>
                </div>
              </div>

              <!-- Score ring -->
              <div class="shrink-0 text-center">
                <div class="w-16 h-16 rounded-full border-4 flex flex-col items-center justify-center font-bold"
                  :class="scoreRingClass(journey)">
                  <span class="text-base leading-none">
                    {{ journey.final_score > 0 ? journey.final_score.toFixed(0) + '%' : '—' }}
                  </span>
                </div>
                <p class="text-[10px] text-gray-400 mt-1">Nilai Akhir</p>
              </div>
            </div>

            <!-- Meta pills -->
            <div class="flex flex-wrap gap-1.5 mt-3">
              <span v-if="journey.start_date"
                class="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
                Mulai {{ journey.start_date }}
              </span>
              <span v-if="journey.target_end_date"
                class="inline-flex items-center gap-1 text-xs bg-orange-50 text-orange-600 px-2.5 py-1 rounded-full">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                Target {{ journey.target_end_date }}
              </span>
              <span v-if="journey.actual_end_date"
                class="inline-flex items-center gap-1 text-xs bg-green-50 text-green-600 px-2.5 py-1 rounded-full">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                Selesai {{ journey.actual_end_date }}
              </span>
              <span v-if="journey.mentor_name"
                class="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
                Mentor: {{ journey.mentor_name }}
              </span>
            </div>

            <!-- Journey-level actions -->
            <div v-if="['draft','in_progress'].includes(journey.state)"
              class="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
              <button v-if="journey.state === 'draft'" @click="startJourney" :disabled="actionLoading"
                class="btn-primary flex items-center gap-1.5">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                Mulai Journey
              </button>
              <button v-if="journey.state === 'in_progress'" @click="syncScores" :disabled="actionLoading"
                class="btn-secondary flex items-center gap-1.5">
                <svg class="w-4 h-4" :class="actionLoading ? 'animate-spin' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                </svg>
                Sync Semua Nilai
              </button>
              <button v-if="journey.state === 'in_progress'" @click="completeJourney" :disabled="actionLoading"
                class="btn-success flex items-center gap-1.5">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
                </svg>
                Selesaikan & Hitung Nilai
              </button>
              <button @click="cancelJourney" :disabled="actionLoading"
                class="btn-danger ml-auto">
                Batalkan
              </button>
            </div>
          </div>
        </div>

        <!-- ── PROGRESS BAR ── -->
        <div v-if="sortedStages.length" class="bg-white rounded-2xl border shadow-sm p-4">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-bold text-gray-500 uppercase tracking-wider">Progress Keseluruhan</span>
            <span class="text-xs font-semibold text-gray-700">
              {{ completedCount }}/{{ sortedStages.length }} tahap selesai
            </span>
          </div>
          <!-- Segment bar -->
          <div class="flex gap-1 h-2.5">
            <div v-for="s in sortedStages" :key="s.id"
              class="flex-1 rounded-full transition-all duration-500"
              :class="segmentColor(s)">
            </div>
          </div>
          <div class="flex justify-between mt-1.5">
            <span class="text-[10px] text-gray-400">Orientasi</span>
            <span class="text-[10px] text-gray-400">Penilaian Akhir</span>
          </div>
        </div>

        <!-- ── SHOPEE-STYLE TIMELINE ── -->
        <div>
          <p class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-1">Tahapan Journey</p>

          <div class="relative">
            <div v-for="(stage, idx) in sortedStages" :key="stage.id" class="relative flex">

              <!-- ── LEFT: dot + connector ── -->
              <div class="flex flex-col items-center" style="width:48px; min-width:48px; padding-top:4px">
                <!-- Stage dot -->
                <div class="relative w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10 transition-all duration-300 shadow-sm"
                  :class="stageDotClass(stage.state)">
                  <!-- Completed: checkmark -->
                  <template v-if="stage.state === 'completed'">
                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
                    </svg>
                  </template>
                  <!-- In progress: pulsing ring + number -->
                  <template v-else-if="stage.state === 'in_progress'">
                    <span class="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-30"></span>
                    <span class="relative text-sm font-bold text-white">{{ idx + 1 }}</span>
                  </template>
                  <!-- Pending: number -->
                  <template v-else>
                    <span class="text-sm font-semibold" :class="stage.state === 'skipped' ? 'text-gray-300' : 'text-gray-400'">
                      {{ idx + 1 }}
                    </span>
                  </template>
                </div>

                <!-- Connector line (not for last stage) -->
                <div v-if="idx < sortedStages.length - 1"
                  class="w-0.5 flex-1 min-h-[16px] mt-1 rounded-full transition-colors duration-300"
                  :class="connectorColor(stage.state, sortedStages[idx + 1]?.state)">
                </div>
              </div>

              <!-- ── RIGHT: stage card ── -->
              <div class="flex-1 pb-3" style="padding-top:4px; padding-left:8px">
                <div class="rounded-2xl border transition-all duration-200 overflow-hidden"
                  :class="stageCardClass(stage.state)">

                  <!-- Card top accent line for in_progress -->
                  <div v-if="stage.state === 'in_progress'" class="h-1 bg-gradient-to-r from-blue-500 to-blue-300"></div>
                  <div v-else-if="stage.state === 'completed'" class="h-1 bg-gradient-to-r from-green-500 to-emerald-300"></div>

                  <div class="p-4">
                    <!-- Stage header -->
                    <div class="flex items-start justify-between gap-2">
                      <div class="flex items-start gap-2.5">
                        <!-- Type icon -->
                        <div class="w-8 h-8 rounded-xl flex items-center justify-center text-base shrink-0"
                          :class="stageIconBg(stage.stage_type)">
                          {{ stageIcon(stage.stage_type) }}
                        </div>
                        <div>
                          <h3 class="font-semibold text-gray-900 text-sm leading-tight">{{ stage.stage_name }}</h3>
                          <div class="flex items-center gap-1 mt-0.5">
                            <span class="text-[10px] px-1.5 py-0.5 rounded font-medium" :class="stagePillClass(stage.stage_type)">
                              {{ stageTypeLabel(stage.stage_type) }}
                            </span>
                            <span class="text-[10px] px-1.5 py-0.5 rounded font-medium" :class="stageStatePillClass(stage.state)">
                              {{ stageStateLabel(stage.state) }}
                            </span>
                          </div>
                        </div>
                      </div>

                      <!-- Score badge -->
                      <div v-if="stage.score > 0"
                        class="shrink-0 px-2.5 py-1 rounded-xl text-sm font-bold"
                        :class="stage.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'">
                        {{ stage.score.toFixed(1) }}%
                        <span v-if="stage.passed" class="ml-0.5 text-xs">✓</span>
                      </div>
                    </div>

                    <!-- Meta info row -->
                    <div class="flex flex-wrap gap-3 mt-2.5 text-xs text-gray-500">
                      <span v-if="stage.weight > 0">
                        Bobot: <strong class="text-gray-700">{{ stage.weight }}%</strong>
                      </span>
                      <span v-if="stage.passing_score > 0">
                        Min. Lulus: <strong class="text-gray-700">{{ stage.passing_score }}%</strong>
                      </span>
                      <span v-if="stage.completed_at" class="text-green-600 flex items-center gap-0.5">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4"/>
                        </svg>
                        Selesai {{ formatDatetime(stage.completed_at) }}
                      </span>
                      <span v-else-if="stage.started_at" class="text-blue-500 flex items-center gap-0.5">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
                        </svg>
                        Dimulai {{ formatDatetime(stage.started_at) }}
                      </span>
                    </div>

                    <!-- Practical criteria (if assessed) -->
                    <div v-if="stage.practical && stage.stage_type === 'practical'" class="mt-3">
                      <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Hasil Penilaian Praktek</p>
                      <div class="grid grid-cols-2 gap-1.5">
                        <div v-for="c in stage.practical.criteria" :key="c.criteria_name"
                          class="flex items-center justify-between bg-gray-50 rounded-lg px-2.5 py-1.5 border border-gray-100">
                          <span class="text-[11px] text-gray-600 truncate mr-1.5">{{ c.criteria_name }}</span>
                          <span class="shrink-0 text-[11px] font-bold px-1.5 py-0.5 rounded"
                            :class="c.score >= 4 ? 'bg-green-100 text-green-700' : c.score >= 3 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-600'">
                            {{ c.score }}/5
                          </span>
                        </div>
                      </div>
                      <p v-if="stage.practical.overall_notes" class="text-[11px] text-gray-400 mt-2 italic pl-1">
                        "{{ stage.practical.overall_notes }}"
                      </p>
                    </div>

                    <!-- ── STAGE ACTION BUTTONS ── -->
                    <div v-if="journey.state === 'in_progress'" class="mt-3 pt-3 border-t border-gray-100 space-y-2">
                      <div class="flex flex-wrap gap-1.5">

                        <!-- ALL STAGES: Tandai Mulai (when pending) -->
                        <button v-if="stage.state === 'pending'"
                          @click="markStage(stage.id, 'in_progress')"
                          :disabled="actionLoading"
                          class="stage-btn stage-btn-blue">
                          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                          </svg>
                          Tandai Mulai
                        </button>

                        <!-- ORIENTATION: direct complete (no score) -->
                        <button v-if="stage.state === 'in_progress' && stage.stage_type === 'orientation'"
                          @click="markStage(stage.id, 'completed')"
                          :disabled="actionLoading"
                          class="stage-btn stage-btn-green">
                          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                          </svg>
                          Tandai Selesai
                        </button>

                        <!-- FINAL STAGE: navigate to final-review page -->
                        <button v-if="stage.state === 'in_progress' && stage.stage_type === 'final'"
                          @click="$router.push(`/dashboard/journey/${journey.id}/final-review`)"
                          class="stage-btn stage-btn-green">
                          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
                          </svg>
                          Penilaian Akhir
                        </button>

                        <!-- OTHER STAGES (non-orientation, non-final): inline score input -->
                        <button v-if="stage.state === 'in_progress' && !['orientation','final'].includes(stage.stage_type) && confirmingStageId !== stage.id"
                          @click="confirmingStageId = stage.id; confirmScore = ''"
                          :disabled="actionLoading"
                          class="stage-btn stage-btn-green">
                          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                          </svg>
                          Tandai Selesai
                        </button>

                        <!-- FINAL STAGE (pending): shortcut to review page -->
                        <button v-if="stage.stage_type === 'final' && stage.state === 'pending'"
                          @click="$router.push(`/dashboard/journey/${journey.id}/final-review`)"
                          class="stage-btn stage-btn-green">
                          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
                          </svg>
                          Penilaian Akhir
                        </button>

                        <!-- PRACTICAL: assess form button -->
                        <button v-if="stage.stage_type === 'practical' && stage.state !== 'completed'"
                          @click="$router.push(`/dashboard/journey/${journey.id}/assess`)"
                          class="stage-btn stage-btn-teal">
                          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>
                          </svg>
                          Input Penilaian Praktek
                        </button>
                        <button v-if="stage.stage_type === 'practical' && stage.state === 'completed'"
                          @click="$router.push(`/dashboard/journey/${journey.id}/assess`)"
                          class="stage-btn stage-btn-gray">
                          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
                          </svg>
                          Edit Penilaian
                        </button>

                        <!-- LMS COURSE / SOP QUIZ: sync button -->
                        <button v-if="['lms_course', 'sop_quiz'].includes(stage.stage_type)"
                          @click="syncScores"
                          :disabled="actionLoading"
                          class="stage-btn stage-btn-gray">
                          <svg class="w-3.5 h-3.5" :class="actionLoading ? 'animate-spin' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                          </svg>
                          Sync Nilai
                        </button>
                      </div>

                      <!-- Inline score confirm panel (shown when Tandai Selesai clicked) -->
                      <div v-if="confirmingStageId === stage.id"
                        class="flex items-center gap-2 px-3 py-2.5 bg-green-50 border border-green-200 rounded-xl">
                        <svg class="w-4 h-4 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        <span class="text-xs text-green-700 font-medium">Nilai akhir:</span>
                        <input v-model="confirmScore" type="number" min="0" max="100"
                          class="w-20 border border-green-300 rounded-lg px-2 py-1 text-sm text-center focus:ring-2 focus:ring-green-400 focus:outline-none bg-white"
                          placeholder="0–100"/>
                        <span class="text-xs text-green-600">% (opsional)</span>
                        <button @click="markStageWithScore(stage.id)"
                          :disabled="actionLoading"
                          class="stage-btn stage-btn-green ml-auto">
                          Simpan
                        </button>
                        <button @click="confirmingStageId = null; confirmScore = ''"
                          class="stage-btn stage-btn-gray">
                          Batal
                        </button>
                      </div>
                    </div>

                    <!-- Notes -->
                    <p v-if="stage.notes" class="text-xs text-gray-400 mt-2 italic">
                      "{{ stage.notes }}"
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty stages hint -->
        <div v-if="journey.state === 'draft'" class="bg-blue-50 border border-blue-200 rounded-2xl p-5 text-center">
          <svg class="w-10 h-10 mx-auto mb-2 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <p class="text-sm font-semibold text-blue-700">Journey belum dimulai</p>
          <p class="text-xs text-blue-500 mt-1">Klik <strong>Mulai Journey</strong> di atas untuk membuat tahapan dan memulai proses onboarding.</p>
        </div>

      </div>
    </template>

    <div v-else class="text-center py-24 text-gray-400">
      <p class="text-lg">Journey tidak ditemukan</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { journeyApi } from '@/services/journeyApi'

const route = useRoute()
const journey = ref(null)
const loading = ref(true)
const actionLoading = ref(false)
const confirmingStageId = ref(null)
const confirmScore = ref('')

const sortedStages = computed(() =>
  (journey.value?.stages || []).slice().sort((a, b) => a.sequence - b.sequence)
)

const completedCount = computed(() =>
  sortedStages.value.filter(s => s.state === 'completed').length
)

async function load() {
  loading.value = true
  try {
    journey.value = await journeyApi.detail(route.params.id)
  } finally {
    loading.value = false
  }
}

async function startJourney() {
  if (!confirm('Mulai journey ini? Tahapan akan dibuat berdasarkan template.')) return
  actionLoading.value = true
  try {
    journey.value = await journeyApi.start(route.params.id)
  } catch (e) { alert(e.message) } finally { actionLoading.value = false }
}

async function syncScores() {
  actionLoading.value = true
  try {
    journey.value = await journeyApi.syncScores(route.params.id)
  } catch (e) { alert(e.message) } finally { actionLoading.value = false }
}

async function completeJourney() {
  if (!confirm('Hitung nilai akhir dan selesaikan journey ini?')) return
  actionLoading.value = true
  try {
    journey.value = await journeyApi.complete(route.params.id)
  } catch (e) { alert(e.message) } finally { actionLoading.value = false }
}

async function cancelJourney() {
  if (!confirm('Batalkan journey ini?')) return
  actionLoading.value = true
  try {
    await journeyApi.cancel(route.params.id)
    journey.value = { ...journey.value, state: 'cancelled', stages: journey.value.stages }
  } catch (e) { alert(e.message) } finally { actionLoading.value = false }
}

async function markStage(spId, newState) {
  actionLoading.value = true
  try {
    journey.value = await journeyApi.stageUpdateState(route.params.id, spId, { state: newState })
  } catch (e) { alert(e.message) } finally { actionLoading.value = false }
}

async function markStageWithScore(spId) {
  actionLoading.value = true
  try {
    const params = { state: 'completed' }
    const scoreVal = parseFloat(confirmScore.value)
    if (!isNaN(scoreVal) && confirmScore.value !== '') {
      params.score = Math.min(100, Math.max(0, scoreVal))
    }
    journey.value = await journeyApi.stageUpdateState(route.params.id, spId, params)
    confirmingStageId.value = null
    confirmScore.value = ''
  } catch (e) { alert(e.message) } finally { actionLoading.value = false }
}

function formatDatetime(dt) {
  if (!dt) return ''
  const d = new Date(dt.replace(' ', 'T'))
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

// ── STYLE HELPERS ──────────────────────────────────────────────

function stateBarColor(s) {
  return {
    draft: 'bg-gray-300',
    in_progress: 'bg-gradient-to-r from-blue-500 to-blue-300',
    completed: 'bg-gradient-to-r from-yellow-400 to-yellow-300',
    passed: 'bg-gradient-to-r from-green-500 to-emerald-400',
    failed: 'bg-gradient-to-r from-red-500 to-red-400',
    cancelled: 'bg-gray-200',
  }[s] || 'bg-gray-300'
}

function stateLabel(s) {
  return { draft: 'Draft', in_progress: 'Sedang Berjalan', completed: 'Selesai Dihitung', passed: 'Lulus', failed: 'Tidak Lulus', cancelled: 'Dibatalkan' }[s] || s
}
function stateClass(s) {
  return {
    draft: 'bg-gray-100 text-gray-600',
    in_progress: 'bg-blue-100 text-blue-700',
    completed: 'bg-yellow-100 text-yellow-700',
    passed: 'bg-green-100 text-green-700',
    failed: 'bg-red-100 text-red-700',
    cancelled: 'bg-gray-100 text-gray-400',
  }[s] || 'bg-gray-100 text-gray-600'
}

function scoreRingClass(j) {
  if (j.state === 'passed') return 'border-green-400 text-green-600'
  if (j.state === 'failed') return 'border-red-400 text-red-600'
  if (j.state === 'in_progress') return 'border-blue-300 text-blue-600'
  return 'border-gray-200 text-gray-400'
}

function recLabel(r) {
  return { promote: 'Siap Promosi', extend_training: 'Perpanjang Training', remedial: 'Perlu Remedial' }[r] || r
}
function recEmoji(r) {
  return { promote: '🎉', extend_training: '⏳', remedial: '📚' }[r] || ''
}
function recBadgeClass(r) {
  return { promote: 'bg-green-100 text-green-700', extend_training: 'bg-yellow-100 text-yellow-700', remedial: 'bg-red-100 text-red-700' }[r] || ''
}

// Timeline dot
function stageDotClass(s) {
  return {
    completed: 'bg-green-500 border-2 border-green-400',
    in_progress: 'bg-blue-500 border-2 border-blue-300',
    pending: 'bg-white border-2 border-gray-300',
    skipped: 'bg-gray-100 border-2 border-gray-200',
  }[s] || 'bg-white border-2 border-gray-300'
}

// Connector line between dots
function connectorColor(thisState, nextState) {
  if (thisState === 'completed' && nextState === 'completed') return 'bg-green-400'
  if (thisState === 'completed' && nextState === 'in_progress') return 'bg-gradient-to-b from-green-400 to-blue-400'
  if (thisState === 'completed') return 'bg-gradient-to-b from-green-400 to-gray-200'
  if (thisState === 'in_progress') return 'bg-gradient-to-b from-blue-400 to-gray-200'
  return 'bg-gray-200'
}

// Stage card
function stageCardClass(s) {
  return {
    completed: 'border-green-100 bg-white',
    in_progress: 'border-blue-200 bg-white shadow-blue-50 shadow-md',
    pending: 'border-gray-200 bg-white',
    skipped: 'border-gray-100 bg-gray-50',
  }[s] || 'border-gray-200 bg-white'
}

// Progress segment bar
function segmentColor(s) {
  if (s.state === 'completed') return 'bg-green-400'
  if (s.state === 'in_progress') return 'bg-blue-300 animate-pulse'
  return 'bg-gray-200'
}

// Stage type
function stageIcon(t) {
  return { orientation: '🎯', lms_course: '📚', sop_quiz: '📝', practical: '🔧', final: '🏆' }[t] || '⚙️'
}
function stageIconBg(t) {
  return {
    orientation: 'bg-purple-100',
    lms_course: 'bg-blue-100',
    sop_quiz: 'bg-orange-100',
    practical: 'bg-teal-100',
    final: 'bg-yellow-100',
  }[t] || 'bg-gray-100'
}
function stagePillClass(t) {
  return {
    orientation: 'bg-purple-100 text-purple-700',
    lms_course: 'bg-blue-100 text-blue-700',
    sop_quiz: 'bg-orange-100 text-orange-700',
    practical: 'bg-teal-100 text-teal-700',
    final: 'bg-yellow-100 text-yellow-700',
  }[t] || 'bg-gray-100 text-gray-600'
}
function stageTypeLabel(t) {
  return { orientation: 'Orientasi', lms_course: 'Teori LMS', sop_quiz: 'Kuis SOP', practical: 'Praktek', final: 'Penilaian Akhir' }[t] || t
}
function stageStateLabel(s) {
  return { pending: 'Belum Mulai', in_progress: 'Sedang Berjalan', completed: 'Selesai', skipped: 'Dilewati' }[s] || s
}
function stageStatePillClass(s) {
  return {
    pending: 'bg-gray-100 text-gray-500',
    in_progress: 'bg-blue-100 text-blue-600',
    completed: 'bg-green-100 text-green-700',
    skipped: 'bg-gray-100 text-gray-400',
  }[s] || 'bg-gray-100 text-gray-500'
}

onMounted(load)
</script>

<style scoped>
.btn-primary {
  @apply px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium transition-all disabled:opacity-50 shadow-sm;
}
.btn-secondary {
  @apply px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-medium transition-all disabled:opacity-50;
}
.btn-success {
  @apply px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-medium transition-all disabled:opacity-50 shadow-sm;
}
.btn-danger {
  @apply px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-sm font-medium transition-all disabled:opacity-50;
}

/* Per-stage action buttons */
.stage-btn {
  @apply inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-40;
}
.stage-btn-blue {
  @apply bg-blue-100 text-blue-700 hover:bg-blue-200;
}
.stage-btn-green {
  @apply bg-green-100 text-green-700 hover:bg-green-200;
}
.stage-btn-teal {
  @apply bg-teal-100 text-teal-700 hover:bg-teal-200;
}
.stage-btn-gray {
  @apply bg-gray-100 text-gray-600 hover:bg-gray-200;
}
</style>
