"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import ImageUpload from "@/components/admin/ImageUpload"
import { FaSpinner, FaExclamationTriangle } from "react-icons/fa"

export default function NewGame() {
  const router = useRouter()
  const [envStatus, setEnvStatus] = useState(null)
  const [envChecked, setEnvChecked] = useState(false)

  const [formData, setFormData] = useState({
    id: "",
    name: "",
    image: "",
    imagePublicId: "",
    discount: "",
    description: "",
    featured: false,
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [imageData, setImageData] = useState(null)

  // Check environment variables on component mount
  useEffect(() => {
    const checkEnv = async () => {
      try {
        const res = await fetch("/api/test-env")
        const data = await res.json()
        setEnvStatus(data)
        setEnvChecked(true)
      } catch (err) {
        console.error("Error checking environment variables:", err)
        setEnvStatus({ allSet: false, error: err.message })
        setEnvChecked(true)
      }
    }

    checkEnv()
  }, [])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleImageUpload = async (imageBase64) => {
    if (!imageBase64) {
      setImageData(null)
      setFormData((prev) => ({
        ...prev,
        image: "",
        imagePublicId: "",
      }))
      return null
    }

    try {
      console.log("Sending image to upload API...")
      const response = await fetch("/api/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image: imageBase64 }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Upload failed with status: ${response.status}`)
      }

      const data = await response.json()
      console.log("Upload API response:", data)

      // Update form data with image URL and public ID
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Validate image
      if (!formData.image) {
        throw new Error("Please upload a game image")
      }

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

  // Show environment variable status if there's an issue
  if (envChecked && envStatus && !envStatus.allSet) {
    return (
      <div className="p-8 max-w-2xl mx-auto">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <FaExclamationTriangle /> Environment Variable Issue
          </h2>
          <p className="mt-2">
            Some required environment variables for Cloudinary are missing. Please check your environment configuration.
          </p>
          <div className="mt-4 bg-white p-3 rounded">
            <h3 className="font-bold mb-2">Environment Variables Status:</h3>
            <ul className="list-disc pl-5">
              <li className={envStatus.environmentVariables?.CLOUDINARY_CLOUD_NAME ? "text-green-600" : "text-red-600"}>
                CLOUDINARY_CLOUD_NAME: {envStatus.environmentVariables?.CLOUDINARY_CLOUD_NAME ? "✓" : "✗"}
              </li>
              <li className={envStatus.environmentVariables?.CLOUDINARY_API_KEY ? "text-green-600" : "text-red-600"}>
                CLOUDINARY_API_KEY: {envStatus.environmentVariables?.CLOUDINARY_API_KEY ? "✓" : "✗"}
              </li>
              <li className={envStatus.environmentVariables?.CLOUDINARY_API_SECRET ? "text-green-600" : "text-red-600"}>
                CLOUDINARY_API_SECRET: {envStatus.environmentVariables?.CLOUDINARY_API_SECRET ? "✓" : "✗"}
              </li>
            </ul>
          </div>
          <p className="mt-4">
            Please make sure these environment variables are properly set in your .env.local file or in your deployment
            environment.
          </p>
        </div>
        <Link href="/admin/games" className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded">
          Back to Games
        </Link>
      </div>
    )
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
          <label className="block mb-1">Game Image</label>
          <ImageUpload onImageUpload={handleImageUpload} className="mt-2" />
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
            disabled={loading}
          >
            {loading ? (
              <>
                <FaSpinner className="animate-spin" />
                <span>Creating...</span>
              </>
            ) : (
              <span>Create Game</span>
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
