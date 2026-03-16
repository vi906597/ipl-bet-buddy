import { useState } from "react";
import { MATCHES } from "@/types/betting";
import WalletBar from "@/components/WalletBar";
import MatchCard from "@/components/MatchCard";
import BettingPanel from "@/components/BettingPanel";
import OrderBook from "@/components/OrderBook";
import SettlePanel from "@/components/SettlePanel";

const Index = () => {
  const [selectedMatchId, setSelectedMatchId] = useState<string>(MATCHES[0].id);
  const selectedMatch = MATCHES.find((m) => m.id === selectedMatchId)!;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <WalletBar />

      <main className="flex-1 max-w-5xl mx-auto w-full grid grid-cols-1 md:grid-cols-[280px_1fr_280px] gap-4 p-4">
        {/* Left: Match List */}
        <aside className="space-y-2">
          <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Matches</h2>
          {MATCHES.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              isSelected={selectedMatchId === match.id}
              onSelect={setSelectedMatchId}
            />
          ))}
        </aside>

        {/* Center: Betting Panel */}
        <section className="rounded-lg bg-card p-4 shadow-elevated self-start">
          <BettingPanel match={selectedMatch} />
        </section>

        {/* Right: Order Book */}
        <aside className="space-y-4">
          <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">My Bets</h2>
          <OrderBook matchId={selectedMatchId} />
          <SettlePanel match={selectedMatch} />
        </aside>
      </main>
    </div>
  );
};

export default Index;
