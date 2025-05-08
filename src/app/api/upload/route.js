import { NextResponse } from "next/server"
import { v2 as cloudinary } from "cloudinary"

// Configure Cloudinary - this only runs on the server
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(request) {
  try {
    // Log environment variables availability (without exposing values)
    console.log("Upload API - Environment variables check:")
    console.log("CLOUDINARY_CLOUD_NAME exists:", !!process.env.CLOUDINARY_CLOUD_NAME)
    console.log("CLOUDINARY_API_KEY exists:", !!process.env.CLOUDINARY_API_KEY)
    console.log("CLOUDINARY_API_SECRET exists:", !!process.env.CLOUDINARY_API_SECRET)

    // Get the image data from the request
    const data = await request.json()

    if (!data.image) {
      return NextResponse.json({ error: "No image data provided" }, { status: 400 })
    }

    // Verify Cloudinary configuration
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return NextResponse.json(
        { error: "Cloudinary configuration is missing. Please check your environment variables." },
        { status: 500 },
      )
    }

    // Upload the image to Cloudinary directly using the API
    console.log("Attempting to upload image to Cloudinary...")

    // Set default options for game images
    const uploadOptions = {
      folder: `game-images/${data.gameId || "new"}`,
      transformation: [
        { width: 500, height: 500, crop: "limit" }, // Resize for standard display
        { quality: "auto:good" }, // Auto optimize quality
        { fetch_format: "auto" }, // Auto select best format
      ],
    }

    // Upload the base64 image
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload(data.image, uploadOptions, (error, result) => {
        if (error) {
          console.error("Cloudinary upload error:", error)
          reject(error)
        } else {
          resolve(result)
        }
      })
    })

    console.log("Image uploaded successfully to Cloudinary")

    // Return the Cloudinary response
    return NextResponse.json({
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
    })
  } catch (error) {
    console.error("Error in image upload API:", error)
    return NextResponse.json({ error: error.message || "Failed to upload image" }, { status: 500 })
  }
}

export async function DELETE(request) {
  try {
    // Get the public ID from the request
    const data = await request.json()

    if (!data.publicId) {
      return NextResponse.json({ error: "No public ID provided" }, { status: 400 })
    }

    // Delete the image from Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(data.publicId, (error, result) => {
        if (error) {
          console.error("Cloudinary delete error:", error)
          reject(error)
        } else {
          resolve(result)
        }
      })
    })

    // Return the Cloudinary response
    return NextResponse.json({
      result: result.result,
    })
  } catch (error) {
    console.error("Error in image delete API:", error)
    return NextResponse.json({ error: error.message || "Failed to delete image" }, { status: 500 })
  }
}
