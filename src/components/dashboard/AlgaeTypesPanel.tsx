import { AlgaeType, Batch, algaeTypeMeta } from "@/data/mockData";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";

const aggregate = (batches: Batch[], type: AlgaeType) => {
  const list = batches.filter((b) => b.algaeType === type);
  if (!list.length) return null;
  const avg = (k: keyof Batch) =>
    Math.round((list.reduce((s, b) => s + (b[k] as number), 0) / list.length) * 10) / 10;
  return {
    type,
    count: list.length,
    qualityScore: avg("qualityScore"),
    successRate: avg("successRate"),
    defectRate: avg("defectRate"),
    biomassKg: Math.round(list.reduce((s, b) => s + b.biomassKg, 0)),
    protein: avg("protein"),
  };
};

export const AlgaeTypesPanel = ({ batches }: { batches: Batch[] }) => {
  const types: AlgaeType[] = ["green", "red", "brown"];
  const data = types.map((t) => aggregate(batches, t)).filter(Boolean);

  const chartData = data.map((d) => ({
    name: algaeTypeMeta[d!.type].label.split(" ")[0],
    Quality: d!.qualityScore,
    Success: d!.successRate,
    Defect: d!.defectRate,
  }));

  return (
    <div className="neon-card overflow-hidden">
      <div className="panel-header">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
            🌱 Algae Types Overview
          </h3>
          <p className="text-xs text-muted-foreground">Aggregated per category</p>
        </div>
        <span className="data-pill border-primary/40 bg-primary/10 text-primary">
          {data.length} CATEGORIES
        </span>
      </div>

      <div className="grid gap-4 p-5 lg:grid-cols-3">
        {data.map((d, i) => {
          const meta = algaeTypeMeta[d!.type];
          return (
            <div
              key={d!.type}
              className="group relative overflow-hidden rounded-lg border border-border bg-card-elevated p-4 transition-all hover:border-primary/50 hover:-translate-y-1 animate-fade-in"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div
                className="absolute inset-x-0 top-0 h-1"
                style={{ background: meta.color }}
              />
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">
                    {meta.label}
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-2xl">{meta.emoji}</span>
                    <span className="text-2xl font-bold text-foreground">
                      {d!.count}
                    </span>
                    <span className="text-xs text-muted-foreground">batches</span>
                  </div>
                </div>
                <div
                  className="rounded-lg px-3 py-1.5 text-lg font-bold"
                  style={{ background: `${meta.color.replace(")", " / 0.15)")}`, color: meta.color }}
                >
                  {d!.qualityScore}
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <Row label="Success Rate" value={`${d!.successRate}%`} pct={d!.successRate} color={meta.color} />
                <Row label="Defect Rate" value={`${d!.defectRate}%`} pct={d!.defectRate} color="hsl(var(--destructive))" />
                <Row label="Biomass" value={`${d!.biomassKg.toLocaleString()} kg`} pct={Math.min(100, d!.biomassKg / 50)} color="hsl(var(--primary))" />
                <Row label="Protein" value={`${d!.protein}%`} pct={d!.protein} color="hsl(var(--accent))" />
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t border-border/60 p-5">
        <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Quality vs Success vs Defect (per type)
        </div>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barSize={18}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--primary) / 0.4)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="Quality" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Success" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Defect" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const Row = ({ label, value, pct, color }: { label: string; value: string; pct: number; color: string }) => (
  <div>
    <div className="flex items-center justify-between text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold text-foreground">{value}</span>
    </div>
    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${Math.min(100, Math.max(0, pct))}%`, background: color }}
      />
    </div>
  </div>
);
