import Image from "next/image";
import Link from "next/link";
import { getBikesSorted, getBikeBySlug } from "@/lib/bikes";
import { notFound } from "next/navigation";
import ImageGallery from "./ImageGallery";

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  const bikes = getBikesSorted();
  return bikes
    .filter((b) => b.description)
    .map((b) => ({ slug: b.slug }));
}

export default async function BikePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const bike = getBikeBySlug(decodeURIComponent(slug));
  if (!bike || !bike.description) return notFound();

  const allImages = [bike.mainImage, ...bike.gallery];

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="border-b border-[var(--card-border)]">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="text-sm text-[var(--muted)] hover:text-white transition-colors flex items-center gap-2"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              className="inline"
            >
              <path
                d="M10 12L6 8L10 4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Back to all bikes
          </Link>
          <Link
            href="/submit"
            className="text-sm bg-[var(--accent)] text-black font-semibold px-4 py-1.5 rounded-lg hover:brightness-110 transition"
          >
            List Your Bike
          </Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
        {/* Image Gallery - full width */}
        <div className="mb-10">
          <ImageGallery images={allImages} title={bike.title} />
        </div>

        {/* Details */}
        <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {bike.sold && (
                <span className="inline-block bg-red-500/20 text-red-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Sold
                </span>
              )}
              {bike.ownerName && (
                <span className="inline-block bg-purple-500/20 text-purple-400 text-xs font-bold px-3 py-1 rounded-full tracking-wider">
                  Listed for {bike.ownerName}
                </span>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              {bike.title}
            </h1>

            {!bike.sold && (
              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-[var(--accent)] font-bold text-3xl">
                  {bike.price}
                </span>
                {bike.originalPrice && (
                  <span className="text-[var(--muted)] text-lg line-through">
                    {bike.originalPrice} new
                  </span>
                )}
              </div>
            )}

            {bike.sold && bike.price && (
              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-[var(--muted)] text-xl">
                  Sold for {bike.price}
                </span>
                {bike.originalPrice && (
                  <span className="text-[var(--muted)] text-sm line-through">
                    {bike.originalPrice} new
                  </span>
                )}
              </div>
            )}

            {bike.year && (
              <p className="text-[var(--muted)] text-sm mb-6">
                Year: {bike.year}
              </p>
            )}

            <p className="text-[var(--muted)] text-base leading-relaxed mb-8">
              {bike.description}
            </p>

            {!bike.sold && bike.ownerPhone && (
              <a
                href={`tel:${bike.ownerPhone.replace(/\D/g, "")}`}
                className="inline-flex items-center gap-2 bg-[var(--accent)] text-black font-semibold px-6 py-3 rounded-lg hover:brightness-110 transition-all mb-8"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                Call or Text {bike.ownerName || "Seller"} &mdash; {bike.ownerPhone}
              </a>
            )}

            {/* Specs */}
            {bike.specs.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-4">Specifications</h2>
                <div className="border border-[var(--card-border)] rounded-lg overflow-hidden">
                  {bike.specs.map((spec, i) => (
                    <div
                      key={i}
                      className={`flex py-2.5 px-4 text-sm ${
                        i % 2 === 0 ? "bg-[var(--card-bg)]" : ""
                      }`}
                    >
                      <span className="text-[var(--muted)] w-40 shrink-0">
                        {spec.label}
                      </span>
                      <span>{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

      {/* Footer */}
      <footer className="border-t border-[var(--card-border)] mt-16">
        <div className="max-w-7xl mx-auto px-4 py-8 text-sm text-[var(--muted)] text-center">
          Garage Door Bikes &mdash; Salt Lake City, UT
        </div>
      </footer>
    </main>
  );
}
