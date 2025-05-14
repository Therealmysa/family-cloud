
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Media } from '@/types/media';
import { asUUID } from '@/utils/supabaseHelpers';
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

interface DeleteConfirmDialogProps {
  media: Media | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted?: () => void;
  familyId: string | null | undefined;
}

export function DeleteConfirmDialog({ 
  media, 
  open, 
  onOpenChange, 
  onDeleted,
  familyId 
}: DeleteConfirmDialogProps) {
  const queryClient = useQueryClient();
  
  // Handle delete media
  const deleteMutation = useMutation({
    mutationFn: async (mediaId: string) => {
      const { error } = await supabase
        .from('media')
        .delete()
        .eq('id', asUUID(mediaId));
        
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
        description: "Photo has been deleted",
      });

      // Close dialog and notify parent
      onOpenChange(false);
      if (onDeleted) onDeleted();
    },
    onError: (error) => {
      toast({
        description: "Failed to delete photo",
        variant: "destructive",
      });
    }
  });

  // Handle delete confirmation
  const handleDelete = () => {
    if (!media) return;
    deleteMutation.mutate(media.id);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
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
  );
}
