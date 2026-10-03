import bench from "@/assets/ex-bench.jpg";
import squat from "@/assets/ex-squat.jpg";
import deadlift from "@/assets/ex-deadlift.jpg";
import ohp from "@/assets/ex-ohp.jpg";

export interface Exercise {
  slug: string;
  name: string;
  muscle: string;
  cue: string;
  steps: string[];
  image?: string;
}

export const EXERCISES: Exercise[] = [
  { slug: "bench-press", name: "Barbell Bench Press", muscle: "Chest", cue: "Verify elbow path", image: bench,
    steps: ["Eyes under the bar, shoulder blades pinched", "Grip slightly wider than shoulders", "Lower to mid-chest, elbows ~45°", "Drive feet, press up and slightly back"] },
  { slug: "back-squat", name: "Back Squat", muscle: "Legs", cue: "Brace the core", image: squat,
    steps: ["Bar on upper traps, big breath in", "Feet shoulder-width, toes slightly out", "Sit down and back, knees track toes", "Hit parallel, drive up through mid-foot"] },
  { slug: "deadlift", name: "Conventional Deadlift", muscle: "Posterior chain", cue: "Neutral spine", image: deadlift,
    steps: ["Bar over mid-foot, shins close", "Hinge, grip just outside legs", "Pull slack out, chest up, lats tight", "Push the floor away, lock out hips"] },
  { slug: "overhead-press", name: "Overhead Press", muscle: "Shoulders", cue: "Squeeze glutes", image: ohp,
    steps: ["Bar on front delts, grip just outside shoulders", "Squeeze glutes and brace", "Press straight up, head back then through", "Lock out overhead, bar over mid-foot"] },
  { slug: "barbell-row", name: "Barbell Row", muscle: "Back", cue: "Flat back, pull to belly",
    steps: ["Hinge to ~45°, soft knees", "Overhand grip, arms long", "Row to lower ribs, elbows back", "Control the descent"] },
  { slug: "pull-up", name: "Pull-Up", muscle: "Back", cue: "Full hang to chin over",
    steps: ["Dead hang, shoulders engaged", "Pull elbows down to ribs", "Chin clears the bar", "Lower under control"] },
  { slug: "romanian-deadlift", name: "Romanian Deadlift", muscle: "Hamstrings", cue: "Hips back, not down",
    steps: ["Start standing with bar", "Push hips back, slight knee bend", "Lower until hamstring stretch", "Drive hips forward to stand"] },
  { slug: "incline-dumbbell-press", name: "Incline Dumbbell Press", muscle: "Upper chest", cue: "30° bench",
    steps: ["Bench at 30–45°", "Dumbbells at chest, palms forward", "Press up and slightly in", "Lower with a stretch"] },
  { slug: "lat-pulldown", name: "Lat Pulldown", muscle: "Back", cue: "Chest up, pull to collarbone",
    steps: ["Thighs locked under pads", "Grip wide, lean back slightly", "Pull bar to upper chest", "Return slowly to full stretch"] },
  { slug: "lunges", name: "Walking Lunges", muscle: "Legs", cue: "Tall torso",
    steps: ["Step forward long", "Drop back knee toward floor", "Front knee over mid-foot", "Push through front heel to next step"] },
  { slug: "bicep-curl", name: "Dumbbell Curl", muscle: "Biceps", cue: "Elbows pinned",
    steps: ["Stand tall, palms forward", "Curl without swinging", "Squeeze at the top", "Lower slowly"] },
  { slug: "tricep-pushdown", name: "Tricep Pushdown", muscle: "Triceps", cue: "Elbows locked at sides",
    steps: ["Cable at head height", "Elbows tucked", "Push down to full lockout", "Return to 90° with control"] },
];

export const videoSearchUrl = (name: string) =>
  `https://www.youtube.com/results?search_query=${encodeURIComponent(name + " proper form tutorial")}`;
