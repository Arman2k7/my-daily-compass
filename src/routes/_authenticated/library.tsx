import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { EXERCISES, videoSearchUrl } from "@/lib/exercises";
import { PageHero, inputCls } from "@/components/ui-kit";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/library")({
  head: () => ({
    meta: [
      { title: "Exercise library — Cadence" },
      { name: "description", content: "Form cues and demo videos for standard gym movements." },
      { property: "og:title", content: "Exercise library — Cadence" },
      { property: "og:description", content: "Form cues and demo videos for standard gym movements." },
    ],
  }),
  component: Library,
});

function Library() {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const list = EXERCISES.filter((e) => (e.name + e.muscle).toLowerCase().includes(q.toLowerCase()));

  return (
    <main>
      <PageHero eyebrow="Form first" title="Exercise library">
        <input placeholder="Search movements or muscles" value={q} onChange={(e) => setQ(e.target.value)} className={cn(inputCls, "mt-8 w-full max-w-sm")} />
      </PageHero>
      <section className="mx-auto grid max-w-5xl grid-cols-1 gap-4 px-5 pb-20 sm:grid-cols-2 md:px-8 lg:grid-cols-3">
        {list.map((e) => (
          <div key={e.slug} className="overflow-hidden rounded-2xl border border-line bg-panel">
            {e.image ? (
              <img src={e.image} alt={e.name} loading="lazy" width={944} height={704} className="aspect-[4/3] w-full object-cover" />
            ) : (
              <div className="grid aspect-[4/3] place-items-center bg-ink">
                <div className="size-12 rounded-xl bg-brand opacity-80" />
              </div>
            )}
            <div className="p-5">
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{e.muscle}</p>
              <h3 className="mt-1 text-lg font-semibold text-strong">{e.name}</h3>
              <p className="text-[13px] text-cyan">{e.cue}</p>
              {open === e.slug && (
                <ol className="mt-3 list-decimal space-y-1 pl-4 text-[13px] text-muted-foreground">
                  {e.steps.map((s) => <li key={s}>{s}</li>)}
                </ol>
              )}
              <div className="mt-4 flex gap-2">
                <a href={videoSearchUrl(e.name)} target="_blank" rel="noreferrer" className="rounded-lg bg-primary px-3 py-2 text-[12px] font-semibold text-primary-foreground">
                  ▶ Watch form video
                </a>
                <button onClick={() => setOpen(open === e.slug ? null : e.slug)} className="rounded-lg border border-line bg-ink px-3 py-2 text-[12px] text-strong">
                  {open === e.slug ? "Hide cues" : "Form cues"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
