# ReputationOS

**Modular review automation platform for local businesses.**

A business owner installs ReputationOS for their clinic/restaurant/salon → customers scan QR after service → rate 1-5 stars → AI generates a personalized Google review → copy & paste to Google Maps. Done in 60 seconds.

---

## Live URLs

| | URL |
|---|---|
| **Customer Feedback** | `https://reputation.invictus-ai.in/[slug]/feedback` |
| **Portal Login** | `https://reputation.invictus-ai.in/portal/login` |
| **Password** | `reputation2026` |

---

## What This System Does

### Customer Journey

```
Customer scans QR at clinic
        ↓
Opens: /[slug]/feedback
        ↓
"How was your experience?" (tap 1-5 stars)
        ↓
"What did you like?" (checkboxes: staff, cleanliness, treatment...)
        ↓
AI generates personalized review (3-5 sentences)
        ↓
"Copy to clipboard" + "Open Google Maps"
        ↓
Customer pastes → Google review posted
```

### Owner Portal

- Dashboard: reviews count, average rating, this month stats
- Contacts: customer list, import CSV, mark visits
- Appointments: mark service complete → trigger reminder
- QR Codes: generate, download, track scans
- Settings: business info, Google Maps link, AI style, channel config

### Channels (Modular)

Each business can enable:
- **QR Code** (always on)
- **WhatsApp** reminders
- **SMS** reminders
- **Email** reminders
- **Kiosk** mode (tablet at counter)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router, TypeScript) |
| Database | Supabase Cloud (PostgreSQL) |
| AI | Gameron API (Claude Sonnet 4.6) — **swap for any LLM** |
| QR Generation | `qrcode` npm package |
| Auth | Password cookie (portal), no auth for customer forms |
| Hosting | VPS: `reputation.invictus-ai.in` via Traefik |
| Container | Docker (PM2 on VPS) |

---

## Quick Start

### 1. Clone

```bash
git clone https://github.com/jarvis-invictus/reputation-os.git
cd reputation-os
npm install
```

### 2. Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GAMERON_API_KEY=your_gameron_key
GAMERON_API_URL=https://api.gameron.me/v1
PORTAL_PASSWORD=your_secure_password
NEXTAUTH_SECRET=random_secret_string
NEXTAUTH_URL=https://your-domain.com
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### 3. Database Setup

Go to **Supabase → SQL Editor** and run:

```sql
-- Enable UUID
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- BUSINESSES
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

-- CONTACTS
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

-- REMINDERS
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

-- FEEDBACKS
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

-- QR CODES
CREATE TABLE qr_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  location_tag TEXT NOT NULL,
  url_slug TEXT NOT NULL,
  image_url TEXT,
  total_scans INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- INDEXES
CREATE INDEX idx_contacts_business ON contacts(business_id);
CREATE INDEX idx_reminders_business ON reminders(business_id);
CREATE INDEX idx_reminders_status ON reminders(status);
CREATE INDEX idx_feedbacks_business ON feedbacks(business_id);
CREATE INDEX idx_feedbacks_rating ON feedbacks(rating);
CREATE INDEX idx_feedbacks_created ON feedbacks(created_at DESC);
CREATE INDEX idx_businesses_slug ON businesses(slug);
```

**Important:** Disable Row Level Security (RLS) on all tables via Supabase Dashboard → Authentication → Row Level Security, or add proper policies.

### 4. Build & Run

```bash
npm run build
npm start
```

Or with Docker:

```bash
docker build -t reputation-os .
docker run -p 3000:3000 --env-file .env.local reputation-os
```

### 5. Deploy to VPS with PM2

```bash
ssh user@vps
cd /opt/reputation-os
git clone https://github.com/jarvis-invictus/reputation-os.git
cd reputation-os
npm install
npm run build
PORT=3000 pm2 start npm --name reputation-os -- start
```

---

## Pages

### Customer (Public — No Auth)

| Page | URL | Purpose |
|---|---|---|
| Feedback Form | `/{slug}/feedback` | Main customer feedback flow |
| Kiosk Mode | `/{slug}/kiosk` | Fullscreen tablet version |

### Portal (Password Protected)

| Page | URL | Purpose |
|---|---|---|
| Login | `/portal/login` | Password: `PORTAL_PASSWORD` env var |
| Dashboard | `/portal` | Stats, recent reviews |
| Contacts | `/portal/contacts` | Customer list, CSV import |
| Mark Visit | `/portal/appointments` | Mark service done → schedule reminder |
| Reviews | `/portal/reviews` | All feedbacks + AI reviews |
| Settings | `/portal/settings/profile` | Business info |
| Google Settings | `/portal/settings/google` | Maps link, business name |
| Channels | `/portal/settings/channels` | Enable/disable WhatsApp, SMS, etc. |
| QR Codes | `/portal/settings/qr` | Generate + download QR |
| AI Settings | `/portal/settings/ai` | Review style, custom instructions |

---

## API Endpoints

### Public

```
GET  /api/business/[slug]           — Get business branding
POST /api/feedback/submit            — Submit feedback + generate review
POST /api/feedback/[id]/copy        — Mark review as copied
POST /api/ai/generate-review        — Standalone AI review generator
```

### Portal (Auth Required)

```
GET   /api/business                  — Get current business
PATCH /api/business                 — Update business settings
GET   /api/business/stats            — Dashboard stats

GET   /api/contacts                 — List contacts
POST  /api/contacts                 — Add contact
POST  /api/contacts/import          — CSV import

POST  /api/appointments/mark-complete — Mark visit → create reminder

GET   /api/feedbacks                — All feedbacks
GET   /api/reminders                — All reminders
POST  /api/reminders/[id]/trigger   — Manually trigger reminder

GET   /api/qr                       — List QR codes
POST  /api/qr/generate             — Generate new QR

GET   /api/cron/process-reminders  — Cron: process pending reminders
```

---

## AI Review Generation

The AI generates reviews using this flow:

**Input:** rating (1-5), liked_items (checkboxes), contact_name, business info

**Output:** 3-5 sentence personalized Google review, no markdown, no emojis, sounds human

**Prompt structure** (defined in `src/lib/ai/review-generator.ts`):

```
You are a real customer. Write in first person.
3-5 sentences. Sound genuine.
Mention specific things they liked.
End with ⭐⭐⭐⭐⭐
No "great service" or "highly recommended" (overused).
```

**Liked item → descriptor mapping** is stored in `src/lib/supabase/types.ts` under `likedItemsByType`, per business type (clinic, restaurant, salon, retail, other).

---

## QR Code System

- Each business gets a unique QR code
- URL format: `/{slug}/feedback?via=qr&location={tag}`
- Generated as PNG (400x400px) via `qrcode` npm package
- Stored in Supabase or returned as base64 data URL
- Multiple QR codes per business with location tags ("Counter", "Entrance", etc.)
- Scan count tracked per QR

---

## Notification Channels

The `NotificationEngine` class in `src/lib/notifications/engine.ts` abstracts all channels:

```typescript
interface NotificationChannel {
  sendReminder(reminder: Reminder): Promise<{ success: boolean }>
  sendReview(review: Review, contact: Contact): Promise<{ success: boolean }>
}
```

Current implementations:
- **WhatsAppChannel** — connects to wa-invictus.in API (configured per business)
- **SMSChannel** — stub (msg91 integration)
- **EmailChannel** — stub (future)

Adding a new channel = implement `NotificationChannel` interface + register in `NotificationEngine`.

---

## Business Type Presets

Each business type has different `liked_items` and AI context:

| Type | Liked Items |
|---|---|
| clinic | staff, treatment, cleanliness, price, ambiance, speed |
| restaurant | food, service, ambiance, cleanliness, price, speed |
| salon | staff, service, ambiance, cleanliness, price, result |
| retail | staff, product_quality, variety, cleanliness, price, service |
| other | staff, service, quality, cleanliness, price, convenience |

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Supabase service role key (bypasses RLS) |
| `GAMERON_API_KEY` | ⚠️ | AI review generation (fails gracefully if missing) |
| `GAMERON_API_URL` | ⚠️ | AI API endpoint |
| `PORTAL_PASSWORD` | ✅ | Portal login password |
| `NEXTAUTH_SECRET` | ✅ | Auth encryption secret |
| `NEXTAUTH_URL` | ✅ | App URL for redirects |
| `NEXT_PUBLIC_APP_URL` | ✅ | Public facing URL |

---

## File Structure

```
src/
├── app/
│   ├── [slug]/
│   │   ├── feedback/page.tsx    — Customer feedback form
│   │   ├── kiosk/page.tsx       — Kiosk fullscreen
│   │   └── page.tsx             — Redirect to /feedback
│   ├── portal/
│   │   ├── page.tsx             — Dashboard
│   │   ├── login/page.tsx       — Portal login
│   │   ├── contacts/page.tsx     — Contact list
│   │   ├── appointments/page.tsx — Mark visit complete
│   │   ├── reviews/page.tsx      — All reviews
│   │   └── settings/
│   │       ├── profile/page.tsx
│   │       ├── google/page.tsx
│   │       ├── channels/page.tsx
│   │       ├── qr/page.tsx
│   │       └── ai/page.tsx
│   └── api/
│       ├── business/[slug]/route.ts
│       ├── feedback/submit/route.ts
│       ├── feedback/[id]/copy/route.ts
│       ├── contacts/route.ts
│       ├── appointments/mark-complete/route.ts
│       ├── qr/generate/route.ts
│       ├── ai/generate-review/route.ts
│       └── cron/process-reminders/route.ts
├── lib/
│   ├── supabase/client.ts        — Browser client
│   ├── supabase/server.ts        — Server client (service role)
│   ├── supabase/types.ts         — Types + liked item presets
│   ├── ai/review-generator.ts   — AI review generation
│   ├── notifications/engine.ts    — Channel abstraction
│   └── qr/generator.ts          — QR code PNG generation
└── middleware.ts                 — Portal auth guard
```

---

## Deployment

### VPS (Current)
- Container: `reputation-os` on VPS
- Network: `traefik_shared`
- Route: `reputation.invictus-ai.in` via Traefik
- Restart: `pm2 restart reputation-os`

### Vercel (Alternative)
```bash
npm i -g vercel
vercel --prod
```

### Update Environment Variables
1. Edit `docker-compose.yml` or `.env.local`
2. `docker-compose down && docker-compose up -d`
3. Or: `pm2 restart reputation-os`

---

## Extending

### Add WhatsApp Integration

1. Get wa-invictus.in API credentials
2. Set `channels.whatsapp_enabled = true` on business
3. Implement `WhatsAppChannel` in `src/lib/notifications/engine.ts`
4. Register in `NotificationEngine.channels`

### Add SMS

1. Get msg91 API key
2. Set `channels.sms_enabled = true`
3. Implement `SMSChannel` → same interface

### Change AI Provider

Edit `src/lib/ai/review-generator.ts`:
```typescript
// Swap this:
const response = await fetch(process.env.GAMERON_API_URL + '/messages', {...})
// For OpenAI, Anthropic, or any LLM API
```

The rest of the app doesn't change — only the AI call.

### White-Label (Custom Domain per Business)

1. Each business gets `slug.custom-domain.com` → `/[slug]/feedback`
2. Add subdomain routing in Traefik
3. Add `custom_domain` field to `businesses` table

---

## Known Issues

- RLS must be disabled or carefully configured for anon key access
- AI review generation falls back to template if Gameron API fails
- WhatsApp integration requires wa-invictus.in to be verified
- Cron job (`/api/cron/process-reminders`) needs a external trigger (Vercel Cron or n8n)

---

## License

Private — Invictus AI
