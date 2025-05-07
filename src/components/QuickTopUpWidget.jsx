"use client"

import { useState } from "react"
import { FaGamepad, FaArrowRight } from "react-icons/fa"
import { useGameContext } from "../context/GameContext"
import TopUpFlow from "./TopUpFlow" // Import the TopUpFlow component

const QuickTopUpWidget = () => {
  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false)
  const [selectedGameId, setSelectedGameId] = useState(null)
  const { setSelectedGame } = useGameContext()

  // Popular games for quick access
  const popularGames = [
    { id: "mobile-legends", name: "Mobile Legends", icon: "🎮" },
    { id: "pubg-mobile", name: "PUBG Mobile", icon: "🔫" },
    { id: "call-of-duty-mobile", name: "Call of Duty Mobile", icon: "🎯" },
    { id: "free-fire", name: "Free Fire", icon: "🔥" },
  ]

  const openTopUpModal = (gameId = null) => {
    setSelectedGameId(gameId)
    setIsTopUpModalOpen(true)
  }

  const closeTopUpModal = () => {
    setIsTopUpModalOpen(false)
    setSelectedGameId(null)
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden w-full">
      <div className="bg-gradient-to-r from-[#4cc9f0] to-[#4361ee] text-white p-3 flex items-center gap-2">
        <FaGamepad className="text-xl" />
        <h3 className="text-base font-medium m-0">Quick Top-Up</h3>
      </div>

      <div className="p-4">
        <p className="text-gray-600 text-sm mb-3">Select a game to top-up instantly:</p>

        <div
          className="grid grid-cols-2 md:grid-cols-auto-fill gap-2.5 mb-4"
          style={{ gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))" }}
        >
          {popularGames.map((game) => (
            <button
              key={game.id}
              className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-md p-2.5 cursor-pointer transition-all duration-300 text-left w-full hover:bg-blue-50 hover:border-[#4cc9f0] hover:-translate-y-0.5"
              onClick={() => openTopUpModal(game.id)}
            >
              <span className="text-lg">{game.icon}</span>
              <span className="text-sm font-medium">{game.name}</span>
            </button>
          ))}
        </div>

        <button
          className="flex items-center justify-between w-full bg-blue-50 border border-[#4cc9f0] rounded-md p-2.5 text-[#4361ee] font-medium text-sm cursor-pointer transition-all duration-300 hover:bg-blue-100"
          onClick={() => openTopUpModal()}
        >
          <span>All Games</span>
          <FaArrowRight />
        </button>
      </div>

      {/* TopUp Flow Modal */}
      {isTopUpModalOpen && (
        <TopUpFlow
          isOpen={isTopUpModalOpen}
          onClose={closeTopUpModal}
          gameId={selectedGameId}
          initialStep={selectedGameId ? "package" : "game"}
        />
      )}
    </div>
  )
}

export default QuickTopUpWidget
