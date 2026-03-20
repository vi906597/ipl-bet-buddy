import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const ADMIN_SECRET = "ipl-admin-2026-secret";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) throw new Error("Missing auth");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const anonClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!);
    const { data: { user } } = await anonClient.auth.getUser(authHeader.replace("Bearer ", ""));
    if (!user) throw new Error("Unauthorized");

    const body = await req.json();
    const { action, adminKey } = body;

    if (adminKey !== ADMIN_SECRET) {
      return new Response(JSON.stringify({ error: "Invalid admin key" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const json = (data: any) => new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

    // ============ MATCHES ============
    if (action === "list_matches") {
      const { data, error } = await supabase.from("matches").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return json({ matches: data });
    }

    if (action === "add_match") {
      const { match } = body;
      const { data, error } = await supabase.from("matches").insert({
        match_key: match.match_key, team_a_id: match.team_a_id, team_a_name: match.team_a_name,
        team_a_short: match.team_a_short, team_b_id: match.team_b_id, team_b_name: match.team_b_name,
        team_b_short: match.team_b_short, status: match.status || "upcoming", start_time: match.start_time,
      }).select().single();
      if (error) throw error;
      return json({ match: data });
    }

    if (action === "update_status") {
      const { match_key, status } = body;
      const { error } = await supabase.from("matches").update({ status }).eq("match_key", match_key);
      if (error) throw error;
      return json({ success: true });
    }

    if (action === "settle") {
      const { match_key, winner_team_id } = body;
      const { data: settleResult, error: settleErr } = await supabase.rpc("settle_match", {
        p_match_id: match_key, p_winner_team_id: winner_team_id,
      });
      if (settleErr) throw settleErr;
      await supabase.from("matches").update({ status: "completed", winner_team_id }).eq("match_key", match_key);
      return json({ success: true, settled: settleResult });
    }

    if (action === "delete_match") {
      const { match_key } = body;
      const { error } = await supabase.from("matches").delete().eq("match_key", match_key);
      if (error) throw error;
      return json({ success: true });
    }

    // ============ DEPOSITS ============
    if (action === "list_deposits") {
      const { data, error } = await supabase.from("deposit_requests").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return json({ deposits: data });
    }

    if (action === "update_deposit") {
      const { deposit_id, status } = body;
      const { data: dep, error: depErr } = await supabase.from("deposit_requests").select("*").eq("id", deposit_id).single();
      if (depErr) throw depErr;

      const { error } = await supabase.from("deposit_requests").update({ status, updated_at: new Date().toISOString() }).eq("id", deposit_id);
      if (error) throw error;

      if (status === "approved" && dep) {
        const { data: profile } = await supabase.from("profiles").select("wallet").eq("user_id", dep.user_id).single();
        if (profile) {
          await supabase.from("profiles").update({ wallet: profile.wallet + dep.amount, updated_at: new Date().toISOString() }).eq("user_id", dep.user_id);
        }
      }
      return json({ success: true });
    }

    // ============ WITHDRAWALS ============
    if (action === "list_withdrawals") {
      const { data, error } = await supabase.from("withdraw_requests").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return json({ withdrawals: data });
    }

    if (action === "update_withdrawal") {
      const { withdrawal_id, status } = body;
      const { data: wr, error: wrErr } = await supabase.from("withdraw_requests").select("*").eq("id", withdrawal_id).single();
      if (wrErr) throw wrErr;

      const { error } = await supabase.from("withdraw_requests").update({ status, updated_at: new Date().toISOString() }).eq("id", withdrawal_id);
      if (error) throw error;

      if (status === "approved" && wr) {
        const { data: profile } = await supabase.from("profiles").select("wallet").eq("user_id", wr.user_id).single();
        if (profile) {
          const newBalance = Math.max(0, profile.wallet - wr.amount);
          await supabase.from("profiles").update({ wallet: newBalance, updated_at: new Date().toISOString() }).eq("user_id", wr.user_id);
        }
      }
      return json({ success: true });
    }

    // ============ QR CODES ============
    if (action === "list_qr_codes") {
      const { data, error } = await supabase.from("qr_codes").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return json({ qr_codes: data });
    }

    if (action === "add_qr_code") {
      const { label, image_url, amount } = body;
      // Deactivate existing QR for same amount
      if (amount) {
        await supabase.from("qr_codes").update({ is_active: false }).eq("amount", amount).eq("is_active", true);
      }
      const { error } = await supabase.from("qr_codes").insert({ label: label || "", image_url, is_active: true, amount: amount || null });
      if (error) throw error;
      return json({ success: true });
    }

    if (action === "delete_qr_code") {
      const { qr_id } = body;
      const { error } = await supabase.from("qr_codes").delete().eq("id", qr_id);
      if (error) throw error;
      return json({ success: true });
    }

    // ============ ADMIN WALLET UPDATE (by email) ============
    if (action === "admin_wallet_update") {
      const { email, amount, wallet_action } = body;
      const { data: users, error: userErr } = await supabase.auth.admin.listUsers();
      if (userErr) throw userErr;
      const targetUser = users.users.find((u: any) => u.email === email);
      if (!targetUser) throw new Error("User not found");

      const { data: profile } = await supabase.from("profiles").select("wallet").eq("user_id", targetUser.id).single();
      if (!profile) throw new Error("Profile not found");

      const newBalance = wallet_action === "add" ? profile.wallet + amount : Math.max(0, profile.wallet - amount);
      await supabase.from("profiles").update({ wallet: newBalance, updated_at: new Date().toISOString() }).eq("user_id", targetUser.id);
      return json({ success: true, new_balance: newBalance });
    }

    // ============ ADMIN WALLET UPDATE (by user_id) ============
    if (action === "admin_wallet_update_by_id") {
      const { user_id, amount, wallet_action } = body;
      const { data: profile } = await supabase.from("profiles").select("wallet").eq("user_id", user_id).single();
      if (!profile) throw new Error("Profile not found");

      const newBalance = wallet_action === "add" ? profile.wallet + amount : Math.max(0, profile.wallet - amount);
      await supabase.from("profiles").update({ wallet: newBalance, updated_at: new Date().toISOString() }).eq("user_id", user_id);
      return json({ success: true, new_balance: newBalance });
    }

    // ============ LIST ALL USERS ============
    if (action === "list_users") {
      const { data: authUsers, error: authErr } = await supabase.auth.admin.listUsers();
      if (authErr) throw authErr;
      const { data: profiles } = await supabase.from("profiles").select("*");
      
      const users = (profiles || []).map((p: any) => {
        const authUser = authUsers.users.find((u: any) => u.id === p.user_id);
        return {
          user_id: p.user_id,
          username: p.username,
          wallet: p.wallet,
          email: authUser?.email || "N/A",
          created_at: p.created_at,
        };
      });
      return json({ users });
    }

    // ============ LEADERBOARD ============
    if (action === "list_leaderboard") {
      const { data, error } = await supabase.from("leaderboard_entries").select("*").order("rank_position", { ascending: true });
      if (error) throw error;
      return json({ entries: data });
    }

    if (action === "add_leaderboard") {
      const { name, amount, rank_position } = body;
      const { error } = await supabase.from("leaderboard_entries").insert({ name, amount, rank_position });
      if (error) throw error;
      return json({ success: true });
    }

    if (action === "delete_leaderboard") {
      const { entry_id } = body;
      const { error } = await supabase.from("leaderboard_entries").delete().eq("id", entry_id);
      if (error) throw error;
      return json({ success: true });
    }

    // ============ SITE SETTINGS ============
    if (action === "update_setting") {
      const { key, value } = body;
      const { error } = await supabase.from("site_settings").upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" });
      if (error) throw error;
      return json({ success: true });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
