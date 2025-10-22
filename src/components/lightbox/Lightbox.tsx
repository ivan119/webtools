"use client";

import * as Dialog from "@radix-ui/react-dialog";
import Image from "next/image";
import { useEffect, useMemo } from "react";
import styles from "./Lightbox.module.css";
import type { ImageItem } from "../../domain/image";

type Props = {
  isOpen: boolean;
  item: ImageItem | null;
  onClose: () => void;
};

export function Lightbox({ isOpen, item, onClose }: Props) {
  const current = useMemo(() => item, [item]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className={styles.overlay} />
        <div
          className="fixed inset-0 grid place-items-center p-4"
          aria-live="polite"
        >
          <Dialog.Content
            className="outline-none"
            aria-label={current ? current.alt : "Lightbox"}
          >
            <Dialog.Title className="sr-only">
              {current ? current.alt : "Lightbox"}
            </Dialog.Title>
            {current ? (
              <div className={styles.imageWrap}>
                <Image
                  src={current.src}
                  alt={current.alt}
                  width={current.width}
                  height={current.height}
                  sizes="90vw"
                  style={{ width: "100%", height: "auto" }}
                />
                {current.credit ? (
                  <p className="mt-3 text-center text-white/70 text-sm">
                    Photo by{" "}
                    <a
                      className="underline"
                      href={current.credit.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {current.credit.author}
                    </a>{" "}
                    on Pexels
                  </p>
                ) : null}
              </div>
            ) : null}
          </Dialog.Content>
        </div>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
