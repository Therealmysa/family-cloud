
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
  const [isProcessing, setIsProcessing] = useState(false);

  // Ne pas montrer d'actions si l'utilisateur n'est pas un admin ou si c'est l'utilisateur actuel
  if (!isAdmin || member.id === currentUserId) return null;

  const makeAdmin = async () => {
    if (!familyId) return;
    
    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update(asProfileUpdate({ is_admin: true }))
        .eq("id", member.id);

      if (error) throw error;

      toast({
        title: "Admin role assigned",
        description: `${member.name} is now an admin.`,
      });
      
      onActionComplete();
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
      // Vérifier si c'est le propriétaire
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
        return;
      }

      const { error } = await supabase
        .from("profiles")
        .update(asProfileUpdate({ is_admin: false }))
        .eq("id", member.id);

      if (error) throw error;

      toast({
        title: "Admin role removed",
        description: `${member.name} is no longer an admin.`,
      });
      
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

  const transferOwnership = async () => {
    if (!familyId) return;
    
    setIsProcessing(true);
    try {
      // Mettre à jour le propriétaire de la famille
      const { error } = await supabase
        .from("families")
        .update({ owner_id: member.id })
        .eq("id", familyId);

      if (error) throw error;

      // S'assurer que le nouveau propriétaire est aussi admin
      if (!member.is_admin) {
        await supabase
          .from("profiles")
          .update(asProfileUpdate({ is_admin: true }))
          .eq("id", member.id);
      }

      toast({
        title: "Ownership transferred",
        description: `${member.name} is now the family owner.`,
        variant: "success",
      });
      
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

  const removeMember = async () => {
    if (!familyId) return;
    
    setIsProcessing(true);
    try {
      // Vérifier si c'est le propriétaire
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
        .update(asProfileUpdate({ 
          family_id: null,
          is_admin: false
        }))
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
          {/* Option pour transférer le rôle de propriétaire (uniquement pour le propriétaire actuel) */}
          {isOwner && (
            <DropdownMenuItem onClick={transferOwnership} disabled={isProcessing}>
              <Crown className="h-4 w-4 mr-2 text-yellow-500" />
              <span>Transfer Ownership</span>
            </DropdownMenuItem>
          )}
          
          {/* Gérer le rôle d'admin */}
          {!member.is_admin ? (
            <DropdownMenuItem onClick={makeAdmin} disabled={isProcessing}>
              <Shield className="h-4 w-4 mr-2 text-blue-500" />
              <span>Make Admin</span>
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={removeAdminRole} disabled={isProcessing}>
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

      {/* Dialogue de confirmation pour supprimer un membre */}
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
