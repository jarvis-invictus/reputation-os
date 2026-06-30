import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';

// GET /api/business - Get current user's business
export async function GET(request: NextRequest) {
  const supabase = await createServerClient();

  // Get business by owner_id from cookie/session
  // For now, get the first business (demo mode)
  const { data: business, error } = await supabase
    .from('businesses')
    .select('*')
    .limit(1)
    .single();

  if (error || !business) {
    return NextResponse.json({ error: 'Business not found' }, { status: 404 });
  }

  return NextResponse.json({ business });
}

// PATCH /api/business - Update business
export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const supabase = await createServerClient();

  if (!body.id) {
    return NextResponse.json({ error: 'Business ID required' }, { status: 400 });
  }

  const allowedFields = [
    'name', 'type', 'logo_url', 'accent_color', 'tagline',
    'google_business_name', 'google_maps_url', 'owner_name', 'owner_title',
    'service_list', 'ai_style', 'ai_custom_instructions', 'channels',
  ];

  const updates: Record<string, unknown> = {};
  for (const field of allowedFields) {
    if (body[field] !== undefined) updates[field] = body[field];
  }

  const { data: business, error } = await supabase
    .from('businesses')
    .update(updates)
    .eq('id', body.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: 'Failed to update business' }, { status: 500 });
  }

  return NextResponse.json({ business });
}
