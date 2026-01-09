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
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Create Supabase client with service role for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify the requesting user is an admin
    const supabaseUser = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      console.error('Auth error:', userError);
      throw new Error('Unauthorized');
    }

    // Check if user is admin
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (roleError || !roleData) {
      console.error('Role check error:', roleError);
      throw new Error('Admin access required');
    }

    const { action, ...params } = await req.json();
    console.log('Admin user action:', action, params);

    let result;

    switch (action) {
      case 'list_users': {
        // Get all users from auth.users with their profiles and roles
        const { data: authUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers({
          page: params.page || 1,
          perPage: params.perPage || 50,
        });

        if (listError) throw listError;

        // Get profiles for all users
        const userIds = authUsers.users.map(u => u.id);
        const { data: profiles } = await supabaseAdmin
          .from('profiles')
          .select('*')
          .in('user_id', userIds);

        // Get roles for all users
        const { data: roles } = await supabaseAdmin
          .from('user_roles')
          .select('*')
          .in('user_id', userIds);

        // Get subscriptions for all users
        const { data: subscriptions } = await supabaseAdmin
          .from('subscriptions')
          .select('*')
          .in('user_id', userIds)
          .eq('status', 'active');

        // Combine data
        const users = authUsers.users.map(authUser => {
          const profile = profiles?.find(p => p.user_id === authUser.id);
          const userRoles = roles?.filter(r => r.user_id === authUser.id) || [];
          const subscription = subscriptions?.find(s => s.user_id === authUser.id);

          return {
            id: authUser.id,
            email: authUser.email,
            phone: profile?.phone || authUser.phone,
            created_at: authUser.created_at,
            last_sign_in_at: authUser.last_sign_in_at,
            email_confirmed_at: authUser.email_confirmed_at,
            banned_until: authUser.banned_until,
            full_name: profile?.full_name || authUser.user_metadata?.full_name,
            avatar_url: profile?.avatar_url,
            referral_code: profile?.referral_code,
            roles: userRoles.map(r => r.role),
            subscription: subscription ? {
              plan_name: subscription.plan_name,
              status: subscription.status,
              end_date: subscription.end_date,
            } : null,
          };
        });

        result = { users, total: authUsers.users.length };
        break;
      }

      case 'update_role': {
        const { userId, role, roleAction } = params;
        
        if (!userId || !role) {
          throw new Error('userId and role are required');
        }

        if (roleAction === 'add') {
          // Check if role already exists
          const { data: existing } = await supabaseAdmin
            .from('user_roles')
            .select('id')
            .eq('user_id', userId)
            .eq('role', role)
            .maybeSingle();

          if (!existing) {
            const { error: insertError } = await supabaseAdmin
              .from('user_roles')
              .insert({ user_id: userId, role });

            if (insertError) throw insertError;
          }
        } else if (roleAction === 'remove') {
          const { error: deleteError } = await supabaseAdmin
            .from('user_roles')
            .delete()
            .eq('user_id', userId)
            .eq('role', role);

          if (deleteError) throw deleteError;
        }

        result = { success: true, message: `Role ${roleAction === 'add' ? 'added' : 'removed'} successfully` };
        break;
      }

      case 'ban_user': {
        const { userId, duration } = params;
        
        if (!userId) {
          throw new Error('userId is required');
        }

        let banUntil: string | null = null;
        if (duration) {
          const banDate = new Date();
          if (duration === 'permanent') {
            banDate.setFullYear(banDate.getFullYear() + 100);
          } else {
            banDate.setDate(banDate.getDate() + parseInt(duration));
          }
          banUntil = banDate.toISOString();
        }

        const { error: banError } = await supabaseAdmin.auth.admin.updateUserById(
          userId,
          { ban_duration: duration === 'permanent' ? 'none' : `${duration} days` }
        );

        if (banError) throw banError;

        result = { success: true, message: 'User banned successfully' };
        break;
      }

      case 'unban_user': {
        const { userId } = params;
        
        if (!userId) {
          throw new Error('userId is required');
        }

        const { error: unbanError } = await supabaseAdmin.auth.admin.updateUserById(
          userId,
          { ban_duration: 'none' }
        );

        if (unbanError) throw unbanError;

        result = { success: true, message: 'User unbanned successfully' };
        break;
      }

      case 'delete_user': {
        const { userId } = params;
        
        if (!userId) {
          throw new Error('userId is required');
        }

        // Don't allow deleting yourself
        if (userId === user.id) {
          throw new Error('Cannot delete your own account');
        }

        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);

        if (deleteError) throw deleteError;

        result = { success: true, message: 'User deleted successfully' };
        break;
      }

      case 'get_user_details': {
        const { userId } = params;
        
        if (!userId) {
          throw new Error('userId is required');
        }

        const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(userId);
        if (authError) throw authError;

        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();

        const { data: roles } = await supabaseAdmin
          .from('user_roles')
          .select('*')
          .eq('user_id', userId);

        const { data: subscriptions } = await supabaseAdmin
          .from('subscriptions')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        const { data: wallet } = await supabaseAdmin
          .from('wallets')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();

        const { data: appointments } = await supabaseAdmin
          .from('appointments')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(10);

        result = {
          user: authUser.user,
          profile,
          roles: roles?.map(r => r.role) || [],
          subscriptions,
          wallet,
          appointments,
        };
        break;
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (err) {
    const error = err instanceof Error ? err : new Error('Unknown error');
    console.error('Admin users error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
