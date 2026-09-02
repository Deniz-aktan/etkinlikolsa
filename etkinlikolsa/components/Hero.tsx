import { Calendar, MapPin, Search, Users } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-ink">
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=1600&auto=format&fit=crop"
          alt="Boğaz'da tekne turu"
          className="h-full w-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/70 to-transparent" />
      </div>

      <div className="relative mx-auto max-w-7xl px-5 pb-28 pt-16 lg:px-8 lg:pb-32 lg:pt-24">
        <div className="max-w-xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-sky-light">
            İstanbul&apos;un etkinlik platformu
          </p>
          <h1 className="font-display text-4xl font-extrabold leading-[1.1] text-white lg:text-5xl">
            Özel anlarınızı unutulmaz kılıyoruz.
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-slate-200">
            Tekne turlarından evlilik teklifine, doğum günü partilerinden
            kurumsal organizasyonlara — her etkinlik için doğru mekan ve
            ekip burada.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#paketler"
              className="rounded-full bg-brand-500 px-6 py-3.5 text-sm font-semibold text-white shadow-float transition hover:bg-brand-600"
            >
              Etkinlikleri Keşfet
            </a>
            <a
              href="#nasil-calisir"
              className="rounded-full border border-white/30 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Nasıl Çalışır?
            </a>
          </div>
        </div>
      </div>

      {/* Arama kartı - hero'nun altına taşar */}
      <div className="relative mx-auto max-w-6xl px-5 lg:px-8">
        <div className="-mb-20 rounded-2xl bg-white p-5 shadow-float lg:-mb-16 lg:p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1fr_1fr_auto]">
            <Field icon={<MapPin size={18} />} label="Kategori" value="Tekne Turu" />
            <Field icon={<Calendar size={18} />} label="Tarih" value="Tarih seçin" />
            <Field icon={<Users size={18} />} label="Kişi Sayısı" value="Kaç kişi?" />
            <Field icon={<MapPin size={18} />} label="Konum" value="Konum seçin" />
            <button className="flex items-center justify-center gap-2 rounded-xl bg-brand-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-600">
              <Search size={17} />
              Ara
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function Field({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-100 px-4 py-3 transition hover:border-brand-100">
      <span className="text-brand-500">{icon}</span>
      <div className="flex flex-col text-left">
        <span className="text-xs text-slate-400">{label}</span>
        <span className="text-sm font-medium text-ink">{value}</span>
      </div>
    </div>
  );
}
