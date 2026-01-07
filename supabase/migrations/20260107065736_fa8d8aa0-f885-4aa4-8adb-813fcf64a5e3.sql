-- Create membership_plans table for admin management
CREATE TABLE public.membership_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  price_monthly INTEGER NOT NULL,
  price_yearly INTEGER NOT NULL,
  discount_percentage INTEGER NOT NULL DEFAULT 0,
  validity_days INTEGER NOT NULL DEFAULT 30,
  modules TEXT[] NOT NULL DEFAULT '{}',
  features TEXT[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_popular BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.membership_plans ENABLE ROW LEVEL SECURITY;

-- Everyone can view active plans
CREATE POLICY "Anyone can view active plans" 
ON public.membership_plans 
FOR SELECT 
USING (is_active = true);

-- Admins can manage plans
CREATE POLICY "Admins can manage plans" 
ON public.membership_plans 
FOR ALL 
USING (has_role(auth.uid(), 'admin'));

-- Add discount column to subscriptions table
ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS discount_percentage INTEGER DEFAULT 0;

-- Create trigger for updated_at
CREATE TRIGGER update_membership_plans_updated_at
BEFORE UPDATE ON public.membership_plans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default membership plans
INSERT INTO public.membership_plans (name, description, price_monthly, price_yearly, discount_percentage, validity_days, modules, features, is_popular) VALUES
('Metal', 'Perfect for healthcare needs', 299, 2999, 10, 30, ARRAY['Hospital'], ARRAY['Hospital appointments', 'Doctor consultations', '5% cashback on bookings', 'Email support'], false),
('Silver', 'Healthcare + Hotel access', 499, 4999, 12, 30, ARRAY['Hospital', 'Hotel'], ARRAY['All Metal features', 'Hotel bookings', 'Room services', '8% cashback on bookings', 'Priority support'], false),
('Gold', 'Most popular choice', 799, 7999, 15, 30, ARRAY['Hospital', 'Hotel', 'Travel'], ARRAY['All Silver features', 'Travel packages', 'Flight & train booking', '12% cashback on bookings', '24/7 phone support'], true),
('Platinum', 'Complete access to everything', 1299, 12999, 20, 30, ARRAY['Hospital', 'Hotel', 'Travel', 'Ride'], ARRAY['All Gold features', 'Ride booking', 'Live ride tracking', '15% cashback on bookings', 'Dedicated account manager'], false);