"use client";

import { Calendar, MapPin, Search, Users, ChevronDown } from "lucide-react";
import { useState } from "react";

export default function Hero() {
  const [category, setCategory] = useState("Tekne Turları");
  const [date, setDate] = useState("");
  const [people, setPeople] = useState("");
  const [location, setLocation] = useState("İstanbul");

  return (
    <section className="relative overflow-hidden bg-ink">
      {/* Arka plan */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=1600&auto=format&fit=crop"
          alt="İstanbul'da etkinlik"
          className="h-full w-full object-cover opacity-60"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/70 to-transparent" />
      </div>

      {/* Hero içerik */}
      <div <div className="relative z-20 mx-auto max-w-6xl px-5 lg:px-8">
        <div className="max-w-xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-sky-light">
            İstanbul'un etkinlik platformu
          </p>

          <h1 className="font-display text-4xl font-extrabold leading-[1.1] text-white lg:text-5xl">
            Özel anlarınızı
            <br />
            unutulmaz kılıyoruz.
          </h1>

          <p className="mt-5 max-w-md text-base leading-relaxed text-slate-200">
            Tekne turlarından evlilik tekliflerine, doğum günü
            partilerinden özel kutlamalara kadar hayalinizdeki
            etkinliği kolayca bulun.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#paketler"
              className="rounded-full bg-brand-500 px-6 py-3.5 text-sm font-semibold text-white shadow-float transition hover:bg-brand-600"
            >
              Etkinlikleri Keşfet →
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

      {/* Arama alanı */}
      <div className="relative mx-auto max-w-6xl px-5 lg:px-8">
        <div className="-mb-20 rounded-2xl bg-white p-5 shadow-float lg:-mb-16 lg:p-6">

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1fr_1fr_auto]">

            {/* Kategori */}
            <div className="relative flex items-center gap-3 rounded-xl border border-slate-100 px-4 py-3">
              <span className="text-brand-500">
                <Search size={18} />
              </span>

              <div className="flex w-full flex-col text-left">
                <span className="text-xs text-slate-400">
                  Kategori
                </span>

                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full cursor-pointer appearance-none bg-transparent text-sm font-medium text-ink outline-none"
                >
                  <option>Tekne Turları</option>
                  <option>Parti & Kutlama</option>
                  <option>Evlilik Teklifi</option>
                  <option>Doğum Günü</option>
                  <option>Kurumsal</option>
                  <option>Diğer Etkinlikler</option>
                </select>
              </div>

              <ChevronDown
                size={16}
                className="pointer-events-none text-slate-400"
              />
            </div>

            {/* Tarih */}
            <div className="flex items-center gap-3 rounded-xl border border-slate-100 px-4 py-3">
              <span className="text-brand-500">
                <Calendar size={18} />
              </span>

              <div className="flex w-full flex-col text-left">
                <span className="text-xs text-slate-400">
                  Tarih
                </span>

                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-transparent text-sm font-medium text-ink outline-none"
                />
              </div>
            </div>

            {/* Kişi */}
            <div className="flex items-center gap-3 rounded-xl border border-slate-100 px-4 py-3">
              <span className="text-brand-500">
                <Users size={18} />
              </span>

              <div className="flex w-full flex-col text-left">
                <span className="text-xs text-slate-400">
                  Kişi Sayısı
                </span>

                <select
                  value={people}
                  onChange={(e) => setPeople(e.target.value)}
                  className="w-full cursor-pointer bg-transparent text-sm font-medium text-ink outline-none"
                >
                  <option value="">Kaç kişi?</option>
                  <option>1-5 kişi</option>
                  <option>6-10 kişi</option>
                  <option>11-20 kişi</option>
                  <option>21-50 kişi</option>
                  <option>50+ kişi</option>
                </select>
              </div>
            </div>

            {/* Konum */}
            <div className="flex items-center gap-3 rounded-xl border border-slate-100 px-4 py-3">
              <span className="text-brand-500">
                <MapPin size={18} />
              </span>

              <div className="flex w-full flex-col text-left">
                <span className="text-xs text-slate-400">
                  Konum
                </span>

                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full cursor-pointer bg-transparent text-sm font-medium text-ink outline-none"
                >
                  <option>İstanbul</option>
                  <option>Beşiktaş</option>
                  <option>Kadıköy</option>
                  <option>Beylikdüzü</option>
                  <option>Sarıyer</option>
                  <option>Üsküdar</option>
                </select>
              </div>
            </div>

            {/* Ara */}
            <button
              onClick={() => {
                document
                  .getElementById("paketler")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
              className="flex items-center justify-center gap-2 rounded-xl bg-brand-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-600"
            >
              <Search size={17} />
              Ara
            </button>

          </div>
        </div>
      </div>
    </section>
  );
}
