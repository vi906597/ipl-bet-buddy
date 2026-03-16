import { create } from "zustand";
import type { Order } from "@/types/betting";
import { COMMISSION_RATE } from "@/types/betting";

interface BettingState {
  wallet: number;
  orders: Order[];
  placeOrder: (matchId: string, teamId: string, teamName: string, opponentName: string, amount: number) => void;
  settleMatch: (matchId: string, winnerTeamId: string) => void;
}

export const useBettingStore = create<BettingState>((set, get) => ({
  wallet: 5000,
  orders: [],

  placeOrder: (matchId, teamId, teamName, opponentName, amount) => {
    const { wallet, orders } = get();
    if (wallet < amount) return;

    // Check if there's a pending order on the opponent side for this match
    const pendingOpponent = orders.find(
      (o) => o.matchId === matchId && o.teamId !== teamId && o.status === "pending" && o.amount === amount
    );

    const newOrder: Order = {
      id: `order-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      matchId,
      teamId,
      teamName,
      opponentName,
      amount,
      status: "pending",
    };

    if (pendingOpponent) {
      // Match both orders
      newOrder.status = "matched";
      newOrder.matchedAt = Date.now();
      const updatedOrders = orders.map((o) =>
        o.id === pendingOpponent.id ? { ...o, status: "matched" as const, matchedAt: Date.now() } : o
      );
      set({
        wallet: wallet - amount,
        orders: [...updatedOrders, newOrder],
      });
    } else {
      set({
        wallet: wallet - amount,
        orders: [...orders, newOrder],
      });
    }
  },

  settleMatch: (matchId, winnerTeamId) => {
    const { orders, wallet } = get();
    let walletDelta = 0;

    const updatedOrders = orders.map((o) => {
      if (o.matchId !== matchId || o.status !== "matched") return o;

      if (o.teamId === winnerTeamId) {
        const pot = o.amount * 2;
        const commission = pot * COMMISSION_RATE;
        const payout = pot - commission;
        walletDelta += payout;
        return { ...o, status: "won" as const, commission, payout };
      } else {
        return { ...o, status: "lost" as const, commission: 0, payout: 0 };
      }
    });

    set({ orders: updatedOrders, wallet: wallet + walletDelta });
  },
}));
