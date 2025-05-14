import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import {
  asProfileUpdate
} from "@/utils/supabaseHelpers";

interface DangerZoneProps {
  onFamilyDeleted?: () => void;
}

// Update the specific type casting sections
export function DangerZone({ onFamilyDeleted }: DangerZoneProps) {
  const [isLeaving, setIsLeaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const handleLeaveFamilyClick = async () => {
    if (!user || !profile) {
      toast({
        title: "Not authenticated",
        description: "You must be logged in to perform this action.",
        variant: "destructive",
      });
      return;
    }

    const confirmLeave = window.confirm(
      "Are you sure you want to leave your family? This action cannot be undone."
    );

    if (!confirmLeave) {
      return;
    }

    setIsLeaving(true);
    try {
      // Update profile with proper type casting
      const { error } = await supabase
        .from('profiles')
        .update(asProfileUpdate({
          family_id: null
        }))
        .eq('id', user.id);

      if (error) {
        toast({
          title: "Error leaving family",
          description: error.message,
          variant: "destructive",
        });
        console.error("Error leaving family:", error);
      } else {
        toast({
          title: "Family left",
          description: "You have successfully left the family.",
        });
        navigate("/setup-family");
      }
    } catch (error) {
      toast({
        title: "An error occurred",
        description: "Failed to leave the family. Please try again.",
        variant: "destructive",
      });
      console.error("Error leaving family:", error);
    } finally {
      setIsLeaving(false);
    }
  };

  const handleDeleteFamily = async () => {
    if (!user || !profile) {
      toast({
        title: "Not authenticated",
        description: "You must be logged in to perform this action.",
        variant: "destructive",
      });
      return;
    }

    if (!profile.is_admin) {
      toast({
        title: "Unauthorized",
        description: "You must be an admin to delete the family.",
        variant: "destructive",
      });
      return;
    }

    const confirmDelete = window.confirm(
      "Are you sure you want to delete your family? This action cannot be undone. All family data will be permanently lost."
    );

    if (!confirmDelete) {
      return;
    }

    setIsDeleting(true);
    try {
      // Update all family members with proper type casting
      const { error: profilesError } = await supabase
        .from('profiles')
        .update(asProfileUpdate({
          family_id: null,
          is_admin: false
        }))
        .eq('family_id', profile.family_id);

      if (profilesError) {
        toast({
          title: "Error updating family members",
          description: profilesError.message,
          variant: "destructive",
        });
        console.error("Error updating family members:", profilesError);
        return;
      }

      const { error: deleteFamilyError } = await supabase
        .from('families')
        .delete()
        .eq('id', profile.family_id);

      if (deleteFamilyError) {
        toast({
          title: "Error deleting family",
          description: deleteFamilyError.message,
          variant: "destructive",
        });
        console.error("Error deleting family:", deleteFamilyError);
        return;
      }

      toast({
        title: "Family deleted",
        description: "Your family has been successfully deleted.",
      });
      navigate("/setup-family");
      onFamilyDeleted?.();
    } catch (error) {
      toast({
        title: "An error occurred",
        description: "Failed to delete the family. Please try again.",
        variant: "destructive",
      });
      console.error("Error deleting family:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Danger Zone</h3>
      <div className="rounded-md border p-4">
        <h4 className="text-sm font-semibold">Leave Family</h4>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Remove yourself from the current family.
        </p>
        <Button
          variant="destructive"
          size="sm"
          className="mt-2"
          onClick={handleLeaveFamilyClick}
          disabled={isLeaving}
        >
          Leave Family
        </Button>
      </div>

      {profile?.is_admin && (
        <div className="rounded-md border p-4">
          <h4 className="text-sm font-semibold">Delete Family</h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Permanently delete this family and all associated data. This action
            cannot be undone.
          </p>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                size="sm"
                className="mt-2"
                disabled={isDeleting}
              >
                Delete Family
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete
                  your family and remove all members.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteFamily}>
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </div>
  );
}
