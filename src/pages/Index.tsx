import { useState } from "react";
import { MATCHES } from "@/types/betting";
import WalletBar from "@/components/WalletBar";
import MatchCard from "@/components/MatchCard";
import BettingPanel from "@/components/BettingPanel";
import OrderBook from "@/components/OrderBook";
import SettlePanel from "@/components/SettlePanel";
import { AnimatePresence, motion } from "framer-motion";

const Index = () => {
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const selectedMatch = MATCHES.find((m) => m.id === selectedMatchId);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <WalletBar />

      <main className="flex-1 max-w-2xl mx-auto w-full p-4 space-y-4">
        {/* Match List */}
        <div>
          <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
            🏏 Today's Matches
          </h2>
          <div className="space-y-3">
            {MATCHES.map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                isSelected={selectedMatchId === match.id}
                onSelect={(id) => setSelectedMatchId(selectedMatchId === id ? null : id)}
              />
            ))}
          </div>
        </div>

        {/* Betting + Orders for selected match */}
        <AnimatePresence>
          {selectedMatch && (
            <motion.div
              key={selectedMatch.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              <section className="rounded-lg bg-card p-4 shadow-elevated">
                <BettingPanel match={selectedMatch} />
              </section>

              <section>
                <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                  My Bets
                </h2>
                <OrderBook matchId={selectedMatchId!} />
                <div className="mt-3">
                  <SettlePanel match={selectedMatch} />
                </div>
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Index;
