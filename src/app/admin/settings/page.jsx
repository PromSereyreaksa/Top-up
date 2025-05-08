"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAdminAuth } from "@/lib/auth"
import { FaSpinner, FaSave, FaImage, FaBullhorn } from "react-icons/fa"
import ImageUpload from "@/components/admin/ImageUpload"

export default function AdminSettings() {
  const { isAuthenticated, isLoading } = useAdminAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  // Settings state
  const [heroImages, setHeroImages] = useState([
    { id: 1, url: "/images/hero-bg.jpg", publicId: "" },
    { id: 2, url: "/images/hero2-bg.jpg", publicId: "" },
    { id: 3, url: "/images/hero3-bg.jpg", publicId: "" },
    { id: 4, url: "/images/hero4-bg.jpg", publicId: "" },
  ])

  const [promotionText, setPromotionText] = useState("ទទួលបានពេជ្របន្ថែម 20% លើការបញ្ចូលទឹកប្រាក់ Mobile Legends ចុងសប្តាហ៍នេះ!")
  const [promotionEnabled, setPromotionEnabled] = useState(true)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/")
    }
  }, [isAuthenticated, isLoading, router])

  useEffect(() => {
    if (isAuthenticated) {
      fetchSettings()
    }
  }, [isAuthenticated])

  const fetchSettings = async () => {
    try {
      setLoading(true)

      // Fetch hero images
      const heroImagesRes = await fetch("/api/settings?key=heroImages")
      if (heroImagesRes.ok) {
        const data = await heroImagesRes.json()
        if (data && data.value) {
          setHeroImages(data.value)
        }
      }

      // Fetch promotion settings
      const promotionRes = await fetch("/api/settings?key=promotion")
      if (promotionRes.ok) {
        const data = await promotionRes.json()
        if (data && data.value) {
          setPromotionText(data.value.text || promotionText)
          setPromotionEnabled(data.value.enabled !== undefined ? data.value.enabled : true)
        }
      }

      setError(null)
    } catch (err) {
      console.error("Error fetching settings:", err)
      setError("Failed to load settings. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (index, imageBase64) => {
    if (!imageBase64) return null

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: imageBase64,
          gameId: "hero-images",
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to upload image")
      }

      const data = await response.json()

      // Update the hero images array
      const updatedHeroImages = [...heroImages]
      updatedHeroImages[index] = {
        ...updatedHeroImages[index],
        url: data.url,
        publicId: data.publicId,
      }
      setHeroImages(updatedHeroImages)

      return data
    } catch (error) {
      console.error("Error uploading hero image:", error)
      throw error
    }
  }

  const saveHeroImages = async () => {
    try {
      setSaving(true)
      setError(null)
      setSuccess(null)

      const response = await fetch("/api/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          key: "heroImages",
          value: heroImages,
          type: "json",
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to save hero images")
      }

      setSuccess("Hero images saved successfully!")
    } catch (err) {
      console.error("Error saving hero images:", err)
      setError(err.message || "Failed to save hero images")
    } finally {
      setSaving(false)
    }
  }

  const savePromotionSettings = async () => {
    try {
      setSaving(true)
      setError(null)
      setSuccess(null)

      const response = await fetch("/api/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          key: "promotion",
          value: {
            text: promotionText,
            enabled: promotionEnabled,
          },
          type: "json",
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to save promotion settings")
      }

      setSuccess("Promotion settings saved successfully!")
    } catch (err) {
      console.error("Error saving promotion settings:", err)
      setError(err.message || "Failed to save promotion settings")
    } finally {
      setSaving(false)
    }
  }

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

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Site Settings</h1>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">{success}</div>
      )}

      {/* Hero Images Section */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
        <div className="p-6">
          <div className="flex items-center mb-4">
            <FaImage className="text-blue-500 mr-2" />
            <h2 className="text-xl font-semibold">Hero Images</h2>
          </div>

          <p className="text-gray-600 mb-6">
            Upload or change the hero images displayed on the homepage carousel. For best results, use images with a
            16:9 aspect ratio and resolution of at least 1920x1080.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {heroImages.map((image, index) => (
              <div key={image.id} className="border rounded-lg p-4">
                <h3 className="font-medium mb-2">Hero Image {index + 1}</h3>
                <div className="mb-4">
                  <img
                    src={image.url || "/placeholder.svg"}
                    alt={`Hero ${index + 1}`}
                    className="w-full h-40 object-cover rounded-lg mb-2"
                  />
                </div>
                <ImageUpload
                  initialImage={image.url ? { url: image.url, publicId: image.publicId } : null}
                  onImageUpload={(imageBase64) => handleImageUpload(index, imageBase64)}
                />
              </div>
            ))}
          </div>

          <div className="flex justify-end">
            <button
              onClick={saveHeroImages}
              disabled={saving}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center"
            >
              {saving ? <FaSpinner className="animate-spin mr-2" /> : <FaSave className="mr-2" />}
              Save Hero Images
            </button>
          </div>
        </div>
      </div>

      {/* Promotion Banner Section */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
        <div className="p-6">
          <div className="flex items-center mb-4">
            <FaBullhorn className="text-blue-500 mr-2" />
            <h2 className="text-xl font-semibold">Promotion Banner</h2>
          </div>

          <p className="text-gray-600 mb-6">Edit the promotional banner text displayed at the top of the website.</p>

          <div className="mb-6">
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                id="promotionEnabled"
                checked={promotionEnabled}
                onChange={(e) => setPromotionEnabled(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="promotionEnabled" className="text-sm font-medium">
                Enable Promotion Banner
              </label>
            </div>

            <div className="mb-4">
              <label htmlFor="promotionText" className="block text-sm font-medium text-gray-700 mb-1">
                Promotion Text
              </label>
              <textarea
                id="promotionText"
                value={promotionText}
                onChange={(e) => setPromotionText(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2 h-24"
                placeholder="Enter promotional text here..."
              />
            </div>

            <div className="bg-gradient-to-r from-[#ff4e50] to-[#f9d423] p-3 text-white shadow-md rounded-lg mb-4">
              <div className="flex items-center justify-center">
                <div className="text-center">
                  <p className="m-0 text-sm">
                    <strong>Special Offer!</strong> {promotionText}
                  </p>
                </div>
              </div>
              <div className="mt-2 flex justify-center gap-1.5">
                <span className="h-2 w-2 cursor-pointer rounded-full bg-white"></span>
                <span className="h-1.5 w-1.5 cursor-pointer rounded-full bg-white/50"></span>
                <span className="h-1.5 w-1.5 cursor-pointer rounded-full bg-white/50"></span>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={savePromotionSettings}
              disabled={saving}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center"
            >
              {saving ? <FaSpinner className="animate-spin mr-2" /> : <FaSave className="mr-2" />}
              Save Promotion Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
