
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/components/ui/use-toast";
import MainLayout from "@/components/layout/MainLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Calendar, User } from "lucide-react";
import { MediaDialog } from "@/components/media/MediaDialog";
import { Media } from "@/types/media";

const Gallery = () => {
  const { user, profile } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedImage, setSelectedImage] = useState<Media | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"all" | "byDate" | "byMember">("all");

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

      // Check if user has posted today
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

  return (
    <MainLayout title="Gallery" requireAuth={true}>
      <div className="container max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Family Gallery</h1>
          
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              placeholder="Search memories..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <Tabs defaultValue="all" className="mb-6" onValueChange={(value) => setViewMode(value as any)}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Photos</TabsTrigger>
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
                    {filteredMedia.map((item) => (
                      <div 
                        key={item.id} 
                        className="aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => handleOpenMedia(item)}
                      >
                        <img 
                          src={item.url} 
                          alt={item.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-8">
                    <p className="text-gray-500">No photos found</p>
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
                        {images.map((item) => (
                          <div 
                            key={item.id} 
                            className="aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => handleOpenMedia(item)}
                          >
                            <img 
                              src={item.url} 
                              alt={item.title}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center p-8">
                    <p className="text-gray-500">No photos found</p>
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
                        {member.images.map((item) => (
                          <div 
                            key={item.id} 
                            className="aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => handleOpenMedia(item)}
                          >
                            <img 
                              src={item.url} 
                              alt={item.title}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center p-8">
                    <p className="text-gray-500">No photos found</p>
                  </div>
                )}
              </TabsContent>
            </>
          )}
        </Tabs>

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
