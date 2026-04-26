import { Batch, BlockchainStatus } from "@/data/mockData";
import { CheckCircle2, Clock, Hash, ShieldAlert, ShieldCheck, XCircle } from "lucide-react";

const statusMeta: Record<BlockchainStatus, { color: string; bg: string; border: string; icon: any; label: string }> = {
  Verified: { color: "text-success", bg: "bg-success/10", border: "border-success/40", icon: ShieldCheck, label: "VERIFIED" },
  Pending: { color: "text-warning", bg: "bg-warning/10", border: "border-warning/40", icon: Clock, label: "PENDING" },
  Rejected: { color: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/40", icon: ShieldAlert, label: "REJECTED" },
};

const shortHash = (h: string) => `${h.slice(0, 10)}…${h.slice(-8)}`;
const fmtTime = (iso: string) => new Date(iso).toLocaleString("en-GB", { hour12: false });

export const BlockchainPanel = ({ batches }: { batches: Batch[] }) => {
  const sorted = [...batches].sort((a, b) => b.blockNumber - a.blockNumber);

  return (
    <div className="neon-card overflow-hidden">
      <div className="panel-header">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-foreground">
            <Hash className="h-4 w-4 text-primary" />
            Laboratory Blockchain Ledger
          </h3>
          <p className="text-xs text-muted-foreground">Block explorer · Immutable lab signatures</p>
        </div>
        <div className="flex gap-2">
          <span className="data-pill border-success/40 bg-success/10 text-success">
            <CheckCircle2 className="h-3 w-3" />
            {batches.filter((b) => b.blockchainStatus === "Verified").length}
          </span>
          <span className="data-pill border-warning/40 bg-warning/10 text-warning">
            <Clock className="h-3 w-3" />
            {batches.filter((b) => b.blockchainStatus === "Pending").length}
          </span>
          <span className="data-pill border-destructive/40 bg-destructive/10 text-destructive">
            <XCircle className="h-3 w-3" />
            {batches.filter((b) => b.blockchainStatus === "Rejected").length}
          </span>
        </div>
      </div>

      <div className="max-h-[520px] space-y-2 overflow-y-auto p-4">
        {sorted.map((b, i) => {
          const s = statusMeta[b.blockchainStatus];
          const Icon = s.icon;
          const isLast = i === sorted.length - 1;
          return (
            <div key={b.id} className="relative animate-fade-in" style={{ animationDelay: `${i * 40}ms` }}>
              {/* Chain connector */}
              {!isLast && (
                <div className="absolute left-6 top-full h-2 w-px bg-gradient-to-b from-primary/60 to-transparent" />
              )}
              <div
                className={`group relative overflow-hidden rounded-lg border ${s.border} bg-card-elevated/60 p-3 transition-all hover:bg-card-elevated hover:border-primary/60`}
              >
                <div className="flex items-start gap-3">
                  {/* Block number column */}
                  <div className="flex flex-col items-center">
                    <div className={`flex h-12 w-12 flex-col items-center justify-center rounded-md border ${s.border} ${s.bg} ${s.color} font-mono`}>
                      <Icon className="h-3.5 w-3.5" />
                      <span className="text-[10px] font-bold leading-none">#{b.blockNumber.toString().slice(-4)}</span>
                    </div>
                  </div>

                  {/* Block content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold text-primary text-glow-cyan">
                          {b.id}
                        </span>
                        <span className="text-xs text-muted-foreground">·</span>
                        <span className="text-xs text-foreground">{b.algaeName}</span>
                      </div>
                      <span className={`data-pill ${s.border} ${s.bg} ${s.color}`}>
                        <span className={`h-1.5 w-1.5 rounded-full bg-current ${b.blockchainStatus === "Pending" ? "animate-blink-dot" : ""}`} />
                        {s.label}
                      </span>
                    </div>

                    <div className="mt-2 grid grid-cols-1 gap-x-4 gap-y-1 text-[11px] sm:grid-cols-2">
                      <Field label="HASH" value={shortHash(b.blockHash)} mono accent />
                      <Field label="SIGNED BY" value={b.labSignature} />
                      <Field label="TIMESTAMP" value={fmtTime(b.timestamp)} mono />
                      <Field label="ORIGIN" value={b.origin} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Field = ({ label, value, mono, accent }: { label: string; value: string; mono?: boolean; accent?: boolean }) => (
  <div className="flex items-center gap-1.5 truncate">
    <span className="text-muted-foreground">{label}</span>
    <span
      className={`truncate ${mono ? "font-mono" : ""} ${accent ? "text-primary" : "text-foreground"}`}
    >
      {value}
    </span>
  </div>
);
