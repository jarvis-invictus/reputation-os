import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';

// GET /api/reminders — fetch all reminders for the current business
export async function GET(request: NextRequest) {
  const supabase = await createServerClient();
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const limit = parseInt(searchParams.get('limit') || '50');

  const { data: business } = await supabase.from('businesses').select('id').limit(1).single();
  if (!business) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  let query = supabase
    .from('reminders')
    .select('*, contacts(name, phone, email)')
    .eq('business_id', business.id)
    .order('scheduled_for', { ascending: false })
    .limit(limit);

  if (status) query = query.eq('status', status);

  const { data, error } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ reminders: data || [] });
}
