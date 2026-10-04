import { createFileRoute } from "@tanstack/react-router";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useMemo } from "react";
import { toast } from "sonner";
import { Dumbbell } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Conversation, ConversationContent, ConversationEmptyState, ConversationScrollButton } from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import { PromptInput, PromptInputFooter, PromptInputSubmit, PromptInputTextarea } from "@/components/ai-elements/prompt-input";

export const Route = createFileRoute("/_authenticated/coach")({
  head: () => ({
    meta: [
      { title: "Coach — Cadence" },
      { name: "description", content: "Ask your AI coach about diet, workouts, study habits and books." },
      { property: "og:title", content: "Coach — Cadence" },
      { property: "og:description", content: "Ask your AI coach about diet, workouts, study habits and books." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Coach,
});

const SUGGESTIONS = [
  "How was my protein this week?",
  "Plan tomorrow's meals for muscle gain",
  "Give me a 4-day gym split",
  "Recommend 3 books on focus and habits",
];

function Coach() {
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/coach",
        headers: async (): Promise<Record<string, string>> => {
          const { data } = await supabase.auth.getSession();
          const t = data.session?.access_token;
          return t ? { Authorization: `Bearer ${t}` } : {};
        },
      }),
    [],
  );
  const { messages, sendMessage, status, stop } = useChat({
    transport,
    onError: (e) => toast.error(e.message || "Coach couldn't answer. Try again."),
  });
  const busy = status === "submitted" || status === "streaming";
  const send = (text: string) => {
    if (!text.trim() || busy) return;
    void sendMessage({ text: text.trim() });
  };

  return (
    <main className="mx-auto flex h-[calc(100dvh-8rem)] max-w-3xl flex-col px-5 pb-20 pt-6 md:px-8 md:pb-6">
      <div className="mb-4 flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-xl bg-brand text-ink shadow-glow"><Dumbbell className="size-5" /></span>
        <div>
          <h1 className="font-display text-xl font-semibold text-strong">Coach</h1>
          <p className="text-[12px] text-muted-foreground">Knows your last 14 days of logs · chat clears when you leave</p>
        </div>
      </div>

      <Conversation className="flex-1 rounded-2xl border border-line bg-ink/40">
        <ConversationContent>
          {messages.length === 0 ? (
            <ConversationEmptyState title="Ask me anything" description="Diet, training, study habits, books — or how you're doing lately.">
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {SUGGESTIONS.map((s) => (
                  <button key={s} onClick={() => send(s)} className="rounded-full border border-line px-3 py-1.5 text-[12px] text-strong hover:border-cyan/60">
                    {s}
                  </button>
                ))}
              </div>
            </ConversationEmptyState>
          ) : (
            messages.map((m) => (
              <Message key={m.id} from={m.role}>
                <MessageContent className={m.role === "user" ? "bg-primary text-primary-foreground" : ""}>
                  {m.parts.map((p, i) => (p.type === "text" ? <MessageResponse key={i}>{p.text}</MessageResponse> : null))}
                </MessageContent>
              </Message>
            ))
          )}
          {status === "submitted" && <p className="px-2 text-[13px] text-muted-foreground animate-pulse">Coach is thinking…</p>}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <PromptInput onSubmit={(m) => send(m.text)} className="mt-3">
        <PromptInputTextarea placeholder="Ask about meals, workouts, books…" />
        <PromptInputFooter className="justify-end">
          <PromptInputSubmit status={status} onStop={stop} />
        </PromptInputFooter>
      </PromptInput>
    </main>
  );
}
