import { NextResponse } from "next/server"
import { createCheckout } from "@/services/paymentService"
import dbConnect from "@/lib/dbConnect"
import Order from "@/db/Order"
import Game from "@/db/Game"

export async function POST(request) {
  try {
    console.log("Received checkout request")
    await dbConnect()
    const body = await request.json()
    console.log("Request body:", JSON.stringify(body, null, 2))

    // Validate the required parameters
    const { gameId, packageId, playerInfo } = body
    if (!gameId || !packageId || !playerInfo) {
      console.error("Missing required parameters")
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    // Validate player info has userId
    if (!playerInfo.userId) {
      console.error("Missing player user ID")
      return NextResponse.json({ error: "Missing player user ID" }, { status: 400 })
    }

    // Get game details
    console.log(`Fetching game with ID: ${gameId}`)
    const game = await Game.findById(gameId)
    if (!game) {
      console.error(`Game not found with ID: ${gameId}`)
      return NextResponse.json({ error: "Game not found" }, { status: 404 })
    }

    // Find the selected package
    console.log(`Looking for package with ID: ${packageId}`)
    const selectedPackage = game.packages.find((pkg) => pkg._id.toString() === packageId)
    if (!selectedPackage) {
      console.error(`Package not found with ID: ${packageId}`)
      return NextResponse.json({ error: "Package not found" }, { status: 404 })
    }

    console.log("Found package:", JSON.stringify(selectedPackage, null, 2))

    // Check if environment variables are set
    if (!process.env.NEXT_PUBLIC_SITE_URL) {
      console.error("NEXT_PUBLIC_SITE_URL environment variable is not set")
      return NextResponse.json({ error: "Missing site URL configuration" }, { status: 500 })
    }

    if (!process.env.DL_PAY_SECRET_KEY) {
      console.error("DL_PAY_SECRET_KEY environment variable is not set")
      return NextResponse.json({ error: "Missing payment service configuration" }, { status: 500 })
    }

    if (!process.env.DL_PAY_API_KEY) {
      console.error("DL_PAY_API_KEY environment variable is not set")
      return NextResponse.json({ error: "Missing payment service API key" }, { status: 500 })
    }

    // Create payment data for DL PAY
    const paymentData = {
      amount: selectedPackage.price,
      currency: "USD", // Adjust based on your needs
      metadata: {
        gameId: gameId,
        packageId: packageId,
        packageName: selectedPackage.name,
        packageImage: selectedPackage.image || game.image, // Use package image or fallback to game image
        userId: playerInfo.userId,
        serverId: playerInfo.serverId || "",
        gameName: game.name,
        success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/payment/success?sessionId={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/payment/cancel`,
      },
    }

    console.log("Payment data prepared:", JSON.stringify(paymentData, null, 2))

    // Create checkout session using the payment service
    console.log("Calling createCheckout...")
    const checkoutSession = await createCheckout(paymentData)
    console.log("Checkout session created:", JSON.stringify(checkoutSession, null, 2))

    // Generate a unique order ID
    const orderId = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    console.log(`Generated order ID: ${orderId}`)

    // Create an order record in pending status
    const order = new Order({
      orderId: orderId,
      gameId: gameId,
      gameName: game.name,
      packageId: packageId,
      packageName: selectedPackage.name,
      amount: selectedPackage.price,
      price: selectedPackage.price,
      currency: "USD",
      userId: playerInfo.userId,
      serverId: playerInfo.serverId || "",
      paymentMethod: "DL_PAY",
      paymentStatus: "pending",
      transactionId: checkoutSession.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    console.log("Saving order to database...")
    await order.save()
    console.log("Order saved successfully")

    const response = {
      success: true,
      checkoutUrl: checkoutSession.checkout_url,
      sessionId: checkoutSession.id,
      orderId: order.orderId,
    }

    console.log("Sending response:", JSON.stringify(response, null, 2))
    return NextResponse.json(response)
  } catch (error) {
    console.error("Checkout error:", error)
    return NextResponse.json(
      {
        error: "Failed to create checkout session",
        details: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
