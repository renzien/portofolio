"use client";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  FolderOpen,
  Gamepad2,
  ImagePlus,
  LayoutDashboard,
  LogOut,
  Paintbrush,
  Pencil,
  Plus,
  Save,
  ShieldCheck,
  Smartphone,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import type { Project, SiteSettings } from "@/lib/types";
import AccountSettings from "./AccountSettings";
async function request(url: string, method: string, data?: unknown) {
  const response = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: data === undefined ? undefined : JSON.stringify(data),
  });
  const result = await response.json();
  if (response.status === 401) {
    window.location.assign("/admin/login");
    throw new Error("Sesi berakhir.");
  }
  if (!response.ok) throw new Error(result.error || "Tidak dapat menyimpan.");
  return result;
}
function ImageField({
  value,
  onChange,
  label = "Gambar proyek",
  setUploading,
}: {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  setUploading: (value: boolean) => void;
}) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  return (
    <div className="image-field">
      <label className="field">
        {label}
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://… atau unggah gambar"
          maxLength={2048}
        />
      </label>
      <div className="image-upload-row">
        {value && <img src={value} alt="Pratinjau gambar" />}
        <label className={`upload-button ${busy ? "busy" : ""}`}>
          <ImagePlus size={17} />
          {busy ? "Mengunggah…" : "Unggah gambar"}
          <input
            aria-label={`Unggah ${label.toLowerCase()}`}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={busy}
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setError("");
              if (file.size > 3 * 1024 * 1024) {
                setError("Gambar maksimal 3 MB.");
                e.target.value = "";
                return;
              }
              setBusy(true);
              setUploading(true);
              try {
                const response = await fetch("/api/admin/upload", {
                  method: "POST",
                  headers: { "Content-Type": file.type },
                  body: file,
                });
                const result = await response.json();
                if (response.status === 401)
                  window.location.assign("/admin/login");
                if (!response.ok) throw new Error(result.error);
                onChange(result.url);
              } catch (err) {
                setError(err instanceof Error ? err.message : "Unggah gagal.");
              } finally {
                setBusy(false);
                setUploading(false);
                e.target.value = "";
              }
            }}
          />
        </label>
        <small>JPG, PNG, WebP · maks. 3 MB</small>
      </div>
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
    </div>
  );
}
const blankProject = (order: number): Project => ({
  id: "",
  title: "",
  category: "android",
  description: "",
  image: "",
  tags: [],
  year: String(new Date().getFullYear()),
  downloadUrl: "",
  githubUrl: "",
  playUrl: "",
  published: false,
  order,
  sample: false,
});
export default function AdminEditor({
  initialSettings,
  initialProjects,
  email,
}: {
  initialSettings: SiteSettings;
  initialProjects: Project[];
  email: string;
}) {
  const [settings, setSettings] = useState(initialSettings),
    [projects, setProjects] = useState(initialProjects);
  const [tab, setTab] = useState<
    "projects" | "profile" | "appearance" | "account"
  >("projects");
  const [editing, setEditing] = useState<Project | null>(null),
    [busy, setBusy] = useState(false),
    [uploading, setUploading] = useState(false);
  const [notice, setNotice] = useState(""),
    [error, setError] = useState("");
  const [dirty, setDirty] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const deleteDialog = useRef<HTMLDialogElement>(null);
  const [deleting, setDeleting] = useState<Project | null>(null);
  const setField = <K extends keyof SiteSettings>(
    key: K,
    value: SiteSettings[K],
  ) => {
    setSettings((s) => ({ ...s, [key]: value }));
    setDirty(true);
  };
  const editField = <K extends keyof Project>(key: K, value: Project[K]) =>
    setEditing((p) => (p ? { ...p, [key]: value } : p));
  useEffect(() => {
    if (editing) dialog.current?.showModal();
    else dialog.current?.close();
  }, [Boolean(editing)]);
  useEffect(() => {
    if (deleting) deleteDialog.current?.showModal();
    else deleteDialog.current?.close();
  }, [Boolean(deleting)]);
  useEffect(() => {
    if (!dirty && !editing) return;
    const guard = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", guard);
    return () => window.removeEventListener("beforeunload", guard);
  }, [dirty, editing]);
  // Optional browser agent support: opens the same visible editor, without saving or publishing.
  useEffect(() => {
    type Context = {
      registerTool: (
        tool: object,
        options: { signal: AbortSignal },
      ) => void | Promise<void>;
    };
    const context = (document as Document & { modelContext?: Context })
      .modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    Promise.resolve(
      context.registerTool(
        {
          name: "start_project_creation",
          title: "Buka editor proyek baru",
          description:
            "Membuka formulir proyek kosong. Tidak menyimpan atau mempublikasikan proyek.",
          inputSchema: {
            type: "object",
            properties: {
              category: { type: "string", enum: ["android", "unity"] },
            },
            required: ["category"],
            additionalProperties: false,
          },
          annotations: { readOnlyHint: false },
          execute: (input: unknown) => {
            const value = input as { category?: unknown };
            if (
              !value ||
              !["android", "unity"].includes(String(value.category)) ||
              Object.keys(value).some((key) => key !== "category")
            )
              throw new Error("Kategori tidak valid.");
            setTab("projects");
            setEditing({
              ...blankProject(projects.length),
              category: value.category as "android" | "unity",
            });
            return { status: "editor_open", saved: false };
          },
        },
        { signal: lifecycle.signal },
      ),
    ).catch(() => {});
    return () => lifecycle.abort();
  }, [projects.length]);
  async function saveSettings(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await request("/api/admin/settings", "PUT", {
        ...settings,
        skills: settings.skills.map((s) => s.trim()).filter(Boolean),
      });
      setDirty(false);
      setNotice("Perubahan tersimpan dan tampil di portofolio.");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <a className="wordmark" href="/">
          ar<span>®</span>
        </a>
        <div className="studio-label">PORTFOLIO STUDIO</div>
        <nav aria-label="Menu admin">
          <button
            className={tab === "projects" ? "active" : ""}
            onClick={() => {
              setTab("projects");
              setError("");
            }}
          >
            <LayoutDashboard size={18} /> Karya & proyek
            <span>{projects.length}</span>
          </button>
          <button
            className={tab === "profile" ? "active" : ""}
            onClick={() => setTab("profile")}
          >
            <UserRound size={18} /> Profil & kontak
          </button>
          <button
            className={tab === "appearance" ? "active" : ""}
            onClick={() => setTab("appearance")}
          >
            <Paintbrush size={18} /> Beranda & tampilan
          </button>
          <button
            className={tab === "account" ? "active" : ""}
            onClick={() => {
              setTab("account");
              setError("");
              setNotice("");
            }}
          >
            <ShieldCheck size={18} /> Akun & keamanan
          </button>
        </nav>
        <div className="sidebar-bottom">
          <a href="/" target="_blank" rel="noopener noreferrer">
            Lihat portofolio <ArrowUpRight size={16} />
          </a>
          <span>{email}</span>
          <button
            disabled={busy}
            onClick={async () => {
              if (
                dirty &&
                !confirm("Ada perubahan belum disimpan. Keluar dari studio?")
              )
                return;
              setBusy(true);
              try {
                await request("/api/auth/logout", "POST");
                setDirty(false);
                setEditing(null);
                window.location.assign("/admin/login");
              } catch (err) {
                setError((err as Error).message);
                setBusy(false);
              }
            }}
          >
            <LogOut size={16} /> Keluar
          </button>
        </div>
      </aside>
      <main className="admin-main">
        <div className="admin-topline">
          <span>
            WORKSPACE /{" "}
            {tab === "projects"
              ? "KARYA"
              : tab === "profile"
                ? "PROFIL"
                : tab === "account"
                  ? "AKUN"
                  : "TAMPILAN"}
          </span>
          <a href="/" target="_blank" rel="noopener noreferrer">
            Buka website <ArrowUpRight size={15} />
          </a>
        </div>
        <header className="admin-title">
          <div>
            <span className="eyebrow">HALO, ALIF.</span>
            <h1>
              {tab === "projects"
                ? "Ruang untuk karyamu."
                : tab === "profile"
                  ? "Ceritakan tentang dirimu."
                  : tab === "account"
                    ? "Kendalikan aksesmu."
                    : "Buat kesan pertama."}
            </h1>
            <p>
              {tab === "projects"
                ? "Kelola aplikasi dan game yang ingin kamu bagikan."
                : tab === "account"
                  ? "Kelola email dan password untuk masuk ke studio."
                  : "Perubahan yang disimpan langsung tampil di portofolio."}
            </p>
          </div>
          {tab === "projects" && (
            <button
              className="button primary"
              onClick={() => {
                setError("");
                setEditing(blankProject(projects.length));
              }}
            >
              <Plus size={17} /> Tambah proyek
            </button>
          )}
        </header>
        {notice && (
          <div className="success-notice" role="status">
            <Check size={17} />
            {notice}
            <button aria-label="Tutup notifikasi" onClick={() => setNotice("")}>
              <X size={15} />
            </button>
          </div>
        )}
        {error && (
          <div className="error-notice" role="alert">
            {error}
          </div>
        )}
        {tab === "projects" ? (
          <>
            <div className="admin-stats">
              <div>
                <FolderOpen />
                <span>Total proyek</span>
                <strong>{projects.length.toString().padStart(2, "0")}</strong>
              </div>
              <div>
                <Smartphone />
                <span>Android Apps</span>
                <strong>
                  {projects
                    .filter((p) => p.category === "android")
                    .length.toString()
                    .padStart(2, "0")}
                </strong>
              </div>
              <div>
                <Gamepad2 />
                <span>Unity Games</span>
                <strong>
                  {projects
                    .filter((p) => p.category === "unity")
                    .length.toString()
                    .padStart(2, "0")}
                </strong>
              </div>
            </div>
            <div className="admin-list-title">
              <h2>Semua karya</h2>
              <span>
                {projects.filter((p) => p.published).length} dipublikasikan ·{" "}
                {projects.filter((p) => !p.published).length} draft
              </span>
            </div>
            <div className="admin-project-list">
              {[...projects]
                .sort((a, b) => a.order - b.order)
                .map((p) => (
                  <article key={p.id} className="admin-project-row">
                    <div className="admin-project-thumb">
                      {p.image ? (
                        <img src={p.image} alt="" />
                      ) : p.category === "android" ? (
                        <Smartphone />
                      ) : (
                        <Gamepad2 />
                      )}
                    </div>
                    <div className="admin-project-info">
                      <h3>{p.title}</h3>
                      <p>
                        {p.category === "android"
                          ? "Android App"
                          : "Unity Game"}{" "}
                        · {p.year} · Urutan {p.order}
                        {p.sample ? " · Contoh" : ""}
                      </p>
                    </div>
                    <span
                      className={`status-tag ${p.published ? "published" : ""}`}
                    >
                      {p.published ? "Publik" : "Draft"}
                    </span>
                    <button
                      className="icon-button"
                      aria-label={`Edit ${p.title}`}
                      onClick={() => {
                        setError("");
                        setEditing({ ...p });
                      }}
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      className="icon-button delete-button"
                      aria-label={`Hapus ${p.title}`}
                      onClick={() => setDeleting(p)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </article>
                ))}
            </div>
            {!projects.length && (
              <div className="empty-state">
                <FolderOpen size={32} />
                <h3>Karya pertamamu dimulai di sini.</h3>
                <p>Tambahkan aplikasi Android atau game Unity milikmu.</p>
                <button
                  className="button primary"
                  onClick={() => setEditing(blankProject(0))}
                >
                  <Plus size={16} /> Tambah proyek pertama
                </button>
              </div>
            )}
          </>
        ) : tab === "account" ? (
          <AccountSettings email={email} hasUnsavedChanges={dirty} />
        ) : (
          <form className="settings-form" onSubmit={saveSettings}>
            {tab === "profile" ? (
              <>
                <section className="editor-card">
                  <h2>Identitas & cerita</h2>
                  <div className="form-grid">
                    <label className="field">
                      Nama
                      <input
                        required
                        maxLength={60}
                        value={settings.name}
                        onChange={(e) => setField("name", e.target.value)}
                      />
                    </label>
                    <label className="field">
                      Peran / profesi
                      <input
                        required
                        maxLength={80}
                        value={settings.role}
                        onChange={(e) => setField("role", e.target.value)}
                      />
                    </label>
                    <label className="field">
                      Lokasi
                      <input
                        maxLength={60}
                        value={settings.location}
                        onChange={(e) => setField("location", e.target.value)}
                      />
                    </label>
                    <label className="field">
                      Keahlian (pisahkan koma)
                      <input
                        value={settings.skills.join(", ")}
                        onChange={(e) =>
                          setField(
                            "skills",
                            e.target.value.split(",").map((x) => x.trimStart()),
                          )
                        }
                      />
                    </label>
                  </div>
                  <label className="field">
                    Judul bagian tentang
                    <textarea
                      rows={2}
                      required
                      maxLength={150}
                      value={settings.aboutTitle}
                      onChange={(e) => setField("aboutTitle", e.target.value)}
                    />
                  </label>
                  <label className="field">
                    Tentang saya
                    <textarea
                      rows={7}
                      maxLength={3000}
                      value={settings.aboutText}
                      onChange={(e) => setField("aboutText", e.target.value)}
                    />
                  </label>
                </section>
                <section className="editor-card">
                  <h2>Kontak & sosial</h2>
                  <p>Kosongkan tautan untuk menyembunyikannya dari website.</p>
                  <label className="field">
                    Email kontak
                    <input
                      type="email"
                      maxLength={254}
                      value={settings.email}
                      onChange={(e) => setField("email", e.target.value)}
                    />
                  </label>
                  <label className="field">
                    GitHub
                    <input
                      type="url"
                      placeholder="https://github.com/username"
                      value={settings.githubUrl}
                      onChange={(e) => setField("githubUrl", e.target.value)}
                    />
                  </label>
                  <label className="field">
                    LinkedIn
                    <input
                      type="url"
                      placeholder="https://www.linkedin.com/in/username"
                      value={settings.linkedinUrl}
                      onChange={(e) => setField("linkedinUrl", e.target.value)}
                    />
                  </label>
                  <label className="field">
                    Judul bagian kontak
                    <textarea
                      rows={2}
                      required
                      maxLength={150}
                      value={settings.contactTitle}
                      onChange={(e) => setField("contactTitle", e.target.value)}
                    />
                  </label>
                </section>
              </>
            ) : (
              <>
                <section className="editor-card">
                  <h2>Teks beranda</h2>
                  <label className="field">
                    Judul utama
                    <input
                      required
                      maxLength={70}
                      value={settings.headline}
                      onChange={(e) => setField("headline", e.target.value)}
                    />
                  </label>
                  <label className="field">
                    Judul aksen (huruf miring)
                    <input
                      required
                      maxLength={70}
                      value={settings.headlineAccent}
                      onChange={(e) =>
                        setField("headlineAccent", e.target.value)
                      }
                    />
                  </label>
                  <label className="field">
                    Perkenalan singkat
                    <textarea
                      rows={4}
                      maxLength={350}
                      value={settings.intro}
                      onChange={(e) => setField("intro", e.target.value)}
                    />
                  </label>
                </section>
                <section className="editor-card">
                  <h2>Visual & interaksi</h2>
                  <ImageField
                    label="Gambar utama beranda"
                    value={settings.heroImage}
                    onChange={(url) => setField("heroImage", url)}
                    setUploading={setUploading}
                  />
                  <ImageField
                    label="Gambar kedua beranda"
                    value={settings.heroSecondaryImage}
                    onChange={(url) => setField("heroSecondaryImage", url)}
                    setUploading={setUploading}
                  />
                  <label className="checkbox-field">
                    <input
                      type="checkbox"
                      checked={settings.liquidEnabled}
                      onChange={(e) =>
                        setField("liquidEnabled", e.target.checked)
                      }
                    />
                    <span>
                      Aktifkan efek liquid pada gambar
                      <small>
                        Efek mengikuti kursor; otomatis nonaktif untuk
                        preferensi gerakan terbatas.
                      </small>
                    </span>
                  </label>
                </section>
              </>
            )}
            <div className="save-bar">
              <span>
                {dirty
                  ? "Ada perubahan belum disimpan"
                  : "Semua perubahan tersimpan"}
              </span>
              <button
                className="button primary"
                disabled={busy || uploading}
                type="submit"
              >
                <Save size={16} />
                {busy ? "Menyimpan…" : "Simpan perubahan"}
              </button>
            </div>
          </form>
        )}
      </main>
      <dialog
        ref={dialog}
        className="project-dialog"
        onCancel={(e) => {
          if (busy || uploading) e.preventDefault();
          else setEditing(null);
        }}
        onClose={() => setEditing(null)}
      >
        {editing && (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setBusy(true);
              setError("");
              setNotice("");
              const { id, ...payload } = editing;
              try {
                const { project } = await request(
                  id ? `/api/admin/projects/${id}` : "/api/admin/projects",
                  id ? "PUT" : "POST",
                  {
                    ...payload,
                    tags: payload.tags.map((t) => t.trim()).filter(Boolean),
                  },
                );
                setProjects((items) =>
                  id
                    ? items.map((p) => (p.id === id ? project : p))
                    : [...items, project],
                );
                setEditing(null);
                setNotice("Proyek berhasil disimpan.");
              } catch (err) {
                setError((err as Error).message);
              } finally {
                setBusy(false);
              }
            }}
          >
            <div className="dialog-heading">
              <div>
                <span className="eyebrow">PROJECT EDITOR</span>
                <h2>{editing.id ? "Edit karya" : "Karya baru"}</h2>
              </div>
              <button
                type="button"
                className="icon-button"
                aria-label="Tutup editor"
                disabled={busy || uploading}
                onClick={() => setEditing(null)}
              >
                <X size={19} />
              </button>
            </div>
            {error && (
              <p role="alert" className="form-error">
                {error}
              </p>
            )}
            <div className="form-grid">
              <label className="field">
                Nama proyek
                <input
                  autoFocus
                  required
                  maxLength={80}
                  value={editing.title}
                  onChange={(e) => editField("title", e.target.value)}
                />
              </label>
              <label className="field">
                Kategori
                <select
                  value={editing.category}
                  onChange={(e) =>
                    editField("category", e.target.value as Project["category"])
                  }
                >
                  <option value="android">Android App</option>
                  <option value="unity">Unity Game</option>
                </select>
              </label>
            </div>
            <label className="field">
              Deskripsi
              <textarea
                rows={3}
                maxLength={600}
                value={editing.description}
                onChange={(e) => editField("description", e.target.value)}
              />
            </label>
            <ImageField
              value={editing.image}
              onChange={(url) => editField("image", url)}
              setUploading={setUploading}
            />
            <div className="form-grid">
              <label className="field">
                Teknologi (pisahkan koma)
                <input
                  value={editing.tags.join(", ")}
                  onChange={(e) =>
                    editField(
                      "tags",
                      e.target.value.split(",").map((t) => t.trimStart()),
                    )
                  }
                />
              </label>
              <label className="field">
                Tahun
                <input
                  required
                  pattern="20[0-9]{2}"
                  maxLength={4}
                  value={editing.year}
                  onChange={(e) => editField("year", e.target.value)}
                />
              </label>
            </div>
            <label className="field">
              URL download
              <input
                type="url"
                placeholder="https://…"
                value={editing.downloadUrl}
                onChange={(e) => editField("downloadUrl", e.target.value)}
              />
              <small>
                Tautan APK / build game di GitHub Releases, itch.io, atau
                hosting file milikmu.
              </small>
            </label>
            {editing.category === "android" ? (
              <label className="field">
                URL repositori GitHub
                <input
                  type="url"
                  placeholder="https://github.com/…"
                  value={editing.githubUrl}
                  onChange={(e) => editField("githubUrl", e.target.value)}
                />
              </label>
            ) : (
              <label className="field">
                URL play / WebGL
                <input
                  type="url"
                  placeholder="https://…"
                  value={editing.playUrl}
                  onChange={(e) => editField("playUrl", e.target.value)}
                />
              </label>
            )}
            <label className="field">
              Urutan tampil
              <input
                type="number"
                min={0}
                max={9999}
                required
                value={editing.order}
                onChange={(e) => editField("order", Number(e.target.value))}
              />
              <small>Angka kecil ditampilkan lebih dulu.</small>
            </label>
            <label className="checkbox-field">
              <input
                type="checkbox"
                checked={editing.published}
                onChange={(e) => editField("published", e.target.checked)}
              />
              <span>
                Publikasikan di portofolio
                <small>Nonaktifkan untuk menyimpan sebagai draft.</small>
              </span>
            </label>
            <label className="checkbox-field">
              <input
                type="checkbox"
                checked={editing.sample}
                onChange={(e) => editField("sample", e.target.checked)}
              />
              <span>Tandai sebagai proyek contoh</span>
            </label>
            <div className="dialog-footer">
              <button
                className="button secondary"
                type="button"
                disabled={busy || uploading}
                onClick={() => setEditing(null)}
              >
                Batal
              </button>
              <button
                className="button primary"
                type="submit"
                disabled={busy || uploading}
              >
                <Save size={16} />
                {busy ? "Menyimpan…" : "Simpan proyek"}
              </button>
            </div>
          </form>
        )}
      </dialog>
      <dialog
        ref={deleteDialog}
        className="confirm-dialog"
        onCancel={(e) => {
          if (busy) e.preventDefault();
          else setDeleting(null);
        }}
      >
        <h2>Hapus proyek?</h2>
        <p>
          “{deleting?.title}” akan dihapus dari database. Tindakan ini tidak
          dapat dibatalkan.
        </p>
        {error && (
          <p role="alert" className="form-error">
            {error}
          </p>
        )}
        <div className="dialog-footer">
          <button
            className="button secondary"
            disabled={busy}
            onClick={() => setDeleting(null)}
          >
            Batal
          </button>
          <button
            className="button danger"
            disabled={busy}
            onClick={async () => {
              if (!deleting) return;
              setBusy(true);
              setError("");
              try {
                await request(`/api/admin/projects/${deleting.id}`, "DELETE");
                setProjects((items) =>
                  items.filter((p) => p.id !== deleting.id),
                );
                setDeleting(null);
                setNotice("Proyek dihapus.");
              } catch (err) {
                setError((err as Error).message);
              } finally {
                setBusy(false);
              }
            }}
          >
            {busy ? "Menghapus…" : "Hapus proyek"}
          </button>
        </div>
      </dialog>
    </div>
  );
}
