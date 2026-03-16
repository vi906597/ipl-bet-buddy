import type { Match } from "@/types/betting";
import { motion } from "framer-motion";
import { ChevronRight, Zap } from "lucide-react";

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
      whileTap={{ scale: 0.98 }}
      className={`w-full text-left rounded-xl p-4 transition-all border ${
        isSelected
          ? "bg-primary/5 border-primary/30 shadow-elevated"
          : "bg-card border-border hover:border-primary/20 shadow-subtle"
      }`}
    >
      {/* Status Row */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1.5">
          {match.status === "live" ? (
            <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-primary/15 text-primary border border-primary/20">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse-dot" />
              Live
            </span>
          ) : (
            <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
              Upcoming
            </span>
          )}
        </div>
        <span className="flex items-center gap-1 text-[11px] text-muted-foreground tabular-nums">
          <Zap className="h-3 w-3 text-primary/60" />
          {formatLiquidity(match.liquidity)}
        </span>
      </div>

      {/* Teams */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          {/* Team A */}
          <div className="flex items-center gap-2.5 flex-1">
            <div className="h-10 w-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <span className="text-primary font-bold text-xs">{match.teamA.shortName}</span>
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">{match.teamA.shortName}</p>
              <p className="text-[10px] text-muted-foreground">{match.teamA.name.split(' ').slice(-1)}</p>
            </div>
          </div>

          {/* VS */}
          <div className="px-2">
            <span className="text-[10px] font-bold text-primary/40 bg-primary/5 px-2 py-1 rounded-md">VS</span>
          </div>

          {/* Team B */}
          <div className="flex items-center gap-2.5 flex-1 justify-end">
            <div className="text-right">
              <p className="text-sm font-bold text-foreground">{match.teamB.shortName}</p>
              <p className="text-[10px] text-muted-foreground">{match.teamB.name.split(' ').slice(-1)}</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
              <span className="text-accent font-bold text-xs">{match.teamB.shortName}</span>
            </div>
          </div>
        </div>

        <ChevronRight className={`h-4 w-4 text-muted-foreground ml-2 transition-transform ${isSelected ? "rotate-90 text-primary" : ""}`} />
      </div>
    </motion.button>
  );
};

export default MatchCard;
