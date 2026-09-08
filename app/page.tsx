import Navbar from "@/components/layout/navbar";
import Hero from "@/components/landing/hero";
import Features from "@/components/landing/features";
import JournalShowcase from "@/components/landing/journal-showcase";
import Footer from "@/components/layout/footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#02060b] text-white">
      <Navbar />
      <Hero />
      <Features />
      <JournalShowcase />
      <Footer />
    </main>
  );
}