"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function EditGame({ params }) {
  const router = useRouter()
  const { id } = params

  const [formData, setFormData] = useState({
    name: "",
    image: "",
    discount: "",
    description: "",
    featured: false,
  })

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)

  useEffect(() => {
    if (id) {
      fetchGame()
    }
  }, [id])

  const fetchGame = async () => {
    try {
      setLoading(true)
      console.log(`Client: Fetching game ${id}...`)

      const res = await fetch(`/api/games/${id}`)

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || errorData.message || `Failed to fetch game: ${res.status}`)
      }

      const game = await res.json()
      console.log(`Client: Game ${id} fetched successfully:`, game)

      setFormData({
        name: game.name || "",
        image: game.image || "",
        discount: game.discount || "",
        description: game.description || "",
        featured: game.featured || false,
      })

      setError(null)
    } catch (err) {
      console.error(`Client: Error fetching game ${id}:`, err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      console.log(`Client: Updating game ${id}...`)
      const res = await fetch(`/api/games/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || errorData.message || "Failed to update game")
      }

      console.log(`Client: Game ${id} updated successfully`)
      setMessage("Game updated successfully!")
      setTimeout(() => router.push("/admin/games"), 1500)
    } catch (err) {
      console.error(`Client: Error updating game ${id}:`, err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading && !formData.name) return <div className="p-8 text-center">Loading game data...</div>
  if (error)
    return (
      <div className="p-8 max-w-2xl mx-auto">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p className="font-bold">Error:</p>
          <p>{error}</p>
        </div>
        <Link href="/admin/games" className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded">
          Back to Games
        </Link>
      </div>
    )

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Edit Game: {formData.name}</h1>

      {message && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">{message}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block mb-1">Image URL</label>
          <input
            type="text"
            name="image"
            value={formData.image}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          />
          {formData.image && (
            <div className="mt-2">
              <img
                src={formData.image || "/placeholder.svg"}
                alt="Preview"
                className="h-20 w-auto object-cover"
                onError={(e) => {
                  e.target.src = "/placeholder.svg"
                  e.target.onerror = null
                }}
              />
            </div>
          )}
        </div>

        <div>
          <label className="block mb-1">Discount (optional)</label>
          <input
            type="text"
            name="discount"
            value={formData.discount}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            placeholder="e.g., 10% OFF"
          />
        </div>

        <div>
          <label className="block mb-1">Description (optional)</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 h-24"
            placeholder="Brief description of the game or special offers"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="featured"
            name="featured"
            checked={formData.featured}
            onChange={handleChange}
            className="mr-2"
          />
          <label htmlFor="featured">Featured Game</label>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>

          <Link href="/admin/games" className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
