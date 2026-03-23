# OneQR - Product Requirements Document

## Vision

A simple, honest QR code generator app that doesn't trick users with expiring codes, hidden limits, or aggressive subscriptions.

**Tagline ideas:**
- "One QR. Done."
- "QR codes that never expire."
- "No tricks. No limits. Just QR."

---

## Target Users

- Regular people sharing WiFi, contacts, links
- Small businesses (menus, business cards, product info)
- Content creators linking to social profiles
- Anyone who's been burned by scammy QR apps

---

## Core Philosophy

### What We Believe
- QR codes are just encoded text in an image - they cost nothing to generate
- Static QR codes should be free forever
- Only charge when providing real value (editing without reprinting)
- No login required for basic functionality
- Works offline
- Non-intrusive monetization (banner ads, not popups)

### What Competitors Do Wrong
| Problem | Our Solution |
|---------|--------------|
| "Free" codes expire after trial | Static codes never expire |
| Hidden scan limits (100-500) | Unlimited scans |
| Watermarks on free tier | No watermarks |
| Requires account/login | No login needed |
| Aggressive upsells and popups | Non-intrusive banner ads only |
| Codes stop working after canceling sub | Static codes work forever |
| Can't work offline | Offline generation |

---

## How QR Codes Actually Work

### First Principles

A QR code is **data encoded as a visual pattern**. The black/white squares represent 1s and 0s.

```
Input:  "https://google.com"
        ↓
Process: Convert text → binary → visual pattern
        ↓
Output: [QR code image]
```

**There is no server required. No internet needed. No ongoing cost.**

### Static vs Dynamic QR Codes

**Static QR Code:**
```
QR contains: "https://yoursite.com/menu.pdf"
             ↓
Scan → Goes directly to yoursite.com/menu.pdf
```
- Data baked into image
- Never expires
- No middleman
- Costs nothing

**Dynamic QR Code:**
```
QR contains: "https://qrcompany.com/abc123"
             ↓
Scan → Goes to qrcompany.com/abc123
             ↓
Their server redirects → yoursite.com/menu.pdf
```
- Points to a redirect server
- Can change destination without reprinting
- Company controls the redirect = can charge rent

**Key insight:** Competitors aren't selling QR codes. They're selling redirect services and calling it a QR code.

### QR Code Capacity

| Type | Max Capacity |
|------|--------------|
| Numeric only | ~7,000 digits |
| Alphanumeric | ~4,200 characters |
| Binary/bytes | ~2,900 bytes |
| UTF-8 text | ~1,800 characters |

This is enough for URLs, WiFi credentials, vCards, plain text, SMS templates, and calendar events.

---

## Business Model

### The Smart Approach

All QR codes route through our server by default, but work exactly like static codes (instant redirect, no tracking shown to user).

When user wants to **edit** the destination later:

```
┌─────────────────────────────────────────┐
│  "Your QR is printed. Two options:"     │
│                                         │
│  [Generate New QR - Free]               │
│   You'll need to reprint                │
│                                         │
│  [Update This QR - $5.99 one-time]      │
│   Same QR, new destination              │
└─────────────────────────────────────────┘
```

### Why This Works

We charge at the **moment of maximum value**:
- User already printed/used the QR
- They made a mistake OR their URL changed
- Reprinting costs them time/money anyway

$5.99 feels like a bargain vs:
- Reprinting business cards ($50+)
- Reprinting menus ($20+)
- Reprinting flyers/posters ($30+)

### Pricing Tiers (Consider)

| Option | Price | Use Case |
|--------|-------|----------|
| Single edit | $5.99 | One-time fix |
| Unlimited edits (this QR) | $9.99 | Businesses that update often |
| Unlimited edits (all QRs) | $19.99/year | Power users |

### Revenue Projections

Assumptions:
- 10,000 monthly active users
- 5% need to edit a QR at some point
- 50% of those pay $5.99 (vs reprinting)

```
10,000 × 5% × 50% × $5.99 = $1,497/month
```

Server cost: ~$20/month

**Plus banner ad revenue on top.**

---

## Features

### MVP (v1.0)

**QR Generation:**
- URL
- WiFi credentials (SSID, password, encryption type)
- Plain text
- vCard (contact info)
- SMS (phone + message template)
- Email (address + subject + body)

**Core UX:**
- One-tap generation
- Preview before saving
- Save to photo gallery
- Copy to clipboard
- Share sheet integration
- QR history (stored locally)
- Works offline

**Monetization:**
- Non-intrusive banner ads
- Edit/update QR upsell ($5.99)

### v1.1

- QR Scanner (read any QR)
- Custom colors for QR
- Add logo/image to center of QR
- Calendar event QR type

### v2.0

- Analytics dashboard (for paid users)
- Bulk QR generation
- QR templates
- Team/business features

---

## Technical Architecture

### Database Schema

```sql
qr_codes
├── id: varchar (e.g., "abc123")
├── device_id: varchar (anonymous identifier)
├── destination_url: text
├── qr_type: enum (url, wifi, vcard, text, sms, email)
├── metadata: jsonb (type-specific data)
├── created_at: timestamp
├── is_editable: boolean (default false)
├── edit_unlocked_at: timestamp (null until paid)
└── scan_count: integer (optional, for analytics)
```

### Redirect Server

Minimal service:
```
GET /q/{id} → 302 redirect to destination_url
```

A $5/month VPS can handle millions of redirects.

### Mobile App Stack Options

**Option A: React Native**
- Cross-platform (iOS + Android)
- Single codebase
- Good QR libraries available

**Option B: Flutter**
- Cross-platform
- Better performance
- Growing ecosystem

**Option C: Native**
- iOS: Swift + CoreImage (built-in QR generation)
- Android: Kotlin + ZXing
- Best performance, more work

### QR Generation Libraries

- **iOS:** CoreImage CIQRCodeGenerator (native, no dependencies)
- **Android:** ZXing (zxing/zxing)
- **React Native:** react-native-qrcode-svg
- **Flutter:** qr_flutter

---

## User Experience

### Transparency is Key

At QR creation, show:
> "Your QR routes through our servers so you can update it later without reprinting. First edit is free within 24 hours."

This makes the upsell feel like a **feature**, not a trap.

### Free Edit Window

Allow free edits within 24 hours of creation:
- Catches genuine mistakes
- Builds goodwill
- Doesn't hurt revenue (they haven't printed yet)

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Server goes down = all QRs break | Redundant hosting, uptime monitoring, status page |
| App shuts down | Offer "export to static" option, open-source redirect logic |
| Users feel tricked | Be transparent about how it works upfront |
| Privacy concerns | Don't track scan analytics unless user opts in |
| Competitors copy model | Move fast, build brand loyalty |

---

## Competitive Differentiation

### Marketing Angle

"We don't charge for QR codes. They're free to generate. We only charge if you want to change where it points without reprinting."

### Reddit/Social Proof Strategy

Based on research, Reddit users hate:
- Expiring codes
- Hidden scan limits
- Aggressive upsells
- Watermarks

Our app is the antithesis of all of this. Perfect for organic Reddit marketing.

---

## Success Metrics

| Metric | Target (6 months) |
|--------|-------------------|
| Downloads | 50,000 |
| MAU | 10,000 |
| QRs generated | 100,000 |
| Edit conversion rate | 2.5% |
| Revenue | $1,500/month |
| App Store rating | 4.5+ stars |

---

## Open Questions

1. Should we offer a "truly static" option that doesn't route through our servers? (Pros: trust. Cons: can't monetize edits)
2. What analytics should we show for free vs paid?
3. Should we support QR scanning in v1 or wait?
4. Custom domains for business users?

---

## Domain & Branding

**Selected:** oneqr.com (verify availability on registrar)

**Backup options:**
- qrpop.com
- liteqr.app
- fastqr.app

---

## Next Steps

1. Verify domain availability and register
2. Choose tech stack (React Native recommended for speed)
3. Design wireframes
4. Build MVP
5. Beta test
6. Launch on Product Hunt + Reddit

---

*Document created: March 2025*
*Last updated: March 2025*
