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

  const { data: profiles, error } = await supabase.from('profiles').select('id, role');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Note: Email fetching requires admin operations not available in Edge Runtime
  // Consider storing email in profiles table or using Supabase Edge Functions
  return NextResponse.json(profiles);
}

export async function PUT(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id, role } = await request.json();

  if (!id || !role) {
    return NextResponse.json({ error: 'User ID and role are required' }, { status: 400 });
  }

  const { error } = await supabase.from('profiles').update({ role }).eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: 'User role updated successfully' });
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
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  // Only delete from profiles table - auth user deletion requires admin operations
  // Note: This will leave the auth user but remove their profile access
  const { error: profileError } = await supabase.from('profiles').delete().eq('id', id);

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  return NextResponse.json({ message: 'User profile deleted successfully' });
}