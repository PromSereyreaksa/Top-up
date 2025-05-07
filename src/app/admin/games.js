"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function AdminGames() {
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [seedStatus, setSeedStatus] = useState(null)
  const router = useRouter()

  useEffect(() => {
    fetchGames()
  }, [])

  const fetchGames = async () => {
    try {
      setLoading(true)
      console.log("Client: Fetching games from API...")

      const res = await fetch("/api/games", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store", // Disable caching
      })

      console.log("Client: API response status:", res.status)

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        console.error("Client: Error response:", errorData)
        throw new Error(errorData.error || `Failed to fetch games: ${res.status}`)
      }

      const data = await res.json()
      console.log(`Client: Fetched ${data.length} games successfully`)

      setGames(data)
      setError(null)
    } catch (err) {
      console.error("Client: Error in fetchGames:", err)
      setError(err.message || "Failed to fetch games")
    } finally {
      setLoading(false)
    }
  }

  const seedDatabase = async () => {
    try {
      setSeedStatus("Seeding database...")

      const res = await fetch("/api/seed", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to seed database")
      }

      setSeedStatus(data.message)
      fetchGames() // Refresh the games list
    } catch (err) {
      setSeedStatus(`Error: ${err.message}`)
    }
  }

  const deleteGame = async (gameId) => {
    if (!confirm("Are you sure you want to delete this game?")) return

    try {
      console.log(`Client: Deleting game ${gameId}...`)
      const res = await fetch(`/api/games/${gameId}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to delete game")
      }

      console.log(`Client: Game ${gameId} deleted successfully`)
      // Refresh games list
      fetchGames()
    } catch (err) {
      console.error(`Client: Error deleting game ${gameId}:`, err)
      setError(err.message)
    }
  }

  if (loading) return <div className="p-8 text-center">Loading games...</div>

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Game Management</h1>
        <div className="flex gap-2">
          <button onClick={seedDatabase} className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded">
            Seed Database
          </button>
          <Link href="/admin/games/new" className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded">
            Add New Game
          </Link>
        </div>
      </div>

      {seedStatus && (
        <div
          className={`p-4 mb-4 rounded ${seedStatus.includes("Error") ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}
        >
          {seedStatus}
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p className="font-bold">Error:</p>
          <p>{error}</p>
          <div className="mt-2">
            <button onClick={fetchGames} className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded text-sm">
              Retry
            </button>
          </div>
        </div>
      )}

      {!error && games.length === 0 ? (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          <p>No games found in the database.</p>
          <p className="mt-2">Click "Seed Database" to add sample games or "Add New Game" to create a game manually.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 border-b text-left">Image</th>
                <th className="py-2 px-4 border-b text-left">ID</th>
                <th className="py-2 px-4 border-b text-left">Name</th>
                <th className="py-2 px-4 border-b text-left">Description</th>
                <th className="py-2 px-4 border-b text-left">Featured</th>
                <th className="py-2 px-4 border-b text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {games.map((game) => (
                <tr key={game.id || game._id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b">
                    <img
                      src={game.image || "/placeholder.svg"}
                      alt={game.name}
                      className="w-16 h-16 object-cover"
                      onError={(e) => {
                        e.target.src = "/placeholder.svg"
                      }}
                    />
                  </td>
                  <td className="py-2 px-4 border-b">{game.id}</td>
                  <td className="py-2 px-4 border-b">{game.name}</td>
                  <td className="py-2 px-4 border-b">{game.description || "-"}</td>
                  <td className="py-2 px-4 border-b">
                    {game.featured ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Yes
                      </span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                        No
                      </span>
                    )}
                  </td>
                  <td className="py-2 px-4 border-b">
                    <div className="flex space-x-2">
                      <Link href={`/admin/games/edit/${game.id}`} className="text-blue-500 hover:text-blue-700">
                        Edit
                      </Link>
                      <button onClick={() => deleteGame(game.id)} className="text-red-500 hover:text-red-700">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
