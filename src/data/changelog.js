// Catatan perubahan Akademi PITCAR, terbaru di atas. Tambahkan satu entri setiap
// rilis (bersamaan dengan bump versi di package.json).
//
// type per item: 'baru' (fitur baru), 'ubah' (perubahan perilaku/tampilan),
// 'perbaikan' (bug fix). Tulis dari sudut pandang pengguna, bukan nama file.
export const CHANGELOG = [
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
