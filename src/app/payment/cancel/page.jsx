"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"

export default function PaymentCancelPage() {
  const searchParams = useSearchParams()
  const [orderDetails, setOrderDetails] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const orderId = searchParams.get("orderId")

  useEffect(() => {
    async function fetchOrderDetails() {
      if (!orderId) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const response = await fetch(`/api/orders/${orderId}`)

        if (!response.ok) {
          throw new Error("Failed to fetch order details")
        }

        const data = await response.json()
        setOrderDetails(data)
      } catch (err) {
        console.error("Error fetching order details:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchOrderDetails()
  }, [orderId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 max-w-md w-full bg-white rounded-lg shadow-md">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800">Loading order details...</h2>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8 max-w-md w-full bg-white rounded-lg shadow-md">
        <div className="bg-red-100 p-4 rounded-full inline-flex items-center justify-center mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Payment Cancelled</h2>
        <p className="text-gray-600 mt-2">Your payment was cancelled or did not complete.</p>

        {orderDetails && (
          <div className="mt-6 border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-700">Order Details</h3>
            <p className="text-gray-600 text-sm mt-1">Order ID: {orderDetails.orderId || orderDetails._id}</p>
            <p className="text-gray-600 text-sm mt-1">Status: {orderDetails.paymentStatus}</p>
            <p className="text-gray-600 text-sm mt-1">Amount: ${orderDetails.amount.toFixed(2)}</p>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md">
            <p>{error}</p>
          </div>
        )}

        <div className="mt-8 space-y-3">
          <Link href="/" className="block w-full px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Return to Home
          </Link>

          <button
            onClick={() => window.history.back()}
            className="block w-full px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  )
}
