# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
- Peserta: karyawan Pitcar (mekanik, service advisor, kepala bengkel, CS). Mereka belajar kursus, mengerjakan kuis, dan ikut asesmen kompetensi. Tes kompetensi kebanyakan dikerjakan dari HP pribadi, sering di sela kerja di bengkel.
- Admin: tim HR/training yang mengelola kursus, bank soal, periode asesmen, dan peta kompetensi.

## Product Purpose
Akademi Pitcar adalah LMS internal untuk jaringan bengkel Pitcar. Tujuannya membuat kemampuan karyawan terukur dan bisa dikembangkan: kursus, kuis SOP, dan asesmen kompetensi yang menghasilkan jenjang L1–L4 per peran (mis. mekanik L1 Helper/Junior sampai L4 Foreman/layak Kabeng).

## Positioning
Asesmen memakai kasus nyata bengkel Pitcar, dinilai dari empat sumber (studi kasus dinilai AI, atasan, tim 360, admin), lalu langsung terhubung ke kursus rekomendasi dan data karyawan.

## Operating Context
- Peserta membuka tes dari daftar "Asesmen Kompetensi" atau link yang dibagikan admin; harus login.
- Jawaban bisa tertulis atau lisan (direkam, ditranskripsi, dinilai AI).
- Sinyal di bengkel bisa putus; jawaban harus tersimpan otomatis.

## Capabilities and Constraints
- Frontend Vue 3 + Tailwind (repo pitcar-assessment), backend Odoo 16 (pitcar_custom) via JSON-RPC.
- Bahasa antarmuka: Indonesia.
- PWA dengan popup versi baru; tiap rilis wajib bump versi dan entri changelog.

## Brand Commitments
- Warna merah Pitcar #b70000 sebagai warna utama aksi.
- Bahasa lugas, tanpa jargon.

## Product Principles
- Ukur kemampuan dari kerja nyata, bukan hafalan.
- Peserta tidak boleh kehilangan jawaban karena sinyal atau reload.
- Kunci penilaian tidak pernah sampai ke peserta.
- Admin cukup menyiapkan soal sekali, lalu bisa dipakai ulang dan dibagikan.

## Accessibility & Inclusion
- Mobile-first: target sentuh besar, teks terbaca di layar HP dan cahaya terang bengkel.
