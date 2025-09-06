import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { access_token, refresh_token } = await req.json();
  const res = NextResponse.json({ ok: true });
  // Setear cookies HttpOnly para el middleware
  res.cookies.set('sb-access-token', access_token, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
  });
  res.cookies.set('sb-refresh-token', refresh_token, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
  });
  return res;
}
