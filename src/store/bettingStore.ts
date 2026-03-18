import { create } from "zustand";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Order = Tables<"orders">;

interface BettingState {
  wallet: number;
  orders: Order[];
  loading: boolean;
  transactions: any[];
  fetchProfile: () => Promise<void>;
  fetchOrders: (matchId?: string) => Promise<void>;
  placeOrder: (matchId: string, teamId: string, teamName: string, opponentName: string, amount: number) => Promise<{ status: string; error?: string }>;
  settleMatch: (matchId: string, winnerTeamId: string) => Promise<void>;
  deposit: (amount: number) => Promise<{ status?: string; error?: string }>;
  withdraw: (amount: number) => Promise<{ status?: string; error?: string }>;
  fetchTransactions: () => Promise<void>;
}

export const useBettingStore = create<BettingState>((set, get) => ({
  wallet: 0,
  orders: [],
  transactions: [],
  loading: false,

  fetchProfile: async () => {
    const { data } = await supabase
      .from("profiles")
      .select("wallet")
      .single();
    if (data) set({ wallet: data.wallet });
  },

  fetchOrders: async (matchId?: string) => {
    let query = supabase.from("orders").select("*").order("created_at", { ascending: false });
    if (matchId) query = query.eq("match_id", matchId);
    const { data } = await query;
    if (data) set({ orders: data });
  },

  placeOrder: async (matchId, teamId, teamName, opponentName, amount) => {
    set({ loading: true });
    const { data, error } = await supabase.rpc("place_order", {
      p_match_id: matchId,
      p_team_id: teamId,
      p_team_name: teamName,
      p_opponent_name: opponentName,
      p_amount: amount,
    });

    if (error) {
      set({ loading: false });
      return { status: "error", error: error.message };
    }

    const result = data as any;
    if (result?.error) {
      set({ loading: false });
      return { status: "error", error: result.error };
    }

    // Refresh data
    await get().fetchProfile();
    await get().fetchOrders(matchId);
    set({ loading: false });
    return { status: result?.status || "pending" };
  },

  settleMatch: async (matchId, winnerTeamId) => {
    await supabase.rpc("settle_match", {
      p_match_id: matchId,
      p_winner_team_id: winnerTeamId,
    });
    await get().fetchProfile();
    await get().fetchOrders(matchId);
  },

  deposit: async (amount) => {
    const { data, error } = await supabase.rpc("wallet_deposit", { p_amount: amount });
    if (error) return { error: error.message };
    const result = data as any;
    if (result?.error) return { error: result.error };
    await get().fetchProfile();
    await get().fetchTransactions();
    return { status: "success" };
  },

  withdraw: async (amount) => {
    const { data, error } = await supabase.rpc("wallet_withdraw", { p_amount: amount });
    if (error) return { error: error.message };
    const result = data as any;
    if (result?.error) return { error: result.error };
    await get().fetchProfile();
    await get().fetchTransactions();
    return { status: "success" };
  },

  fetchTransactions: async () => {
    const { data } = await supabase
      .from("transactions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);
    if (data) set({ transactions: data });
  },
}));
