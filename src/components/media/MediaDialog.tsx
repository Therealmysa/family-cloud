
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Heart, MessageCircle, Pencil, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CommentSection } from '../comments/CommentSection';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/components/ui/use-toast';
import { Media } from '@/types/media';
import { ProfileAvatar } from '@/components/profile/ProfileAvatar';
import { MediaEditForm } from './MediaEditForm';

interface MediaDialogProps {
  media: Media | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  familyId: string | null | undefined;
  onMediaUpdated?: () => void;
  onMediaDeleted?: () => void;
}

export function MediaDialog({ 
  media, 
  open, 
  onOpenChange,
  familyId,
  onMediaUpdated,
  onMediaDeleted
}: MediaDialogProps) {
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'comments'>('comments');
  const [isEditing, setIsEditing] = useState(false);

  // Check if user can edit or delete
  const canEdit = media?.user_id === user?.id;
  const canDelete = canEdit || profile?.is_admin;

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
      queryClient.setQueryData<Media[]>(["feed", familyId], (oldData) => {
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

      // Also update the gallery data if it exists
      queryClient.setQueryData<Media[]>(["gallery", familyId], (oldData) => {
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

  // Handle delete media
  const deleteMutation = useMutation({
    mutationFn: async (mediaId: string) => {
      const { error } = await supabase
        .from('media')
        .delete()
        .eq('id', mediaId);
        
      if (error) throw error;

      return mediaId;
    },
    onSuccess: (mediaId) => {
      // Update cache by removing the deleted item
      ["feed", "gallery"].forEach(cacheKey => {
        queryClient.setQueryData<Media[]>([cacheKey, familyId], (oldData) => {
          if (!oldData) return [];
          return oldData.filter(item => item.id !== mediaId);
        });
      });

      toast({
        title: "Success",
        description: "Photo has been deleted",
        variant: "default",
      });

      // Close dialog and notify parent
      onOpenChange(false);
      if (onMediaDeleted) onMediaDeleted();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete photo",
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

  // Handle delete confirmation
  const handleDelete = () => {
    if (!media) return;
    
    if (window.confirm("Are you sure you want to delete this photo? This action cannot be undone.")) {
      deleteMutation.mutate(media.id);
    }
  };

  // Handle edit mode toggle
  const handleEditSuccess = () => {
    setIsEditing(false);
    if (onMediaUpdated) onMediaUpdated();
    
    toast({
      title: "Success",
      description: "Photo details updated successfully",
    });
  };

  if (!media) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>{!isEditing && media.title}</DialogTitle>
        </DialogHeader>
        
        {isEditing ? (
          <MediaEditForm 
            media={media} 
            onCancel={() => setIsEditing(false)}
            onSuccess={handleEditSuccess}
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-5">
            {/* Image column */}
            <div className="md:col-span-3 relative">
              <img 
                src={media.url} 
                alt={media.title} 
                className="w-full h-auto rounded-md object-cover max-h-[500px]" 
              />
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
                    onClick={() => setActiveTab('comments')}
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
                      onClick={() => setIsEditing(true)}
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
                      onClick={handleDelete}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash className="h-4 w-4" />
                      <span className="hidden sm:inline">Delete</span>
                    </Button>
                  )}
                </div>
              </div>
              
              {/* Comments */}
              <CommentSection mediaId={media.id} />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
