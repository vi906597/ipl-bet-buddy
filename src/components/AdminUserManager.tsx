import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Search, Users, ArrowDownToLine, ArrowUpFromLine, Loader2 } from "lucide-react";

const ADMIN_KEY = "ipl-admin-2026-secret";

const callAdmin = async (body: any) => {
  const res = await supabase.functions.invoke("admin-matches", {
    body: { ...body, adminKey: ADMIN_KEY },
  });
  if (res.error) throw new Error(res.error.message);
  if (res.data?.error) throw new Error(res.data.error);
  return res.data;
};

interface UserProfile {
  user_id: string;
  username: string;
  wallet: number;
  email: string;
  created_at: string;
}

const AdminUserManager = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [walletEdit, setWalletEdit] = useState<{ userId: string; amount: string } | null>(null);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await callAdmin({ action: "list_users" });
      setUsers(data.users || []);
    } catch (err: any) {
      toast.error(err.message);
    }
    setLoading(false);
  };

  const handleWalletUpdate = async (userId: string, action: "add" | "remove", amount: number) => {
    try {
      await callAdmin({ action: "admin_wallet_update_by_id", user_id: userId, amount, wallet_action: action });
      toast.success(`Wallet ${action === "add" ? "credited" : "debited"}!`);
      setWalletEdit(null);
      fetchUsers();
    } catch (err: any) { toast.error(err.message); }
  };

  const filtered = users.filter(u =>
    !search || u.email?.toLowerCase().includes(search.toLowerCase()) || u.username?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold flex items-center gap-2">
        <Users className="h-4 w-4 text-primary" /> All Users ({users.length})
      </h3>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          placeholder="Search by email or username..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg bg-background border border-border pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      {loading && <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>}

      {!loading && (
        <div className="space-y-2">
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No users found</p>
          ) : filtered.map((u) => (
            <div key={u.user_id} className="rounded-lg bg-card border border-border p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold">{u.username}</p>
                  <p className="text-[10px] text-muted-foreground">{u.email}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-primary tabular-nums">₹{Number(u.wallet).toLocaleString("en-IN")}</p>
                  <p className="text-[10px] text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</p>
                </div>
              </div>

              {walletEdit?.userId === u.user_id ? (
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Amount"
                    value={walletEdit.amount}
                    onChange={(e) => setWalletEdit({ ...walletEdit, amount: e.target.value })}
                    className="flex-1 rounded-lg bg-background border border-border px-3 py-1.5 text-sm"
                  />
                  <button
                    onClick={() => handleWalletUpdate(u.user_id, "add", Number(walletEdit.amount))}
                    className="rounded-lg bg-green-500/20 text-green-400 px-2 py-1.5 text-[10px] font-bold"
                  >
                    +Add
                  </button>
                  <button
                    onClick={() => handleWalletUpdate(u.user_id, "remove", Number(walletEdit.amount))}
                    className="rounded-lg bg-destructive/20 text-destructive px-2 py-1.5 text-[10px] font-bold"
                  >
                    -Remove
                  </button>
                  <button
                    onClick={() => setWalletEdit(null)}
                    className="rounded-lg bg-muted px-2 py-1.5 text-[10px] font-bold text-muted-foreground"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setWalletEdit({ userId: u.user_id, amount: "" })}
                  className="text-[10px] text-primary underline"
                >
                  Edit Wallet
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminUserManager;
