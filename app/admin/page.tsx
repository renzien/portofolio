import { redirect } from "next/navigation";
import { currentAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { defaultSettings } from "@/lib/defaults";
import type { Project, SiteSettings } from "@/lib/types";
import AdminEditor from "@/components/AdminEditor";
export const dynamic = "force-dynamic";
export default async function AdminPage() {
  const admin = await currentAdmin();
  if (!admin) redirect("/admin/login");
  const database = await db();
  const [settings, projects] = await Promise.all([
    database
      .collection<SiteSettings & { key: string }>("settings")
      .findOne({ key: "site" }, { projection: { _id: 0, key: 0 } }),
    database
      .collection<Project>("projects")
      .find({}, { projection: { _id: 0 } })
      .sort({ order: 1 })
      .toArray(),
  ]);
  return (
    <AdminEditor
      initialSettings={{ ...defaultSettings, ...settings }}
      initialProjects={projects}
      email={admin.email}
    />
  );
}
