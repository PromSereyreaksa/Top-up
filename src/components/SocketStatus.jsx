"use client"

import { useSocket } from "@/hooks/useSocket"
import { useEffect, useState } from "react"
import { FaWifi, FaExclamationTriangle } from "react-icons/fa"

export default function SocketStatus() {
  const { socket, isConnected } = useSocket()
  const [reconnectAttempts, setReconnectAttempts] = useState(0)

  useEffect(() => {
    if (!socket) return

    const handleReconnectAttempt = (attemptNumber) => {
      setReconnectAttempts(attemptNumber)
    }

    socket.on("reconnect_attempt", handleReconnectAttempt)

    return () => {
      socket.off("reconnect_attempt", handleReconnectAttempt)
    }
  }, [socket])

  return (
    <div className="flex items-center gap-2 text-sm">
      {isConnected ? (
        <span className="flex items-center text-green-600">
          <FaWifi className="mr-1" />
          Connected
        </span>
      ) : (
        <span className="flex items-center text-red-600">
          <FaExclamationTriangle className="mr-1" />
          {reconnectAttempts > 0 ? `Reconnecting (attempt ${reconnectAttempts})...` : "Disconnected"}
        </span>
      )}
    </div>
  )
}
