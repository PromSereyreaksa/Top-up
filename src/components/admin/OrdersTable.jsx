"use client"

import { useState, useEffect } from "react"
import { useSocketEvent } from "@/hooks/useSocket"
import { FaCheck, FaTimes, FaEye, FaSpinner } from "react-icons/fa"
import { useRouter } from "next/navigation"

export default function OrdersTable({ initialOrders = [] }) {
  const [orders, setOrders] = useState(initialOrders)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // Listen for real-time order updates
  useSocketEvent("order-update", (updatedOrder) => {
    console.log("Received real-time order update:", updatedOrder)

    // Update the order in the list if it exists
    setOrders((prevOrders) =>
      prevOrders.map((order) => (order.orderId === updatedOrder.orderId ? updatedOrder : order)),
    )
  })

  // Fetch orders on component mount
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true)
        const res = await fetch("/api/orders")

        if (!res.ok) {
          throw new Error("Failed to fetch orders")
        }

        const data = await res.json()
        setOrders(data.orders)
      } catch (error) {
        console.error("Error fetching orders:", error)
      } finally {
        setLoading(false)
      }
    }

    if (initialOrders.length === 0) {
      fetchOrders()
    }
  }, [initialOrders.length])

  const handleAction = async (orderId, action) => {
    try {
      setLoading(true)

      let updates = {}

      switch (action) {
        case "mark-delivered":
          updates = { fulfillmentStatus: "delivered" }
          break
        case "mark-failed":
          updates = { fulfillmentStatus: "failed" }
          break
        default:
          throw new Error("Invalid action")
      }

      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      })

      if (!res.ok) {
        throw new Error("Failed to update order")
      }

      // No need to update state here as we'll receive the update via socket
    } catch (error) {
      console.error("Error updating order:", error)
      alert(`Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  if (loading && orders.length === 0) {
    return (
      <div className="text-center py-8">
        <FaSpinner className="animate-spin mx-auto text-2xl" />
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200">
        <thead>
          <tr className="bg-gray-100">
            <th className="py-2 px-4 border-b text-left">Order ID</th>
            <th className="py-2 px-4 border-b text-left">Game</th>
            <th className="py-2 px-4 border-b text-left">Status</th>
            <th className="py-2 px-4 border-b text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.length > 0 ? (
            orders.map((order) => (
              <tr key={order.orderId} className="hover:bg-gray-50">
                <td className="py-2 px-4 border-b">{order.orderId}</td>
                <td className="py-2 px-4 border-b">{order.gameName}</td>
                <td className="py-2 px-4 border-b">
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
                </td>
                <td className="py-2 px-4 border-b">
                  <div className="flex space-x-2">
                    {order.fulfillmentStatus === "pending" && (
                      <>
                        <button
                          onClick={() => handleAction(order.orderId, "mark-delivered")}
                          disabled={loading}
                          className="text-green-600 hover:text-green-900"
                          title="Mark as Delivered"
                        >
                          <FaCheck />
                        </button>
                        <button
                          onClick={() => handleAction(order.orderId, "mark-failed")}
                          disabled={loading}
                          className="text-red-600 hover:text-red-900"
                          title="Mark as Failed"
                        >
                          <FaTimes />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => router.push(`/admin/orders/${order.orderId}`)}
                      className="text-gray-600 hover:text-gray-900"
                      title="View Details"
                    >
                      <FaEye />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="py-4 text-center text-gray-500">
                No orders found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
