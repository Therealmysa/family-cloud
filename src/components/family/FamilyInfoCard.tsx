
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Copy, CheckCircle, Home, Users, Crown, Camera, Loader2 } from "lucide-react";
import { LeaveFamilyButton } from "./LeaveFamilyButton";
import { FamilyMembers } from "./FamilyMembers";
import { toast } from "@/components/ui/use-toast";
import { v4 as uuidv4 } from "uuid";

export function FamilyInfoCard() {
  const { user, profile } = useAuth();
  const [familyData, setFamilyData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [inviteCodeCopied, setInviteCodeCopied] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showMembersDialog, setShowMembersDialog] = useState(false);
  const [showAvatarDialog, setShowAvatarDialog] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !profile?.family_id || !user?.id) return;
    
    // Check if user is admin
    if (!profile.is_admin) {
      toast({
        title: "Permission Denied",
        description: "Only family administrators can change the family avatar.",
        variant: "destructive"
      });
      return;
    }
    
    const file = e.target.files[0];
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file (JPG, PNG, etc.)",
        variant: "destructive"
      });
      return;
    }
    
    setIsUploading(true);
    
    try {
      // Create unique filename
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${profile.family_id}-${uuidv4()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;
      
      // Upload file to family-avatars bucket
      const { error: uploadError } = await supabase.storage
        .from('family-avatars')
        .upload(filePath, file, {
          contentType: file.type,
          upsert: false
        });
        
      if (uploadError) throw uploadError;
      
      // Get public URL for the uploaded file
      const { data: publicUrlData } = supabase.storage
        .from('family-avatars')
        .getPublicUrl(filePath);
      
      // Update family record with new avatar
      const { error: updateError } = await supabase
        .from('families')
        .update({ avatar_url: publicUrlData.publicUrl })
        .eq('id', profile.family_id);
        
      if (updateError) throw updateError;
      
      // Refresh family data
      await fetchFamilyData(profile.family_id);
      
      toast({
        title: "Avatar Updated",
        description: "Your family avatar has been changed successfully.",
      });
      
      setShowAvatarDialog(false);
      
    } catch (error: any) {
      console.error("Error updating family avatar:", error);
      toast({
        title: "Update Failed",
        description: error.message || "Could not update family avatar. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
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
                <div className="relative">
                  <Avatar className="h-14 w-14">
                    {familyData?.avatar_url ? (
                      <AvatarImage src={familyData.avatar_url} alt={familyData.name} />
                    ) : (
                      <AvatarFallback className="bg-purple-100 text-purple-800">
                        <Home className="h-6 w-6" />
                      </AvatarFallback>
                    )}
                  </Avatar>
                  
                  {profile.is_admin && (
                    <Button 
                      variant="secondary" 
                      size="icon" 
                      className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full"
                      onClick={() => setShowAvatarDialog(true)}
                    >
                      <Camera className="h-3 w-3" />
                      <span className="sr-only">Change family avatar</span>
                    </Button>
                  )}
                </div>
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

      {/* Family Avatar Dialog */}
      <Dialog open={showAvatarDialog} onOpenChange={setShowAvatarDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change Family Avatar</DialogTitle>
            <DialogDescription>
              Upload a new image for your family
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="flex justify-center mb-6">
              <Avatar className="h-20 w-20">
                {familyData?.avatar_url ? (
                  <AvatarImage src={familyData.avatar_url} alt={familyData.name} />
                ) : (
                  <AvatarFallback className="bg-purple-100 text-purple-800">
                    <Home className="h-8 w-8" />
                  </AvatarFallback>
                )}
              </Avatar>
            </div>
            
            {isUploading ? (
              <div className="flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span>Uploading...</span>
              </div>
            ) : (
              <div className="flex justify-center">
                <input
                  type="file"
                  id="avatarUpload"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleAvatarChange}
                />
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera className="mr-2 h-4 w-4" />
                  Select New Image
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
