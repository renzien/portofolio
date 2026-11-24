"use client";

import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import {
  AppWindow,
  Code2,
  Download,
  ExternalLink,
  Gamepad2,
  Layers3,
  Mail,
  Menu,
  Play,
  Smartphone,
  X,
} from "lucide-react";
import type { PortfolioData, Project, SiteSettings } from "@/lib/types";
import AboutMascot from "./AboutMascot";
import { Github, Linkedin } from "./BrandIcons";
import LiquidImage from "./LiquidImage";

type Category = Project["category"];
type Filter = "all" | Category;

const categories = ["unity", "android", "app"] as const;
const categoryDetails = {
  unity: {
    label: "Unity",
    badge: "Unity Game",
    description: "Game dan eksperimen interaktif yang kubuat dengan Unity.",
    icon: Gamepad2,
  },
  android: {
    label: "Android",
    badge: "Android App",
    description: "Aplikasi yang dirancang untuk perangkat Android.",
    icon: Smartphone,
  },
  app: {
    label: "App",
    badge: "App",
    description: "Aplikasi web, desktop, dan alat digital lainnya.",
    icon: AppWindow,
  },
};
const navigation = [
  { href: "#top", label: "Beranda" },
  { href: "#about", label: "Tentang" },
  { href: "#work", label: "Karya" },
  { href: "#contact", label: "Kontak" },
];

function CategoryArt({ category }: { category: Category }) {
  const Icon = categoryDetails[category].icon;
  return (
    <div
      className="sky-category-art"
      data-category={category}
      aria-hidden="true"
    >
      <div className="sky-glyph">
        <Icon size={43} strokeWidth={1.65} />
      </div>
      <i className="sky-art-dot" />
      <i className="sky-art-spark" />
    </div>
  );
}

function Artwork({
  project,
  liquid,
  lazy,
}: {
  project: Project;
  liquid: boolean;
  lazy?: boolean;
}) {
  return project.image ? (
    <LiquidImage
      src={project.image}
      enabled={liquid}
      loading={lazy ? "lazy" : undefined}
    />
  ) : (
    <CategoryArt category={project.category} />
  );
}

function Mosaic({
  projects,
  settings,
  onProjectClick,
}: {
  projects: Project[];
  settings: SiteSettings;
  onProjectClick: () => void;
}) {
  const tiles = [
    { area: "lead", project: projects[0], category: "unity" },
    { area: "shapes", image: "/images/pastel-objects.webp" },
    { area: "texture", image: settings.heroImage || "/images/liquid.webp" },
    { area: "second", project: projects[1], category: "android" },
    { area: "third", project: projects[2], category: "app" },
    { area: "fourth", project: projects[3], category: "android" },
    {
      area: "landscape",
      image: settings.heroSecondaryImage || "/images/valley.webp",
    },
    { area: "fifth", project: projects[4], category: "unity" },
  ] as const;

  return (
    <div className="sky-mosaic" role="group" aria-label="Cuplikan karya">
      {tiles.map((tile) => {
        const className = `sky-tile sky-tile-${tile.area}`;
        if ("image" in tile) {
          return (
            <div className={className} key={tile.area} aria-hidden="true">
              <LiquidImage src={tile.image} enabled={settings.liquidEnabled} />
            </div>
          );
        }
        if (!tile.project) {
          return (
            <div className={className} key={tile.area} aria-hidden="true">
              <CategoryArt category={tile.category} />
            </div>
          );
        }

        return (
          <a
            className={className}
            key={tile.area}
            href={`#project-${tile.project.id}`}
            aria-label={`Lihat karya ${tile.project.title}`}
            onClick={onProjectClick}
          >
            <Artwork project={tile.project} liquid={settings.liquidEnabled} />
            <span className="sky-tile-caption">
              {tile.area === "lead" && (
                <small>{categoryDetails[tile.project.category].badge}</small>
              )}
              <strong>{tile.project.title}</strong>
            </span>
          </a>
        );
      })}
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
  const category = categoryDetails[project.category];
  const download = {
    label: project.category === "unity" ? "Download game" : "Download aplikasi",
    url: project.downloadUrl,
    icon: Download,
  };
  const repository = {
    label: "Repositori GitHub",
    url: project.githubUrl,
    icon: Github,
  };
  const actions =
    project.category === "unity"
      ? [{ label: "Mainkan game", url: project.playUrl, icon: Play }, download]
      : [download, repository];

  if (project.category === "app" && project.playUrl) {
    actions.push({
      label: "Buka aplikasi",
      url: project.playUrl,
      icon: ExternalLink,
    });
  }

  return (
    <article
      className={`project-card ${project.category}`}
      id={`project-${project.id}`}
      tabIndex={-1}
      data-reveal
    >
      <div className="sky-project-visual">
        <Artwork project={project} liquid={liquid} lazy />
        {project.sample && <span className="sky-sample-label">Contoh</span>}
      </div>
      <div className="sky-project-copy">
        <div className="sky-project-meta">
          <span className="sky-project-badge">
            <category.icon size={15} aria-hidden="true" />
            {category.badge}
          </span>
          {project.year && <span>{project.year}</span>}
        </div>
        <h3>{project.title}</h3>
        {project.description && <p>{project.description}</p>}
        {project.tags.length > 0 && (
          <ul className="sky-project-tags" aria-label="Teknologi proyek">
            {project.tags.map((tag) => (
              <li key={tag}>{tag}</li>
            ))}
          </ul>
        )}
        <div className="sky-project-actions">
          {actions.map(({ label, url, icon: Icon }) =>
            url ? (
              <a
                className="sky-action"
                key={label}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${label}: ${project.title}`}
                title={label}
              >
                <Icon size={19} aria-hidden="true" />
              </a>
            ) : (
              <span
                className="sky-action"
                key={label}
                aria-disabled="true"
                title={`${label} belum tersedia`}
              >
                <Icon size={19} aria-hidden="true" />
                <span className="sr-only">{label} belum tersedia</span>
              </span>
            ),
          )}
        </div>
      </div>
    </article>
  );
}

function Contact({ settings }: { settings: SiteSettings }) {
  const { email, githubUrl, linkedinUrl, contactTitle } = settings;
  const channels = [
    {
      label: "Email",
      detail: email,
      href: email ? `mailto:${email}` : "",
      icon: Mail,
      external: false,
    },
    { label: "GitHub", href: githubUrl, icon: Github, external: true },
    { label: "LinkedIn", href: linkedinUrl, icon: Linkedin, external: true },
  ].filter((channel) => channel.href);

  return (
    <section
      className="sky-section sky-contact-section"
      id="contact"
      tabIndex={-1}
      aria-labelledby="contact-title"
    >
      <div className="sky-contact" data-reveal>
        <div>
          <p className="sky-kicker">Kontak</p>
          <h2 className="sky-lines" id="contact-title">
            {contactTitle}
          </h2>
        </div>
        <div className="sky-channels">
          {channels.length ? (
            channels.map(({ label, detail, href, icon: Icon, external }) => (
              <a
                className="sky-channel"
                key={label}
                href={href}
                target={external ? "_blank" : undefined}
                rel={external ? "noopener noreferrer" : undefined}
              >
                <span className="sky-channel-icon">
                  <Icon size={19} aria-hidden="true" />
                </span>
                <span>
                  <strong>{label}</strong>
                  {detail && <small>{detail}</small>}
                </span>
              </a>
            ))
          ) : (
            <p>Informasi kontak belum tersedia.</p>
          )}
        </div>
      </div>
    </section>
  );
}

export default function Portfolio({ data }: { data: PortfolioData }) {
  const { settings: s, projects, demo } = data;
  const root = useRef<HTMLDivElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [menu, setMenu] = useState(false);
  const counts = { all: projects.length, unity: 0, android: 0, app: 0 };
  for (const project of projects) counts[project.category] += 1;
  const visible =
    filter === "all"
      ? projects
      : projects.filter((project) => project.category === filter);
  const initials = s.name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toLowerCase();
  const technologies = s.skills.filter(Boolean);
  const stats = [
    {
      value: counts.all,
      label: demo ? "Proyek contoh" : "Karya publik",
      icon: Layers3,
    },
    { value: counts.unity, label: "Game Unity", icon: Gamepad2 },
    { value: counts.android + counts.app, label: "Aplikasi", icon: AppWindow },
  ];

  useEffect(() => {
    if (
      !root.current ||
      !("IntersectionObserver" in window) ||
      matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.setAttribute("data-revealed", "");
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.15 },
    );
    root.current
      .querySelectorAll("[data-reveal]:not([data-revealed])")
      .forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [filter]);

  function resetFilter() {
    // Make an out-of-filter card available before the browser follows its anchor.
    if (filter !== "all") flushSync(() => setFilter("all"));
  }

  return (
    <div className="sky-page" id="top" ref={root}>
      <a className="skip-link" href="#main">
        Lewati ke konten
      </a>
      <div className="sky-frame">
        <header
          className="sky-header"
          onKeyDown={(event) => {
            if (event.key === "Escape" && menu) {
              setMenu(false);
              menuButton.current?.focus();
            }
          }}
        >
          <a className="sky-brand" href="#top" aria-label={`Beranda ${s.name}`}>
            <span className="sky-mark" aria-hidden="true">
              {initials}
            </span>
            <span>{s.name}</span>
          </a>
          <nav
            className="sky-nav"
            id="main-navigation"
            aria-label="Navigasi utama"
            data-open={menu}
          >
            {navigation.map(({ href, label }) => (
              <a key={href} href={href} onClick={() => setMenu(false)}>
                {label}
              </a>
            ))}
          </nav>
          <a className="sky-button sky-header-contact" href="#contact">
            Hubungi saya
          </a>
          <button
            className="sky-menu"
            type="button"
            ref={menuButton}
            aria-label={menu ? "Tutup menu" : "Buka menu"}
            aria-expanded={menu}
            aria-controls="main-navigation"
            onClick={() => setMenu(!menu)}
          >
            {menu ? <X size={23} /> : <Menu size={23} />}
          </button>
        </header>

        <main id="main" tabIndex={-1}>
          <section className="hero sky-hero" aria-labelledby="hero-title">
            <div className="sky-hero-copy">
              <p className="sky-kicker">{s.role}</p>
              <h1 id="hero-title">
                {s.headline}
                <span>{s.headlineAccent}</span>
              </h1>
              {s.intro && <p className="sky-intro">{s.intro}</p>}
              <a className="sky-button" href="#work" onClick={resetFilter}>
                Lihat karya
              </a>
            </div>
            <Mosaic
              projects={projects}
              settings={s}
              onProjectClick={resetFilter}
            />
          </section>

          {technologies.length > 0 && (
            <section className="sky-technologies" aria-labelledby="tech-title">
              <h2 id="tech-title">Teknologi</h2>
              <ul>
                {technologies.map((skill) => (
                  <li key={skill}>{skill}</li>
                ))}
              </ul>
            </section>
          )}

          <section
            className="sky-section sky-about"
            id="about"
            tabIndex={-1}
            aria-labelledby="about-title"
          >
            <p className="sky-kicker">Tentang saya</p>
            <div className="sky-about-story">
              <div className="sky-about-heading">
                <h2 className="sky-lines" id="about-title">
                  {s.aboutTitle}
                </h2>
                <div className="sky-mascot" data-reveal>
                  <AboutMascot />
                </div>
              </div>
              <div className="sky-bio">
                {s.aboutText
                  .split(/\n\s*\n/)
                  .filter(Boolean)
                  .map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
              </div>
            </div>
            <ul className="sky-stats" aria-label="Jumlah karya" data-reveal>
              {stats.map(({ value, label, icon: Icon }) => (
                <li className="sky-stat" key={label}>
                  <span className="sky-stat-icon">
                    <Icon size={25} strokeWidth={1.8} aria-hidden="true" />
                  </span>
                  <div>
                    <strong>{value}</strong>
                    <span>{label}</span>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section
            className="sky-section sky-categories"
            aria-labelledby="categories-title"
          >
            <h2 id="categories-title">Bidang pengembangan</h2>
            <div className="sky-category-grid">
              {categories.map((category) => (
                <a
                  className="sky-category"
                  href="#work"
                  key={category}
                  data-reveal
                  onClick={() => setFilter(category)}
                >
                  <CategoryArt category={category} />
                  <div className="sky-category-copy">
                    <h3>{categoryDetails[category].label}</h3>
                    <p>{categoryDetails[category].description}</p>
                    <span className="sky-category-cta">Lihat karya</span>
                  </div>
                </a>
              ))}
            </div>
          </section>

          <section
            className="sky-section sky-work"
            id="work"
            tabIndex={-1}
            aria-labelledby="work-title"
          >
            <div className="sky-work-header">
              <div>
                <h2 id="work-title">Karya pilihan</h2>
                {demo && (
                  <p className="sky-demo-note">
                    Pratinjau dengan proyek contoh
                  </p>
                )}
              </div>
              <div
                className="sky-filter"
                role="group"
                aria-label="Filter proyek"
              >
                {(["all", ...categories] as const).map((category) => (
                  <button
                    type="button"
                    key={category}
                    aria-pressed={filter === category}
                    onClick={() => setFilter(category)}
                  >
                    {category === "all"
                      ? "Semua"
                      : categoryDetails[category].label}
                    <span>{counts[category]}</span>
                  </button>
                ))}
              </div>
            </div>
            <p className="sr-only" role="status">
              {visible.length} karya ditampilkan
            </p>
            {visible.length ? (
              <div className="sky-work-grid">
                {visible.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    liquid={s.liquidEnabled}
                  />
                ))}
              </div>
            ) : (
              <div className="sky-empty">
                <Code2 size={31} aria-hidden="true" />
                <h3>
                  {filter === "all"
                    ? "Karya baru sedang disiapkan."
                    : `Belum ada karya ${categoryDetails[filter].label}.`}
                </h3>
                {filter !== "all" && (
                  <button type="button" onClick={() => setFilter("all")}>
                    Lihat semua karya
                  </button>
                )}
              </div>
            )}
          </section>

          <Contact settings={s} />
        </main>

        <footer className="sky-footer">
          <span>
            © {new Date().getFullYear()} {s.name}
          </span>
          <nav aria-label="Navigasi footer">
            {navigation.map(({ href, label }) => (
              <a href={href} key={href}>
                {label}
              </a>
            ))}
          </nav>
        </footer>
      </div>
    </div>
  );
}
