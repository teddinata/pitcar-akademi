<!-- Rekap Asesmen Terpadu per periode: ringkasan AI periode + peta departemen × level di atas, tabel peserta
     (departemen, skor L1-L4, komponen, jenjang, status, rekomendasi AI) di bawah. Klik peserta untuk rincian & pengesahan. -->
<template>
  <div class="ujian min-h-screen p-4 md:p-6">
    <AsesmenNav title="Rekap & Validasi" subtitle="Nilai AI dari rekaman jadi penilaian utama. Asesor cukup mengecek peserta bertanda kuning, lalu mengesahkan." :admin="isAdmin" @help="tour.replay()">
      <template #actions>
        <button v-if="data?.rows.length" class="u-btn !min-h-10" @click="unduh"><ArrowDownTrayIcon class="w-5 h-5" />Unduh CSV</button>
      </template>
    </AsesmenNav>

    <div class="mb-4 flex flex-wrap items-end gap-3" data-tour="rekap-periode">
      <div>
        <label for="rk-periode" class="u-label">Periode</label>
        <select id="rk-periode" v-model="cycleId" class="u-input !w-auto min-w-[16rem]" @change="pilihPeriode">
          <option v-for="c in cycles" :key="c.id" :value="c.id">{{ c.name }} · {{ STATE[c.state] }}</option>
        </select>
      </div>
      <template v-if="data?.rows.length">
        <div>
          <label for="rk-dept" class="u-label">Departemen</label>
          <select id="rk-dept" v-model="departemen" class="u-input !w-auto min-w-[12rem]" data-tour="rekap-departemen">
            <option value="">Semua departemen</option>
            <option v-for="d in daftarDepartemen" :key="d" :value="d">{{ d }}</option>
          </select>
        </div>
        <div>
          <label for="rk-job" class="u-label">Jabatan</label>
          <select id="rk-job" v-model="jabatan" class="u-input !w-auto min-w-[12rem]" data-tour="rekap-jabatan">
            <option value="">Semua jabatan</option>
            <option v-for="j in daftarJabatan" :key="j" :value="j">{{ j }}</option>
          </select>
        </div>
        <div>
          <label for="rk-urut" class="u-label">Urutkan</label>
          <select id="rk-urut" v-model="urut" class="u-input !w-auto">
            <option v-for="u in URUTAN" :key="u.key" :value="u.key">{{ u.label }}</option>
          </select>
        </div>
        <button type="button" class="u-btn u-btn-hitam ml-auto" :disabled="aiSibuk || !lengkapSemua" data-tour="rekap-ai" @click="prosesAi">
          <ArrowPathIcon v-if="aiSibuk" class="h-5 w-5 animate-spin motion-reduce:animate-none" />
          <SparklesIcon v-else class="h-5 w-5" />
          {{ aiSibuk ? `Menganalisis ${insight.done}/${insight.total}` : insight.state === 'done' ? 'Analisis ulang dengan AI' : 'Proses semua nilai sekarang' }}
        </button>
      </template>
    </div>

    <div v-if="loading" class="u-card h-64 animate-pulse"></div>
    <p v-else-if="error" class="u-card p-5 font-bold text-[color:var(--merah)]">{{ error }}</p>
    <div v-else-if="!cycles.length" class="u-card p-8 text-center">
      <p class="u-display text-xl font-extrabold">Belum ada periode Asesmen Terpadu</p>
      <p class="mt-1 text-[15px] text-[color:var(--ink-soft)]">{{ isAdmin ? 'Buat periode dulu di tab Periode.' : 'Anda belum ditunjuk sebagai asesor.' }}</p>
    </div>

    <template v-else-if="data">
      <!-- Ringkasan AI + peta departemen -->
      <div class="mb-5 grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <section class="u-card p-4 sm:p-5" aria-live="polite" data-tour="rekap-ringkasan">
          <h2 class="flex items-center gap-2 u-display text-xl font-extrabold"><SparklesIcon class="h-5 w-5" />Ringkasan periode</h2>
          <template v-if="insight.state === 'done' && insight.data">
            <p class="mt-2 text-sm">{{ insight.data.pola }}</p>
            <div class="mt-3 grid gap-4 sm:grid-cols-2">
              <div v-if="insight.data.aspek_lemah?.length"><h3 class="text-xs font-extrabold">Aspek terlemah</h3><ul class="mt-1 list-disc space-y-0.5 pl-5 text-sm"><li v-for="a in insight.data.aspek_lemah" :key="a">{{ a }}</li></ul></div>
              <div v-if="insight.data.pelatihan?.length"><h3 class="text-xs font-extrabold">Pelatihan bersama</h3><ul class="mt-1 list-disc space-y-0.5 pl-5 text-sm"><li v-for="a in insight.data.pelatihan" :key="a">{{ a }}</li></ul></div>
            </div>
            <div v-if="insight.data.prioritas?.length" class="mt-3">
              <h3 class="text-xs font-extrabold">Prioritas pembinaan</h3>
              <ul class="mt-1 space-y-1 text-sm">
                <li v-for="pr in insight.data.prioritas" :key="pr.id"><router-link v-if="barisById.get(pr.id)" :to="`/dashboard/asesmen/rekap/${pr.id}`" class="font-bold underline underline-offset-4">{{ barisById.get(pr.id).employee.name }}</router-link><span v-if="barisById.get(pr.id)?.employee.department" class="text-[color:var(--ink-soft)]"> ({{ barisById.get(pr.id).employee.department }})</span>: {{ pr.alasan }}</li>
              </ul>
            </div>
            <div v-if="insight.data.departemen?.length" class="mt-3">
              <h3 class="text-xs font-extrabold">Per departemen</h3>
              <ul class="mt-1 space-y-0.5 text-sm"><li v-for="d in insight.data.departemen" :key="d.departemen"><b>{{ d.departemen }}:</b> {{ d.catatan }}</li></ul>
            </div>
            <p class="mt-3 text-xs font-semibold text-[color:var(--ink-soft)]">Dibuat AI {{ waktu(insight.at) }} untuk semua peserta lengkap di periode ini, tanpa filter. Cek ulang sebelum dipakai untuk keputusan.</p>
          </template>
          <div v-else-if="aiSibuk" class="mt-3">
            <p class="text-sm font-bold">AI sedang membaca skor per level dan aspek: {{ insight.done }} dari {{ insight.total }} peserta selesai.</p>
            <div class="mt-2 h-3 overflow-hidden rounded-full border-2 border-[color:var(--ink)]"><div class="h-full bg-[color:var(--ink)] transition-[width] duration-500" :style="{ width: `${insight.total ? (insight.done / insight.total) * 100 : 5}%` }"></div></div>
            <p class="mt-2 text-xs font-semibold text-[color:var(--ink-soft)]">Halaman ini boleh ditinggal; analisis berjalan di server. Rekomendasi peserta muncul di tabel begitu siap.</p>
          </div>
          <div v-else class="mt-3 rounded-xl border-2 border-dashed border-[color:var(--ink)] p-4 text-sm">
            <p v-if="insight.state === 'failed'" class="font-bold text-[color:var(--merah-tua)]">Analisis terakhir gagal: {{ insight.error }}</p>
            <p v-else class="font-bold">Ringkasan muncul setelah AI menganalisis periode ini.</p>
            <p class="mt-1">AI membaca skor per level dan aspek semua peserta yang nilainya lengkap, lalu menulis rekomendasi tiap peserta dan ringkasan periode: pola umum, aspek terlemah, siapa yang diprioritaskan, dan pelatihan bersama.</p>
            <p v-if="!lengkapSemua" class="mt-1 font-semibold">Belum ada peserta yang nilainya lengkap.</p>
          </div>
        </section>

        <section class="u-card p-4 sm:p-5" data-tour="rekap-departemen-peta">
          <h2 class="u-display text-xl font-extrabold">Rata-rata lisan per departemen</h2>
          <p class="text-xs font-semibold text-[color:var(--ink-soft)]">Skor 1-5 per level, mengikuti filter jabatan. Klik departemen untuk menyaring tabel.</p>
          <div class="mt-2 overflow-x-auto">
            <table class="w-full min-w-[22rem] text-sm">
              <thead><tr class="text-left text-xs font-extrabold"><th class="py-1">Departemen</th><th v-for="l in 4" :key="l" class="py-1 text-center">L{{ l }}</th><th class="py-1 text-right">Lisan</th></tr></thead>
              <tbody>
                <tr v-for="h in petaDepartemen" :key="h.d">
                  <td class="py-1 pr-2"><button type="button" class="min-h-9 text-left font-bold underline-offset-4 hover:underline" :class="departemen === h.d ? 'underline' : ''" :aria-pressed="departemen === h.d" @click="departemen = departemen === h.d ? '' : h.d">{{ h.d }}</button> <span class="text-xs font-semibold text-[color:var(--ink-soft)]">{{ h.n }}</span></td>
                  <td v-for="(v, i) in h.lv" :key="i" class="py-1 text-center"><span class="u-skor !h-8 !min-w-[2.6rem] !text-[.8rem]" :class="skorClass(v)">{{ v == null ? '–' : num(v) }}</span></td>
                  <td class="py-1 text-right font-extrabold tabular-nums">{{ h.pct == null ? '–' : `${num(h.pct, 1)}%` }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <h3 class="mt-4 text-sm font-extrabold">Rata-rata per aspek (semua level)</h3>
          <ul class="mt-2 space-y-1.5">
            <li v-for="x in rataAspek" :key="x.code" class="grid grid-cols-[9.5rem_minmax(0,1fr)_3rem] items-center gap-2 text-sm">
              <span class="truncate font-semibold">{{ x.label }}</span>
              <span class="h-3 overflow-hidden rounded-full border-2 border-[color:var(--ink)]"><span class="block h-full bg-[color:var(--ink)]" :style="{ width: `${((x.v || 0) / 5) * 100}%` }"></span></span>
              <span class="text-right font-extrabold tabular-nums">{{ x.v == null ? '–' : num(x.v) }}</span>
            </li>
          </ul>
        </section>
      </div>

      <!-- Saring per status -->
      <section class="mb-5 grid grid-cols-2 gap-3 md:grid-cols-5" data-tour="rekap-angka">
        <button v-for="s in KARTU" :key="s.key" type="button" class="u-card p-3 text-left transition-transform" :class="[filter === s.key ? '!bg-[color:var(--stabilo)] -translate-y-0.5' : '', s.bg]" :aria-pressed="filter === s.key" @click="filter = filter === s.key ? 'all' : s.key">
          <p class="u-angka !text-[2rem]">{{ hitung(s.key) }}</p>
          <p class="mt-1 text-sm font-extrabold">{{ s.label }}</p>
        </button>
      </section>

      <div class="mb-3 flex flex-wrap items-center gap-x-4 gap-y-2">
        <div class="u-tabs !pb-0" data-tour="rekap-tampilan">
          <button v-for="t in TAMPILAN" :key="t.key" type="button" class="u-tab !min-h-11" :class="tampil === t.key ? 'is-active' : ''" :aria-pressed="tampil === t.key" @click="tampil = t.key">{{ t.label }}</button>
        </div>
        <p class="text-sm font-semibold text-[color:var(--ink-soft)]">{{ tampil === 'kompetensi' ? 'Nilai tiap kompetensi dari studi kasus dan lead. Klik kompetensi untuk meranking peserta di kompetensi itu.' : 'Lisan per level, komponen, skor akhir, dan jenjang tiap peserta.' }}</p>
      </div>

      <!-- Tabel: satu baris per peserta, panah membuka rincian aspek & rekomendasi AI di tempat -->
      <template v-if="tampil === 'peserta'">
      <section class="overflow-x-auto rounded-xl border-[2.5px] border-[color:var(--ink)] bg-white shadow-[4px_4px_0_var(--ink)]" data-tour="rekap-tabel">
        <table class="u-table min-w-[91rem]">
          <thead><tr>
            <th class="w-12"><span class="sr-only">Rincian</span></th>
            <th class="w-12 text-center">#</th>
            <th>Peserta</th>
            <th>Departemen</th>
            <template v-if="data.cycle.oral_enabled"><th v-for="l in 4" :key="l" class="text-center">L{{ l }} <span class="opacity-70">{{ bobotLevel(l) }}%</span></th></template>
            <th v-if="data.cycle.oral_enabled" class="text-right">Lisan ({{ data.cycle.weights.oral }})</th>
            <th v-if="data.cycle.cases.length" class="text-center">Kasus ({{ data.cycle.weights.case }})</th>
            <th v-if="data.cycle.lead_enabled" class="text-center">Lead ({{ data.cycle.weights.lead }})</th>
            <th class="text-center">Skor akhir</th>
            <th>Jenjang</th><th>Status</th><th>Rekomendasi AI</th>
          </tr></thead>
          <tbody>
            <tr v-if="!baris.length"><td :colspan="kolom" class="py-6 text-center text-sm">Tidak ada peserta di filter ini.</td></tr>
            <template v-for="(r, i) in baris" :key="r.id">
              <tr v-if="urut === 'peringkat' && !peringkat.get(r.id) && (i === 0 || peringkat.get(baris[i - 1].id))" class="!cursor-default">
                <td :colspan="kolom" class="!py-2 text-xs font-extrabold uppercase tracking-wide bg-[#f5f1e8]">Belum lengkap · tanpa peringkat</td>
              </tr>
              <tr v-if="urut === 'departemen' && (i === 0 || deptOf(baris[i - 1]) !== deptOf(r))" class="!cursor-default">
                <td :colspan="kolom" class="!py-2 text-xs font-extrabold uppercase tracking-wide bg-[#f5f1e8]">{{ deptOf(r) }}</td>
              </tr>
              <tr class="is-click" @click="buka(r)">
                <td @click.stop>
                  <button type="button" class="grid h-10 w-10 place-items-center rounded-lg border-2 border-[color:var(--ink)] bg-white hover:bg-[#fffbe0]" :aria-expanded="terbuka.has(r.id)" :aria-label="`${terbuka.has(r.id) ? 'Tutup' : 'Buka'} rincian ${r.employee.name}`" @click="toggle(r.id)">
                    <ChevronDownIcon class="h-4 w-4 transition-transform motion-reduce:transition-none" :class="terbuka.has(r.id) ? 'rotate-180' : ''" />
                  </button>
                </td>
                <td class="text-center">
                  <span v-if="peringkat.get(r.id)" class="u-display text-xl font-extrabold tabular-nums" :class="peringkat.get(r.id) <= 3 ? '' : 'text-[color:var(--ink-soft)]'">{{ peringkat.get(r.id) }}</span>
                  <span v-else class="text-sm">–</span>
                </td>
                <td class="min-w-[10rem]"><router-link :to="`/dashboard/asesmen/rekap/${r.id}`" class="font-bold leading-tight hover:underline underline-offset-4" @click.stop>{{ r.employee.name }}</router-link><p class="text-xs text-[color:var(--ink-soft)]">{{ r.employee.job }}</p></td>
                <td class="font-semibold">{{ r.employee.department || '–' }}</td>
                <template v-if="data.cycle.oral_enabled">
                  <td v-for="l in 4" :key="l" class="text-center">
                    <span v-if="skorLevel(r, l) != null" class="u-skor" :class="skorClass(skorLevel(r, l))">{{ num(skorLevel(r, l)) }}</span>
                    <span v-else-if="l === 1 && !r.oral_levels?.length" class="text-xs">{{ r.oral ? ORAL_STATE(r.oral) : '–' }}</span>
                    <span v-else class="text-sm">–</span>
                  </td>
                </template>
                <td v-if="data.cycle.oral_enabled" class="whitespace-nowrap text-right">
                  <template v-if="r.summary.components.oral?.status === 'done'">
                    <span class="font-extrabold tabular-nums">{{ pct(r.oral_percent) }}</span>
                    <span v-if="grade(r.oral_percent)" class="block text-[11px] font-bold">{{ grade(r.oral_percent).g }} · {{ grade(r.oral_percent).label }}</span>
                    <span v-if="r.summary.open_flags" class="u-chip u-chip-kuning !text-[10px] mt-0.5">{{ r.summary.open_flags }} ditandai</span>
                  </template>
                  <span v-else class="text-sm">–</span>
                </td>
                <td v-if="data.cycle.cases.length" class="text-center"><Komponen :c="r.summary.components.case" /></td>
                <td v-if="data.cycle.lead_enabled" class="text-center"><Komponen :c="r.summary.components.lead" /></td>
                <td class="text-center">
                  <span v-if="r.summary.final_level && r.summary.combined != null" class="u-level" :class="levelClass(r.summary.combined)" :title="`Rata-rata berbobot komponen: ${num(r.summary.combined)} dari 4`">{{ num(r.summary.combined) }}</span>
                  <span v-else class="text-sm">–</span>
                </td>
                <td class="whitespace-nowrap">
                  <template v-if="r.summary.final_level">
                    <span class="u-level" :class="levelClass(r.summary.final_level)" :title="r.summary.final_name">L{{ r.summary.final_level }}</span>
                    <span v-if="r.summary.inconsistent" class="block mt-1 text-[11px] font-extrabold text-[color:var(--merah-tua)]">Beda {{ num(r.summary.spread, 1) }} level</span>
                  </template>
                  <span v-else class="text-sm">–</span>
                </td>
                <td><span class="u-chip whitespace-nowrap !text-[11px]" :class="STATUS[r.summary.status].chip">{{ STATUS[r.summary.status].label }}</span></td>
                <td class="min-w-[14rem] max-w-[20rem] text-xs">
                  <span v-if="r.ai_reco" class="font-semibold">{{ r.ai_reco.ringkas }}</span>
                  <span v-else-if="aiSibuk && r.summary.complete" class="text-[color:var(--ink-soft)]">Menunggu AI...</span>
                  <span v-else class="text-[color:var(--ink-soft)]">{{ r.summary.complete ? 'Belum dianalisis' : 'Nilai belum lengkap' }}</span>
                </td>
              </tr>
              <!-- Rincian di tempat: aspek x level (seperti sheet Detail Nilai) + rekomendasi AI -->
              <tr v-if="terbuka.has(r.id)" class="!cursor-default">
                <td :colspan="kolom" class="!bg-[#fffdf0]">
                  <div class="grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
                    <div class="min-w-0 overflow-x-auto">
                      <table v-if="r.oral_levels?.length" class="w-full min-w-[44rem] text-sm">
                        <thead><tr class="text-left text-xs font-extrabold">
                          <th class="py-1 pr-2">Level</th><th class="py-1 pr-2">Bobot</th>
                          <th v-for="a in data.aspects" :key="a.code" class="py-1 pr-2 text-center">{{ a.label }}</th>
                          <th class="py-1 text-center">Skor level</th>
                        </tr></thead>
                        <tbody>
                          <tr v-for="lv in r.oral_levels" :key="lv.level">
                            <td class="whitespace-nowrap py-1 pr-2 font-extrabold">Level {{ lv.level }}</td>
                            <td class="py-1 pr-2 tabular-nums">{{ bobotLevel(lv.level) }}%</td>
                            <td v-for="a in data.aspects" :key="a.code" class="py-1 pr-2 text-center"><span class="u-skor" :class="skorClass(lv.aspects?.[a.code])">{{ lv.aspects?.[a.code] ?? '–' }}</span></td>
                            <td class="py-1 text-center"><span class="u-skor !min-w-[3.2rem]" :class="skorClass(lv.score)">{{ lv.score == null ? '–' : num(lv.score) }}</span></td>
                          </tr>
                        </tbody>
                      </table>
                      <p v-else class="text-sm">Ujian lisan belum dinilai, jadi rincian aspek belum ada.</p>
                    </div>
                    <div class="rounded-xl border-2 border-[color:var(--ink)] bg-white p-3 text-sm">
                      <p class="flex items-center gap-1.5 font-extrabold"><SparklesIcon class="h-4 w-4" />Rekomendasi AI</p>
                      <template v-if="r.ai_reco">
                        <p class="mt-1.5 font-semibold">{{ r.ai_reco.ringkas }}</p>
                        <template v-if="r.ai_reco.fokus?.length"><p class="mt-2 text-xs font-extrabold">Fokus perbaikan</p><ul class="list-disc pl-5"><li v-for="f in r.ai_reco.fokus" :key="f">{{ f }}</li></ul></template>
                        <template v-if="r.ai_reco.kekuatan?.length"><p class="mt-2 text-xs font-extrabold">Kekuatan</p><ul class="list-disc pl-5"><li v-for="k in r.ai_reco.kekuatan" :key="k">{{ k }}</li></ul></template>
                        <template v-if="r.ai_reco.rencana"><p class="mt-2 text-xs font-extrabold">Rencana 1 bulan</p><p>{{ r.ai_reco.rencana }}</p></template>
                      </template>
                      <p v-else class="mt-1 text-[color:var(--ink-soft)]">{{ r.summary.complete ? 'Belum dianalisis. Tekan "Proses semua nilai sekarang" di atas.' : 'Muncul setelah nilai peserta lengkap.' }}</p>
                      <router-link :to="`/dashboard/asesmen/rekap/${r.id}`" class="u-btn u-btn-kecil mt-3">Buka halaman peserta</router-link>
                    </div>
                  </div>
                </td>
              </tr>
            </template>
            <tr v-if="baris.length && data.cycle.oral_enabled" class="!cursor-default">
              <td class="!bg-[#ececec]"></td><td class="!bg-[#ececec]"></td>
              <td class="!bg-[#ececec] font-extrabold">Rata-rata</td><td class="!bg-[#ececec]"></td>
              <td v-for="l in 4" :key="l" class="!bg-[#ececec] text-center font-extrabold tabular-nums">{{ rataLevel(l) == null ? '–' : num(rataLevel(l)) }}</td>
              <td class="!bg-[#ececec] text-right font-extrabold tabular-nums">{{ rataPct == null ? '–' : `${num(rataPct, 1)}%` }}</td>
              <td v-if="kolomKomponen" :colspan="kolomKomponen" class="!bg-[#ececec]"></td>
              <td class="!bg-[#ececec] text-center font-extrabold tabular-nums">{{ rataSkorAkhir == null ? '–' : num(rataSkorAkhir) }}</td>
              <td colspan="3" class="!bg-[#ececec]"></td>
            </tr>
          </tbody>
        </table>
      </section>
      <p class="mt-3 text-sm text-[color:var(--ink-soft)]">Skor akhir = rata-rata berbobot komponen yang dipakai (angka di kepala kolom). Jenjang mengikuti skor akhir, paling tinggi satu level di atas komponen terendah. "Sumber berbeda" muncul bila selisih komponen ≥ 1,5 level: dengarkan rekamannya sebelum mengesahkan.</p>
      <p class="mt-1 text-sm text-[color:var(--ink-soft)]">Peringkat dihitung di dalam departemen dan jabatan terpilih: jenjang akhir dulu, lalu nilai gabungan, lalu nilai lisan. Nilai sama mendapat nomor sama.</p>
      </template>

      <!-- Per kompetensi: heatmap peserta x pilar, kunci kompetensi di atas sekaligus tombol ranking -->
      <template v-else>
        <section v-if="!pilar.length" class="u-card p-5 text-sm">
          <p class="font-extrabold">Belum ada nilai per kompetensi di periode ini.</p>
          <p class="mt-1">Nilai kompetensi berasal dari studi kasus (dinilai AI) dan penilaian lead. Kolom muncul begitu salah satunya selesai untuk seorang peserta.</p>
        </section>
        <template v-else>
          <ul class="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-7" data-tour="rekap-kompetensi">
            <li v-for="pl in pilar" :key="pl.code">
              <button type="button" class="flex h-full min-h-11 w-full flex-col items-start gap-1 rounded-xl border-2 border-[color:var(--ink)] p-3 text-left transition-colors motion-reduce:transition-none" :class="urutPilar === pl.code ? 'bg-[color:var(--stabilo)]' : 'bg-white hover:bg-[#fffbe0]'" :aria-pressed="urutPilar === pl.code" @click="pilihPilar(pl.code)">
                <span class="flex w-full items-center justify-between gap-2">
                  <span class="u-display text-xl font-extrabold leading-none">{{ pl.short }}</span>
                  <span class="u-level !h-7 !min-w-[2.5rem] !text-sm" :class="levelClass(pl.rata)" :title="`Rata-rata ${pl.name}`">{{ pl.rata == null ? '–' : num(pl.rata, 1) }}</span>
                </span>
                <span class="text-xs font-semibold leading-snug">{{ pl.name }}</span>
                <span v-if="pl.code === ujung.lemah" class="u-chip u-chip-merah !text-[10px]">Paling lemah</span>
                <span v-else-if="pl.code === ujung.kuat" class="u-chip u-chip-hijau !text-[10px]">Paling kuat</span>
              </button>
            </li>
          </ul>
          <section class="overflow-x-auto rounded-xl border-[2.5px] border-[color:var(--ink)] bg-white shadow-[4px_4px_0_var(--ink)]">
            <table class="u-table min-w-[64rem]">
              <thead><tr>
                <th class="w-12 text-center">#</th>
                <th>Peserta</th>
                <th>Departemen</th>
                <th v-if="data.cycle.oral_enabled" class="text-right">Lisan</th>
                <th v-for="pl in pilar" :key="pl.code" class="!px-1 text-center" :aria-sort="urutPilar === pl.code ? 'descending' : 'none'">
                  <button type="button" class="min-h-10 min-w-[3rem] rounded-md px-2 font-extrabold uppercase" :class="urutPilar === pl.code ? 'bg-[color:var(--stabilo)] text-[color:var(--ink)]' : 'hover:bg-white/20'" :title="pl.name" :aria-label="`Ranking menurut ${pl.name}`" @click="pilihPilar(pl.code)">{{ pl.short }}</button>
                </th>
                <th class="text-center">Skor akhir</th>
                <th>Jenjang</th>
              </tr></thead>
              <tbody>
                <tr v-if="!barisKompetensi.length"><td :colspan="kolomKompetensi" class="py-6 text-center text-sm">Tidak ada peserta di filter ini.</td></tr>
                <tr v-for="r in barisKompetensi" :key="r.id" class="is-click" @click="buka(r)">
                  <td class="text-center">
                    <span v-if="rankKompetensi.get(r.id)" class="u-display text-xl font-extrabold tabular-nums" :class="rankKompetensi.get(r.id) <= 3 ? '' : 'text-[color:var(--ink-soft)]'">{{ rankKompetensi.get(r.id) }}</span>
                    <span v-else class="text-sm">–</span>
                  </td>
                  <td class="min-w-[10rem]"><router-link :to="`/dashboard/asesmen/rekap/${r.id}`" class="font-bold leading-tight hover:underline underline-offset-4" @click.stop>{{ r.employee.name }}</router-link><p class="text-xs text-[color:var(--ink-soft)]">{{ r.employee.job }}</p></td>
                  <td class="font-semibold">{{ r.employee.department || '–' }}</td>
                  <td v-if="data.cycle.oral_enabled" class="whitespace-nowrap text-right font-extrabold tabular-nums">{{ r.summary.components.oral?.status === 'done' ? pct(r.oral_percent) : '–' }}</td>
                  <td v-for="pl in pilar" :key="pl.code" class="!px-1 text-center" :class="urutPilar === pl.code ? '!bg-[#fffbe0]' : ''">
                    <span v-if="nilaiPilar(r, pl.code) != null" class="u-level" :class="levelClass(nilaiPilar(r, pl.code))">{{ num(nilaiPilar(r, pl.code), 1) }}</span>
                    <span v-else class="text-sm">–</span>
                  </td>
                  <td class="text-center">
                    <span v-if="r.summary.final_level && r.summary.combined != null" class="u-level" :class="levelClass(r.summary.combined)">{{ num(r.summary.combined) }}</span>
                    <span v-else class="text-sm">–</span>
                  </td>
                  <td><span v-if="r.summary.final_level" class="u-level" :class="levelClass(r.summary.final_level)" :title="r.summary.final_name">L{{ r.summary.final_level }}</span><span v-else class="text-sm">–</span></td>
                </tr>
                <tr v-if="barisKompetensi.length" class="!cursor-default">
                  <td class="!bg-[#ececec]"></td>
                  <td class="!bg-[#ececec] font-extrabold">Rata-rata</td>
                  <td class="!bg-[#ececec]"></td>
                  <td v-if="data.cycle.oral_enabled" class="!bg-[#ececec] text-right font-extrabold tabular-nums">{{ rataPct == null ? '–' : `${num(rataPct, 1)}%` }}</td>
                  <td v-for="pl in pilar" :key="pl.code" class="!bg-[#ececec] text-center font-extrabold tabular-nums">{{ pl.rata == null ? '–' : num(pl.rata, 1) }}</td>
                  <td class="!bg-[#ececec] text-center font-extrabold tabular-nums">{{ rataSkorAkhir == null ? '–' : num(rataSkorAkhir) }}</td>
                  <td class="!bg-[#ececec]"></td>
                </tr>
              </tbody>
            </table>
          </section>
          <p class="mt-3 text-sm text-[color:var(--ink-soft)]">Nilai kompetensi = rata-rata berbobot studi kasus ({{ data.cycle.weights.case }}) dan lead ({{ data.cycle.weights.lead }}) untuk kompetensi itu, skala 1-4. Ujian lisan dinilai per aspek, jadi tampil sebagai persen terpisah. "–" berarti kompetensi itu belum dinilai untuk peserta tersebut.</p>
          <p class="mt-1 text-sm text-[color:var(--ink-soft)]">{{ urutPilar ? `Ranking menurut ${pilar.find((x) => x.code === urutPilar)?.name}, di dalam departemen dan jabatan terpilih. Nilai sama mendapat nomor sama.` : 'Tanpa kompetensi terpilih, urutan dan nomor mengikuti peringkat keseluruhan.' }}</p>
        </template>
      </template>
    </template>
  </div>
</template>

<script setup>
import '@fontsource-variable/bricolage-grotesque'
import '../../styles/exam.css'
import '../../styles/asesmen.css'
import { computed, defineComponent, h, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowDownTrayIcon, ArrowPathIcon, ChevronDownIcon, SparklesIcon } from '@heroicons/vue/24/outline'
import AsesmenNav from '../../components/asesmen/AsesmenNav.vue'
import { competencyApi } from '../../services/competencyApi'
import { useTour } from '../../composables/useTour'
import { notify } from '../../components/leader/notice'
import { COMPONENT_STATUS, ORAL_STATE, STATUS, levelClass, num, pct, skorClass } from '../../utils/asesmen'

const STATE = { draft: 'Draf', open: 'Berjalan', closed: 'Ditutup' }
const KARTU = [
  { key: 'all', label: 'Peserta', bg: '' },
  { key: 'incomplete', label: 'Belum lengkap', bg: '' },
  { key: 'review', label: 'Perlu dicek', bg: 'bg-[#fff6bf]' },
  { key: 'ready', label: 'Siap disahkan', bg: 'bg-[#fde8e8]' },
  { key: 'validated', label: 'Disahkan', bg: 'bg-[#d9f2e3]' },
]
const URUTAN = [
  { key: 'peringkat', label: 'Peringkat' },
  { key: 'departemen', label: 'Departemen, lalu peringkat' },
  { key: 'lisan', label: 'Nilai lisan tertinggi' },
  { key: 'nama', label: 'Nama' },
]
const POLL_MS = 4000
const TAMPILAN = [
  { key: 'peserta', label: 'Per peserta' },
  { key: 'kompetensi', label: 'Per kompetensi' },
]
// Singkatan pilar mekanik seperti di sheet asesor; pilar lain memakai huruf depan namanya.
const KODE_PILAR = { servis_berkala: 'SB', diagnosa: 'DP', kelistrikan: 'KS', kualitas: 'QC', kerja_tim: 'DT', cepat_rapi: 'KR', komunikasi: 'SA' }
const singkat = (p) => KODE_PILAR[p.code] || p.name.split(/[\s&,]+/).filter((w) => w && w.toLowerCase() !== 'dan').map((w) => w[0]).join('').slice(0, 3).toUpperCase()

const Komponen = defineComponent({
  props: { c: Object },
  setup(props) {
    return () => {
      const c = props.c
      if (!c || c.status === 'none') return h('span', { class: 'text-sm' }, '–')
      if (c.status !== 'done') return h('span', { class: 'text-sm' }, `${COMPONENT_STATUS[c.status]}${c.total ? ` ${c.done}/${c.total}` : ''}`)
      return h('span', {}, [h('span', { class: `u-level ${levelClass(c.level)}` }, num(c.level, 1))])
    }
  },
})

const route = useRoute()
const router = useRouter()
const loading = ref(true)
const error = ref('')
const cycles = ref([])
const cycleId = ref(null)
const data = ref(null)
const isAdmin = ref(false)
const filter = ref('all')
const q = (k) => (typeof route.query[k] === 'string' ? route.query[k] : '')
const urut = ref(URUTAN.some((u) => u.key === route.query.urut) ? route.query.urut : 'peringkat')
const jabatan = ref(q('jabatan'))
const departemen = ref(q('departemen'))
const tampil = ref(q('tampil') === 'kompetensi' ? 'kompetensi' : 'peserta')
const urutPilar = ref(q('pilar'))
const insight = ref({ state: 'none', data: null, at: null, error: '', done: 0, total: 0 })
let pollTimer = null

const deptOf = (r) => r.employee.department || 'Tanpa departemen'
const unik = (list) => [...new Set(list.filter(Boolean))].sort((a, b) => a.localeCompare(b, 'id'))
const daftarJabatan = computed(() => unik((data.value?.rows || []).map((r) => r.employee.job)))
const daftarDepartemen = computed(() => unik((data.value?.rows || []).map((r) => r.employee.department)))
const barisById = computed(() => new Map((data.value?.rows || []).map((r) => [r.id, r])))
const lengkapSemua = computed(() => (data.value?.rows || []).some((r) => r.summary.complete))
const aiSibuk = computed(() => ['queued', 'running'].includes(insight.value.state))
// Kolom tabel yang tampil, untuk colspan baris pemisah & rincian.
const kolomKomponen = computed(() => (data.value?.cycle.cases.length ? 1 : 0) + (data.value?.cycle.lead_enabled ? 1 : 0))
const kolom = computed(() => 8 + (data.value?.cycle.oral_enabled ? 5 : 0) + (data.value?.cycle.cases.length ? 1 : 0) + (data.value?.cycle.lead_enabled ? 1 : 0))
const bobotLevel = (l) => data.value?.cycle.oral_weights?.[String(l)] ?? ''
// Grade lisan seperti sheet asesor: B >= 80, C 70-79, D 60-69, E di bawah 60 (di bawah 50: pelatihan ulang).
const grade = (v) => {
  if (v == null) return null
  if (v >= 90) return { g: 'A', label: 'Istimewa' }
  if (v >= 80) return { g: 'B', label: 'Sangat baik' }
  if (v >= 70) return { g: 'C', label: 'Baik' }
  if (v >= 60) return { g: 'D', label: 'Cukup' }
  return { g: 'E', label: v >= 50 ? 'Perlu pembinaan' : 'Perlu pelatihan ulang' }
}
const terbuka = ref(new Set())
const toggle = (id) => { const s = new Set(terbuka.value); if (s.has(id)) s.delete(id); else s.add(id); terbuka.value = s }

const barisJabatan = computed(() => (data.value?.rows || []).filter((r) => !jabatan.value || r.employee.job === jabatan.value))
// Baris di departemen & jabatan terpilih; kartu angka dan peringkat ikut filter ini.
const barisFilter = computed(() => barisJabatan.value.filter((r) => !departemen.value || r.employee.department === departemen.value))

const kunci = (r) => [r.summary.final_level || 0, r.summary.combined ?? -1, r.oral_percent ?? -1]
const banding = (a, b) => {
  const ka = kunci(a)
  const kb = kunci(b)
  for (let i = 0; i < ka.length; i += 1) if (ka[i] !== kb[i]) return kb[i] - ka[i]
  return 0
}
// id -> nomor peringkat (ranking kompetisi 1,1,3), tidak terpengaruh filter status.
const peringkat = computed(() => {
  const lengkap = barisFilter.value.filter((r) => r.summary.final_level).sort(banding)
  const out = new Map()
  lengkap.forEach((r, i) => out.set(r.id, i && banding(lengkap[i - 1], r) === 0 ? out.get(lengkap[i - 1].id) : i + 1))
  return out
})
const baris = computed(() => {
  const rows = barisFilter.value.filter((r) => filter.value === 'all' || r.summary.status === filter.value)
  const p = peringkat.value
  const byRank = (a, b) => (p.get(a.id) || Infinity) - (p.get(b.id) || Infinity) || a.employee.name.localeCompare(b.employee.name, 'id')
  if (urut.value === 'peringkat') return [...rows].sort(byRank)
  if (urut.value === 'departemen') return [...rows].sort((a, b) => deptOf(a).localeCompare(deptOf(b), 'id') || byRank(a, b))
  if (urut.value === 'lisan') return [...rows].sort((a, b) => (b.oral_percent ?? -1) - (a.oral_percent ?? -1))
  return [...rows].sort((a, b) => a.employee.name.localeCompare(b.employee.name, 'id'))
})
const hitung = (key) => barisFilter.value.filter((r) => key === 'all' || r.summary.status === key).length

const rata = (vals) => { const v = vals.filter((x) => x != null); return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null }
const skorLevel = (r, l) => r.oral_levels?.find((x) => x.level === l)?.score ?? null
const rataLevel = (l) => rata(baris.value.map((r) => skorLevel(r, l)))
const rataPct = computed(() => rata(baris.value.map((r) => r.oral_percent)))
const rataSkorAkhir = computed(() => rata(baris.value.map((r) => (r.summary.final_level ? r.summary.combined : null))))
const petaDepartemen = computed(() => unik(barisJabatan.value.map(deptOf)).map((d) => {
  const rows = barisJabatan.value.filter((r) => deptOf(r) === d)
  return { d, n: rows.length, lv: [1, 2, 3, 4].map((l) => rata(rows.map((r) => skorLevel(r, l)))), pct: rata(rows.map((r) => r.oral_percent)) }
}))
// --- Per kompetensi ---
const nilaiPilar = (r, code) => r.summary.pillar_levels?.[code] ?? null
const barisKompetensi = computed(() => {
  const rows = baris.value
  const code = urutPilar.value
  if (!code) return rows
  const p = peringkat.value
  return [...rows].sort((a, b) => (nilaiPilar(b, code) ?? -1) - (nilaiPilar(a, code) ?? -1)
    || (p.get(a.id) || Infinity) - (p.get(b.id) || Infinity) || a.employee.name.localeCompare(b.employee.name, 'id'))
})
// Kompetensi yang punya nilai di periode ini (pilar tanpa nilai sama sekali tidak dibuat kolom kosong).
const pilar = computed(() => {
  const rows = data.value?.rows || []
  return (data.value?.pillars || []).filter((pl) => rows.some((r) => nilaiPilar(r, pl.code) != null))
    .map((pl) => ({ ...pl, short: singkat(pl), rata: rata(barisKompetensi.value.map((r) => nilaiPilar(r, pl.code))) }))
})
const ujung = computed(() => {
  const ada = pilar.value.filter((pl) => pl.rata != null)
  if (ada.length < 2) return {}
  const urut2 = [...ada].sort((a, b) => a.rata - b.rata)
  if (urut2[0].rata === urut2[urut2.length - 1].rata) return {}
  return { lemah: urut2[0].code, kuat: urut2[urut2.length - 1].code }
})
// Nomor: ranking di kompetensi terpilih (dalam departemen & jabatan terpilih), atau peringkat keseluruhan.
const rankKompetensi = computed(() => {
  const code = urutPilar.value
  if (!code) return peringkat.value
  const ada = barisFilter.value.filter((r) => nilaiPilar(r, code) != null).sort((a, b) => nilaiPilar(b, code) - nilaiPilar(a, code))
  const out = new Map()
  ada.forEach((r, i) => out.set(r.id, i && nilaiPilar(ada[i - 1], code) === nilaiPilar(r, code) ? out.get(ada[i - 1].id) : i + 1))
  return out
})
const kolomKompetensi = computed(() => 5 + (data.value?.cycle.oral_enabled ? 1 : 0) + pilar.value.length)
const pilihPilar = (code) => { urutPilar.value = urutPilar.value === code ? '' : code }

const rataAspek = computed(() => (data.value?.aspects || []).map((a) => ({
  ...a, v: rata(barisFilter.value.flatMap((r) => (r.oral_levels || []).map((lv) => lv.aspects?.[a.code] ?? null))),
})))

watch([urut, jabatan, departemen, tampil, urutPilar], () => router.replace({ query: {
  ...route.query, urut: urut.value === 'peringkat' ? undefined : urut.value, jabatan: jabatan.value || undefined, departemen: departemen.value || undefined,
  tampil: tampil.value === 'peserta' ? undefined : tampil.value, pilar: urutPilar.value || undefined,
} }))

const waktu = (s) => (s ? new Date(String(s).replace(' ', 'T') + 'Z').toLocaleString('id-ID', { timeZone: 'Asia/Jakarta', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) + ' WIB' : '')

function stopPoll() { clearTimeout(pollTimer); pollTimer = null }
function terapkanStatus(res) {
  insight.value = res.insight
  for (const r of data.value?.rows || []) if (res.recos?.[r.id] !== undefined) r.ai_reco = res.recos[r.id]
}
async function poll() {
  stopPoll()
  if (!aiSibuk.value || !cycleId.value) return
  const id = cycleId.value
  pollTimer = setTimeout(async () => {
    try {
      const res = await competencyApi.insightStatus(id)
      if (id !== cycleId.value) return
      terapkanStatus(res)
      if (res.insight.state === 'done') notify.success('Analisis AI selesai')
      if (res.insight.state === 'failed') notify.error(res.insight.error || 'Analisis AI gagal')
    } catch (e) { /* sinyal putus sebentar: coba lagi di putaran berikut */ }
    poll()
  }, POLL_MS)
}
async function prosesAi() {
  try {
    terapkanStatus(await competencyApi.insightRun(cycleId.value))
    poll()
  } catch (e) { notify.error(e.message) }
}

async function muat() {
  if (!cycleId.value) return
  stopPoll()
  loading.value = true
  error.value = ''
  try {
    data.value = await competencyApi.recap(cycleId.value)
    insight.value = data.value.insight || insight.value
    poll()
  } catch (e) { error.value = e.message } finally { loading.value = false }
}
function pilihPeriode() { router.replace({ query: { ...route.query, periode: cycleId.value } }); muat() }
function buka(r) { router.push(`/dashboard/asesmen/rekap/${r.id}`) }

function unduh() {
  const kolomCsv = ['Peringkat', 'Peserta', 'Departemen', 'Jabatan', 'Lisan L1', 'Lisan L2', 'Lisan L3', 'Lisan L4', 'Lisan persen', 'Lisan jenjang',
    'Studi kasus', 'Lead', ...pilar.value.map((pl) => `${pl.short} ${pl.name}`), 'Gabungan', 'Jenjang akhir', 'Nama jenjang', 'Status', 'Rekomendasi AI']
  const sel = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const isi = baris.value.map((r) => [
    peringkat.value.get(r.id) ?? '', r.employee.name, r.employee.department, r.employee.job,
    ...[1, 2, 3, 4].map((l) => skorLevel(r, l) ?? ''), r.oral_percent ?? '', r.summary.components.oral?.level ?? '',
    r.summary.components.case?.level ?? '', r.summary.components.lead?.level ?? '', ...pilar.value.map((pl) => nilaiPilar(r, pl.code) ?? ''), r.summary.combined ?? '',
    r.summary.final_level ? `L${r.summary.final_level}` : '', r.summary.final_name || '', STATUS[r.summary.status].label, r.ai_reco?.ringkas || '',
  ].map(sel).join(';'))
  const blob = new Blob([`﻿${[kolomCsv.map(sel).join(';'), ...isi].join('\n')}`], { type: 'text/csv;charset=utf-8' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `rekap-${data.value.cycle.name.replace(/[^\w-]+/g, '-')}.csv`
  a.click()
  URL.revokeObjectURL(a.href)
}

const tour = useTour('asesmen-rekap', () => [
  { element: '[data-tour="rekap-periode"]', title: 'Pilih periode & saring', text: 'Saring per departemen (cabang) dan jabatan, lalu pilih urutan: peringkat, departemen, nilai lisan, atau nama.', side: 'bottom' },
  { element: '[data-tour="rekap-ai"]', title: 'Analisis AI', text: 'Tekan sekali setelah nilai lengkap. AI menulis rekomendasi tiap peserta dan ringkasan periode; prosesnya berjalan di server, halaman boleh ditinggal.', side: 'bottom' },
  { element: '[data-tour="rekap-departemen-peta"]', title: 'Bandingkan departemen', text: 'Rata-rata skor lisan per level di tiap departemen. Klik nama departemen untuk menyaring tabel.', side: 'left' },
  { element: '[data-tour="rekap-angka"]', title: 'Mulai dari "Perlu dicek"', text: 'Klik kotak untuk menyaring. Kuning = ada jawaban lisan yang ditandai (mepet batas, yakin tapi salah, terlalu pendek, AI ragu).', side: 'bottom' },
  { element: '[data-tour="rekap-tampilan"]', title: 'Per peserta atau per kompetensi', text: 'Per kompetensi menampilkan nilai SB, DP, KS, QC, DT, KR, SA tiap peserta berdampingan. Klik satu kompetensi untuk meranking peserta di kompetensi itu dan melihat mana yang paling lemah di tim.', side: 'bottom' },
  { element: '[data-tour="rekap-tabel"]', title: 'Satu baris satu peserta', text: 'Skor lisan L1-L4, komponen lain, jenjang, dan rekomendasi AI. Panah di kiri membuka rincian 6 aspek per level di tabel; klik baris untuk mendengar rekaman, memeriksa, lalu mengesahkan.', side: 'top' },
])

onMounted(async () => {
  try {
    const hasil = await competencyApi.terpaduCycles()
    cycles.value = hasil.cycles
    isAdmin.value = hasil.is_admin
    const qp = Number(route.query.periode)
    cycleId.value = cycles.value.some((c) => c.id === qp) ? qp : (cycles.value.find((c) => c.state === 'open') || cycles.value[0])?.id
    await muat()
  } catch (e) { error.value = e.message } finally { loading.value = false }
  nextTick(() => tour.autoStart())
})
onBeforeUnmount(stopPoll)
</script>
