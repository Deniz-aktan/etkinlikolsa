"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";

type EventItem = {
  id: string;
  title: string;
  category: string;
  location: string;
  price: number;
  capacity: number | null;
  duration: string | null;
  description: string | null;
  image_url: string | null;
  active: boolean;
  created_at: string;
};

const emptyForm = {
  title: "",
  category: "",
  location: "",
  price: "",
  capacity: "",
  duration: "",
  description: "",
  image_url: "",
  active: true,
};

export default function EventsAdminPage() {
  const router = useRouter();

  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState(emptyForm);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    checkAdminAndLoad();
  }, []);

  async function checkAdminAndLoad() {
    setLoading(true);
    setError("");

    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
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

    await loadEvents();

    setLoading(false);
  }

  async function loadEvents() {
    const { data, error: eventsError } = await supabase
      .from("events")
      .select("*")
      .order("created_at", { ascending: false });

    if (eventsError) {
      setError("Etkinlikler yüklenirken bir hata oluştu.");
      return;
    }

    setEvents(data || []);
  }

  function openNewForm() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setSuccess("");
    setShowForm(true);
  }

  function openEditForm(event: EventItem) {
    setEditingId(event.id);

    setForm({
      title: event.title || "",
      category: event.category || "",
      location: event.location || "",
      price: event.price?.toString() || "",
      capacity: event.capacity?.toString() || "",
      duration: event.duration || "",
      description: event.description || "",
      image_url: event.image_url || "",
      active: event.active,
    });

    setError("");
    setSuccess("");
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!form.title.trim()) {
      setError("Etkinlik adı zorunludur.");
      return;
    }

    if (!form.category.trim()) {
      setError("Kategori zorunludur.");
      return;
    }

    if (!form.location.trim()) {
      setError("Konum zorunludur.");
      return;
    }

    if (!form.price || Number(form.price) < 0) {
      setError("Geçerli bir fiyat girin.");
      return;
    }

    setSaving(true);

    const eventData = {
      title: form.title.trim(),
      category: form.category.trim(),
      location: form.location.trim(),
      price: Number(form.price),
      capacity: form.capacity
        ? Number(form.capacity)
        : null,
      duration: form.duration.trim() || null,
      description: form.description.trim() || null,
      image_url: form.image_url.trim() || null,
      active: form.active,
    };

    if (editingId) {
      const { error: updateError } = await supabase
        .from("events")
        .update(eventData)
        .eq("id", editingId);

      if (updateError) {
        setError(
          "Etkinlik güncellenemedi: " + updateError.message
        );
        setSaving(false);
        return;
      }

      setSuccess("Etkinlik başarıyla güncellendi.");
    } else {
      const { error: insertError } = await supabase
        .from("events")
        .insert(eventData);

      if (insertError) {
        setError(
          "Etkinlik oluşturulamadı: " + insertError.message
        );
        setSaving(false);
        return;
      }

      setSuccess("Etkinlik başarıyla oluşturuldu.");
    }

    await loadEvents();

    setSaving(false);

    setTimeout(() => {
      closeForm();
    }, 700);
  }

  async function toggleActive(event: EventItem) {
    setError("");
    setSuccess("");

    const { error: updateError } = await supabase
      .from("events")
      .update({
        active: !event.active,
      })
      .eq("id", event.id);

    if (updateError) {
      setError("Etkinlik durumu değiştirilemedi.");
      return;
    }

    setSuccess(
      event.active
        ? "Etkinlik pasife alındı."
        : "Etkinlik tekrar aktifleştirildi."
    );

    await loadEvents();
  }

  async function deleteEvent(event: EventItem) {
    const confirmed = window.confirm(
      `"${event.title}" etkinliğini silmek istediğine emin misin?`
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setSuccess("");

    const { error: deleteError } = await supabase
      .from("events")
      .delete()
      .eq("id", event.id);

    if (deleteError) {
      setError(
        "Etkinlik silinemedi. Bu etkinliğe bağlı kayıtlar olabilir."
      );
      return;
    }

    setSuccess("Etkinlik silindi.");

    await loadEvents();
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-extrabold text-lg mx-auto mb-4">
            EO
          </div>

          <p className="text-slate-500">
            Etkinlikler yükleniyor...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-5 md:px-8 py-5 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">
              Yönetim Paneli
            </p>

            <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
              Etkinlikler
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/admin")}
              className="hidden sm:block px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              ← Dashboard
            </button>

            <button
              onClick={openNewForm}
              className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition"
            >
              + Yeni Etkinlik
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-5 md:px-8 py-8">
        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm text-green-700">
            {success}
          </div>
        )}

        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">
                Tüm Etkinlikler
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Sistemde kayıtlı {events.length} etkinlik
              </p>
            </div>
          </div>

          {events.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="text-5xl mb-4">
                🎫
              </div>

              <h3 className="text-lg font-bold text-slate-900">
                Henüz etkinlik yok
              </h3>

              <p className="text-sm text-slate-500 mt-2">
                İlk etkinliğini oluşturarak başlayabilirsin.
              </p>

              <button
                onClick={openNewForm}
                className="mt-6 px-5 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700"
              >
                + İlk Etkinliği Oluştur
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="p-5 md:p-6 flex flex-col lg:flex-row lg:items-center gap-5"
                >
                  <div className="w-full lg:w-32 h-24 rounded-2xl bg-slate-100 overflow-hidden shrink-0">
                    {event.image_url ? (
                      <img
                        src={event.image_url}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl">
                        🎫
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-extrabold text-slate-900">
                        {event.title}
                      </h3>

                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                          event.active
                            ? "bg-green-100 text-green-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {event.active
                          ? "Aktif"
                          : "Pasif"}
                      </span>
                    </div>

                    <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-slate-500">
                      <span>
                        📂 {event.category}
                      </span>

                      <span>
                        📍 {event.location}
                      </span>

                      {event.capacity && (
                        <span>
                          👥 {event.capacity} kişi
                        </span>
                      )}

                      {event.duration && (
                        <span>
                          ⏱️ {event.duration}
                        </span>
                      )}
                    </div>

                    <div className="mt-3 text-lg font-extrabold text-blue-600">
                      {Number(event.price).toLocaleString(
                        "tr-TR"
                      )}{" "}
                      TL
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => openEditForm(event)}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50"
                    >
                      Düzenle
                    </button>

                    <button
                      onClick={() => toggleActive(event)}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50"
                    >
                      {event.active
                        ? "Pasife Al"
                        : "Aktifleştir"}
                    </button>

                    <button
                      onClick={() => deleteEvent(event)}
                      className="px-4 py-2.5 rounded-xl border border-red-200 text-sm font-bold text-red-600 hover:bg-red-50"
                    >
                      Sil
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl">
            <div className="px-6 md:px-8 py-5 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">
                  {editingId
                    ? "Etkinliği Düzenle"
                    : "Yeni Etkinlik"}
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Etkinlik bilgilerini doldur.
                </p>
              </div>

              <button
                onClick={closeForm}
                className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold"
              >
                ×
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="p-6 md:p-8 space-y-5"
            >
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Etkinlik Adı *
                </label>

                <input
                  value={form.title}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      title: e.target.value,
                    })
                  }
                  placeholder="Örn. Boğazda Romantik Tekne Turu"
                  className="w-full h-12 rounded-xl border border-slate-300 px-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Kategori *
                  </label>

                  <input
                    value={form.category}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        category: e.target.value,
                      })
                    }
                    placeholder="Örn. Tekne"
                    className="w-full h-12 rounded-xl border border-slate-300 px-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Konum *
                  </label>

                  <input
                    value={form.location}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        location: e.target.value,
                      })
                    }
                    placeholder="Örn. İstanbul Boğazı"
                    className="w-full h-12 rounded-xl border border-slate-300 px-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Fiyat (TL) *
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={form.price}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        price: e.target.value,
                      })
                    }
                    placeholder="15000"
                    className="w-full h-12 rounded-xl border border-slate-300 px-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Kapasite
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={form.capacity}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        capacity: e.target.value,
                      })
                    }
                    placeholder="20"
                    className="w-full h-12 rounded-xl border border-slate-300 px-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Süre
                  </label>

                  <input
                    value={form.duration}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        duration: e.target.value,
                      })
                    }
                    placeholder="2 saat"
                    className="w-full h-12 rounded-xl border border-slate-300 px-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Görsel URL
                </label>

                <input
                  value={form.image_url}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      image_url: e.target.value,
                    })
                  }
                  placeholder="https://..."
                  className="w-full h-12 rounded-xl border border-slate-300 px-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />

                <p className="text-xs text-slate-400 mt-2">
                  Şimdilik internet üzerindeki görsel URL'sini
                  kullanıyoruz. Daha sonra Supabase Storage
                  ile görsel yükleme ekleyeceğiz.
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Açıklama
                </label>

                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      description: e.target.value,
                    })
                  }
                  rows={5}
                  placeholder="Etkinlik hakkında detaylı açıklama..."
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none resize-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      active: e.target.checked,
                    })
                  }
                  className="w-5 h-5 accent-blue-600"
                />

                <span className="text-sm font-semibold text-slate-700">
                  Etkinlik aktif olarak yayınlansın
                </span>
              </label>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-5 py-3 rounded-xl border border-slate-200 font-bold text-slate-700 hover:bg-slate-50"
                >
                  Vazgeç
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold"
                >
                  {saving
                    ? "Kaydediliyor..."
                    : editingId
                    ? "Değişiklikleri Kaydet"
                    : "Etkinliği Oluştur"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
