
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/components/ui/use-toast';
import { Media } from '@/types/media';
import { MediaEditForm } from './MediaEditForm';
import { CommentSection } from '../comments/CommentSection';
import { MediaFullscreenView } from './MediaFullscreenView';
import { MediaPreview } from './MediaPreview';
import { MediaInfo } from './MediaInfo';
import { MediaActions } from './MediaActions';

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
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [fullscreenView, setFullscreenView] = useState(false);

  // Check if user can edit the media (only the creator can edit)
  const canEdit = media?.user_id === user?.id;
  
  // Check if user can delete the media (creator or admin can delete)
  const canDelete = media?.user_id === user?.id || profile?.is_admin === true;

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

  // Handler functions
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

  const handleDelete = () => {
    if (!media) return;
    deleteMutation.mutate(media.id);
    setShowDeleteDialog(false);
  };

  const handleEditSuccess = () => {
    setIsEditing(false);
    if (onMediaUpdated) onMediaUpdated();
    
    toast({
      title: "Success",
      description: "Photo details updated successfully",
    });
  };

  const handleDownload = () => {
    if (!media) return;
    
    // Create a temporary anchor element
    const link = document.createElement('a');
    link.href = media.url;
    
    // Set the download attribute with a filename
    const isVideo = media.url?.match(/\.(mp4|webm|ogg)$/i);
    const filename = media.title || 
                     media.url.split('/').pop() || 
                     'download' + (isVideo ? '.mp4' : '.jpg');
    
    link.setAttribute('download', filename);
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Success",
      description: "Download started",
    });
  };

  if (!media) return null;

  return (
    <>
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
              {/* Media preview section */}
              <MediaPreview 
                media={media}
                onFullscreenView={() => setFullscreenView(true)}
                onDownload={handleDownload}
              />
              
              {/* Info and comments column */}
              <div className="md:col-span-2 space-y-4 max-h-[500px] overflow-y-auto">
                {/* Post info */}
                <MediaInfo media={media} />
                
                {/* Action buttons */}
                <MediaActions 
                  media={media}
                  onLike={handleLikeToggle}
                  onCommentFocus={() => {}}
                  onEdit={() => setIsEditing(true)}
                  onDelete={() => setShowDeleteDialog(true)}
                  canEdit={canEdit}
                  canDelete={canDelete}
                  isLikePending={likeMutation.isPending}
                />
                
                {/* Comments */}
                <CommentSection mediaId={media.id} />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Fullscreen view component */}
      <MediaFullscreenView
        open={fullscreenView}
        onOpenChange={setFullscreenView}
        mediaUrl={media.url}
        mediaTitle={media.title}
        onDownload={handleDownload}
      />

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete photo</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this photo? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
