import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { cookies } from "next/headers"

export async function GET(request) {
  try {
    // Get the token from cookies (more secure)
    const token = cookies().get("adminAuth")?.value

    // If no token in cookies, check Authorization header
    const authHeader = request.headers.get("Authorization")
    const headerToken = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null

    // Use cookie token or header token
    const finalToken = token || headerToken

    if (!finalToken) {
      return NextResponse.json({ success: false, message: "No authentication token" }, { status: 401 })
    }

    // Verify the token
    jwt.verify(finalToken, process.env.JWT_SECRET)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Token verification error:", error)
    return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 })
  }
}
