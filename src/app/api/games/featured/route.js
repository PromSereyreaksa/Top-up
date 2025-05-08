import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Game from "@/db/Game"

// GET featured games
export async function GET() {
  try {
    console.log("API: GET /api/games/featured - Connecting to database...")
    await dbConnect()

    console.log("API: GET /api/games/featured - Fetching featured games...")
    const featuredGames = await Game.find({ featured: true }).lean()

    console.log(`API: GET /api/games/featured - Found ${featuredGames.length} featured games`)
    return NextResponse.json(featuredGames)
  } catch (error) {
    console.error("API: GET /api/games/featured - Error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
