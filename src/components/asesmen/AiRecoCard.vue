<!-- Rekomendasi AI satu peserta (hasil tombol "Proses semua nilai sekarang" di Rekap). -->
<template>
  <section class="u-card p-4 sm:p-5">
    <h2 class="flex items-center gap-2 u-display text-xl font-extrabold"><LightBulbIcon class="h-5 w-5" aria-hidden="true" />Rekomendasi AI</h2>
    <template v-if="reco">
      <p class="mt-2 font-bold">{{ reco.ringkas }}</p>
      <div class="mt-3 grid gap-4 sm:grid-cols-3">
        <div><h3 class="text-xs font-extrabold">Fokus perbaikan</h3><ul class="mt-1 list-disc space-y-0.5 pl-5 text-sm"><li v-for="f in reco.fokus" :key="f">{{ f }}</li></ul></div>
        <div><h3 class="text-xs font-extrabold">Kekuatan</h3><ul class="mt-1 list-disc space-y-0.5 pl-5 text-sm"><li v-for="k in reco.kekuatan" :key="k">{{ k }}</li></ul><p v-if="!reco.kekuatan?.length" class="mt-1 text-sm text-[color:var(--ink-soft)]">Belum ada yang menonjol.</p></div>
        <div><h3 class="text-xs font-extrabold">Rencana 1 bulan</h3><p class="mt-1 text-sm">{{ reco.rencana }}</p></div>
      </div>
      <p class="mt-3 text-xs font-semibold text-[color:var(--ink-soft)]">Dibuat AI dari skor saat {{ waktu(reco.at) }}. Bila nilai berubah setelah itu, jalankan ulang dari halaman Rekap.</p>
    </template>
    <p v-else class="mt-2 text-sm">Belum ada rekomendasi. Asesor bisa menekan "Proses semua nilai sekarang" di halaman Rekap setelah nilai peserta lengkap.</p>
  </section>
</template>

<script setup>
import { LightBulbIcon } from '@heroicons/vue/24/outline'

defineProps({ reco: { type: Object, default: null } })
const waktu = (s) => (s ? new Date(String(s).replace(' ', 'T') + 'Z').toLocaleString('id-ID', { timeZone: 'Asia/Jakarta', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) + ' WIB' : '-')
</script>
