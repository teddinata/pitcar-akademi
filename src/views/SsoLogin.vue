<template>
  <div class="flex min-h-screen items-center justify-center bg-gray-50 px-6">
    <div class="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-sm" role="status" aria-live="polite">
      <template v-if="!error">
        <div class="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-red-700 motion-reduce:animate-none" aria-hidden="true"></div>
        <p class="mt-4 font-semibold text-gray-900">Masuk dari Sokasistem…</p>
        <p class="mt-1 text-sm text-gray-600">Sebentar, akun Akademi Anda sedang disiapkan.</p>
      </template>
      <template v-else>
        <p class="font-semibold text-gray-900">Tidak bisa masuk otomatis</p>
        <p class="mt-1 text-sm text-gray-600">{{ error }}</p>
        <router-link to="/login" class="mt-4 inline-flex min-h-11 items-center rounded-xl bg-red-700 px-4 text-sm font-semibold text-white hover:bg-red-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-700">Masuk dengan password</router-link>
      </template>
    </div>
  </div>
</template>

<script setup>
// Masuk otomatis dari ubin Akademi di Sokasistem. Tautan membawa token sekali pakai
// (berlaku 60 detik) di fragmen URL: #db=...&login=...&token=...&next=/dashboard/lms
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const error = ref('')

// Hanya halaman di dalam aplikasi ini, supaya tautan tidak bisa membelokkan ke situs lain.
const amanTujuan = (next) => (typeof next === 'string' && next.startsWith('/') && !next.startsWith('//') ? next : '/dashboard/lms')

onMounted(async () => {
  const params = new URLSearchParams(window.location.hash.slice(1))
  // Token dihapus dari alamat secepatnya supaya tidak tersimpan di riwayat browser.
  history.replaceState(null, '', window.location.pathname)
  const db = params.get('db')
  const login = params.get('login')
  const token = params.get('token')
  if (!db || !login || !token) {
    error.value = 'Tautan masuk tidak lengkap. Buka lagi Akademi dari Sokasistem.'
    return
  }
  try {
    // Odoo 16 menyimpan database di cookie sesi: pilih database dulu, kalau tidak sesi langsung kedaluwarsa.
    await fetch(`/web/login?db=${encodeURIComponent(db)}`, { credentials: 'include', redirect: 'manual' }).catch(() => {})
    await authStore.login(db, login, `soka-sso:${token}`)
    router.replace(amanTujuan(params.get('next')))
  } catch {
    error.value = 'Tautan masuk sudah dipakai atau kedaluwarsa. Buka lagi Akademi dari Sokasistem, atau masuk dengan password.'
  }
})
</script>
