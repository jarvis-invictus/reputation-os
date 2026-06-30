import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { parseCSV } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { business_id, csv_text } = body;

    if (!business_id || !csv_text) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const rows = parseCSV(csv_text);
    if (rows.length === 0) {
      return NextResponse.json({ error: 'No valid rows found in CSV' }, { status: 400 });
    }

    const supabase = await createServerClient();
    let imported = 0, updated = 0, failed = 0;

    for (const row of rows) {
      if (!row.name || !row.phone) {
        failed++;
        continue;
      }

      // Check if contact exists
      const { data: existing } = await supabase
        .from('contacts')
        .select('id')
        .eq('business_id', business_id)
        .eq('phone', row.phone.replace(/[^0-9+]/g, ''))
        .single();

      if (existing) {
        // Update
        const { error } = await supabase
          .from('contacts')
          .update({
            name: row.name,
            email: row.email || null,
            last_service_date: row.last_service_date || null,
            total_visits: (existing as any).total_visits + 1 || 1,
          })
          .eq('id', existing.id);
        if (error) failed++;
        else updated++;
      } else {
        // Insert
        const { error } = await supabase.from('contacts').insert({
          business_id,
          name: row.name,
          phone: row.phone.replace(/[^0-9+]/g, ''),
          email: row.email || null,
          last_service_date: row.last_service_date || null,
          total_visits: 1,
        });
        if (error) failed++;
        else imported++;
      }
    }

    return NextResponse.json({ imported, updated, failed, total: rows.length });
  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json({ error: 'Import failed' }, { status: 500 });
  }
}
