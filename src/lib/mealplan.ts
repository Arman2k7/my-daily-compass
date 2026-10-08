import type { MealType } from "./nutrition";

export interface Goals {
  protein: number;
  kcal: number;
}

export const DEFAULT_GOALS: Goals = { protein: 120, kcal: 2500 };
const GOALS_KEY = "cadence-nutrition-goals";

export function loadGoals(): Goals {
  try {
    if (typeof window !== "undefined") {
      const raw = window.localStorage.getItem(GOALS_KEY);
      if (raw) {
        const g = JSON.parse(raw) as Partial<Goals>;
        if (g.protein && g.kcal) return { protein: g.protein, kcal: g.kcal };
      }
    }
  } catch {
    /* fall through */
  }
  return DEFAULT_GOALS;
}

export function saveGoals(g: Goals) {
  try {
    if (typeof window !== "undefined") window.localStorage.setItem(GOALS_KEY, JSON.stringify(g));
  } catch {
    /* ignore */
  }
}

export interface PlanItem {
  name: string;
  qty: string;
  protein: number;
  kcal: number;
  kind: "protein" | "carb" | "veg" | "fruit";
}

export interface PlannedMeal {
  type: MealType;
  items: PlanItem[];
  protein: number;
  kcal: number;
}

export interface DayPlan {
  meals: PlannedMeal[];
  protein: number;
  kcal: number;
  goals: Goals;
  seed: number;
}

interface GSource {
  name: string;
  p: number; // protein per 100g
  k: number; // kcal per 100g
  minG: number;
  maxG: number;
}

const PROTEIN_G: Record<string, GSource> = {
  chicken: { name: "Grilled chicken breast", p: 31, k: 165, minG: 80, maxG: 300 },
  paneer: { name: "Paneer", p: 18, k: 265, minG: 60, maxG: 250 },
  dal: { name: "Dal (cooked)", p: 9, k: 116, minG: 100, maxG: 400 },
  soya: { name: "Soya chunks", p: 52, k: 345, minG: 30, maxG: 150 },
  fish: { name: "Fish (rohu / basa)", p: 20, k: 97, minG: 80, maxG: 300 },
  tofu: { name: "Tofu", p: 8, k: 76, minG: 80, maxG: 350 },
  yogurt: { name: "Greek yogurt", p: 10, k: 59, minG: 100, maxG: 400 },
  chana: { name: "Roasted chana", p: 22, k: 370, minG: 30, maxG: 150 },
  almonds: { name: "Almonds", p: 21, k: 579, minG: 15, maxG: 80 },
};

const POOLS: Record<MealType, string[]> = {
  breakfast: ["egg", "paneer", "yogurt", "whey"],
  lunch: ["chicken", "paneer", "dal", "soya"],
  dinner: ["fish", "paneer", "dal", "tofu"],
  snack: ["chana", "almonds", "yogurt", "whey"],
};

interface FixedItem {
  name: string;
  qty: string;
  p: number;
  k: number;
}

const CARBS: Record<MealType, FixedItem[]> = {
  breakfast: [
    { name: "Oats", qty: "60 g", p: 7.8, k: 233 },
    { name: "Poha", qty: "200 g", p: 5, k: 270 },
    { name: "Upma", qty: "200 g", p: 6, k: 300 },
    { name: "2 rotis", qty: "2 pieces", p: 6, k: 280 },
  ],
  lunch: [
    { name: "Cooked rice", qty: "200 g", p: 5.4, k: 260 },
    { name: "Brown rice", qty: "200 g", p: 5.4, k: 220 },
    { name: "2 rotis", qty: "2 pieces", p: 6, k: 280 },
    { name: "3 chapatis", qty: "3 pieces", p: 9, k: 420 },
  ],
  dinner: [
    { name: "Cooked rice", qty: "150 g", p: 4, k: 195 },
    { name: "2 rotis", qty: "2 pieces", p: 6, k: 280 },
    { name: "Khichdi", qty: "250 g", p: 9, k: 280 },
  ],
  snack: [],
};

const FRUITS: FixedItem[] = [
  { name: "Banana", qty: "1 piece", p: 1.3, k: 105 },
  { name: "Apple", qty: "1 piece", p: 0.5, k: 95 },
  { name: "Orange", qty: "1 piece", p: 1.2, k: 62 },
  { name: "Papaya", qty: "150 g", p: 0.7, k: 65 },
];

const VEGETABLES: FixedItem[] = [
  { name: "Mixed sabzi", qty: "150 g", p: 2, k: 110 },
  { name: "Cucumber salad", qty: "120 g", p: 1.5, k: 35 },
  { name: "Palak sabzi", qty: "150 g", p: 3, k: 90 },
  { name: "Steamed broccoli", qty: "120 g", p: 3, k: 40 },
];

const SHARES: Record<MealType, number> = { breakfast: 0.25, lunch: 0.35, dinner: 0.3, snack: 0.1 };
const ORDER: MealType[] = ["breakfast", "lunch", "dinner", "snack"];

function hashDate(dateKey: string): number {
  let h = 7;
  for (let i = 0; i < dateKey.length; i++) h = (h * 31 + dateKey.charCodeAt(i)) % 100000;
  return h;
}

function fixedItem(f: FixedItem): PlanItem {
  return { name: f.name, qty: f.qty, protein: f.p, kcal: f.k, kind: f.qty.includes("piece") ? "carb" : "carb" };
}

function proteinItem(key: string, neededP: number, dateKey: string, seed: number, mealIndex: number): PlanItem {
  const n = hashDate(dateKey) + seed * 7 + mealIndex * 13;
  if (key === "egg") {
    const count = Math.min(6, Math.max(1, Math.round(neededP / 6.3)));
    return { name: "Boiled eggs", qty: `${count} egg${count > 1 ? "s" : ""}`, protein: count * 6.3, kcal: count * 78, kind: "protein" };
  }
  if (key === "whey") {
    const count = Math.min(2, Math.max(1, Math.ceil(neededP / 24)));
    return { name: "Whey protein shake", qty: `${count} scoop${count > 1 ? "s" : ""}`, protein: count * 24, kcal: count * 120, kind: "protein" };
  }
  const src = PROTEIN_G[key];
  const grams = Math.min(src.maxG, Math.max(src.minG, Math.round((neededP * 100) / src.p / 10) * 10));
  return { name: src.name, qty: `${grams} g`, protein: (grams * src.p) / 100, kcal: (grams * src.k) / 100, kind: "protein" };
}

function pick<T>(pool: T[], n: number): T {
  return pool[n % pool.length];
}

export function buildDayPlan(goals: Goals, seed: number, dateKey: string): DayPlan {
  const base = hashDate(dateKey);
  const meals: PlannedMeal[] = ORDER.map((type, mealIndex) => {
    const neededP = goals.protein * SHARES[type];
    const srcKey = pick(POOLS[type], base + seed * 7 + mealIndex * 13);
    const items: PlanItem[] = [proteinItem(srcKey, neededP, dateKey, seed, mealIndex)];

    const carbPool = CARBS[type];
    if (carbPool.length) items.push(fixedItem(pick(carbPool, base + seed * 3 + mealIndex * 5)));
    if (type === "breakfast" || type === "snack") {
      const fruit = pick(FRUITS, base + seed * 11 + mealIndex * 17);
      items.push({ name: fruit.name, qty: fruit.qty, protein: fruit.p, kcal: fruit.k, kind: "fruit" });
    }
    if (type === "lunch" || type === "dinner") {
      const veg = pick(VEGETABLES, base + seed * 11 + mealIndex * 17);
      items.push({ name: veg.name, qty: veg.qty, protein: veg.p, kcal: veg.k, kind: "veg" });
    }

    const protein = items.reduce((s, i) => s + i.protein, 0);
    const kcal = items.reduce((s, i) => s + i.kcal, 0);
    return { type, items, protein, kcal };
  });

  return {
    meals,
    protein: meals.reduce((s, m) => s + m.protein, 0),
    kcal: meals.reduce((s, m) => s + m.kcal, 0),
    goals,
    seed,
  };
}

export const GROCERY_CATEGORY: Record<PlanItem["kind"], string> = {
  protein: "protein",
  carb: "carbs",
  veg: "vegetables",
  fruit: "fruit",
};
