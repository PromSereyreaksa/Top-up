import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Game from "@/db/Game"

// POST seed initial data
export async function POST() {
  try {
    console.log("API: POST /api/seed - Connecting to database...")
    await dbConnect()

    console.log("API: POST /api/seed - Checking if games exist...")
    const gamesCount = await Game.countDocuments()

    if (gamesCount > 0) {
      console.log(`API: POST /api/seed - Database already has ${gamesCount} games, skipping seed`)
      return NextResponse.json({
        message: `Database already seeded with ${gamesCount} games`,
      })
    }

    console.log("API: POST /api/seed - Seeding initial games data...")
    const initialGames = [
      {
        id: "mobile-legends",
        name: "Mobile Legends",
        image: "/images/mobile-legends.jpg",
        discount: "10% OFF",
        description: "Get bonus diamonds on all packages",
        featured: true,
      },
      {
        id: "free-fire",
        name: "Free Fire",
        image: "/images/free-fire.jpg",
      },
      {
        id: "pubg-mobile",
        name: "PUBG Mobile",
        image: "/images/pubg-mobile.jpg",
        discount: "15% OFF",
        description: "Special weekend offer on UC purchases",
        featured: true,
      },
      {
        id: "call-of-duty-mobile",
        name: "Call of Duty Mobile",
        image: "/images/call-of-duty-mobile.jpg",
        discount: "20% OFF",
        description: "Limited time promotion on CP packages",
        featured: true,
      },
      {
        id: "clash-of-clans",
        name: "Clash of Clans",
        image: "/images/clash-of-clans.jpg",
      },
      {
        id: "magic-chess",
        name: "Magic Chess",
        image: "/images/magic-chess.jpg",
      },
      {
        id: "league-of-legends",
        name: "League of Legends",
        image: "/images/league-of-legends.jpg",
      },
    ]

    const result = await Game.insertMany(initialGames)
    console.log(`API: POST /api/seed - Successfully seeded ${result.length} games`)

    return NextResponse.json({
      message: `Database seeded with ${result.length} games`,
      games: result,
    })
  } catch (error) {
    console.error("API: POST /api/seed - Error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
