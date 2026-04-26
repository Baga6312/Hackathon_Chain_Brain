import { Batch } from "@/data/mockData";
import { AlertTriangle, FlaskConical, ShieldAlert, ShieldCheck } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const toxColor = (t: Batch["toxicity"]) =>
  t === "low" ? "text-success border-success/40 bg-success/10"
    : t === "medium" ? "text-warning border-warning/40 bg-warning/10"
    : "text-destructive border-destructive/40 bg-destructive/10";

export const QualityPanel = ({ batches }: { batches: Batch[] }) => {
  const top = [...batches].sort((a, b) => b.qualityScore - a.qualityScore).slice(0, 5);

  // Avg composition for donut
  const avgProtein = batches.reduce((s, b) => s + b.protein, 0) / batches.length;
  const avgLipid = batches.reduce((s, b) => s + b.lipid, 0) / batches.length;
  const avgCarb = batches.reduce((s, b) => s + b.carbohydrate, 0) / batches.length;
  const other = Math.max(0, 100 - avgProtein - avgLipid - avgCarb);

  const compData = [
    { name: "Protein", value: +avgProtein.toFixed(1), color: "hsl(var(--primary))" },
    { name: "Carbs", value: +avgCarb.toFixed(1), color: "hsl(var(--accent))" },
    { name: "Lipids", value: +avgLipid.toFixed(1), color: "hsl(var(--warning))" },
    { name: "Other", value: +other.toFixed(1), color: "hsl(var(--muted))" },
  ];

  return (
    <div className="neon-card overflow-hidden">
      <div className="panel-header">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-foreground">
            <FlaskConical className="h-4 w-4 text-accent" />
            AI Quality Analysis
          </h3>
          <p className="text-xs text-muted-foreground">Composition · Toxicity · Contamination</p>
        </div>
        <span className="data-pill border-accent/40 bg-accent/10 text-accent">NEURAL v3.2</span>
      </div>

      <div className="grid gap-4 p-5 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Avg Macro-nutrient Profile
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={compData}
                  innerRadius={50}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="hsl(var(--background))"
                  strokeWidth={2}
                >
                  {compData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--accent) / 0.4)",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
            {compData.map((d) => (
              <div key={d.name} className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-sm" style={{ background: d.color }} />
                <span className="text-muted-foreground">{d.name}</span>
                <span className="ml-auto font-semibold text-foreground">{d.value}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Top Performing Batches
          </div>
          <div className="space-y-2">
            {top.map((b, i) => (
              <div key={b.id} className="rounded-lg border border-border bg-card-elevated/60 p-3 animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-primary">{b.id}</span>
                    <span className="text-xs text-muted-foreground">{b.algaeName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {b.contamination ? (
                      <span className="data-pill border-destructive/40 bg-destructive/10 text-destructive">
                        <AlertTriangle className="h-3 w-3" /> CONTAMINATED
                      </span>
                    ) : (
                      <span className="data-pill border-success/40 bg-success/10 text-success">
                        <ShieldCheck className="h-3 w-3" /> CLEAN
                      </span>
                    )}
                    <span className={`data-pill ${toxColor(b.toxicity)} uppercase`}>
                      <ShieldAlert className="h-3 w-3" />
                      TOX·{b.toxicity}
                    </span>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1">
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      <span>AI QUALITY SCORE</span>
                      <span className="font-bold text-foreground">{b.qualityScore}/100</span>
                    </div>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-gradient-primary transition-all duration-700"
                        style={{ width: `${b.qualityScore}%` }}
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-2 grid grid-cols-3 gap-2 text-[10px]">
                  <Mini label="Protein" value={`${b.protein}%`} />
                  <Mini label="Lipid" value={`${b.lipid}%`} />
                  <Mini label="Carb" value={`${b.carbohydrate}%`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const Mini = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded border border-border bg-background/50 px-2 py-1 text-center">
    <div className="uppercase tracking-wider text-muted-foreground">{label}</div>
    <div className="font-bold text-foreground">{value}</div>
  </div>
);
