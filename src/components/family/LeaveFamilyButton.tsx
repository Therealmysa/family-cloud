
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { asProfileUpdate } from "@/utils/supabaseHelpers";

export function LeaveFamilyButton() {
  const { user, profile, refreshProfile } = useAuth();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  // Family admins can't leave, they must transfer ownership or delete
  if (!profile || !profile.family_id || profile.is_admin) return null;

  const handleLeaveFamily = async () => {
    if (!user) return;
    
    setIsLeaving(true);
    try {
      // Update profile to remove family association
      const { error } = await supabase
        .from("profiles")
        .update(asProfileUpdate({
          family_id: null,
          is_admin: false
        }))
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Left family",
        description: "You have successfully left your family.",
      });
      
      // Refresh profile to update UI
      if (refreshProfile) await refreshProfile();
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to leave family. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLeaving(false);
      setConfirmOpen(false);
    }
  };

  return (
    <>
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => setConfirmOpen(true)}
        className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
      >
        <LogOut className="h-4 w-4 mr-2" />
        Leave Family
      </Button>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Leave your family?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove you from your current family. You won't have access to family photos, 
              messages, and other shared content anymore. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLeaveFamily}
              disabled={isLeaving}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isLeaving ? "Leaving..." : "Leave Family"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
