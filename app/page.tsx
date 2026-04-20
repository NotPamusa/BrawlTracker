import Navbar from "@/components/Navbar";
import LandingHero from "@/components/LandingHero";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex flex-col flex-1 relative z-10">
        <LandingHero />
      </main>
    </>
  );
}
