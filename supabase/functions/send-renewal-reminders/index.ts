import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting renewal reminder check...");

    // Create Supabase admin client
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get current date and date 7 days from now
    const today = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(today.getDate() + 7);

    console.log(`Checking subscriptions expiring between ${today.toISOString()} and ${sevenDaysFromNow.toISOString()}`);

    // Find active subscriptions expiring within 7 days
    const { data: expiringSubscriptions, error: subError } = await supabase
      .from("subscriptions")
      .select("id, user_id, plan_name, plan_price, end_date, billing_cycle")
      .eq("status", "active")
      .gte("end_date", today.toISOString())
      .lte("end_date", sevenDaysFromNow.toISOString());

    if (subError) {
      console.error("Error fetching subscriptions:", subError);
      throw subError;
    }

    console.log(`Found ${expiringSubscriptions?.length || 0} expiring subscriptions`);

    if (!expiringSubscriptions || expiringSubscriptions.length === 0) {
      return new Response(
        JSON.stringify({ message: "No expiring subscriptions found", sent: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get user emails from auth.users
    const userIds = expiringSubscriptions.map((sub) => sub.user_id);
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();

    if (usersError) {
      console.error("Error fetching users:", usersError);
      throw usersError;
    }

    // Create a map of user_id to email
    const userEmailMap = new Map<string, string>();
    users.users.forEach((user) => {
      if (userIds.includes(user.id)) {
        userEmailMap.set(user.id, user.email || "");
      }
    });

    let sentCount = 0;
    const errors: string[] = [];

    // Send reminder emails
    for (const subscription of expiringSubscriptions) {
      const userEmail = userEmailMap.get(subscription.user_id);
      
      if (!userEmail) {
        console.log(`No email found for user ${subscription.user_id}`);
        continue;
      }

      const expiryDate = new Date(subscription.end_date);
      const daysRemaining = Math.ceil(
        (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );

      try {
        console.log(`Sending reminder to ${userEmail} - ${daysRemaining} days remaining`);

        const emailResponse = await resend.emails.send({
          from: "CareSync <onboarding@resend.dev>",
          to: [userEmail],
          subject: `Your ${subscription.plan_name} membership expires in ${daysRemaining} days`,
          html: `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
              </head>
              <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f4f4f5;">
                <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                  <div style="background-color: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <div style="text-align: center; margin-bottom: 30px;">
                      <h1 style="color: #7c3aed; margin: 0; font-size: 28px;">⏰ Renewal Reminder</h1>
                    </div>
                    
                    <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                      Hi there,
                    </p>
                    
                    <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                      Your <strong style="color: #7c3aed;">${subscription.plan_name}</strong> membership is expiring in 
                      <strong style="color: #dc2626;">${daysRemaining} days</strong> on 
                      <strong>${expiryDate.toLocaleDateString("en-IN", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}</strong>.
                    </p>
                    
                    <div style="background-color: #faf5ff; border-left: 4px solid #7c3aed; padding: 16px; margin: 24px 0; border-radius: 0 8px 8px 0;">
                      <p style="margin: 0; color: #6b21a8; font-size: 14px;">
                        <strong>Don't lose your benefits!</strong><br>
                        Renew now to continue enjoying exclusive discounts on all your bookings.
                      </p>
                    </div>
                    
                    <div style="text-align: center; margin: 30px 0;">
                      <a href="${Deno.env.get("SUPABASE_URL")?.replace(".supabase.co", ".lovable.app")}/membership" 
                         style="display: inline-block; background: linear-gradient(135deg, #7c3aed, #a855f7); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                        Renew Membership
                      </a>
                    </div>
                    
                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
                    
                    <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
                      You're receiving this email because you have an active membership with CareSync.
                      <br>If you don't want to receive these reminders, you can ignore this email.
                    </p>
                  </div>
                </div>
              </body>
            </html>
          `,
        });

        console.log(`Email sent to ${userEmail}:`, emailResponse);
        sentCount++;
      } catch (emailError) {
        console.error(`Failed to send email to ${userEmail}:`, emailError);
        errors.push(`Failed to send to ${userEmail}: ${emailError}`);
      }
    }

    console.log(`Renewal reminders sent: ${sentCount}/${expiringSubscriptions.length}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Sent ${sentCount} renewal reminders`,
        sent: sentCount,
        total: expiringSubscriptions.length,
        errors: errors.length > 0 ? errors : undefined,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in send-renewal-reminders:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
