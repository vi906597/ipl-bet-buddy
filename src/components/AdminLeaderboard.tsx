import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Trophy, Plus, Trash2, Loader2 } from "lucide-react";

const ADMIN_KEY = "ipl-admin-2026-secret";

const callAdmin = async (body: any) => {
  const res = await supabase.functions.invoke("admin-matches", {
    body: { ...body, adminKey: ADMIN_KEY },
  });
  if (res.error) throw new Error(res.error.message);
  if (res.data?.error) throw new Error(res.data.error);
  return res.data;
};

interface LeaderEntry {
  id: string; name: string; amount: number; rank_position: number;
}

const AdminLeaderboard = () => {
  const [entries, setEntries] = useState<LeaderEntry[]>([]);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchEntries(); }, []);

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const data = await callAdmin({ action: "list_leaderboard" });
      setEntries(data.entries || []);
    } catch (err: any) { toast.error(err.message); }
    setLoading(false);
  };

  const addEntry = async () => {
    if (!name || !amount) return;
    try {
      await callAdmin({ action: "add_leaderboard", name, amount: Number(amount), rank_position: entries.length + 1 });
      toast.success("Entry added!");
      setName(""); setAmount("");
      fetchEntries();
    } catch (err: any) { toast.error(err.message); }
  };

  const deleteEntry = async (id: string) => {
    try {
      await callAdmin({ action: "delete_leaderboard", entry_id: id });
      toast.success("Deleted");
      fetchEntries();
    } catch (err: any) { toast.error(err.message); }
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold flex items-center gap-2">
        <Trophy className="h-4 w-4 text-primary" /> Leaderboard Management
      </h3>
      <div className="flex gap-2">
        <input placeholder="Player Name" value={name} onChange={(e) => setName(e.target.value)} className="flex-1 rounded-lg bg-background border border-border px-3 py-2 text-sm" />
        <input type="number" placeholder="Amount (₹)" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-28 rounded-lg bg-background border border-border px-3 py-2 text-sm" />
        <button onClick={addEntry} className="rounded-lg bg-primary text-primary-foreground px-3 py-2 text-xs font-bold flex items-center gap-1">
          <Plus className="h-3.5 w-3.5" /> Add
        </button>
      </div>
      {loading && <Loader2 className="h-5 w-5 animate-spin text-primary mx-auto" />}
      <div className="space-y-2">
        {entries.map((e, i) => (
          <div key={e.id} className="flex items-center gap-3 rounded-lg bg-card border border-border p-3">
            <span className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold ${i < 3 ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>
              {i + 1}
            </span>
            <span className="flex-1 text-sm font-semibold">{e.name}</span>
            <span className="text-sm font-bold tabular-nums">₹{Number(e.amount).toLocaleString("en-IN")}</span>
            <button onClick={() => deleteEntry(e.id)} className="h-7 w-7 rounded-lg bg-destructive/20 flex items-center justify-center">
              <Trash2 className="h-3.5 w-3.5 text-destructive" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminLeaderboard;
