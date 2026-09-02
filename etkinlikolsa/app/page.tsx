import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Categories from "@/components/Categories";
import FeaturedEvents from "@/components/FeaturedEvents";
import TrustBadges from "@/components/TrustBadges";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-surface">
      <Header />
      <Hero />
      <Categories />
      <FeaturedEvents />
      <TrustBadges />
      <Testimonials />
      <Footer />
    </main>
  );
}
