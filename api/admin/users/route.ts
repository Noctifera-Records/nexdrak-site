export const runtime = 'edge';

import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: 'Admin users route - Edge Runtime' });
}

export async function PUT() {
  return NextResponse.json({ error: 'Not implemented in Edge Runtime' }, { status: 501 });
}

export async function DELETE() {
  return NextResponse.json({ error: 'Not implemented in Edge Runtime' }, { status: 501 });
}