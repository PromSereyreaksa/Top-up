"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAdminAuth, useAdminLogout } from "@/lib/auth"
import { FaSignOutAlt, FaSpinner, FaTachometerAlt, FaGamepad, FaShoppingCart, FaCog } from "react-icons/fa"

export default function AdminPage() {
  const { isAuthenticated, isLoading } = useAdminAuth()
  const logout = useAdminLogout()
  const router = useRouter()

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/")
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <FaSpinner className="animate-spin text-4xl text-blue-500" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Will be redirected by the useEffect
  }

  return (
    <div>
      <div className="bg-gray-800 text-white p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Admin Dashboard</h1>
        <button onClick={logout} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded">
          <FaSignOutAlt /> Logout
        </button>
      </div>

      <div className="p-8">
        <h1 className="text-2xl font-bold mb-6">Admin Panel</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link href="/admin/dashboard" className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center mb-4">
              <div className="bg-blue-100 p-3 rounded-full mr-4">
                <FaTachometerAlt className="text-blue-500 text-xl" />
              </div>
              <h2 className="text-lg font-semibold">Dashboard</h2>
            </div>
            <p className="text-gray-600">View sales statistics and performance metrics</p>
          </Link>

          <Link href="/admin/games" className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center mb-4">
              <div className="bg-green-100 p-3 rounded-full mr-4">
                <FaGamepad className="text-green-500 text-xl" />
              </div>
              <h2 className="text-lg font-semibold">Games</h2>
            </div>
            <p className="text-gray-600">Manage games, packages, and pricing</p>
          </Link>

          <Link href="/admin/orders" className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center mb-4">
              <div className="bg-purple-100 p-3 rounded-full mr-4">
                <FaShoppingCart className="text-purple-500 text-xl" />
              </div>
              <h2 className="text-lg font-semibold">Orders</h2>
            </div>
            <p className="text-gray-600">View and manage customer orders</p>
          </Link>

          <Link href="/admin/settings" className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center mb-4">
              <div className="bg-yellow-100 p-3 rounded-full mr-4">
                <FaCog className="text-yellow-500 text-xl" />
              </div>
              <h2 className="text-lg font-semibold">Settings</h2>
            </div>
            <p className="text-gray-600">Manage site settings, hero images, and promotions</p>
          </Link>
        </div>
      </div>
    </div>
  )
}
