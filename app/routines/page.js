"use client"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"

export default function Routines() {
  const { data: session } = useSession()
  const [routines, setRoutines] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/routines")
      .then(res => res.json())
      .then(data => { setRoutines(data); setLoading(false) })
  }, [])

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Navbar */}
      <nav className="border-b border-gray-800 px-6 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">💪</span>
          <span className="text-xl font-bold">FitTrack</span>
        </Link>
        <div className="flex gap-4 items-center">
          {session ? (
            <>
              <Link href="/dashboard" className="text-gray-400 hover:text-white transition">Dashboard</Link>
              <Link href="/routines/new" className="bg-blue-600 hover:bg-blue-700 transition px-4 py-2 rounded-lg font-medium">
                + New Routine
              </Link>
            </>
          ) : (
            <Link href="/auth/signin" className="bg-blue-600 hover:bg-blue-700 transition px-4 py-2 rounded-lg font-medium">
              Sign In
            </Link>
          )}
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Community Routines</h1>
            <p className="text-gray-400 mt-1">Discover and clone workouts from the community</p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1,2,3].map(i => (
              <div key={i} className="bg-gray-900 rounded-xl p-6 animate-pulse">
                <div className="h-4 bg-gray-800 rounded mb-3 w-3/4"></div>
                <div className="h-3 bg-gray-800 rounded mb-2 w-full"></div>
                <div className="h-3 bg-gray-800 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : routines.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-5xl mb-4">🏋️</div>
            <h2 className="text-xl font-semibold mb-2">No public routines yet</h2>
            <p className="text-gray-400 mb-6">Be the first to share a workout!</p>
            {session && (
              <Link href="/routines/new" className="bg-blue-600 hover:bg-blue-700 transition px-6 py-3 rounded-lg font-medium">
                Create Routine
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {routines.map(routine => (
              <Link href={`/routines/${routine.id}`} key={routine.id}>
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-blue-500 transition cursor-pointer h-full">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold">{routine.title}</h3>
                    <span className="text-xs bg-green-600/20 text-green-400 px-2 py-1 rounded-full">Public</span>
                  </div>
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">{routine.description || "No description"}</p>
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>👤 {routine.owner.name}</span>
                    <span>🏃 {routine.exercises.length} exercises</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}