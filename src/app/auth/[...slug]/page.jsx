"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { FaLock, FaSpinner } from "react-icons/fa"

export default function SecretLogin({ params }) {
  const router = useRouter()
  const { slug } = params
  const [credentials, setCredentials] = useState({ username: "", password: "" })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showLogin, setShowLogin] = useState(false)

  // Only show the login form if the correct secret path is accessed
  useEffect(() => {
    // The secret path should be something non-obvious
    // For example: /auth/secret-key-12345
    if (slug && slug.length === 1 && slug[0] === process.env.NEXT_PUBLIC_ADMIN_SECRET_PATH) {
      setShowLogin(true)
    } else {
      // Redirect to home if incorrect path
      router.replace("/")
    }
  }, [slug, router])

  const handleChange = (e) => {
    const { name, value } = e.target
    setCredentials((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Authentication failed")
      }

      // Set auth token in localStorage
      localStorage.setItem("adminToken", data.token)

      // Set auth cookie (more secure than localStorage)
      document.cookie = `adminAuth=${data.token}; path=/; max-age=86400; SameSite=Strict; Secure`

      // Redirect to admin dashboard
      router.push("/admin")
    } catch (err) {
      console.error("Login error:", err)
      setError(err.message || "Failed to login. Please check your credentials.")
    } finally {
      setLoading(false)
    }
  }

  if (!showLogin) {
    return null // Don't show anything if the path is incorrect
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <div className="flex justify-center mb-6">
          <div className="bg-blue-500 text-white p-3 rounded-full">
            <FaLock size={24} />
          </div>
        </div>
        <h1 className="text-2xl font-bold mb-6 text-center">Admin Access</h1>

        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={credentials.username}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? (
              <>
                <FaSpinner className="animate-spin mr-2" /> Authenticating...
              </>
            ) : (
              "Login"
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
