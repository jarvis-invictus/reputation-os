# INVICTUS AI — COMPLETE SYSTEM HANDOVER
**Date:** June 30, 2026  
**Prepared by:** Jarvis (COO, Invictus AI)  
**Purpose:** Full technical handover so any developer can understand, fix, and continue all systems.

---

## PART 1: CREDENTIALS

### Supabase (VPS Local)
- **URL:** http://187.124.99.189:8000
- **Database:** postgres
- **DB User:** postgres
- **DB Password:** [see VPS env]

### Supabase Cloud (ReputationOS)
- **Project Ref:** ubmhweqjhfezgqbkysvp
- **URL:** https://ubmhweqjhfezgqbkysvp.supabase.co
- **Anon Key:** [SUPABASE_ANON_KEY]
- **Service Key:** [SUPABASE_SERVICE_KEY]
- **Note:** Anon key has RLS blocking reads. Use service key or disable RLS.

### WhatsApp Business / Meta
- **Meta App ID:** 1982265912712739
- **App Secret:** 7661376db045dcbc2f65907475502fb7
- **System User:** 122098667450915910 (Jarvis Bot, ADMIN role)
- **Page ID:** 1031600570027420

#### WABA 1489144202555937 (NEW — Active)
- **WABA ID:** 1489144202555937
- **Phone ID:** 1096981900174659
- **Phone Number:** +91 96995 77641
- **Verified Name:** Invictus AI
- **Status:** PENDING (phone verification blocked — OTP rate-limited, retry ~July 7)
- **Access Token (NEW):**
  EAANd1ZBuQMYsBR6COIBY39MGtbNkqheAWIRTFijCtHbIT2x3X6XqC5FEBrFUZAcbOd8vxCCyUB1casGgwHjzLh1jZAYyw5mzHEBXc4cOrU4ZCfIy7mQ8ZAvVC5Os2yFhnSOLpGd7gdQ8RemrbKQXkfWt12zfFP34ABrRoCDfSMOnJQmqLPb8eV39rUauGyn61ztKbzR3XQ4ZC65cJTzlizGXY407AFkegG1Svoy7l6jZB3J8IjHPfwSKQLrtVk2ow6FDwNLsZCffQVk42Bg2BKfiCdOMMMxIiS6I93VIEAZDZD

#### WABA 950925817426282 (OLD — Disconnected)
- **WABA ID:** 950925817426282
- **Phone:** +91 9699577641 (Phone ID: 1112440061942206)
- **Status:** DISCONNECTED — token expired June 29, no longer used
- **wa-invictus.in is still configured with OLD WABA** — needs update to new WABA

### wa-invictus.in Platform (Hostinger)
- **URL:** https://wa-invictus.in
- **Hosting:** Hostinger (45.80.182.224, port 65002)
- **SSH Key:** memory/webhosting_id_rsa
- **SSH User:** u818693926
- **DB:** MySQL, name: u818693926_invictus
- **DB User:** u818693926_invictus
- **DB Password:** @800Void
- **DB Host:** 127.0.0.1 (localhost)
- **.env file:** /home/u818693926/domains/wa-invictus.in/public_html/.env
- **Admin email:** info@wa-invictus.in
- **Mail password:** [see .env on Hostinger]

### n8n
- **URL:** https://n8n.invictus-ai.in
- **User:** joyboy7641@gmail.com
- **Password:** @800Void
- **API Key:**
  [N8N_API_KEY]

### GitHub
- **Username:** jarvis-invictus
- **PAT:** ghp_DFWRkGZCBiVDLCfugliyW3Kcx5msw3mRoAN
- **Repos:** All private

### Vercel (Jarvis Account)
- **Token:** [VERCEL_TOKEN]
- **Email:** jarvis.invictus.ai@gmail.com
- **DO NOT USE OLD TOKEN:** vcp_7aIX... (sahils-projects team — causes author errors)

### TinyFish (AI Agent)
- **API Key:** [TINYFISH_API_KEY]
- **Dashboard:** https://agent.tinyfish.ai/dashboard

### Google Gemini (Free Tier)
- **API Key:** [GEMINI_API_KEY]
- **Use:** Heartbeats, cron jobs, lightweight tasks
- **Endpoint:** https://generativelanguage.googleapis.com/v1beta

### Apify (3 accounts)
- **Key 1:** [APIFY_KEY_1] (exhausted)
- **Key 2:** [APIFY_KEY_2] (exhausted)
- **Key 3:** [APIFY_KEY_3] (low credits)

### Hostinger
- **API Token:** [HOSTINGER_TOKEN]
- **DNS Base:** https://developers.hostinger.com/api/dns/v1/zones/

### VPS (187.124.99.189)
- **SSH:** root@187.124.99.189
- **Docker Socket:** /var/run/docker.sock
- **Traefik Config:** /var/lib/docker/volumes/traefik_config/_data/
- **Traefik Container:** traefik-traefik-1

### PaperClip (Supabase on VPS)
- **URL:** https://pc.invictus-ai.in
- **BETTER_AUTH_SECRET:** [PAPERCLIP_AUTH]
- **DB:** postgres://paperclip:paperclip@supabase-db:5432/paperclip

### Cal.com
- **URL:** https://cal.invictus-ai.in
- **Password:** @800Void

---

## PART 2: WA-INVICTUS.IN — FULL TECHNICAL BREAKDOWN

### What It Is
A multi-tenant SaaS WhatsApp Business platform built on Laravel (PHP). Businesses sign up, connect their WhatsApp Business API, manage contacts, send campaigns, and automate replies.

### Hosting
- **Location:** Hostinger web hosting (not VPS)
- **Path:** /home/u818693926/domains/wa-invictus.in/public_html/
- **SSH:** ssh -i memory/webhosting_id_rsa -p 65002 u818693926@45.80.182.224
- **Domain:** wa-invictus.in
- **SSL:** Let's Encrypt via Hostinger (auto-managed)
- **PHP Version:** 8.3.30 (auto-detected by Hostinger)

### Laravel Structure
```
public_html/
├── app/
│   ├── Http/Controllers/           # Controllers
│   ├── Models/                     # Eloquent models
│   ├── Jobs/                       # Background jobs
│   └── Yantrana/
│       └── Components/              # Feature modules
│           ├── WhatsAppService/    # WhatsApp Business API integration
│           │   ├── Services/
│           │   │   ├── WhatsAppApiService.php    # Core API calls
│           │   │   └── WhatsAppConnectApiService.php
│           │   ├── Repositories/
│           │   └── Controllers/
│           ├── UserManagement/
│           ├── ContactManagement/
│           └── Campaign/
├── config/                    # Laravel config files
├── database/
│   └── migrations/           # DB migrations
├── routes/                    # API + web routes
├── resources/                 # Views (admin panel)
└── bootstrap/
```

### Database
- **Type:** MySQL
- **Name:** u818693926_invictus
- **Host:** localhost (via Hostinger internal network)
- **Access:** mysql -u u818693926_invictus -p'@800Void' u818693926_invictus

#### Key Tables

**vendors** — Multi-tenant business accounts
- id, name, email, status, subscription info

**users** — Business owner accounts
- id, name, email, password, vendor_id, role

**contacts** — Customer contacts
- id, vendor_id, name, phone, email, labels, custom fields

**campaigns** — WhatsApp campaigns
- id, vendor_id, name, status (pending/sending/sent), scheduled_at

**campaign_groups** — Campaign contact groups

**whatsapp_message_logs** — Sent messages
- id, vendor_id, contact_id, message_sid, status, direction

**whatsapp_message_queue** — Pending outgoing messages

**whatsapp_templates** — Approved Meta templates
- _uid, status, template_name, template_id, category, language, __data (JSON)

**vendor_settings** — Platform configuration (KEY TABLE)
Stores all WhatsApp API credentials per vendor:
- facebook_app_id → App ID
- facebook_app_secret → App Secret
- whatsapp_access_token → Current access token
- whatsapp_business_account_id → WABA ID
- current_phone_number_id → Phone ID
- current_phone_number_number → Phone number
- whatsapp_token_info_data → Token metadata (app_id, type, expiry)

### WhatsApp API Integration

The platform uses the **Meta WhatsApp Business Cloud API** (v18.0).

**Core endpoints used:**
- POST `https://graph.facebook.com/v18.0/{PhoneNumberID}/messages` — Send message
- POST `https://graph.facebook.com/v18.0/{WABA_ID}/message_templates` — Submit template
- GET `https://graph.facebook.com/v18.0/{WABA_ID}/message_templates` — List templates
- GET `https://graph.facebook.com/v18.0/{PhoneNumberID}/message_templates` — Phone templates
- POST `https://graph.facebook.com/v18.0/{WABA_ID}/phone_numbers/{PhoneID}/verify` — Verify phone

**Webhook:**
- Endpoint: `/webhook` (configured in Meta Developer Portal)
- Verify token: configured in vendor_settings
- Handles incoming messages, delivery receipts, read receipts

**Current Configuration (stored in vendor_settings):**
```
WABA ID: 1489144202555937 (NEW)
Phone ID: 1096981900174659
Phone: +91 96995 77641
Access Token: [NEW token — see Part 1]
```

### WhatsApp Templates
- Templates are stored in `whatsapp_templates` table
- Status values: pending, approved, rejected, dismissed
- Templates must be approved by Meta before use
- Category determines approval speed: MARKETING > UTILITY > AUTHENTICATION

**Current template status:** DB table is EMPTY — no templates stored in DB yet.
Templates need to be submitted and approved via the platform or directly at business.facebook.com.

### Current Issues with wa-invictus.in
1. **Configured with OLD WABA (950925817426282)** — that WABA is disconnected. Platform still points to old config.
2. **Needs update in vendor_settings** to:
   - whatsapp_business_account_id → 1489144202555937
   - whatsapp_access_token → NEW token
   - current_phone_number_id → 1096981900174659
3. **Phone verification:** PENDING (OTP rate-limited, retry ~July 7)
4. **Meta App Review:** Not submitted. App still in Development mode.

### To Update WhatsApp Config:
```sql
UPDATE vendor_settings SET value='EAANd1ZBuQMYsBR6COIBY39MGtbNkqheAWIRTFijCtHbIT2x3X6XqC5FEBrFUZAcbOd8vxCCyUB1casGgwHjzLh1jZAYyw5mzHEBXc4cOrU4ZCfIy7mQ8ZAvVC5Os2yFhnSOLpGd7gdQ8RemrbKQXkfWt12zfFP34ABrRoCDfSMOnJQmqLPb8eV39rUauGyn61ztKbzR3XQ4ZC65cJTzlizGXY407AFkegG1Svoy7l6jZB3J8IjHPfwSKQLrtVk2ow6FDwNLsZCffQVk42Bg2BKfiCdOMMMxIiS6I93VIEAZDZD' WHERE name='whatsapp_access_token';
UPDATE vendor_settings SET value='1489144202555937' WHERE name='whatsapp_business_account_id';
UPDATE vendor_settings SET value='1096981900174659' WHERE name='current_phone_number_id';
```

---

## PART 3: REPUTATIONOS — FULL TECHNICAL BREAKDOWN

### What It Is
Review automation SaaS. Businesses install it → customers scan QR after service → rate 1-5 stars → AI generates personalized Google review → copy & paste to Google Maps.

### Live URL
- **App:** https://reputation.invictus-ai.in
- **Status:** WORKING but SSL is self-signed (browser warning)
- **Demo Feedback Page:** https://reputation.invictus-ai.in/demo-clinic/feedback
- **Portal Login:** https://reputation.invictus-ai.in/portal/login (password: reputation2026)

### Hosting
- **Type:** Docker container on VPS (187.124.99.189)
- **Container Name:** reputation-os
- **Network:** traefik_shared
- **Container Port:** 3000
- **Internal Network:** http://reputation-os:3000
- **Traefik Route:** reputation.invictus-ai.in → reputation-os:3000

### Stack
- **Frontend:** Next.js 14 (App Router, TypeScript)
- **Database:** Supabase Cloud (ubmhweqjhfezgqbkysvp.supabase.co)
- **AI:** Gameron API (currently DEAD — needs swap)
- **QR Generation:** qrcode npm package
- **Auth:** Password cookie (portal), none for customer forms
- **Container:** node:24-alpine with PM2

### Supabase Schema

**businesses**
| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| owner_id | TEXT | Google OAuth subject |
| slug | TEXT | Unique URL slug |
| name | TEXT | Business name |
| type | TEXT | clinic/restaurant/salon/retail/other |
| logo_url | TEXT | nullable |
| accent_color | TEXT | Hex color, default #00C48C |
| tagline | TEXT | nullable |
| google_business_name | TEXT | For AI review generation |
| google_maps_url | TEXT | Embed link |
| owner_name | TEXT | e.g. "Dr. Priya Sharma" |
| owner_title | TEXT | e.g. "Chief Dentist" |
| service_list | JSONB | Array of service names |
| ai_style | TEXT | simple/casual/enthusiastic/formal |
| ai_custom_instructions | TEXT | Custom AI prompt additions |
| channels | JSONB | Channel config object |
| total_reviews | INT | Denormalized count |
| average_rating | FLOAT | Denormalized avg |
| this_month_reviews | INT | Denormalized monthly count |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

**contacts**
| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| business_id | UUID | FK → businesses |
| name | TEXT | Customer name |
| phone | TEXT | Phone number |
| email | TEXT | nullable |
| last_service_date | DATE | |
| last_reminder_sent | TIMESTAMPTZ | |
| last_feedback_date | TIMESTAMPTZ | |
| last_rating | INT | 1-5 |
| total_visits | INT | |

**reminders**
| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| business_id | UUID | FK → businesses |
| contact_id | UUID | FK → contacts |
| appointment_date | DATE | When service was done |
| trigger_type | TEXT | after_visit/scheduled/manual |
| trigger_days_after | INT | Days until reminder fires |
| status | TEXT | pending/sent/clicked/feedback_received/failed |
| channel | TEXT | whatsapp/sms/email/null |
| scheduled_for | TIMESTAMPTZ | When to send |
| sent_at | TIMESTAMPTZ | |
| clicked_at | TIMESTAMPTZ | |

**feedbacks**
| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| business_id | UUID | FK → businesses |
| contact_id | UUID | FK → contacts, nullable |
| contact_name | TEXT | Name entered on form |
| rating | INT | 1-5 |
| liked_items | JSONB | Array of liked item strings |
| comment | TEXT | Optional comment |
| generated_review | TEXT | AI output |
| review_copied | BOOLEAN | Whether customer copied |
| review_copied_at | TIMESTAMPTZ | |
| channel | TEXT | qr/whatsapp/sms/email/kiosk/link |
| qr_location | TEXT | "counter", "entrance", etc. |
| reminder_id | UUID | FK → reminders |
| created_at | TIMESTAMPTZ | |

**qr_codes**
| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| business_id | UUID | FK → businesses |
| location_tag | TEXT | e.g. "Reception Counter" |
| url_slug | TEXT | Unique identifier |
| image_url | TEXT | base64 PNG data URL |
| total_scans | INT | Scan counter |
| created_at | TIMESTAMPTZ | |

### Business Type Presets

**liked_items by type:**
```
clinic:       staff, treatment, cleanliness, price, ambiance, speed
restaurant:    food, service, ambiance, cleanliness, price, speed
salon:         staff, service, ambiance, cleanliness, price, result
retail:        staff, product_quality, variety, cleanliness, price, service
other:         staff, service, quality, cleanliness, price, convenience
```

**channels JSONB default:**
```json
{
  "qr_enabled": true,
  "whatsapp_enabled": false,
  "sms_enabled": false,
  "email_enabled": false,
  "kiosk_enabled": false,
  "reminder_delay_days": 1,
  "review_delivery": "copy",
  "high_rating_threshold": 4
}
```

### Key API Routes

```
GET  /api/business/[slug]              — Get business for feedback page
POST /api/feedback/submit              — Submit feedback + generate review
POST /api/feedback/[id]/copy          — Mark review as copied
POST /api/ai/generate-review          — Standalone AI review generator

GET  /api/business                    — Get current business
PATCH /api/business                  — Update business settings
GET  /api/business/stats              — Dashboard stats

GET  /api/contacts                   — List contacts
POST /api/contacts                   — Add contact
POST /api/contacts/import             — CSV import

POST /api/appointments/mark-complete  — Mark service done → create reminder

GET  /api/feedbacks                  — All feedbacks
GET  /api/reminders                  — All reminders

GET  /api/qr                         — List QR codes
POST /api/qr/generate                — Generate QR PNG

GET  /api/cron/process-reminders     — Cron: fire pending reminders
```

### AI Review Generation
Located in: `src/lib/ai/review-generator.ts`

The AI takes:
- rating (1-5), liked_items[], contact_name, business info (name, owner, services, type)
- style (simple/casual/enthusiastic/formal)
- custom_instructions

Output: 3-5 sentence personalized Google review, no markdown, no emojis, ends with ⭐⭐⭐⭐⭐

**Current status:** Gameron API is DEAD. AI fallback generates template reviews. Must swap to a working AI provider.

**To swap AI:** Edit `src/lib/ai/review-generator.ts` — only the fetch() call to the AI API needs changing.

### File Structure
```
src/
├── app/
│   ├── [slug]/
│   │   ├── feedback/page.tsx        ← Customer feedback form (main)
│   │   ├── kiosk/page.tsx           ← Fullscreen tablet version
│   │   └── page.tsx                ← Redirect to /feedback
│   ├── portal/
│   │   ├── page.tsx               ← Dashboard
│   │   ├── login/page.tsx          ← Password login
│   │   ├── contacts/page.tsx        ← Contact list + import
│   │   ├── appointments/page.tsx   ← Mark visit complete
│   │   ├── reviews/page.tsx         ← All feedbacks
│   │   └── settings/
│   │       ├── profile/page.tsx
│   │       ├── google/page.tsx
│   │       ├── channels/page.tsx
│   │       ├── qr/page.tsx
│   │       └── ai/page.tsx
│   └── api/                        ← All API routes
├── lib/
│   ├── supabase/client.ts            ← Browser Supabase client
│   ├── supabase/server.ts            ← Server Supabase client
│   ├── supabase/types.ts             ← Types + liked item presets
│   ├── ai/review-generator.ts        ← AI review generation
│   ├── notifications/engine.ts        ← Channel abstraction
│   └── qr/generator.ts               ← QR PNG generation
└── middleware.ts                    ← Portal auth guard
```

### GitHub
- **Repo:** https://github.com/jarvis-invictus/reputation-os
- **Push:** git@github.com:jarvis-invictus/reputation-os.git

### Environment Variables (for .env.local)
```
NEXT_PUBLIC_SUPABASE_URL=https://ubmhweqjhfezgqbkysvp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[REAL KEY — see Part 1]
SUPABASE_SERVICE_ROLE_KEY=[REAL KEY — see Part 1]
GAMERON_API_KEY=[DEAD — needs replacement]
GAMERON_API_URL=https://api.gameron.me/v1
PORTAL_PASSWORD=reputation2026
NEXTAUTH_SECRET=reputation-super-secret-2026
NEXTAUTH_URL=https://reputation.invictus-ai.in
NEXT_PUBLIC_APP_URL=https://reputation.invictus-ai.in
```

---

## PART 4: OTHER LIVE SYSTEMS

### Mission Control
- **URL:** https://control.invictus-ai.in
- **Auth:** Open
- **VPS Docker:** invictus-mission-control, port 3100

### n8n Workflows
- **URL:** https://n8n.invictus-ai.in
- **Active workflows:** 4 (Scout, Enrichment, Sequence, Reply Triage)
- **Pipeline:** Scout → Enrichment → Lead Routing → Sequence → Social Outreach → Reply Triage → Booking

### Supabase (VPS)
- **URL:** http://187.124.99.189:8000
- **jarvis_memory table** — Memory storage
- **jarvis_sessions table** — Session logs

### ClientPulse
- **URL:** https://portal.invictus-ai.in
- **User:** clientdemo2026

### Zoho Mail
- **URL:** https://mail.zoho.in
- **User:** joyboy7641@gmail.com
- **Password:** Invictus@2026

### Cal.com
- **URL:** https://cal.invictus-ai.in
- **Password:** @800Void

---

## PART 5: KNOWN ISSUES (PRIORITY ORDER)

### CRITICAL
1. **wa-invictus.in WhatsApp config is OUTDATED** — still using old WABA 950925817426282 (disconnected). Needs update to new WABA 1489144202555937. SQL update in Part 2.
2. **ReputationOS SSL BROKEN** — reputation.invictus-ai.in has self-signed cert. Browser warning. Fix: update Traefik config to request Let's Encrypt cert for the subdomain.
3. **Gameron API DEAD** — ReputationOS AI review generation won't work. Must swap to OpenAI, Gemini, or another provider.

### HIGH PRIORITY
4. **Supabase RLS blocking reads** — anon key can't read businesses/feedbacks tables. Fix: disable RLS on all tables, or add anon-key SELECT policies.
5. **WhatsApp phone verification** — PENDING. OTP rate-limited. Retry after ~July 7.
6. **WhatsApp Advanced Access** — App still in Development mode. Must submit for Meta App Review to get whatsapp_business_messaging permission approved.

### MEDIUM
7. **ReputationOS anon key wrong** — NEXT_PUBLIC_SUPABASE_ANON_KEY has .placeholder suffix. Needs real key from Supabase dashboard.
8. **Cold email DNS** — domains invictusai.site/.online/.tech purchased but DNS not configured. Outreach paused.
9. **WhatsApp phone limit** — 1/1 reached. Need to request increase via Meta Business Support.

---

## PART 6: FIX PROCEDURES

### Fix 1: Update wa-invictus.in to New WhatsApp Config
```sql
-- Run via Hostinger phpMyAdmin or SSH MySQL:
UPDATE vendor_settings SET value='EAANd1ZBuQMYsBR6COIBY39MGtbNkqheAWIRTFijCtHbIT2x3X6XqC5FEBrFUZAcbOd8vxCCyUB1casGgwHjzLh1jZAYyw5mzHEBXc4cOrU4ZCfIy7mQ8ZAvVC5Os2yFhnSOLpGd7gdQ8RemrbKQXkfWt12zfFP34ABrRoCDfSMOnJQmqLPb8eV39rUauGyn61ztKbzR3XQ4ZC65cJTzlizGXY407AFkegG1Svoy7l6jZB3J8IjHPfwSKQLrtVk2ow6FDwNLsZCffQVk42Bg2BKfiCdOMMMxIiS6I93VIEAZDZD' WHERE name='whatsapp_access_token';
UPDATE vendor_settings SET value='1489144202555937' WHERE name='whatsapp_business_account_id';
UPDATE vendor_settings SET value='1096981900174659' WHERE name='current_phone_number_id';
```
Then clear Laravel cache: `php artisan config:clear && php artisan cache:clear`

### Fix 2: ReputationOS SSL Certificate
The Traefik config at `/var/lib/docker/volumes/traefik_config/_data/reputation.yml` needs to be correct.
```yaml
http:
  routers:
    reputation:
      rule: "Host(`reputation.invictus-ai.in`)"
      entryPoints:
        - websecure
      service: reputation-svc
      tls:
        certResolver: le
  services:
    reputation-svc:
      loadBalancer:
        servers:
          - url: "http://reputation-os:3000"
```
Restart traefik: `docker restart traefik-traefik-1`
The ACME challenge needs HTTP (port 80) to reach the app. If the global redirect breaks it, add a specific route for `.well-known/acme-challenge` before the redirect.

### Fix 3: Supabase RLS
In Supabase dashboard → Authentication → Row Level Security → select each table → disable or add:
```sql
-- Allow anon key to read (add via Supabase SQL Editor):
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anon reads" ON businesses FOR SELECT USING (true);
CREATE POLICY "Allow anon inserts" ON businesses FOR INSERT WITH CHECK (true);
-- Repeat for contacts, feedbacks, reminders, qr_codes
```
Or simply disable RLS on all tables (faster for demo).

### Fix 4: Swap AI Provider for ReputationOS
Edit `src/lib/ai/review-generator.ts`. Replace the Gameron fetch() call with OpenAI, Gemini, or any LLM:

```typescript
// Example: OpenAI
const response = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: USER_PROMPT }
    ]
  })
});
```

Commit, push, rebuild on VPS.

### Fix 5: WhatsApp Phone Verification
1. Go to business.facebook.com → WhatsApp → your WABA
2. Click the phone number → "Verify via SMS" or "Verify via Voice Call"
3. Enter the 6-digit code
4. If rate-limited: wait 7 days (~July 7) then retry

### Fix 6: WhatsApp Advanced Access (App Review)
1. Go to developers.facebook.com → your app
2. Add permissions: whatsapp_business_messaging
3. Write a 1-paragraph use case
4. Submit for review
5. Takes 1-7 days

---

## PART 7: SALES & PRICING

### India Market
| Service | Price |
|---|---|
| Standard website | ₹8,000 |
| Premium website | ₹14,000 |
| AI Chatbot add-on | ₹3,000 setup + ₹1,200/mo |
| WhatsApp AI Agent add-on | ₹5,000 setup + ₹2,000/mo |
| SMMA Meta Ads | ₹8,000–15,000/mo |

### US Market (Pressure Washing)
- **$1,500–3,000/month** per client
- Target cities: Cape Coral FL, Myrtle Beach SC, Shreveport LA, Wilmington NC, Allen TX, Scottsdale AZ, Charleston SC, Chattanooga TN, Huntsville AL, Pensacola FL

### ReputationOS Pricing
- Setup: ₹3,000 (one-time)
- Monthly: ₹2,000/month
- US: $99 setup + $49/month

---

## PART 8: AGENT FLEET

- **Jarvis** — Main coordinator (this agent)
- **Elon** — Fleet Commander
- **Linus** — Coder/Builder
- **Gary** — Marketing
- **Jordan** — Sales/outreach
- **Warren** — Strategy
- **Ray** — Finance
- **Jony** — Designer
- **Steve** — Creative
- **Jeff** — Delivery
- **Friend/Ganesh** — Support

All persistent agents. Sub-agents on-demand only.

---

## PART 9: REVENUE HISTORY
- Elite Travels: ₹30,000
- Bloom Interio: ₹4,000
- Word Events: ₹6,000
- Reach Royals: ₹2,000
- **Total lifetime:** ~₹42,000

## Financial Reality
- Living costs ₹6K/mo covered by brother Sumit (forex trader)
- VPS + hosting + domains: Sumit-funded
- Monthly API spend: self-funded
- Current burn rate: ~₹9K/month
- **Revenue is URGENT.**

---

*Document prepared: June 30, 2026*
*Last updated by: Jarvis (COO, Invictus AI)*
