
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, UsersRound, Paintbrush } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { asUUID, asUpdateType } from "@/utils/supabaseHelpers";

interface FamilySettingsProps {
  familyData: any;
  profile: any;
  onOpenInviteDialog: () => void;
  refreshFamilyData: (familyId: string) => void;
}

export function FamilySettings({ familyData, profile, onOpenInviteDialog, refreshFamilyData }: FamilySettingsProps) {
  const [familyName, setFamilyName] = useState(familyData?.name || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveSettings = async () => {
    if (!familyData?.id || !familyName.trim()) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("families")
        .update(asUpdateType('families', {
          name: familyName.trim(),
          settings: familyData.settings
        }))
        .eq("id", asUUID(familyData.id));

      if (error) throw error;

      toast({
        description: "Family settings updated successfully.",
      });

      if (profile?.family_id) {
        refreshFamilyData(profile.family_id);
      }
    } catch (error: any) {
      toast({
        description: error.message || "Failed to update settings.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="px-4 sm:px-6">
        <CardTitle>Family Settings</CardTitle>
        <CardDescription>Manage your family settings and members</CardDescription>
      </CardHeader>
      <CardContent className="px-4 sm:px-6 space-y-6">
        <div>
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-medium">Family Details</h3>
              <p className="text-sm text-gray-500">Update your family information</p>
            </div>
            <Button 
              variant="primary" 
              onClick={handleSaveSettings} 
              disabled={isSaving || !familyName.trim() || familyName === familyData?.name}
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
          
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="familyName">Family Name</Label>
              <Input 
                id="familyName" 
                value={familyName} 
                onChange={(e) => setFamilyName(e.target.value)}
                placeholder="Enter family name"
              />
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-100 dark:border-gray-800 pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-medium flex items-center gap-2">
                <UsersRound className="h-5 w-5 text-primary" />
                <span>Members</span>
              </h3>
              <p className="text-sm text-gray-500">Your family has {familyData?.memberCount || 0} members</p>
            </div>
            <Button 
              variant="outline" 
              onClick={onOpenInviteDialog}
              className="flex items-center gap-2"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Invite</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
