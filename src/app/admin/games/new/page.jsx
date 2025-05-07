"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function NewGame() {
  const router = useRouter()

  const [formData, setFormData] = useState({
    id: "",
    name: "",
    image: "",
    discount: "",
    description: "",
    featured: false,
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

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
    setError(null)

    try {
      console.log("Client: Creating new game:", formData.id)
      const res = await fetch("/api/games", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to create game")
      }

      console.log("Client: Game created successfully:", data)
      router.push("/admin/games")
    } catch (err) {
      console.error("Client: Error creating game:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Add New Game</h1>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Game ID (unique identifier)</label>
          <input
            type="text"
            name="id"
            value={formData.id}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
            placeholder="e.g., mobile-legends"
          />
          <p className="text-xs text-gray-500 mt-1">
            Use lowercase letters, numbers, and hyphens only. This will be used in URLs.
          </p>
        </div>

        <div>
          <label className="block mb-1">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
            placeholder="e.g., Mobile Legends"
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
            placeholder="/images/game-name.jpg"
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
            {loading ? "Creating..." : "Create Game"}
          </button>

          <Link href="/admin/games" className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
