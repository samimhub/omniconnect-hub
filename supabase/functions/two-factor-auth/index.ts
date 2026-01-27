import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Generate a 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, userId, email, otp } = await req.json();
    console.log('2FA request:', action, 'for user:', userId || email);

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Check if user is super_admin or admin
    const checkAdminRole = async (uid: string): Promise<boolean> => {
      const { data: roles } = await supabaseAdmin
        .from('user_roles')
        .select('role')
        .eq('user_id', uid)
        .in('role', ['admin', 'super_admin']);
      return !!(roles && roles.length > 0);
    };

    // SEND OTP - Called after successful login for admins
    if (action === 'send_otp') {
      if (!userId || !email) {
        throw new Error('User ID and email are required');
      }

      // Verify user is admin/super_admin
      const isAdmin = await checkAdminRole(userId);
      if (!isAdmin) {
        console.log('User is not admin, skipping 2FA');
        return new Response(
          JSON.stringify({ success: true, requires2FA: false }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Generate OTP and expiry (5 minutes)
      const otpCode = generateOTP();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

      // Upsert 2FA record
      const { error: upsertError } = await supabaseAdmin
        .from('two_factor_auth')
        .upsert({
          user_id: userId,
          is_enabled: true,
          otp_code: otpCode,
          otp_expires_at: expiresAt,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

      if (upsertError) {
        console.error('Error saving OTP:', upsertError);
        throw new Error('Failed to generate OTP');
      }

      // Send OTP via email using Resend
      const resendApiKey = Deno.env.get('RESEND_API_KEY');
      if (resendApiKey) {
        try {
          const emailResponse = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${resendApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: 'Prime Connect <noreply@resend.dev>',
              to: [email],
              subject: 'Your Login Verification Code',
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #333;">Login Verification</h2>
                  <p>Your verification code is:</p>
                  <div style="background: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0;">
                    <h1 style="color: #6366f1; letter-spacing: 5px; margin: 0;">${otpCode}</h1>
                  </div>
                  <p style="color: #666;">This code expires in 5 minutes.</p>
                  <p style="color: #666;">If you didn't request this code, please ignore this email.</p>
                </div>
              `,
            }),
          });

          if (!emailResponse.ok) {
            console.error('Failed to send email:', await emailResponse.text());
          } else {
            console.log('OTP email sent successfully to:', email);
          }
        } catch (emailErr) {
          console.error('Email sending error:', emailErr);
        }
      } else {
        console.log('RESEND_API_KEY not configured, OTP:', otpCode);
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          requires2FA: true,
          message: 'Verification code sent to your email'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // VERIFY OTP - Called to verify the OTP entered by user
    if (action === 'verify_otp') {
      if (!userId || !otp) {
        throw new Error('User ID and OTP are required');
      }

      // Get stored OTP
      const { data: twoFAData, error: fetchError } = await supabaseAdmin
        .from('two_factor_auth')
        .select('otp_code, otp_expires_at')
        .eq('user_id', userId)
        .single();

      if (fetchError || !twoFAData) {
        console.error('Error fetching 2FA data:', fetchError);
        throw new Error('Verification failed');
      }

      // Check if OTP expired
      if (new Date(twoFAData.otp_expires_at) < new Date()) {
        throw new Error('Verification code expired. Please request a new one.');
      }

      // Verify OTP
      if (twoFAData.otp_code !== otp) {
        throw new Error('Invalid verification code');
      }

      // Clear OTP after successful verification
      await supabaseAdmin
        .from('two_factor_auth')
        .update({
          otp_code: null,
          otp_expires_at: null,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      console.log('OTP verified successfully for user:', userId);

      return new Response(
        JSON.stringify({ success: true, verified: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // RESEND OTP - Called when user requests new OTP
    if (action === 'resend_otp') {
      if (!userId || !email) {
        throw new Error('User ID and email are required');
      }

      // Reuse send_otp logic
      const otpCode = generateOTP();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

      await supabaseAdmin
        .from('two_factor_auth')
        .update({
          otp_code: otpCode,
          otp_expires_at: expiresAt,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      // Send email
      const resendApiKey = Deno.env.get('RESEND_API_KEY');
      if (resendApiKey) {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Prime Connect <noreply@resend.dev>',
            to: [email],
            subject: 'Your New Login Verification Code',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333;">Login Verification</h2>
                <p>Your new verification code is:</p>
                <div style="background: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0;">
                  <h1 style="color: #6366f1; letter-spacing: 5px; margin: 0;">${otpCode}</h1>
                </div>
                <p style="color: #666;">This code expires in 5 minutes.</p>
              </div>
            `,
          }),
        });
      }

      return new Response(
        JSON.stringify({ success: true, message: 'New verification code sent' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // CHECK 2FA STATUS - Check if user requires 2FA
    if (action === 'check_status') {
      if (!userId) {
        throw new Error('User ID is required');
      }

      const isAdmin = await checkAdminRole(userId);

      return new Response(
        JSON.stringify({ success: true, requires2FA: isAdmin }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    throw new Error('Invalid action');
  } catch (err) {
    const error = err instanceof Error ? err : new Error('Unknown error');
    console.error('2FA error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
