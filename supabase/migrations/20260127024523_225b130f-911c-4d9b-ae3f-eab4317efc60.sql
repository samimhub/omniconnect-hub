-- Create table for 2FA settings and OTP codes
CREATE TABLE public.two_factor_auth (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,
    is_enabled BOOLEAN DEFAULT false,
    otp_code TEXT,
    otp_expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.two_factor_auth ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own 2FA settings
CREATE POLICY "Users can view own 2FA settings"
ON public.two_factor_auth
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Service role can manage all (for edge functions)
CREATE POLICY "Service role full access"
ON public.two_factor_auth
FOR ALL
USING (true)
WITH CHECK (true);

-- Add trigger for updated_at
CREATE TRIGGER update_two_factor_auth_updated_at
BEFORE UPDATE ON public.two_factor_auth
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();