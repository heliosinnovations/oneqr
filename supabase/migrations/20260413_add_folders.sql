-- Migration: Add folders system for QR code organization
-- Created: 2026-04-13

-- Create qr_folders table
CREATE TABLE public.qr_folders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT, -- hex color for visual distinction
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on user_id for faster queries
CREATE INDEX idx_qr_folders_user_id ON public.qr_folders(user_id);

-- Add folder_id column to qr_codes table
ALTER TABLE public.qr_codes ADD COLUMN folder_id UUID REFERENCES public.qr_folders(id) ON DELETE SET NULL;

-- Create index on folder_id for faster queries
CREATE INDEX idx_qr_codes_folder_id ON public.qr_codes(folder_id);

-- Enable Row Level Security on qr_folders
ALTER TABLE public.qr_folders ENABLE ROW LEVEL SECURITY;

-- RLS Policies for qr_folders

-- Users can view their own folders
CREATE POLICY "Users can view their own folders"
  ON public.qr_folders FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own folders
CREATE POLICY "Users can create their own folders"
  ON public.qr_folders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own folders
CREATE POLICY "Users can update their own folders"
  ON public.qr_folders FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own folders
CREATE POLICY "Users can delete their own folders"
  ON public.qr_folders FOR DELETE
  USING (auth.uid() = user_id);

-- Add trigger for updated_at on qr_folders
CREATE TRIGGER update_qr_folders_updated_at
  BEFORE UPDATE ON public.qr_folders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
