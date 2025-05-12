
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/components/ui/use-toast";
import { Media } from "@/types/media";

export function useFeed() {
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();
  const [hasPostedToday, setHasPostedToday] = useState(false);

  // Fetch feed data (media posts from family members)
  const { data: feedItems, isLoading, error } = useQuery({
    queryKey: ["feed", profile?.family_id],
    queryFn: async () => {
      if (!profile?.family_id || !user?.id) {
        return [];
      }

      // Query media items for the family, with latest first
      const { data, error } = await supabase
        .from("media")
        .select(`
          *,
          profile:profiles(name, avatar_url)
        `)
        .eq("family_id", profile.family_id)
        .order("date_uploaded", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      // Check if user has posted today
      const today = new Date().toISOString().split("T")[0];
      const userPostedToday = data.some(
        (item) => item.user_id === user.id && item.date_uploaded === today
      );
      setHasPostedToday(userPostedToday);

      // Get likes for all media items using our RPC function
      if (data.length === 0) return [];

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

      return processedData as Media[];
    },
    enabled: !!profile?.family_id && !!user?.id,
  });

  // Handle like/unlike
  const likeMutation = useMutation({
    mutationFn: async ({ mediaId, isLiked }: { mediaId: string, isLiked: boolean }) => {
      if (isLiked) {
        // Unlike - delete the like
        const { error } = await supabase
          .from('likes')
          .delete()
          .match({ user_id: user?.id, media_id: mediaId });
        
        if (error) throw error;
      } else {
        // Like - insert new like
        const { error } = await supabase
          .from('likes')
          .insert({ user_id: user?.id, media_id: mediaId });
        
        if (error) throw error;
      }
    },
    onSuccess: (_, variables) => {
      // Update the cache optimistically
      queryClient.setQueryData<Media[]>(["feed", profile?.family_id], (oldData) => {
        if (!oldData) return [];
        
        return oldData.map(item => {
          if (item.id === variables.mediaId) {
            const likeDelta = variables.isLiked ? -1 : 1;
            return {
              ...item,
              likes_count: (item.likes_count || 0) + likeDelta,
              is_liked: !variables.isLiked
            };
          }
          return item;
        });
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update like status",
        variant: "destructive",
      });
    }
  });

  // Handle like/unlike button click
  const handleLikeToggle = (mediaId: string, isLiked: boolean) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to like posts",
        variant: "default",
      });
      return;
    }
    
    likeMutation.mutate({ mediaId, isLiked });
  };

  // Set up real-time subscription for likes
  useEffect(() => {
    if (!profile?.family_id) return;

    const channel = supabase
      .channel("likes-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "likes",
        },
        () => {
          // Refetch feed data when a new like is added
          queryClient.invalidateQueries({ queryKey: ["feed", profile?.family_id] });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "likes",
        },
        () => {
          // Refetch feed data when a like is removed
          queryClient.invalidateQueries({ queryKey: ["feed", profile?.family_id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.family_id, queryClient]);

  if (error) {
    toast({
      title: "Error",
      description: "Failed to load feed. Please try again later.",
      variant: "destructive",
    });
  }

  return {
    feedItems,
    isLoading,
    error,
    hasPostedToday,
    handleLikeToggle,
    likeMutation,
  };
}
