import { getPortfolio } from "@/lib/data";
import Portfolio from "@/components/Portfolio";
import { Suspense } from "react";
import StartupScreen from "@/components/StartupScreen";
export const dynamic = "force-dynamic";
export async function generateMetadata() {
  const { settings } = await getPortfolio();
  return { title: `${settings.name} Portofolio`, description: settings.intro };
}
async function PortfolioContent() {
  return <Portfolio data={await getPortfolio()} />;
}
export default function Home() {
  return (
    <StartupScreen>
      <Suspense
        fallback={
          <main className="system-page" tabIndex={-1}>
            <p role="status">Menyiapkan portofolio…</p>
          </main>
        }
      >
        <PortfolioContent />
      </Suspense>
    </StartupScreen>
  );
}
