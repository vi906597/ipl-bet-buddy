
-- Matches table for admin to manage
CREATE TABLE public.matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_key text UNIQUE NOT NULL,
  team_a_id text NOT NULL,
  team_a_name text NOT NULL,
  team_a_short text NOT NULL,
  team_b_id text NOT NULL,
  team_b_name text NOT NULL,
  team_b_short text NOT NULL,
  status text NOT NULL DEFAULT 'upcoming',
  start_time timestamp with time zone NOT NULL DEFAULT now(),
  winner_team_id text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can view matches
CREATE POLICY "Anyone can view matches" ON public.matches
  FOR SELECT TO authenticated USING (true);

-- Only allow insert/update/delete via service role (admin edge function)
-- No direct user insert/update/delete policies
