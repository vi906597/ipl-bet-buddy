import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Match } from "@/types/betting";
import { Clock, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PendingOrder {
  id: string;
  team_id: string;
  team_name: string;
  amount: number;
  created_at: string;
}

const AllBets = ({ match }: { match: Match }) => {
  const [orders, setOrders] = useState<PendingOrder[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("orders")
        .select("id, team_id, team_name, amount, created_at")
        .eq("match_id", match.id)
        .eq("status", "pending")
        .order("created_at", { ascending: false });
      if (data) setOrders(data);
    };
    load();
  }, [match.id]);

  const teamAOrders = orders.filter((o) => o.team_id === match.teamA.id);
  const teamBOrders = orders.filter((o) => o.team_id === match.teamB.id);

  if (orders.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-sm text-muted-foreground">No pending bets yet</p>
        <p className="text-xs text-muted-foreground/60 mt-1">Be the first to place a bet!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <TeamPendingSection
        teamName={match.teamA.shortName}
        orders={teamAOrders}
        colorClass="text-primary"
        borderClass="border-primary"
        bgClass="bg-primary/10"
      />
      <TeamPendingSection
        teamName={match.teamB.shortName}
        orders={teamBOrders}
        colorClass="text-accent"
        borderClass="border-accent"
        bgClass="bg-accent/10"
      />
    </div>
  );
};

const TeamPendingSection = ({
  teamName,
  orders,
  colorClass,
  borderClass,
  bgClass,
}: {
  teamName: string;
  orders: PendingOrder[];
  colorClass: string;
  borderClass: string;
  bgClass: string;
}) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className={`w-full flex items-center justify-between rounded-lg ${bgClass} border ${borderClass}/20 p-3 transition-colors hover:${bgClass}`}
      >
        <div className="flex items-center gap-2">
          <Users className={`h-4 w-4 ${colorClass}`} />
          <span className={`text-sm font-bold ${colorClass}`}>{teamName}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {orders.length} pending {orders.length === 1 ? "bet" : "bets"}
          </span>
          <span className={`text-xs font-bold ${colorClass}`}>
            ₹{orders.reduce((s, o) => s + o.amount, 0).toLocaleString("en-IN")}
          </span>
        </div>
      </button>

      <AnimatePresence>
        {expanded && orders.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="space-y-1.5 pt-2 pl-2">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className={`rounded-lg bg-card p-2.5 border-l-4 ${borderClass}/40 flex items-center justify-between`}
                >
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3 text-pending" />
                    <span className="text-xs text-muted-foreground">Pending</span>
                  </div>
                  <span className="text-sm font-semibold tabular-nums">₹{order.amount.toLocaleString("en-IN")}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AllBets;
