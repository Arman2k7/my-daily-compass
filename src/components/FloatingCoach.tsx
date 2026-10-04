import { Link } from "@tanstack/react-router";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Dumbbell, ExternalLink, Grip, X } from "lucide-react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { toast } from "sonner";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const STORAGE_KEY = "cadence-floating-coach-position";
const BUTTON_SIZE = 52;
const EDGE = 14;

type Position = { x: number; y: number };

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), Math.max(min, max));
}

function getDefaultPosition(): Position {
  return {
    x: window.innerWidth - BUTTON_SIZE - EDGE,
    y: window.innerHeight - BUTTON_SIZE - (window.innerWidth < 768 ? 78 : EDGE),
  };
}

function constrainPosition(position: Position): Position {
  const bottomSpace = window.innerWidth < 768 ? 78 : EDGE;
  return {
    x: clamp(position.x, EDGE, window.innerWidth - BUTTON_SIZE - EDGE),
    y: clamp(position.y, 72, window.innerHeight - BUTTON_SIZE - bottomSpace),
  };
}

function readPosition(): Position {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultPosition();
    const parsed = JSON.parse(raw) as Partial<Position>;
    if (typeof parsed.x !== "number" || typeof parsed.y !== "number") return getDefaultPosition();
    return constrainPosition({ x: parsed.x, y: parsed.y });
  } catch {
    return getDefaultPosition();
  }
}

export function FloatingCoach() {
  const [position, setPosition] = useState<Position | null>(null);
  const [open, setOpen] = useState(false);
  const drag = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    origin: Position;
    moved: boolean;
  } | null>(null);
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/coach",
        headers: async (): Promise<Record<string, string>> => {
          const { data } = await supabase.auth.getSession();
          const token = data.session?.access_token;
          return token ? { Authorization: `Bearer ${token}` } : {};
        },
      }),
    [],
  );
  const { messages, sendMessage, status, stop, setMessages } = useChat({
    transport,
    onError: (error) => toast.error(error.message || "Coach couldn't answer. Try again."),
  });
  const busy = status === "submitted" || status === "streaming";

  useEffect(() => {
    setPosition(readPosition());
    const handleResize = () =>
      setPosition((current) => constrainPosition(current ?? getDefaultPosition()));
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!position) return null;

  const panelWidth = Math.min(380, window.innerWidth - 24);
  const panelHeight = Math.min(540, window.innerHeight - 112);
  const panelLeft = clamp(
    position.x + BUTTON_SIZE - panelWidth,
    12,
    window.innerWidth - panelWidth - 12,
  );
  const panelTop = clamp(
    position.y - panelHeight - 12,
    68,
    window.innerHeight - panelHeight - (window.innerWidth < 768 ? 76 : 12),
  );

  const close = () => {
    stop();
    setMessages([]);
    setOpen(false);
  };

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    void sendMessage({ text: trimmed });
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      origin: position,
      moved: false,
    };
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const current = drag.current;
    if (!current || current.pointerId !== event.pointerId) return;
    const dx = event.clientX - current.startX;
    const dy = event.clientY - current.startY;
    if (Math.hypot(dx, dy) > 5) current.moved = true;
    setPosition(constrainPosition({ x: current.origin.x + dx, y: current.origin.y + dy }));
  };

  const onPointerUp = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const current = drag.current;
    if (!current || current.pointerId !== event.pointerId) return;
    event.currentTarget.releasePointerCapture(event.pointerId);
    drag.current = null;
    if (current.moved) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(position));
    else setOpen((value) => !value);
  };

  return (
    <>
      {open && (
        <section
          aria-label="AI Coach chat"
          className="fixed z-40 flex overflow-hidden rounded-lg border border-line bg-panel shadow-2xl"
          style={{ left: panelLeft, top: panelTop, width: panelWidth, height: panelHeight }}
        >
          <div className="flex min-w-0 flex-1 flex-col">
            <header className="flex h-14 shrink-0 items-center gap-3 border-b border-line px-4">
              <span className="grid size-8 place-items-center rounded-md bg-brand text-ink">
                <Dumbbell className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="font-display text-sm font-semibold text-strong">Cadence Coach</h2>
                <p className="truncate text-[11px] text-muted-foreground">
                  Personal advice from your recent logs
                </p>
              </div>
              <Button asChild variant="ghost" size="icon-sm" title="Open full Coach">
                <Link to="/coach" onClick={close}>
                  <ExternalLink className="size-4" />
                  <span className="sr-only">Open full Coach</span>
                </Link>
              </Button>
              <Button variant="ghost" size="icon-sm" onClick={close} title="Close Coach">
                <X className="size-4" />
                <span className="sr-only">Close Coach</span>
              </Button>
            </header>

            <Conversation className="min-h-0 flex-1 bg-ink/40">
              <ConversationContent className="gap-5 p-4">
                {messages.length === 0 ? (
                  <ConversationEmptyState
                    className="min-h-64 p-5"
                    title="What can I help with?"
                    description="Ask about meals, training, study habits or books."
                    icon={<Dumbbell className="size-7" />}
                  />
                ) : (
                  messages.map((message) => (
                    <Message key={message.id} from={message.role}>
                      <MessageContent
                        className={
                          message.role === "user" ? "bg-primary text-primary-foreground" : ""
                        }
                      >
                        {message.parts.map((part, index) =>
                          part.type === "text" ? (
                            <MessageResponse key={index}>{part.text}</MessageResponse>
                          ) : null,
                        )}
                      </MessageContent>
                    </Message>
                  ))
                )}
                {status === "submitted" && (
                  <p className="text-[12px] text-muted-foreground animate-pulse">
                    Coach is thinking…
                  </p>
                )}
              </ConversationContent>
              <ConversationScrollButton />
            </Conversation>

            <PromptInput onSubmit={(message) => send(message.text)} className="m-3 mt-2 shrink-0">
              <PromptInputTextarea placeholder="Ask your coach…" className="min-h-14" />
              <PromptInputFooter className="justify-end">
                <PromptInputSubmit status={status} onStop={stop} />
              </PromptInputFooter>
            </PromptInput>
          </div>
        </section>
      )}

      <Button
        aria-label={open ? "Close AI Coach" : "Open AI Coach"}
        title="Drag to move · tap to chat"
        className="fixed z-50 size-[52px] touch-none rounded-full bg-brand p-0 text-ink shadow-glow"
        style={{ left: position.x, top: position.y }}
        onClick={(event) => {
          if (event.detail === 0) setOpen((value) => !value);
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={() => {
          drag.current = null;
        }}
      >
        {open ? <X className="size-5" /> : <Dumbbell className="size-5" />}
        <Grip className="absolute -right-1 -top-1 size-4 rounded-full bg-panel p-0.5 text-muted-foreground" />
      </Button>
    </>
  );
}
