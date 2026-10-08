import { useState } from "react";
import { useGroceryActions, useGroceryItems } from "@/lib/data";
import { Panel, PanelHead, inputCls } from "./ui-kit";
import { cn } from "@/lib/utils";

export function GroceryList() {
  const { data: items = [] } = useGroceryItems();
  const { add, toggle, remove, clearDone } = useGroceryActions();
  const [name, setName] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    add.mutate([{ name: name.trim(), category: "other" }], { onSuccess: () => setName("") });
  };

  const open = items.filter((i) => !i.done).length;

  return (
    <Panel>
      <PanelHead
        title="Grocery list"
        sub={open ? `${open} to buy` : "All done"}
        right={
          items.some((i) => i.done) ? (
            <button
              onClick={() => clearDone.mutate()}
              className="rounded-lg border border-line px-3 py-1.5 text-[12px] text-muted-foreground hover:text-strong"
            >
              Clear done
            </button>
          ) : undefined
        }
      />
      <div className="mt-4 space-y-1 text-[13px]">
        {items.length === 0 && (
          <p className="text-muted-foreground">
            Empty. Add items yourself or tap "Add to grocery list" on the meal planner.
          </p>
        )}
        {items.map((i) => (
          <div key={i.id} className="group flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-ink">
            <button
              onClick={() => toggle.mutate({ id: i.id, done: !i.done })}
              aria-label={i.done ? `Mark ${i.name} as to buy` : `Mark ${i.name} as bought`}
              className={cn(
                "grid size-5 shrink-0 place-items-center rounded-md border text-[11px]",
                i.done ? "border-mint bg-mint/20 text-mint" : "border-line text-transparent",
              )}
            >
              ✓
            </button>
            <span className={cn("flex-1", i.done ? "text-muted-foreground line-through" : "text-foreground")}>
              {i.name}
            </span>
            <button
              onClick={() => remove.mutate(i.id)}
              className="text-muted-foreground opacity-0 transition group-hover:opacity-100 hover:text-destructive"
              aria-label={`Remove ${i.name}`}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
      <form onSubmit={submit} className="mt-4 flex gap-2">
        <input
          className={cn(inputCls, "flex-1")}
          placeholder="Add item, e.g. paneer 500g"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button
          disabled={add.isPending}
          className="rounded-lg border border-line px-4 py-2 text-[13px] font-semibold text-strong"
        >
          Add
        </button>
      </form>
    </Panel>
  );
}
