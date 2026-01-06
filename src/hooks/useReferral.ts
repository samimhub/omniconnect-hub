import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  phone: string | null;
  referral_code: string | null;
  referred_by: string | null;
}

interface Referral {
  id: string;
  referrer_id: string;
  referee_id: string;
  referrer_reward: number;
  referee_reward: number;
  status: string;
  created_at: string;
  completed_at: string | null;
}

export const useReferral = (userId: string | undefined) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [totalReferrals, setTotalReferrals] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReferralData = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      // Fetch profile with referral code
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (profileError) throw profileError;
      setProfile(profileData as Profile | null);

      // Fetch referrals where user is the referrer
      const { data: referralData, error: referralError } = await supabase
        .from('referrals')
        .select('*')
        .eq('referrer_id', userId)
        .order('created_at', { ascending: false });

      if (referralError) throw referralError;
      setReferrals((referralData || []) as Referral[]);
      setTotalReferrals(referralData?.length || 0);
    } catch (err) {
      console.error('Failed to fetch referral data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchReferralData();
  }, [fetchReferralData]);

  const getReferralLink = () => {
    if (!profile?.referral_code) return '';
    return `${window.location.origin}/auth?ref=${profile.referral_code}`;
  };

  return {
    profile,
    referralCode: profile?.referral_code || null,
    referrals,
    totalReferrals,
    isLoading,
    getReferralLink,
    refetch: fetchReferralData,
  };
};
