import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface MembershipPlan {
  id: string;
  name: string;
  description: string | null;
  price_monthly: number;
  price_yearly: number;
  discount_percentage: number;
  validity_days: number;
  modules: string[];
  features: string[];
  is_active: boolean;
  is_popular: boolean;
  created_at: string;
  updated_at: string;
}

export const useMembershipPlans = () => {
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from("membership_plans")
        .select("*")
        .order("price_monthly", { ascending: true });

      if (error) throw error;
      setPlans(data || []);
    } catch (err: any) {
      console.error("Error fetching plans:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const updatePlan = async (id: string, updates: Partial<MembershipPlan>) => {
    try {
      const { error } = await supabase
        .from("membership_plans")
        .update(updates)
        .eq("id", id);

      if (error) throw error;
      await fetchPlans();
      return { success: true };
    } catch (err: any) {
      console.error("Error updating plan:", err);
      return { success: false, error: err.message };
    }
  };

  const createPlan = async (plan: Omit<MembershipPlan, "id" | "created_at" | "updated_at">) => {
    try {
      const { error } = await supabase.from("membership_plans").insert(plan);

      if (error) throw error;
      await fetchPlans();
      return { success: true };
    } catch (err: any) {
      console.error("Error creating plan:", err);
      return { success: false, error: err.message };
    }
  };

  const deletePlan = async (id: string) => {
    try {
      const { error } = await supabase
        .from("membership_plans")
        .delete()
        .eq("id", id);

      if (error) throw error;
      await fetchPlans();
      return { success: true };
    } catch (err: any) {
      console.error("Error deleting plan:", err);
      return { success: false, error: err.message };
    }
  };

  return {
    plans,
    isLoading,
    error,
    refetch: fetchPlans,
    updatePlan,
    createPlan,
    deletePlan,
  };
};
