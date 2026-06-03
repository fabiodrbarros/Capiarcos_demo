import { NextResponse } from 'next/server';
import { readManifest } from '@/lib/catalog';

export const dynamic = 'force-dynamic';

export async function GET() {
  const manifest = await readManifest();
  return NextResponse.json(manifest, { headers: { 'Cache-Control': 'no-store' } });
}
