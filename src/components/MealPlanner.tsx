import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useGroceryActions, useGroceryItems, useMealPlan, useSaveMealPlan, type DayPlan } from "@/lib/data";
import { buildDayPlan, GROCERY_CATEGORY, loadGoals, saveGoals, type Goals } from "@/lib/mealplan";
import { Panel, PanelHead, inputCls } from "./ui-kit";
import { cn } from "@/lib/utils";

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function MealPlanner({ date }: { date: string }) {
  const [goals, setGoals] = useState<Goals>(() => loadGoals());
  const [seed, setSeed] = useState(0);
  const saved = useMealPlan(date).data;
  const save = useSaveMealPlan(date);
  const grocery = useGroceryItems().data ?? [];
  const { add: addGrocery } = useGroceryActions();

  // A saved plan stays shown until the user edits goals or shuffles.
  const plan: DayPlan = useMemo(
    () => (saved && seed === 0 ? saved.payload : buildDayPlan(goals, seed, date)),
    [saved, seed, goals, date],
  );

  const editGoals = (patch: Partial<Goals>) =>
    setGoals((g) => {
      const next = { ...g, ...patch };
      saveGoals(next);
      return next;
    });

  const shuffle = () => {
    const nextSeed = seed + 1;
    setSeed(nextSeed);
    save.mutate({ goals, payload: buildDayPlan(goals, nextSeed, date) });
  };

  const addToGrocery = () => {
    const existing = new Set(grocery.map((i) => i.name.toLowerCase()));
    const items = plan.meals
      .flatMap((m) => m.items)
      .map((i) => ({ name: `${i.name} · ${i.qty}`, category: GROCERY_CATEGORY[i.kind] }))
      .filter((i) => !existing.has(i.name.toLowerCase()));
    if (!items.length) {
      toast.info("Everything is already on the list");
      return;
    }
    addGrocery.mutate(items, { onSuccess: () => toast.success(`Added ${items.length} items to your grocery list`) });
  };

  return (
    <Panel>
      <PanelHead
        title="Meal planner"
        sub={`What to eat on ${date}, with quantities`}
        right={
          <button
            onClick={shuffle}
            disabled={save.isPending}
            className="rounded-lg border border-line px-3 py-1.5 text-[12px] text-muted-foreground hover:text-strong"
          >
            Shuffle
          </button>
        }
      />

      <div className="mt-4 flex flex-wrap gap-2 text-[12px]">
        <label className="flex items-center gap-2 text-muted-foreground">
          Protein goal
          <input
            type="number"
            min={40}
            max={300}
            value={goals.protein}
            onChange={(e) => editGoals({ protein: Number(e.target.value) || 120 })}
            className={cn(inputCls, "w-20 py-1.5 text-strong")}
          />
          g
        </label>
        <label className="flex items-center gap-2 text-muted-foreground">
          Calorie goal
          <input
            type="number"
            min={1200}
            max={6000}
            step={50}
            value={goals.kcal}
            onChange={(e) => editGoals({ kcal: Number(e.target.value) || 2500 })}
            className={cn(inputCls, "w-24 py-1.5 text-strong")}
          />
          kcal
        </label>
      </div>

      <div className="mt-5 space-y-3 text-[13px]">
        {plan.meals.map((m) => (
          <div key={m.type} className="rounded-xl border border-line bg-ink px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <span className="font-display text-[14px] font-semibold text-strong">{cap(m.type)}</span>
              <span className="text-[12px] text-muted-foreground">
                {Math.round(m.protein)}g P · {Math.round(m.kcal)} kcal
              </span>
            </div>
            <ul className="mt-2 space-y-1">
              {m.items.map((i) => (
                <li key={i.name} className="flex items-baseline justify-between gap-3">
                  <span className="text-foreground">
                    {i.name} <span className="text-muted-foreground">· {i.qty}</span>
                  </span>
                  <span className="text-[12px] text-muted-foreground">{Math.round(i.protein)}g</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-[13px] text-muted-foreground">
          Day total: <span className="text-strong">{Math.round(plan.protein)}g</span> of {goals.protein}g protein ·{" "}
          <span className="text-strong">{Math.round(plan.kcal)}</span> of {goals.kcal} kcal
        </p>
        <button
          onClick={addToGrocery}
          disabled={addGrocery.isPending}
          className="rounded-lg bg-primary px-4 py-2 text-[13px] font-semibold text-primary-foreground"
        >
          Add to grocery list
        </button>
      </div>
    </Panel>
  );
}
