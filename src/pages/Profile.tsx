
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/components/ui/use-toast";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProfileForm from "@/components/profile/ProfileForm";
import AccountSettings from "@/components/profile/AccountSettings";
import FamilySection from "@/components/profile/FamilySection";
import { FamilyInfoCard } from "@/components/family/FamilyInfoCard";
import { Loader2 } from "lucide-react";

const Profile = () => {
  const { user, profile, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("profile");

  // Correction: Utiliser useEffect au lieu de useState pour cette logique
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab === 'family' && profile?.family_id) {
      setActiveTab('family');
    }
  }, [profile?.family_id]); // Dépendance pour recalculer si family_id change

  if (!user || !profile) {
    return (
      <MainLayout title="Profile" requireAuth={true}>
        <div className="flex justify-center items-center min-h-[calc(100vh-16rem)]">
          <div className="flex flex-col items-center">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600 mb-2" />
            <p className="text-gray-500">Loading your profile...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Profile" requireAuth={true}>
      <div className="w-full px-1 py-4 sm:px-3 sm:py-6 overflow-x-hidden">
        <h1 className="text-2xl font-bold text-center mb-6 sm:mb-8">Profile Settings</h1>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 sm:mb-8">
            <TabsTrigger value="profile">Personal Profile</TabsTrigger>
            <TabsTrigger value="family" disabled={!profile.family_id}>Family Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="w-full">
            <div className="grid gap-4 sm:gap-6 w-full">
              <Card className="w-full overflow-hidden">
                <CardHeader className="px-3 py-2 sm:px-4 sm:py-3 md:px-6 md:py-4">
                  <CardTitle className="text-lg">Your Profile</CardTitle>
                  <CardDescription>
                    Update your personal information and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-3 py-2 sm:px-4 sm:py-3 md:px-6">
                  <ProfileForm user={user} profile={profile} />
                </CardContent>
              </Card>
              
              <Card className="w-full overflow-hidden">
                <CardHeader className="px-3 py-2 sm:px-4 sm:py-3 md:px-6 md:py-4">
                  <CardTitle className="text-lg">Account Settings</CardTitle>
                  <CardDescription>
                    Manage your email and password
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-3 py-2 sm:px-4 sm:py-3 md:px-6">
                  <AccountSettings user={user} signOut={signOut} />
                </CardContent>
              </Card>
              
              {/* Show family info card even on profile tab if user has family */}
              {profile.family_id && (
                <div className="md:hidden">
                  <FamilyInfoCard />
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="family" className="w-full">
            <div className="grid gap-4 sm:gap-6 w-full">
              {/* New family card that works for both admins and non-admins */}
              <FamilyInfoCard />
              
              {/* Keep the existing FamilySection for admins */}
              {profile.is_admin && (
                <Card className="w-full overflow-hidden">
                  <CardHeader className="px-3 py-2 sm:px-4 sm:py-3 md:px-6 md:py-4">
                    <CardTitle className="text-lg">Family Administration</CardTitle>
                    <CardDescription>
                      Manage your family settings and members
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-3 py-2 sm:px-4 sm:py-3 md:px-6">
                    <FamilySection profile={profile} />
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Profile;
