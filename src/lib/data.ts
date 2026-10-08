import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type DailyLog = Database["public"]["Tables"]["daily_logs"]["Row"];
export type Meal = Database["public"]["Tables"]["meals"]["Row"];
export type WorkoutSet = Database["public"]["Tables"]["workout_sets"]["Row"];
export type RoutineTask = Database["public"]["Tables"]["routine_tasks"]["Row"];

const must = <T,>(r: { data: T | null; error: unknown }) => {
  if (r.error) throw r.error;
  return r.data as T;
};

// ---------- daily log ----------
export function useDailyLog(date: string) {
  return useQuery({
    queryKey: ["daily", date],
    queryFn: async () =>
      must(await supabase.from("daily_logs").select("*").eq("log_date", date).maybeSingle()) as DailyLog | null,
  });
}

export function useUpsertDaily(date: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (patch: Partial<DailyLog>) => {
      return must(
        await supabase
          .from("daily_logs")
          .upsert({ ...patch, log_date: date, user_id: OWNER_ID }, { onConflict: "user_id,log_date" })
          .select()
          .single(),
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["daily", date] });
      qc.invalidateQueries({ queryKey: ["range"] });
    },
  });
}

// ---------- routine ----------
export function useRoutine(date: string) {
  return useQuery({
    queryKey: ["routine", date],
    queryFn: async () => {
      const tasks = must(await supabase.from("routine_tasks").select("*").order("created_at")) as RoutineTask[];
      const checks = must(await supabase.from("routine_checks").select("task_id").eq("check_date", date)) as { task_id: string }[];
      const done = new Set(checks.map((c) => c.task_id));
      return tasks.map((t) => ({ ...t, done: done.has(t.id) }));
    },
  });
}

export function useRoutineActions(date: string) {
  const qc = useQueryClient();
  const inv = () => qc.invalidateQueries({ queryKey: ["routine"] });
  return {
    add: useMutation({
      mutationFn: async (title: string) => must(await supabase.from("routine_tasks").insert({ title })),
      onSuccess: inv,
    }),
    remove: useMutation({
      mutationFn: async (id: string) => must(await supabase.from("routine_tasks").delete().eq("id", id)),
      onSuccess: inv,
    }),
    toggle: useMutation({
      mutationFn: async ({ id, done }: { id: string; done: boolean }) => {
        if (done) return must(await supabase.from("routine_checks").delete().eq("task_id", id).eq("check_date", date));
        return must(await supabase.from("routine_checks").insert({ task_id: id, check_date: date }));
      },
      onSuccess: inv,
    }),
  };
}

// ---------- meals ----------
export function useMeals(date: string) {
  return useQuery({
    queryKey: ["meals", date],
    queryFn: async () =>
      must(await supabase.from("meals").select("*").eq("log_date", date).order("created_at")) as Meal[],
  });
}

export function useMealActions() {
  const qc = useQueryClient();
  const inv = () => qc.invalidateQueries({ queryKey: ["meals"] });
  return {
    add: useMutation({
      mutationFn: async (m: Database["public"]["Tables"]["meals"]["Insert"]) => must(await supabase.from("meals").insert(m)),
      onSuccess: inv,
    }),
    update: useMutation({
      mutationFn: async ({ id, ...patch }: Partial<Meal> & { id: string }) =>
        must(await supabase.from("meals").update(patch).eq("id", id)),
      onSuccess: inv,
    }),
    remove: useMutation({
      mutationFn: async (id: string) => must(await supabase.from("meals").delete().eq("id", id)),
      onSuccess: inv,
    }),
  };
}

// ---------- workouts ----------
export function useWorkoutSets(date: string) {
  return useQuery({
    queryKey: ["sets", date],
    queryFn: async () =>
      must(await supabase.from("workout_sets").select("*").eq("log_date", date).order("created_at")) as WorkoutSet[],
  });
}

export function useWorkoutActions() {
  const qc = useQueryClient();
  const inv = () => {
    qc.invalidateQueries({ queryKey: ["sets"] });
    qc.invalidateQueries({ queryKey: ["range"] });
  };
  return {
    add: useMutation({
      mutationFn: async (s: Database["public"]["Tables"]["workout_sets"]["Insert"]) =>
        must(await supabase.from("workout_sets").insert(s)),
      onSuccess: inv,
    }),
    remove: useMutation({
      mutationFn: async (id: string) => must(await supabase.from("workout_sets").delete().eq("id", id)),
      onSuccess: inv,
    }),
  };
}

// ---------- ranges for reports ----------
export function useRange(from: string, to: string) {
  return useQuery({
    queryKey: ["range", from, to],
    queryFn: async () => {
      const logs = must(
        await supabase.from("daily_logs").select("*").gte("log_date", from).lte("log_date", to).order("log_date"),
      ) as DailyLog[];
      const sets = must(
        await supabase.from("workout_sets").select("*").gte("log_date", from).lte("log_date", to).order("log_date"),
      ) as WorkoutSet[];
      return { logs, sets };
    },
  });
}
