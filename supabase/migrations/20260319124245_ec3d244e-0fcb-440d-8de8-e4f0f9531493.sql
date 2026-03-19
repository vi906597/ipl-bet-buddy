
-- QR codes table for admin to manage payment QR codes
CREATE TABLE public.qr_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL DEFAULT '',
  image_url text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.qr_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active QR codes" ON public.qr_codes FOR SELECT TO authenticated USING (is_active = true);

-- Deposit requests table
CREATE TABLE public.deposit_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  screenshot_url text,
  user_email text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.deposit_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own deposit requests" ON public.deposit_requests FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own deposit requests" ON public.deposit_requests FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own deposit requests" ON public.deposit_requests FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Withdraw requests table
CREATE TABLE public.withdraw_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  method text NOT NULL DEFAULT 'upi',
  upi_id text,
  account_number text,
  ifsc_code text,
  bank_name text,
  account_holder_name text,
  status text NOT NULL DEFAULT 'pending',
  user_email text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.withdraw_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own withdraw requests" ON public.withdraw_requests FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own withdraw requests" ON public.withdraw_requests FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Storage bucket for screenshots
INSERT INTO storage.buckets (id, name, public) VALUES ('screenshots', 'screenshots', true);
CREATE POLICY "Users can upload screenshots" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'screenshots');
CREATE POLICY "Anyone can view screenshots" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'screenshots');
