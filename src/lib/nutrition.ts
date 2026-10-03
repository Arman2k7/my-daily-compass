export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export interface MealLike {
  meal_type: string;
  description: string;
  protein_g: number | null;
  calories: number | null;
}

export interface Flag {
  level: "warn" | "tip";
  issue: string;
  fix: string;
}

const PROTEIN = ["chicken", "egg", "paneer", "tofu", "fish", "salmon", "tuna", "beef", "mutton", "turkey", "whey", "protein", "dal", "lentil", "chickpea", "chana", "rajma", "bean", "yogurt", "curd", "greek", "cottage", "soya", "soy", "tempeh", "shrimp", "prawn", "milk", "cheese", "seitan", "edamame"];
const VEG = ["salad", "spinach", "broccoli", "carrot", "cucumber", "tomato", "pepper", "capsicum", "kale", "lettuce", "cabbage", "cauliflower", "beans", "peas", "zucchini", "sabzi", "vegetable", "veggie", "veg", "onion", "mushroom", "okra", "bhindi", "palak", "gourd", "asparagus"];
const FRUIT = ["apple", "banana", "berries", "berry", "orange", "mango", "papaya", "grape", "kiwi", "pear", "fruit", "guava", "pomegranate"];
const JUNK = ["pizza", "burger", "fries", "chips", "soda", "coke", "cola", "donut", "cake", "pastry", "candy", "chocolate", "maggi", "noodles", "samosa", "biscuit", "cookie", "ice cream"];
const REFINED = ["white rice", "rice", "pasta", "bread", "naan", "roti", "paratha", "poha", "oats", "cereal"];

const has = (text: string, list: string[]) => list.some((w) => text.includes(w));

const PROTEIN_FIX: Record<string, string> = {
  breakfast: "Add 2 boiled eggs or a scoop of whey to your oats (+15–24g protein).",
  lunch: "Add 100g grilled chicken, paneer or a cup of dal (+18–25g protein).",
  dinner: "Add tofu, fish or a bowl of Greek yogurt on the side (+15–20g protein).",
  snack: "Swap for roasted chana, a protein shake or a handful of almonds + curd.",
};

export function analyzeMeal(m: MealLike): Flag[] {
  const t = m.description.toLowerCase();
  const flags: Flag[] = [];
  const type = (m.meal_type || "snack").toLowerCase();
  const target = type === "snack" ? 8 : 20;

  const lowProtein = m.protein_g != null ? m.protein_g < target : !has(t, PROTEIN);
  if (lowProtein) {
    flags.push({
      level: "warn",
      issue: m.protein_g != null ? `Low protein (${m.protein_g}g, aim ${target}g+)` : "No clear protein source",
      fix: PROTEIN_FIX[type] ?? PROTEIN_FIX.snack,
    });
  }
  if ((type === "lunch" || type === "dinner") && !has(t, VEG)) {
    flags.push({
      level: "warn",
      issue: "Missing vegetables / fibre",
      fix: "Add a side salad, sautéed spinach or a cup of steamed broccoli — swap half the carbs if needed.",
    });
  }
  if (type === "breakfast" && !has(t, FRUIT) && !has(t, VEG)) {
    flags.push({ level: "tip", issue: "No fruit or veg", fix: "Top it with a banana or berries for fibre and micronutrients." });
  }
  if (has(t, JUNK)) {
    flags.push({
      level: "warn",
      issue: "Processed / high-sugar food",
      fix: "Balance it: next meal go lean protein + veg, and add a glass of water now.",
    });
  }
  if (has(t, REFINED) && !has(t, PROTEIN) && !has(t, VEG)) {
    flags.push({ level: "tip", issue: "Mostly refined carbs", fix: "Pair carbs with protein and fibre to keep energy steady." });
  }
  if (m.calories != null && m.calories > 1100) {
    flags.push({ level: "tip", issue: `Heavy meal (${m.calories} kcal)`, fix: "Consider a lighter next meal and a 10-min walk." });
  }
  return flags;
}
