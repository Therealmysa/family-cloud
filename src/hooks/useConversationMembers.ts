
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Profile } from "@/types/profile";
import { toast } from "@/components/ui/use-toast";

export function useConversationMembers(familyId: string | null, userId: string | null, open: boolean) {
  const [familyMembers, setFamilyMembers] = useState<Profile[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Reset selected members when the dialog closes
  useEffect(() => {
    if (!open) {
      setSelectedMembers([]);
      setSearchQuery("");
    }
  }, [open]);

  // Fetch family members when dialog opens
  useEffect(() => {
    if (open && familyId && userId) {
      fetchFamilyMembers();
    }
  }, [open, familyId, userId]);

  const fetchFamilyMembers = async () => {
    if (!userId || !familyId) return;
    
    setIsLoading(true);
    
    try {
      console.log("Fetching family members for family ID:", familyId);
      
      const { data, error } = await supabase
        .from("profiles")
        .select("id, name, avatar_url, family_id")
        .eq("family_id", familyId)
        .neq("id", userId); // Exclude current user
      
      if (error) throw error;
      
      console.log("Fetched family members:", data);
      setFamilyMembers(data || []);
    } catch (error: any) {
      console.error("Error fetching family members:", error);
      toast({
        title: "Error",
        description: "Failed to load family members",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMemberSelection = (memberId: string) => {
    setSelectedMembers(prev => 
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  // Filter members based on search query
  const filteredMembers = searchQuery
    ? familyMembers.filter(member => 
        member.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : familyMembers;

  return {
    familyMembers,
    filteredMembers,
    selectedMembers,
    isLoading,
    searchQuery,
    setSearchQuery,
    toggleMemberSelection,
    setSelectedMembers
  };
}
