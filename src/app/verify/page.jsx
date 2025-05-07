"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { FaExclamationTriangle, FaArrowLeft, FaArrowRight } from "react-icons/fa"
import { useGameContext } from "@/context/GameContext"

export default function VerificationPage() {
  const router = useRouter()
  const { selectedGame, selectedPackage, userId, setUserId, serverId, setServerId } = useGameContext()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [userIdError, setUserIdError] = useState("")
  const [serverIdError, setServerIdError] = useState("")

  // Redirect if no game or package is selected
  useEffect(() => {
    if (!selectedGame || !selectedPackage) {
      router.push("/")
    }
  }, [selectedGame, selectedPackage, router])

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
    return selectedGame && ["mobile-legends", "magic-chess"].includes(selectedGame.id)
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
      if (selectedGame?.id && userId) {
        // Optionally call the API for verification
        // await verifyGameAccount(selectedGame.id, userId, serverId)

        // Navigate to payment page
        router.push("/payment")
      }
    } catch (err) {
      setError("Failed to verify account. Please check your game ID and server ID.")
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    if (selectedGame) {
      router.push(`/topup/${selectedGame.id}`)
    } else {
      router.push("/")
    }
  }

  if (!selectedGame || !selectedPackage) {
    return null
  }

  return (
    <div className="py-10 px-5 flex justify-center">
      <div className="max-w-[600px] w-full bg-white rounded-xl shadow-md p-8">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 text-center">Account Verification</h1>

        <div className="bg-gray-50 rounded-lg p-5 mb-6">
          <h2 className="text-lg font-medium mb-4 text-gray-900">Order Summary</h2>
          <div className="flex flex-col gap-2.5">
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

        {error && (
          <div className="flex items-center gap-2.5 bg-red-50 text-red-600 p-3 rounded-lg mb-5">
            <FaExclamationTriangle />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label htmlFor="userId" className="font-medium text-gray-700">
              Game ID
            </label>
            <input
              type="text"
              id="userId"
              value={userId}
              onChange={handleUserIdChange}
              placeholder="Enter your Game ID"
              className={`p-3 border rounded-lg text-base transition-colors focus:border-cyan-400 focus:outline-none ${
                userIdError ? "border-red-500" : "border-gray-300"
              }`}
            />
            {userIdError && <div className="text-red-500 text-sm mt-1">{userIdError}</div>}
          </div>

          {needsServerId() && (
            <div className="flex flex-col gap-2">
              <label htmlFor="serverId" className="font-medium text-gray-700">
                Server ID
              </label>
              <input
                type="text"
                id="serverId"
                value={serverId}
                onChange={handleServerIdChange}
                placeholder="Enter your Server ID"
                className={`p-3 border rounded-lg text-base transition-colors focus:border-cyan-400 focus:outline-none ${
                  serverIdError ? "border-red-500" : "border-gray-300"
                }`}
              />
              {serverIdError && <div className="text-red-500 text-sm mt-1">{serverIdError}</div>}
            </div>
          )}

          <div className="flex items-start gap-2.5 bg-amber-50 p-4 rounded-lg border-l-4 border-amber-400">
            <FaExclamationTriangle className="text-amber-400 mt-0.5" />
            <p className="text-sm text-amber-800 m-0">
              Please make sure your Game ID{needsServerId() ? " and Server ID are" : " is"} correct. We will not be
              responsible for top-ups to incorrect accounts.
            </p>
          </div>

          <div className="flex justify-between mt-2.5">
            <button
              type="button"
              className="flex items-center gap-2 py-3 px-5 bg-gray-100 text-gray-700 rounded-lg font-medium transition-colors hover:bg-gray-200 disabled:opacity-70 disabled:cursor-not-allowed"
              onClick={handleBack}
              disabled={loading}
            >
              <FaArrowLeft /> Back
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 py-3 px-5 bg-gradient-to-r from-cyan-400 to-blue-600 text-white rounded-lg font-medium transition-all hover:from-blue-600 hover:to-cyan-400 disabled:opacity-70 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? "Verifying..." : "Continue"} {!loading && <FaArrowRight />}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
