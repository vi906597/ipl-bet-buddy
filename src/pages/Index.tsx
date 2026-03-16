import { useState } from "react";
import { MATCHES } from "@/types/betting";
import WalletBar from "@/components/WalletBar";
import MatchCard from "@/components/MatchCard";
import BettingPanel from "@/components/BettingPanel";
import OrderBook from "@/components/OrderBook";
import SettlePanel from "@/components/SettlePanel";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

const Index = () => {
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const selectedMatch = MATCHES.find((m) => m.id === selectedMatchId);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <WalletBar />

      <main className="flex-1 max-w-2xl mx-auto w-full p-4 space-y-4">
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
                onSelect={(id) => setSelectedMatchId(id)}
              />
            ))}
          </div>
        </div>
      </main>

      {/* Full-screen overlay panel */}
      <AnimatePresence>
        {selectedMatch && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedMatchId(null)}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
            />

            {/* Bottom sheet / popup */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed inset-x-0 bottom-0 z-50 max-h-[90vh] overflow-y-auto rounded-t-2xl bg-card shadow-elevated"
            >
              {/* Handle + Close */}
              <div className="sticky top-0 bg-card z-10 pt-3 pb-2 px-4">
                <div className="w-10 h-1 rounded-full bg-muted mx-auto mb-3" />
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold">
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

              <div className="px-4 pb-6 space-y-5">
                <BettingPanel match={selectedMatch} />

                <div>
                  <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
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
    </div>
  );
};

export default Index;
