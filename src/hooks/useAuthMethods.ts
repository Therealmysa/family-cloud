
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useAuthMethods = () => {
  const signUp = async (email: string, password: string, name: string) => {
    try {
      // Validate input
      if (!email || !password || !name) {
        throw new Error("Email, password, and name are required");
      }
      
      if (password.length < 8) {
        throw new Error("Password must be at least 8 characters");
      }
      
      // Attempt signup
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name
          },
          emailRedirectTo: `${window.location.origin}/auth` // Secure redirect URL
        }
      });

      if (error) {
        throw error;
      }

      toast.success("Account created", {
        description: "Please check your email to verify your account."
      });
    } catch (error: any) {
      // Check if it's a network error
      if (error.message === "Failed to fetch" || error.name === "AuthRetryableFetchError") {
        toast.error("Network error", {
          description: "Unable to connect to authentication service. Please check your internet connection and try again."
        });
      } else {
        toast.error("Sign up failed", {
          description: error.message
        });
      }
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // Validate input
      if (!email || !password) {
        throw new Error("Email and password are required");
      }
      
      // Rate limit check for brute force protection (simple implementation)
      const loginAttemptKey = `login_attempts_${email}`;
      const loginAttempts = parseInt(localStorage.getItem(loginAttemptKey) || '0', 10);
      const lastAttemptTime = parseInt(localStorage.getItem(`${loginAttemptKey}_time`) || '0', 10);
      const now = Date.now();
      
      // Reset attempts if more than 30 minutes have passed
      if (now - lastAttemptTime > 30 * 60 * 1000) {
        localStorage.setItem(loginAttemptKey, '0');
        localStorage.setItem(`${loginAttemptKey}_time`, now.toString());
      } 
      // Limit to 5 attempts within 30 minutes
      else if (loginAttempts >= 5) {
        toast.error("Too many attempts", {
          description: "Please try again later"
        });
        throw new Error("Too many login attempts. Please try again later.");
      }
      
      // Update attempt counter
      localStorage.setItem(loginAttemptKey, (loginAttempts + 1).toString());
      localStorage.setItem(`${loginAttemptKey}_time`, now.toString());
      
      // Add some delay to ensure Supabase API is responsive (helps with connection issues)
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Attempt sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      // Reset attempt counter on success
      localStorage.removeItem(loginAttemptKey);
      localStorage.removeItem(`${loginAttemptKey}_time`);

      toast.success("Welcome back!", {
        description: "You've successfully signed in."
      });
    } catch (error: any) {
      // Check if it's a network error
      if (error.message === "Failed to fetch" || error.name === "AuthRetryableFetchError") {
        toast.error("Network error", {
          description: "Unable to connect to authentication service. Please check your internet connection and try again."
        });
      } else {
        toast.error("Sign in failed", {
          description: error.message
        });
      }
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      // Clear any sensitive data from localStorage
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('login_attempts_') || key.includes('supabase'))) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      toast.success("Signed out", {
        description: "You've been successfully signed out."
      });
    } catch (error: any) {
      toast.error("Sign out failed", {
        description: error.message
      });
    }
  };

  const resetPassword = async (email: string) => {
    try {
      if (!email) {
        throw new Error("Email is required");
      }
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) {
        throw error;
      }
      
      toast.success("Password reset email sent", {
        description: "Check your email for a reset link."
      });
    } catch (error: any) {
      // Check if it's a network error
      if (error.message === "Failed to fetch" || error.name === "AuthRetryableFetchError") {
        toast.error("Network error", {
          description: "Unable to connect to authentication service. Please check your internet connection and try again."
        });
      } else {
        toast.error("Password reset failed", {
          description: error.message
        });
      }
      throw error;
    }
  };

  return {
    signUp,
    signIn,
    signOut,
    resetPassword
  };
};
