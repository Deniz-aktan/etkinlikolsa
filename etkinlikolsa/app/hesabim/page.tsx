"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { CalendarDays, ChevronRight, LogOut, Settings, User, Bell, Heart, ShieldCheck, X } from "lucide-react";

type Profile = {
  full_name: string | null;
  phone: string | null;
  marketing_consent: boolean | null;
  privacy_notice_acknowledged: boolean | null;
  terms_accepted: boolean | null;
};

type Reservation = {
  id: string;
  event_id: string | null;
  customer_name: string | null;
  event_date: string | null;
  start_time: string | null;
  end_time: string | null;
  people: number | null;
  total_price: number | null;
  status: string | null;
  created_at: string;
};

function money(value: number | null) {
  return new Intl.NumberFormat("tr-TR").format(Number(value || 0)) + " TL";
}

function statusLabel(status: string | null) {
  if (status === "approved") return "Onaylandı";
  if (status === "cancelled") return "İptal edildi";
  if (status === "rejected") return "Reddedildi";
  return "Bekliyor";
}

export default function AccountPage() {
  const [email, setEmail] = useState("");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    const SESSION_DURATION = 60 * 60 * 1000; // 1 saat

    async function loadAccount() {
      setLoading(true);
      const { data: authData } = await supabase.auth.getSession();
      const user = authData.session?.user;

      if (!user) {
        router.replace("/login");
        return;
      }

      const lastSignIn = user.last_sign_in_at
        ? new Date(user.last_sign_in_at).getTime()
        : Date.now();

      if (Date.now() - lastSignIn >= SESSION_DURATION) {
        await supabase.auth.signOut();
        router.replace("/login");
        return;
      }

      if (!mounted) return;

      setEmail(user.email || "");

      const [{ data: profileData, error: profileError }, { data: reservationData, error: reservationError }] = await Promise.all([
        supabase
          .from("profiles")
          .select("full_name, phone, marketing_consent, privacy_notice_acknowledged, terms_accepted")
          .eq("id", user.id)
          .maybeSingle(),
        supabase
          .from("reservations")
          .select("id, event_id, customer_name, event_date, start_time, end_time, people, total_price, status, created_at")
          .eq("email", user.email || "")
          .order("created_at", { ascending: false }),
      ]);

      if (profileError || reservationError) {
        console.error(profileError || reservationError);
        setError("Hesap bilgileri yüklenirken bir hata oluştu.");
      }

      if (!mounted) return;

      setProfile(profileData);
      setReservations(reservationData || []);
      setLoading(false);
    }

    loadAccount();

    return () => {
      mounted = false;
    };
  }, [router]);

  async function logout() {
    await supabase.auth.signOut();
    router.replace("/");
  }

  if (loading) {
    return <main className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500">Hesabınız yükleniyor...</main>;
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">
          <button onClick={() => (router.push("/"))} className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white">
              <CalendarDays size={23} />
            </div>
            <span className="text-xl font-extrabold tracking-tight">Etkinlik<span className="text-blue-600">Olsa</span></span>
          </button>
          <div className="flex items-center gap-3">
            <button onClick={() => (router.push("/"))} className="hidden rounded-full px-4 py-2 font-semibold hover:bg-slate-100 sm:block">Anasayfa</button>
            <button onClick={logout} className="flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 font-semibold hover:bg-slate-50"><LogOut size={17} /> Çıkış Yap</button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
        {error && <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

        <div className="mb-8 rounded-3xl bg-gradient-to-r from-blue-600 to-blue-500 p-7 text-white shadow-lg">
          <p className="text-sm font-semibold text-blue-100">Hesabım</p>
          <h1 className="mt-2 text-3xl font-black">Merhaba, {profile?.full_name || "Hoş geldin"} 👋</h1>
          <p className="mt-2 text-blue-100">Rezervasyonlarını ve hesap bilgilerini buradan yönetebilirsin.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="h-fit rounded-3xl bg-white p-3 shadow-sm ring-1 ring-slate-100">
            {[
              [User, "Profilim", "#profil"],
              [CalendarDays, "Rezervasyonlarım", "#rezervasyonlar"],
              [Heart, "Favorilerim", "#favoriler"],
              [Bell, "Bildirimler", "#bildirimler"],
              [Settings, "Hesap Ayarları", "#ayarlar"],
            ].map(([Icon, label, href]) => (
              <a key={label as string} href={href as string} className="flex items-center justify-between rounded-2xl px-4 py-3.5 font-semibold hover:bg-slate-50">
                <span className="flex items-center gap-3">{Icon && <Icon size={19} />} {label as string}</span><ChevronRight size={17} className="text-slate-400" />
              </a>
            ))}
          </aside>

          <div className="space-y-6">
            <section id="profil" className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
              <div className="mb-5 flex items-center gap-3"><div className="rounded-xl bg-blue-50 p-3 text-blue-600"><User size={21} /></div><div><h2 className="text-xl font-black">Profilim</h2><p className="text-sm text-slate-500">Kişisel hesap bilgilerin</p></div></div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-semibold text-slate-400">Ad Soyad</p><p className="mt-1 font-bold">{profile?.full_name || "Belirtilmemiş"}</p></div>
                <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-semibold text-slate-400">E-posta</p><p className="mt-1 font-bold break-all">{email}</p></div>
                <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-semibold text-slate-400">Telefon</p><p className="mt-1 font-bold">{profile?.phone || "Belirtilmemiş"}</p></div>
              </div>
            </section>

            <section id="rezervasyonlar" className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
              <div className="mb-5 flex items-center gap-3"><div className="rounded-xl bg-blue-50 p-3 text-blue-600"><CalendarDays size={21} /></div><div><h2 className="text-xl font-black">Rezervasyonlarım</h2><p className="text-sm text-slate-500">Tüm rezervasyon geçmişin</p></div></div>
              {reservations.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center"><CalendarDays className="mx-auto text-slate-300" size={40} /><p className="mt-3 font-bold">Henüz rezervasyonun yok.</p><button onClick={() => (router.push("/"))} className="mt-4 rounded-xl bg-blue-600 px-5 py-3 font-bold text-white">Etkinlikleri Keşfet</button></div>
              ) : (
                <div className="space-y-3">
                  {reservations.map((reservation) => (
                    <div key={reservation.id} className="rounded-2xl border border-slate-200 p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div><p className="font-black">Rezervasyon #{reservation.id.slice(0, 8)}</p><p className="mt-1 text-sm text-slate-500">{reservation.event_date || "Tarih belirtilmemiş"}{reservation.start_time ? ` • ${reservation.start_time}` : ""} • {reservation.people || 0} kişi</p></div>
                        <div className="flex items-center gap-3"><span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">{statusLabel(reservation.status)}</span><span className="font-black">{money(reservation.total_price)}</span></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section id="favoriler" className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100"><h2 className="text-xl font-black">Favorilerim</h2><p className="mt-2 text-sm text-slate-500">Favoriler sistemini birazdan Supabase'e bağlayacağız. Burada favori etkinliklerin listelenecek.</p></section>
            <section id="bildirimler" className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100"><h2 className="text-xl font-black">Bildirimler</h2><p className="mt-2 text-sm text-slate-500">Rezervasyon onayı, iptal ve yaklaşan etkinlik bildirimleri burada görünecek.</p></section>
            <section id="ayarlar" className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
              <h2 className="text-xl font-black">Hesap Ayarları</h2>
              <div className="mt-5 space-y-3">
                <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4"><div><p className="font-bold">Pazarlama iletişimi</p><p className="text-sm text-slate-500">Kampanya ve fırsat e-postaları</p></div><span className={`rounded-full px-3 py-1 text-xs font-bold ${profile?.marketing_consent ? "bg-green-50 text-green-700" : "bg-slate-200 text-slate-600"}`}>{profile?.marketing_consent ? "Açık" : "Kapalı"}</span></div>
                <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4"><div><p className="font-bold">Gizlilik bildirimi</p><p className="text-sm text-slate-500">Bilgilendirme metni durumu</p></div><ShieldCheck size={20} className="text-green-600" /></div>
                <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4"><div><p className="font-bold">Üyelik sözleşmesi</p><p className="text-sm text-slate-500">Üyelik kabul durumu</p></div><ShieldCheck size={20} className="text-green-600" /></div>
              </div>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
