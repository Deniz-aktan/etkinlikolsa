import { MapPin, Star } from "lucide-react";
import { featuredEvents } from "@/lib/data";

export default function FeaturedEvents() {
  return (
    <section id="paketler" className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
      <div className="mb-10 flex items-end justify-between">
        <div>
          <p className="mb-2 text-sm font-semibold text-brand-500">
            Öne Çıkanlar
          </p>
          <h2 className="font-display text-2xl font-extrabold text-ink lg:text-3xl">
            Öne Çıkan Etkinlik Paketleri
          </h2>
        </div>
        <a
          href="#"
          className="hidden text-sm font-semibold text-brand-500 hover:text-brand-600 lg:block"
        >
          Tümünü Gör →
        </a>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {featuredEvents.map((event) => (
          <a
            key={event.id}
            href="#"
            className="group overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-card transition hover:-translate-y-1 hover:shadow-float"
          >
            <div className="relative h-44 overflow-hidden">
              <img
                src={event.image}
                alt={event.title}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
              <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-ink">
                {event.category}
              </span>
            </div>
            <div className="p-4">
              <h3 className="font-display text-base font-bold text-ink">
                {event.title}
              </h3>
              <div className="mt-1.5 flex items-center gap-1 text-xs text-slate-400">
                <MapPin size={13} />
                {event.location}
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-1 text-sm text-ink">
                  <Star size={14} className="fill-amber-400 text-amber-400" />
                  <span className="font-semibold">{event.rating}</span>
                  <span className="text-slate-400">
                    ({event.reviewCount})
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400">Başlangıç</span>
                  <p className="text-sm font-extrabold text-brand-600">
                    {event.price}
                  </p>
                </div>
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
