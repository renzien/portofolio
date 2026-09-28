"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="system-page">
      <span className="wordmark">
        ar<span>®</span>
      </span>
      <h1>Belum bisa memuat halaman.</h1>
      <p>Koneksi sedang bermasalah. Coba muat ulang sebentar lagi.</p>
      <button className="button primary" onClick={reset}>
        Coba lagi
      </button>
    </main>
  );
}
