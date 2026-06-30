import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const supabase = await createServerClient();
  const { contact_id, service_date, reminder_delay_days } = await request.json();

  if (!contact_id) {
    return NextResponse.json({ error: 'contact_id required' }, { status: 400 });
  }

  // Get business for channel config
  const { data: business } = await supabase
    .from('businesses')
    .select('id, channels')
    .limit(1)
    .single();

  if (!business) {
    return NextResponse.json({ error: 'Business not found' }, { status: 404 });
  }

  const delayDays =
    reminder_delay_days ?? business.channels?.reminder_delay_days ?? 1;
  const scheduledDate = new Date(service_date || new Date());
  scheduledDate.setDate(scheduledDate.getDate() + delayDays);

  const { data, error } = await supabase
    .from('reminders')
    .insert({
      business_id: business.id,
      contact_id,
      appointment_date: service_date || new Date().toISOString().split('T')[0],
      trigger_type: 'after_visit',
      trigger_days_after: delayDays,
      status: 'pending',
      scheduled_for: scheduledDate.toISOString(),
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Update contact last_service_date
  await supabase
    .from('contacts')
    .update({ last_service_date: service_date || new Date().toISOString().split('T')[0] })
    .eq('id', contact_id);

  return NextResponse.json({ reminder: data });
}
