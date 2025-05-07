import HeroSection from "@/components/HeroSection";
import HomePage from "@/components/HomePage";
import { GameProvider } from "@/context/GameContext";
import Footer from "@/components/Footer";
import Image from "next/image";

export default function Home() {
  return (
    <div >
      <GameProvider>
        
      <HomePage />
      <Footer/>
      </GameProvider>
    </div>
  );
}
