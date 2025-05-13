
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/components/ui/use-toast";
import MainLayout from "@/components/layout/MainLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Calendar, User, Play, PlusCircle, X, Loader2, Upload } from "lucide-react";
import { MediaDialog } from "@/components/media/MediaDialog";
import { Media } from "@/types/media";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

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

const Gallery = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedImage, setSelectedImage] = useState<Media | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"all" | "byDate" | "byMember">("all");
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const isMobile = useIsMobile();

  const form = useForm<PostFormValues>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  // Group images by date
  const groupByDate = (images: Media[]) => {
    const grouped: Record<string, Media[]> = {};
    images.forEach(img => {
      const date = img.date_uploaded;
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(img);
    });
    return Object.entries(grouped)
      .sort(([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime());
  };

  // Group images by family member
  const groupByMember = (images: Media[]) => {
    const grouped: Record<string, { name: string, avatar: string | null, images: Media[] }> = {};
    images.forEach(img => {
      if (img.profile) {
        const userId = img.user_id;
        if (!grouped[userId]) {
          grouped[userId] = {
            name: img.profile.name,
            avatar: img.profile.avatar_url,
            images: []
          };
        }
        grouped[userId].images.push(img);
      }
    });
    return Object.values(grouped);
  };

  const { data: mediaItems, isLoading, refetch } = useQuery({
    queryKey: ["gallery", profile?.family_id],
    queryFn: async () => {
      if (!profile?.family_id || !user?.id) return [];

      // Query media items for the family, including likes information
      const { data, error } = await supabase
        .from("media")
        .select(`
          *,
          profile:profiles(id, name, avatar_url, family_id)
        `)
        .eq("family_id", profile.family_id)
        .order("date_uploaded", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      if (data.length === 0) return [];

      // Get likes for all media items using our RPC function
      const mediaIds = data.map(item => item.id);
      const { data: likesData, error: likesError } = await supabase
        .rpc('get_likes_for_media', { 
          media_ids: mediaIds,
          current_user_id: user.id
        });

      if (likesError) {
        console.error("Error fetching likes:", likesError);
      }

      // Process media items to add like information
      const processedData = data.map(item => {
        const likeInfo = likesData && Array.isArray(likesData) 
          ? likesData.find(like => like.media_id === item.id) 
          : undefined;
          
        return {
          ...item,
          likes_count: likeInfo?.likes_count || 0,
          is_liked: likeInfo?.is_liked || false
        };
      });

      return processedData as unknown as Media[];
    },
    enabled: !!profile?.family_id && !!user?.id,
  });

  // Filter media items based on search term
  const filteredMedia = mediaItems?.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  const groupedByDate = groupByDate(filteredMedia);
  const groupedByMember = groupByMember(filteredMedia);

  // Handle opening the media dialog
  const handleOpenMedia = (media: Media) => {
    setSelectedImage(media);
    setDialogOpen(true);
  };

  // Handle dialog close and refresh data if needed
  const handleDialogClose = (needsRefresh: boolean) => {
    setDialogOpen(false);
    setSelectedImage(null);
    if (needsRefresh) {
      refetch();
    }
  };

  // Reset the create post form
  const resetCreatePostForm = () => {
    form.reset();
    setPreviewUrl(null);
    setShowCreatePost(false);
  };

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

  // Handle form submission for creating a new post
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
      const file = values.media[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `media/${fileName}`;
      
      // Upload media to storage
      const { error: uploadError } = await supabase
        .storage
        .from('family-media')
        .upload(filePath, file);
      
      if (uploadError) {
        throw uploadError;
      }
      
      // Get public URL for the uploaded media
      const { data: { publicUrl } } = supabase
        .storage
        .from('family-media')
        .getPublicUrl(filePath);

      // Check if media is a video and create a thumbnail
      const isVideo = file.type.startsWith('video/');
      let thumbnailUrl = null;
      
      if (isVideo) {
        // For videos, we'll create a placeholder thumbnail or use first frame
        // In a real app with server-side processing, you'd generate an actual thumbnail
        // For now, we'll use a timestamp URL parameter as a simple way to ensure the video loads a poster frame
        thumbnailUrl = `${publicUrl}#t=0.1`;
      }
      
      // Create media record
      const { error: mediaError } = await supabase
        .from('media')
        .insert({
          title: values.title,
          description: values.description || null,
          url: publicUrl,
          user_id: user.id,
          family_id: profile.family_id,
          thumbnail_url: thumbnailUrl,
        });
      
      if (mediaError) {
        throw mediaError;
      }
      
      toast({
        title: "Success!",
        description: "Your moment has been shared with your family.",
        variant: "default",
      });
      
      resetCreatePostForm();
      refetch();
    } catch (error: any) {
      toast({
        title: "Error sharing moment",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if an item is a video
  const isVideo = (url: string) => {
    return url.match(/\.(mp4|webm|ogg)$/i) !== null;
  };

  // Render a media item thumbnail
  const renderMediaItem = (item: Media) => {
    return (
      <div 
        key={item.id} 
        className="aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity relative"
        onClick={() => handleOpenMedia(item)}
      >
        {isVideo(item.url) ? (
          <div className="relative h-full w-full">
            <video 
              src={item.url} 
              className="w-full h-full object-cover"
              poster={item.thumbnail_url}
              preload="metadata"
            />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <Play className="h-12 w-12 text-white" />
            </div>
          </div>
        ) : (
          <img 
            src={item.url} 
            alt={item.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        )}
      </div>
    );
  };

  return (
    <MainLayout title="Gallery" requireAuth={true}>
      <div className="container max-w-6xl mx-auto px-4 py-6">
        {showCreatePost ? (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Share a Memory</h2>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={resetCreatePostForm}
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
        ) : (
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Family Gallery</h1>
            
            <div className="flex gap-4 w-full md:w-auto">
              <div className="relative w-full md:w-72">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  placeholder="Search memories..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <Button 
                onClick={() => setShowCreatePost(true)}
                className={`flex items-center gap-2 shrink-0 ${isMobile ? 'py-5' : ''}`}
                variant="primary"
                size={isMobile ? "default" : "default"}
              >
                <PlusCircle className="h-4 w-4" />
                <span className={isMobile ? "hidden" : "inline"}>Add Media</span>
              </Button>
            </div>
          </div>
        )}

        {!showCreatePost && (
          <Tabs defaultValue="all" className="mb-6" onValueChange={(value) => setViewMode(value as any)}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">All Media</TabsTrigger>
              <TabsTrigger value="byDate">By Date</TabsTrigger>
              <TabsTrigger value="byMember">By Family Member</TabsTrigger>
            </TabsList>

            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className="aspect-square bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : (
              <>
                <TabsContent value="all" className="mt-0">
                  {filteredMedia.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {filteredMedia.map((item) => renderMediaItem(item))}
                    </div>
                  ) : (
                    <div className="text-center p-8">
                      <p className="text-gray-500">No media found</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="byDate" className="mt-0 space-y-8">
                  {groupedByDate.length > 0 ? (
                    groupedByDate.map(([date, images]) => (
                      <div key={date} className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Calendar size={18} className="text-purple-500" />
                          <h3 className="font-semibold">
                            {new Date(date).toLocaleDateString(undefined, { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </h3>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          {images.map((item) => renderMediaItem(item))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center p-8">
                      <p className="text-gray-500">No media found</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="byMember" className="mt-0 space-y-8">
                  {groupedByMember.length > 0 ? (
                    groupedByMember.map((member, index) => (
                      <div key={index} className="space-y-3">
                        <div className="flex items-center gap-2">
                          <User size={18} className="text-purple-500" />
                          <h3 className="font-semibold">{member.name}</h3>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          {member.images.map((item) => renderMediaItem(item))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center p-8">
                      <p className="text-gray-500">No media found</p>
                    </div>
                  )}
                </TabsContent>
              </>
            )}
          </Tabs>
        )}

        {selectedImage && (
          <MediaDialog 
            media={selectedImage} 
            open={dialogOpen} 
            onOpenChange={(open) => {
              if (!open) handleDialogClose(false);
            }}
            onMediaUpdated={() => refetch()}
            onMediaDeleted={() => {
              handleDialogClose(true);
            }}
            familyId={profile?.family_id} 
          />
        )}
      </div>
    </MainLayout>
  );
};

export default Gallery;
