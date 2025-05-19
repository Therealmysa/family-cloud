
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/components/ui/use-toast";
import MainLayout from "@/components/layout/MainLayout";
import { MediaDialog } from "@/components/media/MediaDialog";
import { Media } from "@/types/media";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLanguage } from "@/contexts/LanguageContext";

// Import our new components
import { MediaUploader } from "@/components/gallery/MediaUploader";
import { SearchBar } from "@/components/gallery/SearchBar";
import { GalleryView } from "@/components/gallery/GalleryView";

const Gallery = () => {
  const { user, profile } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedImage, setSelectedImage] = useState<Media | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"all" | "byDate" | "byMember">("all");
  const [showCreatePost, setShowCreatePost] = useState(false);
  const isMobile = useIsMobile();
  const { t } = useLanguage();

  const {
    data: mediaItems,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["gallery", profile?.family_id],
    queryFn: async () => {
      if (!profile?.family_id || !user?.id) return [];

      // Query media items for the family, including likes information
      const { data, error } = await supabase
        .from("media")
        .select(
          `
          *,
          profile:profiles(id, name, avatar_url, family_id)
        `
        )
        .eq("family_id", profile.family_id)
        .order("date_uploaded", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      if (data.length === 0) return [];

      // Get likes for all media items using our RPC function
      const mediaIds = data.map((item) => item.id);
      const { data: likesData, error: likesError } = await supabase.rpc(
        "get_likes_for_media",
        {
          media_ids: mediaIds,
          current_user_id: user.id,
        }
      );

      if (likesError) {
        console.error("Error fetching likes:", likesError);
      }

      // Process media items to add like information
      const processedData = data.map((item) => {
        const likeInfo =
          likesData && Array.isArray(likesData)
            ? likesData.find((like) => like.media_id === item.id)
            : undefined;

        return {
          ...item,
          likes_count: likeInfo?.likes_count || 0,
          is_liked: likeInfo?.is_liked || false,
        };
      });

      return processedData as unknown as Media[];
    },
    enabled: !!profile?.family_id && !!user?.id,
  });

  // Filter media items based on search term
  const filteredMedia =
    mediaItems?.filter(
      (item) =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.description &&
          item.description.toLowerCase().includes(searchTerm.toLowerCase()))
    ) || [];

  // Handle opening the media dialog
  const handleOpenMedia = (media: Media) => {
    setSelectedImage(media);
    setDialogOpen(true);
  };

  // Handle dialog close and refresh data if needed
  const handleDialogClose = (needsRefresh: boolean = false) => {
    setDialogOpen(false);
    setSelectedImage(null);
    if (needsRefresh) {
      refetch();
    }
  };

  // Handle media update
  const handleMediaUpdate = (updatedMedia: Media) => {
    if (selectedImage) {
      setSelectedImage(updatedMedia);
    }
  };

  return (
    <MainLayout title={t('nav.gallery')} requireAuth={true}>
      <div className="container max-w-6xl mx-auto px-4 py-6">
        {showCreatePost ? (
          <MediaUploader
            userId={user?.id || ""}
            familyId={profile?.family_id || ""}
            onSuccess={() => {
              setShowCreatePost(false);
              refetch();
            }}
            onCancel={() => setShowCreatePost(false)}
          />
        ) : (
          <SearchBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onAddClick={() => setShowCreatePost(true)}
            isMobile={isMobile}
          />
        )}

        {!showCreatePost && (
          <GalleryView
            isLoading={isLoading}
            filteredMedia={filteredMedia}
            onMediaClick={handleOpenMedia}
            viewMode={viewMode}
            onViewModeChange={(mode) => setViewMode(mode)}
          />
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
            onMediaUpdate={handleMediaUpdate}
            onClose={() => handleDialogClose()}
          />
        )}
      </div>
    </MainLayout>
  );
};

export default Gallery;
