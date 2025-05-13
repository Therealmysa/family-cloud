
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Trash, UserX, ShieldOff } from "lucide-react";

interface MemberManagementProps {
  familyMembers: any[];
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
            <ul className="divide-y">
              {familyMembers.map((member) => (
                <li key={member.id} className="py-3 flex flex-wrap justify-between items-center gap-2">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-purple-100 text-purple-800">
                        {member.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <p className="text-xs text-gray-500">
                        {member.is_admin ? "Administrator" : "Member"}
                      </p>
                    </div>
                  </div>
                  
                  {currentUserId !== member.id && (
                    <div className="flex gap-2 mt-2 sm:mt-0">
                      {!member.is_admin && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => makeAdmin(member.id)}
                          className="text-xs"
                          disabled={processingMemberId === member.id}
                        >
                          Make Admin
                        </Button>
                      )}
                      {member.is_admin && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => removeAdmin(member.id)}
                          className="text-xs"
                          disabled={processingMemberId === member.id}
                        >
                          <ShieldOff className="h-3 w-3 mr-1" />
                          Remove Admin
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => removeMember(member.id)}
                        className="text-xs"
                        disabled={processingMemberId === member.id}
                      >
                        <UserX className="h-3 w-3 mr-1" />
                        Remove
                      </Button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
