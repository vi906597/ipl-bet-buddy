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

    // Verify user is authenticated
    const anonClient = createClient(
      supabaseUrl,
      Deno.env.get("SUPABASE_ANON_KEY")!
    );
    const {
      data: { user },
    } = await anonClient.auth.getUser(authHeader.replace("Bearer ", ""));
    if (!user) throw new Error("Unauthorized");

    const body = await req.json();
    const { action, adminKey } = body;

    // Simple admin key check
    if (adminKey !== ADMIN_SECRET) {
      return new Response(
        JSON.stringify({ error: "Invalid admin key" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "list_matches") {
      const { data, error } = await supabase
        .from("matches")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return new Response(JSON.stringify({ matches: data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "add_match") {
      const { match } = body;
      const { data, error } = await supabase.from("matches").insert({
        match_key: match.match_key,
        team_a_id: match.team_a_id,
        team_a_name: match.team_a_name,
        team_a_short: match.team_a_short,
        team_b_id: match.team_b_id,
        team_b_name: match.team_b_name,
        team_b_short: match.team_b_short,
        status: match.status || "upcoming",
        start_time: match.start_time,
      }).select().single();
      if (error) throw error;
      return new Response(JSON.stringify({ match: data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "update_status") {
      const { match_key, status } = body;
      const { error } = await supabase
        .from("matches")
        .update({ status })
        .eq("match_key", match_key);
      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "settle") {
      const { match_key, winner_team_id } = body;
      // First settle orders via existing RPC
      const { data: settleResult, error: settleErr } = await supabase.rpc("settle_match", {
        p_match_id: match_key,
        p_winner_team_id: winner_team_id,
      });
      if (settleErr) throw settleErr;

      // Update match status
      await supabase
        .from("matches")
        .update({ status: "completed", winner_team_id })
        .eq("match_key", match_key);

      return new Response(
        JSON.stringify({ success: true, settled: settleResult }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "delete_match") {
      const { match_key } = body;
      const { error } = await supabase
        .from("matches")
        .delete()
        .eq("match_key", match_key);
      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
