import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useBodyMetrics, useBodyUpsert } from "@/lib/data";
import { Panel, PanelHead, inputCls } from "./ui-kit";
import { cn } from "@/lib/utils";

export function BodyStats({ date }: { date: string }) {
  const { data: metrics = [] } = useBodyMetrics();
  const upsert = useBodyUpsert(date);
  const [weight, setWeight] = useState("");
  const [waist, setWaist] = useState("");

  const forDate = metrics.find((m) => m.log_date === date);
  useEffect(() => {
    setWeight(forDate?.weight_kg != null ? String(forDate.weight_kg) : "");
    setWaist(forDate?.waist_cm != null ? String(forDate.waist_cm) : "");
  }, [date, forDate?.weight_kg, forDate?.waist_cm]);

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    upsert.mutate({
      weight_kg: weight ? Number(weight) : null,
      waist_cm: waist ? Number(waist) : null,
    });
  };

  const series = metrics
    .filter((m) => m.weight_kg != null || m.waist_cm != null)
    .map((m) => ({
      date: m.log_date.slice(5),
      weight: m.weight_kg != null ? Number(m.weight_kg) : null,
      waist: m.waist_cm != null ? Number(m.waist_cm) : null,
    }));

  const first = series[0]?.weight ?? null;
  const latest = series[series.length - 1] ?? null;
  const diff = latest && first != null ? Number(latest.weight) - first : null;

  return (
    <Panel>
      <PanelHead
        title="Body stats"
        sub={latest ? `Latest: ${latest.weight ?? "—"} kg${diff != null ? ` (${diff > 0 ? "+" : ""}${diff.toFixed(1)} kg since start)` : ""}` : "Log weight and waist to see the trend"}
      />
      <form onSubmit={save} className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
        <input
          className={cn(inputCls, "col-span-1")}
          type="number"
          step="0.1"
          min={0}
          placeholder="Weight kg"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
        />
        <input
          className={cn(inputCls, "col-span-1")}
          type="number"
          step="0.5"
          min={0}
          placeholder="Waist cm"
          value={waist}
          onChange={(e) => setWaist(e.target.value)}
        />
        <button
          disabled={upsert.isPending}
          className="col-span-2 rounded-lg bg-primary px-4 py-2 text-[13px] font-semibold text-primary-foreground sm:col-span-1"
        >
          Save for {date.slice(5)}
        </button>
      </form>
      {series.length >= 2 && (
        <div className="mt-5 h-44">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={series} margin={{ top: 5, right: 8, bottom: 0, left: -20 }}>
              <CartesianGrid stroke="var(--line)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} domain={["auto", "auto"]} />
              <Tooltip
                contentStyle={{ background: "var(--panel)", border: "1px solid var(--line)", borderRadius: 12, fontSize: 12 }}
                labelStyle={{ color: "var(--foreground)" }}
              />
              {series.some((s) => s.weight != null) && (
                <Line type="monotone" dataKey="weight" name="Weight (kg)" stroke="var(--cyan)" strokeWidth={2} dot={false} connectNulls />
              )}
              {series.some((s) => s.waist != null) && (
                <Line type="monotone" dataKey="waist" name="Waist (cm)" stroke="var(--amber)" strokeWidth={2} dot={false} connectNulls />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
      {series.length < 2 && <p className="mt-3 text-[13px] text-muted-foreground">Two or more entries draw the trend line.</p>}
    </Panel>
  );
}
