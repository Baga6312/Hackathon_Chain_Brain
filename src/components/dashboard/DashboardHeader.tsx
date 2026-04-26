import { Leaf, LogOut, Radio, RefreshCw, UserCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface HeaderProps {
  onSimulate: () => void;
  isSimulating: boolean;
  lastUpdate: string;
}

export const DashboardHeader = ({ onSimulate, isSimulating, lastUpdate }: HeaderProps) => {
  const { user, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-3 px-5 py-3.5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary">
            <Leaf className="h-5 w-5 text-primary-foreground" strokeWidth={2.2} />
          </div>
          <div>
            <h1 className="text-base font-semibold tracking-tight text-foreground sm:text-lg">
              AlgaeTrace
              <span className="ml-1.5 text-xs font-normal text-muted-foreground">Quality Control · Tunisia</span>
            </h1>
            <p className="text-[11px] text-muted-foreground">
              Smart farm → bins → lab QC → certified distribution
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="data-pill border-success/40 bg-success/10 text-success">
            <span className="h-1.5 w-1.5 animate-blink-dot rounded-full bg-success" />
            Online
          </span>
          <span className="hidden data-pill border-border bg-muted text-muted-foreground sm:inline-flex">
            <Radio className="h-3 w-3" />
            Last sync · {lastUpdate}
          </span>
          {user?.email && (
            <Link
              to="/account"
              className="data-pill border-border bg-card text-foreground transition-colors hover:border-primary/40 hover:text-primary"
            >
              <UserCircle2 className="h-3.5 w-3.5 text-primary" />
              <span className="max-w-[140px] truncate">{user.email}</span>
            </Link>
          )}
          <button
            onClick={onSimulate}
            disabled={isSimulating}
            className="inline-flex items-center gap-1.5 rounded-md border border-primary bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isSimulating ? "animate-spin" : ""}`} />
            {isSimulating ? "Simulating…" : "Simulate"}
          </button>
          <button
            onClick={() => signOut()}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground transition-colors hover:border-destructive/40 hover:text-destructive"
            aria-label="Sign out"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
};
