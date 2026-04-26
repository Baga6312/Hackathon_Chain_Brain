import { Batch } from "@/data/mockData";
import {
  buildSupplyChain,
  stageMeta,
  StageStatus,
  SupplyEvent,
} from "@/data/supplyChain";
import {
  Check,
  ChevronDown,
  ChevronRight,
  CircleDashed,
  Clock,
  Link2,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

const statusStyles: Record<StageStatus, { ring: string; dot: string; label: string }> = {
  complete: {
    ring: "border-success/40 bg-success/10 text-success",
    dot: "bg-success",
    label: "Verified",
  },
  active: {
    ring: "border-primary/40 bg-primary/10 text-primary",
    dot: "bg-primary animate-pulse",
    label: "In progress",
  },
  pending: {
    ring: "border-border bg-muted text-muted-foreground",
    dot: "bg-muted-foreground/40",
    label: "Pending",
  },
  failed: {
    ring: "border-destructive/40 bg-destructive/10 text-destructive",
    dot: "bg-destructive",
    label: "Failed",
  },
};

const StageIcon = ({ status }: { status: StageStatus }) => {
  if (status === "complete") return <Check className="h-3.5 w-3.5" />;
  if (status === "failed") return <X className="h-3.5 w-3.5" />;
  if (status === "active") return <Clock className="h-3.5 w-3.5" />;
  return <CircleDashed className="h-3.5 w-3.5" />;
};

const fmtTs = (iso: string) =>
  new Date(iso).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const EventRow = ({ event, isLast }: { event: SupplyEvent; isLast: boolean }) => {
  const meta = stageMeta[event.stage];
  const s = statusStyles[event.status];

  return (
    <li className="relative flex gap-4 pb-5">
      {!isLast && (
        <span
          aria-hidden
          className={`absolute left-[15px] top-8 h-full w-px ${
            event.status === "pending" ? "bg-border" : "bg-primary/30"
          }`}
        />
      )}

      <div
        className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${s.ring}`}
      >
        <StageIcon status={event.status} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span className="text-sm font-semibold text-foreground">
            <span className="mr-1.5">{meta.icon}</span>
            {event.label}
          </span>
          <span className={`data-pill ${s.ring}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
            {s.label}
          </span>
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">{event.description}</p>

        {event.status !== "pending" && (
          <div className="mt-2 grid gap-1 rounded-md border border-border bg-muted/40 px-3 py-2 text-[11px] sm:grid-cols-2">
            <div>
              <span className="text-muted-foreground">Actor: </span>
              <span className="text-foreground">{event.actor}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Location: </span>
              <span className="text-foreground">{event.location}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Time: </span>
              <span className="text-foreground">{fmtTs(event.timestamp)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Block: </span>
              <span className="font-mono text-foreground">#{event.blockNumber}</span>
            </div>
            <div className="sm:col-span-2 flex items-center gap-1.5 truncate">
              <Link2 className="h-3 w-3 shrink-0 text-muted-foreground" />
              <span
                className="truncate font-mono text-[10px] text-foreground"
                title={event.txHash}
              >
                {event.txHash}
              </span>
            </div>
          </div>
        )}
      </div>
    </li>
  );
};

export const SupplyChainPanel = ({ batches }: { batches: Batch[] }) => {
  const [selectedId, setSelectedId] = useState<string>(batches[0]?.id ?? "");
  const [expanded, setExpanded] = useState(true);

  const selected = useMemo(
    () => batches.find((b) => b.id === selectedId) ?? batches[0],
    [batches, selectedId],
  );
  const events = useMemo(() => (selected ? buildSupplyChain(selected) : []), [selected]);

  if (!selected) return null;

  const completed = events.filter((e) => e.status === "complete").length;
  const total = events.length;
  const progress = Math.round((completed / total) * 100);

  return (
    <section className="neon-card overflow-hidden">
      <div className="panel-header flex-col items-start gap-3 sm:flex-row sm:items-center">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Link2 className="h-4 w-4 text-primary" />
            Blockchain · Smart Farm → Bins → QC Lab → Certified Distribution
          </h3>
          <p className="text-xs text-muted-foreground">
            Every quality control step is signed and anchored on-chain — from the smart farm to the certified buyer.
          </p>
        </div>

        <div className="flex flex-1 flex-wrap items-center justify-end gap-2">
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
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-1 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs text-foreground hover:border-primary/50"
            aria-expanded={expanded}
          >
            {expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            {expanded ? "Collapse" : "Expand"}
          </button>
        </div>
      </div>

      <div className="px-5 pt-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            <span className="font-mono font-semibold text-foreground">{selected.id}</span>
            {" · "}
            {selected.algaeName}
          </span>
          <span>
            {completed}/{total} steps completed · {progress}%
          </span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {expanded && (
        <ol className="px-5 py-5">
          {events.map((e, i) => (
            <EventRow key={e.stage} event={e} isLast={i === events.length - 1} />
          ))}
        </ol>
      )}
    </section>
  );
};
