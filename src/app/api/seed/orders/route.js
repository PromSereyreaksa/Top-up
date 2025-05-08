import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Order from "@/db/Order"
import Game from "@/db/Game"

// POST seed initial order data
export async function POST() {
  try {
    console.log("API: POST /api/seed/orders - Connecting to database...")
    await dbConnect()

    console.log("API: POST /api/seed/orders - Checking if orders exist...")
    const ordersCount = await Order.countDocuments()

    if (ordersCount > 0) {
      console.log(`API: POST /api/seed/orders - Database already has ${ordersCount} orders, skipping seed`)
      return NextResponse.json({
        message: `Database already seeded with ${ordersCount} orders`,
      })
    }

    // Get games from database to use real game IDs
    const games = await Game.find().lean()

    if (games.length === 0) {
      return NextResponse.json(
        {
          message: "No games found in database. Please seed games first.",
        },
        { status: 400 },
      )
    }

    console.log("API: POST /api/seed/orders - Seeding initial orders data...")

    // Generate random orders
    const orders = []
    const paymentMethods = ["aba", "aceleda", "wing"]
    const paymentStatuses = ["pending", "paid", "failed"]
    const fulfillmentStatuses = ["pending", "delivered", "failed"]

    // Create 50 random orders
    for (let i = 1; i <= 50; i++) {
      // Pick a random game
      const game = games[Math.floor(Math.random() * games.length)]

      // Generate random package
      const packageAmount = [50, 100, 310, 520, 1060, 2180][Math.floor(Math.random() * 6)]
      const packagePrice = packageAmount * 0.05

      // Generate random dates within the last 30 days
      const date = new Date()
      date.setDate(date.getDate() - Math.floor(Math.random() * 30))

      // Generate random order
      const order = {
        orderId: `ORD${Date.now()}${i}`,
        gameId: game.id,
        gameName: game.name,
        packageId: `pkg-${packageAmount}`,
        packageName: `${packageAmount} Diamonds`,
        amount: packageAmount,
        price: packagePrice,
        currency: "USD",
        userId: `user${Math.floor(Math.random() * 10000)}`,
        serverId: Math.random() > 0.5 ? `server${Math.floor(Math.random() * 100)}` : "",
        paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
        paymentStatus: paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)],
        fulfillmentStatus: fulfillmentStatuses[Math.floor(Math.random() * fulfillmentStatuses.length)],
        transactionId: `TXN${Date.now()}${i}`,
        createdAt: date,
        updatedAt: date,
      }

      orders.push(order)
    }

    const result = await Order.insertMany(orders)
    console.log(`API: POST /api/seed/orders - Successfully seeded ${result.length} orders`)

    return NextResponse.json({
      message: `Database seeded with ${result.length} orders`,
      orders: result.length,
    })
  } catch (error) {
    console.error("API: POST /api/seed/orders - Error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
