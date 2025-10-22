"use client";

import * as ToggleGroup from "@radix-ui/react-toggle-group";
import { useMemo } from "react";

type Props = {
  tags: string[];
  active?: string;
  onChange: (tag: string | undefined) => void;
};

export function FilterBar({ tags, active, onChange }: Props) {
  const allTags = useMemo(() => ["all", ...tags], [tags]);

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <ToggleGroup.Root
        type="single"
        value={active ?? "all"}
        onValueChange={(v) => onChange(v === "all" ? undefined : v)}
        className="inline-flex rounded-lg bg-white/5 p-1 border border-white/10 backdrop-blur"
        aria-label="Filter images by tag"
      >
        {allTags.map((tag) => (
          <ToggleGroup.Item
            key={tag}
            value={tag}
            className="px-3 py-1.5 rounded-md text-sm text-white/80 data-[state=on]:bg-white/15"
          >
            {tag}
          </ToggleGroup.Item>
        ))}
      </ToggleGroup.Root>
    </div>
  );
}
