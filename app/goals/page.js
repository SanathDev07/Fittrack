"use client"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function Goals() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [dailyCalorieTarget, setDailyCalorieTarget] = useState("")
  const [weeklyWorkoutTarget, setWeeklyWorkoutTarget] = useState("")
  const [targetWeight, setTargetWeight] = useState("")
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/signin")
    if (status === "authenticated") {
      fetch("/api/goals")
        .then(r => r.json())
        .then(data => {
          if (data.dailyCalorieTarget) setDailyCalorieTarget(data.dailyCalorieTarget)
          if (data.weeklyWorkoutTarget) setWeeklyWorkoutTarget(data.weeklyWorkoutTarget)
          if (data.targetWeight) setTargetWeight(data.targetWeight)
        })
    }
  }, [status])

  const handleSave = async () => {
    await fetch("/api/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        dailyCalorieTarget: parseInt(dailyCalorieTarget) || null,
        weeklyWorkoutTarget: parseInt(weeklyWorkoutTarget) || null,
        targetWeight: parseFloat(targetWeight) || null
      })
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-lg mx-auto">
        <h1 className="text-3xl font-bold mb-8">🎯 My Goals</h1>
        <div className="bg-gray-800 rounded-xl p-6 space-y-6">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Daily Calorie Target</label>
            <input
              type="number"
              value={dailyCalorieTarget}
              onChange={e => setDailyCalorieTarget(e.target.value)}
              placeholder="e.g. 2000"
              className="w-full bg-gray-700 rounded-lg p-3 text-white"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Weekly Workout Target</label>
            <input
              type="number"
              value={weeklyWorkoutTarget}
              onChange={e => setWeeklyWorkoutTarget(e.target.value)}
              placeholder="e.g. 4"
              className="w-full bg-gray-700 rounded-lg p-3 text-white"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Target Weight (lbs)</label>
            <input
              type="number"
              value={targetWeight}
              onChange={e => setTargetWeight(e.target.value)}
              placeholder="e.g. 175"
              className="w-full bg-gray-700 rounded-lg p-3 text-white"
            />
          </div>
          <button
            onClick={handleSave}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg"
          >
            {saved ? "Saved!" : "Save Goals"}
          </button>
        </div>
      </div>
    </div>
  )
}