import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const DEFAULT_COMMISSION_RATE = 0.20;

let cached: number | null = null;
const listeners = new Set<(rate: number) => void>();

const fetchRate = async () => {
  const { data } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "commission_rate")
    .maybeSingle();
  const parsed = data?.value ? parseFloat(data.value) : NaN;
  const rate = Number.isFinite(parsed) && parsed >= 0 && parsed <= 1 ? parsed : DEFAULT_COMMISSION_RATE;
  cached = rate;
  listeners.forEach((l) => l(rate));
  return rate;
};

export const useCommissionRate = (): number => {
  const [rate, setRate] = useState<number>(cached ?? DEFAULT_COMMISSION_RATE);

  useEffect(() => {
    listeners.add(setRate);
    if (cached === null) fetchRate();
    return () => {
      listeners.delete(setRate);
    };
  }, []);

  return rate;
};

export const refreshCommissionRate = () => fetchRate();
