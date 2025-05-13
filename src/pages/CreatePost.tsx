
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Upload } from "lucide-react";

const postSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title is too long"),
  description: z.string().max(500, "Description is too long").optional(),
  image: z.any()
    .refine(files => files?.length === 1, "An image is required")
    .refine(
      files => files?.[0]?.size <= 5000000, // 5MB
      "Max file size is 5MB"
    )
    .refine(
      files => ["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(files?.[0]?.type),
      "Only .jpg, .jpeg, .png and .webp formats are supported"
    ),
});

type PostFormValues = z.infer<typeof postSchema>;

const CreatePost = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const form = useForm<PostFormValues>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  const onImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Create preview URL for the selected image
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      form.setValue("image", event.target.files);
    }
  };
  
  const onSubmit = async (values: PostFormValues) => {
    if (!user || !profile?.family_id) {
      toast({
        title: "Error",
        description: "You must be logged in and part of a family to post.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const file = values.image[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `media/${fileName}`;
      
      console.log("Starting upload of file:", fileName, "size:", file.size, "type:", file.type);
      
      // Upload image to storage with explicit content type
      const { data, error: uploadError } = await supabase
        .storage
        .from('family-media')
        .upload(filePath, file, {
          contentType: file.type,
          cacheControl: '3600',
          upsert: false
        });
      
      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw uploadError;
      }
      
      console.log("Upload successful:", data);
      
      // Get public URL for the uploaded image
      const { data: { publicUrl } } = supabase
        .storage
        .from('family-media')
        .getPublicUrl(filePath);
      
      const now = new Date().toISOString();
      
      // Create media record
      const { data: mediaData, error: mediaError } = await supabase
        .from('media')
        .insert({
          title: values.title,
          description: values.description || null,
          url: publicUrl,
          user_id: user.id,
          family_id: profile.family_id,
          date_uploaded: now
        })
        .select();
      
      if (mediaError) {
        console.error("Media record error:", mediaError);
        throw mediaError;
      }
      
      console.log("Media record created:", mediaData);
      
      toast({
        title: "Success!",
        description: "Your moment has been shared with your family.",
        variant: "success",
      });
      
      navigate("/feed");
    } catch (error: any) {
      console.error("Error in form submission:", error);
      toast({
        title: "Error sharing moment",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout title="Create Post" requireAuth={true}>
      <div className="container max-w-2xl mx-auto px-4 py-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Share Today's Moment</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="My special moment" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Share more about this moment..."
                          className="resize-none"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="image"
                  render={() => (
                    <FormItem>
                      <FormLabel>Image</FormLabel>
                      <FormControl>
                        <div className="flex flex-col gap-4">
                          <Input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={onImageChange}
                            className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                          />
                          
                          {previewUrl && (
                            <div className="mt-4 max-h-[400px] overflow-hidden rounded-lg">
                              <img 
                                src={previewUrl} 
                                alt="Preview" 
                                className="w-full h-auto object-contain"
                              />
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Share with Family
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default CreatePost;
