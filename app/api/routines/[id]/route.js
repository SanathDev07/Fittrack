import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { NextResponse } from "next/server"

export async function GET(request, context) {
  const params = await context.params
  const routine = await prisma.routine.findUnique({
    where: { id: parseInt(params.id) },
    include: { 
      owner: { select: { name: true, email: true } }, 
      exercises: true,
      workoutLogs: { include: { user: { select: { name: true } } } }
    }
  })

  if (!routine) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const session = await getServerSession(authOptions)
  if (routine.visibility === "private") {
    if (!session || session.user.email !== routine.owner.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
  }

  return NextResponse.json(routine)
}

export async function PUT(request, context) {
  const params = await context.params
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  const routine = await prisma.routine.findUnique({ where: { id: parseInt(params.id) } })

  if (!routine || routine.ownerId !== user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { title, description, visibility, exercises } = await request.json()

  await prisma.exercise.deleteMany({ where: { routineId: routine.id } })

  const updated = await prisma.routine.update({
    where: { id: parseInt(params.id) },
    data: {
      title,
      description,
      visibility,
      exercises: { create: exercises || [] }
    },
    include: { exercises: true }
  })

  return NextResponse.json(updated)
}

export async function DELETE(request, context) {
  const params = await context.params
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  const routine = await prisma.routine.findUnique({ where: { id: parseInt(params.id) } })

  if (!routine || routine.ownerId !== user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  await prisma.routine.delete({ where: { id: parseInt(params.id) } })
  return NextResponse.json({ message: "Deleted successfully" })
}