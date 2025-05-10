import crypto from "crypto"

/**
 * Encrypts a payload using AES-256-GCM
 * @param {Object} payload - The data to encrypt
 * @param {string} secretKey - The secret key (64 character hex string)
 * @returns {string} - Base64 encoded encrypted payload
 */
export function encryptPayload(payload, secretKey) {
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

/**
 * Decrypts a payload using AES-256-GCM
 * @param {string} encryptedPayload - Base64 encoded encrypted payload
 * @param {string} secretKey - The secret key (64 character hex string)
 * @returns {Object} - Decrypted payload as an object
 */
export function decryptPayload(encryptedPayload, secretKey) {
  try {
    // Convert base64 to buffer
    const buffer = Buffer.from(encryptedPayload, "base64")

    // Extract IV (first 12 bytes)
    const iv = buffer.slice(0, 12)

    // Extract auth tag (last 16 bytes)
    const tag = buffer.slice(buffer.length - 16)

    // Extract encrypted data (everything in between)
    const encrypted = buffer.slice(12, buffer.length - 16)

    // Create decipher
    const decipher = crypto.createDecipheriv("aes-256-gcm", Buffer.from(secretKey, "hex"), iv)

    // Set auth tag
    decipher.setAuthTag(tag)

    // Decrypt the data
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()])

    // Parse JSON
    return JSON.parse(decrypted.toString("utf8"))
  } catch (error) {
    console.error("Decryption error:", error)
    throw new Error(`Decryption failed: ${error.message}`)
  }
}
