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

  const formatAmount = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}K` : `${n}`;

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground text-center">Pick your winning team</p>

      <div className="grid grid-cols-2 gap-3">
        <TeamButton team={match.teamA} isSelected={selectedTeam?.id === match.teamA.id} onSelect={() => setSelectedTeam(match.teamA)} />
        <TeamButton team={match.teamB} isSelected={selectedTeam?.id === match.teamB.id} onSelect={() => setSelectedTeam(match.teamB)} />
      </div>

      <AnimatePresence>
        {selectedTeam && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
          >
            <p className="text-xs text-muted-foreground mb-3">
              Stake on <span className="font-bold text-primary">{selectedTeam.shortName}</span>
            </p>
            <div className="grid grid-cols-4 gap-2">
              {STAKE_OPTIONS.map((amount) => {
                const winning = calcWinning(amount);
                return (
                  <motion.button
                    key={amount}
                    whileTap={{ scale: 0.95 }}
                    disabled={wallet < amount || placing !== null}
                    onClick={() => handleStake(amount)}
                    className={`flex flex-col items-center justify-center rounded-xl py-3 px-1 tabular-nums transition-all border
                      ${wallet < amount
                        ? "bg-muted/30 text-muted-foreground/30 border-transparent cursor-not-allowed"
                        : "bg-secondary border-border hover:border-primary/30 hover:bg-primary/5 active:bg-primary/10 cursor-pointer"
                      }`}
                  >
                    {placing === amount ? (
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    ) : (
                      <>
                        <span className="text-sm font-bold">₹{formatAmount(amount)}</span>
                        <span className="flex items-center gap-0.5 text-[9px] text-primary font-medium mt-0.5">
                          <TrendingUp className="h-2.5 w-2.5" />
                          ₹{formatAmount(winning)}
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

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onSelect}
      className={`rounded-xl py-5 text-center font-bold text-base transition-all border
        ${isSelected
          ? isPrimary
            ? "bg-primary/15 border-primary/40 text-primary shadow-[0_0_16px_hsl(var(--primary)/0.15)]"
            : "bg-accent/15 border-accent/40 text-accent shadow-[0_0_16px_hsl(var(--accent)/0.15)]"
          : isPrimary
            ? "bg-primary/5 border-border text-primary/70 hover:bg-primary/10 hover:border-primary/20"
            : "bg-accent/5 border-border text-accent/70 hover:bg-accent/10 hover:border-accent/20"
        }`}
    >
      {team.shortName}
    </motion.button>
  );
};

export default BettingPanel;
