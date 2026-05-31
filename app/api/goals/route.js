import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { NextResponse } from "next/server"

export async function GET(request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  const goal = await prisma.goal.findUnique({ where: { userId: user.id } })
  return NextResponse.json(goal || {})
}

export async function POST(request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { dailyCalorieTarget, weeklyWorkoutTarget, targetWeight } = await request.json()
  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  const goal = await prisma.goal.upsert({ where: { userId: user.id }, update: { dailyCalorieTarget, weeklyWorkoutTarget, targetWeight }, create: { userId: user.id, dailyCalorieTarget, weeklyWorkoutTarget, targetWeight } })
  return NextResponse.json(goal)
}