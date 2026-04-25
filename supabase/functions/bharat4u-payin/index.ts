import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) throw new Error("Missing auth");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonClient = createClient(supabaseUrl, anonKey);
    const { data: { user } } = await anonClient.auth.getUser(authHeader.replace("Bearer ", ""));
    if (!user) throw new Error("Unauthorized");

    const BHARAT_MID = Deno.env.get("BHARAT4U_MID");
    const BHARAT_KEY = Deno.env.get("BHARAT4U_KEY");

    if (!BHARAT_MID || !BHARAT_KEY) {
      throw new Error("Payment gateway not configured. Contact admin.");
    }

    const body = await req.json();
    const { amount } = body;

    if (!amount || amount <= 0) throw new Error("Invalid amount");

    // Service role client for inserts
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    // 1) Create deposit_request first so user history shows it immediately
    const { data: deposit, error: depErr } = await adminClient
      .from("deposit_requests")
      .insert({
        user_id: user.id,
        amount,
        user_email: user.email || "",
        status: "pending",
      })
      .select()
      .single();
    if (depErr) throw depErr;

    const orderId = `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`;

    // 2) Call Bharat4U PayIn v1 (URL without .php per docs)
    const formData = new URLSearchParams();
    formData.append("bharat_mid", BHARAT_MID);
    formData.append("bharat_key", BHARAT_KEY);
    formData.append("order_id", orderId);
    formData.append("amount", amount.toString());
    formData.append("customer_mobile", "9999999999");

    const response = await fetch("https://api.bharat4ubiz.site/api/payin/v1/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData.toString(),
    });

    const result = await response.json();

    if (!response.ok || !result.status) {
      throw new Error(`Bharat4U API error [${response.status}]: ${JSON.stringify(result)}`);
    }

    return new Response(JSON.stringify({
      payment_url: result.result?.payment_url,
      order_id: result.result?.order_id || orderId,
      deposit_id: deposit.id,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : String(err) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
