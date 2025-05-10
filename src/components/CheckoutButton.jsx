"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function CheckoutButton({ gameId, packageId, playerInfo, buttonText = "Checkout" }) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const router = useRouter()

  const handleCheckout = async () => {
    setIsLoading(true)
    setError(null)

    try {
      console.log("Starting checkout process...")
      console.log("Checkout data:", { gameId, packageId, playerInfo })

      if (!gameId || !packageId || !playerInfo || !playerInfo.userId) {
        throw new Error("Missing required checkout information")
      }

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          gameId,
          packageId,
          playerInfo,
        }),
      })

      console.log("Checkout API response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || errorData.details || `Failed to create checkout session: ${response.status}`)
      }

      const data = await response.json()
      console.log("Checkout API response data:", data)

      if (!data.checkoutUrl) {
        console.error("No checkout URL returned from API")
        setError("No checkout URL returned from payment service")
        return
      }

      console.log("Opening checkout URL:", data.checkoutUrl)
      // Open the checkout URL in a new tab as recommended by DL PAY
      window.open(data.checkoutUrl, "_blank")

      // Alternatively, you can redirect in the same window
      // window.location.href = data.checkoutUrl;
    } catch (err) {
      console.error("Checkout error:", err)
      setError(err.message || "An unexpected error occurred during checkout")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <button
        onClick={handleCheckout}
        disabled={isLoading}
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
      >
        {isLoading ? "Processing..." : buttonText}
      </button>

      {error && (
        <div className="text-red-500 mt-2 p-2 bg-red-50 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}
    </div>
  )
}
