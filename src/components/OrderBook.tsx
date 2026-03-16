import { useBettingStore } from "@/store/bettingStore";
import { motion, AnimatePresence } from "framer-motion";

const OrderBook = ({ matchId }: { matchId?: string }) => {
  const orders = useBettingStore((s) => s.orders);

  const filtered = matchId ? orders.filter((o) => o.matchId === matchId) : orders;
  const pending = filtered.filter((o) => o.status === "pending");
  const matched = filtered.filter((o) => o.status === "matched");
  const settled = filtered.filter((o) => o.status === "won" || o.status === "lost");

  if (filtered.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-muted-foreground">No bets placed yet</p>
        <p className="text-xs text-muted-foreground/60 mt-1">Select a team and stake to begin</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {pending.length > 0 && (
        <Section title="Unmatched" count={pending.length}>
          <AnimatePresence>
            {pending.map((order) => (
              <motion.div
                key={order.id}
                layout
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                className="rounded-lg bg-card p-3 shadow-subtle border-l-4 border-pending"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-pending animate-pulse-dot" />
                    <span className="text-sm font-medium">{order.teamName}</span>
                  </div>
                  <span className="text-sm font-semibold tabular-nums">₹{order.amount}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Waiting for {order.opponentName} backer
                </p>
              </motion.div>
            ))}
          </AnimatePresence>
        </Section>
      )}

      {matched.length > 0 && (
        <Section title="Matched" count={matched.length}>
          <AnimatePresence>
            {matched.map((order) => (
              <motion.div
                key={order.id}
                layout
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 0.2 }}
                className="rounded-lg bg-card p-3 shadow-subtle border-l-4 border-success"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-success" />
                    <span className="text-sm font-medium">{order.teamName}</span>
                  </div>
                  <span className="text-sm font-semibold tabular-nums">₹{order.amount * 2} pot</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Matched · ₹{(order.amount * 2 * 0.05).toFixed(0)} commission pending
                </p>
              </motion.div>
            ))}
          </AnimatePresence>
        </Section>
      )}

      {settled.length > 0 && (
        <Section title="Settled" count={settled.length}>
          {settled.map((order) => (
            <div
              key={order.id}
              className={`rounded-lg bg-card p-3 shadow-subtle border-l-4 ${
                order.status === "won" ? "border-success" : "border-destructive"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{order.teamName}</span>
                <span className={`text-sm font-semibold tabular-nums ${
                  order.status === "won" ? "text-success" : "text-destructive"
                }`}>
                  {order.status === "won" ? `+₹${order.payout?.toFixed(0)}` : `-₹${order.amount}`}
                </span>
              </div>
              {order.status === "won" && (
                <p className="text-xs text-muted-foreground mt-1">
                  ₹{order.commission?.toFixed(0)} commission deducted
                </p>
              )}
            </div>
          ))}
        </Section>
      )}
    </div>
  );
};

const Section = ({ title, count, children }: { title: string; count: number; children: React.ReactNode }) => (
  <div>
    <div className="flex items-center gap-2 mb-2">
      <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{title}</h3>
      <span className="text-xs bg-muted text-muted-foreground rounded-full px-1.5 py-0.5 tabular-nums">{count}</span>
    </div>
    <div className="space-y-2">{children}</div>
  </div>
);

export default OrderBook;
