
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { asUUID, asUpdateType } from "@/utils/supabaseHelpers";

export function DangerZone() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleLeaveFamily = async () => {
    if (!user || !profile?.family_id) return;

    setIsProcessing(true);
    try {
      // Update profile to remove family association and admin status
      const { error } = await supabase
        .from("profiles")
        .update(asUpdateType('profiles', {
          family_id: null,
          is_admin: false
        }))
        .eq("id", asUUID(user.id));

      if (error) throw error;

      toast({
        description: "You have left the family.",
      });

      setTimeout(() => {
        navigate("/setup-family");
      }, 1000);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to leave family. Please try again.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  if (!profile?.is_admin) {
    return null;
  }

  return (
    <>
      <Card className="border-red-200 dark:border-red-900">
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="text-red-600 dark:text-red-400">Danger Zone</CardTitle>
          <CardDescription>Actions that require extra caution</CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <div>
            <h4 className="text-sm font-semibold mb-2">Leave Family</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              If you leave the family, you will lose access to all family data. If you are the only admin, consider making someone else an admin first.
            </p>
            <Button 
              variant="destructive" 
              onClick={() => setShowLeaveDialog(true)}
              disabled={isProcessing}
            >
              Leave Family
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Leave Family Confirmation Dialog */}
      <AlertDialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Leave Family?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to leave this family? You will lose access to all family data and memories.
              {profile?.is_admin && (
                <p className="mt-2 font-semibold">
                  As an admin, consider making someone else an admin before leaving.
                </p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLeaveFamily}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isProcessing}
            >
              {isProcessing ? "Processing..." : "Leave Family"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
