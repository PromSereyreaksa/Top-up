import axios from "axios"
import { encryptPayload } from "../lib/crypto"
import "dotenv/config"

/**
 * Creates a checkout session with DL PAY
 * @param {Object} orderData - Order data from your application
 * @returns {Promise<Object>} - DL PAY checkout response
 */
export async function createCheckout(orderData) {
  try {
    console.log("PaymentService: Creating checkout with order data:", JSON.stringify(orderData, null, 2))

    // Get the secret key and API key from environment variables
    const secretKey = process.env.DL_PAY_SECRET_KEY
    const apiKey = process.env.DL_PAY_API_KEY

    // Log environment variable status (without exposing values)
    console.log("PaymentService: Environment variables check:")
    console.log("DL_PAY_SECRET_KEY exists:", !!secretKey)
    console.log("DL_PAY_API_KEY exists:", !!apiKey)

    if (!secretKey) {
      throw new Error("DL_PAY_SECRET_KEY is not defined in environment variables")
    }

    if (!apiKey) {
      throw new Error("DL_PAY_API_KEY is not defined in environment variables")
    }

    // Format the payload according to DL PAY requirements
    const payload = {
      products: [
        {
          name: orderData.packageName || "Game Package",
          image: orderData.image || undefined,
          price: orderData.price,
          productId: orderData.packageId || `pkg-${Date.now()}`,
          quantity: 1,
        },
      ],
      currency: orderData.currency || "USD",
      metadata: orderData.metadata || {},
    }

    console.log("PaymentService: Formatted payload:", JSON.stringify(payload, null, 2))

    // Encrypt the payload
    console.log("PaymentService: Encrypting payload...")
    const encryptedPayload = encryptPayload(payload, secretKey)
    console.log("PaymentService: Payload encrypted successfully")

    // Send the request to DL PAY with API key in headers
    console.log("PaymentService: Sending request to DL PAY API...")
    const response = await axios.post(
      "https://pay.api.dreamslab.dev/api/checkout",
      { payload: encryptedPayload },
      {
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": apiKey,
        },
        timeout: 15000, // 15 second timeout
      },
    )

    console.log("PaymentService: DL PAY API response:", JSON.stringify(response.data, null, 2))

    // Return the checkout data
    return {
      success: true,
      id: response.data.data.transactionId,
      checkout_url: response.data.data.redirectUrl,
      amount: response.data.data.amount,
      currency: response.data.data.currency,
      createdAt: response.data.data.createdAt,
    }
  } catch (error) {
    console.error("PaymentService: DL PAY checkout error:", error)

    // Provide detailed error information
    const errorMessage = error.response?.data?.message || error.message || "Failed to create DL PAY checkout"
    const errorDetails = {
      message: errorMessage,
      response: error.response
        ? {
            status: error.response.status,
            data: error.response.data,
          }
        : undefined,
      request: error.request ? "Request was made but no response received" : undefined,
    }

    console.error("PaymentService: Error details:", JSON.stringify(errorDetails, null, 2))
    throw new Error(errorMessage)
  }
}

/**
 * Verifies a payment with DL PAY
 * @param {string} sessionId - The session ID of the payment
 * @returns {Promise<Object>} - DL PAY payment details
 */
export async function verifyPayment(sessionId) {
  try {
    console.log(`PaymentService: Verifying payment with session ID: ${sessionId}`)

    const apiKey = process.env.DL_PAY_API_KEY

    if (!apiKey) {
      throw new Error("DL_PAY_API_KEY is not defined in environment variables")
    }

    const response = await axios.get(`https://pay.api.dreamslab.dev/api/transaction/${sessionId}`, {
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": apiKey,
      },
      timeout: 10000, // 10 second timeout
    })

    console.log("PaymentService: Verification response:", JSON.stringify(response.data, null, 2))
    return response.data
  } catch (error) {
    console.error("PaymentService: Error verifying payment:", error)
    throw new Error(`Payment verification failed: ${error.message}`)
  }
}

export default {
  createCheckout,
  verifyPayment,
}
