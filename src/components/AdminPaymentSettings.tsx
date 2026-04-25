import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CreditCard, QrCode, Percent } from "lucide-react";
import { refreshCommissionRate } from "@/hooks/useCommissionRate";

const ADMIN_KEY = "ipl-admin-2026-secret";

const callAdmin = async (body: any) => {
  const res = await supabase.functions.invoke("admin-matches", {
    body: { ...body, adminKey: ADMIN_KEY },
  });
  if (res.error) throw new Error(res.error.message);
  if (res.data?.error) throw new Error(res.data.error);
  return res.data;
};

const AdminPaymentSettings = () => {
  const [paymentMode, setPaymentMode] = useState<string>("manual");
  const [loading, setLoading] = useState(false);
  const [commissionPct, setCommissionPct] = useState<string>("20");
  const [savingCommission, setSavingCommission] = useState(false);

  useEffect(() => { fetchMode(); fetchCommission(); }, []);

  const fetchMode = async () => {
    const { data } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "payment_mode")
      .maybeSingle();
    if (data?.value) setPaymentMode(data.value);
  };

  const fetchCommission = async () => {
    const { data } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "commission_rate")
      .maybeSingle();
    if (data?.value) {
      const pct = (parseFloat(data.value) * 100).toFixed(2).replace(/\.?0+$/, "");
      setCommissionPct(pct);
    }
  };

  const updateMode = async (mode: string) => {
    setLoading(true);
    try {
      await callAdmin({ action: "update_setting", key: "payment_mode", value: mode });
      setPaymentMode(mode);
      toast.success(`Payment mode: ${mode === "manual" ? "Manual QR" : "Bharat4U Gateway"}`);
    } catch (err: any) { toast.error(err.message); }
    setLoading(false);
  };

  const saveCommission = async () => {
    const pct = parseFloat(commissionPct);
    if (!Number.isFinite(pct) || pct < 0 || pct > 100) {
      toast.error("Enter a value between 0 and 100");
      return;
    }
    setSavingCommission(true);
    try {
      const decimal = (pct / 100).toFixed(4);
      await callAdmin({ action: "update_setting", key: "commission_rate", value: decimal });
      await refreshCommissionRate();
      toast.success(`Commission set to ${pct}%`);
    } catch (err: any) { toast.error(err.message); }
    setSavingCommission(false);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Payment Mode</h3>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => updateMode("manual")}
            disabled={loading}
            className={`flex flex-col items-center gap-2 rounded-lg p-4 border transition-colors ${
              paymentMode === "manual" ? "bg-primary/20 border-primary/40 text-primary" : "bg-card border-border text-muted-foreground"
            }`}
          >
            <QrCode className="h-5 w-5" />
            <span className="text-xs font-bold">Manual QR</span>
            <span className="text-[10px]">User scans & uploads screenshot</span>
          </button>
          <button
            onClick={() => updateMode("gateway")}
            disabled={loading}
            className={`flex flex-col items-center gap-2 rounded-lg p-4 border transition-colors ${
              paymentMode === "gateway" ? "bg-primary/20 border-primary/40 text-primary" : "bg-card border-border text-muted-foreground"
            }`}
          >
            <CreditCard className="h-5 w-5" />
            <span className="text-xs font-bold">Bharat4U Gateway</span>
            <span className="text-[10px]">Auto checkout page opens</span>
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <Percent className="h-3 w-3" /> Commission Rate
        </h3>
        <div className="rounded-lg bg-card border border-border p-4 space-y-3">
          <p className="text-[11px] text-muted-foreground">
            Percentage taken from the winning pot. Default <span className="font-bold text-foreground">20%</span>.
          </p>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={commissionPct}
                onChange={(e) => setCommissionPct(e.target.value)}
                className="w-full rounded-lg bg-background border border-border pl-3 pr-8 py-2 text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
            </div>
            <button
              onClick={saveCommission}
              disabled={savingCommission}
              className="rounded-lg bg-primary text-primary-foreground px-4 py-2 text-xs font-bold disabled:opacity-50"
            >
              {savingCommission ? "Saving..." : "Save"}
            </button>
          </div>
          <p className="text-[10px] text-muted-foreground">
            Example: stake ₹100 vs ₹100 → pot ₹200, winner gets ₹{(200 * (1 - (parseFloat(commissionPct) || 0) / 100)).toFixed(0)}.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminPaymentSettings;
