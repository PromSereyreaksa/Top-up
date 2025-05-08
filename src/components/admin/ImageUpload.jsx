"use client"

import { useState, useRef, useCallback } from "react"
import { FaUpload, FaSpinner, FaCheck, FaTimes, FaImage } from "react-icons/fa"

export default function ImageUpload({ onImageUpload, initialImage = null, className = "" }) {
  const [image, setImage] = useState(initialImage)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef(null)

  const handleFileChange = async (file) => {
    if (!file) return

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"]
    if (!validTypes.includes(file.type)) {
      setUploadError("Please select a valid image file (JPEG, PNG, WebP, or GIF)")
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Image size should be less than 5MB")
      return
    }

    try {
      setIsUploading(true)
      setUploadError(null)

      // Create a preview
      const reader = new FileReader()
      reader.onload = (event) => {
        setImage({
          preview: event.target.result,
          file: file,
          isPreview: true,
        })
      }
      reader.readAsDataURL(file)

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + 10
        })
      }, 200)

      // Convert file to base64 for upload
      const base64 = await convertFileToBase64(file)

      try {
        // Call the parent component's upload handler
        const result = await onImageUpload(base64)

        clearInterval(progressInterval)
        setUploadProgress(100)

        if (!result) {
          throw new Error("Upload failed - no result returned")
        }

        // Update image with the result from Cloudinary
        setImage({
          url: result.secure_url || result.url,
          publicId: result.public_id || result.publicId,
          isPreview: false,
        })

        // Reset progress after a delay
        setTimeout(() => {
          setUploadProgress(0)
          setIsUploading(false)
        }, 1000)
      } catch (uploadError) {
        clearInterval(progressInterval)
        console.error("Error during image upload:", uploadError)
        setUploadError(uploadError.message || "Failed to upload image. Please check the server logs.")
        setIsUploading(false)
        setUploadProgress(0)
      }
    } catch (error) {
      console.error("Upload preparation error:", error)
      setUploadError(error.message || "Failed to prepare image for upload")
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const handleInputChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      handleFileChange(file)
    }
  }

  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result)
      reader.onerror = (error) => reject(error)
    })
  }

  const handleRemoveImage = () => {
    setImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    // Notify parent component
    onImageUpload(null)
  }

  const triggerFileInput = () => {
    fileInputRef.current.click()
  }

  // Drag and drop handlers
  const handleDragEnter = useCallback(
    (e) => {
      e.preventDefault()
      e.stopPropagation()
      if (!isUploading) {
        setIsDragging(true)
      }
    },
    [isUploading],
  )

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDragOver = useCallback(
    (e) => {
      e.preventDefault()
      e.stopPropagation()
      if (!isUploading) {
        setIsDragging(true)
      }
    },
    [isUploading],
  )

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)

      if (isUploading) return

      const files = e.dataTransfer.files
      if (files && files.length > 0) {
        handleFileChange(files[0])
      }
    },
    [isUploading],
  )

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* Image preview or placeholder - now with 1:1 aspect ratio */}
      <div
        className={`w-full aspect-square border-2 rounded-lg flex items-center justify-center mb-3 overflow-hidden relative
          ${isDragging ? "border-blue-500 bg-blue-50" : "border-dashed border-gray-300"}`}
        onClick={!isUploading ? triggerFileInput : undefined}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        style={{ cursor: isUploading ? "default" : "pointer" }}
      >
        {image && (image.preview || image.url) ? (
          <>
            <img src={image.preview || image.url} alt="Game preview" className="w-full h-full object-cover" />
            {!isUploading && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  handleRemoveImage()
                }}
                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                aria-label="Remove image"
              >
                <FaTimes />
              </button>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center text-gray-400 p-4 text-center">
            <FaImage className="text-4xl mb-2" />
            <span className="text-sm mb-1">Click or drag image here to upload</span>
            <span className="text-xs text-gray-400">JPEG, PNG, WebP, or GIF (max 5MB)</span>
          </div>
        )}

        {/* Upload progress overlay */}
        {isUploading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center text-white">
            <FaSpinner className="animate-spin text-2xl mb-2" />
            <div className="w-3/4 bg-gray-200 rounded-full h-2.5">
              <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
            </div>
            <span className="mt-2 text-sm">{uploadProgress}% Uploading...</span>
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleInputChange}
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        disabled={isUploading}
      />

      {/* Upload button */}
      <button
        type="button"
        onClick={triggerFileInput}
        disabled={isUploading}
        className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isUploading ? (
          <>
            <FaSpinner className="animate-spin" />
            <span>Uploading...</span>
          </>
        ) : image ? (
          <>
            <FaUpload />
            <span>Change Image</span>
          </>
        ) : (
          <>
            <FaUpload />
            <span>Upload Image</span>
          </>
        )}
      </button>

      {/* Error message */}
      {uploadError && (
        <div className="mt-2 text-red-500 text-sm p-2 bg-red-50 rounded-md w-full">
          <strong>Error:</strong> {uploadError}
        </div>
      )}

      {/* Success message */}
      {image && !image.isPreview && !isUploading && (
        <div className="mt-2 text-green-500 text-sm flex items-center gap-1">
          <FaCheck />
          <span>Image uploaded successfully</span>
        </div>
      )}
    </div>
  )
}
