import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })
        if (!user) return null
        const passwordMatch = await bcrypt.compare(credentials.password, user.password)
        if (!passwordMatch) return null
        return { id: user.id, name: user.name, email: user.email }
      }
    })
  ],
  callbacks: {
    async session({ session, token }) {
      if (token) session.user.id = token.id
      return session
    },
    async jwt({ token, user }) {
      if (user) token.id = user.id
      return token
    }
  },
  pages: { signIn: "/auth/signin" },
  session: { strategy: "jwt" }
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }