<template>
  <div class="min-h-screen flex">
   <!-- Left Side - Statistics & Graphics -->
    <div class="hidden lg:flex lg:w-1/2 bg-[#f4f5f5] relative overflow-hidden">
      <!-- Logo -->
      <div class="absolute top-32 left-20 z-20">
        <img src="/pitcar-logo.png" alt="Pitcar" class="h-10" />
      </div>

      <!-- Main Content Area -->
      <div class="relative w-full h-full flex items-center justify-center">
        <!-- Card Group with Staggered Layout -->
        <div class="relative w-[500px] h-[450px]">
          <!-- Current Balance Card - Base Position -->
           <!-- Current Balance Stats -->
          <div class="absolute top-1 left-0 bg-white rounded-xl shadow-lg p-6 w-72 h-56">
            <div class="flex items-center space-x-2 text-gray-600 mb-2">
              <BanknotesIcon class="h-5 w-5" />
              <span class="text-sm">CURRENT BALANCE</span>
            </div>
            <div class="text-2xl font-bold">$24,359</div>
            <div class="mt-4">
              <!-- Pie Chart -->
              <div class="flex justify-between items-center">
                <div class="relative h-24 w-24">
                  <!-- You can replace this with an actual chart component -->
                  <div class="h-full w-full rounded-full border-4 border-blue-500 border-t-transparent animate-spin-slow"></div>
                  <div class="absolute inset-0 flex items-center justify-center">
                    <span class="text-sm font-medium">34%</span>
                  </div>
                </div>
                <div class="text-sm text-gray-600">
                  <div>Food</div>
                  <div class="mt-1">$2,503</div>
                </div>
              </div>
            </div>
          </div>

          <!-- New Transaction Card - Slightly Offset -->
          <div class="absolute top-52 left-24 bg-white rounded-xl shadow-sm p-5 w-[300px] z-20 hover:shadow-md transition-shadow">
            <button class="flex items-center space-x-2 text-[#1A73E8] font-medium">
              <PlusIcon class="h-5 w-5" />
              <span>New transaction</span>
            </button>
            <div class="text-sm text-gray-500 mt-2">or upload .xls file</div>
          </div>

          <!-- Activity Preview - Most Offset -->
          <div class="absolute top-72 left-12 bg-white rounded-xl shadow-sm p-5 w-[280px] z-30 hover:shadow-md transition-shadow">
            <div class="flex items-center space-x-2 mb-3">
              <ChartPieIcon class="h-5 w-5 text-blue-500" />
              <span class="text-sm font-medium">Recent Activity</span>
            </div>
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <div class="w-8 h-8 bg-green-50 rounded-full flex items-center justify-center">
                    <ArrowUpIcon class="h-4 w-4 text-green-600" />
                  </div>
                  <span class="text-sm font-medium">$156.00</span>
                </div>
              </div>
            </div>
          </div>
          
        <!-- Welcome Text Section -->
        <div class="absolute -bottom-24 left-0 z-40 mt-4">
          <h1 class="text-3xl font-bold leading-tight">
            <span class="text-[#B70000] block">Smart Dashboard PITCAR</span>
          </h1>
          <div class="space-y-3 mt-4">
            <p class="text-gray-600 leading-relaxed">
              Experience seamless service management with real-time monitoring, intelligent analytics, and comprehensive reporting - all in one powerful dashboard.
            </p>
          </div>
        </div>
        </div>

        <!-- Decorative Elements -->
        <div class="absolute inset-0 pointer-events-none">
          <!-- Top Right -->
          <div class="absolute top-20 right-20 w-16 h-16 bg-blue-50 rounded-xl rotate-12 animate-float-slow">
            <ChartBarIcon class="h-8 w-8 m-4 text-[#1A73E8]" />
          </div>

          <!-- Bottom Left -->
          <div class="absolute bottom-32 left-20 w-12 h-12 bg-yellow-50 rounded-full animate-float-fast">
            <CurrencyDollarIcon class="h-6 w-6 m-3 text-[#FBBC05]" />
          </div>

          <!-- Center Right -->
          <div class="absolute top-1/2 right-32 w-20 h-20 bg-green-50 rounded-xl -rotate-12 animate-float-medium">
            <ArrowTrendingUpIcon class="h-10 w-10 m-5 text-[#34A853]" />
          </div>

          <!-- New Additional Icons -->
          <!-- Bottom Right Spinner -->
          <div class="absolute bottom-24 right-24 w-14 h-14 animate-spin-slow">
            <div class="h-full w-full rounded-full border-4 border-[#B70000]/20 border-t-[#B70000]/60"></div>
          </div>

          <!-- Top Left Floater -->
          <div class="absolute top-32 left-32 w-10 h-10 bg-red-50 rounded-lg animate-bounce">
            <ClockIcon class="h-6 w-6 m-2 text-[#B70000]" />
          </div>
        </div>
      </div>

      <defs>
        <linearGradient id="gradient" gradientTransform="rotate(90)">
          <stop offset="0%" stop-color="#1A73E8" />
          <stop offset="33%" stop-color="#34A853" />
          <stop offset="66%" stop-color="#FBBC05" />
          <stop offset="100%" stop-color="#EA4335" />
        </linearGradient>
      </defs>
    </div>

    <!-- Right Side - Login Form -->
    <div class="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
      <div class="w-full max-w-[400px]">
        <h2 class="text-2xl font-bold text-gray-900 mb-2">Welcome back!</h2>
        <p class="text-gray-600 mb-8">Access your comprehensive service management suite and make data-driven decisions in real-time</p>

        <form @submit.prevent="handleLogin" class="space-y-5">
          <!-- Database Selection -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Branch</label>
            <select
              v-model="formData.db"
              class="w-full px-3 py-2 bg-[#f8f9fa] border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="" disabled>Select Branch</option>
              <option value="Pitcar_Group">Pitcar Holding</option>
              <!-- <option value="pitcar_otokits_cilacap">Otokits Cilacap x Pitcar</option>
              <option value="pitcar_accessories">Pitcar Accessories</option>
              <option value="pitcar_autopart">Pitcar Autopart</option> -->
            </select>
          </div>

          <!-- Email -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              v-model="formData.login"
              required
              class="w-full px-3 py-2 bg-[#f8f9fa] border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="you@example.com"
            />
          </div>

          <!-- Password -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div class="relative">
              <input
                :type="showPassword ? 'text' : 'password'"
                v-model="formData.password"
                required
                class="w-full px-3 py-2 bg-[#f8f9fa] border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your password"
              />
              <button
                type="button"
                @click="togglePassword"
                class="absolute inset-y-0 right-3 flex items-center"
              >
                <EyeIcon v-if="showPassword" class="h-5 w-5 text-gray-400" />
                <EyeSlashIcon v-else class="h-5 w-5 text-gray-400" />
              </button>
            </div>
          </div>

          <div class="flex justify-end">
            <a href="#" class="text-sm text-[#1A73E8] hover:text-blue-600">Forgot password?</a>
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full py-2.5 bg-[#B70000] text-white rounded-lg hover:bg-red-600 focus:ring-4 focus:ring-blue-200 transition-colors disabled:opacity-50"
          >
            <span v-if="loading" class="flex items-center justify-center">
              <svg class="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Loading...
            </span>
            <span v-else>Login</span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import {
  EyeIcon,
  EyeSlashIcon,
  BanknotesIcon,
  PlusIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  CurrencyDollarIcon
} from '@heroicons/vue/24/outline'

const router = useRouter()
const authStore = useAuthStore()

const showPassword = ref(false)
const loading = ref(false)
const error = ref('')

const formData = ref({
  db: '',
  login: '',
  password: ''
})

const togglePassword = () => {
  showPassword.value = !showPassword.value
}

const handleLogin = async () => {
  try {
    loading.value = true
    error.value = ''
    
    await authStore.login(
      formData.value.db,
      formData.value.login,
      formData.value.password
    )
    
    router.push('/dashboard/overview')
  } catch (err) {
    error.value = err.message || 'Login failed. Please check your credentials.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
@keyframes float-slow {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}

@keyframes float-medium {
  0%, 100% { transform: translateY(0) rotate(12deg); }
  50% { transform: translateY(-15px) rotate(12deg); }
}

@keyframes spin-slow {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.animate-float-slow {
  animation: float-slow 6s ease-in-out infinite;
}

.animate-float-medium {
  animation: float-medium 4s ease-in-out infinite;
}

.animate-spin-slow {
  animation: spin-slow 8s linear infinite;
}
</style>