
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Pencil, Trash } from "lucide-react";
import { Media } from "@/types/media";

interface MediaActionsProps {
  media: Media;
  onLike: (mediaId: string, isLiked: boolean) => void;
  onCommentFocus: () => void;
  onEdit: () => void;
  onDelete: () => void;
  canEdit: boolean;
  canDelete: boolean;
  isLikePending: boolean;
}

export function MediaActions({ 
  media, 
  onLike, 
  onCommentFocus,
  onEdit,
  onDelete,
  canEdit,
  canDelete,
  isLikePending
}: MediaActionsProps) {
  return (
    <div className="flex justify-between">
      <div className="flex gap-4">
        <Button 
          variant="ghost" 
          size="sm" 
          className={`flex items-center gap-1 ${media.is_liked ? 'text-red-500' : ''}`}
          onClick={() => onLike(media.id, !!media.is_liked)}
          disabled={isLikePending}
        >
          <Heart className={`h-4 w-4 ${media.is_liked ? 'fill-current' : ''}`} />
          <span>{media.likes_count || 0} {media.likes_count === 1 ? 'Like' : 'Likes'}</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-1"
          onClick={onCommentFocus}
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
            onClick={onEdit}
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
            onClick={onDelete}
          >
            <Trash className="h-4 w-4" />
            <span className="hidden sm:inline">Delete</span>
          </Button>
        )}
      </div>
    </div>
  );
}
