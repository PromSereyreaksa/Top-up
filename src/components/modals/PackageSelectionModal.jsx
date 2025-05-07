"use client"

import { useState, useEffect } from "react"
import { FaCoins, FaArrowLeft } from "react-icons/fa"
import { useGameContext } from "../../context/GameContext"
import Modal from "../Modal"

const PackageSelectionModal = ({ isOpen, onClose, onBack, onNext }) => {
  const { selectedGame, setSelectedPackage } = useGameContext()

  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [gameInfo, setGameInfo] = useState(null)

  useEffect(() => {
    const fetchGameData = async () => {
      // Use fallback data if API fails
      const fallbackData = getFallbackPackages(selectedGame.id)
      setPackages(fallbackData.packages)
      setGameInfo(fallbackData.gameInfo)
      setLoading(false)
    }

    if (isOpen && selectedGame) {
      fetchGameData()
    }
  }, [isOpen, selectedGame])

  const handlePackageSelect = (pkg) => {
    setSelectedPackage(pkg)
    onNext()
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
      "pubg-mobile": {
        name: "PUBG Mobile",
        currency: "UC (Unknown Cash)",
        image: "/images/pubg-mobile.jpg",
        description: "PUBG Mobile is a battle royale game where players fight to be the last one standing, developed by PUBG Corporation.",
      },
      "call-of-duty-mobile": {
        name: "Call of Duty Mobile",
        currency: "CP (COD Points)",
        image: "/images/call-of-duty-mobile.jpg",
        description: "Call of Duty Mobile is a first-person shooter featuring multiplayer and battle royale modes, developed by TiMi Studios and published by Activision.",
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

  if (!selectedGame) {
    return null
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Select ${selectedGame.name} Package`} size="large">
      <div className="flex flex-col gap-5">
        {loading ? (
          <div className="text-center py-8 text-base">Loading packages...</div>
        ) : error ? (
          <div className="text-center py-8 text-base text-red-600">{error}</div>
        ) : (
          <>
            {gameInfo && (
              <div className="flex gap-3 bg-gray-50 rounded-lg p-3 mb-4">
                <div className="w-[70px] h-[70px] rounded-lg overflow-hidden flex-shrink-0">
                  <img 
                    src={gameInfo.image || `/images/${selectedGame.id}.jpg`} 
                    alt={gameInfo.name}
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div>
                  <h3 className="m-0 mb-1.5 text-base">{gameInfo.name}</h3>
                  <p className="m-0 text-xs text-gray-500 line-clamp-3">
                    {gameInfo.description}
                  </p>
                </div>
              </div>
            )}

            <h3 className="m-0 text-lg text-center">Select Package</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {packages.map((pkg) => (
                <div 
                  key={pkg.id} 
                  className="bg-white rounded-lg shadow-sm p-3 text-center cursor-pointer transition-all duration-300 ease-in-out border border-gray-100 hover:-translate-y-1 hover:shadow-md hover:border-sky-400"
                  onClick={() => handlePackageSelect(pkg)}
                >
                  <div className="text-xl text-sky-400 mb-2">
                    <FaCoins />
                  </div>
                  <h3 className="text-sm m-0 mb-2 whitespace-nowrap">{pkg.name}</h3>
                  <div className="text-lg font-bold text-gray-800">${pkg.price.toFixed(2)}</div>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="flex justify-start mt-2">
          {!selectedGame || selectedGame.id === undefined ? (
            <button 
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-800 rounded-md font-medium transition-all hover:bg-gray-200"
              onClick={onBack}
            >
              <FaArrowLeft /> Back
            </button>
          ) : null}
        </div>
      </div>
    </Modal>
  )
}

export default PackageSelectionModal