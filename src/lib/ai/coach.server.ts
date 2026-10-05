import { createOpenAI } from "@ai-sdk/openai";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import {
  createLovableAiGatewayRunIdFetch,
  getLovableAiGatewayRunId,
  withLovableAiGatewayRunIdHeader,
} from "./run-id.server";

const MODEL = "openai/gpt-6-astra";

async function buildContext(token: string) {
  const sb = createClient<Database>(process.env["SUPABASE_URL"]!, process.env["SUPABASE_PUBLISHABLE_KEY"]!, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: u, error } = await sb.auth.getUser(token);
  if (error || !u.user) return null;
  const from = new Date(Date.now() - 14 * 864e5).toISOString().slice(0, 10);
  const [logs, meals, sets, tasks] = await Promise.all([
    sb.from("daily_logs").select("log_date,college_hours,study_hours,gym_hours,attended,water_ml,water_goal_ml").gte("log_date", from).order("log_date"),
    sb.from("meals").select("log_date,meal_type,description,protein_g,calories").gte("log_date", from).order("log_date"),
    sb.from("workout_sets").select("log_date,exercise,sets,reps,weight_kg").gte("log_date", from).order("log_date"),
    sb.from("routine_tasks").select("title"),
  ]);
  return JSON.stringify({
    daily_logs: logs.data ?? [],
    meals: meals.data ?? [],
    workout_sets: sets.data ?? [],
    habits: (tasks.data ?? []).map((t) => t.title),
  });
}

export async function handleCoach(request: Request) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return new Response("Unauthorized", { status: 401 });
  const body = (await request.json().catch(() => null)) as { messages?: UIMessage[] } | null;
  if (!body?.messages?.length) return new Response("Bad request", { status: 400 });

  const ctx = await buildContext(token);
  if (ctx === null) return new Response("Unauthorized", { status: 401 });

  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) return new Response("AI is not configured", { status: 500 });

  const runIdFetch = createLovableAiGatewayRunIdFetch(getLovableAiGatewayRunId(request));
  const provider = createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: runIdFetch.fetch,
  });

  const today = new Date().toISOString().slice(0, 10);
  const result = streamText({
    model: provider.responses(MODEL),
    system: `You are Coach, the friendly personal assistant inside Cadence — a private life tracker for a student covering study/college hours, skills, water, meals and gym training.
Help with anything: diet and meal ideas, protein targets, workouts and form, training plans, study habits, book recommendations, motivation, and questions about how to use the app (pages: Today, Nutrition, Workouts (includes the exercise library with form videos), Reports, Coach).
Today is ${today}. Below is the user's logged data for the last 14 days (JSON). Use it to personalise advice and cite specific numbers when relevant. If data is empty, say so briefly and give general advice.
Be concise and practical: short paragraphs or bullet lists, concrete foods/exercises/titles. You are not a doctor; suggest seeing a professional for medical issues.
DATA: ${ctx}`,
    messages: await convertToModelMessages(body.messages),
    abortSignal: request.signal,
    providerOptions: {
      openai: {
        store: false,
        forceReasoning: true,
        reasoningEffort: "low",
        reasoningSummary: "auto",
        include: ["reasoning.encrypted_content"],
      },
    },
  });

  return withLovableAiGatewayRunIdHeader(
    result.toUIMessageStreamResponse({
      originalMessages: body.messages,
      onError: (e) => {
        const status = (e as { statusCode?: number })?.statusCode;
        if (status === 402) return "AI credits are used up. Add credits in workspace billing to keep chatting.";
        if (status === 429) return "Too many requests right now — wait a moment and try again.";
        console.error(e);
        return "Coach couldn't answer that. Please try again.";
      },
    }),
    runIdFetch,
  );
}
