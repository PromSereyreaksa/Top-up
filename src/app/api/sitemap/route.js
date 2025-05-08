import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Game from "@/db/Game"

export async function GET() {
  try {
    await dbConnect()
    const games = await Game.find({}).lean()

    // Base URL - replace with your actual domain in production
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://yourdomain.com"

    // Create XML sitemap
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'

    // Add static pages
    const staticPages = [
      { url: "", priority: "1.0", changefreq: "weekly" },
      { url: "support", priority: "0.8", changefreq: "monthly" },
      { url: "privacy-policy", priority: "0.5", changefreq: "yearly" },
      { url: "terms-of-service", priority: "0.5", changefreq: "yearly" },
      { url: "faq", priority: "0.7", changefreq: "monthly" },
    ]

    for (const page of staticPages) {
      xml += "  <url>\n"
      xml += `    <loc>${baseUrl}/${page.url}</loc>\n`
      xml += "    <lastmod>2023-11-01</lastmod>\n"
      xml += `    <changefreq>${page.changefreq}</changefreq>\n`
      xml += `    <priority>${page.priority}</priority>\n`
      xml += "  </url>\n"
    }

    // Add game pages
    for (const game of games) {
      xml += "  <url>\n"
      xml += `    <loc>${baseUrl}/games/${game.id}</loc>\n`
      xml += `    <lastmod>${game.updatedAt.toISOString().split("T")[0]}</lastmod>\n`
      xml += "    <changefreq>weekly</changefreq>\n"
      xml += "    <priority>0.8</priority>\n"
      xml += "  </url>\n"
    }

    xml += "</urlset>"

    return new NextResponse(xml, {
      headers: {
        "Content-Type": "application/xml",
      },
    })
  } catch (error) {
    console.error("Error generating sitemap:", error)
    return NextResponse.json({ error: "Failed to generate sitemap" }, { status: 500 })
  }
}
