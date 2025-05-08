import { NextResponse } from "next/server"

export async function GET() {
  // Check if environment variables are set
  const envStatus = {
    CLOUDINARY_CLOUD_NAME: !!process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: !!process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: !!process.env.CLOUDINARY_API_SECRET,
  }

  // Return status without exposing actual values
  return NextResponse.json({
    message: "Environment variables status",
    environmentVariables: envStatus,
    allSet: Object.values(envStatus).every(Boolean),
  })
}
