<template>
  <div class="min-h-screen flex relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
    <!-- Animated Background Elements -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-blob"></div>
      <div class="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
      <div class="absolute bottom-0 left-1/2 w-96 h-96 bg-gradient-to-br from-indigo-400/20 to-blue-400/20 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
    </div>

    <!-- Left Side - Assessment & LMS Graphics -->
    <div class="hidden lg:flex lg:w-1/2 relative overflow-hidden">
      <!-- Logo -->
      <div class="absolute top-8 left-8 z-20">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <AcademicCapIcon class="h-6 w-6 text-white" />
          </div>
          <span class="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">PITCAR LMS</span>
        </div>
      </div>

      <!-- Main Content Area -->
      <div class="relative w-full h-full flex items-center justify-center px-12">
        <div class="relative w-full max-w-xl">
          <!-- Assessment Progress Card -->
          <div class="absolute top-0 left-0 bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-6 w-80 transform hover:scale-105 transition-all duration-500 border border-white/50">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center space-x-2">
                <div class="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                  <CheckBadgeIcon class="h-6 w-6 text-white" />
                </div>
                <div>
                  <p class="text-xs text-gray-500 uppercase tracking-wider">Your Progress</p>
                  <p class="text-lg font-bold text-gray-900">Assessment Score</p>
                </div>
              </div>
            </div>
            <div class="relative">
              <div class="flex items-end justify-between mb-2">
                <div class="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">87%</div>
                <div class="text-sm text-green-600 font-medium flex items-center">
                  <ArrowTrendingUpIcon class="h-4 w-4 mr-1" />
                  +12%
                </div>
              </div>
              <div class="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                <div class="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full animate-progress-fill" style="width: 87%"></div>
              </div>
              <p class="text-xs text-gray-500 mt-2">15 of 20 assessments completed</p>
            </div>
          </div>

          <!-- Active Courses Card -->
          <div class="absolute top-44 left-32 bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-5 w-72 z-20 transform hover:scale-105 transition-all duration-500 border border-white/50">
            <div class="flex items-center space-x-3 mb-4">
              <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                <BookOpenIcon class="h-6 w-6 text-white" />
              </div>
              <div>
                <p class="text-xs text-gray-500 uppercase tracking-wider">Active</p>
                <p class="text-sm font-bold text-gray-900">Learning Modules</p>
              </div>
            </div>
            <div class="space-y-3">
              <div class="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                <div class="flex items-center space-x-3">
                  <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <span class="text-xs font-bold text-white">JS</span>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-gray-900">JavaScript Quiz</p>
                    <p class="text-xs text-gray-500">65% complete</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Quiz Statistics Card -->
          <div class="absolute top-80 left-12 bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-5 w-64 z-30 transform hover:scale-105 transition-all duration-500 border border-white/50">
            <div class="flex items-center space-x-2 mb-4">
              <div class="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <ChartBarIcon class="h-6 w-6 text-white" />
              </div>
              <p class="text-sm font-bold text-gray-900">Quiz Analytics</p>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div class="bg-purple-50 rounded-lg p-3">
                <p class="text-2xl font-bold text-purple-600">42</p>
                <p class="text-xs text-gray-600">Completed</p>
              </div>
              <div class="bg-pink-50 rounded-lg p-3">
                <p class="text-2xl font-bold text-pink-600">8.5</p>
                <p class="text-xs text-gray-600">Avg Score</p>
              </div>
            </div>
          </div>

          <!-- Welcome Text Section -->
          <div class="absolute bottom-0 left-0 z-40">
            <h1 class="text-4xl font-bold leading-tight mb-4">
              <span class="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent block">
                Empower Your Learning
              </span>
              <span class="text-gray-700">Journey Today</span>
            </h1>
            <p class="text-gray-600 leading-relaxed max-w-md">
              Comprehensive assessment platform with real-time analytics, personalized learning paths, and intelligent progress tracking for optimal learning outcomes.
            </p>
          </div>
        </div>

        <!-- Floating Decorative Elements -->
        <div class="absolute inset-0 pointer-events-none">
          <!-- Top Right - Certificate Icon -->
          <div class="absolute top-24 right-16 w-16 h-16 bg-gradient-to-br from-yellow-100 to-amber-100 rounded-2xl rotate-12 animate-float-slow shadow-lg flex items-center justify-center">
            <TrophyIcon class="h-8 w-8 text-amber-600" />
          </div>

          <!-- Bottom Left - Quiz Icon -->
          <div class="absolute bottom-40 left-16 w-14 h-14 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full animate-float-fast shadow-lg flex items-center justify-center">
            <ClipboardDocumentCheckIcon class="h-7 w-7 text-blue-600" />
          </div>

          <!-- Center Right - Learning Icon -->
          <div class="absolute top-1/3 right-24 w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl -rotate-12 animate-float-medium shadow-lg flex items-center justify-center">
            <LightBulbIcon class="h-10 w-10 text-purple-600" />
          </div>

          <!-- Top Left - Clock Icon -->
          <div class="absolute top-40 left-24 w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg animate-pulse-slow shadow-lg flex items-center justify-center">
            <ClockIcon class="h-6 w-6 text-green-600" />
          </div>

          <!-- Bottom Right - Book Icon -->
          <div class="absolute bottom-24 right-32 w-16 h-16 bg-gradient-to-br from-red-100 to-rose-100 rounded-2xl animate-bounce-slow shadow-lg flex items-center justify-center">
            <BookmarkIcon class="h-8 w-8 text-red-600" />
          </div>
        </div>
      </div>
    </div>

    <!-- Right Side - Modern Login Form -->
    <div class="w-full lg:w-1/2 flex items-center justify-center p-8 relative z-10">
      <div class="w-full max-w-md">
        <!-- Mobile Logo -->
        <div class="lg:hidden flex items-center justify-center space-x-3 mb-8">
          <div class="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <AcademicCapIcon class="h-7 w-7 text-white" />
          </div>
          <span class="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">PITCAR LMS</span>
        </div>

        <!-- Login Card -->
        <div class="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/50">
          <div class="text-center mb-8">
            <h2 class="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
              Welcome Back
            </h2>
            <p class="text-gray-500">Sign in to continue your learning journey</p>
          </div>

          <form @submit.prevent="handleLogin" class="space-y-5">
            <!-- Database Selection -->
            <div class="group">
              <label class="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <BuildingOfficeIcon class="h-4 w-4 mr-2 text-gray-500" />
                Branch
              </label>
              <div class="relative">
                <select
                  v-model="formData.db"
                  class="w-full px-4 py-3 bg-white/50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 appearance-none font-medium text-gray-700 cursor-pointer hover:border-blue-300"
                  required
                >
                  <option value="" disabled>Select your branch</option>
                  <option value="Pitcar1_Akademi">Pitcar Akademi</option>
                  <option value="Pitcar1">Pitcar Purwokerto</option>
                  <option value="pitcar_otokits_cilacap">Otokits Cilacap</option>
                  <option value="pitcar_accessories">Pitcar Aksesoris</option>
                  <option value="pitcar_autopart">Pitcar Sparepart</option>
                  <option value="pitcar_purbalingga">Pitcar Purbalingga</option>
                  <option value="pitcar_tegal">Pitcar Tegal</option>
                  <option value="pitcar_batam">Pitcar Batam</option>
                  <!-- <option value="Pitcar1_testing_2026">Pitcar Test</option> -->
                </select>
                <ChevronDownIcon class="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <!-- Email -->
            <div class="group">
              <label class="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <EnvelopeIcon class="h-4 w-4 mr-2 text-gray-500" />
                Email Address
              </label>
              <div class="relative">
                <input
                  type="email"
                  v-model="formData.login"
                  required
                  class="w-full px-4 py-3 bg-white/50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 font-medium text-gray-700 hover:border-blue-300"
                  placeholder="your.email@example.com"
                />
              </div>
            </div>

            <!-- Password -->
            <div class="group">
              <label class="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <LockClosedIcon class="h-4 w-4 mr-2 text-gray-500" />
                Password
              </label>
              <div class="relative">
                <input
                  :type="showPassword ? 'text' : 'password'"
                  v-model="formData.password"
                  required
                  class="w-full px-4 py-3 bg-white/50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 font-medium text-gray-700 hover:border-blue-300"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  @click="togglePassword"
                  class="absolute inset-y-0 right-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <EyeIcon v-if="showPassword" class="h-5 w-5" />
                  <EyeSlashIcon v-else class="h-5 w-5" />
                </button>
              </div>
            </div>

            <div class="flex items-center justify-between">
              <label class="flex items-center cursor-pointer">
                <input type="checkbox" class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500">
                <span class="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
              <a href="#" class="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              :disabled="loading"
              class="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:ring-4 focus:ring-blue-200 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <span v-if="loading" class="flex items-center justify-center">
                <svg class="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Signing in...
              </span>
              <span v-else class="flex items-center justify-center">
                Sign In
                <ArrowRightIcon class="h-5 w-5 ml-2" />
              </span>
            </button>
          </form>

          <div class="mt-6 text-center">
            <p class="text-sm text-gray-600">
              Don't have an account?
              <a href="#" class="font-semibold text-blue-600 hover:text-blue-700 transition-colors">Contact Administrator</a>
            </p>
          </div>
        </div>

        <!-- Trust Badges -->
        <div class="mt-8 flex items-center justify-center space-x-6 text-xs text-gray-500">
          <div class="flex items-center">
            <ShieldCheckIcon class="h-4 w-4 mr-1 text-green-600" />
            Secure Login
          </div>
          <div class="flex items-center">
            <LockClosedIcon class="h-4 w-4 mr-1 text-blue-600" />
            Encrypted
          </div>
          <div class="flex items-center">
            <CheckBadgeIcon class="h-4 w-4 mr-1 text-purple-600" />
            GDPR Compliant
          </div>
        </div>
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
  AcademicCapIcon,
  CheckBadgeIcon,
  ArrowTrendingUpIcon,
  BookOpenIcon,
  ChartBarIcon,
  TrophyIcon,
  ClipboardDocumentCheckIcon,
  LightBulbIcon,
  ClockIcon,
  BookmarkIcon,
  BuildingOfficeIcon,
  EnvelopeIcon,
  LockClosedIcon,
  ChevronDownIcon,
  ArrowRightIcon,
  ShieldCheckIcon
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
    
    router.push('/dashboard/quiz')
  } catch (err) {
    error.value = err.message || 'Login failed. Please check your credentials.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* Blob Animation for Background */
@keyframes blob {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(30px, -50px) scale(1.1);
  }
  66% {
    transform: translate(-20px, 20px) scale(0.9);
  }
}

.animate-blob {
  animation: blob 7s infinite;
}

.animation-delay-2000 {
  animation-delay: 2s;
}

.animation-delay-4000 {
  animation-delay: 4s;
}

/* Float Animations */
@keyframes float-slow {
  0%, 100% {
    transform: translateY(0) rotate(12deg);
  }
  50% {
    transform: translateY(-25px) rotate(12deg);
  }
}

@keyframes float-fast {
  0%, 100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-15px) scale(1.05);
  }
}

@keyframes float-medium {
  0%, 100% {
    transform: translateY(0) rotate(-12deg);
  }
  50% {
    transform: translateY(-20px) rotate(-12deg);
  }
}

@keyframes pulse-slow {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
}

@keyframes bounce-slow {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes progress-fill {
  from {
    width: 0%;
  }
  to {
    width: 87%;
  }
}

.animate-float-slow {
  animation: float-slow 6s ease-in-out infinite;
}

.animate-float-fast {
  animation: float-fast 3s ease-in-out infinite;
}

.animate-float-medium {
  animation: float-medium 5s ease-in-out infinite;
}

.animate-pulse-slow {
  animation: pulse-slow 4s ease-in-out infinite;
}

.animate-bounce-slow {
  animation: bounce-slow 3s ease-in-out infinite;
}

.animate-progress-fill {
  animation: progress-fill 2s ease-out forwards;
}

/* Glass Morphism Effect */
.backdrop-blur-xl {
  backdrop-filter: blur(20px);
}

/* Gradient Text */
.bg-clip-text {
  -webkit-background-clip: text;
  background-clip: text;
}

/* Custom Scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #3b82f6, #6366f1);
  border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #2563eb, #4f46e5);
}
</style>