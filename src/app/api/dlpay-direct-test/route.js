import { NextResponse } from "next/server"
import crypto from "crypto"
import axios from "axios"

// Standalone encryption function
function encryptDirectly(payload, secretKey) {
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
}

export async function GET() {
  try {
    // 1. Get the secret key and API key
    const secretKey = process.env.DL_PAY_SECRET_KEY
    const apiKey = process.env.DL_PAY_API_KEY

    // Validate secret key
    if (!secretKey) {
      return NextResponse.json({ error: "DL_PAY_SECRET_KEY is not defined" }, { status: 500 })
    }

    if (secretKey.length !== 64) {
      return NextResponse.json(
        {
          error: "Invalid secret key length",
          length: secretKey.length,
          expected: 64,
          preview: `${secretKey.substring(0, 4)}...${secretKey.substring(secretKey.length - 4)}`,
        },
        { status: 500 },
      )
    }

    // Validate API key
    if (!apiKey) {
      return NextResponse.json({ error: "DL_PAY_API_KEY is not defined" }, { status: 500 })
    }

    // 2. Create a minimal test payload
    const testPayload = {
      products: [
        {
          name: "Test Product",
          price: 1.0,
          productId: "test-" + Date.now(),
          quantity: 1,
        },
      ],
      currency: "USD",
    }

    // 3. Encrypt the payload
    const encryptedPayload = encryptDirectly(testPayload, secretKey)

    // 4. Send request to DL PAY API with API key in headers
    const response = await axios.post(
      "https://pay.api.dreamslab.dev/api/checkout",
      { payload: encryptedPayload },
      {
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": apiKey,
        },
        timeout: 10000, // 10 second timeout
      },
    )

    // Log the full response for debugging
    console.log("DL PAY API full response:", JSON.stringify(response.data, null, 2))

    // 5. Return success response with complete data
    return NextResponse.json({
      success: true,
      message: "DL PAY checkout created successfully",
      data: response.data,
      redirectUrl: response.data.data.redirectUrl,
      transactionId: response.data.data.transactionId,
      fullResponse: response.data,
    })
  } catch (error) {
    console.error("DL PAY direct test error:", error)

    // Detailed error response
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        response: error.response
          ? {
              status: error.response.status,
              data: error.response.data,
            }
          : "No response data",
        secretKeyExists: !!process.env.DL_PAY_SECRET_KEY,
        secretKeyLength: process.env.DL_PAY_SECRET_KEY ? process.env.DL_PAY_SECRET_KEY.length : 0,
        apiKeyExists: !!process.env.DL_PAY_API_KEY,
      },
      { status: 500 },
    )
  }
}
