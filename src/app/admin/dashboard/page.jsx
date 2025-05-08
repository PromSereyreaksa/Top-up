"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useAdminAuth } from "@/lib/auth"
import { useSocket, useSocketEvent } from "@/hooks/useSocket"
import { FaSpinner, FaShoppingCart, FaMoneyBillWave, FaCheckCircle, FaSync } from "react-icons/fa"
import { Line, Pie } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer } from "@/components/ui/chart"

export default function AdminDashboard() {
  const { isAuthenticated, isLoading } = useAdminAuth()
  const router = useRouter()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)
  const { isConnected } = useSocket()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/")
    }
  }, [isAuthenticated, isLoading, router])

  const fetchStats = useCallback(async () => {
    try {
      setRefreshing(true)
      const res = await fetch("/api/dashboard/stats")

      if (!res.ok) {
        throw new Error("Failed to fetch dashboard statistics")
      }

      const data = await res.json()
      setStats(data)
      setError(null)
      setLastUpdated(new Date())
    } catch (err) {
      console.error("Error fetching dashboard stats:", err)
      setError(err.message)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      fetchStats()
    }
  }, [isAuthenticated, fetchStats])

  // Set up socket event listener for dashboard updates
  useSocketEvent("dashboard-update", (data) => {
    console.log("Received dashboard update:", data)
    setStats(data)
    setLastUpdated(new Date())
  })

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (isAuthenticated && !refreshing) {
        fetchStats()
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [isAuthenticated, refreshing, fetchStats])

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
          onClick={fetchStats}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2"
        >
          <FaSync /> Retry
        </button>
      </div>
    )
  }

  // Prepare chart data
  const orderStatusData = stats
    ? [
        { name: "Pending", value: stats.orderStatus.pending, color: "#f59e0b" },
        { name: "Completed", value: stats.orderStatus.completed, color: "#10b981" },
        { name: "Failed", value: stats.orderStatus.failed, color: "#ef4444" },
      ]
    : []

  // Use real chart data from API
  const dailyOrdersData = stats?.chartData || []

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard Overview</h1>
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
            onClick={fetchStats}
            disabled={refreshing}
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded flex items-center gap-1 text-sm"
          >
            {refreshing ? <FaSpinner className="animate-spin" /> : <FaSync />}
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Daily Orders</CardTitle>
            <FaShoppingCart className="text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.dailyOrders || 0}</div>
            <p className="text-xs text-muted-foreground">orders today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Daily Revenue</CardTitle>
            <FaMoneyBillWave className="text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats?.dailyRevenue?.toFixed(2) || "0.00"}</div>
            <p className="text-xs text-muted-foreground">revenue today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <FaMoneyBillWave className="text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats?.totalRevenue?.toFixed(2) || "0.00"}</div>
            <p className="text-xs text-muted-foreground">all time revenue</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Successful Top-ups</CardTitle>
            <FaCheckCircle className="text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.successfulTopUps || 0}</div>
            <p className="text-xs text-muted-foreground">completed top-ups</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Daily Orders</CardTitle>
            <CardDescription>Order volume over the past week</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                orders: {
                  label: "Orders",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="h-[300px]"
            >
              <Line
                data={dailyOrdersData}
                margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
                xField="date"
                yField="orders"
              />
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Order Status</CardTitle>
            <CardDescription>Distribution of order statuses</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                pending: {
                  label: "Pending",
                  color: "#f59e0b",
                },
                completed: {
                  label: "Completed",
                  color: "#10b981",
                },
                failed: {
                  label: "Failed",
                  color: "#ef4444",
                },
              }}
              className="h-[300px]"
            >
              <Pie data={orderStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label />
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>Latest 5 orders across all games</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="py-3 text-left">Order ID</th>
                  <th className="py-3 text-left">Game</th>
                  <th className="py-3 text-left">Package</th>
                  <th className="py-3 text-left">Amount</th>
                  <th className="py-3 text-left">Status</th>
                  <th className="py-3 text-left">Date</th>
                </tr>
              </thead>
              <tbody>
                {stats?.recentOrders?.length > 0 ? (
                  stats.recentOrders.map((order) => (
                    <tr key={order.orderId} className="border-b hover:bg-gray-50">
                      <td className="py-3">{order.orderId}</td>
                      <td className="py-3">{order.gameName}</td>
                      <td className="py-3">{order.packageName}</td>
                      <td className="py-3">${order.price.toFixed(2)}</td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
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
                      <td className="py-3">{new Date(order.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="py-4 text-center text-gray-500">
                      No recent orders found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
