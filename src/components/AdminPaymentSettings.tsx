import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CreditCard, QrCode } from "lucide-react";

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

  useEffect(() => { fetchMode(); }, []);

  const fetchMode = async () => {
    const { data } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "payment_mode")
      .maybeSingle();
    if (data?.value) setPaymentMode(data.value);
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

  return (
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
  );
};

export default AdminPaymentSettings;
