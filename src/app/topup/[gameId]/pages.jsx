"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { FaInfoCircle, FaCoins } from "react-icons/fa"
import { getGamePackages } from "@/services/api"
import { useGameContext } from "@/context/GameContext"

export default function TopUpPage({ params }) {
  const { gameId } = params
  const router = useRouter()
  const { setSelectedGame, setSelectedPackage } = useGameContext()

  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [gameInfo, setGameInfo] = useState(null)

  useEffect(() => {
    const fetchGameData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch game packages from API
        const packagesData = await getGamePackages(gameId)

        if (packagesData.gameInfo && packagesData.packages && packagesData.packages.length > 0) {
          setPackages(packagesData.packages)
          setGameInfo(packagesData.gameInfo)
          setSelectedGame({
            id: gameId,
            name: packagesData.gameInfo.name,
          })
        } else {
          console.log("Using fallback data for game:", gameId)
          // Use fallback data if API fails or returns empty data
          const fallbackData = getFallbackPackages(gameId)
          setPackages(fallbackData.packages)
          setGameInfo(fallbackData.gameInfo)
          setSelectedGame({
            id: gameId,
            name: fallbackData.gameInfo.name,
          })
        }
      } catch (err) {
        console.error("Error in TopUpPage:", err)
        setError("Failed to load game packages. Using default packages instead.")

        // Use fallback data if API fails
        const fallbackData = getFallbackPackages(gameId)
        setPackages(fallbackData.packages)
        setGameInfo(fallbackData.gameInfo)
        setSelectedGame({
          id: gameId,
          name: fallbackData.gameInfo.name,
        })
      } finally {
        setLoading(false)
      }
    }

    fetchGameData()
  }, [gameId, setSelectedGame])

  const handlePackageSelect = (pkg) => {
    setSelectedPackage(pkg)
    router.push("/verify")
  }

  // Fallback data in case API fails
  const getFallbackGameInfo = (id) => {
    const games = {
      "mobile-legends": {
        name: "Mobile Legends",
        currency: "Diamonds",
        image: "/images/mobile-legends.jpg",
        description:
          "Mobile Legends: Bang Bang is a mobile multiplayer online battle arena (MOBA) game developed and published by Moonton.",
      },
      "free-fire": {
        name: "Free Fire",
        currency: "Diamonds",
        image: "/images/free-fire.jpg",
        description:
          "Garena Free Fire is a battle royale game, developed by 111 Dots Studio and published by Garena for Android and iOS.",
      },
      "clash-of-clans": {
        name: "Clash of Clans",
        currency: "Gems",
        image: "/images/clash-of-clans.jpg",
        description:
          "Clash of Clans is a free-to-play mobile strategy video game developed and published by Finnish game developer Supercell.",
      },
      "magic-chess": {
        name: "Magic Chess",
        currency: "Diamonds",
        image: "/images/magic-chess.jpg",
        description:
          "Magic Chess is an auto-battler game mode in Mobile Legends: Bang Bang where players compete against seven other players.",
      },
      "league-of-legends": {
        name: "League of Legends",
        currency: "Riot Points",
        image: "/images/league-of-legends.jpg",
        description: "League of Legends is a team-based strategy game developed and published by Riot Games.",
      },
    }

    return (
      games[id] || {
        name: "Unknown Game",
        currency: "Credits",
        image: "/images/placeholder.jpg",
        description: "Game information not available.",
      }
    )
  }

  const getFallbackPackages = (id) => {
    const gameInfo = getFallbackGameInfo(id)

    let packages = []

    if (id === "mobile-legends" || id === "free-fire" || id === "magic-chess") {
      packages = [
        { id: 1, name: "50 Diamonds", amount: 50, price: 2.5, currency: "Diamonds" },
        { id: 2, name: "100 Diamonds", amount: 100, price: 5, currency: "Diamonds" },
        { id: 3, name: "310 Diamonds", amount: 310, price: 10, currency: "Diamonds" },
        { id: 4, name: "520 Diamonds", amount: 520, price: 15, currency: "Diamonds" },
        { id: 5, name: "1060 Diamonds", amount: 1060, price: 30, currency: "Diamonds" },
        { id: 6, name: "2180 Diamonds", amount: 2180, price: 60, currency: "Diamonds" },
      ]
    } else if (id === "clash-of-clans") {
      packages = [
        { id: 1, name: "80 Gems", amount: 80, price: 1, currency: "Gems" },
        { id: 2, name: "500 Gems", amount: 500, price: 5, currency: "Gems" },
        { id: 3, name: "1200 Gems", amount: 1200, price: 10, currency: "Gems" },
        { id: 4, name: "2500 Gems", amount: 2500, price: 20, currency: "Gems" },
        { id: 5, name: "6500 Gems", amount: 6500, price: 50, currency: "Gems" },
        { id: 6, name: "14000 Gems", amount: 14000, price: 100, currency: "Gems" },
      ]
    } else if (id === "league-of-legends") {
      packages = [
        { id: 1, name: "650 RP", amount: 650, price: 5, currency: "Riot Points" },
        { id: 2, name: "1380 RP", amount: 1380, price: 10, currency: "Riot Points" },
        { id: 3, name: "2800 RP", amount: 2800, price: 20, currency: "Riot Points" },
        { id: 4, name: "5600 RP", amount: 5600, price: 40, currency: "Riot Points" },
        { id: 5, name: "11000 RP", amount: 11000, price: 75, currency: "Riot Points" },
      ]
    } else {
      packages = [
        { id: 1, name: "Small Package", amount: 100, price: 5, currency: "Credits" },
        { id: 2, name: "Medium Package", amount: 300, price: 10, currency: "Credits" },
        { id: 3, name: "Large Package", amount: 500, price: 15, currency: "Credits" },
        { id: 4, name: "Premium Package", amount: 1000, price: 30, currency: "Credits" },
      ]
    }

    return { gameInfo, packages }
  }

  return (
    <div className="py-8 px-4 max-w-7xl mx-auto">
      {loading ? (
        <div className="text-center py-8">Loading game packages...</div>
      ) : error ? (
        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">{error}</div>
      ) : (
        <>
          {/* Game Info Section */}
          <section className="mb-8">
            <div className="flex flex-wrap gap-5 bg-white rounded-xl shadow-md p-5">
              <div className="flex-shrink-0 w-[180px] h-[180px] rounded-xl overflow-hidden">
                <img
                  src={gameInfo.image || `/images/${gameId}.jpg`}
                  alt={gameInfo.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-[280px]">
                <h1 className="text-2xl font-bold mb-3 text-gray-900">{gameInfo.name}</h1>
                <p className="text-gray-600 mb-4 text-sm leading-relaxed">{gameInfo.description}</p>
                <div className="flex items-start gap-2 bg-blue-50 p-3 rounded-lg border-l-4 border-cyan-400">
                  <FaInfoCircle className="text-cyan-400 mt-0.5" />
                  <p className="text-sm m-0">
                    Select a package below to top up your {gameInfo.name} account. You'll need to verify your game ID in
                    the next step.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Packages Section */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-5 text-center text-gray-900">Select Package</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {packages.map((pkg) => (
                <div
                  key={pkg.id}
                  className="bg-white rounded-xl shadow-md p-5 text-center cursor-pointer transition-all hover:translate-y-[-4px] hover:shadow-lg"
                  onClick={() => handlePackageSelect(pkg)}
                >
                  <div className="text-3xl text-cyan-400 mb-3">
                    <FaCoins />
                  </div>
                  <h3 className="text-base font-medium mb-2">{pkg.name}</h3>
                  <div className="text-xl font-bold text-gray-900">${pkg.price.toFixed(2)}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Instructions Section */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-5 text-center text-gray-900">How to Top Up</h2>
            <div className="flex flex-col gap-3 max-w-3xl mx-auto">
              <div className="flex items-center gap-3 bg-white rounded-lg p-3 shadow-sm">
                <div className="w-7 h-7 bg-gradient-to-r from-cyan-400 to-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <p className="text-sm">Select your desired package from the options above</p>
              </div>
              <div className="flex items-center gap-3 bg-white rounded-lg p-3 shadow-sm">
                <div className="w-7 h-7 bg-gradient-to-r from-cyan-400 to-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <p className="text-sm">Enter your game ID and server information for verification</p>
              </div>
              <div className="flex items-center gap-3 bg-white rounded-lg p-3 shadow-sm">
                <div className="w-7 h-7 bg-gradient-to-r from-cyan-400 to-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  3
                </div>
                <p className="text-sm">Complete the payment using your preferred method</p>
              </div>
              <div className="flex items-center gap-3 bg-white rounded-lg p-3 shadow-sm">
                <div className="w-7 h-7 bg-gradient-to-r from-cyan-400 to-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  4
                </div>
                <p className="text-sm">Receive your game credits instantly after payment confirmation</p>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  )
}
