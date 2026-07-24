<template>
  <!-- Desktop Sidebar -->
  <div
    class="hidden md:flex h-screen bg-white border-r border-gray-200 transition-all duration-300 ease-in-out relative flex flex-col shadow-sm"
    :class="isExpanded ? 'w-64' : 'w-20'"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <!-- Logo -->
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

    <!-- Scrollable nav -->
    <nav class="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar py-4 px-3 space-y-1">

      <!-- ── BELAJAR SECTION ── -->
      <div class="mb-4">
        <div
          class="flex items-center px-3 h-9 text-xs font-bold uppercase tracking-wider mb-1 cursor-pointer rounded-lg transition-all duration-200"
          :class="[
            isExpanded ? 'justify-between' : 'justify-center',
            showBelajar || belajarActive ? 'text-blue-600' : 'text-gray-400 hover:text-blue-600'
          ]"
          @click="toggleBelajar"
        >
          <div class="flex items-center gap-3">
            <AcademicCapIcon class="w-5 h-5 shrink-0" />
            <span class="transition-all duration-300 overflow-hidden" :class="isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0'">Belajar</span>
          </div>
          <ChevronDownIcon v-if="isExpanded" class="w-4 h-4 transition-transform duration-200" :class="showBelajar ? 'rotate-180' : ''" />
        </div>
        <div v-show="showBelajar && isExpanded" class="space-y-0.5 pl-2">
          <NavItem v-for="item in filteredBelajarItems" :key="item.path" :item="item" :is-expanded="isExpanded" active-class="lms-active" />
        </div>
        <div v-show="!isExpanded" class="space-y-0.5">
          <NavItem v-for="item in filteredBelajarItems" :key="`bc-${item.path}`" :item="item" :is-expanded="false" active-class="lms-active" />
        </div>
      </div>

      <!-- ── KELOLA SECTION (admin) ── -->
      <div v-if="filteredKelolaItems.length" class="mb-4">
        <div
          class="flex items-center px-3 h-9 text-xs font-bold uppercase tracking-wider mb-1 cursor-pointer rounded-lg transition-all duration-200"
          :class="[
            isExpanded ? 'justify-between' : 'justify-center',
            showKelola || kelolaActive ? 'text-[#B70000]' : 'text-gray-400 hover:text-[#B70000]'
          ]"
          @click="toggleKelola"
        >
          <div class="flex items-center gap-3">
            <Cog6ToothIcon class="w-5 h-5 shrink-0" />
            <span class="transition-all duration-300 overflow-hidden" :class="isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0'">Kelola Konten</span>
          </div>
          <ChevronDownIcon v-if="isExpanded" class="w-4 h-4 transition-transform duration-200" :class="showKelola ? 'rotate-180' : ''" />
        </div>
        <div v-show="showKelola && isExpanded" class="space-y-0.5 pl-2">
          <NavItem v-for="item in filteredKelolaItems" :key="item.path" :item="item" :is-expanded="isExpanded" active-class="assessment-active" />
        </div>
        <div v-show="!isExpanded" class="space-y-0.5">
          <NavItem v-for="item in filteredKelolaItems" :key="`kc-${item.path}`" :item="item" :is-expanded="false" active-class="assessment-active" />
        </div>
      </div>

      <!-- ── ANALITIK SECTION (admin) ── -->
      <div v-if="filteredAnalitikItems.length" class="mb-4">
        <div
          class="flex items-center px-3 h-9 text-xs font-bold uppercase tracking-wider mb-1 cursor-pointer rounded-lg transition-all duration-200"
          :class="[
            isExpanded ? 'justify-between' : 'justify-center',
            showAnalitik || analitikActive ? 'text-indigo-600' : 'text-gray-400 hover:text-indigo-600'
          ]"
          @click="toggleAnalitik"
        >
          <div class="flex items-center gap-3">
            <ChartBarSquareIcon class="w-5 h-5 shrink-0" />
            <span class="transition-all duration-300 overflow-hidden" :class="isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0'">Analitik</span>
          </div>
          <ChevronDownIcon v-if="isExpanded" class="w-4 h-4 transition-transform duration-200" :class="showAnalitik ? 'rotate-180' : ''" />
        </div>
        <div v-show="showAnalitik && isExpanded" class="space-y-0.5 pl-2">
          <NavItem v-for="item in filteredAnalitikItems" :key="item.path" :item="item" :is-expanded="isExpanded" active-class="lms-active" />
        </div>
        <div v-show="!isExpanded" class="space-y-0.5">
          <NavItem v-for="item in filteredAnalitikItems" :key="`ac-${item.path}`" :item="item" :is-expanded="false" active-class="lms-active" />
        </div>
      </div>

      <!-- ── JOURNEY SECTION ── -->
      <div class="mb-4">
        <div
          class="flex items-center px-3 h-9 text-xs font-bold uppercase tracking-wider mb-1 cursor-pointer rounded-lg transition-all duration-200"
          :class="[
            isExpanded ? 'justify-between' : 'justify-center',
            showJourney || isJourneyRoute ? 'text-emerald-600' : 'text-gray-400 hover:text-emerald-600'
          ]"
          @click="toggleJourney"
        >
          <div class="flex items-center gap-3">
            <RocketLaunchIcon class="w-5 h-5 shrink-0" />
            <span
              class="transition-all duration-300 overflow-hidden"
              :class="isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0'"
            >
              Journey
            </span>
          </div>
          <ChevronDownIcon
            v-if="isExpanded"
            class="w-4 h-4 transition-transform duration-200"
            :class="showJourney ? 'rotate-180' : ''"
          />
        </div>

        <!-- Expanded submenu -->
        <div v-show="showJourney && isExpanded" class="space-y-0.5 pl-2">
          <template v-for="item in filteredJourneyItems" :key="item.path || item.label">
            <div v-if="item.divider" class="pt-3 pb-1 px-1">
              <p class="text-[9px] font-bold uppercase tracking-widest text-gray-400 px-2">{{ item.label }}</p>
              <div class="h-px bg-gray-100 mt-1.5"></div>
            </div>
            <NavItem
              v-else
              :item="item"
              :is-expanded="isExpanded"
              active-class="journey-active"
            />
          </template>
        </div>

        <!-- Collapsed: icons only -->
        <div v-show="!isExpanded" class="space-y-0.5">
          <NavItem
            v-for="item in filteredJourneyItems.filter(i => !i.divider)"
            :key="`jc-${item.path}`"
            :item="item"
            :is-expanded="false"
            active-class="journey-active"
          />
        </div>
      </div>

    </nav>

    <!-- Bottom: user -->
    <div class="border-t border-gray-200 bg-gray-50">
      <div
        class="px-4 py-2 text-xs text-gray-400 text-center transition-all duration-300"
        :class="isExpanded ? 'opacity-100' : 'opacity-0'"
      >
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
            <div
              class="ml-3 transition-all duration-300 overflow-hidden whitespace-nowrap text-left flex-1"
              :class="isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0'"
            >
              <div class="font-semibold text-gray-900 text-sm truncate">{{ authStore.user?.name || 'User' }}</div>
              <div class="text-xs text-gray-500">{{ authStore.user?.is_admin ? 'Administrator' : 'Karyawan' }}</div>
            </div>
            <ChevronDownIcon
              v-if="isExpanded"
              class="w-4 h-4 text-gray-400 transition-transform duration-200 ml-2"
              :class="showDropdown ? 'rotate-180' : ''"
            />
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
              v-if="showDropdown && isExpanded"
              class="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
            >
              <button
                class="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center transition-colors"
                @click="handleLogout"
              >
                <ArrowRightOnRectangleIcon class="w-4 h-4 mr-3" />
                <span class="font-medium">Logout</span>
              </button>
            </div>
          </transition>
        </div>
      </div>
    </div>
  </div>

  <!-- Mobile Bottom Navigation Bar -->
  <div class="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-200 flex items-center justify-around px-2 z-40 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
    <!-- Quiz List Tab -->
    <button
      @click="navigateAndClose('/dashboard/quiz')"
      class="flex flex-col items-center justify-center flex-1 py-1 transition-all"
      :class="isRouteActive('/dashboard/quiz') ? 'text-[#B70000]' : 'text-gray-400 hover:text-gray-600'"
    >
      <ClipboardDocumentListIcon class="w-6 h-6 shrink-0" />
      <span class="text-[9px] font-bold mt-0.5">Quiz</span>
    </button>

    <!-- History Tab -->
    <button
      @click="navigateAndClose('/dashboard/quiz/history')"
      class="flex flex-col items-center justify-center flex-1 py-1 transition-all"
      :class="isRouteActive('/dashboard/quiz/history') ? 'text-[#B70000]' : 'text-gray-400 hover:text-gray-600'"
    >
      <ClockIcon class="w-6 h-6 shrink-0" />
      <span class="text-[9px] font-bold mt-0.5">Riwayat</span>
    </button>

    <!-- LMS Tab -->
    <button
      @click="toggleMobileLms"
      class="flex flex-col items-center justify-center flex-1 py-1 transition-all"
      :class="isLmsRoute || showMobileLms ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'"
    >
      <AcademicCapIcon class="w-6 h-6 shrink-0" />
      <span class="text-[9px] font-bold mt-0.5">LMS</span>
    </button>

    <!-- Admin Manage Tab (Admins Only) -->
    <button
      v-if="authStore.user?.is_admin"
      @click="toggleMobileKelola"
      class="flex flex-col items-center justify-center flex-1 py-1 transition-all"
      :class="isKelolaRoute || showMobileKelola ? 'text-[#B70000]' : 'text-gray-400 hover:text-gray-600'"
    >
      <Cog6ToothIcon class="w-6 h-6 shrink-0" />
      <span class="text-[9px] font-bold mt-0.5">Kelola</span>
    </button>

    <!-- Account Tab -->
    <button
      @click="toggleMobileAkun"
      class="flex flex-col items-center justify-center flex-1 py-1 transition-all"
      :class="showMobileAkun ? 'text-[#B70000]' : 'text-gray-400 hover:text-gray-600'"
    >
      <UserIcon class="w-6 h-6 shrink-0" />
      <span class="text-[9px] font-bold mt-0.5">Akun</span>
    </button>
  </div>

  <!-- Backdrop Overlay for Mobile Bottom Sheets -->
  <transition
    enter-active-class="transition-opacity ease-out duration-300"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-opacity ease-in duration-200"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="showMobileKelola || showMobileAkun || showMobileLms"
      class="md:hidden fixed inset-0 bg-black/40 z-30 transition-opacity"
      @click="closeAllMobileSheets"
    ></div>
  </transition>

  <!-- Mobile Bottom Sheet for Kelola (Admin Only) -->
  <transition
    enter-active-class="transition ease-out duration-300 transform"
    enter-from-class="translate-y-full opacity-0"
    enter-to-class="translate-y-0 opacity-100"
    leave-active-class="transition ease-in duration-200 transform"
    leave-from-class="translate-y-0 opacity-100"
    leave-to-class="translate-y-full opacity-0"
  >
    <div v-if="showMobileKelola && authStore.user?.is_admin" class="md:hidden fixed bottom-16 left-0 right-0 z-40 bg-white rounded-t-3xl border-t border-gray-200 shadow-2xl p-5 space-y-4 pb-8 transition-all">
      <div class="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-2"></div>
      <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Kelola Assessment</h3>
      <div class="grid grid-cols-3 gap-3">
        <button
          @click="navigateAndClose('/dashboard/quiz/manage', 'kelola')"
          class="flex flex-col items-center justify-center p-3 rounded-2xl bg-gray-50 border border-gray-100 text-center active:scale-95 transition-all"
        >
          <div class="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-[#B70000] mb-2 shadow-sm">
            <Cog6ToothIcon class="w-5 h-5" />
          </div>
          <span class="text-[10px] font-bold text-gray-800 leading-snug">Quiz Bank</span>
        </button>
        
        <button
          @click="navigateAndClose('/dashboard/quiz/program', 'kelola')"
          class="flex flex-col items-center justify-center p-3 rounded-2xl bg-gray-50 border border-gray-100 text-center active:scale-95 transition-all"
        >
          <div class="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-[#B70000] mb-2 shadow-sm">
            <BuildingOffice2Icon class="w-5 h-5" />
          </div>
          <span class="text-[10px] font-bold text-gray-800 leading-snug">Program</span>
        </button>

        <button
          @click="navigateAndClose('/dashboard/quiz/admin', 'kelola')"
          class="flex flex-col items-center justify-center p-3 rounded-2xl bg-gray-50 border border-gray-100 text-center active:scale-95 transition-all"
        >
          <div class="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-[#B70000] mb-2 shadow-sm">
            <ChartBarSquareIcon class="w-5 h-5" />
          </div>
          <span class="text-[10px] font-bold text-gray-800 leading-snug">Dashboard</span>
        </button>
      </div>

      <!-- Journey admin -->
      <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider mt-4 mb-2">Training Journey</h3>
      <div class="grid grid-cols-3 gap-3">
        <button
          @click="navigateAndClose('/dashboard/journey/mine', 'kelola')"
          class="flex flex-col items-center justify-center p-3 rounded-2xl bg-gray-50 border border-gray-100 text-center active:scale-95 transition-all"
        >
          <div class="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 mb-2 shadow-sm">
            <RocketLaunchIcon class="w-5 h-5" />
          </div>
          <span class="text-[10px] font-bold text-gray-800 leading-snug">Journey Saya</span>
        </button>
        <button
          @click="navigateAndClose('/dashboard/journey', 'kelola')"
          class="flex flex-col items-center justify-center p-3 rounded-2xl bg-gray-50 border border-gray-100 text-center active:scale-95 transition-all"
        >
          <div class="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 mb-2 shadow-sm">
            <ListBulletIcon class="w-5 h-5" />
          </div>
          <span class="text-[10px] font-bold text-gray-800 leading-snug">Semua Journey</span>
        </button>
        <button
          @click="navigateAndClose('/dashboard/journey/templates', 'kelola')"
          class="flex flex-col items-center justify-center p-3 rounded-2xl bg-gray-50 border border-gray-100 text-center active:scale-95 transition-all"
        >
          <div class="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 mb-2 shadow-sm">
            <DocumentTextIcon class="w-5 h-5" />
          </div>
          <span class="text-[10px] font-bold text-gray-800 leading-snug">Template</span>
        </button>
      </div>
    </div>
  </transition>

  <!-- Mobile Bottom Sheet for LMS -->
  <transition
    enter-active-class="transition ease-out duration-300 transform"
    enter-from-class="translate-y-full opacity-0"
    enter-to-class="translate-y-0 opacity-100"
    leave-active-class="transition ease-in duration-200 transform"
    leave-from-class="translate-y-0 opacity-100"
    leave-to-class="translate-y-full opacity-0"
  >
    <div v-if="showMobileLms" class="md:hidden fixed bottom-16 left-0 right-0 z-40 bg-white rounded-t-3xl border-t border-gray-200 shadow-2xl p-5 pb-8 transition-all overflow-y-auto max-h-[70vh]">
      <div class="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-3"></div>

      <!-- Learner section -->
      <h3 class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Belajar</h3>
      <div class="grid grid-cols-4 gap-2 mb-4">
        <button
          v-for="item in lmsLearnerItems"
          :key="item.path"
          @click="navigateAndClose(item.path, 'lms')"
          class="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-gray-50 border border-gray-100 text-center active:scale-95 transition-all"
          :class="isRouteActive(item.path) ? 'border-blue-200 bg-blue-50' : ''"
        >
          <div class="w-9 h-9 rounded-full flex items-center justify-center mb-1.5 shadow-sm"
            :class="isRouteActive(item.path) ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600'">
            <component :is="item.icon" class="w-4 h-4" />
          </div>
          <span class="text-[9px] font-bold text-gray-700 leading-snug">{{ item.name }}</span>
        </button>
      </div>

      <!-- Admin section -->
      <template v-if="authStore.user?.is_admin">
        <div class="h-px bg-gray-100 mb-3"></div>
        <h3 class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Admin</h3>
        <div class="grid grid-cols-4 gap-2">
          <button
            v-for="item in lmsAdminItems"
            :key="item.path"
            @click="navigateAndClose(item.path, 'lms')"
            class="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-gray-50 border border-gray-100 text-center active:scale-95 transition-all"
            :class="isRouteActive(item.path) ? 'border-purple-200 bg-purple-50' : ''"
          >
            <div class="w-9 h-9 rounded-full flex items-center justify-center mb-1.5 shadow-sm"
              :class="isRouteActive(item.path) ? 'bg-purple-600 text-white' : 'bg-purple-50 text-purple-600'">
              <component :is="item.icon" class="w-4 h-4" />
            </div>
            <span class="text-[9px] font-bold text-gray-700 leading-snug">{{ item.name }}</span>
          </button>
        </div>
      </template>
    </div>
  </transition>

  <!-- Mobile Bottom Sheet for Akun -->
  <transition
    enter-active-class="transition ease-out duration-300 transform"
    enter-from-class="translate-y-full opacity-0"
    enter-to-class="translate-y-0 opacity-100"
    leave-active-class="transition ease-in duration-200 transform"
    leave-from-class="translate-y-0 opacity-100"
    leave-to-class="translate-y-full opacity-0"
  >
    <div v-if="showMobileAkun" class="md:hidden fixed bottom-16 left-0 right-0 z-40 bg-white rounded-t-3xl border-t border-gray-200 shadow-2xl p-5 space-y-4 pb-8 transition-all">
      <div class="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-2"></div>
      
      <!-- User Info -->
      <div class="flex items-center gap-3 p-3 bg-red-50/30 border border-red-50/50 rounded-2xl">
        <div class="w-12 h-12 rounded-full bg-gradient-to-br from-[#B70000] to-[#950000] flex items-center justify-center text-white shadow-md font-bold text-lg">
          {{ (authStore.user?.name || 'U').charAt(0).toUpperCase() }}
        </div>
        <div>
          <h4 class="font-bold text-gray-900 text-base leading-snug">{{ authStore.user?.name }}</h4>
          <div class="flex items-center gap-1.5 mt-1">
            <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
              :class="authStore.user?.is_admin ? 'bg-red-100 text-[#B70000]' : 'bg-gray-100 text-gray-600'">
              {{ authStore.user?.is_admin ? 'Admin' : 'Karyawan' }}
            </span>
            <span class="text-[10px] text-gray-400 font-mono">v{{ version }}</span>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="space-y-2">
        <button
          @click="handleLogout"
          class="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-[#B70000] to-[#950000] shadow-md hover:shadow-lg transition-all active:scale-95 text-sm flex items-center justify-center gap-2"
        >
          <ArrowRightOnRectangleIcon class="w-5 h-5" />
          Log Out
        </button>
        <button
          @click="showMobileAkun = false"
          class="w-full py-4 rounded-xl font-semibold text-gray-500 bg-gray-50 border border-gray-200 active:scale-95 transition-all text-sm flex items-center justify-center"
        >
          Tutup
        </button>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import packageJson from '../../package.json'

import {
  UserIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  ChevronDownIcon,
  BuildingOffice2Icon,
  ChartBarSquareIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
  AcademicCapIcon,
  BookOpenIcon,
  RectangleStackIcon,
  ClipboardDocumentCheckIcon,
  StarIcon,
  MapIcon,
  TrophyIcon,
  PresentationChartLineIcon,
  TagIcon,
  PuzzlePieceIcon,
  UsersIcon,
  RocketLaunchIcon,
  ListBulletIcon,
  DocumentTextIcon,
} from '@heroicons/vue/24/outline'
import NavItem from './NavItem.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const isExpanded = ref(false)
const showDropdown = ref(false)
const showAssessment = ref(true)
const showLms = ref(false)
const showJourney = ref(false)

// Mobile Navigation States
const showMobileKelola = ref(false)
const showMobileAkun = ref(false)
const showMobileLms = ref(false)

const version = packageJson.version

const lmsLearnerItems = [
  { name: 'Dashboard', icon: AcademicCapIcon, path: '/dashboard/lms', adminOnly: false },
  { name: 'Kursus', icon: BookOpenIcon, path: '/dashboard/lms/courses', adminOnly: false },
  { name: 'Enrollment', icon: RectangleStackIcon, path: '/dashboard/lms/enrollments', adminOnly: false },
  { name: 'Penilaian', icon: ClipboardDocumentCheckIcon, path: '/dashboard/lms/assessments', adminOnly: false },
  { name: 'Kompetensi', icon: StarIcon, path: '/dashboard/lms/competencies', adminOnly: false },
  { name: 'Learning Path', icon: MapIcon, path: '/dashboard/lms/learning-paths', adminOnly: false },
  { name: 'Lencana', icon: TrophyIcon, path: '/dashboard/lms/badges', adminOnly: false },
]

const lmsAdminItems = [
  { name: 'Analitik', icon: PresentationChartLineIcon, path: '/dashboard/lms/analytics', adminOnly: true },
  { name: 'Kategori', icon: TagIcon, path: '/dashboard/lms/categories', adminOnly: true },
  { name: 'Modul', icon: PuzzlePieceIcon, path: '/dashboard/lms/modules', adminOnly: true },
  { name: 'Karyawan', icon: UsersIcon, path: '/dashboard/lms/employees', adminOnly: true },
]

const lmsItems = [
  ...lmsLearnerItems,
  { divider: true, label: 'Admin', adminOnly: true },
  ...lmsAdminItems,
]

const filteredLmsItems = computed(() => {
  const isAdmin = authStore.user?.is_admin
  return isAdmin ? lmsItems : lmsItems.filter(i => !i.adminOnly && !i.divider)
})

const journeyItems = [
  { name: 'Journey Saya', icon: RocketLaunchIcon, path: '/dashboard/journey/mine', adminOnly: false },
  { divider: true, label: 'Admin', adminOnly: true },
  { name: 'Semua Journey', icon: ListBulletIcon, path: '/dashboard/journey', adminOnly: true },
  { name: 'Template', icon: DocumentTextIcon, path: '/dashboard/journey/templates', adminOnly: true },
]

const filteredJourneyItems = computed(() => {
  const isAdmin = authStore.user?.is_admin
  return isAdmin ? journeyItems : journeyItems.filter(i => !i.adminOnly && !i.divider)
})

const isJourneyRoute = computed(() => route.path.startsWith('/dashboard/journey'))

const assessmentItems = [
  { name: 'Daftar Quiz', icon: ClipboardDocumentListIcon, path: '/dashboard/quiz' },
  { name: 'Riwayat', icon: ClockIcon, path: '/dashboard/quiz/history' },
  { name: 'Kelola Quiz Bank', icon: Cog6ToothIcon, path: '/dashboard/quiz/manage' },
  { name: 'Kelola Program', icon: BuildingOffice2Icon, path: '/dashboard/quiz/program' },
  { name: 'Dashboard Admin', icon: ChartBarSquareIcon, path: '/dashboard/quiz/admin' },
]

// Filter assessment items dynamically based on admin status
const filteredAssessmentItems = computed(() => {
  const isAdmin = authStore.user?.is_admin
  if (isAdmin) {
    return assessmentItems
  } else {
    // Only show 'Daftar Quiz' and 'Riwayat' for regular employees
    return assessmentItems.filter(item => 
      item.path === '/dashboard/quiz' || item.path === '/dashboard/quiz/history'
    )
  }
})

// ── IA baru: 3 grup berbasis peran (desktop) ──────────────────────────
const belajarItems = [
  { name: 'Beranda', icon: AcademicCapIcon, path: '/dashboard/lms', adminOnly: false },
  { name: 'Kursus', icon: BookOpenIcon, path: '/dashboard/lms/courses', adminOnly: false },
  { name: 'Quiz Saya', icon: ClipboardDocumentListIcon, path: '/dashboard/quiz', adminOnly: false },
  { name: 'Riwayat Quiz', icon: ClockIcon, path: '/dashboard/quiz/history', adminOnly: false },
  { name: 'Kompetensi', icon: StarIcon, path: '/dashboard/lms/competencies', adminOnly: false },
  { name: 'Learning Path', icon: MapIcon, path: '/dashboard/lms/learning-paths', adminOnly: false },
  { name: 'Lencana', icon: TrophyIcon, path: '/dashboard/lms/badges', adminOnly: false },
]
const kelolaItems = [
  { name: 'Modul & Section', icon: PuzzlePieceIcon, path: '/dashboard/lms/modules', adminOnly: true },
  { name: 'Kategori', icon: TagIcon, path: '/dashboard/lms/categories', adminOnly: true },
  { name: 'Bank Quiz', icon: RectangleStackIcon, path: '/dashboard/quiz/manage', adminOnly: true },
  { name: 'Program Quiz', icon: BuildingOffice2Icon, path: '/dashboard/quiz/program', adminOnly: true },
]
const analitikItems = [
  { name: 'Ringkasan Akademi', icon: ChartBarSquareIcon, path: '/dashboard/analytics', adminOnly: true },
  { name: 'Karyawan', icon: UsersIcon, path: '/dashboard/lms/employees', adminOnly: true },
  { name: 'Analitik LMS', icon: PresentationChartLineIcon, path: '/dashboard/lms/analytics', adminOnly: true },
  { name: 'Dashboard Quiz', icon: ChartBarSquareIcon, path: '/dashboard/quiz/admin', adminOnly: true },
]
const _isAdmin = () => authStore.user?.is_admin
const filteredBelajarItems = computed(() => belajarItems)
const filteredKelolaItems = computed(() => _isAdmin() ? kelolaItems : [])
const filteredAnalitikItems = computed(() => _isAdmin() ? analitikItems : [])

const showBelajar = ref(true)
const showKelola = ref(false)
const showAnalitik = ref(false)
const toggleBelajar = () => { if (isExpanded.value) showBelajar.value = !showBelajar.value }
const toggleKelola = () => { if (isExpanded.value) showKelola.value = !showKelola.value }
const toggleAnalitik = () => { if (isExpanded.value) showAnalitik.value = !showAnalitik.value }

function _groupActive(items) {
  return items.some(i => route.path === i.path || route.path.startsWith(i.path + '/'))
}
const belajarActive = computed(() => _groupActive(belajarItems))
const kelolaActive = computed(() => _groupActive(kelolaItems))
const analitikActive = computed(() => _groupActive(analitikItems))

const handleMouseEnter = () => { isExpanded.value = true }
const handleMouseLeave = () => { isExpanded.value = false; showDropdown.value = false }
const toggleAssessment = () => { if (isExpanded.value) showAssessment.value = !showAssessment.value }
const toggleLms = () => { if (isExpanded.value) showLms.value = !showLms.value }
const toggleJourney = () => { if (isExpanded.value) showJourney.value = !showJourney.value }

const toggleMobileKelola = () => {
  showMobileKelola.value = !showMobileKelola.value
  showMobileAkun.value = false
  showMobileLms.value = false
}

const toggleMobileAkun = () => {
  showMobileAkun.value = !showMobileAkun.value
  showMobileKelola.value = false
  showMobileLms.value = false
}

const toggleMobileLms = () => {
  showMobileLms.value = !showMobileLms.value
  showMobileKelola.value = false
  showMobileAkun.value = false
}

const closeAllMobileSheets = () => {
  showMobileKelola.value = false
  showMobileAkun.value = false
  showMobileLms.value = false
}

const isRouteActive = (path) => route.path === path

const isLmsRoute = computed(() => route.path.startsWith('/dashboard/lms'))

const kelolaRoutePrefixes = ['/dashboard/quiz/program', '/dashboard/quiz/manage', '/dashboard/quiz/admin']
const isKelolaRoute = computed(() => kelolaRoutePrefixes.some(p => route.path.startsWith(p)))

// Auto-expand LMS section on desktop when navigating to an LMS page
watch(isLmsRoute, (val) => {
  if (val) showLms.value = true
}, { immediate: true })

// Auto-expand Journey section on desktop when navigating to a Journey page
watch(isJourneyRoute, (val) => {
  if (val) showJourney.value = true
}, { immediate: true })

const navigateAndClose = (path, type) => {
  if (type === 'kelola') showMobileKelola.value = false
  if (type === 'akun') showMobileAkun.value = false
  if (type === 'lms') showMobileLms.value = false
  router.push(path)
}

const handleLogout = async () => {
  try {
    closeAllMobileSheets()
    await authStore.logout()
    router.push('/login')
  } catch {
    router.push('/login')
  }
}

const closeDropdown = (e) => {
  if (showDropdown.value && !e.target.closest('.relative')) showDropdown.value = false
}

onMounted(() => document.addEventListener('click', closeDropdown))
onUnmounted(() => document.removeEventListener('click', closeDropdown))
</script>

<style scoped>
.assessment-active {
  background: linear-gradient(to right, #fef2f2, #fee2e2);
  border: 1px solid rgba(183, 0, 0, 0.15);
}

.lms-active {
  background: linear-gradient(to right, #eff6ff, #dbeafe);
  border: 1px solid rgba(37, 99, 235, 0.15);
}

.journey-active {
  background: linear-gradient(to right, #f0fdf4, #dcfce7);
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 2px; }

* {
  transition-property: color, background-color, border-color, transform, opacity;
  transition-duration: 200ms;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
