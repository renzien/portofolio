"use client";
import { useState } from "react";
import {
  ArrowDown,
  ArrowUpRight,
  Download,
  Play,
  Smartphone,
  AppWindow,
  Gamepad2,
  Code2,
  Mail,
  Menu,
  X,
} from "lucide-react";
import { Github, Linkedin } from "./BrandIcons";
import type { PortfolioData, Project, SiteSettings } from "@/lib/types";
import LiquidImage from "./LiquidImage";
import AboutMascot from "./AboutMascot";

const categoryDetails = {
  android: {
    label: "ANDROID APP",
    description: "ANDROID APPLICATION",
    icon: Smartphone,
  },
  unity: {
    label: "UNITY GAME",
    description: "MADE WITH UNITY",
    icon: Gamepad2,
  },
  app: { label: "APP", description: "APPLICATION", icon: AppWindow },
};

function AppPreview({ finance = false }: { finance?: boolean }) {
  return (
    <div
      className={`app-preview ${finance ? "finance" : "focus"}`}
      role="img"
      aria-label="Ilustrasi antarmuka proyek contoh"
    >
      <span className="preview-orbit" />
      <div className="mini-phone phone-left" aria-hidden="true">
        <span className="phone-camera" />
        <span className="phone-brand">{finance ? "saku." : "ruang."}</span>
        <div className="phone-greeting">
          {finance
            ? "Small steps.\nBig plans."
            : "A little space\nfor yourself."}
        </div>
        <div className="phone-illustration">
          <span />
          <span />
          <span />
        </div>
        <span className="phone-cta">
          {finance ? "Mulai menabung" : "Let’s get started"} ↗
        </span>
      </div>
      <div className="mini-phone phone-center" aria-hidden="true">
        <span className="phone-camera" />
        <div className="phone-tiny-nav">
          <span>09:41</span>
          <span>•••</span>
        </div>
        <span className="phone-brand">{finance ? "saku." : "ruang fokus"}</span>
        <span className="phone-subtitle">
          {finance ? "A little clearer, every day." : "Satu hal, satu waktu."}
        </span>
        <div className="phone-main-card">
          <span>{finance ? "Total tabungan" : "Waktunya fokus"}</span>
          <strong>{finance ? "2.450.000" : "25:00"}</strong>
          <div className="phone-progress" />
          <small>
            {finance ? "Selangkah lebih dekat." : "You’re doing great."}
          </small>
        </div>
        <span className="phone-section-label">
          {finance ? "Aktivitas terbaru" : "Rencana hari ini"} <span>↗</span>
        </span>
        <div className="phone-list-row">
          <i />{" "}
          <span>
            {finance ? "Dana impian" : "Belajar hal baru"}
            <small>{finance ? "Tabungan pribadi" : "Personal growth"}</small>
          </span>
          <b>✓</b>
        </div>
        <div className="phone-list-row">
          <i />{" "}
          <span>
            {finance ? "Buku & inspirasi" : "Bangun sesuatu"}
            <small>{finance ? "Pengeluaran" : "Side project"}</small>
          </span>
          <b>↗</b>
        </div>
        <div className="phone-bottom-nav">
          ⌂ <span>◉</span> ▤
        </div>
      </div>
      <div className="mini-phone phone-right" aria-hidden="true">
        <span className="phone-camera" />
        <span className="phone-brand">Your little wins.</span>
        <div className="phone-chart">
          <i />
          <i />
          <i />
          <i />
          <i />
        </div>
        <strong>{finance ? "+12%" : "7 hari"}</strong>
        <span className="phone-subtitle">
          {finance
            ? "Tumbuh sedikit demi sedikit."
            : "Kebiasaan baik dimulai di sini."}
        </span>
        <span className="phone-cta">Keep going ↗</span>
      </div>
    </div>
  );
}
function ProjectArt({
  project,
  liquid,
}: {
  project: Project;
  liquid: boolean;
}) {
  const category = categoryDetails[project.category];
  const Icon = category.icon;
  if (project.image)
    return (
      <LiquidImage
        src={project.image}
        enabled={liquid}
        alt={`Cover ${project.title}`}
      />
    );
  if (project.sample && project.category === "android")
    return <AppPreview finance={project.order % 3 !== 0} />;
  return (
    <div className={`project-placeholder ${project.category}`}>
      <Icon size={42} />
      <span>{project.title}</span>
      <small>{category.description}</small>
    </div>
  );
}
function EditorialArt({
  index,
  settings,
}: {
  index: number;
  settings: SiteSettings;
}) {
  if (index === 0) return <AppPreview />;
  if (index === 2)
    return (
      <div className="orbit-art" aria-hidden="true">
        <span className="orbit-ring ring-one" />
        <span className="orbit-ring ring-two" />
        <span className="orbit-planet" />
        <span className="orbit-star">✳</span>
        <strong>
          A little code.
          <br />
          <em>A whole new world.</em>
        </strong>
        <span className="orbit-caption">UNITY / CREATIVE EXPLORATION</span>
      </div>
    );
  return (
    <LiquidImage
      src={
        index === 1 || index === 3
          ? settings.heroSecondaryImage
          : settings.heroImage
      }
      enabled={settings.liquidEnabled}
    />
  );
}
function FeatureTile({
  project,
  index,
  settings,
  onNavigate,
}: {
  project?: Project;
  index: number;
  settings: SiteSettings;
  onNavigate: () => void;
}) {
  const label =
    project?.title ||
    [
      "Android, thoughtfully made.",
      "Worlds worth exploring.",
      "Code. Create. Play.",
      "A different perspective.",
      "Curiosity in motion.",
    ][index];
  const artwork = project ? (
    <ProjectArt project={project} liquid={settings.liquidEnabled} />
  ) : (
    <EditorialArt index={index} settings={settings} />
  );
  const caption = (
    <div className="feature-caption">
      <div>
        <span>
          {project
            ? categoryDetails[project.category].label
            : "VISUAL EXPLORATION"}
        </span>
        <strong>{label}</strong>
      </div>
      <ArrowUpRight size={19} aria-hidden="true" />
    </div>
  );
  return project ? (
    <a
      className={`feature-tile feature-${index + 1}`}
      href={`#project-${project.id}`}
      aria-label={`Lihat karya ${project.title}`}
      onClick={onNavigate}
    >
      {artwork}
      {caption}
      {project.sample && <span className="feature-sample">Contoh</span>}
    </a>
  ) : (
    <div className={`feature-tile feature-${index + 1} editorial-tile`}>
      {artwork}
      {index !== 2 && caption}
    </div>
  );
}
function ProjectCard({
  project,
  liquid,
  index,
}: {
  project: Project;
  liquid: boolean;
  index: number;
}) {
  const CategoryIcon = categoryDetails[project.category].icon;
  const actions =
    project.category !== "unity"
      ? [
          {
            label: "Download aplikasi",
            url: project.downloadUrl,
            icon: Download,
          },
          { label: "Repositori GitHub", url: project.githubUrl, icon: Github },
          ...(project.category === "app"
            ? [
                {
                  label: "Buka aplikasi",
                  url: project.playUrl,
                  icon: ArrowUpRight,
                },
              ]
            : []),
        ]
      : [
          { label: "Mainkan game", url: project.playUrl, icon: Play },
          { label: "Download game", url: project.downloadUrl, icon: Download },
        ];
  return (
    <article
      className={`project-card ${project.category}`}
      id={`project-${project.id}`}
    >
      <div className="project-art">
        <ProjectArt project={project} liquid={liquid} />
        <div className="art-label">
          <span>
            <CategoryIcon size={14} />
            {categoryDetails[project.category].label}
          </span>
          <span>{project.year}</span>
        </div>
        {project.sample && <span className="sample-badge">Proyek contoh</span>}
        <span className="project-number" aria-hidden="true">
          {String(index + 1).padStart(2, "0")}
        </span>
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
                <Icon size={17} />
              </a>
            ) : (
              <span
                key={label}
                className="icon-button unavailable"
                aria-label={`${label} belum tersedia`}
                title={`${label} belum tersedia`}
              >
                <Icon size={17} />
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
  const androidCount = projects.filter((p) => p.category === "android").length;
  const unityCount = projects.filter((p) => p.category === "unity").length;
  const appCount = projects.filter((p) => p.category === "app").length;
  const initials = s.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toLowerCase();
  return (
    <div className="portfolio-page" id="top">
      <a className="skip-link" href="#main">
        Lewati ke konten
      </a>
      <div className="portfolio-frame">
        <header className="site-header">
          <a
            className="identity-link"
            href="#top"
            aria-label={`${s.name} — beranda`}
          >
            <span className="wordmark">
              {initials}
              <span>®</span>
            </span>
            <span className="identity-name">
              {s.name}
              <small>DEVELOPER PORTFOLIO</small>
            </span>
          </a>
          <nav
            id="main-navigation"
            aria-label="Navigasi utama"
            className={menu ? "open" : ""}
          >
            {[
              { href: "#top", label: "Beranda" },
              { href: "#work", label: "Karya" },
              { href: "#about", label: "Tentang" },
              { href: "#contact", label: "Kontak" },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMenu(false)}
              >
                {item.label}
              </a>
            ))}
          </nav>
          <a className="nav-cta" href="#contact" aria-label="Hubungi Alif">
            Let’s connect <ArrowUpRight size={15} />
          </a>
          <button
            className="menu-toggle"
            aria-label={menu ? "Tutup menu" : "Buka menu"}
            aria-expanded={menu}
            aria-controls="main-navigation"
            onClick={() => setMenu(!menu)}
          >
            {menu ? <X size={21} /> : <Menu size={21} />}
          </button>
        </header>
        <main id="main" tabIndex={-1}>
          <section className="hero" aria-label={`Portofolio ${s.name}`}>
            <div className="hero-title">
              <div className="hero-title-meta">
                <span>SELECTED WORK / {s.name.toUpperCase()}</span>
                <span>{s.location}</span>
              </div>
              <h1>
                <svg
                  viewBox="0 0 1000 250"
                  aria-hidden="true"
                  focusable="false"
                >
                  <text
                    x="6"
                    y="230"
                    fontSize="300"
                    textLength="988"
                    lengthAdjust="spacingAndGlyphs"
                  >
                    PORTFOLIO
                  </text>
                </svg>
                <span className="sr-only">Portofolio {s.name}</span>
              </h1>
            </div>
            <div className="hero-intro">
              <span className="intro-label">
                <span />
                {s.role}
              </span>
              <h2>
                {s.headline} <em>{s.headlineAccent}</em>
              </h2>
              <p>{s.intro}</p>
              <a className="text-link" href="#work">
                Jelajahi karya <ArrowDown size={14} />
              </a>
            </div>
            {Array.from({ length: 5 }, (_, i) => (
              <FeatureTile
                key={projects[i]?.id || `visual-${i}`}
                index={i}
                project={projects[i]}
                settings={s}
                onNavigate={() => setFilter("all")}
              />
            ))}
            <a
              className="project-stat"
              href="#work"
              aria-label={`Lihat ${projects.length} ${demo ? "proyek contoh" : "karya terpilih"}`}
            >
              <div>
                <strong>
                  {String(projects.length).padStart(2, "0")}
                  <span>↗</span>
                </strong>
                <span>({demo ? "Proyek contoh" : "Karya terpilih"})</span>
              </div>
              <p>
                Dari ide, menjadi sesuatu
                <br />
                yang bisa digunakan dan dimainkan.
              </p>
              <span className="stat-categories">
                <span>{unityCount} Unity</span>
                <span>{androidCount} Android</span>
                <span>{appCount} App</span>
              </span>
            </a>
          </section>
          <div className="studio-strip">
            <span>
              <Smartphone size={15} /> ANDROID APPLICATIONS
            </span>
            <span className="strip-star" aria-hidden="true">
              ✳
            </span>
            <span>
              <Gamepad2 size={16} /> UNITY GAMES
            </span>
            <span className="strip-star" aria-hidden="true">
              ✳
            </span>
            <span>
              <AppWindow size={16} /> APPS & TOOLS
            </span>
          </div>
          <section className="work-section section-wrap" id="work">
            <div className="section-heading">
              <div>
                <span className="eyebrow">01 / THE WORK</span>
                <h2>
                  Karya, dari
                  <br />
                  <em>rasa ingin tahu.</em>
                </h2>
              </div>
              <p>
                Aplikasi yang memudahkan.
                <br />
                Dunia kecil yang mengundang petualangan.
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
                  { value: "unity", label: "Unity" },
                  { value: "android", label: "Android" },
                  { value: "app", label: "App" },
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
                <span className="demo-note">Pratinjau · proyek contoh</span>
              )}
            </div>
            <div className="project-grid">
              {visible.map((project, index) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  liquid={s.liquidEnabled}
                  index={index}
                />
              ))}
            </div>
            {visible.length === 0 && (
              <div className="empty-state">
                <Code2 size={28} />
                <h3>Karya baru sedang disiapkan.</h3>
                <p>Nantikan cerita berikutnya di sini.</p>
              </div>
            )}
          </section>
          <section className="about-section section-wrap" id="about">
            <AboutMascot />
            <div className="about-copy">
              <span className="eyebrow">02 / THE PERSON BEHIND THE PIXELS</span>
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
            <span className="eyebrow">03 / GOOD THINGS START WITH A HELLO</span>
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
                  {s.email}
                  <ArrowUpRight size={17} />
                </a>
              ) : (
                <p>Aplikasi, game, atau ide yang belum punya nama.</p>
              )}
              <div className="socials">
                {s.githubUrl && (
                  <a
                    href={s.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Github size={17} /> GitHub <ArrowUpRight size={13} />
                  </a>
                )}
                {s.linkedinUrl && (
                  <a
                    href={s.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Linkedin size={17} /> LinkedIn <ArrowUpRight size={13} />
                  </a>
                )}
                {s.email && (
                  <a href={`mailto:${s.email}`}>
                    <Mail size={17} /> Email
                  </a>
                )}
              </div>
            </div>
          </section>
        </main>
        <footer className="site-footer">
          <span>
            © {new Date().getFullYear()} {s.name} Portofolio
          </span>
          <span>CODE WITH PURPOSE. CREATE WITH CURIOSITY.</span>
          <a href="#top">
            Kembali ke atas <ArrowUpRight size={13} />
          </a>
        </footer>
      </div>
      <div className="outer-colophon">
        <span>INDEPENDENT DEVELOPER / {s.location.toUpperCase()}</span>
        <span>UNITY × ANDROID × APP</span>
      </div>
    </div>
  );
}
