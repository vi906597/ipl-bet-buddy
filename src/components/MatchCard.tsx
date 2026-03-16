import type { Match } from "@/types/betting";
import { motion } from "framer-motion";

interface MatchCardProps {
  match: Match;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

const MatchCard = ({ match, isSelected, onSelect }: MatchCardProps) => {
  const formatLiquidity = (n: number) => {
    if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
    if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
    return `₹${n}`;
  };

  return (
    <motion.button
      onClick={() => onSelect(match.id)}
      whileTap={{ scale: 0.97 }}
      className={`w-full text-left rounded-lg p-3 transition-colors ${
        isSelected ? "bg-secondary shadow-elevated" : "bg-card shadow-subtle hover:bg-secondary/50"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          {match.status === "live" && (
            <span className="h-2 w-2 rounded-full bg-success animate-pulse-dot" />
          )}
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {match.status === "live" ? "Live" : "Upcoming"}
          </span>
        </div>
        <span className="text-xs text-muted-foreground tabular-nums">
          Liquidity {formatLiquidity(match.liquidity)}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-primary">{match.teamA.shortName}</span>
        <span className="text-xs text-muted-foreground">vs</span>
        <span className="text-sm font-semibold text-accent">{match.teamB.shortName}</span>
      </div>
    </motion.button>
  );
};

export default MatchCard;
