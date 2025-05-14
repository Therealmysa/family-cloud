import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@radix-ui/react-toast";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Camera } from "lucide-react";
import { safeTypeCast } from '@/utils/supabaseHelpers';

export function CreatePostForm({ 
  userId, 
  familyId, 
  onSuccess, 
  onCancel 
}: { 
  userId: string; 
  familyId: string; 
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isVideo, setIsVideo] = useState(false);

  const form = useForm<{
    title: string;
    description: string;
  }>({
    defaultValues: {
      title: '',
      description: '',
    },
  });

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) {
      return;
    }

    // Check if it's an image or video
    const fileType = selectedFile.type;
    const isVideoFile = fileType.startsWith('video/');
    setIsVideo(isVideoFile);

    // Preview
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreview(objectUrl);
    setFile(selectedFile);

    // Set default title from filename
    const fileName = selectedFile.name.split('.')[0];
    form.setValue('title', fileName);

    // Clean up the URL when component unmounts
    return () => URL.revokeObjectURL(objectUrl);
  };

  // Upload file to Supabase storage
  const uploadMedia = async (values: { title: string; description: string }) => {
    if (!file || !userId || !familyId) {
      toast({
        description: "Missing required information",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Generate a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;

      // Upload to storage
      const { error: uploadError, data } = await supabase.storage
        .from('media')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          onUploadProgress: (progress) => {
            const percent = Math.round((progress.loaded / progress.total) * 100);
            setUploadProgress(percent);
          },
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);

      // Save media info to database
      const { error: dbError } = await supabase
        .from('media')
        .insert(safeTypeCast('media', {
          title: values.title,
          description: values.description,
          url: publicUrl,
          user_id: userId,
          family_id: familyId,
        }));

      if (dbError) throw dbError;

      toast({
        description: "Media uploaded successfully",
      });
      
      onSuccess();
    } catch (error) {
      console.error("Error uploading:", error);
      toast({
        description: "Failed to upload media",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Create a Post</CardTitle>
        <CardDescription>Share a new photo or video with your family.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="picture">
            <Camera className="mr-2 h-4 w-4" />
            <span>Select a file</span>
          </Label>
          <Input
            id="picture"
            type="file"
            onChange={handleFileChange}
            disabled={isUploading}
          />
          {preview && (
            <div className="relative">
              {isVideo ? (
                <video
                  src={preview}
                  controls
                  className="w-full aspect-video rounded-md"
                />
              ) : (
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full rounded-md aspect-square object-cover"
                />
              )}
              {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-md">
                  <Progress value={uploadProgress} className="w-1/2" />
                </div>
              )}
            </div>
          )}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            placeholder="My awesome photo"
            {...form.register('title')}
            disabled={isUploading}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Add a description to your post"
            className="resize-none"
            {...form.register('description')}
            disabled={isUploading}
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="ghost" onClick={onCancel} disabled={isUploading}>
          Cancel
        </Button>
        <Button onClick={form.handleSubmit(uploadMedia)} disabled={isUploading || !file}>
          {isUploading ? `Uploading... (${uploadProgress}%)` : "Upload"}
        </Button>
      </CardFooter>
    </Card>
  );
}
