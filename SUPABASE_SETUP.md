# Supabase Setup for OneQR

## Manual Setup Required

The Supabase API blocked automated project creation. Follow these steps manually:

### 1. Create Project

1. Go to https://supabase.com/dashboard
2. Select org: **Helios Innovations** (gfgkqspokzkehrwhzirm)
3. Click "New Project"
4. Settings:
   - Name: `oneqr`
   - Database Password: `OneQR#2026!Secure`
   - Region: `US East (North Virginia)`
   - Plan: Free

### 2. Create Database Schema

Run this SQL in the Supabase SQL Editor:

```sql
CREATE TABLE qr_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  short_code VARCHAR(10) UNIQUE NOT NULL,
  original_url TEXT NOT NULL,
  destination_url TEXT NOT NULL,
  is_dynamic BOOLEAN DEFAULT false,
  user_email VARCHAR(255) NOT NULL,
  paid_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now(),
  last_edited_at TIMESTAMP,
  scan_count INTEGER DEFAULT 0
);

CREATE INDEX idx_short_code ON qr_codes(short_code);
CREATE INDEX idx_user_email ON qr_codes(user_email);
```

### 3. Enable Authentication

1. Go to Authentication → Providers
2. Enable **Email** provider
3. Enable Magic Link
4. Disable email confirmation (for faster dev)
5. Configure email templates (optional)

### 4. Get Credentials

After project creation, get these from Settings → API:

- Project URL
- `anon` key (public)
- `service_role` key (private)

### 5. Add to `.env.local`

```env
NEXT_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon-key]
SUPABASE_SERVICE_ROLE_KEY=[service-role-key]
```

### 6. Install Supabase Client

```bash
npm install @supabase/supabase-js
```

## Automation Note

Once the project is created manually, future schema migrations can be automated via SQL scripts.
