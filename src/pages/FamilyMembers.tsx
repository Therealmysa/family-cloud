
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Profile } from "@/types/profile";
import { Search, ArrowLeft, Crown, Shield } from "lucide-react";
import { ProfileAvatar } from "@/components/profile/ProfileAvatar";
import { toast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

export default function FamilyMembers() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [familyData, setFamilyData] = useState<any>(null);
  const [familyMembers, setFamilyMembers] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!profile) return;
    
    if (profile.family_id) {
      fetchFamilyData(profile.family_id);
      fetchFamilyMembers(profile.family_id);
    } else {
      toast({
        title: "No family found",
        description: "You need to be a part of a family to view this page.",
        variant: "destructive",
      });
      navigate('/setup-family');
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
        .eq("family_id", familyId)
        .order("name");

      if (error) throw error;
      setFamilyMembers(data);
    } catch (error) {
      console.error("Error fetching family members:", error);
    }
  };

  const filteredMembers = familyMembers.filter(member => 
    member.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <MainLayout title="Family Members" requireAuth={true}>
        <div className="flex justify-center items-center min-h-[calc(100vh-16rem)]">
          <div className="flex flex-col items-center">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600 mb-2" />
            <p className="text-gray-500">Loading family members...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Family Members" requireAuth={true}>
      <div className="w-full px-2 sm:px-4 py-6 sm:max-w-4xl sm:mx-auto">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
          <h1 className="text-xl sm:text-2xl font-bold">Family Members</h1>
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        <Card className="overflow-hidden">
          <CardHeader className="px-4 sm:px-6">
            <CardTitle>{familyData?.name}</CardTitle>
            <CardDescription>
              {familyData?.memberCount} {familyData?.memberCount === 1 ? 'member' : 'members'}
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            {/* Search input */}
            <div className="relative mb-4">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search members..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {/* Members list */}
            {filteredMembers.length === 0 ? (
              <p className="text-center text-gray-500 py-4">No family members found</p>
            ) : (
              <div className="space-y-2">
                {filteredMembers.map((member) => (
                  <div 
                    key={member.id}
                    className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <div className="flex items-center gap-3">
                      <ProfileAvatar profile={member} size="md" />
                      <div>
                        <p className="font-medium">
                          {member.name}
                          {member.id === user?.id && <span className="text-sm text-gray-500 ml-2">(You)</span>}
                        </p>
                        <div className="flex gap-2">
                          {familyData?.owner_id === member.id && (
                            <div className="flex items-center text-xs text-yellow-600 font-medium">
                              <Crown className="h-3 w-3 mr-1" /> 
                              Owner
                            </div>
                          )}
                          {member.is_admin && (
                            <div className="flex items-center text-xs text-purple-600 font-medium">
                              <Shield className="h-3 w-3 mr-1" />
                              Administrator
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {profile?.is_admin && (
              <div className="mt-6">
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => navigate("/family-admin")}
                >
                  Manage Family Settings
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
