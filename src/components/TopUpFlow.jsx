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

      // Fetch the game details from the API
      const getGameDetails = async () => {
        const gameDetails = await fetchGameDetails(gameId)

        if (gameDetails) {
          setSelectedGame({
            id: gameId,
            name: gameDetails.name,
          })
        } else {
          // Fallback to just using the ID and a generic name
          setSelectedGame({
            id: gameId,
            name: getGameNameById(gameId),
          })
        }

        // If a game is pre-selected, always start from the package selection step
        setCurrentStep("package")
        setInitialized(true)
      }

      getGameDetails()
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
    // First check if we have the game in our context
    if (selectedGame && selectedGame.id === id) {
      return selectedGame.name
    }

    // Otherwise, try to find it in the fallback list
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

  // Add a function to fetch game details when needed
  const fetchGameDetails = async (gameId) => {
    try {
      const res = await fetch(`/api/games/${gameId}`)

      if (!res.ok) {
        throw new Error(`Failed to fetch game details: ${res.status}`)
      }

      const game = await res.json()
      return game
    } catch (err) {
      console.error(`Error fetching game details for ${gameId}:`, err)
      return null
    }
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

  // Only render the component if the modal is open
  if (!isOpen) return null

  // Render only the current step's modal
  switch (currentStep) {
    case "game":
      return <GameSelectionModal isOpen={true} onClose={handleClose} onNext={() => handleNext("package")} />
    case "package":
      return (
        <PackageSelectionModal
          isOpen={true}
          onClose={handleClose}
          onBack={() => handleNext("game")}
          onNext={() => handleNext("verification")}
        />
      )
    case "verification":
      return (
        <VerificationModal
          isOpen={true}
          onClose={handleClose}
          onBack={() => handleNext("package")}
          onNext={() => handleNext("payment")}
        />
      )
    case "payment":
      return (
        <PaymentModal
          isOpen={true}
          onClose={handleClose}
          onBack={() => handleNext("verification")}
          onNext={() => handleNext("confirmation")}
        />
      )
    case "confirmation":
      return <ConfirmationModal isOpen={true} onClose={handleClose} onDone={handleClose} />
    default:
      return null
  }
}

export default TopUpFlow
