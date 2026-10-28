// Antrean unggah berurutan untuk potongan rekaman (jawaban lisan studi kasus).
// Potongan dikirim satu per satu sesuai urutan; bila gagal (sinyal putus),
// dicoba lagi dengan jeda makin panjang tanpa membuang potongan berikutnya.
// Server mengabaikan potongan dengan nomor yang sama, jadi mengulang itu aman.

export const createUploadQueue = ({ send, onChange = () => {}, wait = (ms) => new Promise((r) => setTimeout(r, ms)), maxDelay = 30000, maxFailures = 5 }) => {
  const antre = []
  let jalan = false
  let gagalBeruntun = 0
  let berhenti = false
  const status = () => ({ pending: antre.length, failing: gagalBeruntun > 0, stopped: berhenti, failures: gagalBeruntun })

  const proses = async () => {
    if (jalan) return
    jalan = true
    while (antre.length && !berhenti) {
      try {
        await send(antre[0])
        antre.shift()
        gagalBeruntun = 0
      } catch {
        gagalBeruntun += 1
        if (gagalBeruntun >= maxFailures) { berhenti = true; break }
        onChange(status())
        await wait(Math.min(maxDelay, 1000 * 2 ** (gagalBeruntun - 1)))
      }
      onChange(status())
    }
    jalan = false
    onChange(status())
  }

  return {
    push(item) { antre.push(item); onChange(status()); proses() },
    /** Coba lagi setelah antrean berhenti karena gagal beruntun. */
    retry() { berhenti = false; gagalBeruntun = 0; proses() },
    /** Tunggu sampai semua potongan terkirim (atau antrean berhenti). */
    async drain() {
      while ((antre.length && !berhenti) || jalan) await wait(100)
      return status()
    },
    status,
  }
}
