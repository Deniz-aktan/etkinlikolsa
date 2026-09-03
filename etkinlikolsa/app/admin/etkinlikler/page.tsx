"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
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

type FormData = {
  title: string;
  category: string;
  location: string;
  price: string;
  capacity: string;
  duration: string;
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

const emptyForm: FormData = {
  title: "",
  category: "",
  location: "",
  price: "",
  capacity: "",
  duration: "",
  description: "",
};

export default function EventsAdminPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [events, setEvents] = useState<EventItem[]>([]);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] =
    useState<EventItem | null>(null);

  const [form, setForm] = useState<FormData>(emptyForm);

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    checkAdminAndLoad();

    // Dashboard'dan "?new=1" ile gelindiyse
    // yeni etkinlik penceresini aç.
    if (
      typeof window !== "undefined" &&
      window.location.search.includes("new=1")
    ) {
      setTimeout(() => {
        openNewEvent();
      }, 300);
    }
  }, []);

  async function checkAdminAndLoad() {
    setLoading(true);
    setError("");

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.replace("/tedarikci/login");
        return;
      }

      const {
        data: role,
        error: roleError,
      } = await supabase.rpc("current_user_role");

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
    } catch (err) {
      console.error(err);

      setError(
        "Sayfa yüklenirken beklenmeyen bir hata oluştu."
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadEvents() {
    setError("");

    const {
      data,
      error: eventsError,
    } = await supabase
      .from("events")
      .select(
        "id,title,category,location,price,capacity,duration,description,image_url,active,created_at"
      )
      .order("created_at", {
        ascending: false,
      });

    if (eventsError) {
      console.error(
        "EVENTS ERROR:",
        eventsError
      );

      setError(
        `Etkinlikler yüklenemedi: ${eventsError.message}`
      );

      return;
    }

    setEvents(
      (data || []) as EventItem[]
    );
  }

  function openNewEvent() {
    setEditingEvent(null);

    setForm({
      ...emptyForm,
    });

    setSelectedFile(null);
    setPreviewUrl("");

    setError("");
    setSuccess("");

    setModalOpen(true);
  }

  function openEditEvent(
    event: EventItem
  ) {
    setEditingEvent(event);

    setForm({
      title: event.title || "",
      category: event.category || "",
      location: event.location || "",
      price: String(event.price ?? ""),
      capacity:
        event.capacity !== null &&
        event.capacity !== undefined
          ? String(event.capacity)
          : "",
      duration: event.duration || "",
      description:
        event.description || "",
    });

    setSelectedFile(null);
    setPreviewUrl(
      event.image_url || ""
    );

    setError("");
    setSuccess("");

    setModalOpen(true);
  }

  function closeModal() {
    if (saving) return;

    setModalOpen(false);
    setEditingEvent(null);

    setForm({
      ...emptyForm,
    });

    setSelectedFile(null);
    setPreviewUrl("");
  }

  function handleFileChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0];

    if (!file) return;

    setError("");

    const allowedTypes = [
      "image/png",
      "image/jpeg",
      "image/webp",
    ];

    if (
      !allowedTypes.includes(
        file.type
      )
    ) {
      setError(
        "Sadece PNG, JPG, JPEG veya WEBP görsel yükleyebilirsin."
      );

      event.target.value = "";
      return;
    }

    const maxSize =
      10 * 1024 * 1024;

    if (file.size > maxSize) {
      setError(
        "Görsel boyutu en fazla 10 MB olabilir."
      );

      event.target.value = "";
      return;
    }

    setSelectedFile(file);

    const objectUrl =
      URL.createObjectURL(file);

    setPreviewUrl(objectUrl);
  }

  function updateForm(
    field: keyof FormData,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function uploadImage(
    file: File
  ) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error(
        "Oturum bulunamadı. Lütfen tekrar giriş yap."
      );
    }

    const extension =
      file.name
        .split(".")
        .pop()
        ?.toLowerCase() ||
      "jpg";

    const safeName =
      file.name
        .replace(/\.[^/.]+$/, "")
        .replace(
          /[^a-zA-Z0-9-_]/g,
          "-"
        )
        .toLowerCase();

    const filePath =
      `${user.id}/${Date.now()}-${safeName}.${extension}`;

    const {
      error: uploadError,
    } = await supabase.storage
      .from("event-images")
      .upload(
        filePath,
        file,
        {
          cacheControl: "3600",
          upsert: false,
          contentType:
            file.type,
        }
      );

    if (uploadError) {
      console.error(
        "UPLOAD ERROR:",
        uploadError
      );

      throw new Error(
        `Görsel yüklenemedi: ${uploadError.message}`
      );
    }

    const {
      data,
    } = supabase.storage
      .from("event-images")
      .getPublicUrl(
        filePath
      );

    if (
      !data ||
      !data.publicUrl
    ) {
      throw new Error(
        "Görsel adresi oluşturulamadı."
      );
    }

    return data.publicUrl;
  }

  async function handleSubmit(
    event: FormEvent
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!form.title.trim()) {
      setError(
        "Etkinlik adını gir."
      );
      return;
    }

    if (!form.category) {
      setError(
        "Kategori seç."
      );
      return;
    }

    if (!form.location.trim()) {
      setError(
        "Konum gir."
      );
      return;
    }

    const price =
      Number(form.price);

    if (
      !form.price ||
      Number.isNaN(price) ||
      price < 0
    ) {
      setError(
        "Geçerli bir fiyat gir."
      );
      return;
    }

    if (form.capacity) {
      const capacity =
        Number(form.capacity);

      if (
        Number.isNaN(capacity) ||
        capacity < 1
      ) {
        setError(
          "Geçerli bir kapasite gir."
        );
        return;
      }
    }

    if (
      !editingEvent &&
      !selectedFile
    ) {
      setError(
        "Lütfen etkinlik görselini seç."
      );
      return;
    }

    setSaving(true);

    try {
      let imageUrl =
        editingEvent?.image_url ||
        null;

      // Yeni görsel seçildiyse önce Storage'a yükle
      if (selectedFile) {
        imageUrl =
          await uploadImage(
            selectedFile
          );
      }

      const payload = {
        title:
          form.title.trim(),

        category:
          form.category.trim(),

        location:
          form.location.trim(),

        price,

        capacity:
          form.capacity
            ? Number(form.capacity)
            : null,

        duration:
          form.duration.trim() ||
          null,

        description:
          form.description.trim() ||
          null,

        image_url:
          imageUrl,

        active:
          editingEvent?.active ??
          true,
      };

      if (editingEvent) {
        const {
          error: updateError,
        } = await supabase
          .from("events")
          .update(payload)
          .eq(
            "id",
            editingEvent.id
          );

        if (updateError) {
          console.error(
            "UPDATE ERROR:",
            updateError
          );

          throw new Error(
            `Etkinlik güncellenemedi: ${updateError.message}`
          );
        }

        setSuccess(
          "Etkinlik başarıyla güncellendi."
        );
      } else {
        const {
          error: insertError,
        } = await supabase
          .from("events")
          .insert(
            payload
          );

        if (insertError) {
          console.error(
            "INSERT ERROR:",
            insertError
          );

          throw new Error(
            `Etkinlik oluşturulamadı: ${insertError.message}`
          );
        }

        setSuccess(
          "Etkinlik başarıyla oluşturuldu."
        );
      }

      await loadEvents();

      setTimeout(() => {
        closeModal();
      }, 700);
    } catch (err) {
      console.error(err);

      if (
        err instanceof Error
      ) {
        setError(
          err.message
        );
      } else {
        setError(
          "Etkinlik kaydedilirken bir hata oluştu."
        );
      }
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(
    event: EventItem
  ) {
    setError("");
    setSuccess("");

    const {
      error: updateError,
    } = await supabase
      .from("events")
      .update({
        active:
          !event.active,
      })
      .eq(
        "id",
        event.id
      );

    if (updateError) {
      setError(
        `Durum değiştirilemedi: ${updateError.message}`
      );
      return;
    }

    setSuccess(
      event.active
        ? "Etkinlik pasife alındı."
        : "Etkinlik tekrar aktif edildi."
    );

    await loadEvents();
  }

  async function deleteEvent(
    event: EventItem
  ) {
    const confirmed =
      window.confirm(
        `"${event.title}" etkinliğini silmek istediğine emin misin?`
      );

    if (!confirmed) {
      return;
    }

    setError("");
    setSuccess("");

    const {
      error: deleteError,
    } = await supabase
      .from("events")
      .delete()
      .eq(
        "id",
        event.id
      );

    if (deleteError) {
      setError(
        `Etkinlik silinemedi: ${deleteError.message}`
      );
      return;
    }

    setSuccess(
      "Etkinlik başarıyla silindi."
    );

    await loadEvents();
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">

          <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-extrabold text-xl mx-auto mb-4">
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

      {/* HEADER */}
      <header className="bg-white border-b border-slate-200">

        <div className="max-w-7xl mx-auto px-5 lg:px-8 py-6 flex items-center justify-between">

          <div>
            <p className="text-sm text-slate-500">
              Yönetim Paneli
            </p>

            <h1 className="text-3xl font-extrabold text-slate-900 mt-1">
              Etkinlikler
            </h1>
          </div>

          <div className="flex items-center gap-3">

            <button
              type="button"
              onClick={() =>
                router.push(
                  "/admin"
                )
              }
              className="px-5 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-semibold hover:bg-slate-50 transition"
            >
              ← Dashboard
            </button>

            <button
              type="button"
              onClick={
                openNewEvent
              }
              className="px-5 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition"
            >
              + Yeni Etkinlik
            </button>

          </div>

        </div>

      </header>

      {/* CONTENT */}
      <div className="max-w-7xl mx-auto px-5 lg:px-8 py-8">

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-red-700">

            <div className="font-bold">
              Hata
            </div>

            <div className="text-sm mt-1 break-words">
              {error}
            </div>

          </div>
        )}

        {success && (
          <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-green-700">

            <div className="font-bold">
              Başarılı
            </div>

            <div className="text-sm mt-1">
              {success}
            </div>

          </div>
        )}

        {/* EVENTS */}
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden">

          <div className="px-6 py-6 border-b border-slate-200">

            <h2 className="text-xl font-extrabold text-slate-900">
              Tüm Etkinlikler
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Sistemde kayıtlı{" "}
              {events.length}{" "}
              etkinlik
            </p>

          </div>

          {events.length === 0 ? (
            <div className="py-24 text-center">

              <div className="text-5xl mb-5">
                🎫
              </div>

              <h3 className="text-xl font-extrabold text-slate-900">
                Henüz etkinlik yok
              </h3>

              <p className="text-slate-500 mt-2">
                İlk etkinliğini oluşturarak
                başlayabilirsin.
              </p>

              <button
                type="button"
                onClick={
                  openNewEvent
                }
                className="mt-6 px-6 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition"
              >
                + İlk Etkinliği Oluştur
              </button>

            </div>
          ) : (
            <div className="divide-y divide-slate-100">

              {events.map(
                (event) => (
                  <div
                    key={
                      event.id
                    }
                    className="p-5 md:p-6 flex flex-col md:flex-row gap-5 md:items-center"
                  >

                    {/* IMAGE */}
                    <div className="w-full md:w-40 h-28 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0">

                      {event.image_url ? (
                        <img
                          src={
                            event.image_url
                          }
                          alt={
                            event.title
                          }
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl">
                          🖼️
                        </div>
                      )}

                    </div>

                    {/* INFO */}
                    <div className="flex-1 min-w-0">

                      <div className="flex flex-wrap items-center gap-2">

                        <h3 className="font-extrabold text-lg text-slate-900">
                          {
                            event.title
                          }
                        </h3>

                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-bold ${
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

                      <div className="flex flex-wrap gap-3 mt-2 text-sm text-slate-500">

                        <span>
                          📂{" "}
                          {
                            event.category
                          }
                        </span>

                        <span>
                          📍{" "}
                          {
                            event.location
                          }
                        </span>

                      </div>

                      <div className="flex flex-wrap gap-4 mt-3">

                        <span className="font-extrabold text-blue-600">
                          {Number(
                            event.price
                          ).toLocaleString(
                            "tr-TR"
                          )}{" "}
                          TL
                        </span>

                        {event.capacity && (
                          <span className="text-sm text-slate-500">
                            👥{" "}
                            {
                              event.capacity
                            }{" "}
                            kişi
                          </span>
                        )}

                        {event.duration && (
                          <span className="text-sm text-slate-500">
                            ⏱️{" "}
                            {
                              event.duration
                            }
                          </span>
                        )}

                      </div>

                    </div>

                    {/* ACTIONS */}
                    <div className="flex flex-wrap gap-2">

                      <button
                        type="button"
                        onClick={() =>
                          openEditEvent(
                            event
                          )
                        }
                        className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50 transition"
                      >
                        Düzenle
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          toggleActive(
                            event
                          )
                        }
                        className={`px-4 py-2.5 rounded-xl text-sm font-bold transition ${
                          event.active
                            ? "bg-amber-50 text-amber-700 hover:bg-amber-100"
                            : "bg-green-50 text-green-700 hover:bg-green-100"
                        }`}
                      >
                        {event.active
                          ? "Pasife Al"
                          : "Aktifleştir"}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          deleteEvent(
                            event
                          )
                        }
                        className="px-4 py-2.5 rounded-xl bg-red-50 text-red-600 text-sm font-bold hover:bg-red-100 transition"
                      >
                        Sil
                      </button>

                    </div>

                  </div>
                )
              )}

            </div>
          )}

        </div>

      </div>

      {/* MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">

          <div className="bg-white w-full max-w-3xl max-h-[92vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col">

            {/* MODAL HEADER */}
            <div className="px-6 md:px-8 py-5 border-b border-slate-200 flex items-center justify-between">

              <div>
                <h2 className="text-2xl font-extrabold text-slate-900">
                  {editingEvent
                    ? "Etkinliği Düzenle"
                    : "Yeni Etkinlik"}
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Etkinlik bilgilerini doldur.
                </p>
              </div>

              <button
                type="button"
                onClick={
                  closeModal
                }
                className="w-11 h-11 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 font-bold"
              >
                ×
              </button>

            </div>

            {/* FORM */}
            <form
              onSubmit={
                handleSubmit
              }
              className="overflow-y-auto"
            >

              <div className="p-6 md:p-8 space-y-6">

                {error && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 break-words">
                    {error}
                  </div>
                )}

                {/* TITLE */}
                <div>

                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Etkinlik Adı *
                  </label>

                  <input
                    type="text"
                    value={
                      form.title
                    }
                    onChange={(e) =>
                      updateForm(
                        "title",
                        e.target.value
                      )
                    }
                    placeholder="Örn. Boğazda Romantik Tekne Turu"
                    className="w-full h-12 rounded-xl border border-slate-300 px-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />

                </div>

                {/* CATEGORY LOCATION */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                  <div>

                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Kategori *
                    </label>

                    <select
                      value={
                        form.category
                      }
                      onChange={(e) =>
                        updateForm(
                          "category",
                          e.target.value
                        )
                      }
                      className="w-full h-12 rounded-xl border border-slate-300 px-4 bg-white outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    >

                      <option value="">
                        Kategori seç
                      </option>

                      {categories.map(
                        (
                          category
                        ) => (
                          <option
                            key={
                              category
                            }
                            value={
                              category
                            }
                          >
                            {
                              category
                            }
                          </option>
                        )
                      )}

                    </select>

                  </div>

                  <div>

                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Konum *
                    </label>

                    <input
                      type="text"
                      value={
                        form.location
                      }
                      onChange={(e) =>
                        updateForm(
                          "location",
                          e.target.value
                        )
                      }
                      placeholder="Örn. İstanbul Boğazı"
                      className="w-full h-12 rounded-xl border border-slate-300 px-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    />

                  </div>

                </div>

                {/* PRICE CAPACITY DURATION */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

                  <div>

                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Fiyat (TL) *
                    </label>

                    <input
                      type="number"
                      min="0"
                      value={
                        form.price
                      }
                      onChange={(e) =>
                        updateForm(
                          "price",
                          e.target.value
                        )
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
                      value={
                        form.capacity
                      }
                      onChange={(e) =>
                        updateForm(
                          "capacity",
                          e.target.value
                        )
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
                      type="text"
                      value={
                        form.duration
                      }
                      onChange={(e) =>
                        updateForm(
                          "duration",
                          e.target.value
                        )
                      }
                      placeholder="2 saat"
                      className="w-full h-12 rounded-xl border border-slate-300 px-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    />

                  </div>

                </div>

                {/* IMAGE UPLOAD */}
                <div>

                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Etkinlik Görseli *
                  </label>

                  <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-5">

                    {previewUrl && (
                      <div className="mb-4">

                        <img
                          src={
                            previewUrl
                          }
                          alt="Görsel önizleme"
                          className="w-full h-64 object-cover rounded-xl"
                        />

                      </div>
                    )}

                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={
                        handleFileChange
                      }
                      className="block w-full text-sm text-slate-600 file:mr-4 file:py-3 file:px-5 file:rounded-xl file:border-0 file:bg-blue-600 file:text-white file:font-bold hover:file:bg-blue-700 file:cursor-pointer"
                    />

                    <p className="text-xs text-slate-500 mt-3">
                      PNG, JPG, JPEG veya
                      WEBP • Maksimum
                      10 MB
                    </p>

                    {selectedFile && (
                      <p className="text-sm font-semibold text-green-600 mt-2">
                        ✓{" "}
                        {
                          selectedFile.name
                        }
                      </p>
                    )}

                    {!selectedFile &&
                      editingEvent?.image_url && (
                        <p className="text-xs text-slate-500 mt-2">
                          Mevcut görsel
                          kullanılacak. Yeni
                          görsel seçersen
                          değiştirilir.
                        </p>
                      )}

                  </div>

                </div>

                {/* DESCRIPTION */}
                <div>

                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Açıklama
                  </label>

                  <textarea
                    value={
                      form.description
                    }
                    onChange={(e) =>
                      updateForm(
                        "description",
                        e.target.value
                      )
                    }
                    rows={5}
                    placeholder="Etkinlik hakkında detaylı açıklama..."
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none resize-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />

                </div>

              </div>

              {/* FOOTER */}
              <div className="px-6 md:px-8 py-5 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">

                <button
                  type="button"
                  onClick={
                    closeModal
                  }
                  disabled={
                    saving
                  }
                  className="px-6 py-3 rounded-xl border border-slate-300 bg-white text-slate-700 font-bold hover:bg-slate-50 disabled:opacity-50"
                >
                  İptal
                </button>

                <button
                  type="submit"
                  disabled={
                    saving
                  }
                  className="px-7 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 disabled:bg-blue-400"
                >
                  {saving
                    ? "Kaydediliyor..."
                    : editingEvent
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
