import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AlertCircle, CheckCircle, Copy, Home, Loader2, Trash, UserX, Users } from "lucide-react";

// Define the shape of the family settings object
interface FamilySettings {
  publicGallery?: boolean;
  commentNotifications?: boolean;
}

const adminFormSchema = z.object({
  familyName: z.string().min(2, "Family name must be at least 2 characters"),
  publicGallery: z.boolean().default(true),
  commentNotifications: z.boolean().default(true),
});

type AdminFormValues = z.infer<typeof adminFormSchema>;

export default function FamilyAdmin() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [familyData, setFamilyData] = useState<any>(null);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteCodeCopied, setInviteCodeCopied] = useState(false);
  const [familyMembers, setFamilyMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const form = useForm<AdminFormValues>({
    resolver: zodResolver(adminFormSchema),
    defaultValues: {
      familyName: "",
      publicGallery: true,
      commentNotifications: true,
    },
  });

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

      setFamilyData(data);
      
      // Safely extract settings with type checking
      const settings = data.settings as FamilySettings | null;
      
      // Update form values with proper type handling
      form.reset({
        familyName: data.name,
        publicGallery: settings?.publicGallery ?? true,
        commentNotifications: settings?.commentNotifications ?? true,
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

  const onSubmit = async (data: AdminFormValues) => {
    if (!profile?.family_id) return;
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("families")
        .update({
          name: data.familyName,
          settings: {
            publicGallery: data.publicGallery,
            commentNotifications: data.commentNotifications,
          },
        })
        .eq("id", profile.family_id);

      if (error) throw error;

      toast({
        title: "Settings updated",
        description: "Your family settings have been successfully updated.",
      });
      
      // Refresh family data
      fetchFamilyData(profile.family_id);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
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

  const removeMember = async (memberId: string) => {
    if (!profile?.family_id || user?.id === memberId) return;
    
    try {
      // Update profile to remove family_id
      const { error } = await supabase
        .from("profiles")
        .update({
          family_id: null,
          is_admin: false,
        })
        .eq("id", memberId);

      if (error) throw error;

      toast({
        title: "Member removed",
        description: "The family member has been removed successfully.",
      });
      
      // Refresh family members
      fetchFamilyMembers(profile.family_id);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const makeAdmin = async (memberId: string) => {
    if (!profile?.family_id || user?.id === memberId) return;
    
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          is_admin: true,
        })
        .eq("id", memberId);

      if (error) throw error;

      toast({
        title: "Admin assigned",
        description: "The member is now a family administrator.",
      });
      
      // Refresh family members
      fetchFamilyMembers(profile.family_id);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
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
          <Card className="overflow-hidden">
            <CardHeader className="px-4 sm:px-6">
              <CardTitle>Family Information</CardTitle>
              <CardDescription>
                Configure your family settings and manage members
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <div className="flex items-center gap-3 mb-6">
                <Avatar className="h-12 w-12 sm:h-14 sm:w-14">
                  <AvatarFallback className="bg-purple-100 text-purple-800">
                    <Home className="h-5 w-5 sm:h-6 sm:w-6" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium text-lg sm:text-xl">{familyData?.name}</h3>
                  <p className="text-sm text-gray-500">
                    {familyMembers.length} {familyMembers.length === 1 ? 'member' : 'members'}
                  </p>
                </div>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="familyName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Family Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter family name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Separator className="my-4" />
                    
                    <h3 className="font-medium text-lg">Privacy & Notifications</h3>
                    
                    <FormField
                      control={form.control}
                      name="publicGallery"
                      render={({ field }) => (
                        <FormItem className="flex flex-col sm:flex-row sm:items-center justify-between rounded-lg border p-3 sm:p-4">
                          <div className="space-y-0.5 mb-2 sm:mb-0">
                            <FormLabel className="text-base">Public Photo Gallery</FormLabel>
                            <p className="text-sm text-muted-foreground">
                              Allow all family members to see all photos in the gallery
                            </p>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="commentNotifications"
                      render={({ field }) => (
                        <FormItem className="flex flex-col sm:flex-row sm:items-center justify-between rounded-lg border p-3 sm:p-4">
                          <div className="space-y-0.5 mb-2 sm:mb-0">
                            <FormLabel className="text-base">Comment Notifications</FormLabel>
                            <p className="text-sm text-muted-foreground">
                              Notify members when someone comments on their posts
                            </p>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4">
                    <Button 
                      type="submit" 
                      className="w-full sm:flex-1"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Settings"
                      )}
                    </Button>
                    
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full sm:flex-1"
                      onClick={() => setShowInviteDialog(true)}
                    >
                      <Users className="mr-2 h-4 w-4" />
                      Invite Members
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
          
          <Card className="overflow-hidden">
            <CardHeader className="px-4 sm:px-6">
              <CardTitle>Family Members</CardTitle>
              <CardDescription>
                Manage your family members and their permissions
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <div className="space-y-4">
                {familyMembers.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">No family members found</p>
                ) : (
                  <ul className="divide-y">
                    {familyMembers.map((member) => (
                      <li key={member.id} className="py-3 flex flex-wrap justify-between items-center gap-2">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-purple-100 text-purple-800">
                              {member.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{member.name}</p>
                            <p className="text-xs text-gray-500">
                              {member.is_admin ? "Administrator" : "Member"}
                            </p>
                          </div>
                        </div>
                        
                        {user?.id !== member.id && (
                          <div className="flex gap-2 mt-2 sm:mt-0">
                            {!member.is_admin && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => makeAdmin(member.id)}
                                className="text-xs"
                              >
                                Make Admin
                              </Button>
                            )}
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => removeMember(member.id)}
                              className="text-xs"
                            >
                              <UserX className="h-3 w-3 mr-1" />
                              Remove
                            </Button>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 overflow-hidden">
            <CardHeader className="px-4 sm:px-6">
              <CardTitle className="text-red-700 dark:text-red-400">Danger Zone</CardTitle>
              <CardDescription className="text-red-600/80 dark:text-red-400/80">
                Irreversible actions that affect your entire family
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <div className="space-y-4">
                <div className="p-3 sm:p-4 border border-red-300 dark:border-red-800 rounded-lg bg-white dark:bg-gray-900">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="font-medium text-red-700 dark:text-red-400">Delete Family</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        This will permanently delete your family and all associated data.
                      </p>
                    </div>
                    <Button variant="destructive" size="sm" className="self-start sm:self-center">
                      <Trash className="h-4 w-4 mr-1" />
                      Delete Family
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Invite Code Dialog */}
        <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Family Invite Code</DialogTitle>
              <DialogDescription>
                Share this code with people you want to join your family
              </DialogDescription>
            </DialogHeader>
            
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 sm:p-6 text-center">
              <h3 className="text-lg sm:text-2xl font-mono tracking-wider font-bold mb-3">
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
            
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 p-3 rounded-lg">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm">For security reasons, do not share this code publicly</p>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
