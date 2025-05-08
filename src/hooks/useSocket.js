"use client"

import { useEffect, useState } from "react"
import { io } from "socket.io-client"
import { useAdminAuth } from "@/lib/auth"

let socket

export function useSocket() {
  const [isConnected, setIsConnected] = useState(false)
  const { isAuthenticated } = useAdminAuth()

  useEffect(() => {
    // Initialize socket connection
    if (!socket) {
      const socketUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin
      socket = io(socketUrl)

      socket.on("connect", () => {
        console.log("Socket connected")
        setIsConnected(true)

        // If authenticated as admin, join admin room
        if (isAuthenticated) {
          const token = localStorage.getItem("adminToken")
          socket.emit("join-admin", token)
        }
      })

      socket.on("disconnect", () => {
        console.log("Socket disconnected")
        setIsConnected(false)
      })

      socket.on("connect_error", (err) => {
        console.error("Socket connection error:", err)
        setIsConnected(false)
      })
    }

    return () => {
      // Don't disconnect on component unmount
      // We want to keep the connection alive for the entire session
    }
  }, [isAuthenticated])

  return { socket, isConnected }
}

// Hook for listening to specific events
export function useSocketEvent(event, callback) {
  useEffect(() => {
    if (!socket) return

    socket.on(event, callback)

    return () => {
      socket.off(event, callback)
    }
  }, [event, callback])
}
