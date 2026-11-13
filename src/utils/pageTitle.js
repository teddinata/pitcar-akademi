// Judul tab browser mengikuti halaman yang sedang dibuka: "<halaman> · <aplikasi>".
// Sumber judul: meta.title pada rute, lalu daftar judulRute; bila tidak ada, judul utama (h1) halaman.
// h1 dibaca beberapa kali karena halaman dimuat bertahap (rute lazy, data dari server).
const JEDA = [60, 400, 1200, 3000]

const judulHalaman = () => {
  for (const h1 of document.querySelectorAll('h1')) {
    if (h1.closest('aside, nav, [role="dialog"]')) continue
    const teks = h1.textContent.replace(/\s+/g, ' ').trim()
    if (teks) return teks.length > 60 ? `${teks.slice(0, 57)}...` : teks
  }
  return ''
}

export const pasangJudulTab = (router, aplikasi, judulRute = {}) => {
  let giliran = 0
  let terpasang = ''
  const pasang = (judul) => {
    terpasang = judul && judul.toLowerCase() !== aplikasi.toLowerCase() ? `${judul} · ${aplikasi}` : aplikasi
    document.title = terpasang
  }
  router.afterEach((to) => {
    const id = ++giliran
    // Pola rute lengkap (mis. '/hr/employees/:id'), cocok dengan kunci di judulRute.
    const pola = (to.matched[to.matched.length - 1]?.path || '').replace(/(.)\/$/, '$1')
    const tetap = typeof to.meta?.title === 'string' ? to.meta.title : judulRute[pola] || ''
    if (tetap) { pasang(tetap); return }
    const awal = document.title
    JEDA.forEach((ms) => setTimeout(() => {
      if (id !== giliran) return
      // Halaman yang menulis judulnya sendiri tidak ditimpa.
      if (document.title !== awal && document.title !== terpasang) return
      pasang(judulHalaman())
    }, ms))
  })
}
