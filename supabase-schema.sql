-- OneQR Database Schema
-- Created: 2026-03-26

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  plan_type TEXT DEFAULT 'free' CHECK (plan_type IN ('free', 'single', 'unlimited')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- QR Codes table
CREATE TABLE public.qr_codes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  short_code TEXT UNIQUE NOT NULL,
  destination_url TEXT NOT NULL,
  is_editable BOOLEAN DEFAULT FALSE,
  qr_data JSONB, -- Stores QR customization (colors, logo, etc.)
  scan_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Indexes
  CONSTRAINT short_code_format CHECK (short_code ~ '^[a-zA-Z0-9_-]+$')
);

-- Payments table
CREATE TABLE public.payments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  stripe_payment_intent_id TEXT UNIQUE NOT NULL,
  amount INTEGER NOT NULL, -- Amount in cents
  currency TEXT DEFAULT 'usd',
  plan_type TEXT NOT NULL CHECK (plan_type IN ('single', 'unlimited')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'succeeded', 'failed', 'refunded')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scans analytics table
CREATE TABLE public.qr_scans (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  qr_code_id UUID REFERENCES public.qr_codes(id) ON DELETE CASCADE,
  scanned_at TIMESTAMPTZ DEFAULT NOW(),
  user_agent TEXT,
  ip_address INET,
  country TEXT,
  city TEXT,
  referrer TEXT
);

-- Indexes for performance
CREATE INDEX idx_qr_codes_user_id ON public.qr_codes(user_id);
CREATE INDEX idx_qr_codes_short_code ON public.qr_codes(short_code);
CREATE INDEX idx_payments_user_id ON public.payments(user_id);
CREATE INDEX idx_qr_scans_qr_code_id ON public.qr_scans(qr_code_id);
CREATE INDEX idx_qr_scans_scanned_at ON public.qr_scans(scanned_at DESC);

-- Row Level Security (RLS) Policies

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_scans ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- QR Codes policies
CREATE POLICY "Users can view their own QR codes"
  ON public.qr_codes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own QR codes"
  ON public.qr_codes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own editable QR codes"
  ON public.qr_codes FOR UPDATE
  USING (auth.uid() = user_id AND is_editable = TRUE);

CREATE POLICY "Users can delete their own QR codes"
  ON public.qr_codes FOR DELETE
  USING (auth.uid() = user_id);

-- Payments policies
CREATE POLICY "Users can view their own payments"
  ON public.payments FOR SELECT
  USING (auth.uid() = user_id);

-- QR Scans policies (public read for analytics)
CREATE POLICY "Users can view scans for their QR codes"
  ON public.qr_scans FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.qr_codes
      WHERE qr_codes.id = qr_scans.qr_code_id
      AND qr_codes.user_id = auth.uid()
    )
  );

-- Functions

-- Function to increment scan count
CREATE OR REPLACE FUNCTION increment_scan_count(qr_code_short_code TEXT)
RETURNS void AS $$
BEGIN
  UPDATE public.qr_codes
  SET scan_count = scan_count + 1
  WHERE short_code = qr_code_short_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_qr_codes_updated_at
  BEFORE UPDATE ON public.qr_codes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on auth.users insert
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
