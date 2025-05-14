
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { Media } from '@/types/media';
import { MediaEditForm } from './MediaEditForm';
import { MediaContent } from './MediaContent';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';
import { FullscreenView } from './FullscreenView';

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
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [fullscreenView, setFullscreenView] = useState(false);

  // Check if user can edit or delete the media
  const canEdit = media?.user_id === user?.id;
  const canDelete = media?.user_id === user?.id || profile?.is_admin === true;

  // Handle edit mode toggle and success
  const handleEditSuccess = () => {
    setIsEditing(false);
    if (onMediaUpdated) onMediaUpdated();
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
            <MediaContent 
              media={media}
              canEdit={canEdit}
              canDelete={canDelete}
              onEditClick={() => setIsEditing(true)}
              onDeleteClick={() => setShowDeleteDialog(true)}
              onFullscreenClick={() => setFullscreenView(true)}
              user={user}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Fullscreen view component */}
      <FullscreenView 
        media={media}
        open={fullscreenView}
        onOpenChange={setFullscreenView}
      />

      {/* Delete confirmation dialog */}
      <DeleteConfirmDialog 
        media={media}
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onDeleted={onMediaDeleted}
        familyId={familyId}
      />
    </>
  );
}
