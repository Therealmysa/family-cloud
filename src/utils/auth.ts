
import { supabase } from "@/integrations/supabase/client";
import { Profile } from "@/types/profile";
import { toast } from "@/components/ui/use-toast";

export async function fetchUserProfile(userId: string): Promise<Profile | null> {
  if (!userId) {
    console.error("Cannot fetch profile: No user ID provided");
    return null;
  }

  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      // Handle specifically for common errors
      if (error.code === 'PGRST116') {
        console.warn("No profile found for user ID:", userId);
        return null;
      }
      
      // For permissions errors
      if (error.code === '42501' || error.message.includes('permission')) {
        toast({
          title: "Access error",
          description: "You don't have permission to access this resource",
          variant: "destructive"
        });
      }
      
      throw error;
    }

    return data as Profile;
  } catch (error: any) {
    console.error("Error fetching profile:", error);
    
    // Only show toast for network or permission errors, not for "not found"
    if (error.code !== 'PGRST116') {
      toast({
        title: "Profile error",
        description: "Could not load user profile. Please try again later.",
        variant: "destructive"
      });
    }
    
    return null;
  }
}
