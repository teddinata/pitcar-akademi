<!-- ============================================================================
FILE: src/components/Sidebar.vue
Perubahan: Tambah section "Holding" dengan menu KPI Perusahaan
============================================================================ -->

<template>
  <div
    class="h-screen bg-white border-r border-gray-200 transition-all duration-300 ease-in-out relative flex flex-col shadow-sm"
    :class="isExpanded ? 'w-64' : 'w-20'"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <!-- Logo Section -->
    <div class="flex items-center justify-center h-16 px-4 border-b border-gray-200 bg-gradient-to-r from-[#B70000] to-[#950000]">
      <div class="w-9 h-9 bg-white rounded-lg flex items-center justify-center shrink-0 shadow-md">
        <img src="/pitcar-modified.png" alt="PITCAR" class="w-6 h-6" />
      </div>
      <div 
        class="ml-3 transition-all duration-300 overflow-hidden whitespace-nowrap"
        :class="isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0'"
      >
        <img src="/pitcar-logo.png" alt="PITCAR" class="w-32 h-8 brightness-0 invert" />
      </div>
    </div>

    <!-- Scrollable Menu Container -->
    <nav class="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar py-4 px-3">

      <!-- ============================================================
           HOLDING MENU GROUP — BARU
      ============================================================ -->
      <div class="mb-6">
        <!-- Section Header -->
        <div 
          class="flex items-center px-3 h-10 text-xs font-bold uppercase tracking-wider mb-2 cursor-pointer rounded-lg transition-all duration-200"
          :class="[
            isExpanded ? 'justify-between' : 'justify-center',
            showHolding ? 'text-[#C9A84C]' : 'text-gray-500 hover:text-[#C9A84C]'
          ]"
          @click="toggleHolding"
        >
          <div class="flex items-center">
            <!-- Gold icon container when expanded/active -->
            <div 
              class="w-5 h-5 min-w-[20px] flex items-center justify-center rounded transition-all duration-200"
              :class="showHolding && isExpanded ? 'text-[#C9A84C]' : ''"
            >
              <BuildingOffice2Icon class="w-5 h-5" />
            </div>
            <span class="transition-all duration-300 overflow-hidden ml-3" :class="isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0'">
              Holding
            </span>
          </div>
          <ChevronDownIcon v-if="isExpanded" class="w-4 h-4 transition-transform duration-200" :class="showHolding ? 'rotate-180' : ''" />
        </div>

        <!-- Holding Submenu -->
        <div v-show="showHolding && isExpanded" class="space-y-1 pl-2">
          <router-link
            v-for="item in holdingItems"
            :key="item.path"
            :to="item.path"
            custom
            v-slot="{ isActive, href, navigate }"
          >
            <a
              :href="href"
              @click="navigate"
              class="group relative flex items-center cursor-pointer transition-all duration-200 rounded-lg"
              :class="[
                isActive
                  ? 'holding-menu-active shadow-sm'
                  : 'text-gray-600 hover:bg-amber-50 hover:text-amber-800'
              ]"
            >
              <div class="h-10 w-full flex items-center px-3">
                <component
                  :is="item.icon"
                  class="w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110"
                  :class="isActive ? 'text-amber-700' : 'text-gray-500 group-hover:text-amber-700'"
                />
                <span
                  class="ml-3 whitespace-nowrap transition-all duration-300 text-sm font-medium overflow-hidden"
                  :class="[
                    isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0',
                    isActive ? 'text-amber-800' : 'text-gray-700'
                  ]"
                >
                  {{ item.name }}
                </span>
                <!-- Gold dot indicator for active -->
                <div
                  v-if="isActive"
                  class="ml-auto w-1.5 h-1.5 rounded-full bg-[#C9A84C] transition-all duration-300"
                  :class="isExpanded ? 'opacity-100' : 'opacity-0'"
                ></div>
              </div>
            </a>
          </router-link>
        </div>

        <!-- Collapsed: show icon only for KPI Perusahaan -->
        <div v-show="!isExpanded" class="space-y-1">
          <router-link
            v-for="item in holdingItems"
            :key="`collapsed-${item.path}`"
            :to="item.path"
            custom
            v-slot="{ isActive, href, navigate }"
          >
            <a
              :href="href"
              @click="navigate"
              class="group relative flex items-center justify-center cursor-pointer transition-all duration-200 rounded-lg"
              :class="isActive ? 'holding-menu-active' : 'text-gray-600 hover:bg-amber-50'"
              :title="item.name"
            >
              <div class="h-10 w-full flex items-center justify-center">
                <component
                  :is="item.icon"
                  class="w-4 h-4 shrink-0"
                  :class="isActive ? 'text-amber-700' : 'text-gray-500 group-hover:text-amber-700'"
                />
              </div>
            </a>
          </router-link>
        </div>
      </div>
      <!-- END HOLDING MENU GROUP -->

    </nav>

    <!-- Bottom Section -->
    <div class="border-t border-gray-200 bg-gray-50">
      <div class="px-4 py-2 text-xs text-gray-400 text-center transition-all duration-300" :class="isExpanded ? 'opacity-100' : 'opacity-0'">
        <span class="font-mono">v{{ version }}</span>
      </div>
      <div class="p-3">
        <div class="relative">
          <button 
            class="w-full flex items-center p-2 rounded-lg transition-all duration-200 hover:bg-white hover:shadow-sm"
            :class="showDropdown ? 'bg-white shadow-sm' : ''"
            @click="showDropdown = !showDropdown"
          >
            <div class="w-9 h-9 rounded-full bg-gradient-to-br from-[#B70000] to-[#950000] overflow-hidden shrink-0 flex items-center justify-center shadow-md">
              <UserIcon class="w-5 h-5 text-white" />
            </div>
            <div class="ml-3 transition-all duration-300 overflow-hidden whitespace-nowrap text-left flex-1" :class="isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0'">
              <div class="font-semibold text-gray-900 text-sm truncate">{{ authStore.user?.name || 'User' }}</div>
              <div class="text-xs text-gray-500">{{ authStore.user?.is_admin ? 'Administrator' : 'User' }}</div>
            </div>
            <ChevronDownIcon v-if="isExpanded" class="w-4 h-4 text-gray-400 transition-transform duration-200 ml-2" :class="showDropdown ? 'rotate-180' : ''" />
          </button>
          <transition
            enter-active-class="transition ease-out duration-100"
            enter-from-class="transform opacity-0 scale-95"
            enter-to-class="transform opacity-100 scale-100"
            leave-active-class="transition ease-in duration-75"
            leave-from-class="transform opacity-100 scale-100"
            leave-to-class="transform opacity-0 scale-95"
          >
            <div v-if="showDropdown && isExpanded" class="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
              <button class="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center transition-colors" @click="handleProfile">
                <UserCircleIcon class="w-4 h-4 mr-3 text-gray-400" />
                <span class="font-medium">Profile</span>
              </button>
              <div class="border-t border-gray-100 my-1"></div>
              <button class="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center transition-colors" @click="handleLogout">
                <ArrowRightOnRectangleIcon class="w-4 h-4 mr-3" />
                <span class="font-medium">Logout</span>
              </button>
            </div>
          </transition>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import packageJson from '../../package.json'

import {
  HomeIcon,
  ChartPieIcon,
  UserGroupIcon,
  Cog6ToothIcon,
  UserIcon,
  ChartBarIcon,
  PresentationChartLineIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  WrenchScrewdriverIcon,
  ChevronDownIcon,
  SparklesIcon,
  ArrowTrendingUpIcon,
  ComputerDesktopIcon,
  BuildingStorefrontIcon,
  // ⭐ NEW: Holding icons
  BuildingOffice2Icon,
  ChartBarSquareIcon,
} from '@heroicons/vue/24/outline'

const router = useRouter()
const authStore = useAuthStore()
const isExpanded = ref(false)
const showDropdown = ref(false)
const showStats = ref(true)
const showKPI = ref(true)
const showHolding = ref(true) // ⭐ NEW

// Statistics items
const statsItems = [
  { name: 'Service Advisor', icon: UserIcon, path: '/dashboard/service-advisor' },
  { name: 'Mekanik', icon: Cog6ToothIcon, path: '/dashboard/mechanics' },
]

// KPI items
const kpiItems = [
  { name: 'KPI Outlet', icon: BuildingStorefrontIcon, path: '/dashboard/kpi/outlet', isNew: true },
  { name: 'Customer Support', icon: UserGroupIcon, path: '/dashboard/kpi/customer-support' },
  { name: 'Mekanik', icon: WrenchScrewdriverIcon, path: '/dashboard/kpi/mechanic' },
  { name: 'Marketing', icon: PresentationChartLineIcon, path: '/dashboard/kpi/marketing' },
  { name: 'Kaizen', icon: ArrowTrendingUpIcon, path: '/dashboard/kpi/kaizen' },
  { name: 'IT', icon: ComputerDesktopIcon, path: '/dashboard/kpi/it' },
]

// ⭐ NEW: Holding items
const holdingItems = [
  { name: 'Overview', icon: ChartPieIcon, path: '/dashboard/overview' },
  {
    name: 'KPI Perusahaan',
    icon: ChartBarSquareIcon,
    path: '/dashboard/holding/kpi',
  },
  // Tambahkan menu holding lain di sini nanti, contoh:
  // { name: 'Financial Report', icon: BanknotesIcon, path: '/dashboard/holding/finance' },
]

const version = packageJson.version

const handleMouseEnter = () => { isExpanded.value = true }
const handleMouseLeave = () => { isExpanded.value = false; showDropdown.value = false }
const toggleStats = () => { if (isExpanded.value) showStats.value = !showStats.value }
const toggleKPI = () => { if (isExpanded.value) showKPI.value = !showKPI.value }
const toggleHolding = () => { if (isExpanded.value) showHolding.value = !showHolding.value } // ⭐ NEW

const handleProfile = () => { showDropdown.value = false; router.push('/profile') }
const handleLogout = async () => {
  try { await authStore.logout(); router.push('/login') }
  catch (error) { console.error('Logout failed:', error) }
}

const closeDropdown = (e) => {
  if (showDropdown.value && !e.target.closest('.relative')) showDropdown.value = false
}

onMounted(() => { document.addEventListener('click', closeDropdown) })
onUnmounted(() => { document.removeEventListener('click', closeDropdown) })
</script>

<style scoped>
/* Holding menu active state — gold theme */
.holding-menu-active {
  background: linear-gradient(to right, #fef9ec, #fef3c7);
  border: 1px solid rgba(201, 168, 76, 0.25);
}

/* Custom scrollbar */
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 3px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #D1D5DB; }

* {
  transition-property: color, background-color, border-color, transform, opacity;
  transition-duration: 200ms;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

.router-link-active { background-color: inherit; }
.group:hover .group-hover\:scale-110 { transform: scale(1.1); }

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
.animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
</style>