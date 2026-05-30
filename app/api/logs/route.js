import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { email: session.user.email } })

  const logs = await prisma.workoutLog.findMany({
    where: { userId: user.id },
    include: { routine: { select: { title: true, exercises: true } } },
    orderBy: { completedAt: "desc" }
  })

  return NextResponse.json(logs)
}

export async function POST(request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { routineId, notes } = await request.json()
  const user = await prisma.user.findUnique({ where: { email: session.user.email } })

  const log = await prisma.workoutLog.create({
    data: {
      userId: user.id,
      routineId,
      notes
    },
    include: { routine: { select: { title: true } } }
  })

  return NextResponse.json(log)
}