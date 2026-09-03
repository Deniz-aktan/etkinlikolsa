"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function RegisterPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordAgain, setPasswordAgain] = useState("");

  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleRegister(e: FormEvent) {
    e.preventDefault();

    setError("");
    setSuccess("");

    const cleanName = fullName.trim();
    const cleanPhone = phone.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName || !cleanPhone || !cleanEmail || !password) {
      setError("Lütfen tüm zorunlu alanları doldurun.");
      return;
    }

    if (password.length < 6) {
      setError("Şifreniz en az 6 karakter olmalıdır.");
      return;
    }

    if (password !== passwordAgain) {
      setError("Şifreler birbiriyle eşleşmiyor.");
      return;
    }

    if (!termsAccepted) {
      setError("Üyelik Sözleşmesi'ni kabul etmeniz gerekiyor.");
      return;
    }

    if (!privacyAccepted) {
      setError("KVKK Aydınlatma Metni'ni okuduğunuzu onaylamanız gerekiyor.");
      return;
    }

    setLoading(true);

    const { error: signUpError } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: {
          full_name: cleanName,
          phone: cleanPhone,
          marketing_consent: marketingConsent,
          privacy_notice_acknowledged: privacyAccepted,
          terms_accepted: termsAccepted,
          username: cleanEmail.split("@")[0],
        },
      },
    });

    if (signUpError) {
      if (
        signUpError.message.toLowerCase().includes("already registered") ||
        signUpError.message.toLowerCase().includes("already exists")
      ) {
        setError(
          "Bu e-posta adresiyle daha önce hesap oluşturulmuş. Giriş yapmayı deneyin."
        );
      } else {
        setError(signUpError.message);
      }

      setLoading(false);
      return;
    }

    setSuccess(
      "Hesabınız başarıyla oluşturuldu. E-posta adresinizi kontrol ederek hesabınızı doğrulayabilirsiniz."
    );

    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8 md:p-10">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 text-white text-xl font-extrabold mb-4">
              EO
            </div>

            <h1 className="text-2xl font-extrabold text-slate-900">
              Hesap Oluştur
            </h1>

            <p className="text-slate-500 mt-2">
              EtkinlikOlsa dünyasına katılın
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-5">
            {/* Ad Soyad */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Ad Soyad
              </label>

              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Adınız ve soyadınız"
                autoComplete="name"
                className="w-full h-12 rounded-xl border border-slate-300 px-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition"
              />
            </div>

            {/* Telefon */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Telefon
              </label>

              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="05XX XXX XX XX"
                autoComplete="tel"
                className="w-full h-12 rounded-xl border border-slate-300 px-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition"
              />
            </div>

            {/* E-posta */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                E-posta
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ornek@email.com"
                autoComplete="email"
                className="w-full h-12 rounded-xl border border-slate-300 px-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition"
              />
            </div>

            {/* Şifre */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Şifre
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="En az 6 karakter"
                autoComplete="new-password"
                className="w-full h-12 rounded-xl border border-slate-300 px-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition"
              />
            </div>

            {/* Şifre Tekrar */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Şifre Tekrar
              </label>

              <input
                type="password"
                value={passwordAgain}
                onChange={(e) => setPasswordAgain(e.target.value)}
                placeholder="Şifrenizi tekrar girin"
                autoComplete="new-password"
                className="w-full h-12 rounded-xl border border-slate-300 px-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition"
              />
            </div>

            {/* Sözleşmeler */}
            <div className="space-y-4 pt-2">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-1 w-4 h-4 accent-blue-600"
                />

                <span className="text-sm text-slate-600 leading-6">
                  <button
                    type="button"
                    onClick={() => router.push("/uyelik-sozlesmesi")}
                    className="font-semibold text-blue-600 hover:underline"
                  >
                    Üyelik Sözleşmesi
                  </button>{" "}
                  hükümlerini okudum ve kabul ediyorum.
                  <span className="text-red-500"> *</span>
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={privacyAccepted}
                  onChange={(e) => setPrivacyAccepted(e.target.checked)}
                  className="mt-1 w-4 h-4 accent-blue-600"
                />

                <span className="text-sm text-slate-600 leading-6">
                  <button
                    type="button"
                    onClick={() => router.push("/kvkk")}
                    className="font-semibold text-blue-600 hover:underline"
                  >
                    KVKK Aydınlatma Metni
                  </button>
                  'ni okudum ve bilgilendirildim.
                  <span className="text-red-500"> *</span>
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={marketingConsent}
                  onChange={(e) => setMarketingConsent(e.target.checked)}
                  className="mt-1 w-4 h-4 accent-blue-600"
                />

                <span className="text-sm text-slate-600 leading-6">
                  EtkinlikOlsa tarafından kampanya, indirim, fırsat ve
                  tanıtımlara ilişkin ticari elektronik ileti gönderilmesini
                  kabul ediyorum.
                  <span className="block text-xs text-slate-400 mt-1">
                    Bu izin isteğe bağlıdır.
                  </span>
                </span>
              </label>
            </div>

            {/* Hata */}
            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Başarı */}
            {success && (
              <div className="rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
                {success}
              </div>
            )}

            {/* Kayıt */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold transition"
            >
              {loading ? "Hesap oluşturuluyor..." : "Hesap Oluştur"}
            </button>
          </form>

          <div className="mt-7 text-center">
            <p className="text-sm text-slate-500">
              Zaten hesabınız var mı?
            </p>

            <button
              type="button"
              onClick={() => router.push("/login")}
              className="mt-2 text-sm font-bold text-blue-600 hover:text-blue-700"
            >
              Giriş Yap
            </button>
          </div>

          <div className="mt-5 text-center">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="text-sm text-slate-500 hover:text-blue-600 transition"
            >
              ← Ana sayfaya dön
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-5">
          EtkinlikOlsa
        </p>
      </div>
    </main>
  );
}
