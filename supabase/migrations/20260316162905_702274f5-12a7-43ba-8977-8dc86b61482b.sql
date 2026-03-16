-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL DEFAULT 'Player',
  avatar_url TEXT,
  wallet NUMERIC NOT NULL DEFAULT 5000,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles" ON public.profiles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Create orders table
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  match_id TEXT NOT NULL,
  team_id TEXT NOT NULL,
  team_name TEXT NOT NULL,
  opponent_name TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'matched', 'won', 'lost')),
  matched_with UUID REFERENCES public.orders(id),
  matched_at TIMESTAMPTZ,
  commission NUMERIC DEFAULT 0,
  payout NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own orders" ON public.orders
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own orders" ON public.orders
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view pending orders for matching" ON public.orders
  FOR SELECT TO authenticated USING (status = 'pending');

-- Trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, username)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'username', 'Player'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to place order and match (server-side, secure)
CREATE OR REPLACE FUNCTION public.place_order(
  p_match_id TEXT,
  p_team_id TEXT,
  p_team_name TEXT,
  p_opponent_name TEXT,
  p_amount NUMERIC
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_wallet NUMERIC;
  v_opponent_order public.orders%ROWTYPE;
  v_new_order_id UUID;
  v_result JSONB;
BEGIN
  SELECT wallet INTO v_wallet FROM public.profiles WHERE user_id = v_user_id FOR UPDATE;
  IF v_wallet < p_amount THEN
    RETURN jsonb_build_object('error', 'Insufficient balance');
  END IF;

  UPDATE public.profiles SET wallet = wallet - p_amount, updated_at = now() WHERE user_id = v_user_id;

  INSERT INTO public.orders (user_id, match_id, team_id, team_name, opponent_name, amount, status)
  VALUES (v_user_id, p_match_id, p_team_id, p_team_name, p_opponent_name, p_amount, 'pending')
  RETURNING id INTO v_new_order_id;

  SELECT * INTO v_opponent_order FROM public.orders
  WHERE match_id = p_match_id
    AND team_id != p_team_id
    AND amount = p_amount
    AND status = 'pending'
    AND user_id != v_user_id
  ORDER BY created_at ASC
  LIMIT 1
  FOR UPDATE;

  IF FOUND THEN
    UPDATE public.orders SET status = 'matched', matched_with = v_opponent_order.id, matched_at = now()
    WHERE id = v_new_order_id;
    UPDATE public.orders SET status = 'matched', matched_with = v_new_order_id, matched_at = now()
    WHERE id = v_opponent_order.id;
    v_result := jsonb_build_object('status', 'matched', 'order_id', v_new_order_id);
  ELSE
    v_result := jsonb_build_object('status', 'pending', 'order_id', v_new_order_id);
  END IF;

  RETURN v_result;
END;
$$;

-- Function to settle match
CREATE OR REPLACE FUNCTION public.settle_match(
  p_match_id TEXT,
  p_winner_team_id TEXT
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order RECORD;
  v_pot NUMERIC;
  v_commission NUMERIC;
  v_payout NUMERIC;
  v_settled INT := 0;
BEGIN
  FOR v_order IN
    SELECT * FROM public.orders
    WHERE match_id = p_match_id AND status = 'matched'
    FOR UPDATE
  LOOP
    v_pot := v_order.amount * 2;
    IF v_order.team_id = p_winner_team_id THEN
      v_commission := v_pot * 0.05;
      v_payout := v_pot - v_commission;
      UPDATE public.orders SET status = 'won', commission = v_commission, payout = v_payout WHERE id = v_order.id;
      UPDATE public.profiles SET wallet = wallet + v_payout, updated_at = now() WHERE user_id = v_order.user_id;
    ELSE
      UPDATE public.orders SET status = 'lost', commission = 0, payout = 0 WHERE id = v_order.id;
    END IF;
    v_settled := v_settled + 1;
  END LOOP;

  RETURN jsonb_build_object('settled', v_settled);
END;
$$;

-- Timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();