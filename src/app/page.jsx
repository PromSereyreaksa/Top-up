import HomePage from "@/components/HomePage"
import { GameProvider } from "@/context/GameContext"
import Footer from "@/components/Footer"

export default function Home() {
  return (
    <div>
      <GameProvider>
        <HomePage />
        <Footer />
      </GameProvider>
    </div>
  )
}
