const { createServer } = require("http")
const { parse } = require("url")
const next = require("next")
const { initializeSocket } = require("./lib/socket")

const dev = process.env.NODE_ENV !== "production"
const hostname = "localhost"
const port = process.env.PORT || 3000

// Initialize Next.js
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  // Create HTTP server
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error("Error occurred handling", req.url, err)
      res.statusCode = 500
      res.end("Internal Server Error")
    }
  })

  // Initialize Socket.IO with the HTTP server
  try {
    console.log("Initializing Socket.IO from server.js...")
    initializeSocket(server)
    console.log("Socket.IO initialization complete")
  } catch (error) {
    console.error("Failed to initialize Socket.IO:", error)
  }

  // Start the server
  server.listen(port, (err) => {
    if (err) throw err
    console.log(`> Ready on http://${hostname}:${port}`)
  })
})
