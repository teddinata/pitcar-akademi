// Catatan perubahan Akademi PITCAR, terbaru di atas. Tambahkan satu entri setiap
// rilis (bersamaan dengan bump versi di package.json).
//
// type per item: 'baru' (fitur baru), 'ubah' (perubahan perilaku/tampilan),
// 'perbaikan' (bug fix). Tulis dari sudut pandang pengguna, bukan nama file.
export const CHANGELOG = [
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
