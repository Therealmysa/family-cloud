
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/components/ui/use-toast";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProfileForm from "@/components/profile/ProfileForm";
import AccountSettings from "@/components/profile/AccountSettings";
import FamilySection from "@/components/profile/FamilySection";
import { Loader2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious 
} from "@/components/ui/carousel";

const Profile = () => {
  const { user, profile, signOut } = useAuth();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState("profile");

  if (!user || !profile) {
    return (
      <MainLayout title="Profile" requireAuth={true}>
        <div className="flex justify-center items-center min-h-[calc(100vh-16rem)]">
          <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </MainLayout>
    );
  }

  // Function to handle carousel change and sync with tabs
  const handleCarouselChange = (api: any) => {
    if (!api) return;
    
    const selectedIndex = api.selectedScrollSnap();
    if (selectedIndex === 0) {
      setActiveTab("profile");
    } else if (selectedIndex === 1 && profile.family_id) {
      setActiveTab("family");
    }
  };

  return (
    <MainLayout title="Profile" requireAuth={true}>
      <div className="container max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-center mb-8">Profile Settings</h1>
        
        {isMobile && profile.family_id ? (
          <div className="w-full">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="profile">Personal Profile</TabsTrigger>
                <TabsTrigger value="family">Family Settings</TabsTrigger>
              </TabsList>
              
              <Carousel 
                className="w-full"
                onSelect={(api) => handleCarouselChange(api)}
                opts={{ 
                  align: "start", 
                  containScroll: false 
                }}
              >
                <CarouselContent>
                  <CarouselItem>
                    <div className="grid gap-6 px-1">
                      <Card>
                        <CardHeader>
                          <CardTitle>Your Profile</CardTitle>
                          <CardDescription>
                            Update your personal information and preferences
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <ProfileForm user={user} profile={profile} />
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader>
                          <CardTitle>Account Settings</CardTitle>
                          <CardDescription>
                            Manage your email and password
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <AccountSettings user={user} signOut={signOut} />
                        </CardContent>
                      </Card>
                    </div>
                  </CarouselItem>
                  
                  {profile.family_id && (
                    <CarouselItem>
                      <div className="grid gap-6 px-1">
                        <Card>
                          <CardHeader>
                            <CardTitle>Family Information</CardTitle>
                            <CardDescription>
                              View and manage your family settings
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <FamilySection profile={profile} />
                          </CardContent>
                        </Card>
                      </div>
                    </CarouselItem>
                  )}
                </CarouselContent>
                
                <div className="flex justify-center mt-6">
                  <CarouselPrevious className="static transform-none mx-2" />
                  <CarouselNext className="static transform-none mx-2" />
                </div>
              </Carousel>
            </Tabs>
          </div>
        ) : (
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="profile">Personal Profile</TabsTrigger>
              <TabsTrigger value="family" disabled={!profile.family_id}>Family Settings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile">
              <div className="grid gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Your Profile</CardTitle>
                    <CardDescription>
                      Update your personal information and preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ProfileForm user={user} profile={profile} />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Account Settings</CardTitle>
                    <CardDescription>
                      Manage your email and password
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AccountSettings user={user} signOut={signOut} />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="family">
              <div className="grid gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Family Information</CardTitle>
                    <CardDescription>
                      View and manage your family settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <FamilySection profile={profile} />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </MainLayout>
  );
};

export default Profile;
