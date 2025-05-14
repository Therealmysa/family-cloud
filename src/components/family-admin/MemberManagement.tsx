import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { asProfileUpdate } from "@/utils/supabaseHelpers";

interface MemberProfile extends Tables<'profiles'> {
  isCurrentUser?: boolean;
}

export function MemberManagement() {
  const [members, setMembers] = useState<MemberProfile[]>([]);
  const { toast } = useToast();
  const { user, profile } = useAuth();

  const { isLoading } = useQuery(
    ['familyMembers', profile?.family_id],
    async () => {
      if (!profile?.family_id) return [];

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('family_id', profile.family_id);

      if (error) {
        console.error("Error fetching family members:", error);
        toast({
          title: "Error fetching family members",
          description: error.message,
          variant: "destructive",
        });
        return [];
      }

      const memberProfiles: MemberProfile[] = data.map(member => ({
        ...member,
        isCurrentUser: member.id === user?.id,
      }));

      setMembers(memberProfiles);
      return memberProfiles;
    },
    {
      enabled: !!profile?.family_id,
      retry: false,
    }
  );

  useEffect(() => {
    if (profile?.family_id) {
      // The useQuery hook handles fetching members
      // This useEffect is intentionally left empty
    }
  }, [profile?.family_id]);

  const handleRoleChange = async (memberId: string, newRole: string) => {
    try {
      // Update with proper type casting
      const { error } = await supabase
        .from('profiles')
        .update(asProfileUpdate({
          role: newRole
        }))
        .eq('id', memberId);

      if (error) {
        toast({
          title: "Error updating role",
          description: error.message,
          variant: "destructive",
        });
        console.error("Error updating role:", error);
      } else {
        setMembers(prevMembers =>
          prevMembers.map(member =>
            member.id === memberId ? { ...member, role: newRole } : member
          )
        );
        toast({
          title: "Role updated",
          description: "Member role has been updated successfully.",
        });
      }
    } catch (error) {
      toast({
        title: "Something went wrong",
        description: "Unable to update member role. Please try again.",
        variant: "destructive",
      });
      console.error("Error updating role:", error);
    }
  };

  const toggleAdminStatus = async (memberId: string, currentStatus: boolean) => {
    if (user?.id === memberId) {
      toast({
        title: "Cannot change your own admin status",
        description: "You cannot remove yourself as an admin.",
        variant: "destructive",
      });
      return;
    }

    if (user?.id !== profile?.id && profile?.is_admin !== true) {
      toast({
        title: "Unauthorized",
        description: "You do not have permission to change admin status.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Update with proper type casting
      const { error } = await supabase
        .from('profiles')
        .update(asProfileUpdate({
          is_admin: !currentStatus
        }))
        .eq('id', memberId);

      if (error) {
        toast({
          title: "Error updating admin status",
          description: error.message,
          variant: "destructive",
        });
        console.error("Error updating admin status:", error);
      } else {
        setMembers(prevMembers =>
          prevMembers.map(member =>
            member.id === memberId ? { ...member, is_admin: !currentStatus } : member
          )
        );
        toast({
          title: "Admin status updated",
          description: "Member admin status has been updated successfully.",
        });
      }
    } catch (error) {
      toast({
        title: "Something went wrong",
        description: "Unable to update admin status. Please try again.",
        variant: "destructive",
      });
      console.error("Error updating admin status:", error);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Manage Members</CardTitle>
          <CardDescription>Manage family member roles and permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <ul>
            {Array.from({ length: 3 }).map((_, i) => (
              <li key={i} className="grid grid-cols-4 items-center gap-4 py-2">
                <div className="col-span-1">
                  <div className="flex items-center space-x-2">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
                <Skeleton className="col-span-2 h-8" />
                <Skeleton className="col-span-1 h-8" />
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Manage Members</CardTitle>
        <CardDescription>Manage family member roles and permissions</CardDescription>
      </CardHeader>
      <CardContent>
        <ul>
          {members.map(member => (
            <li key={member.id} className="grid grid-cols-4 items-center gap-4 py-2">
              <div className="col-span-1">
                <div className="flex items-center space-x-2">
                  <Avatar>
                    <AvatarImage src={member.avatar_url || undefined} alt={member.name} />
                    <AvatarFallback>{member.name?.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>{member.name}</div>
                </div>
              </div>
              <div className="col-span-2">
                <Label htmlFor={`role-${member.id}`}>Role</Label>
                <Select
                  id={`role-${member.id}`}
                  value={member.role || "member"}
                  onValueChange={(value) => handleRoleChange(member.id, value)}
                  disabled={member.isCurrentUser}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="moderator">Moderator</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-1 flex items-center justify-end">
                <Label htmlFor={`admin-${member.id}`} className="mr-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed">
                  Admin
                </Label>
                <Switch
                  id={`admin-${member.id}`}
                  checked={member.is_admin || false}
                  onCheckedChange={(checked) => toggleAdminStatus(member.id, member.is_admin || false)}
                  disabled={member.isCurrentUser}
                />
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
