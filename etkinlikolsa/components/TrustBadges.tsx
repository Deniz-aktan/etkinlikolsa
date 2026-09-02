import { Award, Clock, ShieldCheck, Wallet } from "lucide-react";

const badges = [
  {
    icon: <ShieldCheck size={22} />,
    title: "Güvenli Rezervasyon",
    desc: "256 bit SSL koruması",
  },
  {
    icon: <Wallet size={22} />,
    title: "Anında İade Garantisi",
    desc: "İptal koşullarında tam iade",
  },
  {
    icon: <Clock size={22} />,
    title: "7/24 Destek",
    desc: "Her an yanınızdayız",
  },
  {
    icon: <Award size={22} />,
    title: "Onaylı Mekanlar",
    desc: "Tüm ekipler denetimden geçer",
  },
];

export default function TrustBadges() {
  return (
    <section className="border-y border-slate-100 bg-white py-14">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-5 lg:grid-cols-4 lg:px-8">
        {badges.map((b) => (
          <div key={b.title} className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-500">
              {b.icon}
            </span>
            <div>
              <p className="text-sm font-bold text-ink">{b.title}</p>
              <p className="text-xs text-slate-400">{b.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
