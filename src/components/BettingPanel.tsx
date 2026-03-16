import { useState } from "react";
import type { Match, Team } from "@/types/betting";
import { STAKE_OPTIONS } from "@/types/betting";
import { useBettingStore } from "@/store/bettingStore";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";

interface BettingPanelProps {
  match: Match;
}

const BettingPanel = ({ match }: BettingPanelProps) => {
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [placing, setPlacing] = useState<number | null>(null);
  const { wallet, placeOrder } = useBettingStore();

  const handleStake = async (amount: number) => {
    if (!selectedTeam || wallet < amount) return;
    setPlacing(amount);
    
    // Simulate server check
    await new Promise((r) => setTimeout(r, 300));
    
    const opponent = selectedTeam.id === match.teamA.id ? match.teamB : match.teamA;
    placeOrder(match.id, selectedTeam.id, selectedTeam.shortName, opponent.shortName, amount);
    setPlacing(null);
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-lg font-semibold">
          <span className="text-primary">{match.teamA.shortName}</span>
          <span className="text-muted-foreground mx-2">vs</span>
          <span className="text-accent">{match.teamB.shortName}</span>
        </h2>
        <p className="text-xs text-muted-foreground mt-1">Select your team</p>
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
            <p className="text-xs text-muted-foreground mb-2">
              Stake on <span className="font-medium text-foreground">{selectedTeam.shortName}</span>
            </p>
            <div className="grid grid-cols-3 gap-2">
              {STAKE_OPTIONS.map((amount) => (
                <motion.button
                  key={amount}
                  whileTap={{ scale: 0.95 }}
                  disabled={wallet < amount || placing !== null}
                  onClick={() => handleStake(amount)}
                  className={`flex items-center justify-center rounded-md py-3 text-sm font-medium tabular-nums transition-all
                    ${wallet < amount 
                      ? "bg-muted/50 text-muted-foreground/40 cursor-not-allowed" 
                      : "bg-secondary hover:bg-secondary/80 active:bg-muted cursor-pointer"
                    }`}
                >
                  {placing === amount ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    `₹${amount}`
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const TeamButton = ({ team, isSelected, onSelect }: { team: Team; isSelected: boolean; onSelect: () => void }) => {
  const colorClass = team.colorVar === "primary" 
    ? "bg-primary/10 text-primary hover:bg-primary/20" 
    : "bg-accent/10 text-accent hover:bg-accent/20";
  const selectedClass = team.colorVar === "primary"
    ? "bg-primary/20 ring-1 ring-primary/50"
    : "bg-accent/20 ring-1 ring-accent/50";

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onSelect}
      className={`rounded-md py-4 text-center font-semibold text-sm transition-all ${
        isSelected ? selectedClass : colorClass
      }`}
    >
      {team.shortName}
    </motion.button>
  );
};

export default BettingPanel;
