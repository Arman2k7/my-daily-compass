import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { format, getISOWeek } from "date-fns";
import { useDailyLog, useRoutine, useRoutineActions, useUpsertDaily } from "@/lib/data";
import { todayKey } from "@/lib/dates";
import { EXERCISES, videoSearchUrl } from "@/lib/exercises";
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
  const { user } = Route.useRouteContext();
  const name = (user.user_metadata?.full_name as string | undefined)?.split(" ")[0] ?? user.email?.split("@")[0] ?? "you";
  const { data: routine = [] } = useRoutine(date);
  const { ml, goal, add } = useWater(date);
  const left = routine.filter((r) => !r.done).length;
  const pct = Math.round((ml / goal) * 100);

  return (
    <main>
      <PageHero eyebrow={`${format(new Date(), "EEEE")} · Week ${getISOWeek(new Date())}`} title={<>{greeting()},<br />{name}.</>}>
        <p className="mx-auto mt-5 max-w-md text-[15px] leading-relaxed text-muted-foreground">
          {routine.length ? `${left === 0 ? "Every habit done" : `${left} habit${left > 1 ? "s" : ""} left`} today. ` : ""}
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
          <PanelHead title="Exercise library" sub="Form checks before you load the bar" right={<Link to="/library" className="text-[13px] text-cyan">All</Link>} />
          <div className="mt-4 grid gap-3">
            {EXERCISES.slice(0, 2).map((e) => (
              <a key={e.slug} href={videoSearchUrl(e.name)} target="_blank" rel="noreferrer" className="flex items-center gap-4 rounded-xl border border-line bg-ink p-3 hover:border-iris/50">
                <img src={e.image} alt={e.name} loading="lazy" width={96} height={64} className="h-16 w-24 shrink-0 rounded-lg object-cover" />
                <div>
                  <p className="text-[14px] font-medium text-strong">{e.name}</p>
                  <p className="text-[12px] text-muted-foreground">{e.muscle} · {e.cue.toLowerCase()}</p>
                </div>
              </a>
            ))}
          </div>
        </Panel>
      </section>
    </main>
  );
}

function TimeBlocks({ date }: { date: string }) {
  const { data } = useDailyLog(date);
  const upsert = useUpsertDaily(date);
  const [v, setV] = useState({ college: "0", study: "0", gym: "0" });
  useEffect(() => {
    if (data) setV({ college: String(data.college_hours), study: String(data.study_hours), gym: String(data.gym_hours) });
  }, [data]);

  const rows = [
    { key: "college" as const, label: "School / College", col: "college_hours", dot: "bg-cyan" },
    { key: "study" as const, label: "Study / Reading", col: "study_hours", dot: "bg-iris" },
    { key: "gym" as const, label: "Gym", col: "gym_hours", dot: "bg-mint" },
  ];
  const total = Number(v.college) + Number(v.study) + Number(v.gym);

  return (
    <Panel>
      <PanelHead title="Time blocks" sub="Hours spent today" right={<span className="text-[13px] text-muted-foreground">{total.toFixed(1)}h</span>} />
      <div className="mt-4 space-y-3">
        {rows.map((r) => (
          <div key={r.key} className="flex items-center gap-3 rounded-xl border border-line bg-ink px-4 py-3">
            <span className={cn("size-2 rounded-full", r.dot)} />
            <span className="flex-1 text-[13px] text-strong">{r.label}</span>
            <input
              type="number" step="0.25" min={0} max={24}
              value={v[r.key]}
              onChange={(e) => setV({ ...v, [r.key]: e.target.value })}
              onBlur={() => upsert.mutate({ [r.col]: Number(v[r.key]) || 0 })}
              className={cn(inputCls, "w-20 text-right")}
            />
            <span className="text-[12px] text-muted-foreground">h</span>
          </div>
        ))}
        <label className="flex items-center gap-3 px-1 pt-1 text-[13px] text-muted-foreground">
          <input
            type="checkbox"
            checked={data?.attended ?? false}
            onChange={(e) => upsert.mutate({ attended: e.target.checked })}
            className="size-4 accent-[var(--cyan)]"
          />
          Attended classes today
        </label>
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
      <PanelHead title="Routine" sub="Daily checklist" right={<span className="text-[13px] text-muted-foreground">{done} / {tasks.length}</span>} />
      <div className="mt-4 space-y-2">
        {tasks.length === 0 && <p className="text-[13px] text-muted-foreground">Add habits like "Read 20 pages" or "Morning mobility".</p>}
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
        <input className={cn(inputCls, "flex-1")} placeholder="New habit" value={title} onChange={(e) => setTitle(e.target.value)} />
        <button className="rounded-lg bg-primary px-4 text-[13px] font-semibold text-primary-foreground">Add</button>
      </form>
    </Panel>
  );
}
