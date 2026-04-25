CREATE OR REPLACE FUNCTION public.settle_match(p_match_id text, p_winner_team_id text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
      v_commission := v_pot * 0.20;
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
$function$;