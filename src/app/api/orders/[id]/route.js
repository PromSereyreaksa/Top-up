import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Order from "@/db/Order"
import { emitOrderUpdate, emitDashboardUpdate } from "@/lib/socket"
import { getDashboardStats } from "@/lib/stats"

// GET single order
export async function GET(request, { params }) {
  try {
    await dbConnect()

    // Properly await the params object
    const id = params.id
    console.log(`API: GET /api/orders/${id} - Looking for order`)

    // Try to find by orderId first
    let order = await Order.findOne({ orderId: id }).lean()

    // If not found, try by _id (MongoDB ObjectId)
    if (!order) {
      try {
        order = await Order.findById(id).lean()
      } catch (err) {
        // Invalid ObjectId format, ignore this error
        console.log(`API: Invalid ObjectId format: ${id}`)
      }
    }

    // If still not found, try by transactionId
    if (!order) {
      order = await Order.findOne({ transactionId: id }).lean()
    }

    if (!order) {
      console.error(`API: Order not found with ID: ${id}`)
      return NextResponse.json({ message: "Order not found" }, { status: 404 })
    }

    console.log(`API: Found order: ${order.orderId}`)
    return NextResponse.json(order)
  } catch (error) {
    console.error(`API: GET /api/orders/${params.id} - Error:`, error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT update order
export async function PUT(request, { params }) {
  try {
    await dbConnect()

    // Properly await the params object
    const id = params.id
    const body = await request.json()

    console.log(`API: PUT /api/orders/${id} - Updating order with:`, JSON.stringify(body, null, 2))

    // Update the order
    body.updatedAt = Date.now()

    // Try to find and update by orderId first
    let order = await Order.findOneAndUpdate({ orderId: id }, body, { new: true, runValidators: true })

    // If not found, try by _id (MongoDB ObjectId)
    if (!order) {
      try {
        order = await Order.findByIdAndUpdate(id, body, { new: true, runValidators: true })
      } catch (err) {
        // Invalid ObjectId format, ignore this error
        console.log(`API: Invalid ObjectId format: ${id}`)
      }
    }

    // If still not found, try by transactionId
    if (!order) {
      order = await Order.findOneAndUpdate({ transactionId: id }, body, { new: true, runValidators: true })
    }

    if (!order) {
      console.error(`API: Order not found with ID: ${id}`)
      return NextResponse.json({ message: "Order not found" }, { status: 404 })
    }

    console.log(`API: Order ${order.orderId} updated successfully`)

    try {
      // Emit socket event for real-time updates
      emitOrderUpdate(order)

      // Get updated dashboard stats and emit them
      const stats = await getDashboardStats()
      emitDashboardUpdate(stats)
    } catch (socketError) {
      // Log socket error but don't fail the request
      console.error("Socket emission error:", socketError)
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error(`API: PUT /api/orders/${params.id} - Error:`, error)
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
