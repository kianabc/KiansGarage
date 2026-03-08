"use client";

import Image from "next/image";
import { useState } from "react";

export default function ImageGallery({
  images,
  title,
}: {
  images: string[];
  title: string;
}) {
  const [selected, setSelected] = useState(0);

  return (
    <div>
      <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-black mb-3">
        <Image
          src={images[selected]}
          alt={`${title} - photo ${selected + 1}`}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority
        />
      </div>
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
