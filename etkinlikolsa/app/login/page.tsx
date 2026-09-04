"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) {
      setError("Lütfen e-posta ve şifrenizi girin.");
      return;
    }

    setLoading(true);

    try {
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (loginError || !data.session) {
        setError("E-posta veya şifre hatalı.");
        setLoading(false);
        return;
      }

      // Oturumun gerçekten tarayıcıya kaydedildiğini doğrula.
      const { data: sessionCheck } = await supabase.auth.getSession();

      if (!sessionCheck.session) {
        setError("Giriş yapıldı ancak oturum kaydedilemedi. Lütfen sayfayı yenileyip tekrar deneyin.");
        setLoading(false);
        return;
      }

      setSuccess("Giriş başarılı. Ana sayfaya yönlendiriliyorsunuz...");

      // Müşteri giriş yaptıktan sonra ana sayfada kalır; sağ üstte Hesabım görünür.
      setTimeout(() => {
        router.replace("/");
      }, 500);
    } catch {
      setError("Beklenmeyen bir hata oluştu.");
      setLoading(false);
    }
  }

  async function handleForgotPassword() {
    setError("");
    setSuccess("");

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setError("Şifre yenileme bağlantısı için önce e-posta adresinizi girin.");
      return;
    }

    setLoading(true);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: `${window.location.origin}/sifre-yenile`,
      });

      if (resetError) {
        setError("Şifre yenileme bağlantısı gönderilemedi. Lütfen e-posta adresinizi kontrol edin.");
        setLoading(false);
        return;
      }

      setSuccess("Şifre yenileme bağlantısı e-posta adresinize gönderildi.");
      setLoading(false);
    } catch {
      setError("Şifre yenileme sırasında bir hata oluştu.");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8 md:p-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 text-white text-xl font-extrabold mb-4">EO</div>
            <h1 className="text-2xl font-extrabold text-slate-900">Hoş Geldiniz</h1>
            <p className="text-slate-500 mt-2">EtkinlikOlsa hesabınıza giriş yapın</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">E-posta</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ornek@email.com" autoComplete="email" className="w-full h-12 rounded-xl border border-slate-300 px-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-slate-700">Şifre</label>
                <button type="button" onClick={handleForgotPassword} disabled={loading} className="text-xs font-semibold text-blue-600 hover:text-blue-700">Şifremi unuttum</button>
              </div>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Şifrenizi girin" autoComplete="current-password" className="w-full h-12 rounded-xl border border-slate-300 px-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition" />
            </div>

            {error && <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>}
            {success && <div className="rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">{success}</div>}

            <button type="submit" disabled={loading} className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold transition">
              {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
            </button>
          </form>

          <div className="mt-7 text-center">
            <p className="text-sm text-slate-500">Henüz hesabınız yok mu?</p>
            <button type="button" onClick={() => router.push("/register")} className="mt-2 text-sm font-bold text-blue-600 hover:text-blue-700">Hesap Oluştur</button>
          </div>

          <div className="mt-5 text-center">
            <button type="button" onClick={() => router.push("/")} className="text-sm text-slate-500 hover:text-blue-600 transition">← Ana sayfaya dön</button>
          </div>
        </div>
        <p className="text-center text-xs text-slate-400 mt-5">EtkinlikOlsa</p>
      </div>
    </main>
  );
}
