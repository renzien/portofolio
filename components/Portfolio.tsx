"use client";
import { useState } from "react";
import {
  ArrowDown,
  ArrowUpRight,
  Download,
  Play,
  Smartphone,
  Gamepad2,
  Plus,
  Code2,
  Mail,
  Menu,
  X,
} from "lucide-react";
import { Github, Linkedin } from "./BrandIcons";
import type { PortfolioData, Project } from "@/lib/types";
import LiquidImage from "./LiquidImage";
function AppPreview({ variant = "focus" }: { variant?: string }) {
  return (
    <div
      className={`app-preview ${variant}`}
      aria-label="Ilustrasi antarmuka proyek contoh"
    >
      <div className="preview-top">
        <span>{variant === "focus" ? "ruang fokus" : "saku."}</span>
        <span>↗</span>
      </div>
      <div className="preview-screen">
        <span className="eyebrow">
          {variant === "focus"
            ? "SATU HAL, SATU WAKTU."
            : "LANGKAH KECIL HARI INI"}
        </span>
        <strong>
          {variant === "focus"
            ? "Make room\nfor focus."
            : "Lebih sadar.\nLebih teratur."}
        </strong>
        <div className="app-panel">
          <span>
            {variant === "focus" ? "Sesi fokus" : "Tabungan bulan ini"}
          </span>
          <b>{variant === "focus" ? "25:00" : "Rp 2.450.000"}</b>
          <div className="app-line" />
          <span>
            {variant === "focus"
              ? "Waktunya mulai sesuatu yang berarti."
              : "Sedikit demi sedikit, jadi bukit."}
          </span>
        </div>
      </div>
      <span className="preview-caption">
        {variant === "focus"
          ? "A little focus. A lot of possibility."
          : "Your money, a little clearer."}
      </span>
    </div>
  );
}
function ProjectCard({
  project,
  liquid,
}: {
  project: Project;
  liquid: boolean;
}) {
  const actions =
    project.category === "android"
      ? [
          {
            label: "Download aplikasi",
            url: project.downloadUrl,
            icon: Download,
          },
          { label: "Repositori GitHub", url: project.githubUrl, icon: Github },
        ]
      : [
          { label: "Mainkan game", url: project.playUrl, icon: Play },
          { label: "Download game", url: project.downloadUrl, icon: Download },
        ];
  return (
    <article className={`project-card ${project.category}`}>
      <div className="project-art">
        {project.image ? (
          <LiquidImage
            src={project.image}
            enabled={liquid}
            alt={`Cover ${project.title}`}
          />
        ) : project.sample ? (
          <AppPreview variant={project.order % 3 === 0 ? "focus" : "finance"} />
        ) : (
          <div className="project-placeholder">
            {project.category === "android" ? (
              <Smartphone size={48} />
            ) : (
              <Gamepad2 size={48} />
            )}
            <span>{project.title}</span>
          </div>
        )}
        <div className="art-label">
          <span>
            {project.category === "android" ? (
              <Smartphone size={14} />
            ) : (
              <Gamepad2 size={15} />
            )}{" "}
            {project.category === "android" ? "ANDROID APP" : "UNITY GAME"}
          </span>
          <span>{project.year}</span>
        </div>
        {project.sample && <span className="sample-badge">Proyek contoh</span>}
      </div>
      <div className="project-heading">
        <h3>{project.title}</h3>
        <div className="project-actions">
          {actions.map(({ label, url, icon: Icon }) =>
            url ? (
              <a
                key={label}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="icon-button"
                aria-label={`${label}: ${project.title}`}
                title={label}
              >
                <Icon size={18} />
              </a>
            ) : (
              <span
                key={label}
                className="icon-button unavailable"
                aria-label={`${label} belum tersedia`}
                title={`${label} belum tersedia`}
              >
                <Icon size={18} />
              </span>
            ),
          )}
        </div>
      </div>
      <p>{project.description}</p>
      <div className="project-tags">
        {project.tags.map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
      </div>
    </article>
  );
}
export default function Portfolio({ data }: { data: PortfolioData }) {
  const { settings: s, projects, demo } = data;
  const [filter, setFilter] = useState("all");
  const [menu, setMenu] = useState(false);
  const visible = projects.filter(
    (p) => filter === "all" || p.category === filter,
  );
  return (
    <>
      <a className="skip-link" href="#main">
        Lewati ke konten
      </a>
      <header className="site-header">
        <a className="wordmark" href="#" aria-label={`${s.name} — beranda`}>
          ar<span>®</span>
        </a>
        <nav aria-label="Navigasi utama" className={menu ? "open" : ""}>
          <a href="#work" onClick={() => setMenu(false)}>
            Karya
          </a>
          <a href="#about" onClick={() => setMenu(false)}>
            Tentang
          </a>
          <a href="#contact" onClick={() => setMenu(false)}>
            Kontak
          </a>
        </nav>
        <a className="nav-cta" href="#contact">
          Let’s talk <ArrowUpRight size={16} />
        </a>
        <button
          className="menu-toggle"
          aria-label={menu ? "Tutup menu" : "Buka menu"}
          aria-expanded={menu}
          onClick={() => setMenu(!menu)}
        >
          {menu ? <X /> : <Menu />}
        </button>
      </header>
      <main id="main" tabIndex={-1}>
        <section className="hero">
          <div className="hero-meta">
            <span>PORTOFOLIO / {s.name.toUpperCase()}</span>
            <span>
              {s.location} <span className="tiny-plus">✳</span>
            </span>
          </div>
          <div className="hero-copy">
            <div className="intro-label">
              <span className="blue-line" />
              {s.role}
            </div>
            <h1>
              {s.headline}
              <br />
              <em>{s.headlineAccent}</em>
            </h1>
            <p>{s.intro}</p>
            <a className="button primary" href="#work">
              Jelajahi karya <ArrowDown size={17} />
            </a>
          </div>
          <div className="floating-art float-liquid">
            <LiquidImage src={s.heroImage} enabled={s.liquidEnabled} />
            <span className="art-note">curiosity in motion</span>
          </div>
          <div className="floating-art float-game">
            <LiquidImage src={s.heroSecondaryImage} enabled={s.liquidEnabled} />
            <span>
              <Gamepad2 size={15} /> worlds worth exploring
            </span>
          </div>
          <div className="hero-sticker">
            <Code2 size={18} />
            <span>
              built with
              <br />
              <b>a little curiosity.</b>
            </span>
          </div>
          <div className="hero-footer">
            <span>APLIKASI YANG BERGUNA. GAME YANG BERKESAN.</span>
            <a href="#work">
              SCROLL TO EXPLORE <ArrowDown size={14} />
            </a>
          </div>
        </section>
        <div className="skill-strip" aria-label="Bidang pengembangan">
          <span>
            <Smartphone /> Android development
          </span>
          <Plus />
          <span>
            <Gamepad2 /> Unity game development
          </span>
          <Plus />
          <span>
            <Code2 /> Creative exploration
          </span>
        </div>
        <section className="work-section section-wrap" id="work">
          <div className="section-heading">
            <div>
              <span className="eyebrow">01 / SELECTED WORK</span>
              <h2>
                Ide yang jadi <em>nyata.</em>
              </h2>
            </div>
            <p>
              Beberapa hal yang kubangun.
              <br />
              Dari layar kecil sampai dunia baru.
            </p>
          </div>
          <div className="work-toolbar">
            <div
              className="filter-tabs"
              role="group"
              aria-label="Filter proyek"
            >
              {[
                { value: "all", label: "Semua karya" },
                { value: "android", label: "Android Apps" },
                { value: "unity", label: "Unity Games" },
              ].map((item) => (
                <button
                  key={item.value}
                  aria-pressed={filter === item.value}
                  onClick={() => setFilter(item.value)}
                >
                  {item.label}
                  <span>
                    {item.value === "all"
                      ? projects.length
                      : projects.filter((p) => p.category === item.value)
                          .length}
                  </span>
                </button>
              ))}
            </div>
            {demo && (
              <span className="demo-note">Pratinjau dengan proyek contoh</span>
            )}
          </div>
          <div className="project-grid">
            {visible.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                liquid={s.liquidEnabled}
              />
            ))}
          </div>
          {visible.length === 0 && (
            <div className="empty-state">
              <Code2 />
              <h3>Karya baru sedang disiapkan.</h3>
              <p>Nantikan cerita berikutnya di sini.</p>
            </div>
          )}
        </section>
        <section className="about-section section-wrap" id="about">
          <div className="about-label">
            <span className="eyebrow">02 / A LITTLE ABOUT ME</span>
            <div className="monogram-tile">
              ar<span>✳</span>
            </div>
          </div>
          <div className="about-copy">
            <h2>
              {s.aboutTitle.split("\n").map((line, i) => (
                <span key={i}>
                  {i === 1 ? <em>{line}</em> : line}
                  <br />
                </span>
              ))}
            </h2>
            {s.aboutText.split("\n\n").map((line, i) => (
              <p key={i}>{line}</p>
            ))}
            <div className="skill-tags">
              {s.skills.map((skill) => (
                <span key={skill}>{skill}</span>
              ))}
            </div>
          </div>
        </section>
        <section className="contact-section section-wrap" id="contact">
          <span className="eyebrow">03 / NEXT CHAPTER</span>
          <div className="contact-row">
            <h2>
              {s.contactTitle.split("\n").map((line, i) => (
                <span key={i}>
                  {i === 1 ? <em>{line}</em> : line}
                  <br />
                </span>
              ))}
            </h2>
            {s.email && (
              <a
                href={`mailto:${s.email}`}
                className="contact-circle"
                aria-label="Kirim email"
              >
                <ArrowUpRight />
              </a>
            )}
          </div>
          <div className="contact-bottom">
            {s.email ? (
              <a className="email-link" href={`mailto:${s.email}`}>
                {s.email} <ArrowUpRight size={18} />
              </a>
            ) : (
              <p>Aplikasi, game, atau ide yang belum punya nama.</p>
            )}
            <div className="socials">
              {s.githubUrl && (
                <a href={s.githubUrl} target="_blank" rel="noopener noreferrer">
                  <Github size={18} /> GitHub <ArrowUpRight size={14} />
                </a>
              )}
              {s.linkedinUrl && (
                <a
                  href={s.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Linkedin size={18} /> LinkedIn <ArrowUpRight size={14} />
                </a>
              )}
              {s.email && (
                <a href={`mailto:${s.email}`}>
                  <Mail size={18} /> Email
                </a>
              )}
            </div>
          </div>
        </section>
      </main>
      <footer className="site-footer">
        <a className="wordmark" href="#">
          ar<span>®</span>
        </a>
        <span>
          © {new Date().getFullYear()} {s.name} Portofolio
        </span>
        <a href="#">Kembali ke atas ↑</a>
      </footer>
    </>
  );
}
