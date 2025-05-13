
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/components/ui/use-toast";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProfileForm from "@/components/profile/ProfileForm";
import AccountSettings from "@/components/profile/AccountSettings";
import FamilySection from "@/components/profile/FamilySection";
import { Loader2 } from "lucide-react";

const Profile = () => {
  const { user, profile, signOut } = useAuth();

  if (!user || !profile) {
    return (
      <MainLayout title="Profile" requireAuth={true}>
        <div className="flex justify-center items-center min-h-[calc(100vh-16rem)]">
          <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Profile" requireAuth={true}>
      <div className="container max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-center mb-8">Profile Settings</h1>
        
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="profile">Personal Profile</TabsTrigger>
            <TabsTrigger value="family" disabled={!profile.family_id}>Family Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <div className="grid gap-6">
              <Card>
                <CardHeader className="px-4 py-3 md:px-6 md:py-4">
                  <CardTitle className="text-lg">Your Profile</CardTitle>
                  <CardDescription>
                    Update your personal information and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-4 py-3 md:px-6">
                  <ProfileForm user={user} profile={profile} />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="px-4 py-3 md:px-6 md:py-4">
                  <CardTitle className="text-lg">Account Settings</CardTitle>
                  <CardDescription>
                    Manage your email and password
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-4 py-3 md:px-6">
                  <AccountSettings user={user} signOut={signOut} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="family">
            <div className="grid gap-6">
              <Card>
                <CardHeader className="px-4 py-3 md:px-6 md:py-4">
                  <CardTitle className="text-lg">Family Information</CardTitle>
                  <CardDescription>
                    View and manage your family settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-4 py-3 md:px-6">
                  <FamilySection profile={profile} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Profile;
