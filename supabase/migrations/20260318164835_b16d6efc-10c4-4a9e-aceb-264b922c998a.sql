
-- Create transactions table to track deposits/withdrawals
CREATE TABLE public.transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('deposit', 'withdraw')),
  amount numeric NOT NULL CHECK (amount > 0),
  status text NOT NULL DEFAULT 'completed',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own transactions" ON public.transactions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions" ON public.transactions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Deposit function
CREATE OR REPLACE FUNCTION public.wallet_deposit(p_amount numeric)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_new_balance numeric;
BEGIN
  IF p_amount <= 0 THEN
    RETURN jsonb_build_object('error', 'Amount must be positive');
  END IF;
  IF p_amount > 10000 THEN
    RETURN jsonb_build_object('error', 'Max deposit ₹10,000 per transaction');
  END IF;

  UPDATE public.profiles SET wallet = wallet + p_amount, updated_at = now()
  WHERE user_id = v_user_id
  RETURNING wallet INTO v_new_balance;

  INSERT INTO public.transactions (user_id, type, amount) VALUES (v_user_id, 'deposit', p_amount);

  RETURN jsonb_build_object('status', 'success', 'balance', v_new_balance);
END;
$$;

-- Withdraw function
CREATE OR REPLACE FUNCTION public.wallet_withdraw(p_amount numeric)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_wallet numeric;
  v_new_balance numeric;
BEGIN
  IF p_amount <= 0 THEN
    RETURN jsonb_build_object('error', 'Amount must be positive');
  END IF;

  SELECT wallet INTO v_wallet FROM public.profiles WHERE user_id = v_user_id FOR UPDATE;

  IF v_wallet < p_amount THEN
    RETURN jsonb_build_object('error', 'Insufficient balance');
  END IF;

  UPDATE public.profiles SET wallet = wallet - p_amount, updated_at = now()
  WHERE user_id = v_user_id
  RETURNING wallet INTO v_new_balance;

  INSERT INTO public.transactions (user_id, type, amount) VALUES (v_user_id, 'withdraw', p_amount);

  RETURN jsonb_build_object('status', 'success', 'balance', v_new_balance);
END;
$$;
