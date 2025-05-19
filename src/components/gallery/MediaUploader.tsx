
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Upload, X } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { isImageFile, isVideoFile } from "@/utils/supabaseHelpers";
import axios from "axios";

interface MediaUploaderProps {
  userId: string;
  familyId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export const MediaUploader = ({
  userId,
  familyId,
  onSuccess,
  onCancel,
}: MediaUploaderProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { t } = useLanguage();

  // Handle file drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selectedFile = e.dataTransfer.files[0];
      handleFileSelected(selectedFile);
    }
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      handleFileSelected(selectedFile);
    }
  };

  // Process selected file
  const handleFileSelected = (selectedFile: File) => {
    // Check file type
    if (!isImageFile(selectedFile) && !isVideoFile(selectedFile)) {
      toast({
        title: "Unsupported file type",
        description: "Please upload an image or video file.",
        variant: "destructive"
      });
      return;
    }
    
    // Check file size (100MB limit)
    if (selectedFile.size > 100 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "File size must be less than 100MB.",
        variant: "destructive"
      });
      return;
    }
    
    setFile(selectedFile);
    
    // Create preview URL
    const fileReader = new FileReader();
    fileReader.onload = () => {
      setPreviewUrl(fileReader.result as string);
    };
    fileReader.readAsDataURL(selectedFile);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a file to upload.",
        variant: "destructive"
      });
      return;
    }
    
    if (!title) {
      toast({
        title: "Title required",
        description: "Please add a title for your media.",
        variant: "destructive"
      });
      return;
    }
    
    setUploading(true);
    
    try {
      // Get the session for authentication
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session?.access_token) {
        throw new Error("Authentication required");
      }

      // Create form data for upload
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", `families/${familyId}`);
      
      // Upload to Cloudinary through our edge function
      const response = await fetch(
        `${window.location.origin}/functions/v1/cloudinary-upload`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${sessionData.session.access_token}`,
          },
          body: formData,
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Upload failed");
      }
      
      const cloudinaryData = await response.json();
      
      if (!cloudinaryData.url) {
        throw new Error("Failed to get upload URL");
      }
      
      // Insert into 'media' table
      const { error: insertError } = await supabase
        .from('media')
        .insert({
          title: title,
          description: description || null,
          url: cloudinaryData.url,
          family_id: familyId,
          user_id: userId,
          media_type: isImageFile(file) ? 'image' : 'video',
          date_uploaded: new Date().toISOString()
        });
      
      if (insertError) {
        throw insertError;
      }
      
      toast({
        title: "Upload successful",
        description: "Your media has been uploaded.",
      });
      
      onSuccess();
    } catch (error) {
      console.error('Error uploading:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "There was an error uploading your media. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="w-full mb-6">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">{t('gallery.upload')}</h2>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onCancel}
            className="rounded-full p-2"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <form onSubmit={handleSubmit}>
          {!file ? (
            <div
              className={`border-2 border-dashed rounded-md p-8 text-center cursor-pointer transition-colors ${
                dragging 
                  ? "border-primary bg-primary/5" 
                  : "border-gray-300 dark:border-gray-700 hover:border-primary hover:bg-gray-50 dark:hover:bg-gray-800/50"
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-base font-medium mb-1">
                {t('gallery.drag_drop')}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('gallery.file_types')}
              </p>
              <input
                id="file-upload"
                type="file"
                accept="image/jpeg,image/png,image/gif,video/mp4,video/webm,video/ogg"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          ) : (
            <div className="space-y-4">
              {previewUrl && (
                <div className="relative mb-4 w-full max-h-[300px] overflow-hidden flex justify-center bg-black/5 dark:bg-white/5 rounded-md">
                  {isImageFile(file) ? (
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="max-h-[300px] object-contain"
                    />
                  ) : (
                    <video
                      src={previewUrl}
                      controls
                      className="max-h-[300px] w-full"
                    />
                  )}
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    className="absolute top-2 right-2 rounded-full w-8 h-8 p-0 flex items-center justify-center"
                    onClick={() => {
                      setFile(null);
                      setPreviewUrl(null);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium mb-1">
                    Title *
                  </label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-medium mb-1">
                    Description
                  </label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                  />
                </div>
                
                <div className="flex gap-3 justify-end">
                  <Button type="button" variant="outline" onClick={onCancel}>
                    {t('common.cancel')}
                  </Button>
                  <Button type="submit" disabled={uploading}>
                    {uploading ? (
                      <>
                        <span className="animate-spin mr-2 inline-block h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                        {t('common.loading')}
                      </>
                    ) : (
                      t('common.save')
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
};
