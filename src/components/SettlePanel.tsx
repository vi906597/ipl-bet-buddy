import { useBettingStore } from "@/store/bettingStore";
import type { Match } from "@/types/betting";
import { motion } from "framer-motion";
import { Trophy } from "lucide-react";

const SettlePanel = ({ match }: { match: Match }) => {
  const { orders, settleMatch } = useBettingStore();
  const hasMatched = orders.some((o) => o.match_id === match.id && o.status === "matched");

  if (!hasMatched) return null;

  return (
    <div className="rounded-lg bg-card p-3 shadow-subtle">
      <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
        <Trophy className="h-3 w-3" /> Simulate winner
      </p>
      <div className="grid grid-cols-2 gap-2">
        {[match.teamA, match.teamB].map((team) => (
          <motion.button
            key={team.id}
            whileTap={{ scale: 0.95 }}
            onClick={() => settleMatch(match.id, team.id)}
            className="rounded-md py-2 text-xs font-medium bg-secondary hover:bg-secondary/80 transition-colors"
          >
            {team.shortName} Wins
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default SettlePanel;
