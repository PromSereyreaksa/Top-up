"use client"

import { createContext, useState, useContext } from "react"
import { toast } from "react-toastify"

const GameContext = createContext()

export const useGameContext = () => useContext(GameContext)

export const GameProvider = ({ children }) => {
  const [selectedGame, setSelectedGame] = useState(() => {
    // Check if we have a saved game in localStorage
    const savedGame = localStorage.getItem("selectedGame")
    return savedGame ? JSON.parse(savedGame) : null
  })
  const [userId, setUserId] = useState("")
  const [serverId, setServerId] = useState("")
  const [selectedPackage, setSelectedPackage] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState(null)
  const [orderDetails, setOrderDetails] = useState(null)
  const [isTopUpInProgress, setIsTopUpInProgress] = useState(false)

  const resetOrder = () => {
    setUserId("")
    setServerId("")
    setSelectedPackage(null)
    setPaymentMethod(null)
    setOrderDetails(null)
    setIsTopUpInProgress(false)
    // Note: We don't reset selectedGame anymore
  }

  // Clear selected game completely (used for explicit reset)
  const clearSelectedGame = () => {
    setSelectedGame(null)
    localStorage.removeItem("selectedGame")
  }

  // Enhanced function to set selected game with notification and persistence
  const setSelectedGameWithNotification = (game) => {
    setSelectedGame(game)
    if (game) {
      // Save to localStorage for persistence
      localStorage.setItem("selectedGame", JSON.stringify(game))
      toast.info(`${game.name} selected!`, {
        position: "bottom-right",
        autoClose: 2000,
      })
    }
  }

  // Enhanced function to set selected package with notification
  const setSelectedPackageWithNotification = (pkg) => {
    setSelectedPackage(pkg)
    if (pkg) {
      toast.info(`${pkg.name} package selected!`, {
        position: "bottom-right",
        autoClose: 2000,
      })
    }
  }

  return (
    <GameContext.Provider
      value={{
        selectedGame,
        setSelectedGame: setSelectedGameWithNotification,
        clearSelectedGame,
        userId,
        setUserId,
        serverId,
        setServerId,
        selectedPackage,
        setSelectedPackage: setSelectedPackageWithNotification,
        paymentMethod,
        setPaymentMethod,
        orderDetails,
        setOrderDetails,
        resetOrder,
        isTopUpInProgress,
        setIsTopUpInProgress,
      }}
    >
      {children}
    </GameContext.Provider>
  )
}
