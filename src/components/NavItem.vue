<template>
  <router-link :to="item.path" custom v-slot="{ isActive, href, navigate }">
    <a
      :href="href"
      @click="navigate"
      class="group flex items-center cursor-pointer transition-all duration-200 rounded-lg"
      :class="[
        isExpanded ? 'justify-start' : 'justify-center',
        isActive ? activeClass : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      ]"
      :title="!isExpanded ? item.name : undefined"
    >
      <div class="h-9 w-full flex items-center px-3">
        <component
          :is="item.icon"
          class="w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110"
          :class="isActive ? 'text-inherit' : 'text-gray-400 group-hover:text-gray-700'"
        />
        <span
          v-if="isExpanded"
          class="ml-3 text-sm font-medium truncate"
          :class="isActive ? 'text-inherit' : 'text-gray-700'"
        >
          {{ item.name }}
        </span>
      </div>
    </a>
  </router-link>
</template>

<script setup>
defineProps({
  item: { type: Object, required: true },
  isExpanded: { type: Boolean, default: false },
  activeClass: { type: String, default: '' },
})
</script>
