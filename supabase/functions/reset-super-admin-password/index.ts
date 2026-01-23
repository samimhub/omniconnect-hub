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
    const { email, action, newPassword, setupKey } = await req.json();
    console.log('Password reset request for:', email, 'action:', action);

    if (!email) {
      throw new Error('Email is required');
    }

    // Create Supabase client with service role for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Direct password set for super admin (secured with setup key)
    if (action === 'direct_password_set') {
      // Security: Require a setup key for direct password setting
      const validSetupKey = 'PRIME_ADMIN_SETUP_2024';
      
      if (setupKey !== validSetupKey) {
        console.error('Invalid setup key provided');
        throw new Error('Invalid setup key');
      }

      if (!newPassword || newPassword.length < 8) {
        throw new Error('Password must be at least 8 characters');
      }

      // Find the user by email
      const { data: authUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers();
      
      if (listError) {
        console.error('Error listing users:', listError);
        throw new Error('Failed to find user');
      }

      const user = authUsers.users.find(u => u.email?.toLowerCase() === email.toLowerCase());
      
      if (!user) {
        console.log('User not found, creating new super admin:', email);
        
        // Create new super admin user
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email: email,
          password: newPassword,
          email_confirm: true,
        });

        if (createError) {
          console.error('Error creating user:', createError);
          throw new Error('Failed to create super admin user');
        }

        // Add super_admin role
        const { error: roleError } = await supabaseAdmin
          .from('user_roles')
          .insert({ user_id: newUser.user.id, role: 'super_admin' });

        if (roleError) {
          console.error('Error adding role:', roleError);
          // Continue anyway, user was created
        }

        // Create profile
        const { error: profileError } = await supabaseAdmin
          .from('profiles')
          .insert({ 
            user_id: newUser.user.id, 
            full_name: 'Super Admin',
          });

        if (profileError) {
          console.error('Error creating profile:', profileError);
        }

        console.log('New super admin created successfully:', newUser.user.id);

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Super Admin account created successfully. You can now login.',
            isNewUser: true
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        );
      }

      // Update existing user's password
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        user.id,
        { password: newPassword }
      );

      if (updateError) {
        console.error('Error updating password:', updateError);
        throw new Error('Failed to update password');
      }

      // Ensure user has super_admin role
      const { data: existingRole } = await supabaseAdmin
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'super_admin')
        .single();

      if (!existingRole) {
        await supabaseAdmin
          .from('user_roles')
          .insert({ user_id: user.id, role: 'super_admin' });
      }

      console.log('Password updated successfully for user:', user.id);

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Password updated successfully. You can now login.',
          isNewUser: false
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

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
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Password reset link sent to your email.',
          isAdmin: isAdminUser,
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