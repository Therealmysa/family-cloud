
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Copy, CheckCircle, Home, Users, Crown } from "lucide-react";
import { LeaveFamilyButton } from "./LeaveFamilyButton";
import { FamilyMembers } from "./FamilyMembers";

export function FamilyInfoCard() {
  const { user, profile } = useAuth();
  const [familyData, setFamilyData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [inviteCodeCopied, setInviteCodeCopied] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showMembersDialog, setShowMembersDialog] = useState(false);

  useEffect(() => {
    if (profile?.family_id) {
      fetchFamilyData(profile.family_id);
    } else {
      setIsLoading(false);
    }
  }, [profile]);

  const fetchFamilyData = async (familyId: string) => {
    try {
      const { data, error } = await supabase
        .from("families")
        .select("*")
        .eq("id", familyId)
        .single();

      if (error) throw error;

      // Get member count
      const { count } = await supabase
        .from("profiles")
        .select("*", { count: 'exact', head: true })
        .eq("family_id", familyId);

      setFamilyData({
        ...data,
        memberCount: count || 0
      });
    } catch (error) {
      console.error("Error fetching family data:", error);
    } finally {
      setIsLoading(false);
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

  // If no profile or no family_id
  if (!profile || !profile.family_id) {
    return null;
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-lg font-medium">Family Information</CardTitle>
          {profile.is_admin && (
            <Button variant="outline" size="sm" asChild>
              <a href="/family-admin">Manage</a>
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex flex-col space-y-4">
              <div className="flex items-center space-x-4">
                <Skeleton className="h-14 w-14 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14">
                  {familyData?.avatar_url ? (
                    <AvatarImage src={familyData.avatar_url} alt={familyData.name} />
                  ) : (
                    <AvatarFallback className="bg-purple-100 text-purple-800">
                      <Home className="h-6 w-6" />
                    </AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">{familyData?.name}</h3>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-muted-foreground">
                      {familyData?.memberCount || 0} member{familyData?.memberCount === 1 ? '' : 's'}
                    </p>
                    {user?.id === familyData?.owner_id && (
                      <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-medium">
                        Owner
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-4">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setShowMembersDialog(true)}
                >
                  <Users className="mr-2 h-4 w-4" />
                  View Family Members
                </Button>

                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setShowInviteDialog(true)}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Family Invite Code
                </Button>
              </div>

              {!profile.is_admin && (
                <div className="pt-2">
                  <LeaveFamilyButton />
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

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

      {/* Members Dialog */}
      <Dialog open={showMembersDialog} onOpenChange={setShowMembersDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Family Members</DialogTitle>
            <DialogDescription>
              All members of your family
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <FamilyMembers familyId={profile.family_id} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
