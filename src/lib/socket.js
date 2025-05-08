import { Server } from "socket.io"

let io

export function initializeSocket(server) {
  if (io) return io

  try {
    io = new Server(server, {
      cors: {
        origin: process.env.NEXT_PUBLIC_SITE_URL || "*",
        methods: ["GET", "POST"],
      },
      // Add ping timeout and interval for connection health checks
      pingTimeout: 60000,
      pingInterval: 25000,
      // Add reconnection settings
      connectTimeout: 10000,
      // Add transport options
      transports: ["websocket", "polling"],
    })

    io.on("connection", (socket) => {
      console.log("Client connected:", socket.id)

      // Join admin room if authenticated
      socket.on("join-admin", (token) => {
        try {
          // In a real implementation, verify the token
          // For now, we'll just join the room
          socket.join("admin")
          console.log(`Socket ${socket.id} joined admin room`)
          // Acknowledge the join
          socket.emit("admin-joined", { success: true })
        } catch (error) {
          console.error(`Error joining admin room for socket ${socket.id}:`, error)
          socket.emit("admin-joined", { success: false, error: error.message })
        }
      })

      // Join specific order room
      socket.on("join-order", (orderId) => {
        try {
          socket.join(`order-${orderId}`)
          console.log(`Socket ${socket.id} joined order room for ${orderId}`)
        } catch (error) {
          console.error(`Error joining order room for socket ${socket.id}:`, error)
        }
      })

      // Leave specific order room
      socket.on("leave-order", (orderId) => {
        try {
          socket.leave(`order-${orderId}`)
          console.log(`Socket ${socket.id} left order room for ${orderId}`)
        } catch (error) {
          console.error(`Error leaving order room for socket ${socket.id}:`, error)
        }
      })

      // Handle errors
      socket.on("error", (error) => {
        console.error(`Socket ${socket.id} error:`, error)
      })

      socket.on("disconnect", (reason) => {
        console.log(`Client disconnected (${socket.id}):`, reason)
      })
    })

    // Handle server-level errors
    io.engine.on("connection_error", (err) => {
      console.error("Connection error:", err)
    })

    console.log("Socket.io server initialized")
    return io
  } catch (error) {
    console.error("Failed to initialize Socket.io server:", error)
    throw error
  }
}

export function getIO() {
  if (!io) {
    throw new Error("Socket.io not initialized. Call initializeSocket first.")
  }
  return io
}

export function emitOrderUpdate(order) {
  if (!io) return

  try {
    // Emit to admin room
    io.to("admin").emit("order-update", order)

    // Also emit to specific order room if anyone is listening
    io.to(`order-${order.orderId}`).emit("order-update", order)

    console.log(`Emitted order update for ${order.orderId}`)
  } catch (error) {
    console.error(`Error emitting order update for ${order.orderId}:`, error)
  }
}

export function emitDashboardUpdate(stats) {
  if (!io) return

  try {
    io.to("admin").emit("dashboard-update", stats)
    console.log("Emitted dashboard update")
  } catch (error) {
    console.error("Error emitting dashboard update:", error)
  }
}
