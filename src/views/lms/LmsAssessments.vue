<template>
  <div class="min-h-screen bg-gray-50 p-4 md:p-6">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Penilaian</h1>
        <p class="text-sm text-gray-500 mt-1">Tes dan evaluasi pembelajaran</p>
      </div>
      <button
        v-if="authStore.user?.is_admin"
        @click="openCreateModal"
        class="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
      >
        <PlusIcon class="w-4 h-4" />
        <span class="hidden sm:inline">Tambah Penilaian</span>
      </button>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-5 flex flex-wrap gap-3">
      <select
        v-model="filters.course_id"
        @change="load"
        class="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 min-w-44"
      >
        <option :value="null">Semua Kursus</option>
        <option v-for="c in courseList" :key="c.id" :value="c.id">{{ c.name }}</option>
      </select>
      <select
        v-model="filters.assessment_type"
        @change="load"
        class="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
      >
        <option value="">Semua Tipe</option>
        <option value="quiz">Quiz</option>
        <option value="exam">Exam</option>
        <option value="assignment">Assignment</option>
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

    <div v-else-if="!assessments.length" class="bg-white rounded-xl p-12 text-center border border-gray-100 shadow-sm">
      <ClipboardDocumentCheckIcon class="w-12 h-12 text-gray-300 mx-auto mb-3" />
      <p class="text-gray-500 font-medium">Tidak ada penilaian tersedia</p>
    </div>

    <!-- Cards -->
    <div v-else class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      <div
        v-for="a in assessments"
        :key="a.id"
        class="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col"
      >
        <div class="p-4 flex-1 flex flex-col">
          <div class="flex items-start justify-between gap-2 mb-2">
            <h3 class="font-semibold text-gray-900 text-sm leading-snug">{{ a.name }}</h3>
            <span class="shrink-0 text-xs px-2 py-0.5 rounded-full font-medium" :class="assessmentTypeClass(a.assessment_type)">
              {{ a.assessment_type }}
            </span>
          </div>
          <p class="text-xs text-gray-400 mb-1">{{ a.course_name || 'Tidak terkait kursus' }}</p>
          <p v-if="a.module_name" class="text-xs text-purple-500 mb-2">📋 {{ a.module_name }}</p>
          <p v-else class="text-xs text-amber-500 mb-2">⚠️ Belum terhubung ke modul</p>
          <div class="flex items-center gap-3 text-xs text-gray-400 mb-3 flex-1">
            <span>{{ a.question_count ?? a.total_questions ?? 0 }} soal</span>
            <span>·</span>
            <span>Lulus ≥ {{ a.passing_score }}%</span>
            <span v-if="a.time_limit_minutes">· {{ a.time_limit_minutes }} mnt</span>
          </div>

          <div v-if="a.last_score !== null && a.last_score !== undefined" class="mb-3 p-2 rounded-lg" :class="a.last_score >= a.passing_score ? 'bg-green-50 border border-green-100' : 'bg-red-50 border border-red-100'">
            <p class="text-xs font-semibold" :class="a.last_score >= a.passing_score ? 'text-green-700' : 'text-red-600'">
              Skor terakhir: {{ a.last_score }}% · {{ a.last_score >= a.passing_score ? 'Lulus' : 'Tidak Lulus' }}
            </p>
          </div>

          <div class="flex gap-2 mt-auto flex-wrap">
            <button @click="startAssessment(a)" class="flex-1 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors min-w-16">
              {{ a.last_score !== null && a.last_score !== undefined ? 'Coba Lagi' : 'Mulai' }}
            </button>
            <button v-if="a.last_score !== null && a.last_score !== undefined" @click="viewResults(a)" class="px-3 py-1.5 border border-gray-200 text-gray-600 rounded-lg text-xs hover:bg-gray-50 transition-colors">
              Hasil
            </button>
            <template v-if="authStore.user?.is_admin">
              <button @click="openQuestionManager(a)" class="px-2.5 py-1.5 border border-purple-200 rounded-lg text-purple-600 hover:bg-purple-50 transition-colors text-xs font-medium" title="Kelola Soal">
                <ListBulletIcon class="w-3.5 h-3.5" />
              </button>
              <button @click="openEditModal(a)" class="px-2.5 py-1.5 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors">
                <PencilIcon class="w-3.5 h-3.5" />
              </button>
              <button @click="deleteAssessment(a)" class="px-2.5 py-1.5 border border-red-100 rounded-lg text-red-400 hover:bg-red-50 transition-colors">
                <TrashIcon class="w-3.5 h-3.5" />
              </button>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- Take Assessment Modal -->
    <Teleport to="body">
      <div v-if="activeAssessment" class="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" @click.self="activeAssessment = null">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
            <h2 class="font-bold text-gray-900">{{ activeAssessment.name }}</h2>
            <button @click="activeAssessment = null; answers = {}"><XMarkIcon class="w-5 h-5 text-gray-400" /></button>
          </div>

          <div v-if="questionsLoading" class="p-10 text-center">
            <div class="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          </div>

          <div v-else-if="questions.length" class="p-6 space-y-6">
            <div v-for="(q, qi) in questions" :key="q.id" class="bg-gray-50 rounded-xl p-4">
              <p class="font-medium text-gray-800 text-sm mb-3">{{ qi + 1 }}. {{ q.question_text }}</p>
              <div class="space-y-2">
                <label
                  v-for="opt in q.options"
                  :key="opt.key"
                  class="flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors"
                  :class="answers[q.id] === opt.key ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-100'"
                >
                  <input type="radio" :name="`q_${q.id}`" :value="opt.key" v-model="answers[q.id]" class="text-blue-600" />
                  <span class="text-sm text-gray-700">{{ opt.text }}</span>
                </label>
              </div>
            </div>
          </div>

          <div v-if="submitResult" class="mx-6 mb-4 p-4 rounded-xl text-center" :class="submitResult.passed ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'">
            <p class="font-bold text-lg" :class="submitResult.passed ? 'text-green-700' : 'text-red-600'">
              {{ submitResult.passed ? '🎉 Lulus!' : 'Belum Lulus' }}
            </p>
            <p class="text-sm mt-1" :class="submitResult.passed ? 'text-green-600' : 'text-red-500'">Skor: {{ submitResult.score }}%</p>
          </div>

          <div v-if="!submitResult" class="px-6 py-4 border-t border-gray-100 flex justify-end sticky bottom-0 bg-white">
            <button
              @click="submitAssessment"
              :disabled="submitting || Object.keys(answers).length < questions.length"
              class="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {{ submitting ? 'Mengirim...' : `Kirim Jawaban (${Object.keys(answers).length}/${questions.length})` }}
            </button>
          </div>
          <div v-else class="px-6 py-4 border-t border-gray-100 flex justify-end sticky bottom-0 bg-white">
            <button @click="activeAssessment = null; answers = {}; submitResult = null; load()" class="px-6 py-2 bg-gray-700 text-white rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors">Tutup</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Results Modal -->
    <Teleport to="body">
      <div v-if="resultsTarget" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" @click.self="resultsTarget = null">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[80vh] overflow-y-auto">
          <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 class="font-bold text-gray-900">Hasil Penilaian</h2>
            <button @click="resultsTarget = null"><XMarkIcon class="w-5 h-5 text-gray-400" /></button>
          </div>
          <div v-if="resultsLoading" class="p-10 text-center">
            <div class="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          </div>
          <div v-else-if="resultsData" class="p-6 space-y-4">
            <div class="text-center p-4 rounded-xl" :class="resultsData.is_passed ? 'bg-green-50' : 'bg-red-50'">
              <p class="text-3xl font-bold" :class="resultsData.is_passed ? 'text-green-600' : 'text-red-600'">{{ resultsData.score }}%</p>
              <p class="text-sm font-medium mt-1" :class="resultsData.is_passed ? 'text-green-700' : 'text-red-500'">{{ resultsData.is_passed ? 'Lulus' : 'Tidak Lulus' }}</p>
            </div>
            <div class="space-y-2 text-sm text-gray-600">
              <div class="flex justify-between"><span>Percobaan ke-</span><span class="font-semibold">{{ resultsData.attempt_number }}</span></div>
              <div class="flex justify-between"><span>Benar</span><span class="font-semibold text-green-600">{{ resultsData.correct_answers }}</span></div>
              <div class="flex justify-between"><span>Salah</span><span class="font-semibold text-red-500">{{ resultsData.wrong_answers }}</span></div>
              <div class="flex justify-between"><span>Waktu</span><span class="font-semibold">{{ resultsData.time_spent_minutes }} menit</span></div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Create/Edit Modal -->
    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" @click.self="showModal = false">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
          <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
            <h2 class="font-bold text-gray-900">{{ editTarget ? 'Edit Penilaian' : 'Tambah Penilaian' }}</h2>
            <button @click="showModal = false"><XMarkIcon class="w-5 h-5 text-gray-400" /></button>
          </div>
          <div class="p-6 space-y-4">
            <div v-if="modalError" class="bg-red-50 border border-red-200 rounded-lg p-3 text-red-600 text-sm">{{ modalError }}</div>

            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1">Nama Penilaian *</label>
              <input v-model="form.name" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" placeholder="Contoh: Quiz Servis Berkala" />
            </div>

            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1">Kursus <span class="text-gray-400 font-normal">(opsional)</span></label>
              <select v-model="form.course_id" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300">
                <option :value="null">— Tanpa Kursus —</option>
                <option v-for="c in courseList" :key="c.id" :value="c.id">{{ c.name }}</option>
              </select>
              <p v-if="coursesLoading" class="text-xs text-gray-400 mt-1">Memuat kursus...</p>
            </div>

            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1">
                Modul Assessment
                <span class="text-gray-400 font-normal">— modul yang akan menampilkan quiz ini</span>
              </label>
              <select v-model="form.module_id" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300" :disabled="!form.course_id">
                <option :value="null">— Pilih modul —</option>
                <option v-for="m in moduleList" :key="m.id" :value="m.id">{{ m.name }}</option>
              </select>
              <p v-if="!form.course_id" class="text-xs text-gray-400 mt-1">Pilih kursus dulu untuk melihat daftar modul</p>
              <p v-else-if="modulesLoading" class="text-xs text-gray-400 mt-1">Memuat modul...</p>
              <p v-else-if="form.course_id && !moduleList.length" class="text-xs text-amber-500 mt-1">Tidak ada modul bertipe "assessment" di kursus ini. Buat dulu di halaman Modul.</p>
            </div>

            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1">Tipe</label>
              <select v-model="form.assessment_type" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300">
                <option value="quiz">Quiz</option>
                <option value="exam">Exam</option>
                <option value="assignment">Assignment</option>
              </select>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-semibold text-gray-600 mb-1">Nilai Lulus (%)</label>
                <input v-model.number="form.passing_score" type="number" min="0" max="100" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
              </div>
              <div>
                <label class="block text-xs font-semibold text-gray-600 mb-1">Batas Waktu (menit)</label>
                <input v-model.number="form.time_limit_minutes" type="number" min="0" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" placeholder="0 = tidak terbatas" />
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1">Maks. Percobaan</label>
              <input v-model.number="form.max_attempts" type="number" min="1" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
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

    <!-- Question Manager Modal -->
    <Teleport to="body">
      <div v-if="qm.open" class="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" @click.self="qm.open = false">
        <div class="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-2xl h-[92vh] sm:max-h-[90vh] flex flex-col">

          <!-- Header -->
          <div class="px-5 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
            <div>
              <h2 class="font-bold text-gray-900">Kelola Soal</h2>
              <p class="text-xs text-gray-400 mt-0.5">{{ qm.assessment?.name }} · {{ qm.questions.length }} soal</p>
            </div>
            <button @click="qm.open = false"><XMarkIcon class="w-5 h-5 text-gray-400" /></button>
          </div>

          <div class="flex-1 overflow-y-auto">
            <!-- Loading -->
            <div v-if="qm.loading" class="flex items-center justify-center py-16">
              <div class="w-7 h-7 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
            </div>

            <div v-else class="p-5 space-y-3">

              <!-- Existing questions -->
              <div
                v-for="(q, qi) in qm.questions"
                :key="q.id"
                class="border border-gray-200 rounded-xl overflow-hidden"
              >
                <!-- Question header -->
                <div class="flex items-start gap-3 px-4 py-3 bg-gray-50 cursor-pointer" @click="toggleExpand(q.id)">
                  <span class="w-6 h-6 rounded-full bg-purple-100 text-purple-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{{ qi + 1 }}</span>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-800 leading-snug">{{ stripHtml(q.question_text) }}</p>
                    <div class="flex items-center gap-2 mt-1">
                      <span class="text-xs px-1.5 py-0.5 rounded bg-purple-50 text-purple-600 font-medium">{{ qTypeLabel(q.question_type) }}</span>
                      <span class="text-xs text-gray-400">{{ q.points }} poin</span>
                      <span class="text-xs text-gray-400">· {{ q.difficulty }}</span>
                    </div>
                  </div>
                  <div class="flex items-center gap-1 shrink-0">
                    <button @click.stop="startEditQuestion(q)" class="p-1.5 rounded-lg hover:bg-blue-50 text-blue-400 transition-colors">
                      <PencilIcon class="w-3.5 h-3.5" />
                    </button>
                    <button @click.stop="deleteQuestion(q)" class="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition-colors">
                      <TrashIcon class="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <!-- Options preview -->
                <div v-if="qm.expanded.has(q.id) && q.options?.length" class="px-4 pb-3 pt-2 space-y-1.5 bg-white">
                  <div
                    v-for="opt in q.options"
                    :key="opt.id"
                    class="flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg"
                    :class="opt.is_correct ? 'bg-green-50 border border-green-200' : 'bg-gray-50'"
                  >
                    <span class="w-4 h-4 rounded-full border-2 shrink-0" :class="opt.is_correct ? 'border-green-500 bg-green-500' : 'border-gray-300'"></span>
                    <span :class="opt.is_correct ? 'text-green-700 font-medium' : 'text-gray-600'">{{ stripHtml(opt.text) }}</span>
                    <span v-if="opt.is_correct" class="text-xs text-green-500 ml-auto">✓ Benar</span>
                  </div>
                </div>
              </div>

              <!-- Empty state -->
              <div v-if="!qm.questions.length" class="py-10 text-center text-gray-400">
                <ClipboardDocumentCheckIcon class="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p class="text-sm font-medium">Belum ada soal</p>
                <p class="text-xs mt-1">Tambah soal pertama di bawah</p>
              </div>

              <!-- Add / Edit question form -->
              <div class="border-2 border-dashed border-purple-200 rounded-xl p-4 space-y-3 bg-purple-50/30">
                <p class="text-xs font-bold text-purple-700 uppercase tracking-wide">{{ qm.editingQuestion ? 'Edit Soal' : '+ Tambah Soal Baru' }}</p>

                <div v-if="qm.formError" class="bg-red-50 border border-red-200 rounded-lg p-2 text-red-600 text-xs">{{ qm.formError }}</div>

                <div>
                  <label class="block text-xs font-semibold text-gray-600 mb-1">Teks Soal *</label>
                  <textarea v-model="qm.form.question_text" rows="2" class="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-300 resize-none" placeholder="Tuliskan pertanyaan di sini..." />
                </div>

                <div class="grid grid-cols-3 gap-2">
                  <div>
                    <label class="block text-xs font-semibold text-gray-600 mb-1">Tipe</label>
                    <select v-model="qm.form.question_type" @change="onQuestionTypeChange" class="w-full text-sm border border-gray-200 rounded-lg px-2 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-purple-300">
                      <option value="multiple_choice">Pilihan Ganda</option>
                      <option value="true_false">Benar/Salah</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-xs font-semibold text-gray-600 mb-1">Poin</label>
                    <input v-model.number="qm.form.points" type="number" min="0.5" step="0.5" class="w-full text-sm border border-gray-200 rounded-lg px-2 py-2 focus:outline-none focus:ring-2 focus:ring-purple-300" />
                  </div>
                  <div>
                    <label class="block text-xs font-semibold text-gray-600 mb-1">Kesulitan</label>
                    <select v-model="qm.form.difficulty" class="w-full text-sm border border-gray-200 rounded-lg px-2 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-purple-300">
                      <option value="easy">Mudah</option>
                      <option value="medium">Sedang</option>
                      <option value="hard">Sulit</option>
                    </select>
                  </div>
                </div>

                <!-- Multiple choice options -->
                <div v-if="qm.form.question_type === 'multiple_choice'" class="space-y-2">
                  <label class="block text-xs font-semibold text-gray-600">Pilihan Jawaban <span class="text-gray-400 font-normal">— centang yang benar</span></label>
                  <div v-for="(opt, oi) in qm.form.options" :key="oi" class="flex items-center gap-2">
                    <input
                      type="radio"
                      :name="`qf_correct`"
                      :checked="opt.is_correct"
                      @change="setCorrectOption(oi)"
                      class="text-green-600 shrink-0"
                      title="Tandai sebagai jawaban benar"
                    />
                    <input
                      v-model="opt.text"
                      :placeholder="`Pilihan ${oi + 1}`"
                      class="flex-1 text-sm border rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-300"
                      :class="opt.is_correct ? 'border-green-300 bg-green-50' : 'border-gray-200'"
                    />
                    <button v-if="qm.form.options.length > 2" @click="qm.form.options.splice(oi, 1)" class="text-red-400 hover:text-red-600 shrink-0 p-1">
                      <TrashIcon class="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <button v-if="qm.form.options.length < 5" @click="qm.form.options.push({ text: '', is_correct: false })" class="text-xs text-purple-600 hover:text-purple-800 font-medium">+ Tambah pilihan</button>
                </div>

                <!-- True/False options -->
                <div v-else-if="qm.form.question_type === 'true_false'" class="space-y-1.5">
                  <label class="block text-xs font-semibold text-gray-600">Jawaban yang Benar</label>
                  <div class="flex gap-3">
                    <label class="flex items-center gap-2 cursor-pointer px-4 py-2 rounded-lg border-2 transition-colors" :class="qm.form.correct_tf === 'true' ? 'border-green-400 bg-green-50' : 'border-gray-200'">
                      <input type="radio" v-model="qm.form.correct_tf" value="true" class="text-green-600" />
                      <span class="text-sm font-medium">Benar (True)</span>
                    </label>
                    <label class="flex items-center gap-2 cursor-pointer px-4 py-2 rounded-lg border-2 transition-colors" :class="qm.form.correct_tf === 'false' ? 'border-green-400 bg-green-50' : 'border-gray-200'">
                      <input type="radio" v-model="qm.form.correct_tf" value="false" class="text-green-600" />
                      <span class="text-sm font-medium">Salah (False)</span>
                    </label>
                  </div>
                </div>

                <div class="flex gap-2 pt-1">
                  <button v-if="qm.editingQuestion" @click="cancelEditQuestion" class="px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">Batal</button>
                  <button @click="saveQuestion" :disabled="qm.saving" class="px-4 py-1.5 text-xs font-semibold text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50">
                    {{ qm.saving ? 'Menyimpan...' : (qm.editingQuestion ? 'Simpan Perubahan' : 'Tambah Soal') }}
                  </button>
                </div>
              </div>

            </div>
          </div>

          <div class="px-5 py-3 border-t border-gray-100 flex justify-end shrink-0">
            <button @click="qm.open = false" class="px-5 py-2 text-sm font-semibold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">Selesai</button>
          </div>
        </div>
      </div>
    </Teleport>

    <div v-if="toast" class="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm px-5 py-2.5 rounded-full shadow-lg z-50">{{ toast }}</div>
  </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { lmsApi } from '../../services/lmsApi'
import { ClipboardDocumentCheckIcon, PlusIcon, PencilIcon, TrashIcon, XMarkIcon, ListBulletIcon } from '@heroicons/vue/24/outline'

const authStore = useAuthStore()
const loading = ref(false)
const error = ref('')
const assessments = ref([])
const toast = ref('')
const showModal = ref(false)
const editTarget = ref(null)
const saving = ref(false)
const modalError = ref('')

const courseList = ref([])
const coursesLoading = ref(false)
const moduleList = ref([])
const modulesLoading = ref(false)
const filters = reactive({ course_id: null, assessment_type: '' })

const activeAssessment = ref(null)
const questions = ref([])
const answers = ref({})
const questionsLoading = ref(false)
const submitting = ref(false)
const submitResult = ref(null)

const resultsTarget = ref(null)
const resultsLoading = ref(false)
const resultsData = ref(null)

const form = reactive({
  name: '', course_id: null, module_id: null, assessment_type: 'quiz',
  passing_score: 70, time_limit_minutes: 0, max_attempts: 3,
})

async function loadCourses() {
  if (courseList.value.length) return
  coursesLoading.value = true
  try {
    const res = await lmsApi.courseSearch({ limit: 200 })
    courseList.value = res?.courses ?? []
  } catch { courseList.value = [] }
  finally { coursesLoading.value = false }
}

async function loadModulesForCourse(courseId) {
  moduleList.value = []
  form.module_id = null
  if (!courseId) return
  modulesLoading.value = true
  try {
    const res = await lmsApi.moduleSearch({ course_id: courseId, limit: 100 })
    moduleList.value = (res?.modules ?? []).filter(m => m.content_type === 'assessment')
  } catch { moduleList.value = [] }
  finally { modulesLoading.value = false }
}

watch(() => form.course_id, (val) => loadModulesForCourse(val))

async function load() {
  loading.value = true
  error.value = ''
  try {
    const params = {}
    if (filters.course_id) params.course_id = filters.course_id
    if (filters.assessment_type) params.assessment_type = filters.assessment_type
    const res = await lmsApi.assessmentSearch(params)
    assessments.value = res?.assessments ?? []
  } catch (e) {
    error.value = e.message || 'Gagal memuat penilaian'
  } finally {
    loading.value = false
  }
}

async function startAssessment(a) {
  activeAssessment.value = a
  questions.value = []
  answers.value = {}
  submitResult.value = null
  questionsLoading.value = true
  try {
    const res = await lmsApi.assessmentGetQuestions({ assessment_id: a.id })
    questions.value = res?.questions ?? []
  } catch (e) {
    showToast(e.message || 'Gagal memuat soal')
    activeAssessment.value = null
  } finally {
    questionsLoading.value = false
  }
}

async function submitAssessment() {
  if (!activeAssessment.value) return
  submitting.value = true
  try {
    const res = await lmsApi.assessmentSubmit({ assessment_id: activeAssessment.value.id, answers: answers.value })
    submitResult.value = res
    load()
  } catch (e) {
    showToast(e.message || 'Gagal mengirim jawaban')
  } finally {
    submitting.value = false
  }
}

async function viewResults(a) {
  resultsTarget.value = a
  resultsLoading.value = true
  resultsData.value = null
  try {
    const res = await lmsApi.assessmentResults({ assessment_id: a.id })
    resultsData.value = res
  } catch (e) {
    showToast(e.message || 'Gagal memuat hasil')
    resultsTarget.value = null
  } finally {
    resultsLoading.value = false
  }
}

async function deleteAssessment(a) {
  if (!confirm(`Hapus penilaian "${a.name}"?`)) return
  try {
    await lmsApi.assessmentDelete({ assessment_id: a.id })
    showToast('Penilaian berhasil dihapus')
    load()
  } catch (e) {
    showToast(e.message || 'Gagal menghapus penilaian')
  }
}

function openCreateModal() {
  editTarget.value = null
  Object.assign(form, { name: '', course_id: null, module_id: null, assessment_type: 'quiz', passing_score: 70, time_limit_minutes: 0, max_attempts: 3 })
  moduleList.value = []
  modalError.value = ''
  showModal.value = true
  loadCourses()
}

function openEditModal(a) {
  editTarget.value = a
  Object.assign(form, {
    name: a.name,
    course_id: a.course_id || null,
    module_id: a.module_id || null,
    assessment_type: a.assessment_type,
    passing_score: a.passing_score,
    time_limit_minutes: a.time_limit_minutes || 0,
    max_attempts: a.max_attempts || 3,
  })
  modalError.value = ''
  showModal.value = true
  loadCourses()
  if (a.course_id) loadModulesForCourse(a.course_id)
}

async function saveModal() {
  if (!form.name.trim()) { modalError.value = 'Nama penilaian wajib diisi'; return }
  saving.value = true
  modalError.value = ''
  try {
    if (editTarget.value) {
      await lmsApi.assessmentUpdate({ assessment_id: editTarget.value.id, ...form })
      showToast('Penilaian berhasil diperbarui')
    } else {
      await lmsApi.assessmentCreate({ ...form })
      showToast('Penilaian berhasil dibuat')
    }
    showModal.value = false
    editTarget.value = null
    load()
  } catch (e) {
    modalError.value = e.message || 'Gagal menyimpan'
  } finally {
    saving.value = false
  }
}

// ── Question Manager ─────────────────────────────────────────────────
const qm = reactive({
  open: false,
  loading: false,
  assessment: null,
  questions: [],
  expanded: new Set(),
  saving: false,
  formError: '',
  editingQuestion: null,
  form: {
    question_text: '',
    question_type: 'multiple_choice',
    points: 1,
    difficulty: 'medium',
    options: [
      { text: '', is_correct: true },
      { text: '', is_correct: false },
      { text: '', is_correct: false },
    ],
    correct_tf: 'true',
  },
})

function resetQmForm() {
  qm.editingQuestion = null
  qm.formError = ''
  Object.assign(qm.form, {
    question_text: '',
    question_type: 'multiple_choice',
    points: 1,
    difficulty: 'medium',
    options: [
      { text: '', is_correct: true },
      { text: '', is_correct: false },
      { text: '', is_correct: false },
    ],
    correct_tf: 'true',
  })
}

async function openQuestionManager(a) {
  qm.assessment = a
  qm.questions = []
  qm.expanded = new Set()
  qm.open = true
  resetQmForm()
  qm.loading = true
  try {
    const res = await lmsApi.assessmentGetQuestions({ assessment_id: a.id })
    qm.questions = res?.questions ?? []
  } catch (e) {
    showToast(e.message || 'Gagal memuat soal')
  } finally {
    qm.loading = false
  }
}

function toggleExpand(id) {
  if (qm.expanded.has(id)) qm.expanded.delete(id)
  else qm.expanded.add(id)
  qm.expanded = new Set(qm.expanded)
}

function onQuestionTypeChange() {
  if (qm.form.question_type === 'multiple_choice') {
    qm.form.options = [
      { text: '', is_correct: true },
      { text: '', is_correct: false },
      { text: '', is_correct: false },
    ]
  }
}

function setCorrectOption(idx) {
  qm.form.options.forEach((o, i) => { o.is_correct = i === idx })
}

function startEditQuestion(q) {
  qm.editingQuestion = q
  qm.formError = ''
  qm.form.question_text = stripHtml(q.question_text)
  qm.form.question_type = q.question_type
  qm.form.points = q.points
  qm.form.difficulty = q.difficulty || 'medium'
  if (q.question_type === 'multiple_choice') {
    qm.form.options = (q.options || []).map(o => ({ text: stripHtml(o.text), is_correct: o.is_correct }))
    if (!qm.form.options.length) qm.form.options = [{ text: '', is_correct: true }, { text: '', is_correct: false }]
  } else if (q.question_type === 'true_false') {
    const correctOpt = (q.options || []).find(o => o.is_correct)
    qm.form.correct_tf = correctOpt?.text?.toLowerCase() === 'false' ? 'false' : 'true'
  }
}

function cancelEditQuestion() {
  resetQmForm()
}

async function saveQuestion() {
  if (!qm.form.question_text.trim()) { qm.formError = 'Teks soal wajib diisi'; return }
  if (qm.form.question_type === 'multiple_choice') {
    const filled = qm.form.options.filter(o => o.text.trim())
    if (filled.length < 2) { qm.formError = 'Isi minimal 2 pilihan jawaban'; return }
    if (!qm.form.options.some(o => o.is_correct && o.text.trim())) { qm.formError = 'Pilih satu jawaban yang benar'; return }
  }
  qm.saving = true
  qm.formError = ''
  try {
    if (qm.editingQuestion) {
      const payload = {
        question_id: qm.editingQuestion.id,
        question_text: qm.form.question_text,
        points: qm.form.points,
        difficulty: qm.form.difficulty,
      }
      if (qm.form.question_type === 'multiple_choice') {
        payload.options = qm.form.options.filter(o => o.text.trim())
      } else {
        payload.options = []
        payload.correct_answer = qm.form.correct_tf
      }
      await lmsApi.assessmentUpdateQuestion(payload)
      showToast('Soal berhasil diperbarui')
    } else {
      const payload = {
        assessment_id: qm.assessment.id,
        question_text: qm.form.question_text,
        question_type: qm.form.question_type,
        points: qm.form.points,
        difficulty: qm.form.difficulty,
        options: qm.form.question_type === 'multiple_choice'
          ? qm.form.options.filter(o => o.text.trim())
          : [],
        correct_answer: qm.form.question_type === 'true_false' ? qm.form.correct_tf : null,
      }
      await lmsApi.assessmentAddQuestion(payload)
      showToast('Soal berhasil ditambahkan')
    }
    // Reload questions
    const res = await lmsApi.assessmentGetQuestions({ assessment_id: qm.assessment.id })
    qm.questions = res?.questions ?? []
    qm.assessment = { ...qm.assessment, question_count: qm.questions.length }
    resetQmForm()
    load()
  } catch (e) {
    qm.formError = e.message || 'Gagal menyimpan soal'
  } finally {
    qm.saving = false
  }
}

async function deleteQuestion(q) {
  if (!confirm(`Hapus soal ini?`)) return
  try {
    await lmsApi.assessmentDeleteQuestion({ question_id: q.id })
    qm.questions = qm.questions.filter(x => x.id !== q.id)
    showToast('Soal dihapus')
    load()
  } catch (e) {
    showToast(e.message || 'Gagal menghapus soal')
  }
}

function stripHtml(html) {
  if (!html) return ''
  return html.replace(/<[^>]*>/g, '').trim()
}

function qTypeLabel(t) {
  return { multiple_choice: 'Pilihan Ganda', true_false: 'Benar/Salah', essay: 'Esai', fill_blank: 'Isian' }[t] || t
}

function showToast(msg) { toast.value = msg; setTimeout(() => { toast.value = '' }, 3000) }

function assessmentTypeClass(t) {
  return { quiz: 'bg-blue-50 text-blue-700', exam: 'bg-purple-50 text-purple-700', assignment: 'bg-orange-50 text-orange-700' }[t] || 'bg-gray-100 text-gray-600'
}

onMounted(() => { load(); loadCourses() })
</script>
