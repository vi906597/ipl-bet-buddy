import type { Match } from "@/types/betting";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

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
      className={`w-full text-left rounded-lg p-4 transition-all ${
        isSelected
          ? "bg-secondary shadow-elevated ring-1 ring-primary/30"
          : "bg-card shadow-subtle hover:bg-secondary/50"
      }`}
    >
      {/* Status Row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          {match.status === "live" && (
            <span className="h-2 w-2 rounded-full bg-success animate-pulse-dot" />
          )}
          <span
            className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${
              match.status === "live"
                ? "bg-success/15 text-success"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {match.status === "live" ? "🔴 Live" : "Upcoming"}
          </span>
        </div>
        <span className="text-[11px] text-muted-foreground tabular-nums">
          {formatLiquidity(match.liquidity)} pool
        </span>
      </div>

      {/* Teams */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <div className="flex flex-col items-center min-w-[48px]">
            <div className="h-10 w-10 rounded-full bg-primary/15 flex items-center justify-center mb-1">
              <span className="text-primary font-bold text-sm">{match.teamA.shortName}</span>
            </div>
            <span className="text-[10px] text-muted-foreground">{match.teamA.name.split(' ').slice(-1)}</span>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-xs font-bold text-muted-foreground/60">VS</span>
          </div>

          <div className="flex flex-col items-center min-w-[48px]">
            <div className="h-10 w-10 rounded-full bg-accent/15 flex items-center justify-center mb-1">
              <span className="text-accent font-bold text-sm">{match.teamB.shortName}</span>
            </div>
            <span className="text-[10px] text-muted-foreground">{match.teamB.name.split(' ').slice(-1)}</span>
          </div>
        </div>

        <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${isSelected ? "rotate-90" : ""}`} />
      </div>
    </motion.button>
  );
};

export default MatchCard;
