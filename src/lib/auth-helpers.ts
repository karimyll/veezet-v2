import { getServerSession } from "next-auth/next"
import { authOptions } from "./auth"
import { redirect } from "next/navigation"

export async function requireAuth() {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect('/auth/signin')
  }
  return session
}

export async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect('/auth/signin')
  }
  if ((session.user as any).role !== 'ADMIN') {
    redirect('/dashboard')
  }
  return session
}

export async function requireUser() {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect('/auth/signin')
  }
  return session
}

export function isAdmin(session: any) {
  return session?.user?.role === 'ADMIN'
}

export function isUser(session: any) {
  return session?.user?.role === 'USER'
}
