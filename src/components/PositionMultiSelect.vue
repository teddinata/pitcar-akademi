<template>
  <div class="space-y-3" ref="componentRoot">
    <!-- Search box - Always visible -->
    <div class="relative">
      <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        ref="searchInput"
        v-model="searchQuery"
        type="text"
        placeholder="Cari posisi atau departemen..."
        :disabled="disabled"
        class="w-full pl-9 pr-3 py-2.5 text-sm border border-purple-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 transition-all"
        :class="{
          'bg-gray-50 cursor-not-allowed': disabled
        }"
        @focus="isOpen = true"
      />
    </div>

    <!-- Selected positions display -->
    <div v-if="selectedPositions.length > 0" class="flex flex-wrap gap-2">
      <span
        v-for="pos in selectedPositions"
        :key="pos.id"
        class="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 rounded-lg text-xs font-medium border border-purple-200/50"
      >
        <span class="max-w-[200px] truncate">{{ pos.name }}</span>
        <span v-if="pos.department_name" class="text-purple-500/70">• {{ pos.department_name }}</span>
        <button
          v-if="!disabled"
          @click.stop="removePosition(pos.id)"
          class="hover:bg-purple-200 rounded-full p-0.5 transition-colors ml-0.5"
        >
          <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </span>
    </div>

    <!-- Dropdown menu - appears on focus/search -->
    <transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div
        v-show="isOpen"
        class="bg-white border border-purple-200 rounded-xl shadow-xl overflow-hidden"
      >
        <!-- Select All / Clear All buttons -->
        <div class="px-4 py-2.5 border-b border-purple-100 flex items-center justify-between bg-gradient-to-r from-purple-50/50 to-pink-50/50">
          <button
            @click.stop="selectAll"
            class="text-xs font-semibold text-purple-600 hover:text-purple-700 transition-colors"
          >
            Pilih Semua ({{ filteredPositions.length }})
          </button>
          <button
            v-if="selectedPositions.length > 0"
            @click.stop="clearAll"
            class="text-xs font-semibold text-red-600 hover:text-red-700 transition-colors"
          >
            Hapus Semua
          </button>
        </div>

        <!-- Loading state -->
        <div v-if="loading" class="px-4 py-12 text-center">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <p class="text-sm mt-3 text-gray-500 font-medium">Memuat posisi...</p>
        </div>

        <!-- Empty state -->
        <div v-else-if="filteredPositions.length === 0" class="px-4 py-12 text-center">
          <svg class="w-12 h-12 mx-auto mb-3 text-purple-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p class="text-sm font-semibold text-gray-700">Tidak ada posisi ditemukan</p>
          <p class="text-xs mt-1 text-gray-500">Coba kata kunci lain</p>
        </div>

        <!-- Position list -->
        <div v-else class="max-h-64 overflow-y-auto">
          <label
            v-for="pos in filteredPositions"
            :key="pos.id"
            class="flex items-start gap-3 px-4 py-3 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 cursor-pointer transition-all border-b border-purple-50 last:border-0"
            @click.stop="togglePosition(pos)"
          >
            <input
              type="checkbox"
              :checked="isSelected(pos.id)"
              class="mt-1 w-4 h-4 text-purple-600 border-purple-300 rounded focus:ring-purple-500/30"
              @click.stop="togglePosition(pos)"
            />
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold text-gray-900">{{ pos.name }}</p>
              <div class="flex items-center gap-2 mt-1">
                <span v-if="pos.department_name" class="text-xs text-purple-600">
                  {{ pos.department_name }}
                </span>
                <span v-if="pos.total_employees" class="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full font-medium">
                  {{ pos.total_employees }} karyawan
                </span>
              </div>
            </div>
          </label>
        </div>

        <!-- Footer with count -->
        <div v-if="!loading && filteredPositions.length > 0" class="px-4 py-3 border-t border-purple-100 bg-gradient-to-r from-purple-50/50 to-pink-50/50">
          <p class="text-xs text-purple-700 font-semibold">
            {{ selectedPositions.length }} dari {{ positions.length }} posisi dipilih
          </p>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  disabled: {
    type: Boolean,
    default: false
  },
  positions: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

const isOpen = ref(false)
const searchQuery = ref('')
const componentRoot = ref(null)
const searchInput = ref(null)

// Filter positions based on search
const filteredPositions = computed(() => {
  if (!searchQuery.value.trim()) {
    return props.positions
  }

  const query = searchQuery.value.toLowerCase()
  return props.positions.filter(pos => {
    const matchName = pos.name?.toLowerCase().includes(query)
    const matchDept = pos.department_name?.toLowerCase().includes(query)
    return matchName || matchDept
  })
})

// Get selected position objects
const selectedPositions = computed(() => {
  return props.positions.filter(pos => props.modelValue.includes(pos.id))
})

// Check if position is selected
const isSelected = (positionId) => {
  return props.modelValue.includes(positionId)
}

// Auto-open dropdown when typing
watch(searchQuery, (newVal) => {
  if (newVal.trim()) {
    isOpen.value = true
  }
})

// Toggle single position
const togglePosition = (position) => {
  const currentIds = [...props.modelValue]
  const index = currentIds.indexOf(position.id)

  if (index > -1) {
    currentIds.splice(index, 1)
  } else {
    currentIds.push(position.id)
  }

  emit('update:modelValue', currentIds)
}

// Remove position by ID
const removePosition = (positionId) => {
  const currentIds = [...props.modelValue]
  const index = currentIds.indexOf(positionId)

  if (index > -1) {
    currentIds.splice(index, 1)
    emit('update:modelValue', currentIds)
  }
}

// Select all filtered positions
const selectAll = () => {
  const allFilteredIds = filteredPositions.value.map(pos => pos.id)
  const combined = [...new Set([...props.modelValue, ...allFilteredIds])]
  emit('update:modelValue', combined)
}

// Clear all selections
const clearAll = () => {
  emit('update:modelValue', [])
}

// Close dropdown when clicking outside
const handleClickOutside = (event) => {
  if (componentRoot.value && !componentRoot.value.contains(event.target)) {
    isOpen.value = false
    searchQuery.value = ''
  }
}

// Handle Escape key
const handleEscape = (event) => {
  if (event.key === 'Escape' && isOpen.value) {
    isOpen.value = false
    searchQuery.value = ''
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
