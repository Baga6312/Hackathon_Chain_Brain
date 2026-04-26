import { Batch, BlockchainStatus, AlgaeType, algaeTypeMeta } from "@/data/mockData";
import { MapPin, Search, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { QrCodeCell } from "./QrCodeCell";
import { logVerification } from "@/lib/history";
import { toast } from "@/hooks/use-toast";

const statusBadge: Record<BlockchainStatus, string> = {
  Verified: "border-success/40 bg-success/10 text-success",
  Pending: "border-warning/40 bg-warning/10 text-warning",
  Rejected: "border-destructive/40 bg-destructive/10 text-destructive",
};

export const BatchTable = ({ batches }: { batches: Batch[] }) => {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<AlgaeType | "all">("all");

  const filtered = useMemo(() => {
    return batches.filter((b) => {
      if (filter !== "all" && b.algaeType !== filter) return false;
      if (!query) return true;
      const q = query.toLowerCase();
      return (
        b.id.toLowerCase().includes(q) ||
        b.algaeName.toLowerCase().includes(q) ||
        b.origin.toLowerCase().includes(q)
      );
    });
  }, [batches, query, filter]);

  return (
    <div className="neon-card overflow-hidden">
      <div className="panel-header flex-col gap-3 sm:flex-row">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-foreground">
            <MapPin className="h-4 w-4 text-primary" />
            Batch Tracking System
          </h3>
          <p className="text-xs text-muted-foreground">Origin · harvest · lab · chain · QR</p>
        </div>
        <div className="flex flex-1 items-center gap-2 sm:max-w-md">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search ID, species, coast…"
              className="w-full rounded-md border border-border bg-background/60 py-1.5 pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="flex gap-1">
            {(["all", "green", "red", "brown"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`rounded-md border px-2 py-1 text-[10px] font-semibold uppercase tracking-wider transition-all ${
                  filter === t
                    ? "border-primary bg-primary/20 text-primary"
                    : "border-border bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                {t === "all" ? "All" : algaeTypeMeta[t].label.split(" ")[0]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-sm">
          <thead>
            <tr className="border-b border-border/60 bg-card-elevated/40 text-[10px] uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-2 text-left">Batch</th>
              <th className="px-4 py-2 text-left">Type</th>
              <th className="px-4 py-2 text-left">Origin</th>
              <th className="px-4 py-2 text-left">Harvest</th>
              <th className="px-4 py-2 text-left">Quality</th>
              <th className="px-4 py-2 text-left">Lab Result</th>
              <th className="px-4 py-2 text-left">Chain</th>
              <th className="px-4 py-2 text-left">Verify</th>
              <th className="px-4 py-2 text-left">QR</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((b, i) => {
              const meta = algaeTypeMeta[b.algaeType];
              const labOk = !b.contamination && b.toxicity !== "high";
              return (
                <tr
                  key={b.id}
                  className="border-b border-border/40 transition-colors hover:bg-primary/5 animate-fade-in"
                  style={{ animationDelay: `${i * 30}ms` }}
                >
                  <td className="px-4 py-3 font-mono text-sm font-bold text-primary">{b.id}</td>
                  <td className="px-4 py-3">
                    <span
                      className="data-pill"
                      style={{
                        borderColor: meta.color,
                        background: meta.color.replace(")", " / 0.1)"),
                        color: meta.color,
                      }}
                    >
                      {meta.emoji} {meta.label.split(" ")[0]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-foreground">{b.origin}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{b.harvestDate}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-foreground">{b.qualityScore}</span>
                      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-gradient-primary"
                          style={{ width: `${b.qualityScore}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`data-pill ${
                        labOk
                          ? "border-success/40 bg-success/10 text-success"
                          : "border-destructive/40 bg-destructive/10 text-destructive"
                      }`}
                    >
                      {labOk ? "PASS" : "FAIL"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`data-pill ${statusBadge[b.blockchainStatus]}`}>
                      {b.blockchainStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={async () => {
                        await logVerification({
                          batchId: b.id,
                          batchLabel: b.algaeName,
                          action: "verify",
                          txHash: b.blockHash,
                          metadata: { qualityScore: b.qualityScore, status: b.blockchainStatus },
                        });
                        toast({
                          title: "Vérification enregistrée",
                          description: `${b.id} · ${b.blockchainStatus}`,
                        });
                      }}
                      className="inline-flex items-center gap-1 rounded-md border border-primary/40 bg-primary/5 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary transition-colors hover:bg-primary/10"
                    >
                      <ShieldCheck className="h-3 w-3" /> Verify
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <QrCodeCell batch={b} />
                  </td>
                </tr>
              );
            })}
            {!filtered.length && (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-sm text-muted-foreground">
                  No batches match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
