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

    // Make sure to include the imagePublicId field
    const updatedGame = await Game.findOneAndUpdate(
      { id },
      {
        ...body,
        // Ensure these fields are included in the update
        image: body.image,
        imagePublicId: body.imagePublicId,
      },
      { new: true, runValidators: true },
    )

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

    // Get the game first to access its imagePublicId
    const game = await Game.findOne({ id })

    if (!game) {
      console.log(`API: DELETE /api/games/${id} - Game not found`)
      return NextResponse.json({ message: "Game not found" }, { status: 404 })
    }

    // Delete the game from the database
    await Game.deleteOne({ id })

    // If the game has an imagePublicId, we could delete it from Cloudinary here
    // But we'll leave that to a separate cleanup process or manual deletion
    // to avoid errors if the image is already deleted or used elsewhere

    console.log(`API: DELETE /api/games/${id} - Game deleted successfully`)
    return NextResponse.json({
      message: "Game deleted",
      imagePublicId: game.imagePublicId, // Return this so client can delete if needed
    })
  } catch (error) {
    console.error(`API: DELETE /api/games/${params.id} - Error:`, error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
