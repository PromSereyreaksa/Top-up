"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useAdminAuth } from "@/lib/auth"
import { useSocket, useSocketEvent } from "@/hooks/useSocket"
import { FaSpinner, FaSearch, FaRedo, FaCheck, FaTimes, FaEye, FaSync } from "react-icons/fa"

export default function OrdersManagement() {
  const { isAuthenticated, isLoading } = useAdminAuth()
  const router = useRouter()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 })
  const [filters, setFilters] = useState({ status: "", gameId: "" })
  const [games, setGames] = useState([])
  const [actionLoading, setActionLoading] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)
  const { isConnected } = useSocket()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/")
    }
  }, [isAuthenticated, isLoading, router])

  const fetchOrders = useCallback(async () => {
    try {
      setRefreshing(true)

      let url = `/api/orders?page=${pagination.page}&limit=${pagination.limit}`
      if (filters.status) url += `&status=${filters.status}`
      if (filters.gameId) url += `&gameId=${filters.gameId}`

      const res = await fetch(url)

      if (!res.ok) {
        throw new Error("Failed to fetch orders")
      }

      const data = await res.json()
      setOrders(data.orders)
      setPagination(data.pagination)
      setError(null)
      setLastUpdated(new Date())
    } catch (err) {
      console.error("Error fetching orders:", err)
      setError(err.message)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [pagination.page, pagination.limit, filters])

  useEffect(() => {
    if (isAuthenticated) {
      fetchGames()
      fetchOrders()
    }
  }, [isAuthenticated, fetchOrders])

  const fetchGames = async () => {
    try {
      const res = await fetch("/api/games")

      if (!res.ok) {
        throw new Error("Failed to fetch games")
      }

      const data = await res.json()
      setGames(data)
    } catch (err) {
      console.error("Error fetching games:", err)
    }
  }

  // Set up socket event listener for order updates
  useSocketEvent("order-update", (updatedOrder) => {
    console.log("Received order update:", updatedOrder)

    // Update the order in the list if it exists
    setOrders((prevOrders) =>
      prevOrders.map((order) => (order.orderId === updatedOrder.orderId ? updatedOrder : order)),
    )

    setLastUpdated(new Date())
  })

  // Auto-refresh every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (isAuthenticated && !refreshing) {
        fetchOrders()
      }
    }, 60000)

    return () => clearInterval(interval)
  }, [isAuthenticated, refreshing, fetchOrders])

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters((prev) => ({ ...prev, [name]: value }))
    setPagination((prev) => ({ ...prev, page: 1 })) // Reset to first page when filters change
  }

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pagination.pages) {
      setPagination((prev) => ({ ...prev, page: newPage }))
    }
  }

  const handleAction = async (orderId, action) => {
    try {
      setActionLoading(orderId)

      // Get current order
      const orderRes = await fetch(`/api/orders/${orderId}`)
      if (!orderRes.ok) throw new Error("Failed to fetch order details")
      const order = await orderRes.json()

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
        default:
          throw new Error("Invalid action")
      }

      // Update the order
      const updateRes = await fetch(`/api/orders/${orderId}`, {
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

      // Update the order in the list
      setOrders((prevOrders) =>
        prevOrders.map((order) => (order.orderId === updatedOrder.orderId ? updatedOrder : order)),
      )

      setLastUpdated(new Date())
    } catch (err) {
      console.error(`Error performing action ${action} on order ${orderId}:`, err)
      alert(`Error: ${err.message}`)
    } finally {
      setActionLoading(null)
    }
  }

  if (isLoading || (loading && !orders.length)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <FaSpinner className="animate-spin text-4xl text-blue-500" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Orders Management</h1>
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
            onClick={fetchOrders}
            disabled={refreshing}
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded flex items-center gap-1 text-sm"
          >
            {refreshing ? <FaSpinner className="animate-spin" /> : <FaSync />}
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p className="font-bold">Error:</p>
          <p>{error}</p>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full border border-gray-300 rounded-md p-2"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="delivered">Delivered</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Game</label>
            <select
              name="gameId"
              value={filters.gameId}
              onChange={handleFilterChange}
              className="w-full border border-gray-300 rounded-md p-2"
            >
              <option value="">All Games</option>
              {games.map((game) => (
                <option key={game.id} value={game.id}>
                  {game.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => fetchOrders()}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2"
            >
              <FaSearch /> Search
            </button>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Game</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Top-Up Item
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount Paid
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fulfillment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.length > 0 ? (
                orders.map((order) => (
                  <tr key={order.orderId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.orderId}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.gameName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.packageName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.userId}
                      {order.serverId ? `/${order.serverId}` : ""}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${order.price.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
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
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {order.fulfillmentStatus === "pending" && (
                          <>
                            <button
                              onClick={() => handleAction(order.orderId, "mark-delivered")}
                              disabled={actionLoading === order.orderId}
                              className="text-green-600 hover:text-green-900"
                              title="Mark as Delivered"
                            >
                              {actionLoading === order.orderId ? <FaSpinner className="animate-spin" /> : <FaCheck />}
                            </button>
                            <button
                              onClick={() => handleAction(order.orderId, "mark-failed")}
                              disabled={actionLoading === order.orderId}
                              className="text-red-600 hover:text-red-900"
                              title="Mark as Failed"
                            >
                              <FaTimes />
                            </button>
                          </>
                        )}
                        {order.fulfillmentStatus === "failed" && (
                          <button
                            onClick={() => handleAction(order.orderId, "retry-delivery")}
                            disabled={actionLoading === order.orderId}
                            className="text-blue-600 hover:text-blue-900"
                            title="Retry Delivery"
                          >
                            <FaRedo />
                          </button>
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
                  <td colSpan="9" className="px-6 py-4 text-center text-gray-500">
                    No orders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing{" "}
                  <span className="font-medium">
                    {orders.length > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span>{" "}
                  of <span className="font-medium">{pagination.total}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Previous</span>
                    &larr;
                  </button>

                  {[...Array(pagination.pages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => handlePageChange(i + 1)}
                      className={`relative inline-flex items-center px-4 py-2 border ${
                        pagination.page === i + 1
                          ? "bg-blue-50 border-blue-500 text-blue-600"
                          : "border-gray-300 bg-white text-gray-500 hover:bg-gray-50"
                      } text-sm font-medium`}
                    >
                      {i + 1}
                    </button>
                  ))}

                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.pages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Next</span>
                    &rarr;
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
