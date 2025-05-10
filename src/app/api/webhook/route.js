import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Order from "@/db/Order"
import { verifyPayment } from "@/services/paymentService"
import { io } from "@/lib/socket"
import { decryptPayload } from "@/lib/crypto"
import { emitOrderUpdate } from "@/lib/socket"

// This is a webhook handler that will be called by the payment service
export async function POST(request) {
  try {
    console.log("API: POST /api/webhook - Received webhook")
    await dbConnect()

    // Get the request body
    let body
    try {
      body = await request.json()
      console.log("API: Webhook payload:", JSON.stringify(body, null, 2))
    } catch (error) {
      console.error("API: Failed to parse webhook body:", error)
      return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 })
    }

    // Verify the webhook payload
    if (!body.payload) {
      // Existing webhook logic
      const signature = request.headers.get("x-signature")
      console.log("API: Processing standard webhook (no payload)")

      // Verify webhook signature (implementation depends on the payment service)
      // This is a placeholder for verification logic
      // const isValid = verifySignature(body, signature, process.env.WEBHOOK_SECRET);
      // if (!isValid) {
      //   return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      // }

      try {
        // Extract payment information from the webhook
        const { id: paymentId, status, metadata } = body
        console.log(`API: Payment ID: ${paymentId}, Status: ${status}`)

        // Find the corresponding order
        let order = await Order.findOne({ paymentId })

        // If not found by paymentId, try by transactionId
        if (!order) {
          order = await Order.findOne({ transactionId: paymentId })
        }

        if (!order) {
          console.error(`API: Order not found for payment ID: ${paymentId}`)
          return NextResponse.json({ error: "Order not found" }, { status: 404 })
        }

        console.log(`API: Found order: ${order.orderId}`)

        // If payment is successful, update order status
        if (status === "completed" || status === "SUCCESS") {
          // Double-check payment status with the API for additional security
          const paymentDetails = await verifyPayment(paymentId)
          console.log(`API: Verified payment status: ${paymentDetails.status}`)

          if (paymentDetails.status === "completed" || paymentDetails.status === "SUCCESS") {
            order.status = "completed"
            order.paymentStatus = "paid"
            await order.save()
            console.log(`API: Order ${order.orderId} marked as completed`)

            // Emit socket event to notify clients (if applicable)
            if (io) {
              io.emit("payment:completed", {
                orderId: order._id,
                gameId: order.game,
                userId: order.userId,
                serverId: order.serverId,
              })
            }

            // Here you would implement game-specific logic like:
            // - Adding credits to the user's account
            // - Triggering game-specific API calls
            // - Sending confirmation emails, etc.
          }
        } else if (status === "failed" || status === "FAILED") {
          order.status = "failed"
          order.paymentStatus = "failed"
          await order.save()
          console.log(`API: Order ${order.orderId} marked as failed`)

          // Notify via socket if needed
          if (io) {
            io.emit("payment:failed", { orderId: order._id })
          }
        } else if (status === "expired" || status === "EXPIRED") {
          order.status = "expired"
          order.paymentStatus = "expired"
          await order.save()
          console.log(`API: Order ${order.orderId} marked as expired`)

          // Notify via socket if needed
          if (io) {
            io.emit("payment:expired", { orderId: order._id })
          }
        }

        return NextResponse.json({ success: true })
      } catch (error) {
        console.error("API: Webhook error:", error)
        return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
      }
    }

    // Decrypt the payload
    console.log("API: Processing DL PAY webhook with encrypted payload")
    const SECRET_KEY = process.env.DL_PAY_SECRET_KEY

    if (!SECRET_KEY) {
      console.error("API: DL_PAY_SECRET_KEY is not defined")
      return NextResponse.json({ error: "Missing secret key" }, { status: 500 })
    }

    try {
      const decryptedPayload = decryptPayload(body.payload, SECRET_KEY)
      console.log("API: Decrypted payload:", JSON.stringify(decryptedPayload, null, 2))

      // Extract transaction details
      const { transactionId, status, amount, currency, metadata, products } = decryptedPayload
      console.log(`API: Transaction ID: ${transactionId}, Status: ${status}`)

      // Find the order by transaction ID
      let order = await Order.findOne({ transactionId })

      // If not found by transactionId, try by orderId (if metadata contains it)
      if (!order && metadata && metadata.orderId) {
        order = await Order.findOne({
          $or: [{ _id: metadata.orderId }, { orderId: metadata.orderId }],
        })
      }

      if (!order) {
        console.error(`API: Order not found for transaction ID: ${transactionId}`)

        // Create a log of unmatched transactions for debugging
        console.log(`API: Creating log of unmatched transaction: ${transactionId}`)

        // Return success to avoid repeated webhook calls
        return NextResponse.json({
          success: false,
          message: "Order not found, but webhook acknowledged",
          transactionId,
        })
      }

      console.log(`API: Found order: ${order.orderId}`)

      // Update order status based on payment status
      if (status === "SUCCESS") {
        order.paymentStatus = "paid"
        order.status = "completed"
        order.fulfillmentStatus = "pending" // Ready for fulfillment
        console.log(`API: Order ${order.orderId} marked as paid`)
      } else if (status === "FAILED") {
        order.paymentStatus = "failed"
        order.status = "failed"
        console.log(`API: Order ${order.orderId} marked as failed`)
      } else if (status === "EXPIRED") {
        order.paymentStatus = "expired"
        order.status = "expired"
        console.log(`API: Order ${order.orderId} marked as expired`)
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

      // Emit socket event for real-time updates
      try {
        emitOrderUpdate(order)
      } catch (socketError) {
        console.error("Socket emission error:", socketError)
      }

      return NextResponse.json({ success: true })
    } catch (error) {
      console.error("API: Decryption error:", error)
      return NextResponse.json(
        {
          error: "Failed to decrypt payload",
          message: error.message,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("API: Webhook error:", error)
    return NextResponse.json({ error: "Failed to process webhook" }, { status: 500 })
  }
}
