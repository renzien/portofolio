"use client";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  Eye,
  EyeOff,
  LockKeyhole,
} from "lucide-react";
export default function LoginForm({
  configured,
  accountUpdated = false,
}: {
  configured: boolean;
  accountUpdated?: boolean;
}) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [show, setShow] = useState(false);
  return (
    <main className="login-page">
      <div className="login-art">
        <a className="wordmark" href="/">
          ar<span>®</span>
        </a>
        <div>
          <span className="eyebrow">YOUR WORK, YOUR SPACE.</span>
          <h1>
            Di balik setiap
            <br />
            karya, ada <em>cerita.</em>
          </h1>
          <p>Ruang kecil untuk merawat semua yang kamu bangun.</p>
        </div>
        <span className="login-art-footer">ALIF RIZKI / PORTFOLIO STUDIO</span>
      </div>
      <div className="login-side">
        <a href="/" className="back-link">
          <ArrowLeft size={15} /> Kembali ke portofolio
        </a>
        <div className="login-box">
          <div className="login-icon">
            <LockKeyhole size={23} />
          </div>
          <span className="eyebrow">STUDIO ADMIN</span>
          <h2>Selamat datang kembali.</h2>
          <p>Masuk untuk mengelola karya dan profilmu.</p>
          {accountUpdated && (
            <div className="success-notice" role="status">
              Akun berhasil diperbarui. Masuk dengan email dan password terbaru.
            </div>
          )}
          {!configured && (
            <div className="notice">
              Database belum dikonfigurasi. Isi file <code>.env.local</code> dan
              jalankan <code>npm run seed</code> sesuai panduan README untuk
              membuat akun admin.
            </div>
          )}
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setBusy(true);
              setError("");
              const values = new FormData(e.currentTarget);
              try {
                const response = await fetch("/api/auth/login", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    email: values.get("email"),
                    password: values.get("password"),
                  }),
                });
                const result = await response.json();
                if (!response.ok) throw new Error(result.error);
                window.location.assign("/admin");
              } catch (err) {
                setError(
                  err instanceof Error
                    ? err.message
                    : "Tidak dapat masuk. Coba lagi.",
                );
                setBusy(false);
              }
            }}
          >
            <label className="field">
              Email
              <input
                name="email"
                type="email"
                autoComplete="username"
                placeholder="Email admin"
                required
                maxLength={254}
              />
            </label>
            <label className="field">
              Password
              <div className="password-input">
                <input
                  name="password"
                  type={show ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Password kamu"
                  required
                  maxLength={256}
                />
                <button
                  type="button"
                  aria-label={
                    show ? "Sembunyikan password" : "Tampilkan password"
                  }
                  onClick={() => setShow(!show)}
                >
                  {show ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            <button
              type="submit"
              className="button primary login-submit"
              disabled={busy || !configured}
            >
              {busy ? "Memeriksa…" : "Masuk ke studio"}
              <ArrowUpRight size={17} />
            </button>
          </form>
          <small>Akses khusus pemilik portofolio.</small>
        </div>
      </div>
    </main>
  );
}
