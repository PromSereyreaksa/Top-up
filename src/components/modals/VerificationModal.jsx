"use client"

import { useState } from "react"
import { FaExclamationTriangle, FaArrowLeft, FaArrowRight } from "react-icons/fa"
import { useGameContext } from "../../context/GameContext"
import Modal from "../Modal"

const VerificationModal = ({ isOpen, onClose, onBack, onNext }) => {
  const { selectedGame, selectedPackage, userId, setUserId, serverId, setServerId } = useGameContext()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [userIdError, setUserIdError] = useState("")
  const [serverIdError, setServerIdError] = useState("")

  // Return null if no game or package is selected
  if (!selectedGame || !selectedPackage) {
    return null
  }

  const handleUserIdChange = (e) => {
    setUserId(e.target.value)
    setUserIdError("")
  }

  const handleServerIdChange = (e) => {
    setServerId(e.target.value)
    setServerIdError("")
  }

  const validateForm = () => {
    let isValid = true

    if (!userId.trim()) {
      setUserIdError("Game ID is required")
      isValid = false
    }

    if (needsServerId() && !serverId.trim()) {
      setServerIdError("Server ID is required")
      isValid = false
    }

    return isValid
  }

  const needsServerId = () => {
    // Some games require server ID, others don't
    return ["mobile-legends", "magic-chess"].includes(selectedGame.id)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      // In a real app, you would verify the account with the API
      // For now, we'll simulate a successful verification
      if (selectedGame.id && userId) {
        // Optionally call the API for verification
        // await verifyGameAccount(selectedGame.id, userId, serverId)

        // Move to next step
        onNext()
      }
    } catch (err) {
      setError("Failed to verify account. Please check your game ID and server ID.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Account Verification" size="medium">
      <div className="flex flex-col gap-5">
        {/* Order Summary */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h2 className="text-lg font-medium mb-4 text-gray-800">Order Summary</h2>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between">
              <span className="font-medium text-gray-600">Game:</span>
              <span className="font-semibold">{selectedGame.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-600">Package:</span>
              <span className="font-semibold">{selectedPackage.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-600">Price:</span>
              <span className="font-semibold">${selectedPackage.price.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-center gap-2.5 bg-red-50 text-red-600 p-3 rounded-lg">
            <FaExclamationTriangle className="text-lg" />
            <span>{error}</span>
          </div>
        )}

        {/* Verification Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="userId" className="font-medium text-gray-700 text-sm">Game ID</label>
            <input
              type="text"
              id="userId"
              value={userId}
              onChange={handleUserIdChange}
              placeholder="Enter your Game ID"
              className={`p-2.5 border rounded-md text-base transition-colors focus:outline-none focus:border-blue-400 ${
                userIdError ? "border-red-500" : "border-gray-300"
              }`}
            />
            {userIdError && <div className="text-red-600 text-xs">{userIdError}</div>}
          </div>

          {needsServerId() && (
            <div className="flex flex-col gap-1.5">
              <label htmlFor="serverId" className="font-medium text-gray-700 text-sm">Server ID</label>
              <input
                type="text"
                id="serverId"
                value={serverId}
                onChange={handleServerIdChange}
                placeholder="Enter your Server ID"
                className={`p-2.5 border rounded-md text-base transition-colors focus:outline-none focus:border-blue-400 ${
                  serverIdError ? "border-red-500" : "border-gray-300"
                }`}
              />
              {serverIdError && <div className="text-red-600 text-xs">{serverIdError}</div>}
            </div>
          )}

          {/* Warning Note */}
          <div className="flex items-start gap-2.5 bg-amber-50 p-3 rounded-md border-l-3 border-amber-400">
            <FaExclamationTriangle className="text-amber-400 mt-0.5" />
            <p className="m-0 text-sm text-amber-900">
              Please make sure your Game ID{needsServerId() ? " and Server ID are" : " is"} correct. We will not be
              responsible for top-ups to incorrect accounts.
            </p>
          </div>

          {/* Form Actions */}
          <div className="flex justify-between mt-1">
            <button 
              type="button" 
              className={`flex items-center gap-2 px-4 py-2.5 rounded-md font-medium text-sm bg-gray-100 text-gray-700 
                transition-all hover:bg-gray-200 ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
              onClick={onBack} 
              disabled={loading}
            >
              <FaArrowLeft /> Back
            </button>
            
            <button 
              type="submit" 
              className={`flex items-center gap-2 px-4 py-2.5 rounded-md font-medium text-sm text-white
                bg-gradient-to-r from-blue-400 to-blue-600 hover:bg-gradient-to-r hover:from-blue-600 hover:to-blue-400
                transition-all ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
              disabled={loading}
            >
              {loading ? "Verifying..." : "Continue"} {!loading && <FaArrowRight />}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  )
}

export default VerificationModal