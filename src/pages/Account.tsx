import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { ArrowLeft, CheckCircle2, KeyRound, Loader2, QrCode, ShieldCheck, User as UserIcon } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { passwordSchema } from "@/lib/validation";
import { toast } from "@/hooks/use-toast";

const profileSchema = z.object({
  display_name: z.string().trim().max(80, "Max 80 caractères").optional().or(z.literal("")),
  phone: z
    .string()
    .trim()
    .max(30, "Max 30 caractères")
    .regex(/^[+\d\s().-]*$/, "Numéro invalide")
    .optional()
    .or(z.literal("")),
  organization: z.string().trim().max(120, "Max 120 caractères").optional().or(z.literal("")),
});

interface Profile {
  display_name: string | null;
  phone: string | null;
  organization: string | null;
}

interface HistoryRow {
  id: string;
  batch_id: string;
  batch_label: string | null;
  action: "qr_view" | "verify";
  tx_hash: string | null;
  created_at: string;
}

const Account = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<Profile>({ display_name: "", phone: "", organization: "" });
  const [profileLoading, setProfileLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [changingPwd, setChangingPwd] = useState(false);

  const [history, setHistory] = useState<HistoryRow[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

useEffect(() => {
  if (!user) return;
  const token = localStorage.getItem("token");
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

  fetch(`${API_URL}/api/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then((r) => r.json())
    .then((data) => {
      if (data) setProfile({
        display_name: data.display_name ?? "",
        phone: data.phone ?? "",
        organization: data.organization ?? "",
      });
      setProfileLoading(false);
    });

  fetch(`${API_URL}/api/verification-history`, {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then((r) => r.json())
    .then((data) => {
      setHistory(data ?? []);
      setHistoryLoading(false);
    });
}, [user]);



const handleSaveProfile = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!user) return;
  const parsed = profileSchema.safeParse(profile);
  if (!parsed.success) {
    toast({ title: "Validation", description: parsed.error.issues[0].message, variant: "destructive" });
    return;
  }
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
  const token = localStorage.getItem("token");
  setSavingProfile(true);
  const res = await fetch(`${API_URL}/api/profile`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(parsed.data),
  });
  const data = await res.json();
  setSavingProfile(false);
  if (data.error) {
    toast({ title: "Erreur", description: "Impossible de sauvegarder le profil.", variant: "destructive" });
  } else {
    toast({ title: "Profil mis à jour" });
  }
};



const handleChangePassword = async (e: React.FormEvent) => {
  e.preventDefault();
  if (newPwd !== confirmPwd) {
    toast({ title: "Erreur", description: "Les mots de passe ne correspondent pas.", variant: "destructive" });
    return;
  }
  const parsed = passwordSchema.safeParse(newPwd);
  if (!parsed.success) {
    toast({ title: "Mot de passe faible", description: parsed.error.issues[0].message, variant: "destructive" });
    return;
  }
  setChangingPwd(true);
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/api/change-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ currentPassword: currentPwd, newPassword: newPwd }),
  });
  const data = await res.json();
  setChangingPwd(false);
  if (data.error) {
    toast({ title: "Erreur", description: data.error, variant: "destructive" });
  } else {
    setCurrentPwd(""); setNewPwd(""); setConfirmPwd("");
    toast({ title: "Mot de passe modifié" });
  }
};

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3.5">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="gap-1.5">
              <ArrowLeft className="h-4 w-4" /> Dashboard
            </Button>
          </div>
          <h1 className="text-base font-semibold tracking-tight">Mon compte</h1>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6">
        {/* Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <UserIcon className="h-5 w-5 text-primary" /> Profil
            </CardTitle>
            <CardDescription>Mettez à jour vos informations personnelles.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveProfile} className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={user?.email ?? ""} readOnly disabled className="bg-muted" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="display_name">Nom affiché</Label>
                <Input
                  id="display_name"
                  value={profile.display_name ?? ""}
                  onChange={(e) => setProfile((p) => ({ ...p, display_name: e.target.value }))}
                  placeholder="Votre nom"
                  maxLength={80}
                  disabled={profileLoading}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  value={profile.phone ?? ""}
                  onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                  placeholder="+216 …"
                  maxLength={30}
                  disabled={profileLoading}
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="organization">Organisation</Label>
                <Input
                  id="organization"
                  value={profile.organization ?? ""}
                  onChange={(e) => setProfile((p) => ({ ...p, organization: e.target.value }))}
                  placeholder="Laboratoire / Acheteur / Inspection"
                  maxLength={120}
                  disabled={profileLoading}
                />
              </div>
              <div className="sm:col-span-2">
                <Button type="submit" disabled={savingProfile || profileLoading}>
                  {savingProfile && <Loader2 className="h-4 w-4 animate-spin" />}
                  Enregistrer
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Password */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <KeyRound className="h-5 w-5 text-primary" /> Mot de passe
            </CardTitle>
            <CardDescription>
              Minimum 8 caractères, au moins une lettre et un chiffre.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangePassword} className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="current">Mot de passe actuel</Label>
                <Input
                  id="current"
                  type="password"
                  value={currentPwd}
                  onChange={(e) => setCurrentPwd(e.target.value)}
                  autoComplete="current-password"
                  required
                  maxLength={128}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="new">Nouveau mot de passe</Label>
                <Input
                  id="new"
                  type="password"
                  value={newPwd}
                  onChange={(e) => setNewPwd(e.target.value)}
                  autoComplete="new-password"
                  required
                  maxLength={128}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirm">Confirmer</Label>
                <Input
                  id="confirm"
                  type="password"
                  value={confirmPwd}
                  onChange={(e) => setConfirmPwd(e.target.value)}
                  autoComplete="new-password"
                  required
                  maxLength={128}
                />
              </div>
              <div className="sm:col-span-2">
                <Button type="submit" disabled={changingPwd}>
                  {changingPwd && <Loader2 className="h-4 w-4 animate-spin" />}
                  Changer le mot de passe
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ShieldCheck className="h-5 w-5 text-primary" /> Historique des vérifications
            </CardTitle>
            <CardDescription>
              Les 100 dernières actions effectuées sur les batches (consultation QR ou vérification blockchain).
            </CardDescription>
          </CardHeader>
          <CardContent>
            {historyLoading ? (
              <div className="flex items-center justify-center py-10 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            ) : history.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
                Aucune vérification enregistrée pour l'instant.
                <br />
                <Link to="/" className="text-primary hover:underline">
                  Aller au dashboard
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px] text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                      <th className="py-2 pr-3">Date</th>
                      <th className="py-2 pr-3">Batch</th>
                      <th className="py-2 pr-3">Action</th>
                      <th className="py-2">Tx</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((h) => (
                      <tr key={h.id} className="border-b border-border/60">
                        <td className="py-2.5 pr-3 font-mono text-xs text-muted-foreground">
                          {new Date(h.created_at).toLocaleString("fr-FR")}
                        </td>
                        <td className="py-2.5 pr-3">
                          <span className="font-mono text-xs font-semibold text-primary">{h.batch_id}</span>
                          {h.batch_label && (
                            <span className="ml-2 text-xs text-muted-foreground">{h.batch_label}</span>
                          )}
                        </td>
                        <td className="py-2.5 pr-3">
                          {h.action === "verify" ? (
                            <Badge className="gap-1 bg-success text-success-foreground hover:bg-success/90">
                              <CheckCircle2 className="h-3 w-3" /> Vérifié
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="gap-1">
                              <QrCode className="h-3 w-3" /> QR consulté
                            </Badge>
                          )}
                        </td>
                        <td className="py-2.5 font-mono text-[11px] text-muted-foreground">
                          {h.tx_hash ? `${h.tx_hash.slice(0, 10)}…` : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Account;
