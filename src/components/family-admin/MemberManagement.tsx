
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserX, ShieldOff } from "lucide-react";
import { MemberList } from "@/components/messages/MemberList";
import { Profile } from "@/types/profile";

interface MemberManagementProps {
  familyMembers: Profile[];
  currentUserId: string | undefined;
  familyId: string | undefined;
  refreshFamilyMembers: (familyId: string) => void;
}

export function MemberManagement({ 
  familyMembers, 
  currentUserId, 
  familyId,
  refreshFamilyMembers 
}: MemberManagementProps) {
  const [processingMemberId, setProcessingMemberId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // For MemberList component compatibility (not used)
  const selectedMembers: string[] = [];
  const toggleMemberSelection = (memberId: string) => {};

  const removeMember = async (memberId: string) => {
    if (!familyId || currentUserId === memberId) return;
    
    setProcessingMemberId(memberId);
    try {
      // Update profile to remove family_id
      const { error } = await supabase
        .from("profiles")
        .update({
          family_id: null,
          is_admin: false,
        })
        .eq("id", memberId);

      if (error) throw error;

      toast({
        title: "Member removed",
        description: "The family member has been removed successfully.",
      });
      
      // Refresh family members
      refreshFamilyMembers(familyId);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setProcessingMemberId(null);
    }
  };

  const makeAdmin = async (memberId: string) => {
    if (!familyId || currentUserId === memberId) return;
    
    setProcessingMemberId(memberId);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          is_admin: true,
        })
        .eq("id", memberId);

      if (error) throw error;

      toast({
        title: "Admin assigned",
        description: "The member is now a family administrator.",
      });
      
      // Refresh family members
      refreshFamilyMembers(familyId);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setProcessingMemberId(null);
    }
  };

  const removeAdmin = async (memberId: string) => {
    if (!familyId || currentUserId === memberId) return;
    
    setProcessingMemberId(memberId);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          is_admin: false,
        })
        .eq("id", memberId);

      if (error) throw error;

      toast({
        title: "Admin status removed",
        description: "The member is no longer a family administrator.",
      });
      
      // Refresh family members
      refreshFamilyMembers(familyId);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setProcessingMemberId(null);
    }
  };

  const filteredMembers = familyMembers.filter(member => 
    member.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card className="overflow-hidden">
      <CardHeader className="px-4 sm:px-6">
        <CardTitle>Family Members</CardTitle>
        <CardDescription>
          Manage your family members and their permissions
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4 sm:px-6">
        <div className="space-y-4">
          {familyMembers.length === 0 ? (
            <p className="text-center text-gray-500 py-4">No family members found</p>
          ) : (
            <div className="divide-y">
              <MemberList
                filteredMembers={filteredMembers}
                selectedMembers={selectedMembers}
                isLoading={false}
                toggleMemberSelection={toggleMemberSelection}
                searchQuery={searchQuery}
                showCheckboxes={false}
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
