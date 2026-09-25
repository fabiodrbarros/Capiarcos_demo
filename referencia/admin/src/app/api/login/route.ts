import { NextResponse } from 'next/server';
import { verifyCredentials, createSession } from '@/lib/auth';

export async function POST(req: Request) {
  let user = '';
  let password = '';
  try {
    const body = await req.json();
    user = typeof body.user === 'string' ? body.user : typeof body.username === 'string' ? body.username : '';
    password = typeof body.password === 'string' ? body.password : '';
  } catch {
    return NextResponse.json({ ok: false, error: 'bad-json' }, { status: 400 });
  }

  if (!verifyCredentials(user, password)) {
    return NextResponse.json({ ok: false, error: 'invalid' }, { status: 401 });
  }

  await createSession();
  return NextResponse.json({ ok: true });
}
