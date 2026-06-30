-- ReputationOS Database Schema
-- Run in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- BUSINESSES
-- ============================================
CREATE TABLE businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'other',
  logo_url TEXT,
  accent_color TEXT DEFAULT '#00C48C',
  tagline TEXT,
  google_business_name TEXT,
  google_maps_url TEXT,
  owner_name TEXT NOT NULL,
  owner_title TEXT DEFAULT 'Owner',
  service_list JSONB DEFAULT '[]',
  ai_style TEXT DEFAULT 'simple',
  ai_custom_instructions TEXT,
  channels JSONB DEFAULT '{"qr_enabled": true, "whatsapp_enabled": false, "sms_enabled": false, "email_enabled": false, "kiosk_enabled": false, "reminder_delay_days": 1, "review_delivery": "copy", "high_rating_threshold": 4}',
  total_reviews INT DEFAULT 0,
  average_rating FLOAT,
  this_month_reviews INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- CONTACTS
-- ============================================
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  last_service_date DATE,
  last_reminder_sent TIMESTAMPTZ,
  last_feedback_date TIMESTAMPTZ,
  last_rating INT,
  total_visits INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- REMINDERS
-- ============================================
CREATE TABLE reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  appointment_date DATE,
  trigger_type TEXT NOT NULL,
  trigger_days_after INT,
  status TEXT DEFAULT 'pending',
  channel TEXT,
  scheduled_for TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- FEEDBACKS
-- ============================================
CREATE TABLE feedbacks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id),
  contact_name TEXT NOT NULL,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  liked_items JSONB DEFAULT '[]',
  comment TEXT,
  generated_review TEXT,
  review_copied BOOLEAN DEFAULT false,
  review_copied_at TIMESTAMPTZ,
  channel TEXT DEFAULT 'link',
  qr_location TEXT,
  reminder_id UUID REFERENCES reminders(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- QR CODES
-- ============================================
CREATE TABLE qr_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  location_tag TEXT NOT NULL,
  url_slug TEXT NOT NULL,
  image_url TEXT,
  total_scans INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_contacts_business ON contacts(business_id);
CREATE INDEX idx_contacts_phone ON contacts(phone);
CREATE INDEX idx_reminders_business ON reminders(business_id);
CREATE INDEX idx_reminders_status ON reminders(status);
CREATE INDEX idx_reminders_scheduled ON reminders(scheduled_for);
CREATE INDEX idx_reminders_contact ON reminders(contact_id);
CREATE INDEX idx_feedbacks_business ON feedbacks(business_id);
CREATE INDEX idx_feedbacks_rating ON feedbacks(rating);
CREATE INDEX idx_feedbacks_created ON feedbacks(created_at DESC);
CREATE INDEX idx_feedbacks_contact ON feedbacks(contact_id);
CREATE INDEX idx_qr_business ON qr_codes(business_id);
CREATE INDEX idx_businesses_slug ON businesses(slug);
CREATE INDEX idx_businesses_owner ON businesses(owner_id);

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER businesses_updated_at BEFORE UPDATE ON businesses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER contacts_updated_at BEFORE UPDATE ON contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- SEED DATA: Demo Business
-- ============================================
INSERT INTO businesses (owner_id, slug, name, type, owner_name, owner_title, accent_color, tagline, channels, service_list)
VALUES (
  'demo-owner',
  'demo-clinic',
  'Bright Smile Dental Clinic',
  'clinic',
  'Dr. Priya Sharma',
  'Chief Dentist',
  '#00C48C',
  'Your smile, our passion',
  '{"qr_enabled": true, "whatsapp_enabled": false, "sms_enabled": false, "email_enabled": false, "kiosk_enabled": false, "reminder_delay_days": 1, "review_delivery": "copy", "high_rating_threshold": 4}',
  '["dental cleaning", "root canal", "implants", "teeth whitening", "braces consultation", "gum treatment"]'
);

-- Seed a few contacts
INSERT INTO contacts (business_id, name, phone, email, last_service_date, total_visits)
SELECT 
  b.id,
  'Rahul Sharma',
  '+919876543210',
  'rahul@email.com',
  '2026-06-28',
  3
FROM businesses b WHERE b.slug = 'demo-clinic';

INSERT INTO contacts (business_id, name, phone, email, last_service_date, total_visits)
SELECT 
  b.id,
  'Priya Patel',
  '+919876543211',
  'priya@email.com',
  '2026-06-27',
  1
FROM businesses b WHERE b.slug = 'demo-clinic';
