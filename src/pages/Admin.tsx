import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { toast } from "sonner";
import { Loader2, Plus, Trophy, Trash2, Play, CheckCircle, Shield } from "lucide-react";
import AdminDepositsWithdrawals from "@/components/AdminDepositsWithdrawals";
import AdminQrManager from "@/components/AdminQrManager";

const ADMIN_KEY = "ipl-admin-2026-secret";

interface MatchRow {
  id: string;
  match_key: string;
  team_a_id: string;
  team_a_name: string;
  team_a_short: string;
  team_b_id: string;
  team_b_name: string;
  team_b_short: string;
  status: string;
  start_time: string;
  winner_team_id: string | null;
  created_at: string;
}

const Admin = () => {
  const { user, loading: authLoading } = useAuth();
  const [authenticated, setAuthenticated] = useState(false);
  const [adminKeyInput, setAdminKeyInput] = useState("");
  const [matches, setMatches] = useState<MatchRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [adminTab, setAdminTab] = useState<"matches" | "payments" | "qr">("matches");

  // New match form
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    match_key: "",
    team_a_id: "",
    team_a_name: "",
    team_a_short: "",
    team_b_id: "",
    team_b_name: "",
    team_b_short: "",
    start_time: "",
  });

  const callAdmin = async (body: any) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("Not logged in");

    const res = await supabase.functions.invoke("admin-matches", {
      body: { ...body, adminKey: ADMIN_KEY },
    });
    if (res.error) throw new Error(res.error.message);
    if (res.data?.error) throw new Error(res.data.error);
    return res.data;
  };

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const data = await callAdmin({ action: "list_matches" });
      setMatches(data.matches || []);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminKeyInput === ADMIN_KEY) {
      setAuthenticated(true);
      fetchMatches();
    } else {
      toast.error("Invalid admin key");
    }
  };

  const addMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await callAdmin({ action: "add_match", match: form });
      toast.success("Match added!");
      setShowForm(false);
      setForm({ match_key: "", team_a_id: "", team_a_name: "", team_a_short: "", team_b_id: "", team_b_name: "", team_b_short: "", start_time: "" });
      fetchMatches();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const updateStatus = async (matchKey: string, status: string) => {
    try {
      await callAdmin({ action: "update_status", match_key: matchKey, status });
      toast.success(`Status → ${status}`);
      fetchMatches();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const settleMatch = async (matchKey: string, winnerId: string) => {
    try {
      await callAdmin({ action: "settle", match_key: matchKey, winner_team_id: winnerId });
      toast.success("Match settled!");
      fetchMatches();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const deleteMatch = async (matchKey: string) => {
    if (!confirm("Delete this match?")) return;
    try {
      await callAdmin({ action: "delete_match", match_key: matchKey });
      toast.success("Deleted");
      fetchMatches();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (authLoading) return null;
  if (!user) return <Navigate to="/auth" replace />;

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4">
          <div className="text-center space-y-2">
            <Shield className="h-10 w-10 text-primary mx-auto" />
            <h1 className="font-display text-xl font-extrabold">Admin Panel</h1>
            <p className="text-xs text-muted-foreground">Enter admin key to access</p>
          </div>
          <input
            type="password"
            placeholder="Admin Key"
            value={adminKeyInput}
            onChange={(e) => setAdminKeyInput(e.target.value)}
            required
            className="w-full rounded-xl bg-card border border-border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <button
            type="submit"
            className="w-full rounded-xl bg-primary text-primary-foreground py-3 text-sm font-bold"
          >
            Access Admin
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-xl font-extrabold flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" /> Admin Panel
          </h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1.5 rounded-lg bg-primary text-primary-foreground px-3 py-2 text-xs font-bold"
          >
            <Plus className="h-3.5 w-3.5" /> Add Match
          </button>
        </div>

        {/* Add Match Form */}
        {showForm && (
          <form onSubmit={addMatch} className="rounded-xl bg-card border border-border p-4 space-y-3">
            <h3 className="text-sm font-bold">New Match</h3>
            <input
              placeholder="Match Key (e.g. mi-vs-csk)"
              value={form.match_key}
              onChange={(e) => setForm({ ...form, match_key: e.target.value })}
              required
              className="w-full rounded-lg bg-background border border-border px-3 py-2 text-sm"
            />
            <div className="grid grid-cols-3 gap-2">
              <input placeholder="Team A ID" value={form.team_a_id} onChange={(e) => setForm({ ...form, team_a_id: e.target.value })} required className="rounded-lg bg-background border border-border px-3 py-2 text-sm" />
              <input placeholder="Team A Name" value={form.team_a_name} onChange={(e) => setForm({ ...form, team_a_name: e.target.value })} required className="rounded-lg bg-background border border-border px-3 py-2 text-sm" />
              <input placeholder="Short (e.g. MI)" value={form.team_a_short} onChange={(e) => setForm({ ...form, team_a_short: e.target.value })} required className="rounded-lg bg-background border border-border px-3 py-2 text-sm" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <input placeholder="Team B ID" value={form.team_b_id} onChange={(e) => setForm({ ...form, team_b_id: e.target.value })} required className="rounded-lg bg-background border border-border px-3 py-2 text-sm" />
              <input placeholder="Team B Name" value={form.team_b_name} onChange={(e) => setForm({ ...form, team_b_name: e.target.value })} required className="rounded-lg bg-background border border-border px-3 py-2 text-sm" />
              <input placeholder="Short (e.g. CSK)" value={form.team_b_short} onChange={(e) => setForm({ ...form, team_b_short: e.target.value })} required className="rounded-lg bg-background border border-border px-3 py-2 text-sm" />
            </div>
            <input
              type="datetime-local"
              value={form.start_time}
              onChange={(e) => setForm({ ...form, start_time: e.target.value })}
              required
              className="w-full rounded-lg bg-background border border-border px-3 py-2 text-sm"
            />
            <div className="flex gap-2">
              <button type="submit" className="rounded-lg bg-primary text-primary-foreground px-4 py-2 text-xs font-bold">Save</button>
              <button type="button" onClick={() => setShowForm(false)} className="rounded-lg bg-muted px-4 py-2 text-xs font-bold text-muted-foreground">Cancel</button>
            </div>
          </form>
        )}

        {/* Match List */}
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : matches.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground text-sm">No matches yet. Add one!</div>
        ) : (
          <div className="space-y-3">
            {matches.map((m) => (
              <div key={m.id} className="rounded-xl bg-card border border-border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold">
                      <span className="text-primary">{m.team_a_short}</span>
                      <span className="text-muted-foreground mx-1">vs</span>
                      <span className="text-accent">{m.team_b_short}</span>
                    </p>
                    <p className="text-[10px] text-muted-foreground">{m.match_key} · {new Date(m.start_time).toLocaleString()}</p>
                  </div>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                    m.status === "live" ? "bg-green-500/20 text-green-400" :
                    m.status === "completed" ? "bg-muted text-muted-foreground" :
                    "bg-primary/20 text-primary"
                  }`}>
                    {m.status}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {m.status === "upcoming" && (
                    <button onClick={() => updateStatus(m.match_key, "live")} className="flex items-center gap-1 rounded-lg bg-green-500/20 text-green-400 px-3 py-1.5 text-xs font-bold">
                      <Play className="h-3 w-3" /> Go Live
                    </button>
                  )}
                  {m.status === "live" && (
                    <>
                      <button onClick={() => settleMatch(m.match_key, m.team_a_id)} className="flex items-center gap-1 rounded-lg bg-primary/20 text-primary px-3 py-1.5 text-xs font-bold">
                        <Trophy className="h-3 w-3" /> {m.team_a_short} Wins
                      </button>
                      <button onClick={() => settleMatch(m.match_key, m.team_b_id)} className="flex items-center gap-1 rounded-lg bg-accent/20 text-accent px-3 py-1.5 text-xs font-bold">
                        <Trophy className="h-3 w-3" /> {m.team_b_short} Wins
                      </button>
                    </>
                  )}
                  {m.status === "completed" && m.winner_team_id && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <CheckCircle className="h-3 w-3" /> Winner: {m.winner_team_id === m.team_a_id ? m.team_a_short : m.team_b_short}
                    </span>
                  )}
                  <button onClick={() => deleteMatch(m.match_key)} className="flex items-center gap-1 rounded-lg bg-destructive/20 text-destructive px-3 py-1.5 text-xs font-bold ml-auto">
                    <Trash2 className="h-3 w-3" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
