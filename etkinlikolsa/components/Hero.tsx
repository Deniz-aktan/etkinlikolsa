"use client";

import { useMemo, useState } from "react";
import {
  ArrowRight,
  Calendar,
  Check,
  ChevronDown,
  Heart,
  MapPin,
  Menu,
  Search,
  ShieldCheck,
  Star,
  Users,
  X,
  Camera,
  Music,
  Cake,
  Utensils,
  PartyPopper,
  Ship,
  Gift,
} from "lucide-react";

type EventItem = {
  id: number;
  title: string;
  category: string;
  location: string;
  price: number;
  rating: number;
  reviews: number;
  image: string;
  description: string;
};

type Addon = {
  name: string;
  price: number;
  icon: React.ReactNode;
};

const events: EventItem[] = [
  {
    id: 1,
    title: "Boğaz'da Özel Tekne Turu",
    category: "Tekne Turları",
    location: "İstanbul",
    price: 15000,
    rating: 4.9,
    reviews: 120,
    image:
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=1400&auto=format&fit=crop",
    description:
      "Sevdiklerinizle birlikte İstanbul Boğazı'nın eşsiz manzarasında unutulmaz bir tekne deneyimi yaşayın.",
  },
  {
    id: 2,
    title: "Yat Kiralama ile Parti",
    category: "Parti & Kutlama",
    location: "İstanbul",
    price: 18500,
    rating: 4.8,
    reviews: 98,
    image:
      "https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?q=80&w=1400&auto=format&fit=crop",
    description:
      "Arkadaşlarınızla veya sevdiklerinizle özel yatınızda eğlenceli bir parti düzenleyin.",
  },
  {
    id: 3,
    title: "Romantik Evlilik Teklifi",
    category: "Evlilik Teklifi",
    location: "İstanbul",
    price: 9500,
    rating: 4.9,
    reviews: 76,
    image:
      "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1400&auto=format&fit=crop",
    description:
      "Hayatınızın en önemli sorusunu unutulmaz bir atmosferde sorun.",
  },
  {
    id: 4,
    title: "Doğum Günü Paketi",
    category: "Doğum Günü",
    location: "İstanbul",
    price: 7500,
    rating: 4.8,
    reviews: 64,
    image:
      "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?q=80&w=1400&auto=format&fit=crop",
    description:
      "Doğum gününüzü dekorasyon, pasta ve özel konseptlerle unutulmaz hale getirin.",
  },
  {
    id: 5,
    title: "Özel Kurumsal Organizasyon",
    category: "Kurumsal",
    location: "İstanbul",
    price: 22000,
    rating: 4.7,
    reviews: 42,
    image:
      "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=1400&auto=format&fit=crop",
    description:
      "Şirket toplantıları, ekip etkinlikleri ve kurumsal davetler için profesyonel organizasyon.",
  },
  {
    id: 6,
    title: "Romantik Akşam Yemeği",
    category: "Diğer Etkinlikler",
    location: "İstanbul",
    price: 8500,
    rating: 4.9,
    reviews: 51,
    image:
      "https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?q=80&w=1400&auto=format&fit=crop",
    description:
      "Özel dekorasyon ve eşsiz manzara eşliğinde romantik bir akşam.",
  },
];

const categories = [
  { name: "Tekne Turları", icon: <Ship size={22} /> },
  { name: "Parti & Kutlama", icon: <PartyPopper size={22} /> },
  { name: "Evlilik Teklifi", icon: <Heart size={22} /> },
  { name: "Doğum Günü", icon: <Cake size={22} /> },
  { name: "Kurumsal", icon: <Gift size={22} /> },
  { name: "Diğer Etkinlikler", icon: <Star size={22} /> },
];

const addons: Addon[] = [
  {
    name: "Balon Süslemesi",
    price: 2000,
    icon: <PartyPopper size={19} />,
  },
  {
    name: "Catering Menüsü",
    price: 3500,
    icon: <Utensils size={19} />,
  },
  {
    name: "Profesyonel Fotoğrafçı",
    price: 2500,
    icon: <Camera size={19} />,
  },
  {
    name: "Canlı Müzik",
    price: 4000,
    icon: <Music size={19} />,
  },
  {
    name: "Özel Pasta",
    price: 1500,
    icon: <Cake size={19} />,
  },
];

function formatPrice(price: number) {
  return new Intl.NumberFormat("tr-TR").format(price) + " TL";
}

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState("Tümü");
  const [searchCategory, setSearchCategory] = useState("");
  const [location, setLocation] = useState("İstanbul");
  const [people, setPeople] = useState("");
  const [date, setDate] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [selectedAddons, setSelectedAddons] = useState<number[]>([]);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [reservationOpen, setReservationOpen] = useState(false);
  const [favorites, setFavorites] = useState<number[]>([]);

  const filteredEvents = useMemo(() => {
    let result = events;

    if (selectedCategory !== "Tümü") {
      result = result.filter((event) => event.category === selectedCategory);
    }

    if (searchCategory) {
      result = result.filter((event) => event.category === searchCategory);
    }

    if (location) {
      result = result.filter((event) => event.location === location);
    }

    return result;
  }, [selectedCategory, searchCategory, location]);

  const totalPrice =
    (selectedEvent?.price || 0) +
    selectedAddons.reduce((total, index) => total + addons[index].price, 0);

  function toggleAddon(index: number) {
    setSelectedAddons((current) =>
      current.includes(index)
        ? current.filter((item) => item !== index)
        : [...current, index]
    );
  }

  function openEvent(event: EventItem) {
    setSelectedEvent(event);
    setSelectedAddons([]);
  }

  function closeEvent() {
    setSelectedEvent(null);
    setReservationOpen(false);
    setSelectedAddons([]);
  }

  function scrollToEvents() {
    document
      .getElementById("etkinlikler")
      ?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* HEADER */}
      <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex items-center gap-3"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white">
              <Ship size={23} />
            </div>

            <span className="text-xl font-extrabold tracking-tight">
              Etkinlik<span className="text-blue-600">Olsa</span>
            </span>
          </button>

          <nav className="hidden items-center gap-8 md:flex">
            <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
              Anasayfa
            </button>

            <button onClick={scrollToEvents}>Etkinlikler</button>

            <button onClick={scrollToEvents}>Paketler</button>

            <button
              onClick={() =>
                document
                  .getElementById("nasil-calisir")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Nasıl Çalışır?
            </button>

            <button
              onClick={() =>
                document
                  .getElementById("yorumlar")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Yorumlar
            </button>
          </nav>

          <div className="hidden items-center gap-4 md:flex">
            <button
              onClick={() =>
                document
                  .getElementById("yorumlar")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="rounded-full p-3 hover:bg-slate-100"
            >
              <Heart size={21} />
            </button>

            <button
              onClick={() => setReservationOpen(true)}
              className="rounded-full bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              Teklif Al
            </button>
          </div>

          <button
            className="md:hidden"
            onClick={() => setMobileMenu(!mobileMenu)}
          >
            {mobileMenu ? <X /> : <Menu />}
          </button>
        </div>

        {mobileMenu && (
          <div className="border-t border-slate-100 bg-white px-5 py-5 md:hidden">
            <div className="flex flex-col gap-5 font-medium">
              <button onClick={scrollToEvents}>Etkinlikler</button>
              <button onClick={scrollToEvents}>Paketler</button>
              <button
                onClick={() =>
                  document
                    .getElementById("nasil-calisir")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                Nasıl Çalışır?
              </button>
              <button onClick={() => setReservationOpen(true)}>
                Teklif Al
              </button>
            </div>
          </div>
        )}
      </header>

      {/* HERO */}
      <section className="relative min-h-[700px] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=90&w=2000&auto=format&fit=crop"
          alt="İstanbul Boğazı etkinlik"
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/65 to-slate-950/20" />

        <div className="relative mx-auto max-w-7xl px-5 pb-40 pt-28 lg:px-8">
          <div className="max-w-2xl text-white">
            <div className="mb-5 inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur">
              İstanbul&apos;un etkinlik platformu
            </div>

            <h1 className="text-5xl font-black leading-tight tracking-tight md:text-7xl">
              Özel anlarınızı
              <br />
              <span className="text-blue-400">unutulmaz</span> kılıyoruz.
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-200">
              Tekne turlarından evlilik tekliflerine, doğum günü
              partilerinden kurumsal organizasyonlara kadar aradığınız
              etkinliği kolayca bulun.
            </p>

            <button
              onClick={scrollToEvents}
              className="mt-8 inline-flex items-center gap-3 rounded-full bg-blue-600 px-7 py-4 font-bold text-white shadow-xl transition hover:bg-blue-700"
            >
              Etkinlikleri Keşfet
              <ArrowRight size={19} />
            </button>
          </div>
        </div>

        {/* SEARCH */}
        <div className="absolute bottom-0 left-1/2 z-20 w-full max-w-6xl -translate-x-1/2 px-5">
          <div className="rounded-3xl bg-white p-4 shadow-2xl md:p-5">
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
              <div className="rounded-2xl border border-slate-200 px-4 py-3">
                <div className="mb-1 text-xs text-slate-400">Kategori</div>
                <select
                  value={searchCategory}
                  onChange={(e) => setSearchCategory(e.target.value)}
                  className="w-full bg-transparent text-sm font-semibold outline-none"
                >
                  <option value="">Tüm Etkinlikler</option>
                  {categories.map((category) => (
                    <option key={category.name}>{category.name}</option>
                  ))}
                </select>
              </div>

              <div className="rounded-2xl border border-slate-200 px-4 py-3">
                <div className="mb-1 flex items-center gap-2 text-xs text-slate-400">
                  <Calendar size={14} />
                  Tarih
                </div>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-transparent text-sm font-semibold outline-none"
                />
              </div>

              <div className="rounded-2xl border border-slate-200 px-4 py-3">
                <div className="mb-1 flex items-center gap-2 text-xs text-slate-400">
                  <Users size={14} />
                  Kişi Sayısı
                </div>
                <select
                  value={people}
                  onChange={(e) => setPeople(e.target.value)}
                  className="w-full bg-transparent text-sm font-semibold outline-none"
                >
                  <option value="">Kaç kişi?</option>
                  <option>1-5 kişi</option>
                  <option>6-10 kişi</option>
                  <option>11-20 kişi</option>
                  <option>21-50 kişi</option>
                  <option>50+ kişi</option>
                </select>
              </div>

              <div className="rounded-2xl border border-slate-200 px-4 py-3">
                <div className="mb-1 flex items-center gap-2 text-xs text-slate-400">
                  <MapPin size={14} />
                  Konum
                </div>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-transparent text-sm font-semibold outline-none"
                >
                  <option>İstanbul</option>
                </select>
              </div>

              <button
                onClick={scrollToEvents}
                className="flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-4 font-bold text-white transition hover:bg-blue-700"
              >
                <Search size={19} />
                Ara
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="bg-white pb-10 pt-28">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="flex gap-3 overflow-x-auto pb-3">
            <button
              onClick={() => setSelectedCategory("Tümü")}
              className={`flex shrink-0 items-center gap-2 rounded-full px-5 py-3 font-semibold transition ${
                selectedCategory === "Tümü"
                  ? "bg-blue-600 text-white shadow-lg"
                  : "border border-slate-200 bg-white hover:border-blue-300"
              }`}
            >
              <Star size={19} />
              Tümü
            </button>

            {categories.map((category) => (
              <button
                key={category.name}
                onClick={() => setSelectedCategory(category.name)}
                className={`flex shrink-0 items-center gap-2 rounded-full px-5 py-3 font-semibold transition ${
                  selectedCategory === category.name
                    ? "bg-blue-600 text-white shadow-lg"
                    : "border border-slate-200 bg-white hover:border-blue-300"
                }`}
              >
                {category.icon}
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* EVENTS */}
      <section id="etkinlikler" className="bg-slate-50 py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="mb-2 font-semibold text-blue-600">Öne Çıkanlar</p>
              <h2 className="text-3xl font-black md:text-4xl">
                Etkinlik Paketleri
              </h2>
              <p className="mt-3 text-slate-500">
                Size uygun etkinliği seçin, paketinizi kendiniz oluşturun.
              </p>
            </div>

            <span className="hidden text-sm font-semibold text-slate-500 md:block">
              {filteredEvents.length} etkinlik
            </span>
          </div>

          {filteredEvents.length === 0 ? (
            <div className="rounded-3xl bg-white p-16 text-center shadow-sm">
              <Search className="mx-auto mb-4 text-slate-300" size={42} />
              <h3 className="text-xl font-bold">
                Aradığınız etkinlik bulunamadı.
              </h3>
              <button
                onClick={() => {
                  setSelectedCategory("Tümü");
                  setSearchCategory("");
                }}
                className="mt-5 rounded-full bg-blue-600 px-6 py-3 font-semibold text-white"
              >
                Filtreleri Temizle
              </button>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredEvents.map((event) => (
                <div
                  key={event.id}
                  className="group overflow-hidden rounded-3xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="relative h-60 overflow-hidden">
                    <img
                      src={event.image}
                      alt={event.title}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />

                    <button
                      onClick={() =>
                        setFavorites((current) =>
                          current.includes(event.id)
                            ? current.filter((id) => id !== event.id)
                            : [...current, event.id]
                        )
                      }
                      className="absolute right-4 top-4 rounded-full bg-white/90 p-3 shadow-lg backdrop-blur"
                    >
                      <Heart
                        size={19}
                        className={
                          favorites.includes(event.id)
                            ? "fill-red-500 text-red-500"
                            : ""
                        }
                      />
                    </button>

                    <div className="absolute bottom-4 left-4 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-blue-600">
                      {event.category}
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="mb-2 flex items-center gap-1 text-sm">
                      <Star size={15} className="fill-amber-400 text-amber-400" />
                      <b>{event.rating}</b>
                      <span className="text-slate-400">
                        ({event.reviews} yorum)
                      </span>
                    </div>

                    <h3 className="text-xl font-bold">{event.title}</h3>

                    <div className="mt-3 flex items-center gap-1 text-sm text-slate-500">
                      <MapPin size={15} />
                      {event.location}
                    </div>

                    <div className="mt-5 flex items-end justify-between border-t border-slate-100 pt-5">
                      <div>
                        <div className="text-xs text-slate-400">
                          Başlangıç fiyatı
                        </div>
                        <div className="mt-1 text-xl font-black">
                          {formatPrice(event.price)}
                        </div>
                      </div>

                      <button
                        onClick={() => openEvent(event)}
                        className="flex items-center gap-2 rounded-full bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700"
                      >
                        İncele
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* TRUST */}
      <section className="bg-white py-16">
        <div className="mx-auto grid max-w-7xl gap-5 px-5 md:grid-cols-4 lg:px-8">
          {[
            {
              icon: <ShieldCheck />,
              title: "Güvenli Ödeme",
              text: "256 bit SSL ile koruma",
            },
            {
              icon: <Star />,
              title: "4.9/5 Müşteri Puanı",
              text: "Binlerce mutlu müşteri",
            },
            {
              icon: <Check />,
              title: "Kaliteli Hizmet",
              text: "Özenle seçilmiş etkinlikler",
            },
            {
              icon: <Users />,
              title: "7/24 Destek",
              text: "Her zaman yanınızdayız",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-slate-100 bg-slate-50 p-6"
            >
              <div className="mb-4 text-blue-600">{item.icon}</div>
              <h3 className="font-bold">{item.title}</h3>
              <p className="mt-1 text-sm text-slate-500">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="nasil-calisir" className="bg-slate-950 py-20 text-white">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="font-semibold text-blue-400">Çok Kolay</p>
            <h2 className="mt-2 text-3xl font-black md:text-4xl">
              Etkinliğinizi 3 adımda oluşturun
            </h2>
          </div>

          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {[
              ["01", "Etkinliğinizi seçin", "Size uygun etkinlik ve paketi bulun."],
              ["02", "Paketinizi özelleştirin", "Balon, catering, fotoğrafçı gibi hizmetleri ekleyin."],
              ["03", "Rezervasyonunuzu yapın", "Tarih ve bilgilerinizi girerek talebinizi oluşturun."],
            ].map(([number, title, text]) => (
              <div key={number} className="rounded-3xl border border-white/10 bg-white/5 p-8">
                <div className="text-4xl font-black text-blue-400">{number}</div>
                <h3 className="mt-5 text-xl font-bold">{title}</h3>
                <p className="mt-3 leading-7 text-slate-400">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section id="yorumlar" className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="text-center">
            <p className="font-semibold text-blue-600">Müşteri Yorumları</p>
            <h2 className="mt-2 text-3xl font-black md:text-4xl">
              Bizi deneyenler ne diyor?
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                name: "Ayşe Y.",
                text: "Her şey mükemmeldi. Çalışanlar çok ilgiliydi, tekne tertemiz ve çok konforluydu.",
              },
              {
                name: "Mehmet K.",
                text: "Evlilik teklifim için harika bir organizasyondu. Her şey planlandığı gibiydi.",
              },
              {
                name: "Selin A.",
                text: "Doğum günü partimiz inanılmaz güzel geçti. Kesinlikle tavsiye ederim.",
              },
            ].map((review) => (
              <div
                key={review.name}
                className="rounded-3xl border border-slate-100 bg-slate-50 p-7"
              >
                <div className="flex gap-1 text-amber-400">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} size={17} className="fill-current" />
                  ))}
                </div>

                <p className="mt-5 leading-7 text-slate-600">
                  “{review.text}”
                </p>

                <div className="mt-6 font-bold">{review.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-950 py-12 text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 md:flex-row md:items-center md:justify-between lg:px-8">
          <div>
            <div className="text-xl font-black">
              Etkinlik<span className="text-blue-400">Olsa</span>
            </div>
            <p className="mt-2 text-sm text-slate-400">
              Özel anlarınızı unutulmaz kılıyoruz.
            </p>
          </div>

          <div className="text-sm text-slate-400">
            © 2026 EtkinlikOlsa. Tüm hakları saklıdır.
          </div>
        </div>
      </footer>

      {/* EVENT DETAIL MODAL */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="mx-auto my-8 max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="relative">
              <img
                src={selectedEvent.image}
                alt={selectedEvent.title}
                className="h-72 w-full object-cover md:h-96"
              />

              <button
                onClick={closeEvent}
                className="absolute right-5 top-5 rounded-full bg-white p-3 shadow-xl"
              >
                <X />
              </button>
            </div>

            <div className="grid md:grid-cols-[1fr_380px]">
              <div className="p-6 md:p-9">
                <div className="text-sm font-bold text-blue-600">
                  {selectedEvent.category}
                </div>

                <h2 className="mt-2 text-3xl font-black">
                  {selectedEvent.title}
                </h2>

                <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-500">
                  <span className="flex items-center gap-1">
                    <Star className="fill-amber-400 text-amber-400" size={17} />
                    {selectedEvent.rating} ({selectedEvent.reviews})
                  </span>

                  <span className="flex items-center gap-1">
                    <MapPin size={17} />
                    {selectedEvent.location}
                  </span>

                  <span className="flex items-center gap-1">
                    <Users size={17} />
                    2-25 kişi
                  </span>
                </div>

                <p className="mt-6 leading-7 text-slate-600">
                  {selectedEvent.description}
                </p>

                <div className="mt-8">
                  <h3 className="text-xl font-black">
                    Paketinizi özelleştirin
                  </h3>

                  <div className="mt-4 space-y-3">
                    {addons.map((addon, index) => {
                      const active = selectedAddons.includes(index);

                      return (
                        <button
                          key={addon.name}
                          onClick={() => toggleAddon(index)}
                          className={`flex w-full items-center justify-between rounded-2xl border p-4 text-left transition ${
                            active
                              ? "border-blue-500 bg-blue-50"
                              : "border-slate-200 hover:border-blue-300"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`rounded-xl p-2 ${
                                active
                                  ? "bg-blue-600 text-white"
                                  : "bg-slate-100 text-blue-600"
                              }`}
                            >
                              {active ? <Check size={19} /> : addon.icon}
                            </div>

                            <div>
                              <div className="font-semibold">
                                {addon.name}
                              </div>
                              <div className="text-sm text-slate-500">
                                +{formatPrice(addon.price)}
                              </div>
                            </div>
                          </div>

                          <div
                            className={`h-5 w-5 rounded-md border-2 ${
                              active
                                ? "border-blue-600 bg-blue-600"
                                : "border-slate-300"
                            }`}
                          >
                            {active && (
                              <Check size={16} className="text-white" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* PRICE */}
              <div className="border-t border-slate-100 bg-slate-50 p-6 md:border-l md:border-t-0 md:p-8">
                <div className="sticky top-24">
                  <div className="text-sm text-slate-500">
                    Temel Paket
                  </div>

                  <div className="mt-1 text-2xl font-black">
                    {formatPrice(selectedEvent.price)}
                  </div>

                  <div className="my-6 h-px bg-slate-200" />

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span>Temel Paket</span>
                      <b>{formatPrice(selectedEvent.price)}</b>
                    </div>

                    {selectedAddons.map((index) => (
                      <div
                        key={index}
                        className="flex justify-between text-slate-600"
                      >
                        <span>{addons[index].name}</span>
                        <span>+{formatPrice(addons[index].price)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="my-6 h-px bg-slate-200" />

                  <div className="flex items-end justify-between">
                    <span className="font-bold">Toplam</span>
                    <span className="text-3xl font-black text-blue-600">
                      {formatPrice(totalPrice)}
                    </span>
                  </div>

                  <button
                    onClick={() => setReservationOpen(true)}
                    className="mt-7 w-full rounded-2xl bg-blue-600 py-4 font-bold text-white shadow-lg transition hover:bg-blue-700"
                  >
                    Rezervasyon Talebi Oluştur
                  </button>

                  <p className="mt-4 text-center text-xs leading-5 text-slate-400">
                    Rezervasyon talebiniz oluşturulduktan sonra ekibimiz sizinle
                    iletişime geçecektir.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RESERVATION MODAL */}
      {reservationOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-white p-7 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-blue-600">Rezervasyon</p>
                <h2 className="mt-1 text-2xl font-black">
                  Teklifinizi oluşturalım
                </h2>
              </div>

              <button
                onClick={() => setReservationOpen(false)}
                className="rounded-full bg-slate-100 p-2"
              >
                <X size={19} />
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <input
                placeholder="Ad Soyad"
                className="w-full rounded-2xl border border-slate-200 px-4 py-4 outline-none focus:border-blue-500"
              />

              <input
                placeholder="Telefon"
                type="tel"
                className="w-full rounded-2xl border border-slate-200 px-4 py-4 outline-none focus:border-blue-500"
              />

              <input
                placeholder="E-posta"
                type="email"
                className="w-full rounded-2xl border border-slate-200 px-4 py-4 outline-none focus:border-blue-500"
              />

              <textarea
                placeholder="Etkinliğiniz hakkında kısa bilgi..."
                rows={4}
                className="w-full rounded-2xl border border-slate-200 px-4 py-4 outline-none focus:border-blue-500"
              />

              <button
                onClick={() => {
                  alert(
                    "Rezervasyon talebiniz alındı! Ekibimiz en kısa sürede sizinle iletişime geçecektir."
                  );
                  setReservationOpen(false);
                }}
                className="w-full rounded-2xl bg-blue-600 py-4 font-bold text-white hover:bg-blue-700"
              >
                Teklif Talebi Gönder
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
