"use client";

import { useMemo, useCallback } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import type { ImageItem } from "../../domain/image";
import styles from "./GalleryGrid.module.css";

type Props = {
  items: ImageItem[];
  onOpen: (id: string) => void;
};

export function GalleryGrid({ items, onOpen }: Props) {
  const prefersReducedMotion = useReducedMotion();
  const list = useMemo(() => items, [items]);
  const handleOpen = useCallback((id: string) => onOpen(id), [onOpen]);

  return (
    <div className={styles.grid}>
      {list.map((item) => (
        <motion.button
          key={item.id}
          type="button"
          className={styles.item}
          onClick={() => handleOpen(item.id)}
          initial={
            prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96 }
          }
          whileInView={
            prefersReducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }
          }
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          aria-label={`Open ${item.alt}`}
        >
          <Image
            src={item.src}
            alt={item.alt}
            width={item.width}
            height={item.height}
            loading="lazy"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            style={{ width: "100%", height: "auto", display: "block" }}
          />
          <div className={styles.caption}>
            {item.alt}
            {item.credit ? (
              <span className="ml-2 text-white/60">
                by{" "}
                <a
                  href={item.credit.url}
                  target="_blank"
                  rel="noreferrer"
                  className="underline"
                >
                  {item.credit.author}
                </a>
              </span>
            ) : null}
          </div>
        </motion.button>
      ))}
    </div>
  );
}
