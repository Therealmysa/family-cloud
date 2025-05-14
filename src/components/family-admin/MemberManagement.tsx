
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MoreVertical, CheckCheck } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { asUUID, asUpdateType } from "@/utils/supabaseHelpers";

interface MemberManagementProps {
  familyMembers: any[];
  currentUserId: string | undefined;
  familyId: string | null;
  refreshFamilyMembers: (familyId: string) => void;
}

export function MemberManagement({ 
  familyMembers, 
  currentUserId, 
  familyId,
  refreshFamilyMembers
}: MemberManagementProps) {
  const { profile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleRemoveMember = async (member: any) => {
    if (!familyId) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update(asUpdateType('profiles', {
          family_id: null,
          is_admin: false
        }))
        .eq("id", asUUID(member.id));

      if (error) throw error;

      toast({
        description: `${member.name} has been removed from the family.`,
      });
      
      refreshFamilyMembers(familyId);
    } catch (error: any) {
      toast({
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleAdmin = async (member: any) => {
    if (!familyId) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update(asUpdateType('profiles', {
          is_admin: !member.is_admin
        }))
        .eq("id", asUUID(member.id));

      if (error) throw error;

      toast({
        description: `${member.name}'s admin status has been updated.`,
      });
      
      refreshFamilyMembers(familyId);
    } catch (error: any) {
      toast({
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="px-4 sm:px-6">
        <CardTitle>Member Management</CardTitle>
        <CardDescription>Manage members of your family</CardDescription>
      </CardHeader>
      <CardContent className="px-4 sm:px-6">
        <div className="divide-y divide-border">
          {familyMembers.map((member) => (
            <div key={member.id} className="py-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarImage src={member.avatar_url} />
                  <AvatarFallback>{member.name.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{member.name}</p>
                  <p className="text-sm text-gray-500">{member.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {currentUserId !== member.id && (
                  <Label htmlFor={`admin-switch-${member.id}`} className="mr-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed">
                    Admin
                  </Label>
                )}
                {currentUserId !== member.id && (
                  <Switch 
                    id={`admin-switch-${member.id}`} 
                    checked={!!member.is_admin} 
                    onCheckedChange={() => handleToggleAdmin(member)}
                    disabled={isLoading}
                  />
                )}
                {currentUserId !== member.id && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleRemoveMember(member)}>
                        Remove from Family
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
                {currentUserId === member.id && member.is_admin && (
                  <div className="flex items-center gap-2 text-green-500">
                    <CheckCheck className="h-4 w-4" />
                    <span className="text-sm">You</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
