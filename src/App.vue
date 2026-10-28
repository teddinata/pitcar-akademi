<script setup>
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from './stores/auth'
// Pastikan nama import sesuai dengan nama file
// import PWAUpdatePopUp from './components/PWAUpdatePopUp.vue'  // Sesuaikan dengan nama file yang sebenarnya
import Sidebar from './components/Sidebar.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

onMounted(() => {
  authStore.checkAuth()
})
</script>

<template>
  <!-- Autentikasi Layout -->
  <div v-if="authStore.isAuthenticated" class="flex h-screen bg-gray-50">
    <Sidebar />
    <div class="flex-1 overflow-auto md:pb-0" :class="route.meta.focusMode ? '' : 'pb-16'">
      <router-view></router-view>
    </div>
  </div>

  <!-- Non-Autentikasi Layout -->
  <div v-else class="h-screen">
    <router-view></router-view>
  </div>
</template>