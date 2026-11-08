// Catatan perubahan Akademi PITCAR, terbaru di atas. Tambahkan satu entri setiap
// rilis (bersamaan dengan bump versi di package.json).
//
// type per item: 'baru' (fitur baru), 'ubah' (perubahan perilaku/tampilan),
// 'perbaikan' (bug fix). Tulis dari sudut pandang pengguna, bukan nama file.
export const CHANGELOG = [
  {
    version: '1.15.0',
    date: '2026-11-09',
    title: 'Kelas Offline: menu sendiri + bahan materi untuk mentor & siswa',
    items: [
      { type: 'ubah', text: 'Kelas Offline pindah dari grup Asesmen ke grup menu sendiri di sidebar (dan di lembar LMS pada ponsel).' },
      { type: 'baru', text: 'Kartu kurikulum menampilkan PDF/slide tiap materi. Unggah bahan (bisa beberapa file sekaligus), tandai khusus pengajar, buka, atau hapus langsung dari kartu.' },
      { type: 'baru', text: 'Mentor bisa membuka bahan materi dari tautannya: di sesi kelas (materi rencana & yang disampaikan) dan di beranda (semua materi), termasuk file khusus pengajar.' },
      { type: 'baru', text: 'Siswa melihat bagian Bahan belajar di halaman QR kelas. Bahan terbuka setelah materinya disampaikan di kelas, juga untuk siswa yang saat itu tidak hadir. File khusus pengajar tidak pernah tampil.' },
      { type: 'perbaikan', text: 'Menghapus bahan di angkatan hasil salinan tidak lagi ikut menghapus bahan yang sama di angkatan lama.' },
    ],
  },
  {
    version: '1.14.0',
    date: '2026-11-08',
    title: 'Kelas Offline: absen oleh mentor, progres materi, evaluasi',
    items: [
      { type: 'baru', text: 'Menu baru Kelas Offline (admin): buat angkatan/periode (mis. 4 bulan), atau salin kurikulum, quiz, bahan, dan mentor dari angkatan sebelumnya.' },
      { type: 'baru', text: 'Kurikulum, siswa, dan jadwal bisa diisi manual atau diimpor dari Excel/CSV. Kurikulum juga bisa ditempel sebagai teks dari dokumen. Impor ulang memperbarui data yang sudah ada.' },
      { type: 'baru', text: 'Mentor (nama bebas atau dari karyawan) mendapat tautan pribadi tanpa login. Mulai kelas = absen masuk mentor dan semua siswa tercatat Hadir; mentor cukup menandai yang terlambat, izin, sakit, alpa, atau pulang awal; Selesai = absen pulang.' },
      { type: 'baru', text: 'Mentor mencentang materi yang disampaikan, memberi nilai praktik 1-4 dan tanda Kompeten, serta catatan per siswa. Siswa yang tidak hadir saat materi diajarkan otomatis tercatat Tertinggal (perlu susulan).' },
      { type: 'baru', text: 'Ringkasan angkatan untuk manajemen: kurikulum tersampaikan, rata-rata kehadiran, siswa perlu perhatian, sesi yang belum dijalankan atau lupa ditutup, jam mengajar mentor. Ada matriks progres siswa x materi (bisa dicetak) dan evaluasi mingguan dengan rubrik 1-4.' },
      { type: 'baru', text: 'Siswa memindai QR kelas, memilih nama + 4 digit WhatsApp, lalu melihat progres belajarnya dan mengerjakan quiz yang dikirim. Data siswa tidak terhubung ke akun pengguna.' },
    ],
  },
  {
    version: '1.13.0',
    date: '2026-11-06',
    title: 'QR kelas Assessment Calon Kabeng',
    items: [
      { type: 'baru', text: 'Tombol QR kelas di Peserta & Penugasan: tampilkan QR di layar kelas. Peserta memindai, memilih nama, memasukkan 4 digit terakhir nomor WhatsApp, lalu langsung mengerjakan tes. Tidak perlu mengirim tautan satu per satu.' },
      { type: 'perbaikan', text: 'Tautan ujian peserta langsung terbuka tanpa diminta login dan tanpa perlu dimuat ulang.' },
    ],
  },
  {
    version: '1.12.0',
    date: '2026-11-06',
    title: 'Assessment Calon Kabeng',
    items: [
      { type: 'baru', text: 'Menu baru Asesmen > Assessment Calon Kabeng (admin): kelola program, materi, dan soal pilihan ganda langsung di halaman, termasuk impor/ekspor Excel dan bahan materi.' },
      { type: 'baru', text: 'Tambah peserta, lalu bagikan soal. Tiap peserta mendapat tautan pribadi yang bisa disalin atau dikirim lewat WhatsApp. Admin bisa memperpanjang masa berlaku, menambah menit, mengakhiri, atau mengulang ujian peserta.' },
      { type: 'baru', text: 'Peserta mengerjakan ujian lewat tautan pribadi tanpa perlu login. Hasil dan jawaban peserta bisa dilihat admin, dan rekap nilai semua materi bisa dicetak atau disimpan sebagai PDF.' },
    ],
  },
  {
    version: '1.11.0',
    date: '2026-11-05',
    title: 'Ujian lisan dijalankan asesor, lead memilih A–D',
    items: [
      { type: 'ubah', text: 'Ujian lisan kini direkam oleh asesor atau admin bersama peserta: buka Rekap & Validasi, pilih peserta, lalu tekan Mulai ujian lisan. Asesor membacakan soal dan pertanyaan lanjutan AI; AI mengabaikan suara asesor saat menilai.' },
      { type: 'ubah', text: 'Asesmen Saya untuk peserta hanya berisi tes studi kasus (ujian tulis), penilaian, dan hasil. Ujian lisan tidak lagi muncul di sana.' },
      { type: 'ubah', text: 'Form penilaian lead Asesmen Terpadu memakai pilihan A, B, C, D (bukan L1–L4) supaya lead menilai dari deskripsi perilaku, bukan label level.' },
    ],
  },
  {
    version: '1.10.0',
    date: '2026-11-04',
    title: 'Ujian lisan: proses AI lebih andal + lampirkan rekaman',
    items: [
      { type: 'baru', text: 'Asesor bisa melampirkan file rekaman (mp3, m4a, wav, webm, ogg; maks 24 MB) per soal bila rekaman peserta gagal atau terpotong. Rekaman lama otomatis diabaikan (bisa dipakai lagi), lalu ujian ditranskripsi dan dinilai ulang AI.' },
      { type: 'baru', text: 'Tombol Transkripsi ulang dan Abaikan per rekaman, serta Proses sekarang saat ujian masih diproses AI.' },
      { type: 'ubah', text: 'Halaman rincian peserta menampilkan progres AI (transkripsi x/y rekaman, penilaian AI 1/2) dan memperbarui sendiri tiap 15 detik.' },
      { type: 'perbaikan', text: 'Penilaian ujian lisan tidak lagi tertahan di "sedang ditranskripsi dan dinilai AI". Prosesnya dikerjakan per langkah dan tiap langkah tersimpan. Bila transkripsi gagal, AI tidak menilai jawaban kosong; asesor diminta transkripsi ulang atau melampirkan rekaman.' },
    ],
  },
  {
    version: '1.9.0',
    date: '2026-11-04',
    title: 'Paket Asesmen: satu rangkaian per peran',
    items: [
      { type: 'baru', text: 'Halaman Paket Asesmen menyatukan semua bahan asesmen satu peran (mis. Mekanik) dalam satu rangkaian: 1 Ujian lisan, 2 Studi kasus, 3 Rubrik lead, 4 Komponen & bobot. Tiap langkah punya tanda siap/belum lengkap.' },
      { type: 'baru', text: 'Studi kasus dicentang masuk paket. Rubrik pilar untuk lead dan nama jenjang kini bisa diubah langsung di paket.' },
      { type: 'ubah', text: 'Membuat periode cukup memilih paket. Soal, studi kasus, komponen, dan bobot paket langsung terbawa, dan masih bisa diubah khusus untuk periode itu.' },
      { type: 'ubah', text: 'Menu Soal Ujian Lisan dan Studi Kasus digabung ke Paket Asesmen.' },
    ],
  },
  {
    version: '1.8.0',
    date: '2026-11-04',
    title: 'Menu Asesmen baru: ujian lisan + AI, studi kasus, lead, rekap',
    items: [
      { type: 'baru', text: 'Grup menu baru "Asesmen" (bertanda NEW) berisi Periode Asesmen, Rekap & Validasi, Soal Ujian Lisan, Studi Kasus, dan Asesmen Saya. Peta Kompetensi pindah ke grup ini dengan label 360°.' },
      { type: 'baru', text: 'Ujian lisan mandiri memakai rubrik lama (6 aspek, skor 1–5, soal L1–L4 berbobot 20/20/30/30). Peserta menjawab dengan suara dari HP. Soal baru terlihat saat rekaman mulai, waktu per soal dijaga server, dan variasi soal diacak per peserta.' },
      { type: 'baru', text: 'Bila jawaban dangkal, AI memberi satu pertanyaan lanjutan. Setelah selesai, AI menilai tiap soal dua kali secara terpisah lalu merata-ratakannya. Hasilnya persen (cara hitung sama dengan sheet asesor) dan jenjang lulus berjenjang (substansi ≥ 3,5).' },
      { type: 'baru', text: 'Satu periode bisa memakai beberapa studi kasus, untuk semua peserta atau acak satu per peserta. Ada 2 kasus HOTS baru: overheat setelah ganti water pump, dan setir narik setelah spooring.' },
      { type: 'baru', text: 'Penilaian lead: admin menunjuk satu atau beberapa lead per peserta, bisa sekaligus untuk banyak peserta. Lead menilai rubrik pilar dengan bukti kejadian nyata, atau memilih "Belum pernah melihat".' },
      { type: 'baru', text: 'Rekap & Validasi menghitung jenjang akhir (lisan 50 / studi kasus 30 / lead 20, bobot bisa diubah). Asesor mendengar rekaman lewat transkrip dan kutipan yang bisa diklik, memeriksa jawaban bertanda, lalu mengesahkan. Hanya hasil yang disahkan yang masuk ke data karyawan.' },
      { type: 'baru', text: 'Tampilan neo-brutal dan panduan cara pakai (tour) di setiap halaman Asesmen.' },
    ],
  },
  {
    version: '1.7.1',
    date: '2026-11-02',
    title: 'Perbaikan cari peserta di Peta Kompetensi',
    items: [
      { type: 'perbaikan', text: 'Daftar hasil saat mencari karyawan untuk ditambahkan sebagai peserta kini tampil di atas tabel peta, tidak lagi tertutup tabel.' },
    ],
  },
  {
    version: '1.7.0',
    date: '2026-10-29',
    title: 'Tes kompetensi: pilihan ganda, timer, link, impor Excel',
    items: [
      { type: 'baru', text: 'Soal studi kasus bisa berupa pilihan ganda atau esai. Pada pilihan ganda, tiap opsi mewakili tindakan khas satu jenjang (L1–L4) dan langsung dinilai. Peserta tidak melihat jenjang opsi, dan urutan opsi diacak untuk tiap peserta.' },
      { type: 'baru', text: 'Tes punya batas waktu yang dijaga server. Waktu berjalan sejak peserta menekan Mulai, tidak berhenti saat aplikasi ditutup, dan jawaban yang tersimpan terkirim otomatis saat waktu habis.' },
      { type: 'baru', text: 'Link tes per periode untuk dibagikan lewat WA. Hanya peserta terdaftar yang bisa masuk, dan admin bisa mengganti link kapan saja.' },
      { type: 'baru', text: 'Impor dan ekspor studi kasus lewat Excel, lengkap dengan template. Isi file dicek dulu dan tampil sebagai pratinjau sebelum disimpan. Tersedia juga tombol Duplikat untuk membuat versi baru kasus yang sudah dipakai.' },
      { type: 'baru', text: '4 studi kasus contoh baru (pilihan ganda + esai): rem komplain balik, AC kurang dingin, aki tekor setelah pasang dashcam, dan rekomendasi servis banyak ditolak (kabeng).' },
      { type: 'baru', text: 'Panduan cara pakai (tour) untuk admin dan peserta. Muncul sekali per akun, melanjutkan dari langkah terakhir bila halaman dimuat ulang, dan bisa diputar lagi lewat tombol Cara pakai.' },
      { type: 'baru', text: 'Saat periode ditutup, jenjang kompetensi peserta otomatis tercatat di data karyawan (PitClock).' },
      { type: 'baru', text: 'Leaderboard kursus bisa difilter per divisi dan departemen; peringkat dihitung ulang di dalam filter.' },
      { type: 'ubah', text: 'Tampilan tes untuk peserta dirombak menjadi lembar ujian: satu soal per layar, nomor soal bergaya LJK, timer di atas, dan tombol navigasi yang mudah dijangkau di HP.' },
    ],
  },
  {
    version: '1.6.1',
    date: '2026-10-28',
    title: 'Paket soal contoh mekanik siap pakai',
    items: [
      { type: 'baru', text: 'Studi kasus punya kolom Panduan penilaian: indikator jawaban L1–L4 per pertanyaan dan jawaban salah yang sering muncul. Hanya terlihat admin, dipakai AI sebagai acuan bersama rubrik, dan tidak terlihat peserta.' },
      { type: 'baru', text: 'Paket contoh Mekanik "Mesin brebet saat dingin & check engine menyala" kini lengkap: 5 pertanyaan (termasuk kasus part kosong), saran 25 menit, panduan penilaian, dan pernyataan tim untuk semua pilar.' },
    ],
  },
  {
    version: '1.6.0',
    date: '2026-10-27',
    title: 'Peta Kompetensi L1–L4 per peran',
    items: [
      { type: 'baru', text: 'Jenjang per orang: L1 Helper / Junior Mekanik, L2 Mekanik, L3 Senior Mekanik, L4 Foreman / layak Kabeng. Peta menampilkan kolom Jenjang dan jumlah orang di tiap jenjang. Jenjang dihitung dari rata-rata level pilar, paling tinggi satu level di atas pilar terlemah. Nama jenjang bisa diubah di tab Rubrik pilar.' },
      { type: 'baru', text: 'Menu Peta Kompetensi (admin): petakan level karyawan L1–L4 per pilar untuk tiap peran. Tersedia profil Mekanik (Servis Berkala, Diagnosa & Perbaikan, Kelistrikan & Scan Tool, Kualitas/SOP/Keselamatan, Komunikasi & Kerja Tim) dan Kepala Bengkel (Bisnis, Manajerial, Leadership, Data). Rubrik, studi kasus, dan pernyataan tim bisa diubah.' },
      { type: 'baru', text: 'Studi kasus bisa dijawab tertulis atau lisan (direkam). Rekaman ditranskripsi lalu dinilai AI per pilar sesuai rubrik, lengkap dengan kutipan jawaban dan menit rekaman yang bisa langsung diputar.' },
      { type: 'baru', text: 'Level akhir menggabungkan studi kasus (40%), penilaian atasan (30%), dan feedback tim anonim (30%, tampil setelah minimal 3 penilai). Penilaian diri ditampilkan sebagai blind spot. Admin bisa menimpa level secara manual dengan alasan.' },
      { type: 'baru', text: 'Menu Asesmen Kompetensi untuk semua karyawan: kerjakan studi kasus, isi penilaian diri/atasan/tim, dan lihat hasil (arti level, langkah ke level berikutnya, kursus yang disarankan) setelah periode ditutup.' },
    ],
  },
  {
    version: '1.5.1',
    date: '2026-10-27',
    title: 'Leaderboard lebih jelas: nilai post-test',
    items: [
      { type: 'perbaikan', text: 'Peringkat Nilai hanya memakai nilai post-test. Sebelumnya peserta yang baru mengerjakan pre-test bisa berada di atas peserta yang sudah tamat.' },
      { type: 'ubah', text: 'Peserta yang belum mengerjakan post-test dipisah di bagian bawah leaderboard tanpa nomor peringkat. Saat urut Nilai, angka nilai ditonjolkan dan bar progres dibuat lebih kalem.' },
    ],
  },
  {
    version: '1.5.0',
    date: '2026-10-27',
    title: 'Tontonan video per peserta & leaderboard urut nilai',
    items: [
      { type: 'baru', text: 'Analitik Kursus punya tab Tontonan Video: tabel peserta × video yang menunjukkan berapa persen tiap video ditonton, mana yang sudah selesai, belum dibuka, atau dilewati (ditandai selesai tapi ditonton kurang dari 30%). Bisa dicari, diurutkan dari tontonan terendah, dan disaring hanya yang belum tuntas.' },
      { type: 'baru', text: 'Tab Peserta menampilkan kolom Nilai dan Video Ditonton (klik untuk melihat rincian per video), serta pilihan urutan nilai/progres/tontonan/nama. Unduhan CSV ikut memuat persentase tonton per video.' },
      { type: 'ubah', text: 'Leaderboard kini diurutkan berdasarkan nilai, dengan pilihan urut berdasarkan progres.' },
    ],
  },
  {
    version: '1.4.1',
    date: '2026-10-21',
    title: 'Dokumen PDF tampil di HP Android & database Pitcar Academy',
    items: [
      { type: 'perbaikan', text: 'Modul dokumen PDF kini tampil langsung di HP Android. Sebelumnya Chrome Android hanya menampilkan ikon PDF dengan tombol "Buka" yang tidak berfungsi. Halaman dokumen bisa di-scroll, diperbesar/diperkecil, dan diunduh.' },
      { type: 'baru', text: 'Halaman login punya pilihan cabang baru "Pitcar Academy" untuk masuk ke database Pitcar_Academy.' },
    ],
  },
  {
    version: '1.4.0',
    date: '2026-10-19',
    title: 'Analitik per kursus, leaderboard & pre/post-test',
    items: [
      { type: 'baru', text: 'Halaman Analitik Kursus untuk admin: ringkasan peserta, daftar siapa saja yang ikut (status, progres, tanggal daftar & selesai, aktivitas terakhir), leaderboard, materi per modul (berapa yang menyelesaikan, rata-rata waktu & nilai), dan linimasa aktivitas peserta lengkap dengan jam. Daftar peserta bisa diunduh CSV.' },
      { type: 'baru', text: 'Buka lewat tombol grafik di kartu kursus, atau klik nama kursus di Analitik LMS → Per Kursus.' },
      { type: 'baru', text: 'Peserta kursus bisa melihat leaderboard kursusnya lewat tombol piala di kartu kursus; posisi sendiri disorot.' },
      { type: 'baru', text: 'Modul quiz bisa diberi peran Pre-test atau Post-test (Modul & Section → edit modul → Peran di Kursus). Laporan membandingkan nilai pre-test (percobaan pertama) dengan post-test (nilai terbaik) dan kenaikannya per peserta.' },
      { type: 'ubah', text: 'Bila kursus punya pre-test, modul lain baru terbuka setelah pre-test dikerjakan.' },
    ],
  },
]
