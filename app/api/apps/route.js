import { supabase } from '../../../lib/supabase';
import { NextResponse } from 'next/server';

const KEY = 'launcher_apps';

export async function GET() {
  const { data, error } = await supabase
    .from('settings')
    .select('value')
    .eq('key', KEY)
    .single();

  if (error) {
    return NextResponse.json([], { status: 200 });
  }

  try {
    const apps = JSON.parse(data.value);
    return NextResponse.json(apps);
  } catch {
    return NextResponse.json([]);
  }
}

export async function PUT(request) {
  const apps = await request.json();

  const { error } = await supabase
    .from('settings')
    .update({ value: JSON.stringify(apps) })
    .eq('key', KEY);

  if (error) {
    // If no row exists yet, insert
    const { error: insertError } = await supabase
      .from('settings')
      .insert({ key: KEY, value: JSON.stringify(apps) });

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}
