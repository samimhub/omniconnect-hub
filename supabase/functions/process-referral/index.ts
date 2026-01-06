import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { referral_code, referee_user_id } = await req.json();

    if (!referral_code || !referee_user_id) {
      return new Response(
        JSON.stringify({ error: "Missing referral_code or referee_user_id" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Processing referral: code=${referral_code}, referee=${referee_user_id}`);

    // Find the referrer by their referral code
    const { data: referrerProfile, error: referrerError } = await supabase
      .from("profiles")
      .select("id, user_id")
      .eq("referral_code", referral_code.toUpperCase())
      .maybeSingle();

    if (referrerError || !referrerProfile) {
      console.error("Referrer not found:", referrerError);
      return new Response(
        JSON.stringify({ error: "Invalid referral code" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if referee already has a referral
    const { data: existingReferral } = await supabase
      .from("referrals")
      .select("id")
      .eq("referee_id", referee_user_id)
      .maybeSingle();

    if (existingReferral) {
      console.log("Referral already exists for this user");
      return new Response(
        JSON.stringify({ message: "Referral already processed" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Prevent self-referral
    if (referrerProfile.user_id === referee_user_id) {
      return new Response(
        JSON.stringify({ error: "Cannot refer yourself" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create the referral record
    const { data: referral, error: insertError } = await supabase
      .from("referrals")
      .insert({
        referrer_id: referrerProfile.user_id,
        referee_id: referee_user_id,
        referrer_reward: 50,
        referee_reward: 25,
        status: "pending",
      })
      .select()
      .single();

    if (insertError) {
      console.error("Failed to create referral:", insertError);
      throw insertError;
    }

    console.log("Referral created:", referral.id);

    // Update referral status to completed (triggers reward distribution)
    const { error: updateError } = await supabase
      .from("referrals")
      .update({ status: "completed" })
      .eq("id", referral.id);

    if (updateError) {
      console.error("Failed to complete referral:", updateError);
      throw updateError;
    }

    // Update referee's profile with referred_by
    await supabase
      .from("profiles")
      .update({ referred_by: referrerProfile.id })
      .eq("user_id", referee_user_id);

    console.log("Referral completed successfully");

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Referral processed! Both users received rewards.",
        referrer_reward: 50,
        referee_reward: 25
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error processing referral:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process referral" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
