# OneQR - Product Requirements Document

## Product Vision

Simple, honest QR code generator with no limits, no expiring codes, and no tricks. Free to generate, pay once to edit forever.

## Target Audience

- Individuals who need QR codes for personal use
- Small businesses with printed materials (menus, flyers, business cards)
- Event organizers who need to update QR destinations post-print
- Anyone frustrated by subscription-based QR services

## Core Value Proposition

- **Free tier:** Generate unlimited static QR codes, no account needed
- **One-time payment:** $9.99 per QR or $19.99 for unlimited editable QRs
- **No subscriptions:** Pay once, edit forever
- **Honest pricing:** Only charge when you use redirect functionality

---

## User Flows

### Flow 1: Free Static QR Generation (No Account Required)

**Steps:**
1. User lands on homepage
2. User enters URL or text in input field
3. Click "Generate QR Code"
4. QR code displays instantly (client-side generation)
5. Options shown:
   - Download PNG
   - Download SVG
   - Print
   - "Save to edit later" (optional)

**Technical Details:**
- QR generated client-side using JavaScript library (no server call)
- QR points directly to user's URL (e.g., `https://example.com`)
- No database entry created
- No redirect server involved

---

### Flow 2: Save QR for Future Editing (Free + Email Required)

**Steps:**
1. User generates static QR (Flow 1)
2. User clicks "Save to edit later"
3. Prompt: "Enter email to save this QR"
4. User enters email → magic link sent
5. User clicks magic link → authenticated
6. Database entry created:
   ```json
   {
     "short_code": "abc123",
     "original_url": "https://example.com",
     "destination_url": "https://example.com",
     "is_dynamic": false,
     "user_email": "user@example.com",
     "paid_at": null,
     "created_at": "2026-03-23T00:00:00Z",
     "last_edited_at": null
   }
   ```
7. QR still points to original URL (not `oneqr.app/abc123` yet)
8. User can view saved QR in dashboard

**Technical Details:**
- Database stores QR metadata
- `is_dynamic: false` means no redirect server involvement
- Original QR still works (points to original URL)
- User can download again from dashboard

---

### Flow 3: Edit QR Code (Paid - $9.99)

**Steps:**
1. User opens dashboard → clicks "Edit" on saved QR
2. **Paywall shown immediately:** "Pay $9.99 to make this QR editable"
3. User pays via Stripe → payment confirmed
4. User prompted: "Enter new destination URL"
5. User enters new URL
6. Database updated:
   ```json
   {
     "destination_url": "https://newurl.com",
     "is_dynamic": true,  // FLAG FLIPPED
     "paid_at": "2026-03-23T01:00:00Z",
     "last_edited_at": "2026-03-23T01:00:00Z"
   }
   ```
7. **New QR code generated** with redirect URL: `oneqr.app/abc123`
8. Warning shown: "⚠️ Your old QR won't work anymore. Download and print this new QR."
9. User downloads new QR code

**Technical Details:**
- Old QR becomes invalid (still points to original URL)
- New QR points to `oneqr.app/abc123` (redirect URL)
- Redirect server now handles this QR (because `is_dynamic: true`)
- User can edit destination URL unlimited times (already paid)

---

### Flow 4: Future Edits (Free After First Payment)

**Steps:**
1. User opens dashboard → clicks "Edit" on paid QR
2. No paywall (already paid)
3. User enters new destination URL
4. Database updated:
   ```json
   {
     "destination_url": "https://anotherurl.com",
     "last_edited_at": "2026-03-23T02:00:00Z"
   }
   ```
5. Redirect updates instantly (no need to reprint QR)
6. Same QR code (`oneqr.app/abc123`) now points to new URL

**Technical Details:**
- QR code remains unchanged (still `oneqr.app/abc123`)
- Only database `destination_url` field changes
- Redirect server reads updated URL on next scan
- Unlimited edits allowed

---

## Redirect Server Logic

```javascript
// Edge function at oneqr.app/:shortCode
export async function GET(request, { params }) {
  const { shortCode } = params;

  // Fetch QR from database
  const qr = await db.query(
    'SELECT * FROM qr_codes WHERE short_code = ?',
    [shortCode]
  );

  if (!qr) {
    return Response.redirect('/404', 302);
  }

  // Check if dynamic redirect enabled
  if (!qr.is_dynamic) {
    // This shouldn't happen, but fallback to original URL
    return Response.redirect(qr.original_url, 302);
  }

  // Increment scan count (analytics)
  await db.query(
    'UPDATE qr_codes SET scan_count = scan_count + 1 WHERE id = ?',
    [qr.id]
  );

  // Redirect to current destination
  return Response.redirect(qr.destination_url, 302);
}
```

---

## Pricing

### Option A: Per QR
- **$9.99 per QR code** (one-time payment)
- Unlimited edits for that specific QR
- Good for casual users with 1-2 QRs

### Option B: Unlimited
- **$19.99 for unlimited editable QRs** (one-time payment, account-wide)
- Create and edit unlimited QRs
- Good for power users, businesses, marketers

### Recommendation
Offer both options. Let user choose based on need.

---

## Database Schema

```sql
CREATE TABLE qr_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  short_code VARCHAR(10) UNIQUE NOT NULL,  -- 'abc123'
  original_url TEXT NOT NULL,              -- URL user first entered
  destination_url TEXT NOT NULL,           -- Current redirect target
  is_dynamic BOOLEAN DEFAULT false,        -- false = static, true = redirect
  user_email VARCHAR(255) NOT NULL,
  paid_at TIMESTAMP NULL,                  -- NULL if not paid yet
  last_edited_at TIMESTAMP NULL,           -- NULL if never edited
  scan_count INTEGER DEFAULT 0,            -- Analytics
  created_at TIMESTAMP DEFAULT NOW(),

  INDEX idx_short_code (short_code),
  INDEX idx_user_email (user_email)
);
```

---

## Tech Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **QR Generation:** `qrcode.react` (client-side)
- **Authentication:** NextAuth.js (magic links)
- **Payments:** Stripe Checkout

### Backend
- **Database:** Supabase (PostgreSQL)
- **Redirect Server:** Vercel Edge Functions
- **Analytics:** Supabase (scan count tracking)

### Deployment
- **Hosting:** Vercel
- **Domain:** oneqr.app (or similar)

---

## Monetization Strategy

### Revenue Streams
1. **Paid QR edits:** $9.99 per QR or $19.99 unlimited
2. **Banner ads on free tier:** Non-intrusive ads (~$1-2 CPM)

### Cost Analysis
- **Redirect server:** ~$6/month for 10M redirects (Vercel Edge)
- **Database:** $0/month (Supabase free tier up to 500MB)
- **Break-even:** 2 paid QRs cover 10M monthly redirects

### Projected Revenue (Conservative)
- 100,000 monthly visitors
- 1% conversion to paid tier = 1,000 paid QRs/month
- 1,000 × $9.99 = **$9,990/month**
- Ad revenue (100k × 3 pageviews × $2 CPM) = **$600/month**
- **Total: ~$10,590/month**

---

## Success Metrics

### Acquisition
- Monthly unique visitors
- QR codes generated (free tier)

### Activation
- % of users who save QRs (email signup)
- % of saved QRs that convert to paid

### Revenue
- MRR (Monthly Recurring Revenue) - though it's one-time payments
- Average revenue per user (ARPU)

### Retention
- % of paid users who edit QRs multiple times
- Average edits per paid QR

---

## Competitive Advantages

| Feature | OneQR | QR Monkey | QR Tiger | Bitly |
|---------|-------|-----------|----------|-------|
| **Free static QRs** | ✅ Unlimited | ✅ Limited | ✅ Limited | ✅ Limited |
| **Editable QRs** | $9.99 one-time | $5/mo subscription | $12/mo subscription | $8/mo subscription |
| **No expiration** | ✅ Forever | ❌ Expires if stop paying | ❌ Expires if stop paying | ❌ Expires if stop paying |
| **No account for free tier** | ✅ Yes | ❌ Account required | ❌ Account required | ❌ Account required |
| **Pricing model** | One-time | Monthly | Monthly | Monthly |

**Key differentiator:** One-time payment model with permanent QR ownership.

---

## Future Enhancements (Post-MVP)

### Phase 2
- Analytics dashboard (scan count, location, device type)
- Bulk QR generation (upload CSV)
- Custom QR designs (colors, logos, shapes)
- API access for developers

### Phase 3
- Team accounts (multiple users, shared QRs)
- White-label solution for agencies
- Advanced analytics (heatmaps, A/B testing)

---

## Launch Checklist

**Pre-Launch:**
- [ ] Domain purchased (oneqr.app)
- [ ] Stripe account setup
- [ ] Supabase project created
- [ ] Email magic link configured
- [ ] Redirect server tested (load testing)

**Launch Day:**
- [ ] Deploy to Vercel
- [ ] Submit to Product Hunt
- [ ] Post on Reddit (r/SideProject, r/EntrepreneurRideAlong)
- [ ] Tweet about launch

**Post-Launch:**
- [ ] Monitor error logs (Sentry)
- [ ] Track conversion funnel
- [ ] Collect user feedback
- [ ] Iterate based on data

---

## Open Questions

1. **Short code generation:** Random alphanumeric (e.g., `abc123`) or sequential (e.g., `000001`)?
2. **QR expiration for unpaid saved QRs:** Should free saved QRs expire after 90 days?
3. **Abuse prevention:** How to prevent spam/malicious redirects?
4. **Refund policy:** What if user pays but changes their mind?

---

**Document Version:** 1.0
**Last Updated:** 2026-03-23
**Owner:** Helios Innovations
