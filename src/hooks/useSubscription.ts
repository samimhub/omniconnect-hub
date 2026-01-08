import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Subscription {
  id: string;
  user_id: string;
  plan_name: string;
  plan_price: number;
  billing_cycle: string;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  status: string;
  start_date: string;
  end_date: string;
  discount_percentage: number | null;
  created_at: string;
  updated_at: string;
}

export const useSubscription = () => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscription = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching subscription:', error);
        setError(error.message);
      } else {
        setSubscription(data);
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to fetch subscription');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();

    // Listen for auth changes
    const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange(() => {
      fetchSubscription();
    });

    return () => {
      authSub.unsubscribe();
    };
  }, []);

  return { subscription, isLoading, error, refetch: fetchSubscription };
};
