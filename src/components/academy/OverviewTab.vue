<!-- Ringkasan angkatan untuk manajemen: kelas hari ini, ketercapaian kurikulum, kehadiran, siswa berisiko,
     sesi yang perlu dicek, jam mengajar mentor. -->
<template>
  <div>
    <div v-if="loading" class="grid gap-3 sm:grid-cols-4" aria-busy="true"><div v-for="i in 4" :key="i" class="u-card h-24 animate-pulse"></div></div>
    <div v-else-if="error" class="u-card p-6 text-center"><p class="font-bold">{{ error }}</p><button type="button" class="u-btn mt-3" @click="load">Coba lagi</button></div>

    <template v-else-if="o">
      <div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div class="a-stat is-kuning">
          <p class="text-xs font-extrabold uppercase tracking-[.06em]">Kurikulum tersampaikan</p>
          <p class="u-angka !text-[2rem]">{{ o.curriculum.delivered }}<span class="text-base">/{{ o.curriculum.total }}</span></p>
          <div class="a-bar mt-1"><span :style="{ width: `${pct(o.curriculum.delivered, o.curriculum.total)}%` }"></span></div>
        </div>
        <div class="a-stat" :class="{ 'is-merah': o.attendance_avg != null && o.attendance_avg < 85 }">
          <p class="text-xs font-extrabold uppercase tracking-[.06em]">Rata-rata kehadiran</p>
          <p class="u-angka !text-[2rem]">{{ o.attendance_avg == null ? '–' : `${o.attendance_avg}%` }}</p>
          <p class="text-xs">{{ o.students.length }} siswa</p>
        </div>
        <div class="a-stat">
          <p class="text-xs font-extrabold uppercase tracking-[.06em]">Sesi</p>
          <p class="u-angka !text-[2rem]">{{ o.sessions.done }}<span class="text-base">/{{ o.sessions.total }}</span></p>
          <p class="text-xs">selesai · {{ o.sessions.upcoming }} akan datang</p>
        </div>
        <div class="a-stat" :class="{ 'is-merah': o.at_risk }">
          <p class="text-xs font-extrabold uppercase tracking-[.06em]">Siswa perlu perhatian</p>
          <p class="u-angka !text-[2rem]">{{ o.at_risk }}</p>
          <p class="text-xs">kehadiran &lt;85%, tertinggal, nilai rendah</p>
        </div>
      </div>

      <section class="mt-6">
        <h3 class="u-display text-xl font-extrabold">Kelas hari ini · {{ tanggal(o.today_date) }}</h3>
        <p v-if="!o.today.length" class="u-card mt-3 p-5 text-sm">Tidak ada sesi hari ini.</p>
        <ul v-else class="mt-3 grid gap-3 md:grid-cols-2">
          <li v-for="s in o.today" :key="s.id"><SessionCard :s="s" @open="$emit('open-session', s.id)" /></li>
        </ul>
      </section>

      <section v-if="o.attention.length" class="mt-6">
        <h3 class="u-display text-xl font-extrabold">Sesi perlu dicek (30 hari)</h3>
        <ul class="mt-3 grid gap-3 md:grid-cols-2">
          <li v-for="s in o.attention" :key="s.id"><SessionCard :s="s" @open="$emit('open-session', s.id)" /></li>
        </ul>
      </section>

      <section v-if="o.curriculum.behind.length" class="mt-6">
        <h3 class="u-display text-xl font-extrabold">Materi terlambat dari rencana</h3>
        <p class="u-help">Dijadwalkan di sesi yang sudah lewat, tapi belum tercatat disampaikan.</p>
        <div class="mt-2 flex flex-wrap gap-2"><span v-for="t in o.curriculum.behind" :key="t.id" class="u-chip u-chip-merah">{{ t.name }}</span></div>
      </section>

      <section class="mt-6">
        <h3 class="u-display text-xl font-extrabold">Siswa</h3>
        <div class="mt-3 overflow-x-auto rounded-[14px] border-[2.5px] border-[color:var(--ink)] bg-white">
          <table class="w-full min-w-[640px] text-left text-sm">
            <thead class="bg-[color:var(--stabilo)]"><tr>
              <th class="px-3 py-2 font-extrabold">Nama</th><th class="px-3 py-2 font-extrabold">Hadir</th><th class="px-3 py-2 font-extrabold">Kompeten</th>
              <th class="px-3 py-2 font-extrabold">Tertinggal</th><th class="px-3 py-2 font-extrabold">Quiz</th><th class="px-3 py-2 font-extrabold">Mingguan</th><th class="px-3 py-2 font-extrabold">Catatan</th>
            </tr></thead>
            <tbody>
              <tr v-for="r in urut" :key="r.participant.id" class="border-t-2 border-[color:var(--ink)]" :class="{ 'bg-[color:var(--merah-muda)]': r.risk.length }">
                <td class="px-3 py-2"><button type="button" class="font-extrabold hover:underline underline-offset-4" @click="$emit('open-student', r.participant)">{{ r.participant.name }}</button></td>
                <td class="px-3 py-2 tabular-nums">{{ r.attendance.rate == null ? '–' : `${r.attendance.rate}%` }}</td>
                <td class="px-3 py-2 tabular-nums">{{ r.tally.competent }}/{{ o.curriculum.total }}</td>
                <td class="px-3 py-2 tabular-nums">{{ r.tally.missed || '–' }}</td>
                <td class="px-3 py-2 tabular-nums">{{ r.quiz_avg ?? '–' }}</td>
                <td class="px-3 py-2 tabular-nums">{{ r.weekly_avg ?? '–' }}</td>
                <td class="px-3 py-2 text-xs font-bold">{{ r.risk.join(' · ') }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section v-if="o.mentor_hours.length" class="mt-6">
        <h3 class="u-display text-xl font-extrabold">Jam mengajar mentor</h3>
        <ul class="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <li v-for="m in o.mentor_hours" :key="m.name" class="u-card p-3"><p class="font-extrabold">{{ m.name }}</p><p class="text-sm">{{ m.sessions }} sesi · {{ m.hours }} jam</p></li>
        </ul>
      </section>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { academyApi, tanggal } from '../../services/academyApi'
import SessionCard from './SessionCard.vue'

const props = defineProps({ program: Object })
defineEmits(['open-session', 'open-student'])
const o = ref(null)
const loading = ref(true)
const error = ref('')

const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0)
const urut = computed(() => [...(o.value?.students || [])].sort((a, b) => b.risk.length - a.risk.length || a.participant.name.localeCompare(b.participant.name)))

async function load() {
  loading.value = true
  error.value = ''
  try { o.value = await academyApi.overview(props.program.id) } catch (e) { error.value = e.message } finally { loading.value = false }
}

watch(() => props.program.id, load)
onMounted(load)
defineExpose({ load })
</script>
