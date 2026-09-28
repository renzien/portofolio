"use client";
import { useState } from "react";
import { LockKeyhole, Save } from "lucide-react";

export default function AccountSettings({
  email,
  hasUnsavedChanges,
}: {
  email: string;
  hasUnsavedChanges: boolean;
}) {
  const [newPassword, setNewPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <form
      className="settings-form account-form"
      onSubmit={async (event) => {
        event.preventDefault();
        if (busy || hasUnsavedChanges) return;
        const form = event.currentTarget;
        const values = new FormData(form);
        setBusy(true);
        setError("");
        try {
          const response = await fetch("/api/admin/account", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: values.get("email"),
              currentPassword: values.get("currentPassword"),
              newPassword: values.get("newPassword"),
              confirmPassword: values.get("confirmPassword"),
            }),
          });
          const result = await response.json();
          if (response.status === 401) {
            window.location.assign("/admin/login");
            return;
          }
          if (!response.ok)
            throw new Error(result.error || "Akun belum dapat diperbarui.");
          form.reset();
          setNewPassword("");
          window.location.assign("/admin/login?updated=1");
        } catch (err) {
          setError(
            err instanceof Error
              ? err.message
              : "Periksa koneksi lalu coba lagi.",
          );
          setBusy(false);
        }
      }}
    >
      <section className="editor-card">
        <h2>Email untuk masuk</h2>
        <p>
          Email ini digunakan untuk login admin. Email kontak di portofolio
          diatur terpisah lewat Profil & kontak.
        </p>
        <label className="field">
          Email admin
          <input
            name="email"
            type="email"
            autoComplete="username"
            defaultValue={email}
            maxLength={254}
            required
            disabled={busy}
          />
        </label>
      </section>
      <section className="editor-card">
        <h2>Perbarui password</h2>
        <p>Kosongkan kedua kolom ini jika hanya ingin mengganti email.</p>
        <div className="form-grid">
          <label className="field">
            Password baru
            <input
              name="newPassword"
              type="password"
              autoComplete="new-password"
              minLength={10}
              maxLength={256}
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              disabled={busy}
              aria-describedby="password-hint"
            />
            <small id="password-hint">Minimal 10 karakter.</small>
          </label>
          <label className="field">
            Ulangi password baru
            <input
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              maxLength={256}
              required={Boolean(newPassword)}
              disabled={busy}
            />
          </label>
        </div>
      </section>
      <section className="editor-card">
        <h2>Konfirmasi perubahan</h2>
        <p>Masukkan password saat ini untuk menyimpan perubahan akun.</p>
        <label className="field">
          Password saat ini
          <input
            name="currentPassword"
            type="password"
            autoComplete="current-password"
            maxLength={256}
            required
            disabled={busy}
          />
        </label>
        <div className="account-session-note">
          <LockKeyhole size={18} aria-hidden="true" />
          <span>
            Setelah disimpan, semua sesi akan keluar. Masuk kembali menggunakan
            email dan password terbaru.
          </span>
        </div>
      </section>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      {hasUnsavedChanges && (
        <p className="notice">
          Simpan perubahan Profil & kontak atau Beranda & tampilan terlebih
          dahulu.
        </p>
      )}
      <div className="save-bar">
        <span>Akses khusus pemilik portofolio.</span>
        <button
          className="button primary"
          type="submit"
          disabled={busy || hasUnsavedChanges}
        >
          <Save size={16} />
          {busy ? "Menyimpan…" : "Simpan akun"}
        </button>
      </div>
    </form>
  );
}
