"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export function useAdminAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if there's a token in localStorage
    const token = localStorage.getItem("adminToken")

    // Check if there's a cookie (more secure)
    const hasCookie = document.cookie.includes("adminAuth=")

    if (!token && !hasCookie) {
      setIsAuthenticated(false)
      setIsLoading(false)
      router.replace("/")
      return
    }

    // Verify the token with the server
    const verifyToken = async () => {
      try {
        const response = await fetch("/api/auth/verify", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          setIsAuthenticated(true)
        } else {
          // If verification fails, clear token and redirect
          localStorage.removeItem("adminToken")
          setIsAuthenticated(false)
          router.replace("/")
        }
      } catch (error) {
        console.error("Auth verification error:", error)
        setIsAuthenticated(false)
      } finally {
        setIsLoading(false)
      }
    }

    verifyToken()
  }, [router])

  return { isAuthenticated, isLoading }
}

export function useAdminLogout() {
  const router = useRouter()

  const logout = async () => {
    try {
      // Call logout API to clear the cookie
      await fetch("/api/auth/logout", {
        method: "POST",
      })

      // Clear localStorage
      localStorage.removeItem("adminToken")

      // Redirect to home
      router.replace("/")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  return logout
}
