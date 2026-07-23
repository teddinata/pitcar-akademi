<template>
  <div class="min-h-screen bg-gray-50 p-4 md:p-6">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Modul Kursus</h1>
        <p class="text-sm text-gray-500 mt-1">Kelola struktur, modul, dan quiz kursus</p>
      </div>
      <div class="flex items-center gap-2">
        <button
          @click="openSectionManager"
          class="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors shadow-sm"
          title="Kelola bab/section kursus"
        >
          <RectangleStackIcon class="w-4 h-4" />
          <span class="hidden sm:inline">Kelola Section</span>
        </button>
        <button
          @click="openCreateModal"
          class="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
        >
          <PlusIcon class="w-4 h-4" />
          <span class="hidden sm:inline">Tambah Modul</span>
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-5 flex flex-wrap gap-3">
      <input
        v-model="filters.search"
        @input="debouncedLoad"
        placeholder="Cari modul..."
        class="flex-1 min-w-40 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
      />
      <select
        v-model="filters.course_id"
        @change="load"
        class="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 min-w-40"
      >
        <option :value="null">Semua Kursus</option>
        <option v-for="c in courseList" :key="c.id" :value="c.id">{{ c.name }}</option>
      </select>
      <select
        v-model="filters.content_type"
        @change="load"
        class="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
      >
        <option value="">Semua Tipe</option>
        <option value="video">Video</option>
        <option value="document">Dokumen/PDF</option>
        <option value="interactive">Interactive</option>
        <option value="assessment">Asesmen</option>
        <option value="external_link">Link Eksternal</option>
      </select>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <div class="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
    </div>

    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
      <p class="text-red-600 font-medium">{{ error }}</p>
      <button @click="load" class="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700">Coba Lagi</button>
    </div>

    <div v-else-if="!modules.length" class="bg-white rounded-xl p-12 text-center border border-gray-100 shadow-sm">
      <PuzzlePieceIcon class="w-12 h-12 text-gray-300 mx-auto mb-3" />
      <p class="text-gray-500 font-medium">Tidak ada modul ditemukan</p>
    </div>

    <!-- Table -->
    <div v-else class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mb-4">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 text-gray-500 text-xs uppercase">
          <tr>
            <th class="px-4 py-3 text-left font-medium">Nama Modul</th>
            <th class="px-4 py-3 text-center font-medium">Kursus</th>
            <th class="px-4 py-3 text-center font-medium">Section</th>
            <th class="px-4 py-3 text-center font-medium">Tipe</th>
            <th class="px-4 py-3 text-center font-medium">Durasi</th>
            <th class="px-4 py-3 text-center font-medium">Quiz</th>
            <th class="px-4 py-3 text-center font-medium">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50">
          <tr v-for="m in modules" :key="m.id" class="hover:bg-gray-50 transition-colors">
            <td class="px-4 py-3 font-medium text-gray-800">{{ m.name }}</td>
            <td class="px-4 py-3 text-center text-gray-500 text-xs">{{ m.course_name || '—' }}</td>
            <td class="px-4 py-3 text-center text-gray-500 text-xs">{{ m.section_name || '—' }}</td>
            <td class="px-4 py-3 text-center">
              <span class="text-xs px-2 py-0.5 rounded-full font-medium" :class="contentTypeClass(m.content_type)">
                {{ contentTypeLabel(m.content_type) }}
              </span>
            </td>
            <td class="px-4 py-3 text-center text-gray-500 text-xs">{{ m.duration_minutes }} mnt</td>
            <td class="px-4 py-3 text-center">
              <span v-if="m.content_type === 'assessment' && m.quiz_bank_name" class="text-xs px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 font-medium">{{ m.quiz_bank_name }}</span>
              <span v-else-if="m.content_type === 'assessment'" class="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-medium">Belum ada</span>
              <span v-else class="text-xs text-gray-300">—</span>
            </td>
            <td class="px-4 py-3 text-center">
              <div class="flex items-center justify-center gap-2">
                <button
                  v-if="m.content_type === 'assessment' && m.quiz_bank_id"
                  @click="openQuestionManager(m)"
                  class="px-2 py-1 text-xs border border-purple-200 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors"
                  title="Kelola Soal"
                >
                  <ListBulletIcon class="w-3.5 h-3.5" />
                </button>
                <button v-else-if="m.content_type !== 'assessment'" @click="openUploadModal(m)" class="px-2 py-1 text-xs border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors" title="Atur Konten">
                  <ArrowUpTrayIcon class="w-3.5 h-3.5" />
                </button>
                <button @click="openEditModal(m)" class="px-2 py-1 text-xs border border-gray-200 text-gray-500 rounded-lg hover:bg-gray-50 transition-colors">
                  <PencilIcon class="w-3.5 h-3.5" />
                </button>
                <button @click="deleteModule(m)" class="px-2 py-1 text-xs border border-red-100 text-red-400 rounded-lg hover:bg-red-50 transition-colors">
                  <TrashIcon class="w-3.5 h-3.5" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="flex items-center justify-center gap-2 mt-2">
      <button @click="changePage(page - 1)" :disabled="page === 1" class="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors">←</button>
      <span class="text-sm text-gray-500">{{ page }} / {{ totalPages }}</span>
      <button @click="changePage(page + 1)" :disabled="page === totalPages" class="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors">→</button>
    </div>

    <!-- Create/Edit Modal -->
    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" @click.self="showModal = false">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
          <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
            <h2 class="font-bold text-gray-900">{{ editTarget ? 'Edit Modul' : 'Tambah Modul' }}</h2>
            <button @click="showModal = false"><XMarkIcon class="w-5 h-5 text-gray-400" /></button>
          </div>
          <div class="p-6 space-y-4">
            <div v-if="modalError" class="bg-red-50 border border-red-200 rounded-lg p-3 text-red-600 text-sm">{{ modalError }}</div>

            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1">Nama Modul *</label>
              <input v-model="form.name" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" placeholder="Contoh: 1. Fundamental" />
            </div>

            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1">Kursus *</label>
              <select v-model="form.course_id" @change="onFormCourseChange" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300">
                <option :value="null">— Pilih kursus —</option>
                <option v-for="c in courseList" :key="c.id" :value="c.id">{{ c.name }}</option>
              </select>
              <p v-if="coursesLoading" class="text-xs text-gray-400 mt-1">Memuat kursus...</p>
            </div>

            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1">Section / Bab</label>
              <select v-model="form.section_id" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300" :disabled="!form.course_id">
                <option :value="null">— Tanpa section (root) —</option>
                <option v-for="s in formSections" :key="s.id" :value="s.id">{{ s.name }}</option>
              </select>
              <p class="text-xs text-gray-400 mt-1">Pilih bab induk, mis. "M0 Fondasi". Kelola bab lewat tombol "Kelola Section".</p>
            </div>

            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1">Tipe Konten *</label>
              <select v-model="form.content_type" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300">
                <option value="video">🎬 Video</option>
                <option value="document">📄 Dokumen / PDF</option>
                <option value="assessment">📝 Asesmen / Quiz</option>
                <option value="external_link">🔗 Link Eksternal</option>
                <option value="interactive">⚙️ Interactive</option>
              </select>
            </div>

            <!-- Assessment: quiz bank picker -->
            <div v-if="form.content_type === 'assessment'" class="space-y-3 bg-purple-50 border border-purple-100 rounded-lg p-3">
              <div>
                <label class="block text-xs font-semibold text-purple-800 mb-1">Sumber Quiz *</label>
                <select v-model="form.quiz_bank_id" class="w-full border border-purple-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-300">
                  <option :value="null">— Pilih quiz dari bank —</option>
                  <option v-for="q in courseQuizBanks" :key="q.id" :value="q.id">
                    {{ q.name }} ({{ q.question_count }} soal · {{ quizStateLabel(q.state) }})
                  </option>
                </select>
                <p v-if="quizBanksLoading" class="text-xs text-purple-400 mt-1">Memuat daftar quiz...</p>
              </div>

              <!-- Create new quiz bank inline -->
              <div class="border-t border-purple-100 pt-2">
                <p class="text-xs font-semibold text-purple-800 mb-1">Atau buat quiz baru</p>
                <div class="flex gap-2">
                  <input v-model="newQuizName" placeholder="Nama quiz baru..." class="flex-1 border border-purple-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" />
                  <button @click="createQuizBank" :disabled="creatingQuiz || !newQuizName.trim()" class="px-3 py-1.5 text-xs font-semibold text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors">
                    {{ creatingQuiz ? '...' : 'Buat' }}
                  </button>
                </div>
                <p class="text-xs text-purple-500 mt-1">Setelah dibuat, klik "Kelola Soal" (ikon daftar) untuk menambah soal & publish.</p>
              </div>

              <div class="grid grid-cols-3 gap-2 border-t border-purple-100 pt-2">
                <div>
                  <label class="block text-xs font-semibold text-purple-800 mb-1">Nilai Lulus %</label>
                  <input v-model.number="form.passing_score" type="number" min="0" max="100" class="w-full border border-purple-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-purple-800 mb-1">Maks Coba</label>
                  <input v-model.number="form.max_attempts" type="number" min="0" class="w-full border border-purple-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-purple-800 mb-1">Waktu (mnt)</label>
                  <input v-model.number="form.time_limit_minutes" type="number" min="0" class="w-full border border-purple-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" />
                </div>
              </div>
              <p class="text-xs text-purple-500">Maks Coba 0 = tak terbatas. Waktu 0 = ikut durasi quiz / bebas.</p>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-semibold text-gray-600 mb-1">Durasi (menit)</label>
                <input v-model.number="form.duration_minutes" type="number" min="0" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
              </div>
              <div>
                <label class="block text-xs font-semibold text-gray-600 mb-1">Urutan</label>
                <input v-model.number="form.sequence" type="number" min="1" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
              </div>
            </div>
          </div>
          <div class="px-6 py-4 border-t border-gray-100 flex gap-3 justify-end sticky bottom-0 bg-white">
            <button @click="showModal = false" class="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">Batal</button>
            <button @click="saveModal" :disabled="saving" class="px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
              {{ saving ? 'Menyimpan...' : (editTarget ? 'Simpan' : 'Tambah') }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Upload/Set Content Modal -->
    <Teleport to="body">
      <div v-if="uploadTarget" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" @click.self="closeUploadModal">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-md">
          <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 class="font-bold text-gray-900">Atur Konten Modul</h2>
              <p class="text-xs text-gray-400 mt-0.5">{{ uploadTarget.name }}</p>
            </div>
            <button @click="closeUploadModal"><XMarkIcon class="w-5 h-5 text-gray-400" /></button>
          </div>
          <div class="p-6 space-y-4">
            <div v-if="uploadError" class="bg-red-50 border border-red-200 rounded-lg p-3 text-red-600 text-sm">{{ uploadError }}</div>

            <div v-if="uploadTarget.content_url" class="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
              <span class="text-xs text-gray-500 shrink-0">URL saat ini:</span>
              <a :href="uploadTarget.content_url" target="_blank" class="text-xs text-blue-600 hover:underline truncate flex-1">{{ uploadTarget.content_url }}</a>
            </div>

            <div class="flex rounded-lg border border-gray-200 overflow-hidden text-sm font-medium">
              <button @click="uploadMode = 'url'" :class="uploadMode === 'url' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'" class="flex-1 py-2 transition-colors">Link URL</button>
              <button @click="uploadMode = 'file'" :class="uploadMode === 'file' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'" class="flex-1 py-2 transition-colors border-l border-gray-200">Upload File</button>
            </div>

            <div v-if="uploadMode === 'url'" class="space-y-2">
              <p class="text-xs text-gray-400">Google Drive, YouTube, atau URL dokumen langsung</p>
              <input v-model="uploadUrl" placeholder="https://..." class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
              <p class="text-xs text-gray-400">Google Drive: buka file → Bagikan → "Siapapun dengan tautan"</p>
            </div>

            <div v-if="uploadMode === 'file'">
              <label class="block text-xs font-semibold text-gray-600 mb-2">Pilih File</label>
              <input type="file" @change="onFileChange" class="w-full text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
              <p class="text-xs text-gray-400 mt-1">Gunakan Link URL untuk file besar (video, PDF besar)</p>
            </div>
          </div>
          <div class="px-6 py-4 border-t border-gray-100 flex gap-3 justify-end">
            <button @click="closeUploadModal" class="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">Batal</button>
            <button @click="doSaveContent" :disabled="uploading || (uploadMode === 'url' ? !uploadUrl.trim() : !uploadFile)" class="px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
              {{ uploading ? 'Menyimpan...' : 'Simpan' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Section Manager Modal -->
    <Teleport to="body">
      <div v-if="sm.open" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" @click.self="sm.open = false">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
          <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
            <h2 class="font-bold text-gray-900">Kelola Section / Bab</h2>
            <button @click="sm.open = false"><XMarkIcon class="w-5 h-5 text-gray-400" /></button>
          </div>
          <div class="p-6 space-y-4 overflow-y-auto">
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1">Kursus</label>
              <select v-model="sm.courseId" @change="loadSectionsForManager" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300">
                <option :value="null">— Pilih kursus —</option>
                <option v-for="c in courseList" :key="c.id" :value="c.id">{{ c.name }}</option>
              </select>
            </div>

            <div v-if="sm.error" class="bg-red-50 border border-red-200 rounded-lg p-3 text-red-600 text-sm">{{ sm.error }}</div>

            <template v-if="sm.courseId">
              <div v-if="sm.loading" class="flex justify-center py-6">
                <div class="w-6 h-6 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              </div>
              <div v-else class="space-y-2">
                <div v-if="!sm.sections.length" class="text-center py-4 text-sm text-gray-400">Belum ada section.</div>
                <div v-for="(s, i) in sm.sections" :key="s.id" class="flex items-center gap-2 border border-gray-100 rounded-xl px-3 py-2 bg-gray-50">
                  <div class="flex flex-col gap-0.5 shrink-0">
                    <button @click="moveSection(i, -1)" :disabled="i === 0" class="text-gray-400 hover:text-gray-700 disabled:opacity-30 leading-none">▲</button>
                    <button @click="moveSection(i, 1)" :disabled="i === sm.sections.length - 1" class="text-gray-400 hover:text-gray-700 disabled:opacity-30 leading-none">▼</button>
                  </div>
                  <input v-model="s.name" @blur="renameSection(s)" class="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
                  <span class="text-xs text-gray-400 shrink-0">{{ s.module_count }} modul</span>
                  <button @click="deleteSection(s)" class="p-1 text-gray-400 hover:text-red-500 transition-colors shrink-0"><TrashIcon class="w-4 h-4" /></button>
                </div>
              </div>

              <div class="flex gap-2 border-t border-gray-100 pt-3">
                <input v-model="sm.newName" @keyup.enter="addSection" placeholder="Nama section baru, mis. M0 Fondasi" class="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
                <button @click="addSection" :disabled="sm.saving || !sm.newName.trim()" class="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">Tambah</button>
              </div>
            </template>
          </div>
          <div class="px-6 py-4 border-t border-gray-100 flex justify-end shrink-0">
            <button @click="closeSectionManager" class="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">Selesai</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Question Manager Modal (SOP quiz bank) -->
    <Teleport to="body">
      <div v-if="qm.open" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" @click.self="qm.open = false">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
          <!-- Header -->
          <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
            <div>
              <h2 class="font-bold text-gray-900">Kelola Soal</h2>
              <p class="text-xs text-gray-400 mt-0.5">{{ qm.module?.name }} · {{ qm.module?.quiz_bank_name }}</p>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-xs px-2 py-1 rounded-full font-medium" :class="quizStateClass(qm.state)">{{ quizStateLabel(qm.state) }}</span>
              <button @click="qm.open = false"><XMarkIcon class="w-5 h-5 text-gray-400" /></button>
            </div>
          </div>

          <div v-if="qm.locked" class="px-6 py-2 bg-amber-50 border-b border-amber-100 text-xs text-amber-700 shrink-0">
            Quiz sudah dipublish — soal terkunci. Untuk mengubah, buat quiz baru.
          </div>

          <div class="flex flex-col md:flex-row gap-0 flex-1 overflow-hidden">
            <!-- Left: Question List -->
            <div class="md:w-1/2 border-r border-gray-100 overflow-y-auto p-4 space-y-2">
              <div v-if="qm.loading" class="flex justify-center py-8">
                <div class="w-6 h-6 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
              </div>
              <div v-else-if="!qm.questions.length" class="text-center py-8 text-sm text-gray-400">
                Belum ada soal. Tambah soal di sebelah kanan.
              </div>
              <div
                v-for="(q, idx) in qm.questions"
                :key="q.id"
                class="border border-gray-100 rounded-xl p-3 bg-gray-50 hover:bg-white transition-colors"
              >
                <div class="flex items-start justify-between gap-2">
                  <div class="flex-1 min-w-0">
                    <p class="text-xs font-semibold text-gray-700 leading-snug">{{ idx + 1 }}. {{ stripHtml(q.question_text) }}</p>
                    <div class="flex items-center gap-2 mt-1">
                      <span class="text-xs px-1.5 py-0.5 rounded bg-purple-50 text-purple-700">{{ qTypeLabel(q.question_type) }}</span>
                      <span class="text-xs text-gray-400">{{ q.weight }} poin</span>
                    </div>
                    <!-- Options preview -->
                    <div v-if="q.question_type !== 'essay'" class="mt-2 space-y-0.5">
                      <div v-for="[key, text] in optionEntries(q)" :key="key" class="flex items-center gap-1.5 text-xs">
                        <span :class="q.correct_answer === key ? 'text-green-600 font-semibold' : 'text-gray-400'">
                          {{ q.correct_answer === key ? '✓' : '○' }}
                        </span>
                        <span :class="q.correct_answer === key ? 'text-green-700 font-medium' : 'text-gray-500'">{{ text }}</span>
                      </div>
                    </div>
                  </div>
                  <div v-if="!qm.locked" class="flex flex-col gap-1 shrink-0">
                    <button @click="editQuestion(q)" class="p-1 text-gray-400 hover:text-blue-600 transition-colors" title="Edit">
                      <PencilIcon class="w-3.5 h-3.5" />
                    </button>
                    <button @click="deleteQuestion(q)" class="p-1 text-gray-400 hover:text-red-500 transition-colors" title="Hapus">
                      <TrashIcon class="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right: Add/Edit Form -->
            <div v-if="!qm.locked" class="md:w-1/2 overflow-y-auto p-4 space-y-3">
              <h3 class="text-sm font-bold text-gray-700">{{ qm.editingQuestion ? 'Edit Soal' : 'Tambah Soal' }}</h3>

              <div v-if="qm.formError" class="bg-red-50 border border-red-200 rounded-lg p-2 text-xs text-red-600">{{ qm.formError }}</div>

              <div>
                <label class="block text-xs font-semibold text-gray-600 mb-1">Teks Soal *</label>
                <textarea v-model="qm.form.question_text" rows="3" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 resize-none" placeholder="Tulis pertanyaan di sini..."></textarea>
              </div>

              <div class="grid grid-cols-2 gap-2">
                <div>
                  <label class="block text-xs font-semibold text-gray-600 mb-1">Tipe</label>
                  <select v-model="qm.form.question_type" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-300">
                    <option value="multiple_choice">Pilihan Ganda</option>
                    <option value="true_false">Benar / Salah</option>
                    <option value="essay">Esai (dinilai manual)</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs font-semibold text-gray-600 mb-1">Poin</label>
                  <input v-model.number="qm.form.weight" type="number" min="1" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" />
                </div>
              </div>

              <!-- Multiple Choice Options (single correct) -->
              <div v-if="qm.form.question_type === 'multiple_choice'" class="space-y-2">
                <label class="block text-xs font-semibold text-gray-600">Pilihan Jawaban * (pilih 1 yang benar)</label>
                <div v-for="(key, i) in ['a','b','c','d']" :key="key" class="flex items-center gap-2">
                  <input
                    type="radio"
                    name="mc_correct"
                    :value="key"
                    v-model="qm.form.correct_answer"
                    class="w-4 h-4 text-purple-600 shrink-0"
                    title="Jawaban benar"
                  />
                  <input
                    v-model="qm.form.options[i]"
                    :placeholder="`Pilihan ${key.toUpperCase()}`"
                    class="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                  />
                </div>
                <p class="text-xs text-gray-400">Isi minimal A dan B. Pilih radio pada jawaban benar.</p>
              </div>

              <!-- True/False -->
              <div v-if="qm.form.question_type === 'true_false'" class="space-y-2">
                <label class="block text-xs font-semibold text-gray-600">Jawaban Benar</label>
                <div class="flex gap-3">
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input type="radio" v-model="qm.form.correct_answer" value="true" class="w-4 h-4 text-purple-600" />
                    <span class="text-sm text-green-700 font-medium">Benar</span>
                  </label>
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input type="radio" v-model="qm.form.correct_answer" value="false" class="w-4 h-4 text-purple-600" />
                    <span class="text-sm text-red-600 font-medium">Salah</span>
                  </label>
                </div>
              </div>

              <p v-if="qm.form.question_type === 'essay'" class="text-xs text-gray-400">Soal esai tidak butuh kunci jawaban — akan dinilai supervisor.</p>

              <div class="flex gap-2 pt-1">
                <button
                  v-if="qm.editingQuestion"
                  @click="resetQmForm()"
                  class="px-3 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >Batal Edit</button>
                <button
                  @click="saveQuestion"
                  :disabled="qm.saving"
                  class="flex-1 px-4 py-2 text-sm font-semibold text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                >{{ qm.saving ? 'Menyimpan...' : (qm.editingQuestion ? 'Simpan Perubahan' : 'Tambah Soal') }}</button>
              </div>
            </div>
          </div>

          <!-- Footer info + publish -->
          <div class="px-6 py-3 border-t border-gray-100 shrink-0 flex items-center justify-between gap-2">
            <span class="text-xs text-gray-400">{{ qm.questions.length }} soal</span>
            <div class="flex items-center gap-2">
              <button
                v-if="qm.state === 'draft' || qm.state === 'review'"
                @click="publishQuiz"
                :disabled="qm.publishing || !qm.questions.length"
                class="px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              >{{ qm.publishing ? 'Mempublish...' : 'Publish Quiz' }}</button>
              <button @click="qm.open = false" class="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">Selesai</button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <div v-if="toast" class="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm px-5 py-2.5 rounded-full shadow-lg z-50">{{ toast }}</div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { lmsApi } from '../../services/lmsApi'
import { quizApi } from '../../services/quizApi'
import { PuzzlePieceIcon, PlusIcon, PencilIcon, TrashIcon, ArrowUpTrayIcon, XMarkIcon, ListBulletIcon, RectangleStackIcon } from '@heroicons/vue/24/outline'

const loading = ref(false)
const error = ref('')
const modules = ref([])
const page = ref(1)
const totalPages = ref(1)
const toast = ref('')
const showModal = ref(false)
const editTarget = ref(null)
const saving = ref(false)
const modalError = ref('')

const courseList = ref([])
const coursesLoading = ref(false)

// Sections shown in the module form (for the selected course)
const formSections = ref([])
// Course quiz banks for the assessment picker
const courseQuizBanks = ref([])
const quizBanksLoading = ref(false)
const newQuizName = ref('')
const creatingQuiz = ref(false)

const uploadTarget = ref(null)
const uploadFile = ref(null)
const uploadUrl = ref('')
const uploadMode = ref('url')
const uploading = ref(false)
const uploadError = ref('')

const filters = reactive({ search: '', course_id: null, content_type: '' })
const emptyForm = () => ({
  name: '', course_id: null, section_id: null, content_type: 'video',
  duration_minutes: 0, sequence: 1,
  quiz_bank_id: null, passing_score: 70, max_attempts: 1, time_limit_minutes: 0,
})
const form = reactive(emptyForm())

async function loadCourses() {
  if (courseList.value.length) return
  coursesLoading.value = true
  try {
    const res = await lmsApi.courseSearch({ limit: 200 })
    courseList.value = res?.courses ?? []
  } catch { courseList.value = [] }
  finally { coursesLoading.value = false }
}

async function loadFormSections(courseId) {
  formSections.value = []
  if (!courseId) return
  try {
    const res = await lmsApi.sectionSearch({ course_id: courseId })
    formSections.value = res?.sections ?? []
  } catch { formSections.value = [] }
}

async function loadCourseQuizBanks() {
  quizBanksLoading.value = true
  try {
    const res = await quizApi.adminList({ is_course_bank: true, limit: 200 })
    courseQuizBanks.value = res?.quizzes ?? []
  } catch { courseQuizBanks.value = [] }
  finally { quizBanksLoading.value = false }
}

function onFormCourseChange() {
  form.section_id = null
  loadFormSections(form.course_id)
}

let debounceTimer = null
function debouncedLoad() {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => { page.value = 1; load() }, 400)
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    const params = { page: page.value, limit: 20 }
    if (filters.search) params.search = filters.search
    if (filters.course_id) params.course_id = filters.course_id
    if (filters.content_type) params.content_type = filters.content_type
    const res = await lmsApi.moduleSearch(params)
    modules.value = res?.modules ?? []
    totalPages.value = res?.pagination?.total_pages ?? 1
  } catch (e) {
    error.value = e.message || 'Gagal memuat modul'
  } finally {
    loading.value = false
  }
}

function changePage(p) { if (p < 1 || p > totalPages.value) return; page.value = p; load() }

async function deleteModule(m) {
  if (!confirm(`Hapus modul "${m.name}"?`)) return
  try {
    await lmsApi.moduleDelete({ module_id: m.id })
    showToast('Modul berhasil dihapus')
    load()
  } catch (e) {
    showToast(e.message || 'Gagal menghapus modul')
  }
}

function openCreateModal() {
  editTarget.value = null
  Object.assign(form, emptyForm())
  modalError.value = ''
  showModal.value = true
  loadCourses()
  loadCourseQuizBanks()
}

function openEditModal(m) {
  editTarget.value = m
  Object.assign(form, {
    name: m.name,
    course_id: m.course_id,
    section_id: m.section_id || null,
    content_type: m.content_type,
    duration_minutes: m.duration_minutes,
    sequence: m.sequence || 1,
    quiz_bank_id: m.quiz_bank_id || null,
    passing_score: m.passing_score ?? 70,
    max_attempts: m.max_attempts ?? 1,
    time_limit_minutes: m.time_limit_minutes ?? 0,
  })
  modalError.value = ''
  showModal.value = true
  loadCourses()
  loadFormSections(m.course_id)
  loadCourseQuizBanks()
}

async function createQuizBank() {
  if (!newQuizName.value.trim()) return
  creatingQuiz.value = true
  try {
    const res = await quizApi.adminCreate({
      is_course_bank: true,
      name: newQuizName.value.trim(),
      passing_score: form.passing_score || 70,
      duration_minutes: form.time_limit_minutes || 30,
      max_attempts: form.max_attempts || 1,
    })
    const q = res?.quiz
    if (q) {
      await loadCourseQuizBanks()
      form.quiz_bank_id = q.id
      newQuizName.value = ''
      showToast('Quiz baru dibuat. Simpan modul, lalu klik "Kelola Soal".')
    }
  } catch (e) {
    modalError.value = e.message || 'Gagal membuat quiz'
  } finally {
    creatingQuiz.value = false
  }
}

async function saveModal() {
  if (!form.name.trim()) { modalError.value = 'Nama modul wajib diisi'; return }
  if (!form.course_id) { modalError.value = 'Pilih kursus terlebih dahulu'; return }
  saving.value = true
  modalError.value = ''
  try {
    const payload = {
      name: form.name,
      course_id: form.course_id,
      section_id: form.section_id || false,
      content_type: form.content_type,
      duration_minutes: form.duration_minutes,
      sequence: form.sequence,
    }
    if (form.content_type === 'assessment') {
      payload.quiz_bank_id = form.quiz_bank_id || false
      payload.passing_score = form.passing_score
      payload.max_attempts = form.max_attempts
      payload.time_limit_minutes = form.time_limit_minutes
    }
    if (editTarget.value) {
      await lmsApi.moduleUpdate({ module_id: editTarget.value.id, ...payload })
      showToast('Modul berhasil diperbarui')
    } else {
      await lmsApi.moduleCreate(payload)
      showToast('Modul berhasil dibuat')
    }
    showModal.value = false
    editTarget.value = null
    load()
  } catch (e) {
    modalError.value = e.message || 'Gagal menyimpan modul'
  } finally {
    saving.value = false
  }
}

function openUploadModal(m) {
  uploadTarget.value = m
  uploadFile.value = null
  uploadUrl.value = m.content_url || ''
  uploadMode.value = 'url'
  uploadError.value = ''
}

function closeUploadModal() {
  if (uploading.value) return
  uploadTarget.value = null
}

function onFileChange(e) { uploadFile.value = e.target.files[0] || null }

async function doSaveContent() {
  if (!uploadTarget.value) return
  uploading.value = true
  uploadError.value = ''
  try {
    if (uploadMode.value === 'url') {
      await lmsApi.moduleUploadContent({ module_id: uploadTarget.value.id, content_url: uploadUrl.value.trim() })
      showToast('URL konten berhasil disimpan')
      uploadTarget.value = null
      load()
    } else {
      if (!uploadFile.value) return
      const reader = new FileReader()
      reader.onload = async (ev) => {
        try {
          const base64 = ev.target.result.split(',')[1]
          await lmsApi.moduleUploadContent({ module_id: uploadTarget.value.id, content_data: base64, content_name: uploadFile.value.name })
          showToast('File berhasil diupload')
          uploadTarget.value = null
          load()
        } catch (e) {
          uploadError.value = e.message || 'Gagal upload'
        } finally {
          uploading.value = false
        }
      }
      reader.readAsDataURL(uploadFile.value)
      return
    }
  } catch (e) {
    uploadError.value = e.message || 'Gagal menyimpan konten'
  } finally {
    if (uploadMode.value === 'url') uploading.value = false
  }
}

function showToast(msg) { toast.value = msg; setTimeout(() => { toast.value = '' }, 3000) }

// ── SECTION MANAGER ─────────────────────────────────────────────────────────
const sm = reactive({ open: false, courseId: null, sections: [], loading: false, saving: false, newName: '', error: '' })

function openSectionManager() {
  sm.open = true
  sm.error = ''
  sm.newName = ''
  sm.courseId = filters.course_id || null
  loadCourses()
  if (sm.courseId) loadSectionsForManager()
}

function closeSectionManager() {
  sm.open = false
  // Refresh form sections if same course open
  if (form.course_id && form.course_id === sm.courseId) loadFormSections(form.course_id)
  load()
}

async function loadSectionsForManager() {
  sm.sections = []
  if (!sm.courseId) return
  sm.loading = true
  sm.error = ''
  try {
    const res = await lmsApi.sectionSearch({ course_id: sm.courseId })
    sm.sections = (res?.sections ?? []).map(s => ({ ...s }))
  } catch (e) {
    sm.error = e.message || 'Gagal memuat section'
  } finally {
    sm.loading = false
  }
}

async function addSection() {
  if (!sm.newName.trim() || !sm.courseId) return
  sm.saving = true
  sm.error = ''
  try {
    const seq = (sm.sections.length + 1) * 10
    await lmsApi.sectionCreate({ course_id: sm.courseId, name: sm.newName.trim(), sequence: seq })
    sm.newName = ''
    await loadSectionsForManager()
  } catch (e) {
    sm.error = e.message || 'Gagal menambah section'
  } finally {
    sm.saving = false
  }
}

async function renameSection(s) {
  if (!s.name.trim()) { await loadSectionsForManager(); return }
  try {
    await lmsApi.sectionUpdate({ section_id: s.id, name: s.name.trim() })
  } catch (e) {
    sm.error = e.message || 'Gagal mengubah nama section'
  }
}

async function deleteSection(s) {
  if (!confirm(`Hapus section "${s.name}"? Modul di dalamnya akan dilepas (tidak terhapus).`)) return
  try {
    await lmsApi.sectionDelete({ section_id: s.id })
    await loadSectionsForManager()
  } catch (e) {
    sm.error = e.message || 'Gagal menghapus section'
  }
}

async function moveSection(index, dir) {
  const target = index + dir
  if (target < 0 || target >= sm.sections.length) return
  const arr = sm.sections
  ;[arr[index], arr[target]] = [arr[target], arr[index]]
  // Reassign sequences and persist
  const orders = arr.map((s, i) => ({ id: s.id, sequence: (i + 1) * 10 }))
  arr.forEach((s, i) => { s.sequence = (i + 1) * 10 })
  try {
    await lmsApi.sectionReorder({ orders })
  } catch (e) {
    sm.error = e.message || 'Gagal mengubah urutan'
    await loadSectionsForManager()
  }
}

// ── QUESTION MANAGER (SOP quiz bank) ────────────────────────────────────────
const qm = reactive({
  open: false,
  loading: false,
  module: null,
  quizBankId: null,
  state: 'draft',
  locked: false,
  questions: [],
  saving: false,
  publishing: false,
  formError: '',
  editingQuestion: null,
  form: {
    question_text: '',
    question_type: 'multiple_choice',
    weight: 10,
    options: ['', '', '', ''],
    correct_answer: 'a',
  },
})

function stripHtml(html) {
  if (!html) return ''
  return html.replace(/<[^>]*>/g, '').trim()
}

function qTypeLabel(t) {
  return { multiple_choice: 'Pilihan Ganda', true_false: 'Benar/Salah', essay: 'Esai' }[t] || t
}

function quizStateLabel(s) {
  return { draft: 'Draft', review: 'Review', active: 'Aktif', closed: 'Ditutup' }[s] || s
}
function quizStateClass(s) {
  return {
    draft: 'bg-gray-100 text-gray-600',
    review: 'bg-amber-50 text-amber-700',
    active: 'bg-green-50 text-green-700',
    closed: 'bg-red-50 text-red-600',
  }[s] || 'bg-gray-100 text-gray-600'
}

// Build [key,text] entries for a SOP question (option_a..d or true/false)
function optionEntries(q) {
  if (q.question_type === 'true_false') {
    return [['true', 'Benar'], ['false', 'Salah']]
  }
  const entries = []
  for (const key of ['a', 'b', 'c', 'd']) {
    const text = q['option_' + key]
    if (text) entries.push([key, text])
  }
  return entries
}

async function openQuestionManager(m) {
  if (!m.quiz_bank_id) {
    showToast('Pilih/buat quiz bank dulu di form modul')
    return
  }
  qm.module = m
  qm.quizBankId = m.quiz_bank_id
  qm.open = true
  qm.loading = true
  qm.questions = []
  qm.editingQuestion = null
  resetQmForm()
  try {
    const res = await quizApi.adminQuestionList(m.quiz_bank_id)
    qm.questions = res?.questions ?? []
    qm.state = res?.quiz_state ?? 'draft'
    qm.locked = !!res?.locked
  } catch (e) {
    showToast(e.message || 'Gagal memuat soal')
  } finally {
    qm.loading = false
  }
}

function resetQmForm() {
  qm.editingQuestion = null
  qm.formError = ''
  Object.assign(qm.form, {
    question_text: '',
    question_type: 'multiple_choice',
    weight: 10,
    options: ['', '', '', ''],
    correct_answer: 'a',
  })
}

function editQuestion(q) {
  qm.editingQuestion = q
  qm.formError = ''
  qm.form.question_text = stripHtml(q.question_text)
  qm.form.question_type = q.question_type
  qm.form.weight = q.weight || 10
  qm.form.options = [q.option_a || '', q.option_b || '', q.option_c || '', q.option_d || '']
  qm.form.correct_answer = q.correct_answer || (q.question_type === 'true_false' ? 'true' : 'a')
}

async function saveQuestion() {
  const f = qm.form
  if (!f.question_text.trim()) { qm.formError = 'Teks soal wajib diisi'; return }
  const payload = {
    question_text: f.question_text.trim(),
    question_type: f.question_type,
    weight: f.weight || 10,
  }
  if (f.question_type === 'multiple_choice') {
    if (!f.options[0]?.trim() || !f.options[1]?.trim()) { qm.formError = 'Minimal isi pilihan A dan B'; return }
    if (!['a', 'b', 'c', 'd'].includes(f.correct_answer)) { qm.formError = 'Pilih jawaban benar'; return }
    if (!f.options['abcd'.indexOf(f.correct_answer)]?.trim()) { qm.formError = 'Pilihan yang ditandai benar masih kosong'; return }
    payload.option_a = f.options[0] || ''
    payload.option_b = f.options[1] || ''
    payload.option_c = f.options[2] || ''
    payload.option_d = f.options[3] || ''
    payload.correct_answer = f.correct_answer
  } else if (f.question_type === 'true_false') {
    payload.correct_answer = f.correct_answer === 'false' ? 'false' : 'true'
  }
  qm.saving = true
  qm.formError = ''
  try {
    if (qm.editingQuestion) {
      await quizApi.adminQuestionUpdate(qm.editingQuestion.id, payload)
      showToast('Soal berhasil diperbarui')
    } else {
      await quizApi.adminQuestionCreate(qm.quizBankId, payload)
      showToast('Soal berhasil ditambahkan')
    }
    const res = await quizApi.adminQuestionList(qm.quizBankId)
    qm.questions = res?.questions ?? []
    qm.state = res?.quiz_state ?? qm.state
    resetQmForm()
  } catch (e) {
    qm.formError = e.message || 'Gagal menyimpan soal'
  } finally {
    qm.saving = false
  }
}

async function deleteQuestion(q) {
  if (!confirm('Hapus soal ini?')) return
  try {
    await quizApi.adminQuestionDelete(q.id)
    qm.questions = qm.questions.filter(x => x.id !== q.id)
    showToast('Soal dihapus')
  } catch (e) {
    showToast(e.message || 'Gagal menghapus soal')
  }
}

async function publishQuiz() {
  if (!qm.questions.length) { showToast('Tambah minimal 1 soal dulu'); return }
  if (!confirm('Publish quiz? Setelah dipublish, soal akan terkunci dan siap dikerjakan peserta.')) return
  qm.publishing = true
  try {
    if (qm.state === 'draft') {
      await quizApi.adminSubmitReview(qm.quizBankId)
    }
    await quizApi.adminPublish(qm.quizBankId)
    qm.state = 'active'
    qm.locked = true
    showToast('Quiz berhasil dipublish')
    loadCourseQuizBanks()
    load()
  } catch (e) {
    showToast(e.message || 'Gagal publish quiz')
  } finally {
    qm.publishing = false
  }
}

function contentTypeLabel(t) {
  return { video: 'Video', document: 'Dokumen', interactive: 'Interactive', assessment: 'Asesmen', external_link: 'Link' }[t] || t
}

function contentTypeClass(t) {
  return {
    video: 'bg-red-50 text-red-700',
    document: 'bg-blue-50 text-blue-700',
    assessment: 'bg-purple-50 text-purple-700',
    interactive: 'bg-orange-50 text-orange-700',
    external_link: 'bg-green-50 text-green-700',
  }[t] || 'bg-gray-100 text-gray-600'
}

onMounted(() => { load(); loadCourses() })
</script>
