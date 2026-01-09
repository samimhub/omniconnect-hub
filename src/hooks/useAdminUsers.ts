import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface AdminUser {
  id: string;
  email: string;
  phone: string | null;
  created_at: string;
  last_sign_in_at: string | null;
  email_confirmed_at: string | null;
  banned_until: string | null;
  full_name: string | null;
  avatar_url: string | null;
  referral_code: string | null;
  roles: string[];
  subscription: {
    plan_name: string;
    status: string;
    end_date: string;
  } | null;
}

export const useAdminUsers = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("admin-users", {
        body: { action: "list_users" },
      });

      if (fnError || !data?.success) {
        throw fnError || new Error(data?.error || "Failed to fetch users");
      }

      setUsers(data.data.users);
    } catch (err: any) {
      console.error("Error fetching users:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const updateRole = async (userId: string, role: string, roleAction: "add" | "remove") => {
    try {
      const requestBody = { action: "update_role", userId, role, roleAction };
      const { data, error: fnError } = await supabase.functions.invoke("admin-users", {
        body: requestBody,
      });

      if (fnError || !data?.success) {
        throw fnError || new Error(data?.error || "Failed to update role");
      }

      toast.success(data.data.message);
      await fetchUsers();
      return { success: true };
    } catch (err: any) {
      console.error("Error updating role:", err);
      toast.error(err.message);
      return { success: false, error: err.message };
    }
  };

  const banUser = async (userId: string, duration: string) => {
    try {
      const { data, error: fnError } = await supabase.functions.invoke("admin-users", {
        body: { action: "ban_user", userId, duration },
      });

      if (fnError || !data?.success) {
        throw fnError || new Error(data?.error || "Failed to ban user");
      }

      toast.success(data.data.message);
      await fetchUsers();
      return { success: true };
    } catch (err: any) {
      console.error("Error banning user:", err);
      toast.error(err.message);
      return { success: false, error: err.message };
    }
  };

  const unbanUser = async (userId: string) => {
    try {
      const { data, error: fnError } = await supabase.functions.invoke("admin-users", {
        body: { action: "unban_user", userId },
      });

      if (fnError || !data?.success) {
        throw fnError || new Error(data?.error || "Failed to unban user");
      }

      toast.success(data.data.message);
      await fetchUsers();
      return { success: true };
    } catch (err: any) {
      console.error("Error unbanning user:", err);
      toast.error(err.message);
      return { success: false, error: err.message };
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      const { data, error: fnError } = await supabase.functions.invoke("admin-users", {
        body: { action: "delete_user", userId },
      });

      if (fnError || !data?.success) {
        throw fnError || new Error(data?.error || "Failed to delete user");
      }

      toast.success(data.data.message);
      await fetchUsers();
      return { success: true };
    } catch (err: any) {
      console.error("Error deleting user:", err);
      toast.error(err.message);
      return { success: false, error: err.message };
    }
  };

  const getUserDetails = async (userId: string) => {
    try {
      const { data, error: fnError } = await supabase.functions.invoke("admin-users", {
        body: { action: "get_user_details", userId },
      });

      if (fnError || !data?.success) {
        throw fnError || new Error(data?.error || "Failed to get user details");
      }

      return { success: true, data: data.data };
    } catch (err: any) {
      console.error("Error getting user details:", err);
      toast.error(err.message);
      return { success: false, error: err.message };
    }
  };

  return {
    users,
    isLoading,
    error,
    refetch: fetchUsers,
    updateRole,
    banUser,
    unbanUser,
    deleteUser,
    getUserDetails,
  };
};
