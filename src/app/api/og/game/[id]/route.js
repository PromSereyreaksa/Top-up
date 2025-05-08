import { ImageResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Game from "@/db/Game"

export const runtime = "edge"

export async function GET(request, { params }) {
  try {
    const { id } = params

    // Connect to database
    await dbConnect()

    // Get game data
    const game = await Game.findOne({ id }).lean()

    if (!game) {
      return new Response("Game not found", { status: 404 })
    }

    // Create OG image
    return new ImageResponse(
      <div
        style={{
          display: "flex",
          fontSize: 60,
          color: "white",
          background: "linear-gradient(to right, #1a1a2e, #16213e)",
          width: "100%",
          height: "100%",
          padding: "50px 200px",
          textAlign: "center",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <img
            src={game.image || "/placeholder.svg"}
            alt={game.name}
            width={200}
            height={200}
            style={{ borderRadius: "15px", marginBottom: "30px" }}
          />
          <div style={{ fontSize: "60px", fontWeight: "bold", marginBottom: "10px" }}>{game.name}</div>
          <div style={{ fontSize: "30px", color: "#4cc9f0" }}>Top up now at Coppsary Bok Luy</div>
          {game.discount && (
            <div
              style={{
                fontSize: "40px",
                color: "white",
                background: "linear-gradient(to right, #ff4e50, #f9d423)",
                padding: "10px 30px",
                borderRadius: "15px",
                marginTop: "30px",
              }}
            >
              {game.discount}
            </div>
          )}
        </div>
      </div>,
      {
        width: 1200,
        height: 630,
      },
    )
  } catch (error) {
    console.error("Error generating OG image:", error)
    return new Response("Error generating image", { status: 500 })
  }
}
