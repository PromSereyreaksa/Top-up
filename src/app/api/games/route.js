import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Game from "@/db/Game"

// GET all games
export async function GET() {
  try {
    console.log("API: GET /api/games - Connecting to database...")
    await dbConnect()

    console.log("API: GET /api/games - Fetching games...")
    const games = await Game.find({}).lean()

    console.log(`API: GET /api/games - Found ${games.length} games`)
    return NextResponse.json(games)
  } catch (error) {
    console.error("API: GET /api/games - Error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST create new game
export async function POST(request) {
  try {
    console.log("API: POST /api/games - Connecting to database...")
    await dbConnect()

    console.log("API: POST /api/games - Parsing request body...")
    const body = await request.json()

    console.log("API: POST /api/games - Creating new game:", body.id)
    const game = new Game({
      id: body.id,
      name: body.name,
      image: body.image,
      discount: body.discount,
      description: body.description,
      featured: body.featured || false,
    })

    const newGame = await game.save()
    console.log("API: POST /api/games - Game created successfully:", newGame.id)

    return NextResponse.json(newGame, { status: 201 })
  } catch (error) {
    console.error("API: POST /api/games - Error:", error)

    // Handle duplicate key error specifically
    if (error.code === 11000) {
      return NextResponse.json({ error: `Game with ID "${error.keyValue.id}" already exists` }, { status: 400 })
    }

    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
