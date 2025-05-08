import { NextResponse } from "next/server"
import { getDashboardStats } from "@/lib/stats"

export async function GET() {
  try {
    const stats = await getDashboardStats()
    return NextResponse.json(stats)
  } catch (error) {
    console.error("API: GET /api/dashboard/stats - Error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
