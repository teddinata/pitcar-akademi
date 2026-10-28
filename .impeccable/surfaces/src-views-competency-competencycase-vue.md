---
version: 1
slug: "src-views-competency-competencycase-vue"
primary_target: "src/views/competency/CompetencyCase.vue"
related_targets: ["src/views/competency/MyCompetency.vue"]
---

# Tes kompetensi peserta (Akademi)

Scope: halaman peserta untuk asesmen kompetensi: daftar tugas (/dashboard/lms/my-competency), lembar tes studi kasus (/dashboard/lms/my-competency/case/:id), masuk lewat link (/dashboard/lms/competency/join/:token). Mode: Operate. Build path: code-led (Operate).

Audience & job: mekanik/SA/kabeng, kebanyakan dari HP di sela kerja bengkel; membaca situasi, menjawab pilihan ganda dan esai (tulis atau rekam suara) sebelum waktu habis. Admin membagikan link.

Constraints: timer dijaga server (kirim otomatis), jawaban tersimpan otomatis, skenario baru tampil setelah Mulai, kunci jenjang opsi tidak pernah dikirim ke peserta. Brief user: tidak minimalis, tanpa gradasi "AI", neo-brutalism bertema pendidikan.

## Direction contract

THESIS: Tes terasa seperti lembar ujian yang dikenal semua orang sejak sekolah (LJK + kertas kotak), tetapi bekerja sebagai aplikasi: satu soal per layar, navigasi bulatan LJK, timer stempel. Menolak daftar kartu abu-abu lembut dengan bayangan blur.

OWN-WORLD: Kertas putih di atas latar kertas kotak biru muda; garis hitam tebal 2-3px, bayangan blok hitam tanpa blur (neo-brutal, dipilih brief). Tinta LJK merah (Pitcar #b70000) untuk bulatan & aksi, grafit hitam untuk pilihan terisi, stabilo kuning #FFE14D untuk sorotan/peringatan waktu, tinta pulpen biru #1d4ed8 untuk teks jawaban esai. Display Bricolage Grotesque tebal; isi Poppins.

STORY: Peserta tahu berapa soal, berapa menit, dan aturannya sebelum menekan Mulai; selama tes selalu tahu sisa waktu, soal mana yang sudah dijawab, dan bahwa jawaban tersimpan; setelah kirim melihat stempel TERKIRIM.

FIRST VIEWPORT: (Sampul) kartu lembar ujian: judul kasus besar, chip profil & periode, tiga kotak fakta (jumlah pilihan ganda, esai, menit), aturan bernomor, tombol merah besar "Mulai mengerjakan" penuh lebar di HP. (Tes) bar atas lengket: kembali, judul ringkas, blok timer stempel; di bawahnya baris bulatan LJK nomor soal; kartu soal dengan nomor dalam kotak hitam besar; opsi berupa baris dengan bulatan huruf A-D bergaya LJK; navigasi Sebelumnya/Berikutnya di dasar layar.

FORM: Neo-brutalism lembar ujian (pinned brief), posisi 1. Signature move: navigator & pilihan bergaya LJK, bulatan tinta merah yang terisi grafit saat dijawab. seed:cc454a5935a0323a (brief-pinned direction; the roll was run and the user's pinned neo-brutalism education brief wins)

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
