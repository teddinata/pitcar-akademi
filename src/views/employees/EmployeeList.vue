<template>
  <div class="flex flex-col h-full bg-gray-50">
    <!-- Page Header -->
    <div class="bg-white border-b border-gray-200 px-6 py-4">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-xl font-bold text-gray-900">Data Karyawan</h1>
          <p class="text-sm text-gray-500 mt-0.5">
            {{ summary.total_employees || 0 }} karyawan aktif ·
            {{ summary.departments?.total || 0 }} departemen
          </p>
        </div>
        <button
          @click="openCreate"
          class="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#B70000] text-white text-sm font-semibold hover:bg-[#950000] transition-colors shadow-sm"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Tambah Karyawan
        </button>
      </div>

      <!-- Filters -->
      <div class="flex flex-wrap gap-3 mt-4">
        <div class="relative flex-1 min-w-48 max-w-xs">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            v-model="searchQuery"
            @input="debouncedSearch"
            type="text"
            placeholder="Cari nama, email, jabatan..."
            class="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B70000] focus:border-[#B70000]"
          />
        </div>

        <select
          v-model="selectedDept"
          @change="loadEmployees(1)"
          class="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#B70000]"
        >
          <option value="">Semua Departemen</option>
          <option v-for="d in masters.departments" :key="d.id" :value="d.id">{{ d.name }}</option>
        </select>

        <select
          v-model="sortBy"
          @change="loadEmployees(1)"
          class="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#B70000]"
        >
          <option value="name">Urut: Nama</option>
          <option value="id">Urut: ID</option>
          <option value="department">Urut: Departemen</option>
          <option value="create_date">Urut: Terbaru</option>
        </select>

        <button
          @click="showMasterModal = true"
          class="flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          Kelola Dept/Jabatan
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex-1 flex items-center justify-center">
      <div class="flex flex-col items-center gap-3">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#B70000]"></div>
        <p class="text-sm text-gray-500">Memuat data...</p>
      </div>
    </div>

    <!-- Table -->
    <div v-else class="flex-1 overflow-auto">
      <table class="w-full min-w-[800px]">
        <thead class="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
          <tr>
            <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Karyawan</th>
            <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Jabatan</th>
            <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Departemen</th>
            <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Kontak</th>
            <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Manajer</th>
            <th class="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 bg-white">
          <tr v-if="employees.length === 0">
            <td colspan="6" class="px-6 py-16 text-center text-gray-400">
              <svg class="w-10 h-10 mx-auto mb-3 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p class="font-medium text-gray-500">Tidak ada karyawan ditemukan</p>
            </td>
          </tr>
          <tr
            v-for="emp in employees"
            :key="emp.id"
            class="hover:bg-gray-50 transition-colors group"
          >
            <!-- Employee name + avatar -->
            <td class="px-6 py-3">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-full overflow-hidden shrink-0 bg-gradient-to-br from-[#B70000] to-[#950000] flex items-center justify-center">
                  <img
                    v-if="emp.avatar?.small"
                    :src="`data:image/png;base64,${emp.avatar.small}`"
                    :alt="emp.name"
                    class="w-full h-full object-cover"
                  />
                  <span v-else class="text-white text-xs font-bold">{{ initials(emp.name) }}</span>
                </div>
                <div>
                  <p class="text-sm font-semibold text-gray-900">{{ emp.name }}</p>
                  <p class="text-xs text-gray-400">ID #{{ emp.id }}</p>
                </div>
              </div>
            </td>
            <td class="px-4 py-3">
              <p class="text-sm text-gray-700">{{ emp.job_title || '—' }}</p>
            </td>
            <td class="px-4 py-3">
              <span v-if="emp.department" class="text-sm text-gray-700">{{ emp.department.name }}</span>
              <span v-else class="text-sm text-gray-400">—</span>
            </td>
            <td class="px-4 py-3">
              <p class="text-sm text-gray-600">{{ emp.work_email || '—' }}</p>
              <p v-if="emp.work_phone || emp.mobile_phone" class="text-xs text-gray-400">
                {{ emp.work_phone || emp.mobile_phone }}
              </p>
            </td>
            <td class="px-4 py-3 text-sm text-gray-600">{{ emp.manager || '—' }}</td>
            <td class="px-6 py-3 text-right">
              <div class="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  @click="openEdit(emp)"
                  class="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                  title="Edit"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  @click="confirmArchive(emp)"
                  class="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                  title="Arsipkan"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="bg-white border-t border-gray-200 px-6 py-3 flex items-center justify-between">
      <p class="text-sm text-gray-500">
        Menampilkan {{ (pagination.current_page - 1) * pagination.items_per_page + 1 }}–{{
          Math.min(pagination.current_page * pagination.items_per_page, pagination.total_items)
        }} dari {{ pagination.total_items }} karyawan
      </p>
      <div class="flex items-center gap-1">
        <button
          @click="loadEmployees(pagination.current_page - 1)"
          :disabled="!pagination.has_previous"
          class="px-3 py-1.5 text-sm rounded-lg border transition-colors"
          :class="pagination.has_previous ? 'border-gray-200 text-gray-600 hover:bg-gray-50' : 'border-gray-100 text-gray-300 cursor-not-allowed'"
        >
          ← Sebelumnya
        </button>

        <template v-for="p in pageNumbers" :key="p">
          <button
            v-if="p !== '...'"
            @click="loadEmployees(p)"
            class="w-8 h-8 text-sm rounded-lg transition-colors"
            :class="p === pagination.current_page
              ? 'bg-[#B70000] text-white font-bold'
              : 'text-gray-600 hover:bg-gray-100'"
          >{{ p }}</button>
          <span v-else class="px-1 text-gray-400">…</span>
        </template>

        <button
          @click="loadEmployees(pagination.current_page + 1)"
          :disabled="!pagination.has_next"
          class="px-3 py-1.5 text-sm rounded-lg border transition-colors"
          :class="pagination.has_next ? 'border-gray-200 text-gray-600 hover:bg-gray-50' : 'border-gray-100 text-gray-300 cursor-not-allowed'"
        >
          Selanjutnya →
        </button>

        <select
          v-model.number="pageSize"
          @change="loadEmployees(1)"
          class="ml-2 text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none"
        >
          <option :value="10">10/hal</option>
          <option :value="20">20/hal</option>
          <option :value="50">50/hal</option>
        </select>
      </div>
    </div>

    <!-- ─────────────────────────────────────
         EMPLOYEE FORM MODAL (Create / Edit)
    ───────────────────────────────────────── -->
    <Teleport to="body">
      <div v-if="showForm" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-xl">
          <!-- Modal header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 class="text-lg font-bold text-gray-900">
              {{ editingId ? 'Edit Karyawan' : 'Tambah Karyawan Baru' }}
            </h2>
            <button @click="closeForm" class="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Tabs -->
          <div class="flex border-b border-gray-200 px-6">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              @click="activeTab = tab.id"
              class="px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors"
              :class="activeTab === tab.id
                ? 'border-[#B70000] text-[#B70000]'
                : 'border-transparent text-gray-500 hover:text-gray-700'"
            >
              {{ tab.label }}
            </button>
          </div>

          <!-- Form body -->
          <div class="flex-1 overflow-y-auto px-6 py-5">
            <!-- Tab: Dasar -->
            <div v-show="activeTab === 'basic'" class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div class="col-span-2">
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Nama Lengkap <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="form.name"
                    type="text"
                    placeholder="Masukkan nama lengkap"
                    class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B70000]"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Jabatan</label>
                  <input
                    v-model="form.job_title"
                    type="text"
                    placeholder="e.g. Service Advisor"
                    class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B70000]"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Tanggal Masuk</label>
                  <input
                    v-model="form.hire_date"
                    type="date"
                    class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B70000]"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Departemen</label>
                  <select
                    v-model="form.department_id"
                    class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B70000]"
                  >
                    <option :value="null">— Pilih Departemen —</option>
                    <option v-for="d in masters.departments" :key="d.id" :value="d.id">{{ d.name }}</option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Posisi / Jabatan Formal</label>
                  <select
                    v-model="form.job_id"
                    class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B70000]"
                  >
                    <option :value="null">— Pilih Posisi —</option>
                    <option
                      v-for="p in filteredPositions"
                      :key="p.id"
                      :value="p.id"
                    >{{ p.name }}</option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Manajer / Atasan</label>
                  <select
                    v-model="form.parent_id"
                    class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B70000]"
                  >
                    <option :value="null">— Tidak Ada —</option>
                    <option
                      v-for="e in allEmployees"
                      :key="e.id"
                      :value="e.id"
                    >{{ e.name }}</option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Email Kerja</label>
                  <input
                    v-model="form.work_email"
                    type="email"
                    placeholder="nama@pitcar.co.id"
                    class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B70000]"
                  />
                </div>
              </div>
            </div>

            <!-- Tab: Kontak -->
            <div v-show="activeTab === 'contact'" class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Telepon Kerja</label>
                  <input
                    v-model="form.work_phone"
                    type="tel"
                    placeholder="021-xxxx"
                    class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B70000]"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">HP / Mobile</label>
                  <input
                    v-model="form.mobile_phone"
                    type="tel"
                    placeholder="08xxxxxxxxxx"
                    class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B70000]"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Kontak Darurat</label>
                  <input
                    v-model="form.emergency_contact"
                    type="text"
                    placeholder="Nama kontak darurat"
                    class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B70000]"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">HP Kontak Darurat</label>
                  <input
                    v-model="form.emergency_phone"
                    type="tel"
                    placeholder="08xxxxxxxxxx"
                    class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B70000]"
                  />
                </div>
              </div>
            </div>

            <!-- Tab: Personal -->
            <div v-show="activeTab === 'personal'" class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Jenis Kelamin</label>
                  <select
                    v-model="form.gender"
                    class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B70000]"
                  >
                    <option value="">— Pilih —</option>
                    <option
                      v-for="(label, key) in masters.selection_fields?.gender"
                      :key="key"
                      :value="key"
                    >{{ label }}</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Status Pernikahan</label>
                  <select
                    v-model="form.marital"
                    class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B70000]"
                  >
                    <option value="">— Pilih —</option>
                    <option
                      v-for="(label, key) in masters.selection_fields?.marital"
                      :key="key"
                      :value="key"
                    >{{ label }}</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Tanggal Lahir</label>
                  <input
                    v-model="form.birthday"
                    type="date"
                    class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B70000]"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Jumlah Anak</label>
                  <input
                    v-model.number="form.children"
                    type="number"
                    min="0"
                    max="20"
                    class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B70000]"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">No. KTP</label>
                  <input
                    v-model="form.identification_id"
                    type="text"
                    placeholder="16 digit NIK"
                    maxlength="16"
                    class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B70000]"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">No. Passport</label>
                  <input
                    v-model="form.passport_id"
                    type="text"
                    placeholder="Opsional"
                    class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B70000]"
                  />
                </div>
                <div class="col-span-2">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Catatan</label>
                  <textarea
                    v-model="form.notes"
                    rows="3"
                    placeholder="Catatan tambahan..."
                    class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B70000] resize-none"
                  ></textarea>
                </div>
              </div>
            </div>
          </div>

          <!-- Error message -->
          <div v-if="formError" class="mx-6 mb-2 px-4 py-3 bg-red-50 border border-red-200 rounded-lg">
            <p class="text-sm text-red-700">{{ formError }}</p>
          </div>

          <!-- Modal footer -->
          <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
            <button
              @click="closeForm"
              class="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
            <button
              @click="submitForm"
              :disabled="saving || !form.name"
              class="px-5 py-2 text-sm font-bold text-white rounded-lg transition-all"
              :class="saving || !form.name
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-[#B70000] hover:bg-[#950000]'"
            >
              <span v-if="saving" class="flex items-center gap-2">
                <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Menyimpan...
              </span>
              <span v-else>{{ editingId ? 'Simpan Perubahan' : 'Tambah Karyawan' }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Archive confirm -->
      <div v-if="archiveTarget" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl w-full max-w-sm p-6 space-y-4">
          <div class="w-12 h-12 mx-auto bg-red-100 rounded-full flex items-center justify-center">
            <svg class="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="text-center">
            <h3 class="font-bold text-gray-900">Arsipkan Karyawan?</h3>
            <p class="text-sm text-gray-500 mt-2">
              <strong>{{ archiveTarget.name }}</strong> akan diarsipkan dan tidak muncul di daftar aktif.
            </p>
          </div>
          <div class="flex gap-3">
            <button @click="archiveTarget = null" class="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600">
              Batal
            </button>
            <button
              @click="doArchive"
              :disabled="saving"
              class="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-bold"
            >
              {{ saving ? 'Memproses...' : 'Ya, Arsipkan' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Master Data Modal (Dept & Position) -->
      <div v-if="showMasterModal" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-xl">
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 class="text-lg font-bold text-gray-900">Kelola Departemen & Jabatan</h2>
            <button @click="showMasterModal = false" class="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="flex border-b border-gray-200 px-6">
            <button
              @click="masterTab = 'dept'"
              class="px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors"
              :class="masterTab === 'dept' ? 'border-[#B70000] text-[#B70000]' : 'border-transparent text-gray-500'"
            >
              Departemen ({{ masters.departments?.length || 0 }})
            </button>
            <button
              @click="masterTab = 'position'"
              class="px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors"
              :class="masterTab === 'position' ? 'border-[#B70000] text-[#B70000]' : 'border-transparent text-gray-500'"
            >
              Jabatan ({{ masters.positions?.length || 0 }})
            </button>
          </div>

          <div class="flex-1 overflow-y-auto">
            <!-- Departments tab -->
            <div v-if="masterTab === 'dept'" class="p-6 space-y-4">
              <!-- Add new dept form -->
              <div class="flex gap-2">
                <input
                  v-model="newDept.name"
                  type="text"
                  placeholder="Nama departemen baru..."
                  class="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B70000]"
                  @keyup.enter="saveDept"
                />
                <button
                  @click="saveDept"
                  :disabled="!newDept.name || masterSaving"
                  class="px-4 py-2 text-sm font-semibold bg-[#B70000] text-white rounded-lg disabled:bg-gray-300 transition-colors"
                >
                  {{ masterSaving ? '...' : 'Tambah' }}
                </button>
              </div>

              <!-- Dept list -->
              <div class="divide-y divide-gray-100">
                <div
                  v-for="dept in masters.departments"
                  :key="dept.id"
                  class="py-3 flex items-center gap-3 group"
                >
                  <div v-if="editDeptId !== dept.id" class="flex-1">
                    <p class="text-sm font-medium text-gray-900">{{ dept.name }}</p>
                    <p class="text-xs text-gray-400">{{ dept.total_employees }} karyawan · {{ dept.manager || 'Tanpa manajer' }}</p>
                  </div>
                  <div v-else class="flex-1">
                    <input
                      v-model="editDeptName"
                      type="text"
                      class="w-full px-2 py-1 text-sm border border-[#B70000] rounded-lg focus:outline-none"
                      @keyup.enter="updateDept(dept.id)"
                      @keyup.escape="editDeptId = null"
                    />
                  </div>
                  <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      v-if="editDeptId !== dept.id"
                      @click="startEditDept(dept)"
                      class="p-1.5 text-blue-500 hover:bg-blue-50 rounded"
                    >
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      v-else
                      @click="updateDept(dept.id)"
                      class="p-1.5 text-green-500 hover:bg-green-50 rounded"
                    >
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                    <button
                      @click="archiveDept(dept.id)"
                      class="p-1.5 text-red-400 hover:bg-red-50 rounded"
                      :title="dept.total_employees > 0 ? 'Tidak bisa diarsipkan — ada karyawan' : 'Arsipkan'"
                    >
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Positions tab -->
            <div v-if="masterTab === 'position'" class="p-6 space-y-4">
              <div class="flex gap-2">
                <input
                  v-model="newPosition.name"
                  type="text"
                  placeholder="Nama jabatan baru..."
                  class="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B70000]"
                  @keyup.enter="savePosition"
                />
                <select
                  v-model="newPosition.department_id"
                  class="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none"
                >
                  <option :value="null">— Dept —</option>
                  <option v-for="d in masters.departments" :key="d.id" :value="d.id">{{ d.name }}</option>
                </select>
                <button
                  @click="savePosition"
                  :disabled="!newPosition.name || masterSaving"
                  class="px-4 py-2 text-sm font-semibold bg-[#B70000] text-white rounded-lg disabled:bg-gray-300"
                >
                  {{ masterSaving ? '...' : 'Tambah' }}
                </button>
              </div>

              <div class="divide-y divide-gray-100">
                <div
                  v-for="pos in masters.positions"
                  :key="pos.id"
                  class="py-3 flex items-center gap-3 group"
                >
                  <div v-if="editPosId !== pos.id" class="flex-1">
                    <p class="text-sm font-medium text-gray-900">{{ pos.name }}</p>
                    <p class="text-xs text-gray-400">{{ pos.department?.name || 'Tanpa departemen' }} · {{ pos.total_employees }} karyawan</p>
                  </div>
                  <div v-else class="flex-1 flex gap-2">
                    <input
                      v-model="editPosName"
                      type="text"
                      class="flex-1 px-2 py-1 text-sm border border-[#B70000] rounded-lg focus:outline-none"
                      @keyup.enter="updatePos(pos.id)"
                      @keyup.escape="editPosId = null"
                    />
                  </div>
                  <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      v-if="editPosId !== pos.id"
                      @click="startEditPos(pos)"
                      class="p-1.5 text-blue-500 hover:bg-blue-50 rounded"
                    >
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      v-else
                      @click="updatePos(pos.id)"
                      class="p-1.5 text-green-500 hover:bg-green-50 rounded"
                    >
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                    <button
                      @click="archivePos(pos.id)"
                      class="p-1.5 text-red-400 hover:bg-red-50 rounded"
                    >
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Master error -->
          <div v-if="masterError" class="px-6 pb-2">
            <p class="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{{ masterError }}</p>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { employeeApi } from '../../services/employeeApi'

const router = useRouter()

// State
const loading = ref(true)
const saving = ref(false)
const masterSaving = ref(false)
const employees = ref([])
const allEmployees = ref([])
const masters = ref({ departments: [], positions: [], selection_fields: {} })
const summary = ref({})
const pagination = ref({ current_page: 1, total_pages: 1, total_items: 0, items_per_page: 20, has_next: false, has_previous: false })

// Filters
const searchQuery = ref('')
const selectedDept = ref('')
const sortBy = ref('name')
const pageSize = ref(20)
let searchTimer = null

// Form
const showForm = ref(false)
const editingId = ref(null)
const activeTab = ref('basic')
const formError = ref('')
const form = ref(emptyForm())

// Archive
const archiveTarget = ref(null)

// Master modal
const showMasterModal = ref(false)
const masterTab = ref('dept')
const masterError = ref('')
const newDept = ref({ name: '' })
const newPosition = ref({ name: '', department_id: null })
const editDeptId = ref(null)
const editDeptName = ref('')
const editPosId = ref(null)
const editPosName = ref('')

const tabs = [
  { id: 'basic', label: 'Informasi Dasar' },
  { id: 'contact', label: 'Kontak' },
  { id: 'personal', label: 'Personal' },
]

function emptyForm() {
  return {
    name: '', job_title: '', department_id: null, job_id: null,
    parent_id: null, work_email: '', hire_date: '',
    work_phone: '', mobile_phone: '', emergency_contact: '', emergency_phone: '',
    gender: '', marital: '', birthday: '', children: 0,
    identification_id: '', passport_id: '', notes: '',
  }
}

const filteredPositions = computed(() => {
  if (!form.value.department_id) return masters.value.positions || []
  return (masters.value.positions || []).filter(
    p => !p.department_id || p.department_id === form.value.department_id
  )
})

const pageNumbers = computed(() => {
  const total = pagination.value.total_pages
  const current = pagination.value.current_page
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages = []
  if (current <= 4) {
    pages.push(1, 2, 3, 4, 5, '...', total)
  } else if (current >= total - 3) {
    pages.push(1, '...', total - 4, total - 3, total - 2, total - 1, total)
  } else {
    pages.push(1, '...', current - 1, current, current + 1, '...', total)
  }
  return pages
})

function initials(name) {
  if (!name) return '?'
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

function debouncedSearch() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => loadEmployees(1), 400)
}

async function loadMasters() {
  try {
    const data = await employeeApi.masters()
    masters.value = data
  } catch {}
}

async function loadAllEmployees() {
  try {
    const data = await employeeApi.list({ limit: 200, sort_by: 'name', sort_order: 'asc' })
    allEmployees.value = data.rows || []
  } catch {}
}

async function loadEmployees(page = 1) {
  loading.value = true
  try {
    const params = {
      page,
      limit: pageSize.value,
      sort_by: sortBy.value,
      sort_order: 'asc',
    }
    if (searchQuery.value) params.search = searchQuery.value
    if (selectedDept.value) params.department_id = selectedDept.value

    const data = await employeeApi.list(params)
    employees.value = data.rows || []
    summary.value = data.summary || {}
    pagination.value = data.pagination || {}
  } catch (e) {
    if (e.code === 'unauthorized') router.push('/login')
  } finally {
    loading.value = false
  }
}

function openCreate() {
  editingId.value = null
  form.value = emptyForm()
  formError.value = ''
  activeTab.value = 'basic'
  showForm.value = true
}

function openEdit(emp) {
  editingId.value = emp.id
  form.value = {
    name: emp.name || '',
    job_title: emp.job_title || '',
    department_id: emp.department?.id || null,
    job_id: emp.position?.id || null,
    parent_id: emp.parent_id || null,
    work_email: emp.work_email || '',
    hire_date: '',
    work_phone: emp.work_phone || '',
    mobile_phone: emp.mobile_phone || '',
    emergency_contact: emp.emergency_contact || '',
    emergency_phone: emp.emergency_phone || '',
    gender: emp.gender || '',
    marital: emp.marital || '',
    birthday: emp.birthday || '',
    children: emp.children || 0,
    identification_id: emp.identification_id || '',
    passport_id: emp.passport_id || '',
    notes: emp.notes || '',
  }
  formError.value = ''
  activeTab.value = 'basic'
  showForm.value = true
}

function closeForm() {
  showForm.value = false
  editingId.value = null
  formError.value = ''
}

async function submitForm() {
  if (!form.value.name.trim()) { formError.value = 'Nama karyawan wajib diisi.'; return }
  saving.value = true
  formError.value = ''
  try {
    const payload = { ...form.value }
    if (!payload.department_id) payload.department_id = false
    if (!payload.job_id) payload.job_id = false
    if (!payload.parent_id) payload.parent_id = false
    if (!payload.birthday) delete payload.birthday
    if (!payload.hire_date) delete payload.hire_date

    if (editingId.value) {
      await employeeApi.update(editingId.value, payload)
    } else {
      await employeeApi.create(payload)
    }
    closeForm()
    await loadEmployees(pagination.value.current_page)
    await loadMasters()
  } catch (e) {
    formError.value = e.message || 'Gagal menyimpan data.'
  } finally {
    saving.value = false
  }
}

function confirmArchive(emp) {
  archiveTarget.value = emp
}

async function doArchive() {
  if (!archiveTarget.value) return
  saving.value = true
  try {
    await employeeApi.archive(archiveTarget.value.id)
    archiveTarget.value = null
    await loadEmployees(pagination.value.current_page)
    await loadMasters()
  } catch (e) {
    alert(e.message || 'Gagal mengarsipkan karyawan.')
  } finally {
    saving.value = false
  }
}

// Department master operations
async function saveDept() {
  if (!newDept.value.name.trim()) return
  masterSaving.value = true
  masterError.value = ''
  try {
    await employeeApi.createDepartment({ name: newDept.value.name })
    newDept.value.name = ''
    await loadMasters()
  } catch (e) { masterError.value = e.message } finally { masterSaving.value = false }
}

function startEditDept(dept) {
  editDeptId.value = dept.id
  editDeptName.value = dept.name
}

async function updateDept(id) {
  masterSaving.value = true
  masterError.value = ''
  try {
    await employeeApi.updateDepartment({ id, name: editDeptName.value })
    editDeptId.value = null
    await loadMasters()
  } catch (e) { masterError.value = e.message } finally { masterSaving.value = false }
}

async function archiveDept(id) {
  try {
    await employeeApi.archiveDepartment(id)
    await loadMasters()
  } catch (e) { masterError.value = e.message }
}

// Position master operations
async function savePosition() {
  if (!newPosition.value.name.trim()) return
  masterSaving.value = true
  masterError.value = ''
  try {
    await employeeApi.createPosition({
      name: newPosition.value.name,
      department_id: newPosition.value.department_id,
    })
    newPosition.value = { name: '', department_id: null }
    await loadMasters()
  } catch (e) { masterError.value = e.message } finally { masterSaving.value = false }
}

function startEditPos(pos) {
  editPosId.value = pos.id
  editPosName.value = pos.name
}

async function updatePos(id) {
  masterSaving.value = true
  masterError.value = ''
  try {
    await employeeApi.updatePosition({ id, name: editPosName.value })
    editPosId.value = null
    await loadMasters()
  } catch (e) { masterError.value = e.message } finally { masterSaving.value = false }
}

async function archivePos(id) {
  try {
    await employeeApi.archivePosition(id)
    await loadMasters()
  } catch (e) { masterError.value = e.message }
}

onMounted(async () => {
  await Promise.all([loadMasters(), loadAllEmployees()])
  await loadEmployees(1)
})
</script>
