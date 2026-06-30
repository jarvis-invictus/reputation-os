import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';

const DEMO_CLINIC = {
  id: 'demo-id',
  slug: 'demo-clinic',
  name: 'Bright Smile Dental Clinic',
  type: 'clinic',
  logo_url: null,
  accent_color: '#00C48C',
  tagline: 'Your smile, our passion',
  owner_name: 'Dr. Priya Sharma',
  owner_title: 'Chief Dentist',
  channels: {
    qr_enabled: true,
    whatsapp_enabled: false,
    sms_enabled: false,
    email_enabled: false,
    kiosk_enabled: false,
    reminder_delay_days: 1,
    review_delivery: 'copy',
    high_rating_threshold: 4,
  },
  google_maps_url: null,
  google_business_name: null,
  ai_style: 'simple',
  ai_custom_instructions: null,
  service_list: ['dental cleaning', 'root canal', 'implants', 'teeth whitening', 'braces consultation', 'gum treatment'],
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const supabase = await createServerClient();
    const { data: business, error } = await supabase
      .from('businesses')
      .select('id, slug, name, type, logo_url, accent_color, tagline, owner_name, owner_title, channels, google_maps_url, google_business_name, ai_style, ai_custom_instructions, service_list')
      .eq('slug', slug)
      .single();

    if (!error && business) {
      return NextResponse.json({ business });
    }
  } catch {
    // Supabase unavailable — use demo data
  }

  // Fallback: if slug is demo-clinic or any unknown slug, return demo data
  if (slug === 'demo-clinic') {
    return NextResponse.json({ business: DEMO_CLINIC });
  }

  return NextResponse.json({ business: DEMO_CLINIC });
}
