"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

type Profile = {
  id: string;
  username: string;
  full_name: string | null;
  phone: string | null;
  role: string;
  marketing_consent: boolean;
};

export default function AccountPage() {
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadAccount();
  }, []);

  async function loadAccount() {
    setLoading(true);
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.replace("/login");
      return;
    }

    setEmail(user.email || "");

    const { data, error: profileError } = await supabase
      .from("profiles")
      .select(
        "id, username, full_name, phone, role, marketing_consent"
      )
      .eq("id", user.id)
      .single();

    if (profileError) {
      setError("Hesap bilgileriniz yüklenemedi.");
      setLoading(false);
      return;
    }

    setProfile(data);
    setLoading(false);
  }

  async function handleLogout() {
    setLoggingOut(true);

    await supabase.auth.signOut();

    router.replace("/");
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-slate-500">
            Hesabınız yükleniyor...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-20 flex items-center justify-between">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-extrabold">
              EO
            </div>

            <span className="text-xl font-extrabold text-slate-900">
              EtkinlikOlsa
            </span>
          </button>

          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/")}
              className="hidden sm:block text-sm font-semibold text-slate-600 hover:text-blue-600"
            >
              Etkinliklere Dön
            </button>

            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-sm font-semibold text-slate-700 transition"
            >
              {loggingOut ? "Çıkış..." : "Çıkış Yap"}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-10">
        <div className="mb-8">
          <p className="text-sm font-semibold text-blue-600 mb-2">
            HESABIM
          </p>

          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900">
            Hoş geldin, {profile?.full_name || "Değerli Üyemiz"} 👋
          </h1>

          <p className="text-slate-500 mt-2">
            Rezervasyonlarını ve hesap bilgilerini buradan yönetebilirsin.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl bg-red-50 border border-red-200 px-5 py-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Profil */}
          <section className="lg:col-span-1 bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-xl font-extrabold text-slate-900">
              Profil Bilgilerim
            </h2>

            <div className="mt-6 space-y-5">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase">
                  Ad Soyad
                </p>

                <p className="mt-1 font-semibold text-slate-800">
                  {profile?.full_name || "-"}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase">
                  E-posta
                </p>

                <p className="mt-1 font-semibold text-slate-800 break-all">
                  {email || "-"}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase">
                  Telefon
                </p>

                <p className="mt-1 font-semibold text-slate-800">
                  {profile?.phone || "-"}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase">
                  Kampanya Bildirimleri
                </p>

                <p className="mt-1 font-semibold">
                  {profile?.marketing_consent ? (
                    <span className="text-green-600">
                      Açık
                    </span>
                  ) : (
                    <span className="text-slate-500">
                      Kapalı
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="mt-7 pt-6 border-t border-slate-100">
              <button
                onClick={() => router.push("/hesabim/ayarlar")}
                className="w-full h-11 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition"
              >
                Hesap Ayarları
              </button>
            </div>
          </section>

          {/* Rezervasyonlar */}
          <section className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">
                  Rezervasyonlarım
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Etkinlik rezervasyonlarını buradan takip edebilirsin.
                </p>
              </div>

              <button
                onClick={() => router.push("/")}
                className="hidden sm:block px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition"
              >
                Etkinlik Keşfet
              </button>
            </div>

            <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
              <div className="text-4xl mb-4">
                📅
              </div>

              <h3 className="font-bold text-slate-800">
                Henüz rezervasyonun yok
              </h3>

              <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
                Hayalindeki etkinliği keşfet ve sana özel paketini
                oluşturarak rezervasyon talebi oluştur.
              </p>

              <button
                onClick={() => router.push("/")}
                className="mt-5 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition"
              >
                Etkinlikleri Keşfet
              </button>
            </div>
          </section>
        </div>

        {/* Hızlı erişim */}
        <section className="mt-6 grid md:grid-cols-3 gap-4">
          <button
            onClick={() => router.push("/")}
            className="bg-white rounded-2xl border border-slate-200 p-5 text-left hover:border-blue-300 hover:shadow-sm transition"
          >
            <div className="text-2xl mb-3">🎉</div>

            <h3 className="font-bold text-slate-900">
              Etkinlikleri Keşfet
            </h3>

            <p className="text-sm text-slate-500 mt-1">
              Sana uygun etkinlikleri bul.
            </p>
          </button>

          <button
            onClick={() => router.push("/hesabim/ayarlar")}
            className="bg-white rounded-2xl border border-slate-200 p-5 text-left hover:border-blue-300 hover:shadow-sm transition"
          >
            <div className="text-2xl mb-3">⚙️</div>

            <h3 className="font-bold text-slate-900">
              Hesap Ayarları
            </h3>

            <p className="text-sm text-slate-500 mt-1">
              Bilgilerini ve tercihlerini yönet.
            </p>
          </button>

          <button
            onClick={() => router.push("/")}
            className="bg-white rounded-2xl border border-slate-200 p-5 text-left hover:border-blue-300 hover:shadow-sm transition"
          >
            <div className="text-2xl mb-3">❤️</div>

            <h3 className="font-bold text-slate-900">
              Favorilerim
            </h3>

            <p className="text-sm text-slate-500 mt-1">
              Beğendiğin etkinliklere daha sonra ulaş.
            </p>
          </button>
        </section>
      </div>
    </main>
  );
}
