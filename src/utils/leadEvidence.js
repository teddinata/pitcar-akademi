// Aturan bukti lead Asesmen Terpadu (sama dengan backend pitcar.competency.rating.submit):
// pilihan A-D wajib disertai satu kejadian nyata >= BUKTI_MIN huruf, tidak sama dengan bukti pilar lain,
// dan tidak menyalin deskripsi pilihan. "Belum pernah melihat" (level 0) tanpa bukti.
export const BUKTI_MIN = 15

export const STATUS_BUKTI = {
  kosong: 'Belum dipilih',
  bukti: 'Bukti belum diisi',
  salin: 'Bukti disalin',
  ok: 'Lengkap',
}

const rata = (t) => String(t || '').toLowerCase().replace(/\s+/g, ' ').trim()

export function buktiDisalin(pillar, pillars, levels) {
  const t = rata(levels[pillar.id]?.note)
  if (!t) return false
  if (pillars.some((q) => q.id !== pillar.id && levels[q.id]?.level && rata(levels[q.id]?.note) === t)) return true
  return [1, 2, 3, 4].some((n) => {
    const r = rata(pillar.rubric?.[n])
    return r && (r === t || (t.length > 30 && r.includes(t)))
  })
}

export function statusBukti(pillar, pillars, levels) {
  const row = levels[pillar.id] || {}
  if (row.level === 0) return 'ok'
  if (!row.level) return 'kosong'
  if (rata(row.note).length < BUKTI_MIN) return 'bukti'
  return buktiDisalin(pillar, pillars, levels) ? 'salin' : 'ok'
}
