import { NextResponse } from "next/server"
import { encryptPayload } from "@/lib/crypto"
import axios from "axios"

export async function GET() {
  try {
    const secretKey = process.env.DL_PAY_SECRET_KEY

    if (!secretKey) {
      return NextResponse.json({ error: "Secret key not found" }, { status: 500 })
    }

    // Simplest possible payload
    const payload = {
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

    console.log("Test payload:", JSON.stringify(payload))

    // Encrypt payload
    const encrypted = encryptPayload(payload, secretKey)

    // Make API request
    const response = await axios.post(
      "https://pay.api.dreamslab.dev/api/checkout",
      { payload: encrypted },
      { headers: { "Content-Type": "application/json" } },
    )

    return NextResponse.json({
      success: true,
      apiResponse: response.data,
    })
  } catch (error) {
    console.error("Test failed:", error)

    // Detailed error information
    const errorInfo = {
      message: error.message,
      stack: error.stack,
      response: error.response
        ? {
            status: error.response.status,
            data: error.response.data,
          }
        : "No response",
      request: error.request ? "Request was made but no response received" : "Request setup failed",
    }

    return NextResponse.json(
      {
        success: false,
        error: errorInfo,
      },
      { status: 500 },
    )
  }
}
