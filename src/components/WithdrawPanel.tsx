import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useBettingStore } from "@/store/bettingStore";
import { toast } from "sonner";
import { ArrowUpFromLine, Clock, CheckCircle, XCircle, Banknote, Smartphone } from "lucide-react";

interface WithdrawRequest {
  id: string;
  amount: number;
  method: string;
  upi_id: string | null;
  account_number: string | null;
  ifsc_code: string | null;
  bank_name: string | null;
  account_holder_name: string | null;
  status: string;
  created_at: string;
}

const WithdrawPanel = () => {
  const { user } = useAuth();
  const wallet = useBettingStore((s) => s.wallet);
  const [method, setMethod] = useState<"upi" | "bank">("upi");
  const [amount, setAmount] = useState("");
  const [upiId, setUpiId] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [bankName, setBankName] = useState("");
  const [holderName, setHolderName] = useState("");
  const [loading, setLoading] = useState(false);
  const [withdrawals, setWithdrawals] = useState<WithdrawRequest[]>([]);

  useEffect(() => {
    if (user) fetchWithdrawals();
  }, [user]);

  const fetchWithdrawals = async () => {
    const { data } = await supabase
      .from("withdraw_requests")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setWithdrawals(data as any);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const amt = Number(amount);
    if (amt < 10000) { toast.error("Minimum withdraw amount is ₹10,000"); return; }
    if (amt > wallet) { toast.error("Insufficient balance"); return; }

    if (method === "upi" && !upiId.trim()) { toast.error("Enter UPI ID"); return; }
    if (method === "bank" && (!accountNumber.trim() || !ifscCode.trim() || !bankName.trim())) {
      toast.error("Fill all bank details"); return;
    }

    setLoading(true);
    const { error } = await supabase.from("withdraw_requests").insert({
      user_id: user.id,
      amount: amt,
      method,
      upi_id: method === "upi" ? upiId : null,
      account_number: method === "bank" ? accountNumber : null,
      ifsc_code: method === "bank" ? ifscCode : null,
      bank_name: method === "bank" ? bankName : null,
      account_holder_name: method === "bank" ? holderName : null,
      user_email: user.email || "",
      status: "pending",
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Withdraw request submitted!");
      setAmount(""); setUpiId(""); setAccountNumber(""); setIfscCode(""); setBankName(""); setHolderName("");
      fetchWithdrawals();
    }
    setLoading(false);
  };

  const statusIcon = (status: string) => {
    if (status === "approved") return <CheckCircle className="h-3.5 w-3.5 text-green-400" />;
    if (status === "rejected") return <XCircle className="h-3.5 w-3.5 text-destructive" />;
    return <Clock className="h-3.5 w-3.5 text-yellow-400" />;
  };

  const statusColor = (status: string) => {
    if (status === "approved") return "bg-green-500/20 text-green-400";
    if (status === "rejected") return "bg-destructive/20 text-destructive";
    return "bg-yellow-500/20 text-yellow-400";
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="number"
          placeholder="Withdraw amount (min ₹10,000)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          min={10000}
          required
          className="w-full rounded-lg bg-background border border-border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 tabular-nums"
        />

        {/* Method Toggle */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setMethod("upi")}
            className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-bold transition-colors border ${
              method === "upi" ? "bg-primary/20 border-primary/40 text-primary" : "bg-card border-border text-muted-foreground"
            }`}
          >
            <Smartphone className="h-3.5 w-3.5" /> UPI
          </button>
          <button
            type="button"
            onClick={() => setMethod("bank")}
            className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-bold transition-colors border ${
              method === "bank" ? "bg-primary/20 border-primary/40 text-primary" : "bg-card border-border text-muted-foreground"
            }`}
          >
            <Banknote className="h-3.5 w-3.5" /> Bank Transfer
          </button>
        </div>

        {method === "upi" && (
          <input
            type="text"
            placeholder="UPI ID (e.g. name@upi)"
            value={upiId}
            onChange={(e) => setUpiId(e.target.value)}
            required
            className="w-full rounded-lg bg-background border border-border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        )}

        {method === "bank" && (
          <div className="space-y-2">
            <input placeholder="Account Holder Name" value={holderName} onChange={(e) => setHolderName(e.target.value)} className="w-full rounded-lg bg-background border border-border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
            <input placeholder="Account Number" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} required className="w-full rounded-lg bg-background border border-border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
            <input placeholder="IFSC Code" value={ifscCode} onChange={(e) => setIfscCode(e.target.value)} required className="w-full rounded-lg bg-background border border-border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
            <input placeholder="Bank Name" value={bankName} onChange={(e) => setBankName(e.target.value)} required className="w-full rounded-lg bg-background border border-border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-muted text-foreground py-3 text-sm font-bold hover:bg-secondary transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <ArrowUpFromLine className="h-4 w-4" />
          {loading ? "Submitting..." : "Submit Withdraw Request"}
        </button>
      </form>

      {/* Withdraw History */}
      <div>
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Withdraw History</h3>
        {withdrawals.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No withdraw requests yet</p>
        ) : (
          <div className="space-y-2">
            {withdrawals.map((w) => (
              <div key={w.id} className="rounded-lg bg-card border border-border p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ArrowUpFromLine className="h-4 w-4 text-destructive" />
                    <span className="text-sm font-bold tabular-nums text-destructive">₹{Number(w.amount).toLocaleString("en-IN")}</span>
                  </div>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full flex items-center gap-1 ${statusColor(w.status)}`}>
                    {statusIcon(w.status)}
                    {w.status}
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">
                  {w.method === "upi" ? `UPI: ${w.upi_id}` : `Bank: ${w.bank_name} · ${w.account_number}`}
                  {" · "}{new Date(w.created_at).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WithdrawPanel;
