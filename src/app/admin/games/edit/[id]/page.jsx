"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import ImageUpload from "@/components/admin/ImageUpload"
import { FaSpinner } from "react-icons/fa"
import { getPublicIdFromUrl } from "@/lib/cloudinary-utils"

export default function EditGame({ params }) {
  const router = useRouter()
  const { id } = params

  const [formData, setFormData] = useState({
    name: "",
    image: "",
    imagePublicId: "",
    discount: "",
    description: "",
    featured: false,
  })

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)
  const [initialImage, setInitialImage] = useState(null)

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

      // Extract public ID from image URL if not stored
      const imagePublicId = game.imagePublicId || getPublicIdFromUrl(game.image)

      setFormData({
        name: game.name || "",
        image: game.image || "",
        imagePublicId: imagePublicId || "",
        discount: game.discount || "",
        description: game.description || "",
        featured: game.featured || false,
      })

      // Set initial image for the image upload component
      if (game.image) {
        setInitialImage({
          url: game.image,
          publicId: imagePublicId,
        })
      }

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

  const handleImageUpload = async (imageBase64) => {
    if (!imageBase64) {
      // If clearing the image
      setFormData((prev) => ({
        ...prev,
        image: "",
        imagePublicId: "",
      }))
      return null
    }

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: imageBase64,
          gameId: id, // Include game ID for folder organization
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to upload image")
      }

      const data = await response.json()

      // Update form data with new image URL and public ID
      setFormData((prev) => ({
        ...prev,
        image: data.url,
        imagePublicId: data.publicId,
      }))

      return data
    } catch (error) {
      console.error("Error uploading image:", error)
      throw error
    }
  }

  const handleDeleteOldImage = async (publicId) => {
    if (!publicId) return

    try {
      const response = await fetch("/api/upload", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ publicId }),
      })

      if (!response.ok) {
        console.error("Warning: Failed to delete old image, but continuing with update")
      }
    } catch (error) {
      console.error("Error deleting old image:", error)
      // Continue with the update even if image deletion fails
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setMessage(null)
    setError(null)

    try {
      // Validate image
      if (!formData.image) {
        throw new Error("Please upload a game image")
      }

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

      // If image was changed and we have the old public ID, try to delete it
      if (initialImage && initialImage.publicId && initialImage.publicId !== formData.imagePublicId) {
        await handleDeleteOldImage(initialImage.publicId)
      }

      console.log(`Client: Game ${id} updated successfully`)
      setMessage("Game updated successfully!")

      // Update the initial image to the new one
      if (formData.image) {
        setInitialImage({
          url: formData.image,
          publicId: formData.imagePublicId,
        })
      }

      setTimeout(() => router.push("/admin/games"), 1500)
    } catch (err) {
      console.error(`Client: Error updating game ${id}:`, err)
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="p-8 text-center">Loading game data...</div>
  if (error && !formData.name)
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

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

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
          <label className="block mb-1">Game Image</label>
          <ImageUpload onImageUpload={handleImageUpload} initialImage={initialImage} className="mt-2" />
          <p className="text-xs text-gray-500 mt-1">Upload a square image for best results. Maximum size: 5MB.</p>
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
            className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded min-w-[120px]"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <FaSpinner className="animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <span>Save Changes</span>
            )}
          </button>

          <Link href="/admin/games" className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
