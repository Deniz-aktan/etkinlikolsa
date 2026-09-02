export default function Footer() {
  return (
    <footer className="bg-ink">
      <div className="mx-auto max-w-7xl px-5 py-14 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <span className="font-display text-lg font-extrabold text-white">
              Etkinlik<span className="text-sky-light">Olsa</span>
            </span>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-slate-400">
              İstanbul&apos;da özel anlarınız için doğru mekanı ve ekibi
              bulmanın en kolay yolu.
            </p>
          </div>
          <FooterCol
            title="Keşfet"
            links={["Tekne Turları", "Parti & Kutlama", "Evlilik Teklifi", "Doğum Günü"]}
          />
          <FooterCol
            title="Şirket"
            links={["Hakkımızda", "Kariyer", "Blog", "İletişim"]}
          />
          <FooterCol
            title="Destek"
            links={["Sıkça Sorulanlar", "İptal Koşulları", "Gizlilik", "Kullanım Şartları"]}
          />
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-xs text-slate-500 sm:flex-row">
          <p>© 2026 EtkinlikOlsa. Tüm hakları saklıdır.</p>
          <div className="flex gap-4">
            <span>Google 4.9/5</span>
            <span>Facebook 4.8/5</span>
            <span>Trustpilot 4.7/5</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: string[] }) {
  return (
    <div>
      <p className="mb-4 text-sm font-bold text-white">{title}</p>
      <ul className="space-y-2.5">
        {links.map((l) => (
          <li key={l}>
            <a
              href="#"
              className="text-sm text-slate-400 transition hover:text-white"
            >
              {l}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
