// A utility script to test DL PAY integration
const { encryptPayload, decryptPayload } = require("./crypto")

// Test function to verify encryption/decryption
function testEncryptionDecryption() {
  try {
    console.log("Testing encryption and decryption...")

    // Get secret key from environment
    const secretKey = process.env.DL_PAY_SECRET_KEY
    if (!secretKey) {
      console.error("DL_PAY_SECRET_KEY is not defined in environment variables")
      return false
    }

    // Create a test payload
    const testPayload = {
      products: [
        {
          name: "Test Product",
          price: 10.99,
          productId: "test-123",
          quantity: 1,
        },
      ],
      currency: "USD",
    }

    console.log("Original payload:", JSON.stringify(testPayload, null, 2))

    // Encrypt the payload
    const encrypted = encryptPayload(testPayload, secretKey)
    console.log("Encrypted payload:", encrypted)

    // Decrypt the payload
    const decrypted = decryptPayload(encrypted, secretKey)
    console.log("Decrypted payload:", JSON.stringify(decrypted, null, 2))

    // Verify the decrypted payload matches the original
    const isMatch = JSON.stringify(testPayload) === JSON.stringify(decrypted)
    console.log("Payloads match:", isMatch)

    return isMatch
  } catch (error) {
    console.error("Test failed:", error)
    return false
  }
}

// Test function to verify API connection
async function testApiConnection() {
  try {
    const axios = require("axios")

    console.log("Testing API connection...")

    // Make a simple GET request to check if the API is reachable
    const response = await axios.get("https://pay.doc.dreamslab.dev/api/health")

    console.log("API response:", response.status, response.data)

    return response.status === 200
  } catch (error) {
    console.error("API connection test failed:", error)
    return false
  }
}

// Export the test functions
module.exports = {
  testEncryptionDecryption,
  testApiConnection,
}
