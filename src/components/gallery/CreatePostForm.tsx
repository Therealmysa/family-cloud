
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Upload, X } from "lucide-react";

const postSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title is too long"),
  description: z.string().max(500, "Description is too long").optional(),
  media: z.any()
    .refine(files => files?.length === 1, "A file is required")
    .refine(
      files => files?.[0]?.size <= 50000000, // 50MB (increased from 20MB)
      "Max file size is 50MB"
    )
    .refine(
      files => ["image/jpeg", "image/jpg", "image/png", "image/webp", "video/mp4", "video/webm", "video/ogg"].includes(files?.[0]?.type),
      "Only .jpg, .jpeg, .png, .webp, .mp4, .webm and .ogg formats are supported"
    ),
});

type PostFormValues = z.infer<typeof postSchema>;

interface CreatePostFormProps {
  userId: string;
  familyId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export const CreatePostForm = ({ userId, familyId, onSuccess, onCancel }: CreatePostFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const form = useForm<PostFormValues>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  // Handle media input change
  const onMediaChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Create preview URL for the selected media
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      form.setValue("media", event.target.files);
    }
  };

  // Reset the form
  const resetForm = () => {
    form.reset();
    setPreviewUrl(null);
    onCancel();
  };

  // Handle form submission
  const onSubmit = async (values: PostFormValues) => {
    if (!userId || !familyId) {
      toast({
        title: "Error",
        description: "You must be logged in and part of a family to post.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const file = values.media[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `media/${fileName}`;
      
      console.log("Starting upload of file:", fileName, "size:", file.size, "type:", file.type);
      
      // Upload media to storage with content type specified
      const { data, error: uploadError } = await supabase
        .storage
        .from('family-media')
        .upload(filePath, file, {
          contentType: file.type, // Explicitly set content type
          cacheControl: '3600',
          upsert: false
        });
      
      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw uploadError;
      }
      
      console.log("Upload successful:", data);
      
      // Get public URL for the uploaded media
      const { data: { publicUrl } } = supabase
        .storage
        .from('family-media')
        .getPublicUrl(filePath);

      // Check if media is a video and create a thumbnail
      const isVideo = file.type.startsWith('video/');
      let thumbnailUrl = null;
      
      if (isVideo) {
        // For videos, we'll use a timestamp URL parameter as a simple way to ensure the video loads a poster frame
        thumbnailUrl = `${publicUrl}#t=0.1`;
      }
      
      const now = new Date().toISOString();
      
      // Create media record
      const { data: mediaData, error: mediaError } = await supabase
        .from('media')
        .insert({
          title: values.title,
          description: values.description || null,
          url: publicUrl,
          user_id: userId,
          family_id: familyId,
          thumbnail_url: thumbnailUrl,
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
        variant: "default",
      });
      
      resetForm();
      onSuccess();
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
    <div className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Share a Memory</h2>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={resetForm}
          className="flex items-center gap-2"
        >
          <X className="h-4 w-4" />
          <span>Cancel</span>
        </Button>
      </div>
      
      <Card>
        <CardContent className="pt-6">
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
                name="media"
                render={() => (
                  <FormItem>
                    <FormLabel>Media (Image or Video)</FormLabel>
                    <FormControl>
                      <div className="flex flex-col gap-4">
                        <Input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/ogg"
                          onChange={onMediaChange}
                          className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                        />
                        
                        {previewUrl && (
                          <div className="mt-4 max-w-full overflow-hidden rounded-lg">
                            {form.getValues("media")?.[0]?.type.startsWith('video/') ? (
                              <video 
                                src={previewUrl} 
                                controls
                                className="w-full h-auto max-h-[600px] object-contain"
                              />
                            ) : (
                              <img 
                                src={previewUrl} 
                                alt="Preview" 
                                className="w-full h-auto max-h-[600px] object-contain"
                              />
                            )}
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
  );
};
