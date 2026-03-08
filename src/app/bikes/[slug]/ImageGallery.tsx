"use client";

import Image from "next/image";
import { useState, useEffect, useCallback, useRef } from "react";

export default function ImageGallery({
  images,
  title,
}: {
  images: string[];
  title: string;
}) {
  const [selected, setSelected] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const prev = useCallback(() => {
    setSelected((s) => (s === 0 ? images.length - 1 : s - 1));
  }, [images.length]);

  const next = useCallback(() => {
    setSelected((s) => (s === images.length - 1 ? 0 : s + 1));
  }, [images.length]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [prev, next]);

  return (
    <div ref={containerRef}>
      {/* Main image - large */}
      <div className="relative aspect-[3/2] rounded-lg overflow-hidden bg-black mb-3 group cursor-pointer">
        <Image
          src={images[selected]}
          alt={`${title} - photo ${selected + 1}`}
          fill
          className="object-contain"
          sizes="(max-width: 1024px) 100vw, 65vw"
          priority
        />

        {/* Arrow overlays */}
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-0 top-0 bottom-0 w-16 flex items-center justify-start pl-3 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-black/40 to-transparent"
              aria-label="Previous image"
            >
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M15 18L9 12L15 6" />
              </svg>
            </button>
            <button
              onClick={next}
              className="absolute right-0 top-0 bottom-0 w-16 flex items-center justify-end pr-3 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-l from-black/40 to-transparent"
              aria-label="Next image"
            >
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 18L15 12L9 6" />
              </svg>
            </button>

            {/* Image counter */}
            <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2.5 py-1 rounded-full">
              {selected + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className={`relative w-20 h-16 shrink-0 rounded overflow-hidden border-2 transition-colors ${
                i === selected
                  ? "border-[var(--accent)]"
                  : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              <Image
                src={img}
                alt={`${title} thumbnail ${i + 1}`}
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
