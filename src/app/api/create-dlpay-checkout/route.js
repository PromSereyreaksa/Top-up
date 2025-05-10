import { NextResponse } from "next/server"
import crypto from "crypto"
import axios from "axios"

// Standalone encryption function
function encryptDirectly(payload, secretKey) {
  try {
    // Generate a random 12-byte IV
    const iv = crypto.randomBytes(12)

    // Create cipher with AES-256-GCM
    const cipher = crypto.createCipheriv("aes-256-gcm", Buffer.from(secretKey, "hex"), iv)

    // Convert payload to JSON string
    const data = JSON.stringify(payload)

    // Encrypt the data
    const encrypted = Buffer.concat([cipher.update(data, "utf8"), cipher.final()])

    // Get the auth tag
    const tag = cipher.getAuthTag()

    // Combine IV, encrypted data, and auth tag, then convert to base64
    return Buffer.concat([iv, encrypted, tag]).toString("base64")
  } catch (error) {
    console.error("Encryption error:", error)
    throw new Error(`Encryption failed: ${error.message}`)
  }
}

export async function POST(request) {
  console.log("API: POST /api/create-dlpay-checkout - Request received")

  try {
    // Get the request body
    const body = await request.json()
    console.log("Request body:", JSON.stringify(body, null, 2))

    // Get the payload from the request
    const payload = body.payload
    if (!payload) {
      return NextResponse.json({ error: "Payload is required" }, { status: 400 })
    }

    // Get the secret key and API key
    const secretKey = process.env.DL_PAY_SECRET_KEY
    const apiKey = process.env.DL_PAY_API_KEY

    // Log environment variable status (without exposing values)
    console.log("DL_PAY_SECRET_KEY exists:", !!secretKey)
    console.log("DL_PAY_API_KEY exists:", !!apiKey)
    console.log("DL_PAY_SECRET_KEY length:", secretKey ? secretKey.length : 0)

    // Validate secret key
    if (!secretKey) {
      return NextResponse.json({ error: "DL_PAY_SECRET_KEY is not defined" }, { status: 500 })
    }

    // Validate API key
    if (!apiKey) {
      return NextResponse.json({ error: "DL_PAY_API_KEY is not defined" }, { status: 500 })
    }

    // Add required URLs to the payload
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

    // Add webhook URL for callbacks
    if (!payload.webhookUrl) {
      payload.webhookUrl = `${siteUrl}/api/webhook`
      console.log(`Added webhook URL: ${payload.webhookUrl}`)
    }

    // Add success URL for redirects after successful payment
    if (!payload.successUrl) {
      payload.successUrl = `${siteUrl}/payment/success?orderId=${payload.metadata?.orderId || ""}`
      console.log(`Added success URL: ${payload.successUrl}`)
    }

    // Add cancel URL for redirects after cancelled payment
    if (!payload.cancelUrl) {
      payload.cancelUrl = `${siteUrl}/payment/cancel?orderId=${payload.metadata?.orderId || ""}`
      console.log(`Added cancel URL: ${payload.cancelUrl}`)
    }

    // Ensure products array is properly formatted
    if (payload.products && Array.isArray(payload.products)) {
      payload.products = payload.products.map((product) => ({
        ...product,
        price: Number(product.price),
        quantity: Number(product.quantity || 1),
        productId: String(product.productId),
      }))
    }

    console.log("Final payload before encryption:", JSON.stringify(payload, null, 2))
    console.log("Encrypting payload...")

    // Encrypt the payload
    const encryptedPayload = encryptDirectly(payload, secretKey)
    console.log("Payload encrypted successfully")

    // Determine API URL
    const apiUrl = process.env.NEXT_PUBLIC_DLPAY_API_URL || "https://pay.api.dreamslab.dev"
    console.log("Using DL PAY API URL:", apiUrl)

    // Send request to DL PAY API with API key in headers
    console.log("Sending request to DL PAY API...")
    try {
      const response = await axios.post(
        `${apiUrl}/api/checkout`,
        { payload: encryptedPayload },
        {
          headers: {
            "Content-Type": "application/json",
            "X-API-Key": apiKey,
          },
          timeout: 15000, // 15 second timeout
        },
      )

      console.log("DL PAY API response:", JSON.stringify(response.data, null, 2))

      // Return success response with complete data
      return NextResponse.json({
        success: true,
        message: "DL PAY checkout created successfully",
        redirectUrl: response.data.data.redirectUrl,
        transactionId: response.data.data.transactionId,
        amount: response.data.data.amount,
        currency: response.data.data.currency,
        createdAt: response.data.data.createdAt,
      })
    } catch (apiError) {
      console.error("DL PAY API error:", apiError)

      // Detailed API error response
      return NextResponse.json(
        {
          success: false,
          error: apiError.message,
          response: apiError.response
            ? {
                status: apiError.response.status,
                data: apiError.response.data,
              }
            : "No response data",
          apiUrl: apiUrl,
          apiKeyProvided: !!apiKey,
          secretKeyProvided: !!secretKey,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("DL PAY checkout error:", error)

    // Detailed error response
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        secretKeyExists: !!process.env.DL_PAY_SECRET_KEY,
        secretKeyLength: process.env.DL_PAY_SECRET_KEY ? process.env.DL_PAY_SECRET_KEY.length : 0,
        apiKeyExists: !!process.env.DL_PAY_API_KEY,
      },
      { status: 500 },
    )
  }
}
