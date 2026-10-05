import { useEffect } from "react";
import { embedUrl, type Exercise } from "@/lib/exercises";

export function VideoModal({ ex, onClose }: { ex: Exercise | null; onClose: () => void }) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [onClose]);
  if (!ex?.video) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/90 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-3xl overflow-hidden rounded-2xl border border-line bg-panel" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{ex.category} · {ex.muscle}</p>
            <h3 className="font-semibold text-strong">{ex.name}</h3>
          </div>
          <button onClick={onClose} aria-label="Close video" className="rounded-lg border border-line px-3 py-1.5 text-[13px] text-strong">✕</button>
        </div>
        <div className="aspect-video w-full bg-ink">
          <iframe
            src={embedUrl(ex.video)}
            title={`${ex.name} form`}
            className="h-full w-full"
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        <ol className="grid list-decimal gap-1 py-4 pr-5 pl-10 text-[13px] text-muted-foreground sm:grid-cols-2">
          {ex.steps.map((s) => <li key={s}>{s}</li>)}
        </ol>
      </div>
    </div>
  );
}
