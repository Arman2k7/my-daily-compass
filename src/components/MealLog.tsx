import { useState } from "react";
import { useMealActions, useMeals } from "@/lib/data";
import { analyzeMeal, type MealType } from "@/lib/nutrition";
import { Panel, PanelHead, inputCls } from "./ui-kit";
import { cn } from "@/lib/utils";

const TYPES: MealType[] = ["breakfast", "lunch", "dinner", "snack"];
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function MealLog({ date, compact = false }: { date: string; compact?: boolean }) {
  const { data: meals = [] } = useMeals(date);
  const { add, remove } = useMealActions();
  const [type, setType] = useState<MealType>("breakfast");
  const [desc, setDesc] = useState("");
  const [protein, setProtein] = useState("");
  const [kcal, setKcal] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc.trim()) return;
    add.mutate(
      {
        log_date: date,
        meal_type: type,
        description: desc.trim(),
        protein_g: protein ? Number(protein) : null,
        calories: kcal ? Number(kcal) : null,
      },
      { onSuccess: () => { setDesc(""); setProtein(""); setKcal(""); } },
    );
  };

  const analyzed = meals.map((m) => ({ m, flags: analyzeMeal(m) }));
  const firstFix = analyzed.find((a) => a.flags.length)?.flags[0];
  const totalP = meals.reduce((s, m) => s + (m.protein_g ?? 0), 0);
  const totalK = meals.reduce((s, m) => s + (m.calories ?? 0), 0);

  return (
    <Panel>
      <PanelHead
        title="Diet log"
        sub="Smart check flags missing macros"
        right={<span className="text-[12px] text-muted-foreground">{totalP}g P · {totalK} kcal</span>}
      />

      <div className="mt-4 space-y-3 text-[13px]">
        {analyzed.length === 0 && <p className="text-muted-foreground">Nothing logged yet today.</p>}
        {analyzed.map(({ m, flags }) => (
          <div key={m.id}>
            <div
              className={cn(
                "group flex items-center justify-between gap-3 rounded-xl border px-4 py-3",
                flags.some((f) => f.level === "warn") ? "border-amber/40 bg-amber/5" : "border-line bg-ink",
              )}
            >
              <span className="text-muted-foreground">{cap(m.meal_type)}</span>
              <span className="flex-1 truncate text-right text-strong">
                {m.description}
                {m.protein_g != null && ` · ${m.protein_g}g P`}
                {flags[0] && <span className="text-amber"> · {flags[0].issue.toLowerCase()}</span>}
              </span>
              <button onClick={() => remove.mutate(m.id)} className="text-muted-foreground opacity-0 hover:text-destructive group-hover:opacity-100">✕</button>
            </div>
            {!compact &&
              flags.map((f, i) => (
                <div key={i} className="mt-2 flex gap-3 rounded-xl border border-iris/40 bg-iris/5 p-3">
                  <div className="mt-0.5 size-5 shrink-0 rounded-md bg-brand" />
                  <p className="leading-relaxed">
                    <span className="font-semibold text-strong">{f.issue}:</span> {f.fix}
                  </p>
                </div>
              ))}
          </div>
        ))}
      </div>

      {compact && firstFix && (
        <div className="mt-3 flex gap-3 rounded-xl border border-iris/40 bg-iris/5 p-4">
          <div className="mt-0.5 size-6 shrink-0 rounded-md bg-brand" />
          <p className="text-[13px] leading-relaxed">
            <span className="font-semibold text-strong">Suggest a fix:</span> {firstFix.fix}
          </p>
        </div>
      )}

      <form onSubmit={submit} className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-6">
        <select value={type} onChange={(e) => setType(e.target.value as MealType)} className={cn(inputCls, "col-span-2 sm:col-span-1")}>
          {TYPES.map((t) => <option key={t} value={t}>{cap(t)}</option>)}
        </select>
        <input className={cn(inputCls, "col-span-2 sm:col-span-3")} placeholder="What did you eat? e.g. rice, dal, salad" value={desc} onChange={(e) => setDesc(e.target.value)} />
        <input className={inputCls} type="number" min={0} placeholder="Protein g" value={protein} onChange={(e) => setProtein(e.target.value)} />
        <input className={inputCls} type="number" min={0} placeholder="kcal" value={kcal} onChange={(e) => setKcal(e.target.value)} />
        <button disabled={add.isPending} className="col-span-2 rounded-lg bg-primary px-4 py-2 text-[13px] font-semibold text-primary-foreground sm:col-span-6">
          Log meal
        </button>
      </form>
    </Panel>
  );
}
