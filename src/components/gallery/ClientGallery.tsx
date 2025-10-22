"use client";

import { useEffect, useMemo, useCallback } from "react";
import { useQueryState, parseAsString } from "nuqs";
import type { ImageItem } from "../../domain/image";
import { useUiStore } from "../../stores/ui";
import { GalleryGrid } from "./GalleryGrid";
import { Lightbox } from "../lightbox/Lightbox";
import { FilterBar } from "./FilterBar";

type Props = {
  images: ImageItem[];
};

export function ClientGallery({ images }: Props) {
  const { isLightboxOpen, activeId, openLightbox, closeLightbox } =
    useUiStore();

  const [tagRaw, setTagRaw] = useQueryState(
    "tag",
    parseAsString.withDefault("")
  );
  const [photoRaw, setPhotoRaw] = useQueryState(
    "photo",
    parseAsString.withDefault("")
  );
  const tag = tagRaw || undefined;
  const photo = photoRaw || undefined;

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
      openLightbox(id);
      setPhotoRaw(id);
    },
    [openLightbox, setPhotoRaw]
  );

  const handleClose = useCallback(() => {
    closeLightbox();
    setPhotoRaw("");
  }, [closeLightbox, setPhotoRaw]);

  useEffect(() => {
    if (photo && photo !== activeId) openLightbox(photo);
    if (!photo && isLightboxOpen) closeLightbox();
  }, [photo, activeId, isLightboxOpen, openLightbox, closeLightbox]);

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
