import { NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';

// GET /api/qr
export async function GET() {
  const supabase = await createServerClient();

  const { data: business } = await supabase.from('businesses').select('id').limit(1).single();
  if (!business) return NextResponse.json({ qr_codes: [] });

  const { data: qr_codes, error } = await supabase
    .from('qr_codes')
    .select('*')
    .eq('business_id', business.id)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: 'Failed to fetch QR codes' }, { status: 500 });
  return NextResponse.json({ qr_codes: qr_codes || [] });
}
