import { NextResponse } from "next/server"

/**
 * Debug endpoint to check DL Pay configuration
 */
export async function GET() {
  // Get environment variables
  const secretKey = process.env.DL_PAY_SECRET_KEY
  const apiKey = process.env.DL_PAY_API_KEY
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  const apiUrl = process.env.NEXT_PUBLIC_DLPAY_API_URL

  // Check if environment variables are set
  const secretKeyExists = !!secretKey
  const apiKeyExists = !!apiKey
  const siteUrlExists = !!siteUrl
  const apiUrlExists = !!apiUrl

  // Get the callback URL
  const callbackUrl = `${siteUrl || "http://localhost:3000"}/api/webhook`

  // Return debug information
  return NextResponse.json({
    success: true,
    environment: process.env.NODE_ENV,
    configuration: {
      secretKeyExists,
      secretKeyLength: secretKey ? secretKey.length : 0,
      apiKeyExists,
      siteUrlExists,
      apiUrlExists,
      callbackUrl,
      successUrl: `${siteUrl || "http://localhost:3000"}/payment/success`,
      cancelUrl: `${siteUrl || "http://localhost:3000"}/payment/cancel`,
    },
    timestamp: new Date().toISOString(),
  })
}
