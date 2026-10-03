import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Panel({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("rounded-2xl border border-line bg-panel p-6", className)}>{children}</div>;
}

export function PanelHead({ title, sub, right }: { title: string; sub?: string; right?: ReactNode }) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <h2 className="text-lg font-semibold text-strong">{title}</h2>
        {sub && <p className="text-[13px] text-muted-foreground">{sub}</p>}
      </div>
      {right}
    </div>
  );
}

export function PageHero({ eyebrow, title, children }: { eyebrow: string; title: ReactNode; children?: ReactNode }) {
  return (
    <section className="px-5 pt-14 pb-10 md:px-8 md:pt-20 md:pb-14">
      <div className="mx-auto max-w-4xl text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-line bg-panel px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          {eyebrow}
        </span>
        <h1 className="mt-6 text-5xl font-bold leading-[0.95] tracking-tight text-gradient-heading md:text-6xl">{title}</h1>
        {children}
      </div>
    </section>
  );
}

export const inputCls =
  "rounded-lg border border-line bg-ink px-3 py-2 text-[13px] text-strong outline-none placeholder:text-muted-foreground focus:border-iris";
export const chipBtn =
  "rounded-lg border border-line bg-ink px-4 py-2 text-[13px] font-medium text-strong hover:bg-accent disabled:opacity-50";
