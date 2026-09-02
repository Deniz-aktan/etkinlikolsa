export type Category = {
  id: string;
  label: string;
  icon: string;
};

export const categories: Category[] = [
  { id: "tekne", label: "Tekne Turları", icon: "sailboat" },
  { id: "parti", label: "Parti & Kutlama", icon: "party-popper" },
  { id: "teklif", label: "Evlilik Teklifi", icon: "heart" },
  { id: "dogumgunu", label: "Doğum Günü", icon: "cake" },
  { id: "kurumsal", label: "Kurumsal", icon: "briefcase" },
  { id: "diger", label: "Diğer Etkinlikler", icon: "sparkles" },
];

export type EventItem = {
  id: string;
  title: string;
  category: string;
  location: string;
  rating: number;
  reviewCount: number;
  price: string;
  image: string;
};

export const featuredEvents: EventItem[] = [
  {
    id: "1",
    title: "Boğaz'da Özel Tekne Turu",
    category: "Tekne Turu",
    location: "Beşiktaş, İstanbul",
    rating: 4.9,
    reviewCount: 214,
    price: "15.000 TL",
    image:
      "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "2",
    title: "Yat Kiralama ile Parti",
    category: "Parti",
    location: "Kalamış, İstanbul",
    rating: 4.8,
    reviewCount: 156,
    price: "18.900 TL",
    image:
      "https://images.unsplash.com/photo-1540946485063-a40da27545f8?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "3",
    title: "Romantik Gökte Evlilik Teklifi",
    category: "Evlilik Teklifi",
    location: "Ortaköy, İstanbul",
    rating: 5.0,
    reviewCount: 98,
    price: "9.500 TL",
    image:
      "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "4",
    title: "Doğum Günü Süsleme Paketi",
    category: "Doğum Günü",
    location: "Nişantaşı, İstanbul",
    rating: 4.7,
    reviewCount: 312,
    price: "7.500 TL",
    image:
      "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?q=80&w=800&auto=format&fit=crop",
  },
];

export type Testimonial = {
  id: string;
  name: string;
  event: string;
  quote: string;
  rating: number;
  avatar: string;
};

export const testimonials: Testimonial[] = [
  {
    id: "1",
    name: "Ayşe K.",
    event: "Tekne Turu",
    quote:
      "Yıldönümümüz için ayarladığımız tekne turu tam istediğimiz gibiydi, ekip baştan sona çok ilgiliydi.",
    rating: 5,
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop",
  },
  {
    id: "2",
    name: "Mehmet T.",
    event: "Evlilik Teklifi",
    quote:
      "Teklif organizasyonu sürpriz olarak harika geçti, tüm detaylar zamanında ve sorunsuz kuruldu.",
    rating: 5,
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop",
  },
  {
    id: "3",
    name: "Selin A.",
    event: "Kurumsal Etkinlik",
    quote:
      "Şirket etkinliğimiz için mekan ve organizasyon süreci beklediğimizden çok daha kolay ilerledi.",
    rating: 4,
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&auto=format&fit=crop",
  },
];
