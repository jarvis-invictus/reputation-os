import { NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { notificationEngine } from '@/lib/notifications/engine';

export async function GET() {
  const supabase = await createServerClient();

  // Get all pending reminders past their scheduled time
  const now = new Date().toISOString();
  const { data: reminders, error } = await supabase
    .from('reminders')
    .select('*, contacts(*)')
    .eq('status', 'pending')
    .lte('scheduled_for', now);

  if (error || !reminders) return NextResponse.json({ processed: 0 });

  let processed = 0;

  for (const reminder of reminders) {
    const { data: business } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', reminder.business_id)
      .single();

    if (!business || !reminder.contacts) continue;

    const result = await notificationEngine.processReminder(
      reminder,
      business,
      reminder.contacts
    );

    if (result.success) {
      await supabase
        .from('reminders')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString(),
          channel: result.channel ?? null,
        })
        .eq('id', reminder.id);

      await supabase
        .from('contacts')
        .update({ last_reminder_sent: new Date().toISOString() })
        .eq('id', reminder.contact_id);
    } else {
      await supabase
        .from('reminders')
        .update({ status: 'failed' })
        .eq('id', reminder.id);
    }

    processed++;
  }

  return NextResponse.json({ processed });
}
