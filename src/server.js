import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { initializeSocket } from "./lib/socket.js";
import "dotenv/config";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

// Graceful shutdown handling
let server;
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  if (server) {
    server.close(() => {
      console.log("HTTP server closed");
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});

app.prepare().then(() => {
  server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  // Error handling for server
  server.on("error", (err) => {
    console.error("Server error:", err);
  });

  // Initialize socket.io with error handling
  try {
    initializeSocket(server);
  } catch (error) {
    console.error("Failed to initialize socket.io:", error);
  }

  server.listen(process.env.PORT || 3000, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${process.env.PORT || 3000}`);
  });
});
