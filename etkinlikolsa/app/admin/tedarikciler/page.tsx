"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  Check,
  Loader2,
  Mail,
  Phone,
  Plus,
  RefreshCw,
  ShieldCheck,
  Trash2,
  User,
  X,
} from "lucide-react";

type EventItem = {
  id: string;
  title: string;
  category: string | null;
  location: string | null;
  active: boolean | null;
};

type Supplier = {
  id: string;
  user_id: string;
  company_name: string;
  contact_name: string;
  phone: string | null;
  email: string;
  description: string | null;
  status: string;
  created_at: string;
};

export default function SuppliersPage() {
  const router = useRouter();

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showForm, setShowForm] = useState(false);

  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [description, setDescription] = useState("");

  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);

  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.replace("/login");
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (
      profileError ||
      (profile?.role !== "admin" &&
        profile?.role !== "super_admin")
    ) {
      router.replace("/");
      return;
    }

    const [
      { data: supplierData, error: supplierError },
      { data: eventData, error: eventError },
    ] = await Promise.all([
      supabase
        .from("suppliers")
        .select(
          "id, user_id, company_name, contact_name, phone, email, description, status, created_at"
        )
        .order("created_at", { ascending: false }),

      supabase
        .from("events")
        .select(
          "id, title, category, location, active"
        )
        .order("created_at", { ascending: false }),
    ]);

    if (supplierError) {
      console.error("SUPPLIER LOAD ERROR:", supplierError);
      setError(
        "Tedarikçiler yüklenemedi: " +
          supplierError.message
      );
    }

    if (eventError) {
      console.error("EVENT LOAD ERROR:", eventError);
      setError(
        "Etkinlikler yüklenemedi: " +
          eventError.message
      );
    }

    setSuppliers(supplierData || []);
    setEvents(eventData || []);
    setLoading(false);
  }

  function resetForm() {
    setCompanyName("");
    setContactName("");
    setEmail("");
    setPhone("");
    setPassword("");
    setDescription("");
    setSelectedEvents([]);
    setMessage("");
    setError("");
  }

  function toggleEvent(eventId: string) {
    setSelectedEvents((current) =>
      current.includes(eventId)
        ? current.filter((id) => id !== eventId)
        : [...current, eventId]
    );
  }

  async function createSupplier(e: FormEvent) {
    e.preventDefault();

    setMessage("");
    setError("");

    const cleanCompanyName = companyName.trim();
    const cleanContactName = contactName.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();
    const cleanDescription = description.trim();

    if (
      !cleanCompanyName ||
      !cleanContactName ||
      !cleanEmail ||
      !password
    ) {
      setError(
        "Firma adı, yetkili adı, e-posta ve şifre zorunludur."
      );
      return;
    }

    if (password.length < 6) {
      setError("Şifre en az 6 karakter olmalıdır.");
      return;
    }

    setSaving(true);

    try {
      /*
       * AKTİF OTURUMU AL
       */
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        throw new Error(
          "Oturum kontrol edilemedi: " +
            sessionError.message
        );
      }

      if (!session) {
        throw new Error(
          "Admin oturumu bulunamadı. Lütfen tekrar giriş yap."
        );
      }

      /*
       * EDGE FUNCTION ÇAĞRISI
       *
       * Authorization tokenını açıkça gönderiyoruz.
       */
      const { data, error: functionError } =
        await supabase.functions.invoke(
          "create-supplier",
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },

            body: {
              company_name: cleanCompanyName,
              contact_name: cleanContactName,
              email: cleanEmail,
              phone: cleanPhone,
              password,
              description: cleanDescription,
              event_ids: selectedEvents,
            },
          }
        );

      /*
       * EDGE FUNCTION HATASINI DETAYLI YAKALA
       */
      if (functionError) {
        console.error(
          "EDGE FUNCTION ERROR:",
          functionError
        );

        let detailedMessage =
          functionError.message ||
          "Tedarikçi oluşturulamadı.";

        /*
         * Supabase FunctionsHttpError içerisinde
         * gerçek Response nesnesi bulunabilir.
         */
        const response =
          (
            functionError as {
              context?: Response;
            }
          ).context;

        if (response) {
          try {
            const responseText =
              await response.clone().text();

            if (responseText) {
              try {
                const parsed =
                  JSON.parse(responseText);

                if (parsed?.error) {
                  detailedMessage =
                    parsed.error;
                } else if (
                  parsed?.message
                ) {
                  detailedMessage =
                    parsed.message;
                } else {
                  detailedMessage =
                    responseText;
                }
              } catch {
                detailedMessage =
                  responseText;
              }
            }
          } catch (readError) {
            console.error(
              "FUNCTION RESPONSE READ ERROR:",
              readError
            );
          }
        }

        throw new Error(detailedMessage);
      }

      /*
       * FUNCTION BAŞARILI CEVAP VERDİ Mİ?
       */
      if (!data?.success) {
        throw new Error(
          data?.error ||
            "Tedarikçi oluşturulamadı."
        );
      }

      /*
       * BAŞARILI
       */
      setMessage(
        "Tedarikçi başarıyla oluşturuldu ve seçilen etkinlikler atandı."
      );

      resetForm();
      setShowForm(false);

      await loadData();
    } catch (err) {
      console.error(
        "CREATE SUPPLIER ERROR:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Tedarikçi oluşturulurken bir hata oluştu."
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteSupplier(
    supplier: Supplier
  ) {
    const confirmed = window.confirm(
      `${supplier.company_name} tedarikçisini silmek istediğine emin misin?\n\nBu işlem tedarikçi kaydını siler.`
    );

    if (!confirmed) return;

    setError("");
    setMessage("");

    const { error: deleteError } =
      await supabase
        .from("suppliers")
        .delete()
        .eq("id", supplier.id);

    if (deleteError) {
      console.error(
        "DELETE SUPPLIER ERROR:",
        deleteError
      );

      setError(
        "Tedarikçi silinemedi: " +
          deleteError.message
      );

      return;
    }

    setMessage("Tedarikçi kaydı silindi.");

    await loadData();
  }

  const filteredSuppliers =
    suppliers.filter((supplier) => {
      const text = [
        supplier.company_name,
        supplier.contact_name,
        supplier.email,
        supplier.phone || "",
      ]
        .join(" ")
        .toLowerCase();

      return text.includes(
        search.toLowerCase()
      );
    });

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500">
          <Loader2
            className="animate-spin"
            size={22}
          />
          Tedarikçiler yükleniyor...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* HEADER */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">
          <div>
            <button
              onClick={() =>
                router.push("/admin")
              }
              className="mb-1 flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-600"
            >
              <ArrowLeft size={16} />
              Yönetim Paneli
            </button>

            <h1 className="text-2xl font-black">
              Tedarikçiler
            </h1>
          </div>

          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-bold text-white shadow-sm hover:bg-blue-700"
          >
            <Plus size={19} />
            Tedarikçi Tanımla
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
        {/* MESAJ */}
        {message && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm font-semibold text-green-700">
            <Check size={19} />
            {message}
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
            <div className="flex items-start gap-3">
              <X
                size={19}
                className="mt-0.5 shrink-0"
              />

              <div className="min-w-0">
                <p className="font-black">
                  İşlem başarısız
                </p>

                <p className="mt-1 break-words whitespace-pre-wrap">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* İSTATİSTİK */}
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Building2 size={22} />
            </div>

            <p className="text-sm font-semibold text-slate-500">
              Toplam Tedarikçi
            </p>

            <p className="mt-1 text-3xl font-black">
              {suppliers.length}
            </p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-600">
              <ShieldCheck size={22} />
            </div>

            <p className="text-sm font-semibold text-slate-500">
              Aktif / Onaylı
            </p>

            <p className="mt-1 text-3xl font-black">
              {
                suppliers.filter(
                  (supplier) =>
                    supplier.status ===
                    "approved"
                ).length
              }
            </p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <CalendarDays size={22} />
            </div>

            <p className="text-sm font-semibold text-slate-500">
              Toplam Etkinlik
            </p>

            <p className="mt-1 text-3xl font-black">
              {events.length}
            </p>
          </div>
        </div>

        {/* TEDARİKÇİ LİSTESİ */}
        <div className="rounded-3xl bg-white shadow-sm ring-1 ring-slate-100">
          <div className="flex flex-col gap-4 border-b border-slate-100 p-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-black">
                Tedarikçi Listesi
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Sistemde kayıtlı tedarikçiler
              </p>
            </div>

            <div className="flex gap-2">
              <input
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Tedarikçi ara..."
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500 md:w-64"
              />

              <button
                onClick={loadData}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-50"
                title="Yenile"
              >
                <RefreshCw size={18} />
              </button>
            </div>
          </div>

          {filteredSuppliers.length === 0 ? (
            <div className="p-12 text-center">
              <Building2
                size={44}
                className="mx-auto text-slate-300"
              />

              <p className="mt-4 font-bold">
                Henüz tedarikçi yok.
              </p>

              <p className="mt-1 text-sm text-slate-500">
                İlk tedarikçiyi oluşturmak için
                yukarıdaki butonu kullan.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredSuppliers.map(
                (supplier) => (
                  <div
                    key={supplier.id}
                    className="p-6"
                  >
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex items-start gap-4">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                          <Building2 size={25} />
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-black">
                              {
                                supplier.company_name
                              }
                            </h3>

                            <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700">
                              {supplier.status ===
                              "approved"
                                ? "Onaylı"
                                : supplier.status}
                            </span>
                          </div>

                          <div className="mt-2 flex flex-col gap-1 text-sm text-slate-500">
                            <span className="flex items-center gap-2">
                              <User size={15} />
                              {
                                supplier.contact_name
                              }
                            </span>

                            <span className="flex items-center gap-2">
                              <Mail size={15} />
                              {supplier.email}
                            </span>

                            {supplier.phone && (
                              <span className="flex items-center gap-2">
                                <Phone size={15} />
                                {supplier.phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() =>
                          deleteSupplier(
                            supplier
                          )
                        }
                        className="flex w-fit items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50"
                      >
                        <Trash2 size={17} />
                        Sil
                      </button>
                    </div>

                    {supplier.description && (
                      <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
                        {supplier.description}
                      </div>
                    )}
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </section>

      {/* TEDARİKÇİ OLUŞTURMA MODAL */}
      {showForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/50 p-4">
          <div className="flex min-h-full items-center justify-center">
            <div className="w-full max-w-3xl rounded-3xl bg-white shadow-2xl">
              {/* MODAL HEADER */}
              <div className="flex items-center justify-between border-b border-slate-100 p-6">
                <div>
                  <h2 className="text-2xl font-black">
                    Tedarikçi Tanımla
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Tedarikçi hesabını oluştur ve
                    etkinliklerini ata.
                  </p>
                </div>

                <button
                  onClick={() =>
                    setShowForm(false)
                  }
                  className="flex h-10 w-10 items-center justify-center rounded-xl hover:bg-slate-100"
                >
                  <X size={20} />
                </button>
              </div>

              <form
                onSubmit={createSupplier}
                className="p-6"
              >
                <div className="grid gap-5 md:grid-cols-2">
                  {/* FIRMA */}
                  <div>
                    <label className="mb-2 block text-sm font-bold">
                      Firma Adı *
                    </label>

                    <div className="relative">
                      <Building2
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        value={companyName}
                        onChange={(e) =>
                          setCompanyName(
                            e.target.value
                          )
                        }
                        placeholder="Örn. ABC Tekne"
                        className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* YETKİLİ */}
                  <div>
                    <label className="mb-2 block text-sm font-bold">
                      Yetkili Adı Soyadı *
                    </label>

                    <div className="relative">
                      <User
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        value={contactName}
                        onChange={(e) =>
                          setContactName(
                            e.target.value
                          )
                        }
                        placeholder="Örn. Ahmet Yılmaz"
                        className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* EMAIL */}
                  <div>
                    <label className="mb-2 block text-sm font-bold">
                      E-posta *
                    </label>

                    <div className="relative">
                      <Mail
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        type="email"
                        value={email}
                        onChange={(e) =>
                          setEmail(
                            e.target.value
                          )
                        }
                        placeholder="tedarikci@email.com"
                        className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* TELEFON */}
                  <div>
                    <label className="mb-2 block text-sm font-bold">
                      Telefon
                    </label>

                    <div className="relative">
                      <Phone
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        value={phone}
                        onChange={(e) =>
                          setPhone(
                            e.target.value
                          )
                        }
                        placeholder="05XX XXX XX XX"
                        className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* ŞİFRE */}
                  <div>
                    <label className="mb-2 block text-sm font-bold">
                      Giriş Şifresi *
                    </label>

                    <input
                      type="password"
                      value={password}
                      onChange={(e) =>
                        setPassword(
                          e.target.value
                        )
                      }
                      placeholder="En az 6 karakter"
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
                    />

                    <p className="mt-1 text-xs text-slate-400">
                      Bu şifre tedarikçinin
                      `/tedarikci/login` ekranında
                      kullanacağı şifredir.
                    </p>
                  </div>

                  {/* AÇIKLAMA */}
                  <div>
                    <label className="mb-2 block text-sm font-bold">
                      Açıklama
                    </label>

                    <textarea
                      value={description}
                      onChange={(e) =>
                        setDescription(
                          e.target.value
                        )
                      }
                      rows={3}
                      placeholder="Tedarikçi hakkında kısa bilgi..."
                      className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* ETKİNLİK ATAMA */}
                <div className="mt-7">
                  <div className="mb-3">
                    <h3 className="font-black">
                      Etkinlik Ata
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      Bu tedarikçinin yönetebileceği
                      etkinlikleri seç.
                    </p>
                  </div>

                  {events.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
                      Sistemde henüz etkinlik
                      bulunmuyor.
                    </div>
                  ) : (
                    <div className="grid max-h-72 gap-3 overflow-y-auto rounded-2xl border border-slate-200 p-3 md:grid-cols-2">
                      {events.map((event) => {
                        const selected =
                          selectedEvents.includes(
                            event.id
                          );

                        return (
                          <button
                            key={event.id}
                            type="button"
                            onClick={() =>
                              toggleEvent(
                                event.id
                              )
                            }
                            className={`flex items-start gap-3 rounded-xl border p-4 text-left transition ${
                              selected
                                ? "border-blue-500 bg-blue-50"
                                : "border-slate-200 hover:border-blue-300 hover:bg-slate-50"
                            }`}
                          >
                            <div
                              className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                                selected
                                  ? "border-blue-600 bg-blue-600 text-white"
                                  : "border-slate-300 bg-white"
                              }`}
                            >
                              {selected && (
                                <Check size={14} />
                              )}
                            </div>

                            <div className="min-w-0">
                              <p className="font-bold">
                                {event.title}
                              </p>

                              <p className="mt-1 text-xs text-slate-500">
                                {event.category ||
                                  "Kategori yok"}

                                {event.location
                                  ? ` • ${event.location}`
                                  : ""}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  <p className="mt-2 text-xs font-semibold text-blue-600">
                    {selectedEvents.length} etkinlik
                    seçildi
                  </p>
                </div>

                {/* HATA */}
                {error && (
                  <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
                    <div className="flex items-start gap-3">
                      <X
                        size={18}
                        className="mt-0.5 shrink-0"
                      />

                      <p className="break-words whitespace-pre-wrap">
                        {error}
                      </p>
                    </div>
                  </div>
                )}

                {/* BUTTONS */}
                <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() =>
                      setShowForm(false)
                    }
                    disabled={saving}
                    className="rounded-xl border border-slate-200 px-5 py-3 font-bold hover:bg-slate-50 disabled:opacity-50"
                  >
                    Vazgeç
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving ? (
                      <>
                        <Loader2
                          size={18}
                          className="animate-spin"
                        />
                        Oluşturuluyor...
                      </>
                    ) : (
                      <>
                        <ShieldCheck size={18} />
                        Tedarikçiyi Oluştur
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
