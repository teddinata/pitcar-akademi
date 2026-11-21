<template>
  <router-link :to="item.path" custom v-slot="{ isActive: linkActive, href, navigate }">
    <a
      :href="href"
      :aria-current="on(linkActive) ? 'page' : undefined"
      @click="navigate"
      class="group flex items-center cursor-pointer transition-all duration-200 rounded-lg"
      :class="[
        isExpanded ? 'justify-start' : 'justify-center',
        on(linkActive) ? activeClass : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      ]"
      :title="!isExpanded ? item.name : undefined"
    >
      <div class="h-9 w-full flex items-center px-3">
        <component
          :is="item.icon"
          class="w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110"
          :class="on(linkActive) ? 'text-inherit' : 'text-gray-400 group-hover:text-gray-700'"
        />
        <span
          v-if="isExpanded"
          class="ml-3 text-sm font-medium truncate"
          :class="on(linkActive) ? 'text-inherit' : 'text-gray-700'"
        >
          {{ item.name }}
        </span>
        <span v-if="isExpanded && item.badge" class="u-new ml-auto shrink-0" :class="item.badgeTone === 'abu' ? 'is-abu' : item.badgeTone === 'hot' ? 'is-hot' : ''">{{ item.badge }}</span>
      </div>
    </a>
  </router-link>
</template>

<script setup>
import { useRoute } from 'vue-router'
import '../styles/asesmen.css'

const props = defineProps({
  item: { type: Object, required: true },
  isExpanded: { type: Boolean, default: false },
  activeClass: { type: String, default: '' },
})
// item.match(path) opsional: menu tetap aktif di halaman turunannya (mis. Asesmen Mekanik di Paket & Rekap).
const route = useRoute()
const on = (linkActive) => (props.item.match ? props.item.match(route.path) : linkActive)
</script>
