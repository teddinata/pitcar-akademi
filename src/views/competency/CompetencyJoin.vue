<!-- Masuk lewat link tes yang dibagikan admin (/dashboard/lms/competency/join/:token).
     Peserta terdaftar langsung diarahkan ke lembar tesnya; selain itu tampil
     alasan yang jelas dan langkah berikutnya. -->
<template>
  <div class="ujian min-h-screen p-4 md:p-6 grid place-items-center">
    <div class="u-card p-6 sm:p-8 max-w-md w-full text-center">
      <template v-if="!pesan">
        <span class="u-ljk is-filled mx-auto !w-12 !h-12 animate-pulse" aria-hidden="true"></span>
        <p class="u-display mt-4 text-xl font-extrabold">Membuka lembar tes…</p>
      </template>
      <template v-else>
        <p class="u-display text-2xl font-extrabold leading-tight">{{ pesan.judul }}</p>
        <p class="mt-2 text-[15px] leading-relaxed text-[color:var(--ink-soft)]">{{ pesan.teks }}</p>
        <div class="mt-6 flex flex-wrap justify-center gap-2">
          <router-link v-if="pesan.hasil" :to="pesan.hasil" class="u-btn u-btn-hitam">Lihat hasil</router-link>
          <router-link to="/dashboard/lms/my-competency" class="u-btn">Ke Asesmen Kompetensi</router-link>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import '@fontsource-variable/bricolage-grotesque'
import '../../styles/exam.css'
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { competencyApi } from '../../services/competencyApi'

const route = useRoute()
const router = useRouter()
const pesan = ref(null)

onMounted(async () => {
  try {
    const hasil = await competencyApi.join(String(route.params.token || ''))
    if (hasil.attempt_id) {
      router.replace(`/dashboard/lms/my-competency/case/${hasil.attempt_id}`)
    } else if (hasil.closed) {
      pesan.value = { judul: 'Periode sudah ditutup', teks: `Tes "${hasil.cycle}" tidak bisa dikerjakan lagi.`, hasil: `/dashboard/lms/my-competency/result/${hasil.participant_id}` }
    } else {
      pesan.value = { judul: 'Tidak ada tes', teks: `Periode "${hasil.cycle}" tidak memakai studi kasus. Cek tugas penilaian Anda di Asesmen Kompetensi.` }
    }
  } catch (e) {
    pesan.value = { judul: 'Link tidak bisa dibuka', teks: e.message }
  }
})
</script>
