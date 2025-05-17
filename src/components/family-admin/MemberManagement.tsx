
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserX, ShieldOff, Shield } from "lucide-react";
import { MemberList } from "@/components/messages/MemberList";
import { Profile } from "@/types/profile";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ProfileAvatar } from "@/components/profile/ProfileAvatar";

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
  const [showAdminDialog, setShowAdminDialog] = useState(false);
  const [adminActionTarget, setAdminActionTarget] = useState<{id: string, name: string, action: 'add' | 'remove'} | null>(null);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<{id: string, name: string} | null>(null);

  // For MemberList component compatibility (not used)
  const selectedMembers: string[] = [];
  const toggleMemberSelection = (memberId: string) => {};

  const confirmRemoveMember = (memberId: string, name: string) => {
    setRemoveTarget({ id: memberId, name });
    setShowRemoveDialog(true);
  };

  const removeMember = async () => {
    if (!familyId || !removeTarget || currentUserId === removeTarget.id) {
      setShowRemoveDialog(false);
      return;
    }
    
    setProcessingMemberId(removeTarget.id);
    try {
      // Update profile to remove family_id
      const { error } = await supabase
        .from("profiles")
        .update({
          family_id: null,
          is_admin: false,
        })
        .eq("id", removeTarget.id);

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
      setShowRemoveDialog(false);
    }
  };

  const confirmAdminAction = (memberId: string, name: string, action: 'add' | 'remove') => {
    setAdminActionTarget({ id: memberId, name, action });
    setShowAdminDialog(true);
  };

  const handleAdminAction = async () => {
    if (!familyId || !adminActionTarget || currentUserId === adminActionTarget.id) {
      setShowAdminDialog(false);
      return;
    }
    
    setProcessingMemberId(adminActionTarget.id);
    try {
      // Check if it's the owner when removing admin status
      if (adminActionTarget.action === 'remove') {
        const { data: familyData } = await supabase
          .from("families")
          .select("owner_id")
          .eq("id", familyId)
          .single();

        if (familyData && familyData.owner_id === adminActionTarget.id) {
          toast({
            title: "Cannot remove owner's admin status",
            description: "The family owner must remain an admin.",
            variant: "destructive",
          });
          setProcessingMemberId(null);
          setShowAdminDialog(false);
          return;
        }
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          is_admin: adminActionTarget.action === 'add',
        })
        .eq("id", adminActionTarget.id);

      if (error) throw error;

      toast({
        title: adminActionTarget.action === 'add' ? "Admin assigned" : "Admin status removed",
        description: adminActionTarget.action === 'add' 
          ? "The member is now a family administrator."
          : "The member is no longer a family administrator.",
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
      setShowAdminDialog(false);
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
            <div className="space-y-2">
              {filteredMembers.map((member) => (
                <div 
                  key={member.id}
                  className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <div className="flex items-center gap-3">
                    <ProfileAvatar profile={member} size="md" />
                    <div>
                      <p className="font-medium">
                        {member.name}
                        {member.id === currentUserId && <span className="text-sm text-gray-500 ml-2">(You)</span>}
                      </p>
                      <div className="flex gap-2">
                        {member.is_admin && (
                          <span className="text-xs text-purple-600 font-medium">Administrator</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {member.id !== currentUserId && (
                    <div className="flex items-center gap-2">
                      {member.is_admin ? (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => confirmAdminAction(member.id, member.name, 'remove')}
                          disabled={processingMemberId === member.id}
                          className="flex items-center gap-1"
                        >
                          <ShieldOff className="h-4 w-4" />
                          <span className="hidden sm:inline">Remove Admin</span>
                        </Button>
                      ) : (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => confirmAdminAction(member.id, member.name, 'add')}
                          disabled={processingMemberId === member.id}
                          className="flex items-center gap-1"
                        >
                          <Shield className="h-4 w-4" />
                          <span className="hidden sm:inline">Make Admin</span>
                        </Button>
                      )}
                      
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => confirmRemoveMember(member.id, member.name)}
                        disabled={processingMemberId === member.id}
                        className="flex items-center gap-1"
                      >
                        <UserX className="h-4 w-4" />
                        <span className="hidden sm:inline">Remove</span>
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>

      {/* Dialog for admin role changes */}
      <AlertDialog open={showAdminDialog} onOpenChange={setShowAdminDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {adminActionTarget?.action === 'add' ? "Make family admin?" : "Remove admin role?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {adminActionTarget?.action === 'add' 
                ? `This will give ${adminActionTarget?.name} administrative privileges including the ability to manage family members and settings.`
                : `This will remove ${adminActionTarget?.name}'s administrative privileges. They will no longer be able to manage family members or settings.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleAdminAction}
              disabled={processingMemberId !== null}
              className={adminActionTarget?.action === 'add' ? "bg-blue-600 hover:bg-blue-700" : "bg-orange-600 hover:bg-orange-700"}
            >
              {processingMemberId ? "Processing..." : adminActionTarget?.action === 'add' ? "Make Admin" : "Remove Admin"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog to confirm removing a member */}
      <AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove family member?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove {removeTarget?.name} from your family. They will no longer have access to 
              family photos, messages, and other shared content. They can be re-invited later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={removeMember}
              disabled={processingMemberId !== null}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {processingMemberId ? "Removing..." : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
