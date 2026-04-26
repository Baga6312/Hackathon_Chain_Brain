import { Batch } from "@/data/mockData";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Droplets, Leaf, Thermometer, Waves } from "lucide-react";

export const EnvironmentPanel = ({ batches }: { batches: Batch[] }) => {
  const recent = batches.slice(0, 8);
  const chartData = recent.map((b) => ({
    name: b.id.replace("ALG-", ""),
    CO2: Math.round(b.co2Absorbed),
    O2: Math.round(b.o2Produced),
    Pollution: b.pollutionIndex,
    Temp: b.waterTemp,
  }));

  const avgTemp = (recent.reduce((s, b) => s + b.waterTemp, 0) / recent.length).toFixed(1);
  const avgSalinity = (recent.reduce((s, b) => s + b.salinity, 0) / recent.length).toFixed(1);
  const avgNitrate = (recent.reduce((s, b) => s + b.nitrate, 0) / recent.length).toFixed(0);
  const avgPollution = (recent.reduce((s, b) => s + b.pollutionIndex, 0) / recent.length).toFixed(0);

  return (
    <div className="neon-card overflow-hidden">
      <div className="panel-header">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-foreground">
            <Waves className="h-4 w-4 text-primary" />
            Environmental Telemetry
          </h3>
          <p className="text-xs text-muted-foreground">CO₂ / O₂ exchange & water quality</p>
        </div>
        <span className="data-pill border-primary/40 bg-primary/10 text-primary">LIVE FEED</span>
      </div>

      <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
        <Indicator icon={<Thermometer className="h-4 w-4" />} label="Water Temp" value={`${avgTemp}°C`} status={+avgTemp < 25 ? "good" : "warn"} />
        <Indicator icon={<Droplets className="h-4 w-4" />} label="Salinity" value={`${avgSalinity} ppt`} status={+avgSalinity < 38 ? "good" : "warn"} />
        <Indicator icon={<Leaf className="h-4 w-4" />} label="Nitrate" value={`${avgNitrate} mg/L`} status={+avgNitrate < 25 ? "good" : +avgNitrate < 40 ? "warn" : "bad"} />
        <Indicator icon={<Waves className="h-4 w-4" />} label="Pollution Idx" value={`${avgPollution}`} status={+avgPollution < 30 ? "good" : +avgPollution < 60 ? "warn" : "bad"} />
      </div>

      <div className="grid gap-4 px-5 pb-5 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-card-elevated/40 p-4">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            CO₂ Absorption vs O₂ Production (kg)
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--primary) / 0.4)",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
                <Bar dataKey="CO2" name="CO₂" fill="hsl(var(--success))" radius={[3, 3, 0, 0]} />
                <Bar dataKey="O2" name="O₂" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card-elevated/40 p-4">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Pollution & Temperature Trend
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--primary) / 0.4)",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
                <Line type="monotone" dataKey="Pollution" stroke="hsl(var(--destructive))" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="Temp" stroke="hsl(var(--accent))" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

const Indicator = ({
  icon, label, value, status,
}: { icon: React.ReactNode; label: string; value: string; status: "good" | "warn" | "bad" }) => {
  const map = {
    good: "border-success/40 bg-success/10 text-success",
    warn: "border-warning/40 bg-warning/10 text-warning",
    bad: "border-destructive/40 bg-destructive/10 text-destructive",
  };
  return (
    <div className={`flex items-center gap-3 rounded-lg border p-3 ${map[status]}`}>
      <div className="rounded-md bg-background/40 p-2">{icon}</div>
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-wider opacity-80">{label}</div>
        <div className="text-lg font-bold">{value}</div>
      </div>
      <span className={`ml-auto h-2 w-2 rounded-full bg-current ${status !== "good" ? "animate-blink-dot" : ""}`} />
    </div>
  );
};
