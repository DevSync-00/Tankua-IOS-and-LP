import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MARKETING_DESTINATIONS } from "@/lib/marketing-destinations";

export default function DestinationsPage() {
  return (
    <main className="min-h-screen bg-brand-sand">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
        <div className="max-w-2xl mb-12">
          <p className="font-mono text-[11px] text-brand-gold uppercase tracking-[0.2em] mb-3">Explore Ethiopia</p>
          <h1 className="font-fraunces font-semibold text-[32px] md:text-[40px] text-brand-ink tracking-[-0.02em] mb-4">
            Regions & destinations
          </h1>
          <p className="text-[15px] text-brand-muted leading-relaxed font-dm">
            Browse where local guides operate on Tankua. Every listing is rooted in-place — choose a region and dive into curated tours.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {MARKETING_DESTINATIONS.map((dest) => (
            <Link
              key={dest.name}
              href="/tours"
              className="group relative bg-brand-cream border border-[rgba(245,168,0,0.15)] rounded-[16px] overflow-hidden hover:border-brand-gold/50 transition-colors block"
            >
              <div className="relative h-[160px] overflow-hidden">
                <Image
                  src={dest.image}
                  alt={`${dest.name}, Ethiopia`}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" aria-hidden />
              </div>
              <div className="px-4 py-3.5 flex items-center justify-between">
                <div>
                  <p className="font-fraunces font-semibold text-[16px] text-brand-ink tracking-[-0.02em]">{dest.name}</p>
                  <p className="font-dm text-[12px] text-brand-muted mt-1">{dest.region}</p>
                  <p className="font-dm text-[13px] text-brand-muted mt-0.5">
                    {dest.tours} tours · from {dest.from.toLocaleString()} ETB
                  </p>
                </div>
                <span className="w-8 h-8 shrink-0 rounded-full bg-[rgba(245,168,0,0.1)] flex items-center justify-center group-hover:bg-brand-gold transition-colors">
                  <ArrowRight className="h-4 w-4 text-brand-gold group-hover:text-brand-ink" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
