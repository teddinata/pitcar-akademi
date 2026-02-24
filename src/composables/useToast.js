// /src/composables/useToast.js
import { ref } from 'vue'

export function useToast() {
  const toast = ref({
    show: false,
    message: '',
    type: 'info',
    duration: 3000
  })

  const showToast = ({ message, type = 'info', duration = 3000 }) => {
    toast.value = {
      show: true,
      message,
      type,
      duration
    }
  }

  const hideToast = () => {
    toast.value.show = false
  }

  return {
    toast,
    showToast,
    hideToast
  }
}