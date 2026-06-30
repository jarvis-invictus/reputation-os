import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';

// GET /api/feedbacks
export async function GET(request: NextRequest) {
  const supabase = await createServerClient();
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '50');

  const { data: business } = await supabase.from('businesses').select('id').limit(1).single();
  if (!business) return NextResponse.json({ feedbacks: [] });

  const { data, error } = await supabase
    .from('feedbacks')
    .select(
      'id, contact_name, rating, liked_items, comment, generated_review, review_copied, channel, created_at'
    )
    .eq('business_id', business.id)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ feedbacks: data || [] });
}
