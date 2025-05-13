
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Copy, CheckCircle, AlertCircle, Home, Settings } from "lucide-react";
import { Profile } from "@/types/profile";

interface FamilyData {
  name: string;
  invite_code: string;
}

interface FamilySectionProps {
  profile: Profile;
}

const FamilySection = ({ profile }: FamilySectionProps) => {
  const navigate = useNavigate();
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteCodeCopied, setInviteCodeCopied] = useState(false);
  const [familyData, setFamilyData] = useState<FamilyData | null>(null);

  useEffect(() => {
    if (profile?.family_id && profile.is_admin) {
      fetchFamilyData(profile.family_id);
    }
  }, [profile]);

  const fetchFamilyData = async (familyId: string) => {
    try {
      const { data, error } = await supabase
        .from("families")
        .select("name, invite_code")
        .eq("id", familyId)
        .single();

      if (error) throw error;
      setFamilyData(data);
    } catch (error) {
      console.error("Error fetching family data:", error);
    }
  };

  const copyInviteCode = () => {
    if (!familyData?.invite_code) return;
    
    navigator.clipboard.writeText(familyData.invite_code);
    setInviteCodeCopied(true);
    
    setTimeout(() => {
      setInviteCodeCopied(false);
    }, 3000);
  };

  const navigateToFamilyAdmin = () => {
    navigate("/family-admin");
  };

  return (
    <>
      <div className="flex items-center gap-2 mb-6">
        <Avatar className="h-12 w-12">
          <AvatarFallback className="bg-purple-100 text-purple-800">
            <Home className="h-6 w-6" />
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-medium text-lg">
            {familyData?.name || "Your Family"}
          </h3>
          {profile.is_admin ? (
            <span className="text-xs text-purple-600 font-medium">Administrator</span>
          ) : (
            <span className="text-xs text-gray-500">Member</span>
          )}
        </div>
      </div>
      
      <Separator className="my-6" />
      
      <div className="space-y-6">
        <div className="space-y-4">
          {profile.is_admin ? (
            <Button
              onClick={navigateToFamilyAdmin}
              className="w-full flex items-center justify-center gap-2"
            >
              <Settings className="h-4 w-4" />
              Manage Family Settings
            </Button>
          ) : (
            <p className="text-sm text-gray-500 text-center">
              Contact your family administrator to update family settings
            </p>
          )}
          
          <Button
            variant="outline"
            onClick={() => setShowInviteDialog(true)}
            className="w-full"
          >
            View Invite Code
          </Button>
        </div>
      </div>

      {/* Invite Code Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Family Invite Code</DialogTitle>
            <DialogDescription>
              Share this code with people you want to join your family
            </DialogDescription>
          </DialogHeader>
          
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 text-center">
            <h3 className="text-2xl font-mono tracking-wider font-bold mb-3">
              {familyData?.invite_code || "------"}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              This code can be used to join your family from the setup screen
            </p>
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={copyInviteCode}
            >
              {inviteCodeCopied ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy Code
                </>
              )}
            </Button>
          </div>
          
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 p-3 rounded-lg">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <p className="text-sm">For security reasons, do not share this code publicly</p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FamilySection;
