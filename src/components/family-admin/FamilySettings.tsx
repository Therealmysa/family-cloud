import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Home, Loader2, Users } from "lucide-react";

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

interface FamilySettingsProps {
  familyData: any;
  profile: any;
  onOpenInviteDialog: () => void;
  refreshFamilyData: (familyId: string) => void;
}

export function FamilySettings({ 
  familyData, 
  profile, 
  onOpenInviteDialog, 
  refreshFamilyData 
}: FamilySettingsProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AdminFormValues>({
    resolver: zodResolver(adminFormSchema),
    defaultValues: {
      familyName: familyData?.name || "",
      publicGallery: familyData?.settings?.publicGallery ?? true,
      commentNotifications: familyData?.settings?.commentNotifications ?? true,
    },
  });

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
          } as any, // Type cast for settings compatibility
        })
        .eq("id", profile.family_id as any); // Type cast for UUID compatibility

      if (error) throw error;

      toast({
        description: "Your family settings have been successfully updated.",
      });
      
      // Refresh family data
      refreshFamilyData(profile.family_id);
    } catch (error: any) {
      toast({
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
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
              {familyData?.memberCount || 0} {(familyData?.memberCount || 0) === 1 ? 'member' : 'members'}
            </p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
            
            <div className="space-y-4">
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
                onClick={onOpenInviteDialog}
              >
                <Users className="mr-2 h-4 w-4" />
                Invite Members
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
