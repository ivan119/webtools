"use client";

import { useMemo, useCallback } from "react";
import { useQueryState, parseAsString } from "nuqs";
import type { ImageItem } from "../../domain/image";
import { GalleryGrid } from "./GalleryGrid";
import { Lightbox } from "../lightbox/Lightbox";
import { FilterBar } from "./FilterBar";

type Props = {
  images: ImageItem[];
};

export function ClientGallery({ images }: Props) {
  const [tagRaw, setTagRaw] = useQueryState(
    "tag",
    parseAsString.withDefault(""),
  );
  const [photoRaw, setPhotoRaw] = useQueryState(
    "photo",
    parseAsString.withDefault(""),
  );

  const tag = tagRaw || undefined;
  const activeId = photoRaw || null;
  const isLightboxOpen = !!activeId;

  const tags = useMemo(() => {
    const set = new Set<string>();
    images.forEach((i) => i.tags.forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [images]);

  const filtered = useMemo(() => {
    if (!tag) return images;
    return images.filter((i) => i.tags.includes(tag));
  }, [images, tag]);

  const handleOpen = useCallback(
    (id: string) => {
      setPhotoRaw(id);
    },
    [setPhotoRaw],
  );

  const handleClose = useCallback(() => {
    setPhotoRaw("");
  }, [setPhotoRaw]);

  return (
    <div className="space-y-6">
      <FilterBar
        tags={tags}
        active={tag}
        onChange={(v) => setTagRaw(v || "")}
      />
      <GalleryGrid items={filtered} onOpen={handleOpen} />
      <Lightbox
        isOpen={isLightboxOpen}
        item={images.find((i) => i.id === activeId) ?? null}
        onClose={handleClose}
      />
    </div>
  );
}
