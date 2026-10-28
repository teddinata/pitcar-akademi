// Ekspor / template / impor studi kasus kompetensi lewat Excel (SheetJS, dimuat
// saat dipakai). Format satu file:
// - "Kasus": satu baris per studi kasus.
// - "Pertanyaan": satu baris per pertanyaan; pilihan ganda punya Opsi A-F dan
//   jenjangnya (L1-L4). Tiap opsi mewakili satu jenjang.
// - "Kode pilar" & "Petunjuk": referensi untuk penyusun soal.
// Validasi isi (kode profil/pilar, opsi) dilakukan server saat "Cek dulu".

const OPTION_KEYS = ['A', 'B', 'C', 'D', 'E', 'F']
const CASE_HEADERS = ['Kode kasus', 'Kode profil', 'Judul', 'Skenario', 'Batas waktu (menit)', 'Pilar dinilai (kode, pisah koma)', 'Panduan penilaian']
const QUESTION_HEADERS = ['Kode kasus', 'No', 'Tipe (esai / pilihan ganda)', 'Pertanyaan', 'Kode pilar',
  ...OPTION_KEYS.flatMap((k) => [`Opsi ${k}`, `Jenjang ${k}`])]

const loadXlsx = () => import('xlsx')

const CONTOH = {
  code: 'mek-contoh-1', profileCode: 'mekanik', name: 'Contoh: rem berdecit setelah ganti kampas',
  scenario: 'Tulis situasi nyata di bengkel dengan angka yang realistis (tipe mobil, km, keluhan, waktu janji).',
  minutes: 20, pillarCodes: ['diagnosa', 'kualitas'],
  guide: 'Pertanyaan 2 - (topik esai)\nL1: ...\nL2: ...\nL3: ...\nL4: ...\n\nJawaban salah yang sering muncul\n- ...',
  questions: [
    { qtype: 'choice', text: 'Apa yang pertama Anda lakukan?', pillar: 'kualitas', options: [
      { text: 'Tindakan khas L1 (keliru / tanpa pemeriksaan)', level: 1 },
      { text: 'Tindakan khas L2 (benar tapi dasar)', level: 2 },
      { text: 'Tindakan khas L3 (sistematis, mandiri)', level: 3 },
      { text: 'Tindakan khas L4 (sistematis + membimbing / mencegah berulang)', level: 4 },
    ] },
    { qtype: 'essay', text: 'Jelaskan langkah pemeriksaan Anda dan alasannya.', pillar: 'diagnosa', options: [] },
  ],
}

function petunjukRows() {
  return [
    ['Cara mengisi'],
    ['1. Sheet "Kasus": satu baris per studi kasus. Kode kasus unik (mis. mek-rem-1). Impor dengan kode yang sama memperbarui kasus itu.'],
    ['2. Kode profil: lihat sheet "Kode pilar" (mis. mekanik, kabeng).'],
    ['3. Batas waktu dalam menit; 0 = tanpa batas. Saat waktu habis, jawaban peserta dikirim otomatis.'],
    ['4. Sheet "Pertanyaan": satu baris per pertanyaan, urut menurut kolom No.'],
    ['5. Tipe "esai": jawaban tertulis/lisan dinilai AI memakai rubrik pilar + panduan penilaian.'],
    ['6. Tipe "pilihan ganda": isi Opsi A-D (boleh sampai F) dan Jenjang tiap opsi (L1-L4). Tiap opsi mewakili tindakan khas satu jenjang; buat panjang opsi kurang lebih sama. Kode pilar wajib.'],
    ['7. Urutan opsi diacak untuk tiap peserta, dan jenjang opsi tidak pernah terlihat peserta.'],
    ['8. Kasus yang sudah dikerjakan peserta tidak bisa ditimpa; pakai kode baru untuk versi baru.'],
  ]
}

function pillarRows(profiles, pillars) {
  const rows = [['Kode profil', 'Profil', 'Kode pilar', 'Pilar']]
  for (const pr of profiles) {
    for (const p of pillars.filter((x) => x.profile_id === pr.id)) rows.push([pr.code, pr.name, p.code, p.name])
  }
  return rows
}

function sheetFrom(XLSX, rows, widths) {
  const ws = XLSX.utils.aoa_to_sheet(rows)
  ws['!cols'] = widths.map((wch) => ({ wch }))
  return ws
}

function questionRow(code, no, q) {
  const row = [code, no, q.qtype === 'choice' ? 'pilihan ganda' : 'esai', q.text, q.pillar || '']
  OPTION_KEYS.forEach((_k, i) => {
    const o = q.options?.[i]
    row.push(o ? o.text : '', o ? `L${o.level}` : '')
  })
  return row
}

async function writeBook(caseList, profiles, pillars, filename) {
  const XLSX = await loadXlsx()
  const caseRows = [CASE_HEADERS]
  const questionRows = [QUESTION_HEADERS]
  for (const c of caseList) {
    caseRows.push([c.code, c.profileCode, c.name, c.scenario, c.minutes, c.pillarCodes.join(', '), c.guide || ''])
    c.questions.forEach((q, i) => questionRows.push(questionRow(c.code, i + 1, q)))
  }
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, sheetFrom(XLSX, caseRows, [18, 12, 36, 60, 10, 30, 60]), 'Kasus')
  XLSX.utils.book_append_sheet(wb, sheetFrom(XLSX, questionRows, [18, 5, 14, 60, 14, ...OPTION_KEYS.flatMap(() => [40, 9])]), 'Pertanyaan')
  XLSX.utils.book_append_sheet(wb, sheetFrom(XLSX, pillarRows(profiles, pillars), [12, 18, 16, 30]), 'Kode pilar')
  XLSX.utils.book_append_sheet(wb, sheetFrom(XLSX, petunjukRows(), [140]), 'Petunjuk')
  XLSX.writeFile(wb, filename)
}

/** Studi kasus dari config admin -> bentuk netral untuk file. */
function fromConfig(c, profiles, pillars) {
  const profile = profiles.find((p) => p.id === c.profile_id)
  const code = (id) => pillars.find((p) => p.id === id)?.code || ''
  return {
    code: c.code, profileCode: profile?.code || '', name: c.name, scenario: c.scenario,
    minutes: c.time_limit_minutes, pillarCodes: c.pillar_ids.map(code).filter(Boolean), guide: c.guide,
    questions: c.questions.map((q) => ({ qtype: q.qtype, text: q.text, pillar: code(q.pillar_id), options: q.options })),
  }
}

export function exportCases(cases, profiles, pillars, filename = 'studi-kasus-kompetensi.xlsx') {
  return writeBook(cases.map((c) => fromConfig(c, profiles, pillars)), profiles, pillars, filename)
}

export function downloadTemplate(profiles, pillars) {
  return writeBook([CONTOH], profiles, pillars, 'template-studi-kasus-kompetensi.xlsx')
}

const text = (v) => (v == null ? '' : String(v)).trim()
const levelOf = (v) => {
  const m = text(v).toUpperCase().match(/^L?\s*([1-4])$/)
  return m ? Number(m[1]) : 0
}
const qtypeOf = (v) => (/pilihan|ganda|pg|choice/i.test(text(v)) ? 'choice' : 'essay')

/** File Excel -> { cases: [...payload import_cases], problems: [teks] }. */
export async function parseCasesFile(file) {
  const XLSX = await loadXlsx()
  const wb = XLSX.read(await file.arrayBuffer(), { type: 'array' })
  const sheet = (name) => wb.Sheets[wb.SheetNames.find((n) => n.trim().toLowerCase() === name.toLowerCase())]
  const kasus = sheet('Kasus')
  const pertanyaan = sheet('Pertanyaan')
  if (!kasus || !pertanyaan) {
    return { cases: [], problems: ['File harus punya sheet "Kasus" dan "Pertanyaan". Unduh template untuk formatnya.'] }
  }
  const caseRows = XLSX.utils.sheet_to_json(kasus, { header: 1, defval: '' }).slice(1)
  const questionRows = XLSX.utils.sheet_to_json(pertanyaan, { header: 1, defval: '' }).slice(1)
  const problems = []
  const byCode = new Map()
  for (const r of caseRows) {
    if (!r.some((v) => text(v))) continue
    const code = text(r[0])
    byCode.set(code, {
      code, profile_code: text(r[1]), name: text(r[2]), scenario: text(r[3]),
      time_limit_minutes: Number(r[4]) || 0,
      pillar_codes: text(r[5]).split(/[,;]/).map((s) => s.trim()).filter(Boolean),
      guide: text(r[6]), questions: [], _order: [],
    })
  }
  questionRows.forEach((r, i) => {
    if (!r.some((v) => text(v))) return
    const c = byCode.get(text(r[0]))
    if (!c) { problems.push(`Pertanyaan baris ${i + 2}: kode kasus "${text(r[0])}" tidak ada di sheet Kasus.`); return }
    const options = []
    OPTION_KEYS.forEach((_k, j) => {
      const optText = text(r[5 + j * 2])
      if (!optText) return
      const level = levelOf(r[6 + j * 2])
      if (!level) problems.push(`Pertanyaan baris ${i + 2}: jenjang opsi ${OPTION_KEYS[j]} harus L1-L4.`)
      options.push({ text: optText, level })
    })
    c.questions.push({ qtype: qtypeOf(r[2]), text: text(r[3]), pillar_code: text(r[4]), options })
    c._order.push(Number(r[1]) || c._order.length + 1)
  })
  const cases = [...byCode.values()].map(({ _order, questions, ...c }) => ({
    ...c,
    questions: questions.map((q, i) => ({ q, n: _order[i] })).sort((a, b) => a.n - b.n).map((x) => x.q),
  }))
  if (!cases.length) problems.push('Sheet "Kasus" kosong.')
  return { cases, problems }
}
