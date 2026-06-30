import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const supabase = await createServerClient();

  const { data: business, error } = await supabase
    .from('businesses')
    .select('id, slug, name, type, logo_url, accent_color, tagline, owner_name, owner_title, channels, google_maps_url, google_business_name, ai_style, ai_custom_instructions, service_list')
    .eq('slug', slug)
    .single();

  if (error || !business) {
    return NextResponse.json({ error: 'Business not found' }, { status: 404 });
  }

  return NextResponse.json({ business });
}
