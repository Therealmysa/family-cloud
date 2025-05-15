
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Profile } from "@/types/profile";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { ProfileAvatar } from "@/components/profile/ProfileAvatar";
import { MemberProfileDialog } from "./MemberProfileDialog";

interface FamilyMembersProps {
  familyId: string | null;
}

export function FamilyMembers({ familyId }: FamilyMembersProps) {
  const [members, setMembers] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMember, setSelectedMember] = useState<Profile | null>(null);
  const [showProfileDialog, setShowProfileDialog] = useState(false);

  useEffect(() => {
    if (familyId) {
      fetchFamilyMembers(familyId);
    }
  }, [familyId]);

  const fetchFamilyMembers = async (familyId: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("family_id", familyId);

      if (error) throw error;
      setMembers(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load family members",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openMemberProfile = (member: Profile) => {
    setSelectedMember(member);
    setShowProfileDialog(true);
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Family Members</CardTitle>
      </CardHeader>
      <CardContent>
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
        {isLoading ? (
          <p className="text-center py-4">Loading members...</p>
        ) : filteredMembers.length === 0 ? (
          <p className="text-center text-gray-500 py-4">No family members found</p>
        ) : (
          <div className="space-y-2">
            {filteredMembers.map((member) => (
              <div 
                key={member.id}
                className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <div 
                  className="flex items-center gap-3 cursor-pointer"
                  onClick={() => openMemberProfile(member)}
                >
                  <ProfileAvatar profile={member} size="md" />
                  <div>
                    <p className="font-medium">
                      {member.name}
                    </p>
                    {member.is_admin && (
                      <span className="text-xs text-purple-600 font-medium">Administrator</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {selectedMember && (
        <MemberProfileDialog 
          isOpen={showProfileDialog} 
          onOpenChange={setShowProfileDialog} 
          member={selectedMember} 
        />
      )}
    </Card>
  );
}
