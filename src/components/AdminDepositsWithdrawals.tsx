import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CheckCircle, XCircle, Search, ArrowDownToLine, ArrowUpFromLine, Image, ExternalLink, Loader2 } from "lucide-react";

const ADMIN_KEY = "ipl-admin-2026-secret";

const callAdmin = async (body: any) => {
  const res = await supabase.functions.invoke("admin-matches", {
    body: { ...body, adminKey: ADMIN_KEY },
  });
  if (res.error) throw new Error(res.error.message);
  if (res.data?.error) throw new Error(res.data.error);
  return res.data;
};

interface DepositReq {
  id: string; user_id: string; amount: number; status: string; screenshot_url: string | null; user_email: string | null; created_at: string;
}
interface WithdrawReq {
  id: string; user_id: string; amount: number; method: string; upi_id: string | null;
  account_number: string | null; ifsc_code: string | null; bank_name: string | null;
  account_holder_name: string | null; status: string; user_email: string | null; created_at: string;
}

const AdminDepositsWithdrawals = () => {
  const [tab, setTab] = useState<"deposits" | "withdrawals" | "wallet">("deposits");
  const [deposits, setDeposits] = useState<DepositReq[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawReq[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [walletEmail, setWalletEmail] = useState("");
  const [walletAmount, setWalletAmount] = useState("");
  const [walletAction, setWalletAction] = useState<"add" | "remove">("add");

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const dRes = await callAdmin({ action: "list_deposits" });
      setDeposits(dRes.deposits || []);
      const wRes = await callAdmin({ action: "list_withdrawals" });
      setWithdrawals(wRes.withdrawals || []);
    } catch (err: any) {
      toast.error(err.message);
    }
    setLoading(false);
  };

  const handleDepositAction = async (id: string, action: "approved" | "rejected") => {
    try {
      await callAdmin({ action: "update_deposit", deposit_id: id, status: action });
      toast.success(`Deposit ${action}`);
      fetchAll();
    } catch (err: any) { toast.error(err.message); }
  };

  const handleWithdrawAction = async (id: string, action: "approved" | "rejected") => {
    try {
      await callAdmin({ action: "update_withdrawal", withdrawal_id: id, status: action });
      toast.success(`Withdrawal ${action}`);
      fetchAll();
    } catch (err: any) { toast.error(err.message); }
  };

  const handleWalletUpdate = async () => {
    if (!walletEmail || !walletAmount) return;
    try {
      await callAdmin({ action: "admin_wallet_update", email: walletEmail, amount: Number(walletAmount), wallet_action: walletAction });
      toast.success(`Wallet ${walletAction === "add" ? "credited" : "debited"}!`);
      setWalletEmail(""); setWalletAmount("");
    } catch (err: any) { toast.error(err.message); }
  };

  const filteredDeposits = deposits.filter(d => !search || d.user_email?.toLowerCase().includes(search.toLowerCase()));
  const filteredWithdrawals = withdrawals.filter(w => !search || w.user_email?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="grid grid-cols-3 gap-1 rounded-lg bg-muted p-1">
        {(["deposits", "withdrawals", "wallet"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-md py-2 text-xs font-bold capitalize transition-colors ${
              tab === t ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Search */}
      {tab !== "wallet" && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            placeholder="Search by email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg bg-background border border-border pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      )}

      {loading && <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>}

      {/* Deposits */}
      {tab === "deposits" && !loading && (
        <div className="space-y-2">
          {filteredDeposits.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No deposit requests</p>
          ) : filteredDeposits.map((d) => (
            <div key={d.id} className="rounded-lg bg-card border border-border p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{d.user_email}</p>
                  <p className="text-sm font-bold text-primary tabular-nums">₹{Number(d.amount).toLocaleString("en-IN")}</p>
                </div>
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                  d.status === "approved" ? "bg-green-500/20 text-green-400" :
                  d.status === "rejected" ? "bg-destructive/20 text-destructive" :
                  "bg-yellow-500/20 text-yellow-400"
                }`}>{d.status}</span>
              </div>
              <p className="text-[10px] text-muted-foreground">{new Date(d.created_at).toLocaleString()}</p>
              {d.screenshot_url && (
                <a href={d.screenshot_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-primary hover:underline">
                  <Image className="h-3 w-3" /> View Screenshot <ExternalLink className="h-3 w-3" />
                </a>
              )}
              {d.status === "pending" && (
                <div className="flex gap-2">
                  <button onClick={() => handleDepositAction(d.id, "approved")} className="flex items-center gap-1 rounded-lg bg-green-500/20 text-green-400 px-3 py-1.5 text-xs font-bold">
                    <CheckCircle className="h-3 w-3" /> Approve
                  </button>
                  <button onClick={() => handleDepositAction(d.id, "rejected")} className="flex items-center gap-1 rounded-lg bg-destructive/20 text-destructive px-3 py-1.5 text-xs font-bold">
                    <XCircle className="h-3 w-3" /> Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Withdrawals */}
      {tab === "withdrawals" && !loading && (
        <div className="space-y-2">
          {filteredWithdrawals.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No withdraw requests</p>
          ) : filteredWithdrawals.map((w) => (
            <div key={w.id} className="rounded-lg bg-card border border-border p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{w.user_email}</p>
                  <p className="text-sm font-bold text-destructive tabular-nums">₹{Number(w.amount).toLocaleString("en-IN")}</p>
                </div>
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                  w.status === "approved" ? "bg-green-500/20 text-green-400" :
                  w.status === "rejected" ? "bg-destructive/20 text-destructive" :
                  "bg-yellow-500/20 text-yellow-400"
                }`}>{w.status}</span>
              </div>
              <div className="text-[10px] text-muted-foreground space-y-0.5">
                <p>{w.method === "upi" ? `UPI: ${w.upi_id}` : `Bank: ${w.bank_name} · A/C: ${w.account_number} · IFSC: ${w.ifsc_code}`}</p>
                {w.account_holder_name && <p>Name: {w.account_holder_name}</p>}
                <p>{new Date(w.created_at).toLocaleString()}</p>
              </div>
              {w.status === "pending" && (
                <div className="flex gap-2">
                  <button onClick={() => handleWithdrawAction(w.id, "approved")} className="flex items-center gap-1 rounded-lg bg-green-500/20 text-green-400 px-3 py-1.5 text-xs font-bold">
                    <CheckCircle className="h-3 w-3" /> Approve
                  </button>
                  <button onClick={() => handleWithdrawAction(w.id, "rejected")} className="flex items-center gap-1 rounded-lg bg-destructive/20 text-destructive px-3 py-1.5 text-xs font-bold">
                    <XCircle className="h-3 w-3" /> Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Wallet Management */}
      {tab === "wallet" && !loading && (
        <div className="space-y-3">
          <input placeholder="User Email" value={walletEmail} onChange={(e) => setWalletEmail(e.target.value)} className="w-full rounded-lg bg-background border border-border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
          <input type="number" placeholder="Amount (₹)" value={walletAmount} onChange={(e) => setWalletAmount(e.target.value)} className="w-full rounded-lg bg-background border border-border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => { setWalletAction("add"); handleWalletUpdate(); }} className="rounded-lg bg-green-500/20 text-green-400 py-2.5 text-xs font-bold flex items-center justify-center gap-1">
              <ArrowDownToLine className="h-3.5 w-3.5" /> Add Balance
            </button>
            <button onClick={() => { setWalletAction("remove"); handleWalletUpdate(); }} className="rounded-lg bg-destructive/20 text-destructive py-2.5 text-xs font-bold flex items-center justify-center gap-1">
              <ArrowUpFromLine className="h-3.5 w-3.5" /> Remove Balance
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDepositsWithdrawals;
