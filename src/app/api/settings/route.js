import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import SiteSetting from "@/db/SiteSetting"

// GET all settings or specific setting
export async function GET(request) {
  try {
    await dbConnect()

    const { searchParams } = new URL(request.url)
    const key = searchParams.get("key")

    if (key) {
      // Get specific setting
      const setting = await SiteSetting.findOne({ key }).lean()

      if (!setting) {
        return NextResponse.json({ message: "Setting not found" }, { status: 404 })
      }

      return NextResponse.json(setting)
    } else {
      // Get all settings
      const settings = await SiteSetting.find({}).lean()
      return NextResponse.json(settings)
    }
  } catch (error) {
    console.error("API: GET /api/settings - Error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST create or update setting
export async function POST(request) {
  try {
    await dbConnect()

    const body = await request.json()

    if (!body.key || body.value === undefined) {
      return NextResponse.json({ error: "Key and value are required" }, { status: 400 })
    }

    // Update or create setting
    const setting = await SiteSetting.findOneAndUpdate(
      { key: body.key },
      {
        value: body.value,
        type: body.type || "text",
        updatedAt: Date.now(),
      },
      { new: true, upsert: true },
    )

    return NextResponse.json(setting)
  } catch (error) {
    console.error("API: POST /api/settings - Error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
