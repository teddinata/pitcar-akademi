<!-- Popup catatan perubahan per versi. Datanya di src/data/changelog.js. -->
<template>
  <TransitionRoot :show="open" as="template">
    <Dialog as="div" class="relative z-50" @close="$emit('close')">
      <TransitionChild
        as="template"
        enter="ease-out duration-200" enter-from="opacity-0" enter-to="opacity-100"
        leave="ease-in duration-150" leave-from="opacity-100" leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-gray-900/40" aria-hidden="true" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-end justify-center p-4 sm:items-center">
          <TransitionChild
            as="template"
            enter="ease-out duration-200" enter-from="opacity-0 translate-y-2" enter-to="opacity-100 translate-y-0"
            leave="ease-in duration-150" leave-from="opacity-100" leave-to="opacity-0"
          >
            <DialogPanel class="flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
              <header class="flex items-start justify-between gap-3 border-b border-gray-100 px-5 py-4">
                <div>
                  <DialogTitle class="text-base font-bold text-gray-900">Apa yang baru di Akademi PITCAR</DialogTitle>
                  <p class="mt-0.5 text-xs text-gray-500">Versi Anda saat ini v{{ currentVersion }}</p>
                </div>
                <button
                  type="button"
                  class="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
                  aria-label="Tutup" @click="$emit('close')"
                >
                  <XMarkIcon class="h-5 w-5" />
                </button>
              </header>

              <ol class="flex-1 space-y-6 overflow-y-auto px-5 py-5">
                <li v-for="rilis in CHANGELOG" :key="rilis.version">
                  <div class="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                    <span class="rounded-full px-2 py-0.5 font-mono text-xs font-bold" :class="rilis.version === currentVersion ? 'bg-[#b70000] text-white' : 'bg-gray-100 text-gray-700'">v{{ rilis.version }}</span>
                    <span class="text-xs text-gray-500">{{ tanggal(rilis.date) }}</span>
                    <span v-if="rilis.version === currentVersion" class="text-xs font-semibold text-[#b70000]">versi Anda</span>
                  </div>
                  <h3 class="mt-2 text-sm font-bold text-gray-900">{{ rilis.title }}</h3>
                  <ul class="mt-2 space-y-1.5">
                    <li v-for="(item, index) in rilis.items" :key="index" class="flex gap-2 text-sm leading-relaxed text-gray-700">
                      <span class="mt-0.5 h-fit shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold" :class="JENIS[item.type]?.nada">{{ JENIS[item.type]?.label || item.type }}</span>
                      <span>{{ item.text }}</span>
                    </li>
                  </ul>
                </li>
              </ol>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup>
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { XMarkIcon } from '@heroicons/vue/24/outline'
import { CHANGELOG } from '../data/changelog'

defineProps({
  open: { type: Boolean, default: false },
  currentVersion: { type: String, default: '' },
})
defineEmits(['close'])

const JENIS = {
  baru: { label: 'Baru', nada: 'bg-emerald-50 text-emerald-800' },
  ubah: { label: 'Ubah', nada: 'bg-blue-50 text-blue-800' },
  perbaikan: { label: 'Perbaikan', nada: 'bg-amber-50 text-amber-900' },
}

const tanggal = (value) => new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
  .format(new Date(`${value}T00:00:00Z`))
</script>
