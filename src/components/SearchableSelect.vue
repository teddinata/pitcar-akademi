<template>
  <div class="relative" ref="componentRoot">
    <!-- Trigger Button -->
    <button
      type="button"
      @click="toggleDropdown"
      :disabled="disabled"
      class="w-full flex items-center justify-between px-4 py-3 text-sm border-2 rounded-xl bg-white text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
      :class="[
        disabled
          ? 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
          : isOpen
          ? 'border-blue-500 ring-2 ring-blue-500/20'
          : 'border-gray-200 text-gray-700 hover:border-gray-300'
      ]"
    >
      <span class="truncate">
        <template v-if="selectedOption">
          <span v-if="selectedOption.code" class="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded mr-2">
            {{ selectedOption.code }}
          </span>
          <span class="font-medium text-gray-900">{{ selectedOption.name }}</span>
        </template>
        <span v-else class="text-gray-400 font-normal">{{ placeholder }}</span>
      </span>
      <svg
        class="w-4 h-4 text-gray-400 transition-transform duration-200 shrink-0 ml-2"
        :class="isOpen ? 'rotate-180 text-blue-500' : ''"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <!-- Dropdown Menu -->
    <transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div
        v-show="isOpen"
        class="absolute z-30 left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden flex flex-col max-h-80"
      >
        <!-- Search Input Header -->
        <div class="p-2.5 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
          <div class="relative flex-1">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref="searchInput"
              v-model="searchQuery"
              type="text"
              placeholder="Cari berdasarkan nama atau kode..."
              class="w-full pl-9 pr-8 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
              @keydown.down.prevent="navigateOptions(1)"
              @keydown.up.prevent="navigateOptions(-1)"
              @keydown.enter.prevent="selectActiveOption"
            />
            <!-- Clear search button -->
            <button
              v-if="searchQuery"
              @click="searchQuery = ''"
              type="button"
              class="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Options List -->
        <div class="overflow-y-auto flex-1 py-1 divide-y divide-gray-50 max-h-56" ref="listRoot">
          <!-- Empty State -->
          <div v-if="filteredOptions.length === 0" class="py-8 px-4 text-center text-gray-400">
            <svg class="w-8 h-8 mx-auto mb-2 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p class="text-xs font-semibold text-gray-500">Tidak ada SOP ditemukan</p>
          </div>

          <!-- Options -->
          <button
            v-else
            v-for="(opt, idx) in filteredOptions"
            :key="opt.id"
            type="button"
            @click="selectOption(opt)"
            class="w-full text-left px-4 py-3 hover:bg-blue-50/50 flex items-start gap-2.5 transition-colors focus:outline-none"
            :class="[
              opt.id === modelValue ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700',
              idx === activeIndex ? 'bg-gray-50 ring-1 ring-blue-200' : ''
            ]"
          >
            <!-- Checkmark for selected -->
            <svg
              v-if="opt.id === modelValue"
              class="w-4 h-4 text-blue-600 mt-0.5 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
            </svg>
            <!-- Bullet for unselected -->
            <span v-else class="w-1.5 h-1.5 rounded-full bg-gray-300 mt-2 shrink-0 ml-1.5"></span>

            <div class="min-w-0 flex-1 ml-1">
              <span v-if="opt.code" class="text-[10px] font-mono font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded mr-1.5">
                {{ opt.code }}
              </span>
              <span class="text-sm leading-tight text-gray-800 font-medium block mt-0.5">{{ opt.name }}</span>
            </div>
          </button>
        </div>

        <!-- Dropdown Footer -->
        <div class="p-2 border-t border-gray-100 bg-gray-50 flex items-center justify-between text-[10px] text-gray-400 font-medium px-4">
          <span>Menampilkan {{ filteredOptions.length }} pilihan</span>
          <button
            v-if="modelValue !== null && modelValue !== undefined"
            type="button"
            @click.stop="clearSelection"
            class="text-red-500 hover:text-red-700 font-bold uppercase transition-colors"
          >
            Hapus Pilihan
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'

const props = defineProps({
  modelValue: {
    type: [Number, String],
    default: null
  },
  options: {
    type: Array,
    default: () => []
  },
  placeholder: {
    type: String,
    default: '— Pilih SOP —'
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

const isOpen = ref(false)
const searchQuery = ref('')
const activeIndex = ref(-1)
const componentRoot = ref(null)
const searchInput = ref(null)
const listRoot = ref(null)

// Computed selected option object
const selectedOption = computed(() => {
  return props.options.find(opt => opt.id === props.modelValue) || null
})

// Filtered options based on search query
const filteredOptions = computed(() => {
  if (!searchQuery.value.trim()) {
    return props.options
  }
  const query = searchQuery.value.toLowerCase()
  return props.options.filter(opt => {
    const matchName = opt.name?.toLowerCase().includes(query)
    const matchCode = opt.code?.toLowerCase().includes(query)
    return matchName || matchCode
  })
})

// Watch search query to reset active keyboard navigation index
watch(searchQuery, () => {
  activeIndex.value = -1
})

// Toggle dropdown
const toggleDropdown = () => {
  if (props.disabled) return
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    searchQuery.value = ''
    activeIndex.value = -1
    nextTick(() => {
      if (searchInput.value) {
        searchInput.value.focus()
      }
    })
  }
}

// Select an option
const selectOption = (option) => {
  emit('update:modelValue', option.id)
  isOpen.value = false
  searchQuery.value = ''
}

// Clear selection
const clearSelection = () => {
  emit('update:modelValue', null)
  isOpen.value = false
  searchQuery.value = ''
}

// Keyboard navigation
const navigateOptions = (direction) => {
  if (!isOpen.value || filteredOptions.value.length === 0) return
  
  activeIndex.value += direction
  
  if (activeIndex.value < 0) {
    activeIndex.value = filteredOptions.value.length - 1
  } else if (activeIndex.value >= filteredOptions.value.length) {
    activeIndex.value = 0
  }
  
  // Scroll to active option
  nextTick(() => {
    if (!listRoot.value) return
    const activeEl = listRoot.value.children[activeIndex.value]
    if (activeEl) {
      activeEl.scrollIntoView({ block: 'nearest' })
    }
  })
}

// Select option with Enter
const selectActiveOption = () => {
  if (!isOpen.value) {
    toggleDropdown()
    return
  }
  if (activeIndex.value >= 0 && activeIndex.value < filteredOptions.value.length) {
    selectOption(filteredOptions.value[activeIndex.value])
  } else if (filteredOptions.value.length > 0) {
    selectOption(filteredOptions.value[0])
  }
}

// Click outside handler
const handleClickOutside = (event) => {
  if (componentRoot.value && !componentRoot.value.contains(event.target)) {
    isOpen.value = false
  }
}

// Escape key handler
const handleEscape = (event) => {
  if (event.key === 'Escape' && isOpen.value) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleEscape)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleEscape)
})
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #E5E7EB;
  border-radius: 2px;
}
</style>
