import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { NextResponse } from "next/server"

export async function POST(request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { routineId } = await request.json()

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  })

  const original = await prisma.routine.findUnique({
    where: { id: parseInt(routineId) },
    include: { exercises: true }
  })

  if (!original) return NextResponse.json({ error: "Routine not found" }, { status: 404 })
  if (original.ownerId === user.id) return NextResponse.json({ error: "Cannot clone your own routine" }, { status: 400 })

  const cloned = await prisma.routine.create({
    data: {
      title: `${original.title} (Clone)`,
      description: original.description,
      visibility: "private",
      ownerId: user.id,
      exercises: {
        create: original.exercises.map(e => ({
          name: e.name,
          sets: e.sets,
          reps: e.reps,
          duration: e.duration
        }))
      }
    }
  })

  return NextResponse.json(cloned)
}