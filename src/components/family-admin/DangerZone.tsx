
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Trash } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export function DangerZone() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteFamily = async () => {
    if (!profile?.family_id) return;
    
    setIsDeleting(true);
    try {
      // First, update all profiles to remove family_id and is_admin status
      const { error: profilesError } = await supabase
        .from("profiles")
        .update({
          family_id: null as any, // Type cast for UUID compatibility
          is_admin: false,
        })
        .eq("family_id", profile.family_id as any); // Type cast for UUID compatibility

      if (profilesError) throw profilesError;

      // Then delete the family
      const { error: familyError } = await supabase
        .from("families")
        .delete()
        .eq("id", profile.family_id as any); // Type cast for UUID compatibility

      if (familyError) throw familyError;

      toast({
        description: "Your family has been successfully deleted.",
      });
      
      // Navigate to profile page
      navigate("/profile");
    } catch (error: any) {
      toast({
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <>
      <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 overflow-hidden">
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="text-red-700 dark:text-red-400">Danger Zone</CardTitle>
          <CardDescription className="text-red-600/80 dark:text-red-400/80">
            Irreversible actions that affect your entire family
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <div className="space-y-4">
            <div className="p-3 sm:p-4 border border-red-300 dark:border-red-800 rounded-lg bg-white dark:bg-gray-900">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-medium text-red-700 dark:text-red-400">Delete Family</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    This will permanently delete your family and all associated data.
                  </p>
                </div>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  className="self-start sm:self-center"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash className="h-4 w-4 mr-1" />
                  Delete Family
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete your family and remove all members from it. 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteFamily}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Deleting..." : "Delete Family"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
