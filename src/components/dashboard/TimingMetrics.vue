<template>
  <div class="bg-white rounded-lg shadow p-6">
    <h3 class="text-lg font-medium mb-4">Timing Analysis</h3>
    <div class="space-y-6">
      <div class="grid grid-cols-2 gap-4">
        <div class="bg-green-50 rounded-lg p-4">
          <p class="text-sm text-gray-600 mb-1">Penyelesaian Lebih Awal</p>
          <p class="text-xl font-bold text-green-600">{{ data?.early_starts ?? 0 }}</p>
        </div>
        <div class="bg-red-50 rounded-lg p-4">
          <p class="text-sm text-gray-600 mb-1">Keterlambatan Mulai</p>
          <p class="text-xl font-bold text-red-600">{{ data?.late_starts ?? 0 }}</p>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div class="bg-green-50 rounded-lg p-4">
          <p class="text-sm text-gray-600 mb-1">Selesai Lebih Cepat</p>
          <p class="text-xl font-bold text-green-600">{{ data?.early_completions ?? 0 }}</p>
        </div>
        <div class="bg-red-50 rounded-lg p-4">
          <p class="text-sm text-gray-600 mb-1">Keterlambatan Selesai</p>
          <p class="text-xl font-bold text-red-600">{{ data?.late_completions ?? 0 }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  data: {
    type: Object,
    default: () => ({})
  }
})
</script>