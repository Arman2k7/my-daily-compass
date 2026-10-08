import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { format, getISOWeek } from "date-fns";
import { useDailyLog, useRoutine, useRoutineActions, useUpsertDaily } from "@/lib/data";
import { todayKey } from "@/lib/dates";
import { EXERCISES, type Exercise } from "@/lib/exercises";
import { VideoModal } from "@/components/VideoModal";
import { WaterCard, useWater } from "@/components/WaterCard";
import { MealLog } from "@/components/MealLog";
import { PageHero, Panel, PanelHead, inputCls } from "@/components/ui-kit";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/today")({
  head: () => ({
    meta: [
      { title: "Today — Cadence" },
      { name: "description", content: "Log hours, routine, water and meals for today." },
      { property: "og:title", content: "Today — Cadence" },
      { property: "og:description", content: "Log hours, routine, water and meals for today." },
    ],
  }),
  component: Today,
});

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

function Today() {
  const date = todayKey();
  const name = "Arman";
  const { data: routine = [] } = useRoutine(date);
  const { ml, goal, add } = useWater(date);
  const left = routine.filter((r) => !r.done).length;
  const pct = Math.round((ml / goal) * 100);
  const [video, setVideo] = useState<Exercise | null>(null);

  return (
    <main>
      <PageHero eyebrow={`${format(new Date(), "EEEE")} · Week ${getISOWeek(new Date())}`} title={<>{greeting()},<br />{name}.</>}>
        <p className="mx-auto mt-5 max-w-md text-[15px] leading-relaxed text-muted-foreground">
          {routine.length ? `${left === 0 ? "Every skill done" : `${left} skill${left > 1 ? "s" : ""} left`} today. ` : ""}
          Water is {pct}% in.
        </p>
        <button onClick={() => add(250)} className="mt-8 rounded-full bg-primary px-6 py-3 text-[14px] font-semibold text-primary-foreground shadow-glow">
          Log a glass of water
        </button>
      </PageHero>

      <section className="mx-auto max-w-5xl px-5 md:px-8">
        <WaterCard date={date} />
      </section>

      <section className="mx-auto mt-6 grid max-w-5xl grid-cols-1 gap-6 px-5 md:grid-cols-2 md:px-8">
        <TimeBlocks date={date} />
        <Routine date={date} />
      </section>

      <section className="mx-auto mt-6 grid max-w-5xl grid-cols-1 gap-6 px-5 pb-20 md:grid-cols-2 md:px-8">
        <MealLog date={date} compact />
        <Panel>
          <PanelHead title="Exercise library" sub="Form checks before you load the bar" right={<Link to="/workouts" className="text-[13px] text-cyan">All</Link>} />
          <div className="mt-4 grid gap-3">
            {EXERCISES.slice(0, 2).map((e) => (
              <button key={e.slug} onClick={() => setVideo(e)} className="flex items-center gap-4 rounded-xl border border-line bg-ink p-3 text-left hover:border-iris/50">
                <img src={e.image} alt={e.name} loading="lazy" width={96} height={64} className="h-16 w-24 shrink-0 rounded-lg object-cover" />
                <div>
                  <p className="text-[14px] font-medium text-strong">{e.name}</p>
                  <p className="text-[12px] text-muted-foreground">{e.muscle} · {e.cue.toLowerCase()}</p>
                </div>
              </button>
            ))}
          </div>
        </Panel>
        <VideoModal ex={video} onClose={() => setVideo(null)} />
      </section>
    </main>
  );
}

type BlockKey = "college_hours" | "study_hours" | "gym_hours";
type DoneKey = "attended" | "study_done" | "gym_done";

function TimeBlocks({ date }: { date: string }) {
  const { data } = useDailyLog(date);
  const upsert = useUpsertDaily(date);

  const rows: { label: string; col: BlockKey; done: DoneKey; dot: string; q: string }[] = [
    { label: "School / College", col: "college_hours", done: "attended", dot: "bg-cyan", q: "Attended?" },
    { label: "Study / Reading", col: "study_hours", done: "study_done", dot: "bg-iris", q: "Done?" },
    { label: "Gym", col: "gym_hours", done: "gym_done", dot: "bg-mint", q: "Done?" },
  ];
  const total = rows.reduce((s, r) => s + Number(data?.[r.col] ?? 0), 0);
  const fmt = (h: number) => `${Math.floor(h)}h ${Math.round((h % 1) * 60)}m`;

  return (
    <Panel>
      <PanelHead title="Time blocks" sub="Time spent today" right={<span className="text-[13px] text-muted-foreground">{fmt(total)}</span>} />
      <div className="mt-4 space-y-3">
        {rows.map((r) => {
          const val = Number(data?.[r.col] ?? 0);
          const h = Math.floor(val);
          const m = Math.round((val - h) * 60 / 5) * 5;
          const set = (nh: number, nm: number) => upsert.mutate({ [r.col]: nh + nm / 60 });
          const done = data?.[r.done] ?? false;
          return (
            <div key={r.col} className="rounded-xl border border-line bg-ink px-4 py-3">
              <div className="flex items-center gap-3">
                <span className={cn("size-2 rounded-full", r.dot)} />
                <span className="flex-1 text-[13px] text-strong">{r.label}</span>
                <select aria-label={`${r.label} hours`} value={h} onChange={(e) => set(Number(e.target.value), m)} className={inputCls}>
                  {Array.from({ length: 17 }, (_, i) => <option key={i} value={i}>{i} h</option>)}
                </select>
                <select aria-label={`${r.label} minutes`} value={m % 60} onChange={(e) => set(h, Number(e.target.value))} className={inputCls}>
                  {Array.from({ length: 12 }, (_, i) => i * 5).map((x) => <option key={x} value={x}>{x} m</option>)}
                </select>
              </div>
              <div className="mt-2 flex items-center justify-end gap-2 text-[12px] text-muted-foreground">
                {r.q}
                {[true, false].map((yes) => (
                  <button
                    key={String(yes)}
                    onClick={() => upsert.mutate({ [r.done]: yes })}
                    className={cn(
                      "rounded-md border px-3 py-1 font-medium",
                      done === yes && data
                        ? yes ? "border-transparent bg-mint text-ink" : "border-transparent bg-destructive text-strong"
                        : "border-line text-muted-foreground",
                    )}
                  >
                    {yes ? "Yes" : "No"}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

function Routine({ date }: { date: string }) {
  const { data: tasks = [] } = useRoutine(date);
  const { add, toggle, remove } = useRoutineActions(date);
  const [title, setTitle] = useState("");
  const done = tasks.filter((t) => t.done).length;

  return (
    <Panel>
      <PanelHead title="Skills" sub="Daily skill checklist" right={<span className="text-[13px] text-muted-foreground">{done} / {tasks.length}</span>} />
      <div className="mt-4 space-y-2">
        {tasks.length === 0 && <p className="text-[13px] text-muted-foreground">Add skills like "Read 20 pages" or "Practice guitar".</p>}
        {tasks.map((t) => (
          <div key={t.id} className="group flex items-center gap-3 rounded-lg px-1 py-1.5">
            <button
              onClick={() => toggle.mutate({ id: t.id, done: t.done })}
              className={cn("grid size-5 place-items-center rounded-md border text-[11px]", t.done ? "border-transparent bg-brand text-ink" : "border-line bg-ink")}
            >
              {t.done && "✓"}
            </button>
            <span className={cn("flex-1 text-[13px]", t.done ? "text-muted-foreground line-through" : "text-strong")}>{t.title}</span>
            <button onClick={() => remove.mutate(t.id)} className="text-[12px] text-muted-foreground opacity-0 hover:text-destructive group-hover:opacity-100">✕</button>
          </div>
        ))}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (title.trim()) add.mutate(title.trim(), { onSuccess: () => setTitle("") });
        }}
        className="mt-4 flex gap-2"
      >
        <input className={cn(inputCls, "flex-1")} placeholder="New skill" value={title} onChange={(e) => setTitle(e.target.value)} />
        <button className="rounded-lg bg-primary px-4 text-[13px] font-semibold text-primary-foreground">Add</button>
      </form>
    </Panel>
  );
}
