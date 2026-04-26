import { useEffect, useMemo, useRef, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Activity, Droplets, Radio, Thermometer, Waves } from "lucide-react";
import { Batch } from "@/data/mockData";

type Reading = { t: number; ph: number; salinity: number; temp: number };

const MAX_POINTS = 30;

// Deterministic seed per batch so each lot has its own baseline.
const seedFromId = (id: string) => {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = ((h * 31) ^ id.charCodeAt(i)) >>> 0;
  return h;
};

// Generate the next reading using a small bounded random walk around the batch's baseline.
const nextReading = (batch: Batch, prev: Reading | undefined, t: number): Reading => {
  const seed = seedFromId(batch.id);
  // pH baseline: green ~8.0, red ~7.7, brown ~7.9
  const phBase = batch.algaeType === "red" ? 7.7 : batch.algaeType === "brown" ? 7.9 : 8.0;
  const phJitter = ((seed % 7) - 3) * 0.02;
  const salinityBase = batch.salinity;
  const tempBase = batch.waterTemp;

  const drift = (current: number, base: number, range: number, step: number) => {
    const pull = (base - current) * 0.15;
    const noise = (Math.random() - 0.5) * step * 2;
    const next = current + pull + noise;
    return Math.max(base - range, Math.min(base + range, next));
  };

  return {
    t,
    ph: +drift(prev?.ph ?? phBase + phJitter, phBase + phJitter, 0.35, 0.06).toFixed(2),
    salinity: +drift(prev?.salinity ?? salinityBase, salinityBase, 0.8, 0.15).toFixed(1),
    temp: +drift(prev?.temp ?? tempBase, tempBase, 0.6, 0.1).toFixed(1),
  };
};

const seedHistory = (batch: Batch): Reading[] => {
  const out: Reading[] = [];
  let prev: Reading | undefined;
  const base = Date.now() - MAX_POINTS * 2000;
  for (let i = 0; i < MAX_POINTS; i++) {
    const r = nextReading(batch, prev, base + i * 2000);
    out.push(r);
    prev = r;
  }
  return out;
};

const fmtTime = (t: number) =>
  new Date(t).toLocaleTimeString("en-GB", { minute: "2-digit", second: "2-digit" });

interface SensorChartProps {
  data: Reading[];
  dataKey: keyof Omit<Reading, "t">;
  color: string;
  unit: string;
  domain: [number, number];
}

const SensorChart = ({ data, dataKey, color, unit, domain }: SensorChartProps) => (
  <div className="h-28 w-full">
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id={`grad-${String(dataKey)}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.35} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="t"
          tickFormatter={fmtTime}
          tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
          stroke="hsl(var(--border))"
          minTickGap={28}
        />
        <YAxis
          domain={domain}
          tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
          stroke="hsl(var(--border))"
          width={36}
        />
        <Tooltip
          contentStyle={{
            background: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: 8,
            fontSize: 11,
          }}
          labelFormatter={(t) => fmtTime(t as number)}
          formatter={(v: number) => [`${v} ${unit}`, ""]}
        />
        <Area
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={2}
          fill={`url(#grad-${String(dataKey)})`}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  unit: string;
  color: string;
  data: Reading[];
  dataKey: keyof Omit<Reading, "t">;
  domain: [number, number];
  range: string;
}

const MetricCard = ({ icon, label, value, unit, color, data, dataKey, domain, range }: MetricCardProps) => (
  <div className="rounded-lg border border-border bg-card-elevated/40 p-3">
    <div className="mb-2 flex items-center justify-between">
      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <span style={{ color }}>{icon}</span>
        {label}
      </div>
      <span className="text-[10px] text-muted-foreground">{range}</span>
    </div>
    <div className="mb-1 flex items-baseline gap-1">
      <span className="text-xl font-bold tabular-nums text-foreground">{value}</span>
      <span className="text-xs text-muted-foreground">{unit}</span>
    </div>
    <SensorChart data={data} dataKey={dataKey} color={color} unit={unit} domain={domain} />
  </div>
);

export const SmartFarmPanel = ({ batches }: { batches: Batch[] }) => {
  const [selectedId, setSelectedId] = useState<string>(batches[0]?.id ?? "");
  const selected = useMemo(
    () => batches.find((b) => b.id === selectedId) ?? batches[0],
    [batches, selectedId],
  );

  const [history, setHistory] = useState<Reading[]>(() =>
    selected ? seedHistory(selected) : [],
  );

  // Reset stream when batch changes
  const lastBatchId = useRef<string | undefined>(selected?.id);
  useEffect(() => {
    if (!selected) return;
    if (lastBatchId.current !== selected.id) {
      lastBatchId.current = selected.id;
      setHistory(seedHistory(selected));
    }
  }, [selected]);

  // Tick: append a new reading every 2s
  useEffect(() => {
    if (!selected) return;
    const interval = setInterval(() => {
      setHistory((prev) => {
        const next = nextReading(selected, prev[prev.length - 1], Date.now());
        const out = [...prev, next];
        if (out.length > MAX_POINTS) out.shift();
        return out;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [selected]);

  if (!selected) return null;

  const latest = history[history.length - 1];

  return (
    <section className="neon-card overflow-hidden">
      <div className="panel-header flex-col items-start gap-3 sm:flex-row sm:items-center">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Radio className="h-4 w-4 text-primary" />
            Smart Farm · IoT Sensors
          </h3>
          <p className="text-xs text-muted-foreground">
            Live pH, salinity & water temperature streamed from the basin (simulated · 2 s).
          </p>
        </div>

        <div className="flex flex-1 flex-wrap items-center justify-end gap-2">
          <span className="data-pill border-success/40 bg-success/10 text-success">
            <Activity className="h-3 w-3 animate-blink-dot" />
            Live
          </span>
          <select
            value={selected.id}
            onChange={(e) => setSelectedId(e.target.value)}
            aria-label="Select batch"
            className="rounded-md border border-input bg-background px-2.5 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            {batches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.id} · {b.algaeName}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-3 p-5 md:grid-cols-3">
        <MetricCard
          icon={<Droplets className="h-3.5 w-3.5" />}
          label="pH"
          value={latest ? latest.ph.toFixed(2) : "—"}
          unit=""
          color="hsl(var(--primary))"
          data={history}
          dataKey="ph"
          domain={[7.2, 8.6]}
          range="7.2 — 8.6"
        />
        <MetricCard
          icon={<Waves className="h-3.5 w-3.5" />}
          label="Salinity"
          value={latest ? latest.salinity.toFixed(1) : "—"}
          unit="‰"
          color="hsl(var(--algae-green))"
          data={history}
          dataKey="salinity"
          domain={[32, 40]}
          range="32 — 40 ‰"
        />
        <MetricCard
          icon={<Thermometer className="h-3.5 w-3.5" />}
          label="Water Temp"
          value={latest ? latest.temp.toFixed(1) : "—"}
          unit="°C"
          color="hsl(var(--algae-red))"
          data={history}
          dataKey="temp"
          domain={[18, 30]}
          range="18 — 30 °C"
        />
      </div>
    </section>
  );
};
