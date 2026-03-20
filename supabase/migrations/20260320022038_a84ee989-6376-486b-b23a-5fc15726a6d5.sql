
-- Add amount column to qr_codes for per-amount QR codes
ALTER TABLE public.qr_codes ADD COLUMN IF NOT EXISTS amount numeric;

-- Create site_settings table for payment mode config
CREATE TABLE IF NOT EXISTS public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view settings" ON public.site_settings 
  FOR SELECT TO authenticated USING (true);

-- Insert default payment mode
INSERT INTO public.site_settings (key, value) VALUES ('payment_mode', 'manual')
ON CONFLICT (key) DO NOTHING;

-- Add leaderboard_entries table for admin-managed leaderboard
CREATE TABLE IF NOT EXISTS public.leaderboard_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  rank_position integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.leaderboard_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view leaderboard" ON public.leaderboard_entries 
  FOR SELECT TO authenticated USING (true);
