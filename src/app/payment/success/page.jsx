"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const [orderDetails, setOrderDetails] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Get orderId and payload from URL
  const orderId = searchParams.get("orderId")
  const payload = searchParams.get("payload")

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        setLoading(true)

        if (payload) {
          // If we have an encrypted payload, send it to our API to verify
          const response = await fetch(`/api/confirm?payload=${encodeURIComponent(payload)}`)

          if (!response.ok) {
            throw new Error("Failed to verify payment")
          }

          const data = await response.json()
          setOrderDetails(data)
        } else if (orderId) {
          // If we only have orderId, fetch the order details
          const response = await fetch(`/api/orders/${orderId}`)

          if (!response.ok) {
            throw new Error("Failed to fetch order details")
          }

          const data = await response.json()
          setOrderDetails(data)
        } else {
          throw new Error("No order information provided")
        }
      } catch (err) {
        console.error("Payment verification error:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    verifyPayment()
  }, [orderId, payload])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Verifying your payment...</h1>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Payment Verification Error</h1>
          <p className="text-red-500 mb-6">{error}</p>
          <Link href="/" className="text-blue-600 hover:underline">
            Return to Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <div className="text-center mb-6">
          <div className="bg-green-100 p-3 rounded-full inline-block mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Payment Successful!</h1>
          <p className="text-gray-600 mt-2">Your transaction has been completed.</p>
        </div>

        {orderDetails && (
          <div className="border-t border-gray-200 pt-4">
            <h2 className="font-semibold text-lg mb-2">Order Details</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Order ID:</span>
                <span className="font-medium">{orderDetails.orderId || orderDetails._id}</span>
              </div>

              {orderDetails.gameName && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Game:</span>
                  <span className="font-medium">{orderDetails.gameName}</span>
                </div>
              )}

              {orderDetails.packageName && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Package:</span>
                  <span className="font-medium">{orderDetails.packageName}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className="font-medium">${orderDetails.amount?.toFixed(2) || "0.00"}</span>
              </div>

              {orderDetails.userId && (
                <div className="flex justify-between">
                  <span className="text-gray-600">User ID:</span>
                  <span className="font-medium">{orderDetails.userId}</span>
                </div>
              )}

              {orderDetails.serverId && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Server ID:</span>
                  <span className="font-medium">{orderDetails.serverId}</span>
                </div>
              )}

              {/* Display items if available */}
              {orderDetails.items && orderDetails.items.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-semibold text-md mb-2">Items</h3>
                  <div className="space-y-2">
                    {orderDetails.items.map((item, index) => (
                      <div key={index} className="flex justify-between border-b border-gray-100 pb-2">
                        <span className="text-gray-600">
                          {item.name} x {item.quantity}
                        </span>
                        <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mt-8 flex justify-center">
          <Link
            href="/"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md focus:outline-none"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
