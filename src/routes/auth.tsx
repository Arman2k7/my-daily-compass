import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Cadence" },
      { name: "description", content: "Sign in to your private Cadence tracker." },
      { property: "og:title", content: "Sign in — Cadence" },
      { property: "og:description", content: "Sign in to your private Cadence tracker." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/today" });
    });
    const { data } = supabase.auth.onAuthStateChange((_e, s) => {
      if (s) navigate({ to: "/today" });
    });
    return () => data.subscription.unsubscribe();
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "in") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin + "/today" },
        });
        if (error) throw error;
        if (!data.session) toast.success("Check your inbox to confirm your email.");
      }
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    const res = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/auth" });
    if (res.error) toast.error(String(res.error.message ?? res.error));
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="size-10 rounded-xl bg-brand" />
          <h1 className="mt-6 text-5xl font-bold tracking-tight text-gradient-heading">Cadence</h1>
          <p className="mt-3 text-sm text-muted-foreground">Your private log for routine, body and growth.</p>
        </div>
        <div className="rounded-2xl border border-line bg-panel p-6">
          <button
            onClick={google}
            className="w-full rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-glow"
          >
            Continue with Google
          </button>
          <div className="my-5 flex items-center gap-3 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            <span className="h-px flex-1 bg-line" />or<span className="h-px flex-1 bg-line" />
          </div>
          <form onSubmit={submit} className="space-y-3">
            <input
              type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-line bg-ink px-4 py-2.5 text-sm text-strong outline-none focus:border-iris"
            />
            <input
              type="password" required minLength={6} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-line bg-ink px-4 py-2.5 text-sm text-strong outline-none focus:border-iris"
            />
            <button disabled={busy} className="w-full rounded-lg border border-line bg-ink px-4 py-2.5 text-sm font-medium text-strong hover:bg-accent disabled:opacity-50">
              {mode === "in" ? "Sign in" : "Create account"}
            </button>
          </form>
          <button onClick={() => setMode(mode === "in" ? "up" : "in")} className="mt-4 w-full text-center text-xs text-muted-foreground hover:text-strong">
            {mode === "in" ? "First time? Create your account" : "Have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}
