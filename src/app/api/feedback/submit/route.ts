import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { generateReview } from '@/lib/ai/review-generator';
import { notificationEngine } from '@/lib/notifications/engine';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { business_id, rating, liked_items, contact_name, comment, channel, qr_location, reminder_id } = body;

    if (!business_id || !rating || !contact_name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    const supabase = await createServerClient();

    // Fetch business for AI generation
    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .select('id, name, owner_name, owner_title, type, service_list, ai_style, ai_custom_instructions, channels, google_maps_url, slug')
      .eq('id', business_id)
      .single();

    if (businessError || !business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    // Check if contact exists by phone/email
    let contactId: string | null = null;
    if (body.contact_phone) {
      const { data: existingContact } = await supabase
        .from('contacts')
        .select('id')
        .eq('business_id', business_id)
        .eq('phone', body.contact_phone)
        .single();
      contactId = existingContact?.id || null;
    }

    const channels = business.channels || {};
    const highRatingThreshold = channels.high_rating_threshold || 4;

    let generatedReview: string | null = null;
    let shouldGenerate = rating >= highRatingThreshold;

    // Generate AI review for high ratings
    if (shouldGenerate) {
      try {
        const result = await generateReview({
          business: {
            name: business.name,
            owner_name: business.owner_name,
            owner_title: business.owner_title,
            type: business.type,
            service_list: business.service_list || [],
          },
          feedback: {
            contact_name,
            rating,
            liked_items: liked_items || [],
            comment,
          },
          style: business.ai_style || 'simple',
          custom_instructions: business.ai_custom_instructions || undefined,
        });

        if (result.generated) {
          generatedReview = result.review;
        }
      } catch (aiError) {
        console.error('AI generation failed:', aiError);
        // Continue without AI review
        generatedReview = null;
      }
    }

    // Insert feedback
    const { data: feedback, error: feedbackError } = await supabase
      .from('feedbacks')
      .insert({
        business_id,
        contact_id: contactId,
        contact_name,
        rating,
        liked_items: liked_items || [],
        comment: comment || null,
        generated_review: generatedReview,
        channel: channel || 'link',
        qr_location: qr_location || null,
        reminder_id: reminder_id || null,
      })
      .select()
      .single();

    if (feedbackError) {
      console.error('Feedback insert error:', feedbackError);
      return NextResponse.json({ error: 'Failed to save feedback' }, { status: 500 });
    }

    // Update business stats
    const { data: allFeedbacks } = await supabase
      .from('feedbacks')
      .select('rating, created_at')
      .eq('business_id', business_id);

    if (allFeedbacks && allFeedbacks.length > 0) {
      const total = allFeedbacks.length;
      const sum = allFeedbacks.reduce((acc: number, f: { rating: number }) => acc + f.rating, 0);
      const avg = sum / total;
      const thisMonth = allFeedbacks.filter((f: { created_at: string }) => {
        const d = new Date(f.created_at);
        const now = new Date();
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }).length;

      await supabase
        .from('businesses')
        .update({ total_reviews: total, average_rating: Math.round(avg * 10) / 10, this_month_reviews: thisMonth })
        .eq('id', business_id);
    }

    // Update contact if exists
    if (contactId) {
      await supabase
        .from('contacts')
        .update({
          last_feedback_date: new Date().toISOString(),
          last_rating: rating,
          total_visits: supabase.rpc('increment', { x: 1 }).eq('id', contactId),
        })
        .eq('id', contactId);
    }

    // Send notification for negative feedback
    if (rating < highRatingThreshold) {
      try {
        const contact = contactId ? { id: contactId, name: contact_name, phone: body.contact_phone || '' } : null;
        await notificationEngine.deliverReview(feedback as any, business as any, contact as any);
      } catch (notifError) {
        console.error('Notification error:', notifError);
      }
    }

    return NextResponse.json({
      id: feedback.id,
      rating: feedback.rating,
      generated_review: generatedReview,
      is_high_rating: rating >= highRatingThreshold,
    });
  } catch (error) {
    console.error('Feedback submit error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
