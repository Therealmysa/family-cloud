
import { useState, useCallback } from "react";
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
import { Loader2, Upload, X, ImagePlus, FileVideo } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { asMediaInsert } from "@/utils/supabaseHelpers";
import { v4 as uuidv4 } from "uuid";

const postSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title is too long"),
  description: z.string().max(500, "Description is too long").optional()
});

// Helper functions to check file types
const isImageFile = (file: File): boolean => {
  return file.type.startsWith('image/');
};

const isVideoFile = (file: File): boolean => {
  return file.type.startsWith('video/');
};

export function MediaUploader({ userId, familyId, onSuccess, onCancel }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const form = useForm({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: "",
      description: ""
    }
  });

  // Setup dropzone for file uploads
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      if (!isImageFile(file) && !isVideoFile(file)) {
        toast({
          title: "Invalid file type",
          description: "Please upload a valid image or video file",
          variant: "destructive"
        });
        return;
      }
      setMediaFile(file);
      // Create preview
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.webp'],
      'video/*': ['.mp4', '.webm', '.ogg']
    },
    maxSize: 50 * 1024 * 1024,
    maxFiles: 1
  });

  // Clear selected media
  const clearMedia = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setMediaFile(null);
    setPreviewUrl(null);
  };

  // Reset the form
  const resetForm = () => {
    form.reset();
    clearMedia();
    onCancel();
  };

  // Handle form submission
  const onSubmit = async (values: any) => {
    if (!userId || !familyId || !mediaFile) {
      toast({
        title: "Error",
        description: "Missing required information. Please try again.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Generate a unique filename using UUID
      const fileExt = mediaFile.name.split('.').pop() || '';
      const fileName = `${uuidv4()}-${Date.now()}.${fileExt}`;
      const filePath = `media/${fileName}`;

      console.log("Uploading file:", filePath);
      console.log("File type:", mediaFile.type);

      // Explicitly set content type and cache control
      const uploadOptions = {
        contentType: mediaFile.type,
        cacheControl: '3600',
        upsert: false
      };

      // Upload media to storage bucket
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('family-media')
        .upload(filePath, mediaFile, uploadOptions);

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      console.log("Upload successful:", uploadData);

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('family-media')
        .getPublicUrl(filePath);

      console.log("Public URL:", publicUrlData.publicUrl);

      // Check if media is a video and create a thumbnail
      const isVideo = isVideoFile(mediaFile);
      let thumbnailUrl = null;
      
      if (isVideo) {
        // For videos, we'll use a timestamp URL parameter as a simple way to ensure the video loads a poster frame
        thumbnailUrl = `${publicUrlData.publicUrl}#t=0.1`;
      }

      // Create media record
      const { error: mediaError } = await supabase
        .from('media')
        .insert(asMediaInsert({
          title: values.title,
          description: values.description || null,
          url: publicUrlData.publicUrl,
          user_id: userId,
          family_id: familyId,
          thumbnail_url: thumbnailUrl
        }));

      if (mediaError) {
        console.error("Media record error:", mediaError);
        throw new Error(`Database error: ${mediaError.message}`);
      }

      // Clean up the preview URL
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      toast({
        title: "Success!",
        description: "Your moment has been shared with your family.",
        variant: "default"
      });

      form.reset();
      clearMedia();
      onSuccess();
    } catch (error: any) {
      console.error("Error in form submission:", error);
      toast({
        title: "Error sharing moment",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive"
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
              {/* Title Field */}
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

              {/* Description Field */}
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

              {/* Media Upload */}
              <FormItem>
                <FormLabel>Media (Image or Video)</FormLabel>
                <FormControl>
                  {!mediaFile ? (
                    <div
                      {...getRootProps()}
                      className={`border-2 border-dashed rounded-md p-8 text-center cursor-pointer transition-colors ${
                        isDragActive
                          ? "border-primary bg-primary/5"
                          : "border-gray-300 hover:border-primary hover:bg-gray-50"
                      }`}
                    >
                      <input {...getInputProps()} />
                      <div className="flex flex-col items-center gap-2">
                        {isDragActive ? (
                          <ImagePlus className="h-10 w-10 text-primary/70" />
                        ) : (
                          <div className="flex gap-3">
                            <ImagePlus className="h-8 w-8 text-gray-400" />
                            <FileVideo className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium">
                            {isDragActive
                              ? "Drop the file here"
                              : "Drag and drop or click to select"}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            JPG, PNG, WEBP, MP4, WEBM or OGG (max 50MB)
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 max-w-full overflow-hidden rounded-lg relative">
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        className="absolute top-2 right-2 z-10 rounded-full p-1 w-8 h-8"
                        onClick={clearMedia}
                      >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Remove</span>
                      </Button>
                      {isVideoFile(mediaFile) ? (
                        <video
                          src={previewUrl || undefined}
                          controls
                          className="w-full h-auto max-h-[600px] object-contain"
                        />
                      ) : (
                        <img
                          src={previewUrl || undefined}
                          alt="Preview"
                          className="w-full h-auto max-h-[600px] object-contain"
                        />
                      )}
                    </div>
                  )}
                </FormControl>
                <FormMessage />
              </FormItem>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting || !mediaFile}
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
}
