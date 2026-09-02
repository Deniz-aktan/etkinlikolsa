import { Star } from "lucide-react";
import { testimonials } from "@/lib/data";

export default function Testimonials() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
      <div className="mb-10 text-center">
        <p className="mb-2 text-sm font-semibold text-brand-500">
          Müşteri Yorumları
        </p>
        <h2 className="font-display text-2xl font-extrabold text-ink lg:text-3xl">
          Bizi Tercih Edenler Ne Diyor?
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {testimonials.map((t) => (
          <div
            key={t.id}
            className="rounded-2xl border border-slate-100 bg-white p-6 shadow-card"
          >
            <div className="mb-3 flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={15}
                  className={
                    i < t.rating
                      ? "fill-amber-400 text-amber-400"
                      : "text-slate-200"
                  }
                />
              ))}
            </div>
            <p className="text-sm leading-relaxed text-ink-light">
              &ldquo;{t.quote}&rdquo;
            </p>
            <div className="mt-5 flex items-center gap-3">
              <img
                src={t.avatar}
                alt={t.name}
                className="h-10 w-10 rounded-full object-cover"
              />
              <div>
                <p className="text-sm font-bold text-ink">{t.name}</p>
                <p className="text-xs text-slate-400">{t.event}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
