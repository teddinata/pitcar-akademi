<!-- Peta minggu Kelas Offline (Kurikulum & Quiz): minggu, modul, kelengkapan. Di HP jadi baris yang bisa digeser. -->
<template>
  <nav class="u-card h-fit p-2 lg:sticky lg:top-4" aria-label="Minggu">
    <div class="flex gap-1 overflow-x-auto lg:flex-col">
      <button v-for="w in weeks" :key="w.week" type="button" class="flex shrink-0 items-start gap-3 rounded-xl px-3 py-2.5 text-left lg:w-full"
        :class="modelValue === w.week ? 'bg-[color:var(--ink)] text-white' : 'hover:bg-[#fffbe0]'" :aria-current="modelValue === w.week ? 'true' : undefined"
        @click="$emit('update:modelValue', w.week)">
        <span class="u-display text-2xl font-extrabold tabular-nums leading-none">{{ w.week || "–" }}</span>
        <span class="min-w-0">
          <span class="block max-w-[11rem] truncate text-sm font-bold">{{ w.module }}</span>
          <span class="block text-xs tabular-nums opacity-80">{{ lengkap(w) }}/{{ w.topics.length }} {{ label }}</span>
        </span>
      </button>
    </div>
  </nav>
</template>

<script setup>
defineProps({ weeks: Array, modelValue: Number, lengkap: Function, label: { type: String, default: 'lengkap' } })
defineEmits(['update:modelValue'])
</script>
