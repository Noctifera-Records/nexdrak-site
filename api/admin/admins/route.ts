export const runtime = "edge";

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { data: profiles, error } = await supabase.from('profiles').select('id, role').eq('role', 'admin');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Note: Email fetching requires admin operations not available in Edge Runtime
  // Consider storing email in profiles table or using Supabase Edge Functions
  return NextResponse.json(profiles);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Admin creation requires admin operations not available in Edge Runtime
  // This functionality needs to be implemented using Supabase Edge Functions
  return NextResponse.json({ error: 'Admin creation not available in Edge Runtime. Use Supabase dashboard or Edge Functions.' }, { status: 501 });
}

export async function DELETE(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await request.json();

  if (!id) {
    return NextResponse.json({ error: 'Admin ID is required' }, { status: 400 });
  }

  // Only delete from profiles table - auth user deletion requires admin operations
  // Note: This will leave the auth user but remove their admin access
  const { error: profileError } = await supabase.from('profiles').delete().eq('id', id);

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  return NextResponse.json({ message: 'Admin profile deleted successfully' });
}