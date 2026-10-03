import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useUpsertDaily, useWorkoutActions, useWorkoutSets } from "@/lib/data";
import { todayKey } from "@/lib/dates";
import { EXERCISES } from "@/lib/exercises";
import { PageHero, Panel, PanelHead, inputCls } from "@/components/ui-kit";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/workouts")({
  head: () => ({
    meta: [
      { title: "Workouts — Cadence" },
      { name: "description", content: "Log exercises, sets, reps and weight." },
      { property: "og:title", content: "Workouts — Cadence" },
      { property: "og:description", content: "Log exercises, sets, reps and weight." },
    ],
  }),
  component: Workouts,
});

function Workouts() {
  const [date, setDate] = useState(todayKey());
  const { data: sets = [] } = useWorkoutSets(date);
  const { add, remove } = useWorkoutActions();
  const upsertDaily = useUpsertDaily(date);
  const [f, setF] = useState({ exercise: EXERCISES[0].name, sets: "3", reps: "8", weight: "" });

  const volume = sets.reduce((s, x) => s + x.sets * x.reps * Number(x.weight_kg), 0);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!f.exercise.trim()) return;
    add.mutate({
      log_date: date,
      exercise: f.exercise.trim(),
      sets: Number(f.sets) || 1,
      reps: Number(f.reps) || 0,
      weight_kg: Number(f.weight) || 0,
    });
    if (sets.length === 0) upsertDaily.mutate({});
  };

  return (
    <main>
      <PageHero eyebrow="Training" title="Workout log">
        <p className="mx-auto mt-5 max-w-md text-[15px] text-muted-foreground">
          {sets.length} entries · {Math.round(volume).toLocaleString()} kg total volume
        </p>
        <input type="date" value={date} max={todayKey()} onChange={(e) => setDate(e.target.value)} className={`${inputCls} mt-6`} />
      </PageHero>

      <section className="mx-auto max-w-3xl space-y-6 px-5 pb-20 md:px-8">
        <Panel>
          <PanelHead title="Add exercise" sub="Pick from the library or type your own" />
          <form onSubmit={submit} className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-6">
            <input list="ex-list" className={cn(inputCls, "col-span-3")} value={f.exercise} onChange={(e) => setF({ ...f, exercise: e.target.value })} />
            <datalist id="ex-list">{EXERCISES.map((e) => <option key={e.slug} value={e.name} />)}</datalist>
            <input className={inputCls} type="number" min={1} placeholder="Sets" value={f.sets} onChange={(e) => setF({ ...f, sets: e.target.value })} />
            <input className={inputCls} type="number" min={0} placeholder="Reps" value={f.reps} onChange={(e) => setF({ ...f, reps: e.target.value })} />
            <input className={inputCls} type="number" min={0} step="0.5" placeholder="kg" value={f.weight} onChange={(e) => setF({ ...f, weight: e.target.value })} />
            <button disabled={add.isPending} className="col-span-3 rounded-lg bg-primary py-2 text-[13px] font-semibold text-primary-foreground sm:col-span-6">
              Log set
            </button>
          </form>
        </Panel>

        <Panel>
          <PanelHead title="Session" sub={date === todayKey() ? "Today" : date} />
          <div className="mt-4 space-y-2">
            {sets.length === 0 && <p className="text-[13px] text-muted-foreground">No sets logged for this day.</p>}
            {sets.map((s) => (
              <div key={s.id} className="group flex items-center gap-4 rounded-xl border border-line bg-ink px-4 py-3 text-[13px]">
                <span className="flex-1 font-medium text-strong">{s.exercise}</span>
                <span className="text-muted-foreground">{s.sets} × {s.reps}</span>
                <span className="w-16 text-right text-cyan">{Number(s.weight_kg)} kg</span>
                <button onClick={() => remove.mutate(s.id)} className="text-muted-foreground opacity-0 hover:text-destructive group-hover:opacity-100">✕</button>
              </div>
            ))}
          </div>
        </Panel>
      </section>
    </main>
  );
}
