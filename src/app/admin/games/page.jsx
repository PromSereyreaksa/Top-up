"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAdminAuth, useAdminLogout } from "@/lib/auth"
import AdminGames from "./games"
import { FaSignOutAlt, FaSpinner } from "react-icons/fa"

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
      <AdminGames />
    </div>
  )
}
