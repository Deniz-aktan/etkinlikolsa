"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";
import {
  ArrowRight,
  Calendar,
  Camera,
  Cake,
  Check,
  Heart,
  MapPin,
  Menu,
  Music,
  PartyPopper,
  Search,
  ShieldCheck,
  Ship,
  Star,
  Users,
  Utensils,
  X,
} from "lucide-react";

type EventItem = {
  id: string;
  title: string;
  category: string;
  location: string;
  price: number;
  rating: number;
  reviews: number;
  capacity: string;
  duration: string;
  image: string;
  gallery: string[];
  description: string;
};

const categories = [
  "Tekne & Yat",
  "Evlilik Teklifi",
  "Doğum Günü",
  "Parti & Kutlama",
  "Romantik Deneyimler",
  "Kurumsal",
  "Nişan & Söz",
  "Özel Günler",
];

const addons = [
  {
    name: "Balon Süslemesi",
    price: 2000,
    icon: <PartyPopper size={20} />,
  },
  {
    name: "Catering Menüsü",
    price: 3500,
    icon: <Utensils size={20} />,
  },
  {
    name: "Profesyonel Fotoğrafçı",
    price: 2500,
    icon: <Camera size={20} />,
  },
  {
    name: "Canlı Müzik",
    price: 4000,
    icon: <Music size={20} />,
  },
  {
    name: "Özel Pasta",
    price: 1500,
    icon: <Cake size={20} />,
  },
];

function price(value: number) {
  return new Intl.NumberFormat("tr-TR").format(value) + " TL";
}

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState("Tümü");
  const [searchCategory, setSearchCategory] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [selectedImage, setSelectedImage] = useState("");
  const [selectedAddons, setSelectedAddons] = useState<number[]>([]);
  const [date, setDate] = useState("");
  const [people, setPeople] = useState("");
  const [location, setLocation] = useState("İstanbul");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [reservationOpen, setReservationOpen] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    let logoutTimer: ReturnType<typeof setTimeout> | null = null;
    const SESSION_DURATION = 60 * 60 * 1000; // 1 saat

    function clearLogoutTimer() {
      if (logoutTimer) {
        clearTimeout(logoutTimer);
        logoutTimer = null;
      }
    }

    async function applySession(session: any) {
      clearLogoutTimer();

      if (!mounted) return;

      const user = session?.user;

      if (!user) {
        setIsLoggedIn(false);
        setAuthLoading(false);
        return;
      }

      // Supabase'in otomatik token yenilemesi oturumu uzatabilir.
      // Burada müşteri girişini son girişten itibaren en fazla 1 saat açık tutuyoruz.
      const lastSignIn = user.last_sign_in_at
        ? new Date(user.last_sign_in_at).getTime()
        : Date.now();
      const elapsed = Date.now() - lastSignIn;

      if (elapsed >= SESSION_DURATION) {
        await supabase.auth.signOut();
        if (!mounted) return;
        setIsLoggedIn(false);
        setAuthLoading(false);
        return;
      }

      setIsLoggedIn(true);
      setAuthLoading(false);

      logoutTimer = setTimeout(async () => {
        await supabase.auth.signOut();
      }, SESSION_DURATION - elapsed);
    }

    async function loadSession() {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error("Oturum kontrolü hatası:", error);
        if (mounted) {
          setIsLoggedIn(false);
          setAuthLoading(false);
        }
        return;
      }

      await applySession(data.session);
    }

    loadSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      void applySession(session);
    });

    return () => {
      mounted = false;
      clearLogoutTimer();
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    async function loadEvents() {
      setEventsLoading(true);
      setEventsError("");

      const { data, error } = await supabase
        .from("events")
        .select(
          "id, title, category, location, price, capacity, duration, description, image_url, gallery, rating, review_count, active"
        )
        .eq("active", true)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Etkinlikler yüklenemedi:", error);
        setEventsError("Etkinlikler şu anda yüklenemiyor. Lütfen sayfayı yenileyin.");
        setEvents([]);
        setEventsLoading(false);
        return;
      }

      const mappedEvents: EventItem[] = (data ?? []).map((event) => ({
        id: String(event.id),
        title: event.title ?? "",
        category: event.category ?? "",
        location: event.location ?? "",
        price: Number(event.price ?? 0),
        rating: Number(event.rating ?? 0),
        reviews: Number(event.review_count ?? 0),
        capacity: `${event.capacity ?? 0} kişi`,
        duration: event.duration ?? "",
        image:
          event.image_url ||
          "https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=85&w=1400&auto=format&fit=crop",
        gallery: Array.isArray(event.gallery)
          ? event.gallery.filter((image: unknown): image is string => typeof image === "string" && image.length > 0)
          : [],
        description: event.description ?? "",
      }));

      setEvents(mappedEvents);
      setEventsLoading(false);
    }

    loadEvents();
  }, []);

  const filteredEvents = useMemo(() => {
    let result = events;

    if (selectedCategory !== "Tümü") {
      result = result.filter(
        (event) => event.category === selectedCategory
      );
    }

    if (searchCategory) {
      result = result.filter(
        (event) => event.category === searchCategory
      );
    }

    return result;
  }, [events, selectedCategory, searchCategory]);

  const totalPrice =
    (selectedEvent?.price || 0) +
    selectedAddons.reduce(
      (total, index) => total + addons[index].price,
      0
    );

  function scrollToEvents() {
    document
      .getElementById("etkinlikler")
      ?.scrollIntoView({ behavior: "smooth" });
  }

  function openEvent(event: EventItem) {
    setSelectedEvent(event);
    setSelectedImage(event.image);
    setSelectedAddons([]);
  }

  function closeEvent() {
    setSelectedEvent(null);
    setSelectedImage("");
    setSelectedAddons([]);
  }

  function toggleAddon(index: number) {
    setSelectedAddons((current) =>
      current.includes(index)
        ? current.filter((item) => item !== index)
        : [...current, index]
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">

      {/* ================= HEADER ================= */}

      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">

          <button
            onClick={() =>
              window.scrollTo({
                top: 0,
                behavior: "smooth",
              })
            }
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

            <button
              onClick={() =>
                window.scrollTo({
                  top: 0,
                  behavior: "smooth",
                })
              }
              className="font-medium hover:text-blue-600"
            >
              Anasayfa
            </button>

            <button
              onClick={scrollToEvents}
              className="font-medium hover:text-blue-600"
            >
              Etkinlikler
            </button>

            <button
              onClick={scrollToEvents}
              className="font-medium hover:text-blue-600"
            >
              Paketler
            </button>

            <button
              onClick={() =>
                document
                  .getElementById("nasil-calisir")
                  ?.scrollIntoView({
                    behavior: "smooth",
                  })
              }
              className="font-medium hover:text-blue-600"
            >
              Nasıl Çalışır?
            </button>

            <button
              onClick={() =>
                document
                  .getElementById("yorumlar")
                  ?.scrollIntoView({
                    behavior: "smooth",
                  })
              }
              className="font-medium hover:text-blue-600"
            >
              Yorumlar
            </button>

          </nav>

          <div className="hidden items-center gap-3 md:flex">

            <button
              onClick={() =>
                document
                  .getElementById("etkinlikler")
                  ?.scrollIntoView({
                    behavior: "smooth",
                  })
              }
              className="rounded-full p-3 hover:bg-slate-100"
            >
              <Heart size={21} />
            </button>

            <button
              onClick={() => {
                router.push(isLoggedIn ? "/hesabim" : "/login");
              }}
              className="min-w-[110px] rounded-full bg-blue-600 px-6 py-3 font-bold text-white hover:bg-blue-700 disabled:opacity-70"
              disabled={authLoading}
            >
              {authLoading ? "" : isLoggedIn ? "Hesabım" : "Giriş Yap"}
            </button>

          </div>

          <button
            onClick={() => setMobileMenu(!mobileMenu)}
            className="md:hidden"
          >
            {mobileMenu ? <X /> : <Menu />}
          </button>

        </div>

        {mobileMenu && (
          <div className="border-t border-slate-100 bg-white px-5 py-5 md:hidden">
            <div className="flex flex-col gap-5">

              <button onClick={scrollToEvents}>
                Etkinlikler
              </button>

              <button onClick={scrollToEvents}>
                Paketler
              </button>

              <button
                onClick={() =>
                  document
                    .getElementById("nasil-calisir")
                    ?.scrollIntoView({
                      behavior: "smooth",
                    })
                }
              >
                Nasıl Çalışır?
              </button>

              <button
                onClick={() => {
                  router.push(isLoggedIn ? "/hesabim" : "/login");
                }}
                className="font-semibold text-blue-600"
                disabled={authLoading}
              >
                {authLoading ? "" : isLoggedIn ? "Hesabım" : "Giriş Yap"}
              </button>

            </div>
          </div>
        )}
      </header>

      {/* ================= HERO ================= */}

      <section className="relative min-h-[700px] overflow-hidden">

        <img
          src="https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=90&w=2000&auto=format&fit=crop"
          alt="İstanbul Boğazı"
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/65 to-slate-950/20" />

        <div className="relative mx-auto max-w-7xl px-5 pb-48 pt-28 lg:px-8">

          <div className="max-w-2xl text-white">

            <div className="mb-5 inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur">
              İstanbul&apos;un etkinlik platformu
            </div>

            <h1 className="text-5xl font-black leading-tight tracking-tight md:text-7xl">
              Özel anlarınızı
              <br />
              <span className="text-blue-400">
                unutulmaz
              </span>{" "}
              kılıyoruz.
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-200">
              Tekne turlarından evlilik tekliflerine,
              doğum günü partilerinden kurumsal
              organizasyonlara kadar aradığınız etkinliği
              kolayca bulun.
            </p>

            <button
              onClick={scrollToEvents}
              className="mt-8 inline-flex items-center gap-3 rounded-full bg-blue-600 px-7 py-4 font-bold text-white shadow-xl hover:bg-blue-700"
            >
              Etkinlikleri Keşfet
              <ArrowRight size={19} />
            </button>

          </div>
        </div>

        {/* ================= SEARCH ================= */}

        <div className="absolute bottom-0 left-1/2 z-20 w-full max-w-6xl -translate-x-1/2 px-5">

          <div className="rounded-3xl bg-white p-4 shadow-2xl md:p-5">

            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">

              <div className="rounded-2xl border border-slate-200 px-4 py-3">

                <div className="mb-1 text-xs text-slate-400">
                  Kategori
                </div>

                <select
                  value={searchCategory}
                  onChange={(e) =>
                    setSearchCategory(e.target.value)
                  }
                  className="w-full bg-transparent text-sm font-semibold outline-none"
                >
                  <option value="">
                    Tüm Etkinlikler
                  </option>

                  {categories.map((category) => (
                    <option key={category}>
                      {category}
                    </option>
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
                  <option value="">
                    Kaç kişi?
                  </option>
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
                  onChange={(e) =>
                    setLocation(e.target.value)
                  }
                  className="w-full bg-transparent text-sm font-semibold outline-none"
                >
                  <option>İstanbul</option>
                  <option>Beşiktaş</option>
                  <option>Kadıköy</option>
                  <option>Sarıyer</option>
                  <option>Üsküdar</option>
                </select>

              </div>

              <button
                onClick={scrollToEvents}
                className="flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-4 font-bold text-white hover:bg-blue-700"
              >
                <Search size={19} />
                Ara
              </button>

            </div>

          </div>

        </div>

      </section>

      {/* ================= CATEGORIES ================= */}

      <section className="bg-white pb-10 pt-28">

        <div className="mx-auto max-w-7xl px-5 lg:px-8">

          <div className="flex gap-3 overflow-x-auto pb-3">

            <button
              onClick={() => {
                setSelectedCategory("Tümü");
                setSearchCategory("");
              }}
              className={`flex shrink-0 items-center gap-2 rounded-full px-5 py-3 font-semibold ${
                selectedCategory === "Tümü"
                  ? "bg-blue-600 text-white shadow-lg"
                  : "border border-slate-200 bg-white"
              }`}
            >
              <Star size={18} />
              Tümü
            </button>

            {categories.map((category) => (

              <button
                key={category}
                onClick={() => {
                  setSelectedCategory(category);
                  setSearchCategory("");
                }}
                className={`flex shrink-0 items-center gap-2 rounded-full px-5 py-3 font-semibold ${
                  selectedCategory === category
                    ? "bg-blue-600 text-white shadow-lg"
                    : "border border-slate-200 bg-white"
                }`}
              >
                {category === "Tekne & Yat" && (
                  <Ship size={18} />
                )}

                {category === "Evlilik Teklifi" && (
                  <Heart size={18} />
                )}

                {category === "Doğum Günü" && (
                  <Cake size={18} />
                )}

                {category === "Parti & Kutlama" && (
                  <PartyPopper size={18} />
                )}

                {category === "Romantik Deneyimler" && (
                  <Heart size={18} />
                )}

                {category === "Kurumsal" && (
                  <Users size={18} />
                )}

                {category === "Nişan & Söz" && (
                  <Heart size={18} />
                )}

                {category === "Özel Günler" && (
                  <Star size={18} />
                )}

                {category}
              </button>

            ))}

          </div>

        </div>

      </section>

      {/* ================= EVENTS ================= */}

      <section
        id="etkinlikler"
        className="bg-slate-50 py-20"
      >

        <div className="mx-auto max-w-7xl px-5 lg:px-8">

          <div className="mb-10">

            <p className="font-semibold text-blue-600">
              Keşfet
            </p>

            <h2 className="mt-2 text-3xl font-black md:text-4xl">
              Size Uygun Etkinliği Bulun
            </h2>

            <p className="mt-3 text-slate-500">
              Etkinliğinizi seçin, paketinizi kendiniz oluşturun.
            </p>

          </div>

          {eventsError && (
            <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-medium text-red-600">
              {eventsError}
            </div>
          )}

          {eventsLoading ? (
            <div className="rounded-3xl bg-white p-16 text-center">
              <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
              <h3 className="text-xl font-bold">Etkinlikler yükleniyor...</h3>
              <p className="mt-2 text-slate-500">Size uygun etkinlikleri getiriyoruz.</p>
            </div>
          ) : filteredEvents.length === 0 ? (

            <div className="rounded-3xl bg-white p-16 text-center">

              <Search
                className="mx-auto mb-4 text-slate-300"
                size={45}
              />

              <h3 className="text-xl font-bold">
                Etkinlik bulunamadı.
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
                  onClick={() => openEvent(event)}
                  className="group cursor-pointer overflow-hidden rounded-3xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                >

                  <div className="relative h-64 overflow-hidden">

                    <img
                      src={event.image}
                      alt={event.title}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setFavorites((current) =>
                          current.includes(event.id)
                            ? current.filter(
                                (id) => id !== event.id
                              )
                            : [...current, event.id]
                        );
                      }}
                      className="absolute right-4 top-4 rounded-full bg-white/95 p-3 shadow-lg"
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

                    <div className="absolute bottom-4 left-4 rounded-full bg-white px-3 py-2 text-xs font-bold text-blue-600">
                      {event.category}
                    </div>

                  </div>

                  <div className="p-5">

                    <div className="flex items-center gap-1 text-sm">

                      <Star
                        size={15}
                        className="fill-amber-400 text-amber-400"
                      />

                      <b>{event.rating}</b>

                      <span className="text-slate-400">
                        ({event.reviews} yorum)
                      </span>

                    </div>

                    <h3 className="mt-2 text-xl font-bold">
                      {event.title}
                    </h3>

                    <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-500">

                      <span className="flex items-center gap-1">
                        <MapPin size={15} />
                        {event.location}
                      </span>

                      <span className="flex items-center gap-1">
                        <Users size={15} />
                        {event.capacity}
                      </span>

                    </div>

                    <div className="mt-5 flex items-end justify-between border-t border-slate-100 pt-5">

                      <div>

                        <div className="text-xs text-slate-400">
                          Başlangıç fiyatı
                        </div>

                        <div className="mt-1 text-xl font-black">
                          {price(event.price)}
                        </div>

                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openEvent(event);
                        }}
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

      {/* ================= TRUST ================= */}

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
              text: "Mutlu müşteriler",
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

              <div className="mb-4 text-blue-600">
                {item.icon}
              </div>

              <h3 className="font-bold">
                {item.title}
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                {item.text}
              </p>

            </div>

          ))}

        </div>

      </section>

      {/* ================= HOW IT WORKS ================= */}

      <section
        id="nasil-calisir"
        className="bg-slate-950 py-20 text-white"
      >

        <div className="mx-auto max-w-7xl px-5 lg:px-8">

          <div className="mx-auto max-w-2xl text-center">

            <p className="font-semibold text-blue-400">
              Çok Kolay
            </p>

            <h2 className="mt-2 text-3xl font-black md:text-4xl">
              Etkinliğinizi 3 adımda oluşturun
            </h2>

          </div>

          <div className="mt-14 grid gap-8 md:grid-cols-3">

            {[
              [
                "01",
                "Etkinliğinizi seçin",
                "Size uygun etkinlik veya mekanı bulun.",
              ],
              [
                "02",
                "Paketinizi oluşturun",
                "Balon, catering, fotoğrafçı gibi hizmetleri ekleyin.",
              ],
              [
                "03",
                "Rezervasyon yapın",
                "Tarih ve bilgilerinizi girerek talebinizi oluşturun.",
              ],
            ].map(([number, title, text]) => (

              <div
                key={number}
                className="rounded-3xl border border-white/10 bg-white/5 p-8"
              >

                <div className="text-4xl font-black text-blue-400">
                  {number}
                </div>

                <h3 className="mt-5 text-xl font-bold">
                  {title}
                </h3>

                <p className="mt-3 leading-7 text-slate-400">
                  {text}
                </p>

              </div>

            ))}

          </div>

        </div>

      </section>

      {/* ================= REVIEWS ================= */}

      <section
        id="yorumlar"
        className="bg-white py-20"
      >

        <div className="mx-auto max-w-7xl px-5 lg:px-8">

          <div className="text-center">

            <p className="font-semibold text-blue-600">
              Müşteri Yorumları
            </p>

            <h2 className="mt-2 text-3xl font-black md:text-4xl">
              Bizi deneyenler ne diyor?
            </h2>

          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">

            {[
              {
                name: "Ayşe Y.",
                text: "Her şey mükemmeldi. Tekne çok temizdi ve çalışanlar çok ilgiliydi.",
              },
              {
                name: "Mehmet K.",
                text: "Evlilik teklifim için harika bir organizasyon oldu. Her şey planlandığı gibiydi.",
              },
              {
                name: "Selin A.",
                text: "Doğum günü partimiz çok güzel geçti. Kesinlikle tavsiye ederim.",
              },
            ].map((review) => (

              <div
                key={review.name}
                className="rounded-3xl border border-slate-100 bg-slate-50 p-7"
              >

                <div className="flex gap-1 text-amber-400">

                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      size={17}
                      className="fill-current"
                    />
                  ))}

                </div>

                <p className="mt-5 leading-7 text-slate-600">
                  “{review.text}”
                </p>

                <div className="mt-6 font-bold">
                  {review.name}
                </div>

              </div>

            ))}

          </div>

        </div>

      </section>

      {/* ================= FOOTER ================= */}

      <footer className="bg-slate-950 py-14 text-white">

        <div className="mx-auto grid max-w-7xl gap-10 px-5 md:grid-cols-3 lg:px-8">

          <div>

            <div className="text-xl font-black">
              Etkinlik<span className="text-blue-400">
                Olsa
              </span>
            </div>

            <p className="mt-3 max-w-sm text-sm leading-6 text-slate-400">
              Özel anlarınızı unutulmaz kılıyoruz.
            </p>

          </div>

          <div>
            <h3 className="font-bold text-white">
              EtkinlikOlsa
            </h3>

            <div className="mt-4 flex flex-col gap-3 text-sm text-slate-400">
              <button
                onClick={scrollToEvents}
                className="w-fit hover:text-white"
              >
                Etkinlikler
              </button>

              <button
                onClick={() =>
                  document
                    .getElementById("nasil-calisir")
                    ?.scrollIntoView({
                      behavior: "smooth",
                    })
                }
                className="w-fit hover:text-white"
              >
                Nasıl Çalışır?
              </button>

              <button
                onClick={() =>
                  document
                    .getElementById("yorumlar")
                    ?.scrollIntoView({
                      behavior: "smooth",
                    })
                }
                className="w-fit hover:text-white"
              >
                Yorumlar
              </button>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-white">
              İş Ortakları
            </h3>

            <div className="mt-4 flex flex-col gap-3 text-sm">
              <button
                onClick={() => {
                  window.location.href = "/tedarikci/login";
                }}
                className="w-fit font-semibold text-blue-400 hover:text-blue-300"
              >
                Tedarikçi Girişi
              </button>

              <p className="max-w-xs leading-6 text-slate-400">
                Etkinliğinizi platformumuza eklemek ve rezervasyonlarınızı yönetmek için tedarikçi paneline giriş yapın.
              </p>
            </div>
          </div>

        </div>

        <div className="mx-auto mt-10 max-w-7xl border-t border-white/10 px-5 pt-6 lg:px-8">
          <div className="flex flex-col gap-3 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
            <span>© 2026 EtkinlikOlsa. Tüm hakları saklıdır.</span>
            <span>Güvenli ve kolay etkinlik rezervasyonu</span>
          </div>
        </div>

      </footer>

      {/* ================= EVENT DETAIL ================= */}

      {selectedEvent && (

        <div className="fixed inset-0 z-[60] overflow-y-auto bg-slate-950/70 p-4 backdrop-blur-sm">

          <div className="mx-auto my-8 max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl">

            <div className="relative">

              <img
                src={selectedImage || selectedEvent.image}
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

            {selectedEvent.gallery.length > 0 && (
              <div className="border-b border-slate-100 bg-white px-6 py-5 md:px-9">
                <div className="mb-3 text-sm font-bold text-slate-700">
                  Etkinlik Fotoğrafları
                </div>
                <div className="flex gap-3 overflow-x-auto pb-1">
                  {[selectedEvent.image, ...selectedEvent.gallery]
                    .filter((image, index, array) => image && array.indexOf(image) === index)
                    .map((image) => (
                      <button
                        key={image}
                        type="button"
                        onClick={() => setSelectedImage(image)}
                        className={`relative h-20 w-28 shrink-0 overflow-hidden rounded-xl border-2 transition ${
                          selectedImage === image
                            ? "border-blue-600 ring-2 ring-blue-100"
                            : "border-slate-200 hover:border-blue-300"
                        }`}
                      >
                        <img
                          src={image}
                          alt={selectedEvent.title}
                          className="h-full w-full object-cover"
                        />
                      </button>
                    ))}
                </div>
              </div>
            )}


            <div className="grid md:grid-cols-[1fr_380px]">

              <div className="p-6 md:p-9">

                <div className="text-sm font-bold text-blue-600">
                  {selectedEvent.category}
                </div>

                <h2 className="mt-2 text-3xl font-black">
                  {selectedEvent.title}
                </h2>

                <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-500">

                  <span className="flex items-center gap-1">
                    <Star
                      className="fill-amber-400 text-amber-400"
                      size={17}
                    />
                    {selectedEvent.rating}
                  </span>

                  <span className="flex items-center gap-1">
                    <MapPin size={17} />
                    {selectedEvent.location}
                  </span>

                  <span className="flex items-center gap-1">
                    <Users size={17} />
                    {selectedEvent.capacity}
                  </span>

                </div>

                <p className="mt-6 leading-7 text-slate-600">
                  {selectedEvent.description}
                </p>

                <div className="mt-8">

                  <h3 className="text-xl font-black">
                    Paketinizi özelleştirin
                  </h3>

                  <p className="mt-2 text-sm text-slate-500">
                    İsterseniz aşağıdaki hizmetleri paketinize ekleyebilirsiniz.
                  </p>

                  <div className="mt-5 space-y-3">

                    {addons.map((addon, index) => {

                      const active =
                        selectedAddons.includes(index);

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
                              {active ? (
                                <Check size={19} />
                              ) : (
                                addon.icon
                              )}
                            </div>

                            <div>

                              <div className="font-semibold">
                                {addon.name}
                              </div>

                              <div className="text-sm text-slate-500">
                                +{price(addon.price)}
                              </div>

                            </div>

                          </div>

                          <div
                            className={`flex h-6 w-6 items-center justify-center rounded-md border-2 ${
                              active
                                ? "border-blue-600 bg-blue-600"
                                : "border-slate-300"
                            }`}
                          >
                            {active && (
                              <Check
                                size={16}
                                className="text-white"
                              />
                            )}
                          </div>

                        </button>

                      );

                    })}

                  </div>

                </div>

              </div>

              {/* PRICE BOX */}

              <div className="border-t border-slate-100 bg-slate-50 p-6 md:border-l md:border-t-0 md:p-8">

                <div className="sticky top-24">

                  <div className="text-sm text-slate-500">
                    Başlangıç fiyatı
                  </div>

                  <div className="mt-1 text-3xl font-black">
                    {price(selectedEvent.price)}
                  </div>

                  <div className="my-6 h-px bg-slate-200" />

                  <div className="space-y-3 text-sm">

                    <div className="flex justify-between">
                      <span>Temel Paket</span>
                      <b>{price(selectedEvent.price)}</b>
                    </div>

                    {selectedAddons.map((index) => (

                      <div
                        key={index}
                        className="flex justify-between text-slate-600"
                      >
                        <span>
                          {addons[index].name}
                        </span>

                        <span>
                          +{price(addons[index].price)}
                        </span>
                      </div>

                    ))}

                  </div>

                  <div className="my-6 h-px bg-slate-200" />

                  <div className="flex items-end justify-between">

                    <span className="font-bold">
                      Toplam
                    </span>

                    <span className="text-3xl font-black text-blue-600">
                      {price(totalPrice)}
                    </span>

                  </div>

                  <button
                    onClick={() =>
                      setReservationOpen(true)
                    }
                    className="mt-7 w-full rounded-2xl bg-blue-600 py-4 font-bold text-white shadow-lg hover:bg-blue-700"
                  >
                    Rezervasyon Yap
                  </button>

                  <p className="mt-4 text-center text-xs leading-5 text-slate-400">
                    Rezervasyon talebinizden sonra ekibimiz sizinle iletişime geçecektir.
                  </p>

                </div>

              </div>

            </div>

          </div>

        </div>

      )}

      {/* ================= RESERVATION ================= */}

      {reservationOpen && (

        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">

          <div className="w-full max-w-lg rounded-3xl bg-white p-7 shadow-2xl">

            <div className="flex items-start justify-between">

              <div>

                <p className="font-semibold text-blue-600">
                  Rezervasyon
                </p>

                <h2 className="mt-1 text-2xl font-black">
                  Teklifinizi oluşturalım
                </h2>

              </div>

              <button
                onClick={() =>
                  setReservationOpen(false)
                }
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

              <input
                type="date"
                className="w-full rounded-2xl border border-slate-200 px-4 py-4 outline-none focus:border-blue-500"
              />

              <textarea
                placeholder="Etkinliğiniz hakkında bilgi..."
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
