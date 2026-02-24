<!-- /src/components/Toast.vue -->
<template>
  <Transition
    enter-active-class="transform ease-out duration-300 transition"
    enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
    enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
    leave-active-class="transition ease-in duration-100"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div v-if="show" class="fixed top-4 right-4 z-50 w-[80%] sm:w-auto max-w-md">
      <div 
        :class="[
          'flex items-start rounded-lg shadow-lg overflow-hidden',
          'border-l-4',
          type === 'success' ? 'border-l-green-500 bg-gradient-to-r from-green-50 to-white' : 
          type === 'error' ? 'border-l-red-500 bg-gradient-to-r from-red-50 to-white' :
          'border-l-blue-500 bg-gradient-to-r from-blue-50 to-white'
        ]"
      >
        <div class="flex-1 p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <CheckCircleIcon v-if="type === 'success'" class="h-6 w-6 text-green-500" />
              <ExclamationCircleIcon v-else-if="type === 'error'" class="h-6 w-6 text-red-500" />
              <InformationCircleIcon v-else class="h-6 w-6 text-blue-500" />
            </div>
            <div class="ml-3 pr-3">
              <p 
                :class="[
                  'text-sm font-medium',
                  type === 'success' ? 'text-green-800' : 
                  type === 'error' ? 'text-red-800' : 
                  'text-blue-800'
                ]"
              >
                {{ message }}
              </p>
            </div>
          </div>
        </div>
        
        <button
          @click="handleClose"
          :class="[
            'p-2 flex items-center justify-center text-gray-400',
            'hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2',
            type === 'success' ? 'focus:ring-green-500' : 
            type === 'error' ? 'focus:ring-red-500' : 
            'focus:ring-blue-500'
          ]"
        >
          <XMarkIcon class="h-5 w-5" />
        </button>
      </div>
      
      <!-- Progress bar for auto-close -->
      <div 
        v-if="!persistent && show"
        :class="[
          'h-1 rounded-b-lg -mt-1 transition-all duration-100 ease-out',
          type === 'success' ? 'bg-green-500' : 
          type === 'error' ? 'bg-red-500' : 
          'bg-blue-500'
        ]"
        :style="{ width: `${progressWidth}%` }"
      ></div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'

const props = defineProps({
  show: {
    type: Boolean,
    required: true
  },
  message: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: 'info',
    validator(value) {
      return ['success', 'error', 'info'].includes(value)
    }
  },
  duration: {
    type: Number,
    default: 3000 // Default duration in milliseconds
  },
  persistent: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:show'])
const progressWidth = ref(100)
let timeout = null
let progressInterval = null

const handleClose = () => {
  clearTimers()
  emit('update:show', false)
}

const startTimers = () => {
  if (!props.persistent) {
    // Reset progress
    progressWidth.value = 100
    
    // Start progress bar timer
    const updateFrequency = 10 // Update every 10ms for smooth animation
    const decrementValue = (updateFrequency / props.duration) * 100

    progressInterval = setInterval(() => {
      progressWidth.value = Math.max(0, progressWidth.value - decrementValue)
    }, updateFrequency)
    
    // Set timeout for closing
    timeout = setTimeout(() => {
      handleClose()
    }, props.duration)
  }
}

const clearTimers = () => {
  if (timeout) clearTimeout(timeout)
  if (progressInterval) clearInterval(progressInterval)
}

// Watch for show prop changes
watch(() => props.show, (newVal) => {
  clearTimers()
  if (newVal) {
    startTimers()
  }
})

// Clean up on unmount
onUnmounted(() => {
  clearTimers()
})
</script>