import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Profile } from "@/types/profile";
import { asUpdateType } from "@/utils/supabaseHelpers";

interface MemberManagementProps {
  members: Profile[];
  setMembers: React.Dispatch<React.SetStateAction<Profile[]>>;
}

export const MemberManagement = ({ members, setMembers }: MemberManagementProps) => {
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);

  const updateMemberRole = async (user: Profile, isAdmin: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update(asUpdateType('profiles', {
          is_admin: isAdmin
        }))
        .eq('id', user.id);
      
      if (error) throw error;
      
      // Update local state
      setMembers((prev) => prev.map((m) => 
        m.id === user.id ? { ...m, is_admin: isAdmin } : m
      ));
      
      toast({
        description: `${user.name} is now ${isAdmin ? 'an admin' : 'a member'}`,
      });
    } catch (error) {
      console.error("Error updating member role:", error);
      toast({
        variant: "destructive",
        description: "Failed to update member role",
      });
    }
  };

  const removeMember = async (user: Profile) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update(asUpdateType('profiles', {
          family_id: null,
          is_admin: false
        }))
        .eq('id', user.id);

      if (error) throw error;
      
      // Update local state
      setMembers((prev) => prev.filter((m) => m.id !== user.id));
      
      toast({
        description: `${user.name} has been removed from the family`,
      });
    } catch (error) {
      console.error("Error removing member:", error);
      toast({
        variant: "destructive",
        description: "Failed to remove member",
      });
    } finally {
      setConfirmRemoveId(null);
    }
  };

  return (
    <div>
      <h2 className="text-lg font-bold">Member Management</h2>
      <ul>
        {members.map((member) => (
          <li key={member.id} className="flex justify-between items-center">
            <span>{member.name}</span>
            <div>
              <Button onClick={() => updateMemberRole(member, !member.is_admin)}>
                {member.is_admin ? "Remove Admin" : "Make Admin"}
              </Button>
              <Button onClick={() => setConfirmRemoveId(member.id)}>
                Remove
              </Button>
            </div>
          </li>
        ))}
      </ul>
      {confirmRemoveId && (
        <div>
          <p>Are you sure you want to remove this member?</p>
          <Button onClick={() => removeMember(members.find(m => m.id === confirmRemoveId)!)}>
            Yes
          </Button>
          <Button onClick={() => setConfirmRemoveId(null)}>Cancel</Button>
        </div>
      )}
    </div>
  );
};
