<template>
  <Teleport to="body">
    <div v-if="noticeState.text" class="ujian l-dialog !bg-transparent fixed inset-x-0 bottom-4 z-[90] flex justify-center px-4 pointer-events-none" role="status" aria-live="polite">
      <div class="pointer-events-auto flex max-w-md items-start gap-3 rounded-xl border-[2.5px] border-[color:var(--ink)] px-4 py-3 text-sm font-bold shadow-[4px_4px_0_var(--ink)]"
        :class="noticeState.type === 'error' ? 'bg-[color:var(--merah)] text-white' : 'bg-[color:var(--stabilo)] text-[color:var(--ink)]'">
        <span class="min-w-0 flex-1">{{ noticeState.text }}</span>
        <button type="button" class="-my-2 -mr-2 grid h-11 w-11 shrink-0 place-items-center" aria-label="Tutup" @click="noticeState.text = ''"><XMarkIcon class="h-5 w-5" /></button>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { XMarkIcon } from '@heroicons/vue/24/outline'
import { noticeState } from './notice'
</script>
