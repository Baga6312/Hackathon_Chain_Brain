import { useEffect, useMemo, useState } from "react";
import { Batch, initialBatches, simulateBatch } from "@/data/mockData";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { SummaryKPIs } from "@/components/dashboard/SummaryKPIs";
import { AlgaeTypesPanel } from "@/components/dashboard/AlgaeTypesPanel";
import { apiClient } from "@/integrations/supabase/client";
import { BlockchainPanel } from "@/components/dashboard/BlockchainPanel";
import { EnvironmentPanel } from "@/components/dashboard/EnvironmentPanel";
import { QualityPanel } from "@/components/dashboard/QualityPanel";
import { BatchTable } from "@/components/dashboard/BatchTable";
import { SupplyChainPanel } from "@/components/dashboard/SupplyChainPanel";
import { SmartFarmPanel } from "@/components/dashboard/SmartFarmPanel";
import { SortingBinsPanel } from "@/components/dashboard/SortingBinsPanel";

const fmtClock = (d: Date) =>
  d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

const Index = () => {
  const [batches, setBatches] = useState<Batch[]>(initialBatches);
  const [simulating, setSimulating] = useState(false);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
      apiClient.logBatches(batches);
    }, [batches]);

  const runSimulation = () => {
    if (simulating) return;
    setSimulating(true);
    // Small staged update for "AI recalculation" feel
    let step = 0;
    const interval = setInterval(() => {
      step++;
      setBatches((prev) => prev.map((b) => simulateBatch(b)));
      if (step >= 3) {
        clearInterval(interval);
        setSimulating(false);
      }
    }, 350);
  };

  const lastUpdate = useMemo(() => fmtClock(now), [now]);

  return (
    <div className="relative min-h-screen">
      <DashboardHeader onSimulate={runSimulation} isSimulating={simulating} lastUpdate={lastUpdate} />

      <main className="relative z-10 mx-auto max-w-[1600px] space-y-5 px-4 py-6 sm:px-6">
        {/* Hero KPIs */}
        <SummaryKPIs batches={batches} />

        {/* Smart Farm IoT live sensors */}
        <SmartFarmPanel batches={batches} />

        {/* Sorting bins by algae type */}
        <SortingBinsPanel batches={batches} />

        {/* Top row: Algae types + Quality */}
        <div className="grid gap-5 xl:grid-cols-2">
          <AlgaeTypesPanel batches={batches} />
          <QualityPanel batches={batches} />
        </div>

        {/* Mid row: Environment + Blockchain */}
        <div className="grid gap-5 xl:grid-cols-2">
          <EnvironmentPanel batches={batches} />
          <BlockchainPanel batches={batches} />
        </div>

        {/* Full supply chain — seeding to delivery */}
        <SupplyChainPanel batches={batches} />

        {/* Full-width tracking */}
        <BatchTable batches={batches} />

        <footer className="pt-4 text-center text-[11px] text-muted-foreground">
          AlgaeTrace · Quality Control Platform · Smart Farm → Bins → Lab → Certified Distribution
        </footer>
      </main>
    </div>
  );
};

export default Index;
