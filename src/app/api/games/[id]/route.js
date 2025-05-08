import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Game from "@/db/Game"

// GET single game
export async function GET(request, { params }) {
  try {
    console.log(`API: GET /api/games/${params.id} - Connecting to database...`)
    await dbConnect()

    const { id } = params
    console.log(`API: GET /api/games/${id} - Fetching game...`)

    const game = await Game.findOne({ id }).lean()

    if (!game) {
      console.log(`API: GET /api/games/${id} - Game not found`)
      return NextResponse.json({ message: "Game not found" }, { status: 404 })
    }

    console.log(`API: GET /api/games/${id} - Game found`)
    return NextResponse.json(game)
  } catch (error) {
    console.error(`API: GET /api/games/${params.id} - Error:`, error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT update game
export async function PUT(request, { params }) {
  try {
    console.log(`API: PUT /api/games/${params.id} - Connecting to database...`)
    await dbConnect()

    const { id } = params
    console.log(`API: PUT /api/games/${id} - Parsing request body...`)
    const body = await request.json()

    body.updatedAt = Date.now()
    console.log(`API: PUT /api/games/${id} - Updating game...`)

    const updatedGame = await Game.findOneAndUpdate({ id }, body, { new: true, runValidators: true })

    if (!updatedGame) {
      console.log(`API: PUT /api/games/${id} - Game not found`)
      return NextResponse.json({ message: "Game not found" }, { status: 404 })
    }

    console.log(`API: PUT /api/games/${id} - Game updated successfully`)
    return NextResponse.json(updatedGame)
  } catch (error) {
    console.error(`API: PUT /api/games/${params.id} - Error:`, error)
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}

// DELETE game
export async function DELETE(request, { params }) {
  try {
    console.log(`API: DELETE /api/games/${params.id} - Connecting to database...`)
    await dbConnect()

    const { id } = params
    console.log(`API: DELETE /api/games/${id} - Deleting game...`)

    const deletedGame = await Game.findOneAndDelete({ id })

    if (!deletedGame) {
      console.log(`API: DELETE /api/games/${id} - Game not found`)
      return NextResponse.json({ message: "Game not found" }, { status: 404 })
    }

    console.log(`API: DELETE /api/games/${id} - Game deleted successfully`)
    return NextResponse.json({ message: "Game deleted" })
  } catch (error) {
    console.error(`API: DELETE /api/games/${params.id} - Error:`, error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
