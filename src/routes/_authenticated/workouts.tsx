import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useUpsertDaily, useWorkoutActions, useWorkoutSets } from "@/lib/data";
import { todayKey } from "@/lib/dates";
import { CATEGORIES, EXERCISES, findExercise, oneRepMax, type Category, type Exercise } from "@/lib/exercises";
import { PageHero, Panel, PanelHead, inputCls } from "@/components/ui-kit";
import { VideoModal } from "@/components/VideoModal";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/workouts")({
  head: () => ({
    meta: [
      { title: "Workouts & exercise library — Cadence" },
      { name: "description", content: "Pick exercises by muscle group, watch proper form and log sets, reps and weight." },
      { property: "og:title", content: "Workouts & exercise library — Cadence" },
      { property: "og:description", content: "Pick exercises by muscle group, watch proper form and log sets, reps and weight." },
    ],
  }),
  component: Workouts,
});

const TABS = ["All", ...CATEGORIES] as const;

function Workouts() {
  const [date, setDate] = useState(todayKey());
  const { data: sets = [] } = useWorkoutSets(date);
  const { add, remove } = useWorkoutActions();
  const upsertDaily = useUpsertDaily(date);
  const [tab, setTab] = useState<(typeof TABS)[number]>("All");
  const [q, setQ] = useState("");
  const [video, setVideo] = useState<Exercise | null>(null);
  const [f, setF] = useState({ exercise: "", sets: "3", reps: "10", weight: "" });

  const list = EXERCISES.filter(
    (e) => (tab === "All" || e.category === tab) && (e.name + e.muscle).toLowerCase().includes(q.toLowerCase()),
  );
  const volume = sets.reduce((s, x) => s + x.sets * x.reps * Number(x.weight_kg), 0);
  const totalReps = sets.reduce((s, x) => s + x.sets * x.reps, 0);

  const nSets = Number(f.sets) || 0, nReps = Number(f.reps) || 0, kg = Number(f.weight) || 0;
  const orm = oneRepMax(kg, nReps);
  const next = nReps >= 12 ? kg + 2.5 : kg;

  const pick = (e: Exercise) => {
    setF({ ...f, exercise: e.name });
    document.getElementById("log-form")?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const submit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!f.exercise.trim()) return;
    add.mutate({ log_date: date, exercise: f.exercise.trim(), sets: nSets || 1, reps: nReps, weight_kg: kg });
    if (sets.length === 0) upsertDaily.mutate({ gym_done: true });
  };

  const current = findExercise(f.exercise);

  return (
    <main>
      <PageHero eyebrow="Training" title="Workouts">
        <p className="mx-auto mt-5 max-w-md text-[15px] text-muted-foreground">
          {sets.length} entries · {totalReps} reps · {Math.round(volume).toLocaleString()} kg volume
        </p>
        <input type="date" value={date} max={todayKey()} onChange={(e) => setDate(e.target.value)} className={`${inputCls} mt-6`} />
      </PageHero>

      <section className="mx-auto max-w-5xl space-y-6 px-5 pb-20 md:px-8">
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "shrink-0 rounded-full border px-4 py-1.5 text-[13px]",
                tab === t ? "border-transparent bg-primary font-semibold text-primary-foreground" : "border-line bg-panel text-muted-foreground hover:text-strong",
              )}
            >
              {t}
            </button>
          ))}
        </div>
        <input placeholder="Find an exercise…" value={q} onChange={(e) => setQ(e.target.value)} className={cn(inputCls, "w-full")} />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((e) => (
            <div key={e.slug} className={cn("rounded-2xl border bg-panel p-4", f.exercise === e.name ? "border-iris" : "border-line")}>
              <button onClick={() => setVideo(e)} className="group relative block aspect-video w-full overflow-hidden rounded-xl bg-ink">
                <img src={e.image ?? `https://i.ytimg.com/vi/${e.video}/hqdefault.jpg`} alt={e.name} loading="lazy" className="h-full w-full object-cover opacity-80 group-hover:opacity-100" />
                <span className="absolute inset-0 grid place-items-center">
                  <span className="grid size-12 place-items-center rounded-full bg-primary text-primary-foreground shadow-glow">▶</span>
                </span>
              </button>
              <p className="mt-3 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{e.category} · {e.muscle}</p>
              <h3 className="font-semibold text-strong">{e.name}</h3>
              <p className="text-[13px] text-cyan">{e.cue}</p>
              <div className="mt-3 flex gap-2">
                <button onClick={() => setVideo(e)} className="flex-1 rounded-lg border border-line bg-ink py-2 text-[12px] text-strong">Watch form</button>
                <button onClick={() => pick(e)} className="flex-1 rounded-lg bg-primary py-2 text-[12px] font-semibold text-primary-foreground">Select</button>
              </div>
            </div>
          ))}
          {list.length === 0 && (
            <p className="text-[13px] text-muted-foreground">
              No match. Type your own exercise name in the log below to add it.
            </p>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Panel>
            <div id="log-form" />
            <PanelHead title="Log exercise" sub={current ? `${current.category} · ${current.cue}` : "Select above or type a new one"} />
            <form onSubmit={submit} className="mt-4 grid grid-cols-3 gap-2">
              <input list="ex-list" placeholder="Exercise name" className={cn(inputCls, "col-span-3")} value={f.exercise} onChange={(e) => setF({ ...f, exercise: e.target.value })} />
              <datalist id="ex-list">{EXERCISES.map((e) => <option key={e.slug} value={e.name} />)}</datalist>
              <label className="text-[11px] text-muted-foreground">Sets<input className={cn(inputCls, "mt-1 w-full")} type="number" min={1} value={f.sets} onChange={(e) => setF({ ...f, sets: e.target.value })} /></label>
              <label className="text-[11px] text-muted-foreground">Reps<input className={cn(inputCls, "mt-1 w-full")} type="number" min={0} value={f.reps} onChange={(e) => setF({ ...f, reps: e.target.value })} /></label>
              <label className="text-[11px] text-muted-foreground">Weight kg<input className={cn(inputCls, "mt-1 w-full")} type="number" min={0} step="0.5" value={f.weight} onChange={(e) => setF({ ...f, weight: e.target.value })} /></label>
              <div className="col-span-3 grid grid-cols-3 gap-2 rounded-xl border border-line bg-ink p-3 text-center">
                <Stat label="Total reps" value={String(nSets * nReps)} />
                <Stat label="Volume" value={`${Math.round(nSets * nReps * kg)} kg`} />
                <Stat label="Est. 1-rep max" value={orm ? `${orm.toFixed(1)} kg` : "—"} />
              </div>
              {kg > 0 && (
                <p className="col-span-3 text-[12px] text-muted-foreground">
                  {nReps >= 12 ? `Strong set — try ${next} kg next time.` : `Next time: aim for ${Math.min(nReps + 1, 12)} reps at ${kg} kg, then add 2.5 kg once you hit 12.`}
                </p>
              )}
              <button disabled={add.isPending || !f.exercise.trim()} className="col-span-3 rounded-lg bg-primary py-2 text-[13px] font-semibold text-primary-foreground disabled:opacity-50">
                Log set
              </button>
            </form>
          </Panel>

          <Panel>
            <PanelHead title="Session" sub={date === todayKey() ? "Today" : date} />
            <div className="mt-4 space-y-2">
              {sets.length === 0 && <p className="text-[13px] text-muted-foreground">No sets logged for this day.</p>}
              {sets.map((s) => (
                <div key={s.id} className="group flex items-center gap-3 rounded-xl border border-line bg-ink px-4 py-3 text-[13px]">
                  <span className="flex-1 font-medium text-strong">{s.exercise}</span>
                  <span className="text-muted-foreground">{s.sets} × {s.reps}</span>
                  <span className="w-16 text-right text-cyan">{Number(s.weight_kg)} kg</span>
                  <button onClick={() => remove.mutate(s.id)} aria-label="Delete" className="text-muted-foreground hover:text-destructive">✕</button>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </section>
      <VideoModal ex={video} onClose={() => setVideo(null)} />
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="font-semibold text-strong">{value}</p>
    </div>
  );
}
