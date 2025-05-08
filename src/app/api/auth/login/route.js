import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { cookies } from "next/headers"

export async function POST(request) {
  try {
    const { username, password } = await request.json()

    // Check credentials against environment variables
    // This is a simple approach - in production, you might want to use a database
    if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
      // Create a JWT token
      const token = jwt.sign({ username, role: "admin" }, process.env.JWT_SECRET, { expiresIn: "24h" })

      // Set a secure HTTP-only cookie
      cookies().set({
        name: "adminAuth",
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 24, // 24 hours
        path: "/",
      })

      return NextResponse.json({ success: true, token })
    }

    // Delay response to prevent timing attacks
    await new Promise((resolve) => setTimeout(resolve, 1000))

    return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ success: false, message: "Authentication failed" }, { status: 500 })
  }
}
