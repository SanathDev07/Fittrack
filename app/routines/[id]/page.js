"use client"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"

export default function RoutinePage() {
  const { data: session } = useSession()
  const router = useRouter()
  const params = useParams()
  const [routine, setRoutine] = useState(null)
  const [loading, setLoading] = useState(true)
  const [logging, setLogging] = useState(false)
  const [notes, setNotes] = useState("")
  const [showLogForm, setShowLogForm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetch(`/api/routines/${params.id}`)
      .then(res => res.json())
      .then(data => { setRoutine(data); setLoading(false) })
  }, [params.id])

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this routine?")) return
    setDeleting(true)
    await fetch(`/api/routines/${params.id}`, { method: "DELETE" })
    router.push("/dashboard")
  }

  const handleLog = async () => {
    setLogging(true)
    await fetch("/api/logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ routineId: parseInt(params.id), notes })
    })
    setLogging(false)
    setShowLogForm(false)
    setNotes("")
    alert("Workout logged! 💪")
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-gray-400 animate-pulse text-xl">Loading routine...</div>
    </div>
  )

  if (!routine || routine.error) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">
      <div className="text-center">
        <div className="text-5xl mb-4">🔒</div>
        <h2 className="text-xl font-semibold mb-2">Routine not found</h2>
        <Link href="/routines" className="text-blue-400 hover:text-blue-300">Browse public routines</Link>
      </div>
    </div>
  )

  const isOwner = session?.user?.email === routine.owner.email

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="border-b border-gray-800 px-6 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">💪</span>
          <span className="text-xl font-bold">FitTrack</span>
        </Link>
        <div className="flex gap-4 items-center">
          <Link href="/routines" className="text-gray-400 hover:text-white transition">Browse</Link>
          {session && <Link href="/dashboard" className="text-gray-400 hover:text-white transition">Dashboard</Link>}
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{routine.title}</h1>
              <span className={`text-xs px-2 py-1 rounded-full ${routine.visibility === "public" ? "bg-green-600/20 text-green-400" : "bg-gray-700 text-gray-400"}`}>
                {routine.visibility === "public" ? "🌍 Public" : "🔒 Private"}
              </span>
            </div>
            <p className="text-gray-400">{routine.description || "No description"}</p>
            <p className="text-gray-500 text-sm mt-2">By {routine.owner.name}</p>
          </div>
          {isOwner && (
            <div className="flex gap-2">
              <Link href={`/routines/${params.id}/edit`} className="bg-gray-800 hover:bg-gray-700 transition px-4 py-2 rounded-lg text-sm">
                ✏️ Edit
              </Link>
              <button onClick={handleDelete} disabled={deleting} className="bg-red-600/20 hover:bg-red-600/40 text-red-400 transition px-4 py-2 rounded-lg text-sm">
                🗑️ Delete
              </button>
            </div>
          )}
        </div>

        {/* Exercises */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Exercises ({routine.exercises.length})</h2>
          {routine.exercises.length === 0 ? (
            <p className="text-gray-400">No exercises added yet.</p>
          ) : (
            <div className="space-y-3">
              {routine.exercises.map((ex, i) => (
                <div key={ex.id} className="flex items-center justify-between bg-gray-800 rounded-lg px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="text-gray-500 text-sm font-mono">{String(i+1).padStart(2,"0")}</span>
                    <span className="font-medium">{ex.name}</span>
                  </div>
                  <div className="flex gap-3 text-sm text-gray-400">
                    {ex.sets && <span>{ex.sets} sets</span>}
                    {ex.reps && <span>{ex.reps} reps</span>}
                    {ex.duration && <span>{ex.duration}s</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Log Workout */}
        {session && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Log This Workout</h2>
            {!showLogForm ? (
              <button onClick={() => setShowLogForm(true)} className="w-full bg-blue-600 hover:bg-blue-700 transition py-3 rounded-lg font-medium">
                ✅ I completed this workout!
              </button>
            ) : (
              <div>
                <textarea
                  placeholder="Add notes (optional) e.g. Felt strong today, increased weight on bench"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 mb-3 focus:outline-none focus:border-blue-500 h-24 resize-none"
                />
                <div className="flex gap-3">
                  <button onClick={handleLog} disabled={logging} className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition py-2 rounded-lg font-medium">
                    {logging ? "Logging..." : "Log Workout 💪"}
                  </button>
                  <button onClick={() => setShowLogForm(false)} className="px-4 bg-gray-800 hover:bg-gray-700 transition rounded-lg">
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}