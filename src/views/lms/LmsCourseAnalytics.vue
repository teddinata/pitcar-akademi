<template>
  <div class="min-h-screen clay-surface p-4 md:p-6">
    <!-- Header -->
    <div class="flex items-start gap-3 mb-5">
      <button
        @click="goBack"
        class="mt-1 p-1.5 rounded-lg text-gray-500 hover:bg-white/70 hover:text-gray-800 transition-colors shrink-0"
        title="Kembali"
      >
        <ChevronLeftIcon class="w-5 h-5" />
      </button>
      <div class="min-w-0 flex-1">
        <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          {{ isFull ? 'Analitik Kursus' : 'Leaderboard Kursus' }}
          <span v-if="data?.course?.category" class="normal-case font-medium text-gray-400">· {{ data.course.category }}</span>
        </p>
        <h1 class="text-xl md:text-2xl font-bold text-gray-900 leading-snug">{{ data?.course?.name || 'Memuat...' }}</h1>
      </div>
      <button
        v-if="isFull"
        @click="exportCsv"
        class="shrink-0 flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-700 bg-white/80 border border-gray-200 rounded-lg hover:bg-white transition-colors"
      >
        <ArrowDownTrayIcon class="w-4 h-4" />
        <span class="hidden sm:inline">Unduh CSV</span>
      </button>
    </div>

    <!-- Loading / error -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <div class="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
    </div>
    <div v-else-if="error" class="clay-card p-6 text-center">
      <p class="text-red-600 font-medium">{{ error }}</p>
      <button @click="load" class="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700">Coba Lagi</button>
    </div>

    <template v-else-if="data">
      <!-- Tabs (admin) -->
      <div v-if="isFull" class="flex gap-2 mb-5 overflow-x-auto pb-1">
        <button
          v-for="tab in visibleTabs"
          :key="tab.key"
          @click="activeTab = tab.key"
          class="px-4 py-2 text-sm whitespace-nowrap clay-pill"
          :class="activeTab === tab.key ? 'clay-pill-active' : ''"
        >{{ tab.label }}</button>
      </div>

      <!-- ── RINGKASAN ── -->
      <template v-if="isFull && activeTab === 'summary'">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div class="clay-card-sm p-4">
            <p class="text-xs text-gray-500 font-medium uppercase tracking-wider">Peserta</p>
            <p class="text-2xl font-bold text-blue-600 mt-1">{{ s.enrolled }}</p>
            <p class="text-[11px] text-gray-500 mt-1">{{ s.not_started }} belum mulai · {{ s.in_progress }} berjalan</p>
          </div>
          <div class="clay-card-sm p-4">
            <p class="text-xs text-gray-500 font-medium uppercase tracking-wider">Selesai</p>
            <p class="text-2xl font-bold text-green-600 mt-1">{{ s.completed }} <span class="text-sm font-semibold text-gray-400">/ {{ s.enrolled }}</span></p>
            <p class="text-[11px] text-gray-500 mt-1">Completion {{ s.completion_rate }}%</p>
          </div>
          <div class="clay-card-sm p-4">
            <p class="text-xs text-gray-500 font-medium uppercase tracking-wider">Rata-rata Progres</p>
            <p class="text-2xl font-bold text-purple-600 mt-1">{{ fmtNum(s.avg_progress) }}%</p>
            <p class="text-[11px] text-gray-500 mt-1">{{ data.course.module_count }} modul</p>
          </div>
          <div class="clay-card-sm p-4">
            <p class="text-xs text-gray-500 font-medium uppercase tracking-wider">Rata-rata Nilai</p>
            <p class="text-2xl font-bold text-amber-600 mt-1">{{ fmtNum(s.avg_score) }}</p>
            <p class="text-[11px] text-gray-500 mt-1">{{ data.course.has_post_test ? 'dari post-test' : 'nilai terbaik quiz' }}</p>
          </div>
        </div>

        <!-- Pre vs Post -->
        <div class="clay-card p-5 mb-4">
          <div class="flex items-center justify-between gap-3 mb-4">
            <h2 class="font-semibold text-gray-800">Pre-test vs Post-test</h2>
            <button v-if="hasPrePost" @click="activeTab = 'prepost'" class="text-xs font-semibold text-blue-600 hover:underline">Rincian per peserta →</button>
          </div>
          <div v-if="!hasPrePost" class="text-sm text-gray-500 bg-gray-50 rounded-xl p-4">
            Kursus ini belum punya modul quiz berperan <b>Pre-test</b> atau <b>Post-test</b>.
            Atur di <router-link to="/dashboard/lms/modules" class="text-blue-600 font-semibold hover:underline">Modul &amp; Section</router-link>:
            edit modul quiz, lalu pilih "Peran di Kursus".
          </div>
          <div v-else class="grid md:grid-cols-3 gap-4 items-center">
            <div class="rounded-2xl bg-sky-50 border border-sky-100 p-4">
              <p class="text-xs font-semibold text-sky-700">PRE-TEST</p>
              <p class="text-3xl font-bold text-sky-700 mt-1">{{ fmtNum(s.avg_pre) }}</p>
              <p class="text-[11px] text-sky-700/80 mt-1 truncate">{{ s.pre_taken }} peserta · {{ data.course.pre_test_name || 'belum diatur' }}</p>
            </div>
            <div class="rounded-2xl bg-emerald-50 border border-emerald-100 p-4">
              <p class="text-xs font-semibold text-emerald-700">POST-TEST</p>
              <p class="text-3xl font-bold text-emerald-700 mt-1">{{ fmtNum(s.avg_post) }}</p>
              <p class="text-[11px] text-emerald-700/80 mt-1 truncate">{{ s.post_taken }} peserta · {{ data.course.post_test_name || 'belum diatur' }}</p>
            </div>
            <div class="rounded-2xl bg-white/70 border border-gray-100 p-4">
              <p class="text-xs font-semibold text-gray-500">KENAIKAN RATA-RATA (Δ)</p>
              <p class="text-3xl font-bold mt-1" :class="deltaClass(s.avg_delta)">{{ fmtDelta(s.avg_delta) }}</p>
              <p class="text-[11px] text-gray-500 mt-1">
                {{ s.paired }} peserta punya keduanya · {{ s.improved }} naik · {{ s.declined }} turun
              </p>
            </div>
          </div>
        </div>

        <!-- Top 5 + aktivitas terbaru -->
        <div class="grid lg:grid-cols-2 gap-4">
          <div class="clay-card p-5">
            <div class="flex items-center justify-between mb-3">
              <h2 class="font-semibold text-gray-800">Top 5 Leaderboard</h2>
              <button @click="activeTab = 'leaderboard'" class="text-xs font-semibold text-blue-600 hover:underline">Lihat semua →</button>
            </div>
            <LeaderRow v-for="p in rankBy(leaderboard, 'score').slice(0, 5)" :key="p.key" :p="p" />
            <p v-if="!leaderboard.length" class="text-sm text-gray-400">Belum ada peserta.</p>
          </div>
          <div class="clay-card p-5">
            <div class="flex items-center justify-between mb-3">
              <h2 class="font-semibold text-gray-800">Aktivitas Terbaru</h2>
              <button @click="activeTab = 'activity'" class="text-xs font-semibold text-blue-600 hover:underline">Lihat semua →</button>
            </div>
            <ul class="space-y-2.5">
              <li v-for="(ev, i) in data.activity.slice(0, 6)" :key="i" class="flex gap-2.5 text-sm">
                <span class="mt-0.5 shrink-0">{{ eventIcon(ev.type) }}</span>
                <div class="min-w-0">
                  <p class="text-gray-800"><b>{{ ev.name }}</b> · {{ ev.text }}</p>
                  <p class="text-[11px] text-gray-400">{{ fmtDate(ev.at) }}</p>
                </div>
              </li>
            </ul>
            <p v-if="!data.activity.length" class="text-sm text-gray-400">Belum ada aktivitas.</p>
          </div>
        </div>
      </template>

      <!-- ── PESERTA ── -->
      <template v-else-if="isFull && activeTab === 'participants'">
        <div class="clay-card p-3 mb-3 flex flex-wrap gap-2">
          <input v-model="search" placeholder="Cari nama / jabatan..." class="flex-1 min-w-40 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300" />
          <select v-model="statusFilter" class="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300">
            <option value="">Semua Status</option>
            <option value="not_started">Belum Mulai</option>
            <option value="in_progress">Berjalan</option>
            <option value="completed">Selesai</option>
            <option value="failed">Gagal</option>
          </select>
          <select v-model="participantSort" aria-label="Urutkan peserta" class="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300">
            <option value="score">Urut: Nilai tertinggi</option>
            <option value="progress">Urut: Progres tertinggi</option>
            <option v-if="hasVideos" value="video">Urut: Tontonan video terendah</option>
            <option value="name">Urut: Nama</option>
          </select>
        </div>
        <div class="clay-card overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="bg-gray-50/80 text-gray-500 text-xs uppercase">
                <tr>
                  <th class="px-4 py-3 text-left font-medium">Peserta</th>
                  <th class="px-3 py-3 text-left font-medium">Status</th>
                  <th class="px-3 py-3 text-left font-medium min-w-36">Progres</th>
                  <th v-if="data.course.has_pre_test" class="px-3 py-3 text-center font-medium">Pre</th>
                  <th v-if="data.course.has_post_test" class="px-3 py-3 text-center font-medium">Post</th>
                  <th class="px-3 py-3 text-center font-medium">Nilai</th>
                  <th v-if="hasVideos" class="px-3 py-3 text-left font-medium whitespace-nowrap">Video Ditonton</th>
                  <th class="px-3 py-3 text-left font-medium whitespace-nowrap">Daftar</th>
                  <th class="px-3 py-3 text-left font-medium whitespace-nowrap">Selesai</th>
                  <th class="px-3 py-3 text-left font-medium whitespace-nowrap">Aktivitas Terakhir</th>
                  <th class="px-3 py-3"></th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-for="p in filteredParticipants" :key="p.enrollment_id" class="hover:bg-white/60">
                  <td class="px-4 py-3">
                    <p class="font-medium text-gray-800">{{ p.name }}</p>
                    <p class="text-[11px] text-gray-400">{{ [p.job, p.department].filter(Boolean).join(' · ') || '-' }}</p>
                  </td>
                  <td class="px-3 py-3"><span class="text-[11px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap" :class="statusClass(p.status)">{{ statusLabel(p.status) }}</span></td>
                  <td class="px-3 py-3">
                    <div class="flex items-center gap-2">
                      <div class="h-1.5 flex-1 bg-black/5 rounded-full overflow-hidden">
                        <div class="h-full rounded-full" :class="p.progress >= 100 ? 'bg-green-500' : 'bg-indigo-500'" :style="{ width: p.progress + '%' }"></div>
                      </div>
                      <span class="text-xs text-gray-600 w-10 text-right">{{ Math.round(p.progress) }}%</span>
                    </div>
                    <p class="text-[11px] text-gray-400 mt-0.5">{{ p.modules_done }}/{{ data.course.module_count }} modul</p>
                  </td>
                  <td v-if="data.course.has_pre_test" class="px-3 py-3 text-center"><ScoreCell :v="p.pre" /></td>
                  <td v-if="data.course.has_post_test" class="px-3 py-3 text-center"><ScoreCell :v="p.post" /></td>
                  <td class="px-3 py-3 text-center font-semibold text-gray-800 tabular-nums">{{ fmtNum(p.score) }}</td>
                  <td v-if="hasVideos" class="px-3 py-3">
                    <button
                      @click="showVideosOf(p)"
                      class="group text-left rounded-md -mx-1 px-1 py-0.5 hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
                      :title="`Lihat tontonan video ${p.name}`"
                    >
                      <span class="text-sm font-semibold tabular-nums" :class="watchTextClass(p.video_watch)">{{ Math.round(p.video_watch || 0) }}%</span>
                      <span class="block text-[11px] text-gray-500 whitespace-nowrap">
                        {{ p.videos_done }}/{{ data.course.video_count }} tuntas<template v-if="p.videos_skipped"> · <span class="text-red-600">{{ p.videos_skipped }} dilewati</span></template>
                      </span>
                    </button>
                  </td>
                  <td class="px-3 py-3 text-xs text-gray-600 whitespace-nowrap">{{ fmtDate(p.enrollment_date) }}</td>
                  <td class="px-3 py-3 text-xs text-gray-600 whitespace-nowrap">{{ fmtDate(p.completion_date) }}</td>
                  <td class="px-3 py-3 text-xs text-gray-600 whitespace-nowrap">{{ fmtDate(p.last_activity) }}</td>
                  <td class="px-3 py-3 text-right">
                    <button @click="showActivityOf(p)" class="text-xs font-semibold text-blue-600 hover:underline whitespace-nowrap">Aktivitas →</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p v-if="!filteredParticipants.length" class="text-sm text-gray-400 text-center py-8">Tidak ada peserta.</p>
        </div>
      </template>

      <!-- ── TONTONAN VIDEO ── -->
      <template v-else-if="isFull && hasVideos && activeTab === 'videos'">
        <div class="clay-card p-4 mb-3">
          <dl class="flex flex-wrap gap-x-8 gap-y-2 text-sm">
            <div>
              <dt class="text-xs text-gray-500">Rata-rata ditonton</dt>
              <dd class="text-lg font-bold tabular-nums" :class="watchTextClass(videoSummary.avg)">{{ videoSummary.avg }}%</dd>
            </div>
            <div>
              <dt class="text-xs text-gray-500">Tuntas semua video</dt>
              <dd class="text-lg font-bold text-gray-800 tabular-nums">{{ videoSummary.allDone }} <span class="text-sm font-medium text-gray-400">/ {{ s.enrolled }} peserta</span></dd>
            </div>
            <div>
              <dt class="text-xs text-gray-500">Belum menonton sama sekali</dt>
              <dd class="text-lg font-bold text-gray-800 tabular-nums">{{ videoSummary.none }} <span class="text-sm font-medium text-gray-400">peserta</span></dd>
            </div>
            <div>
              <dt class="text-xs text-gray-500">Video dilewati</dt>
              <dd class="text-lg font-bold tabular-nums" :class="videoSummary.skipped ? 'text-red-600' : 'text-gray-800'">{{ videoSummary.skipped }} <span class="text-sm font-medium text-gray-400">kali</span></dd>
            </div>
          </dl>
        </div>

        <div class="clay-card p-3 mb-3 flex flex-wrap gap-2 items-center">
          <input v-model="videoSearch" placeholder="Cari nama / jabatan..." class="flex-1 min-w-40 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300" />
          <select v-model="videoSort" aria-label="Urutkan" class="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300">
            <option value="low">Urut: Tontonan terendah</option>
            <option value="high">Urut: Tontonan tertinggi</option>
            <option value="name">Urut: Nama</option>
          </select>
          <label class="flex items-center gap-2 text-sm text-gray-700 px-1 cursor-pointer select-none">
            <input v-model="videoOnlyUnfinished" type="checkbox" class="rounded border-gray-300 text-blue-600 focus:ring-blue-300" />
            Hanya yang belum tuntas
          </label>
        </div>

        <div class="clay-card overflow-hidden">
          <div class="overflow-x-auto">
            <table class="text-sm border-separate border-spacing-0 min-w-full">
              <thead class="text-gray-500 text-xs">
                <tr>
                  <th class="sticky left-0 z-10 bg-gray-50 px-3 sm:px-4 py-3 text-left font-medium uppercase min-w-36 sm:min-w-52 border-b border-gray-100">Peserta</th>
                  <th class="bg-gray-50 px-3 py-3 text-left font-medium uppercase whitespace-nowrap border-b border-gray-100">Rata-rata</th>
                  <th
                    v-for="v in videoModules"
                    :key="v.id"
                    class="bg-gray-50 px-2 py-3 text-left font-medium align-bottom border-b border-gray-100 min-w-28 max-w-40"
                    :title="v.name"
                  >
                    <span class="block text-[10px] font-bold text-gray-400 uppercase">Video {{ v.vno }}</span>
                    <span class="block text-gray-700 font-semibold normal-case leading-snug line-clamp-2">{{ v.name }}</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="p in videoRows" :key="p.enrollment_id" class="group">
                  <td class="sticky left-0 z-10 bg-white group-hover:bg-gray-50 px-3 sm:px-4 py-2.5 border-b border-gray-100">
                    <p class="font-medium text-gray-800 truncate max-w-36 sm:max-w-52">{{ p.name }}</p>
                    <p class="text-[11px] text-gray-400 truncate max-w-36 sm:max-w-52">{{ p.job || '-' }}</p>
                  </td>
                  <td class="bg-white/60 group-hover:bg-gray-50 px-3 py-2.5 border-b border-gray-100">
                    <span class="font-bold tabular-nums" :class="watchTextClass(p.video_watch)">{{ Math.round(p.video_watch || 0) }}%</span>
                    <span class="block text-[11px] text-gray-500 whitespace-nowrap">{{ p.videos_done }}/{{ data.course.video_count }} tuntas</span>
                  </td>
                  <td
                    v-for="(cell, ci) in p.videos"
                    :key="cell.module_id"
                    class="px-1.5 py-1.5 border-b border-gray-100 group-hover:bg-gray-50"
                  >
                    <div
                      class="relative overflow-hidden rounded-lg px-2.5 py-2 h-full"
                      :class="cellClass(cell)"
                      :title="cellTitle(p, cell, ci)"
                    >
                      <div class="flex items-center gap-1">
                        <span v-if="cell.status === 'not_started'" class="text-xs">Belum</span>
                        <span v-else class="font-semibold tabular-nums">{{ Math.round(cell.watch) }}%</span>
                        <CheckCircleIcon v-if="cell.status === 'completed'" class="w-4 h-4 shrink-0" aria-label="selesai" />
                        <ForwardIcon v-else-if="cell.status === 'skipped'" class="w-4 h-4 shrink-0" aria-label="dilewati" />
                      </div>
                      <span v-if="cell.status === 'skipped'" class="block text-[10px] font-semibold">dilewati</span>
                      <span v-else-if="cell.status === 'in_progress'" class="block text-[10px] opacity-80">sedang ditonton</span>
                      <div v-if="cell.status !== 'not_started'" class="absolute left-0 bottom-0 h-0.5 bg-current opacity-40" :style="{ width: cell.watch + '%' }"></div>
                    </div>
                  </td>
                </tr>
              </tbody>
              <tfoot v-if="videoRows.length > 1">
                <tr class="text-xs text-gray-600">
                  <td class="sticky left-0 z-10 bg-gray-50 px-4 py-2.5 font-semibold">Rata-rata per video</td>
                  <td class="bg-gray-50 px-3 py-2.5"></td>
                  <td v-for="v in videoModules" :key="v.id" class="bg-gray-50 px-3.5 py-2.5 tabular-nums">
                    <span class="font-semibold" :class="watchTextClass(v.avg)">{{ v.avg }}%</span>
                    <span class="block text-[10px] text-gray-500">{{ v.done }} tuntas</span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
          <p v-if="!videoRows.length" class="text-sm text-gray-400 text-center py-8">
            {{ videoOnlyUnfinished ? 'Semua peserta sudah menuntaskan video.' : 'Tidak ada peserta.' }}
          </p>
          <div class="px-4 py-3 border-t border-gray-100 flex flex-wrap gap-x-5 gap-y-1.5 text-[11px] text-gray-500">
            <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded bg-green-100 ring-1 ring-green-200"></span>≥ 90% ditonton</span>
            <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded bg-amber-100 ring-1 ring-amber-200"></span>50–89%</span>
            <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded bg-red-100 ring-1 ring-red-200"></span>&lt; 50%</span>
            <span class="flex items-center gap-1.5"><CheckCircleIcon class="w-3.5 h-3.5 text-green-700" />selesai</span>
            <span class="flex items-center gap-1.5"><ForwardIcon class="w-3.5 h-3.5 text-red-600" />dilewati: ditandai selesai tapi ditonton &lt; 30%</span>
            <span>Persentase = posisi terjauh yang pernah ditonton.</span>
          </div>
        </div>
      </template>

      <!-- ── PRE / POST ── -->
      <template v-else-if="isFull && activeTab === 'prepost'">
        <div v-if="!hasPrePost" class="clay-card p-6 text-sm text-gray-500">
          Kursus ini belum punya Pre-test / Post-test. Atur di
          <router-link to="/dashboard/lms/modules" class="text-blue-600 font-semibold hover:underline">Modul &amp; Section</router-link>.
        </div>
        <div v-else class="clay-card overflow-hidden">
          <div class="px-5 py-3 border-b border-gray-100 text-xs text-gray-500">
            Pre-test memakai nilai <b>percobaan pertama</b>; post-test memakai <b>nilai terbaik</b>. Δ = post − pre.
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="bg-gray-50/80 text-gray-500 text-xs uppercase">
                <tr>
                  <th class="px-4 py-3 text-left font-medium">Peserta</th>
                  <th class="px-3 py-3 text-center font-medium">Pre-test</th>
                  <th class="px-3 py-3 text-center font-medium">Post-test</th>
                  <th class="px-3 py-3 text-center font-medium">Δ</th>
                  <th class="px-3 py-3 text-left font-medium">Waktu Pre</th>
                  <th class="px-3 py-3 text-left font-medium">Waktu Post</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-for="p in prePostRows" :key="p.enrollment_id" class="hover:bg-white/60">
                  <td class="px-4 py-3">
                    <p class="font-medium text-gray-800">{{ p.name }}</p>
                    <p class="text-[11px] text-gray-400">{{ p.job || '-' }}</p>
                  </td>
                  <td class="px-3 py-3 text-center"><ScoreCell :v="p.pre" /></td>
                  <td class="px-3 py-3 text-center">
                    <ScoreCell :v="p.post" />
                    <p v-if="p.post?.attempts > 1" class="text-[10px] text-gray-400">{{ p.post.attempts }}x coba</p>
                  </td>
                  <td class="px-3 py-3 text-center font-bold" :class="deltaClass(p.delta)">{{ fmtDelta(p.delta) }}</td>
                  <td class="px-3 py-3 text-xs text-gray-600 whitespace-nowrap">{{ fmtDate(p.pre?.date) }}</td>
                  <td class="px-3 py-3 text-xs text-gray-600 whitespace-nowrap">{{ fmtDate(p.post?.date) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </template>

      <!-- ── MATERI ── -->
      <template v-else-if="isFull && activeTab === 'modules'">
        <div class="clay-card overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="bg-gray-50/80 text-gray-500 text-xs uppercase">
                <tr>
                  <th class="px-4 py-3 text-left font-medium">#</th>
                  <th class="px-3 py-3 text-left font-medium">Materi</th>
                  <th class="px-3 py-3 text-left font-medium min-w-36">Diselesaikan</th>
                  <th class="px-3 py-3 text-center font-medium whitespace-nowrap">Rata-rata Waktu</th>
                  <th class="px-3 py-3 text-center font-medium whitespace-nowrap">Nilai Quiz</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <template v-for="(g, gi) in moduleGroups" :key="gi">
                  <tr v-if="g.name" class="bg-gray-50/60">
                    <td colspan="5" class="px-4 py-2 text-xs font-bold text-gray-600 uppercase tracking-wide">{{ g.name }}</td>
                  </tr>
                  <tr v-for="m in g.modules" :key="m.id" class="hover:bg-white/60">
                    <td class="px-4 py-3 text-xs text-gray-400">{{ m.no }}</td>
                    <td class="px-3 py-3">
                      <p class="font-medium text-gray-800">{{ m.name }}</p>
                      <p class="text-[11px] text-gray-400 flex items-center gap-1.5 flex-wrap">
                        <span>{{ contentTypeLabel(m.content_type) }} · {{ m.duration_minutes }} mnt</span>
                        <span v-if="m.content_type === 'assessment' && m.quiz_role === 'pre_test'" class="font-bold text-sky-700">PRE-TEST</span>
                        <span v-else-if="m.content_type === 'assessment' && m.quiz_role === 'post_test'" class="font-bold text-emerald-700">POST-TEST</span>
                        <span v-if="m.quiz_bank_name" class="truncate max-w-56">🧩 {{ m.quiz_bank_name }}</span>
                      </p>
                    </td>
                    <td class="px-3 py-3">
                      <div class="flex items-center gap-2">
                        <div class="h-1.5 flex-1 bg-black/5 rounded-full overflow-hidden">
                          <div class="h-full rounded-full bg-green-500" :style="{ width: m.completion_rate + '%' }"></div>
                        </div>
                        <span class="text-xs text-gray-600 whitespace-nowrap">{{ m.completed }}/{{ s.enrolled }}</span>
                      </div>
                    </td>
                    <td class="px-3 py-3 text-center text-xs text-gray-600">
                      {{ m.avg_time_minutes != null ? fmtNum(m.avg_time_minutes) + ' mnt' : '-' }}
                      <p v-if="m.avg_watch_percentage != null" class="text-[10px] text-gray-400">ditonton {{ Math.round(m.avg_watch_percentage) }}%</p>
                    </td>
                    <td class="px-3 py-3 text-center text-xs">
                      <template v-if="m.content_type === 'assessment'">
                        <span class="font-semibold text-gray-800">{{ fmtNum(m.avg_best_score) }}</span>
                        <p class="text-[10px] text-gray-400">{{ m.pass_count }} lulus · {{ m.attempts }} percobaan</p>
                      </template>
                      <span v-else class="text-gray-300">-</span>
                    </td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>
          <p v-if="!data.modules.length" class="text-sm text-gray-400 text-center py-8">Kursus belum punya modul.</p>
        </div>
      </template>

      <!-- ── AKTIVITAS ── -->
      <template v-else-if="isFull && activeTab === 'activity'">
        <div class="clay-card p-3 mb-3 flex flex-wrap gap-2 items-center">
          <select v-model="activityPerson" class="flex-1 min-w-48 text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300">
            <option :value="null">Semua peserta</option>
            <option v-for="p in sortedByName" :key="p.enrollment_id" :value="p.enrollment_id">{{ p.name }}</option>
          </select>
          <select v-model="activityType" class="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300">
            <option value="">Semua jenis</option>
            <option value="quizzes">Quiz / Pre / Post</option>
            <option value="modules">Modul</option>
            <option value="course">Daftar & selesai kursus</option>
          </select>
          <span v-if="data.activity_total > data.activity.length" class="text-[11px] text-gray-400">
            Menampilkan {{ data.activity.length }} dari {{ data.activity_total }} aktivitas terbaru
          </span>
        </div>
        <div class="clay-card p-5">
          <ol class="relative border-l border-gray-200 ml-2">
            <li v-for="(ev, i) in filteredActivity" :key="i" class="ml-5 mb-4 last:mb-0">
              <span class="absolute -left-3 flex items-center justify-center w-6 h-6 rounded-full bg-white border border-gray-200 text-xs">{{ eventIcon(ev.type) }}</span>
              <p class="text-[11px] text-gray-400">{{ fmtDate(ev.at) }}</p>
              <p class="text-sm text-gray-800"><b>{{ ev.name }}</b> · {{ ev.text }}</p>
            </li>
          </ol>
          <p v-if="!filteredActivity.length" class="text-sm text-gray-400 text-center py-6">Belum ada aktivitas.</p>
        </div>
      </template>

      <!-- ── LEADERBOARD (admin tab & tampilan user) ── -->
      <template v-else>
        <div class="clay-card p-5 max-w-3xl">
          <div class="flex flex-wrap items-center justify-between gap-3 mb-1">
            <h2 class="font-semibold text-gray-800 flex items-center gap-2">
              <TrophyIcon class="w-5 h-5 text-amber-500" /> Leaderboard
              <span class="text-xs font-normal text-gray-400">· {{ leaderboard.length }} peserta</span>
            </h2>
            <div class="inline-flex rounded-lg bg-black/5 p-0.5 text-xs font-semibold" role="group" aria-label="Urutkan leaderboard">
              <button
                v-for="opt in leaderSortOptions"
                :key="opt.key"
                @click="leaderSort = opt.key"
                :aria-pressed="leaderSort === opt.key"
                class="px-3 py-1.5 rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
                :class="leaderSort === opt.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'"
              >{{ opt.label }}</button>
            </div>
          </div>
          <p class="text-[11px] text-gray-400 mb-4">
            <template v-if="leaderSort === 'score'">Urutan: nilai {{ scoreSource }} tertinggi, lalu progres, lalu yang selesai lebih dulu. Yang belum punya nilai di bawah.</template>
            <template v-else>Urutan: progres tertinggi, lalu nilai {{ scoreSource }}.</template>
          </p>
          <LeaderRow v-for="p in rankedLeaderboard" :key="p.key" :p="p" />
          <p v-if="!leaderboard.length" class="text-sm text-gray-400">Belum ada peserta.</p>
        </div>
      </template>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, defineComponent, h, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { lmsApi } from '../../services/lmsApi'
import { ChevronLeftIcon, TrophyIcon, ArrowDownTrayIcon } from '@heroicons/vue/24/outline'
import { CheckCircleIcon, ForwardIcon } from '@heroicons/vue/20/solid'

const route = useRoute()
const router = useRouter()
const courseId = computed(() => parseInt(route.params.courseId))

const loading = ref(true)
const error = ref('')
const data = ref(null)
const activeTab = ref(route.query.tab || 'summary')
const search = ref('')
const statusFilter = ref('')
const activityPerson = ref(null)
const activityType = ref('')
const participantSort = ref('score')
const leaderSort = ref('score')
const videoSearch = ref('')
const videoSort = ref('low')
const videoOnlyUnfinished = ref(false)

const tabs = [
  { key: 'summary', label: 'Ringkasan' },
  { key: 'participants', label: 'Peserta' },
  { key: 'videos', label: 'Tontonan Video' },
  { key: 'prepost', label: 'Pre / Post-test' },
  { key: 'leaderboard', label: 'Leaderboard' },
  { key: 'modules', label: 'Materi' },
  { key: 'activity', label: 'Aktivitas' },
]

const isFull = computed(() => data.value?.scope === 'full')
const s = computed(() => data.value?.summary || {})
const hasPrePost = computed(() => !!(data.value?.course?.has_pre_test || data.value?.course?.has_post_test))
const leaderboard = computed(() => (isFull.value ? data.value.participants : data.value?.leaderboard) || [])
const hasVideos = computed(() => (data.value?.course?.video_count || 0) > 0)
const visibleTabs = computed(() => tabs.filter(t => t.key !== 'videos' || hasVideos.value))
const scoreSource = computed(() => (data.value?.course?.has_post_test ? 'post-test' : 'quiz terbaik'))

// ── Urutan: nilai (utama) atau progres ────────────────────────────────
const leaderSortOptions = [
  { key: 'score', label: 'Nilai' },
  { key: 'progress', label: 'Progres' },
]
const byScore = (a, b) => (a.score == null) - (b.score == null) || (b.score ?? 0) - (a.score ?? 0)
const byProgress = (a, b) => (b.progress || 0) - (a.progress || 0)
const comparators = {
  score: (a, b) => byScore(a, b) || byProgress(a, b) || a.rank - b.rank,
  progress: (a, b) => byProgress(a, b) || byScore(a, b) || a.rank - b.rank,
  video: (a, b) => (a.video_watch ?? 0) - (b.video_watch ?? 0) || a.name.localeCompare(b.name),
  name: (a, b) => a.name.localeCompare(b.name),
}
function rankBy(rows, key) {
  return [...rows].sort(comparators[key]).map((p, i) => ({ ...p, key: p.enrollment_id || `${p.rank}-${p.name}`, rank: i + 1 }))
}
const rankedLeaderboard = computed(() => rankBy(leaderboard.value, leaderSort.value))

const filteredParticipants = computed(() => {
  const q = search.value.trim().toLowerCase()
  return (data.value?.participants || []).filter(p =>
    (!statusFilter.value || p.status === statusFilter.value)
    && (!q || `${p.name} ${p.job} ${p.department}`.toLowerCase().includes(q))
  ).sort(comparators[participantSort.value])
})

// ── Tontonan video ────────────────────────────────────────────────────
const videoModules = computed(() => {
  const participants = data.value?.participants || []
  return (data.value?.modules || [])
    .filter(m => m.content_type === 'video')
    .map((m, i) => {
      const cells = participants.map(p => (p.videos || []).find(v => v.module_id === m.id)).filter(Boolean)
      const avg = cells.length ? Math.round(cells.reduce((t, c) => t + c.watch, 0) / cells.length) : 0
      return { ...m, vno: i + 1, avg, done: cells.filter(c => c.status === 'completed').length }
    })
})
const videoSummary = computed(() => {
  const ps = data.value?.participants || []
  const n = ps.length
  return {
    avg: n ? Math.round(ps.reduce((t, p) => t + (p.video_watch || 0), 0) / n) : 0,
    allDone: ps.filter(p => p.videos?.length && p.videos_done === p.videos.length).length,
    none: ps.filter(p => (p.videos || []).every(v => !v.watch)).length,
    skipped: ps.reduce((t, p) => t + (p.videos_skipped || 0), 0),
  }
})
const videoRows = computed(() => {
  const q = videoSearch.value.trim().toLowerCase()
  const rows = (data.value?.participants || []).filter(p =>
    (!q || `${p.name} ${p.job} ${p.department}`.toLowerCase().includes(q))
    && (!videoOnlyUnfinished.value || p.videos_done < (p.videos || []).length))
  const cmp = {
    low: comparators.video,
    high: (a, b) => -comparators.video(a, b),
    name: comparators.name,
  }[videoSort.value]
  return rows.sort(cmp)
})
function showVideosOf(p) {
  videoSearch.value = p.name
  videoOnlyUnfinished.value = false
  activeTab.value = 'videos'
}
function watchTextClass(v) {
  if (v == null) return 'text-gray-400'
  return v >= 90 ? 'text-green-700' : v >= 50 ? 'text-amber-700' : 'text-red-600'
}
function cellClass(c) {
  if (c.status === 'not_started') return 'bg-gray-50 text-gray-400'
  if (c.status === 'skipped') return 'bg-red-100 text-red-700'
  if (c.watch >= 90) return 'bg-green-100 text-green-800'
  if (c.watch >= 50) return 'bg-amber-100 text-amber-800'
  return 'bg-red-50 text-red-700'
}
function cellTitle(p, c, i) {
  const name = videoModules.value[i]?.name || 'Video'
  if (c.status === 'not_started') return `${p.name} · ${name}: belum ditonton`
  const parts = [`${p.name} · ${name}`, `ditonton ${Math.round(c.watch)}%`]
  if (c.minutes) parts.push(`${c.minutes} mnt`)
  if (c.last_watched) parts.push(`terakhir ${fmtDate(c.last_watched)}`)
  if (c.status === 'skipped') parts.push('DILEWATI')
  return parts.join(' · ')
}
const sortedByName = computed(() => [...(data.value?.participants || [])].sort((a, b) => a.name.localeCompare(b.name)))
const prePostRows = computed(() => [...(data.value?.participants || [])].sort((a, b) =>
  (b.delta ?? -999) - (a.delta ?? -999) || a.name.localeCompare(b.name)))

const moduleGroups = computed(() => {
  const groups = []
  const map = {}
  ;(data.value?.modules || []).forEach((m, i) => {
    const key = m.section_name || '__none__'
    if (!map[key]) { map[key] = { name: m.section_name, modules: [] }; groups.push(map[key]) }
    map[key].modules.push({ ...m, no: i + 1 })
  })
  return groups
})

const typeGroups = {
  quizzes: ['quiz', 'pre_test', 'post_test'],
  modules: ['module_start', 'module_done'],
  course: ['enrolled', 'course_done'],
}
const filteredActivity = computed(() => (data.value?.activity || []).filter(ev =>
  (!activityPerson.value || ev.enrollment_id === activityPerson.value)
  && (!activityType.value || typeGroups[activityType.value].includes(ev.type))
))

function showActivityOf(p) {
  activityPerson.value = p.enrollment_id
  activityType.value = ''
  activeTab.value = 'activity'
}

// ── Format helpers ────────────────────────────────────────────────────
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
function fmtDate(v) {
  if (!v) return '-'
  const [d, t] = v.split(' ')
  const [y, m, day] = d.split('-')
  return `${parseInt(day)} ${MONTHS[parseInt(m) - 1]} ${y}${t ? ' ' + t : ''}`
}
function fmtNum(v) { return v == null ? '-' : (Math.round(v * 10) / 10).toString() }
function fmtDelta(v) { return v == null ? '-' : (v > 0 ? '+' : '') + fmtNum(v) }
function deltaClass(v) {
  if (v == null) return 'text-gray-400'
  return v > 0 ? 'text-green-600' : v < 0 ? 'text-red-500' : 'text-gray-600'
}
function statusLabel(st) {
  return { not_started: 'Belum Mulai', in_progress: 'Berjalan', completed: 'Selesai', failed: 'Gagal', cancelled: 'Batal' }[st] || st
}
function statusClass(st) {
  return {
    not_started: 'bg-gray-100 text-gray-600',
    in_progress: 'bg-indigo-100 text-indigo-700',
    completed: 'bg-green-100 text-green-700',
    failed: 'bg-red-100 text-red-600',
  }[st] || 'bg-gray-100 text-gray-600'
}
function contentTypeLabel(t) {
  return { video: 'Video', document: 'Dokumen', interactive: 'Interaktif', assessment: 'Quiz', external_link: 'Link' }[t] || t
}
function eventIcon(t) {
  return {
    enrolled: '📝', course_done: '🏁', module_start: '▶️', module_done: '✅',
    quiz: '🧩', pre_test: '🅿️', post_test: '🎯',
  }[t] || '•'
}

// ── Inline components ─────────────────────────────────────────────────
const ScoreCell = defineComponent({
  props: { v: Object },
  setup(props) {
    return () => {
      if (!props.v) return h('span', { class: 'text-gray-300' }, '-')
      return h('div', {}, [
        h('span', { class: 'font-semibold text-gray-800' }, fmtNum(props.v.score)),
        props.v.essay_pending ? h('p', { class: 'text-[10px] text-amber-600' }, 'esai belum dinilai') : null,
      ])
    }
  },
})

const LeaderRow = defineComponent({
  props: { p: Object },
  setup(props) {
    const medal = r => ({ 1: '🥇', 2: '🥈', 3: '🥉' }[r])
    return () => {
      const p = props.p
      return h('div', {
        class: `flex items-center gap-3 py-2.5 px-2 rounded-xl ${p.is_me ? 'bg-blue-50 ring-1 ring-blue-200' : ''}`,
      }, [
        h('div', { class: 'w-8 text-center shrink-0 font-bold text-gray-500' }, medal(p.rank) || `#${p.rank}`),
        h('div', { class: 'flex-1 min-w-0' }, [
          h('p', { class: 'text-sm font-semibold text-gray-800 truncate' }, [p.name, p.is_me ? h('span', { class: 'ml-1 text-[10px] text-blue-600' }, '(kamu)') : null]),
          h('div', { class: 'flex items-center gap-2 mt-1' }, [
            h('div', { class: 'h-1.5 flex-1 bg-black/5 rounded-full overflow-hidden' }, [
              h('div', { class: `h-full rounded-full ${p.progress >= 100 ? 'bg-green-500' : 'bg-indigo-500'}`, style: { width: p.progress + '%' } }),
            ]),
            h('span', { class: 'text-[11px] text-gray-500 w-9 text-right' }, Math.round(p.progress) + '%'),
          ]),
        ]),
        h('div', { class: 'w-14 text-right shrink-0' }, [
          h('p', { class: 'text-sm font-bold text-gray-800 tabular-nums' }, fmtNum(p.score)),
          h('p', { class: 'text-[10px] text-gray-400' }, 'nilai'),
        ]),
      ])
    }
  },
})

// ── Export ────────────────────────────────────────────────────────────
function exportCsv() {
  const c = data.value.course
  const videos = videoModules.value
  const head = ['Peringkat', 'Nama', 'Jabatan', 'Departemen', 'Status', 'Progres %', 'Modul Selesai',
    ...(c.has_pre_test ? ['Pre-test'] : []), ...(c.has_post_test ? ['Post-test'] : []),
    ...(c.has_pre_test && c.has_post_test ? ['Delta'] : []),
    'Nilai',
    ...(videos.length ? ['Rata-rata Tonton Video %', 'Video Tuntas', 'Video Dilewati', ...videos.map(v => `Video ${v.vno}: ${v.name} %`)] : []),
    'Tgl Daftar', 'Tgl Selesai', 'Aktivitas Terakhir']
  const rows = rankBy(data.value.participants, 'score').map(p => [
    p.rank, p.name, p.job, p.department, statusLabel(p.status), p.progress, p.modules_done,
    ...(c.has_pre_test ? [p.pre?.score ?? ''] : []), ...(c.has_post_test ? [p.post?.score ?? ''] : []),
    ...(c.has_pre_test && c.has_post_test ? [p.delta ?? ''] : []),
    p.score ?? '',
    ...(videos.length ? [p.video_watch ?? '', p.videos_done, p.videos_skipped,
      ...videos.map(v => (p.videos || []).find(x => x.module_id === v.id)?.watch ?? '')] : []),
    p.enrollment_date || '', p.completion_date || '', p.last_activity || '',
  ])
  const csv = [head, ...rows]
    .map(r => r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','))
    .join('\n')
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `analitik-${c.name.replace(/[^\w-]+/g, '_')}.csv`
  a.click()
  URL.revokeObjectURL(a.href)
}

function goBack() {
  if (window.history.length > 1) router.back()
  else router.push('/dashboard/lms/courses')
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    data.value = await lmsApi.courseDetailAnalytics(courseId.value)
  } catch (e) {
    error.value = e.message || 'Gagal memuat analitik kursus'
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>
