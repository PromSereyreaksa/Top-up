import { v2 as cloudinary } from "cloudinary"
import "dotenv/config"

// Add debugging to see if environment variables are available
console.log("Cloudinary Config - Checking environment variables:")
console.log("CLOUDINARY_CLOUD_NAME exists:", !!process.env.CLOUDINARY_CLOUD_NAME)
console.log("CLOUDINARY_API_KEY exists:", !!process.env.CLOUDINARY_API_KEY)
console.log("CLOUDINARY_API_SECRET exists:", !!process.env.CLOUDINARY_API_SECRET)

// Configure Cloudinary with explicit error handling
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.error("Missing Cloudinary environment variables. Please check your .env file or environment configuration.")
}

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

/**
 * Upload an image to Cloudinary
 * @param {File|Buffer|string} file - The file to upload (can be a file object, buffer, or base64 string)
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} - Cloudinary upload response
 */
export async function uploadImage(file, options = {}) {
  try {
    // Verify configuration before attempting upload
    if (!process.env.CLOUDINARY_API_KEY) {
      throw new Error("Cloudinary API key is missing. Please check your environment variables.")
    }

    // Set default options for game images
    const defaultOptions = {
      folder: "game-images",
      transformation: [
        { width: 500, height: 500, crop: "limit" }, // Resize for standard display
        { quality: "auto:good" }, // Auto optimize quality
        { fetch_format: "auto" }, // Auto select best format
      ],
    }

    // Merge default options with provided options
    const uploadOptions = { ...defaultOptions, ...options }

    // If file is a base64 string from client-side
    if (typeof file === "string" && file.includes("base64")) {
      console.log("Uploading base64 image to Cloudinary...")
      const result = await cloudinary.uploader.upload(file, uploadOptions)
      return result
    }
    // If file is a buffer from server-side
    else if (Buffer.isBuffer(file)) {
      console.log("Uploading buffer image to Cloudinary...")
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
          if (error) return reject(error)
          resolve(result)
        })
        uploadStream.end(file)
      })
      return result
    }

    // Handle other cases or throw error
    throw new Error("Unsupported file format for upload")
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error)
    throw error
  }
}

/**
 * Delete an image from Cloudinary
 * @param {string} publicId - The public ID of the image to delete
 * @returns {Promise<Object>} - Cloudinary deletion response
 */
export async function deleteImage(publicId) {
  try {
    if (!process.env.CLOUDINARY_API_KEY) {
      throw new Error("Cloudinary API key is missing. Please check your environment variables.")
    }

    const result = await cloudinary.uploader.destroy(publicId)
    return result
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error)
    throw error
  }
}

/**
 * Extract public ID from Cloudinary URL
 * @param {string} url - Cloudinary URL
 * @returns {string|null} - Public ID or null if not found
 */
export function getPublicIdFromUrl(url) {
  if (!url || typeof url !== "string") return null

  // Check if it's a Cloudinary URL
  if (!url.includes("cloudinary.com")) return null

  try {
    // Extract the public ID from the URL
    // Format: https://res.cloudinary.com/cloud-name/image/upload/v1234567890/folder/public-id.ext
    const urlParts = url.split("/")
    const uploadIndex = urlParts.indexOf("upload")

    if (uploadIndex === -1) return null

    // Get everything after 'upload' and before the file extension
    const publicIdWithVersion = urlParts.slice(uploadIndex + 1).join("/")

    // Remove version if present (v1234567890/)
    const publicId = publicIdWithVersion.replace(/^v\d+\//, "")

    // Remove file extension
    return publicId.replace(/\.[^/.]+$/, "")
  } catch (error) {
    console.error("Error extracting public ID:", error)
    return null
  }
}

export default cloudinary
