import { redirect } from "next/navigation";
import { currentAdmin } from "@/lib/auth";
import { databaseConfigured } from "@/lib/db";
import LoginForm from "@/components/LoginForm";
export const dynamic = "force-dynamic";
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ updated?: string }>;
}) {
  if (await currentAdmin()) redirect("/admin");
  return (
    <LoginForm
      configured={databaseConfigured()}
      accountUpdated={(await searchParams).updated === "1"}
    />
  );
}
