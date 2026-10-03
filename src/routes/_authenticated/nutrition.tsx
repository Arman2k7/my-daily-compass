import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { todayKey } from "@/lib/dates";
import { MealLog } from "@/components/MealLog";
import { WaterCard } from "@/components/WaterCard";
import { PageHero, inputCls } from "@/components/ui-kit";

export const Route = createFileRoute("/_authenticated/nutrition")({
  head: () => ({
    meta: [
      { title: "Nutrition — Cadence" },
      { name: "description", content: "Meal log with smart nutrient checks and hydration." },
      { property: "og:title", content: "Nutrition — Cadence" },
      { property: "og:description", content: "Meal log with smart nutrient checks and hydration." },
    ],
  }),
  component: Nutrition,
});

function Nutrition() {
  const [date, setDate] = useState(todayKey());
  return (
    <main>
      <PageHero eyebrow="Fuel" title="Nutrition">
        <p className="mx-auto mt-5 max-w-md text-[15px] text-muted-foreground">
          Log every meal. Low protein, missing veg or junk gets flagged with a quick fix.
        </p>
        <input type="date" value={date} max={todayKey()} onChange={(e) => setDate(e.target.value)} className={`${inputCls} mt-6`} />
      </PageHero>
      <section className="mx-auto max-w-3xl space-y-6 px-5 pb-20 md:px-8">
        <MealLog date={date} />
        <WaterCard date={date} />
      </section>
    </main>
  );
}
