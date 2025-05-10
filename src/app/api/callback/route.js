import { NextResponse } from "next/server"
import { decryptPayload } from "@/lib/crypto"
import Order from "@/db/Order"
import dbConnect from "@/lib/dbConnect"
import { emitOrderUpdate, emitDashboardUpdate } from "@/lib/socket"

/**
 * Handles DL Pay callback requests
 * This endpoint receives encrypted payloads from DL Pay when a transaction status changes
 */
export async function POST(request) {
  console.log("Callback received from DL Pay")

  try {
    // Get the encrypted payload from the request body
    const body = await request.json()
    const { payload } = body

    if (!payload) {
      console.error("No payload provided in callback")
      return NextResponse.json({ error: "No payload provided" }, { status: 400 })
    }

    // Decrypt the payload
    console.log("Decrypting payload...")
    const decrypted = await decryptPayload(payload)
    console.log("Decrypted payload:", decrypted)

    // Connect to the database
    await dbConnect()

    // Update the order status based on the transaction ID
    const { transactionId, status, amount, products } = decrypted

    // Find the order by transaction ID
    let order = await Order.findOne({ transactionId })

    // If order not found by transactionId, try to find by orderId in metadata if available
    if (!order && decrypted.metadata && decrypted.metadata.orderId) {
      order = await Order.findOne({
        $or: [{ _id: decrypted.metadata.orderId }, { orderId: decrypted.metadata.orderId }],
      })
    }

    if (!order) {
      console.error(`No order found for transaction ID: ${transactionId}`)

      // Create a new order if none exists (fallback)
      const newOrder = new Order({
        transactionId,
        amount,
        paymentStatus: status === "SUCCESS" ? "paid" : "pending",
        items: products.map((product) => ({
          name: product.name,
          price: product.price,
          quantity: product.quantity,
          productId: product.productId,
        })),
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      await newOrder.save()
      console.log(`Created new order for transaction ID: ${transactionId}`)

      // Emit socket updates
      try {
        emitOrderUpdate(newOrder)
        emitDashboardUpdate()
      } catch (socketError) {
        console.error("Socket error:", socketError)
      }

      return NextResponse.json({
        success: true,
        message: "New order created",
        orderId: newOrder._id,
      })
    }

    // Update the existing order
    order.paymentStatus = status === "SUCCESS" ? "paid" : "pending"
    order.transactionId = transactionId
    order.updatedAt = new Date()

    // Add transaction details if not already present
    if (!order.transactionDetails) {
      order.transactionDetails = decrypted
    }

    await order.save()
    console.log(`Order ${order._id} updated with status: ${order.paymentStatus}`)

    // Emit socket updates
    try {
      emitOrderUpdate(order)
      emitDashboardUpdate()
    } catch (socketError) {
      console.error("Socket error:", socketError)
    }

    // Confirm the transaction with DL Pay
    try {
      const confirmResponse = await fetch(
        `${process.env.NEXT_PUBLIC_DLPAY_API_URL}/checkout/${transactionId}/confirm`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-API-Key": process.env.DL_PAY_API_KEY,
          },
        },
      )

      if (!confirmResponse.ok) {
        console.error("Failed to confirm transaction with DL Pay:", await confirmResponse.text())
      } else {
        console.log("Transaction confirmed with DL Pay")
      }
    } catch (confirmError) {
      console.error("Error confirming transaction with DL Pay:", confirmError)
    }

    return NextResponse.json({
      success: true,
      message: "Order updated successfully",
      orderId: order._id,
    })
  } catch (error) {
    console.error("Error processing callback:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// Handle GET requests (for testing)
export async function GET() {
  return NextResponse.json({ message: "Callback endpoint is working" })
}
