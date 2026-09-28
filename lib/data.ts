import { cache } from "react";
import { db, databaseConfigured } from "./db";
import { defaultSettings, sampleProjects } from "./defaults";
import type { PortfolioData, Project, SiteSettings } from "./types";
export const getPortfolio = cache(async (): Promise<PortfolioData> => {
  if (!databaseConfigured())
    return { settings: defaultSettings, projects: sampleProjects, demo: true };
  const database = await db();
  const [settings, projects] = await Promise.all([
    database
      .collection<SiteSettings & { key: string }>("settings")
      .findOne({ key: "site" }, { projection: { _id: 0, key: 0 } }),
    database
      .collection<Project>("projects")
      .find({ published: true }, { projection: { _id: 0 } })
      .sort({ order: 1 })
      .toArray(),
  ]);
  return {
    settings: { ...defaultSettings, ...settings },
    projects,
    demo: false,
  };
});
