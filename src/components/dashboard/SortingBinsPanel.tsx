import { useMemo } from "react";
import { Boxes, CheckCircle2, Clock, XCircle } from "lucide-react";
import { AlgaeType, algaeTypeMeta, Batch } from "@/data/mockData";

const binMeta: Record<AlgaeType, { binId: string; family: string; capacityKg: number }> = {
  green: { binId: "BIN-G", family: "Chlorophyta", capacityKg: 5000 },
  red: { binId: "BIN-R", family: "Rhodophyta", capacityKg: 4000 },
  brown: { binId: "BIN-B", family: "Phaeophyta", capacityKg: 6000 },
};

interface BinStats {
  type: AlgaeType;
  batches: Batch[];
  verified: number;
  pending: number;
  rejected: number;
  totalKg: number;
  fillPct: number;
}

const computeStats = (batches: Batch[]): BinStats[] => {
  return (Object.keys(binMeta) as AlgaeType[]).map((type) => {
    const list = batches.filter((b) => b.algaeType === type);
    const verified = list.filter((b) => b.blockchainStatus === "Verified").length;
    const pending = list.filter((b) => b.blockchainStatus === "Pending").length;
    const rejected = list.filter((b) => b.blockchainStatus === "Rejected").length;
    const totalKg = Math.round(list.reduce((sum, b) => sum + b.biomassKg, 0));
    const fillPct = Math.min(100, Math.round((totalKg / binMeta[type].capacityKg) * 100));
    return { type, batches: list, verified, pending, rejected, totalKg, fillPct };
  });
};

const BinCard = ({ stats }: { stats: BinStats }) => {
  const meta = algaeTypeMeta[stats.type];
  const bin = binMeta[stats.type];
  const total = stats.batches.length;

  return (
    <article className="rounded-xl border border-border bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <header className="mb-3 flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span
              aria-hidden
              className="flex h-9 w-9 items-center justify-center rounded-lg text-base"
              style={{ background: meta.color.replace(")", " / 0.12)"), color: meta.color }}
            >
              {meta.emoji}
            </span>
            <div>
              <h4 className="text-sm font-semibold text-foreground">{meta.label}</h4>
              <p className="text-[11px] text-muted-foreground">{bin.family}</p>
            </div>
          </div>
        </div>
        <span
          className="data-pill border-border bg-muted font-mono text-[10px] text-foreground"
          title="Bin identifier"
        >
          {bin.binId}
        </span>
      </header>

      {/* Status counts */}
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-md border border-success/30 bg-success/5 px-2 py-2 text-center">
          <CheckCircle2 className="mx-auto mb-0.5 h-3.5 w-3.5 text-success" />
          <div className="text-base font-bold tabular-nums text-success">{stats.verified}</div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Verified</div>
        </div>
        <div className="rounded-md border border-warning/30 bg-warning/5 px-2 py-2 text-center">
          <Clock className="mx-auto mb-0.5 h-3.5 w-3.5 text-warning" />
          <div className="text-base font-bold tabular-nums text-warning">{stats.pending}</div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Pending</div>
        </div>
        <div className="rounded-md border border-destructive/30 bg-destructive/5 px-2 py-2 text-center">
          <XCircle className="mx-auto mb-0.5 h-3.5 w-3.5 text-destructive" />
          <div className="text-base font-bold tabular-nums text-destructive">{stats.rejected}</div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Rejected</div>
        </div>
      </div>

      {/* Fill bar */}
      <div className="mt-3">
        <div className="mb-1 flex items-center justify-between text-[11px] text-muted-foreground">
          <span>
            {stats.totalKg.toLocaleString()} / {bin.capacityKg.toLocaleString()} kg
          </span>
          <span className="font-semibold text-foreground">{stats.fillPct}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${stats.fillPct}%`, background: meta.color }}
          />
        </div>
      </div>

      {/* Batch chips */}
      {total > 0 && (
        <div className="mt-3 border-t border-border pt-3">
          <p className="mb-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
            {total} lot{total > 1 ? "s" : ""} dans ce bin
          </p>
          <div className="flex flex-wrap gap-1">
            {stats.batches.slice(0, 8).map((b) => {
              const tone =
                b.blockchainStatus === "Verified"
                  ? "border-success/40 bg-success/10 text-success"
                  : b.blockchainStatus === "Pending"
                    ? "border-warning/40 bg-warning/10 text-warning"
                    : "border-destructive/40 bg-destructive/10 text-destructive";
              return (
                <span
                  key={b.id}
                  className={`data-pill ${tone} font-mono text-[10px]`}
                  title={`${b.algaeName} · ${b.blockchainStatus}`}
                >
                  {b.id}
                </span>
              );
            })}
            {total > 8 && (
              <span className="data-pill border-border bg-muted text-[10px] text-muted-foreground">
                +{total - 8}
              </span>
            )}
          </div>
        </div>
      )}
    </article>
  );
};

export const SortingBinsPanel = ({ batches }: { batches: Batch[] }) => {
  const stats = useMemo(() => computeStats(batches), [batches]);
  const totalPending = stats.reduce((s, b) => s + b.pending, 0);
  const totalVerified = stats.reduce((s, b) => s + b.verified, 0);

  return (
    <section className="neon-card overflow-hidden">
      <div className="panel-header flex-col items-start gap-2 sm:flex-row sm:items-center">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Boxes className="h-4 w-4 text-primary" />
            Sorting Bins · Tri par type d'algue
          </h3>
          <p className="text-xs text-muted-foreground">
            Chaque bin reçoit les lots triés à la sortie de la smart farm, avant le contrôle qualité.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="data-pill border-success/40 bg-success/10 text-success">
            <CheckCircle2 className="h-3 w-3" />
            {totalVerified} validés
          </span>
          <span className="data-pill border-warning/40 bg-warning/10 text-warning">
            <Clock className="h-3 w-3" />
            {totalPending} en attente
          </span>
        </div>
      </div>

      <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
        {stats.map((s) => (
          <BinCard key={s.type} stats={s} />
        ))}
      </div>
    </section>
  );
};
