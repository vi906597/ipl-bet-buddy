import { useState, useEffect } from "react";
import type { Match } from "@/types/betting";
import WalletBar from "@/components/WalletBar";
import MatchCard from "@/components/MatchCard";
import BettingPanel from "@/components/BettingPanel";
import OrderBook from "@/components/OrderBook";
import AllBets from "@/components/AllBets";
import SettlePanel from "@/components/SettlePanel";
import BottomNav from "@/components/BottomNav";
import DepositPanel from "@/components/DepositPanel";
import WithdrawPanel from "@/components/WithdrawPanel";
import { AnimatePresence, motion } from "framer-motion";
import { X, TrendingUp, Users, Trophy, Zap, ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import { useBettingStore } from "@/store/bettingStore";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface LeaderEntry {
  id: string; name: string; amount: number;
}

const Index = () => {
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("home");
  const [matches, setMatches] = useState<Match[]>([]);
  const [walletTab, setWalletTab] = useState<"deposit" | "withdraw">("deposit");
  const [leaderboard, setLeaderboard] = useState<LeaderEntry[]>([]);
  const { wallet, orders, fetchProfile, fetchOrders } = useBettingStore();
  const { user } = useAuth();

  const selectedMatch = matches.find((m) => m.id === selectedMatchId);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchOrders();
      loadMatches();
      loadLeaderboard();
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

  const loadLeaderboard = async () => {
    const { data } = await supabase
      .from("leaderboard_entries")
      .select("*")
      .order("rank_position", { ascending: true });
    if (data) setLeaderboard(data as any);
  };

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
          <h2 className="font-display text-lg font-bold">My Bet History</h2>
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

          <div className="grid grid-cols-2 gap-1 rounded-lg bg-muted p-1">
            <button
              onClick={() => setWalletTab("deposit")}
              className={`flex items-center justify-center gap-2 rounded-md py-2.5 text-xs font-bold transition-colors ${walletTab === "deposit" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                }`}
            >
              <ArrowDownToLine className="h-3.5 w-3.5" /> Deposit
            </button>
            <button
              onClick={() => setWalletTab("withdraw")}
              className={`flex items-center justify-center gap-2 rounded-md py-2.5 text-xs font-bold transition-colors ${walletTab === "withdraw" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                }`}
            >
              <ArrowUpFromLine className="h-3.5 w-3.5" /> Withdraw
            </button>
          </div>

          {walletTab === "deposit" ? <DepositPanel /> : <WithdrawPanel />}

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
        </main>
      )}

      {activeTab === "leaderboard" && (
        <main className="flex-1 max-w-2xl mx-auto w-full p-4 space-y-4">
          <h2 className="font-display text-lg font-bold">Leaderboard</h2>
          {leaderboard.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">Leaderboard coming soon</p>
          ) : (
            <div className="space-y-2">
              {leaderboard.map((entry, i) => (
                <div key={entry.id} className={`rounded-lg p-3 flex items-center justify-between border bg-card border-border`}>
                  <div className="flex items-center gap-3">
                    <span className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold ${i < 3 ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>
                      {i + 1}
                    </span>
                    <span className="text-sm font-semibold">{entry.name}</span>
                  </div>
                  <span className="text-sm font-bold tabular-nums">₹{Number(entry.amount).toLocaleString("en-IN")}</span>
                </div>
              ))}
            </div>
          )}
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
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={() => setSelectedMatchId(null)}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
            />
           <motion.div
  initial={{ y: "100%" }}
  animate={{ y: 0 }}
  exit={{ y: "100%" }}
  transition={{ type: "spring", damping: 28, stiffness: 300 }}
  className="fixed inset-x-0 bottom-0 z-50"
>
  <div className="w-full h-[90vh] max-h-[90vh] overflow-y-auto rounded-t-2xl bg-card border-t border-primary/20 shadow-elevated">

    {/* HEADER */}
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
          className="h-8 w-8 rounded-full bg-muted flex items-center justify-center hover:bg-secondary"
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>
    </div>

    {/* CONTENT */}
    <div className="px-4 pb-8 pt-4 space-y-5">
      <BettingPanel match={selectedMatch} />

      <div>
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          All Bets
        </h3>
        <AllBets match={selectedMatch} />
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
