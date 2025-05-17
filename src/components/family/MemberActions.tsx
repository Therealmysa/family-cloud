
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Shield, ShieldOff, UserX, Crown } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { asProfileUpdate } from "@/utils/supabaseHelpers";
import { Profile } from "@/types/profile";

interface MemberActionsProps {
  member: Profile;
  currentUserId: string;
  onActionComplete: () => void;
  isAdmin: boolean;
  familyId: string | null;
  isOwner?: boolean;
}

export function MemberActions({ member, currentUserId, onActionComplete, isAdmin, familyId, isOwner = false }: MemberActionsProps) {
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [showAdminDialog, setShowAdminDialog] = useState(false);
  const [showOwnershipDialog, setShowOwnershipDialog] = useState(false);
  const [adminAction, setAdminAction] = useState<'add' | 'remove'>('add');
  const [isProcessing, setIsProcessing] = useState(false);

  // Don't show actions if the user isn't an admin or if it's the current user
  if (!isAdmin || member.id === currentUserId) return null;

  const makeAdmin = async () => {
    if (!familyId) return;
    
    setIsProcessing(true);
    try {
      console.log("Making user admin:", member.id);
      const { error } = await supabase
        .from("profiles")
        .update({ is_admin: true })
        .eq("id", member.id);

      if (error) throw error;

      toast({
        title: "Admin role assigned",
        description: `${member.name} is now an admin.`,
      });
      
      onActionComplete();
      setShowAdminDialog(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to make user admin",
        variant: "destructive",
      });
      console.error("Error making admin:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const removeAdminRole = async () => {
    if (!familyId) return;
    
    setIsProcessing(true);
    try {
      // Check if it's the owner
      const { data: familyData } = await supabase
        .from("families")
        .select("owner_id")
        .eq("id", familyId)
        .single();

      if (familyData && familyData.owner_id === member.id) {
        toast({
          title: "Cannot remove owner's admin status",
          description: "The family owner must remain an admin.",
          variant: "destructive",
        });
        setIsProcessing(false);
        setShowAdminDialog(false);
        return;
      }

      console.log("Removing admin role from user:", member.id);
      const { error } = await supabase
        .from("profiles")
        .update({ is_admin: false })
        .eq("id", member.id);

      if (error) throw error;

      toast({
        title: "Admin role removed",
        description: `${member.name} is no longer an admin.`,
      });
      
      onActionComplete();
      setShowAdminDialog(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const transferOwnership = async () => {
    if (!familyId) return;
    
    setIsProcessing(true);
    try {
      console.log("Transferring ownership to:", member.id, "for family:", familyId);
      // Update the family owner
      const { error: ownerError } = await supabase
        .from("families")
        .update({ owner_id: member.id })
        .eq("id", familyId);

      if (ownerError) {
        console.error("Error updating family owner:", ownerError);
        throw ownerError;
      }

      // Ensure the new owner is also an admin
      if (!member.is_admin) {
        const { error: adminError } = await supabase
          .from("profiles")
          .update({ is_admin: true })
          .eq("id", member.id);
          
        if (adminError) {
          console.error("Error making new owner admin:", adminError);
          throw adminError;
        }
      }

      toast({
        title: "Ownership transferred",
        description: `${member.name} is now the family owner.`,
      });
      
      onActionComplete();
      setShowOwnershipDialog(false);
    } catch (error: any) {
      console.error("Transfer ownership error:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const removeMember = async () => {
    if (!familyId) return;
    
    setIsProcessing(true);
    try {
      // Check if it's the owner
      const { data: familyData } = await supabase
        .from("families")
        .select("owner_id")
        .eq("id", familyId)
        .single();

      if (familyData && familyData.owner_id === member.id) {
        toast({
          title: "Cannot remove the family owner",
          description: "The family owner cannot be removed from the family.",
          variant: "destructive",
        });
        setIsProcessing(false);
        setShowRemoveDialog(false);
        return;
      }

      const { error } = await supabase
        .from("profiles")
        .update({ 
          family_id: null,
          is_admin: false
        })
        .eq("id", member.id);

      if (error) throw error;

      toast({
        title: "Member removed",
        description: `${member.name} has been removed from the family.`,
      });
      
      setShowRemoveDialog(false);
      onActionComplete();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAdminAction = (action: 'add' | 'remove') => {
    setAdminAction(action);
    setShowAdminDialog(true);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" disabled={isProcessing}>
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {/* Option to transfer ownership (only for the current owner) */}
          {isOwner && (
            <DropdownMenuItem onClick={() => setShowOwnershipDialog(true)} disabled={isProcessing}>
              <Crown className="h-4 w-4 mr-2 text-yellow-500" />
              <span>Transfer Ownership</span>
            </DropdownMenuItem>
          )}
          
          {/* Manage admin role */}
          {!member.is_admin ? (
            <DropdownMenuItem onClick={() => handleAdminAction('add')} disabled={isProcessing}>
              <Shield className="h-4 w-4 mr-2 text-blue-500" />
              <span>Make Admin</span>
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={() => handleAdminAction('remove')} disabled={isProcessing}>
              <ShieldOff className="h-4 w-4 mr-2 text-orange-500" />
              <span>Remove Admin Role</span>
            </DropdownMenuItem>
          )}
          
          <DropdownMenuItem 
            onClick={() => setShowRemoveDialog(true)}
            disabled={isProcessing} 
            className="text-red-500 focus:text-red-500 focus:bg-red-50"
          >
            <UserX className="h-4 w-4 mr-2" />
            <span>Remove from Family</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Dialog for admin role changes */}
      <AlertDialog open={showAdminDialog} onOpenChange={setShowAdminDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {adminAction === 'add' ? "Make family admin?" : "Remove admin role?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {adminAction === 'add' 
                ? `This will give ${member.name} administrative privileges including the ability to manage family members and settings.`
                : `This will remove ${member.name}'s administrative privileges. They will no longer be able to manage family members or settings.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={adminAction === 'add' ? makeAdmin : removeAdminRole}
              disabled={isProcessing}
              className={adminAction === 'add' ? "bg-blue-600 hover:bg-blue-700" : "bg-orange-600 hover:bg-orange-700"}
            >
              {isProcessing ? "Processing..." : adminAction === 'add' ? "Make Admin" : "Remove Admin"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog to confirm transferring ownership */}
      <AlertDialog open={showOwnershipDialog} onOpenChange={setShowOwnershipDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Transfer family ownership?</AlertDialogTitle>
            <AlertDialogDescription>
              This will make {member.name} the owner of your family. They will have full control over family settings.
              You will remain an administrator, but only the new owner will be able to delete the family or transfer
              ownership in the future.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={transferOwnership}
              disabled={isProcessing}
              className="bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-600"
            >
              {isProcessing ? "Transferring..." : "Transfer Ownership"}
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
              This will remove {member.name} from your family. They will no longer have access to 
              family photos, messages, and other shared content. They can be re-invited later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={removeMember}
              disabled={isProcessing}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isProcessing ? "Removing..." : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
