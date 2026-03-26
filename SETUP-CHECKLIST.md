# OneQR Setup Checklist

## Completed ✅

### 1. Supabase
- [x] Project created: `jadsekirvvqzgehdzoji`
- [x] Database schema deployed (profiles, qr_codes, payments, qr_scans)
- [x] Row Level Security (RLS) enabled
- [x] Auth configured for magic links
- [x] Site URL set to `https://theqrspot.com`
- [x] API keys generated and stored

**Access:**
- Dashboard: https://supabase.com/dashboard/project/jadsekirvvqzgehdzoji
- Database: https://jadsekirvvqzgehdzoji.supabase.co

### 2. PostHog Analytics
- [x] Project token received: `phc_tYc8K9SwhbH67AwXOoHhqmE3n0M5TWqtuQ9WPFsRhkU`
- [x] Host: `https://us.i.posthog.com`

---

## Pending ⏳

### 3. Stripe Payment Processing
- [ ] Create Stripe account at https://stripe.com (use info@heliosinnovations.org)
- [ ] Get publishable key (starts with `pk_test_...`)
- [ ] Get secret key (starts with `sk_test_...`)
- [ ] Set up webhook endpoint: `https://theqrspot.com/api/webhooks/stripe`
- [ ] Get webhook signing secret (starts with `whsec_...`)
- [ ] Add product prices:
  - $3.99 - Single Editable QR Code
  - $9.99 - Unlimited Editable QR Codes (one-time payment)

**Webhook events to listen for:**
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `charge.refunded`

### 4. Vercel Deployment
- [ ] Add environment variables to Vercel project
- [ ] Configure custom domain: `theqrspot.com`
- [ ] Set up Vercel Edge Functions for QR redirects
- [ ] Test deployment

### 5. Domain Configuration
- [ ] Point `theqrspot.com` DNS to Vercel
- [ ] Verify SSL certificate
- [ ] Test magic link emails (will use Supabase's SMTP)

---

## Environment Variables to Add

Copy `.env.local.template` to `.env.local` and fill in the Stripe keys.

For Vercel deployment, add these in **Settings → Environment Variables**:

```bash
# Supabase (READY)
NEXT_PUBLIC_SUPABASE_URL=https://jadsekirvvqzgehdzoji.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...ngM
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...izE

# Stripe (PENDING)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# PostHog (READY)
NEXT_PUBLIC_POSTHOG_KEY=phc_tYc8K9SwhbH67AwXOoHhqmE3n0M5TWqtuQ9WPFsRhkU
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com

# Site
NEXT_PUBLIC_SITE_URL=https://theqrspot.com
NEXT_PUBLIC_APP_NAME=The QR Spot
```

---

## Implementation Plan

Once Stripe is set up:

1. **Auth & User Management**
   - Sign up / Sign in with magic links
   - User profile page
   - Plan management (free → paid upgrade)

2. **QR Code Generation**
   - Free tier: Static QR codes (unlimited)
   - Paid tier: Editable QR codes with short URLs

3. **Payment Flow**
   - Stripe Checkout for $3.99 or $9.99
   - Webhook handling for payment confirmation
   - Update user plan in Supabase

4. **QR Redirect Service**
   - Vercel Edge Function at `/r/[shortCode]`
   - Track scans in `qr_scans` table
   - Update scan count

5. **Analytics Dashboard**
   - PostHog event tracking:
     - Page views
     - QR generator usage
     - "More" button clicks
     - QR downloads/saves/prints
   - User dashboard with scan analytics

---

## Next Steps

**Waiting on:**
1. Stripe account setup + API keys
2. Domain DNS configuration (if not done yet)

**Ready to start coding once:**
- Stripe keys are provided
- Environment variables are added to Vercel
