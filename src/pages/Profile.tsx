
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
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Camera, User, Copy, CheckCircle, AlertCircle, Loader2, Home, Settings } from "lucide-react";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
  theme: z.enum(["light", "dark", "system"]),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const Profile = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile?.avatar_url || null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteCodeCopied, setInviteCodeCopied] = useState(false);
  const [familyData, setFamilyData] = useState<{ name: string; invite_code: string } | null>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: profile?.name || "",
      bio: profile?.bio || "",
      theme: profile?.theme as "light" | "dark" | "system" || "light",
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        name: profile.name || "",
        bio: profile.bio || "",
        theme: profile.theme as "light" | "dark" | "system" || "light",
      });
      setAvatarUrl(profile.avatar_url);
    }
  }, [profile, form]);

  useEffect(() => {
    if (profile?.family_id && profile.is_admin) {
      fetchFamilyData(profile.family_id);
    }
  }, [profile]);

  const fetchFamilyData = async (familyId: string) => {
    try {
      const { data, error } = await supabase
        .from("families")
        .select("name, invite_code")
        .eq("id", familyId)
        .single();

      if (error) throw error;
      setFamilyData(data);
    } catch (error) {
      console.error("Error fetching family data:", error);
    }
  };

  const onSubmit = async (data: ProfileFormValues) => {
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          name: data.name,
          bio: data.bio || null,
          theme: data.theme,
        })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
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

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !event.target.files || event.target.files.length === 0) {
      return;
    }

    try {
      setIsUploading(true);
      setUploadError(null);

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload avatar to storage
      const { error: uploadError } = await supabase
        .storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase
        .storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update profile
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          avatar_url: publicUrl,
        })
        .eq("id", user.id);

      if (updateError) {
        throw updateError;
      }

      setAvatarUrl(publicUrl);
      toast({
        title: "Avatar updated",
        description: "Your avatar has been successfully updated.",
      });
    } catch (error: any) {
      setUploadError(error.message);
      toast({
        title: "Error uploading avatar",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
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

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const navigateToFamilyAdmin = () => {
    navigate("/family-admin");
  };

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
                <CardHeader>
                  <CardTitle>Your Profile</CardTitle>
                  <CardDescription>
                    Update your personal information and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row gap-6 items-start mb-6">
                    <div className="flex flex-col items-center gap-2 w-full sm:w-auto">
                      <Avatar className="w-24 h-24">
                        <AvatarImage src={avatarUrl || ""} />
                        <AvatarFallback className="bg-purple-100 text-purple-800 text-xl">
                          {profile.name?.substring(0, 2).toUpperCase() || <User />}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="mt-4">
                        <label htmlFor="avatar-upload" className="cursor-pointer">
                          <div className="flex items-center justify-center gap-1 bg-purple-100 hover:bg-purple-200 text-purple-700 py-1 px-3 rounded-md text-sm font-medium transition-colors">
                            <Camera className="h-4 w-4" />
                            <span>Change</span>
                          </div>
                          <input 
                            id="avatar-upload"
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            className="hidden"
                            onChange={handleAvatarChange}
                            disabled={isUploading}
                          />
                        </label>
                      </div>
                      
                      {isUploading && (
                        <div className="mt-2 text-xs text-purple-600 flex items-center">
                          <Loader2 className="animate-spin h-3 w-3 mr-1" />
                          Uploading...
                        </div>
                      )}
                      
                      {uploadError && (
                        <p className="mt-2 text-xs text-red-500">{uploadError}</p>
                      )}
                    </div>
                    
                    <div className="flex-1 w-full">
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                          <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="Your name" 
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="bio"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Bio</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="Tell your family a little about yourself" 
                                    className="resize-none"
                                    {...field}
                                    value={field.value || ""}
                                  />
                                </FormControl>
                                <FormDescription>
                                  Briefly describe yourself (max 500 characters)
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="theme"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Theme Preference</FormLabel>
                                <Select 
                                  onValueChange={field.onChange} 
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select a theme" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="light">Light</SelectItem>
                                    <SelectItem value="dark">Dark</SelectItem>
                                    <SelectItem value="system">System</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormDescription>
                                  Choose your preferred theme
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="pt-2">
                            <Button 
                              type="submit" 
                              className="w-full"
                              disabled={isSubmitting}
                            >
                              {isSubmitting ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Saving...
                                </>
                              ) : (
                                "Save Changes"
                              )}
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </div>
                  </div>
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
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <FormLabel>Email Address</FormLabel>
                      <Input value={user.email} readOnly disabled />
                      <p className="text-sm text-gray-500">
                        This is the email address associated with your account
                      </p>
                    </div>
                    
                    <div className="grid gap-2">
                      <FormLabel>Password</FormLabel>
                      <div className="flex gap-2">
                        <Input value="••••••••••••" type="password" readOnly disabled />
                        <Button variant="outline">Change Password</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between border-t pt-6">
                  <Button variant="ghost" onClick={handleLogout}>
                    Sign out
                  </Button>
                  <Button variant="destructive">Delete Account</Button>
                </CardFooter>
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
                  <div className="flex items-center gap-2 mb-6">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-purple-100 text-purple-800">
                        <Home className="h-6 w-6" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium text-lg">
                        {familyData?.name || "Your Family"}
                      </h3>
                      {profile.is_admin ? (
                        <span className="text-xs text-purple-600 font-medium">Administrator</span>
                      ) : (
                        <span className="text-xs text-gray-500">Member</span>
                      )}
                    </div>
                  </div>
                  
                  <Separator className="my-6" />
                  
                  <div className="space-y-6">
                    <div className="space-y-4">
                      {profile.is_admin ? (
                        <Button
                          onClick={navigateToFamilyAdmin}
                          className="w-full flex items-center justify-center gap-2"
                        >
                          <Settings className="h-4 w-4" />
                          Manage Family Settings
                        </Button>
                      ) : (
                        <p className="text-sm text-gray-500 text-center">
                          Contact your family administrator to update family settings
                        </p>
                      )}
                      
                      <Button
                        variant="outline"
                        onClick={() => setShowInviteDialog(true)}
                        className="w-full"
                      >
                        View Invite Code
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Invite Code Dialog */}
        <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Family Invite Code</DialogTitle>
              <DialogDescription>
                Share this code with people you want to join your family
              </DialogDescription>
            </DialogHeader>
            
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 text-center">
              <h3 className="text-2xl font-mono tracking-wider font-bold mb-3">
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
};

export default Profile;
