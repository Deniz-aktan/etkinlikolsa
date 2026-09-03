"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

type Stats = {
  customers: number;
  suppliers: number;
  events: number;
  pendingReservations: number;
  monthReservations: number;
  monthRevenue: number;
};

type MenuItem = {
  title: string;
  icon: string;
  path: string;
};

export default function AdminPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  const [stats, setStats] = useState<Stats>({
    customers: 0,
    suppliers: 0,
    events: 0,
    pendingReservations: 0,
    monthReservations: 0,
    monthRevenue: 0,
  });

  const [error, setError] = useState("");

  useEffect(() => {
    checkAdmin();
  }, []);

  async function checkAdmin() {
    setLoading(true);
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.replace("/tedarikci/login");
      return;
    }

    const { data: role, error: roleError } =
      await supabase.rpc("current_user_role");

    if (
      roleError ||
      !role ||
      !["admin", "super_admin"].includes(role)
    ) {
      await supabase.auth.signOut();
      router.replace("/tedarikci/login");
      return;
    }

    setAuthorized(true);

    await loadStats();

    setLoading(false);
  }

  async function loadStats() {
    try {
      const [
        customersResult,
        suppliersResult,
        eventsResult,
        pendingResult,
        monthReservationsResult,
        monthRevenueResult,
      ] = await Promise.all([
        supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .eq("role", "user"),

        supabase
          .from("suppliers")
          .select("*", { count: "exact", head: true }),

        supabase
          .from("events")
          .select("*", { count: "exact", head: true })
          .eq("active", true),

        supabase
          .from("reservations")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending"),

        supabase
          .from("reservations")
          .select("*", { count: "exact", head: true })
          .gte(
            "created_at",
            new Date(
              new Date().getFullYear(),
              new Date().getMonth(),
              1
            ).toISOString()
          ),

        supabase
          .from("reservations")
          .select("customer_price, total_price")
          .gte(
            "created_at",
            new Date(
              new Date().getFullYear(),
              new Date().getMonth(),
              1
            ).toISOString()
          ),
      ]);

      const monthRevenue =
        monthRevenueResult.data?.reduce(
          (total, reservation) => {
            const amount =
              reservation.customer_price ??
              reservation.total_price ??
              0;

            return total + Number(amount);
          },
          0
        ) ?? 0;

      setStats({
        customers: customersResult.count ?? 0,
        suppliers: suppliersResult.count ?? 0,
        events: eventsResult.count ?? 0,
        pendingReservations: pendingResult.count ?? 0,
        monthReservations: monthReservationsResult.count ?? 0,
        monthRevenue,
      });
    } catch {
      setError("Dashboard verileri alınırken bir hata oluştu.");
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/tedarikci/login");
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-extrabold text-lg mx-auto mb-4">
            EO
          </div>

          <p className="text-slate-500">
            Admin paneli yükleniyor...
          </p>
        </div>
      </main>
    );
  }

  if (!authorized) {
    return null;
  }

  const menuItems: MenuItem[] = [
    {
      title: "Dashboard",
      icon: "📊",
      path: "/admin",
    },
    {
      title: "Etkinlikler",
      icon: "🎫",
      path: "/admin/etkinlikler",
    },
    {
      title: "Kategoriler",
      icon: "📂",
      path: "/admin/kategoriler",
    },
    {
      title: "Ek Hizmetler",
      icon: "➕",
      path: "/admin/ek-hizmetler",
    },
    {
      title: "Rezervasyonlar",
      icon: "📅",
      path: "/admin/rezervasyonlar",
    },
    {
      title: "Müşteriler",
      icon: "👥",
      path: "/admin/musteriler",
    },
    {
      title: "Tedarikçiler",
      icon: "🚤",
      path: "/admin/tedarikciler",
    },
    {
      title: "Yorumlar",
      icon: "⭐",
      path: "/admin/yorumlar",
    },
    {
      title: "Site Yönetimi",
      icon: "🖼️",
      path: "/admin/site-yonetimi",
    },
    {
      title: "E-posta / Bildirimler",
      icon: "📧",
      path: "/admin/bildirimler",
    },
    {
      title: "Ayarlar",
      icon: "⚙️",
      path: "/admin/ayarlar",
    },
  ];

  return (
    <main className="min-h-screen bg-slate-100">
      <div className="flex min-h-screen">

        {/* SIDEBAR */}
        <aside className="hidden lg:flex w-72 bg-slate-950 text-white flex-col fixed inset-y-0 left-0 z-30">

          <div className="px-7 py-6 border-b border-white/10">
            <div className="flex items-center gap-3">

              <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center font-extrabold">
                EO
              </div>

              <div>
                <div className="font-extrabold text-lg">
                  EtkinlikOlsa
                </div>

                <div className="text-xs text-slate-400">
                  Yönetim Paneli
                </div>
              </div>

            </div>
          </div>

          <nav className="flex-1 px-4 py-5 space-y-1 overflow-y-auto">

            {menuItems.map((item) => {
              const isActive =
                item.path === "/admin";

              return (
                <button
                  key={item.title}
                  type="button"
                  onClick={() => router.push(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-slate-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <span className="text-lg">
                    {item.icon}
                  </span>

                  <span className="text-sm font-semibold">
                    {item.title}
                  </span>
                </button>
              );
            })}

          </nav>

          <div className="p-4 border-t border-white/10">

            <button
              onClick={() => router.push("/")}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-white/10 hover:text-white transition text-sm"
            >
              <span>🏠</span>
              Siteye Git
            </button>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-300 hover:bg-red-500/10 transition text-sm mt-1"
            >
              <span>↪️</span>
              Çıkış Yap
            </button>

          </div>
        </aside>

        {/* MAIN */}
        <section className="flex-1 lg:ml-72">

          {/* TOPBAR */}
          <header className="bg-white border-b border-slate-200 px-5 md:px-8 py-5 flex items-center justify-between sticky top-0 z-20">

            <div>
              <p className="text-sm text-slate-500">
                Yönetim Paneli
              </p>

              <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
                Dashboard
              </h1>
            </div>

            <div className="flex items-center gap-3">

              <div className="hidden sm:block text-right">
                <div className="text-sm font-bold text-slate-800">
                  Admin
                </div>

                <div className="text-xs text-slate-500">
                  Yönetici
                </div>
              </div>

              <div className="w-11 h-11 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-extrabold">
                A
              </div>

            </div>

          </header>

          {/* CONTENT */}
          <div className="p-5 md:p-8">

            {error && (
              <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* WELCOME */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-3xl p-6 md:p-8 text-white mb-8">

              <div className="max-w-2xl">

                <p className="text-blue-100 text-sm font-semibold">
                  EtkinlikOlsa Yönetim Merkezi
                </p>

                <h2 className="text-2xl md:text-3xl font-extrabold mt-2">
                  Hoş geldin 👋
                </h2>

                <p className="text-blue-100 mt-3 leading-6">
                  Etkinliklerini, rezervasyonlarını,
                  müşterilerini ve tedarikçilerini buradan
                  yönetebilirsin.
                </p>

              </div>

            </div>

            {/* STATS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 mb-8">

              <StatCard
                title="Toplam Müşteri"
                value={stats.customers}
                icon="👥"
              />

              <StatCard
                title="Toplam Tedarikçi"
                value={stats.suppliers}
                icon="🚤"
              />

              <StatCard
                title="Aktif Etkinlik"
                value={stats.events}
                icon="🎫"
              />

              <StatCard
                title="Bekleyen Rezervasyon"
                value={stats.pendingReservations}
                icon="⏳"
              />

              <StatCard
                title="Bu Ay Rezervasyon"
                value={stats.monthReservations}
                icon="📅"
              />

              <StatCard
                title="Bu Ay Ciro"
                value={`${stats.monthRevenue.toLocaleString(
                  "tr-TR"
                )} ₺`}
                icon="💰"
              />

            </div>

            {/* QUICK ACTIONS */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

              <div className="bg-white rounded-3xl border border-slate-200 p-6">

                <div className="flex items-center justify-between mb-5">

                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900">
                      Hızlı İşlemler
                    </h3>

                    <p className="text-sm text-slate-500 mt-1">
                      Sık kullandığın yönetim alanlarına
                      hızlıca ulaş.
                    </p>
                  </div>

                </div>

                <div className="grid grid-cols-2 gap-3">

                  <QuickButton
                    icon="🎫"
                    title="Etkinlik Ekle"
                    onClick={() =>
                      router.push("/admin/etkinlikler?new=1")
                    }
                  />

                  <QuickButton
                    icon="📅"
                    title="Rezervasyonlar"
                    onClick={() =>
                      router.push("/admin/rezervasyonlar")
                    }
                  />

                  <QuickButton
                    icon="🚤"
                    title="Tedarikçiler"
                    onClick={() =>
                      router.push("/admin/tedarikciler")
                    }
                  />

                  <QuickButton
                    icon="🖼️"
                    title="Siteyi Düzenle"
                    onClick={() =>
                      router.push("/admin/site-yonetimi")
                    }
                  />

                </div>

              </div>

              <div className="bg-white rounded-3xl border border-slate-200 p-6">

                <h3 className="text-lg font-extrabold text-slate-900">
                  Sistem Durumu
                </h3>

                <div className="mt-5 space-y-4">

                  <StatusRow
                    title="Supabase"
                    status="Bağlı"
                  />

                  <StatusRow
                    title="Kimlik Doğrulama"
                    status="Aktif"
                  />

                  <StatusRow
                    title="Veritabanı"
                    status="Aktif"
                  />

                  <StatusRow
                    title="Etkinlik Sistemi"
                    status="Hazır"
                  />

                </div>

              </div>

            </div>

          </div>

        </section>

      </div>
    </main>
  );
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string | number;
  icon: string;
}) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 hover:shadow-lg transition">

      <div className="flex items-start justify-between">

        <div>
          <p className="text-sm text-slate-500 font-semibold">
            {title}
          </p>

          <p className="text-3xl font-extrabold text-slate-900 mt-3">
            {value}
          </p>
        </div>

        <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-xl">
          {icon}
        </div>

      </div>

    </div>
  );
}

function QuickButton({
  icon,
  title,
  onClick,
}: {
  icon: string;
  title: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-3 p-4 rounded-2xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition text-left"
    >
      <span className="text-xl">
        {icon}
      </span>

      <span className="text-sm font-bold text-slate-800">
        {title}
      </span>
    </button>
  );
}

function StatusRow({
  title,
  status,
}: {
  title: string;
  status: string;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">

      <span className="text-sm font-semibold text-slate-700">
        {title}
      </span>

      <span className="inline-flex items-center gap-2 text-sm font-bold text-emerald-600">
        <span className="w-2 h-2 rounded-full bg-emerald-500" />
        {status}
      </span>

    </div>
  );
}
