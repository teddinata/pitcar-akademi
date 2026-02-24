<template>
  <div class="relative inline-block text-left">
    <button
      @click="isOpen = !isOpen"
      type="button"
      class="inline-flex items-center justify-center px-3 py-1.5 border border-gray-300 text-sm leading-5 font-medium rounded-md text-gray-700 bg-white hover:text-gray-500 focus:outline-none focus:border-blue-300 focus:ring focus:ring-blue-200 active:text-gray-800 active:bg-gray-50 transition ease-in-out duration-150"
    >
      <span class="mr-1">{{ displayName }}</span>
      <ChevronDownIcon class="w-4 h-4 text-gray-500" />
    </button>

    <transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        class="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50"
      >
        <div
          class="py-1"
          role="menu"
          aria-orientation="vertical"
        >
          <button
            v-for="model in models"
            :key="model.value"
            @click="selectModel(model.value)"
            class="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:bg-gray-100 focus:text-gray-900"
            role="menuitem"
          >
            <div class="flex items-center justify-between">
              <div>
                <span class="font-medium">{{ model.label }}</span>
                <p class="text-xs text-gray-500 mt-0.5">{{ model.description }}</p>
              </div>
              <CheckIcon
                v-if="modelValue === model.value"
                class="w-5 h-5 text-blue-500"
              />
            </div>
            <div v-if="model.value.includes('gpt-4') && remainingGpt4 !== undefined" class="mt-1">
              <div class="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  class="h-full bg-blue-500 rounded-full" 
                  :style="{ width: `${(remainingGpt4 / 5) * 100}%` }"
                ></div>
              </div>
              <p class="text-xs text-right mt-0.5 text-gray-500">{{ remainingGpt4 }} penggunaan tersisa</p>
            </div>
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ChevronDownIcon, CheckIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  modelValue: {
    type: String,
    default: 'gpt-3.5-turbo'
  },
  remainingGpt4: {
    type: Number,
    default: undefined
  }
})

const emit = defineEmits(['update:modelValue'])

const isOpen = ref(false)

const models = [
  {
    value: 'gpt-3.5-turbo',
    label: 'GPT-3.5 Turbo',
    description: 'Cepat, hemat & andal untuk sebagian besar tugas'
  },
  {
    value: 'gpt-4',
    label: 'GPT-4',
    description: 'Model terbaik untuk tugas kompleks & analisis'
  },
  {
    value: 'gpt-4o',
    label: 'GPT-4o',
    description: 'Versi terbaru dengan kemampuan lanjutan'
  }
]

const displayName = computed(() => {
  const model = models.find(m => m.value === props.modelValue)
  return model ? model.label : props.modelValue
})

function selectModel(value) {
  emit('update:modelValue', value)
  isOpen.value = false
}

function handleClickOutside(event) {
  if (isOpen.value && !event.target.closest('.model-selector')) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>