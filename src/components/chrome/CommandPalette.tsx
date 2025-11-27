"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useEffect, useMemo, useState } from "react";
import { tools } from "../../data/tools";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const results = useMemo(() => {
    if (!q) return tools;
    const term = q.toLowerCase();
    return tools.filter(
      (t) =>
        t.title.toLowerCase().includes(term) ||
        t.desc.toLowerCase().includes(term)
    );
  }, [q]);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        <div className="fixed inset-0 grid place-items-start p-4 pt-24">
          <Dialog.Content className="mx-auto w-full max-w-xl rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-3 outline-none">
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search tools…"
              className="w-full bg-transparent px-3 py-2 outline-none text-slate-200"
            />
            <div className="max-h-80 overflow-auto mt-2">
              {results.map((r) => (
                <a
                  key={r.id}
                  href={r.href}
                  className="block px-3 py-2 rounded-md hover:bg-white/5"
                >
                  <div className="text-slate-100 text-sm">{r.title}</div>
                  <div className="text-slate-400 text-xs">{r.desc}</div>
                </a>
              ))}
              {results.length === 0 ? (
                <div className="px-3 py-6 text-center text-slate-400 text-sm">
                  No results
                </div>
              ) : null}
            </div>
          </Dialog.Content>
        </div>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
