export const runtime = "edge";

import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: 'Admin admins route - Edge Runtime' });
}

export async function POST() {
  return NextResponse.json({ error: 'Admin creation not available in Edge Runtime' }, { status: 501 });
}

export async function DELETE() {
  return NextResponse.json({ error: 'Admin deletion not available in Edge Runtime' }, { status: 501 });
}