"use client"

import { useState, useEffect } from "react"
import { FaGamepad } from "react-icons/fa"
import { useGameContext } from "../../context/GameContext"
import Modal from "../Modal"

const GameSelectionModal = ({ isOpen, onClose, onNext }) => {
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { setSelectedGame } = useGameContext()

  useEffect(() => {
    const fetchGames = async () => {
      try {
        setLoading(true)
        console.log("Fetching games for selection modal...")

        const res = await fetch("/api/games")

        if (!res.ok) {
          throw new Error(`Failed to fetch games: ${res.status}`)
        }

        const data = await res.json()
        console.log(`Fetched ${data.length} games for selection modal`)

        setGames(data)
        setError(null)
      } catch (err) {
        console.error("Error fetching games for selection modal:", err)
        setError(err.message || "Failed to fetch games")
        // Use fallback data if API fails
        setGames(fallbackGames)
      } finally {
        setLoading(false)
      }
    }

    if (isOpen) {
      fetchGames()
    }
  }, [isOpen])

  // Fallback data in case API fails
  const fallbackGames = [
    { id: "mobile-legends", name: "Mobile Legends", image: "/images/mobile-legends.jpg" },
    { id: "pubg-mobile", name: "PUBG Mobile", image: "/images/pubg-mobile.jpg" },
    { id: "call-of-duty-mobile", name: "Call of Duty Mobile", image: "/images/call-of-duty-mobile.jpg" },
    { id: "free-fire", name: "Free Fire", image: "/images/free-fire.jpg" },
    { id: "clash-of-clans", name: "Clash of Clans", image: "/images/clash-of-clans.jpg" },
    { id: "magic-chess", name: "Magic Chess", image: "/images/magic-chess.jpg" },
    { id: "league-of-legends", name: "League of Legends", image: "/images/league-of-legends.jpg" },
  ]

  const handleGameSelect = (game) => {
    setSelectedGame({
      id: game.id,
      name: game.name,
    })
    // Immediately proceed to the next step
    onNext()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Select Game" size="large">
      {loading ? (
        <div className="text-center py-8 text-base">Loading games...</div>
      ) : error ? (
        <div className="text-center py-8 text-base text-red-600">{error}</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mt-2">
          {games.map((game) => (
            <div
              key={game.id}
              className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 ease-in-out cursor-pointer hover:-translate-y-1 h-full"
              onClick={() => handleGameSelect(game)}
            >
              <div className="h-[90px] overflow-hidden">
                <img
                  src={game.image || `/images/${game.id}.jpg`}
                  alt={game.name}
                  className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
                />
              </div>
              <div className="flex items-center gap-1.5 p-2.5">
                <FaGamepad className="text-sky-400 text-sm flex-shrink-0" />
                <h3 className="text-sm m-0 leading-tight">{game.name}</h3>
              </div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  )
}

export default GameSelectionModal
