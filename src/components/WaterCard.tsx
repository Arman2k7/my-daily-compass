import { useDailyLog, useUpsertDaily } from "@/lib/data";
import { Panel, PanelHead, chipBtn } from "./ui-kit";

export function useWater(date: string) {
  const { data } = useDailyLog(date);
  const upsert = useUpsertDaily(date);
  const ml = data?.water_ml ?? 0;
  const goal = data?.water_goal_ml ?? 3000;
  const add = (n: number) => upsert.mutate({ water_ml: Math.max(0, ml + n) });
  return { ml, goal, add, setGoal: (g: number) => upsert.mutate({ water_goal_ml: g }), pending: upsert.isPending };
}

export function WaterCard({ date }: { date: string }) {
  const { ml, goal, add, setGoal } = useWater(date);
  const pct = Math.min(100, Math.round((ml / goal) * 100));
  return (
    <Panel>
      <PanelHead
        title="Hydration"
        sub={`${(ml / 1000).toFixed(2)} L of ${(goal / 1000).toFixed(1)} L goal`}
        right={<span className="text-[13px] font-medium text-cyan">{pct}%{pct >= 100 ? " · goal hit" : ""}</span>}
      />
      <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-ink">
        <div className="h-full rounded-full bg-water transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <button className={chipBtn} onClick={() => add(250)}>+ 1 glass · 250ml</button>
        <button className={chipBtn} onClick={() => add(500)}>+ 1 bottle · 500ml</button>
        <button className={chipBtn} onClick={() => add(1000)}>+ 1 L</button>
        <button className={`${chipBtn} text-muted-foreground`} onClick={() => add(-250)}>Undo 250ml</button>
        <label className="ml-auto flex items-center gap-2 text-[12px] text-muted-foreground">
          Goal
          <select
            value={goal}
            onChange={(e) => setGoal(Number(e.target.value))}
            className="rounded-md border border-line bg-ink px-2 py-1 text-strong"
          >
            {[2000, 2500, 3000, 3500, 4000, 4500].map((g) => (
              <option key={g} value={g}>{g / 1000} L</option>
            ))}
          </select>
        </label>
      </div>
    </Panel>
  );
}
