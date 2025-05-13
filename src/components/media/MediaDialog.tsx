
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
import { Heart, MessageCircle, Pencil, Trash, Download, Maximize, Play } from 'lucide-react';
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
import { Sheet, SheetContent } from '@/components/ui/sheet';

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
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [fullscreenView, setFullscreenView] = useState(false);

  // Check if media is a video
  const isVideo = media?.url?.match(/\.(mp4|webm|ogg)$/i);

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
    deleteMutation.mutate(media.id);
    setShowDeleteDialog(false);
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

  // Handle download
  const handleDownload = () => {
    if (!media) return;
    
    const link = document.createElement('a');
    link.href = media.url;
    link.download = media.title || 'download';
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
                      onClick={() => setFullscreenView(true)}
                    />
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button 
                        size="sm" 
                        variant="secondary" 
                        className="rounded-full p-2 h-8 w-8"
                        onClick={() => setFullscreenView(true)}
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
                    <Download className="h-4 w-4" />
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
                        onClick={() => setShowDeleteDialog(true)}
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

      {/* Fullscreen view */}
      <Sheet open={fullscreenView} onOpenChange={setFullscreenView}>
        <SheetContent side="bottom" className="h-screen p-0 max-w-full flex items-center justify-center bg-black/95">
          <div className="relative w-full h-full flex items-center justify-center overflow-auto p-4">
            <img 
              src={media.url} 
              alt={media.title} 
              className="max-w-full max-h-full object-contain"
            />
            <Button 
              variant="outline" 
              size="sm" 
              className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white border-none"
              onClick={() => setFullscreenView(false)}
            >
              Close
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="absolute bottom-4 right-4 bg-black/50 hover:bg-black/70 text-white border-none"
              onClick={handleDownload}
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </SheetContent>
      </Sheet>

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
