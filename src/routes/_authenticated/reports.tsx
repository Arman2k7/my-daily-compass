import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { format, startOfMonth, startOfWeek, subDays, subMonths, parseISO } from "date-fns";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts";
import { useRange } from "@/lib/data";
import { toKey } from "@/lib/dates";
import { PageHero, Panel, PanelHead } from "@/components/ui-kit";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/reports")({
  head: () => ({
    meta: [
      { title: "Reports — Cadence" },
      { name: "description", content: "Weekly, monthly, 6-month and yearly growth reports." },
      { property: "og:title", content: "Reports — Cadence" },
      { property: "og:description", content: "Weekly, monthly, 6-month and yearly growth reports." },
    ],
  }),
  component: Reports,
});

type Period = "week" | "month" | "6m" | "year";
const PERIODS: { id: Period; label: string }[] = [
  { id: "week", label: "Weekly" },
  { id: "month", label: "Monthly" },
  { id: "6m", label: "6 months" },
  { id: "year", label: "Yearly" },
];

function rangeFor(p: Period) {
  const now = new Date();
  const from = p === "week" ? subDays(now, 6) : p === "month" ? subDays(now, 29) : p === "6m" ? subMonths(now, 6) : subMonths(now, 12);
  return { from: toKey(from), to: toKey(now) };
}

function bucketKey(date: string, p: Period) {
  const d = parseISO(date);
  if (p === "week" || p === "month") return date;
  if (p === "6m") return toKey(startOfWeek(d, { weekStartsOn: 1 }));
  return toKey(startOfMonth(d));
}
function bucketLabel(key: string, p: Period) {
  const d = parseISO(key);
  if (p === "week") return format(d, "EEE");
  if (p === "month" || p === "6m") return format(d, "d MMM");
  return format(d, "MMM yy");
}

const axis = { stroke: "var(--muted-foreground)", fontSize: 11, tickLine: false, axisLine: false };
const tooltip = {
  contentStyle: { background: "var(--panel)", border: "1px solid var(--line)", borderRadius: 12, fontSize: 12 },
  labelStyle: { color: "var(--strong)" },
};

function Reports() {
  const [p, setP] = useState<Period>("week");
  const { from, to } = rangeFor(p);
  const { data, isLoading } = useRange(from, to);

  const { series, stats } = useMemo(() => {
    const logs = data?.logs ?? [];
    const sets = data?.sets ?? [];
    const map = new Map<string, { key: string; study: number; college: number; gym: number; attended: number; days: number; water: number; waterHit: number; volume: number; topLift: number }>();
    const get = (k: string) => {
      if (!map.has(k)) map.set(k, { key: k, study: 0, college: 0, gym: 0, attended: 0, days: 0, water: 0, waterHit: 0, volume: 0, topLift: 0 });
      return map.get(k)!;
    };
    // seed buckets for continuous axis
    for (let d = parseISO(from); toKey(d) <= to; d = subDays(d, -1)) get(bucketKey(toKey(d), p));

    for (const l of logs) {
      const b = get(bucketKey(l.log_date, p));
      b.study += Number(l.study_hours);
      b.college += Number(l.college_hours);
      b.gym += Number(l.gym_hours);
      b.days += 1;
      b.attended += l.attended ? 1 : 0;
      b.water += l.water_ml;
      b.waterHit += l.water_ml >= l.water_goal_ml ? 1 : 0;
    }
    for (const s of sets) {
      const b = get(bucketKey(s.log_date, p));
      b.volume += s.sets * s.reps * Number(s.weight_kg);
      b.topLift = Math.max(b.topLift, Number(s.weight_kg));
    }
    const series = [...map.values()]
      .sort((a, b) => a.key.localeCompare(b.key))
      .map((b) => ({
        label: bucketLabel(b.key, p),
        study: +b.study.toFixed(1),
        college: +b.college.toFixed(1),
        gym: +b.gym.toFixed(1),
        attendance: b.days ? Math.round((b.attended / b.days) * 100) : 0,
        water: b.days ? +(b.water / b.days / 1000).toFixed(2) : 0,
        volume: Math.round(b.volume),
        topLift: b.topLift,
      }));

    const totalStudy = logs.reduce((s, l) => s + Number(l.study_hours), 0);
    const totalCollege = logs.reduce((s, l) => s + Number(l.college_hours), 0);
    const collegeDays = logs.filter((l) => Number(l.college_hours) > 0 || l.attended).length;
    const attendance = collegeDays ? Math.round((logs.filter((l) => l.attended).length / collegeDays) * 100) : 0;
    const waterDays = logs.filter((l) => l.water_ml > 0);
    const waterHit = waterDays.length ? Math.round((waterDays.filter((l) => l.water_ml >= l.water_goal_ml).length / waterDays.length) * 100) : 0;
    const totalVolume = sets.reduce((s, x) => s + x.sets * x.reps * Number(x.weight_kg), 0);
    const gymSessions = new Set(sets.map((s) => s.log_date)).size;
    return {
      series,
      stats: [
        { label: "Study / reading", value: `${totalStudy.toFixed(1)}h`, tone: "text-iris" },
        { label: "College time", value: `${totalCollege.toFixed(1)}h`, tone: "text-cyan" },
        { label: "Attendance", value: `${attendance}%`, tone: "text-strong" },
        { label: "Water goal hit", value: `${waterHit}%`, tone: "text-cyan" },
        { label: "Gym sessions", value: `${gymSessions}`, tone: "text-mint" },
        { label: "Volume lifted", value: `${Math.round(totalVolume).toLocaleString()} kg`, tone: "text-amber" },
      ],
    };
  }, [data, p, from, to]);

  return (
    <main>
      <PageHero eyebrow={`${format(parseISO(from), "d MMM yyyy")} → ${format(parseISO(to), "d MMM yyyy")}`} title="Growth report">
        <div className="mt-8 inline-flex gap-1 rounded-full border border-line bg-panel p-1">
          {PERIODS.map((x) => (
            <button
              key={x.id}
              onClick={() => setP(x.id)}
              className={cn("rounded-full px-4 py-1.5 text-[13px]", p === x.id ? "bg-primary font-semibold text-primary-foreground" : "text-muted-foreground hover:text-strong")}
            >
              {x.label}
            </button>
          ))}
        </div>
      </PageHero>

      <section className="mx-auto max-w-5xl space-y-6 px-5 pb-20 md:px-8">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
          {stats.map((s) => (
            <div key={s.label} className="rounded-2xl border border-line bg-panel p-4">
              <p className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground">{s.label}</p>
              <p className={cn("mt-2 font-display text-2xl font-bold", s.tone)}>{isLoading ? "–" : s.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Panel>
            <PanelHead title="Study & reading hours" sub="Total per period" />
            <Chart>
              <AreaChart data={series}>
                <defs>
                  <linearGradient id="gStudy" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--iris)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="var(--iris)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--line)" vertical={false} />
                <XAxis dataKey="label" {...axis} />
                <YAxis {...axis} width={30} />
                <Tooltip {...tooltip} />
                <Area type="monotone" dataKey="study" name="Study h" stroke="var(--iris)" fill="url(#gStudy)" strokeWidth={2} />
              </AreaChart>
            </Chart>
          </Panel>

          <Panel>
            <PanelHead title="College time vs attendance" sub="Hours and % days attended" />
            <Chart>
              <BarChart data={series}>
                <CartesianGrid stroke="var(--line)" vertical={false} />
                <XAxis dataKey="label" {...axis} />
                <YAxis yAxisId="h" {...axis} width={30} />
                <YAxis yAxisId="p" orientation="right" domain={[0, 100]} {...axis} width={30} />
                <Tooltip {...tooltip} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar yAxisId="h" dataKey="college" name="College h" fill="var(--cyan)" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="p" dataKey="attendance" name="Attendance %" fill="var(--iris)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </Chart>
          </Panel>

          <Panel>
            <PanelHead title="Water intake" sub="Average litres per logged day" />
            <Chart>
              <LineChart data={series}>
                <CartesianGrid stroke="var(--line)" vertical={false} />
                <XAxis dataKey="label" {...axis} />
                <YAxis {...axis} width={30} />
                <Tooltip {...tooltip} />
                <Line type="monotone" dataKey="water" name="Litres" stroke="var(--cyan)" strokeWidth={2} dot={false} />
              </LineChart>
            </Chart>
          </Panel>

          <Panel>
            <PanelHead title="Gym progress" sub="Volume (kg) and heaviest lift" />
            <Chart>
              <BarChart data={series}>
                <CartesianGrid stroke="var(--line)" vertical={false} />
                <XAxis dataKey="label" {...axis} />
                <YAxis yAxisId="v" {...axis} width={40} />
                <YAxis yAxisId="t" orientation="right" {...axis} width={30} />
                <Tooltip {...tooltip} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar yAxisId="v" dataKey="volume" name="Volume kg" fill="var(--mint)" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="t" dataKey="topLift" name="Top lift kg" fill="var(--amber)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </Chart>
          </Panel>
        </div>
      </section>
    </main>
  );
}

function Chart({ children }: { children: React.ReactElement }) {
  return (
    <div className="mt-4 h-56">
      <ResponsiveContainer width="100%" height="100%">{children}</ResponsiveContainer>
    </div>
  );
}
