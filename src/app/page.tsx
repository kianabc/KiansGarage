import Image from "next/image";
import Link from "next/link";
import { getBikesSorted } from "@/lib/bikes";

export const dynamic = "force-dynamic";

export default function Home() {
  const bikes = getBikesSorted();
  const available = bikes.filter((b) => !b.sold);
  const sold = bikes.filter((b) => b.sold);

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="border-b border-[var(--card-border)]">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tight">
            Garage Door Bikes
          </Link>
          <Link
            href="/submit"
            className="text-sm bg-[var(--accent)] text-black font-semibold px-4 py-1.5 rounded-lg hover:brightness-110 transition"
          >
            List Your Bike
          </Link>
        </div>
      </header>

      {/* Hero / Story */}
      <section className="max-w-7xl mx-auto px-4 py-16 md:py-24">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
          Every bike vetted.
          <br />
          <span className="text-[var(--accent)]">No junk gets through.</span>
        </h1>
        <div className="max-w-2xl space-y-4 text-[var(--muted)] text-lg leading-relaxed">
          <p>
            Garage Door Bikes is a curated marketplace where riders sell to
            riders. Every listing is personally inspected and approved before it
            goes live. If a bike doesn&apos;t meet the standard, it doesn&apos;t
            make the cut.
          </p>
          <p>
            No mystery Craigslist specials. No misleading photos. Just quality
            bikes from people who actually ride them, backed by a community that
            holds the bar high.
          </p>
        </div>
      </section>

      {/* Available Bikes */}
      {available.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 pb-16">
          <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
            <span className="inline-block w-3 h-3 rounded-full bg-[var(--accent)]" />
            Available Now
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {available.map((bike) => (
              <BikeCard key={bike.id} bike={bike} />
            ))}
          </div>
        </section>
      )}

      {/* Sold Bikes */}
      {sold.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 pb-16">
          <h2 className="text-2xl font-bold mb-2 text-[var(--muted)]">
            Previously Sold
          </h2>
          <p className="text-sm text-[var(--muted)] mb-8">
            A track record of quality bikes that found great homes.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {sold.map((bike) => (
              <SoldBikeCard key={bike.id} bike={bike} />
            ))}
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-[var(--card-border)] mt-8">
        <div className="max-w-7xl mx-auto px-4 py-8 text-sm text-[var(--muted)] text-center">
          Garage Door Bikes &mdash; Salt Lake City, UT
        </div>
      </footer>
    </main>
  );
}

function BikeCard({
  bike,
}: {
  bike: { slug: string; mainImage: string; title: string; price: string; originalPrice: string; year: string; ownerName: string };
}) {
  return (
    <Link
      href={`/bikes/${bike.slug}`}
      className="group block bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg overflow-hidden hover:border-[var(--accent)] transition-colors"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-black">
        <Image
          src={bike.mainImage}
          alt={bike.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        {bike.ownerName && (
          <div className="absolute top-2 right-2">
            <span className="bg-purple-600/90 text-white text-xs font-medium px-2.5 py-1 rounded-full shadow-lg">
              Listed for {bike.ownerName}
            </span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg leading-tight mb-2">
          {bike.title}
        </h3>
        <div className="flex items-baseline gap-2">
          <span className="text-[var(--accent)] font-bold text-xl">
            {bike.price}
          </span>
          {bike.originalPrice && (
            <span className="text-[var(--muted)] text-sm line-through">
              {bike.originalPrice}
            </span>
          )}
        </div>
        {bike.year && (
          <p className="text-[var(--muted)] text-sm mt-1">{bike.year}</p>
        )}
      </div>
    </Link>
  );
}

function SoldBikeCard({
  bike,
}: {
  bike: { slug: string; mainImage: string; title: string; description: string };
}) {
  const hasDetail = bike.description.length > 0;
  const className =
    "group block bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg overflow-hidden hover:border-[var(--muted)] transition-colors";

  const content = (
    <>
      <div className="relative aspect-[4/3] overflow-hidden bg-black">
        <Image
          src={bike.mainImage}
          alt={bike.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 50vw, 25vw"
        />
        <div className="absolute top-2 left-2">
          <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">
            Sold
          </span>
        </div>
      </div>
      <div className="p-3">
        <h3 className="font-medium text-sm leading-tight">{bike.title}</h3>
      </div>
    </>
  );

  if (hasDetail) {
    return (
      <Link href={`/bikes/${bike.slug}`} className={className}>
        {content}
      </Link>
    );
  }

  return <div className={className}>{content}</div>;
}
