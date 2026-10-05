import bench from "@/assets/ex-bench.jpg";
import squat from "@/assets/ex-squat.jpg";
import deadlift from "@/assets/ex-deadlift.jpg";
import ohp from "@/assets/ex-ohp.jpg";

export const CATEGORIES = [
  "Chest", "Back", "Legs", "Shoulders", "Biceps", "Triceps", "Forearms", "Cardio", "Yoga", "Stretching",
] as const;
export type Category = (typeof CATEGORIES)[number];

export interface Exercise {
  slug: string;
  name: string;
  category: Category;
  muscle: string;
  cue: string;
  steps: string[];
  video?: string; // YouTube video id
  image?: string;
}

const e = (slug: string, name: string, category: Category, muscle: string, cue: string, video: string, steps: string[], image?: string): Exercise =>
  ({ slug, name, category, muscle, cue, video, steps, image });

export const EXERCISES: Exercise[] = [
  e("bench-press", "Barbell Bench Press", "Chest", "Chest", "Elbows ~45°", "hWbUlkb5Ms4", ["Eyes under the bar, shoulder blades pinched", "Grip slightly wider than shoulders", "Lower to mid-chest", "Drive feet, press up and slightly back"], bench),
  e("incline-dumbbell-press", "Incline Dumbbell Press", "Chest", "Upper chest", "30° bench", "8fXfwG4ftaQ", ["Bench at 30–45°", "Dumbbells at chest", "Press up and slightly in", "Lower with a stretch"]),
  e("push-up", "Push-Up", "Chest", "Chest", "Body in one line", "I9fsqKE5XHo", ["Hands under shoulders", "Brace core and glutes", "Lower chest to floor", "Push back up"]),
  e("cable-fly", "Cable Fly", "Chest", "Chest", "Soft elbows", "I-Ue34qLxc4", ["Pulleys at shoulder height", "Step forward, slight lean", "Hug the arms together", "Return slowly"]),
  e("deadlift", "Conventional Deadlift", "Back", "Posterior chain", "Neutral spine", "ZaTM37cfiDs", ["Bar over mid-foot", "Hinge, grip outside legs", "Lats tight, chest up", "Push floor away, lock hips"], deadlift),
  e("barbell-row", "Barbell Row", "Back", "Back", "Pull to belly", "Nqh7q3zDCoQ", ["Hinge to ~45°", "Overhand grip", "Row to lower ribs", "Control the descent"]),
  e("pull-up", "Pull-Up", "Back", "Lats", "Chin over bar", "OEXosPwzFdc", ["Dead hang", "Pull elbows to ribs", "Chin clears bar", "Lower under control"]),
  e("lat-pulldown", "Lat Pulldown", "Back", "Lats", "Chest up", "bNmvKpJSWKM", ["Thighs under pads", "Wide grip, lean back slightly", "Pull to upper chest", "Return to full stretch"]),
  e("back-squat", "Back Squat", "Legs", "Quads & glutes", "Brace the core", "dW3zj79xfrc", ["Bar on upper traps", "Feet shoulder-width", "Sit down and back", "Drive up through mid-foot"], squat),
  e("romanian-deadlift", "Romanian Deadlift", "Legs", "Hamstrings", "Hips back", "5rIqP63yWFg", ["Stand with bar", "Push hips back", "Lower to hamstring stretch", "Drive hips forward"]),
  e("lunges", "Walking Lunges", "Legs", "Legs", "Tall torso", "1cS-6KsJW9g", ["Step forward long", "Back knee toward floor", "Front knee over foot", "Push through front heel"]),
  e("leg-press", "Leg Press", "Legs", "Quads", "Don't lock knees", "nDh_BlnLCGc", ["Feet hip-width on plate", "Lower to 90°", "Press through heels", "Stop short of lockout"]),
  e("calf-raise", "Calf Raise", "Legs", "Calves", "Full stretch", "baEXLy09Ncc", ["Balls of feet on edge", "Drop heels low", "Rise up high", "Pause at top"]),
  e("overhead-press", "Overhead Press", "Shoulders", "Shoulders", "Squeeze glutes", "zoN5EH50Dro", ["Bar on front delts", "Brace", "Press straight up", "Lock out overhead"], ohp),
  e("lateral-raise", "Lateral Raise", "Shoulders", "Side delts", "Lead with elbows", "Kl3LEzQ5Zqs", ["Slight lean forward", "Raise to shoulder height", "Pinkies slightly up", "Lower slowly"]),
  e("face-pull", "Face Pull", "Shoulders", "Rear delts", "Pull to eyes", "IeOqdw9WI90", ["Rope at face height", "Pull apart toward face", "Rotate hands back", "Return controlled"]),
  e("bicep-curl", "Dumbbell Curl", "Biceps", "Biceps", "Elbows pinned", "XE_pHwbst04", ["Stand tall", "Curl without swinging", "Squeeze at top", "Lower slowly"]),
  e("hammer-curl", "Hammer Curl", "Biceps", "Biceps & brachialis", "Neutral grip", "P5sXHLmXmBM", ["Palms facing in", "Curl up", "Squeeze", "Lower slowly"]),
  e("preacher-curl", "Preacher Curl", "Biceps", "Biceps", "Full stretch", "7ixqAPO6JvU", ["Arms on pad", "Curl up", "Squeeze", "Lower to near-straight"]),
  e("tricep-pushdown", "Tricep Pushdown", "Triceps", "Triceps", "Elbows at sides", "1FjkhpZsaxc", ["Cable high", "Elbows tucked", "Push to lockout", "Return to 90°"]),
  e("skull-crusher", "Skull Crusher", "Triceps", "Triceps", "Upper arms still", "iuYB_fLp26Q", ["Lie on bench, bar up", "Lower to forehead", "Elbows in", "Extend back up"]),
  e("close-grip-bench", "Close-Grip Bench Press", "Triceps", "Triceps", "Shoulder-width grip", "UYJsFzqdgK4", ["Grip shoulder-width", "Elbows tucked", "Lower to lower chest", "Press up"]),
  e("tricep-dips", "Tricep Dips", "Triceps", "Triceps", "Stay upright", "Gz8NkGoNPkc", ["Hands on bars/bench", "Lower to 90°", "Elbows back", "Press up"]),
  e("wrist-curl", "Wrist Curl", "Forearms", "Forearm flexors", "Only wrists move", "M8TpHw5aYgA", ["Forearms on thighs", "Palms up", "Curl wrists up", "Lower slowly"]),
  e("reverse-wrist-curl", "Reverse Wrist Curl", "Forearms", "Forearm extensors", "Light weight", "cRLJ86m00cU", ["Palms down", "Lift knuckles up", "Pause", "Lower slowly"]),
  e("farmer-walk", "Farmer Walk", "Forearms", "Grip", "Tall posture", "1uOs1hP3u4A", ["Heavy weights at sides", "Shoulders back", "Walk steady steps", "Set down safely"]),
  e("treadmill-run", "Treadmill Running", "Cardio", "Heart & legs", "Land under hips", "7HkQrFoufhc", ["Warm up walking", "Upright posture", "Short quick strides", "Cool down"]),
  e("jump-rope", "Jump Rope", "Cardio", "Full body", "Small hops", "u3zgHI8QnqE", ["Elbows close", "Turn with wrists", "Stay on balls of feet", "Breathe steady"]),
  e("burpees", "Burpees", "Cardio", "Full body", "Flat back", "qLBImHhCXSw", ["Squat down", "Kick to plank", "Jump feet in", "Jump up"]),
  e("rowing-machine", "Rowing Machine", "Cardio", "Full body", "Legs, body, arms", "ZN0J6qKCIrI", ["Push with legs", "Lean back slightly", "Pull handle to ribs", "Reverse smoothly"]),
  e("sun-salutation", "Sun Salutation", "Yoga", "Full body", "Move with breath", "FPjppcOquE4", ["Mountain pose", "Forward fold", "Plank to cobra", "Downward dog, return"]),
  e("downward-dog", "Downward Dog", "Yoga", "Hamstrings & shoulders", "Hips high", "UsTTTYbBdQg", ["Hands and knees", "Lift hips", "Press heels down", "Long spine"]),
  e("warrior-2", "Warrior II", "Yoga", "Legs & hips", "Knee over ankle", "6Mckvi-vsZw", ["Wide stance", "Bend front knee", "Arms out long", "Gaze over front hand"]),
  e("hamstring-stretch", "Hamstring Stretch", "Stretching", "Hamstrings", "Hinge, don't round", "T_l0AyZywjU", ["Heel forward", "Hinge at hips", "Hold 30s", "Switch sides"]),
  e("hip-flexor-stretch", "Hip Flexor Stretch", "Stretching", "Hip flexors", "Squeeze glute", "ktgtEWGhFd8", ["Half kneel", "Tuck pelvis", "Shift forward", "Hold 30s"]),
  e("chest-stretch", "Doorway Chest Stretch", "Stretching", "Chest", "Gentle lean", "O8rJw_TmC1Y", ["Forearm on door frame", "Step through", "Feel chest open", "Hold 30s"]),
];

export const findExercise = (name: string) => EXERCISES.find((x) => x.name.toLowerCase() === name.toLowerCase());
export const embedUrl = (id: string) => `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1`;
export const videoSearchUrl = (name: string) =>
  `https://www.youtube.com/results?search_query=${encodeURIComponent(name + " proper form tutorial")}`;

/** Epley estimated one-rep max */
export const oneRepMax = (kg: number, reps: number) => (reps <= 0 || kg <= 0 ? 0 : reps === 1 ? kg : kg * (1 + reps / 30));
