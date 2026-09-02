import {
  Briefcase,
  Cake,
  Heart,
  PartyPopper,
  Sailboat,
  Sparkles,
} from "lucide-react";
import { categories } from "@/lib/data";

const icons: Record<string, React.ReactNode> = {
  sailboat: <Sailboat size={22} />,
  "party-popper": <PartyPopper size={22} />,
  heart: <Heart size={22} />,
  cake: <Cake size={22} />,
  briefcase: <Briefcase size={22} />,
  sparkles: <Sparkles size={22} />,
};

export default function Categories() {
  return (
    <section className="mx-auto max-w-7xl px-5 pt-28 lg:px-8 lg:pt-24">
      <div className="flex flex-wrap justify-center gap-3 lg:gap-4">
        {categories.map((cat, i) => (
          <a
            key={cat.id}
            href="#paketler"
            className={`flex items-center gap-2.5 rounded-full border px-5 py-3 text-sm font-semibold transition ${
              i === 0
                ? "border-brand-500 bg-brand-500 text-white shadow-card"
                : "border-slate-200 bg-white text-ink-light hover:border-brand-200 hover:text-brand-500"
            }`}
          >
            {icons[cat.icon]}
            {cat.label}
          </a>
        ))}
      </div>
    </section>
  );
}
