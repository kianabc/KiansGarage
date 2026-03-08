"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { randomUUID } from "@/lib/uuid";

export default function SubmitPage() {
  const [form, setForm] = useState({
    ownerName: "",
    ownerPhone: "",
    title: "",
    description: "",
    price: "",
    originalPrice: "",
    year: "",
    specs: "",
  });
  const [photos, setPhotos] = useState<{ file: File; preview: string }[]>([]);
  const [uploadId] = useState(() => randomUUID());
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  const addFiles = useCallback((files: FileList | File[]) => {
    const newPhotos = Array.from(files)
      .filter((f) => f.type.startsWith("image/"))
      .map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }));
    setPhotos((prev) => [...prev, ...newPhotos]);
  }, []);

  function removePhoto(index: number) {
    setPhotos((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  }

  function handleDragEnter(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    setDragging(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) setDragging(false);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current = 0;
    setDragging(false);
    if (e.dataTransfer.files.length) {
      addFiles(e.dataTransfer.files);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      // Upload photos first
      let mainImage = "";
      let gallery: string[] = [];

      if (photos.length > 0) {
        const formData = new FormData();
        formData.set("uploadId", uploadId);
        photos.forEach((p) => formData.append("photos", p.file));

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) {
          const data = await uploadRes.json();
          setError(data.error || "Photo upload failed");
          setSubmitting(false);
          return;
        }

        const { paths } = await uploadRes.json();
        mainImage = paths[0] || "";
        gallery = paths.slice(1);
      }

      // Parse specs
      const specs = form.specs
        .split("\n")
        .filter((line) => line.includes(":"))
        .map((line) => {
          const colonIndex = line.indexOf(":");
          return {
            label: line.slice(0, colonIndex).trim(),
            value: line.slice(colonIndex + 1).trim(),
          };
        });

      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ownerName: form.ownerName,
          ownerPhone: form.ownerPhone,
          title: form.title,
          description: form.description,
          price: form.price,
          originalPrice: form.originalPrice,
          year: form.year,
          specs,
          mainImage,
          gallery,
        }),
      });

      if (res.ok) {
        setSubmitted(true);
      } else {
        const data = await res.json();
        setError(data.error || "Something went wrong");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    }

    setSubmitting(false);
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg p-8 max-w-md text-center">
          <div className="text-[var(--accent)] text-4xl mb-4">&#10003;</div>
          <h1 className="text-xl font-bold mb-2">Bike Submitted!</h1>
          <p className="text-[var(--muted)]">
            Your listing has been submitted for review. Kian will review it and
            get it listed once approved. He&apos;ll reach out if he has any
            questions.
          </p>
          <Link
            href="/"
            className="inline-block mt-6 text-sm text-[var(--accent)] hover:underline"
          >
            Back to Garage Door Bikes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen">
      <header className="border-b border-[var(--card-border)]">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tight">
            Garage Door Bikes
          </Link>
          <Link
            href="/"
            className="text-sm text-[var(--muted)] hover:text-white transition-colors"
          >
            Browse Bikes
          </Link>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-2">Submit Your Bike</h1>
        <p className="text-[var(--muted)] mb-8">
          Fill in the details below and Kian will review your listing. Once
          approved, it&apos;ll go live on the site. Your name will be shown on
          the listing so buyers know who owns the bike.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Photo Drop Zone */}
          <div>
            <label className="block text-sm text-[var(--muted)] mb-2">
              Photos *
            </label>
            <div
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                dragging
                  ? "border-[var(--accent)] bg-[var(--accent)]/5"
                  : "border-[var(--card-border)] hover:border-[var(--muted)]"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={(e) => {
                  if (e.target.files) addFiles(e.target.files);
                  e.target.value = "";
                }}
                className="hidden"
              />
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mx-auto mb-3 text-[var(--muted)]"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              <p className="text-[var(--muted)] text-sm">
                <span className="text-white font-medium">
                  Drop photos here
                </span>{" "}
                or click to browse
              </p>
              <p className="text-[var(--muted)] text-xs mt-1">
                JPEG, PNG, or WebP &middot; up to 15MB each
              </p>
            </div>

            {/* Photo Previews */}
            {photos.length > 0 && (
              <div className="mt-3">
                <p className="text-xs text-[var(--muted)] mb-2">
                  {photos.length} photo{photos.length !== 1 ? "s" : ""} &middot;
                  First photo will be the main image. Drag to reorder (or remove
                  and re-add).
                </p>
                <div className="flex gap-2 flex-wrap">
                  {photos.map((photo, i) => (
                    <div key={i} className="relative group">
                      <div className="relative w-24 h-20 rounded overflow-hidden border border-[var(--card-border)]">
                        <Image
                          src={photo.preview}
                          alt={`Photo ${i + 1}`}
                          fill
                          className="object-cover"
                          sizes="96px"
                        />
                        {i === 0 && (
                          <div className="absolute bottom-0 left-0 right-0 bg-[var(--accent)] text-black text-[10px] font-bold text-center py-0.5">
                            MAIN
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removePhoto(i);
                        }}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-600 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-[var(--muted)] mb-1">
                Your Name *
              </label>
              <input
                type="text"
                name="ownerName"
                value={form.ownerName}
                onChange={handleChange}
                required
                placeholder="John"
                className="w-full bg-black border border-[var(--card-border)] rounded px-3 py-2 text-sm focus:outline-none focus:border-[var(--accent)]"
              />
            </div>
            <div>
              <label className="block text-sm text-[var(--muted)] mb-1">
                Your Phone Number *
              </label>
              <input
                type="tel"
                name="ownerPhone"
                value={form.ownerPhone}
                onChange={handleChange}
                required
                placeholder="(801) 555-1234"
                className="w-full bg-black border border-[var(--card-border)] rounded px-3 py-2 text-sm focus:outline-none focus:border-[var(--accent)]"
              />
            </div>
            <div>
              <label className="block text-sm text-[var(--muted)] mb-1">
                Bike Title *
              </label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                required
                placeholder="Santa Cruz Bronson"
                className="w-full bg-black border border-[var(--card-border)] rounded px-3 py-2 text-sm focus:outline-none focus:border-[var(--accent)]"
              />
            </div>
            <div>
              <label className="block text-sm text-[var(--muted)] mb-1">
                Asking Price *
              </label>
              <input
                type="text"
                name="price"
                value={form.price}
                onChange={handleChange}
                required
                placeholder="$2,500"
                className="w-full bg-black border border-[var(--card-border)] rounded px-3 py-2 text-sm focus:outline-none focus:border-[var(--accent)]"
              />
            </div>
            <div>
              <label className="block text-sm text-[var(--muted)] mb-1">
                Original Price (new)
              </label>
              <input
                type="text"
                name="originalPrice"
                value={form.originalPrice}
                onChange={handleChange}
                placeholder="$5,000"
                className="w-full bg-black border border-[var(--card-border)] rounded px-3 py-2 text-sm focus:outline-none focus:border-[var(--accent)]"
              />
            </div>
            <div>
              <label className="block text-sm text-[var(--muted)] mb-1">
                Year
              </label>
              <input
                type="text"
                name="year"
                value={form.year}
                onChange={handleChange}
                placeholder="2023"
                className="w-full bg-black border border-[var(--card-border)] rounded px-3 py-2 text-sm focus:outline-none focus:border-[var(--accent)]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-[var(--muted)] mb-1">
              Description *
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              required
              rows={5}
              placeholder="Tell potential buyers about this bike. Condition, upgrades, why you're selling, etc."
              className="w-full bg-black border border-[var(--card-border)] rounded px-3 py-2 text-sm focus:outline-none focus:border-[var(--accent)]"
            />
          </div>

          <div>
            <label className="block text-sm text-[var(--muted)] mb-1">
              Specs (one per line, &quot;Label: Value&quot; format)
            </label>
            <textarea
              name="specs"
              value={form.specs}
              onChange={handleChange}
              rows={6}
              placeholder={`Size: Medium\nFrame: Carbon, 2023\nFork: Fox 36, 160mm\nDrivetrain: SRAM GX Eagle\nBrakes: SRAM Code RS\nWheelset: DT Swiss E1900`}
              className="w-full bg-black border border-[var(--card-border)] rounded px-3 py-2 text-sm font-mono focus:outline-none focus:border-[var(--accent)]"
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={submitting || photos.length === 0}
            className="bg-[var(--accent)] text-black font-semibold px-6 py-3 rounded-lg hover:brightness-110 transition disabled:opacity-50"
          >
            {submitting ? "Uploading & Submitting..." : "Submit for Review"}
          </button>
          {photos.length === 0 && (
            <p className="text-xs text-[var(--muted)] -mt-2">
              Add at least one photo to submit.
            </p>
          )}
        </form>
      </div>
    </main>
  );
}
