
import { useState } from 'react';
import { Heart, MessageCircle, Pencil, Trash, FileDown, Maximize } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Media } from '@/types/media';
import { ProfileAvatar } from '@/components/profile/ProfileAvatar';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface MediaContentProps {
  media: Media;
  canEdit: boolean;
  canDelete: boolean;
  onEditClick: () => void;
  onDeleteClick: () => void;
  onFullscreenClick: () => void;
  user: any; // Using any for simplicity, ideally should be properly typed
}

export function MediaContent({
  media,
  canEdit,
  canDelete,
  onEditClick,
  onDeleteClick,
  onFullscreenClick,
  user
}: MediaContentProps) {
  const queryClient = useQueryClient();
  
  // Check if media is a video
  const isVideo = media?.url?.match(/\.(mp4|webm|ogg)$/i);
  
  // Handle like/unlike
  const likeMutation = useMutation({
    mutationFn: async ({ mediaId, isLiked }: { mediaId: string, isLiked: boolean }) => {
      if (isLiked) {
        // Unlike - delete the like
        const { error } = await supabase
          .from('likes')
          .delete()
          .match({ 
            user_id: user?.id, 
            media_id: mediaId 
          });
        
        if (error) throw error;
      } else {
        // Like - insert new like
        const { error } = await supabase
          .from('likes')
          .insert({
            user_id: user?.id,
            media_id: mediaId
          });
        
        if (error) throw error;
      }
    },
    onSuccess: (_, variables) => {
      // Update the cache optimistically for both feed and gallery
      ["feed", "gallery"].forEach(cacheKey => {
        queryClient.setQueryData<Media[]>([cacheKey, media.profile?.family_id], (oldData) => {
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
      });
    },
    onError: (error) => {
      toast({
        description: "Failed to update like status",
        variant: "destructive",
      });
    }
  });

  // Handle like/unlike button click
  const handleLikeToggle = (mediaId: string, isLiked: boolean) => {
    if (!user) {
      toast({
        description: "Please sign in to like posts",
      });
      return;
    }
    
    likeMutation.mutate({ mediaId, isLiked });
  };

  // Handle download
  const handleDownload = () => {
    if (!media) return;
    
    // Create a temporary anchor element
    const link = document.createElement('a');
    link.href = media.url;
    
    // Set the download attribute with a filename
    // Extract the filename from the URL or use the title/default
    const filename = media.title || 
                     media.url.split('/').pop() || 
                     'download' + (isVideo ? '.mp4' : '.jpg');
    
    link.setAttribute('download', filename);
    
    // Append to the document temporarily
    document.body.appendChild(link);
    
    // Trigger the download
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    
    toast({
      description: "Download started",
    });
  };

  return (
    <div className="grid gap-4 md:grid-cols-5">
      {/* Image column */}
      <div className="md:col-span-3 relative">
        {isVideo ? (
          <video 
            src={media.url} 
            controls
            className="w-full h-auto rounded-md object-contain max-h-[500px]"
          />
        ) : (
          <div className="relative group">
            <img 
              src={media.url} 
              alt={media.title} 
              className="w-full h-auto rounded-md object-contain max-h-[500px] cursor-pointer" 
              onClick={onFullscreenClick}
            />
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button 
                size="sm" 
                variant="secondary" 
                className="rounded-full p-2 h-8 w-8"
                onClick={onFullscreenClick}
              >
                <Maximize className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
        
        {/* Media action buttons */}
        <div className="flex justify-end mt-2 space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="flex items-center gap-1"
          >
            <FileDown className="h-4 w-4" />
            <span>Download</span>
          </Button>
        </div>
      </div>
      
      {/* Info and comments column */}
      <div className="md:col-span-2 space-y-4 max-h-[500px] overflow-y-auto">
        {/* Post info */}
        <div className="flex items-center gap-3">
          <ProfileAvatar profile={media.profile} />
          <div>
            <p className="font-medium">{media.profile?.name}</p>
            <p className="text-xs text-gray-500">
              {new Date(media.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
        
        {/* Description */}
        {media.description && (
          <p className="text-gray-700 dark:text-gray-300">{media.description}</p>
        )}
        
        {/* Action buttons */}
        <div className="flex justify-between">
          <div className="flex gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              className={`flex items-center gap-1 ${media.is_liked ? 'text-red-500' : ''}`}
              onClick={() => handleLikeToggle(media.id, !!media.is_liked)}
              disabled={likeMutation.isPending}
            >
              <Heart className={`h-4 w-4 ${media.is_liked ? 'fill-current' : ''}`} />
              <span>{media.likes_count || 0} {media.likes_count === 1 ? 'Like' : 'Likes'}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-1"
              // Comment functionality is disabled
              disabled={true}
            >
              <MessageCircle className="h-4 w-4" />
              <span>Comments</span>
            </Button>
          </div>

          {/* Edit/Delete buttons */}
          <div className="flex gap-2">
            {canEdit && (
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-1"
                onClick={onEditClick}
              >
                <Pencil className="h-4 w-4" />
                <span className="hidden sm:inline">Edit</span>
              </Button>
            )}
            
            {canDelete && (
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                onClick={onDeleteClick}
              >
                <Trash className="h-4 w-4" />
                <span className="hidden sm:inline">Delete</span>
              </Button>
            )}
          </div>
        </div>
        
        {/* Comments Section Placeholder - disabled */}
        <div className="mt-4 p-4 border border-dashed rounded-md bg-gray-50 dark:bg-gray-900">
          <p className="text-center text-gray-500 dark:text-gray-400">
            Comments are temporarily disabled
          </p>
        </div>
      </div>
    </div>
  );
}
