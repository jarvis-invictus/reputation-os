import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { generateQrCode } from '@/lib/qr/generator';

// POST /api/qr/generate
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { location_tag } = body;

  if (!location_tag) {
    return NextResponse.json({ error: 'Location tag required' }, { status: 400 });
  }

  const supabase = await createServerClient();

  const { data: business } = await supabase.from('businesses').select('id, slug').limit(1).single();
  if (!business) return NextResponse.json({ error: 'Business not found' }, { status: 404 });

  const url_slug = `${business.slug}-${location_tag.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;

  const { data: qrCode, error } = await supabase
    .from('qr_codes')
    .insert({
      business_id: business.id,
      location_tag,
      url_slug,
      total_scans: 0,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: 'Failed to create QR code' }, { status: 500 });

  // Generate QR image
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const feedbackUrl = `${baseUrl}/${url_slug}/feedback`;

  let imageUrl: string | null = null;
  try {
    imageUrl = await generateQrCode(feedbackUrl);
  } catch (qrError) {
    console.error('QR generation error:', qrError);
  }

  if (imageUrl) {
    await supabase.from('qr_codes').update({ image_url: imageUrl }).eq('id', qrCode.id);
    qrCode.image_url = imageUrl;
  }

  return NextResponse.json({ qr_code: qrCode });
}
