import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertTriangle } from "lucide-react";
import { asUpdateType } from "@/utils/supabaseHelpers";

export const DangerZone = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const deleteFamily = async () => {
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('families')
        .delete()
        .eq('id', user?.profile?.family_id);

      if (error) throw error;

      // Also set family_id to null for all users in the family
      const { error: updateError } = await supabase
        .from('profiles')
        .update(asUpdateType('profiles', {
          family_id: null,
          is_admin: false
        }))
        .eq('family_id', user?.profile?.family_id);

      if (updateError) throw updateError;
      
      toast({
        title: "Success",
        description: "Your family has been deleted. You'll be redirected to create or join a new family.",
      });

      setTimeout(() => {
        navigate("/setup-family");
      }, 1500);
    } catch (error) {
      console.error('Error deleting family:', error);
      toast({
        title: "Error",
        description: "Failed to delete family. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const removeFamilyForUser = async (userId: string) => {
    setIsRemoving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update(asUpdateType('profiles', {
          family_id: null,
          is_admin: false
        }))
        .eq('id', userId);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "You have left the family. You'll be redirected to create or join a new family.",
      });

      setTimeout(() => {
        navigate("/setup-family");
      }, 1500);
    } catch (error) {
      console.error('Error removing user from family:', error);
      toast({
        title: "Error",
        description: "Failed to leave family. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <Card className="border border-border shadow-md hover:shadow-lg transition-all duration-300 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm overflow-hidden">
      <CardHeader className="pb-2 border-b border-border">
        <CardTitle className="text-lg">Danger Zone</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-4">
          {user?.profile?.is_admin ? (
            <div className="space-y-2">
              <h3 className="text-base font-medium text-red-500">Delete Family</h3>
              <p className="text-sm text-muted-foreground">
                Permanently delete this family and all of its data. This action cannot be undone.
              </p>
              <Button
                variant="destructive"
                onClick={deleteFamily}
                disabled={isDeleting}
                className="w-full sm:w-auto"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Delete Family
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <h3 className="text-base font-medium text-orange-500">Leave Family</h3>
              <p className="text-sm text-muted-foreground">
                Leave this family. You will no longer have access to family features.
              </p>
              <Button
                variant="outline"
                onClick={() => removeFamilyForUser(user?.id || "")}
                disabled={isRemoving}
                className="w-full sm:w-auto"
              >
                {isRemoving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Leaving...
                  </>
                ) : (
                  <>
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Leave Family
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
