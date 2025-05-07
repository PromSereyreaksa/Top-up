"use client"

import { createContext, useState, useContext, useEffect } from "react"
import { toast } from "react-toastify"

const GameContext = createContext(undefined)

export const useGameContext = () => {
  const context = useContext(GameContext)
  if (context === undefined) {
    throw new Error("useGameContext must be used within a GameProvider")
  }
  return context
}

export const GameProvider = ({ children }) => {
  const [selectedGame, setSelectedGame] = useState(null)
  const [userId, setUserId] = useState("")
  const [serverId, setServerId] = useState("")
  const [selectedPackage, setSelectedPackage] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState(null)
  const [orderDetails, setOrderDetails] = useState(null)
  const [isTopUpInProgress, setIsTopUpInProgress] = useState(false)

  // Read from localStorage after mount
  useEffect(() => {
    const savedGame = localStorage.getItem("selectedGame")
    if (savedGame) {
      setSelectedGame(JSON.parse(savedGame))
    }
  }, [])

  const resetOrder = () => {
    setUserId("")
    setServerId("")
    setSelectedPackage(null)
    setPaymentMethod(null)
    setOrderDetails(null)
    setIsTopUpInProgress(false)
  }

  const clearSelectedGame = () => {
    setSelectedGame(null)
    localStorage.removeItem("selectedGame")
  }

  const setSelectedGameWithNotification = (game) => {
    setSelectedGame(game)
    if (game) {
      localStorage.setItem("selectedGame", JSON.stringify(game))
      toast.info(`${game.name} selected!`, {
        position: "bottom-right",
        autoClose: 2000,
      })
    }
  }

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
