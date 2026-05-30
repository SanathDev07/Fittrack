import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { NextResponse } from "next/server"

export async function GET() {
  const publicRoutines = await prisma.routine.findMany({
    where: { visibility: "public" },
    include: { owner: { select: { name: true } }, exercises: true },
    orderBy: { createdAt: "desc" }
  })
  return NextResponse.json(publicRoutines)
}

export async function POST(request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { title, description, visibility, exercises } = await request.json()

  const user = await prisma.user.findUnique({ where: { email: session.user.email } })

  const routine = await prisma.routine.create({
    data: {
      title,
      description,
      visibility: visibility || "private",
      ownerId: user.id,
      exercises: {
        create: exercises || []
      }
    },
    include: { exercises: true }
  })

  return NextResponse.json(routine)
}