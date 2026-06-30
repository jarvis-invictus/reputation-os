import { NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createServerClient();

  // Get first business (demo mode)
  const { data: business, error } = await supabase
    .from('businesses')
    .select('id, total_reviews, average_rating, this_month_reviews')
    .limit(1)
    .single();

  if (error || !business) {
    return NextResponse.json({
      total_reviews: 0, average_rating: null, this_month_reviews: 0,
      recent_feedbacks: [], rating_distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    });
  }

  // Get recent feedbacks
  const { data: recentFeedbacks } = await supabase
    .from('feedbacks')
    .select('id, contact_name, rating, generated_review, review_copied, created_at')
    .eq('business_id', business.id)
    .order('created_at', { ascending: false })
    .limit(10);

  // Get rating distribution
  const { data: allFeedbacks } = await supabase
    .from('feedbacks')
    .select('rating')
    .eq('business_id', business.id);

  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  allFeedbacks?.forEach((f: { rating: number }) => {
    if (f.rating >= 1 && f.rating <= 5) distribution[f.rating]++;
  });

  // This month's count
  const { data: thisMonthFeedbacks } = await supabase
    .from('feedbacks')
    .select('id')
    .eq('business_id', business.id)
    .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString());

  const thisMonthCount = thisMonthFeedbacks?.length || 0;

  return NextResponse.json({
    total_reviews: business.total_reviews || 0,
    average_rating: business.average_rating,
    this_month_reviews: thisMonthCount,
    recent_feedbacks: recentFeedbacks || [],
    rating_distribution: distribution,
  });
}
