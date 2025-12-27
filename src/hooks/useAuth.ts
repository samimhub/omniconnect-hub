import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";

export type AppRole = "admin" | "agent" | "user";

interface AuthState {
  user: User | null;
  session: Session | null;
  role: AppRole | null;
  isLoading: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    role: null,
    isLoading: true,
  });

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setAuthState(prev => ({
          ...prev,
          session,
          user: session?.user ?? null,
        }));

        // Defer role fetch with setTimeout to avoid deadlock
        if (session?.user) {
          setTimeout(() => {
            fetchUserRole(session.user.id);
          }, 0);
        } else {
          setAuthState(prev => ({ ...prev, role: null, isLoading: false }));
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthState(prev => ({
        ...prev,
        session,
        user: session?.user ?? null,
      }));

      if (session?.user) {
        fetchUserRole(session.user.id);
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .order("created_at", { ascending: true })
        .limit(1)
        .single();

      if (error) {
        console.error("Error fetching user role:", error);
        // Default to user role if not found
        setAuthState(prev => ({ ...prev, role: "user", isLoading: false }));
        return;
      }

      setAuthState(prev => ({ 
        ...prev, 
        role: data?.role as AppRole || "user", 
        isLoading: false 
      }));
    } catch (err) {
      console.error("Error in fetchUserRole:", err);
      setAuthState(prev => ({ ...prev, role: "user", isLoading: false }));
    }
  };

  const signUp = async (email: string, password: string, fullName: string, phone: string, role: AppRole = "user") => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
          phone: phone,
          role: role, // Store role in user metadata for the edge function
        },
      },
    });

    if (error) {
      return { error };
    }

    // If signup successful, create profile and assign role via edge function
    if (data.user) {
      try {
        const { error: roleError } = await supabase.functions.invoke("assign-user-role", {
          body: { 
            userId: data.user.id, 
            role: role,
            fullName: fullName,
            phone: phone,
          },
        });

        if (roleError) {
          console.error("Error assigning role:", roleError);
        }
      } catch (err) {
        console.error("Error invoking role assignment:", err);
      }
    }

    return { data, error: null };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { data, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      setAuthState({
        user: null,
        session: null,
        role: null,
        isLoading: false,
      });
    }
    return { error };
  };

  const getDashboardPath = (): string => {
    switch (authState.role) {
      case "admin":
        return "/admin";
      case "agent":
        return "/agent-dashboard";
      case "user":
      default:
        return "/dashboard";
    }
  };

  return {
    user: authState.user,
    session: authState.session,
    role: authState.role,
    isLoading: authState.isLoading,
    isAuthenticated: !!authState.session,
    signUp,
    signIn,
    signOut,
    getDashboardPath,
  };
}
