import { Server } from "socket.io"

let io

export function initializeSocket(server) {
  // If io is already initialized and we're in development, return it
  if (io) {
    console.log("Socket.IO already initialized, reusing existing instance")
    return io
  }

  try {
    console.log("Initializing Socket.IO server...")

    // Create new Socket.IO server
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

    console.log("Socket.io server initialized successfully")
    return io
  } catch (error) {
    console.error("Failed to initialize Socket.io server:", error)
    // Don't throw the error, just log it
    return null
  }
}

export const emitOrderUpdate = (order) => {
  if (io) {
    try {
      io.to(`order-${order.orderId}`).emit("order-update", order)
      console.log(`Emitted order-update event for order ${order.orderId}`)
    } catch (error) {
      console.error(`Failed to emit order update for ${order.orderId}:`, error)
    }
  } else {
    console.log("Socket.IO not initialized, cannot emit order update")
  }
}

export const emitDashboardUpdate = (stats) => {
  if (io) {
    try {
      io.to("admin").emit("dashboard-update", stats)
      console.log("Emitted dashboard-update event to admin room")
    } catch (error) {
      console.error("Failed to emit dashboard update:", error)
    }
  } else {
    console.log("Socket.IO not initialized, cannot emit dashboard update")
  }
}

export { io }
