import { NextResponse } from "next/server"
import { decryptPayload } from "@/lib/crypto"
import Order from "@/db/Order"
import dbConnect from "@/lib/dbConnect"

/**
 * Confirms a payment by processing the encrypted payload from DL Pay
 * This endpoint is called when a user is redirected back from the payment page
 */
export async function GET(request) {
  try {
    // Get the encrypted payload from the URL
    const { searchParams } = new URL(request.url)
    const payload = searchParams.get("payload")

    if (!payload) {
      return NextResponse.json({ error: "No payload provided" }, { status: 400 })
    }

    // Decrypt the payload
    const SECRET_KEY = process.env.DL_PAY_SECRET_KEY

    if (!SECRET_KEY) {
      return NextResponse.json({ error: "DL_PAY_SECRET_KEY is not defined" }, { status: 500 })
    }

    const decrypted = decryptPayload(payload, SECRET_KEY)
    console.log("Decrypted confirmation payload:", decrypted)

    // Connect to the database
    await dbConnect()

    // Extract transaction details
    const { transactionId, status, amount, currency, metadata, products } = decrypted

    // Find the order by transaction ID
    let order = await Order.findOne({ transactionId })

    // If not found by transactionId, try by orderId in metadata
    if (!order && metadata && metadata.orderId) {
      order = await Order.findOne({
        $or: [{ _id: metadata.orderId }, { orderId: metadata.orderId }],
      })
    }

    if (!order) {
      console.error(`No order found for transaction ID: ${transactionId}`)

      // Return the decrypted data even if no order is found
      return NextResponse.json({
        success: false,
        message: "Order not found",
        ...decrypted,
      })
    }

    // Update order status based on payment status
    if (status === "SUCCESS") {
      order.paymentStatus = "paid"
      order.status = "completed"
      order.fulfillmentStatus = "pending" // Ready for fulfillment
    } else if (status === "FAILED") {
      order.paymentStatus = "failed"
      order.status = "failed"
    } else if (status === "EXPIRED") {
      order.paymentStatus = "expired"
      order.status = "expired"
    }

    // Update order with products if available
    if (products && products.length > 0) {
      // Map DL Pay products to order items
      const items = products.map((product) => ({
        productId: product.productId,
        name: product.name,
        price: product.price,
        quantity: product.quantity,
        image: product.image,
        itemId: product.id,
      }))

      // Update order items
      order.items = items

      // Update total amount
      order.amount = amount
      order.totalQuantity = products.reduce((sum, product) => sum + product.quantity, 0)
    }

    order.updatedAt = new Date()
    await order.save()

    // Confirm the transaction with DL Pay
    try {
      const confirmResponse = await fetch(
        `${process.env.NEXT_PUBLIC_DLPAY_API_URL || "https://pay.api.dreamslab.dev"}/checkout/${transactionId}/confirm`,
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

    // Return sanitized data for UI
    return NextResponse.json({
      success: true,
      orderId: order.orderId || order._id,
      status: order.status,
      paymentStatus: order.paymentStatus,
      amount: order.amount,
      currency: order.currency || currency,
      items: order.items,
      userId: order.userId,
      serverId: order.serverId,
      gameName: order.gameName,
      packageName: order.packageName,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    })
  } catch (error) {
    console.error("Error processing confirmation:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
