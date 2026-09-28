export type Project = {
  id: string;
  title: string;
  category: "android" | "unity";
  description: string;
  image: string;
  tags: string[];
  year: string;
  downloadUrl: string;
  githubUrl: string;
  playUrl: string;
  published: boolean;
  order: number;
  sample: boolean;
};
export type SiteSettings = {
  name: string;
  role: string;
  headline: string;
  headlineAccent: string;
  intro: string;
  aboutTitle: string;
  aboutText: string;
  location: string;
  email: string;
  githubUrl: string;
  linkedinUrl: string;
  heroImage: string;
  heroSecondaryImage: string;
  contactTitle: string;
  skills: string[];
  liquidEnabled: boolean;
};
export type PortfolioData = {
  settings: SiteSettings;
  projects: Project[];
  demo: boolean;
};
