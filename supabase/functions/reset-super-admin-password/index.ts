import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, action } = await req.json();
    console.log('Password reset request for:', email, 'action:', action);

    if (!email) {
      throw new Error('Email is required');
    }

    // Create Supabase client with service role for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    if (action === 'send_reset_link') {
      // Verify user exists and is a super_admin or admin
      const { data: authUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers();
      
      if (listError) {
        console.error('Error listing users:', listError);
        throw new Error('Failed to verify user');
      }

      const user = authUsers.users.find(u => u.email?.toLowerCase() === email.toLowerCase());
      
      if (!user) {
        // Don't reveal if user exists or not for security
        console.log('User not found:', email);
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'If the email exists, a password reset link has been sent.' 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        );
      }

      // Check if user has admin or super_admin role
      const { data: roles } = await supabaseAdmin
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .in('role', ['admin', 'super_admin']);

      const isAdminUser = roles && roles.length > 0;
      console.log('User roles found:', roles, 'isAdmin:', isAdminUser);

      // Generate password reset link
      const { data: resetData, error: resetError } = await supabaseAdmin.auth.admin.generateLink({
        type: 'recovery',
        email: email,
        options: {
          redirectTo: `${req.headers.get('origin') || 'https://prime-connect-platform.lovable.app'}/auth?mode=reset`,
        }
      });

      if (resetError) {
        console.error('Error generating reset link:', resetError);
        throw new Error('Failed to generate password reset link');
      }

      console.log('Password reset link generated successfully for:', email);
      
      // In production, you would send this via email
      // For now, we log it and return success
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Password reset link sent to your email.',
          isAdmin: isAdminUser,
          // Only include link in development/testing - remove in production
          ...(Deno.env.get('ENVIRONMENT') === 'development' && { 
            resetLink: resetData?.properties?.action_link 
          })
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    if (action === 'update_password') {
      const authHeader = req.headers.get('Authorization');
      if (!authHeader) {
        throw new Error('Authorization required to update password');
      }

      // Verify the user from the token
      const supabaseUser = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? '',
        { global: { headers: { Authorization: authHeader } } }
      );

      const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
      if (userError || !user) {
        console.error('Auth error:', userError);
        throw new Error('Invalid session');
      }

      const { newPassword } = await req.json();
      
      if (!newPassword || newPassword.length < 8) {
        throw new Error('Password must be at least 8 characters');
      }

      // Update password using admin client
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        user.id,
        { password: newPassword }
      );

      if (updateError) {
        console.error('Error updating password:', updateError);
        throw new Error('Failed to update password');
      }

      console.log('Password updated successfully for user:', user.id);

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Password updated successfully' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    throw new Error('Invalid action');
  } catch (err) {
    const error = err instanceof Error ? err : new Error('Unknown error');
    console.error('Password reset error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
