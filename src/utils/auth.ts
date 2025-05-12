
import { supabase } from "@/integrations/supabase/client";
import { Profile } from "@/types/profile";

export async function fetchUserProfile(userId: string): Promise<Profile | null> {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      throw error;
    }

    return data as Profile;
  } catch (error) {
    console.error("Error fetching profile:", error);
    return null;
  }
}
