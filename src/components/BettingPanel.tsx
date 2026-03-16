import { useState } from "react";
import type { Match, Team } from "@/types/betting";
import { STAKE_OPTIONS, COMMISSION_RATE } from "@/types/betting";
import { useBettingStore } from "@/store/bettingStore";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, TrendingUp } from "lucide-react";

interface BettingPanelProps {
  match: Match;
}

const BettingPanel = ({ match }: BettingPanelProps) => {
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [placing, setPlacing] = useState<number | null>(null);
  const { wallet, placeOrder } = useBettingStore();

  const calcWinning = (amount: number) => {
    const pot = amount * 2;
    const commission = pot * COMMISSION_RATE;
    return pot - commission;
  };

  const handleStake = async (amount: number) => {
    if (!selectedTeam || wallet < amount) return;
    setPlacing(amount);
    await new Promise((r) => setTimeout(r, 300));
    const opponent = selectedTeam.id === match.teamA.id ? match.teamB : match.teamA;
    placeOrder(match.id, selectedTeam.id, selectedTeam.shortName, opponent.shortName, amount);
    setPlacing(null);
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <p className="text-xs text-muted-foreground">Select your team</p>
      </div>

      {/* Team Selection */}
      <div className="grid grid-cols-2 gap-3">
        <TeamButton
          team={match.teamA}
          isSelected={selectedTeam?.id === match.teamA.id}
          onSelect={() => setSelectedTeam(match.teamA)}
        />
        <TeamButton
          team={match.teamB}
          isSelected={selectedTeam?.id === match.teamB.id}
          onSelect={() => setSelectedTeam(match.teamB)}
        />
      </div>

      {/* Stake Grid */}
      <AnimatePresence>
        {selectedTeam && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
          >
            <p className="text-xs text-muted-foreground mb-3">
              Stake on <span className="font-semibold text-foreground">{selectedTeam.shortName}</span>
            </p>
            <div className="grid grid-cols-3 gap-2">
              {STAKE_OPTIONS.map((amount) => {
                const winning = calcWinning(amount);
                return (
                  <motion.button
                    key={amount}
                    whileTap={{ scale: 0.95 }}
                    disabled={wallet < amount || placing !== null}
                    onClick={() => handleStake(amount)}
                    className={`flex flex-col items-center justify-center rounded-lg py-3 px-2 text-sm font-medium tabular-nums transition-all
                      ${wallet < amount
                        ? "bg-muted/50 text-muted-foreground/40 cursor-not-allowed"
                        : "bg-secondary hover:bg-secondary/80 active:bg-muted cursor-pointer"
                      }`}
                  >
                    {placing === amount ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <span className="text-sm font-semibold">₹{amount}</span>
                        <span className="flex items-center gap-0.5 text-[10px] text-success mt-0.5">
                          <TrendingUp className="h-2.5 w-2.5" />
                          Win ₹{winning}
                        </span>
                      </>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const TeamButton = ({ team, isSelected, onSelect }: { team: Team; isSelected: boolean; onSelect: () => void }) => {
  const isPrimary = team.colorVar === "primary";
  const baseClass = isPrimary
    ? "bg-primary/10 text-primary hover:bg-primary/20"
    : "bg-accent/10 text-accent hover:bg-accent/20";
  const selectedClass = isPrimary
    ? "bg-primary/20 ring-2 ring-primary/60 shadow-[0_0_12px_hsl(var(--primary)/0.2)]"
    : "bg-accent/20 ring-2 ring-accent/60 shadow-[0_0_12px_hsl(var(--accent)/0.2)]";

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onSelect}
      className={`rounded-lg py-5 text-center font-bold text-base transition-all ${
        isSelected ? selectedClass : baseClass
      }`}
    >
      {team.shortName}
    </motion.button>
  );
};

export default BettingPanel;
