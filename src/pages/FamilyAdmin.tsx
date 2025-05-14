
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { FamilySettings } from "@/components/family-admin/FamilySettings";
import { MemberManagement } from "@/components/family-admin/MemberManagement";
import { DangerZone } from "@/components/family-admin/DangerZone";
import { InviteDialog } from "@/components/family-admin/InviteDialog";

export default function FamilyAdmin() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [familyData, setFamilyData] = useState<any>(null);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [familyMembers, setFamilyMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Redirect if user not logged in or not an admin
  useEffect(() => {
    if (!profile) return;
    
    if (!profile.is_admin) {
      toast({
        title: "Access denied",
        description: "You need to be a family admin to view this page.",
        variant: "destructive",
      });
      navigate('/profile');
      return;
    }

    if (profile.family_id) {
      fetchFamilyData(profile.family_id);
      fetchFamilyMembers(profile.family_id);
    }
  }, [profile, navigate]);

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
        memberCount: count
      });
      
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching family data:", error);
      toast({
        title: "Error",
        description: "Failed to load family data. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const fetchFamilyMembers = async (familyId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("family_id", familyId);

      if (error) throw error;
      setFamilyMembers(data);
    } catch (error) {
      console.error("Error fetching family members:", error);
    }
  };

  if (isLoading) {
    return (
      <MainLayout title="Family Administration" requireAuth={true}>
        <div className="flex justify-center items-center min-h-[calc(100vh-16rem)]">
          <div className="flex flex-col items-center">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600 mb-2" />
            <p className="text-gray-500">Loading family information...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Family Administration" requireAuth={true}>
      <div className="w-full px-2 sm:px-4 py-6 sm:max-w-4xl sm:mx-auto">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
          <h1 className="text-xl sm:text-2xl font-bold">Family Administration</h1>
          <Button variant="outline" onClick={() => navigate('/profile')}>
            Back to Profile
          </Button>
        </div>

        <div className="grid gap-6">
          <FamilySettings 
            familyData={familyData} 
            profile={profile} 
            onOpenInviteDialog={() => setShowInviteDialog(true)} 
            refreshFamilyData={fetchFamilyData}
          />
          
          <MemberManagement 
            familyMembers={familyMembers} 
            currentUserId={user?.id} 
            familyId={profile?.family_id}
            refreshFamilyMembers={fetchFamilyMembers}
          />
          
          <DangerZone />
        </div>

        <InviteDialog 
          isOpen={showInviteDialog} 
          onOpenChange={setShowInviteDialog} 
          inviteCode={familyData?.invite_code}
        />
      </div>
    </MainLayout>
  );
}
