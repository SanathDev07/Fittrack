"use client"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"

export default function EditRoutine() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [visibility, setVisibility] = useState("private")
  const [exercises, setExercises] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/signin")
  }, [status])

  useEffect(() => {
    fetch(`/api/routines/${params.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) { router.push("/dashboard"); return }
        setTitle(data.title)
        setDescription(data.description || "")
        setVisibility(data.visibility)
        setExercises(data.exercises.map(e => ({
          name: e.name,
          sets: e.sets || "",
          reps: e.reps || "",
          duration: e.duration || ""
        })))
        setLoading(false)
      })
  }, [params.id])

  const addExercise = () => {
    setExercises([...exercises, { name: "", sets: "", reps: "", duration: "" }])
  }

  const removeExercise = (index) => {
    setExercises(exercises.filter((_, i) => i !== index))
  }

  const updateExercise = (index, field, value) => {
    const updated = [...exercises]
    updated[index][field] = value
    setExercises(updated)
  }

  const handleSubmit = async () => {
    if (!title) return alert("Please enter a title")
    setSaving(true)

    const cleanExercises = exercises
      .filter(e => e.name)
      .map(e => ({
        name: e.name,
        sets: e.sets ? parseInt(e.sets) : null,
        reps: e.reps ? parseInt(e.reps) : null,
        duration: e.duration ? parseInt(e.duration) : null,
      }))

    const res = await fetch(`/api/routines/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, visibility, exercises: cleanExercises })
    })

    setSaving(false)
    if (res.ok) router.push(`/routines/${params.id}`)
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-gray-400 animate-pulse text-xl">Loading...</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="border-b border-gray-800 px-6 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">💪</span>
          <span className="text-xl font-bold">FitTrack</span>
        </Link>
        <Link href="/dashboard" className="text-gray-400 hover:text-white transition">Dashboard</Link>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-8">Edit Routine</h1>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Routine Details</h2>
          <input
            type="text"
            placeholder="Routine title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 mb-4 focus:outline-none focus:border-blue-500"
          />
          <textarea
            placeholder="Description (optional)"
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 mb-4 focus:outline-none focus:border-blue-500 h-24 resize-none"
          />
          <div className="flex gap-3">
            <button
              onClick={() => setVisibility("private")}
              className={`flex-1 py-2 rounded-lg font-medium transition ${visibility === "private" ? "bg-blue-600" : "bg-gray-800 hover:bg-gray-700"}`}
            >
              🔒 Private
            </button>
            <button
              onClick={() => setVisibility("public")}
              className={`flex-1 py-2 rounded-lg font-medium transition ${visibility === "public" ? "bg-blue-600" : "bg-gray-800 hover:bg-gray-700"}`}
            >
              🌍 Public
            </button>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Exercises</h2>
          {exercises.map((ex, i) => (
            <div key={i} className="bg-gray-800 rounded-lg p-4 mb-3">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-gray-400 font-medium">Exercise {i + 1}</span>
                <button onClick={() => removeExercise(i)} className="text-red-400 hover:text-red-300 text-sm">Remove</button>
              </div>
              <input
                type="text"
                placeholder="Exercise name"
                value={ex.name}
                onChange={e => updateExercise(i, "name", e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 mb-2 focus:outline-none focus:border-blue-500"
              />
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="number"
                  placeholder="Sets"
                  value={ex.sets}
                  onChange={e => updateExercise(i, "sets", e.target.value)}
                  className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                />
                <input
                  type="number"
                  placeholder="Reps"
                  value={ex.reps}
                  onChange={e => updateExercise(i, "reps", e.target.value)}
                  className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                />
                <input
                  type="number"
                  placeholder="Duration(s)"
                  value={ex.duration}
                  onChange={e => updateExercise(i, "duration", e.target.value)}
                  className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          ))}
          <button
            onClick={addExercise}
            className="w-full border border-dashed border-gray-600 hover:border-blue-500 text-gray-400 hover:text-blue-400 py-3 rounded-lg transition"
          >
            + Add Exercise
          </button>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition py-3 rounded-lg font-semibold"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
          <Link href={`/routines/${params.id}`} className="px-6 bg-gray-800 hover:bg-gray-700 transition py-3 rounded-lg font-semibold text-center">
            Cancel
          </Link>
        </div>
      </div>
    </div>
  )
}