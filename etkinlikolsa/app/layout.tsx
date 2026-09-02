import type { Metadata } from "next";
import { Manrope, Inter } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  weight: ["500", "700", "800"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "EtkinlikOlsa | Özel Anlarınızı Unutulmaz Kılıyoruz",
  description:
    "Tekne turlarından evlilik tekliflerine, doğum günü partilerinden kurumsal organizasyonlara — EtkinlikOlsa ile her etkinlik için doğru mekanı ve ekibi saniyeler içinde bulun.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body className={`${manrope.variable} ${inter.variable} font-body`}>
        {children}
      </body>
    </html>
  );
}
