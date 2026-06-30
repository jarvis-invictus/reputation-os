import type { Reminder, Feedback, Contact, Business } from '../supabase/types';

// ============================================
// Channel Interface
// ============================================
export interface NotificationChannel {
  type: 'whatsapp' | 'sms' | 'email' | 'inapp';

  sendReminder(
    reminder: Reminder,
    business: Business,
    contact: Contact
  ): Promise<{ success: boolean; error?: string }>;

  sendReview(
    feedback: Feedback,
    business: Business,
    contact: Contact | null
  ): Promise<{ success: boolean; error?: string }>;
}

// ============================================
// WhatsApp Channel (wa-invictus.in)
// ============================================
class WhatsAppChannel implements NotificationChannel {
  type = 'whatsapp' as const;

  private get apiUrl(): string {
    return process.env.WA_INVICTUS_API_URL || 'https://wa-invictus.in/api';
  }

  private get apiKey(): string {
    return process.env.WA_INVICTUS_API_KEY || '';
  }

  async sendReminder(
    reminder: Reminder,
    business: Business,
    contact: Contact
  ): Promise<{ success: boolean; error?: string }> {
    const feedbackUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/${business.slug}/feedback?rid=${reminder.id}`;

    const message = `Hi ${contact.name}! How was your experience at ${business.name}? We'd love your feedback! ${feedbackUrl}`;

    try {
      const response = await fetch(`${this.apiUrl}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          phone: contact.phone,
          message,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('WhatsApp send failed:', response.status, errorText);
        return { success: false, error: `HTTP ${response.status}` };
      }

      return { success: true };
    } catch (error) {
      console.error('WhatsApp channel error:', error);
      return { success: false, error: 'Network error' };
    }
  }

  async sendReview(
    feedback: Feedback,
    business: Business,
    contact: Contact | null
  ): Promise<{ success: boolean; error?: string }> {
    if (!contact?.phone || !feedback.generated_review) {
      return { success: false, error: 'missing_data' };
    }

    const mapsLink = business.google_maps_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(business.name)}`;

    const message = `${feedback.generated_review}\n\nShare your experience: ${mapsLink}`;

    try {
      const response = await fetch(`${this.apiUrl}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          phone: contact.phone,
          message,
        }),
      });

      if (!response.ok) {
        return { success: false, error: `HTTP ${response.status}` };
      }

      return { success: true };
    } catch (error) {
      console.error('WhatsApp channel error:', error);
      return { success: false, error: 'Network error' };
    }
  }
}

// ============================================
// SMS Channel (future — msg91/Twilio)
// ============================================
class SMSChannel implements NotificationChannel {
  type = 'sms' as const;

  constructor(private apiKey: string) {}

  async sendReminder(
    reminder: Reminder,
    business: Business,
    contact: Contact
  ): Promise<{ success: boolean; error?: string }> {
    // Future: implement msg91 API
    console.log('[SMSChannel] Reminder would be sent to', contact.phone, 'for', business.name);
    return { success: false, error: 'sms_not_configured' };
  }

  async sendReview(
    feedback: Feedback,
    business: Business,
    contact: Contact | null
  ): Promise<{ success: boolean; error?: string }> {
    console.log('[SMSChannel] Review delivery not implemented');
    return { success: false, error: 'sms_not_configured' };
  }
}

// ============================================
// Email Channel (future)
// ============================================
class EmailChannel implements NotificationChannel {
  type = 'email' as const;

  async sendReminder(
    reminder: Reminder,
    business: Business,
    contact: Contact
  ): Promise<{ success: boolean; error?: string }> {
    console.log('[EmailChannel] Reminder would be sent to', contact.email);
    return { success: false, error: 'email_not_configured' };
  }

  async sendReview(
    feedback: Feedback,
    business: Business,
    contact: Contact | null
  ): Promise<{ success: boolean; error?: string }> {
    return { success: false, error: 'email_not_configured' };
  }
}

// ============================================
// Notification Engine
// ============================================
export class NotificationEngine {
  private channels: Map<string, NotificationChannel> = new Map();

  constructor() {
    // Register available channels
    this.channels.set('whatsapp', new WhatsAppChannel());
    this.channels.set('sms', new SMSChannel(process.env.MSG91_API_KEY || ''));
    this.channels.set('email', new EmailChannel());
  }

  getChannel(type: string): NotificationChannel | undefined {
    return this.channels.get(type);
  }

  getEnabledChannels(business: Business): string[] {
    const channels = business.channels || {};
    return Object.entries(channels)
      .filter(([key, value]) => key.endsWith('_enabled') && value === true)
      .map(([key]) => key.replace('_enabled', ''));
  }

  async processReminder(
    reminder: Reminder,
    business: Business,
    contact: Contact
  ): Promise<{ success: boolean; channel?: string; error?: string }> {
    const enabledChannels = this.getEnabledChannels(business);

    for (const channelType of enabledChannels) {
      const channel = this.channels.get(channelType);
      if (!channel) continue;

      const result = await channel.sendReminder(reminder, business, contact);
      if (result.success) {
        return { success: true, channel: channelType };
      }
    }

    return { success: false, error: 'no_channel_available' };
  }

  async deliverReview(
    feedback: Feedback,
    business: Business,
    contact: Contact | null
  ): Promise<{ success: boolean; channel?: string; error?: string }> {
    const deliveryChannel = business.channels?.review_delivery || 'copy';

    if (deliveryChannel === 'whatsapp' || deliveryChannel === 'both') {
      const wa = this.channels.get('whatsapp');
      if (wa && contact) {
        const result = await wa.sendReview(feedback, business, contact);
        if (result.success) return { success: true, channel: 'whatsapp' };
      }
    }

    // Copy is always available — this is the default
    return { success: true, channel: 'copy' };
  }
}

// Singleton instance
export const notificationEngine = new NotificationEngine();
