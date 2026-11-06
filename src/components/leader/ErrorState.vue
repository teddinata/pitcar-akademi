<template>
  <div class="u-card flex flex-col items-start gap-3 p-5 sm:flex-row sm:items-center sm:justify-between" role="alert">
    <p class="font-bold text-[color:var(--merah)]">{{ message || 'Data belum bisa dimuat.' }}</p>
    <button type="button" class="u-btn" @click="$emit('retry')">Coba lagi</button>
  </div>
</template>

<script setup>
defineProps({ message: String })
defineEmits(['retry'])
</script>
