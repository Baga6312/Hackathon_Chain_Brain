import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Leaf, Loader2, Shield } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { signInSchema, signUpSchema } from "@/lib/validation";
import { toast } from "@/hooks/use-toast";

type Mode = "signin" | "signup";

// OWASP A04 — secure-by-design: only relative redirect targets are allowed.
const sanitizeRedirect = (raw: unknown): string => {
  if (typeof raw !== "string") return "/";
  if (!raw.startsWith("/") || raw.startsWith("//")) return "/";
  return raw;
};

const Auth = () => {
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = sanitizeRedirect((location.state as { from?: string })?.from);
  const { signIn, signUp } = useAuth();
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    const schema = mode === "signin" ? signInSchema : signUpSchema;
    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) {
      const fieldErrors: typeof errors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof typeof errors;
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setSubmitting(true);
    try {
      if (mode === "signin") {
        const { error } = await signIn(parsed.data.email, parsed.data.password);
          if (error) throw new Error(error);
        toast({ title: "Welcome back", description: "Signed in successfully." });
        navigate(redirectTo, { replace: true });
      } else {
        const { error } = await signUp(parsed.data.email, parsed.data.password);
          if (error) throw new Error(error);
        toast({
          title: "Account created",
          description: "You're signed in. Welcome to AlgaeTrace.",
        });
        navigate(redirectTo, { replace: true });
      }
    } catch (err) {
      // OWASP A09 — never log raw credentials; surface only the message.
      const message = err instanceof Error ? err.message : "Authentication failed";
      // Map common Supabase error to neutral wording (avoid user enumeration).
      const safeMessage = /invalid login credentials/i.test(message)
        ? "Invalid email or password."
        : message;
      toast({ title: "Authentication error", description: safeMessage, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-glow">
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-10">
        <Link to="/" className="mb-8 flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary">
            <Leaf className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <p className="text-sm font-semibold tracking-tight text-foreground">
              AlgaeTrace
              <span className="ml-1.5 text-xs font-normal text-muted-foreground">Tunisia</span>
            </p>
            <p className="text-[11px] text-muted-foreground">Verified algae traceability</p>
          </div>
        </Link>

        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            {mode === "signin" ? "Sign in" : "Create an account"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "signin"
              ? "Access your traceability dashboard."
              : "Start tracking batches across the supply chain."}
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
            <div>
              <label htmlFor="email" className="mb-1.5 block text-xs font-medium text-foreground">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                maxLength={254}
                required
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="you@lab.tn"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-destructive">{errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-xs font-medium text-foreground">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                maxLength={128}
                required
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder={mode === "signup" ? "8+ chars, letters & numbers" : "••••••••"}
              />
              {errors.password && (
                <p className="mt-1 text-xs text-destructive">{errors.password}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === "signin" ? "Sign in" : "Create account"}
            </button>
          </form>

          <div className="mt-5 flex items-center justify-between border-t border-border pt-4 text-xs">
            <span className="text-muted-foreground">
              {mode === "signin" ? "New here?" : "Already have an account?"}
            </span>
            <button
              type="button"
              onClick={() => {
                setErrors({});
                setMode(mode === "signin" ? "signup" : "signin");
              }}
              className="font-medium text-primary hover:underline"
            >
              {mode === "signin" ? "Create an account" : "Sign in instead"}
            </button>
          </div>
        </div>

        <p className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
          <Shield className="h-3 w-3" />
          Protected by leaked-password check & OWASP-aligned validation
        </p>
      </div>
    </div>
  );
};

export default Auth;
