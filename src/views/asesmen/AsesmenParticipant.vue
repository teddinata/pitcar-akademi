<!-- Rincian satu peserta Asesmen Terpadu untuk asesor: kesimpulan + jenjang akhir,
     ujian lisan per soal (rekaman, transkrip, skor AI 6 aspek dua kali, kutipan
     yang bisa diputar, tanda), studi kasus, penilaian lead, lalu sahkan. -->
<template>
  <div class="ujian min-h-screen p-4 md:p-6">
    <div class="flex flex-wrap items-center gap-2 mb-4">
      <router-link :to="`/dashboard/asesmen/rekap${d ? `?periode=${d.cycle.id}` : ''}`" class="u-btn !min-h-10"><ChevronLeftIcon class="w-5 h-5" />Rekap</router-link>
      <span class="flex-1"></span>
      <template v-if="d">
        <button class="u-btn !min-h-10 !px-2.5" :disabled="!prevId" title="Peserta sebelumnya" @click="ke(prevId)"><ChevronLeftIcon class="w-5 h-5" /></button>
        <span class="text-sm font-bold tabular-nums">{{ posisi }}</span>
        <button class="u-btn !min-h-10 !px-2.5" :disabled="!nextId" title="Peserta berikutnya" @click="ke(nextId)"><ChevronRightIcon class="w-5 h-5" /></button>
      </template>
      <button class="u-btn !min-h-10" data-tour="asm-help" @click="tour.replay()"><QuestionMarkCircleIcon class="w-5 h-5" />Cara pakai</button>
    </div>

    <div v-if="loading && !d" class="u-card h-72 animate-pulse"></div>
    <p v-else-if="error && !d" class="u-card p-5 font-bold text-[color:var(--merah)]">{{ error }}</p>

    <template v-else-if="d">
      <h1 class="u-display text-[1.9rem] sm:text-[2.3rem] font-extrabold leading-none">{{ d.employee.name }}</h1>
      <p class="mt-1.5 text-[15px] text-[color:var(--ink-soft)]">{{ [d.employee.job, d.employee.department, d.cycle.name].filter(Boolean).join(' · ') }}</p>
      <p v-if="error" class="mt-3 rounded-lg border-2 border-[color:var(--merah)] bg-[color:var(--merah-muda)] p-2.5 text-sm font-bold text-[color:var(--merah-tua)]" role="alert">{{ error }}</p>

      <!-- Kesimpulan -->
      <section class="u-card mt-5 overflow-hidden" data-tour="det-kesimpulan">
        <div class="grid lg:grid-cols-[17rem_minmax(0,1fr)]">
          <div class="p-5 border-b-[2.5px] lg:border-b-0 lg:border-r-[2.5px] border-[color:var(--ink)]" :class="s.final_level ? `bg-[#fffbe0]` : 'bg-[#f6f6f6]'">
            <p class="text-xs font-extrabold uppercase tracking-[.08em]">Jenjang akhir</p>
            <template v-if="s.final_level">
              <p class="u-angka mt-2">L{{ s.final_level }}</p>
              <p class="u-display mt-1 text-xl font-extrabold leading-tight">{{ s.final_name }}</p>
              <p class="mt-2 text-sm font-bold">Gabungan {{ num(s.combined) }} dari 4</p>
            </template>
            <p v-else class="u-display mt-2 text-xl font-extrabold">Belum lengkap</p>
            <span class="u-chip mt-3" :class="STATUS[s.status].chip">{{ STATUS[s.status].label }}</span>
          </div>
          <div class="p-5">
            <div class="grid sm:grid-cols-3 gap-3">
              <div v-for="(c, key) in s.components" :key="key" class="rounded-xl border-2 border-[color:var(--ink)] p-3">
                <p class="text-xs font-extrabold">{{ COMPONENT[key].label }} · bobot {{ s.weights[key] }}</p>
                <p class="mt-1.5 flex items-center gap-2">
                  <span class="u-level" :class="levelClass(komponenLevel(key, c))">{{ komponenLabel(key, c) }}</span>
                  <span v-if="key === 'oral' && c.percent != null" class="u-display text-xl font-extrabold tabular-nums">{{ pct(c.percent) }}</span>
                </p>
                <p class="mt-1 text-xs font-bold text-[color:var(--ink-soft)]">{{ c.status === 'done' ? 'Selesai' : COMPONENT_STATUS[c.status] }}{{ c.total && key !== 'oral' ? ` · ${c.done}/${c.total}` : '' }}</p>
              </div>
            </div>
            <p v-if="s.inconsistent" class="mt-3 rounded-lg border-2 border-[color:var(--merah)] bg-[color:var(--merah-muda)] p-2.5 text-sm font-bold text-[color:var(--merah-tua)]">Sumber berbeda {{ num(s.spread, 1) }} level. Dengarkan rekaman soal yang menentukan sebelum mengesahkan.</p>
            <ul class="mt-4 space-y-1.5 text-[15px]">
              <li v-for="(t, i) in kesimpulan" :key="i" class="flex gap-2"><span class="mt-2 w-1.5 h-1.5 rounded-full bg-[color:var(--ink)] shrink-0"></span><span v-html="t"></span></li>
            </ul>
          </div>
        </div>

        <!-- Pengesahan -->
        <div class="border-t-[2.5px] border-[color:var(--ink)] p-4 sm:p-5 bg-[color:var(--grid-bg)]" data-tour="det-sahkan">
          <template v-if="d.validated">
            <p class="font-extrabold flex items-center gap-2"><CheckBadgeIcon class="w-6 h-6 text-[color:var(--hijau)]" />Disahkan {{ d.validated_by }} · {{ fmtDateTime(d.validated_at) }}</p>
            <p v-if="d.validation_note" class="mt-1 text-sm">“{{ d.validation_note }}”</p>
            <button v-if="d.cycle.state !== 'closed'" class="u-btn mt-3 !min-h-9" :disabled="busy" @click="sahkan(true)">Batalkan pengesahan</button>
          </template>
          <template v-else>
            <p class="font-extrabold">Sahkan hasil</p>
            <ul class="mt-1 text-sm space-y-0.5">
              <li :class="s.complete ? 'text-[color:var(--hijau)]' : ''">{{ s.complete ? '✓' : '○' }} Semua komponen selesai dinilai</li>
              <li :class="!s.open_flags ? 'text-[color:var(--hijau)]' : ''">{{ !s.open_flags ? '✓' : '○' }} Jawaban lisan bertanda sudah diperiksa{{ s.open_flags ? ` (sisa ${s.open_flags})` : '' }}</li>
            </ul>
            <div v-if="d.oral?.ai_state === 'done'" class="mt-3 rounded-xl border-2 border-dashed border-[color:var(--ink)] bg-[#fffbe0] p-3 text-sm">
              <p class="font-extrabold">Periksa dulu sebelum mengesahkan</p>
              <p class="mt-0.5">Nilai ujian lisan berasal dari AI. Dengarkan rekaman dan cocokkan dengan kutipan AI, terutama soal berikut:</p>
              <ul class="mt-1.5 flex flex-wrap gap-1.5">
                <li v-for="l in perluDicek" :key="l.id">
                  <button type="button" class="u-chip !text-xs" :class="l.reviewed_at ? 'u-chip-hijau' : 'u-chip-merah'" @click="lompatKe(l.id)">
                    L{{ l.level }} · {{ l.passed ? 'bertanda' : `belum lulus ${num(l.substance)}` }}{{ l.reviewed_at ? ' · diperiksa' : '' }}
                  </button>
                </li>
              </ul>
              <p class="mt-1.5 text-xs text-[color:var(--ink-soft)]">{{ jumlahDiperiksa }}/{{ d.oral.lines.length }} soal sudah diperiksa asesor. Bila nilai AI kurang tepat, ubah skor aspeknya di soal itu.</p>
              <label class="mt-2 flex items-start gap-2 font-bold"><input v-model="sudahPeriksa" type="checkbox" class="u-check mt-0.5" />Saya sudah mendengarkan rekaman dan memeriksa penilaian AI</label>
            </div>
            <div class="mt-3 grid sm:grid-cols-[1fr_auto] gap-2">
              <input v-model="catatanSah" class="u-input" placeholder="Catatan asesor (opsional), mis. rekaman L3 sudah saya dengar" />
              <button class="u-btn u-btn-merah" :disabled="busy || !s.complete || s.open_flags > 0 || d.cycle.state === 'closed' || (d.oral?.ai_state === 'done' && !sudahPeriksa)"
                :title="d.oral?.ai_state === 'done' && !sudahPeriksa ? 'Centang konfirmasi pemeriksaan dulu' : undefined" @click="sahkan(false)"><CheckBadgeIcon class="w-5 h-5" />Sahkan L{{ s.final_level || '?' }}</button>
            </div>
          </template>
        </div>
      </section>

      <!-- Ujian lisan -->
      <section v-if="d.oral" class="mt-8" data-tour="det-lisan">
        <div class="flex flex-wrap items-baseline justify-between gap-2 mb-3">
          <h2 class="u-display text-2xl font-extrabold">Ujian lisan</h2>
          <p class="text-sm font-bold">{{ ORAL_STATE({ ...d.oral, answered: d.oral.lines.filter((l) => l.state === 'done').length, total: d.oral.lines.length }) }}<span v-if="d.oral.ai_at"> · {{ fmtDateTime(d.oral.ai_at) }}</span></p>
        </div>
        <!-- Ujian lisan dijalankan asesor dari sini -->
        <div v-if="d.oral.state !== 'submitted'" class="u-card p-4 sm:p-5 mb-3 flex flex-wrap items-center gap-3 !bg-[#fffbe0]" data-tour="det-mulai-lisan">
          <MicrophoneIcon class="w-8 h-8 shrink-0" />
          <div class="flex-1 min-w-[14rem]">
            <p class="font-extrabold">{{ d.oral.state === 'progress' ? `Ujian lisan berjalan: soal ${d.oral.lines.filter((l) => l.state === 'done').length}/${d.oral.lines.length} selesai` : 'Ujian lisan belum dilakukan' }}</p>
            <p class="text-sm">Anda membacakan soal L1–L4 dan merekam jawaban {{ d.employee.name }} dari HP atau laptop ini. Peserta tidak mengerjakan ujian lisan sendiri.</p>
          </div>
          <router-link v-if="d.cycle.state === 'open'" :to="`/dashboard/asesmen/ujian/${d.oral.id}`" class="u-btn u-btn-merah">
            <MicrophoneIcon class="w-5 h-5" />{{ d.oral.state === 'progress' ? 'Lanjutkan ujian lisan' : 'Mulai ujian lisan' }}
          </router-link>
          <p v-else class="text-sm font-bold">Periode tidak sedang berjalan.</p>
        </div>
        <div v-if="d.oral.ai_state === 'failed'" class="u-card p-4 mb-3 !bg-[color:var(--merah-muda)]">
          <p class="font-bold text-[color:var(--merah-tua)]">Penilaian AI berhenti: {{ d.oral.ai_error }}</p>
          <p class="mt-1 text-sm">Bila ada rekaman bermasalah, tekan <b>Transkripsi ulang</b> atau <b>Lampirkan rekaman</b> di soal itu. Penilaian lalu berjalan lagi otomatis.</p>
          <button class="u-btn u-btn-hitam mt-2 !min-h-9" :disabled="busy" @click="nilaiUlangLisan"><ArrowPathIcon class="w-4 h-4" />Proses ulang</button>
        </div>
        <div v-else-if="sedangDiproses" class="u-card p-4 mb-3" aria-live="polite">
          <div class="flex flex-wrap items-baseline justify-between gap-2">
            <p class="font-bold flex items-center gap-2">
              <span class="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin motion-reduce:animate-none" aria-hidden="true"></span>
              Penilaian AI berjalan di server
            </p>
            <span class="u-chip u-chip-kuning !text-xs">{{ etaTeks }}</span>
          </div>
          <div class="mt-3 h-2.5 rounded-full border-2 border-[color:var(--ink)] bg-white overflow-hidden" role="progressbar"
            :aria-valuenow="persenProses" aria-valuemin="0" aria-valuemax="100" :aria-label="`Progres penilaian AI ${persenProses}%`">
            <div class="h-full bg-[color:var(--ink)] transition-[width] duration-700" :style="{ width: `${persenProses}%` }"></div>
          </div>
          <ol class="mt-3 grid gap-1.5 sm:grid-cols-3 text-sm">
            <li v-for="t in tahapan" :key="t.key" class="flex items-center gap-2" :class="t.state === 'todo' ? 'text-[color:var(--ink-soft)]' : ''">
              <CheckCircleIcon v-if="t.state === 'done'" class="w-5 h-5 shrink-0 text-[color:var(--hijau)]" aria-hidden="true" />
              <span v-else-if="t.state === 'now'" class="h-4 w-4 mx-0.5 shrink-0 rounded-full border-2 border-current border-t-transparent animate-spin motion-reduce:animate-none" aria-hidden="true"></span>
              <span v-else class="h-4 w-4 mx-0.5 shrink-0 rounded-full border-2 border-[color:var(--ink-soft)]" aria-hidden="true"></span>
              <span :class="t.state === 'now' ? 'font-bold' : ''">{{ t.label }}</span>
            </li>
          </ol>
          <p class="mt-3 text-sm">
            <b>Halaman ini boleh ditutup.</b> Proses tetap berjalan dan hasil tersimpan otomatis. Selama Akademi terbuka,
            penanda di pojok kanan bawah menunjukkan progresnya dan memberi tahu saat selesai.
          </p>
          <p class="mt-1 text-xs text-[color:var(--ink-soft)]">
            {{ sejakTeks }}<template v-if="d.oral.progress?.queue_ahead"> · {{ d.oral.progress.queue_ahead }} ujian lain diproses lebih dulu</template>
            · estimasi dari lama proses ujian sebelumnya
          </p>
          <p v-if="d.oral.ai_error" class="mt-1 text-sm text-[color:var(--merah-tua)]">Percobaan sebelumnya gagal dan diulang otomatis: {{ d.oral.ai_error }}</p>
          <div class="mt-3 flex flex-wrap items-center gap-2">
            <button v-if="notifSupported && izinNotif === 'default'" class="u-btn !min-h-9" @click="izinkanNotif"><BellIcon class="w-4 h-4" />Beri tahu saya saat selesai</button>
            <span v-else-if="izinNotif === 'granted'" class="text-xs font-semibold">Notifikasi browser aktif.</span>
            <button class="text-xs font-semibold underline underline-offset-2 disabled:opacity-50" :disabled="busy" @click="nilaiUlangLisan">Tampak macet? Proses sekarang</button>
          </div>
        </div>

        <!-- Tabel skor -->
        <div v-if="d.oral.ai_state === 'done'" id="tabel-lisan" class="overflow-x-auto rounded-xl border-[2.5px] border-[color:var(--ink)] shadow-[4px_4px_0_var(--ink)] bg-white mb-5">
          <table class="u-table min-w-[54rem]">
            <thead><tr><th>Level</th><th v-for="a in d.rubric.aspects" :key="a.code" class="!whitespace-normal !text-[10px] leading-tight">{{ a.name }}</th><th>Skor</th><th>Substansi</th><th>Skor × bobot</th><th>Hasil</th></tr></thead>
            <tbody>
              <tr v-for="l in d.oral.lines" :key="l.id" class="is-click" @click="lompatKe(l.id)">
                <td class="whitespace-nowrap"><b>L{{ l.level }}</b> <span class="text-xs">({{ l.weight }}%)</span></td>
                <td v-for="a in d.rubric.aspects" :key="a.code"><span class="u-skor" :class="[skorClass(l.scores[a.code]), l.override[a.code] ? 'ring-2 ring-[color:var(--biru)] ring-offset-1' : '']">{{ num(l.scores[a.code], 1) }}</span></td>
                <td class="font-extrabold tabular-nums">{{ num(l.score) }}</td>
                <td class="font-extrabold tabular-nums">{{ num(l.substance) }}</td>
                <td class="tabular-nums">{{ l.score != null ? num((l.score * l.weight) / 100, 3) : '–' }}</td>
                <td><span class="u-chip !text-[11px]" :class="l.passed ? 'u-chip-hijau' : 'u-chip-merah'">{{ l.passed ? 'Lulus' : 'Belum' }}</span>
                  <span v-if="l.flags.length" class="u-chip !text-[11px] ml-1" :class="l.reviewed_at ? '' : 'u-chip-kuning'">{{ l.reviewed_at ? 'Diperiksa' : `${l.flags.length} tanda` }}</span></td>
              </tr>
              <tr><td :colspan="d.rubric.aspects.length + 3" class="text-right font-extrabold">Skor akhir</td><td class="u-display text-lg font-extrabold">{{ pct(d.oral.percent) }}</td><td><span class="u-level" :class="levelClass(d.oral.ladder)">{{ d.oral.ladder ? `L${d.oral.ladder}` : '<L1' }}</span></td></tr>
            </tbody>
          </table>
          <p class="px-3 py-2 text-xs border-t-2 border-[color:var(--ink)]"><b>Skor</b> = rata-rata 6 aspek; <b>Substansi</b> = rata-rata 4 aspek pertama, soal lulus bila ≥ {{ num(d.rubric.pass_substance) }}. Nilai tiap aspek = rata-rata dua penilaian AI terpisah; garis biru = diubah asesor. Klik baris untuk membuka rincian & rekaman soal itu.</p>
        </div>

        <!-- Per soal -->
        <article v-for="l in d.oral.lines" :id="`soal-${l.id}`" :key="l.id" class="u-card mb-5 overflow-hidden">
          <div class="p-4 sm:p-5 border-b-[2.5px] border-[color:var(--ink)]" :class="l.flags.length && !l.reviewed_at ? 'bg-[#fff6bf]' : ''">
            <div class="flex flex-wrap items-center gap-2">
              <span class="u-nomor">L{{ l.level }}</span>
              <span class="text-sm font-bold">Bobot {{ l.weight }}%</span>
              <span v-for="f in l.flags" :key="f.code" class="u-chip u-chip-kuning">{{ f.label }}</span>
              <span v-if="l.reviewed_at" class="u-chip u-chip-hijau">Diperiksa {{ l.reviewed_by }}</span>
            </div>
            <p class="u-display mt-3 text-lg font-bold leading-snug">{{ l.question || 'Soal belum dibuka.' }}</p>
            <!-- Skor soal & substansi: angka yang sama dengan baris soal ini di tabel Ujian lisan -->
            <div v-if="l.score != null" class="mt-4 grid gap-3 sm:grid-cols-[auto_auto_minmax(0,1fr)] sm:items-center">
              <div class="rounded-xl border-[2.5px] border-[color:var(--ink)] bg-white px-4 py-2.5">
                <p class="text-[11px] font-extrabold uppercase tracking-[.06em]">Skor soal</p>
                <p class="u-display text-[2.1rem] font-extrabold leading-none tabular-nums">{{ num(l.score) }}<span class="text-base font-bold text-[color:var(--ink-soft)]"> / 5</span></p>
                <p class="mt-0.5 text-[11px] text-[color:var(--ink-soft)]">rata-rata 6 aspek</p>
              </div>
              <div class="rounded-xl border-[2.5px] px-4 py-2.5" :class="l.passed ? 'border-[color:var(--hijau)] bg-[#dcf3e6]' : 'border-[color:var(--merah)] bg-[color:var(--merah-muda)]'">
                <p class="text-[11px] font-extrabold uppercase tracking-[.06em]">Substansi · syarat lulus {{ num(d.rubric.pass_substance) }}</p>
                <p class="u-display text-[2.1rem] font-extrabold leading-none tabular-nums">{{ num(l.substance) }}</p>
                <p class="mt-0.5 text-[11px] font-bold" :class="l.passed ? 'text-[color:var(--hijau)]' : 'text-[color:var(--merah-tua)]'">
                  {{ l.passed ? 'Lulus soal ini' : `Belum lulus · kurang ${num(d.rubric.pass_substance - l.substance)}` }}</p>
              </div>
              <p class="text-xs leading-relaxed text-[color:var(--ink-soft)]">
                <b class="text-[color:var(--ink)]">Substansi</b> = rata-rata 4 aspek pertama (pemahaman, logika, urutan, ketepatan) dan menentukan lulus soal.
                Bobot {{ l.weight }}% menyumbang {{ num((l.score * l.weight) / 100, 3) }} ke skor akhir.
                Angka ini sama dengan <button type="button" class="font-bold text-[color:var(--ink)] underline underline-offset-2" @click="keTabel">baris L{{ l.level }} di tabel Ujian lisan</button>.
              </p>
            </div>
            <details v-if="l.key_points" class="mt-2 text-sm">
              <summary class="cursor-pointer font-bold">Kunci jawaban</summary>
              <ul class="mt-1 list-disc pl-5 space-y-0.5"><li v-for="(k, i) in l.key_points.split('\n').filter(Boolean)" :key="i">{{ k }}</li></ul>
            </details>
          </div>

          <div class="grid xl:grid-cols-2">
            <div class="p-4 sm:p-5 xl:border-r-[2.5px] border-[color:var(--ink)] space-y-3">
              <p class="font-extrabold">Rekaman & transkrip</p>
              <RecordingPlayer :ref="(el) => setPlayer(l.id, el)" :recordings="l.recordings" :editable="bisaUbahRekaman" :busy="busy"
                               @retranscribe="(r) => run(() => competencyApi.retranscribeOral(r.id))"
                               @use="(r, used) => run(() => competencyApi.useOralRecording(r.id, used))" />
              <details v-if="bisaUbahRekaman" class="rounded-xl border-2 border-dashed border-[color:var(--ink)] p-3 text-sm" :open="perluLampiran(l)">
                <summary class="cursor-pointer font-extrabold">Lampirkan rekaman{{ perluLampiran(l) ? ' (rekaman bermasalah)' : '' }}</summary>
                <p class="mt-1 text-xs text-[color:var(--ink-soft)]">Bila rekaman peserta gagal atau terpotong, lampirkan file audio jawaban soal ini (mp3, m4a, wav, webm, ogg; maks 24 MB), mis. rekaman HP. Ujian lalu ditranskripsi dan dinilai ulang AI.</p>
                <div class="mt-2 flex flex-wrap items-center gap-2">
                  <select v-if="l.followup_question" v-model="opsiLampir(l).kind" class="u-input !min-h-9 !w-auto">
                    <option value="main">Jawaban utama</option><option value="followup">Jawaban lanjutan</option>
                  </select>
                  <label class="flex items-center gap-1.5 text-xs font-bold"><input v-model="opsiLampir(l).replace" type="checkbox" />Ganti rekaman lama</label>
                  <label class="u-btn !min-h-9" :class="busy ? 'opacity-60 pointer-events-none' : 'cursor-pointer'">
                    <PaperClipIcon class="w-4 h-4" />{{ unggah.line === l.id ? `Mengirim ${Math.round(unggah.progress * 100)}%` : 'Pilih file' }}
                    <input type="file" class="sr-only" accept="audio/*,video/mp4,.m4a,.mp3,.wav,.webm,.ogg,.aac,.flac,.3gp" :disabled="busy" @change="(e) => lampirkan(l, e)" />
                  </label>
                </div>
              </details>
              <div v-if="l.followup_question" class="rounded-xl border-2 border-[color:var(--ink)] p-3 bg-[#fffbe0] text-sm">
                <p class="font-extrabold">Pertanyaan lanjutan AI</p>
                <p class="mt-1">“{{ l.followup_question }}”</p>
                <p v-if="l.followup_reason" class="mt-1 text-[color:var(--ink-soft)]">Alasan ditanyakan: {{ l.followup_reason }}</p>
                <p class="mt-1 font-bold">{{ { asked: 'Tidak dijawab', answered: 'Dijawab', skipped: '-', none: '-' }[l.followup_state] }}</p>
              </div>
              <p v-else-if="l.followup_state === 'skipped'" class="text-xs font-bold text-[color:var(--ink-soft)]">Cek pertanyaan lanjutan tidak berjalan (jaringan/AI), soal tetap dinilai.</p>
            </div>

            <div class="p-4 sm:p-5 space-y-3 min-w-0">
              <p class="font-extrabold">Penilaian AI per aspek</p>
              <p v-if="!l.ai?.aspects" class="text-sm">Belum dinilai.</p>
              <div v-else class="space-y-2">
                <div v-for="a in d.rubric.aspects" :key="a.code" class="rounded-lg border-2 border-[color:var(--ink)] p-2.5">
                  <div class="flex items-center gap-2">
                    <span class="u-skor" :class="skorClass(l.scores[a.code])">{{ num(l.scores[a.code], 1) }}</span>
                    <span class="font-extrabold text-sm flex-1">{{ a.name }}</span>
                    <span class="text-[11px] font-bold text-[color:var(--ink-soft)]">AI {{ (l.ai.aspects[a.code]?.scores || []).join(' · ') }}</span>
                  </div>
                  <p class="mt-1 text-sm leading-snug">{{ l.ai.aspects[a.code]?.alasan }}</p>
                  <button v-if="kutipan(l, a.code)" type="button" class="mt-1 text-left text-sm leading-snug" :title="kutipanWaktu(l, a.code) ? 'Putar bagian ini' : ''" @click="putar(l, a.code)">
                    <PlayCircleIcon v-if="kutipanWaktu(l, a.code)" class="w-4 h-4 inline -mt-0.5 mr-0.5" />
                    <span class="font-mono text-xs font-bold text-[color:var(--biru)] mr-1">{{ l.ai.aspects[a.code].waktu }}</span>
                    <span class="u-kutipan">“{{ l.ai.aspects[a.code].kutipan }}”</span>
                  </button>
                </div>
              </div>
              <div v-if="l.ai?.poin_terpenuhi?.length || l.ai?.poin_terlewat?.length" class="grid sm:grid-cols-2 gap-2 text-sm">
                <div v-if="l.ai.poin_terpenuhi?.length" class="rounded-lg border-2 border-[color:var(--hijau)] p-2.5 bg-[#eefaf2]"><p class="font-extrabold">Poin disebut</p><ul class="mt-1 list-disc pl-4"><li v-for="(p, i) in l.ai.poin_terpenuhi" :key="i">{{ p }}</li></ul></div>
                <div v-if="l.ai.poin_terlewat?.length" class="rounded-lg border-2 border-[color:var(--merah)] p-2.5 bg-[#fff2f2]"><p class="font-extrabold">Poin terlewat</p><ul class="mt-1 list-disc pl-4"><li v-for="(p, i) in l.ai.poin_terlewat" :key="i">{{ p }}</li></ul></div>
              </div>

              <!-- Periksa -->
              <div v-if="d.oral.ai_state === 'done' && d.cycle.state !== 'closed'" class="rounded-xl border-[2.5px] border-[color:var(--ink)] p-3 bg-[color:var(--grid-bg)]" :data-tour="l.flags.length ? 'det-periksa' : null">
                <p class="font-extrabold">{{ l.reviewed_at ? `Sudah diperiksa ${l.reviewed_by}` : l.flags.length ? 'Periksa jawaban bertanda' : 'Koreksi skor (bila perlu)' }}</p>
                <p class="text-xs text-[color:var(--ink-soft)]">Dengarkan rekamannya. Setujui bila nilai AI sudah pas, atau ubah skor aspek dengan alasan.</p>
                <div class="mt-2 grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                  <label v-for="a in d.rubric.aspects" :key="a.code" class="text-center">
                    <span class="block text-[10px] font-extrabold leading-tight h-6">{{ a.name }}</span>
                    <select v-model.number="review[l.id].scores[a.code]" class="u-input !min-h-9 !px-1 text-center font-extrabold">
                      <option v-for="n in [1, 2, 3, 4, 5]" :key="n" :value="n">{{ n }}</option>
                    </select>
                  </label>
                </div>
                <input v-model="review[l.id].note" class="u-input mt-2" placeholder="Alasan perubahan, mis. menit 01:20 menyebut urutan relay dengan benar" />
                <div class="mt-2 flex flex-wrap gap-2">
                  <button v-if="l.flags.length && !l.reviewed_at" class="u-btn u-btn-hitam !min-h-9" :disabled="busy" @click="periksa(l, false)"><CheckIcon class="w-4 h-4" />Setujui nilai AI</button>
                  <button class="u-btn !min-h-9" :disabled="busy || !berubah(l)" @click="periksa(l, true)">Simpan skor asesor</button>
                </div>
                <p v-if="l.review_note" class="mt-2 text-xs">Catatan: {{ l.review_note }}</p>
              </div>
            </div>
          </div>
        </article>
      </section>

      <!-- Studi kasus -->
      <section v-if="d.cases.length" class="mt-8" data-tour="det-kasus">
        <h2 class="u-display text-2xl font-extrabold mb-3">Studi kasus</h2>
        <article v-for="a in d.cases" :key="a.id" class="u-card mb-5 p-4 sm:p-5">
          <div class="flex flex-wrap items-center gap-2">
            <p class="u-display text-lg font-extrabold flex-1">{{ a.case.name }}</p>
            <span class="u-chip">{{ CASE_STATE({ state: a.state, ai_state: a.ai_state, started: !!a.started_at }) }}</span>
            <button v-if="a.ai_state === 'failed'" class="u-btn !min-h-9" :disabled="busy" @click="nilaiUlangKasus(a)">Nilai ulang</button>
          </div>
          <p v-if="a.ai_error" class="mt-2 text-sm font-bold text-[color:var(--merah-tua)]">{{ a.ai_error }}</p>
          <div v-if="Object.keys(a.case_levels || {}).length" class="mt-3 flex flex-wrap gap-2">
            <span v-for="p in d.pillars" :key="p.id" class="inline-flex items-center gap-1.5 rounded-lg border-2 border-[color:var(--ink)] px-2 py-1 text-sm font-bold">
              {{ p.name }} <span class="u-level !min-w-0 !h-7 !text-sm" :class="levelClass(a.case_levels[p.code])">{{ a.case_levels[p.code] ? num(a.case_levels[p.code], 1) : '–' }}</span>
            </span>
          </div>
          <p v-if="a.ai_result?.ringkasan" class="mt-3 text-[15px]">{{ a.ai_result.ringkasan }}</p>
          <div v-if="a.ai_result?.pilar?.length" class="mt-3 grid md:grid-cols-2 gap-2">
            <div v-for="row in a.ai_result.pilar" :key="row.kode" class="rounded-lg border-2 border-[color:var(--ink)] p-2.5 text-sm">
              <p class="font-extrabold">{{ row.nama }} · L{{ row.level || '–' }}</p>
              <p class="mt-0.5">{{ row.alasan }}</p>
              <p v-if="row.kutipan && row.kutipan !== '-'" class="mt-1"><span class="font-mono text-xs font-bold text-[color:var(--biru)] mr-1">{{ row.waktu }}</span><span class="u-kutipan">“{{ row.kutipan }}”</span></p>
            </div>
          </div>
          <details v-if="a.choice_review?.length" class="mt-3 text-sm">
            <summary class="cursor-pointer font-bold">Jawaban pilihan ganda ({{ a.choice_review.length }})</summary>
            <ol class="mt-1.5 space-y-1.5 list-decimal pl-5">
              <li v-for="q in a.choice_review" :key="q.question_id">{{ q.text }}<br /><b>{{ q.answer_text || 'tidak dijawab' }}</b> <span v-if="q.level" class="u-level !min-w-0 !h-6 !text-xs ml-1" :class="`l${q.level}`">L{{ q.level }}</span></li>
            </ol>
          </details>
          <details v-if="a.essay_answers?.some((e) => e.answer)" class="mt-2 text-sm">
            <summary class="cursor-pointer font-bold">Jawaban esai</summary>
            <div v-for="(e, i) in a.essay_answers" :key="i" class="mt-2"><p class="font-bold">{{ e.text }}</p><p class="whitespace-pre-line">{{ e.answer || '–' }}</p></div>
          </details>
          <div v-if="a.recordings?.length" class="mt-3"><RecordingPlayer :recordings="a.recordings" /></div>
        </article>
      </section>

      <!-- Lead -->
      <section v-if="d.leads.length" class="mt-8 mb-10" data-tour="det-lead">
        <h2 class="u-display text-2xl font-extrabold mb-3">Penilaian lead</h2>
        <div class="grid lg:grid-cols-2 gap-4">
          <article v-for="r in d.leads" :key="r.id" class="u-card p-4">
            <div class="flex items-center gap-2"><p class="font-extrabold flex-1">{{ r.rater }}</p>
              <span class="u-chip" :class="r.state === 'submitted' ? 'u-chip-hijau' : ''">{{ r.state === 'submitted' ? `Dikirim ${fmtDateTime(r.submitted_at)}` : 'Belum menilai' }}</span></div>
            <div v-if="r.state === 'submitted'" class="mt-3 space-y-2">
              <div v-for="line in r.lines" :key="line.pillar_id" class="flex gap-2.5 text-sm">
                <span class="u-level !min-w-[2.4rem] !h-8 shrink-0" :class="levelClass(line.level)">{{ line.level ? `L${line.level}` : '–' }}</span>
                <div><p class="font-bold">{{ pilarNama(line.pillar_id) }}</p><p class="text-[color:var(--ink-soft)] leading-snug">{{ line.level ? line.note : 'Belum pernah melihat langsung (tidak dihitung)' }}</p></div>
              </div>
              <p v-if="r.note" class="text-sm border-t-2 border-[color:var(--ink)] pt-2">{{ r.note }}</p>
            </div>
          </article>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup>
import '@fontsource-variable/bricolage-grotesque'
import '../../styles/exam.css'
import '../../styles/asesmen.css'
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ArrowPathIcon, CheckBadgeIcon, CheckIcon, ChevronLeftIcon, ChevronRightIcon, MicrophoneIcon, PaperClipIcon, PlayCircleIcon,
  QuestionMarkCircleIcon, CheckCircleIcon, BellIcon,
} from '@heroicons/vue/24/outline'
import RecordingPlayer from '../../components/asesmen/RecordingPlayer.vue'
import { competencyApi } from '../../services/competencyApi'
import { formatEta, mintaIzinNotifikasi, notifSupported, watchOral } from '../../composables/useAiWatch'
import { useTour } from '../../composables/useTour'
import { fmtDateTime } from '../../utils/competency'
import {
  CASE_STATE, COMPONENT, COMPONENT_STATUS, ORAL_STATE, STATUS, levelClass, num, parseWaktu, pct, skorClass,
} from '../../utils/asesmen'

const route = useRoute()
const router = useRouter()
const loading = ref(true)
const busy = ref(false)
const error = ref('')
const d = ref(null)
const catatanSah = ref('')
const review = reactive({})
const players = {}
const setPlayer = (id, el) => { if (el) players[id] = el }

const s = computed(() => d.value?.summary || {})
const idx = computed(() => (d.value?.siblings || []).indexOf(d.value?.id))
const prevId = computed(() => (idx.value > 0 ? d.value.siblings[idx.value - 1] : null))
const nextId = computed(() => (idx.value >= 0 && idx.value < d.value.siblings.length - 1 ? d.value.siblings[idx.value + 1] : null))
const posisi = computed(() => (idx.value >= 0 ? `${idx.value + 1}/${d.value.siblings.length}` : ''))
const pilarNama = (id) => d.value?.pillars.find((p) => p.id === id)?.name || ''
const komponenLevel = (_key, c) => (c.status === 'done' ? c.level : null)
const komponenLabel = (key, c) => {
  if (c.status !== 'done') return '–'
  if (key === 'oral') return c.level ? `L${c.level}` : '<L1'
  return num(c.level, 1)
}

const esc = (t) => String(t || '').replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]))
const kesimpulan = computed(() => {
  if (!d.value) return []
  const out = []
  const names = d.value.level_names
  const oral = d.value.oral
  if (s.value.final_level) out.push(`Jenjang akhir <b>L${s.value.final_level} – ${esc(s.value.final_name)}</b> (gabungan ${num(s.value.combined)}).`)
  if (oral?.ai_state === 'done') {
    out.push(oral.ladder
      ? `Ujian lisan <b>${pct(oral.percent)}</b>, lulus berjenjang sampai <b>L${oral.ladder}</b> (${esc(names[oral.ladder])}).`
      : `Ujian lisan <b>${pct(oral.percent)}</b>, soal L1 belum lulus.`)
    if (oral.practice) {
      out.push(`Perlu latihan di soal <b>L${oral.practice.level}</b>${oral.practice.aspects.length ? `: ${esc(oral.practice.aspects.join(', '))}` : ''}.`)
    }
    if (oral.ai_summary?.ringkasan) out.push(esc(oral.ai_summary.ringkasan))
    ;(oral.ai_summary?.area_pengembangan || []).slice(0, 3).forEach((t) => out.push(`Kembangkan: ${esc(t)}`))
  }
  const kc = s.value.components?.case
  if (kc?.status === 'done') out.push(`Studi kasus rata-rata level <b>${num(kc.level, 1)}</b> dari ${kc.done} kasus.`)
  const lc = s.value.components?.lead
  if (lc?.status === 'done') out.push(`Penilaian ${lc.done} lead rata-rata level <b>${num(lc.level, 1)}</b>.`)
  return out
})

function isiReview(data) {
  ;(data.oral?.lines || []).forEach((l) => {
    const scores = {}
    data.rubric.aspects.forEach((a) => { scores[a.code] = l.scores[a.code] != null ? Math.round(l.scores[a.code]) : 3 })
    review[l.id] = { scores, base: { ...scores }, note: '' }
  })
}
// Pilihan skor bulat; skor AI rata-rata (mis. 3,5) dianggap tidak berubah selama pilihan tidak disentuh.
const berubah = (l) => d.value.rubric.aspects.some((a) => review[l.id].scores[a.code] !== review[l.id].base[a.code])

const kutipan = (l, code) => { const k = l.ai?.aspects?.[code]?.kutipan; return k && k !== '-' ? k : '' }
const kutipanWaktu = (l, code) => parseWaktu(l.ai?.aspects?.[code]?.waktu)
function putar(l, code) {
  const w = kutipanWaktu(l, code)
  if (w) players[l.id]?.seek(w.followup, w.t)
}
function lompatKe(id) { document.getElementById(`soal-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }

async function load(id = route.params.id) {
  loading.value = true
  error.value = ''
  try {
    const data = await competencyApi.recapParticipant(Number(id))
    isiReview(data)
    d.value = data
  } catch (e) { error.value = e.message } finally { loading.value = false }
}
async function run(fn) {
  busy.value = true
  error.value = ''
  try {
    const data = await fn()
    isiReview(data)
    d.value = data
  } catch (e) { error.value = e.message } finally { busy.value = false }
}
const periksa = (l, ubah) => run(() => competencyApi.reviewOral(l.id, ubah ? { ...review[l.id].scores } : {}, review[l.id].note))
const sahkan = (undo) => run(() => competencyApi.validate(d.value.id, catatanSah.value, undo))
// Periksa dulu sebelum sahkan: soal belum lulus / bertanda, dan konfirmasi asesor.
const sudahPeriksa = ref(false)
const perluDicek = computed(() => (d.value?.oral?.lines || []).filter((l) => l.score != null && (!l.passed || l.flags.length)))
const jumlahDiperiksa = computed(() => (d.value?.oral?.lines || []).filter((l) => l.reviewed_at).length)
function keTabel() { document.getElementById('tabel-lisan')?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }
const nilaiUlangLisan = () => run(() => competencyApi.requeueOral(d.value.oral.id))

// --- Proses AI lisan: progres + muat ulang otomatis --------------------------
const sedangDiproses = computed(() => ['queued', 'running'].includes(d.value?.oral?.ai_state))
const persenProses = computed(() => {
  const p = d.value?.oral?.progress
  return p?.steps_total ? Math.round((p.steps_done / p.steps_total) * 100) : 0
})
const tahapan = computed(() => {
  const p = d.value?.oral?.progress || { recordings: 0, transcribed: 0, passes: 0, total_passes: 2 }
  const transkripSelesai = p.transcribed >= p.recordings
  const hasil = [{ key: 't', label: `Transkripsi rekaman ${p.transcribed}/${p.recordings}`, state: transkripSelesai ? 'done' : 'now' }]
  for (let i = 1; i <= p.total_passes; i++) {
    const selesai = p.passes >= i
    hasil.push({ key: `p${i}`, label: `Penilaian AI ${i} dari ${p.total_passes}`,
      state: selesai ? 'done' : transkripSelesai && p.passes === i - 1 ? 'now' : 'todo' })
  }
  return hasil
})
const sekarang = ref(Date.now())
const etaTeks = computed(() => formatEta(d.value?.oral?.progress?.eta_seconds))
const sejakTeks = computed(() => {
  const q = d.value?.oral?.progress?.queued_at
  if (!q) return 'Menunggu giliran'
  const menit = Math.max(0, Math.floor((sekarang.value - new Date(q).getTime()) / 60000))
  return menit < 1 ? 'Masuk antrean baru saja' : `Berjalan ${menit} menit`
})
const izinNotif = ref(notifSupported ? Notification.permission : 'unsupported')
async function izinkanNotif() { izinNotif.value = await mintaIzinNotifikasi() }
let timer = null
watch(sedangDiproses, (on) => {
  clearInterval(timer)
  timer = on ? setInterval(() => { sekarang.value = Date.now(); segarkan() }, 15000) : null
  // Masukkan ke pemantau latar supaya halaman boleh ditinggal.
  if (on && d.value?.oral?.id) {
    watchOral({ oral_id: d.value.oral.id, participant_id: d.value.id, name: d.value.employee?.name || '' })
  }
}, { immediate: true })
async function segarkan() {
  if (busy.value || document.hidden || !d.value) return
  try {
    const data = await competencyApi.recapParticipant(d.value.id)
    if (busy.value) return
    isiReview(data)
    d.value = data
  } catch { /* coba lagi di putaran berikutnya */ }
}
onBeforeUnmount(() => clearInterval(timer))

// --- Asesor memperbaiki rekaman ---------------------------------------------
const bisaUbahRekaman = computed(() => d.value?.oral?.state === 'submitted' && d.value.cycle.state !== 'closed' && !d.value.validated)
const lampir = reactive({})
const unggah = reactive({ line: null, progress: 0 })
const opsiLampir = (l) => (lampir[l.id] ||= { kind: 'main', replace: true })
const perluLampiran = (l) => {
  const dipakai = l.recordings.filter((r) => !r.excluded)
  return !dipakai.some((r) => r.kind === 'main' && r.size) || dipakai.some((r) => r.transcript_state === 'failed')
}
function durasiAudio(file) {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file)
    const audio = new Audio()
    const selesai = (t) => { URL.revokeObjectURL(url); resolve(Number.isFinite(t) ? t : 0) }
    audio.onloadedmetadata = () => selesai(audio.duration)
    audio.onerror = () => selesai(0)
    setTimeout(() => selesai(0), 5000)
    audio.preload = 'metadata'
    audio.src = url
  })
}
async function lampirkan(l, e) {
  const file = e.target.files?.[0]
  e.target.value = ''
  if (!file) return
  if (file.size > 24 * 1024 * 1024) { error.value = 'Ukuran file maksimal 24 MB.'; return }
  const opsi = opsiLampir(l)
  unggah.line = l.id
  unggah.progress = 0
  await run(async () => competencyApi.attachOralRecording(l.id, opsi.kind, file, {
    replace: opsi.replace, duration: await durasiAudio(file), onProgress: (p) => { unggah.progress = p },
  }))
  unggah.line = null
}
const nilaiUlangKasus = (a) => run(() => competencyApi.requeueCase(a.id))
function ke(id) { if (id) router.push(`/dashboard/asesmen/rekap/${id}`) }
watch(() => route.params.id, (id) => { if (id) { catatanSah.value = ''; load(id); window.scrollTo({ top: 0 }) } })

const tour = useTour('asesmen-rincian', () => [
  { element: '[data-tour="det-kesimpulan"]', title: 'Kesimpulan di atas', text: 'Jenjang akhir, nilai tiap komponen, dan poin latihan. Dihitung otomatis dari nilai AI dan lead.', side: 'bottom' },
  { element: '[data-tour="det-mulai-lisan"]', title: 'Jalankan ujian lisan', text: 'Ujian lisan direkam oleh asesor bersama peserta. Tekan Mulai ujian lisan, bacakan soalnya, dan rekam jawaban peserta.', side: 'bottom' },
  { element: '[data-tour="det-lisan"]', title: 'Skor per soal', text: 'Tabel sama seperti sheet asesor lama. Klik baris untuk loncat ke rekaman soal itu.', side: 'top' },
  { element: '[data-tour="det-periksa"]', title: 'Periksa yang ditandai', text: 'Putar kutipan atau transkrip, lalu Setujui nilai AI atau ubah skor dengan alasan.', side: 'top' },
  { element: '[data-tour="det-sahkan"]', title: 'Sahkan', text: 'Setelah semua tanda diperiksa, sahkan. Hanya hasil yang disahkan yang masuk ke data karyawan saat periode ditutup.', side: 'top' },
])

onMounted(async () => { await load(); nextTick(() => tour.autoStart()) })
</script>
