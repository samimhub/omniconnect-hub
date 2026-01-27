-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Service role full access" ON public.two_factor_auth;

-- Create proper policies for 2FA table (edge functions use service role key which bypasses RLS)
-- Users can only view their own 2FA settings
-- All management happens through edge functions with service role