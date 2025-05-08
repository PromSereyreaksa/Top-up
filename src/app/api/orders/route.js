import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Order from "@/db/Order"

// GET all orders with optional filtering
export async function GET(request) {
  try {
    await dbConnect()

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const gameId = searchParams.get("gameId")
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const skip = (page - 1) * limit

    // Build query
    const query = {}
    if (status) query.paymentStatus = status
    if (gameId) query.gameId = gameId

    // Get orders with pagination
    const orders = await Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean()

    // Get total count for pagination
    const total = await Order.countDocuments(query)

    return NextResponse.json({
      orders,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("API: GET /api/orders - Error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST create new order
export async function POST(request) {
  try {
    await dbConnect()

    const body = await request.json()

    // Generate order ID if not provided
    if (!body.orderId) {
      body.orderId = `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`
    }

    const order = new Order(body)
    await order.save()

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error("API: POST /api/orders - Error:", error)
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
