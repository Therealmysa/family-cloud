
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Camera } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";
import { Profile } from "@/types/profile";
import { useTheme } from "@/hooks/use-theme";
import axios from "axios";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
  theme: z.enum(["light", "dark", "system"]),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  user: any;
  profile: Profile;
}

const ProfileForm = ({ user, profile }: ProfileFormProps) => {
  const { setTheme } = useTheme();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile?.avatar_url || null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: profile?.name || "",
      bio: profile?.bio || "",
      theme: profile?.theme as "light" | "dark" | "system" || "light",
    },
  });
  
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

      // Update theme when profile is updated
      setTheme(data.theme);

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
      
      // Prepare the Cloudinary upload
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "family_uploads");
      formData.append("folder", `profiles/${user.id}`);

      // Upload to Cloudinary
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/ddgxymljp/image/upload`,
        formData
      );

      if (!response.data || !response.data.secure_url) {
        throw new Error("Failed to upload image to Cloudinary");
      }

      const cloudinaryUrl = response.data.secure_url;

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          avatar_url: cloudinaryUrl,
        })
        .eq("id", user.id);

      if (updateError) {
        throw updateError;
      }

      setAvatarUrl(cloudinaryUrl);
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

  return (
    <div className="flex flex-col sm:flex-row gap-6 items-start mb-6 w-full overflow-hidden">
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
  );
};

export default ProfileForm;
