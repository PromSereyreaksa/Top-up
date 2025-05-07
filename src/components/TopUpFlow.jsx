"use client"

import { useState, useEffect, useRef } from "react"
import { useGameContext } from "../context/GameContext"
import GameSelectionModal from "./modals/GameSelectionModal"
import PackageSelectionModal from "./modals/PackageSelectionModal"
import VerificationModal from "./modals/VerificationModal"
import PaymentModal from "./modals/PaymentModal"
import ConfirmationModal from "./modals/ConfirmationModal"

const TopUpFlow = ({ isOpen, onClose, initialStep = "game", gameId = null }) => {
  const [currentStep, setCurrentStep] = useState(initialStep)
  const { resetOrder, setSelectedGame, selectedGame, setIsTopUpInProgress, isTopUpInProgress } = useGameContext()
  const [initialized, setInitialized] = useState(false)
  const prevOpenRef = useRef(isOpen)

  // If a gameId is provided, set it as the selected game
  useEffect(() => {
    if (isOpen && !prevOpenRef.current) {
      // Set top-up in progress when modal opens
      setIsTopUpInProgress(true)
    }

    prevOpenRef.current = isOpen

    if (isOpen && gameId && !initialized) {
      console.log("TopUpFlow: Setting selected game:", gameId)

      // In a real app, you would fetch the game details from the API
      // For now, we'll just set the ID and name
      setSelectedGame({
        id: gameId,
        name: getGameNameById(gameId),
      })

      // If a game is pre-selected, always start from the package selection step
      setCurrentStep("package")

      setInitialized(true)
    } else if (isOpen && !initialized) {
      // If we already have a selected game, skip to package selection
      if (selectedGame) {
        setCurrentStep("package")
      }

      setInitialized(true)
    } else if (!isOpen) {
      // Reset initialization flag when modal closes
      setInitialized(false)
    }
  }, [isOpen, gameId, setSelectedGame, initialStep, initialized, selectedGame, setIsTopUpInProgress])

  const getGameNameById = (id) => {
    // Expanded list of game names for better coverage
    const games = {
      "mobile-legends": "Mobile Legends",
      "free-fire": "Free Fire",
      "clash-of-clans": "Clash of Clans",
      "magic-chess": "Magic Chess",
      "league-of-legends": "League of Legends",
      "pubg-mobile": "PUBG Mobile",
      "call-of-duty-mobile": "Call of Duty Mobile",
      "arena-of-valor": "Arena of Valor",
      "genshin-impact": "Genshin Impact",
    }
    return games[id] || "Unknown Game"
  }

  const handleClose = () => {
    console.log("TopUpFlow: Closing modal")
    resetOrder()
    onClose()
    // Release the top-up in progress lock
    setIsTopUpInProgress(false)
  }

  const handleNext = (nextStep) => {
    console.log("TopUpFlow: Moving to step:", nextStep)
    setCurrentStep(nextStep)
  }

  

  return (
    <>
      <GameSelectionModal
        isOpen={isOpen && currentStep === "game"}
        onClose={handleClose}
        onNext={() => handleNext("package")}
      />

      <PackageSelectionModal
        isOpen={isOpen && currentStep === "package"}
        onClose={handleClose}
        onBack={() => handleNext("game")}
        onNext={() => handleNext("verification")}
      />

      <VerificationModal
        isOpen={isOpen && currentStep === "verification"}
        onClose={handleClose}
        onBack={() => handleNext("package")}
        onNext={() => handleNext("payment")}
      />

      <PaymentModal
        isOpen={isOpen && currentStep === "payment"}
        onClose={handleClose}
        onBack={() => handleNext("verification")}
        onNext={() => handleNext("confirmation")}
      />

      <ConfirmationModal isOpen={isOpen && currentStep === "confirmation"} onClose={handleClose} onDone={handleClose} />
    </>
  )
}

export default TopUpFlow
