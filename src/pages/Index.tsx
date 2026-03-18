import { useState, useEffect, useCallback } from "react";
import type { Match } from "@/types/betting";
import WalletBar from "@/components/WalletBar";
import MatchCard from "@/components/MatchCard";
import BettingPanel from "@/components/BettingPanel";
import OrderBook from "@/components/OrderBook";
import SettlePanel from "@/components/SettlePanel";
import BottomNav from "@/components/BottomNav";
import { AnimatePresence, motion } from "framer-motion";
import { X, TrendingUp, Users, Trophy, Zap, ArrowDownToLine, ArrowUpFromLine, Loader2 } from "lucide-react";
import { useBettingStore } from "@/store/bettingStore";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("home");
  const [matches, setMatches] = useState<Match[]>([]);
  const [txAmount, setTxAmount] = useState("");
  const [txLoading, setTxLoading] = useState(false);
  const { wallet, orders, transactions, fetchProfile, fetchOrders, deposit, withdraw, fetchTransactions } = useBettingStore();
  const { user } = useAuth();

  const selectedMatch = matches.find((m) => m.id === selectedMatchId);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchOrders();
      loadMatches();
    }
  }, [user]);

  const loadMatches = async () => {
    const { data } = await supabase
      .from("matches")
      .select("*")
      .order("start_time", { ascending: true });
    if (data) {
      const mapped: Match[] = data.map((m: any) => ({
        id: m.match_key,
        teamA: { id: m.team_a_id, name: m.team_a_name, shortName: m.team_a_short, colorVar: "primary" as const },
        teamB: { id: m.team_b_id, name: m.team_b_name, shortName: m.team_b_short, colorVar: "accent" as const },
        status: m.status as "upcoming" | "live" | "completed",
        liquidity: 0,
        startTime: m.start_time,
      }));
      setMatches(mapped);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchOrders();
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-background flex flex-col pb-20">
      <WalletBar />

      {activeTab === "home" && (
        <main className="flex-1 max-w-2xl mx-auto w-full p-4 space-y-5">
          {/* Hero Banner */}
          <div className="rounded-xl bg-gradient-to-br from-primary/15 via-card to-card border border-primary/10 p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-primary/20 text-primary border border-primary/30 mb-3">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse-dot" />
              IPL Season Live
            </span>
            <h1 className="font-display text-xl font-extrabold leading-tight mb-1">
              PREDICT & WIN<br />
              <span className="text-primary">REAL CASH</span>
            </h1>
            <p className="text-xs text-muted-foreground">
              Pick your team, bet against others, win big!
            </p>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { icon: Users, label: "Players", value: "2.5K+" },
              { icon: Zap, label: "Pool", value: "₹7L+" },
              { icon: Trophy, label: "Won Today", value: "₹1.2L" },
            ].map((stat) => (
              <div key={stat.label} className="rounded-lg bg-card border border-border p-3 text-center">
                <stat.icon className="h-4 w-4 text-primary mx-auto mb-1" />
                <p className="text-sm font-bold tabular-nums">{stat.value}</p>
                <p className="text-[10px] text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Match List */}
          <div>
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              🏏 Today's Matches
            </h2>
            {matches.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No matches available yet</p>
            ) : (
              <div className="space-y-3">
                {matches.filter(m => m.status !== "completed").map((match) => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    isSelected={selectedMatchId === match.id}
                    onSelect={(id) => setSelectedMatchId(id)}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      )}

      {activeTab === "history" && (
        <main className="flex-1 max-w-2xl mx-auto w-full p-4 space-y-4">
          <h2 className="font-display text-lg font-bold">Bet History</h2>
          <OrderBook />
        </main>
      )}

      {activeTab === "wallet" && (
        <main className="flex-1 max-w-2xl mx-auto w-full p-4 space-y-4">
          <h2 className="font-display text-lg font-bold">My Wallet</h2>
          <div className="rounded-xl bg-gradient-to-br from-primary/15 via-card to-card border border-primary/20 p-6 text-center">
            <p className="text-xs text-muted-foreground mb-1">Available Balance</p>
            <p className="font-display text-3xl font-extrabold text-primary tabular-nums">₹{wallet.toLocaleString("en-IN")}</p>
          </div>

          {/* Deposit / Withdraw */}
          <div className="rounded-xl bg-card border border-border p-4 space-y-3">
            <input
              type="number"
              placeholder="Enter amount (₹)"
              value={txAmount}
              onChange={(e) => setTxAmount(e.target.value)}
              min={1}
              max={10000}
              className="w-full rounded-lg bg-background border border-border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 tabular-nums"
            />
            <div className="grid grid-cols-2 gap-3">
              <button
                disabled={txLoading || !txAmount || Number(txAmount) <= 0}
                onClick={async () => {
                  setTxLoading(true);
                  const res = await deposit(Number(txAmount));
                  if (res.error) { toast.error(res.error); } else { toast.success(`₹${txAmount} deposited!`); setTxAmount(""); }
                  setTxLoading(false);
                }}
                className="flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground py-3 text-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {txLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowDownToLine className="h-4 w-4" />}
                Deposit
              </button>
              <button
                disabled={txLoading || !txAmount || Number(txAmount) <= 0}
                onClick={async () => {
                  setTxLoading(true);
                  const res = await withdraw(Number(txAmount));
                  if (res.error) { toast.error(res.error); } else { toast.success(`₹${txAmount} withdrawn!`); setTxAmount(""); }
                  setTxLoading(false);
                }}
                className="flex items-center justify-center gap-2 rounded-lg bg-muted text-foreground py-3 text-sm font-bold hover:bg-secondary transition-colors disabled:opacity-50"
              >
                {txLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUpFromLine className="h-4 w-4" />}
                Withdraw
              </button>
            </div>
            <p className="text-[10px] text-muted-foreground text-center">Max ₹10,000 per deposit</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-card border border-border p-4 text-center">
              <TrendingUp className="h-5 w-5 text-primary mx-auto mb-2" />
              <p className="text-sm font-bold tabular-nums">{orders.filter(o => o.status === "won").length}</p>
              <p className="text-[10px] text-muted-foreground">Wins</p>
            </div>
            <div className="rounded-lg bg-card border border-border p-4 text-center">
              <Trophy className="h-5 w-5 text-accent mx-auto mb-2" />
              <p className="text-sm font-bold tabular-nums">
                ₹{orders.filter(o => o.status === "won").reduce((s, o) => s + (o.payout || 0), 0).toLocaleString("en-IN")}
              </p>
              <p className="text-[10px] text-muted-foreground">Total Winnings</p>
            </div>
          </div>

          {/* Transaction History */}
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Recent Transactions</h3>
            {transactions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No transactions yet</p>
            ) : (
              <div className="space-y-2">
                {transactions.map((tx: any) => (
                  <div key={tx.id} className="flex items-center justify-between rounded-lg bg-card border border-border p-3">
                    <div className="flex items-center gap-2">
                      {tx.type === "deposit" ? (
                        <ArrowDownToLine className="h-4 w-4 text-primary" />
                      ) : (
                        <ArrowUpFromLine className="h-4 w-4 text-destructive" />
                      )}
                      <span className="text-sm font-medium capitalize">{tx.type}</span>
                    </div>
                    <span className={`text-sm font-bold tabular-nums ${tx.type === "deposit" ? "text-primary" : "text-destructive"}`}>
                      {tx.type === "deposit" ? "+" : "-"}₹{Number(tx.amount).toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      )}

      {activeTab === "leaderboard" && (
        <main className="flex-1 max-w-2xl mx-auto w-full p-4 space-y-4">
          <h2 className="font-display text-lg font-bold">Leaderboard</h2>
          <div className="space-y-2">
            {["ProBetter99", "CricketKing", "IPLMaster", "You", "StakeGuru"].map((name, i) => (
              <div key={name} className={`rounded-lg p-3 flex items-center justify-between border ${name === "You" ? "bg-primary/10 border-primary/30" : "bg-card border-border"}`}>
                <div className="flex items-center gap-3">
                  <span className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold ${i < 3 ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>
                    {i + 1}
                  </span>
                  <span className={`text-sm font-semibold ${name === "You" ? "text-primary" : ""}`}>{name}</span>
                </div>
                <span className="text-sm font-bold tabular-nums">₹{(50000 - i * 8000).toLocaleString("en-IN")}</span>
              </div>
            ))}
          </div>
        </main>
      )}

      {activeTab === "profile" && (
        <main className="flex-1 max-w-2xl mx-auto w-full p-4 space-y-4">
          <h2 className="font-display text-lg font-bold">Profile</h2>
          <div className="rounded-xl bg-card border border-border p-6 text-center">
            <div className="h-16 w-16 rounded-full bg-primary/15 border-2 border-primary/30 flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">🏏</span>
            </div>
            <p className="font-bold text-lg">{user?.user_metadata?.username || "Player"}</p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-card border border-border p-3 text-center">
              <p className="text-lg font-bold tabular-nums">{orders.length}</p>
              <p className="text-[10px] text-muted-foreground">Total Bets</p>
            </div>
            <div className="rounded-lg bg-card border border-border p-3 text-center">
              <p className="text-lg font-bold tabular-nums text-primary">
                {orders.length > 0 ? Math.round(orders.filter(o => o.status === "won").length / Math.max(orders.filter(o => o.status === "won" || o.status === "lost").length, 1) * 100) : 0}%
              </p>
              <p className="text-[10px] text-muted-foreground">Win Rate</p>
            </div>
          </div>
        </main>
      )}

      {/* Bottom Sheet Popup for betting */}
      <AnimatePresence>
        {selectedMatch && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedMatchId(null)}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-2xl bg-card border-t border-primary/20 shadow-elevated"
            >
              <div className="sticky top-0 bg-card z-10 pt-3 pb-2 px-4 border-b border-border">
                <div className="w-10 h-1 rounded-full bg-muted mx-auto mb-3" />
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold font-display">
                    <span className="text-primary">{selectedMatch.teamA.shortName}</span>
                    <span className="text-muted-foreground mx-2">vs</span>
                    <span className="text-accent">{selectedMatch.teamB.shortName}</span>
                  </h2>
                  <button
                    onClick={() => setSelectedMatchId(null)}
                    className="h-8 w-8 rounded-full bg-muted flex items-center justify-center hover:bg-secondary transition-colors"
                  >
                    <X className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>
              </div>

              <div className="px-4 pb-8 pt-4 space-y-5">
                <BettingPanel match={selectedMatch} />
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    My Bets
                  </h3>
                  <OrderBook matchId={selectedMatchId!} />
                  <div className="mt-3">
                    <SettlePanel match={selectedMatch} />
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <BottomNav active={activeTab} onNavigate={setActiveTab} />
    </div>
  );
};

export default Index;
