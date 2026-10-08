function Ring({
  value,
  goal,
  color,
  label,
  fmt,
}: {
  value: number;
  goal: number;
  color: string;
  label: string;
  fmt: (n: number) => string;
}) {
  const r = 42;
  const c = 2 * Math.PI * r;
  const pct = goal > 0 ? Math.min(1, value / goal) : 0;
  const done = goal > 0 && value >= goal;
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        <svg width="112" height="112" viewBox="0 0 112 112">
          <circle cx="56" cy="56" r={r} fill="none" stroke="var(--line)" strokeWidth="9" />
          <circle
            cx="56"
            cy="56"
            r={r}
            fill="none"
            stroke={color}
            strokeWidth="9"
            strokeLinecap="round"
            strokeDasharray={`${c * pct} ${c}`}
            transform="rotate(-90 56 56)"
            className="transition-all duration-700"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-[17px] font-semibold text-strong">{fmt(value)}</span>
          <span className="text-[11px] text-muted-foreground">of {fmt(goal)}</span>
        </div>
      </div>
      <span className="text-[12px] text-muted-foreground">
        {label} {done ? "· done" : `· ${fmt(Math.max(0, goal - value))} left`}
      </span>
    </div>
  );
}

export function MacroRings({
  protein,
  kcal,
  goals,
}: {
  protein: number;
  kcal: number;
  goals: { protein: number; kcal: number };
}) {
  return (
    <div className="mt-4 flex items-center justify-around gap-4">
      <Ring value={protein} goal={goals.protein} color="var(--iris)" label="Protein" fmt={(n) => `${Math.round(n)}g`} />
      <Ring value={kcal} goal={goals.kcal} color="var(--cyan)" label="Calories" fmt={(n) => `${Math.round(n)}`} />
    </div>
  );
}
