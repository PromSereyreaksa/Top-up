import { NextResponse } from "next/server"
import { jwtVerify } from "jose"

// This function can be marked `async` if using `await` inside
export async function middleware(request) {
  // Check if the request is for the admin section
  if (request.nextUrl.pathname.startsWith("/admin")) {
    // Get the token from the cookies
    const token = request.cookies.get("adminAuth")?.value

    // If there's no token, redirect to the home page
    if (!token) {
      return NextResponse.redirect(new URL("/", request.url))
    }

    try {
      // Verify the token
      const secret = new TextEncoder().encode(process.env.JWT_SECRET)
      await jwtVerify(token, secret)

      // If verification succeeds, continue to the admin page
      return NextResponse.next()
    } catch (error) {
      // If verification fails, redirect to home
      console.error("Token verification failed:", error)
      return NextResponse.redirect(new URL("/", request.url))
    }
  }

  // For non-admin routes, continue normally
  return NextResponse.next()
}

// Configure the middleware to run only on admin routes
export const config = {
  matcher: ["/admin/:path*"],
}
