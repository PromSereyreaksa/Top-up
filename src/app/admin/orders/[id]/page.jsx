"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useAdminAuth } from "@/lib/auth"
import { useSocket, useSocketEvent } from "@/hooks/useSocket"
import { FaSpinner, FaArrowLeft, FaCheck, FaTimes, FaRedo, FaSync } from "react-icons/fa"

export default function OrderDetail({ params }) {
  const { id } = params
  const { isAuthenticated, isLoading } = useAdminAuth()
  const router = useRouter()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(null)
  const { isConnected } = useSocket()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/")
    }
  }, [isAuthenticated, isLoading, router])

  const fetchOrder = useCallback(async () => {
    try {
      setRefreshing(true)
      const res = await fetch(`/api/orders/${id}`)

      if (!res.ok) {
        throw new Error("Failed to fetch order details")
      }

      const data = await res.json()
      setOrder(data)
      setError(null)
      setLastUpdated(new Date())
    } catch (err) {
      console.error("Error fetching order:", err)
      setError(err.message)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [id])

  useEffect(() => {
    if (isAuthenticated && id) {
      fetchOrder()
    }
  }, [isAuthenticated, id, fetchOrder])

  // Set up socket event listener for order updates
  useSocketEvent("order-update", (updatedOrder) => {
    console.log("Received order update:", updatedOrder)

    // Update the order if it's the one we're viewing
    if (updatedOrder.orderId === id) {
      setOrder(updatedOrder)
      setLastUpdated(new Date())
    }
  })

  // Join the specific order room for updates
  useEffect(() => {
    if (isConnected && id) {
      const socket = window.socket
      if (socket) {
        socket.emit("join-order", id)

        return () => {
          socket.emit("leave-order", id)
        }
      }
    }
  }, [isConnected, id])

  const handleAction = async (action) => {
    try {
      setActionLoading(true)

      let updates = {}

      switch (action) {
        case "mark-delivered":
          updates = { fulfillmentStatus: "delivered" }
          break
        case "mark-failed":
          updates = { fulfillmentStatus: "failed" }
          break
        case "retry-delivery":
          updates = { fulfillmentStatus: "pending" }
          break
        case "mark-paid":
          updates = { paymentStatus: "paid" }
          break
        case "mark-payment-failed":
          updates = { paymentStatus: "failed" }
          break
        default:
          throw new Error("Invalid action")
      }

      // Update the order
      const updateRes = await fetch(`/api/orders/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...updates,
          updatedAt: new Date(),
        }),
      })

      if (!updateRes.ok) {
        throw new Error("Failed to update order")
      }

      // Get the updated order
      const updatedOrder = await updateRes.json()
      setOrder(updatedOrder)
      setLastUpdated(new Date())
    } catch (err) {
      console.error(`Error performing action ${action}:`, err)
      alert(`Error: ${err.message}`)
    } finally {
      setActionLoading(false)
    }
  }

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <FaSpinner className="animate-spin text-4xl text-blue-500" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p className="font-bold">Error:</p>
          <p>{error}</p>
        </div>
        <button
          onClick={() => router.push("/admin/orders")}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center"
        >
          <FaArrowLeft className="mr-2" /> Back to Orders
        </button>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="p-8">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          Order not found
        </div>
        <button
          onClick={() => router.push("/admin/orders")}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center"
        >
          <FaArrowLeft className="mr-2" /> Back to Orders
        </button>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Order Details</h1>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-500">
            {isConnected ? (
              <span className="flex items-center text-green-600">
                <span className="w-2 h-2 bg-green-600 rounded-full mr-2"></span>
                Real-time updates active
              </span>
            ) : (
              <span className="flex items-center text-red-600">
                <span className="w-2 h-2 bg-red-600 rounded-full mr-2"></span>
                Real-time updates disconnected
              </span>
            )}
          </div>
          <div className="text-sm text-gray-500">
            Last updated: {lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : "Never"}
          </div>
          <button
            onClick={fetchOrder}
            disabled={refreshing}
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded flex items-center gap-1 text-sm"
          >
            {refreshing ? <FaSpinner className="animate-spin" /> : <FaSync />}
            Refresh
          </button>
          <button
            onClick={() => router.push("/admin/orders")}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center"
          >
            <FaArrowLeft className="mr-2" /> Back to Orders
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-semibold mb-4">Order Information</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Order ID:</span>
                  <span className="font-medium">{order.orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Created At:</span>
                  <span>{new Date(order.createdAt).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Updated At:</span>
                  <span>{new Date(order.updatedAt).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Method:</span>
                  <span>{order.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Transaction ID:</span>
                  <span>{order.transactionId || "N/A"}</span>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-4">Game Information</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Game:</span>
                  <span className="font-medium">{order.gameName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Package:</span>
                  <span>{order.packageName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span>
                    {order.amount} {order.currency}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Price:</span>
                  <span className="font-medium">${order.price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">User ID:</span>
                  <span>{order.userId}</span>
                </div>
                {order.serverId && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Server ID:</span>
                    <span>{order.serverId}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-4">Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Payment Status:</span>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      order.paymentStatus === "paid"
                        ? "bg-green-100 text-green-800"
                        : order.paymentStatus === "failed"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                  </span>
                </div>
                <div className="flex justify-end mt-4">
                  {order.paymentStatus === "pending" && (
                    <>
                      <button
                        onClick={() => handleAction("mark-paid")}
                        disabled={actionLoading}
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded mr-2 text-sm flex items-center"
                      >
                        <FaCheck className="mr-1" /> Mark as Paid
                      </button>
                      <button
                        onClick={() => handleAction("mark-payment-failed")}
                        disabled={actionLoading}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm flex items-center"
                      >
                        <FaTimes className="mr-1" /> Mark as Failed
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Fulfillment Status:</span>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      order.fulfillmentStatus === "delivered"
                        ? "bg-green-100 text-green-800"
                        : order.fulfillmentStatus === "failed"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {order.fulfillmentStatus.charAt(0).toUpperCase() + order.fulfillmentStatus.slice(1)}
                  </span>
                </div>
                <div className="flex justify-end mt-4">
                  {order.fulfillmentStatus === "pending" && (
                    <>
                      <button
                        onClick={() => handleAction("mark-delivered")}
                        disabled={actionLoading}
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded mr-2 text-sm flex items-center"
                      >
                        <FaCheck className="mr-1" /> Mark as Delivered
                      </button>
                      <button
                        onClick={() => handleAction("mark-failed")}
                        disabled={actionLoading}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm flex items-center"
                      >
                        <FaTimes className="mr-1" /> Mark as Failed
                      </button>
                    </>
                  )}
                  {order.fulfillmentStatus === "failed" && (
                    <button
                      onClick={() => handleAction("retry-delivery")}
                      disabled={actionLoading}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm flex items-center"
                    >
                      <FaRedo className="mr-1" /> Retry Delivery
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {order.notes && (
            <div className="mt-8">
              <h2 className="text-lg font-semibold mb-2">Notes</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p>{order.notes}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
