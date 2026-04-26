import { Batch } from "@/data/mockData";
import { Box, CheckCircle2, Droplets, Leaf, TrendingUp, XCircle } from "lucide-react";
import { ReactNode } from "react";

interface KPI {
  label: string;
  value: string;
  unit?: string;
  icon: ReactNode;
  accent: "cyan" | "green" | "purple" | "red";
  trend?: string;
}

const accentMap = {
  cyan: { text: "text-primary", bg: "bg-primary/10", border: "border-primary/40", glow: "text-glow-cyan" },
  green: { text: "text-success", bg: "bg-success/10", border: "border-success/40", glow: "text-glow-green" },
  purple: { text: "text-accent", bg: "bg-accent/10", border: "border-accent/40", glow: "text-glow-purple" },
  red: { text: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/40", glow: "" },
};

export const SummaryKPIs = ({ batches }: { batches: Batch[] }) => {
  const total = batches.length;
  const verified = batches.filter((b) => b.blockchainStatus === "Verified").length;
  const rejected = batches.filter((b) => b.blockchainStatus === "Rejected").length;
  const successPct = Math.round((verified / total) * 100);
  const avgQuality = Math.round(batches.reduce((s, b) => s + b.qualityScore, 0) / total);
  const totalCO2 = Math.round(batches.reduce((s, b) => s + b.co2Absorbed, 0));
  const totalO2 = Math.round(batches.reduce((s, b) => s + b.o2Produced, 0));
  const totalBiomass = Math.round(batches.reduce((s, b) => s + b.biomassKg, 0));

  const kpis: KPI[] = [
    { label: "Total Batches", value: String(total), icon: <Box className="h-5 w-5" />, accent: "cyan", trend: "tracked" },
    { label: "Success Rate", value: String(successPct), unit: "%", icon: <CheckCircle2 className="h-5 w-5" />, accent: "green", trend: `${verified}/${total} verified` },
    { label: "Avg Quality Score", value: String(avgQuality), unit: "/100", icon: <TrendingUp className="h-5 w-5" />, accent: "purple", trend: "AI-scored" },
    { label: "CO₂ Absorbed", value: totalCO2.toLocaleString(), unit: "kg", icon: <Leaf className="h-5 w-5" />, accent: "green", trend: "carbon captured" },
    { label: "O₂ Produced", value: totalO2.toLocaleString(), unit: "kg", icon: <Droplets className="h-5 w-5" />, accent: "cyan", trend: "into atmosphere" },
    { label: "Rejected Batches", value: String(rejected), icon: <XCircle className="h-5 w-5" />, accent: "red", trend: `${totalBiomass.toLocaleString()} kg biomass` },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
      {kpis.map((kpi, i) => {
        const a = accentMap[kpi.accent];
        return (
          <div
            key={kpi.label}
            className="neon-card group relative overflow-hidden p-4 animate-slide-up"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent ${a.bg} to-transparent`} />
            <div className="flex items-start justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {kpi.label}
              </span>
              <div className={`rounded-lg ${a.bg} ${a.text} p-1.5`}>{kpi.icon}</div>
            </div>
            <div className="mt-3 flex items-baseline gap-1">
              <span className={`text-3xl font-bold ${a.text} ${a.glow}`}>{kpi.value}</span>
              {kpi.unit && <span className="text-sm text-muted-foreground">{kpi.unit}</span>}
            </div>
            {kpi.trend && (
              <div className="mt-1 text-[11px] text-muted-foreground">{kpi.trend}</div>
            )}
          </div>
        );
      })}
    </div>
  );
};
