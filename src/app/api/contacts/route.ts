import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';

// GET /api/contacts
export async function GET(request: NextRequest) {
  const supabase = await createServerClient();
  const { searchParams } = new URL(request.url);
  const businessId = searchParams.get('business_id');

  if (!businessId) {
    // Get first business
    const { data: biz } = await supabase.from('businesses').select('id').limit(1).single();
    if (!biz) return NextResponse.json({ contacts: [] });
    const { data: contacts } = await supabase
      .from('contacts')
      .select('*')
      .eq('business_id', biz.id)
      .order('created_at', { ascending: false });
    return NextResponse.json({ contacts: contacts || [] });
  }

  const { data: contacts, error } = await supabase
    .from('contacts')
    .select('*')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: 'Failed to fetch contacts' }, { status: 500 });
  return NextResponse.json({ contacts: contacts || [] });
}

// POST /api/contacts
export async function POST(request: NextRequest) {
  const body = await request.json();
  const supabase = await createServerClient();

  if (!body.business_id || !body.name || !body.phone) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const { data: contact, error } = await supabase
    .from('contacts')
    .insert({
      business_id: body.business_id,
      name: body.name,
      phone: body.phone,
      email: body.email || null,
      last_service_date: body.last_service_date || null,
      total_visits: 1,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: 'Failed to create contact' }, { status: 500 });
  return NextResponse.json({ contact });
}
