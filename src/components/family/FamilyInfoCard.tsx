
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Copy, CheckCircle, Home, Users, Settings, Crown } from "lucide-react";
import { LeaveFamilyButton } from "./LeaveFamilyButton";

export function FamilyInfoCard() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [familyData, setFamilyData] = useState<any>(null);
  const [memberCount, setMemberCount] = useState<number | null>(null);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteCodeCopied, setInviteCodeCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  // Function to load family data
  const fetchFamilyData = async () => {
    if (!profile?.family_id) return;
    
    setLoading(true);
    try {
      // Get family data
      const { data: family, error: familyError } = await supabase
        .from("families")
        .select("*")
        .eq("id", profile.family_id)
        .single();

      if (familyError) throw familyError;
      
      // Count members
      const { count, error: countError } = await supabase
        .from("profiles")
        .select("*", { count: 'exact', head: true })
        .eq("family_id", profile.family_id);
      
      if (countError) throw countError;

      setFamilyData(family);
      setMemberCount(count || 0);
      setIsOwner(family.owner_id === profile.id);
    } catch (error) {
      console.error("Error fetching family data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load family data when component is mounted and when profile changes
  useEffect(() => {
    if (profile?.family_id) {
      fetchFamilyData();
    }
  }, [profile]);

  const copyInviteCode = () => {
    if (!familyData?.invite_code) return;
    
    navigator.clipboard.writeText(familyData.invite_code);
    setInviteCodeCopied(true);
    
    setTimeout(() => {
      setInviteCodeCopied(false);
    }, 3000);
  };

  // If user has no family, don't render anything
  if (!profile?.family_id) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            {familyData?.avatar_url ? (
              <img src={familyData.avatar_url} alt="Family" className="h-full w-full object-cover" />
            ) : (
              <AvatarFallback className="bg-purple-100 text-purple-800">
                <Home className="h-5 w-5" />
              </AvatarFallback>
            )}
          </Avatar>
          <div className="flex-1">
            <CardTitle className="text-xl">My Family</CardTitle>
            <CardDescription>
              {familyData?.name || "Loading..."}
            </CardDescription>
          </div>
          <div className="flex flex-col gap-1">
            {isOwner && (
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                <Crown className="h-3 w-3 mr-1" /> Owner
              </Badge>
            )}
            {profile?.is_admin && (
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                Admin
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-sm text-gray-500 flex items-center pl-0 hover:pl-2 transition-all"
              onClick={() => navigate("/family-members")}
            >
              <Users className="h-4 w-4 mr-1.5 text-gray-400" />
              {memberCount !== null ? `${memberCount} members` : "Loading members..."}
            </Button>
            <LeaveFamilyButton />
          </div>
          
          <div className="grid grid-cols-2 gap-2 mt-3">
            <Button
              variant="outline" 
              onClick={() => setShowInviteDialog(true)}
              className="w-full"
            >
              View Invite Code
            </Button>
            
            {profile?.is_admin && (
              <Button
                variant="default"
                className="w-full"
                onClick={() => navigate("/family-admin")}
              >
                <Settings className="h-4 w-4 mr-1.5" />
                Manage
              </Button>
            )}
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
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
