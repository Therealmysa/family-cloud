
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CreateFamilyForm from "@/components/family-setup/CreateFamilyForm";
import JoinFamilyForm from "@/components/family-setup/JoinFamilyForm";

export default function SetupFamily() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>("create");

  // Redirect if user already has a family
  if (profile?.family_id) {
    navigate('/');
    return null;
  }

  return (
    <MainLayout title="Set Up Your Family" requireAuth={true}>
      <div className="flex justify-center items-center min-h-[calc(100vh-16rem)]">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              Welcome to FamilyCloud
            </CardTitle>
            <CardDescription className="text-center">
              {activeTab === "create" 
                ? "Create your family to get started" 
                : "Join an existing family by entering the invite code"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="create">Create Family</TabsTrigger>
                <TabsTrigger value="join">Join Family</TabsTrigger>
              </TabsList>
              
              <TabsContent value="create">
                <CreateFamilyForm />
              </TabsContent>
              
              <TabsContent value="join">
                <JoinFamilyForm />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
