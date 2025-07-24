import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// Configuración OBLIGATORIA para Cloudflare Pages
export const runtime = 'edge';
export const dynamic = 'force-dynamic';
export const revalidate = false;

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

  const { data: setting, error } = await supabase.from('settings').select('value').eq('key', 'main_title').single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(setting);
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

  const { value } = await request.json();

  if (!value) {
    return NextResponse.json({ error: 'Value is required' }, { status: 400 });
  }

  const { data, error } = await supabase.from('settings').update({ value }).eq('key', 'main_title');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: 'Setting updated successfully', data });
}