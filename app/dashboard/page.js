"use client"
import { useEffect, useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [routines, setRoutines] = useState([])
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/signin")
  }, [status])

  useEffect(() => {
    if (status === "authenticated") {
      Promise.all([
        fetch("/api/dashboard/routines").then(r => r.json()),
        fetch("/api/logs").then(r => r.json())
      ]).then(([r, l]) => {
        setRoutines(r)
        setLogs(l)
        setLoading(false)
      })
    }
  }, [status])

  if (status === "loading" || loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-gray-400 animate-pulse text-xl">Loading dashboard...</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="border-b border-gray-800 px-6 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">💪</span>
          <span className="text-xl font-bold">FitTrack</span>
        </Link>
        <div className="flex gap-4 items-center">
          <Link href="/routines" className="text-gray-400 hover:text-white transition">Browse</Link>
          <Link href="/goals" className="text-gray-400 hover:text-white transition">Goals</Link>
          <span className="text-gray-400 text-sm">Hi, {session?.user?.name}!</span>
          <button onClick={() => signOut({ callbackUrl: "/" })} className="text-gray-400 hover:text-white transition text-sm">
            Sign Out
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { label: "Total Routines", value: routines.length, icon: "📋" },
            { label: "Workouts Logged", value: logs.length, icon: "✅" },
            { label: "Public Routines", value: routines.filter(r => r.visibility === "public").length, icon: "🌍" },
          ].map(stat => (
            <div key={stat.label} className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <div className="text-3xl mb-2">{stat.icon}</div>
              <div className="text-3xl font-bold mb-1">{stat.value}</div>
              <div className="text-gray-400 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* My Routines */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">My Routines</h2>
            <Link href="/routines/new" className="bg-blue-600 hover:bg-blue-700 transition px-4 py-2 rounded-lg font-medium text-sm">
              + New Routine
            </Link>
          </div>
          {routines.length === 0 ? (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
              <div className="text-4xl mb-3">🏋️</div>
              <p className="text-gray-400 mb-4">No routines yet. Create your first one!</p>
              <Link href="/routines/new" className="bg-blue-600 hover:bg-blue-700 transition px-6 py-2 rounded-lg font-medium">
                Create Routine
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {routines.map(routine => (
                <div key={routine.id} className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-blue-500 transition">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold">{routine.title}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${routine.visibility === "public" ? "bg-green-600/20 text-green-400" : "bg-gray-700 text-gray-400"}`}>
                      {routine.visibility === "public" ? "Public" : "Private"}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">{routine.description || "No description"}</p>
                  <div className="text-sm text-gray-500 mb-4">🏃 {routine.exercises.length} exercises</div>
                  <div className="flex gap-2">
                    <Link href={`/routines/${routine.id}`} className="flex-1 text-center bg-gray-800 hover:bg-gray-700 transition py-2 rounded-lg text-sm">
                      View
                    </Link>
                    <Link href={`/routines/${routine.id}/edit`} className="flex-1 text-center bg-gray-800 hover:bg-gray-700 transition py-2 rounded-lg text-sm">
                      Edit
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Workout History */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Workout History</h2>
          {logs.length > 0 && (
  <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-6">
    <h3 className="text-lg font-semibold mb-4">📊 Workouts This Week</h3>
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={logs.slice(0, 7).map((log, i) => ({ name: `Day ${i + 1}`, workouts: 1 }))}>
        <XAxis dataKey="name" stroke="#9ca3af" />
        <YAxis stroke="#9ca3af" />
        <Tooltip />
        <Bar dataKey="workouts" fill="#3b82f6" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  </div>
)}
          {logs.length === 0 ? (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
              <div className="text-4xl mb-3">📊</div>
              <p className="text-gray-400">No workouts logged yet. Complete a routine to get started!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {logs.map(log => (
                <div key={log.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">{log.routine.title}</h3>
                    {log.notes && <p className="text-gray-400 text-sm mt-1">{log.notes}</p>}
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-400">
                      {new Date(log.completedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(log.completedAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}