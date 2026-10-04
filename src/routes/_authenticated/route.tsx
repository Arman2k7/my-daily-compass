import { createFileRoute, Link, Outlet, redirect, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { FloatingCoach } from "@/components/FloatingCoach";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: AppShell,
});

const NAV = [
  { to: "/today", label: "Today" },
  { to: "/nutrition", label: "Nutrition" },
  { to: "/workouts", label: "Workouts" },
  { to: "/library", label: "Library" },
  { to: "/reports", label: "Reports" },
  { to: "/coach", label: "Coach" },
] as const;

function AppShell() {
  const { user } = Route.useRouteContext();
  const navigate = useNavigate();
  const initials = (user.email ?? "me").slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <header className="sticky top-0 z-30 flex items-center gap-6 border-b border-line/80 bg-ink/80 px-5 py-4 backdrop-blur-md md:px-8">
        <Link to="/today" className="flex items-center gap-2.5">
          <div className="size-7 rounded-lg bg-brand" />
          <span className="font-display text-[15px] font-bold tracking-tight text-strong">
            Cadence
          </span>
        </Link>
        <nav className="ml-4 hidden items-center gap-1 text-[13px] md:flex">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="rounded-md px-3 py-1.5 text-muted-foreground hover:text-strong"
              activeProps={{
                className: "rounded-md bg-strong/5 px-3 py-1.5 font-medium text-strong",
              }}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <div className="hidden items-center gap-2 rounded-full border border-line bg-panel px-3 py-1.5 text-[12px] text-muted-foreground sm:flex">
            <span className="size-1.5 rounded-full bg-mint" />
            Synced · Cloud
          </div>
          <button
            title="Sign out"
            onClick={async () => {
              await supabase.auth.signOut();
              navigate({ to: "/auth" });
            }}
            className="grid size-8 place-items-center rounded-full bg-brand text-[12px] font-semibold text-ink"
          >
            {initials}
          </button>
        </div>
      </header>
      <Outlet />
      <FloatingCoach />
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-6 border-t border-line bg-ink/95 backdrop-blur-md md:hidden">
        {NAV.map((n) => (
          <Link
            key={n.to}
            to={n.to}
            className="py-4 text-center text-[11px] text-muted-foreground"
            activeProps={{ className: "py-4 text-center text-[11px] font-medium text-cyan" }}
          >
            {n.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
