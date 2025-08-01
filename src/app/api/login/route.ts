// app/api/login/route.ts
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { username, password } = await req.json()

  const validUsername = process.env.AUTH_USERNAME
  const validPassword = process.env.AUTH_PASSWORD

  if (username === validUsername && password === validPassword) {
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ success: false }, { status: 401 })
}
