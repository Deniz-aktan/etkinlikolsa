"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";

export default function StaffLoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: FormEvent) {
    e.preventDefault();

    setError("");

    const loginUsername = username.trim();

    if (!loginUsername || !password) {
      setError("Kullanıcı adı ve şifreyi girin.");
      return;
    }

    setLoading(true);

    try {
      const { data: email, error: emailError } = await supabase.rpc(
        "get_staff_email",
        {
          login_username: loginUsername,
        }
      );

      if (emailError || !email) {
        setError("Kullanıcı adı veya şifre hatalı.");
        setLoading(false);
        return;
      }

      const { error: loginError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (loginError) {
        setError("Kullanıcı adı veya şifre hatalı.");
        setLoading(false);
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("Giriş sırasında bir sorun oluştu.");
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profileError || !profile) {
        setError("Hesap yetkileri alınamadı.");
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }

      if (
        profile.role === "admin" ||
        profile.role === "super_admin"
      ) {
        router.replace("/admin");
        return;
      }

      if (profile.role === "supplier") {
        router.replace("/tedarikci");
        return;
      }

      await supabase.auth.signOut();

      setError("Bu hesap tedarikçi veya yetkili hesabı değil.");
      setLoading(false);
    } catch {
      setError("Beklenmeyen bir hata oluştu.");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8 md:p-10">

          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 text-white text-xl font-extrabold mb-4">
              EO
            </div>

            <h1 className="text-2xl font-extrabold text-slate-900">
              EtkinlikOlsa
            </h1>

            <p className="text-slate-500 mt-2">
              Tedarikçi Girişi
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Kullanıcı adı
              </label>

              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Kullanıcı adınız"
                autoComplete="username"
                className="w-full h-12 rounded-xl border border-slate-300 px-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Şifre
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Şifreniz"
                autoComplete="current-password"
                className="w-full h-12 rounded-xl border border-slate-300 px-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition"
              />
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold transition"
            >
              {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
            </button>
          </form>

          <div className="mt-6 rounded-2xl bg-slate-50 border border-slate-200 p-4">
            <p className="text-xs text-slate-500 text-center leading-5">
              Bu alan EtkinlikOlsa tedarikçi ve yetkili
              hesapları içindir.
            </p>
          </div>

          <div className="mt-6 text-center">
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
          EtkinlikOlsa Tedarikçi Sistemi
        </p>
      </div>
    </main>
  );
}
