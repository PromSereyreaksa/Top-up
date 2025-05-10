import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    message: "DL Pay test endpoint is working",
    timestamp: new Date().toISOString(),
  })
}

export async function POST(request) {
  try {
    const body = await request.json()

    // Log the request for debugging
    console.log("Test DL Pay request:", JSON.stringify(body, null, 2))

    // Simulate a successful DL Pay response
    return NextResponse.json({
      success: true,
      data: {
        redirectUrl: "https://pay.dreamslab.dev/checkout/test-transaction",
        transactionId: "test-" + Math.random().toString(36).substring(2, 15),
        amount: body.payload?.amount || 10,
        currency: body.payload?.currency || "USD",
        createdAt: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("Test DL Pay error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
