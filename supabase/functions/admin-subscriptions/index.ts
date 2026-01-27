import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper function to verify admin role
async function verifyAdminRole(req: Request, supabaseAdmin: ReturnType<typeof createClient>) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return { error: 'Unauthorized: Missing authorization header', status: 401 };
  }

  // Create a client with the user's token to verify their identity
  const supabaseUser = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    { global: { headers: { Authorization: authHeader } } }
  );

  const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
  if (userError || !user) {
    console.error('Auth error:', userError);
    return { error: 'Unauthorized: Invalid token', status: 401 };
  }

  // Check if user has admin or super_admin role using service role client
  const { data: roleData, error: roleError } = await supabaseAdmin
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .in('role', ['admin', 'super_admin']);

  if (roleError) {
    console.error('Role check error:', roleError);
    return { error: 'Error checking user role', status: 500 };
  }

  if (!roleData || roleData.length === 0) {
    console.log('Access denied for user:', user.id);
    return { error: 'Forbidden: Admin access required', status: 403 };
  }

  console.log('Admin access granted for user:', user.id, 'with role:', roleData[0].role);
  return { user, role: roleData[0].role };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create admin client for full access
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify admin role before proceeding
    const authResult = await verifyAdminRole(req, supabaseAdmin);
    if ('error' in authResult) {
      return new Response(
        JSON.stringify({ success: false, error: authResult.error }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: authResult.status 
        }
      );
    }

    console.log('Admin subscriptions accessed by:', authResult.user.id);

    // Get all subscriptions with aggregations
    const { data: subscriptions, error: subError } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .order('created_at', { ascending: false });

    if (subError) {
      console.error('Error fetching subscriptions:', subError);
      throw new Error('Failed to fetch subscriptions');
    }

    // Get payment history
    const { data: payments, error: payError } = await supabaseAdmin
      .from('payment_history')
      .select('*')
      .order('created_at', { ascending: false });

    if (payError) {
      console.error('Error fetching payments:', payError);
    }

    // Aggregate stats
    const stats = {
      totalSubscribers: subscriptions?.filter(s => s.status === 'active').length || 0,
      totalRevenue: subscriptions?.reduce((sum, s) => sum + (s.plan_price || 0), 0) || 0,
      planDistribution: {
        Metal: subscriptions?.filter(s => s.plan_name === 'Metal').length || 0,
        Silver: subscriptions?.filter(s => s.plan_name === 'Silver').length || 0,
        Gold: subscriptions?.filter(s => s.plan_name === 'Gold').length || 0,
        Platinum: subscriptions?.filter(s => s.plan_name === 'Platinum').length || 0,
      },
    };

    console.log('Admin stats:', stats);

    return new Response(
      JSON.stringify({ 
        success: true, 
        subscriptions,
        payments,
        stats
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (err) {
    const error = err instanceof Error ? err : new Error('Unknown error');
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});
