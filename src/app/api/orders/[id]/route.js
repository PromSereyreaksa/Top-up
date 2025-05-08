import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Order from "@/db/Order"
import { emitOrderUpdate, emitDashboardUpdate } from "@/lib/socket"
import { getDashboardStats } from "@/lib/stats"

// GET single order
export async function GET(request, { params }) {
  try {
    await dbConnect()

    const { id } = params
    const order = await Order.findOne({ orderId: id }).lean()

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 })
    }

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

    const { id } = params
    const body = await request.json()

    // Update the order
    body.updatedAt = Date.now()
    const order = await Order.findOneAndUpdate({ orderId: id }, body, { new: true, runValidators: true })

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 })
    }

    // Emit socket event for real-time updates
    emitOrderUpdate(order)

    // Get updated dashboard stats and emit them
    const stats = await getDashboardStats()
    emitDashboardUpdate(stats)

    return NextResponse.json(order)
  } catch (error) {
    console.error(`API: PUT /api/orders/${params.id} - Error:`, error)
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
