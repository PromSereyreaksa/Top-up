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
  